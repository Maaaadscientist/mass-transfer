const Web3 = require('web3').default;
const crypto = require('crypto');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const fs = require('fs');

const web3 = new Web3('https://endpoints.omniatech.io/v1/eth/sepolia/public');
//const web3 = new Web3('https://rpc.merlinchain.io');

// You must provide the ERC20 token contract ABI and address
const tokenABI = JSON.parse(fs.readFileSync('miniABI.json', 'utf8')); // Load the ABI from a file
const tokenAddress = '0x8db4bE401efF96BeAc922613474563E78e7CcE42'; // Replace with the token's contract address

const recipientsFilePath = process.argv[2] || 'recipients.json';

const question = (query) => new Promise((resolve) => readline.question(query, resolve));

(async () => {
  try {
    const password = await question('Enter your password to decrypt the file: ');
    const encryptedData = JSON.parse(fs.readFileSync('account.enc', 'utf8'));
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const key = crypto.scryptSync(password, salt, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    const accountData = JSON.parse(decrypted);
    const account = accountData.account;
    const privateKey = accountData.privateKey;
    const recipientsData = JSON.parse(fs.readFileSync(recipientsFilePath, 'utf8'));
    const recipients = recipientsData.map(recipient => ({
      address: recipient.address,
      amount: web3.utils.toWei(recipient.amount, 'ether') // Convert token amount to the correct unit if needed
    }));

    // Create a contract instance
    const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);
    const gasPrice = await web3.eth.getGasPrice(); // Fetch the current gas price
    const customGasPrice = web3.utils.toWei('0.05', 'gwei');

    async function sendTokens() {
      const nonce = await web3.eth.getTransactionCount(account, 'latest');
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const data = tokenContract.methods.transfer(recipient.address, recipient.amount).encodeABI();
        
        const transaction = {
          from: account,
          to: tokenAddress,
          data: data,
          gasPrice: gasPrice,
          gas: 200000, // Set a gas limit for token transfer; adjust as necessary
          nonce: nonce + BigInt(i)
        };
        
        console.log(transaction);
        // Estimate gas (optional, for information purposes)
        const estimatedGas = await web3.eth.estimateGas(transaction);
        const gasCost = web3.utils.fromWei((BigInt(estimatedGas) * BigInt(customGasPrice)).toString(), 'ether');
        console.log(`Estimated Gas for transaction to ${recipient.address}: ${estimatedGas} units`);
        console.log(`Estimated Gas Cost for transaction to ${recipient.address}: ${gasCost} BTC (ETH)`);

        const userConfirmation = await question('Do you want to proceed with this transaction? (yes/no): ');
        if (userConfirmation.toLowerCase() !== 'yes') {
          console.log('Transaction aborted by user.');
          continue;
        }
        
        // Sign and send the transaction
        const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
        console.log(privateKey)
        const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(`Transaction hash: ${txReceipt.transactionHash}`);
      }
      readline.close();
    }

    sendTokens().catch(console.error);
  } catch (error) {
    console.error(error);
  }
})();

