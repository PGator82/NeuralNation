// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title NeuralID — soulbound citizenship token
contract NeuralID is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextId;
    mapping(address => bool) public issuers;
    mapping(uint256 => bytes32) public citizenHash;
    string private _base;

    error Soulbound();
    error NotIssuer();

    constructor(string memory baseURI) ERC721("Neural ID", "NID") Ownable(msg.sender) {
        _base = baseURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner { _base = baseURI; }

    function setIssuer(address who, bool ok) external onlyOwner {
        issuers[who] = ok;
    }

    function mint(address to, bytes32 hash) external {
        if (!issuers[msg.sender]) revert NotIssuer();
        uint256 id = ++nextId;
        _safeMint(to, id);
        citizenHash[id] = hash;
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        require(_ownerOf(id) != address(0), "no token");
        return bytes(_base).length == 0 ? "" : string(abi.encodePacked(_base, id.toString(), ".json"));
    }

    // Soulbound: block transfers except burn by owner/issuer via revoke()
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert Soulbound(); // disallow transfer
        return super._update(to, tokenId, auth);
    }

    function revoke(uint256 tokenId) external {
        address o = _ownerOf(tokenId);
        require(msg.sender == owner() || issuers[msg.sender] || msg.sender == o, "no auth");
        _burn(tokenId);
    }
}
