// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

event Log(string message);
event claimPerTokenUpdated(uint256, address);
event Claimed(address addr, uint256 nextClaim);
event claimPerTokenUpdated(uint256 newVal);
event claimTokenUpdated(address newToken);
event PhaseUpdated(bytes32 indexed phaseName, string newBackground, uint256 newMaxMint, uint256 newPrice, address newTokenAddress);
event TeamUpdated(string indexed teamKey, address indexed newAddress);
event TasksUpdated(string indexed key, uint8 indexed value);
event WhitelistUpdated(address indexed whitelistedAddress, uint8 newCount);
event PPTUpdated(uint256 newValue);
event LevelUpdated(bytes32 _tokenId, uint256 _point, uint8 _level);


// Define the event to be emitted. This is crucial for off-chain applications
// to track changes and react accordingly.
event AddressesUpdated(
    address indexed fish,
    address indexed memberCard,
    address indexed rich,
    address  fishcan,
    address  arattalabs,
    address  lukseals,
    address  madski,
    address  dachriz,
    address  arfi,
    address  following
);

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