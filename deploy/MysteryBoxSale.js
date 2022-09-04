const contractName = "MysteryBoxSale";

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, execute, read } = deployments;
    const { deployer } = await getNamedAccounts();
    const collectionAddress = (await deployments.get("MetarunCollection")).address;
    const busdAddress = (await deployments.get("ERC20Mock")).address;

    const deployResult = await deploy(contractName, {
        from: deployer,
        log: true,
        contract: contractName,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
          execute: {
            init: {
              methodName: "initialize",
              args: [busdAddress, collectionAddress],
            },
          }
        },
      }
    );
    console.log(`MysteryBoxSale address ${deployResult.address}`);

    const MINTER_ROLE = await read("MetarunCollection",  "MINTER_ROLE",);

    await execute("MetarunCollection",
      {
        from: deployer,
        log: true
      },
      "grantRole",
      MINTER_ROLE,
      deployResult.address
    )
}

module.exports.tags = ["MysteryBoxSale"];
module.exports.dependencies = ["MetarunCollection", "ERC20Mock"];
