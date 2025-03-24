document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Watchlist Page Loaded");

    const watchlistContainer = document.getElementById("watchlist-container");
    let watchlist = JSON.parse(sessionStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = "<p>No items in your watchlist.</p>";
        return;
    }

    watchlist.forEach(item => {
        let itemCard = document.createElement("div");
        itemCard.classList.add("item-card");

        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.src='default-item.jpg'">
            <h3>${item.name}</h3>
            <p>Starting Bid: ${parseFloat(item.price).toFixed(4)} ETH</p>
            <p>Seller: ${item.seller}</p>
            <p><strong>Time Left:</strong> <span id="countdown-${item.id}"></span></p>
            <button class="remove-btn" onclick="removeFromWatchlist(${item.id})">❌ Remove</button>
        `;

        watchlistContainer.appendChild(itemCard);
        startCountdown(item.bidendtime, `countdown-${item.id}`);
    });
});

// ✅ Remove Item from Watchlist
function removeFromWatchlist(itemId) {
    let watchlist = JSON.parse(sessionStorage.getItem("watchlist")) || [];
    watchlist = watchlist.filter(item => item.id !== itemId);
    sessionStorage.setItem("watchlist", JSON.stringify(watchlist));
    location.reload();
}

// ✅ Clear Entire Watchlist
function clearWatchlist() {
    if (confirm("Are you sure you want to clear your watchlist?")) {
        sessionStorage.removeItem("watchlist");
        location.reload();
    }
}

// ✅ Countdown Function
function startCountdown(bidEndTimeRaw, elementId) {
    const countdownElement = document.getElementById(elementId);
    let bidEndTime = new Date(bidEndTimeRaw);

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = bidEndTime - now;

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
