const { ethers } = require("hardhat");

const contractName = "RunExecutor";

module.exports = async function({ getNamedAccounts, deployments }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    
    const metarunCollectionDeployment = await deployments.get("MetarunCollection");
    const metarunCollection = await ethers.getContractAt(metarunCollectionDeployment.abi, metarunCollectionDeployment.address);
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
    const MINTER_ROLE = await metarunCollection.MINTER_ROLE();
    const SETTER_ROLE = await metarunCollection.SETTER_ROLE();
    await metarunCollection.grantRole(MINTER_ROLE, deployResult.address);
    await metarunCollection.grantRole(SETTER_ROLE, deployResult.address);
    console.log(`Required roles are set up to ${deployResult.address}`);
}


module.exports.tags = [contractName];
module.exports.dependencies = ["MetarunCollection"];