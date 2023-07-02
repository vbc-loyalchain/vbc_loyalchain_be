// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract HTLC {
    struct LockContract {
        address sender;
        address receiver;
        Token tokenContract;
        uint256 amount;
        string key;
        bytes32 hashlock;
        uint256 timelock;
        bool withdrawn;
        bool refunded;
        bool isInProgress;
    }

    mapping (string => LockContract) private transactions;

    event canceled(address from, uint256 amount);

    event withdrawn(address from, uint256 amount);

    constructor() {}

    function createTx(
        string memory id,
        address receiver,  
        address token, 
        uint256 amount,
        string memory key,
        bytes32 hashlock, 
        uint256 timelock
    ) public returns (bool) {
        require(transactions[id].sender == address(0), "Duplicate transaction by id");
        require(msg.sender != receiver, "TTransaction invalid");
        
        transactions[id] = LockContract({
            sender: msg.sender,
            receiver: receiver,
            tokenContract: Token(token),
            amount: amount,
            key: key,
            hashlock: hashlock,
            timelock: block.timestamp + 60 * 60 * timelock,
            withdrawn: false,
            refunded: false,
            isInProgress: false
        });

        transactions[id].tokenContract.transferToBridge(msg.sender, amount);
        return true;
    }

    function acceptFor(string memory txId, address receiver) external {
        require(msg.sender != receiver, "Can't accept by yourself");
        
        LockContract storage exchangeTx = transactions[txId];
        require(exchangeTx.sender == msg.sender, "Only owner can grant permission");
        require(exchangeTx.receiver == address(0), "Transaction has been accepted");
        
        exchangeTx.receiver = receiver;
        exchangeTx.isInProgress = true;
    }

    function withDraw(string memory txId, string memory _key) external {
        LockContract storage exchangeTx = transactions[txId];
        require(exchangeTx.refunded == false, "Transaction has been canceled");
        require(exchangeTx.withdrawn == false, "Transaction has been withdrawn");
        require(exchangeTx.receiver == msg.sender, "Only receiver can withdraw");
        require(keccak256(abi.encodePacked(_key)) == exchangeTx.hashlock, "Incorrect key");

        exchangeTx.tokenContract.transfer(exchangeTx.receiver, exchangeTx.amount);
        exchangeTx.key = _key;
        exchangeTx.withdrawn = true;

        emit withdrawn(exchangeTx.receiver, exchangeTx.amount);
    }

    function refund(string memory txId) external {
        LockContract storage exchangeTx = transactions[txId];
        require(exchangeTx.withdrawn == false 
                && exchangeTx.refunded == false, "Can't refund");
        require(exchangeTx.isInProgress == false,  "Transaction is in progress");
        require(exchangeTx.timelock <= block.timestamp, "Too early to refund");

        exchangeTx.tokenContract.transfer(exchangeTx.sender,  exchangeTx.amount);
        exchangeTx.refunded = true;
        
        emit canceled(exchangeTx.sender, exchangeTx.amount);
    }

    function getSecretKey(string memory txId) public view returns (string memory) {
        require(transactions[txId].sender != address(0), "This transaction doesn't exists");
        require(transactions[txId].sender == msg.sender, "Only owner can get the secret key");
        return transactions[txId].key;
    }
} 