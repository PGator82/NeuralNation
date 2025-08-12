// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UptimeRewards
 * @notice Pays NNC to nodes based on reported uptime percentages for a period.
 * Design:
 * - Contract is funded with NNC (transferFrom by owner/treasury)
 * - An authorized oracle reports an array of nodes and their uptimePct (0-10000 = 0-100.00%)
 * - Rewards for the period = weeklyBudget * (uptimePct / 10000) normalized across all reported nodes
 * - Each report mints claimable balances; nodes call claim() to pull their share
 */
contract UptimeRewards is Ownable {
    IERC20 public immutable NNC;
    address public oracle;
    uint256 public weeklyBudget; // in NNC wei per period (configurable)
    uint256 public lastPeriodEnd;

    mapping(address => uint256) public claimable;

    event OracleSet(address indexed oracle);
    event WeeklyBudgetSet(uint256 budget);
    event Report(uint256 start, uint256 end, uint256 distributed, uint256 nodes);
    event Claimed(address indexed who, uint256 amount);
    event Funded(uint256 amount);

    error NotOracle();
    error BadArray();
    error PeriodOverlap();

    constructor(IERC20 _nnc, address _oracle, uint256 _budget) Ownable(msg.sender) {
        NNC = _nnc;
        oracle = _oracle;
        weeklyBudget = _budget;
        emit OracleSet(_oracle);
        emit WeeklyBudgetSet(_budget);
    }

    function setOracle(address o) external onlyOwner {
        oracle = o;
        emit OracleSet(o);
    }

    function setWeeklyBudget(uint256 b) external onlyOwner {
        weeklyBudget = b;
        emit WeeklyBudgetSet(b);
    }

    function fund(uint256 amount) external onlyOwner {
        require(NNC.transferFrom(msg.sender, address(this), amount), "fund xfer");
        emit Funded(amount);
    }

    /// @notice Oracle reports uptimes for a period; rewards minted to claimable balances
    /// @param addrs Node owner wallets (reward recipients)
    /// @param pct Uptime in basis points (0-10000)
    function report(address[] calldata addrs, uint16[] calldata pct, uint256 periodStart, uint256 periodEnd) external {
        if (msg.sender != oracle) revert NotOracle();
        if (addrs.length != pct.length) revert BadArray();
        if (periodEnd <= periodStart || periodStart <= lastPeriodEnd) revert PeriodOverlap();
        lastPeriodEnd = periodEnd;

        // Sum weights
        uint256 sum = 0;
        for (uint256 i=0; i<pct.length; i++) {
            sum += uint256(pct[i]);
        }
        if (sum == 0) return;

        // Distribute weeklyBudget proportional to uptime
        uint256 distributed = 0;
        for (uint256 i=0; i<pct.length; i++) {
            uint256 share = (weeklyBudget * uint256(pct[i])) / sum;
            claimable[addrs[i]] += share;
            distributed += share;
        }
        emit Report(periodStart, periodEnd, distributed, addrs.length);
    }

    function claim() external {
        uint256 amt = claimable[msg.sender];
        require(amt > 0, "nothing");
        claimable[msg.sender] = 0;
        require(NNC.transfer(msg.sender, amt), "xfer");
        emit Claimed(msg.sender, amt);
    }

    function pending(address who) external view returns (uint256) {
        return claimable[who];
    }
}
