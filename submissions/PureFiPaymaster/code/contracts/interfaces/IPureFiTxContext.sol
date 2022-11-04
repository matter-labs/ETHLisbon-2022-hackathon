// SPDX-License-Identifier: MIT OR Apache-2.0

pragma solidity ^0.8.0;

interface IPureFiTxContext {

    function pureFiContextData() external view returns (
        uint256, //sessionID
        uint256, //ruleID
        uint256, //validUntil
        address, //sender
        address //issuer
    );
    
}
