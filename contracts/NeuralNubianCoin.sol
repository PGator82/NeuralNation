// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Neural Nubian Coin (NNC) — capped, burnable, pausable
contract NeuralNubianCoin is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 public immutable cap;

    constructor(address treasury, uint256 initialSupply, uint256 _cap)
        ERC20("Neural Nubian Coin", "NNC")
        Ownable(msg.sender)
    {
        require(initialSupply <= _cap, "initial > cap");
        cap = _cap;
        _mint(treasury, initialSupply);
    }

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(totalSupply() + amount <= cap, "cap exceeded");
        _mint(to, amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    function _update(address from, address to, uint256 value)
        internal override(ERC20)
    {
        require(!paused(), "paused");
        super._update(from, to, value);
    }
}
