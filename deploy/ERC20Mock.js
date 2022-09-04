module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  token = await deploy("ERC20Mock", {
    from: deployer,
    args: ["BUSD", "BUSD", ethers.utils.parseEther("1000000")],
    log: true,
    skipIfAlreadyDeployed: true,
  });
};

module.exports.tags = ["ERC20Mock"];
