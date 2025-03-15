document.addEventListener("DOMContentLoaded", function () {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    // Add event listeners to all "Add to Watchlist" buttons
    document.querySelectorAll(".watchlist-btn").forEach(button => {
        button.addEventListener("click", function () {
            const item = this.closest(".auction-item");
            const itemId = item.getAttribute("data-id");
            const itemName = item.querySelector("h3").innerText;
            const itemPrice = item.querySelector(".bid-price").innerText;
            const itemImage = item.querySelector("img").src;

            // Check if item is already in the watchlist
            if (!watchlist.some(i => i.id === itemId)) {
                watchlist.push({ id: itemId, name: itemName, price: itemPrice, image: itemImage });
                localStorage.setItem("watchlist", JSON.stringify(watchlist));
                alert("Item added to Watchlist!");
            } else {
                alert("This item is already in your Watchlist.");
            }
        });
    });
});
