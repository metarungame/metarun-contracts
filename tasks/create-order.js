const { task } = require("hardhat/config");
const axios = require('axios');

const API_HOST = "http://127.0.0.1:8000/api/orders/"

task("create-sell-order", "Create a sell order")
  .addParam("addressToken")
  .addParam("exchangeContract")
  .addParam("tokenId")
  .addParam("amount")
  .addParam("price")
  .addParam("privateKey")
  .setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers;
    const metarunCollectionAddress = taskArgs.addressToken;
    const metarunCollection = await ethers.getContractAt("MetarunCollection", metarunCollectionAddress);

    const exchangeContract = taskArgs.exchangeContract

    const domain = {
      name: "metarun.game",
      version: "0.1",
      chainId: "80001",
      verifyingContract: exchangeContract,
    };

    const types = {
      SellOrder: [
        {name: "seller", type: "address"},
        {name: "tokenId", type: "uint256"},
        {name: "amount", type: "uint256"},
        {name: "expirationTime", type: "uint256"},
        {name: "price", type: "uint256"},
        {name: "salt", type: "uint256"},
      ],
    };

    const date = new Date();
    const wallet = new ethers.Wallet(taskArgs.privateKey)
    const sellOrder = {
      seller: wallet.address,
      tokenId: taskArgs.tokenId,
      amount: taskArgs.amount,
      expirationTime: date.setDate(date.getDate() + 365),
      price: taskArgs.price,
      salt: 999,
    };

//    const td = await ethers.utils._TypedDataEncoder.encode(domain, types, sellOrder)
    console.log('address:', wallet.address)
    const signature = await wallet._signTypedData(domain, types, sellOrder)
    console.log('signature', signature)
    await axios.post(API_HOST, {
      "tokenId": sellOrder.tokenId,
      "amount": sellOrder.amount,
      "price": sellOrder.price,
      "seller": wallet.address,
      "expirationTime": sellOrder.expirationTime,
      "signature": signature,
      "salt": sellOrder.salt
    })
    .then((res) => {
      console.log(`Status: ${res.status}`);
      console.log('Body: ', res.data);
    }).catch((err) => {
      console.error(err);
    });
});
