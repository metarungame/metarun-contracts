module.exports = async function ({ ethers, getNamedAccounts, deployments }) {
  const { execute, read } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken"))
  const tokenCollection = (await deployments.get("MetarunCollection"))

  const MINTER_ROLE = await read("MetarunCollection",
    "MINTER_ROLE",
  )

  for (const stakingName of ["FixedStaking90Days", "FixedStaking180Days", "FixedStaking365Days"]) {
    let stakingContract = await deployments.get(stakingName)
    
    await execute("MetarunToken",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      stakingContract.address
    )

    await execute("MetarunCollection",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      stakingContract.address
    )

    await execute(stakingName,
      {
        from: deployer,
        log: true
      },
      "start"
    )
  }

}

module.exports.tags = ["SetupStaking"]
module.exports.dependencies = ["MetarunToken", "MetarunCollection", "FixedStaking90Days", "FixedStaking180Days", "FixedStaking365Days"]
