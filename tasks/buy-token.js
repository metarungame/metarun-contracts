const { task } = require("hardhat/config");
const axios = require("axios");

task("buy-token", "Buy a token on an existing order")
  .addParam("orderId")
  .addParam("exchangeAddress")
  .addParam("privateKey")
  .setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers;
    const metarunExchange = await ethers.getContractAt("MetarunExchange", taskArgs.exchangeAddress);

    const url = `http://localhost:8000/api/orders/${taskArgs.orderId}/`
    console.log("Get order from", url);
    let data;
    await axios(url)
    .then((res) => {
      console.log(`Status: ${res.status}`);
      data = res.data;
    }).catch((err) => {
      console.error(err);
    });

    const signature = data.signature
    const sellOrder = {
      seller: data.ownership.holder,
      tokenId: data.ownership.kind.contractTokenId,
      amount: data.amount,
      expirationTime: data.expirationTime,
      price: data.price,
      salt: data.salt,
    };

    console.log("SellOrder:", sellOrder);
    console.log("Buy on the market:", taskArgs.exchangeAddress);
    const wallet = new ethers.Wallet(taskArgs.privateKey, ethers.provider)
    const options = {value: ethers.BigNumber.from(data.price)}
    const transaction = await metarunExchange.connect(wallet).buy(sellOrder, signature, options);
    const th = await transaction.wait();
    console.log("th:", th.transactionHash);
});
