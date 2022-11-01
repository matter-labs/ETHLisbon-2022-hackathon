// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IPaymaster, ExecutionResult} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymaster.sol';
import {IPaymasterFlow} from '@matterlabs/zksync-contracts/l2/system-contracts/interfaces/IPaymasterFlow.sol';
import {TransactionHelper, Transaction} from '@matterlabs/zksync-contracts/l2/system-contracts/TransactionHelper.sol';

import '@matterlabs/zksync-contracts/l2/system-contracts/Constants.sol';

import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract Paymaster is IPaymaster {
    // mapping of the sponsored addresses to the N of free transactions
    mapping(address => uint256) public nFirstTx;
    // mapping of the sponsored addresses to the sponsor
    mapping(address => address) public sponsors;

    // mapping of the sponsored addresses to caller address to the counter of
    // the made free transactions
    mapping(address => mapping(address => uint256)) public txCount;

    // mapping of the sponsored funds to the sponsored address
    // mapping(address => uint256) public sponsoredFunds;

    modifier onlyBootloader() {
        require(
            msg.sender == BOOTLOADER_FORMAL_ADDRESS,
            'Only bootloader can call this method'
        );
        // Continure execution if called from the bootloader.
        _;
    }

    constructor() {}

    function validateAndPayForPaymasterTransaction(
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        Transaction calldata _transaction
    ) external payable override onlyBootloader returns (bytes memory context) {
        require(
            nFirstTx[_uintToAddr(_transaction.to)] >
                txCount[_uintToAddr(_transaction.to)][
                    _uintToAddr(_transaction.from)
                ],
            'Paymaster: you reached your free tx limit'
        );

        require(
            _transaction.paymasterInput.length >= 4,
            'Paymaster: The standard paymaster input must be at least 4 bytes long'
        );

        bytes4 paymasterInputSelector = bytes4(
            _transaction.paymasterInput[0:4]
        );
        if (paymasterInputSelector == IPaymasterFlow.general.selector) {
            // Note, that while the minimal amount of ETH needed is tx.ergsPrice * tx.ergsLimit,
            // neither paymaster nor account are allowed to access this context variable.

            uint256 requiredETH = _transaction.ergsLimit *
                _transaction.maxFeePerErg;
            // The bootloader never returns any data, so it can safely be ignored here.
            (bool success, ) = payable(BOOTLOADER_FORMAL_ADDRESS).call{
                value: requiredETH
            }('');
            require(
                success,
                'Paymaster: Failed to transfer funds to the bootloader'
            );
            txCount[_uintToAddr(_transaction.to)][
                _uintToAddr(_transaction.from)
            ]++;
        } else {
            revert('Unsupported paymaster flow');
        }
    }

    function getMyCount(address _spnosorredAddr)
        external
        view
        returns (uint256)
    {
        return txCount[_spnosorredAddr][msg.sender];
    }

    function getNFirst(address _spnosorredAddr)
        external
        view
        returns (uint256)
    {
        return nFirstTx[_spnosorredAddr];
    }

    function getSponsor(address _spnosorredAddr)
        external
        view
        returns (address)
    {
        return sponsors[_spnosorredAddr];
    }

    function sponsorTheAddress(address _addr, uint256 _n) external payable {
        require(
            nFirstTx[_addr] == 0 || sponsors[_addr] == msg.sender,
            'Paymaster: sponsor already set'
        );

        require(
            _n > 0,
            'Paymaster: The number of free transactions must be greater than 0'
        );

        nFirstTx[_addr] = _n;
        sponsors[_addr] = msg.sender;
        // sponsoredFunds[_addr] += msg.value;
    }

    function stopSponsorship(address _addr) external {
        require(
            sponsors[_addr] == msg.sender,
            'Paymaster: you are not a sponsor of this address'
        );

        nFirstTx[_addr] = 0;
        sponsors[_addr] = address(0);
        // uint256 refund = sponsoredFunds[_addr];
        // sponsoredFunds[_addr] = 0;

        // (bool success, ) = payable(address(msg.sender)).call{value: refund}('');

        // require(
        //     success,
        //     'Paymaster: Failed to transfer remaining funds to the sponsor'
        // );
    }

    function _addrToUint256(address a) internal pure returns (uint256) {
        return uint256(uint160(a));
    }

    function _uintToAddr(uint256 a) internal pure returns (address) {
        return address(uint160(a));
    }

    function postOp(
        bytes calldata _context,
        Transaction calldata _transaction,
        bytes32 _txHash,
        bytes32 _suggestedSignedHash,
        ExecutionResult _txResult,
        uint256 _maxRefundedErgs
    ) external payable onlyBootloader {
        // This contract does not support any refunding logic
    }

    receive() external payable {}
}
