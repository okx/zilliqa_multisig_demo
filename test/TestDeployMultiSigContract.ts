import { expect } from "chai";
import hre, { ethers } from "hardhat";
import hre from "hardhat";
import * as utils from "../utils/utils.ts";

let WALLET_INDEX_0 = 0;
let WALLET_INDEX_1 = 1;
let WALLET_INDEX_2 = 2;
let WALLET_INDEX_3 = 3;
const DEBUG = true;

describe("TestDeployMultiSigContract", function () {
	before(async function () {
	  utils.ensureZilliqa();
	})

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
		  num_of_required_signatures
		);

		utils.checkScillaTransactionSuccess(multiSigWalletContract);

		const multiSigAddress = multiSigWalletContract.address;
		expect(multiSigAddress).to.be.properAddress;
		if (DEBUG) {
		  console.log(`MultiSig address is ${multiSigAddress}`);
		}
	});

});
