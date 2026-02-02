// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { PledgeEscrow } from "./PledgeEscrow.sol";

/// @notice Factory for creating campaign escrow contracts.
contract CampaignFactory is AccessControl, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    address public immutable aavePool;
    address public creOracle;
    address public treasury;

    uint256 private _campaignIdCounter;

    mapping(uint256 => address) public campaignEscrows;
    mapping(address => uint256[]) public creatorCampaigns;

    event CampaignCreated(uint256 indexed id, address indexed creator, address escrow);
    event CreOracleUpdated(address indexed newOracle);
    event TreasuryUpdated(address indexed newTreasury);
    event FactoryPaused(address indexed account);
    event FactoryUnpaused(address indexed account);

    uint256 public constant MIN_BOND = 10 * 10 ** 6; // 10 USDC (6 decimals)
    uint256 public constant MIN_CAMPAIGN_DURATION = 1 days; // Minimum campaign duration

    constructor(IERC20 usdc_, address aavePool_, address creOracle_, address treasury_) {
        require(address(usdc_) != address(0), "Invalid USDC");
        require(aavePool_ != address(0), "Invalid Aave pool");
        require(creOracle_ != address(0), "Invalid oracle");
        require(treasury_ != address(0), "Invalid treasury");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        usdc = usdc_;
        aavePool = aavePool_;
        creOracle = creOracle_;
        treasury = treasury_;
    }

    function createCampaign(
        uint256 endDate,
        bytes32 promptHash,
        uint256 fundraisingGoal,
        uint256 bondAmount,
        bool privacyMode
    ) external whenNotPaused {
        require(bondAmount >= MIN_BOND, "Bond too low");
        require(endDate > block.timestamp + MIN_CAMPAIGN_DURATION, "Campaign too short");
        require(promptHash != bytes32(0), "Invalid prompt hash");

        usdc.safeTransferFrom(msg.sender, address(this), bondAmount);

        _campaignIdCounter++;
        uint256 id = _campaignIdCounter;

        PledgeEscrow escrow = new PledgeEscrow(
            usdc,
            aavePool,
            creOracle,
            treasury,
            msg.sender,
            id,
            endDate,
            promptHash,
            fundraisingGoal,
            bondAmount,
            privacyMode
        );

        campaignEscrows[id] = address(escrow);
        creatorCampaigns[msg.sender].push(id);

        usdc.safeTransfer(address(escrow), bondAmount);

        emit CampaignCreated(id, msg.sender, address(escrow));
    }

    function setCreOracle(address newOracle) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newOracle != address(0), "Invalid oracle");
        creOracle = newOracle;
        emit CreOracleUpdated(newOracle);
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
        emit FactoryPaused(msg.sender);
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
        emit FactoryUnpaused(msg.sender);
    }
}
