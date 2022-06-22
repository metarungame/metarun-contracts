
const contractName = "BetaTicketSale";
const goldTicketsCount = 33;
const silverTicketsCount = 33;
const bronzeTicketsCount = 33;

module.exports = async function ({ getNamedAccounts, deployments, ethers }) {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const collectionAddress = (await deployments.get("MetarunCollection")).address;
    console.log(`Using MetarunCollection at ${collectionAddress}`);
    const metarunCollection = await ethers.getContractAt("MetarunCollection", collectionAddress);
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
    console.log(`Deployed BetaTicketSale at ${deployResult.address}`);
    const betaTicketSale = await ethers.getContractAt("BetaTicketSale", deployResult.address);
    const bronzeTicketKind = await metarunCollection.BRONZE_TICKET_KIND();
    const silverTicketKind = await metarunCollection.SILVER_TICKET_KIND();
    const goldTicketKind = await metarunCollection.GOLD_TICKET_KIND();
    await metarunCollection.mintBatch(betaTicketSale.address, bronzeTicketKind, bronzeTicketsCount);
    console.log(`Minted ${bronzeTicketsCount} of kind ${bronzeTicketKind} (${bronzeTicketKind.toHexString()}) to ${betaTicketSale.address}`);
    await metarunCollection.mintBatch(betaTicketSale.address, silverTicketKind, silverTicketsCount);
    console.log(`Minted ${silverTicketsCount} of kind ${silverTicketKind} (${silverTicketKind.toHexString()}) to ${betaTicketSale.address}`);
    await metarunCollection.mintBatch(betaTicketSale.address, goldTicketKind, goldTicketsCount);
    console.log(`Minted ${goldTicketsCount} of kind ${goldTicketKind} (${goldTicketKind.toHexString()}) to ${betaTicketSale.address}`);    
}

module.exports.tags = ["BetaTicketSale"];
module.exports.dependencies = ["MetarunCollection"];
