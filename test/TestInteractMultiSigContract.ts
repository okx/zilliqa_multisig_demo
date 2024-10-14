import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";
import { initZilliqa, Setup as ZilliqaSetup } from "hardhat-scilla-plugin";
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
import { ScillaContract } from "hardhat-scilla-plugin";
import { Contract } from "ethers";

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
			  false,
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



describe.only("TestMultiSigTxnToAcc2", function () {
	var multisig_txn_id = "4";
	const transfer_qa_amount = '5000';
	var before_acc2_bal;
	var setup = utils.ensureZilliqa();
	let tx_params = {};
	var multisig_contract : Contract;

	before(async function () {
		multisig_contract = setup.zilliqa.contracts.at(MULTISIG_CONTRACT_ADDRESS);
		expect(multisig_contract.isDeployed()).to.true;

		tx_params = 
			{
				version: setup.version,
				amount: new BN(0),
				gasPrice: units.toQa("20000", units.Units.Li), 
				gasLimit: Long.fromNumber(8000),
			};

		let acc2 =
		  utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);
		before_acc2_bal = (await hre.zilliqa.getBalanceForAddress(acc2.address))[0];	
		expect(before_acc2_bal).to.be.greaterThan(0);
		console.log(`Before Transfer Acc2 Balance: ${before_acc2_bal}`);
	});

	it("The submission from Acc0 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		let acc_2 =
		utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);

		if (DEBUG) {
			console.log(`Start to submit a mutlisig transfer txn to Acc2 ${acc_2.address} with amount ${transfer_qa_amount} Qa`);	
		}
		const tx: any = await multisig_contract.call(
			"SubmitNativeTransaction",
			[
				{
				  vname: 'recipient',
				  type: 'ByStr20',
				  value: acc_2.address,
				},
				{
				  vname: 'amount',
				  type: 'Uint128',
				  value: transfer_qa_amount,
				},
				{
				  vname: 'tag',
				  type: 'String',
				  value: '',
				},
			],
			tx_params, 
		  );
		
		expect(tx.receipt.success).to.be.true;
		multisig_txn_id = tx.receipt.event_logs[0].params[0].value;

		if (DEBUG) {
			console.log(`Successfully submit the transaction ${tx.id} and get id ${multisig_txn_id} from contract, txn receipt ${JSON.stringify(tx.receipt)}`);
			// console.log(JSON.stringify(tx));
		}
	});

	it("The execution from Acc0 shall fail. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);

		if (DEBUG) {
			console.log(`Start to execute a mutlisig transfer txn with id ${multisig_txn_id}`);	
		}

		const tx: any = await multisig_contract.call(
			"ExecuteTransaction",
			[
				{
				  vname: 'transactionId',
				  type: 'Uint32',
				  value: multisig_txn_id,
				},
			],
			tx_params, 
		  );
		
		expect(tx.receipt.success).to.be.false;

		if (DEBUG) {
			console.log(`Fail to execute the multisig tx id ${multisig_txn_id} as not enough signatures, txn receipt ${JSON.stringify(tx.receipt)}`);
		}
	});

	it("The signing from Acc2 shall fail. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_2);
		let multisig_contract = setup.zilliqa.contracts.at(MULTISIG_CONTRACT_ADDRESS);
		expect(multisig_contract.isDeployed()).to.true;
		const myGasPrice = units.toQa("20000", units.Units.Li);

		let tx_params = 
			{
				version: setup.version,
				amount: new BN(0),
				gasPrice: myGasPrice, 
				gasLimit: Long.fromNumber(8000),
			};

		if (DEBUG) {
			console.log(`Start to sign a mutlisig transfer txn with id ${multisig_txn_id} from Acc2`);	
		}

		const tx: any = await multisig_contract.call(
			"SignTransaction",
			[
				{
				  vname: 'transactionId',
				  type: 'Uint32',
				  value: multisig_txn_id,
				},
			],
			tx_params, 
		  );
		
		expect(tx.receipt.success).to.be.false;

		if (DEBUG) {
			console.log(`Fail to sign the multisig tx id ${multisig_txn_id} from Acc2, as not the admin of the contract, txn receipt ${JSON.stringify(tx.receipt)}`);
		}
	});

	it("The signing from Acc1 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_1);
		if (DEBUG) {
			console.log(`Start to sign a mutlisig transfer txn with id ${multisig_txn_id} from Acc1`);	
		}

		const tx: any = await multisig_contract.call(
			"SignTransaction",
			[
				{
				  vname: 'transactionId',
				  type: 'Uint32',
				  value: multisig_txn_id,
				},
			],
			tx_params, 
		  );
		
		expect(tx.receipt.success).to.be.true;

		if (DEBUG) {
			console.log(`Successfully sign the multisig tx id ${multisig_txn_id} from Acc1, txn receipt ${JSON.stringify(tx.receipt)}`);
			// console.log(JSON.stringify(tx));
		}
	});

	it("The execution from Acc0 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);

		if (DEBUG) {
			console.log(`Start to execute a mutlisig transfer txn with id ${multisig_txn_id} from Acc0`);	
		}

		const tx: any = await multisig_contract.call(
			"ExecuteTransaction",
			[
				{
				  vname: 'transactionId',
				  type: 'Uint32',
				  value: multisig_txn_id,
				},
			],
			tx_params, 
		  );
		
		console.log(`Successfully execute the multisig tx id ${multisig_txn_id}, txn receipt ${JSON.stringify(tx.receipt)}`);

		expect(tx.receipt.success, `txn receipt ${JSON.stringify(tx.receipt)}`).to.be.true;

		if (DEBUG) {
			console.log(`Successfully execute the multisig tx id ${multisig_txn_id}, txn receipt ${JSON.stringify(tx.receipt)}`);
		}
	});

	it("The balance of Acc2 shall increment. ", async function () {
		let acc_2 =
		utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);
		let after_acc2_bal = (await hre.zilliqa.getBalanceForAddress(acc_2.address))[0];

		expect(after_acc2_bal).to.be.greaterThan(before_acc2_bal);
		if (DEBUG) {
			console.log(`After Multisig Transfer, the Acc2 Balance has increased for: ${after_acc2_bal - before_acc2_bal}`);
		}
	});

});