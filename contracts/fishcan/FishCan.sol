// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {LSP8IdentifiableDigitalAsset} from "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
import {_LSP4_TOKEN_TYPE_TOKEN, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_METADATA_KEY} from "@lukso/lsp4-contracts/contracts/LSP4Constants.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import {TOTAL_SUPPLY, RAW_METADATA} from "./Constant.sol";
import "./Counters.sol";
import "./Event.sol";
import "./Error.sol";

/// @title FISHCAN Contract
/// @author Aratta Labs
/// @notice This contract is an LSP8-compliant identifiable digital asset.
/// It allows users to mint unique tokens for free. The contract includes features for managing
/// token supply, handling payments, and owner-only withdrawal functionalities.
/// @dev This contract uses a custom `tokenIdCounter` for sequential minting and a `mintPool` to track mints per wallet.
/// It also implements `Pausable` and `ReentrancyGuard` for security.
/// @custom:emoji 🥫
/// @custom:security-contact atenyun@gmail.com
contract FishCan is LSP8IdentifiableDigitalAsset("FISHCAN", "CAN", msg.sender, _LSP4_TOKEN_TYPE_COLLECTION, _LSP4_TOKEN_TYPE_TOKEN), Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public tokenIdCounter;

    /**
     * @dev A struct to hold data about a wallet's minting activity.
     * @param tokenId The ID of the last minted token.
     * @param counter The number of tokens minted by the wallet.
     * @param dt The timestamp of the last mint.
     */
    struct MintData {
        bytes32 tokenId;
        uint8 counter;
        uint256 dt;
    }

    mapping(address => MintData) public mintPool;

    constructor() {}

    /**
     * @notice Generates the LSP4 verifiable metadata URI for a given raw JSON string.
     * @dev This is a `pure` function that constructs the full LSP4 verifiable URI by combining the LSP4 key prefix,
     * the keccak256 hash of the metadata, and the base64-encoded data URI.
     * It does not read from or write to the contract's state.
     * @return The complete LSP4 verifiable metadata URI as a `bytes` array.
     */
    function _getLSP4MetadataURI() internal pure returns (bytes memory) {
        bytes memory verifiableURI = bytes.concat(
            hex"00006f357c6a0020", // LSP4_METADATA_KEY_PREFIX
            keccak256(bytes(RAW_METADATA)), // Hash of the raw JSON
            abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(RAW_METADATA))) // Base64 encoded data URI
        );
        return verifiableURI;
    }

    /**
     * @notice Mints a new Rich LukSeal token.
     * @dev This function performs several checks, including maximum supply and a per-wallet mint limit.
     * It then transfers the required `$FISH` tokens from the sender to the contract, mints a new
     * LSP8 token, and sets its metadata. Finally, it records the minting activity and emits an event.
     * @return The unique token ID of the newly minted token.
     */
    function mint() public whenNotPaused nonReentrant returns (bytes32) {
        // Ensure the total supply limit has not been reached.
        require(tokenIdCounter.current() < TOTAL_SUPPLY, Errors.MaxSupplyExceeded());

        // Ensure the wallet has not exceeded the per-wallet mint limit.
        require(mintPool[_msgSender()].counter < 1, Errors.MaxMintPerWalletExceeded());

        // Mint
        tokenIdCounter.increment();
        bytes32 tokenId = bytes32(tokenIdCounter.current());
        _mint({to: _msgSender(), tokenId: tokenId, force: true, data: ""});

        // Set token's metadata
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, _getLSP4MetadataURI());

        // Add sender & tokenId to the mint pool
        mintPool[_msgSender()] = MintData(tokenId, ++mintPool[_msgSender()].counter, block.timestamp);

        emit Minted(_msgSender(), tokenId, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Updates the metadata for a specific token ID.
     * @dev This function is restricted to the contract owner. It allows the owner to change the
     * on-chain metadata for an existing token by calling the `_setDataForTokenId` internal function.
     * @param tokenId The unique identifier of the token to update.
     */
    function updateTokenMetadata(bytes32 tokenId) public onlyOwner {
        // Set token's metadata
        _setDataForTokenId(tokenId, _LSP4_METADATA_KEY, _getLSP4MetadataURI());
    }

    /**
     * @notice Transfers the entire contract's ETH balance to the contract owner.
     * @dev This function can only be called by the contract owner and is non-reentrant.
     */
    function withdrawAllFunds() public onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        require(amount > 0, "No balance to withdraw");
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Failed to withdraw balance.");

        // Emit the Withdrawal event to signal a successful withdrawal.
        emit Withdrawal(owner(), amount, block.timestamp);
    }

    /**
     * @notice Transfers a specified amount of ETH from the contract to a recipient.
     * @dev This function can only be called by the contract owner and is non-reentrant.
     * @param _recipient The address to receive the ETH.
     * @param _amount The amount of ETH in wei to transfer.
     */
    function transferFunds(address payable _recipient, uint256 _amount) public onlyOwner nonReentrant {
        // Ensure the amount to transfer is greater than zero.
        require(_amount > 0, "Amount must be greater than 0");
        // Ensure the contract has sufficient funds.
        require(_amount <= address(this).balance, "Insufficient contract balance.");
        (bool success, ) = _recipient.call{value: _amount}("");
        require(success, "Failed to transfer balance.");

        // Emit the Withdrawal event to signal a successful transfer.
        emit Withdrawal(_recipient, _amount, block.timestamp);
    }

    /**
     * @notice Pauses minting operations.
     * @dev Only the contract owner can call this function. While paused, the `mint` function will revert.
     */
    function pauseMinting() public onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses minting operations.
     * @dev Only the contract owner can call this function. This allows the `mint` function to be called again.
     */
    function unpauseMinting() public onlyOwner {
        _unpause();
    }

    /**
     * @notice Returns the current blockchain timestamp.
     * @dev This is a view function and doesn't modify the state.
     * @return The current timestamp as a `uint256`.
     */
    function getCurrentTimestamp() public view returns (uint256) {
        return block.timestamp;
    }
}
