const { task } = require("hardhat/config");

async function getNonFungibaleKinds(metarunCollection) {
  return [
    (await metarunCollection.CRAFTSMAN_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.FIGHTER_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.SPRINTER_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.ARTIFACT_TOKEN_KIND()).toNumber(),
    (await metarunCollection.PET_TOKEN_KIND()).toNumber(),
  ]
}

async function getFungibleTokens(metarunCollection) {
  return [
    (await metarunCollection.HEALTH_TOKEN_ID()).toNumber(),
    (await metarunCollection.MANA_TOKEN_ID()).toNumber(),
    (await metarunCollection.SPEED_TOKEN_ID()).toNumber(),
    (await metarunCollection.COLLISION_DAMAGE_TOKEN_ID()).toNumber(),
  ]
}

const addresses = [
  "0x5fcb8f7149e8ad03544157c90e6f81b26933d3a2",
  "0x031a55b6156a5fcad6732fa10a6d58092413b6c6",
  "0xa6a207aced8becfd40d1d0340b0d30306b474e58",
  "0x250fd12f3c285116f1acd41fcb054756938f1af9",
  "0x7d93575849b079fd923f85eb355ece4e640f61ac",
  "0x1b1a9b14e5cd635c48d34c891f6d8ac59e81fb62",
  "0x63460d767edd9ade0b8771c1b59d6f4a2a61a5d9",
  "0x89d25f2166dc68be17c8aa8ecb711b1a9e96eb74",
  "0xc215b6c5936119c603df21c9a89d9423775670d3",
  "0x00fe7c821d66368bfc78753baf9b7639d708f662",
]

async function mintMultiple (collection, addresses, kinds, fungibleTokens) {
  for (i=0; i < addresses.length; i++) {
    for (j=0; j < kinds.length; j++) {
      console.log(`Minting token with type ${kinds[j]} for address ${addresses[i]}`);
      tx = await collection.mintBatch(addresses[i], kinds[j], 1);
      tx.wait();
    }
    for (j=0; j < fungibleTokens.length; j++) {
      console.log(`Minting fungible token id ${fungibleTokens[j]} for address ${addresses[i]}`);
      tx = await collection.mint(
        addresses[i],
        fungibleTokens[j],
        (Math.random() * (100*10**18 - 10**18) + 10**18).toString()
      );
      tx.wait();
    }
  }
}

task("mint-multiple", "Mint MetarunCollection tokens")
  .addFlag("maxMint", "Mint a lot")
  .addOptionalParam("indexOfAddress", "Address index from the specified adderss list")
  .addOptionalParam("kindOfNonFungibleToken", "non-fungible token kind or will be all existing ones")
  .addOptionalParam("kindOfFungibleToken", "fungible token kind or will be all existing ones")
  .setAction(async (taskArgs, hre) => {
    const addressReceiver = addresses[parseInt(taskArgs.indexOfAddress)];
    const kindOfNonFungibleToken = parseInt(taskArgs.kindOfNonFungibleToken);
    const kindOfFungibleToken = parseInt(taskArgs.kindOfFungibleToken);
    const collectionArtifact = await hre.deployments.get("MetarunCollection");
    const collection = await hre.ethers.getContractAt(collectionArtifact.abi, collectionArtifact.address);
    const specifiedtAddresses = addressReceiver ? [addressReceiver] : addresses;
    const nonFungibleKinds = await getNonFungibaleKinds(collection);
    const specifiedNonFungibleKinds = kindOfNonFungibleToken in nonFungibleKinds ? [kindOfNonFungibleToken] : [];
    const fungibleTokens = await getFungibleTokens(collection);
    const specifiedFungibleKinds = kindOfFungibleToken in fungibleTokens ? [kindOfFungibleToken] : [];

    if (taskArgs.maxMint) {
      await mintMultiple(collection, addresses, nonFungibleKinds, fungibleTokens);
    } else {
      await mintMultiple(collection, specifiedtAddresses, specifiedNonFungibleKinds, specifiedFungibleKinds);
    } 
  });
