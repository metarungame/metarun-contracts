module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Tosdis";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = hour * 24;
  const month = 30 * day;
  const tge = Date.parse("2022-02-27T13:00:00+00:00") / 1000;
  const lockBps = 1000; // 10%
  const vestBps = 9000; // 90%
  const lockClaimTime = tge + 1 * hour;
  const vestStart = lockClaimTime + 1;
  const vestDuration = 9 * hour;
  const vestInterval = hour;
  

  let allocations = [];

  allocations.push(["0x3D60f464A603A734eb402a53850e3FB8Be73A5d7", "36496093583749308397122"]); // 36496.09358374931 MRUN)
  allocations.push(["0xE013204f6C5d7031C321aeDB033bD79d697E1308", "11611215175806836691425"]); // 11611.215175806836 MRUN)
  allocations.push(["0xF5073a1F5e53B24ED26fAD6DD05f7e5E73032A87", "10207682145438042139707"]); // 10207.682145438042 MRUN)
  allocations.push(["0x16c4ea0C1752fdA7724b0334c9a2419E94F12eED", "10207682145438042139706"]); // 10207.682145438042 MRUN)
  allocations.push(["0xab297355EC085D8D8a0b311FcDb45a763B4a0aE0", "70749060940093510789002"]); // 70749.0609400935 MRUN)
  allocations.push(["0x618705cf013296EF16E235F18D6d38AcbB6b9CFd", "13999185918093736387395"]); // 13999.185918093737 MRUN)
  allocations.push(["0xD3Dde4c6C941d4c45fAe24B4974732AB91b656c9", "48799865728104467496349"]); // 48799.865728104465 MRUN)
  allocations.push(["0xe22c86d319875A65c659a65667988441Dec87FaA", "29280088525168264699981"]); // 29280.088525168263 MRUN)
  allocations.push(["0xe249f46770e393BaDa8A8466AF15B005886fa9C6", "14074193292969171829708"]); // 14074.193292969172 MRUN)
  allocations.push(["0x47c02961287b69E997B7A88D605E0b9A8d806e8b", "48763369693569630584647"]); // 48763.36969356963 MRUN)
  allocations.push(["0x2410FC8Bd069Edf114a2638766450541E8A0715b", "53941656038105281523096"]); // 53941.65603810528 MRUN)
  allocations.push(["0xA61aa80AeEFDF398906012585839cDE459677b09", "47945766174387285451106"]); // 47945.76617438728 MRUN)
  allocations.push(["0xbBc48A6d00f0990C5FD9cF1FB8663b0c2dc2fB82", "48800162848762084144350"]); // 48800.162848762084 MRUN)
  allocations.push(["0xC0A5C64375A349930d3d57195f4e4145c67c5915", "139958899029019960723035"]); // 139958.89902901996 MRUN)
  allocations.push(["0xC09f122E0437D0F5c708f068bfAbF1f5bBca46e8", "140000499230876800447489"]); // 140000.4992308768 MRUN)
  allocations.push(["0x95910EfbF5faC0B7715121656c5b62a819540C3a", "139958899029019960723035"]); // 139958.89902901996 MRUN)
  allocations.push(["0xAeb3824DC74fBa983F7a7a9ebe00A84aa680f2b0", "14000024280917171620559"]); // 14000.024280917172 MRUN)
  allocations.push(["0x59ed088F50D0ab3C84bCb85b593E15A2b889f3f0", "6000000000000000000000"]); // 6000.0 MRUN)
  allocations.push(["0x5674740C60ED6E16D00ECA0D38A627C67D34dE9b", "32259300918691821757977"]); // 32259.30091869182 MRUN)
  allocations.push(["0x23306837B4E65FD4AE1f3b5376De0B078d89A89a", "12211562492096744015990"]); // 12211.562492096746 MRUN)
  allocations.push(["0x8FfAdD098cDed71127532bdd1488366577617F07", "120000489999574398229496"]); // 120000.48999957439 MRUN)
  allocations.push(["0xF01534Ec643Ac2f6B7a36B8F4f1F332E33AEaa8F", "40800167808698084184030"]); // 40800.16780869808 MRUN)
  allocations.push(["0x943FD4035F71b9414c6d20155e1e48d45095cA29", "10813156674728543764277"]); // 10813.156674728545 MRUN)
  allocations.push(["0xaDD19B15506aEeAbF2359FF1bd786D5689340A07", "32800000000000000000000"]); // 32800.0 MRUN)
  allocations.push(["0x7d7a643Fd4E864ddfea91f4aa184a63a25F87c5C", "48800169738498112152146"]); // 48800.16973849811 MRUN)
  allocations.push(["0xe9735F69516237969C55Af3851cB05741a6e4437", "48800169738498112152146"]); // 48800.16973849811 MRUN)
  allocations.push(["0x0d7156310e772352Dc18EDEAA173c34bE23bF2d0", "35000000000000000000000"]); // 35000.0 MRUN)
  allocations.push(["0xEDA34c19C9b98BE15204b059DF7CeF25652e4Dd3", "2000000000000000000000"]); // 2000.0 MRUN)
  allocations.push(["0xE63986bf0C914ad162bdAef89c64278982b6660C", "1896000000015168000000"]); // 1896.0000000151679 MRUN)
  allocations.push(["0x52d5737dC992C3D7C8a33DC0f179231E203Bb6c7", "2000000000000000000000"]); // 2000.0 MRUN)
  allocations.push(["0x480c42903321616995A97c6822579fd9114225c1", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0xB979caDDE28E3b53EA7BCA9BEBf5dd4eF321cA67", "2000000000000000000000"]); // 2000.0 MRUN)
  allocations.push(["0x2c75899aC973E2F83B48A3319F451D4DdceB230d", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0x32C7012F82B54b15C2A282B2147ae56B1eA78e1f", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0x4AB43eA2C6d21c922f67c100Fab8b445504f2258", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0xbEC093E2c5289e6BbE7b226C8562eb5609d220Ab", "1959200000015673600000"]); // 1959.2000000156736 MRUN)
  allocations.push(["0x1d1B35475cdf57A0c0dC3E269D32f7A92a42D821", "8000000000000000000000"]); // 8000.0 MRUN)
  allocations.push(["0xaBcB12B0CFC4Bbe4435187837C034Ba062cf9c4E", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0x995297284ff955DeAD370091676dEb26a85DD59C", "8000000000000000000000"]); // 8000.0 MRUN)
  allocations.push(["0x431b5DDB0AcE97eBC3d936403ea25831BaD832B6", "7999995040063999960320"]); // 7999.995040064 MRUN)
  allocations.push(["0x39681136cF912731A38a0C2cecdc6EA79430F414", "2000000000000000000000"]); // 2000.0 MRUN)
  allocations.push(["0x85EF045eD74224F1651E83336871168bA1A97131", "2000000000000000000000"]); // 2000.0 MRUN)
  allocations.push(["0x7fC530B07D5B4cE4D31255a2Ee23aF254Db12932", "20000000000000000000000"]); // 20000.0 MRUN)
  allocations.push(["0xbAD19E37e23Ebb8E91Ad0B7BfdBC193F4010ba2e", "8748828075124792519136"]); // 8748.828075124793 MRUN)
  allocations.push(["0xc3528C3f58840cd229f14ACB2057AE78035D149E", "1999964000015999712000"]); // 1999.9640000159998 MRUN)
  allocations.push(["0x580c57d0AfC937f2B30614f89028192f9394B05B", "7963200000063705600000"]); // 7963.200000063705 MRUN)
  allocations.push(["0x2CD3BCd2C6915f3bdD6296Af24802BCc2d8839b8", "20000000000000000000000"]); // 20000.0 MRUN)
  allocations.push(["0x347F7FC0446d2da75eA4c78A15356b4B31cDB1F8", "20000000000000000000000"]); // 20000.0 MRUN)
  allocations.push(["0xc9E5Ce8908CA6C32c68c9CfDa95849D6281c9D7b", "7999982400063999859200"]); // 7999.982400063999 MRUN)
  allocations.push(["0x928703b4aBF02bCB2A9D82615ED418Ea59750BeB", "19971200000159769600001"]); // 19971.20000015977 MRUN)
  allocations.push(["0x01619C7c897c74AE7Eb8C11a574F2c7125b0023e", "60000000000000000000000"]); // 60000.0 MRUN)
  allocations.push(["0x7593E727Ec5509e1F991C16213950Fc6Fc094B7D", "19592000000156736000001"]); // 19592.000000156735 MRUN)
  allocations.push(["0xC7b6e9Ee3E8b1d8E302C73E7b2002dAe98B589c3", "19750000000158000000001"]); // 19750.000000158 MRUN)
  allocations.push(["0x63cEA820Eb8624d3677EAf42DE29f97cFf44338D", "19750000000158000000001"]); // 19750.000000158 MRUN)
  allocations.push(["0xB881E298B51Bd870BDF064EaCDE86deA705009cC", "20000000000000000000000"]); // 20000.0 MRUN)
  allocations.push(["0x37f6B45f10f716f34533c5bEF92f15c83ab763dF", "20000000000000000000000"]); // 20000.0 MRUN)
  allocations.push(["0x9C3FcfA2175a4c57CA7aed9A1f87E80fCF39b1ae", "772936000006183488000"]); // 772.9360000061835 MRUN)
  allocations.push(["0xb33828740bAc6301cbF5DFC451a87dc6cb98D33D", "8000000000000000000000"]); // 8000.0 MRUN)
  allocations.push(["0x8F6C5455b4879117d29710C9cc61f8D6fB76eC0A", "4742419728466070418852"]); // 4742.4197284660695 MRUN)
  allocations.push(["0xBeF1FeFE4Bb6DDA516E9Af3A3F793d182cf053Bc", "4500000000000000000000"]); // 4500.0 MRUN)
  allocations.push(["0x9240d1Be82B94AC3066f524B770F4c4fD5e45220", "3587214922814078906568"]); // 3587.214922814079 MRUN)
  allocations.push(["0xFB7f3FF95D58743B7F2118f6F831973D91295Cd3", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0x6FC60FBd5A1d03A2578a2e4fd48816AD6859B266", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0x26A490be461932e3aF863171D2f5e096Bff97597", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0xD4208C4e79d5a0C125b5ecCe8c8D7ABb2c00934a", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0x83BbAA1b4B0c42A6432f1fcc94cd72102d4B05a1", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0x47FddD64D784Cf013C9C644ca7aE0a4F78fbf900", "40000486402023432417478"]); // 40000.48640202343 MRUN)
  allocations.push(["0x9fbd3dcD5723A11bcF3E253666307B264F2287f3", "32832136581688179822828"]); // 32832.13658168818 MRUN)
  allocations.push(["0xf5349FE47293C61075Bd0A734AD56d0bD7E9C409", "35796639999878399494141"]); // 35796.639999878396 MRUN)

  let totalAmount = ethers.BigNumber.from("0");
  for (let i = 0; i < allocations.length; i++) {
    let amount = ethers.BigNumber.from(allocations[i][1]);
    totalAmount = totalAmount.add(amount);
  }

  let encodedAllocations = [];
  const abiEncoder = new ethers.utils.AbiCoder();
  for (let i = 0; i < allocations.length; i++) {
    let beneficiary = allocations[i][0];
    let amount = ethers.BigNumber.from(allocations[i][1]);
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

module.exports.tags = ["VestingTosdis"];
module.exports.dependencies = ["MetarunToken"];
