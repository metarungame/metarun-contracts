module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Private2";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = hour * 24;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const lockBps = 400; // 4%
  const vestBps = 9600; // 96%
  const lockClaimTime = tge + 1 * hour;
  const vestStart = Date.parse("2022-03-28T15:00:00+00:00") / 1000; // TGE + 1 month
  const vestDuration = 12 * month;
  const vestInterval = day;
  

  let allocations = [];

  allocations.push(["0x05a070925BD1bb04d5db16C8fd76e86768721c6c", "5000000.00"]);
  allocations.push(["0x4a5BB1c9347A0d4F7e06a29239162f03647d9232", "2500000.00"]);
  allocations.push(["0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07", "1500000.00"]);
  allocations.push(["0xe67671f92D7B4af4c45daEF25d921B04818E87C5", "1000000.00"]);
  allocations.push(["0x377374d7cD5041e058d7bD584A15CC3A62CbBd4B", "1250000.00"]);
  allocations.push(["0x4bA5Ca72C0d647eF13c7c6903199BD3dB7Bc6f9f", "2250000.00"]);
  allocations.push(["0x7b2e52bd6E1cE0ED1dD99F790571F658Df1e8ea5", "2000000.00"]);
  allocations.push(["0x309D3522F7C3a4fe6AC6bb8A2f3916d24C643DF7", "1875000.00"]);
  allocations.push(["0xa50f89381301Decb11F1918586f98c5f2077e3Ca", "1000000.00"]);
  allocations.push(["0xFdAf21Cf5A98DfF4Cd9050114999Ec17995aef43", "1250000.00"]);
  allocations.push(["0x815BEe06404b43db6958a6C3f5514C34a3BA67f4", "1500000.00"]);
  allocations.push(["0xdff0C80e60E16778C0ea13642A2E2b5774f18664", "3750000.00"]);
  allocations.push(["0x505Ffa6194f6e443b86F2028b2a97A588c17b962", "2000000.00"]);
  allocations.push(["0x004d6377fdc00b1934f9e00C76442A51a908117C", "1500000.00"]);
  allocations.push(["0x0051437667689B36f9cFec31E4F007f1497c0F98", "1000000.00"]);
  allocations.push(["0xB881E298B51Bd870BDF064EaCDE86deA705009cC", "500000.00"]);
  allocations.push(["0x71d1f0a05F82c0EBd02b8704E3d2337b517a6B3A", "750000.00"]);
  allocations.push(["0x00E4B1C3A9F9EF618ECA6A88D4B461E1499D61D4", "2000000.00"]);
  allocations.push(["0x86ec8B7982C5fBB64db7e2dc496d91a375BEe747", "250000.00"]);
  allocations.push(["0xD4d0487f1fEAAf7F13887B52b3179bEAdABAFCF4", "1500000.00"]);
  allocations.push(["0xEFa10ed446E41a1815b20B0108e35fbd74C2AD77", "500000.00"]);
  allocations.push(["0x4553eD5d8d3731E629f67BD86abd021175F31848", "1000000.00"]);
  allocations.push(["0x50899582199c06d5264edDCD12879E5210783Ba8", "1000000.00"]);
  allocations.push(["0x1AD0E68302a348888fD7fEFe8b677b46bBF6e9aa", "7500000.00"]);
  allocations.push(["0xc2511c232bfcCfAD4048d51920da004cF17db0b2", "5000000.00"]);
  allocations.push(["0xAB7618A71CfD7f62be30bB977f3C3F6198721299", "750000.00"]);
  allocations.push(["0x8175fbBADEBb294FE4e8175e180943A86008b06B", "1000000.00"]);
  allocations.push(["0x0a3F645eAe52A4889B8dBc6C4DFcde02A197e6b7", "2250000.00"]);
  allocations.push(["0xeF1ff94f0Fd249139A74672988ebA5D4586A2FeB", "750000.00"]);
  allocations.push(["0x371A06B147f57987e7837D86Bc20E095a5F0807A", "350000.00"]);

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

module.exports.tags = ["VestingPrivate2"];
module.exports.dependencies = ["MetarunToken"];
