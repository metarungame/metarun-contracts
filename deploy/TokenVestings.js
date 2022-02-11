module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const day = 60 * 60 * 24;
  const month = 30 * day;

  const tge = Date.parse("2022-02-22T00:00:00+00:00")/1000;
  const start = tge - 15 * day
  const interval = day;
  const duration = 18 * month;

  console.log("Start:", start);
  console.log("Interval:", interval);
  console.log("Duration:", duration);

  recipients = []
  recipients.push(['0x5304B8dCbBCD77aFE3371B8d94A46cdE3bbE2aC1', '25000000']);
  recipients.push(['0x05a070925BD1bb04d5db16C8fd76e86768721c6c', '15625000']);
  recipients.push(['0x4f898413147EA72256440Ed17D88059F968FeFea',	'10000000']);
  recipients.push(['0xb61c34f3D1297990da7FeeFbbFd65f2689d4EB73',	'6250000']);
  recipients.push(['0x52182B6Efc51471491C0E69bFAF404B075B06F4c',	'6250000']);
  recipients.push(['0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07',	'5000000']);
  recipients.push(['0x93f99d41CDD698C19C5D4baA978970977A223938',	'10000000']);
  recipients.push(['0x2855D87B811db73FbaB1B7F65119Cd9F98Bb9BF8',	'6250000']);
  recipients.push(['0x4085e9Fb679dD2f60C2E64afe9533107Fa1c18F2',	'6250000']);
  console.log("Recipients:", recipients.length);


  const token = await deployments.get("MetarunToken");

  tokenVestingSeed = await deploy("TokenVestingSeed", {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  })
  console.log("Seed vesting address:", tokenVestingSeed.address);

  tokenVestingPrivate1 = await deploy("TokenVestingPrivate1", {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  })
  console.log("Private1 vesting address:", tokenVestingPrivate1.address);

  tokenVestingPrivate2 = await deploy("TokenVestingPrivate2", {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  })
  console.log("Private2 vesting address:", tokenVestingPrivate2.address);

  tokenVestingStrategic = await deploy("TokenVestingStrategic", {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  });
  console.log("Strategic vesting address:", tokenVestingStrategic.address);
};

module.exports.tags = ["TokenVestings"];
module.exports.dependencies = ["MetarunToken"];
