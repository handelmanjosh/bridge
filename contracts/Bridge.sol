// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bridge {
    address vault;
    address usdc;
    struct Deposit {
        uint usdc;
        uint eth;
    }
    mapping (address => Deposit) deposits;
    event EthDeposit(string solAddress, address ethAddress, uint ethAmount);
    event UsdcDeposit(string solAddress, address ethAddress, uint usdcAmount);
    constructor(address test_vault) { // delete the test_vault
        vault = test_vault; // replace with whatever address
        usdc = address(0x0);
    }
    function deposit(string calldata solAddress) payable external {
        require(msg.value > 0, "ETH deposit amount must be greater than 0");
        (bool success, ) = vault.call{value: msg.value}("");
        require(success, "ETH transfer to vault failed");
        deposits[msg.sender].eth += msg.value;
        emit EthDeposit(solAddress, msg.sender, msg.value);
    }
    function deposit_usdc(string calldata solAddress, uint amount) external {
        require(amount > 0, "USDC deposit amount must be greater than 0");
        IERC20 usdcToken = IERC20(usdc);
        require(usdcToken.transferFrom(msg.sender, vault, amount), "USDC transfer failed");
        deposits[msg.sender].usdc += amount;
        emit UsdcDeposit(solAddress, msg.sender, amount);
    }
}
