// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import {IPaymaster, ExecutionResult} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol";
import {IPaymasterFlow} from "@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol";
import {TransactionHelper, Transaction} from "@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol";

import "@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol";

import "@openzeppelin/contracts/interfaces/IERC20.sol";

import "./interfaces/IPureFiTxContext.sol";
import "./libraries/SignLib.sol";
import "./libraries/BytesLib.sol";

contract PureFiPaymaster is AccessControl, SignLib, IPaymaster, IPureFiTxContext{

    address public pureFiSubscriptionContract;

    bytes32 public constant ISSUER_ROLE = 0x0000000000000000000000000000000000000000000000000000000000009999;
    // context data
    struct PureFiContext{
        uint256 sessionID;
        uint256 ruleID;
        uint256 validUntil;
        address sender;
        address issuer;
    }


    uint8 public testMode;
    uint256 internal graceTime; //a period verification credentials are considered valid;

    mapping (address => PureFiContext) contextData; //context data structure


    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            "PureFiPaymaster: Only bootloader can call this method"
        );
        // Continure execution if called from the bootloader.
        _;
    }

    constructor(address _admin, address _subscriptionContract) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        testMode = 2;
        pureFiSubscriptionContract = _subscriptionContract; //this is to validate the PureFi subscription in future. 
        graceTime = 180;//3 min - default value;
    }

    function version() external pure returns(uint256){
        //xxx.yyy.zzz
        return 1000025;
    }

    function setGracePeriod(uint256 _gracePeriod) external onlyRole(DEFAULT_ADMIN_ROLE){
        graceTime = _gracePeriod;
    }

    function setTestMode(uint8 _testMode) external onlyRole(DEFAULT_ADMIN_ROLE){
        testMode = _testMode;
    }

    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable override onlyBootloader returns (bytes memory context) {
        require(
            _transaction.paymasterInput.length >= 4,
            "PureFiPaymaster: The standard paymaster input must be at least 4 bytes long"
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );

        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            //unpack general() data
            (bytes memory input) = abi.decode(_transaction.paymasterInput[4:], (bytes));
            //unpack embedded data geberated by the PureFi Issuer service
            
            /**
            @param data - signed data package from the off-chain verifier
                data[0] - verification session ID
                data[1] - circuit ID (if required)
                data[2] - verification timestamp
                data[3] - verified wallet - to be the same as msg.sender
            @param signature - Off-chain issuer signature
            */

            (uint[4] memory data, bytes memory signature) = abi.decode(input, (uint[4], bytes));

            //get issuer address from the signature
            address issuer = recoverSigner(keccak256(abi.encodePacked(data[0], data[1], data[2], data[3])), signature);

            require(hasRole(ISSUER_ROLE, issuer), "PureFiPaymaster: Issuer signature invalid");
            require(data[2] + graceTime >= block.timestamp, "PureFiPaymaster: Credentials data expired");

            address contextAddress = address(uint160(_transaction.to));

            //saving data locally so that they can be queried by the customer contract

            contextData[contextAddress] = PureFiContext(data[0], data[1], data[2], address(uint160(data[3])), issuer);
            
            // Note, that while the minimal amount of ETH needed is tx.ergsPrice * tx.ergsLimit,
            // neither paymaster nor account are allowed to access this context variable.
            uint256 requiredETH = _transaction.ergsLimit *
                _transaction.maxFeePerErg;

            // require(msg.value >= requiredETH, "PureFiPaymaster: not enough ETH to pay for tx");

            // The bootloader never returns any data, so it can safely be ignored here.
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }("");
            require(success, "PureFiPaymaster: Failed to transfer funds to the bootloader");

            if(testMode > 7){
                // delete contextData[contextAddress]; // THIS DOESN'T WORK
                contextData[contextAddress] = PureFiContext(0, 0, 0, address(uint160(0)), address(0)); // THIS DOESN'T WORK EITHER. Don't set testMode > 7
            }
        } 
        else {
            revert("Unsupported paymaster flow");
        }
    }

    function pureFiContextData() external override view returns (
        uint256, //sessionID
        uint256, //ruleID
        uint256, //validUntil
        address, //sender
        address //issuer
    ) {
        address _contextAddr = msg.sender;
        if(testMode > 7) //don't chage testMode to > 7, the code below will result in "revert" on gasEstimation.
            require(contextData[_contextAddr].sessionID > 0, "PureFi: session context is not initialized");
        return (contextData[_contextAddr].sessionID, contextData[_contextAddr].ruleID, contextData[_contextAddr].validUntil, contextData[_contextAddr].sender, contextData[_contextAddr].issuer);            
    }

    /**
    for testing purposes only
     */
    function pureFiContextDataX(address _contextAddr) external view returns (
        uint256, //sessionID
        uint256, //ruleID
        uint256, //validUntil
        address, //sender
        address //issuer
    ) 
    {
        return (contextData[_contextAddr].sessionID, contextData[_contextAddr].ruleID, contextData[_contextAddr].validUntil, contextData[_contextAddr].sender, contextData[_contextAddr].issuer);    
    }

    function postOp(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedErgs
    ) external payable onlyBootloader {
        //MIHA: no storage writing operations here. results in CALL_EXCEPTION
    }

    receive() external payable {}
}
