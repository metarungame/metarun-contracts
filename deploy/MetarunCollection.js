module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(`Deployer ${deployer}`);

  const deployResult = await deploy("MetarunCollection", {
    from: deployer,
    log: true,
    proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
            init: {
            methodName: "initialize",
            args: ["https://app-staging.metarun.game/metadata/{id}.json"],
            },
        }
    },
  });
  console.log("Token address: ", deployResult.address);
};

module.exports.tags = ["MetarunCollection"];
