pragma solidity >=0.8.0;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/IPureFiTxContext.sol";


contract FilteredPool is Initializable{

    uint256 public constant expectedDepositRuleID = 12345;
    uint256 public constant expectedWithdrawRuleID = 56789;

    uint256 public totalCap;
    IERC20 public basicToken;
    IPureFiTxContext public contextHolder;//a.k.a. Paymaster

    event Deposit(address indexed writer, uint256 amount);
    event Withdraw(address indexed writer, uint256 amount);


    bool public testMode;
    //testing perposes only
    uint256 public contextSessionID;
    uint256 public contextRuleID;
    address public contextVerifiedUser;

    constructor(address _basicToken, address _purefiPaymaster){
        basicToken = IERC20(_basicToken);
        contextHolder = IPureFiTxContext(_purefiPaymaster);
        testMode = false;
    }

    function toggleTestMode() external{ //for testing purposes only. Should be onlyOwner
        testMode = !testMode;
    }

    function setPureFiContext(address _purefiPaymaster) external { //test testing purposes only. Should be onlyOwner
        contextHolder = IPureFiTxContext(_purefiPaymaster);
    }

    /**
    * deposit ERC20 tokens function, assigns Liquidity tokens to provided address.
    * @param _amount - amount to deposit
    * @param _to - address to assign liquidity tokens to
    */
    function depositTo(
        uint256 _amount,
        address _to
    ) external {
        //verify sender funds via PureFiContext
        (uint256 sessionID, uint256 ruleID, , address verifiedUser, ) = contextHolder.pureFiContextData();
        if(!testMode){
            require(ruleID == expectedDepositRuleID, "Invalid ruleID provided");
            require(msg.sender == verifiedUser, "Invalid verifiedUser provided");
            _deposit(_amount, _to);
        }else{
            contextSessionID = sessionID;
            contextRuleID = ruleID;
            contextVerifiedUser = verifiedUser;
        }
        
       
    }

    /**
    * converts spefied amount of Liquidity tokens to Basic Token and returns to user (withdraw). The balance of the User (msg.sender) is decreased by specified amount of Liquidity tokens. 
    * Resulted amount of tokens are transferred to specified address
    * @param _amount - amount of liquidity tokens to exchange to Basic token.
    * @param _to - address to send resulted amount of tokens to
     */
    function withdrawTo(
        uint256 _amount,
        address _to
    ) external 
    {
        //verify sender funds via PureFiContext
        (uint256 sessionID, uint256 ruleID, , address verifiedUser, ) = contextHolder.pureFiContextData();

         if(!testMode){
            require(ruleID == expectedWithdrawRuleID, "Invalid ruleID provided");
            require(msg.sender == verifiedUser, "Invalid verifiedUser provided");
            _withdraw(_amount,_to);
        }else{
            contextSessionID = sessionID;
            contextRuleID = ruleID;
            contextVerifiedUser = verifiedUser;
        }
        
    }

    function _deposit(uint256 amount, address to) private {
        require(basicToken.transferFrom(msg.sender, address(this), amount), "Can't transfer token");
        totalCap += amount;
        emit Deposit(to, amount);
    }

    function _withdraw(uint256 amountLiquidity, address to) private {
        totalCap -= amountLiquidity;
        basicToken.transfer(to, amountLiquidity);
        emit Withdraw(msg.sender, amountLiquidity);
    }

   }
