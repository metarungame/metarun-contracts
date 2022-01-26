const { task } = require("hardhat/config");

task("addbeneficary", "add-beneficary").setAction(async (taskArgs, hre) => {
  const ethers = hre.ethers;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();

  const vesting = await deployments.get("TokenVesting");

  const totalAmount = ethers.utils.parseEther("1000000000");

  const DAY = 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;
  // planned date of Token Generation Event
  const tge = Date.parse("2022-02-10T00:00+00:00") / 1000;

  const MetarunToken = await ethers.getContract("MetarunToken");

  console.log(await (await MetarunToken.mint("0x1179d39f73080d9dDB22812223614428AB1633b5", deployer, totalAmount)).wait());

  console.log(await (await MetarunToken.approve("0x1179d39f73080d9dDB22812223614428AB1633b5", vesting, totalAmount)).wait());

  const TokenVesting = await ethers.getContract("TokenVesting");

  console.log(
    await (
      await TokenVesting.createVesting("0x1179d39f73080d9dDB22812223614428AB1633b5", tge, DAY, 3 * MONTH, totalAmount.mul(15).div(100))
    ).wait()
  );
});
