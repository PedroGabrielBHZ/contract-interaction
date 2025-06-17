// interact.js

require("dotenv").config();
const { ethers } = require("ethers");

// ------------------------------------------------------------------
// 1. CONFIGURATION - Replace with your details
// ------------------------------------------------------------------

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

const contractABI = [
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Withdraw",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balances",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

// ------------------------------------------------------------------
// 2. SETUP PROVIDER, SIGNER, AND CONTRACT INSTANCE
// ------------------------------------------------------------------

// Connect to the Ethereum network (Sepolia testnet in this case)
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

// Create a signer from your private key to send transactions
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Create an instance of your contract
const secureBankContract = new ethers.Contract(
  CONTRACT_ADDRESS,
  contractABI,
  signer
);

console.log(`✅ Setup Complete:`);
console.log(`- Connected to: ${SEPOLIA_RPC_URL}`);
console.log(`- Signer Address: ${signer.address}`);
console.log(`- Contract Address: ${CONTRACT_ADDRESS}\n`);

// ------------------------------------------------------------------
// 3. INTERACTION LOGIC
// ------------------------------------------------------------------

const readline = require("readline");
function askUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

(async () => {
  console.log("🔎 Fetching account info from private key...");
  console.log(`- Address: ${signer.address}`);
  const balance = await provider.getBalance(signer.address);
  console.log(`- ETH Balance: ${ethers.formatEther(balance)} ETH`);
  const txCount = await provider.getTransactionCount(signer.address);
  console.log(`- Transaction Count: ${txCount}`);
  const network = await provider.getNetwork();
  console.log(`- Network: ${network.name} (chainId: ${network.chainId})`);
  console.log("");
})();

async function main() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await wait(5000);
  try {
    // --- 1. DEPOSIT FUNDS ---
    const depositInput = await askUser("How much wei do you want to deposit? ");
    let depositAmount;
    try {
      depositAmount = BigInt(depositInput);
      if (depositAmount <= 0n) throw new Error();
    } catch {
      console.error(
        "❌ Invalid deposit amount. Please enter a positive integer."
      );
      process.exit(1);
    }
    await askUser("Press Enter to deposit...");
    console.log(`Depositing ${depositAmount} wei into the bank...`);
    const depositTx = await secureBankContract.deposit({
      value: depositAmount,
    });
    await depositTx.wait();
    console.log(`✅ Deposit successful! Transaction hash: ${depositTx.hash}\n`);

    // --- 2. CHECK USER'S BALANCE IN THE CONTRACT ---
    await askUser("Press Enter to check your balance in the contract...");
    console.log("Checking your balance in the contract...");
    const myBalance = await secureBankContract.balances(signer.address);
    console.log(`✅ Your balance is: ${ethers.formatEther(myBalance)} ETH\n`);

    // --- 3. CHECK TOTAL CONTRACT BALANCE ---
    await askUser("Press Enter to check the total ETH held by the contract...");
    console.log("Checking the total ETH held by the contract...");
    const contractBalance = await secureBankContract.getBalance();
    console.log(
      `✅ Contract's total balance is: ${ethers.formatEther(
        contractBalance
      )} ETH\n`
    );

    // --- 4. WITHDRAW FUNDS ---
    const withdrawInput = await askUser(
      "How much wei do you want to withdraw? "
    );
    let withdrawAmount;
    try {
      withdrawAmount = BigInt(withdrawInput);
      if (withdrawAmount <= 0n) throw new Error();
    } catch {
      console.error(
        "❌ Invalid withdraw amount. Please enter a positive integer."
      );
      process.exit(1);
    }
    await askUser("Press Enter to withdraw...");
    console.log(`Withdrawing ${withdrawAmount} wei from the bank..."`);
    const withdrawTx = await secureBankContract.withdraw(withdrawAmount);
    await withdrawTx.wait();
    console.log(
      `✅ Withdrawal successful! Transaction hash: ${withdrawTx.hash}\n`
    );

    // --- 5. CHECK BALANCES AGAIN ---
    console.log("Checking balances after withdrawal...");
    const myNewBalance = await secureBankContract.balances(signer.address);
    const contractNewBalance = await secureBankContract.getBalance();
    console.log(
      `✅ Your new balance is: ${ethers.formatEther(myNewBalance)} ETH`
    );
    console.log(
      `✅ Contract's new total balance is: ${ethers.formatEther(
        contractNewBalance
      )} ETH`
    );
  } catch (error) {
    console.error("❌ An error occurred:", error.message);
  }
}

// Run the interaction logic
main();
