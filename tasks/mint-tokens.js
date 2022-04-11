const { task } = require("hardhat/config");

async function getTokenCategories(metarunCollection) {
  const characterToken = await metarunCollection.CHARACTER();
  const petToken = await metarunCollection.PET();
  const artifactToken = await metarunCollection.ARTIFACT();
  const skinToken = await metarunCollection.SKIN();

//  const categories = [characterToken, petToken, artifactToken, skinToken];
    const categories = [skinToken];
  return categories;

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
];

/**
 * This task mints 1000 of tokens which are spreaded
 * amongst addresses and
 * amongst categories defined in getTokenCategories() function
 *
 * Usage: yarn mint-tokens:rinkeby -- execute in rinkedby
 *        yarn mint-tokens:local -- execute in local node
 * One should specify following environment variables:
 * METARUN_COLLECTION_ADDRESS -- address of MetarunCollection contract
 * (can be filled with 0x00 in local node because contract in local node will be re-deployed)
 * MNEMONIC -- mnemonic phrase to perform mint
 * INFURA_KEY -- your Infura key to connect to rinkeby
 * AMOUNT -- amount of tokens
 */
task("mint-tokens", "Mint MetarunCollection tokens")
  .addFlag("local")
  .addParam("address")
  .addParam("amount")
  .setAction(async (taskArgs, hre) => {
    const metarunCollectionAddress = taskArgs.address;
    const local = taskArgs.local;
    const ethers = hre.ethers;
    let metarunCollection;
    if (local) {
      const factory = await ethers.getContractFactory("MetarunCollection");
      metarunCollection = await factory.deploy("https://app-staging.metarun.game/metadata/{id}.json");
      console.log(`local execution, contract has been deployed at ${metarunCollection.address}`);
    } else {
      metarunCollection = await ethers.getContractAt("MetarunCollection", metarunCollectionAddress);
      console.log(`non-local execution, contract has been found on rinkeby with address ${metarunCollection.address}`);
    }
    const categories = await getTokenCategories(metarunCollection);
    const amountPerMinting = 1;
    const amountOfMinted = taskArgs.amount;
    for (let i = 0; i < amountOfMinted; i++) {
      const addressReceiver = addresses[i % addresses.length];
      const tokenId = categories[i % categories.length];
      const transaction = await metarunCollection.mint(addressReceiver, tokenId, amountPerMinting);
      console.log(`Added ${i + 1}th token. Tx hash: ${transaction.hash}`);
    }
  });

task("simplified-mint-tokens", "Simplified Mint MetarunCollection tokens")
  .addParam("addressToken")
  .addParam("addressReceiver")
  .setAction(async (taskArgs, hre) => {
    const ethers = hre.ethers;
    const metarunCollectionAddress = taskArgs.addressToken;
    const addressReceiver = taskArgs.addressReceiver;
    const metarunCollection = await ethers.getContractAt("MetarunCollection", metarunCollectionAddress);
    const categories = await getTokenCategories(metarunCollection);
    const amount = ethers.BigNumber.from('1000');
    for (let i = 0; i < categories.length; i++) {
      const tokenId = categories[i];
      const transaction = await metarunCollection.mint(addressReceiver, tokenId, 10);
      console.log(`Added ${i + 1}th token. Tx hash: ${transaction.hash}`);
    }
  });