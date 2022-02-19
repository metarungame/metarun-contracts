module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const signer = (await ethers.getSigners())[0];

  console.log("Send tx to myself to check network configuration");
  console.log("Signer(Sender):", signer.address);
  const tx = await signer.sendTransaction({
    to: signer.address,
    value: ethers.utils.parseEther("0")
  });
  console.log("Tx sent:", tx.hash);
  await tx.wait()
  console.log("Tx mined successfully:", tx.hash);
};

module.exports.tags = ["SendSelf"];
