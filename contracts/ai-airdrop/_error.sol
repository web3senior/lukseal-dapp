// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error Unauthorized();
error ClaimedAlready(uint256 lastTimeClaimed, uint256 userBalance);