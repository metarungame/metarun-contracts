module.exports = async function ({
  ethers,
  getNamedAccounts,
  deployments,
  hre,
}) {
  const { deploy, execute } = deployments;
  const { deployer } = await getNamedAccounts();

  const amount = ethers.utils.parseEther("1000");
  const start = 1642000000;
  const interval = 1;
  const duration = 60 * 60 * 24 * 30;

  const vesting = await deployments.get("TokenVesting");

  await execute(
    "MetarunToken",
    { from: deployer, log: true },
    "mint",
    deployer,
    amount
  );

  await execute(
    "MetarunToken",
    { from: deployer, log: true },
    "approve",
    vesting.address,
    amount
  );
};

module.exports.tags = ["CreateVesting"];
module.exports.dependencies = ["MetarunToken", "TokenVesting"];
