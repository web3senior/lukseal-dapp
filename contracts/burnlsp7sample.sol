// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// LSP7Burnable interface
interface ILSP7Burnable {
    function burn(address from, uint256 amount, bytes calldata data) external;
}

// Example contract that can burn LSP7 tokens
contract Burner {
    // Burns `amount` tokens from `from` address on the LSP7 token contract at `lsp7Token`
    function burnLSP7Tokens(address lsp7Token, address from, uint256 amount) external {
        // Call the burn function on the LSP7 token contract
        ILSP7Burnable(lsp7Token).burn(from, amount, "");
    }
}
