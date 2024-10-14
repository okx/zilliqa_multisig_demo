import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";
import { initZilliqa, Setup as ZilliqaSetup } from "hardhat-scilla-plugin";
const { BN, Long, bytes, units } = require("@zilliqa-js/util");

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
let WALLET_INDEX_2 = 2;
let WALLET_INDEX_3 = 3;

const DEBUG = true;
const MULTISIG_CONTRACT_ADDRESS = "0x92b4bD0996f443e9ccc23472DbAB80E49ad62794" // Replace with your contract address

describe.only("TestGetMultiSigContractBalance", function () {
	before(async function () {
	  utils.ensureZilliqa();
	})

	it("Contract shall have enough balances. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		let contract_bal = (await hre.zilliqa.getBalanceForAddress(MULTISIG_CONTRACT_ADDRESS))[0];
		if (DEBUG) {
			console.log(`Contract balance: ${contract_bal}`);
		}
		expect(contract_bal).to.be.greaterThan(0);
	});
});

describe.only("TestTransferFromAcc0ToMultiSigContract", function () {
	it("The transfer shall succeed. ", async function () {
		let setup = utils.ensureZilliqa();
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);

		let amount_str = "1";
		const minGasPrice = await setup.zilliqa.blockchain.getMinimumGasPrice();
		console.log(`Current Minimum Gas Price: ${minGasPrice.result}`);
		const myGasPrice = units.toQa("20000", units.Units.Li); // Gas Price that will be used by all transactions
		console.log(`My Gas Price ${myGasPrice.toString()}`);
		const isGasSufficient = myGasPrice.gte(new BN(minGasPrice.result)); // Checks if your gas price is less than the minimum gas price
		console.log(`Is the gas price sufficient? ${isGasSufficient}`);

		// let multisig_contract = setup.zilliqa.contracts.at(MULTISIG_CONTRACT_ADDRESS);
		// expect(multisig_contract.isDeployed()).to.true;
		// const tx = await multisig_contract.call(
		// 	"AddFunds",
		// 	[],
		// 	{
		// 		version: setup.version,
		// 		amount: new BN(units.toQa(amount_str, units.Units.Zil)), // Sending an amount in Zil (1) and converting the amount to Qa
		// 		gasPrice: myGasPrice, // Minimum gasPrice veries. Check the `GetMinimumGasPrice` on the blockchain
		// 		gasLimit: Long.fromNumber(50),
		// 	}
		//   );

		// let raw_tx = setup.zilliqa.transactions.new({
		// 	version: setup.version,
		// 	toAddr: MULTISIG_CONTRACT_ADDRESS,
		// 	amount: new BN(units.toQa(amount_str, units.Units.Zil)), // Sending an amount in Zil (1) and converting the amount to Qa
		// 	gasPrice: new BN(minGasPrice.result),
		// 	gasLimit: Long.fromNumber(5000),
		// 	data: JSON.stringify({
		// 	  _tag: 'AddFunds',
		// 	  params: []
		// 	})
		//   });

		// let tx = await setup.zilliqa.blockchain.createTransactionWithoutConfirm(raw_tx);
		// let blockchainTxnId = tx.id;

		// console.log("The sendZil transaction id is:", tx.id);
	
		// console.log("Waiting transaction be confirmed");
		// let confirmed_tx = await tx.confirm(tx.id, 33, 2000);

		// if (DEBUG) {
		// 	console.log("confirmed_tx is:", confirmed_tx);
		// }

		console.log(`Start to create txn`);
		const tx = await setup.zilliqa.blockchain.createTransaction(
			// Notice here we have a default function parameter named toDs which means the priority of the transaction.
			// If the value of toDs is false, then the transaction will be sent to a normal shard, otherwise, the transaction.
			// will be sent to ds shard. More info on design of sharding for smart contract can be found in.
			// https://blog.zilliqa.com/provisioning-sharding-for-smart-contracts-a-design-for-zilliqa-cd8d012ee735.
			// For payment transaction, it should always be false.
			setup.zilliqa.transactions.new(
			  {
				version: setup.version,
				toAddr: MULTISIG_CONTRACT_ADDRESS,
				amount: new BN(units.toQa("1", units.Units.Zil)), // Sending an amount in Zil (1) and converting the amount to Qa
				gasPrice: myGasPrice, // Minimum gasPrice veries. Check the `GetMinimumGasPrice` on the blockchain
				gasLimit: Long.fromNumber(50),
				data: JSON.stringify({
				_tag: 'AddFunds',
				params: []
				})
			  },
			  true,
			)
		  );
	  
		  console.log(`The transaction status is:`);
		  console.log(tx.receipt);
	  

		// const tx = await setup.zilliqa.blockchain.createTransaction(
		// 	// Notice here we have a default function parameter named toDs which means the priority of the transaction.
		// 	// If the value of toDs is false, then the transaction will be sent to a normal shard, otherwise, the transaction.
		// 	// will be sent to ds shard. More info on design of sharding for smart contract can be found in.
		// 	// https://blog.zilliqa.com/provisioning-sharding-for-smart-contracts-a-design-for-zilliqa-cd8d012ee735.
		// 	// For payment transaction, it should always be false.
		// 	setup.zilliqa.transactions.new(
		// 	  {
		// 		version: setup.version,
		// 		toAddr: MULTISIG_CONTRACT_ADDRESS,
		// 		amount: new BN(units.toQa(amount_str, units.Units.Zil)), // Sending an amount in Zil (1) and converting the amount to Qa
		// 		gasPrice: myGasPrice, // Minimum gasPrice veries. Check the `GetMinimumGasPrice` on the blockchain
		// 		gasLimit: Long.fromNumber(50),
		// 	  },
		// 	  false
		// 	)
		//   );
	});
});

describe.only("SubmitMultiSigTxnFromAcc0", function () {
    let acc_0 =
      utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_0);

    let result = await scillaMultiSigRewardsParamContract
      .connect(acc_0)
      .SubmitCustomChangeLookupRewardTransaction(rewardsContractAddress, 35);
    const multisig_txn_id = result.receipt.event_logs[0].params[0].value;
    if (DEBUG) {
      console.log("Multisig txn id is: ", multisig_txn_id);
    }
});