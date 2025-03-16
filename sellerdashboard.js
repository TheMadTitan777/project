document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Seller Dashboard Loaded");

    const sellerUsername = sessionStorage.getItem("sellerUsername");
    if (!sellerUsername) {
        alert("Session expired. Please log in again.");
        window.location.href = "selllog.html";
        return;
    }

    try {
        const response = await fetch(`https://blockchain-auction-site.onrender.com/api/my-auction-items/${sellerUsername}`);
        const items = await response.json();
        const itemsContainer = document.getElementById("items-container");

        if (!items.length) {
            itemsContainer.innerHTML = "<p>No auction items found.</p>";
            return;
        }

        itemsContainer.innerHTML = ""; // Clear previous items

        items.forEach(item => {
            let itemCard = document.createElement("div");
            itemCard.classList.add("item-card");

            itemCard.innerHTML = `
                <img src="${item.item_image}" alt="${item.item_name}">
                <h3>${item.item_name}</h3>
                <p>Starting Bid: ${item.item_price} ETH</p>
                <p>Time Left: <span id="countdown-${item.id}"></span></p>
            `;

            itemsContainer.appendChild(itemCard);
            startCountdown(item.bidendtime, `countdown-${item.id}`);
        });

    } catch (error) {
        console.error("❌ ERROR fetching seller's items:", error);
        alert("Error loading auction items.");
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

document.getElementById("logout-btn").addEventListener("click", function () {
    sessionStorage.removeItem("sellerUsername"); // Ensure sellerUsername is removed
    sessionStorage.clear(); // Clear all session storage
    alert("Logged out successfully!");
    window.location.href = "selllog.html"; // Redirect to seller login page
});

