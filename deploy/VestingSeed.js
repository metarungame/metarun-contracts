module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Seed";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = 24 * hour;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const start = tge - day * 14; // 2.5% unlocked at TGE+1hr
  const cliff = tge + 1 * hour;
  const interval = 1 * day;
  const duration = 18 * month; // 100% / 5.42% per month ~= 18 months

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

  console.log("Parameters for", vestingName, "Vesting:")
  console.log("  Start:", new Date(start * 1000));
  console.log("  Cliff:", new Date(cliff * 1000));
  console.log("  End:", new Date((start + duration) * 1000));
  console.log("  Interval:", interval, "s or", interval / day, "days");
  console.log("  Duration:", duration, "s or", duration/day, "days or", duration / day / 30, "months");
  console.log("  Recipients:", allocations.length);

  let totalAmount = ethers.BigNumber.from("0");
  for (let i = 0; i < allocations.length; i++) {
    let amount = ethers.utils.parseEther(allocations[i][1]);
    totalAmount = totalAmount.add(amount);
  }
  console.log("  Allocation:", ethers.utils.formatEther(totalAmount));

  tokenVesting = await deploy(vestingContractName, {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
  console.log(vestingName, "vesting address:", tokenVesting.address);

  await execute("MetarunToken", { from: deployer, log: true }, "mint", deployer, totalAmount);

  await execute("MetarunToken", { from: deployer, log: true }, "approve", (await deployments.get(vestingContractName)).address, totalAmount);

  for (let i = 0; i < allocations.length; i++) {
    let recipient = allocations[i][0];
    let amount = ethers.utils.parseEther(allocations[i][1]);
    console.log(" Vesting for", recipient, ethers.utils.formatEther(amount));

    let vested = await read(vestingContractName, "getVesting", recipient);
    if (!vested[0].eq("0")) {
      console.log("Already vested?", vested[0].toString());
      return;
    }

    await execute(vestingContractName, { from: deployer, log: true }, "createVesting", recipient, start, cliff, interval, duration, amount);
  }

  let balanceOnVesting = await read("MetarunToken", "balanceOf", tokenVesting.address);
  console.log("Planned to allocate for ", vestingName, ":", formatEther(balanceOnVesting), "MRUN");
  console.log("Actually allocated for ", vestingName, ":", formatEther(totalAmount), "MRUN");
};

module.exports.tags = ["VestingSeed"];
module.exports.dependencies = ["MetarunToken"];
