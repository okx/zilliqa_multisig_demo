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
		let acc0 =
		  utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_0);
		let bal0 = (await hre.zilliqa.getBalanceForAddress(acc0.address))[0];
		expect(bal0).to.be.greaterThan(0);

		let acc1 =
		  utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_1);
		let bal1 = (await hre.zilliqa.getBalanceForAddress(acc1.address))[0];
		expect(bal1).to.be.greaterThan(0);

		let acc2 =
		  utils.getZilliqaAccountForAccountByHardhatWallet(WALLET_INDEX_2);
		let bal2 = (await hre.zilliqa.getBalanceForAddress(acc2.address))[0];
		expect(bal2).to.be.greaterThan(0);

		if (DEBUG) {
			console.log(`Account 0 ${acc0.address}, Pub Key ${acc0.publicKey}, Balance: ${bal0}`);
			console.log(`Account 1 ${acc1.address}, Pub Key ${acc1.publicKey}, Balance: ${bal1}`);
			console.log(`Account 2 ${acc2.address}, Pub Key ${acc2.publicKey}, Balance: ${bal2}`);
		}
	});

});
