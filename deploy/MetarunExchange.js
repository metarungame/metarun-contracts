module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const collection = await deployments.get("MetarunCollection");

  exchange = await deploy("MetarunExchange", {
    from: deployer,
    args: [collection.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  })

  console.log("Exchange address:", exchange.address);

};

module.exports.tags = ["MetarunExchange"];
module.exports.dependencies = ["MetarunCollection"];
