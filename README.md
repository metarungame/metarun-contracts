# MRUN ERC-20 Contracts for Metarun game and marketplace

## MRUN Token Specification

* Networks: BSC
* contract address: [0xCa0D640a401406f3405b4C252a5d0c4d17F38EBb](https://bscscan.com/token/0xCa0D640a401406f3405b4C252a5d0c4d17F38EBb)
* Standard: BEP-20/ERC-20
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
yarn hardhat deploy --network <bsc>
yarn hardhat etherscan-verify --network <bsc>
```
