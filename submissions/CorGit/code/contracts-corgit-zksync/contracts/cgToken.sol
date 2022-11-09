pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./GithubAddressRegister.sol";

contract cgToken is ERC20, AccessControl {

    // uint16
    /// @dev among received funds, this is the percentage of funds redistributed
    uint16 public percFundingDistributed;
    /// @dev among received funds, this is the percentage of funds used to mint new tokens
    uint16 public percFundingForNewTokens;
    /// @dev minimum value below which percFundingDistributed cannot go
    uint16 constant MIN_PERC_FUNDING_DISTRIBUTED = 1;

    // uint256
    /// @dev tokens locked for promised payments (to avoid double-spending)
    uint256 public lockedTokensForPayments;
    /// @dev Number of payments made
    uint256 public nextPaymentId;

    // struct
    /**
     * @notice Manages the details of a single payment
     * @member {uint} amount - how much is (or has been) paid
     * @member {paid} paid - true if it has been paid, false otherwise
     */
    struct SinglePayment {
        uint256 amount;
        bool paid;
    }

    struct Payment {
        uint creation;
        uint totalTokenAmount;
        uint totalTokenClaimed;
        string name;
        uint numOfUsers;
        bool claimCompleted;
    }

    // mapping
    /// @dev save the details of a payment
    mapping(uint => Payment) public payments;
    /// @dev list of pending payments, connected to given githubID - (paymentID =>(githubID => SinglePayment))
    mapping(uint256 => mapping(uint256 => SinglePayment)) public paymentAmounts;
    /// @dev list of all the payments a user has ever received
    mapping(uint256 => uint256[]) public userPayments;

    // bytes32
    /// @dev role necessary to pay (create rewards)
    bytes32 public constant PAYER_ROLE = keccak256("PAYER");

    // address
    GithubAddressRegister githubAddressRegister;

    event NewGroupPayment(uint indexed _id, uint256 _numOfUsers);
    event PaymentPending(uint256 indexed _githubID, uint256 _amount);
    event PaymentClaimed(uint256 indexed _githubID, uint256 indexed _paymentId, uint256 _amount);

    constructor(
        string memory _name,
        string memory _symbol,
        uint _initialSupply,
        uint16 _percFundingDistribute,
        address _githubAddressRegister,
        address creator
    ) ERC20(_name, _symbol) {
        require(_percFundingDistribute >= MIN_PERC_FUNDING_DISTRIBUTED, "Invalid _percFundingDistribute");
        percFundingDistributed = _percFundingDistribute;
        percFundingForNewTokens = 100 - _percFundingDistribute;
        githubAddressRegister = GithubAddressRegister(_githubAddressRegister);
        _mint(address(this), _initialSupply);
        _setupRole(DEFAULT_ADMIN_ROLE, creator);
        _setupRole(PAYER_ROLE, creator);
    }

    /**
    * Allow the payment to the given githubID for the specified amount
    **/
    function pay(uint256[] calldata _githubID, uint256[] calldata _amount, string calldata _name) public onlyRole(PAYER_ROLE) {
        require(_githubID.length == _amount.length, "Arrays must have equal length");

        uint totalAmount = 0;
        uint tokensAvailable = balanceOf(address(this)) - lockedTokensForPayments;

        // add the payment details
        for (uint i=0; i<_githubID.length; ++i){
            // record the amount paid, and make sure the amount is available
            totalAmount += _amount[i];
            require(totalAmount <= tokensAvailable, "Not enough tokens for payment");
            // add SinglePayment detalils
            paymentAmounts[nextPaymentId][_githubID[i]] = SinglePayment({
                amount:  _amount[i],
                paid: false
            });
            // add the id of the payment to the list
            userPayments[ _githubID[i] ].push(nextPaymentId);
            // emit the event for the specific user
            emit PaymentPending(_githubID[i], _amount[i]);
        }

        // save the payment details
        payments[nextPaymentId] = Payment({
            creation: block.timestamp,
            totalTokenAmount: totalAmount,
            totalTokenClaimed: 0,
            name: _name,
            numOfUsers: _githubID.length,
            claimCompleted: false
        });

        emit NewGroupPayment(nextPaymentId, _githubID.length);

        // update variables for next payments
        lockedTokensForPayments += totalAmount;
        nextPaymentId++;
    }

    /**
    * Collect the payments for a user
    **/
    function collectPayment(address _to, uint _paymentId) public {
        uint githubId = githubAddressRegister.addressToGithubID(_to);
        require(githubId != 0, "Unregistered address");

        uint amount = paymentAmounts[_paymentId][githubId].amount;
        require(!paymentAmounts[_paymentId][githubId].paid
                    && amount > 0, "No amount or claimed");
        _transfer(address(this), _to, amount);
        paymentAmounts[_paymentId][githubId].paid = true;
        payments[_paymentId].totalTokenClaimed += amount;
        if (payments[_paymentId].totalTokenClaimed == payments[_paymentId].totalTokenAmount)
            payments[_paymentId].claimCompleted = true;

        lockedTokensForPayments -= amount;
        emit PaymentClaimed(githubId, _paymentId, amount);
    }

    /**
    * A cg Token holder can collect its underlying assets, by burning _amount of tokens.
    * Payment is returned in proportion in WETH and DAI, and is sent to the
    * selected wallet among the allowed one from GithubAddressRegister SC
    **/
    function convert(uint256 _amount, address _to) public {

    }

    /**
    * Call this function with the amount of weth and dai to transfer to this contract.
    * Make sure to have the right allowance
    **/
    function contribute() public payable {
        require(msg.value>0, "No contribution provided");
        require(percFundingDistributed>0, "Invalud percFundingDistributed");
        uint amountReceived = msg.value;
        uint amountToRedistribute = amountReceived * percFundingDistributed / 100;
        uint amountToNewMint = amountReceived - amountToRedistribute;
        uint balanceBeforeReceive = address(this).balance - msg.value;
        uint newTokens = (amountToNewMint * totalSupply()) / ( balanceBeforeReceive + amountToRedistribute );
        _mint(address(this), newTokens);
    }



}
