// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
interface INeuralID{ function mint(address to, bytes32 hash) external; function setIssuer(address who, bool ok) external; }
contract NeuralIDMinter is Ownable {
    using ECDSA for bytes32;
    IERC20 public immutable NNC; INeuralID public immutable NID; uint256 public fee; mapping(address=>bool) public verifier; mapping(address=>bool) public minted;
    event Minted(address indexed to, bytes32 citizenHash); event VerifierSet(address indexed v, bool ok); event FeeSet(uint256 fee);
    constructor(IERC20 _nnc, INeuralID _nid, uint256 _fee) Ownable(msg.sender){ NNC=_nnc; NID=_nid; fee=_fee; }
    function setFee(uint256 _fee) external onlyOwner { fee=_fee; emit FeeSet(_fee); }
    function setVerifier(address v, bool ok) external onlyOwner { verifier[v]=ok; emit VerifierSet(v, ok); }
    function mint(bytes32 citizenHash, bytes calldata sig) external {
        require(!minted[msg.sender], "already minted");
        if(fee>0) require(NNC.transferFrom(msg.sender, address(this), fee), "fee xfer");
        bytes32 digest = keccak256(abi.encodePacked("NNN:MintNID", block.chainid, msg.sender, citizenHash)).toEthSignedMessageHash();
        address signer = ECDSA.recover(digest, sig); require(verifier[signer], "bad sig");
        NID.mint(msg.sender, citizenHash); minted[msg.sender]=true; emit Minted(msg.sender, citizenHash);
    }
    function withdraw(address to, uint256 amt) external onlyOwner { require(NNC.transfer(to, amt), "withdraw fail"); }
}
