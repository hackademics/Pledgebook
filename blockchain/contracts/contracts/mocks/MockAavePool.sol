// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockAavePool {
    using SafeERC20 for IERC20;

    // Track deposits per user per asset
    mapping(address => mapping(address => uint256)) public deposits;

    event Supplied(address asset, uint256 amount, address onBehalfOf);
    event Withdrawn(address asset, uint256 amount, address to);

    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external {
        IERC20(asset).safeTransferFrom(msg.sender, address(this), amount);
        deposits[onBehalfOf][asset] += amount;
        emit Supplied(asset, amount, onBehalfOf);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        uint256 deposited = deposits[msg.sender][asset];
        uint256 withdrawAmount = amount == type(uint256).max ? deposited : amount;
        if (withdrawAmount > deposited) {
            withdrawAmount = deposited;
        }
        deposits[msg.sender][asset] -= withdrawAmount;
        if (withdrawAmount > 0) {
            IERC20(asset).safeTransfer(to, withdrawAmount);
        }
        emit Withdrawn(asset, withdrawAmount, to);
        return withdrawAmount;
    }
}
