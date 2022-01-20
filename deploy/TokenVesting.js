module.exports = async function({ ethers, getNamedAccounts, deployments, hre }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const MetarunToken = await deployments.get("MetarunToken")
    await deploy("TokenVesting", {
        from: deployer,
        log: true,
        skipIfAlreadyDeployed: true,
        args: [MetarunToken.address]
    });
};

module.exports.tags = ["TokenVesting"];
module.exports.dependencies = ["MetarunToken"];
