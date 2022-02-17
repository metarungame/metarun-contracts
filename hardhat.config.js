require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require('./tasks/write-balances-to-tiersystem.js');
require('./tasks/mint-tokens.js');
require('./tasks/ido-pool-client.js');
require('solidity-coverage')

require('./tasks/mint-tokens.js');
require('./tasks/create-order.js');
require('./tasks/buy-token.js');

const accounts = {
  mnemonic: `${process.env.MNEMONIC}`,
}

module.exports = {
  solidity: "0.8.11",
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
      url: 'https://bsc-dataseed1.ninicoin.io/',
      accounts,
      chainId: 56,
      live: true,
      saveDeployments: true,
    },
    ftm: {
      url: 'https://rpcapi-tracing.fantom.network/',
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
      url: 'https://matic-mumbai.chainstacklabs.com/',
      accounts,
      chainId: 80001,
      live: true,
      saveDeployments: true,
      gasPrice: 2000000000
    },
    hardhat: {
      chainId: 137
    },
    rinkeby: {
        chainId: 4,
        accounts,
        url: `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`,
        live: true,
        saveDeployments: true,
    },
    bsctestnet: {
        chainId: 97,
        accounts,
        url: `https://data-seed-prebsc-1-s2.binance.org:8545/`,
        live: true,
        saveDeployments: true,
  }
  },
};
