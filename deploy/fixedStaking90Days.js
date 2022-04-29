const contractName = "FixedStaking90Days"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const tokenCollection = (await deployments.get("MetarunCollection")).address
  const stakeDuration = 90 * 60 * 60 * 24
  const rewardRate = 678
  const earlyUnstakeFee = 678

  const mrunPerSkin = ethers.utils.parseEther("200");

  console.log("Deploying contract:", contractName)
  console.log("Deployer:", deployer)
  console.log("Arguments:", token, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection)

  const deployResult = await deploy(contractName, {
    from: deployer,
    log: true,
    contract: "FixedStaking",
    proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
            init: {
            methodName: "initialize",
            args: [token, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection],
            },
        }
    },
  });
  console.log(`${contractName}`+" address: ", deployResult.address);

  await execute(contractName,
    {
      from: deployer,
      log: true
    },
    "setMrunPerSkin",
    mrunPerSkin
  )

  await execute(contractName,
    {
      from: deployer,
      log: true
    },
    "setSkinKind",
    0x0300
  )
}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken", "MetarunCollection"]
