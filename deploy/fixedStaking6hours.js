const contractName = "FixedStaking6hours"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const tokenCollection = (await deployments.get("MetarunCollection")).address
  const stakeDuration = 6 * 60
  const rewardRate = 2250
  const earlyUnstakeFee = 2250

  console.log("Deploying contract:", contractName)
  console.log("Deployer:", deployer)
  console.log("Arguments:", token, stakeDuration, rewardRate, earlyUnstakeFee)

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
    "start"
  )
}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken"]
