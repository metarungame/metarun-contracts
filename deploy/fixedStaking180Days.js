const contractName = "FixedStaking180Days"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const tokenCollection = (await deployments.get("MetarunCollection")).address
  const stakeDuration = 180 * 60 * 60 * 24
  const rewardRate = 2250
  const earlyUnstakeFee = 2250

  const mrunPerSkin = ethers.utils.parseEther("2000");

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

  /* Setters were muted to avoid re-execution on redeployments
  Todo: need to check getters and set them if they have unexpected values

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
    0x0301
  )
  */
}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken", "MetarunCollection"]
