document.addEventListener("DOMContentLoaded", function () {
    const watchlistContainer = document.getElementById("watchlist-container");
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.length === 0) {
        watchlistContainer.innerHTML = "<p>No items in your watchlist.</p>";
    } else {
        watchlist.forEach(item => {
            const itemElement = document.createElement("div");
            itemElement.classList.add("watchlist-item");
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Current Bid: ${item.price}</p>
                <button class="remove-btn" data-id="${item.id}">Remove</button>
            `;
            watchlistContainer.appendChild(itemElement);
        });

        // Handle remove button click
        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", function () {
                const itemId = this.getAttribute("data-id");
                const updatedWatchlist = watchlist.filter(item => item.id !== itemId);
                localStorage.setItem("watchlist", JSON.stringify(updatedWatchlist));
                alert("Item removed from Watchlist.");
                location.reload();
            });
        });
    }
});
