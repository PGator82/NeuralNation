// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
contract NNCStakingV2 is Ownable {
    IERC20 public immutable NNC; IERC721 public immutable NID;
    uint256 public rewardRate; uint256 public lastUpdate; uint256 public rewardPerTokenStored; uint256 public totalStaked; uint256 public minStakeTime; uint16 public penaltyBips;
    mapping(address=>uint256) public userStake; mapping(address=>uint256) public userRewardPerTokenPaid; mapping(address=>uint256) public rewards; mapping(address=>uint256) public lastStakeTs;
    event Staked(address indexed u,uint256 amt); event Unstaked(address indexed u,uint256 amt,uint256 penalty); event RewardPaid(address indexed u,uint256 amt); event RewardRateUpdated(uint256 r); event Funded(uint256 amt); event Params(uint256 minStakeTime,uint16 penaltyBips);
    constructor(IERC20 _nnc, IERC721 _nid, uint256 _rate, uint256 _minStake, uint16 _penalty) Ownable(msg.sender){ NNC=_nnc; NID=_nid; rewardRate=_rate; lastUpdate=block.timestamp; minStakeTime=_minStake; penaltyBips=_penalty; emit Params(_minStake,_penalty); }
    modifier updateReward(address a){ rewardPerTokenStored=rewardPerToken(); lastUpdate=block.timestamp; if(a!=address(0)){ rewards[a]=earned(a); userRewardPerTokenPaid[a]=rewardPerTokenStored; } _; }
    function rewardPerToken() public view returns(uint256){ if(totalStaked==0) return rewardPerTokenStored; uint256 dt=block.timestamp-lastUpdate; return rewardPerTokenStored + (dt*rewardRate*1e18)/totalStaked; }
    function earned(address a) public view returns(uint256){ return (userStake[a]*(rewardPerToken()-userRewardPerTokenPaid[a]))/1e18 + rewards[a]; }
    function setRewardRate(uint256 r) external onlyOwner updateReward(address(0)){ rewardRate=r; emit RewardRateUpdated(r); }
    function setParams(uint256 _minStake, uint16 _penalty) external onlyOwner { require(_penalty<=2000,"high"); minStakeTime=_minStake; penaltyBips=_penalty; emit Params(_minStake,_penalty); }
    function fund(uint256 amount) external onlyOwner { require(NNC.transferFrom(msg.sender,address(this),amount),"fund xfer"); emit Funded(amount); }
    function stake(uint256 amount) external updateReward(msg.sender){ require(amount>0,"amount=0"); require(NID.balanceOf(msg.sender)>0,"NID req"); totalStaked+=amount; userStake[msg.sender]+=amount; lastStakeTs[msg.sender]=block.timestamp; require(NNC.transferFrom(msg.sender,address(this),amount),"stake xfer"); emit Staked(msg.sender,amount); }
    function unstake(uint256 amount) external updateReward(msg.sender){ require(amount>0 && amount<=userStake[msg.sender],"bad"); totalStaked-=amount; userStake[msg.sender]-=amount; uint256 penalty=0; if(block.timestamp<lastStakeTs[msg.sender]+minStakeTime && penaltyBips>0){ penalty=(amount*penaltyBips)/10000; } uint256 sendAmount=amount-penalty; require(NNC.transfer(msg.sender,sendAmount),"unstake xfer"); emit Unstaked(msg.sender,amount,penalty); }
    function claim() external updateReward(msg.sender){ uint256 r=rewards[msg.sender]; rewards[msg.sender]=0; require(NNC.transfer(msg.sender,r),"claim xfer"); emit RewardPaid(msg.sender,r); }
}
