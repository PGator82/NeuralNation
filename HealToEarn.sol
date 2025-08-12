// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract HealToEarn is Ownable {
    IERC20 public rewardToken; mapping(bytes32=>uint256) public eventReward; mapping(address=>mapping(bytes32=>bool)) public claimed;
    event EventSet(bytes32 indexed id,uint256 amount); event Claimed(address indexed p, bytes32 indexed id,uint256 amount);
    constructor(IERC20 token) Ownable(msg.sender){ rewardToken=token; }
    function setEvent(bytes32 id,uint256 amt) external onlyOwner { eventReward[id]=amt; emit EventSet(id,amt); }
    function attestAndPay(address p, bytes32 id) external onlyOwner { require(!claimed[p][id],"claimed"); claimed[p][id]=true; require(rewardToken.transfer(p, eventReward[id]),"xfer"); emit Claimed(p,id,eventReward[id]); }
}