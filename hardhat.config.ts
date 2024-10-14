import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import "hardhat-scilla-plugin";
// import "./utils/deploy-task.ts";
import "hardhat-deploy";
import * as configUtils from "./utils/config.ts";

const chai = require("chai");
const { scillaChaiEventMatcher } = require("hardhat-scilla-plugin");
chai.use(scillaChaiEventMatcher);

// 33101 / 814D - testnet  (333 for ZIL)
// 32769 / 8001 - main net ( 1 for ZIL)
// 32990 / 80DE - isolated local server (222 for ZIL)
// 0x82BC - zblockchain localdev
//

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "public_testnet",
  networks: {
    public_testnet: {
      url: "https://dev-api.zilliqa.com",
      websocketUrl: "https://dev-api.zilliqa.com",
      accounts: [
        "d96e9eb5b782a80ea153c937fa83e5948485fbfc8b7e7c069d7b914dbc350aba",
        "e53d1c3edaffc7a7bab5418eb836cf75819a82872b4a1a0f1c7fcf5c3e020b89",
        "e7f59a4beb997a02a13e0d5e025b39a6f0adc64d37bb1e6a849a4863b4680411",
        "589417286a3213dceb37f8f89bd164c3505a4cec9200c61f7c6db13a30a71b45",
      ],
      chainId: 33101,
      zilliqaNetwork: true,
      web3ClientVersion: "Zilliqa/v8.2",
      protocolVersion: 0x41,
      miningState: false,
    },
  },
  mocha: {
    timeout: 500000,
  },
};

export default config;
