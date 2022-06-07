const { task } = require("hardhat/config");

task("buy-tickets", "Mint tickets to BetaTicketSale")
    .setAction(async (taskArgs, hre) => {
        const betaTicketSaleAddress = (await hre.deployments.get("BetaTicketSale")).address;
        const betaTicketSale = await hre.ethers.getContractAt("BetaTicketSale", betaTicketSaleAddress);

        console.log(`BetaTicketSale: ${betaTicketSale.address}`);

        const metarunCollectionAddress = (await hre.deployments.get("MetarunCollection")).address;
        const metarunCollection = await hre.ethers.getContractAt("MetarunCollection", metarunCollectionAddress);

        console.log(`MetarunCollection: ${metarunCollection.address}`);

        const signers = await hre.ethers.getSigners();
        const buyerBronze = signers[0];
        const buyerSilver = signers[1];
        const buyerGold = signers[2];


        const bronzeKind = await metarunCollection.BRONZE_TICKET_KIND();
        const silverKind = await metarunCollection.SILVER_TICKET_KIND();
        const goldKind = await metarunCollection.GOLD_TICKET_KIND();

        const bronzePrice = await betaTicketSale.getTicketKindPrice(bronzeKind);
        const silverPrice = await betaTicketSale.getTicketKindPrice(silverKind);
        const goldPrice = await betaTicketSale.getTicketKindPrice(goldKind);
        
        console.log(`${buyerBronze.address} tries to buy ${bronzeKind.toHexString()} for ${bronzePrice}`);
        await betaTicketSale.connect(buyerBronze).buy(bronzeKind, {
            value: bronzePrice,
        });
        console.log(`${buyerSilver.address} tries to buy ${silverKind.toHexString()} for ${silverPrice}`);
        await betaTicketSale.connect(buyerSilver).buy(silverKind, {
            value: silverPrice,
        });
        console.log(`${buyerGold.address} tries to buy ${goldKind.toHexString()} for ${goldPrice}`);
        await betaTicketSale.connect(buyerGold).buy(goldKind, {
            value: goldPrice,
        });
    });