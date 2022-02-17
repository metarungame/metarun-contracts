const fs = require('fs')

const { task } = require('hardhat/config');

function getHolders(path) {
  return JSON.parse(fs.readFileSync(path))
}

task('summarizeBalances', 'summarize of balances from networks: 1, 56, 250')
  .addParam('jsonPathEthereum', '.json file with holders from ethereum')
  .addParam('jsonPathBsc', '.json file with holders from bsc')
  .addParam('jsonPathFtm', '.json file with holders from frm')
  .setAction(async(taskArgs, hre) => {
    console.log('start summarize of balances')

    const ethers = hre.ethers;

    const filesWithBalances = [taskArgs.jsonPathEthereum, taskArgs.jsonPathBsc, taskArgs.jsonPathFtm]
    const generalBalances = {}

    for (let file of filesWithBalances) {
      console.log('getHolders from:', file)
      let holders = getHolders(file)

      console.log('Got', Object.keys(holders).length)

      for (let holder in holders) {
        let balance = holders[holder].balance
        if (!(holder in generalBalances)) {
          generalBalances[holder] = balance
        }
        else {
          generalBalances[holder] = ethers.BigNumber.from(
            generalBalances[holder]
          ).add(ethers.BigNumber.from(balance)).toString()
        }
      }
    }

    data = JSON.stringify(generalBalances);
    const jsonFileName = 'summarize-of-balances.json'
    fs.writeFileSync(jsonFileName, data, function(err) {
      if (err) {
        console.log(err);
      }
    });
    console.log('save summarize of balances from networks: 1, 56, 250 to', jsonFileName);
});
