module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();


  const totalAmount = ethers.utils.parseEther("550000");
  const tge = Date.parse("2022-02-22T00:00:00+00:00")/1000;
  const day = 60 * 60 * 24;
  const month = 60 * 60 * 24 * 30;

  let allocations = {}
  allocations.seed = {start: tge - 15 * day, interval: day, duration: 18 * month, recipients: []}
  allocations.private1 = {start: tge - 15 * day, interval: day, duration: 12 * month, recipients: []}
  allocations.private2 = {start: tge - 15 * day, interval: day, duration: 12 * month, recipients: []}
  allocations.strategic = {start: tge - month, interval: month, duration: 10 * month, recipients: []}

  allocations.seed.recipients.push(['0x5304B8dCbBCD77aFE3371B8d94A46cdE3bbE2aC1', '25000000']);
  allocations.seed.recipients.push(['0x05a070925BD1bb04d5db16C8fd76e86768721c6c', '15625000']);
  allocations.seed.recipients.push(['0x4f898413147EA72256440Ed17D88059F968FeFea',	'10000000']);
  allocations.seed.recipients.push(['0xb61c34f3D1297990da7FeeFbbFd65f2689d4EB73',	'6250000']);
  allocations.seed.recipients.push(['0x52182B6Efc51471491C0E69bFAF404B075B06F4c',	'6250000']);
  allocations.seed.recipients.push(['0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07',	'5000000']);
  allocations.seed.recipients.push(['0x93f99d41CDD698C19C5D4baA978970977A223938',	'10000000']);
  allocations.seed.recipients.push(['0x2855D87B811db73FbaB1B7F65119Cd9F98Bb9BF8',	'6250000']);
  allocations.seed.recipients.push(['0x4085e9Fb679dD2f60C2E64afe9533107Fa1c18F2',	'6250000']);

  allocations.private1.recipients.push(["0x05a070925BD1bb04d5db16C8fd76e86768721c6c", "13333333.33"]);
  allocations.private1.recipients.push(["0x4a5BB1c9347A0d4F7e06a29239162f03647d9232", "3333333.33"]);
  allocations.private1.recipients.push(["0xcEd29BA48490C51E4348e654C313AC97762beCCC", "3333333.33"]);
  allocations.private1.recipients.push(["0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07", "2000000.00"]);
  allocations.private1.recipients.push(["0x17ec047622C000Df03599026A3B39871EC9384DB", "3333333.33"]);
  allocations.private1.recipients.push(["0x93f99d41CDD698C19C5D4baA978970977A223938", "1333333.33"]);
  allocations.private1.recipients.push(["0xfb4334A5704e29DF37efc9F16255759670018D9A", "3333333.33"]);
  allocations.private1.recipients.push(["0xa29B56729C9a2F0bcCbD46eacf7DF7C07D9E2f6E", "1000000.00"]);
  allocations.private1.recipients.push(["0xa50f89381301Decb11F1918586f98c5f2077e3Ca", "6666666.66"]);
  allocations.private1.recipients.push(["0xE390f8c5aD03746723D7c2a4Fd735d6895025AE4", "2666666.66"]);
  allocations.private1.recipients.push(["0x2855D87B811db73FbaB1B7F65119Cd9F98Bb9BF8", "5000000.00"]);
  allocations.private1.recipients.push(["0x65d2C76d45f8Ad43F1CeaD64751B6a1e00E391BF", "2666666.66"]);
  allocations.private1.recipients.push(["0x309D3522F7C3a4fe6AC6bb8A2f3916d24C643DF7", "1666666.66"]);
  allocations.private1.recipients.push(["0xE448f88BDD86658308994dE3c90a473F04ABb4D4", "3333333.33"]);
  allocations.private1.recipients.push(["0xFBdd717FBaBB137A645dE993337C0090b0AB9739", "3333333.33"]);
  allocations.private1.recipients.push(["0x815BEe06404b43db6958a6C3f5514C34a3BA67f4", "3333333.33"]);
  allocations.private1.recipients.push(["0x4bA5Ca72C0d647eF13c7c6903199BD3dB7Bc6f9f", "2666666.66"]);
  allocations.private1.recipients.push(["0x377374d7cD5041e058d7bD584A15CC3A62CbBd4B", "1666666.66"]);
  allocations.private1.recipients.push(["0x004d6377fdc00b1934f9e00C76442A51a908117C", "2000000.00"]);
  allocations.private1.recipients.push(["0xFdAf21Cf5A98DfF4Cd9050114999Ec17995aef43", "1666666.66"]);
  allocations.private1.recipients.push(["0x1AD0E68302a348888fD7fEFe8b677b46bBF6e9aa", "6666666.66"]);
  allocations.private1.recipients.push(["0x71d1f0a05F82c0EBd02b8704E3d2337b517a6B3A", "1000000.00"]);
  allocations.private1.recipients.push(["0x505Ffa6194f6e443b86F2028b2a97A588c17b962", "1333333.33"]);
  allocations.private1.recipients.push(["0x8147cb56fef46b8cfaa883c55584de5ecdaad776", "3333333.33"]);
  allocations.private1.recipients.push(["0x824651A8c864d70756C344968d520B1393924929", "4666666.66"]);
  allocations.private1.recipients.push(["0xAa92521387Df9cf483F0C3e0e6f5424e9998316f", "1666666.66"]);
  allocations.private1.recipients.push(["0xbafee8FD1331a26088183222Edb4160462631665", "66666.66"]);
  allocations.private1.recipients.push(["0xB32B84A193Ee43a62BD48A7Cc9Ae1090a38d2654", "133333.33"]);
  allocations.private1.recipients.push(["0xE14B74214082A0AC923c0c1D045c1D8042709a90", "33333.33"]);
  allocations.private1.recipients.push(["0x9859718Db7CBF960C8189A4a2103dE404700215F", "66666.66"]);
  allocations.private1.recipients.push(["0xCb4aD595c128ee3699168c0e5B6395E6722d57d4", "66666.66"]);
  allocations.private1.recipients.push(["0x7b88aD278Cd11506661516E544EcAA9e39F03aF0", "140000.00"]);
  allocations.private1.recipients.push(["0x6107F283EC9512DD9992e544be42370C51Fce27D", "90000.00"]);
  allocations.private1.recipients.push(["0x74Ae77A0d62de7f2c65FC326325e91a7754aB4d4", "293333.13"]);
  allocations.private1.recipients.push(["0x4DF07083cB8ad1c8601Dba43fdc113e68ef31A88", "3333333.33"]);
  allocations.private1.recipients.push(["0xA6C8a8D5131C102D1859627Ee5EC151Ed942B7Ee", "333333.33"]);
  allocations.private1.recipients.push(["0x333eEA08021a9c2dcd3876cF534D65F845A09921", "3333333.33"]);
  allocations.private1.recipients.push(["0xD4d0487f1fEAAf7F13887B52b3179bEAdABAFCF4", "1333333.33"]);
  allocations.private1.recipients.push(["0xc2511c232bfcCfAD4048d51920da004cF17db0b2", "6666666.66"]);

  allocations.private2.recipients.push(["0x05a070925BD1bb04d5db16C8fd76e86768721c6c", "5000000.00"]);
  allocations.private2.recipients.push(["0x4a5BB1c9347A0d4F7e06a29239162f03647d9232", "2500000.00"]);
  allocations.private2.recipients.push(["0x1228C30Cd4a9BF4D71af7F8594e25345d851CE07", "1500000.00"]);
  allocations.private2.recipients.push(["0x3f7442eD1D52923D920E2b8e103a2Cd3C18D8F86", "5000000.00"]);
  allocations.private2.recipients.push(["0xe67671f92D7B4af4c45daEF25d921B04818E87C5", "1000000.00"]);
  allocations.private2.recipients.push(["0x377374d7cD5041e058d7bD584A15CC3A62CbBd4B", "1250000.00"]);
  allocations.private2.recipients.push(["0x4bA5Ca72C0d647eF13c7c6903199BD3dB7Bc6f9f", "2250000.00"]);
  allocations.private2.recipients.push(["0x7b2e52bd6E1cE0ED1dD99F790571F658Df1e8ea5", "2000000.00"]);
  allocations.private2.recipients.push(["0x309D3522F7C3a4fe6AC6bb8A2f3916d24C643DF7", "1875000.00"]);
  allocations.private2.recipients.push(["0xa50f89381301Decb11F1918586f98c5f2077e3Ca", "1000000.00"]);
  allocations.private2.recipients.push(["0xFdAf21Cf5A98DfF4Cd9050114999Ec17995aef43", "1250000.00"]);
  allocations.private2.recipients.push(["0x815BEe06404b43db6958a6C3f5514C34a3BA67f4", "1500000.00"]);
  allocations.private2.recipients.push(["0xdff0C80e60E16778C0ea13642A2E2b5774f18664", "3750000.00"]);
  allocations.private2.recipients.push(["0x505Ffa6194f6e443b86F2028b2a97A588c17b962", "2000000.00"]);
  allocations.private2.recipients.push(["0x004d6377fdc00b1934f9e00C76442A51a908117C", "1500000.00"]);
  allocations.private2.recipients.push(["0x0051437667689B36f9cFec31E4F007f1497c0F98", "1000000.00"]);
  allocations.private2.recipients.push(["0x6b63BE14d2A7Ae154d434065C0Be25D0b5D381cd", "2500000.00"]);
  allocations.private2.recipients.push(["0xB881E298B51Bd870BDF064EaCDE86deA705009cC", "500000.00"]);
  allocations.private2.recipients.push(["0x71d1f0a05F82c0EBd02b8704E3d2337b517a6B3A", "750000.00"]);
  allocations.private2.recipients.push(["0x00E4B1C3A9F9EF618ECA6A88D4B461E1499D61D4", "2000000.00"]);
  allocations.private2.recipients.push(["0x86ec8B7982C5fBB64db7e2dc496d91a375BEe747", "250000.00"]);
  allocations.private2.recipients.push(["0xD4d0487f1fEAAf7F13887B52b3179bEAdABAFCF4", "1500000.00"]);
  allocations.private2.recipients.push(["0xEFa10ed446E41a1815b20B0108e35fbd74C2AD77", "500000.00"]);
  allocations.private2.recipients.push(["0x4553eD5d8d3731E629f67BD86abd021175F31848", "1000000.00"]);
  allocations.private2.recipients.push(["0x50899582199c06d5264edDCD12879E5210783Ba8", "1000000.00"]);
  allocations.private2.recipients.push(["0x1AD0E68302a348888fD7fEFe8b677b46bBF6e9aa", "7500000.00"]);
  allocations.private2.recipients.push(["0xc2511c232bfcCfAD4048d51920da004cF17db0b2", "5000000.00"]);
  allocations.private2.recipients.push(["0xAB7618A71CfD7f62be30bB977f3C3F6198721299", "750000.00"]);
  allocations.private2.recipients.push(["0x8175fbBADEBb294FE4e8175e180943A86008b06B", "1000000.00"]);

  allocations.strategic.recipients.push(["0x82Ba7508f7F1995AB1623258D66Cb4E2B2b8F467", "400000.00"]);
  allocations.strategic.recipients.push(["0x2DA8A79a3d35cee136f9452648636Afc7DF415bC", "800000.00"]);
  allocations.strategic.recipients.push(["0x127108AbEea6d4C23c9843B97FADf3c99752D075", "1600000.00"]);
  allocations.strategic.recipients.push(["0x11F2e9d3a8e9C652B075829a95fACA14eEB93c6B", "600000.00"]);
  allocations.strategic.recipients.push(["0x94272fe425c6406D86433Ff2bDe0407724Ad68EA", "200000.00"]);
  allocations.strategic.recipients.push(["0xa6C23E20A2D8Ca6764183cA71687de8b690ad546", "120000.00"]);
  allocations.strategic.recipients.push(["0xC62a99689f6F68DA3808c7a9222BEa715E897Ef2", "200000.00"]);
  allocations.strategic.recipients.push(["0xbE78bC01fCB47837DC1D68B68811B2c6c554c998", "200000.00"]);
  allocations.strategic.recipients.push(["0x2A41650a8EC14C8C767de98B670Cba66ebBB9200", "100000.00"]);
  allocations.strategic.recipients.push(["0x05850F758F8469f9038493b85bF879AEE186Fd02", "1200000.00"]);
  allocations.strategic.recipients.push(["0xf44ec09221653db5691265bA587e196257DA5F53", "120000.00"]);
  allocations.strategic.recipients.push(["0x40394c0F96c3cfAAcA7235776d1b01Cc4Df5c4b9", "400000.00"]);
  allocations.strategic.recipients.push(["0xDC91c2CF4313fc80F36d540FB4f797d68F9BDe1a", "80000.00"]);
  allocations.strategic.recipients.push(["0xF45cd4601A0273c12ad6D136320Af7bAb20a406b", "200000.00"]);
  allocations.strategic.recipients.push(["0x91F4B8928c20914Bd9a36D35773DeDcB59508c7D", "80000.00"]);
  allocations.strategic.recipients.push(["0x0Ec8BC018C50502254A1f257471698212bC54cC7", "120000.00"]);
  allocations.strategic.recipients.push(["0x825Ffa5C61Ed5A2F6a2320fBa9dccc81Fec6d9DC", "80000.00"]);
  allocations.strategic.recipients.push(["0x2938b2a7EbF9a59645E39d51ec5eCA2869D6C53D", "400000.00"]);
  allocations.strategic.recipients.push(["0x63A5C090885A28e0A35d10Eff2d4A2d8e01033d4", "800000.00"]);
  allocations.strategic.recipients.push(["0x01204297dB860f097C2902Be6D6aC3e654B89c66", "800000.00"]);
  allocations.strategic.recipients.push(["0xAE83297759AAb210eb2fA3C7cF42a77d0bD2B07e", "120000.00"]);
  allocations.strategic.recipients.push(["0x339A4E11b89cc7753C5757c0556edc286462c4C5", "200000.00"]);
  allocations.strategic.recipients.push(["0xc0D773CA30871fEF7C21ceDfa60D380215d45A3D", "40000.00"]);
  allocations.strategic.recipients.push(["0x6cDAcd9cD2d4A824BCe5E91F4899c959F2693a9f", "80000.00"]);
  // some typo?
  // allocations.strategic.recipients.push(["0xCBC83a731E2baF8C26507EF952deE6889770c6f3f", "100000.00"]);
  allocations.strategic.recipients.push(["0xebc7d99053c0AEA470d71C7A3bF80ff9C2f17789", "40000.00"]);
  allocations.strategic.recipients.push(["0xe5a610b8c6f45a9EF5dC749b4Ccd14a0E9149dFf", "600000.00"]);
  allocations.strategic.recipients.push(["0x5A2Aa44A41214f3870d2F7A2f78Db2Aa816a2053", "800000.00"]);
  allocations.strategic.recipients.push(["0xc99a1F573E79030D30E4f02032D5081EFfc6BAdC", "120000.00"]);
  allocations.strategic.recipients.push(["0x684370B185dAae503C2Ac43e8Ae2029A27986e47", "300000.00"]);
  allocations.strategic.recipients.push(["0x116de680624921cdb6295e232F18d9095F1fAf7C", "80000.00"]);
  allocations.strategic.recipients.push(["0x5c9A5CFA0385105dF9Ec850448524aA84aBE8C9d", "800000.00"]);
  allocations.strategic.recipients.push(["0xb86113e3804343D4C16A8663fc32abCb7b2F5DAf", "80000.00"]);
  // some typo?
  // allocations.strategic.recipients.push(["0xD9b92d1D8FA673dC0Bc66BAFCffd4A59d7344937c", "240000.00"]);
  allocations.strategic.recipients.push(["0xaD001052d0435E06Ba64602dA4c97268780fdC52", "300000.00"]);
  allocations.strategic.recipients.push(["0x87B97782DB0C00A6F241C6ED12588EE40BBD9D01", "80000.00"]);
  allocations.strategic.recipients.push(["0x24D01Ab711b7a7AE37798F6A9Adc8d6bA7017931", "120000.00"]);
  allocations.strategic.recipients.push(["0xdB3bed7786E2F401003f6f9cA9aecd89A2CACa88", "120000.00"]);
  allocations.strategic.recipients.push(["0xbC627254fa9e73117cb70E1D4Eed610Ba0a9DE0D", "200000.00"]);
  allocations.strategic.recipients.push(["0xCa9061Ae96f2728259E328AEda513270532FC43d", "1200000.00"]);
  allocations.strategic.recipients.push(["0xcA6d94eE0D366fFB5BbC472f98f995a04D929e92", "80000.00"]);
  allocations.strategic.recipients.push(["0x4E3bCD2734390f9CC02cD10F37aCf59EbE548e2f", "200000.00"]);
  allocations.strategic.recipients.push(["0x85B2b25BCb79A4945c1d7ad5e773f4af5b7167c3", "140000.00"]);
  allocations.strategic.recipients.push(["0x3fe4B9C51e238cB90a25A11e13167E37ff974298", "800000.00"]);
  allocations.strategic.recipients.push(["0x9E6d8980BC9fc98c5d2db48c46237d12d9873ab0", "800000.00"]);
  allocations.strategic.recipients.push(["0xAe86cf0e6BB7094AC4A6E0F344E54eD15C6FC7a6", "60000.00"]);
  allocations.strategic.recipients.push(["0x96F719d836C263eDD20F0d749a6f81fb74973b9F", "160000.00"]);
  allocations.strategic.recipients.push(["0x9fe553de68865F425d8071C81640855A7C9613eb", "120000.00"]);
  allocations.strategic.recipients.push(["0x93d572C6A9D44D24d54D87435f2837d01650499D", "800000.00"]);
  allocations.strategic.recipients.push(["0x1ba9fc680f5315c7bcF7877993288867C50deecE", "800000.00"]);
  allocations.strategic.recipients.push(["0xdd8D647b0133dEdC7907bbd2E303C029E2009d2a", "800000.00"]);
  allocations.strategic.recipients.push(["0x0E4CF6937B009FfA84C364398B0809DCc88e41e3", "280000.00"]);
  allocations.strategic.recipients.push(["0xd0E8DE06bb27c022C1c5453f374cFad475CEB99e", "100000.00"]);
  allocations.strategic.recipients.push(["0x50899582199c06d5264edDCD12879E5210783Ba8", "400000.00"]);
  allocations.strategic.recipients.push(["0x04c15a56597910578652b2eB3613bF98eB77e8e5", "180000.00"]);
  allocations.strategic.recipients.push(["0x64575500f350819b5d9E9F1974ccf8aae509738c", "400000.00"]);
  allocations.strategic.recipients.push(["0x844121d6EFd6eaa3b79bf8FB46b53324d9167d0A", "800000.00"]);
  allocations.strategic.recipients.push(["0xfBe751400E00b597F7089209cE36Cf32Dd4c6711", "400000.00"]);
  allocations.strategic.recipients.push(["0x8A6C50cc41611d5E610227f2BF8f94932f3B63A9", "40000.00"]);
  allocations.strategic.recipients.push(["0xECB38346c4c8Bd45d328540D995b977143F032e3", "400000.00"]);
  allocations.strategic.recipients.push(["0x0C751E9b472448920e5208B79996e94465cee695", "80000.00"]);
  allocations.strategic.recipients.push(["0xc69A36f448d8a4b8282033ef6A209C2fF3d330C7", "120000.00"]);
  allocations.strategic.recipients.push(["0x65F3258b684f60c947a1b6Bda5fFE6111d65680B", "1000000.00"]);
  allocations.strategic.recipients.push(["0x14528cC30f914d6EF521a4EE385511b24bd21348", "800000.00"]);
  allocations.strategic.recipients.push(["0x67b88427Ea58ae1911a36d07432D5A5dE48240C8", "800000.00"]);
  allocations.strategic.recipients.push(["0x19feEAA6cdF250B4D6d44679209BFDc3279b12d4", "1200000.00"]);
  allocations.strategic.recipients.push(["0x07F22C9e4665ABc36Df451775Ad8e702aa59C0AB", "400000.00"]);
  allocations.strategic.recipients.push(["0x4fC54e9e245acca7D2c23Bb206bF7c7CA6C5568a", "200000.00"]);
  allocations.strategic.recipients.push(["0xEfD4068F85900b3B0d26D5Abe69AEFcc9D757Df9", "800000.00"]);
  allocations.strategic.recipients.push(["0x76889Fdf18112B65608e9D4a6c15f62862F37766", "600000.00"]);

  allocations.seed.vestingContractName = "TokenVestingSeed";
  allocations.private1.vestingContractName = "TokenVestingPrivate1";
  allocations.private2.vestingContractName = "TokenVestingPrivate2";
  allocations.strategic.vestingContractName = "TokenVestingStrategic";

  for (const category in allocations) {
    console.log("Processing Category:", category);
    console.log("  start:", allocations[category].start);
    console.log("  interval:", allocations[category].interval);
    console.log("  duration:", allocations[category].duration);
    console.log("  recipients:", allocations[category].recipients.length);
    let totalAmount = ethers.utils.parseEther('0')
    for (let i = 0; i < allocations[category].recipients.length; i++) {
      let amount = ethers.utils.parseEther(allocations[category].recipients[i][1]);
      totalAmount = totalAmount.add(amount)
    }
    console.log("  total allocation:", ethers.utils.formatEther(totalAmount));

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
      (await deployments.get(allocations[category].vestingContractName)).address,
      totalAmount
    );

    for (let i = 0; i < allocations[category].recipients.length; i++) {
      let recipient = allocations[category].recipients[i][0];
      let amount = ethers.utils.parseEther(allocations[category].recipients[i][1]);
      console.log("    vesting for", recipient, ethers.utils.formatEther(amount));

      let vested = await read(
        allocations[category].vestingContractName,
        'getVesting',
        recipient,
      );
      if (!vested[0].eq("0")) {
        console.log("      Already vested?", vested[0].toString());
        return;
      };

      await execute(
        allocations[category].vestingContractName,
        { from: deployer, log: true },
        'createVesting',
        recipient,
        allocations[category].start,
        allocations[category].interval,
        allocations[category].duration,
        amount
      );
    }
  }
};

module.exports.tags = ["VestingAddAllocations"];
module.exports.dependencies = ["MetarunToken", "TokenVestings"];
