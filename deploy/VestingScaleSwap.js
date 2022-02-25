module.exports = async function ({ ethers, getNamedAccounts, deployments, hre }) {
  const { deploy, execute, read } = deployments;
  const { parseEther, formatEther } = ethers.utils;
  const { deployer } = await getNamedAccounts();
  const vestingName = "ScaleSwap";
  const vestingContractName = "Vesting" + vestingName;
  const token = await deployments.get("MetarunToken");
  const day = 60 * 60 * 24;
  const month = 30 * day;
  const tge = Date.parse("2022-02-28T15:00:00+00:00") / 1000;
  const lockBps = 1000; // 10%
  const vestBps = 9000; // 90%
  const lockClaimTime = tge;
  const vestStart = tge;
  const vestDuration = 3 * month;
  const vestInterval = month
  

  let allocations = [];

  allocations.push(["0xc8b69410Ad23a568012869C58D6e9F262F7f4591", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xa19D2badD62b5bD6BDf02C4304952A0324bab674", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0xCD4465Ae7f96F4e6a8baa0056f7a4C5aDf759b86", "10543.9792"]); // 10543.979127347282 MRUN
  allocations.push(["0x5c8AfDd1B67988D348509478C708D33033d2f62c", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x389fd8feBDceF0a84FC583f40316dDd0185894DB", "24999.0"]); // 24999.0 MRUN
  allocations.push(["0x1F53fF993bE7B03F9E6c40B57567EFBf119Bcfd6", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x7d893631120b6B4041B63Ca52a1d5418Aaf3593B", "14112.2251"]); // 14112.22506535023 MRUN
  allocations.push(["0xC1124584dB88Eaf25FbCbf67e11e16B916036d70", "9566.0"]); // 9565.999999999998 MRUN
  allocations.push(["0x50Df8E38d6227b1c0702c95dc751d41E4535A125", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x2b038d4BC7c1C1C3a9e388bf5e817aCDcCa32D34", "8649.2989"]); // 8649.298884310383 MRUN
  allocations.push(["0xd33c13F140c7a5903D980Fd05fF2f8122FDdF778", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0xB67ec89Ff66288813271DA27929325D03D51e1c5", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xdb78f3cE4cba2DcE686673b489eE4e0EF8C7752C", "8779.0143"]); // 8779.014230935485 MRUN
  allocations.push(["0xEb2ccA9466465B7991111eD22e51bD684255b9d1", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xB653894c8056c490dd9420BE56169871711dBc49", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x57b34EA78C80e6653d4d48f6aC6538AACDc86206", "14999.0"]); // 14999.0 MRUN
  allocations.push(["0x4A3C2bb648D5EfC17c60c5cE8c52608a2C5ebf9a", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x0B46D00b4ba369Ac1aa88668feB6b6B17Fa8dfCa", "20932.6407"]); // 20932.64069261113 MRUN
  allocations.push(["0x4513D1a68b966a6479BC0dE4CE9c263cF41Eb2a4", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0xb8F7d088eF11DC757eE4A316CA1F4B7F5Af7F534", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x667B2a94Dd4053508C7440EA1F902694336B9814", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x4A8693Fa55BF9BEabd7056B4B22207afc35A5626", "10023.2298"]); // 10023.229755957373 MRUN
  allocations.push(["0x1567D6e66016905C4eDfaDB775dCBfaF98d66B54", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xd262f4b46f93326127aebD8173b086E7B975c71c", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x7a9b4cD46dB67342A6ab7DBbB1189eB679a33865", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x0649777231eB71B8D306cB7FdB1c1fcC8859b882", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x91488424d2F44ad16Eaf87e65091E1451DC3Cd37", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x0FDC5Ba36f48d433c73781Be2087CC85D7d2EE19", "8653.5472"]); // 8653.547158118508 MRUN
  allocations.push(["0xEfd868307859a5720434fE1fEC0373e8cabA0FbC", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xCdaF8e9c9D644eAC19b62694Baa3BD3E7429347a", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xf306b3501c8f5072483fA73Cc5e16AD82601b1c8", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xEf6446E95A228b6A24B9994eB176eab49Deb170f", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x272a19c272E104D43eb95f3d573c5Ee2116467dC", "15787.0071"]); // 15787.007094155713 MRUN
  allocations.push(["0x1E8241Ef33B65C3253Fd4843eC36F18bAB0Bc241", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x8317f28A15c5ce3E73d74c93eb4D415A697073B1", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xC38e638025e22A046c7FCe29e56F628906f9d040", "8313.4113"]); // 8313.411269567525 MRUN
  allocations.push(["0x3fb5DB7728777c4b5ec41B8D7b9Fbc9207197502", "11016.0"]); // 11015.999999999998 MRUN
  allocations.push(["0xAcF7ce23c65d217c4156b65A2fAb201b55e80EA4", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x87bBbCC39740c1d2e8C740629Ca926E8f47b013D", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x0F28FA701EdA5Db150F2C6ccfA220E75cD839Efe", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xf5FBB25C8778E5964f72B5659097998d47D8bc90", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x8C1bFa4d89db3f95f02B0410DE92Cfd4b2bcAfd1", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x7269675E7b34bdCf197edD8aB0503AA9007a475A", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x8D6c8893b07D075A2Afa914Ca32aA1a8b14b44B5", "13666.0"]); // 13666.0 MRUN
  allocations.push(["0x97BA55B9A17afA626d6e7D6a4Bd168e0964773Eb", "3500.0"]); // 3500.0 MRUN
  allocations.push(["0x6f3222251df07bC495056d2685022d46E726516F", "6369.3419"]); // 6369.341878877217 MRUN
  allocations.push(["0x571af9f27e7bB61B7FB06dce4e6FA323303DE2E1", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x0fF65f3C24c1410c34cceF7b888D19736a036665", "9999.0"]); // 9998.999999999998 MRUN
  allocations.push(["0x2778419338784B50A689c5d49403370BD5ACEe91", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x2E4d990381e2438bE5834E5124C75ed1F4165Ed9", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xfD4846C0DC4d5e69a0Ad0d964da76Bb20f3fc26c", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x1bE6EB4B0B216E10Fb5A2Ea72f792ddB0Cc70Df5", "7857.8809"]); // 7857.880841162543 MRUN
  allocations.push(["0xd43Eea8E73957C7632aFe43ee154Ad4a79d98181", "9999.0"]); // 9998.999999999998 MRUN
  allocations.push(["0x8e5D4E1AF9F1d145251b9Bc735Cdba4c3DF508E6", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xa59442d006E7cbDBE56190c05e2AD0fcc08ad2D5", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x7F1e7f6253DD2c64B6818FB2376F0e38e46F9cCD", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0xf1011216260E5A23f21CbdfF7aE800f1668d049A", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x1ff2e3B83645ddAd394Fb42f98880e1b4F27E027", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x0CEAd33EB6AdF4860B6b8F66687f51567E111973", "24999.0"]); // 24999.0 MRUN
  allocations.push(["0x92B3f75c9b3098aB00C7A3d6E9b934a8ad4239b9", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x8EF2cE2e039E8cc190F1afb06f07dA8E366718a0", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x07d1A3Dcdc264ce1e4BBf5F47a4a9Bc31B717f9A", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x7A350362a951DFd409FbecEF65e2dCE2F2E39639", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xbFcFF3aA2579219eA47bbdc783d3E5afB2174895", "14999.0"]); // 14999.0 MRUN
  allocations.push(["0xd4f50Bd38e7Fab93296ED228BA7274c213bBA895", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x97F2a2dCe7F030E99acD1757ad3f7659b647034B", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x77e0ff269e1a0B5bcDe6d63e4c8A5778AEc1Edb2", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x606f9b06f6215792341D30f6c9ae2bE68EcddC40", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x74c3E71F203608aC65149ad086EEE58943aA3DC4", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x652F675173e10DBa83e07e09424dC492681e9963", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xA7b777873d3e37D7CCa943a95b24208df1d894b3", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x1F75bB3A3E52A13DA41BC6039A19813E66dbca78", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x7bB35e03a8eCe9B1022C2Daa784c354b47d88F60", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xD4B366Ba06a68d8c56Ef7D07fFbD49df4069137c", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x73aD74e99fDbE8814423d20dd441fe7CC0021D2C", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xEc42e0d46Cfe1972d1Cceedf99BFf9Ce8fa92c85", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x13F4a48002C0Ee571d4fbbC5d72147f6F9cc0991", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xEdF29B18bd46c5a4894C6073E975DCD4fA26196b", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xD5B09fBcd44fd07ed957C977d95DAaED94Db35Ca", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x387267aD713500CCc49117918Ab27BE067FB5948", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x245B8a1517684f9849247834D83F05570961f131", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x1ec3dF3359a520A97dF73448D8d37f1aafDd14C6", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xfD022195062d0e593F866058F6B532bD2af92d55", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x22dA1eEdeBC60C1b8c3a0c48f5C81BBE2b943dD9", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x5C78a34bE77bb3741C6A18450b04F45fe53D8D21", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x3AE8e89fb40cA6dc4fb3779e7dd1Da529855bcDd", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0xE2D7C679AeDc71DCFD65Eb381107f8beb0F65666", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x94F976949ecc48Ad616c982fA04476055eD0cE67", "16500.6681"]); // 16500.66805452228 MRUN
  allocations.push(["0x497D8E931069fD5B7ad44F1a0D61e326b39E96Eb", "12703.8383"]); // 12703.838237585098 MRUN
  allocations.push(["0x72dEB05DF2dB04eCdB77ad1a26FdFF7da8918dec", "16260.0"]); // 16260.0 MRUN
  allocations.push(["0x92BFaA1C1418B145b9f6F2326cF4751d956d9Ae6", "24999.0"]); // 24999.0 MRUN
  allocations.push(["0xe4b558e550b3688b8a476DA5B43Aea66dA528110", "6666.0"]); // 6665.999999999999 MRUN
  allocations.push(["0x55eed2B8d1A8aD72cb6eff52146f5964dA5cbbdf", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x218d83527220d04d5C8284966CD1B9057F4D4B87", "21666.0"]); // 21666.0 MRUN
  allocations.push(["0x05c1F1f1d9F051e5F799ddD386C0639669319a9D", "11666.0"]); // 11665.999999999998 MRUN
  allocations.push(["0x3005a0b7A0bA9F3CBb61972C0541Bd034F458777", "19348.787"]); // 19348.78690460413 MRUN
  allocations.push(["0x6093F885caBf1239BDdbE208ff864B2Bf3FbC4b3", "12600.0"]); // 12599.999999999998 MRUN
  allocations.push(["0xC0b09d420aAf1dc5C6325eDB908775EA915B982E", "8508.2021"]); // 8508.20208456874 MRUN
  allocations.push(["0x38ED9BC1a1E17662CafBeBd359F6E9122faB7314", "16666.0"]); // 16666.0 MRUN
  allocations.push(["0xD3adEAAd4556f1aA50946F9F9275E0B587544dAA", "19999.0"]); // 19999.0 MRUN
  allocations.push(["0xcbad35177C8666cD668dF141b957462BBf893708", "12000.0"]); // 12000.0 MRUN
  allocations.push(["0x34b38Dda2a9160326C837fFa289b96aDF4A6Ef44", "19999.0"]); // 19999.0 MRUN
  allocations.push(["0x64F80fC02D220DcB66549DAbCc73C97Dc7393aFd", "6974.7"]); // 6974.7 MRUN
  allocations.push(["0x00876150De3244f8cAf5B6A039EA11789749e317", "14547.9498"]); // 14547.94974444666 MRUN
  allocations.push(["0x12369A3680BE8e8F7bE0D194d4f6Fc8184698786", "6789.624"]); // 6789.623928036264 MRUN
  allocations.push(["0xAF6e6747F39587D519015a2177a4Ce0858668f11", "9411.2341"]); // 9411.234093555602 MRUN
  allocations.push(["0x1F50C21CA35bE7c07922cdAbBda8D598fefD34c8", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xC6104D31ecE0BBeceBe3f74477bAf493b33464F0", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x07b293D2fC0e61544674CA4B2FB0FF4CF9c6E984", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x31164E7A218259C76E7b87aAB237b8A0c35eF581", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x74264aA892C5C4B596b91F961B1387f94ef3d5a1", "3451.294"]); // 3451.293982621144 MRUN
  allocations.push(["0xA58680443c901a5098f36e009D916F838dd134bA", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x9e7c78Dd0667ABd79bC99235177303c2f5bCBd81", "11723.3003"]); // 11723.300295464009 MRUN
  allocations.push(["0x17533D9Dfd9E18a6B3189Ff52FE807784bD7cA37", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0xeE1C879Cbee96cfEe40BC5cE2A57b39E27cd105B", "3978.7371"]); // 3978.7370652534732 MRUN
  allocations.push(["0x7b0f8ae03b2fC1C1Cca4249ADd49E4D8b9497421", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xEf288F0e33Dfe8554218fEAC8EF1C43887217c32", "13428.5335"]); // 13428.533437092216 MRUN
  allocations.push(["0xA2ef20FEf382f3c14504eb4386241EB0bb1ADa1b", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xeA304a0d0E23A2BC5fFC48c8E841c11D71687c8C", "7000.0"]); // 7000.0 MRUN
  allocations.push(["0xcf48EaD9a51be1D5774802Edc9166379a9a90b6c", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x2CdF9434bFD4355d72d7795c4027ee41F875a621", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0xF16090099b35CE733B26404c2FdaF6025FAFb59e", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x0162A89ea5F8FDa5179E2eB0F9f4Df512F0F9Bb8", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xe542e8AA297986081456b3b716c29241eD936efb", "3506.6218"]); // 3506.6217999714786 MRUN
  allocations.push(["0xd1f36DE682B60418377430f567426d5a64ab962E", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x7acF2d4DBa0c5B1f8bb536dd80Df46d553F5f0d9", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xaAC6A96681cfc81c756Db31D93eafb8237A27Ba8", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x847790E0a19151564e65166dDAae8F18AaEC4428", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x894bBb1b955210a24D136acA5C63f1165f558f9e", "18333.0"]); // 18332.999999999996 MRUN
  allocations.push(["0x5B384068F6dC40AC39Cfb3183473a086abF7fD07", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0x1B5f1D2783a1Ea8474Bc2ffFd4dd79f682eAAccB", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x50173A9602ed189D1Df1aa9df78A28906B9Fb9cA", "3400.0"]); // 3400.0 MRUN
  allocations.push(["0xCD909B0fe84F3dccAA89FD9F21403ca3fBECd118", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x9a3C3eFD32Ddb4aCD9a58F797248f792200d19b7", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x493f19FAeB0d4daEB29787172feA642aC89276CA", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x39Ae6fe52bD93d9c6D4246622682f184A52CDD8A", "18333.0"]); // 18332.999999999996 MRUN
  allocations.push(["0xB854cEA254b32bae43CE9cE380A8803D8E974c6d", "13740.1297"]); // 13740.129661877727 MRUN
  allocations.push(["0xEe7C4aCA7D64075550F1b119b4bb4A0Aa889c340", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xD208E771D0682A580A39a70FaE9150f39BE7B590", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x49bcAa63ed08cbfdc928B7597A26dD06b37aFEFd", "7500.0"]); // 7500.000000000001 MRUN
  allocations.push(["0x105AD8186310751d3061ae7cc3fE5501E4De9Be3", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x24A11c695e02d492ea1125e1002dF30203a6Fc35", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x0e3dC97F367aEE356D05074fd40e64b5413E9Dc7", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x65a7a0A84bA3BcCF9CF8f0fcE87e6C9057a7de33", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0x55A6cE1329D576a789B5e6369DD712093430E69e", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xF8bA94f72d1560f91144e1c04853A290a72743C4", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x9FfDf04a0c44E87469f5451a2760a03a3fb52071", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x08288Aee64C9057Ac00C7D8E1a4489274ca012CC", "1000.0"]); // 999.9999999999999 MRUN
  allocations.push(["0xd0737EF16F73088B5DBe92Be2b77F9d135569F8D", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xF58f6299487442Fc5bFC1eae08Cff38F2c70fa8C", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x71D67285Fe7A081358738434C9F10ab2b27fEbeB", "4084.1729"]); // 4084.1728972932483 MRUN
  allocations.push(["0x7014232bFc6E5aa2586b0b49741829cB57264601", "3886.8163"]); // 3886.8162469493864 MRUN
  allocations.push(["0x7b79D32864a468d1c766adcD9b5Cb135D6C8E0AD", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xa41451A4073cDECA52a656Fa49C56eF924E33F6b", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xd688D61c814325e938f5071a3C325DF8090A41B3", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x1914172d1c51412c3Fc37Ec86989EdcC5fDcc0bc", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x1B292db2A5207dB4BDeF16D90aE2B8d56A267809", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x046a020Ab8e7E0B33Fba87f38Bd3B91a5E0f43bC", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x90774aB01BB5725d1CE10ADF47a1B791A594279c", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x871feee68Ec92dD0B12Fb386a4D4F1364454c74A", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x461462fc0A8c05FfB5B5Fe2e82B3a3aB292DB23A", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x9b005B00f0aBA9459b6EE16DE5591a462cE5dc2C", "11970.8302"]); // 11970.830185042863 MRUN
  allocations.push(["0xbF8aFe99bdf46A3f1907E451853DB738857CAe32", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xC79cafEbD12AD66d109A0adCdb57aDDe46a3F95E", "4977.9505"]); // 4977.950457025052 MRUN
  allocations.push(["0x165Fc7AD3Bd1AFD39ED25Cc30d96716F8FB8c3cA", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x19C7545E41E94D9be68EE4600287dc4E98E82712", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x0F37A20440061F6793e8b42BC49AB34aFeB5fD2D", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xfc6E4A6945fb6D532e03c12dEC18350168644b8b", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xFaD76ab81ec3299FF5e15c0661423010eD32173a", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xC8520B3026eDEe2eF2D16F1b20063BE041345793", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x12e0B397AF125641bb55ed1331E2cABd7E71204A", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0x342E5c4e007478156191A7F2DFe5623D1145B21B", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x8195A2E548E81e33F59638636100f8B36cc33071", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0xc7CB6545DBd214cF0D3Bd65B17C862b430f255D0", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x4B0595342790D01Eed98648832dA87704a12C3C9", "13034.6395"]); // 13034.63942682611 MRUN
  allocations.push(["0x81dA041E8e0Ed57b66C353d5C7f4dba43c815509", "8333.0"]); // 8333.0 MRUN
  allocations.push(["0xA6B5C8b9B5C8881ec153f28fa7C66033c5Bbf599", "11873.3167"]); // 11873.316625297715 MRUN
  allocations.push(["0xb1C76116F9361bCc1bAf3f4c959d4C1DA9d3a9b4", "15259.7667"]); // 15259.766671025189 MRUN
  allocations.push(["0xd00aA07614318eB4D0b1643b5fE09FbD65E1B4eF", "5000.0"]); // 5000.0 MRUN
  allocations.push(["0x3Df5bA668Fa69378cee5440a0786E87ba582fbdf", "15000.0"]); // 15000.000000000002 MRUN
  allocations.push(["0xFC67725C4433070224Df4f64CD292c5643B990B2", "18333.0"]); // 18332.999999999996 MRUN
  allocations.push(["0x46547EC844d9E2996DD0fC4D5626B71191880A3D", "18333.0"]); // 18332.999999999996 MRUN
  allocations.push(["0x1F6A2788BCaa647baC0c981c22e30C0ffd8Ac616", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xA7B336D9E7f748D276bCa12490b03ccBb4071C3a", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x4F36394A5D937f8e13689D9F965c6ACC05000456", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xfA5eaA5d72cF76E92764E1E9128A7aE792C8486C", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x3118a9B19C8dD154D438aE3CFfCA71CCD5E77D2b", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xCfA1aBa8006906679950d2fa133342e91c6EfC59", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xAAA0fFf476aFE3d015247eFD63151364263DEcF8", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xFc7c9A53968a50F985c9E53731387e1aC6c0c221", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xc366bBACdeebC699c9E89e3958adf8622e58F9F2", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0x9B8f6A9C9E6Fb7e1F81aBDE8B228F009dBAe8397", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x2175d23A1Cdc05D219bDCd0201462C40A01aA386", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x88e5e05506dD72E25b5c1F95a5350a440E8C17Fa", "6916.2998"]); // 6916.299720202348 MRUN
  allocations.push(["0x00b5b00C7F0E29a1C11e815D03cd7367316eE946", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x46D7ACAD8CD02d1E6497cF0D6283Bda45cc31892", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xcD8451ACD6b8EF00442F32be6de8Afb93F0dd799", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x8795663D1a814a810a39c2718377313a1c8f57aC", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x57986BbA1B8357D0C8536d51D7e23B161E90Ba8F", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x38b15BFdA512900FcD056ab43B009FA86234CDA9", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0x3466D70E6fB1c8CaB31dE6b4C5D09723d0C30c39", "9569.311"]); // 9569.3109567166 MRUN
  allocations.push(["0x0Ce8c22e95eec42A29AB1D9348d7111d3B244291", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xFB228336E83a81B1DA21594c884551f87Fa079E7", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0xBeE9B60c4bd75750da62d327bF06D70da8b9b356", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x6DF57E98a9DF151c56748505C1c875332E97E4Ff", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xf435fD8821aa5F8C2C815ba09e065a360F709f2c", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xDf2aaE5D195679F0209BEe918f6Ce7ee2f0DE9a8", "3330.0"]); // 3330.0 MRUN
  allocations.push(["0x70D7060C76f8D8A20F8553ae3EFc12E048A8070e", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xB29D36e477Bf1198c269d49871A8f8cDE8D7D096", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x96e1DDde9F672127f9d0CAf017911861Ff08f475", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x531bEF9B0C386CA1eE9Cc0f58C7b5F21D00D8689", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x4286419E11938Ab8EcdeC7D74438e1FC201153F4", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xf7A060e9A79228597dea4627C08b641ec74135A2", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x94D5F820538974f0f15cD182d18cf0801be7b9Ad", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xe9798fE7Cfca252cFc7e0fa046D6ED7948CcaE42", "5199.2401"]); // 5199.2400163754455 MRUN
  allocations.push(["0xD7F4AFEdD1a47b016ba122920A7E9C3AC2Bb810d", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xd1618FE249D23c679Ab863AAD83E809094d76D71", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x6B90dEa64521B990063cD3593856FAe643D6EF54", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xa7d15FBfBf1925bCDd1bcfEB662DA61CC8E482b1", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x14fcaD7775853444D2826C14a88F020F8A1E8131", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x72FEcb76a39536F6851cb53deAE03e66CF3a8d4A", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x0671ec9319e8d6B14cce3A1adCc13e6C8bF831D8", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x3fA4682DfdC0768f338C4Ac6FADb20379Cf9d3e2", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xD547282f26c255A466Cd796fbb64920bea6F12e3", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x3369a37E680CBE6485E5550706490c77e8d76c78", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x592cc2bC5c1330279bEB8188a818F724339b3621", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xeC9b106e925ccBF65d1CDE7232154f3788fdaC4C", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xb863345425f0E3DE4cE85192864708cEa5762eFb", "3330.0"]); // 3330.0 MRUN
  allocations.push(["0x444F9776cDf2FDFdaF001ccAB55B1D97b1f13b21", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x2aCbF46074cd21Ad8646B72010444778dd5D376E", "4833.0"]); // 4832.999999999999 MRUN
  allocations.push(["0xF1e5254Fd99Fa8E82607DE8733AA2884083ebECC", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x6Fdc626aF4bBCd18991db9eEE62Bce1b0de26E55", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xdfFf0d87D53019738C95A890BBaBC527C0bF2312", "3330.0"]); // 3330.0 MRUN
  allocations.push(["0x51B423373B8736a1Ca7da5eD6b99528f05ca6fA6", "1700.0"]); // 1700.0 MRUN
  allocations.push(["0xD9e94F9Bc8A280Caa35068586b6b8f0d4D793EbA", "3000.0"]); // 2999.9999999999995 MRUN
  allocations.push(["0x3fa8AA4Dc88E328a967832ea8361DE21e2d9C574", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x5e0cc9572CCA8f1cB0Ab67F153d30c447453542E", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xACDa8eB033A97ea6D0EA57191b94ecd579F83dEA", "1000.0"]); // 999.9999999999999 MRUN
  allocations.push(["0x03dAc5270f05a7FD9BeFDe1Ce034Aa0EB76C3020", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xcB6f0E5341ede98e027420b5479098C7760eB0Fb", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xE017D623549A16488d3710C2426e02b84d52C8f2", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x0D8A01fa505b70b5eb7f8adc01B7d0263629B83A", "3326.0782"]); // 3326.07819426036 MRUN
  allocations.push(["0x5c375A4299baa0f8FB431db3728A36181Ef11949", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x1E75109B4aBaBDDcA5C56Ce80a6F9022CF708a47", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x25456b8A43B679074f62b5B5bd6329B272a3cEC3", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x6ab5E94f5Fffdf61a776BA2430dCfBCd59E76c55", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x5e994d5b8222756CA5934A3aDD8CFC89F50E2178", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x70f85EE4ad9a45854D17Df1EF469f2E8011fB915", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x3a3421F7d6c7a6C51f514dB6afA497421F585Bf6", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x309Ae43fb80ca81B27937DD36ac730B918F5B83d", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x62a9bB00dFc4d6303A02EFa5370B3997F7363674", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x5fC4F8a75eeEA3F84Ed11bD8AF09760583D51f1d", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0x5CC2C251Cf8489b0e29e9ba63Cc76c385A2Cf2C7", "12384.0723"]); // 12384.072273905358 MRUN
  allocations.push(["0x1ee833024b04df36BA4731F5fD90DC81a25D0D22", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0xD072DFc102a68263d4bFa6d5EE01674bbC7985F3", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0x835649A4Ad9C806405B03e39BFCd02D6e81B408F", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x1B81C4aE75f4fa005462c3B15b737E13487204ef", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0xCb51997cCa1d0a64e647Eb5C5Ca489757Bf02566", "13333.0"]); // 13333.0 MRUN
  allocations.push(["0xD3C0d622f902258a1B2BC7AC5F213f0ed8d04d71", "1610.5047"]); // 1610.5046056382832 MRUN
  allocations.push(["0xe14C85483c47ee7ED5d74111e6ff47F8bf9567d4", "3333.0"]); // 3332.9999999999995 MRUN
  allocations.push(["0x8011680D8e3b2Fbdd7A552006eab30569b20D0BB", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xD0EF643Cacb56Da91AeE474D103cc46f2080f56c", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x155E45e90841eab750D5deb3B530665E3d22526C", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xcfb6Ee204715D97455FdcB829D73fEfD1b4c2c6C", "7704.3618"]); // 7704.36178649689 MRUN
  allocations.push(["0x72B92f3dde5AA83709877c50DDC86DE36ECA3C3D", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xcE5c30472F085f1c000dcc1c9B6f127C06c244A6", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x24ceaFa14E087a73ed075105844f35AF57329Bbf", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x3B5cc67CfE43c312f84c7a5ADcf18Be63bD6baFf", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xE09773Bcde620F53b4Ee0e392915a8827269e0A7", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xB61D3289eB4cd812a7Fc8beC9EF04223C0348ca4", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xF3DF700600E24AEE1C74E7B98aaAd286772f1607", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xc0D773CA30871fEF7C21ceDfa60D380215d45A3D", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xB0F161160E2766f6D042a47521e5b95A249f2293", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xbf9E12B4270F12b0e4A3ab4D2E3973D25C724AA7", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x19d37e98d07B597a815E959a1A9e60F5227ECBbA", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xF263D53d70BfD4b191cAC2D2322aB6F5daF977Fb", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x8F0f6F527F0614B7385da14E7609DeB5d6ac417E", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x544a8af06C55fb92DD7E02F22db76DF245942D19", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xFfa63650fdA779F51d017C5A448C310c4ebb8106", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x9dEE43d523FaF8259EFFCf5A29Aff2222F34CE3C", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xf7c748f7E20CE5f6D58D0b84A12784e6b492DbC0", "5733.4044"]); // 5733.404338003358 MRUN
  allocations.push(["0xE1fa4e6D69494B0724a8277EAa3E878e8dA4440f", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x80ec30eA661D82ff7CebBCF562ABbC30197dD096", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xd9e8286B24cf014cD839bc4cd12a6fE820e239f3", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x23265a447778f0e7B0D2026321e2E4aA6133EE99", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x6d3690E80eB7a73043273e4191860b09b4fa465f", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x7eB440a63B72510bb2604AdC867A5A8757B3d7f1", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xdfCde685c74C13dF73D289aBD22a031ebC5181D3", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x4Be1F5DA8cB9Da27b0dD6D28CF012898cD89B544", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xf2cd0e3f89DC918d79B34C560FAb5FD39bf5F7B7", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x65c932443214D13DEC755B795D708045067997c7", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x5Ef0aF38188DB8145Ef7F69542B0ac9dd75216E5", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xf4aD566621638a2aE7e1a39B4945e35747514Ad2", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x9Bd1b303b09A33152B074786c72d886FD1247cc6", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xbd261Bda33b5812bbc5E330974d4A6B6f587Ce66", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xE95fe1B3F60d4b7Ff9329f666b97216633EC961B", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x1fd8563c594cB7480919a5470EBc21EfbAcDEC9b", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x68A7b8eaEbeA6cb92ac0349c478B2b6AA6eFB9d6", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x3Db5E4513D83E5755E7562Dc4Dd2e23D9D4efD48", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xDf2bE615a0627d33F5Cdf55810fF2cDdcef51ebA", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xD03270f2B2F6Eec2Cc2d94b59d8B560f8990220E", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x021360E26c7C04D91622a7C310c3891af4DAf9C6", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x84206bCdEaAF09C42c1b0Cc552F8d267bD19af45", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x405054C97fF467e61BbBD1c6c6b2EE492028512e", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x91Bc9F315a2Ce92ed94910f0797B4a2ef8C37E1B", "3753.7271"]); // 3753.7270309799605 MRUN
  allocations.push(["0x1E9442C78bf24a5fFAbf4B97dE91fFa070328e47", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xF43fb253BeE0c814a5d27d1e3e96764F21B18117", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x65454A3887c8290060DFc5D76826EB648EB5F2C1", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xF2019C719303513133d41113D6d40353745aAC4D", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x8DAfccB0bcD8539eaB6f90887Db0CE4670323b25", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x8f650E3F81af85dA36e13eCADea7d9fcfB015075", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x5d2439090323B8a398786b1c267eb2dDa72Fbf2b", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x36076ef083bC968a5A81891b35ba9C45439F8239", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x6cc5766eA48A33eCbDf7C19b734E3156e1f2aecc", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xB718887CBA6735BAcB3dc33743413940EF8982B8", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x7CBc5392e6cb1730b3eBA123014845E09b77c91C", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x9aF906c01f75154dd3402dfa441C7a4251C3201F", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x68366914C0AF1E2a68Bd425EcA2E139e71e30439", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xa1a3331CC412fc9B4bE1f6e8E0fe2DB20775Fe42", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xC7fC8eFB1425e8dB3D30ac4B7146473d63472237", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xF76393db6c8fB14803dd8794799ba5Df2C324788", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x0b8fAc7f8CAe33CAbb523ec14260a2a8cbD8c179", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x9a3b6842A42C4aa2536Eb77d7Af9560044c6BBB8", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0xe0feC790368De4Ee5e4f11e1f2865Ca53aa81e22", "10000.0"]); // 10000.0 MRUN
  allocations.push(["0x8bC4644Cc838582640a191E23C412Bfbd0e0a9CA", "6740.5562"]); // 6740.556146384976 MRUN

  let totalAmount = ethers.BigNumber.from("0");
  for (let i = 0; i < allocations.length; i++) {
    let amount = ethers.utils.parseEther(allocations[i][1]);
    totalAmount = totalAmount.add(amount);
  }

  let encodedAllocations = [];
  const abiEncoder = new ethers.utils.AbiCoder();
  for (let i = 0; i < allocations.length; i++) {
    let beneficiary = allocations[i][0];
    let amount = ethers.utils.parseEther(allocations[i][1]);
    encodedAllocations.push(abiEncoder.encode(["address", "uint256"], [beneficiary, amount]));
  }

  console.log("Parameters for", vestingName, "Vesting:")
  console.log("  Total allocation:", ethers.utils.formatEther(totalAmount), "MRUN");
  console.log("    Locked:", formatEther(totalAmount.mul(lockBps).div(10000)), "MRUN or", lockBps/100, "% of total allocation");
  console.log("      lockClaimTime:", new Date(lockClaimTime * 1000));
  console.log("    Vested:", formatEther(totalAmount.mul(vestBps).div(10000)), "MRUN or", vestBps/100, "% of total allocation");
  console.log("      vestStart:", new Date(vestStart * 1000));
  console.log("      vestInterval:", vestInterval, "s or", vestInterval / day, "days");
  console.log("      vestDuration:", vestDuration, "s or", vestDuration / day, "days or", vestDuration / day / 30, "months");
  console.log("      vestEnd:", new Date((vestStart + vestDuration) * 1000));
  console.log("  Recipients:", allocations.length);

  vesting = await deploy(vestingContractName, {
    from: deployer,
    args: [token.address, lockBps, vestBps, lockClaimTime, vestStart, vestDuration, vestInterval],
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: true,
  });
  console.log(vestingName, "vesting address:", vesting.address);

  await execute("MetarunToken", { from: deployer, log: true }, "mint", deployer, totalAmount);

  await execute("MetarunToken", { from: deployer, log: true }, "approve", (await deployments.get(vestingContractName)).address, totalAmount);

  await execute(vestingContractName, { from: deployer, log: true }, "setAllocations", encodedAllocations);

  let balanceOnVesting = await read("MetarunToken", "balanceOf", vesting.address);
  console.log("Planned to allocate for ", vestingName, ":", formatEther(balanceOnVesting), "MRUN");
  console.log("Actually allocated for ", vestingName, ":", formatEther(totalAmount), "MRUN");
};

module.exports.tags = ["VestingScaleSwap"];
module.exports.dependencies = ["MetarunToken"];
