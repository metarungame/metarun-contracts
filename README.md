# ERC-20 token for Metarun game and marketplace

## Specification

* Network: Polygon Mainnet
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
