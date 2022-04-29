module.exports = async function ({ ethers, getNamedAccounts, deployments }) {
  const { execute, read } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken"))
  const tokenCollection = (await deployments.get("MetarunCollection"))

  const fixedStaking90Days = (await deployments.get("FixedStaking90Days"))
  const fixedStaking180Days = (await deployments.get("FixedStaking180Days"))
  const fixedStaking365Days = (await deployments.get("FixedStaking365Days"))

  const MINTER_ROLE = await read("MetarunCollection",
    "MINTER_ROLE",
  )

  for (const minterContract of [fixedStaking90Days, fixedStaking180Days, fixedStaking365Days]) {
    await execute("MetarunToken",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      minterContract.address
    )

    await execute("MetarunCollection",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      minterContract.address
    )
  }

}

module.exports.tags = ["AssignMinterRolesForStaking"]
module.exports.dependencies = ["MetarunToken", "MetarunCollection", "FixedStaking90Days", "FixedStaking180Days", "FixedStaking365Days"]
