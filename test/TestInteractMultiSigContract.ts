import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
let WALLET_INDEX_2 = 2;
let WALLET_INDEX_3 = 3;

const DEBUG = true;
const MULTISIG_CONTRACT_ADDRESS = "0xe8D1600826B1D7ce2a5E8fa85184072c14482F75" // Replace with your contract address

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
	before(async function () {
	  utils.ensureZilliqa();
	})

	it("The transfer shall succeed. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		hre.
	});
});