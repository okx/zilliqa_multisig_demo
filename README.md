# Overview 
This demo showcases how to utilize the Zilliqa official [multisig contract](https://github.com/Zilliqa/zilliqa-developer/blob/main/contracts/reward_control/contracts/scilla/msw_rewards_param.scilla) to transfer Zilliqa's native tokens, ZIL. In particular, the transfer must be signed by two parties. And the contract is written in Zilliqa-native language, [Scilla](https://scilla.readthedocs.io/en/latest/scilla-in-depth.html). The demo is written in Javascript using [Hardhat](https://hardhat.org/) framework. It runs on the Zilliqa official [testnet](https://dev-api.zilliqa.com). 


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
Address 0 0x381f4008505e940AD7681EC3468a719060caF796, Balance: 1992176000000000
Address 1 0xd90f2e538CE0Df89c8273CAd3b63ec44a3c4ed82, Balance: 78073783661550821
Address 2 0xB028055EA3BC78D759d10663Da40D171dec992Aa, Balance: 1098740000000000
```
If the above accounts do not have enough balances, run the (faucet)[https://dev-wallet.zilliqa.com/faucet?network=testnet] to receive amounts. 

# Deploy Multisig Contract
The admins of the contract are Addr0 and Addr1, i.e., a transfer from this contract must be signed by both Addr0 and Addr1. 


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

NOTE: copy the above address as the value of MULTISIG_CONTRACT_ADDRESS var in [test/TestInteractMultiSigContract.ts](test/TestInteractMultiSigContract.ts) for later interactions with the contract. The current value is my pre-deployed contract. 

# Transfer from Addr0 to Contract

# Check Contract Balance
```
$ 
```

The demo is comprised of the following steps: 
* Account Preparation 
  * Prepare three accounts with balances
* Contract Deployment
* 