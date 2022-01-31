const fs = require("fs");

module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const token = await deployments.get("MetarunToken");

  vesting = await deploy("TokenVesting", {
    from: deployer,
    args: [token.address],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });

  fs.writeFileSync("VestingAdress.json", JSON.stringify(vesting.address));

  console.log("Vesting address:", vesting.address);
};

module.exports.tags = ["TokenVesting"];
module.exports.dependencies = ["MetarunToken"];
