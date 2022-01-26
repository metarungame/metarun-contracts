const fs = require("fs");

module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute } = deployments;
  const { parseEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();

  const totalAmount = ethers.utils.parseEther("1000000000");
  const DAY = 60 * 60 * 24;
  const MONTH = DAY * 30;
  const YEAR = DAY * 365;
  // planned date of Token Generation Event
  const tge = Date.parse("2022-02-10T00:00+00:00") / 1000;

  function addBeneficiary(description, address, amount, cliff, duration) {
    return { description, address, amount, cliff, duration };
  }
  let contractInformation = {
    investors: [
      ["0x031A55b6156A5FCad6732fa10A6D58092413B6C6", "Ecosystem"],
      ["0xA6A207aceD8bEcfD40D1d0340B0D30306b474E58", "Company Reserve"],
      ["0x013CCa7490Df1803B030515561A4E99B66d010c7", "Team"],
      ["0x250fd12F3C285116F1AcD41fcB054756938f1AF9", "Advisers"],
      ["0x7D93575849B079FD923f85eB355ECe4e640F61ac", "BD and partnerships"],
      ["0x1B1a9B14E5cD635C48D34c891f6D8Ac59E81fb62", "Marketing"],
      ["0x63460D767EdD9ADe0B8771c1B59D6F4a2a61a5d9", "Liquidity and listings"],
      ["0x89d25F2166dC68Be17C8aA8ecb711B1a9e96eb74", "Seed sale"],
      ["0xC215B6c5936119c603Df21C9a89d9423775670D3", "Private sale 1"],
      ["0x00fe7C821d66368bfC78753Baf9B7639D708F662", "Private sale 2"],
      ["0x297Df83B933eE82ff1FfF4004fCcF7bC50e5e18D", "Public IDO"],
      ["0x1179d39f73080d9dDB22812223614428AB1633b5", "Community Sale"],
    ],
    vestingContract: ["0xvestingAddress"],
  };

  fs.writeFileSync("beneficiarInformation.json", JSON.stringify(contractInformation));

  ecosystem = { description: "Ecosystem" };
  ecosystem.address = "0x5fCb8f7149E8aD03544157C90E6f81b26933d3a2";
  ecosystem.amount = totalAmount.mul(15).div(100);
  ecosystem.cliff = tge; // start unlocking
  ecosystem.duration = 3 * MONTH; // total unlock time

  const vestingAllocations = [
    ecosystem,
    // addBeneficiary("Ecosystem", "0x031A55b6156A5FCad6732fa10A6D58092413B6C6", totalAmount.mul(15).div(100), tge, 3 * MONTH),
    // addBeneficiary("Company Reserve", "0xA6A207aceD8bEcfD40D1d0340B0D30306b474E58", totalAmount.mul(10).div(100), tge + 6 * MONTH, 4 * YEAR),
    // addBeneficiary("Team", "0x013CCa7490Df1803B030515561A4E99B66d010c7", totalAmount.mul(10).div(100), tge + 6 * MONTH, 2 * YEAR + 6 * MONTH),
    // addBeneficiary("Advisers", "0x250fd12F3C285116F1AcD41fcB054756938f1AF9", totalAmount.mul(7).div(100), tge + 6 * MONTH, YEAR + 8 * MONTH),
    // addBeneficiary(
    //   "BD and partnerships",
    //   "0x7D93575849B079FD923f85eB355ECe4e640F61ac",
    //   totalAmount.mul(6).div(100),
    //   tge + 3 * MONTH,
    //   2 * YEAR + 6 * MONTH
    // ),
    // addBeneficiary("Marketing", "0x1B1a9B14E5cD635C48D34c891f6D8Ac59E81fb62", totalAmount.mul(14).div(100), tge, 7 * YEAR + 4 * MONTH),
    // addBeneficiary("Liquidity and listings", "0x63460D767EdD9ADe0B8771c1B59D6F4a2a61a5d9", totalAmount.mul(7).div(100), tge, YEAR),
    // addBeneficiary("Seed sale", "0x89d25F2166dC68Be17C8aA8ecb711B1a9e96eb74", totalAmount.mul(10).div(100), tge + 2 * MONTH, YEAR + 6 * MONTH),
    // addBeneficiary("Private sale 1", "0xC215B6c5936119c603Df21C9a89d9423775670D3", totalAmount.mul(10).div(100), tge + 2 * MONTH, YEAR),
    // addBeneficiary("Private sale 2", "0x00fe7C821d66368bfC78753Baf9B7639D708F662", totalAmount.mul(6).div(100), tge + MONTH, YEAR),
    // addBeneficiary("Stratefig sale", "0x8889Fc00799C3255bF6162917D62acaC9a37F920", totalAmount.mul(3).div(100), tge, 9 * MONTH),
    // addBeneficiary("Public IDO", "0x297Df83B933eE82ff1FfF4004fCcF7bC50e5e18D", totalAmount.mul(2).div(100), tge, 3 * MONTH),
    // addBeneficiary("Community Sale", "0x1179d39f73080d9dDB22812223614428AB1633b5", totalAmount.mul(10).div(10000), tge, MONTH),
  ];

  const vesting = await deployments.get("TokenVesting");

  await execute("MetarunToken", { from: deployer, log: true }, "mint", deployer, totalAmount);

  await execute("MetarunToken", { from: deployer, log: true }, "approve", vesting.address, totalAmount);

  for (var i = 0; i < vestingAllocations.length; i++) {
    let alloc = vestingAllocations[i];
    console.log("Adding Vesting Allocation for ", alloc.description);
    console.log("  Address:", alloc.address);
    console.log("  Amount:", alloc.amount.toString());
    console.log("  Cliff (start unlocking):", alloc.cliff);
    console.log("  Duration:", alloc.duration);
    console.log("  Vested (totally unlocked):", alloc.cliff + alloc.duration);

    //   function createVesting(
    //     address beneficiary,
    //     uint256 start,
    //     uint256 interval,
    //     uint256 duration,
    //     uint256 amount
    // ) external nonReentrant {
    //     require(interval > 0 , "TokenVesting #createVesting: interval must be greater than 0");
    //     require(duration >= interval, "TokenVesting #createVesting: interval cannot be bigger than duration");

    //     Vesting storage vest = _vestings[beneficiary];
    //     require(vest.balance == 0, "TokenVesting #createVesting: vesting for beneficiary already created");

    //     _token.safeTransferFrom(_msgSender(), address(this), amount);

    //     vest.start = start;
    //     vest.interval = interval;
    //     vest.duration = duration;
    //     vest.balance = amount;
    //     vest.released = uint256(0);
    // }

    // todo: more verbose output
    await execute("TokenVesting", { from: deployer, log: true }, "createVesting", alloc.address, alloc.cliff, DAY, alloc.duration, alloc.amount);
  }
};

module.exports.tags = ["VestingAllocations"];
module.exports.dependencies = ["MetarunToken", "TokenVesting"];
