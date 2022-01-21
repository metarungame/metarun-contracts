module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute } = deployments;
  const { parseEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();


  const totalAmount = ethers.utils.parseEther("550000");
  const interval = 60 * 60; // hourly
  const startTimestamp = 1642784400 // 2022-01-21T17:00:00+00:00
  const shortVestingFinishTimestamp = 1642870800 // 2022-01-22T17:00:00+00:00
  const shortDuration = shortVestingFinishTimestamp - startTimestamp;
  const longVestingFinishTimestamp = 1642957200 // 2022-01-23T17:00:00+00:00
  const longDuration = longVestingFinishTimestamp - startTimestamp; 

  const beneficiaries = [];
  beneficiaries.push(["0x00fe7C821d66368bfC78753Baf9B7639D708F662", startTimestamp, shortDuration, parseEther("100000")]);
  beneficiaries.push(["0x8889Fc00799C3255bF6162917D62acaC9a37F920", startTimestamp, shortDuration, parseEther("100000")]);
  beneficiaries.push(["0x297Df83B933eE82ff1FfF4004fCcF7bC50e5e18D", startTimestamp, shortDuration, parseEther("100000")]);
  beneficiaries.push(["0x1179d39f73080d9dDB22812223614428AB1633b5", startTimestamp, longDuration, parseEther("100000")]);
  beneficiaries.push(["0x97F19E982A457A327f58602F5d48f5B63bf6159a", startTimestamp, longDuration, parseEther("100000")]);
  beneficiaries.push(["0x2Cd371c8Dbf0a9F69cf9d0f8b15881f5D524cC80", startTimestamp, longDuration, parseEther("50000")]);

  const vesting = await deployments.get("TokenVesting");

  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'mint',
    deployer,
    totalAmount
  );

  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'approve',
    vesting.address,
    totalAmount
  );

  for (var i = 0; i < beneficiaries.length; i++) {
    let beneficiary = beneficiaries[i][0];
    let start = beneficiaries[i][1];
    let duration = beneficiaries[i][2];
    let amount = beneficiaries[i][3];
    console.log("Adding Beneficiary:", beneficiary);
    await execute(
      'TokenVesting',
      { from: deployer, log: true },
      'createVesting',
      beneficiary,
      start,
      interval,
      duration,
      amount
    );
  }
};

module.exports.tags = ["VestingAddBeneficiaries"];
module.exports.dependencies = ["MetarunToken", "TokenVesting"];
