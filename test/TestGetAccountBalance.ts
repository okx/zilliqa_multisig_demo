import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
let WALLET_INDEX_2 = 2;
let WALLET_INDEX_3 = 3;
const DEBUG = true;

describe("TestGetAccountsBalance", function () {
	before(async function () {
	  utils.ensureZilliqa();
	})

	it("Accounts should have enough balances. ", async function () {
		utils.setZilliqaSignerToAccountByHardhatWallet(WALLET_INDEX_0);
		let owner0 =
		  utils.getZilliqaAddressForAccountByHardhatWallet(WALLET_INDEX_0);
		let bal0 = (await hre.zilliqa.getBalanceForAddress(owner0))[0];
		expect(bal0).to.be.greaterThan(0);

		let owner1 =
		  utils.getZilliqaAddressForAccountByHardhatWallet(WALLET_INDEX_1);
		let bal1 = (await hre.zilliqa.getBalanceForAddress(owner1))[0];
		expect(bal1).to.be.greaterThan(0);

		let owner2 =
		  utils.getZilliqaAddressForAccountByHardhatWallet(WALLET_INDEX_2);
		let bal2 = (await hre.zilliqa.getBalanceForAddress(owner2))[0];
		expect(bal2).to.be.greaterThan(0);

		if (DEBUG) {
			console.log(`Address 0 ${owner0}, Balance: ${bal0}`);
			console.log(`Address 1 ${owner1}, Balance: ${bal1}`);
			console.log(`Address 2 ${owner2}, Balance: ${bal2}`);
		}

	});

});
