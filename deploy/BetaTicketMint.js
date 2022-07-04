const goldTicketsCount = 10;
const silverTicketsCount = 20;
const bronzeTicketsCount = 70;

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { execute, read } = deployments;
  const { deployer } = await getNamedAccounts();
  const collection = await deployments.get("MetarunCollection");
  const sale = await deployments.get("BetaTicketSale");

  console.log(`Using MetarunCollection at ${collection.address}`);

  const bronzeTicketKind = await read("MetarunCollection",  "BRONZE_TICKET_KIND",)
  const silverTicketKind = await read("MetarunCollection",  "SILVER_TICKET_KIND",)
  const goldTicketKind = await read("MetarunCollection",  "GOLD_TICKET_KIND",)


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
