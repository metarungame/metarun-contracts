module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const collection = await deployments.get("MetarunCollection");
  const mrunToken = await deployments.get("MetarunToken");

  exchange = await deploy("MetarunExchange", {
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
          init: {
          methodName: "initialize",
          args: [collection.address, mrunToken.address],
          },
      }
  },
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true
  })

  console.log("Exchange address:", exchange.address);

};

module.exports.tags = ["MetarunExchange"];
module.exports.dependencies = ["MetarunCollection", "MetarunToken"];
