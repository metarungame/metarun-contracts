# MRUN ERC-20 token for Metarun game and marketplace

## Specification

* Network: Polygon Mainnet
* Contract address: [0x267DF8C1168C9d5aE8Ee97B48c7e86d8d43D88d2](https://polygonscan.com/address/0x267df8c1168c9d5ae8ee97b48c7e86d8d43d88d2#readContract)
* Standard: ERC-20
* Name: METARUN
* Symbol: MRUN
* Supply: dynamic, capped at 1,000,000,000. It will be minted as per requirement. At the time of deployment there should be no supply minted.
* Mintable: Yes, by MINTER_ROLE
* Burnable: Yes, holder can burn his amount
* Pausable: No
* Upgradeable: No
* AccessControl: RoleBased: DEFAULT_ADMIN_ROLE, MINTER_ROLE

## Deploy and verify

```sh
export MNEMONIC=<YOUR_MNEMONIC>
export ETHERSCAN_API_KEY=<YOUR ETHERSCAN KEY>
yarn
yarn deploy:polygon
yarn verify:polygon
```
