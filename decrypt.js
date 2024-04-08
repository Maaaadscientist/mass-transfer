const crypto = require('crypto');
const fs = require('fs');

//const password = 'your-strong-password'; // Must be the same password used for encryption
const password = 'higgs125'//'your-strong-password'; // Must be the same password used for encryption

// Read the encrypted data
const encryptedData = JSON.parse(fs.readFileSync('account.enc', 'utf8'));

const iv = Buffer.from(encryptedData.iv, 'hex');
const salt = Buffer.from(encryptedData.salt, 'hex');


// Derive the key using the password and salt
const key = crypto.scryptSync(password, salt, 32);

// Decrypt the content
const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
decrypted += decipher.final('utf8');

// Convert the decrypted data back to JSON
const jsonData = JSON.parse(decrypted);

console.log('Decrypted JSON data:', jsonData);

