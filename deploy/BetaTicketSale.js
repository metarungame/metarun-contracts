const contractName = "BetaTicketSale";

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const collectionAddress = (await deployments.get("MetarunCollection")).address;

    const deployResult = await deploy(contractName, {
        from: deployer,
        log: true,
        contract: contractName,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [collectionAddress],
            },
          }
        },
      }
    );
    console.log(`BetaTicketSale address ${deployResult.address}`);
}

module.exports.tags = ["BetaTicketSale"];
module.exports.dependencies = ["MetarunCollection"];
