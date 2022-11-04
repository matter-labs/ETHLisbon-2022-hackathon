// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Session is Ownable {
    bytes4 private constant ERC20_TRANSFER =
        bytes4(keccak256("transfer(address,uint256)"));
    bytes4 private constant ERC20_APPROVE =
        bytes4(keccak256("approve(address,uint256)"));
    bytes4 private constant ERC721_SET_APPROVAL_FOR_ALL =
        bytes4(keccak256("setApprovalForAll(address,bool)"));
    bytes4 private constant ERC721_TRANSFER_FROM =
        bytes4(keccak256("transferFrom(address,address,uint256)"));
    bytes4 private constant ERC721_SAFE_TRANSFER_FROM =
        bytes4(keccak256("safeTransferFrom(address,address,uint256)"));
    bytes4 private constant ERC721_SAFE_TRANSFER_FROM_BYTES =
        bytes4(keccak256("safeTransferFrom(address,address,uint256,bytes)"));
    bytes4 private constant ERC1155_SAFE_TRANSFER_FROM =
        bytes4(
            keccak256("safeTransferFrom(address,address,uint256,uint256,bytes)")
        );

    struct SessionInfo {
        uint256 version;

        mapping(address => uint256) addrs;
        uint256 addrsCount;
        bool expired;
    }

    mapping(address => SessionInfo) public sessions;

    function creteSession(address signer, address[] memory newAddrs) external onlyOwner {
        sessions[signer].version += 1;

        uint256 version = sessions[signer].version;
        uint256 count = 0;
    
        for (uint256 i = 0; i < newAddrs.length; i++) {
            if (sessions[signer].addrs[newAddrs[i]] == version) {
                continue;
            }

            sessions[signer].addrs[newAddrs[i]] = version;
            count += 1;
        }

        sessions[signer].addrsCount = count;
        sessions[signer].expired = false;
    }

    function deleteSession(address signer) external onlyOwner {
        sessions[signer].expired = true;
    }

    function inSession(address signer, address to, bytes memory data)
        internal
        view
        returns (bool)
    {
        if (sessions[signer].expired) {
            return false;
        }

        if (sessions[signer].addrsCount == 0) {
            return true;
        }

        address spender = getSpender(to, data);
        return sessions[signer].addrs[spender] == sessions[signer].version;
    }

    function getSpender(address _to, bytes memory _data)
        internal
        pure
        returns (address spender)
    {
        if (_data.length >= 68) {
            bytes4 methodId;
            assembly {
                methodId := mload(add(_data, 0x20))
            }
            if (
                methodId == ERC20_TRANSFER ||
                methodId == ERC20_APPROVE ||
                methodId == ERC721_SET_APPROVAL_FOR_ALL
            ) {
                assembly {
                    spender := mload(add(_data, 0x24))
                }
                return spender;
            }
            if (
                methodId == ERC721_TRANSFER_FROM ||
                methodId == ERC721_SAFE_TRANSFER_FROM ||
                methodId == ERC721_SAFE_TRANSFER_FROM_BYTES ||
                methodId == ERC1155_SAFE_TRANSFER_FROM
            ) {
                assembly {
                    spender := mload(add(_data, 0x44))
                }
                return spender;
            }
        }

        return _to;
    }
}
