document.addEventListener("DOMContentLoaded", async function () {
    console.log("✅ Buyer Dashboard Loaded");

    // ✅ Load user data
    const username = sessionStorage.getItem("buyerUsername");
    const profilePicture = sessionStorage.getItem("buyerProfilePicture") || "default-pfp.png";

    if (!username) {
        alert("❌ Session expired. Please log in again.");
        window.location.href = "login.html"; // Redirect to login
        return;
    }

    console.log("👤 Logged in as:", username);

    document.getElementById("username-display").textContent = username;
    document.getElementById("user-pfp").src = profilePicture;

    // ✅ Fetch auction items from the server
    try {
        const response = await fetch("https://blockchain-auction-site.onrender.com/api/auction-items");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format: Expected an array");

        const itemsContainer = document.getElementById("items-container");
        itemsContainer.innerHTML = ""; // Clear previous content

        data.forEach(item => {
            console.log("Raw bidendtime:", item.bidendtime); // Debugging timestamp

            let itemCard = document.createElement("div");
            itemCard.classList.add("item-card");
            const countdownId = `countdown-${item.id}`;

            itemCard.innerHTML = `
                <img src="${item.item_image}" alt="${item.item_name}" onerror="this.src='default-item.jpg'">
                <h3>${item.item_name}</h3>
                <p>Starting Bid: ${parseFloat(item.item_price).toFixed(4)} ETH</p>
                <p>Seller: ${item.seller_name}</p>
                <p><strong>Time Left:</strong> <span id="${countdownId}"></span></p>
                <button class="bid-btn" id="bid-btn-${item.id}" onclick="placeBid(${item.id})">Place Bid</button>
            `;

            itemsContainer.appendChild(itemCard);
            startCountdown(item.bidendtime, countdownId, item.id, itemCard);
        });
    } catch (error) {
        console.error("Error fetching auction items:", error);
        alert("❌ Error loading auction items. Please try again later.");
    }

    // ✅ Search Functionality
    const searchBar = document.getElementById("search-bar");
    if (searchBar) {
        searchBar.addEventListener("keyup", function () {
            let query = this.value.toLowerCase();
            let items = document.querySelectorAll(".item-card");

            items.forEach(item => {
                let title = item.querySelector("h3").innerText.toLowerCase();
                item.style.display = title.includes(query) ? "block" : "none";
            });
        });
    }

    // ✅ Logout Functionality
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            console.log("🔴 Logging out...");
            sessionStorage.clear();
            localStorage.removeItem("authToken"); // Clear token if stored
            alert("✅ You have been logged out.");
            window.location.href = "login.html";
        });
    }
});

// ✅ Countdown Function
function startCountdown(bidEndTimeRaw, elementId, itemId, itemCard) {
    const countdownElement = document.getElementById(elementId);
    const bidButton = document.getElementById(`bid-btn-${itemId}`);

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

// ✅ Place Bid Function
function placeBid(itemId) {
    sessionStorage.setItem("selectedItem", itemId);
    window.location.href = "bid.html"; // Redirect to the bid page
}
