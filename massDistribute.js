const Web3 = require('web3').default;
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const fs = require('fs');

const web3 = new Web3('https://endpoints.omniatech.io/v1/eth/sepolia/public');
//const web3 = new Web3('https://rpc.merlinchain.io');

// Reading account details from the file
const accountPath = process.argv[2]; 
const recipientsFilePath = process.argv[3]; // Default to 'recipients.json' if no argument provided
const accountData = JSON.parse(fs.readFileSync(accountPath, 'utf8'));
const account = accountData.account; // Your wallet address from the file
const privateKey = accountData.privateKey; // Your private key from the file

// Add your recipients and amounts here
//const recipients = [
//  // Add more recipients as needed
//];
// Read the recipients data from the file
const recipientsData = JSON.parse(fs.readFileSync(recipientsFilePath, 'utf8'));
const recipients = recipientsData.map(recipient => ({
  address: recipient.address,
}));


const confirmTransaction = async (message) => {
  return new Promise((resolve) => {
    readline.question(message, (answer) => {
      resolve(answer);
    });
  });
};

async function sendETH() {
  const nonce = await web3.eth.getTransactionCount(account, 'latest');
  const gasPrice = await web3.eth.getGasPrice(); // Fetch the current gas price
  //const gasPrice = web3.utils.toWei('0.05', 'gwei');

  console.log(`Current Gas Price: ${web3.utils.fromWei(gasPrice, 'ether')} ETH`);

  const amount = web3.utils.toWei(0.001, 'ether')
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const callObject = {
      from: account,
      to: recipient.address,
      value: amount,

    };

    // Estimate gas for the transaction
    const estimatedGas = await web3.eth.estimateGas(callObject);
    const gasCost = web3.utils.fromWei((BigInt(estimatedGas) * BigInt(gasPrice)).toString(), 'ether');

    console.log(`Address ${i}, remaining: ${recipients.length - i}`)
    console.log(`Estimated Gas for transaction to ${recipient.address}: ${estimatedGas} units`);
    console.log(`Estimated Gas Cost for transaction to ${recipient.address}: ${gasCost} BTC`);

    //const userConfirmation = await confirmTransaction('Do you want to proceed with this transaction? (yes/no): ');

    //if (userConfirmation.toLowerCase() !== 'yes') {
    //  console.log('Transaction aborted by user.');
    //  continue;
    //}

    const transaction = {
      ...callObject,
      gas: estimatedGas,
      nonce: nonce + BigInt(i*100),
      gasPrice: gasPrice, // Use the fetched gas price
    };

    // Sign the transaction with the private key
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);

    // Send the transaction
    const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction hash: ${txReceipt.transactionHash}`);
  }

  readline.close();
}

sendETH().catch(console.error);

