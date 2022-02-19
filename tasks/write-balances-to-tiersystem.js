const fs = require('fs')

const { task } = require('hardhat/config');

const tierSystemArtifact = require("../contracts/artifacts/TierSystem.json");

task('writeBalancesToTierSystem', 'submit balances to TierSystem contract')
  .addParam('jsonPath', '.json file with holders and balances')
  .addParam('contractAddress', 'TierSystem contract address')
  .addParam('balanceListLength', 'the length of the balances submitted in a signle Tx')
  .setAction(async(taskArgs, hre) => {
    const ethers = hre.ethers;
    const tierSystemContract = await ethers.getContractAt(tierSystemArtifact.abi, taskArgs.contractAddress)

    const holders = JSON.parse(fs.readFileSync(taskArgs.jsonPath))
    let totalBalances = ethers.BigNumber.from("0")
    let totalHolders = 0
    console.log("Splitting to bundles by", taskArgs.balanceListLength, "addresses")

    const bundleBalances = []

    let addresses = []
    let balances = []

    for (let holder in holders) {
      addresses.push(holder)
      balances.push(holders[holder])
      totalBalances = totalBalances.add(ethers.BigNumber.from(holders[holder]))
      totalHolders += 1

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
    console.log("Total holders:", totalHolders)
    console.log("Total bundles:", bundleBalances.length)
    console.log("Total sum of balances:", hre.ethers.utils.formatEther(totalBalances))
    console.log("Now submit txes")

    for (let bundle of bundleBalances) {
      tx = await tierSystemContract.addBalances(bundle.addresses, bundle.balances)
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

});

