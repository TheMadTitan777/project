// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Auction {
    struct Item {
        uint256 id;
        string name;
        address payable seller;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
        bool ended;
        mapping(address => uint256) bids;
    }

    mapping(uint256 => Item) public items;
    uint256 public itemCount;

    event NewBid(uint256 indexed itemId, address indexed bidder, uint256 amount);
    event AuctionEnded(uint256 indexed itemId, address winner, uint256 amount);

    function createAuction(string memory _name, uint256 _duration) external {
        itemCount++;
        Item storage newItem = items[itemCount];
        newItem.id = itemCount;
        newItem.name = _name;
        newItem.seller = payable(msg.sender);
        newItem.highestBid = 0;
        newItem.highestBidder = payable(address(0));
        newItem.endTime = block.timestamp + _duration;
        newItem.ended = false;
    }

    function placeBid(uint256 _itemId) external payable {
        Item storage item = items[_itemId];

        require(block.timestamp < item.endTime, "Auction ended.");
        require(msg.value > item.highestBid, "Bid must be higher than current highest bid.");

        if (item.highestBid > 0) {
            // Refund previous highest bidder
            item.highestBidder.transfer(item.highestBid);
        }

        item.highestBid = msg.value;
        item.highestBidder = payable(msg.sender);
        item.bids[msg.sender] += msg.value;

        emit NewBid(_itemId, msg.sender, msg.value);
    }

    function endAuction(uint256 _itemId) external {
        Item storage item = items[_itemId];

        require(block.timestamp >= item.endTime, "Auction not yet ended.");
        require(!item.ended, "Auction already ended.");
        require(msg.sender == item.seller, "Only seller can end auction.");

        item.ended = true;
        item.seller.transfer(item.highestBid);

        emit AuctionEnded(_itemId, item.highestBidder, item.highestBid);
    }
}
