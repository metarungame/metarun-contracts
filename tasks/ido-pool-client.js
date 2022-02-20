const fs = require('fs')

const { task } = require('hardhat/config');

const idoPoolArtifact = require("../contracts/artifacts/IDOPool.json");
const idoAddress = "0xd5Bd5013cfc95B679058F58071fdbB492e5C8049"

task('idoPoolClient', 'Execute IDO actions for manual testing')
  .addOptionalParam('amount', 'Amount of MATIC in dotted decimal 123.45')
  .addParam('action', '`pay` or `claim` or `timeForward` or `release`')
  .addOptionalParam('time', 'Go to time. Format: 2022-02-22T16:00:00+00:00')
  .setAction(async(taskArgs, hre) => {
    const ethers = hre.ethers;
    const ido = await ethers.getContractAt(idoPoolArtifact.abi, idoAddress)
    const signer = (await hre.ethers.getSigners())[0]
    console.log("Signer:", signer.address)
    console.log("IDOPool:", ido.address)
    const token = await ethers.getContract("MetarunToken")
    console.log("MRUN token:", token.address)
    console.log("MRUN balance before:", ethers.utils.formatEther(await token.balanceOf(signer.address)))

    if ( taskArgs.action === "timeForward" ) {
      const to = Date.parse(taskArgs.time)/1000
      console.log("Forwarding to time:", taskArgs.time, to)
      await hre.ethers.provider.send("evm_setNextBlockTimestamp", [to])
    }

    if ( taskArgs.action === "pay" ) {
      const amount = ethers.utils.parseEther(taskArgs.amount)
      console.log("ETH Amount:", amount.toString(), taskArgs.amount)
      tx = await ido.pay({value: amount})
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

    if ( taskArgs.action === "claim" ) {
      tx = await ido.claim()
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

    if ( taskArgs.action === "release" ) {
      tx = await ido.release(signer.address)
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

    if ( taskArgs.action === "withdrawNotSoldTokens" ) {
      tx = await ido.withdrawNotSoldTokens()
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

    if ( taskArgs.action === "withdrawFunds" ) {
      tx = await ido.withdrawFunds()
      console.log("Sent Tx:", tx.hash);
      await tx.wait();
    }

    console.log("MRUN balance after:", ethers.utils.formatEther(await token.balanceOf(signer.address)))
});

