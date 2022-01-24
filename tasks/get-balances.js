const fs = require('fs')

const { task } = require('hardhat/config');

const ERC20Basic = require("../contracts/artifacts/ERC20Basic.json");

const PUBLIC_TIER_AMOUNT = 0

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function updatedBalances(path, holders) {

  const data = JSON.stringify(holders);
  fs.writeFileSync(path, data, (err) => {
    if (err) {
      throw err;
    }
  });
  console.log('updated json file with necessary balances:', path)
}

task('getBalances', 'get correct balances using .csv with holders')
  .addParam('jsonPath', '.json file with holders')
  .addParam('tokenAddress', 'Token Address')
  .setAction(async(taskArgs, hre) => {
    console.log('start receiving correct balances')

    const ethers = hre.ethers;
    const tokenERC20 = await ethers.getContractAt(ERC20Basic.abi, taskArgs.tokenAddress)
    let holders = JSON.parse(fs.readFileSync(taskArgs.jsonPath))
    const holdersNotUpdated = Object.fromEntries(
      Object.entries(holders).filter(([key, value]) => value.correctBalance === false)
    )

    for (let holderAddress in holdersNotUpdated) {
      try {
        balance = await tokenERC20.balanceOf(holderAddress)
        console.log('holderAddress:', holderAddress, 'balance:', balance.toString())
        if (balance > PUBLIC_TIER_AMOUNT) {
          holders[holderAddress].previousBalance = holdersNotUpdated[holderAddress].balance
          holders[holderAddress].balance = balance.toString()
          holders[holderAddress].correctBalance = true
        } else {
          delete holders[holderAddress]
        }
      }
      catch (err){
        updatedBalances(taskArgs.jsonPath, holders)
        throw err
      }
      await sleep(100)
    }
  updatedBalances(taskArgs.jsonPath, holders)
});
