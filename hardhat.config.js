require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

const INFURA_API_KEY_MAINNET = process.env.INFURA_API_KEY_MAINNET;
const ALCHEMY_API_KEY_RINKEBY = process.env.ALCHEMY_API_KEY_RINKEBY;
const ALCHEMY_API_KEY_GOERLI = process.env.ALCHEMY_API_KEY_GOERLI;
const RINKEBY_ACCOUNT_PK = process.env.RINKEBY_ACCOUNT_PK;
const RINKEBY_ACCOUNT_A2 = process.env.RINKEBY_ACCOUNT_A2;
const RINKEBY_ACCOUNT_A3 = process.env.RINKEBY_ACCOUNT_A3;

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY_MAINNET}`,
      accounts: [RINKEBY_ACCOUNT_PK, RINKEBY_ACCOUNT_A2, RINKEBY_ACCOUNT_A3],
      timeout: 60000,
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY_RINKEBY}`, // get an API key here: https://www.alchemy.com
      accounts: [RINKEBY_ACCOUNT_PK, RINKEBY_ACCOUNT_A2, RINKEBY_ACCOUNT_A3],
      timeout: 60000,
    },
    goerli: {
        url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY_GOERLI}`, // get an API key here: https://www.alchemy.com
        accounts: [RINKEBY_ACCOUNT_PK, RINKEBY_ACCOUNT_A2, RINKEBY_ACCOUNT_A3],
        timeout: 60000,
      },
    localhost: {
      url: "http://localhost:8545",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
      timeout: 60000,
      chainId: 1337
    },
    hardhat: {
      chainId: 1337,
    },
    matic_test: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [RINKEBY_ACCOUNT_PK, RINKEBY_ACCOUNT_A2]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_KEY,
  },
  mocha: {
    timeout: 100000000
  }
};
