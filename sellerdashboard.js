document.addEventListener("DOMContentLoaded", async function () {
    const sellerUsername = sessionStorage.getItem("sellerUsername");
    if (!sellerUsername) {
        alert("Session expired. Please log in again.");
        window.location.href = "selllog.html";
        return;
    }
    document.getElementById("seller-username").textContent = sellerUsername;

    try {
        const response = await fetch("https://blockchain-auction-site.onrender.com/api/auction-items");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format: Expected an array");

        const itemsContainer = document.getElementById("items-container");
        itemsContainer.innerHTML = "";

        data.forEach(item => {
            console.log("Raw bidendtime:", item.bidendtime); // Debugging timestamp

            let itemCard = document.createElement("div");
            itemCard.classList.add("item-card");
            itemCard.setAttribute("data-item-id", item.id); // Store item ID for deletion
            const countdownId = `countdown-${item.id}`;

            itemCard.innerHTML = `
                <img src="${item.item_image}" alt="${item.item_name}">
                <h3>${item.item_name}</h3>
                <p>Starting Bid: ${item.item_price}</p>
                <p>Seller: ${item.seller_name}</p>
                <p><strong>Time Left:</strong> <span id="${countdownId}"></span></p>
                <button class="bid-btn" id="bid-btn-${item.id}" onclick="placeBid(${item.id})">Place Bid</button>
            `;

            itemsContainer.appendChild(itemCard);
            startCountdown(item.bidendtime, countdownId, item.id, itemCard);
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        alert("❌ Error loading auction items. Please try again later.");
    }

    document.getElementById("logout-btn").addEventListener("click", function () {
        sessionStorage.clear();
        alert("Logged out successfully!");
        window.location.href = "selllog.html";
    });
});

function startCountdown(bidEndTimeRaw, elementId, itemId, itemCard) {
    const countdownElement = document.getElementById(elementId);
    const bidButton = document.getElementById(`bid-btn-${itemId}`);

    // Ensure bidEndTime is a valid timestamp
    let bidEndTime = new Date(bidEndTimeRaw);
    if (isNaN(bidEndTime.getTime())) {
        bidEndTime = new Date(Number(bidEndTimeRaw) * 1000); // Try converting from epoch
    }

    if (isNaN(bidEndTime.getTime())) {
        countdownElement.textContent = "Invalid End Time";
        console.error("Invalid bidendtime format:", bidEndTimeRaw);
        return;
    }

    function updateCountdown() {
        const now = new Date().getTime();
        const end = bidEndTime.getTime();
        const timeLeft = end - now;

        if (timeLeft <= 0) {
            countdownElement.textContent = "Auction Ended";
            itemCard.classList.add("ended");
            bidButton.disabled = true;
            bidButton.textContent = "Auction Closed";

            // **Automatically delete item**
            deleteExpiredItem(itemId, itemCard);
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

async function deleteExpiredItem(itemId, itemCard) {
    try {
        const response = await fetch(`https://blockchain-auction-site.onrender.com/api/seller/delete/${itemId}`, { method: "DELETE" });
        const data = await response.json();
        if (data.success) {
            console.log(`✅ Item ${itemId} deleted from database`);
            itemCard.remove(); // Remove item from UI
        } else {
            console.error("Failed to delete expired item:", data.message);
        }
    } catch (error) {
        console.error("Error deleting expired item:", error);
    }
}

function placeBid(itemId) {
    sessionStorage.setItem("selectedItem", itemId);
    window.location.href = "bid.html";
}
