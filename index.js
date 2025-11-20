const Web3 = require("web3");
const mysql = require("mysql2");

// BSC WebSocket Node (Free & Stable)
const web3 = new Web3("wss://bsc.getblock.io/mainnet/?api_key=4c362cc71fba432180c7bb97ef0b5874");
//https://go.getblock.us/4c362cc71fba432180c7bb97ef0b5874

// Replace with your MySQL credentials
const db = mysql.createConnection({
  host: "YOUR_HOST",
  user: "YOUR_USER",
  password: "YOUR_PASS",
  database: "YOUR_DB"
});

// USDT contract
const TETHER_BEP20 = "0x55d398326f99059fF775485246999027B3197955";

// USDT ABI (minimal)
const abi = [
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "from", "type": "address"},
      {"indexed": true, "name": "to", "type": "address"},
      {"indexed": false, "name": "value", "type": "uint256"}
    ],
    "name": "Transfer",
    "type": "event"
  }
];

const contract = new web3.eth.Contract(abi, TETHER_BEP20);

console.log("USDT Listener started...");

contract.events.Transfer({})
.on("data", (event) => {
    let from = event.returnValues.from;
    let to = event.returnValues.to;
    let amount = Number(event.returnValues.value) / 1e18;

    console.log(`USDT Received: ${amount} From: ${from} To: ${to}`);

    let sql = "INSERT INTO transactions (sender, receiver, amount) VALUES (?, ?, ?)";
    db.query(sql, [from, to, amount], () => {
        console.log("Saved to DB");
    });
})
.on("error", console.error);
