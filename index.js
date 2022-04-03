const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const kp = require('./keypair.json');
const userKp = require('./userpair.json');

const {getWalletBallance,transferSOL,airDropSol} = require("./solana");
const {getReturnAmount, totalAmtToBePaid, randomNumber} = require('./helper');

const init = () => {
  console.log(chalk.green(
    figlet.textSync("SOL Stake", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout:"default"
    })
  ))

  console.log(chalk.yellow`The max bidding is 2.5 SOL here`);
};

// Ask for Ratio
// Ask for Sol to be Staked 
// Check the amount to be available in wallet
// Ask public key
// Generate a Random Number
// Ask for the generated Number
// If true return the SOL as per ratio

// generating new wallet pair
const web3 = require("@solana/web3.js");
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const treasuryWallet = web3.Keypair.fromSecretKey(secret) ;
console.log(treasuryWallet.publicKey.toString());

;
const arr2 = Object.values(userKp._keypair.secretKey);
const userScrt = new Uint8Array(arr2);
const userWallet = web3.Keypair.fromSecretKey(userScrt) ;
console.log(userWallet.publicKey.toString());


const askQuestions = () => {
  const questions = [
      {
        name: "SOL",
        type: "number",
        message: "What is the amount of SOL you want to stake?",
      },
      {
        type: "rawlist",
        name:"RATIO",
        message:"What is the ratio of your staking?",
        choices:["1:1.25", "1:1.5", "1:1.75", "1:2"],
        filter: function(val) {
          const stakeFactor = val.split(":")[1];
          return stakeFactor;
        },
      },
      {
        type:"number",
        name:"RANDOM",
        message:"Guess a random number from 1 to 5 (both 1, 5 included)",
        when: async (val)=> {
            if(parseFloat(totalAmtToBePaid(val.SOL))>5){
              console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
              return false;
            }else{
              console.log(`You need to pay ${chalk.green`${totalAmtToBePaid(val.SOL)}`} to move forward`)
              const userBalance = await getWalletBallance(userWallet.publicKey.toString())
              if(userBalance<totalAmtToBePaid(val.SOL)){
                console.log(chalk.red`You don't have enough balance in your wallet`);
                return false;
              }else{
                console.log(chalk.green`You will get ${getReturnAmount(val.SOL, parseFloat(val.RATIO))} if guessing the number correctly`)
                return true;
              }
            }
        }
      }
  ]

  return inquirer.prompt(questions)
}

const  gameExecution = async() => {
  init();
  const generateRandomNumber = randomNumber(1,5);
  const answers = await askQuestions();
  if(answers.RANDOM){
    const paymentSignature = await transferSOL( userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
    console.log(`Signature of payment for playing the game`,chalk.green`${paymentSignature}`);
    if(answers.RANDOM===generateRandomNumber){
      // AirDrop Winning Amount 
      await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
      // guess is successfull
      const prizeSignature = await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL, parseFloat(answers.RATIO)))
      console.log(chalk.green`Your guess is absolutely correct`);
      console.log(`Here is the price signature`, chalk.green`${prizeSignature}`)
    }else{
      console.log(chalk.yellowBright`Better luck next time`)
    }
  }

}

gameExecution()




