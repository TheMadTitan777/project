document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Bid Page Loaded");

    // Retrieve buyer username from session storage
    const buyerUsername = sessionStorage.getItem("buyerUsername");
    if (!buyerUsername) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }
    document.getElementById("buyer-username").textContent = buyerUsername;

    // Retrieve selected item from session storage
    const selectedItemId = sessionStorage.getItem("selectedItem");
    if (!selectedItemId) {
        console.error("❌ ERROR: No selected item found in session storage");
        alert("No auction item selected.");
        window.location.href = "home.html";
        return;
    }

    try {
        // Fetch auction item details
        const response = await fetch(`https://blockchain-auction-site.onrender.com/api/auction-items/${selectedItemId}`);
        const item = await response.json();
        if (!item || !item.item_name) throw new Error("Invalid item data received");

        // Render auction item details
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

        // Attach event listener to bid button
        document.getElementById(`bid-btn-${item.id}`).addEventListener("click", function () {
            placeBid(item.id);
        });

    } catch (error) {
        console.error("❌ ERROR fetching item details:", error);
        alert("Error loading auction item.");
    }

    // Logout button functionality
    document.getElementById("logout-btn").addEventListener("click", function () {
        sessionStorage.clear();
        alert("Logged out successfully!");
        window.location.href = "login.html";
    });
});

// Countdown Timer Function
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
const contractABI = [ 
    {
        "inputs": [
            { "internalType": "string", "name": "_itemName", "type": "string" },
            { "internalType": "uint256", "name": "_itemPrice", "type": "uint256" },
            { "internalType": "uint256", "name": "_auctionDuration", "type": "uint256" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "winner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "AuctionEnded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "highestBid",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "placeBid",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
]; // Replace with actual ABI

// Function to place a bid
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
        // Connect to Ethereum provider
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        bidAmount = ethers.utils.parseEther(bidAmount.toString());

        console.log("🔹 Placing bid...");

        const transaction = await contract.placeBid({
            value: bidAmount,
            gasLimit: ethers.BigNumber.from("500000") // Corrected gas limit format
        });

        await transaction.wait();
        alert("✅ Bid placed successfully!");
        window.location.reload();
    } catch (error) {
        console.error("❌ ERROR placing bid:", error);
        alert("❌ Transaction failed: " + (error.message || "Unknown error"));
    }
}
