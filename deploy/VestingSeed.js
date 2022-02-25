module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Seed";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = hour * 24;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const lockBps = 250; // 2.5$
  const vestBps = 9750; // 97.5%
  const lockClaimTime = tge + 1 * hour;
  const vestStart = Date.parse("2022-04-28T15:00:00+00:00") / 1000; // TGE + 2 months
  const vestDuration = 18 * month;
  const vestInterval = day;
  

  let allocations = [];

  allocations.push(["0x5304B8dCbBCD77aFE3371B8d94A46cdE3bbE2aC1", "25000000"]);
  allocations.push(["0x05a070925BD1bb04d5db16C8fd76e86768721c6c", "15625000"]);
  allocations.push(["0x4f898413147EA72256440Ed17D88059F968FeFea", "10000000"]);
  allocations.push(["0xb61c34f3D1297990da7FeeFbbFd65f2689d4EB73", "6250000"]);
  allocations.push(["0x52182B6Efc51471491C0E69bFAF404B075B06F4c", "6250000"]);
  allocations.push(["0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07", "5000000"]);
  allocations.push(["0x93f99d41CDD698C19C5D4baA978970977A223938", "10000000"]);
  allocations.push(["0x2855D87B811db73FbaB1B7F65119Cd9F98Bb9BF8", "6250000"]);
  allocations.push(["0x4085e9Fb679dD2f60C2E64afe9533107Fa1c18F2", "6250000"]);

  let totalAmount = ethers.BigNumber.from("0");
  for (let i = 0; i < allocations.length; i++) {
    let amount = ethers.utils.parseEther(allocations[i][1]);
    totalAmount = totalAmount.add(amount);
  }

  let encodedAllocations = [];
  const abiEncoder = new ethers.utils.AbiCoder();
  for (let i = 0; i < allocations.length; i++) {
    let beneficiary = allocations[i][0];
    let amount = ethers.utils.parseEther(allocations[i][1]);
    encodedAllocations.push(abiEncoder.encode(["address", "uint256"], [beneficiary, amount]));
  }

  console.log("Parameters for", vestingName, "Vesting:")
  console.log("  Total allocation:", ethers.utils.formatEther(totalAmount), "MRUN");
  console.log("    Locked:", formatEther(totalAmount.mul(lockBps).div(10000)), "MRUN or", lockBps/100, "% of total allocation");
  console.log("      lockClaimTime:", new Date(lockClaimTime * 1000));
  console.log("    Vested:", formatEther(totalAmount.mul(vestBps).div(10000)), "MRUN or", vestBps/100, "% of total allocation");
  console.log("      vestStart:", new Date(vestStart * 1000));
  console.log("      vestInterval:", vestInterval, "s or", vestInterval / day, "days");
  console.log("      vestDuration:", vestDuration, "s or", vestDuration / day, "days or", vestDuration / day / 30, "months");
  console.log("      vestEnd:", new Date((vestStart + vestDuration) * 1000));
  console.log("  Recipients:", allocations.length);

  vesting = await deploy(vestingContractName, {
    from: deployer,
    args: [token.address, lockBps, vestBps, lockClaimTime, vestStart, vestDuration, vestInterval],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
  console.log(vestingName, "vesting address:", vesting.address);

  await execute("MetarunToken", { from: deployer, log: true }, "mint", deployer, totalAmount);

  await execute("MetarunToken", { from: deployer, log: true }, "approve", (await deployments.get(vestingContractName)).address, totalAmount);

  await execute(vestingContractName, { from: deployer, log: true }, "setAllocations", encodedAllocations);

  let balanceOnVesting = await read("MetarunToken", "balanceOf", vesting.address);
  console.log("Planned to allocate for ", vestingName, ":", formatEther(balanceOnVesting), "MRUN");
  console.log("Actually allocated for ", vestingName, ":", formatEther(totalAmount), "MRUN");
};

module.exports.tags = ["VestingSeed"];
module.exports.dependencies = ["MetarunToken"];
