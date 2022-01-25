const fs = require('fs')

const { task } = require('hardhat/config');

const tierSystemArtifact = require("../contracts/artifacts/TierSystem.json");

const LIMIT = 800

task('setBalances', 'set balances to TierSystem contract')
  .addParam('jsonPath', '.json file with holders and balances')
  .addParam('contractAddress', 'TierSystem contract address')
  .addParam('balanceListLength', 'the length of the balance list that can be passed as an argument')
  .setAction(async(taskArgs, hre) => {
    console.log('start set balances to TierSystem contract')

    const holders = JSON.parse(fs.readFileSync(taskArgs.jsonPath))

    const bundleBalances = []

    let addresses = []
    let balances = []

    for (let holder in holders) {
      addresses.push(holder)
      balances.push(holders[holder])

      if (balances.length == taskArgs.balanceListLength) {
        bundleBalances.push(
          {
            addresses: addresses.slice(),
            balances: balances.slice()
          }
        )
        addresses = []
        balances = []
      }
    }

    if (balances != false) {
      bundleBalances.push(
        {
          addresses: addresses.slice(),
          balances: balances.slice()
        }
      )
    }

    const ethers = hre.ethers;
    const tierSystemContract = await ethers.getContractAt(tierSystemArtifact.abi, taskArgs.contractAddress)

    for (let bundle of bundleBalances) {
      tx = await tierSystemContract.addBalances(bundle.addresses, bundle.balances)
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

});

