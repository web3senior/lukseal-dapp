// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

// LSP7Burnable interface
interface ILSP7Burnable {
    function burn(
        address from,
        uint256 amount,
        bytes calldata data
    ) external;
}