module.exports = async function ({ getNamedAccounts, deployments, ethers }) {
  const { execute,read } = deployments;
  const { deployer } = await getNamedAccounts();

  const bronzeTicketsPrice = ethers.utils.parseUnits("180000000", "gwei");
  const silverTicketsPrice = ethers.utils.parseUnits("340000000", "gwei");
  const goldTicketsPrice = ethers.utils.parseUnits("450000000", "gwei");
  
  const collection = await deployments.get("MetarunCollection");
  console.log(`Using MetarunCollection at ${collection.address}`);

  const bronzeTicketKind = await read("MetarunCollection",  "BRONZE_TICKET_KIND",)
  const silverTicketKind = await read("MetarunCollection",  "SILVER_TICKET_KIND",)
  const goldTicketKind = await read("MetarunCollection",  "GOLD_TICKET_KIND",)

  await execute("BetaTicketSale", 
    { 
      from: deployer, 
      log: true 
    }, 
    "setTicketKindPrice",   
    bronzeTicketKind, 
    bronzeTicketsPrice
  );
  console.log(`Set new price of kind ${bronzeTicketKind} (${bronzeTicketKind.toHexString()})`);

  await execute("BetaTicketSale", 
    { 
      from: deployer, 
      log: true 
    }, 
    "setTicketKindPrice", 
    silverTicketKind, 
    silverTicketsPrice
  );
  console.log(`Set new price of kind ${silverTicketKind} (${silverTicketKind.toHexString()})`);

  await execute("BetaTicketSale", 
    { 
      from: deployer, 
      log: true 
    }, 
    "setTicketKindPrice", 
    goldTicketKind, 
    goldTicketsPrice
  );
  console.log(`Set new price of kind ${goldTicketKind} (${goldTicketKind.toHexString()})`);
};

module.exports.tags = ["BetaTicketSetPrice"];
module.exports.dependencies = ["MetarunCollection", "BetaTicketSale"];
