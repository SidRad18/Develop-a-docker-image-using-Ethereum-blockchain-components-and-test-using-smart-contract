// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Lock {
    uint256 public unlockTime;
    address public owner;

    event Withdrawal(address indexed to, uint256 amount);

    constructor(uint256 _unlockTime) payable {
        require(_unlockTime > block.timestamp, "Unlock time must be in the future");
        unlockTime = _unlockTime;
        owner = msg.sender;
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "Lock: not yet unlocked");
        require(msg.sender == owner, "Only owner can withdraw");

        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }
}
