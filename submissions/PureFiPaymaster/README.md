# PureFi custom Paymaster

Original codebase is derived from the "Build a custom paymaster" tutorial from the [zkSync v2 documentation](https://v2-docs.zksync.io/dev/).

The idea of the Paymaster is inspired by the [PureFiContext](https://github.com/purefiprotocol/sdk-solidity/blob/master/contracts/PureFiContext.sol) contract, which is following OpenZeppelin re-entrancy guard contract design approach. Meaning that it is setting context storage variables before target Tx starts, and erases after it finishes. 

[PureFiContext](https://github.com/purefiprotocol/sdk-solidity/blob/master/contracts/PureFiContext.sol) itself is the part of the PureFi protocol implementation which delivers AML (Anti-money laundering) verification data into the smart contract, thus allowing smart contract designers and operators take the decision either to accept or to block incoming funds (due to a high risk associated with the address or transaction, for example). PureFi makes use of the so called Rules (identified by RuleID), which associates the identifier (ruleID) with the explisit verification that is 
performed on the PureFi Issuer side. This process is typically initiated by the front-end (dApp), then verification is performed and signed package is provided to be used by the dApp to convince Smart contract that required veficication was performed, and it can accept funds. The detailed guide and description can be found [here](https://docs.purefi.io/integrate/products/aml-sdk/interactive-mode)

[PureFiPaymaster](./contracts/PureFiPaymaster.sol) accepts signed packages issued by the PureFi issuer within the Paymaster payload
```
    (uint[4] memory data, bytes memory signature) = abi.decode(input, (uint[4], bytes));
```

then decodes and validates this data
```
    address issuer = recoverSigner(keccak256(abi.encodePacked(data[0], data[1], data[2], data[3])), signature);
    require(hasRole(ISSUER_ROLE, issuer), "PureFiPaymaster: Issuer signature invalid");
    require(data[2] + graceTime >= block.timestamp, "PureFiPaymaster: Credentials data expired");
```

then set up the transaction context variables.
```
    address contextAddress = address(uint160(_transaction.to));
    contextData[contextAddress] = PureFiContext(data[0], data[1], data[2], address(uint160(data[3])), issuer);
```

These variables could be then queried by the target smart contract [FilteredPool.sol](./contracts/example/FilteredPool.sol) to make sure that verification was performed according to the expected rule.
```
    function depositTo(
        uint256 _amount,
        address _to
    ) external {
        //verify sender funds via PureFiContext
        (uint256 sessionID, uint256 ruleID, , address verifiedUser, ) = contextHolder.pureFiContextData();

        require(ruleID == expectedDepositRuleID, "Invalid ruleID provided");
        require(msg.sender == verifiedUser, "Invalid verifiedUser provided");
        _deposit(_amount, _to);
       
    }
``` 
> contextHolder in the code above is actually the PureFiPaymaster contract.

This way the smart contract can be sure that funds and the sender address were verified according to the ruleID expected, and thus, it's safe to accept these funds from the user. 

## Deployment and usage

> complete deployment and test requires about 0.03 ETH

Compiling and deployment is performed by the following script:
- `redeploy.sh`

the test is performed by the following command:
- `yarn hardhat deploy-zksync --script use-paymaster-modified.ts`: 

## Testing flow
1. ERC20, FilteredPool and PureFiPaymaster are deployed
2. a new wallet (a.k.a. emptyWallet) is generated and obtains 100 ERC20 tokens. No ETH balance exists on this address
3. approval tx is issued from emptyWallet to allow FilteredPool to grap tokens. Tx is processed via PureFiPaymaster which pays for this tx
3. deposit tx is issued from emptyWallet to FilteredPool. ERC20 tokens are transferred from emptyWallet to FilteredPool, totalCap is encreased. 
3. withdraw tx is issued from emptyWallet to FilteredPool. ERC20 tokens are transferred from FilteredPool to emptyWallet, totalCap is decreased.

Important: deposit and withdraw operations are using different PureFi rules (which is usually the case in real life)

## Author

Miha Tiutin, CTO @ PureFi. 
contact: miha.tiutin@purefi.io
telegram: @mtiutin
ZkSync address: 0x13a8CB7f655162F468B2Bc4CD209c22704C9925A