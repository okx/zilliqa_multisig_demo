# Overview 
This demo showcases how to utilize the Zilliqa official [multisig contract](https://github.com/Zilliqa/zilliqa-developer/blob/main/products/multisig/src/smartcontract/multisig_wallet_with_zrc2.scilla.js) to transfer Zilliqa's native tokens, ZIL. In particular, the transfer must be signed by two parties. And the contract is written in Zilliqa-native language, [Scilla](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html). The demo is written in Typescript using [Hardhat](https://hardhat.org/) framework. It runs on the Zilliqa official [testnet](https://dev-api.zilliqa.com). 

NOTE: The testnet connection is not stable. Sometimes, the demo will get stuck. Then wait a while and restart. 

# Setup
Install Dependencies
```
npm install
```

# Prepare Accounts
Show and check positive balances of three accounts defined in hardhat.config.ts. 
```
$ npx hardhat test test/TestGetAccountBalance.ts

  TestGetAccountsBalance
Connecting to Zilliqa on https://dev-api.zilliqa.com, chainId 333
Setting default wallet for signing to: 0x381f4008505e940AD7681EC3468a719060caF796
Account 0 0x381f4008505e940AD7681EC3468a719060caF796, Pub Key 03bfad0f0b53cff5213b5947f3ddd66acee8906aba3610c111915aecc84092e052, Balance: 1806432000000000
Account 1 0xd90f2e538CE0Df89c8273CAd3b63ec44a3c4ed82, Pub Key 03d3c94c377f0fb329dc5c857f7dbd7f694eecfca377db079b68ef7285905baa0b, Balance: 78050783661550821
Account 2 0xB028055EA3BC78D759d10663Da40D171dec992Aa, Pub Key 0380284d18dbc1d3704a4361d65156496f0fe0f9722154d36f5c8c023c83aac94e, Balance: 10963400000020000
```
If the above accounts do not have enough balances, run the (faucet)[https://dev-wallet.zilliqa.com/faucet?network=testnet] to receive amounts. 

# Deploy Multisig Contract
The admins of the contract are Account 0 and Account 1, i.e., a transfer from this contract must be signed by the both accounts. 


```
$ npx hardhat test test/TestDeployMultiSigContract.ts

  TestDeployMultiSigContract

Connecting to Zilliqa on https://dev-api.zilliqa.com, chainId 333
Setting default wallet for signing to: 0x381f4008505e940AD7681EC3468a719060caF796
S 0
XX {"cumulative_gas":486,"epoch_num":"7359890","success":true}
E undefined
MultiSig address is 0xe8D1600826B1D7ce2a5E8fa85184072c14482F75

```

Then copy the above address as the value of MULTISIG_CONTRACT_ADDRESS var in [test/TestInteractMultiSigContract.ts](test/TestInteractMultiSigContract.ts) for later interactions with the contract. The current value is my pre-deployed contract. 

# Transfer from Addr0 to Contract
This step makes sure the contract has enough balances. 
```
npx hardhat test test/TestInteractMultiSigContract.ts --grep TestTransferFromAcc0ToMultiSigContract
Scilla Contracts: 
Nothing changed since last compile.
Connecting to Zilliqa on https://dev-api.zilliqa.com, chainId 333


  TestTransferFromAcc0ToMultiSigContract
Setting default wallet for signing to: 0x381f4008505e940AD7681EC3468a719060caF796
Before Transfer Contract Balance: 4999999955000
Setting default wallet for signing to: 0x381f4008505e940AD7681EC3468a719060caF796
    ✔ The transfer shall succeed.  (45771ms)
Before Transfer Contract Balance: 4999999955000, After Transfer Contract Balance: 5000000955000
    ✔ The contract balance shall increase. 
```


# Submit A Multisig Transfer to Account 2. 
The below test case demonstrates a transfer from the multisig contract to Account 2. The transfer is submitted by Account 0 and later signed by Account 1. 
```
$ npx hardhat test test/TestInteractMultiSigContract.ts --grep TestSubmitMultiSigTransferToAcc2

xxxx
✔ The submission from Acc0 shall succeed.
xxxx
✔ The execution from Acc0 shall fail.
xxxx
✔ The signing from Acc2 shall fail.
xxxx
✔ The signing from Acc1 shall succeed.
xxxx
✔ The balance of Acc2 and Multisig contract before transfer shall be positive.
xxxx
✔ The execution from Acc0 shall succeed.
After Multisig Transfer, the Acc2 Balance has increased for: 5000, the contract balance has decreased for: 5000
✔ The Acc2 balance shall increment, and contract balance shall decrement.  (75ms)

 7 passing (4m)
...
```
Note: if receiving error like `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`, it indicates the testnet connection problem. Simply rerun the test later. 

# Revoke A Multisig Transfer to Account 2. 

```
$ npx hardhat test test/TestInteractMultiSigContract.ts --grep TestRevokeMultiSigTransferToAcc2

xxxx
✔ The submission from Acc1 shall succeed.  (46346ms)
xxxx
✔ The signing from Acc0 shall succeed.  (55821ms)
xxxx
✔ The revoking from Acc1 shall succeed.  (105514ms)
xxxx
✔ The execution from Acc0 shall fail.  (55823ms)


  4 passing (4m)

```