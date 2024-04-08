from web3 import Web3
from web3.auto import w3
from eth_account import Account
from mnemonic import Mnemonic
from bip_utils import Bip39MnemonicGenerator, Bip39SeedGenerator, Bip44, Bip44Coins, Bip44Changes
import json

# Example mnemonic, replace it with your actual 12-word mnemonic phrase
mnemonic = "verb oblige march audit you music coffee crime private level plate double"

# Generate the seed from the mnemonic
seed = Bip39SeedGenerator(mnemonic).Generate()
wallets = []

# Generate the first 100 private keys and addresses
for i in range(102):
    bip44_mst_ctx = Bip44.FromSeed(seed, Bip44Coins.ETHEREUM)
    bip44_acc_ctx = bip44_mst_ctx.Purpose().Coin().Account(0)
    bip44_chg_ctx = bip44_acc_ctx.Change(Bip44Changes.CHAIN_EXT)
    bip44_addr_ctx = bip44_chg_ctx.AddressIndex(i)
    
    private_key = bip44_addr_ctx.PrivateKey().Raw().ToHex()
    account = Account.from_key(private_key)
    
    print(f"Address {i}: {account.address}")
    print(f"Private Key {i}: {private_key}\n")
    wallets.append({"address": account.address, "privateKey": private_key})

# Save the wallets to a JSON file
with open('wallets.json', 'w') as f:
    json.dump(wallets, f, indent=4)

# Note: Always use this information securely and do not share private keys!

