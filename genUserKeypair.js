const fs = require('fs');
const web3 = require("@solana/web3.js");

// generating new wallet pair

const userWallet = web3.Keypair.generate() ;
console.log(userWallet);
fs.writeFileSync('./userpair.json', JSON.stringify(userWallet))