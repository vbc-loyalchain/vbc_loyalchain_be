// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20{
    mapping (address => bool) public admins;

    constructor(string memory name_, string memory symbol_, address[] memory admins_) ERC20(name_, symbol_) {
        for(uint256 i = 0; i < admins_.length; i++) {
            require(admins_[i].code.length == 0, "Only EOA can be admin");
            admins[admins_[i]] = true; 
            _mint(admins_[i], 10 ether);
        }
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin can call this function");
        _;
    }

    modifier onlyContract() {
        require(address(msg.sender).code.length != 0, "Only contract can call this func");
        _;
    }

    function changeAdmin(address account, bool isAllowed) external onlyAdmin {
        require(account.code.length == 0, "Only EOA can be admin");
        admins[account] = isAllowed;
    }

    function mintToken(uint256 amount) external  onlyAdmin {
        _mint(msg.sender, amount);
    }

    function transferToBridge(address from, uint256 amount) external onlyContract {
        _transfer(from, msg.sender, amount);
    }
}