const contractName = "FixedStaking6hours"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const stakeDuration = 6 * 60 * 60
  const rewardRate = 2250
  const earlyUnstakeFee = 2250

  console.log("Deploying contract:", contractName)
  console.log("Deployer:", deployer)
  console.log("Arguments:", token, stakeDuration, rewardRate, earlyUnstakeFee)

  await deploy(contractName, {
    from: deployer,
    log: true,
    args: [token, stakeDuration, rewardRate, earlyUnstakeFee],
    contract: "FixedStaking",
  })

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
