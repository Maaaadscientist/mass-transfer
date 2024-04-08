const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption settings
const algorithm = 'aes-256-cbc'; // Encryption algorithm
const password = 'higgs125'; // Replace with a strong password
const key = crypto.scryptSync(password, 'salt', 32);
const iv = crypto.randomBytes(16);

const accountData = fs.readFileSync(path.join(__dirname, 'account.json'), 'utf8');

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(accountData, 'utf8', 'hex');
encrypted += cipher.final('hex');

const encryptedData = {
  iv: iv.toString('hex'),
  content: encrypted
};

fs.writeFileSync(path.join(__dirname, 'account.enc'), JSON.stringify(encryptedData));
console.log('File encrypted.');

