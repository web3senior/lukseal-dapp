// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/// @dev Emitted when a new token is successfully minted.
/// @param recipient The address that receives the new token.
/// @param tokenId The unique identifier of the minted token.
/// @param timestamp The block timestamp at which the token was minted.
event Minted(address indexed recipient, bytes32 indexed tokenId, uint256 timestamp);

/// @dev Emitted when ETH is transferred from the contract's balance.
/// @param recipient The address that receives the funds.
/// @param amount The amount of ETH (in wei) that was withdrawn.
/// @param timestamp The block timestamp at which the withdrawal occurred.
event Withdrawal(address indexed recipient, uint256 amount, uint256 timestamp);
