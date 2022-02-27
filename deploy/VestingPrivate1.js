module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Private1";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = hour * 24;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const lockBps = 300; // 3%
  const vestBps = 9700; // 97%
  const lockClaimTime = tge + 1 * hour;
  const vestStart = Date.parse("2022-03-28T15:00:00+00:00") / 1000; // TGE + 1 month
  const vestDuration = 12 * month;
  const vestInterval = day;
  

  let allocations = [];

  allocations.push(["0x05a070925BD1bb04d5db16C8fd76e86768721c6c", "13333333.33"]);
  allocations.push(["0x4a5BB1c9347A0d4F7e06a29239162f03647d9232", "3333333.33"]);
  allocations.push(["0xcEd29BA48490C51E4348e654C313AC97762beCCC", "3333333.33"]);
  allocations.push(["0x3f7442eD1D52923D920E2b8e103a2Cd3C18D8F86", "5000000.00"]);
  allocations.push(["0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07", "2000000.00"]);
  allocations.push(["0x17ec047622C000Df03599026A3B39871EC9384DB", "3333333.33"]);
  allocations.push(["0x93f99d41CDD698C19C5D4baA978970977A223938", "1333333.33"]);
  allocations.push(["0xfb4334A5704e29DF37efc9F16255759670018D9A", "3333333.33"]);
  allocations.push(["0xa29B56729C9a2F0bcCbD46eacf7DF7C07D9E2f6E", "1000000.00"]);
  allocations.push(["0xa50f89381301Decb11F1918586f98c5f2077e3Ca", "6666666.66"]);
  allocations.push(["0xE390f8c5aD03746723D7c2a4Fd735d6895025AE4", "2666666.66"]);
  allocations.push(["0x2855D87B811db73FbaB1B7F65119Cd9F98Bb9BF8", "5000000.00"]);
  allocations.push(["0x65d2C76d45f8Ad43F1CeaD64751B6a1e00E391BF", "2666666.66"]);
  allocations.push(["0x309D3522F7C3a4fe6AC6bb8A2f3916d24C643DF7", "1666666.66"]);
  allocations.push(["0xE448f88BDD86658308994dE3c90a473F04ABb4D4", "3333333.33"]);
  allocations.push(["0xFBdd717FBaBB137A645dE993337C0090b0AB9739", "3333333.33"]);
  allocations.push(["0x815BEe06404b43db6958a6C3f5514C34a3BA67f4", "3333333.33"]);
  allocations.push(["0x4bA5Ca72C0d647eF13c7c6903199BD3dB7Bc6f9f", "2666666.66"]);
  allocations.push(["0x377374d7cD5041e058d7bD584A15CC3A62CbBd4B", "1666666.66"]);
  allocations.push(["0x004d6377fdc00b1934f9e00C76442A51a908117C", "2000000.00"]);
  allocations.push(["0xFdAf21Cf5A98DfF4Cd9050114999Ec17995aef43", "1666666.66"]);
  allocations.push(["0x1AD0E68302a348888fD7fEFe8b677b46bBF6e9aa", "6666666.66"]);
  allocations.push(["0x71d1f0a05F82c0EBd02b8704E3d2337b517a6B3A", "1000000.00"]);
  allocations.push(["0x505Ffa6194f6e443b86F2028b2a97A588c17b962", "1333333.33"]);
  allocations.push(["0x8147cb56fef46b8cfaa883c55584de5ecdaad776", "3333333.33"]);
  allocations.push(["0x824651A8c864d70756C344968d520B1393924929", "4666666.66"]);
  allocations.push(["0xAa92521387Df9cf483F0C3e0e6f5424e9998316f", "1666666.66"]);
  allocations.push(["0xbafee8FD1331a26088183222Edb4160462631665", "66666.66"]);
  allocations.push(["0xB32B84A193Ee43a62BD48A7Cc9Ae1090a38d2654", "133333.33"]);
  allocations.push(["0xE14B74214082A0AC923c0c1D045c1D8042709a90", "33333.33"]);
  allocations.push(["0x9859718Db7CBF960C8189A4a2103dE404700215F", "66666.66"]);
  allocations.push(["0xCb4aD595c128ee3699168c0e5B6395E6722d57d4", "66666.66"]);
  allocations.push(["0x7b88aD278Cd11506661516E544EcAA9e39F03aF0", "140000.00"]);
  allocations.push(["0x6107F283EC9512DD9992e544be42370C51Fce27D", "90000.00"]);
  allocations.push(["0x74Ae77A0d62de7f2c65FC326325e91a7754aB4d4", "293333.13"]);
  allocations.push(["0x4DF07083cB8ad1c8601Dba43fdc113e68ef31A88", "3333333.33"]);
  allocations.push(["0xA6C8a8D5131C102D1859627Ee5EC151Ed942B7Ee", "333333.33"]);
  allocations.push(["0x333eEA08021a9c2dcd3876cF534D65F845A09921", "3333333.33"]);
  allocations.push(["0xD4d0487f1fEAAf7F13887B52b3179bEAdABAFCF4", "1333333.33"]);
  allocations.push(["0xc2511c232bfcCfAD4048d51920da004cF17db0b2", "6666666.66"]);
  allocations.push(["0x6b63BE14d2A7Ae154d434065C0Be25D0b5D381cd", "3333333.33"]);

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

module.exports.tags = ["VestingPrivate1"];
module.exports.dependencies = ["MetarunToken"];
