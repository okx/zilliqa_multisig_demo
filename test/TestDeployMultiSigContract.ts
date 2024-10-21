import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";
import { Transaction } from "@zilliqa-js/account";
import { Contracts } from "@zilliqa-js/contract";
import { BN, Long } from "@zilliqa-js/util";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
const DEBUG = true;

describe("TestDeployMultiSigContract", function () {
	var setup : any;
	var precomputed_contract_addr : string;
	before(async function () {
		setup = utils.ensureZilliqa();
	})

	it("Contract address should be percomputed with sender address and nonce. ", async function () {
		let acc0 = utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_0);
		let bal0AndNonce = await hre.zilliqa.getBalanceForAddress(acc0.address);
		let bal0 = bal0AndNonce[0];
		let nonce = bal0AndNonce[1];
		let nextNonce = nonce + 1;
		console.log(`Address: ${acc0.address}, Next_Nonce: ${nextNonce}, Bal: ${bal0}`);
        let tx = new Transaction(
			{
				// below fields are mandatory but useless, so we just fill them with dummy values.
				version: 0,
				toAddr: acc0.address, // must be any valid address
				amount: new BN(0),
				gasPrice:new BN(0), 
				gasLimit: new Long(0),

				// these two fields are important to precompute the contract address
				nonce: nextNonce,
				pubKey: acc0.publicKey,
			},
			setup.provider, 
		  );
		precomputed_contract_addr = Contracts.getAddressForContract(tx);
		console.log(`Precomputed contract address: ${precomputed_contract_addr}`);

	});

	it("Contract should be deployed successfully", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);

		let owner0 =
		  utils.getZilliqaAddressForAccountByHardhatWallet(WALLET_INDEX_0);
		let owner1 =
		  utils.getZilliqaAddressForAccountByHardhatWallet(WALLET_INDEX_1);

		const owner_list: string[] = [owner0, owner1];

		let num_of_required_signatures = 2;
		let multiSigWalletContract = await hre.deployScillaContract(
		  "MultiSigWallet",
		  owner_list,
		  num_of_required_signatures, 
		  "1.0"
		);

		utils.checkScillaTransactionSuccess(multiSigWalletContract);

		const multiSigAddress = multiSigWalletContract.address;
		expect(multiSigAddress).to.be.properAddress;
		expect(multiSigAddress, `expected precomputed contract addr ${precomputed_contract_addr}, actual addr ${multiSigAddress}`).to.be.equal(precomputed_contract_addr);
		if (DEBUG) {
		  console.log(`Actual MultiSig address is ${multiSigAddress}, expected precomputed contract addr ${precomputed_contract_addr}`);
		}

	});
	
	it("Contract shall have zero balance. ", async function () {
		var after_deploy_contract_bal = (await hre.zilliqa.getBalanceForAddress(precomputed_contract_addr))[0];
		if (DEBUG) {
			console.log(`After Deploy Contract Balance: ${after_deploy_contract_bal}`);
		}
		expect(after_deploy_contract_bal).to.be.equal(0);
	});
});
