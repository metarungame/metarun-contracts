const { task } = require("hardhat/config");

async function getNonFungibleKinds(metarunCollection) {
  return [
    (await metarunCollection.CRAFTSMAN_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.FIGHTER_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.SPRINTER_CHARACTER_KIND()).toNumber(),
    (await metarunCollection.ARTIFACT_TOKEN_KIND()).toNumber(),
    (await metarunCollection.PET_TOKEN_KIND()).toNumber(),
    (await metarunCollection.COMMON_SKIN_KIND()).toNumber(),
    (await metarunCollection.RARE_SKIN_KIND()).toNumber(),
    (await metarunCollection.MYTHICAL_SKIN_KIND()).toNumber(),
  ];
}

async function getFungibleTokens(metarunCollection) {
  return [
    (await metarunCollection.HEALTH_TOKEN_ID()).toNumber(),
    (await metarunCollection.MANA_TOKEN_ID()).toNumber(),
    (await metarunCollection.SPEED_TOKEN_ID()).toNumber(),
    (await metarunCollection.COLLISION_DAMAGE_TOKEN_ID()).toNumber(),
  ];
}

async function mintMultiple(collection, address, kinds, fungibles) {
  for (let index = 0; index < kinds.length; index++) {
    console.log(`Minting token with type 0x${kinds[index].toString(16)} for address ${address}`);
    tx = await collection.mintBatch(address, kinds[index], 1);
    tx.wait();
  }
  for (let index = 0; index < fungibles.length; index++) {
    console.log(`Minting fungible token id 0x${fungibles[index].toString(16)} for address ${address}`);
    tx = await collection.mint(address, fungibles[index], (Math.random() * (100 * 10 ** 18 - 10 ** 18) + 10 ** 18).toString());
    tx.wait();
  }
}

task("mint-deployer", "Mint MetarunCollection tokens to deployer").setAction(async (taskArgs, hre) => {
  const collectionArtifact = await hre.deployments.get("MetarunCollection");
  const collection = await hre.ethers.getContractAt(collectionArtifact.abi, collectionArtifact.address);
  console.log(`Interacting with ${collection.address}`);
  const kinds = await getNonFungibleKinds(collection);
  const fungibles = await getFungibleTokens(collection);
  const signers = await hre.ethers.getSigners();
  const address = signers[0].address;
  await mintMultiple(collection, address, kinds, fungibles);
});
