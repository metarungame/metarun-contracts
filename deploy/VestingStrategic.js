module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "Strategic";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const hour = 60 * 60;
  const day = 24 * hour;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const start = tge - month; // 10% unlocked at tge
  const cliff = tge + 1 * hour;
  const interval = 1 * month;
  const duration = 10 * month; // 100% / 10% per month = 10mos

  let allocations = [];

  allocations.push(["0x82Ba7508f7F1995AB1623258D66Cb4E2B2b8F467", "400000.00"]);
  allocations.push(["0x2DA8A79a3d35cee136f9452648636Afc7DF415bC", "800000.00"]);
  allocations.push(["0x127108AbEea6d4C23c9843B97FADf3c99752D075", "1600000.00"]);
  allocations.push(["0x11F2e9d3a8e9C652B075829a95fACA14eEB93c6B", "600000.00"]);
  allocations.push(["0x94272fe425c6406D86433Ff2bDe0407724Ad68EA", "200000.00"]);
  allocations.push(["0xa6C23E20A2D8Ca6764183cA71687de8b690ad546", "120000.00"]);
  allocations.push(["0xC62a99689f6F68DA3808c7a9222BEa715E897Ef2", "200000.00"]);
  allocations.push(["0xbE78bC01fCB47837DC1D68B68811B2c6c554c998", "200000.00"]);
  allocations.push(["0x2A41650a8EC14C8C767de98B670Cba66ebBB9200", "100000.00"]);
  allocations.push(["0x05850F758F8469f9038493b85bF879AEE186Fd02", "1200000.00"]);
  allocations.push(["0xf44ec09221653db5691265bA587e196257DA5F53", "120000.00"]);
  allocations.push(["0x40394c0F96c3cfAAcA7235776d1b01Cc4Df5c4b9", "400000.00"]);
  allocations.push(["0xDC91c2CF4313fc80F36d540FB4f797d68F9BDe1a", "80000.00"]);
  allocations.push(["0xF45cd4601A0273c12ad6D136320Af7bAb20a406b", "200000.00"]);
  allocations.push(["0x91F4B8928c20914Bd9a36D35773DeDcB59508c7D", "80000.00"]);
  allocations.push(["0x0Ec8BC018C50502254A1f257471698212bC54cC7", "120000.00"]);
  allocations.push(["0x825Ffa5C61Ed5A2F6a2320fBa9dccc81Fec6d9DC", "80000.00"]);
  allocations.push(["0x2938b2a7EbF9a59645E39d51ec5eCA2869D6C53D", "400000.00"]);
  allocations.push(["0x63A5C090885A28e0A35d10Eff2d4A2d8e01033d4", "800000.00"]);
  allocations.push(["0x01204297dB860f097C2902Be6D6aC3e654B89c66", "800000.00"]);
  allocations.push(["0xAE83297759AAb210eb2fA3C7cF42a77d0bD2B07e", "120000.00"]);
  allocations.push(["0x339A4E11b89cc7753C5757c0556edc286462c4C5", "200000.00"]);
  allocations.push(["0xc0D773CA30871fEF7C21ceDfa60D380215d45A3D", "40000.00"]);
  allocations.push(["0x6cDAcd9cD2d4A824BCe5E91F4899c959F2693a9f", "80000.00"]);
  allocations.push(["0xCBC83a731E2baF8C26507EF952deE6889770c6f3", "100000.00"]);
  allocations.push(["0xebc7d99053c0AEA470d71C7A3bF80ff9C2f17789", "40000.00"]);
  allocations.push(["0xe5a610b8c6f45a9EF5dC749b4Ccd14a0E9149dFf", "600000.00"]);
  allocations.push(["0x5A2Aa44A41214f3870d2F7A2f78Db2Aa816a2053", "800000.00"]);
  allocations.push(["0xc99a1F573E79030D30E4f02032D5081EFfc6BAdC", "120000.00"]);
  allocations.push(["0x684370B185dAae503C2Ac43e8Ae2029A27986e47", "300000.00"]);
  allocations.push(["0x116de680624921cdb6295e232F18d9095F1fAf7C", "80000.00"]);
  allocations.push(["0x5c9A5CFA0385105dF9Ec850448524aA84aBE8C9d", "800000.00"]);
  allocations.push(["0xb86113e3804343D4C16A8663fc32abCb7b2F5DAf", "80000.00"]);
  allocations.push(["0xa2584bE4db80EAab687d55b5eC8F6Fd5238221dc", "240000.00"]);
  allocations.push(["0xaD001052d0435E06Ba64602dA4c97268780fdC52", "300000.00"]);
  allocations.push(["0x87B97782DB0C00A6F241C6ED12588EE40BBD9D01", "80000.00"]);
  allocations.push(["0x24D01Ab711b7a7AE37798F6A9Adc8d6bA7017931", "120000.00"]);
  allocations.push(["0xdB3bed7786E2F401003f6f9cA9aecd89A2CACa88", "120000.00"]);
  allocations.push(["0xbC627254fa9e73117cb70E1D4Eed610Ba0a9DE0D", "200000.00"]);
  allocations.push(["0xCa9061Ae96f2728259E328AEda513270532FC43d", "1200000.00"]);
  allocations.push(["0xcA6d94eE0D366fFB5BbC472f98f995a04D929e92", "80000.00"]);
  allocations.push(["0x4E3bCD2734390f9CC02cD10F37aCf59EbE548e2f", "200000.00"]);
  allocations.push(["0x85B2b25BCb79A4945c1d7ad5e773f4af5b7167c3", "140000.00"]);
  allocations.push(["0x3fe4B9C51e238cB90a25A11e13167E37ff974298", "800000.00"]);
  allocations.push(["0x9E6d8980BC9fc98c5d2db48c46237d12d9873ab0", "800000.00"]);
  allocations.push(["0xAe86cf0e6BB7094AC4A6E0F344E54eD15C6FC7a6", "60000.00"]);
  allocations.push(["0x96F719d836C263eDD20F0d749a6f81fb74973b9F", "160000.00"]);
  allocations.push(["0x9fe553de68865F425d8071C81640855A7C9613eb", "120000.00"]);
  allocations.push(["0x93d572C6A9D44D24d54D87435f2837d01650499D", "800000.00"]);
  allocations.push(["0x1ba9fc680f5315c7bcF7877993288867C50deecE", "800000.00"]);
  allocations.push(["0xdd8D647b0133dEdC7907bbd2E303C029E2009d2a", "800000.00"]);
  allocations.push(["0x0E4CF6937B009FfA84C364398B0809DCc88e41e3", "280000.00"]);
  allocations.push(["0xd0E8DE06bb27c022C1c5453f374cFad475CEB99e", "100000.00"]);
  allocations.push(["0x50899582199c06d5264edDCD12879E5210783Ba8", "400000.00"]);
  allocations.push(["0x04c15a56597910578652b2eB3613bF98eB77e8e5", "180000.00"]);
  allocations.push(["0x64575500f350819b5d9E9F1974ccf8aae509738c", "400000.00"]);
  allocations.push(["0x844121d6EFd6eaa3b79bf8FB46b53324d9167d0A", "800000.00"]);
  allocations.push(["0xfBe751400E00b597F7089209cE36Cf32Dd4c6711", "400000.00"]);
  allocations.push(["0x8A6C50cc41611d5E610227f2BF8f94932f3B63A9", "40000.00"]);
  allocations.push(["0xECB38346c4c8Bd45d328540D995b977143F032e3", "400000.00"]);
  allocations.push(["0x0C751E9b472448920e5208B79996e94465cee695", "80000.00"]);
  allocations.push(["0xc69A36f448d8a4b8282033ef6A209C2fF3d330C7", "120000.00"]);
  allocations.push(["0x65F3258b684f60c947a1b6Bda5fFE6111d65680B", "1000000.00"]);
  allocations.push(["0x14528cC30f914d6EF521a4EE385511b24bd21348", "800000.00"]);
  allocations.push(["0x67b88427Ea58ae1911a36d07432D5A5dE48240C8", "800000.00"]);
  allocations.push(["0x19feEAA6cdF250B4D6d44679209BFDc3279b12d4", "1200000.00"]);
  allocations.push(["0x07F22C9e4665ABc36Df451775Ad8e702aa59C0AB", "400000.00"]);
  allocations.push(["0x4fC54e9e245acca7D2c23Bb206bF7c7CA6C5568a", "200000.00"]);
  allocations.push(["0xEfD4068F85900b3B0d26D5Abe69AEFcc9D757Df9", "800000.00"]);
  allocations.push(["0x76889Fdf18112B65608e9D4a6c15f62862F37766", "600000.00"]);

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

module.exports.tags = ["VestingStrategic"];
module.exports.dependencies = ["MetarunToken"];
