// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
contract EducationRewards is Ownable {
    IERC20 public rewardToken; mapping(bytes32=>uint256) public courseReward; mapping(address=>mapping(bytes32=>bool)) public claimed;
    event RewardSet(bytes32 indexed courseId,uint256 amount); event Claimed(address indexed student, bytes32 indexed courseId,uint256 amount);
    constructor(IERC20 token) Ownable(msg.sender){ rewardToken=token; }
    function setCourse(bytes32 id,uint256 amt) external onlyOwner { courseReward[id]=amt; emit RewardSet(id,amt); }
    function attestAndPay(address student, bytes32 id) external onlyOwner { require(!claimed[student][id],"claimed"); claimed[student][id]=true; require(rewardToken.transfer(student, courseReward[id]),"xfer"); emit Claimed(student,id,courseReward[id]); }
}