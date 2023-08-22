//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.9;

library Address{
    
    function isContract (address account) internal view returns(bool){
        return account.code.length>0;
    }

    function sendValue(address payable recipient,uint256 amount) internal{
        require(address(this).balance>=amount,"Amount:insufficient balance");
        (bool success,)=recipient.call{value:amount}("");
        require(success,"Address:unable to send value, recipient may have reverted");
    }

    function functionCall(address target, bytes memory data) internal returns(bytes memory){
        return functionCall(target,data,"Adresss:low-level call failed");
    }

    function functionCall(address target, bytes memory data,string memory errorMessage) internal returns(bytes memory){
        return functionCallWithValue(target,data,0,errorMessage);
    }

    function functionCallWithValue( address target,bytes memory data, uint256 value) internal returns(bytes memory){
        return functionCallWithValue(target, data, value,"Address:low-level call with value failed");
    }

    function functionCallWithValue(address target, bytes memory data,uint256 value,string memory errorMessage) internal returns(bytes memory){
        require(address(this).balance>=value,"Adress:insufficient balance for call");
        require(isContract(target),"Address:call to non-contract");
        (bool success, bytes memory returndata)=target.call{value:value}(data);
        return verifyCallResult(success,returndata,errorMessage);
    }

    function functionStaticCall(address target,bytes memory data) internal view returns(bytes memory){
        return functionStaticCall(target,data,"Address:low-level static call failed");
    }

    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage) internal view returns(bytes memory)
    {
        require(isContract(target),"Address:static call to non-contract");
        (bool success,bytes memory returndata)=target.staticcall(data);
        return verifyCallResult(success,returndata,errorMessage);
    }

    function functionDelegateCall(address target, bytes memory data) internal returns(bytes memory){
        return functionDelegateCall(target,data,"Address:low-level delegate call failed");
    }

    function functionDelegateCall(address target,bytes memory data,string memory errorMessage) internal returns(bytes memory){
        require(isContract(target),"Address:delegate call to non-contract");
        (bool success,bytes memory returndata)=target.delegatecall(data);
        return verifyCallResult(success,returndata,errorMessage);
    }

    function verifyCallResult(bool success,bytes memory returndata,string memory errorMessage) internal pure returns(bytes memory){
        if(success){
            return returndata;
        }else{
            if(returndata.length>0){
                assembly{
                    let returndata_size:=mload(returndata)
                    revert(add(32,returndata),returndata_size)
                }
            }else{
                revert(errorMessage);
            }
        }
    }
}

pragma solidity ^0.8.9;

abstract contract Context{

    function _msgSender() internal view virtual returns(address){
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata){
        return msg.data;
    }
}

pragma solidity ^0.8.9;

interface IERC20{

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint amount) external returns (bool);

    function allowance(address spender,uint256 amount) external returns(bool);

    function approve(address spender,uint256 amount) external returns(bool);

    function transferFrom(address from, address to, uint256 amount) external returns(bool);
}

pragma solidity  ^0.8.9;

abstract contract Initializable{

    uint8 private _initialized;

    bool private _initializing;

    event Initialized(uint8 version);

    modifier initializer(){
        bool isTopLevelCall = !_initializing;
        require((isTopLevelCall && _initialized<1)||(!Address.isContract(address(this)) && _initialized==1),"Initializable: contract is already initialized");
        _initialized=1;
        if(isTopLevelCall){
            _initializing=true;  
        }
        _;
        if(isTopLevelCall){
            _initializing=false;
            emit Initialized(1);
        }
    }

    modifier reintializer(uint8 version){
        require(!_initializing && _initialized<version,"Initializable: contract is already initialized");
        _initialized=version;
        _initializing=true;
        _;
        _initializing=false;
        emit Initialized(version);
    }

    modifier onlyInitializing(){
        require(_initializing,"Initializable: contract is not initializing");
        _;
    }

    function _disableInitializers() internal virtual{
        require(!_initializing,"Initialzable: contract is initializing");
        if(_initialized<type(uint8).max){
            _initialized=type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }   
}

pragma solidity  ^0.8.9;
abstract contract Ownable is Context{

    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor(){
        _transferOwnership(_msgSender());
    }

    modifier onlyOwner(){
        _checkOwner();
        _;
    }

    function owner() public view virtual returns(address){
        return _owner;
    }

    function _checkOwner() internal view virtual {
        require(owner()==_msgSender(),"Ownable: caller is not owner");
    }

    function renounceOwnership() public virtual onlyOwner{
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public virtual onlyOwner{
        require(newOwner!=address(0),"Ownable:new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual{
        address oldOwner=_owner;
        _owner=newOwner;
        emit OwnershipTransferred(oldOwner,newOwner);
    }
}

pragma solidity ^0.8.9;
abstract contract ReentrancyGuard{

    uint256 private constant _NOT_ENTERED=1;
    uint256 private constant _ENTERED=2;
    uint256 private _status;
    constructor(){
        _status=_NOT_ENTERED;
    }

    modifier nonReentrant()
    {
        require(_status!=_ENTERED,"ReentrancyGuard:reentrant call");
        _status=_ENTERED;
        _;
        _status=_NOT_ENTERED;
    }
}

pragma solidity ^0.8.9;
contract TokenStaking is Ownable, ReentrancyGuard, Initializable{

    //Struct to store the user's details

    struct User{
        uint256 stakeAmount;
        uint256 rewardAmount;
        uint256 lastStakeTime;
        uint256 lastRewardCalculationTime;
        uint256 rewardClaimedSoFar;
    }

    uint256 _minimumStakingAmount;
    uint256 _maxStakeTokenLimit;
    uint256 _stakeEndDate;
    uint256 _stakeStartDate;
    uint256 _totalStakedTokens;
    uint256 _totalUsers;
    uint256 _stakeDays;
    uint256 _earlyUnstakeFeePercentage;
    bool _isStakingPaused;
    address private _tokenAddress;
    uint256 _apyRate;
    uint256 public constant PERCENTAGE_DENOMINATOR=10000;
    uint256 public constant APY_RATE_CHANGE_THRESHOLD=10;

    mapping(address=>User) private _users;

    event Stake(address indexed user,uint256 amount);
    event Unstake(address indexed user,uint256 amount);
    event EarlyUnstakeFee(address indexed user,uint256 amount);
    event ClaimReward(address indexed user, uint256 amount);

    modifier whenTreasuryHasBalance(uint256 amount){
        require(IERC20(_tokenAddress).balanceOf(address(this))>=amount,"TokenStaking:Insifficient funds in the treasury");
        _;
    }

    function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnstakeFeePercentage_
    ) public virtual initializer{
        _tokenStaking_init_unchained(owner_,tokenAddress_,apyRate_,minimumStakingAmount_,maxStakeTokenLimit_,stakeStartDate_,stakeEndDate_,stakeDays_,earlyUnstakeFeePercentage_);
    }

    function _tokenStaking_init_unchained(address owner_,address tokenAddress_,uint256 apyRate_,uint256 minimumStakingAmount_,uint256 maxStakeTokenLimit_,uint256 stakeStartDate_,uint256 stakeEndDate_,uint256 stakeDays_,uint256 earlyUnstakeFeePercentage_) internal onlyInitializing{
        require(_apyRate<=10000,"TokenStaking: apy rate should be less than 10000");
        require(stakeDays_>0,"TokenStaking : stake days must be non-zero");
        require(tokenAddress_!=address(0),"TokenStaking: token address cannot be 0 address");
        require(stakeStartDate_<stakeEndDate_,"TokenStaking: start must be less than end date");
        
        _transferOwnership(owner_);
        _tokenAddress=tokenAddress_;
        _apyRate=apyRate_;
        _minimumStakingAmount=minimumStakingAmount_;
        _maxStakeTokenLimit=maxStakeTokenLimit_;
        _stakeStartDate=stakeStartDate_;
        _stakeEndDate=stakeEndDate_;
        _stakeDays=stakeDays_*1 days;
        _earlyUnstakeFeePercentage=earlyUnstakeFeePercentage_;
    }

    /**
     * @notice These function is used to get the frontend view of the App.
     */

    function getMinimumStakingAmount() external view returns(uint256){
        return _minimumStakingAmount;
    }

    function getMaxStakingTokenLimit() external view returns (uint256) {
        return _maxStakeTokenLimit;
    }

    function getStakeEndDate() external view returns (uint256) {
        return _stakeEndDate;
    }

    function getStakeStartDate() external view returns (uint256) {
        return _stakeStartDate;
    }

    function getTotalStakedTokens() external view returns(uint256){
        return _totalStakedTokens;
    }

    function getTotalUsers() external view returns(uint256){
        return _totalUsers;
    }

    function getStakedDayes() external view returns(uint256){
        return _stakeDays;
    }

    function getEarlyUnstakeFeePercantage() external view returns(uint256){
        return _earlyUnstakeFeePercentage;
    }

    function getStakingStatus() external view returns(bool){
        return _isStakingPaused;
    }

    function getAPY() external view returns (uint256){
        return _apyRate;
    }

    function getUserEstimatedReward() external view returns(uint256){
        (uint256 amount,)=_getUserEstimatedRewards(msg.sender);
        return _users[msg.sender].rewardAmount+amount;
    }

    function getWithdrawableAmount() external view returns (uint256){
        return IERC20(_tokenAddress).balanceOf(address(this))-_totalStakedTokens;
    }

    function getUser(address userAddress) external view returns (User memory){
        return _users[userAddress];
    }

    function isStakeHolder(address _user) external view returns(bool){
        return _users[_user].stakeAmount!=0;
    }

    /**
     * @notice These function can only be called by the Owner
     */

    function updateMinimumStakingAmount(uint256 newAmount) external onlyOwner{
        _minimumStakingAmount=newAmount;
    }

    function updateMaximumStakingAmount(uint256 newAmount) external onlyOwner{
        _maxStakeTokenLimit=newAmount;
    }

    function updateStakingEndDate(uint256 newDate) external onlyOwner{
        _stakeEndDate=newDate;
    }

    function updateEarlyUnstakeFeePercentage(uint256 newPercentage) external onlyOwner{
        _earlyUnstakeFeePercentage=newPercentage;
    }

    function stakeForUser(uint256 amount,address user) external onlyOwner nonReentrant{
        _stakeTokens(amount,user);
    }

    function toggleStakingStatus() external onlyOwner{
        _isStakingPaused=!_isStakingPaused;
    }

    function withdraw(uint256 amount) external onlyOwner nonReentrant{
        require(this.getWithdrawableAmount()>=amount,"TokenStaking: not enough withdrawable tokens");
        IERC20(_tokenAddress).transfer(msg.sender, amount);
    }

    /**
     * @notice Users method
     */

    function stake(uint256 _amount) external nonReentrant{
        _stakeTokens(_amount,msg.sender);
    }

    function _stakeTokens(uint256 _amount, address user_) private {
        require(!_isStakingPaused,"TokenStaking is paused");
        uint256 currentTime=getCurrentTime();
        require(currentTime>_stakeStartDate,"TokenStaking: staking not started yet");
        require(currentTime<_stakeEndDate,"TokenStaking :staking ended");
        require(_totalStakedTokens+_amount<=_maxStakeTokenLimit,"TokenStaking: max staking token limit reached");
        require(_amount>0,"TokenStaking: stake amount must be non-zero");
        require(_amount>=_minimumStakingAmount,"TokenStaking: stake amount must be greater than minimum amount allowed");
        if(_users[user_].stakeAmount!=0){
            _calculateRewards(user_);
        }else{
            _users[user_].lastRewardCalculationTime=currentTime;
            _totalUsers+=1;
        }

        _users[user_].stakeAmount+=_amount;
        _users[user_].lastStakeTime=currentTime;

        _totalStakedTokens+=_amount;

        require(IERC20(_tokenAddress).transferFrom(msg.sender,address(this), _amount),"TokenStaking: failed to transfer tokens");
        emit Stake(user_,_amount);
    }

    function unstake(uint256 _amount) external nonReentrant() whenTreasuryHasBalance(_amount){

        address user=msg.sender;

        require(_amount!=0,"TokenStaking: amount should be non-Zero");
        require(this.isStakeHolder(user),"TokenStaking: not a stakeholder");
        require(_users[user].stakeAmount>=_amount,"TokenStaking: not enough stake to unstake");

        _calculateRewards(user);

        uint256 feeEarlyUnstake;

        if(getCurrentTime()<=_users[user].lastStakeTime+_stakeDays){
            feeEarlyUnstake=((_amount*_earlyUnstakeFeePercentage)/PERCENTAGE_DENOMINATOR);
            emit EarlyUnstakeFee(user, feeEarlyUnstake);
        }

        uint256 amountToUnstake=_amount-feeEarlyUnstake;

        _users[user].stakeAmount-=_amount;

        _totalStakedTokens-=_amount;
        
        if(_users[user].stakeAmount==0){
            _totalUsers-=1;
        }

        require(IERC20(_tokenAddress).transfer(user, amountToUnstake),"TokenStaking: failed to transfer");
        emit Unstake(user, _amount);
    }

    function claimReward() external nonReentrant() whenTreasuryHasBalance(_users[msg.sender].rewardAmount){
         _calculateRewards(msg.sender);
         uint256 rewardAmount=_users[msg.sender].rewardAmount; 
        require(rewardAmount>0,"TokenStaking: no reward to claim");
        require(IERC20(_tokenAddress).transfer(msg.sender, rewardAmount),"TokenStaking: failed to transfer");
        _users[msg.sender].rewardAmount=0;
        _users[msg.sender].rewardClaimedSoFar+=rewardAmount;
        emit ClaimReward(msg.sender, rewardAmount);   
    }

    /**
     * @notice Private gelper methods start
     */

     function _calculateRewards(address _user)private{
        (uint256 userReward, uint256 currentTime)=_getUserEstimatedRewards(_user);
        _users[_user].rewardAmount+=userReward;
        _users[_user].lastRewardCalculationTime=currentTime;
     }

     function _getUserEstimatedRewards(address _user) private view returns (uint256, uint256){
        uint256 userReward;
        uint256 userTimestamp=_users[_user].lastRewardCalculationTime;
        uint256 currentTime=getCurrentTime();
        if(currentTime>_users[_user].lastStakeTime+_stakeDays){
            currentTime=_users[_user].lastStakeTime+_stakeDays;
        }
        uint256 _totalStakedTime=currentTime-userTimestamp;
        userReward+=((_totalStakedTime*_users[_user].stakeAmount*_apyRate)/365 days)/PERCENTAGE_DENOMINATOR;
        return(userReward,currentTime);
     }

     function getCurrentTime() internal view virtual returns(uint256){
        return block.timestamp;
     }
}


