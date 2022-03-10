module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "CompanyReserve";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = hour * 24;
  const month = 30 * day;
  const lockBps = 0;
  const vestBps = 10000; // entirely vested
  const lockClaimTime = Date.parse("2022-03-12T00:00:00+00:00") / 1000;
  const vestStart = lockClaimTime;
  const vestDuration = 48 * month;
  const vestInterval = month;
  const receiver = "0x560b253841DaE6C13de2D45d51a45377FC7A840A";
  const amount = parseEther("100000000");

  vesting = await deploy(vestingContractName, {
    from: deployer,
    args: [token.address, lockBps, vestBps, lockClaimTime, vestStart, vestDuration, vestInterval],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
  console.log(vestingName, "vesting address:", vesting.address);

  await execute("MetarunToken", { from: deployer, log: true }, "mint", deployer, amount);

  await execute("MetarunToken", { from: deployer, log: true }, "approve", (await deployments.get(vestingContractName)).address, amount);

  await execute(vestingContractName, { from: deployer, log: true }, "setAllocation", receiver, amount);

  let balanceOnVesting = await read("MetarunToken", "balanceOf", vesting.address);
  console.log("Resulting balance on vesting contract", vestingName, ":", formatEther(balanceOnVesting), "MRUN");
};

module.exports.tags = ["VestingCompanyReserve"];
module.exports.dependencies = ["MetarunToken"];
