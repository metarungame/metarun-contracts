const contractName = "FixedStaking90Days"

module.exports = async function ({ ethers, getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken")).address
  const tokenCollection = (await deployments.get("MetarunCollection")).address
  const stakeDuration = 90 * 24 * 60 * 60
  const rewardRate = 678
  const earlyUnstakeFee = 678
  const mrunPerSkin = ethers.utils.parseEther("200");
  const skinKind = 0x0302;

  console.log("Deploying contract:", contractName)
  console.log("Deployer:", deployer)
  console.log("Arguments:", token, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection)

  const deployResult = await deploy(contractName, {
    from: deployer,
    log: true,
    contract: "FixedStaking",
    proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
            init: {
            methodName: "initialize",
            args: [token, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection],
            },
        }
    },
  });
  console.log(`${contractName}`+" address:", deployResult.address);
  
  const fixedStakingDays = await ethers.getContractAt(deployResult.abi, deployResult.address);

  if (!(await fixedStakingDays.stakesOpen())) {

    console.log(`Start ${contractName}`);
    const setMrunPerSkinTx = await fixedStakingDays.setMrunPerSkin(mrunPerSkin);
    await setMrunPerSkinTx.wait();
  
    const setSkinKindTx = await fixedStakingDays.setSkinKind(skinKind);
    await setSkinKindTx.wait();

    const startTx = await fixedStakingDays.start();
    await startTx.wait();
  }

}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken", "MetarunCollection"]
