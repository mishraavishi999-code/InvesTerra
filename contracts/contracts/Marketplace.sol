// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title InvesTerraMarketplace
 * @notice A secondary marketplace for trading LandShares (ERC-1155 tokens).
 *         Sellers list their shares at a price; buyers pay in MATIC.
 */
contract InvesTerraMarketplace is ERC1155Holder, Ownable, ReentrancyGuard {
    IERC1155 public landShares;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerShare; // in wei
        bool active;
    }

    uint256 public listingCount;
    mapping(uint256 => Listing) public listings;

    // Platform fee (basis points, e.g. 250 = 2.5%)
    uint256 public feeBps = 250;
    address public feeRecipient;

    event SharesListed(
        uint256 indexed listingId,
        address indexed seller,
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerShare
    );

    event SharesSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount,
        uint256 totalPrice
    );

    event ListingCancelled(uint256 indexed listingId);

    constructor(address _landShares) Ownable(msg.sender) {
        landShares = IERC1155(_landShares);
        feeRecipient = msg.sender;
    }

    /**
     * @notice List shares for sale on the marketplace
     * @param tokenId The property token ID
     * @param amount Number of shares to list
     * @param pricePerShare Price per share in wei (MATIC)
     */
    function listShares(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerShare
    ) external {
        require(amount > 0, "Amount must be > 0");
        require(pricePerShare > 0, "Price must be > 0");
        require(
            landShares.balanceOf(msg.sender, tokenId) >= amount,
            "Insufficient shares"
        );
        require(
            landShares.isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved"
        );

        uint256 listingId = listingCount++;
        listings[listingId] = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            amount: amount,
            pricePerShare: pricePerShare,
            active: true
        });

        // Transfer shares to marketplace escrow
        landShares.safeTransferFrom(msg.sender, address(this), tokenId, amount, "");

        emit SharesListed(listingId, msg.sender, tokenId, amount, pricePerShare);
    }

    /**
     * @notice Buy shares from a listing
     * @param listingId The listing to buy from
     */
    function buyShares(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        uint256 totalPrice = listing.amount * listing.pricePerShare;
        require(msg.value >= totalPrice, "Insufficient MATIC sent");

        listing.active = false;

        // Calculate and transfer fee
        uint256 fee = (totalPrice * feeBps) / 10000;
        uint256 sellerProceeds = totalPrice - fee;

        // Transfer shares to buyer
        landShares.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            listing.amount,
            ""
        );

        // Pay seller
        (bool success, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(success, "Seller payment failed");

        // Pay fee
        if (fee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: fee}("");
            require(feeSuccess, "Fee payment failed");
        }

        // Refund excess
        if (msg.value > totalPrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - totalPrice}("");
            require(refundSuccess, "Refund failed");
        }

        emit SharesSold(listingId, msg.sender, listing.tokenId, listing.amount, totalPrice);
    }

    /**
     * @notice Cancel an active listing and return shares to seller
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.active = false;

        // Return shares to seller
        landShares.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            listing.amount,
            ""
        );

        emit ListingCancelled(listingId);
    }

    /**
     * @notice Get listing details
     */
    function getActiveListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    // ─── Admin Functions ────────────────────────────────────────────────────────

    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        feeBps = _feeBps;
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        feeRecipient = _recipient;
    }
}
