require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")

const dotenv = require("dotenv");
dotenv.config({path: __dirname + '/.env'});
const { GOERLI_URL, PRIVATE_KEY } = process.env;

module.exports = {
  networks:{
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: GOERLI_URL,
      accounts:[PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
        {
            version: "0.8.17",
        },
        {
            version: "0.6.6",
        },
    ],
},
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0,
    },
    acc1: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: false,
  },
  mocha: {
    timeout: 500000,
  }
};
