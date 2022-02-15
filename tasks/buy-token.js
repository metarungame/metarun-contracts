const { task } = require("hardhat/config");
const axios = require("axios");

task("buy-token", "Buy a token on an existing order")
  .addParam("orderId")
  .addParam("exchangeContract")
  .addParam("privateKey")
  .setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers;
    const metarunExchange = await ethers.getContractAt("MetarunExchange", taskArgs.exchangeContract);

    console.log(taskArgs.orderId);
    const url = `http://127.0.0.1:8000/api/orders/${taskArgs.orderId}/`
    console.log(taskArgs.exchangeContract);
    console.log(taskArgs.privateKey);

    let data;
    await axios(url)
    .then((res) => {
      console.log(`Status: ${res.status}`);
      data = res.data;
    }).catch((err) => {
      console.error(err);
    });

    delete data.id
    delete data.creationTime
    delete data.hash

    const signature = data.signature
    delete data.signature

    console.log(data)
    console.log(signature)


    const wallet = new ethers.Wallet(taskArgs.privateKey, ethers.provider)
    const options = {value: ethers.BigNumber.from(data.price)}
    const transaction = await metarunExchange.connect(wallet).buy(data, signature, options);
    await transaction.wait();

});
