pragma solidity ^0.8.17;

import "./cgToken.sol";

contract cgFactory {

    // struct
    struct CgToken {
        cgToken tokenContract;
        uint createdAt;
    }

    // contracts
    /// @dev list of all the CgTokens created
    CgToken[] public cgTokenList;
    GithubAddressRegister public githubAddressRegister;

    event NewCgTokenCreated(address _addr, string _name, string _symbol, uint16 _percFundingDistribute);

    constructor(address _githubAddressRegister) {
        githubAddressRegister = GithubAddressRegister(_githubAddressRegister);
    }

    function generate(
        string memory _name,
        string memory _symbol,
        uint16 _percFundingDistribute
    ) external returns(address) {

        cgToken cgt = new cgToken(
            _name,
            string.concat("cg", _symbol),
            100000 * (10 ** 18),
            _percFundingDistribute,
            address(githubAddressRegister),
            msg.sender
        );

        cgTokenList.push(CgToken({
            tokenContract: cgt,
            createdAt: block.timestamp
        }));

        emit NewCgTokenCreated(address(cgt), _name, _symbol, _percFundingDistribute);

        return address(cgt);
    }

}
