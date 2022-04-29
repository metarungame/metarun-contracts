const contractName = "FixedStaking365Days"

module.exports = async function ({ ethers, getNamedAccounts, deployments }) {
  const { deploy, execute } = deployments
  const { deployer } = await getNamedAccounts()

  const token = (await deployments.get("MetarunToken"))
  const tokenCollection = (await deployments.get("MetarunCollection"))
  const stakeDuration = 365 * 24 * 60 * 60
  const rewardRate = 7000
  const earlyUnstakeFee = 7000
  const mrunPerSkin = ethers.utils.parseEther("150000");
  const skinKind = 0x0302;


  console.log("Deploying contract:", contractName)
  console.log("Deployer:", deployer)
  console.log("Arguments:", token.address, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection.address)

  const fixedStaking = await deploy(contractName, {
    from: deployer,
    log: true,
    contract: "FixedStaking",
    proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
            init: {
            methodName: "initialize",
            args: [token.address, stakeDuration, rewardRate, earlyUnstakeFee, tokenCollection.address],
            },
        }
    },
  });
  console.log(`${contractName}`+" address:", fixedStaking.address);
  
  const fixedStakingContract = await ethers.getContractAt(fixedStaking.abi, fixedStaking.address);

  if (!(await fixedStakingContract.stakesOpen())) {

    console.log("Set setMrunPerSkin()");
    const setMrunPerSkinTx = await fixedStakingContract.setMrunPerSkin(mrunPerSkin);
    await setMrunPerSkinTx.wait();
    
    console.log("Set setSkinKind()");
    const setSkinKindTx = await fixedStakingContract.setSkinKind(skinKind);
    await setSkinKindTx.wait();

    console.log(`Start ${contractName}`);
    const startTx = await fixedStakingContract.start();
    await startTx.wait();

    
    const tokenContract = await ethers.getContractAt(token.abi, token.address);
    let role = await tokenContract.MINTER_ROLE();
    if (!(await tokenContract.hasRole(role, fixedStakingContract.address))) {
      console.log("Set grantRole() for MetarunToken");
      let grantRollTx = await tokenContract.grantRole(role, fixedStakingContract.address);
      await grantRollTx.wait();
    }

    const tokenCollectionContract = await ethers.getContractAt(tokenCollection.abi, tokenCollection.address);
    role = await tokenCollectionContract.MINTER_ROLE();
    if (!(await tokenCollectionContract.hasRole(role, fixedStakingContract.address))) {
      console.log("Set grantRole() for MetarunCollection");
      grantRollTx = await tokenCollectionContract.grantRole(role, fixedStakingContract.address);
      await grantRollTx.wait();
    }
  }

}

module.exports.tags = [contractName]
module.exports.dependencies = ["MetarunToken", "MetarunCollection"]
