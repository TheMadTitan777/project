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
            <p>Starting Bid: ${item.item_price}</p>
            <p>Seller: ${item.seller_name}</p>
            <p><strong>Time Left:</strong> <span id="${countdownId}"></span></p>
            <input type="number" id="bid-amount" placeholder="Enter your bid">
            <button class="bid-btn" id="bid-btn-${item.id}" onclick="placeBid(${item.id})">Place Bid</button>
        `;

        itemsContainer.appendChild(itemCard);
        startCountdown(item.bidendtime, countdownId);
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

async function placeBid(itemId) {
    const bidAmount = parseFloat(document.getElementById("bid-amount").value);
    if (isNaN(bidAmount) || bidAmount <= 0) {
        alert("Please enter a valid bid amount.");
        return;
    }

    const sellerUsername = sessionStorage.getItem("sellerUsername");

    try {
        const response = await fetch("https://blockchain-auction-site.onrender.com/api/place-bid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item_id: itemId,
                bidder_username: sellerUsername,
                bid_amount: bidAmount
            })
        });

        const result = await response.json();
        if (result.success) {
            alert("✅ Bid placed successfully!");
            window.location.reload();
        } else {
            alert("❌ Failed to place bid: " + result.message);
        }
    } catch (error) {
        console.error("❌ ERROR placing bid:", error);
        alert("❌ Error processing your bid. Please try again.");
    }
}
