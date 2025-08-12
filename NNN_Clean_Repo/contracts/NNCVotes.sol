// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
contract NNCVotes is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("Neural Nubian Votes","NNCV") ERC20Permit("Neural Nubian Votes") {}
    function mint(address to,uint256 amt) external { _mint(to,amt); }
    function _update(address f,address t,uint256 v) internal override(ERC20,ERC20Votes){ super._update(f,t,v); }
}