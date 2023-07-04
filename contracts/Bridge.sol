// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

contract Bridge {
    struct LockContract {
        address from;
        address to;
        Token token_from;
        Token token_to;
        uint256 amount_from;
        uint256 amount_to;
        uint256 timelock;
        bool completed;
        bool refunded;
    }

    mapping(string => LockContract) transactions;

    event canceled(address from, uint256 amount);

    event accepted(address to);

    event swapSuccessfully(address from, address to);

    constructor() {}

    function createTx(
        string memory id, 
        address tokenFrom, 
        address tokenTo, 
        uint256 amountFrom, 
        uint256 amountTo,
        uint256 timelock //hours
    ) public returns (bool) {
        require(transactions[id].from == address(0), "Duplicate transaction by id");
        require(tokenFrom != tokenTo, "Only swap between two different token");
        transactions[id] = LockContract({
            from: msg.sender,
            to: address(0),
            token_from: Token(tokenFrom),
            token_to: Token(tokenTo),
            amount_from: amountFrom,
            amount_to: amountTo,
            timelock: block.timestamp + 60 * 60 * timelock,
            completed: false,
            refunded: false
        });

        transactions[id].token_from.transferToBridge(transactions[id].from, transactions[id].amount_from);
        return true;
    }

    function accept(string memory txId) external {
        LockContract storage exchangeTx = transactions[txId];
        require(exchangeTx.from != address(0), "This transaction doesn't exists");
        require(exchangeTx.completed != true && exchangeTx.refunded != true, "This transaction has been done");
        require(exchangeTx.to == address(0), "This transaction has been accepted by another user");
        require(exchangeTx.from != msg.sender, "Can't accept by your self! =))");
        
        exchangeTx.to = msg.sender;
        exchangeTx.token_to.transferToBridge(exchangeTx.to, exchangeTx.amount_to);
        emit accepted(msg.sender);

        swap(txId);
    }

    function refund(string memory txId) external {
        LockContract storage exchangeTx = transactions[txId];
        require(exchangeTx.completed == false 
                && exchangeTx.refunded == false, "Can't refund");
        require(exchangeTx.to == address(0), "Transaction is in progress");
        require(exchangeTx.timelock <= block.timestamp, "Too early to refund");

        exchangeTx.token_from.transfer(exchangeTx.from,  exchangeTx.amount_from);
        exchangeTx.refunded = true;
        emit canceled(exchangeTx.from, exchangeTx.amount_from);
    }

    function swap(string memory txId) internal {
        LockContract storage exchangeTx = transactions[txId];
        
        exchangeTx.token_from.transfer(exchangeTx.to, exchangeTx.amount_from);
        exchangeTx.token_to.transfer(exchangeTx.from, exchangeTx.amount_to);

        exchangeTx.completed = true;
        emit swapSuccessfully( exchangeTx.from,  exchangeTx.to);
    }

    function txInfo(string memory id) public view returns (LockContract memory) {
        return  transactions[id];
    }
}