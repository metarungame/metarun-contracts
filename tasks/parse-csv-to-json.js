const csv = require('csvtojson')
const fs = require('fs')

const { task } = require('hardhat/config');

task('parseCSVtoJSON', 'convert .csv to .json')
  .addParam('csvPath', '.csv file with holders')
  .setAction(async(taskArgs, hre) => {
    console.log('start convert')
    const holders = await csv().fromFile(taskArgs.csvPath);
    if (holders.length === 0) {
      throw 'holders not found in csv file'
    }
    let data = {}
    for (let i in holders) {
      let holderAddress = holders[i]['HolderAddress']
      data[holderAddress] = {
        balance: holders[i]['Balance'],
        correctBalance: false
      }
    }
    data = JSON.stringify(data);
    const jsonFileName = taskArgs.csvPath.replace('.csv', '.json')
    fs.writeFileSync(jsonFileName, data, function(err) {
      if (err) {
        console.log(err);
      }
    });
    console.log('converted .csv to .json', jsonFileName);
});
