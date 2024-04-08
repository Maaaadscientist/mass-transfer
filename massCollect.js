const Web3 = require('web3').default;
const fs = require('fs');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
// Setup Web3 connection
//const web3 = new Web3('https://endpoints.omniatech.io/v1/eth/sepolia/public');
const web3 = new Web3('https://rpc.merlinchain.io');

// Load the ERC20 token contract ABI and address
const tokenABI = JSON.parse(fs.readFileSync('miniABI.json', 'utf8'));
//const tokenAddress = '0x8db4bE401efF96BeAc922613474563E78e7CcE42'; // DABING

//const tokenAddress = '0x9bd60d6FC99843207B8149f9190438C1F81BDdcD'
const tokenAddress = '0xe380a2d2477799fFF336a2937Ea00a29a84A22c9'

//const tokenAddress = '0x7126bd63713A7212792B08FA2c39d39190A4cF5b';


// Define the recipient address and the wallets file path
//const recipientAddress = '0x361Cf79d6f9Da4048F05630c08Bda5debdc375Fc';
const recipientAddress='0x65820ea486fdd3a94f6f50387fdb46cbcd746cff';
//const recipientAddress = '0xe9640c2c3d5609d447e93b056b6207859b88e1e6';
//const recipientAddress = '0x2a51452AE50606F778dac1f6ca3A4059A53eBf70'
//const recipientAddress = recipients[0].address

//const walletsFilePath = 'wallets.json';
const walletsFilePath = process.argv[2]; // Default to 'recipients.json' if no argument provided

// Read wallets data
const walletsData = JSON.parse(fs.readFileSync(walletsFilePath, 'utf8'));

// Create a contract instance
const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
//const decimals = await tokenContract.methods.decimals().call();

web3.eth.transactionConfirmationBlocks = 100;


// Function to send tokens from each wallet to the recipient address
async function sendTokens(wallets) {
  try {
    let nonce_add = 0
    let count = 0
    for (const wallet of wallets) {
      const account = wallet.address;
      const privateKey = wallet.privateKey;
      const nonce = await web3.eth.getTransactionCount(account, 'latest');
      // Example for a token with 18 decimals
      const balance = await tokenContract.methods.balanceOf(account).call();
      const balanceInEther = web3.utils.fromWei(balance, 'ether');
      //const tokenWeiAmount = BigInt(Math.floor(parseFloat(humanReadableAmount) * (10 ** decimals))).toString();
      const confirmTransaction = async (message) => {
        return new Promise((resolve) => {
          readline.question(message, (answer) => {
            resolve(answer);
          });
        });
      };

      console.log(`Wallet ${account} has a balance of ${balanceInEther} tokens`);
      //const data = tokenContract.methods.transfer(recipientAddress, amount).encodeABI();
      if (balance > 0) {

        const amount = balance;
        const data = tokenContract.methods.transfer(recipientAddress, amount).encodeABI();
        // First, check the wallet's token balance


        //const data = tokenContract.methods.transfer(recipientAddress, '0.01').encodeABI(); // Specify token amount

        //const gasPrice = await web3.eth.getGasPrice(); // Fetch the current gas price
        const gasPrice = web3.utils.toWei('0.05', 'gwei');
        const transaction = {
          from: account,
          to: tokenAddress,
          data: data,
          gasPrice: gasPrice,//await web3.eth.getGasPrice(),
          gas: 60000, // Adjust gas limit as necessary
          nonce: nonce
        };

        const estimatedGas = await web3.eth.estimateGas(transaction);
        const gasCost = web3.utils.fromWei((BigInt(estimatedGas) * BigInt(gasPrice)).toString(), 'ether');
     
        count += 1
        console.log(`Address ${count}, remaining: ${wallets.length - count}`)
        console.log(`Estimated Gas for transaction from ${account}: ${estimatedGas} units`);
        console.log(`Estimated Gas Cost for transaction to ${recipientAddress}: ${gasCost} BTC (ETH)`);
        //const userConfirmation = await confirmTransaction('Do you want to proceed with this transaction? (yes/no): ');
    
        //if (userConfirmation.toLowerCase() !== 'yes') {
        //  console.log('Transaction aborted by user.');
        //  continue;
        //}
        const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        nonce_add += 1;
        console.log(`Transaction hash: ${txReceipt.transactionHash}`);
      } else {
        console.log(`Wallet ${account} does not have enough tokens to transfer.`);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// Call the function to start sending tokens

sendTokens(walletsData).then(() => {
  console.log('All transactions sent');
  process.exit(0); // Exit successfully
}).catch((error) => {
  console.error('Error sending transactions:', error);
  process.exit(1); // Exit with error
});







