// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IPool } from "@aave/core-v3/contracts/interfaces/IPool.sol";

/// @notice Per-campaign escrow contract (baseline stub).
contract PledgeEscrow is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public immutable aavePool;
    address public immutable factory;
    address public creOracle;
    address public treasury;

    uint256 public immutable campaignId;
    address public immutable creator;
    uint256 public immutable endDate;
    bytes32 public immutable promptHash;
    uint256 public immutable fundraisingGoal;
    uint256 public immutable creatorBond;
    bool public immutable privacyMode;

    enum Status {
        Draft,
        Active,
        Complete,
        Failed,
        Disputed
    }

    Status public status;
    bool public isDisputed;
    bool public fraudFlagged;

    uint256 public amountPledged;
    uint256 public totalVouched;
    uint256 public totalDisputed;

    // Snapshot of amountPledged at campaign end for flash-loan-resistant dispute threshold
    uint256 public snapshotPledged;
    bool public snapshotTaken;

    // Track total principal deposited to Aave for yield calculation
    uint256 public totalPrincipalDeposited;
    uint256 public yieldEarned;

    bool public finalized;
    bool public outcomeSuccess;
    uint256 public creatorClaimable;
    uint256 public treasuryClaimable;

    mapping(address => uint256) public pledges;
    mapping(address => uint256) public vouchers;
    mapping(address => uint256) public disputers;

    address[] public pledgerList;
    address[] public voucherList;
    address[] public disputerList;

    event Pledged(uint256 indexed id, address indexed pledger, uint256 amount);
    event Vouched(uint256 indexed id, address indexed voucher, uint256 amount);
    event Disputed(uint256 indexed id, address indexed disputer, uint256 amount, string reason);
    event Verified(uint256 indexed id, bool success);
    event FundsReleased(uint256 indexed id, uint256 amount, address to);
    event Refunded(uint256 indexed id, address indexed pledger, uint256 amount);
    event Forfeited(uint256 indexed id, uint256 amount);
    event YieldClaimed(uint256 indexed id, uint256 yieldAmount);
    event CampaignApproved(uint256 indexed id);
    event VoucherReleased(uint256 indexed id, address indexed voucher, uint256 amount);
    event VoucherSlashed(uint256 indexed id, address indexed voucher, uint256 slashAmount);
    event DisputeReleased(uint256 indexed id, address indexed disputer, uint256 amount);
    event DisputeSlashed(uint256 indexed id, address indexed disputer, uint256 slashAmount);
    event TreasuryCollected(uint256 indexed id, uint256 amount);
    event PledgeSnapshotTaken(uint256 indexed id, uint256 snapshotAmount);
    event CreatorClaimed(uint256 indexed id, uint256 amount);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);
    event CreOracleUpdated(address indexed newOracle);
    event TreasuryUpdated(address indexed newTreasury);

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    uint256 public constant MIN_BOND = 10 * 10 ** 6; // 10 USDC (6 decimals)
    uint256 public constant MIN_PLEDGE = 1 * 10 ** 6; // 1 USDC minimum pledge
    uint256 public constant MIN_CAMPAIGN_DURATION = 1 days; // Minimum campaign duration
    uint256 public constant DISPUTE_WINDOW = 7 days;
    uint256 public constant DISPUTE_THRESHOLD_BPS = 1000; // 10% in basis points
    uint256 public constant TREASURY_FEE_BPS = 100; // 1%
    uint256 public constant FINALIZATION_GRACE_PERIOD = 30 days;
    uint256 public constant VOUCHER_SLASH_BPS = 5000; // 50% slashed if campaign fails
    uint256 public constant DISPUTER_SLASH_BPS = 5000; // 50% slashed if dispute was frivolous

    constructor(
        IERC20 usdc_,
        address aavePool_,
        address creOracle_,
        address treasury_,
        address creator_,
        uint256 campaignId_,
        uint256 endDate_,
        bytes32 promptHash_,
        uint256 fundraisingGoal_,
        uint256 bondAmount_,
        bool privacyMode_
    ) {
        require(address(usdc_) != address(0), "Invalid USDC");
        require(aavePool_ != address(0), "Invalid Aave pool");
        require(creOracle_ != address(0), "Invalid oracle");
        require(treasury_ != address(0), "Invalid treasury");
        require(creator_ != address(0), "Invalid creator");
        require(bondAmount_ >= MIN_BOND, "Bond too low");
        require(endDate_ > block.timestamp + MIN_CAMPAIGN_DURATION, "Campaign too short");
        require(promptHash_ != bytes32(0), "Invalid prompt hash");

        usdc = usdc_;
        aavePool = aavePool_;
        factory = msg.sender;
        creOracle = creOracle_;
        treasury = treasury_;

        campaignId = campaignId_;
        creator = creator_;
        endDate = endDate_;
        promptHash = promptHash_;
        fundraisingGoal = fundraisingGoal_;
        creatorBond = bondAmount_;
        privacyMode = privacyMode_;

        status = Status.Draft;

        // Factory (msg.sender) is the admin, NOT the creator
        // This prevents creator from changing oracle, treasury, or doing emergency withdrawals
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(CREATOR_ROLE, creator_);
        _grantRole(ORACLE_ROLE, creOracle_);
    }

    function approveCampaign() external onlyRole(CREATOR_ROLE) whenNotPaused {
        require(status == Status.Draft, "Not draft");
        status = Status.Active;
        _depositToAave(creatorBond);
        emit CampaignApproved(campaignId);
    }

    function pledge(uint256 amount) external nonReentrant whenNotPaused {
        require(status == Status.Active, "Not active");
        require(block.timestamp < endDate, "Past deadline");
        require(amount >= MIN_PLEDGE, "Pledge too small");

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        if (pledges[msg.sender] == 0) {
            pledgerList.push(msg.sender);
        }
        pledges[msg.sender] += amount;
        amountPledged += amount;

        _depositToAave(amount);
        emit Pledged(campaignId, msg.sender, amount);
    }

    function vouch(uint256 amount) external nonReentrant whenNotPaused {
        require(status == Status.Active, "Not active");
        require(block.timestamp < endDate, "Past deadline");
        require(amount > 0, "Amount zero");

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        if (vouchers[msg.sender] == 0) {
            voucherList.push(msg.sender);
        }
        vouchers[msg.sender] += amount;
        totalVouched += amount;

        _depositToAave(amount);
        emit Vouched(campaignId, msg.sender, amount);
    }

    function dispute(uint256 amount, string calldata reason) external nonReentrant whenNotPaused {
        require(status == Status.Active || status == Status.Disputed, "Not disputable");
        require(block.timestamp < endDate + DISPUTE_WINDOW, "Dispute closed");
        require(amount > 0, "Amount zero");

        // Take snapshot at first dispute after campaign ends (flash-loan protection)
        if (block.timestamp >= endDate && !snapshotTaken) {
            snapshotPledged = amountPledged;
            snapshotTaken = true;
            emit PledgeSnapshotTaken(campaignId, snapshotPledged);
        }

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        if (disputers[msg.sender] == 0) {
            disputerList.push(msg.sender);
        }
        disputers[msg.sender] += amount;
        totalDisputed += amount;

        // CEI: Update status BEFORE external call to Aave
        // Use snapshot if available (post-endDate), otherwise use current (pre-endDate)
        uint256 pledgeBase = snapshotTaken ? snapshotPledged : amountPledged;
        if (pledgeBase > 0) {
            uint256 threshold = (pledgeBase * DISPUTE_THRESHOLD_BPS) / 10_000;
            if (totalDisputed > threshold && status != Status.Disputed) {
                isDisputed = true;
                status = Status.Disputed;
            }
        }

        // Deposit dispute stake to Aave for yield (after state updates)
        _depositToAave(amount);

        emit Disputed(campaignId, msg.sender, amount, reason);
    }

    function verifyAndRelease(bool success, bytes32 promptHash_) external nonReentrant whenNotPaused onlyRole(ORACLE_ROLE) {
        require(block.timestamp >= endDate, "Not ended");
        require(promptHash_ == promptHash, "Hash mismatch");
        require(status == Status.Active || status == Status.Disputed, "Invalid status");
        require(!finalized, "Already finalized");

        // CEI: All state updates BEFORE external call
        status = success ? Status.Complete : Status.Failed;
        if (!success) {
            fraudFlagged = true;
        }

        finalized = true;
        outcomeSuccess = success;

        // Calculate claimable amounts before external call
        if (success) {
            // Treasury takes 1% fee only on successful campaigns
            uint256 treasuryFee = (amountPledged * TREASURY_FEE_BPS) / 10_000;
            treasuryClaimable += treasuryFee;
            creatorClaimable = amountPledged + creatorBond - treasuryFee;
        }
        else {
            // Failed campaigns: pledgers get full refunds, creator bond is forfeited to treasury
            treasuryClaimable += creatorBond;
            emit Forfeited(campaignId, creatorBond);
        }

        emit Verified(campaignId, success);

        // External call last (Interactions)
        _withdrawFromAave();
    }

    function claimCreator() external nonReentrant whenNotPaused {
        require(finalized, "Not finalized");
        require(outcomeSuccess, "Campaign failed");
        require(msg.sender == creator, "Not creator");

        uint256 amount = creatorClaimable;
        require(amount > 0, "Nothing to claim");
        creatorClaimable = 0;

        usdc.safeTransfer(creator, amount);
        emit CreatorClaimed(campaignId, amount);
        emit FundsReleased(campaignId, amount, creator);
    }

    function claimTreasury() external nonReentrant whenNotPaused {
        require(finalized, "Not finalized");
        require(msg.sender == treasury, "Not treasury");

        uint256 amount = treasuryClaimable;
        require(amount > 0, "Nothing to claim");
        treasuryClaimable = 0;

        usdc.safeTransfer(treasury, amount);
        emit TreasuryCollected(campaignId, amount);
    }

    function claimPledgeRefund() external nonReentrant whenNotPaused {
        require(finalized, "Not finalized");
        require(!outcomeSuccess, "Campaign succeeded");

        uint256 amount = pledges[msg.sender];
        require(amount > 0, "Nothing to refund");
        pledges[msg.sender] = 0;

        usdc.safeTransfer(msg.sender, amount);
        emit Refunded(campaignId, msg.sender, amount);
    }

    function claimVoucher() external nonReentrant whenNotPaused {
        require(finalized, "Not finalized");

        uint256 amount = vouchers[msg.sender];
        require(amount > 0, "Nothing to claim");
        vouchers[msg.sender] = 0;

        // Economic penalty: Vouchers get slashed if campaign failed (they vouched for fraud)
        if (!outcomeSuccess && fraudFlagged) {
            uint256 slashAmount = (amount * VOUCHER_SLASH_BPS) / 10_000;
            uint256 refundAmount = amount - slashAmount;
            treasuryClaimable += slashAmount;
            emit VoucherSlashed(campaignId, msg.sender, slashAmount);
            usdc.safeTransfer(msg.sender, refundAmount);
            emit VoucherReleased(campaignId, msg.sender, refundAmount);
        } else {
            usdc.safeTransfer(msg.sender, amount);
            emit VoucherReleased(campaignId, msg.sender, amount);
        }
    }

    function claimDisputeStake() external nonReentrant whenNotPaused {
        require(finalized, "Not finalized");

        uint256 amount = disputers[msg.sender];
        require(amount > 0, "Nothing to claim");
        disputers[msg.sender] = 0;

        // Economic penalty: Disputers get slashed if campaign succeeded (frivolous dispute)
        if (outcomeSuccess) {
            uint256 slashAmount = (amount * DISPUTER_SLASH_BPS) / 10_000;
            uint256 refundAmount = amount - slashAmount;
            treasuryClaimable += slashAmount;
            emit DisputeSlashed(campaignId, msg.sender, slashAmount);
            usdc.safeTransfer(msg.sender, refundAmount);
            emit DisputeReleased(campaignId, msg.sender, refundAmount);
        } else {
            // Dispute was valid - full refund plus potential reward from slashed vouchers
            usdc.safeTransfer(msg.sender, amount);
            emit DisputeReleased(campaignId, msg.sender, amount);
        }
    }

    /**
     * @notice Fallback finalization if oracle never calls verifyAndRelease.
     * @dev After endDate + FINALIZATION_GRACE_PERIOD, anyone can trigger refunds.
     * This prevents funds from being locked forever if the oracle is offline.
     */
    function emergencyFinalize() external nonReentrant whenNotPaused {
        require(!finalized, "Already finalized");
        require(status == Status.Active || status == Status.Disputed, "Invalid status");
        require(block.timestamp >= endDate + FINALIZATION_GRACE_PERIOD, "Grace period not expired");

        // CEI: All state updates BEFORE external call
        status = Status.Failed;
        finalized = true;
        outcomeSuccess = false;
        fraudFlagged = false;

        // Creator bond goes to treasury as penalty for unresolved campaign
        treasuryClaimable = creatorBond;

        emit Verified(campaignId, false);
        emit Forfeited(campaignId, creatorBond);

        // External call last (Interactions)
        _withdrawFromAave();
    }

    function _depositToAave(uint256 amount) internal {
        if (amount == 0) return;
        totalPrincipalDeposited += amount;
        usdc.safeIncreaseAllowance(aavePool, amount);
        IPool(aavePool).supply(address(usdc), amount, address(this), 0);
    }

    function _withdrawFromAave() internal {
        uint256 balanceBefore = usdc.balanceOf(address(this));
        IPool(aavePool).withdraw(address(usdc), type(uint256).max, address(this));
        uint256 balanceAfter = usdc.balanceOf(address(this));
        uint256 withdrawn = balanceAfter - balanceBefore;
        
        // Calculate yield earned (withdrawn - principal)
        if (withdrawn > totalPrincipalDeposited) {
            yieldEarned = withdrawn - totalPrincipalDeposited;
            treasuryClaimable += yieldEarned;
            emit YieldClaimed(campaignId, yieldEarned);
        }
    }

    function setCreOracle(address newOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newOracle != address(0), "Invalid oracle");
        _revokeRole(ORACLE_ROLE, creOracle);
        creOracle = newOracle;
        _grantRole(ORACLE_ROLE, newOracle);
        emit CreOracleUpdated(newOracle);
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Emergency withdrawal function - USE WITH EXTREME CAUTION
     * @dev This function allows recovery of accidentally sent tokens.
     * WARNING: Withdrawing USDC will break fund accounting and user claims.
     * Only use for non-USDC tokens or after all claims have been processed.
     * Consider implementing a timelock for production deployments.
     */
    function emergencyWithdraw(address token, address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) whenPaused {
        require(to != address(0), "Invalid recipient");
        // Allow USDC withdrawal only after all claims are settled (for stuck funds recovery)
        // In production, consider adding: require(token != address(usdc), "Cannot withdraw USDC");
        IERC20(token).safeTransfer(to, amount);
        emit EmergencyWithdrawal(token, to, amount);
    }
}
