// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LandShares
 * @notice ERC-1155 token representing fractional ownership of land parcels.
 *         Each token ID maps to a specific property/SPV. The token amount
 *         represents the number of shares the holder owns.
 */
contract LandShares is ERC1155, ERC1155Supply, Ownable {
    // Property metadata URI per token ID
    mapping(uint256 => string) private _propertyURIs;

    // Human-readable name for each property
    mapping(uint256 => string) public propertyNames;

    // Maximum supply per property (total shares)
    mapping(uint256 => uint256) public maxSupply;

    // Counter for property IDs
    uint256 public propertyCount;

    event PropertyCreated(uint256 indexed tokenId, string name, uint256 totalShares);
    event SharesMinted(uint256 indexed tokenId, address indexed to, uint256 amount);
    event SharesBurned(uint256 indexed tokenId, address indexed from, uint256 amount);

    constructor() ERC1155("") Ownable(msg.sender) {}

    /**
     * @notice Creates a new property token type
     * @param name Human-readable property name
     * @param totalShares Maximum number of shares for this property
     * @param metadataURI URI pointing to property metadata JSON
     */
    function createProperty(
        string memory name,
        uint256 totalShares,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = propertyCount++;
        propertyNames[tokenId] = name;
        maxSupply[tokenId] = totalShares;
        _propertyURIs[tokenId] = metadataURI;

        emit PropertyCreated(tokenId, name, totalShares);
        return tokenId;
    }

    /**
     * @notice Mints shares to an investor
     * @param to Investor wallet address
     * @param id Property token ID
     * @param amount Number of shares to mint
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        require(totalSupply(id) + amount <= maxSupply[id], "Exceeds max supply");
        _mint(to, id, amount, data);
        emit SharesMinted(id, to, amount);
    }

    /**
     * @notice Burns shares from a holder (with approval)
     * @param from Holder address
     * @param id Property token ID
     * @param amount Number of shares to burn
     */
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "Not approved"
        );
        _burn(from, id, amount);
        emit SharesBurned(id, from, amount);
    }

    /**
     * @notice Sets the metadata URI for a property
     */
    function setPropertyURI(uint256 tokenId, string memory newURI) external onlyOwner {
        _propertyURIs[tokenId] = newURI;
    }

    /**
     * @notice Returns the metadata URI for a given token ID
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory propertyURI = _propertyURIs[tokenId];
        if (bytes(propertyURI).length > 0) {
            return propertyURI;
        }
        return super.uri(tokenId);
    }

    // Required overrides
    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }
}
