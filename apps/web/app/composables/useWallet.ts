// =============================================================================
// USE WALLET COMPOSABLE
// Purpose: Manage Web3 wallet connections using viem
// Supports: MetaMask, Coinbase Wallet, WalletConnect, Rabby
// Network: Polygon Amoy Testnet (dev) / Polygon Mainnet (prod)
// =============================================================================

import { computed, onMounted, onUnmounted } from 'vue'
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  getAddress,
  type PublicClient,
  type WalletClient,
  type Address,
  type Chain,
} from 'viem'
import { polygonAmoy, defaultChain } from '~/config/chains'
import { ERC20_ABI, getUsdcAddress } from '~/config/contracts'

// =============================================================================
// TYPES
// =============================================================================

export interface WalletState {
  isConnected: boolean
  isConnecting: boolean
  address: Address | null
  provider: string | null
  chainId: number | null
  network: string
  networkIcon: string
  balance: string
  error: string | null
}

export type WalletProvider = 'metamask' | 'coinbase' | 'walletconnect' | 'rabby'

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  isRabby?: boolean
}

// =============================================================================
// CONSTANTS
// =============================================================================

const PROVIDER_ICONS: Record<string, string> = {
  metamask: '/images/wallets/metamask.svg',
  coinbase: '/images/wallets/coinbase.svg',
  walletconnect: '/images/wallets/walletconnect.svg',
  rabby: '/images/wallets/rabby.svg',
}

const NETWORK_ICONS: Record<number, string> = {
  80002: '/images/networks/polygon.svg', // Polygon Amoy
  137: '/images/networks/polygon.svg', // Polygon Mainnet
}

const NETWORK_NAMES: Record<number, string> = {
  80002: 'Polygon Amoy',
  137: 'Polygon',
}

// USDC has 6 decimals
const USDC_DECIMALS = 6

// =============================================================================
// CLIENT-SIDE LOGGING HELPERS
// =============================================================================

const LOG_PREFIX = '[useWallet]'

function logWarn(message: string, ...args: unknown[]): void {
  if (import.meta.dev) {
    console.warn(`${LOG_PREFIX} ${message}`, ...args)
  }
}

function logError(message: string, ...args: unknown[]): void {
  if (import.meta.dev) {
    console.error(`${LOG_PREFIX} ${message}`, ...args)
  }
}

// =============================================================================
// SSR-SAFE GLOBAL STATE
// Uses Nuxt's useState() for reactive state (SSR-safe, per-request isolated)
// Non-reactive client singletons are guarded behind import.meta.client
// =============================================================================

const DEFAULT_WALLET_STATE: WalletState = {
  isConnected: false,
  isConnecting: false,
  address: null,
  provider: null,
  chainId: null,
  network: 'Polygon Amoy',
  networkIcon: '/images/networks/polygon.svg',
  balance: '0.00',
  error: null,
}

// SSR-safe reactive state via Nuxt useState (isolated per request on server)
function getWalletState() {
  return useState<WalletState>('wallet-state', () => ({ ...DEFAULT_WALLET_STATE }))
}

function getIsInitializing() {
  return useState<boolean>('wallet-initializing', () => true)
}

// Client-only mutable singletons — never accessed during SSR
let componentInstanceCount = 0
let listenersAttached = false

let publicClient: PublicClient | null = null
let walletClient: WalletClient | null = null
let ethereumProvider: EthereumProvider | null = null

// Proxy accessors for module-level helper functions.
// These delegate to useState() refs, ensuring SSR-safe per-request isolation.
const walletState = {
  get value() {
    return getWalletState().value
  },
  set value(v: WalletState) {
    getWalletState().value = v
  },
}
const isInitializing = {
  get value() {
    return getIsInitializing().value
  },
  set value(v: boolean) {
    getIsInitializing().value = v
  },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the Ethereum provider based on wallet type
 */
function getEthereumProvider(providerId: WalletProvider): EthereumProvider | null {
  if (typeof window === 'undefined') return null

  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum

  if (!ethereum) {
    logWarn('No Ethereum provider found')
    return null
  }

  // For MetaMask, Coinbase, and Rabby, they inject into window.ethereum
  // Provider detection based on flags
  switch (providerId) {
    case 'metamask':
      if (ethereum.isMetaMask) return ethereum
      break
    case 'coinbase':
      if (ethereum.isCoinbaseWallet) return ethereum
      break
    case 'rabby':
      if (ethereum.isRabby) return ethereum
      break
    case 'walletconnect':
      // WalletConnect requires additional setup - for now use default provider
      return ethereum
  }

  // Fallback to default provider if specific one not found
  return ethereum
}

/**
 * Format balance with proper decimals and thousands separator
 */
function formatBalance(balance: bigint, decimals: number): string {
  const formatted = formatUnits(balance, decimals)
  const num = Number.parseFloat(formatted)

  // Format with commas and 2 decimal places
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Get chain configuration by ID
 */
function getChainById(chainId: number): Chain {
  // For now, we only support Polygon Amoy
  if (chainId === 80002) return polygonAmoy
  return defaultChain
}

/**
 * Remove provider event listeners
 */
function removeProviderListeners(): void {
  if (!ethereumProvider || !listenersAttached) return
  ethereumProvider.removeListener('accountsChanged', handleAccountsChanged)
  ethereumProvider.removeListener('chainChanged', handleChainChanged)
  ethereumProvider.removeListener('disconnect', handleDisconnect)
  listenersAttached = false
}

/**
 * Attach provider event listeners
 */
function attachProviderListeners(): void {
  if (!ethereumProvider || listenersAttached) return
  ethereumProvider.on('accountsChanged', handleAccountsChanged)
  ethereumProvider.on('chainChanged', handleChainChanged)
  ethereumProvider.on('disconnect', handleDisconnect)
  listenersAttached = true
}

/**
 * Apply connection state without prompting the wallet
 */
async function applyConnection(
  providerId: WalletProvider,
  accounts: string[],
  chainId: number,
  options: { shouldSwitchNetwork: boolean },
): Promise<void> {
  if (!ethereumProvider) return
  const primaryAccount = accounts[0]
  if (!primaryAccount) {
    resetWalletState()
    return
  }

  publicClient = createPublicClient({
    chain: getChainById(chainId),
    transport: custom(ethereumProvider),
  })

  walletClient = createWalletClient({
    chain: getChainById(chainId),
    transport: custom(ethereumProvider),
  })

  walletState.value = {
    isConnected: true,
    isConnecting: false,
    address: getAddress(primaryAccount) as Address,
    provider: providerId,
    chainId,
    network: NETWORK_NAMES[chainId] || `Chain ${chainId}`,
    networkIcon: NETWORK_ICONS[chainId] || '/images/networks/polygon.svg',
    balance: '0.00',
    error: null,
  }

  attachProviderListeners()

  if (options.shouldSwitchNetwork && chainId !== defaultChain.id) {
    walletState.value.error = `Please switch to ${defaultChain.name}`
    await switchToCorrectNetwork()
  } else if (chainId !== defaultChain.id) {
    walletState.value.error = `Please switch to ${defaultChain.name}`
  }

  await fetchUsdcBalance()
}

// =============================================================================
// EVENT HANDLERS
// =============================================================================

function handleAccountsChanged(accounts: unknown): void {
  const accountList = accounts as string[]
  const primaryAccount = accountList[0]
  if (accountList.length === 0) {
    // User disconnected
    resetWalletState()
  } else if (primaryAccount) {
    // Account changed
    walletState.value.address = getAddress(primaryAccount) as Address
    // Refresh balance
    fetchUsdcBalance()
  }
}

function handleChainChanged(chainId: unknown): void {
  const newChainId =
    typeof chainId === 'string' ? Number.parseInt(chainId, 16) : (chainId as number)
  walletState.value.chainId = newChainId
  walletState.value.network = NETWORK_NAMES[newChainId] || `Chain ${newChainId}`
  walletState.value.networkIcon = NETWORK_ICONS[newChainId] || '/images/networks/polygon.svg'

  // Recreate public client with new chain
  if (ethereumProvider) {
    publicClient = createPublicClient({
      chain: getChainById(newChainId),
      transport: custom(ethereumProvider),
    })
  }

  // Check if we're on the correct network
  if (newChainId !== defaultChain.id) {
    walletState.value.error = `Please switch to ${defaultChain.name}`
  } else {
    walletState.value.error = null
    fetchUsdcBalance()
  }
}

function handleDisconnect(): void {
  resetWalletState()
}

function resetWalletState(): void {
  removeProviderListeners()
  walletState.value = {
    isConnected: false,
    isConnecting: false,
    address: null,
    provider: null,
    chainId: null,
    network: 'Polygon Amoy',
    networkIcon: '/images/networks/polygon.svg',
    balance: '0.00',
    error: null,
  }
  publicClient = null
  walletClient = null
  ethereumProvider = null
}

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Fetch USDC balance for connected wallet
 */
async function fetchUsdcBalance(): Promise<void> {
  if (!publicClient || !walletState.value.address || !walletState.value.chainId) {
    return
  }

  try {
    const usdcAddress = getUsdcAddress(walletState.value.chainId)

    const balance = (await publicClient.readContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletState.value.address],
    })) as bigint

    walletState.value.balance = formatBalance(balance, USDC_DECIMALS)
  } catch (error) {
    logError('Failed to fetch USDC balance:', error)
    walletState.value.balance = '0.00'
  }
}

/**
 * Switch to the correct network (Polygon Amoy)
 */
async function switchToCorrectNetwork(): Promise<boolean> {
  if (!ethereumProvider) return false

  try {
    // Try to switch to the target chain
    await ethereumProvider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${defaultChain.id.toString(16)}` }],
    })
    return true
  } catch (switchError) {
    // Chain not added to wallet, try to add it
    const error = switchError as { code?: number }
    if (error.code === 4902) {
      try {
        await ethereumProvider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${defaultChain.id.toString(16)}`,
              chainName: defaultChain.name,
              nativeCurrency: defaultChain.nativeCurrency,
              rpcUrls: [defaultChain.rpcUrls.default.http[0]],
              blockExplorerUrls: defaultChain.blockExplorers
                ? [defaultChain.blockExplorers.default.url]
                : undefined,
            },
          ],
        })
        return true
      } catch (addError) {
        logError('Failed to add chain:', addError)
        return false
      }
    }
    logError('Failed to switch chain:', switchError)
    return false
  }
}

/**
 * Connect to a wallet provider
 */
async function connect(providerId: WalletProvider): Promise<boolean> {
  if (walletState.value.isConnecting) return false

  walletState.value.isConnecting = true
  walletState.value.error = null

  try {
    // Get the provider
    ethereumProvider = getEthereumProvider(providerId)

    if (!ethereumProvider) {
      walletState.value.error = `${providerId} wallet not found. Please install it.`
      walletState.value.isConnecting = false
      return false
    }

    // Request accounts
    const accounts = (await ethereumProvider.request({
      method: 'eth_requestAccounts',
    })) as string[]

    if (!accounts || accounts.length === 0) {
      walletState.value.error = 'No accounts found'
      walletState.value.isConnecting = false
      return false
    }

    // Get current chain ID
    const chainIdHex = (await ethereumProvider.request({
      method: 'eth_chainId',
    })) as string
    const chainId = Number.parseInt(chainIdHex, 16)

    removeProviderListeners()
    await applyConnection(providerId, accounts, chainId, { shouldSwitchNetwork: true })

    return true
  } catch (error) {
    logError('Failed to connect wallet:', error)
    const err = error as { code?: number; message?: string }

    if (err.code === 4001) {
      walletState.value.error = 'Connection rejected by user'
    } else {
      walletState.value.error = err.message || 'Failed to connect wallet'
    }

    walletState.value.isConnecting = false
    return false
  }
}

/**
 * Disconnect wallet
 */
function disconnect(): void {
  removeProviderListeners()

  resetWalletState()
}

/**
 * Copy address to clipboard
 */
async function copyAddress(): Promise<boolean> {
  if (!walletState.value.address) return false

  try {
    await navigator.clipboard.writeText(walletState.value.address)
    return true
  } catch (error) {
    logError('Failed to copy address:', error)
    return false
  }
}

/**
 * Refresh balance
 */
async function refreshBalance(): Promise<void> {
  await fetchUsdcBalance()
}

/**
 * Check if provider is available
 */
function isProviderAvailable(providerId: WalletProvider): boolean {
  if (typeof window === 'undefined') return false

  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  if (!ethereum) return false

  switch (providerId) {
    case 'metamask':
      return !!ethereum.isMetaMask
    case 'coinbase':
      return !!ethereum.isCoinbaseWallet
    case 'rabby':
      return !!ethereum.isRabby
    case 'walletconnect':
      return true // WalletConnect is always "available" as it's QR-based
    default:
      return false
  }
}

// =============================================================================
// COMPOSABLE EXPORT
// =============================================================================

export function useWallet() {
  // Resolve lazy state refs
  const state = getWalletState()
  const initializing = getIsInitializing()

  // Computed properties
  const isReady = computed(() => !initializing.value)
  const isConnected = computed(() => state.value.isConnected)
  const isConnecting = computed(() => state.value.isConnecting)
  const address = computed(() => state.value.address)
  const provider = computed(() => state.value.provider)
  const network = computed(() => state.value.network)
  const networkIcon = computed(() => state.value.networkIcon)
  const balance = computed(() => state.value.balance)
  const chainId = computed(() => state.value.chainId)
  const error = computed(() => state.value.error)

  const providerIcon = computed(() => {
    if (!state.value.provider) return null
    return PROVIDER_ICONS[state.value.provider] || null
  })

  const trimmedAddress = computed(() => {
    if (!state.value.address) return ''
    const addr = state.value.address
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  })

  const isCorrectNetwork = computed(() => {
    return state.value.chainId === defaultChain.id
  })

  // Track component instances for proper cleanup
  onMounted(async () => {
    componentInstanceCount++

    // Only initialize on first mount
    if (componentInstanceCount > 1) {
      return
    }

    if (typeof window === 'undefined') {
      isInitializing.value = false
      return
    }

    const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum
    if (!ethereum) {
      isInitializing.value = false
      return
    }

    try {
      // Check if already connected
      const accounts = (await ethereum.request({
        method: 'eth_accounts',
      })) as string[]

      if (accounts && accounts.length > 0) {
        // Determine which provider is connected
        let providerId: WalletProvider = 'metamask'
        if (ethereum.isCoinbaseWallet) providerId = 'coinbase'
        if (ethereum.isRabby) providerId = 'rabby'

        // Silently reconnect without prompting the wallet
        ethereumProvider = getEthereumProvider(providerId) || ethereum
        const chainIdHex = (await ethereum.request({
          method: 'eth_chainId',
        })) as string
        const chainId = Number.parseInt(chainIdHex, 16)
        await applyConnection(providerId, accounts, chainId, { shouldSwitchNetwork: false })
      }
    } catch (error) {
      logError('Failed to check existing connection:', error)
    } finally {
      // Mark initialization as complete
      isInitializing.value = false
    }
  })

  // Clean up on last component unmount
  onUnmounted(() => {
    componentInstanceCount--

    // Only clean up listeners when no components are using the wallet
    if (componentInstanceCount === 0 && listenersAttached) {
      removeProviderListeners()
    }
  })

  return {
    // State (readonly)
    isReady,
    isConnected,
    isConnecting,
    address,
    provider,
    providerIcon,
    network,
    networkIcon,
    balance,
    chainId,
    error,
    trimmedAddress,
    isCorrectNetwork,

    // Actions
    connect,
    disconnect,
    copyAddress,
    refreshBalance,
    switchToCorrectNetwork,
    isProviderAvailable,

    // Clients (for advanced usage)
    getPublicClient: () => publicClient,
    getWalletClient: () => walletClient,
  }
}
