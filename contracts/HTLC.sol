// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HTLC {
    address public owner;
    address public recipient; 
    IERC20 public token;
    uint public amount;
    string public key; //namnam
    bytes32 public hash = 0x4580019504604a835cca1ec85f197e00867fdb30ee64d1414f7c24b8de80f218;
    uint public startTime;
    uint public lockTime = 1000 seconds;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    modifier onlyRecipient() {
        require(msg.sender == recipient, "Only recipient can call this function");
        _;
    }

    constructor(address _recipient, address _token, uint _amount) {
        owner = msg.sender;
        recipient = _recipient;
        token = IERC20(_token);
        amount = _amount;
    }

    function deposit() external onlyOwner {
        startTime = block.timestamp;
        token.transferFrom(msg.sender, address(this), amount);
    }

    function withDraw(string memory _key) external onlyRecipient {
        require(keccak256(abi.encodePacked(_key)) == hash, "Incorrect key");
        token.transfer(recipient, amount);
        key = _key;
    }

    function refund() external onlyOwner {
        require(block.timestamp >= startTime + lockTime, "Too early");
        token.transfer(owner, amount);
    }
}