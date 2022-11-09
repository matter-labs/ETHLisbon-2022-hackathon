pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GithubAddressRegister is Ownable {

    // mappings
    /// @dev stores the match between github ID and chain address. One github ID can have more than one chain address
    mapping(uint256 => address[]) public githubIDToAddress;
    /// @dev stores teh match between an address and a github ID. One address can have just one github ID connected
    mapping(address => uint256) public addressToGithubID;

    constructor() {

    }

    /**
    * @notice Adds a new address to the list of github addresses.
    * @dev Currently performed by the backend after a succesfull github login.
            Should be implemented with call by the user, that publishes a sign (approval) sent by our authorized App.
            In addition, it can be implemented via ChainLink oracle
    * @param _githubID - id of github account
    * @param _wallet - wallet address
    **/
    function addAddress(
        uint256 _githubID,
        address _wallet
    ) external onlyOwner {
        require(addressToGithubID[_wallet] == 0, "Wallet already assigned to GithubID");
        githubIDToAddress[_githubID].push(_wallet);
        addressToGithubID[_wallet] = _githubID;
    }

    /**
    * @notice Removes an address from the list of authorized addresses.
    * @dev Only the wallet owner can remove it, calling from one of the wallets registered under that githubID
    * @param _githubID - id of github account
    * @param _addressToRemove - address to be removed
    **/
    function removeAddress(uint256 _githubID, address _addressToRemove) public {
        bool validCaller = false;
        bool validAddress = false;
        uint indexToRemove = 0;
        address[] memory addressList = githubIDToAddress[_githubID];
        for(uint i=0; i<addressList.length; ++i) {
            if (addressList[i] == _addressToRemove) {
                indexToRemove = i;
                validAddress = true;
            }
            if (addressList[i] == msg.sender) validCaller = true;
            if (validCaller && validAddress) break;
        }
        require(validAddress && validCaller, "Cannot remove address");

        addressToGithubID[_addressToRemove] = 0;
        githubIDToAddress[_githubID][indexToRemove] = addressList[ addressList.length - 1 ];
        githubIDToAddress[_githubID].pop();
    }

}
