module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { deployer } = await getNamedAccounts();

  const amount = ethers.utils.parseEther("2500000"); // MRUN
  const recipient = "0x994d202Ce5643151b4829434fB75635bA2586019"

  console.log("Will mint:", ethers.utils.formatEther(amount), "MRUN");
  console.log("Recipient:", recipient);

  const totalSupplyBefore = await read(
    'MetarunToken',
    { log: true },
    'totalSupply'
  );

  console.log("Total supply before:", ethers.utils.formatEther(totalSupplyBefore), "MRUN");

  const balanceBefore = await read(
    'MetarunToken',
    { log: true },
    'balanceOf',
    recipient
  );

  console.log("Recipient's balance before:", ethers.utils.formatEther(balanceBefore), "MRUN");


  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'mint',
    recipient,
    amount
  );

  const totalSupplyAfter = await read(
    'MetarunToken',
    { log: true },
    'totalSupply'
  );

  console.log("Total supply after:", ethers.utils.formatEther(totalSupplyAfter), "MRUN");

  const balanceAfter = await read(
    'MetarunToken',
    { log: true },
    'balanceOf',
    recipient
  );

  console.log("Recipient's balance after:", ethers.utils.formatEther(balanceAfter), "MRUN");

};

module.exports.tags = ["MetarunTokenMintNewSupply"];
module.exports.dependencies = ["MetarunToken"];
