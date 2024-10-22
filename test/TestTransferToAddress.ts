import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";
import { Transaction } from "@zilliqa-js/account";
import { Contracts } from "@zilliqa-js/contract";
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
import {
	getAddressFromPrivateKey,
	toChecksumAddress,
  } from "@zilliqa-js/crypto";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
const DEBUG = true;

describe("TestTransferToAddress", function () {
	var setup : any;
	var precomputed_contract_addr : string;
	before(async function () {
		setup = utils.ensureZilliqa();
	})

	it("Transfer to address should be successful. ", async function () {
		var addr = "0x92b4bD0996f443e9ccc23472DbAB80E49ad62794"; // contract address
		var li_amount_str = "1";
		const txDefault = {
			version: setup.version,
			gasPrice: setup.gasPrice,
			gasLimit: setup.gasLimit,
			amount: new BN(units.toQa(li_amount_str, units.Units.Li)),
		  	toAddr: toChecksumAddress(addr),
		  };
		const txnData = setup.zilliqa.transactions.new(txDefault);

		// must use another account, NOT the contract deployer, to transfer to the contract address. Otherwise, the deployer's nonce will be increased by 1, and the precomputed contract address will be different. Or use the increase-by-1 nonce to precompute the contract address in the above step. 
		var funderKey = utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_1).privateKey;
		let sender = await utils.getZilliqaBlockchainForPrivateKey(setup, funderKey);

		const txn = await sender.createTransaction(txnData, 50, 5000);
		if (DEBUG) {
			console.log(`Transfer to contract txn: ${JSON.stringify(txn)}`);
		}
		expect(txn.receipt.success, `tx receipt ${txn.receipt}`).to.be.true;
	});
});
