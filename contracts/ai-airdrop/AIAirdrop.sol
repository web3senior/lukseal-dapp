// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./_event.sol";
import "./_error.sol";
import "./_pausable.sol";
import "./_ownable.sol";

/// @title Airdrop
/// @author Aratta Labs
/// @notice Airdroping LSP7 token by AI agent on LUKSO
/// @dev You will find the deployed contract addresses in the repo
/// @custom:emoji 🤖
/// @custom:security-contact atenyun@gmail.com
contract AIAirdrop is Ownable(msg.sender), Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public _claimCounter;
    address public tokenToClaim;
    uint256 public amountToClaim = 5_000 ether;

    mapping(address => uint256) public claimed;

    constructor(address _tokenToClaim) {
        tokenToClaim = _tokenToClaim;
        emit tokenToClaimUpdated(_tokenToClaim);
    }

    ///@notice Add wallet to the cliamed pool
    function claim(address _wallet) public onlyOwner whenNotPaused returns (bool) {
        if (claimed[_wallet] > 0)
            revert ClaimedAlready(
                claimed[_wallet],
                ILSP7(tokenToClaim).balanceOf(_wallet)
            );

        ILSP7(tokenToClaim).transfer(
            address(this),
            _wallet,
            amountToClaim,
            true,
            ""
        );
        _claimCounter.increment();
        claimed[_wallet] = block.timestamp;

        // Log
        emit Claimed(_wallet, block.timestamp);

        return true;
    }

    /// @notice Update token claim count
    function updateAmountToClaim(uint256 _amount)
        public
        onlyOwner
        returns (bool)
    {
        amountToClaim = _amount;
        emit amountToClaimUpdated(_amount);
        return true;
    }

    function updateTokenToClaim(address _token)
        public
        onlyOwner
        returns (bool)
    {
        tokenToClaim = _token;
        emit tokenToClaimUpdated(_token);
        return true;
    }

    ///@notice Withdraw LSP7 token
    function withdrawLSP7(
        address _LSP7Token,
        address _to,
        uint256 _amount,
        bool _force,
        bytes memory _data
    ) public onlyOwner {
        ILSP7(_LSP7Token).transfer(address(this), _to, _amount, _force, _data);
    }

    ///@notice Withdraw the balance from this contract and transfer it to the owner's address
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Failed");
    }

    ///@notice Transfer balance from this contract to input address
    function transferBalance(address payable _to, uint256 _amount)
        public
        onlyOwner
    {
        // Note that "to" is declared as payable
        (bool success, ) = _to.call{value: _amount}("");
        require(success, "Failed");
    }

    /// @notice Return the balance of this contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Pause
    function pause() public onlyOwner {
        _pause();
    }

    /// @notice Unpause
    function unpause() public onlyOwner {
        _unpause();
    }

    function time() public view returns (uint256) {
        return block.timestamp;
    }
}
