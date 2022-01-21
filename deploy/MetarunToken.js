module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  token = await deploy("MetarunToken", {
    from: deployer,
    log: true,
    skipIfAlreadyDeployed: true,
  });

  console.log("Token address:", token.address);
};

module.exports.tags = ["MetarunToken"];
