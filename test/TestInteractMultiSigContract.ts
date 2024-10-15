import { expect } from "chai";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
import { Contract } from "ethers";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
let WALLET_INDEX_2 = 2;

const DEBUG = true;
const MULTISIG_CONTRACT_ADDRESS = "0x92b4bD0996f443e9ccc23472DbAB80E49ad62794" // Replace with your contract address

describe.only("TestTransferFromAcc0ToMultiSigContract", function () {
	var setup : any;
	var before_transfer_contract_bal = BN;

	before(async function () {
		setup = utils.ensureZilliqa();
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		before_transfer_contract_bal = (await hre.zilliqa.getBalanceForAddress(MULTISIG_CONTRACT_ADDRESS))[0];
		if (DEBUG) {
			console.log(`Before Transfer Contract Balance: ${before_transfer_contract_bal}`);
		}
	})

	it("The transfer shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);

		const minGasPrice = await setup.zilliqa.blockchain.getMinimumGasPrice();
		const myGasPrice = units.toQa("20000", units.Units.Li);
		expect(myGasPrice).to.be.greaterThanOrEqual(new BN(minGasPrice.result));

		var multisig_contract = setup.zilliqa.contracts.at(MULTISIG_CONTRACT_ADDRESS);
		expect(multisig_contract.isDeployed()).to.true;
		var li_amount_str = "1"; // 1e-6 of Zil
		const tx: any = await multisig_contract.call(
			"AddFunds",
			[],
			{
				version: setup.version,
				amount: new BN(units.toQa(li_amount_str, units.Units.Li)), // Sending an amount in Zil (1) and converting the amount to Qa
				gasPrice: myGasPrice,
				gasLimit: Long.fromNumber(8000),
			}
		  );
		
		expect(tx.receipt.success, `tx receipt ${tx.receipt}`).to.be.true;
	});

	it("The contract balance shall increase. ", async function () {
		let after_transfer_contract_bal = (await hre.zilliqa.getBalanceForAddress(MULTISIG_CONTRACT_ADDRESS))[0];
		expect(after_transfer_contract_bal).to.be.greaterThan(before_transfer_contract_bal);
		if (DEBUG) {
			console.log(`Before Transfer Contract Balance: ${before_transfer_contract_bal}, After Transfer Contract Balance: ${after_transfer_contract_bal}`);
		}
	});
});



describe.only("TestSubmitMultiSigTransferToAcc2", function () {
	var multisig_txn_id = "4";
	const transfer_qa_amount = '5000';
	var before_acc2_bal = BN;
	var before_contract_bal = BN;
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

	it("The balance of Acc2 and Multisig contract before transfer shall be positive. ", async function () {
		let acc2 =
		  utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);
		before_acc2_bal = (await hre.zilliqa.getBalanceForAddress(acc2.address))[0];	
		expect(before_acc2_bal).to.be.greaterThan(0);

		before_contract_bal = (await hre.zilliqa.getBalanceForAddress(MULTISIG_CONTRACT_ADDRESS))[0];
		expect(before_contract_bal).to.be.greaterThan(0);
		console.log(`Before Transfer Acc2 Balance: ${before_acc2_bal}, Contract Balance: ${before_contract_bal}`);
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

	it("The Acc2 balance shall increment, and contract balance shall decrement. ", async function () {
		let acc_2 =
		utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);
		let after_acc2_bal = (await hre.zilliqa.getBalanceForAddress(acc_2.address))[0];
		let after_contract_bal = (await hre.zilliqa.getBalanceForAddress(MULTISIG_CONTRACT_ADDRESS))[0];

		if (DEBUG) {
			console.log(`After Multisig Transfer, the Acc2 Balance has increased for: ${after_acc2_bal - before_acc2_bal}, the contract balance has decreased for: ${before_contract_bal - after_contract_bal}`);
		}

		expect(after_acc2_bal).to.be.greaterThan(before_acc2_bal);
		expect(after_contract_bal).to.be.lessThan(before_contract_bal);
	});
});

describe.only("TestRevokeMultiSigTransferToAcc2", function () {
	var multisig_txn_id = "4";
	const transfer_qa_amount = '5000';
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
	});

	it("The submission from Acc1 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_1);
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
		}
	});

	it("The signing from Acc0 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		if (DEBUG) {
			console.log(`Start to sign a mutlisig transfer txn with id ${multisig_txn_id} from Acc0`);	
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

	it("The revoking from Acc1 shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_1);
		if (DEBUG) {
			console.log(`Start to revoke a mutlisig transfer txn with id ${multisig_txn_id} from Acc1`);	
		}

		const tx: any = await multisig_contract.call(
			"RevokeSignature",
			[
				{
				  vname: 'transactionId',
				  type: 'Uint32',
				  value: multisig_txn_id,
				},
			],
			tx_params, 
		  );
		
		expect(tx.receipt.success, `txn receipt ${JSON.stringify(tx.receipt)}`).to.be.true;

		if (DEBUG) {
			console.log(`Successfully revoke the multisig tx id ${multisig_txn_id} from Acc1, txn receipt ${JSON.stringify(tx.receipt)}`);
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

});