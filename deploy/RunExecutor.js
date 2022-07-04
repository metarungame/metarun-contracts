const contractName = "RunExecutor";

module.exports = async function({ getNamedAccounts, deployments }) {
    const { deploy, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();
    
    const metarunCollectionDeployment = await deployments.get("MetarunCollection");
    const deployResult = await deploy(contractName, {
        from: deployer,
        log: true,
        contract: contractName,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            execute: {
                init: {
                    methodName: "initialize",
                    args: [metarunCollectionDeployment.address]
                }
            }
        }
    });

    console.log(`${contractName}` + " address: ", deployResult.address);
    const MINTER_ROLE = await read("MetarunCollection",  "MINTER_ROLE",);
    const SETTER_ROLE = await read("MetarunCollection",  "SETTER_ROLE",);

    await execute("MetarunCollection",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      deployResult.address
    )

    await execute("MetarunCollection",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      SETTER_ROLE,
      deployResult.address
    )

    console.log(`Required roles are set up to ${deployResult.address}`);
}


module.exports.tags = [contractName];
module.exports.dependencies = ["MetarunCollection"];