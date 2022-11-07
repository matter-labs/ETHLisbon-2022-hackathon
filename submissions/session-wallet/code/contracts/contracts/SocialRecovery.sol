// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

// I referred to
// * https://vitalik.ca/general/2021/01/11/recovery.html
// * https://github.com/verumlotus/social-recovery-wallet

contract SocialRecovery is Ownable {
    uint constant GUARDIAN_CHANGE_DEPLAY = 3 days;

    bool public isSetupComplete;

    mapping(bytes32 => bool) public isGuardian;

    uint256 public guardianCount;

    uint256 public threshold;

    bool public inRecovery;

    uint256 public currRecoveryRound;

    mapping(bytes32 => uint256) public guardianHashToAdditionTimestamp;

    mapping(bytes32 => uint256) public guardianHashToRemovalTimestamp;

    struct Recovery {
        address proposedOwner;
        uint256 recoveryRound;
        bool usedInExecuteRecovery;
    }

    mapping(address => Recovery) public guardianToRecovery;

    modifier beforeSetup {
        require(!isSetupComplete, "already setup");
        _;
    }

    modifier afterSetup {
        require(isSetupComplete, "need setup");
        _;
    }

    modifier onlyGuardian {
        require(isGuardian[keccak256(abi.encodePacked(msg.sender))], "only guardian");
        _;
    }

    modifier notInRecovery {
        require(!inRecovery, "wallet is in recovery");
        _;
    }

    modifier onlyInRecovery {
        require(inRecovery, "wallet is not in recovery");
        _;
    }

    event SetupCompleted(uint256 guardianCount, uint256 _threshold);

    event GuardinshipTransferred(address indexed from, bytes32 indexed newGuardianHash);

    event RecoveryInit(address indexed by, address newProposedOwner, uint256 indexed round);

    event RecoverySupported(address by, address newProposedOwner, uint256 indexed round);
       
    event RecoveryCancelled(address by, uint256 indexed round);

    event RecoveryExecuted(address oldOwner, address newOwner, uint256 indexed round);

    event GuardianAdded(bytes32 indexed oldGuardianHash);

    event GuardianRemoved(bytes32 indexed oldGuardianHash);

    event GuardianAdditionQueued(bytes32 indexed guardianHash);

    event GuardianRemovalQueued(bytes32 indexed guardianHash);

    event GuardianRevealed(bytes32 indexed guardianHash, address indexed guardianAddr);

    function setup(bytes32[] memory guardianAddrHashes, uint256 _threshold) beforeSetup onlyOwner external {
        require(0 < _threshold, "threshold is less than 1");
        require(_threshold <= guardianAddrHashes.length, "threshold too high");

        for(uint256 i = 0; i < guardianAddrHashes.length; i++) {
            require(!isGuardian[guardianAddrHashes[i]], "duplicate guardian");
            isGuardian[guardianAddrHashes[i]] = true;
        }

        guardianCount = guardianAddrHashes.length;

        threshold = _threshold;

        isSetupComplete = true;

        emit SetupCompleted(guardianCount, threshold);
    }

    function initRecovery(address _proposedOwner) afterSetup onlyGuardian notInRecovery external {
        // we are entering a new recovery round
        currRecoveryRound++;
        guardianToRecovery[msg.sender] = Recovery(
            _proposedOwner,
            currRecoveryRound, 
            false
        );
        inRecovery = true;
        emit RecoveryInit(msg.sender, _proposedOwner, currRecoveryRound);
    }

    function supportRecovery(address _proposedOwner) afterSetup onlyGuardian onlyInRecovery external {
        guardianToRecovery[msg.sender] = Recovery(
            _proposedOwner,
            currRecoveryRound, 
            false
        );
        emit RecoverySupported(msg.sender, _proposedOwner, currRecoveryRound);
    }

    function cancelRecovery() afterSetup onlyOwner onlyInRecovery external {
        inRecovery = false;
        emit RecoveryCancelled(msg.sender, currRecoveryRound);
    }

    function executeRecovery(address newOwner, address[] calldata guardianList) afterSetup onlyGuardian onlyInRecovery external {
        require(guardianList.length >= threshold, "more guardians required to transfer ownership");
        
        for (uint i = 0; i < guardianList.length; i++) {
            Recovery memory recovery = guardianToRecovery[guardianList[i]];

            require(recovery.recoveryRound == currRecoveryRound, "round mismatch");
            require(recovery.proposedOwner == newOwner, "disagreement on new owner");
            require(!recovery.usedInExecuteRecovery, "duplicate guardian used in recovery");

            guardianToRecovery[guardianList[i]].usedInExecuteRecovery = true;
        }

        inRecovery = false;
        address _oldOwner = owner();
        _transferOwnership(newOwner);
        emit RecoveryExecuted(_oldOwner, newOwner, currRecoveryRound);
    }

    function transferGuardianship(bytes32 newGuardianHash) afterSetup onlyGuardian notInRecovery external {
        require(
            guardianHashToAdditionTimestamp[newGuardianHash] == 0, 
            "guardian queueud for addition, cannot transfer guardianship"
        );
        require(
            guardianHashToRemovalTimestamp[keccak256(abi.encodePacked(msg.sender))] == 0, 
            "guardian queueud for removal, cannot transfer guardianship"
        );
        
        isGuardian[keccak256(abi.encodePacked(msg.sender))] = false;
        isGuardian[newGuardianHash] = true;
        emit GuardinshipTransferred(msg.sender, newGuardianHash);
    }

    function initiateGuardianAddition(bytes32 guardianHash) afterSetup onlyOwner external {
        require(!isGuardian[guardianHash], "still guardian");

        guardianHashToAdditionTimestamp[guardianHash] = block.timestamp + GUARDIAN_CHANGE_DEPLAY;
        emit GuardianAdditionQueued(guardianHash);
    }

    function executeGuardianAddition(bytes32 newGuardianHash) afterSetup onlyOwner external {
        require(guardianHashToAdditionTimestamp[newGuardianHash] > 0, "guardian isn't queued for removal");
        require(guardianHashToAdditionTimestamp[newGuardianHash] <= block.timestamp, "time delay has not passed");

        guardianHashToAdditionTimestamp[newGuardianHash] = 0;

        isGuardian[newGuardianHash] = true;

        emit GuardianAdded(newGuardianHash);
    }

    function cancelGuardianAddition(bytes32 guardianHash) afterSetup onlyOwner external {
        guardianHashToAdditionTimestamp[guardianHash] = 0;
    }

    function initiateGuardianRemoval(bytes32 guardianHash) afterSetup onlyOwner external {
        require(isGuardian[guardianHash], "not a guardian");

        guardianHashToRemovalTimestamp[guardianHash] = block.timestamp + GUARDIAN_CHANGE_DEPLAY;
        emit GuardianRemovalQueued(guardianHash);
    }

    function executeGuardianRemoval(bytes32 oldGuardianHash) afterSetup onlyOwner external {
        require(guardianHashToRemovalTimestamp[oldGuardianHash] > 0, "guardian isn't queued for removal");
        require(guardianHashToRemovalTimestamp[oldGuardianHash] <= block.timestamp, "time delay has not passed");
        require(threshold < guardianCount, "guardianCount too low");

        guardianHashToRemovalTimestamp[oldGuardianHash] = 0;

        isGuardian[oldGuardianHash] = false;

        emit GuardianRemoved(oldGuardianHash);
    }

    function cancelGuardianRemoval(bytes32 guardianHash) afterSetup onlyOwner external {
        guardianHashToRemovalTimestamp[guardianHash] = 0;
    }

    function revealGuardianIdentity() afterSetup onlyGuardian external {
        emit GuardianRevealed(keccak256(abi.encodePacked(msg.sender)), msg.sender);
    }
}