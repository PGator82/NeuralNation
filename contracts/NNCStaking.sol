// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
contract NNCStaking is Ownable {
    IERC20 public immutable NNC; uint256 public rewardRate; uint256 public lastUpdate; uint256 public rewardPerTokenStored; uint256 public totalStaked;
    mapping(address=>uint256) public userStake; mapping(address=>uint256) public userRewardPerTokenPaid; mapping(address=>uint256) public rewards;
    event Staked(address indexed u,uint256 a); event Unstaked(address indexed u,uint256 a); event RewardPaid(address indexed u,uint256 a); event RewardRateUpdated(uint256 r); event Funded(uint256 a);
    constructor(IERC20 _nnc,uint256 _rate) Ownable(msg.sender){ NNC=_nnc; rewardRate=_rate; lastUpdate=block.timestamp; }
    modifier updateReward(address a){ rewardPerTokenStored=rewardPerToken(); lastUpdate=block.timestamp; if(a!=address(0)){ rewards[a]=earned(a); userRewardPerTokenPaid[a]=rewardPerTokenStored; } _; }
    function rewardPerToken() public view returns(uint256){ if(totalStaked==0) return rewardPerTokenStored; uint256 dt=block.timestamp-lastUpdate; return rewardPerTokenStored + (dt*rewardRate*1e18)/totalStaked; }
    function earned(address a) public view returns(uint256){ return (userStake[a]*(rewardPerToken()-userRewardPerTokenPaid[a]))/1e18 + rewards[a]; }
    function setRewardRate(uint256 r) external onlyOwner updateReward(address(0)){ rewardRate=r; emit RewardRateUpdated(r); }
    function fund(uint256 amount) external onlyOwner { require(NNC.transferFrom(msg.sender,address(this),amount),"fund"); emit Funded(amount); }
    function stake(uint256 amount) external updateReward(msg.sender){ require(amount>0,"amount=0"); totalStaked+=amount; userStake[msg.sender]+=amount; require(NNC.transferFrom(msg.sender,address(this),amount),"xfer"); emit Staked(msg.sender,amount); }
    function unstake(uint256 amount) external updateReward(msg.sender){ require(amount>0 && amount<=userStake[msg.sender],"bad"); totalStaked-=amount; userStake[msg.sender]-=amount; require(NNC.transfer(msg.sender,amount),"xfer"); emit Unstaked(msg.sender,amount); }
    function claim() external updateReward(msg.sender){ uint256 r=rewards[msg.sender]; rewards[msg.sender]=0; require(NNC.transfer(msg.sender,r),"xfer"); emit RewardPaid(msg.sender,r); }
}