document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Bid Page Loaded");

    const sellerUsername = sessionStorage.getItem("sellerUsername");
    if (!sellerUsername) {
        alert("Session expired. Please log in again.");
        window.location.href = "selllog.html";
        return;
    }
    document.getElementById("seller-username").textContent = sellerUsername;

    const selectedItemId = sessionStorage.getItem("selectedItem");
    if (!selectedItemId) {
        console.error("❌ ERROR: No selected item found in session storage");
        alert("No auction item selected.");
        window.location.href = "sellerdashboard.html";
        return;
    }

    try {
        const response = await fetch(`https://blockchain-auction-site.onrender.com/api/auction-items/${selectedItemId}`);
        const item = await response.json();
        if (!item || !item.item_name) throw new Error("Invalid item data received");

        const itemsContainer = document.getElementById("items-container");
        itemsContainer.innerHTML = "";

        let itemCard = document.createElement("div");
        itemCard.classList.add("item-card");

        const countdownId = `countdown-${item.id}`;

        itemCard.innerHTML = `
            <img src="${item.item_image}" alt="${item.item_name}">
            <h3>${item.item_name}</h3>
            <p>Starting Bid: ${item.item_price} ETH</p>
            <p>Seller: ${item.seller_name}</p>
            <p><strong>Time Left:</strong> <span id="${countdownId}"></span></p>
            <input type="number" id="bid-amount-${item.id}" placeholder="Enter your bid in ETH">
            <button class="bid-btn" id="bid-btn-${item.id}">Place Bid</button>
        `;

        itemsContainer.appendChild(itemCard);
        startCountdown(item.bidendtime, countdownId);

        // Attach event listener to the bid button
        document.getElementById(`bid-btn-${item.id}`).addEventListener("click", function () {
            placeBid(item.id);
        });

    } catch (error) {
        console.error("❌ ERROR fetching item details:", error);
        alert("Error loading auction item.");
    }

    document.getElementById("logout-btn").addEventListener("click", function () {
        sessionStorage.clear();
        alert("Logged out successfully!");
        window.location.href = "selllog.html";
    });
});

function startCountdown(bidEndTimeRaw, elementId) {
    const countdownElement = document.getElementById(elementId);
    let bidEndTime = new Date(bidEndTimeRaw);

    if (isNaN(bidEndTime.getTime())) {
        bidEndTime = new Date(Number(bidEndTimeRaw) * 1000);
    }

    if (isNaN(bidEndTime.getTime())) {
        countdownElement.textContent = "Invalid End Time";
        console.error("Invalid bidendtime format:", bidEndTimeRaw);
        return;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = bidEndTime.getTime() - now;

        if (timeLeft <= 0) {
            countdownElement.textContent = "Auction Ended";
            return;
        }

        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);

        countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        setTimeout(updateCountdown, 1000);
    }

    updateCountdown();
}

// Web3 Configuration
const contractAddress = "0xdf345E5f8830B6Babb71806A6baD954a0B8Ae162"; // Update with actual contract address
const contractABI = 
    [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_itemName",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_itemPrice",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_auctionDuration",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "winner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "AuctionEnded",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "bidder",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "BidWithdrawn",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "bidder",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "bidAmount",
                    "type": "uint256"
                }
            ],
            "name": "NewBid",
            "type": "event"
        },
        {
            "inputs": [],
            "name": "auctionEndTime",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "auctionEnded",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "bids",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "endAuction",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "highestBid",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "highestBidder",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "itemName",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "itemPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "placeBid",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "seller",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdrawBid",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
]; // Replace with actual ABI

async function placeBid(itemId) {
    if (!window.ethereum || !window.ethereum.isMetaMask) {
        alert("🦊 MetaMask is required. Please install and enable MetaMask.");
        return;
    }

    const bidAmountInput = document.getElementById(`bid-amount-${itemId}`);
    let bidAmount = bidAmountInput.value.trim();

    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
        alert("Please enter a valid bid amount.");
        return;
    }

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        bidAmount = ethers.utils.parseEther(bidAmount.toString());

        console.log("🔹 Placing bid...");

        const transaction = await contract.placeBid({
            value: bidAmount,
            gasLimit: ethers.utils.hexlify(500000) // Adjusted gas limit to a valid value
        });

        await transaction.wait();
        alert("✅ Bid placed successfully!");
        window.location.reload();
    } catch (error) {
        console.error("❌ ERROR placing bid:", error);
        alert("❌ Transaction failed: " + (error.message || "Unknown error"));
    }
}
