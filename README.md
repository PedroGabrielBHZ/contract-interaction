# SecureBank Contract Interaction

This project provides a Node.js script to interact with the SecureBank smart contract on the Ethereum Sepolia testnet (or compatible networks like Arbitrum Sepolia).

## Features
- Deposit any amount of wei into the contract
- Withdraw any amount of wei from the contract
- Check your contract balance and the contract's total balance
- Prompts for user input before each action

## Prerequisites
- Node.js (v18 or newer recommended)
- An Infura/Alchemy RPC URL for Sepolia or Arbitrum Sepolia
- A funded testnet wallet private key

## Setup
1. Clone this repository.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the project root with the following content:
   ```env
   PRIVATE_KEY=your_private_key_here
   CONTRACT_ADDRESS=your_contract_address_here
   SEPOLIA_RPC_URL=your_sepolia_or_arbitrum_sepolia_rpc_url_here
   ```
   **Never share your private key or commit your `.env` file!**

## Usage
Run the script with Node.js:
```sh
node interact.js
```
You will be prompted to enter how much wei to deposit and withdraw, and to confirm each action.

## Contract
The script is designed for the following Solidity contract:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureBank {
    mapping(address => uint256) public balances;
    bool private locked;
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    function deposit() public payable {
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        require(!locked, "ReentrancyGuard: Locked - function is already executing");
        balances[msg.sender] -= _amount;
        locked = true;
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        locked = false;
        emit Withdraw(msg.sender, _amount);
    }
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
```

## Security
- Do not use mainnet private keys or real funds.
- The `.env` file is gitignored for your safety.

## License
MIT
