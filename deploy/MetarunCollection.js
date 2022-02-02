module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();
    console.log(`Deployer ${deployer}`);

    const token = await deploy("MetarunCollection", {
        from: deployer,
        args: ['https://app-staging.metarun.game/metadata/{id}.json'],
        log: true,
        skipIfAlreadyDeployed: true,
    });

    console.log("Token address: ", token.address);
}

module.exports.tags = ["MetarunCollection"];
