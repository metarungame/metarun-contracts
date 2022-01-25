module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute } = deployments;
  const { parseEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();


  const totalAmount = ethers.utils.parseEther("550000");
  const DAY = 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;
  // planned date of Token Generation Event
  const tge = Date.parse("2022-02-10T00:00+00:00")/1000;

  ecosystem = { description: "Ecosystem" };
  ecosystem.address = "0x5fCb8f7149E8aD03544157C90E6f81b26933d3a2";
  ecosystem.amount = totalAmount.mul(15).div(100);
  ecosystem.cliff = tge; // start unlocking
  ecosystem.duration = 3 * MONTH; // total unlock time

  reserve = { description: "Company Reserve" };
  reserve.address = "0x031A55b6156A5FCad6732fa10A6D58092413B6C6";
  reserve.amount = totalAmount.mul(10).div(100);
  reserve.cliff = tge + 6 * MONTH; // start unlocking
  reserve.duration = 4 * YEAR

  const vestingAllocations = [ecosystem, reserve];

  const vesting = await deployments.get("TokenVesting");

  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'mint',
    deployer,
    totalAmount
  );

  await execute(
    'MetarunToken',
    { from: deployer, log: true },
    'approve',
    vesting.address,
    totalAmount
  );

  for (var i = 0; i < vestingAllocations.length; i++) {
    let alloc = vestingAllocations[i];
    console.log("Adding Vesting Allocation for ", alloc.description);
    console.log("  Address:", alloc.address);
    console.log("  Amount:", alloc.amount.toString());
    console.log("  Cliff (start unlocking):", alloc.cliff);
    console.log("  Duration:", alloc.duration);
    console.log("  Vested (totally unlocked):", alloc.cliff + alloc.duration);

    // todo: more verbose output
    await execute(
      'TokenVesting',
      { from: deployer, log: true },
      'createVesting',
      alloc.address,
      alloc.cliff,
      DAY,
      alloc.duration,
      alloc.amount
    );
  }
};

module.exports.tags = ["VestingAllocations"];
module.exports.dependencies = ["MetarunToken", "TokenVesting"];
