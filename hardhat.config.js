require("@nomiclabs/hardhat-waffle");
require("hardhat-deploy");
require("solidity-coverage");
require("@openzeppelin/hardhat-upgrades");
require("hardhat-contract-sizer");

require("./tasks/mint-tokens.js");
require("./tasks/mint-deployer.js");
require("./tasks/ido-pool-client.js");
require("./tasks/create-order.js");
require("./tasks/buy-token.js");
require("./tasks/write-balances-to-tiersystem.js");
require("./tasks/buy-tickets.js");

const accounts = {
  mnemonic: `${process.env.MNEMONIC}`,
};

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  contractSizer: {
    runOnCompile: true,
    strict: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    ethereum: {
      url: `https://mainnet.infura.io/v3/${process.env.API_KEY}`,
      accounts,
      chainId: 1,
      live: true,
      saveDeployments: true,
    },
    bsc: {
      url: "https://bsc-dataseed1.ninicoin.io/",
      accounts,
      chainId: 56,
      live: true,
      saveDeployments: true,
      timeout: 240000,
      gasPrice: 10000000000,
    },
    ftm: {
      url: "https://rpcapi-tracing.fantom.network/",
      accounts,
      chainId: 250,
      live: true,
      saveDeployments: true,
    },
    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`,
      timeout: 120000,
      accounts,
      chainId: 137,
      live: true,
      saveDeployments: true,
      // gas: 30_000_000_000
      // for legacy txes:
      // gasPrice: 20_000_000_000
    },
    mumbai: {
      url: "https://matic-mumbai.chainstacklabs.com/",
      accounts,
      chainId: 80001,
      live: true,
      saveDeployments: true,
      gasPrice: 2000000000,
    },
    hardhat: {
      chainId: 56,
      accounts,
    },
    rinkeby: {
      chainId: 4,
      accounts,
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
      live: true,
      saveDeployments: true,
    },
    bsctestnet: {
      chainId: 97,
      accounts,
      url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
      live: true,
      saveDeployments: true,
    },
    local: {
      chainId: 137,
      accounts,
      url: `http://127.0.0.1:8545/`,
      live: true,
      saveDeployments: true,
    },
  },
};
