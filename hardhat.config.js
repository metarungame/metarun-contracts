require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require('hardhat-deploy-ethers');

require('./tasks/parse-csv-to-json.js');
require('./tasks/get-balances.js');
require('./tasks/summarize-balances.js');
require('./tasks/set-balances.js');
require('./tasks/mint-tokens.js');
require('solidity-coverage')

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
      url: 'https://rpc-mainnet.maticvigil.com',
      accounts,
      chainId: 137,
      live: true,
      saveDeployments: true,
      gasPrice: 30000000000
    },
    mumbai: {
      url: 'https://matic-mumbai.chainstacklabs.com/',
      accounts,
      chainId: 80001,
      live: true,
      saveDeployments: true,
      gasPrice: 2000000000,
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
    }
  },
};
