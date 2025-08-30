// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title Custom Errors for RichLukSelas
/// @author Aratta Labs
/// @notice Defines custom errors to provide more specific and readable revert messages for the RichLukSelas contract.
library Errors {
    /// @dev Emitted when the maximum total supply of tokens has been reached.
    error MaxSupplyExceeded();

    /// @dev Emitted when a wallet has reached its maximum number of allowed mints.
    error MaxMintPerWalletExceeded();
}