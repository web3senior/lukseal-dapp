// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ILSP7DigitalAsset as ILSP7} from "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";
import "./_event.sol";
import "./_error.sol";
import "./_pausable.sol";
import "./_ownable.sol";

/// @title Airdrop Fish
/// @author Aratta Labs
/// @notice Fish token airdrop
/// @dev You will find the deployed contract addresses in the repo
/// @custom:emoji 🪂
/// @custom:security-contact atenyun@gmail.com
contract Airdrop is Ownable(msg.sender), Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public _claimCounter;
    address public LSP7Token;
    uint256 claimAmount = 10_000 ether;

    uint256 startTime;
    uint256 endTime;
    mapping(address => uint256) public permission;

    constructor(address _airdrioToken) {
        LSP7Token = _airdrioToken;
        updateDate(block.timestamp + 3 seconds, block.timestamp + 60 minutes);
    }

    function isAirdropActive()
        public
        view
        whenNotPaused
        returns (
            bool,
            uint256,
            uint256
        )
    {
        // Check start
        if (startTime > block.timestamp) return (false, startTime, endTime);

        // Check end
        if (endTime < block.timestamp) return (false, startTime, endTime);

        return (true, startTime, endTime);
    }

    ///@notice Claim
    function claim(bool _force, bytes memory _data) public whenNotPaused returns (bool) {
        // Check if it's active
        if (endTime < block.timestamp) revert TooLate(endTime);

        // Check if user claimed already
        if (permission[_msgSender()] > 0 && permission[_msgSender()] > startTime) revert UserClaimedAlready(permission[_msgSender()]);

        _claimCounter.increment();
        permission[_msgSender()] = block.timestamp;

        // uint256 authorizedAmount = ILSP7(LSP7Token).authorizedAmountFor(address(this), _msgSender());
        //if (authorizedAmount != claimAmount) revert NotAuthorizedAmount(claimAmount, authorizedAmount);
        ILSP7(LSP7Token).transfer(address(this), _msgSender(), claimAmount, _force, _data);
        //from owner token not address this

        // Log
        emit Claimed(_msgSender(), claimAmount);

        return true;
    }

    ///@notice calcPercentage percentage
    ///@param amount The total amount
    ///@param bps The precentage
    ///@return percentage
    function calcPercentage(uint256 amount, uint256 bps) public pure returns (uint256) {
        require((amount * bps) >= 100);
        return (amount * bps) / 100;
    }

    /// @notice Reset permission list
    function updateDate(uint256 _startTime, uint256 _endTime) public onlyOwner returns (bool) {
        /// @notice Check if start time is gretter that current time
        require(_startTime > block.timestamp, "Start time must be greater than current time");

        /// @notice Check if end time is gretter than start time
        require(_endTime > _startTime, "End time must be greater than start time");

        // Update start and end date with new value
        startTime = _startTime;
        endTime = _endTime;

        // Log the event
        emit airdropDateUpdated(_startTime, _endTime);
        return true;
    }

    /// @notice Update token claim count
    function updateclaimAmount(uint256 _newVal) public onlyOwner returns (bool) {
        claimAmount = _newVal;
        emit claimAmountUpdated(_newVal, _msgSender());
        return true;
    }

    function updateLSP7Token(address _newToken) public onlyOwner returns (bool) {
        LSP7Token = _newToken;
        emit LSP7TokenUpdated(_newToken);
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
    function transferBalance(address payable _to, uint256 _amount) public onlyOwner {
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
