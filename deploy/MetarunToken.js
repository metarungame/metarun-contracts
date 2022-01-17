module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  await deploy("MetarunToken", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });
};

module.exports.tags = ["MetarunToken"];
