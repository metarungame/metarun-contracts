const goldTicketsCount = 33;
const silverTicketsCount = 33;
const bronzeTicketsCount = 33;

module.exports = async function ({ getNamedAccounts, deployments, ethers }) {
  const { execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const collection = await deployments.get("MetarunCollection");
  const sale = await deployments.get("BetaTicketSale");

  console.log(`Using MetarunCollection at ${collection.address}`);
  const metarunCollection = await ethers.getContractAt("MetarunCollection", collection.address);

  const bronzeTicketKind = await metarunCollection.BRONZE_TICKET_KIND();
  const silverTicketKind = await metarunCollection.SILVER_TICKET_KIND();
  const goldTicketKind = await metarunCollection.GOLD_TICKET_KIND();

  await execute("MetarunCollection", 
    { 
      from: deployer, 
      log: true 
    }, 
    "mintBatch", 
    sale.address, 
    bronzeTicketKind, 
    bronzeTicketsCount
  );
  console.log(`Minted ${bronzeTicketsCount} of kind ${bronzeTicketKind} (${bronzeTicketKind.toHexString()}) to ${sale.address}`);

  await execute("MetarunCollection", 
    { 
      from: deployer, 
      log: true 
    }, 
    "mintBatch", 
    sale.address, 
    silverTicketKind, 
    silverTicketsCount
  );
  console.log(`Minted ${silverTicketsCount} of kind ${silverTicketKind} (${silverTicketKind.toHexString()}) to ${sale.address}`);

  await execute("MetarunCollection", 
    { 
      from: deployer, 
      log: true 
    }, 
    "mintBatch", 
    sale.address, 
    goldTicketKind, 
    goldTicketsCount
  );
  console.log(`Minted ${goldTicketsCount} of kind ${goldTicketKind} (${goldTicketKind.toHexString()}) to ${sale.address}`);
};

module.exports.tags = ["BetaTicketMint"];
module.exports.dependencies = ["MetarunCollection", "BetaTicketSale"];
