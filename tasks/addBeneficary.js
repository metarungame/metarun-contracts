const { task } = require("hardhat/config");

task("addbeneficary", "add-beneficary").setAction(async (taskArgs, hre) => {
  const amount = hre.ethers.utils.parseEther("0.005");
  const start = 1642000000;
  const interval = 1;
  const duration = 60 * 60 * 24 * 30;

  const ethers = hre.ethers;

  const { deployer } = await getNamedAccounts();
  const beneficiariesArr = [
    "0xDeaD00000000000000000000000000000000BEEf",
    "0xafbb6be5e9207b5eefbfec7843e06ac93ad61676",
    "0x7ca1e583b03bc6b64848d1b10c1b528ef5383899",
    "0xBA41Aa76c47fa2CfAd8cA64E2941d4ba62b7675d",
    "0x284dc79a455e73db95570a50bc9e74120544d536",
    "0x2fe6cea6893f97834d59e7fb963e88d33708093c",
    "0x8b3af4add6f3b8d85d5fb62dcbc5e2de26ac3cc3",
  ];

  const chainId = await hre.getChainId();
  const TokenVesting = await ethers.getContract("TokenVesting");

  console.log(
    await (
      await TokenVesting.createVesting(
        beneficiariesArr[1],
        start,
        interval,
        duration,
        amount
      )
    ).wait()
  );
});
