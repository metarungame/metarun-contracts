const contractName = "FixedStaking360Days"

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const stakeDuration = 365 * 60 * 60 * 24
  const rewardRate = 7000
  const earlyUnstakeFee = 7000

  const mrunPerSkin = ethers.utils.parseEther("150000");

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
    "setMrunPerSkin",
    mrunPerSkin
  )

  await execute(contractName,
    {
      from: deployer,
      log: true
    },
    "setSkinKind",
    0x0302
  )
}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken"]
