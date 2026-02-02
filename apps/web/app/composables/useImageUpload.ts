import { ref, computed } from 'vue'

/**
 * Image upload configuration
 */
export interface ImageUploadConfig {
  maxFileSize: number // in bytes
  acceptedTypes: string[]
  minDimensions?: ImageDimensions
  maxDimensions?: ImageDimensions
  campaignId?: string
  getHeaders?: () => Record<string, string>
}

/**
 * Image dimension metadata
 */
export interface ImageDimensions {
  width: number
  height: number
}

/**
 * Image upload state
 */
export interface ImageUploadState {
  file: File | null
  preview: string | null
  dimensions: ImageDimensions | null
  isValidating: boolean
  isUploading: boolean
  uploadProgress: number
  error: string | null
  ipfsUrl: string | null
  ipfsCid: string | null
  gatewayUrl: string | null
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Upload result
 */
export interface UploadResult {
  success: boolean
  ipfsUrl?: string
  ipfsCid?: string
  gatewayUrl?: string
  error?: string
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ImageUploadConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  minDimensions: { width: 100, height: 100 },
  maxDimensions: { width: 8192, height: 8192 },
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}

/**
 * Composable for handling image upload to IPFS
 * Provides validation, preview, upload, and error handling
 */
export function useImageUpload(config: Partial<ImageUploadConfig> = {}) {
  const mergedConfig: ImageUploadConfig = { ...DEFAULT_CONFIG, ...config }
  const { address } = useWallet()
  const { token: turnstileToken } = useTurnstileToken()

  // Reactive state
  const state = ref<ImageUploadState>({
    file: null,
    preview: null,
    dimensions: null,
    isValidating: false,
    isUploading: false,
    uploadProgress: 0,
    error: null,
    ipfsUrl: null,
    ipfsCid: null,
    gatewayUrl: null,
  })

  // Computed properties
  const hasFile = computed(() => state.value.file !== null)
  const hasError = computed(() => state.value.error !== null)
  const isReady = computed(() => hasFile.value && !hasError.value && !state.value.isValidating)
  const canUpload = computed(() => isReady.value && !state.value.isUploading)
  const isComplete = computed(() => state.value.ipfsUrl !== null)

  /**
   * Get image dimensions from a file
   */
  function getImageDimensions(file: File): Promise<ImageDimensions> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          resolve({ width: img.width, height: img.height })
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Validate a file before upload
   */
  async function validateFile(file: File): Promise<ValidationResult> {
    // Check file type
    if (!mergedConfig.acceptedTypes.includes(file.type)) {
      const types = mergedConfig.acceptedTypes
        .map((t) => t.replace('image/', '').toUpperCase())
        .join(', ')
      return { valid: false, error: `Invalid file type. Accepted: ${types}` }
    }

    // Check file size
    if (file.size > mergedConfig.maxFileSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${formatBytes(mergedConfig.maxFileSize)}`,
      }
    }

    // Check dimensions
    try {
      const dimensions = await getImageDimensions(file)
      state.value.dimensions = dimensions

      if (mergedConfig.minDimensions) {
        if (
          dimensions.width < mergedConfig.minDimensions.width ||
          dimensions.height < mergedConfig.minDimensions.height
        ) {
          return {
            valid: false,
            error: `Image too small. Minimum: ${mergedConfig.minDimensions.width}x${mergedConfig.minDimensions.height}px`,
          }
        }
      }

      if (mergedConfig.maxDimensions) {
        if (
          dimensions.width > mergedConfig.maxDimensions.width ||
          dimensions.height > mergedConfig.maxDimensions.height
        ) {
          return {
            valid: false,
            error: `Image too large. Maximum: ${mergedConfig.maxDimensions.width}x${mergedConfig.maxDimensions.height}px`,
          }
        }
      }
    } catch {
      return { valid: false, error: 'Failed to read image dimensions' }
    }

    return { valid: true }
  }

  /**
   * Create a preview URL for the file
   */
  function createPreview(file: File): string {
    return URL.createObjectURL(file)
  }

  /**
   * Clean up preview URL to prevent memory leaks
   */
  function revokePreview(): void {
    if (state.value.preview) {
      URL.revokeObjectURL(state.value.preview)
      state.value.preview = null
    }
  }

  /**
   * Select and validate a file
   */
  async function selectFile(file: File): Promise<ValidationResult> {
    // Reset state
    reset()

    state.value.isValidating = true
    state.value.file = file

    try {
      // Create preview first for better UX
      state.value.preview = createPreview(file)

      // Validate file
      const result = await validateFile(file)

      if (!result.valid) {
        state.value.error = result.error || 'Validation failed'
        return result
      }

      return { valid: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed'
      state.value.error = message
      return { valid: false, error: message }
    } finally {
      state.value.isValidating = false
    }
  }

  /**
   * Handle file input or drop
   */
  async function handleFileInput(event: Event | DragEvent): Promise<ValidationResult> {
    let file: File | null = null

    if (event instanceof DragEvent && event.dataTransfer) {
      // Drag and drop
      const files = event.dataTransfer.files
      if (files.length > 0) {
        file = files[0] ?? null
      }
    } else if (event.target instanceof HTMLInputElement && event.target.files) {
      // File input
      file = event.target.files[0] ?? null
    }

    if (!file) {
      return { valid: false, error: 'No file selected' }
    }

    return selectFile(file)
  }

  /**
   * Upload file to IPFS via server API
   */
  async function upload(): Promise<UploadResult> {
    if (!state.value.file) {
      return { success: false, error: 'No file selected' }
    }

    const resolvedHeaders = mergedConfig.getHeaders?.() || {
      'X-Wallet-Address': address.value || '',
      'x-turnstile-token': turnstileToken.value || '',
    }

    if (!resolvedHeaders['X-Wallet-Address']) {
      return { success: false, error: 'Connect your wallet to upload evidence.' }
    }

    if (!resolvedHeaders['x-turnstile-token']) {
      return { success: false, error: 'Complete the Turnstile check before uploading.' }
    }

    if (state.value.isUploading) {
      return { success: false, error: 'Upload already in progress' }
    }

    state.value.isUploading = true
    state.value.uploadProgress = 0
    state.value.error = null

    try {
      const formData = new FormData()
      formData.append('file', state.value.file)
      if (mergedConfig.campaignId) {
        formData.append('campaignId', mergedConfig.campaignId)
      }

      // Use XMLHttpRequest for progress tracking
      const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            state.value.uploadProgress = Math.round((e.loaded / e.total) * 100)
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)
              if (response.success) {
                resolve({
                  success: true,
                  ipfsUrl: response.data.ipfsUrl,
                  ipfsCid: response.data.cid,
                  gatewayUrl: response.data.gatewayUrl,
                })
              } else {
                resolve({
                  success: false,
                  error: response.error?.message || 'Upload failed',
                })
              }
            } catch {
              resolve({ success: false, error: 'Invalid server response' })
            }
          } else {
            resolve({ success: false, error: `Upload failed: ${xhr.status}` })
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'))
        })

        xhr.open('POST', '/api/upload/ipfs')
        Object.entries(resolvedHeaders).forEach(([key, value]) => {
          if (value) {
            xhr.setRequestHeader(key, value)
          }
        })
        xhr.send(formData)
      })

      if (result.success) {
        state.value.ipfsUrl = result.ipfsUrl || null
        state.value.ipfsCid = result.ipfsCid || null
        state.value.gatewayUrl = result.gatewayUrl || null
        state.value.uploadProgress = 100
      } else {
        state.value.error = result.error || 'Upload failed'
      }

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      state.value.error = message
      return { success: false, error: message }
    } finally {
      state.value.isUploading = false
    }
  }

  /**
   * Reset the upload state
   */
  function reset(): void {
    revokePreview()
    state.value = {
      file: null,
      preview: null,
      dimensions: null,
      isValidating: false,
      isUploading: false,
      uploadProgress: 0,
      error: null,
      ipfsUrl: null,
      ipfsCid: null,
      gatewayUrl: null,
    }
  }

  /**
   * Clear error state
   */
  function clearError(): void {
    state.value.error = null
  }

  return {
    // State
    state,

    // Computed
    hasFile,
    hasError,
    isReady,
    canUpload,
    isComplete,

    // Config
    config: mergedConfig,

    // Methods
    selectFile,
    handleFileInput,
    upload,
    reset,
    clearError,
    formatBytes,
  }
}
