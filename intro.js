document.addEventListener("DOMContentLoaded", function () {
    const buyerBtn = document.getElementById("buyer-btn");
    const sellerBtn = document.getElementById("seller-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const auctionItemsContainer = document.getElementById("auction-items");

    // Redirect buyers to login
    buyerBtn.addEventListener("click", function () {
        sessionStorage.setItem("userRole", "buyer");
        window.location.href = "login.html";
    });

    // Redirect sellers to login
    sellerBtn.addEventListener("click", function () {
        sessionStorage.setItem("userRole", "seller");
        window.location.href = "selllog.html";
    });

    // Check if user is logged in
    const userRole = sessionStorage.getItem("userRole");
    if (userRole) {
        logoutBtn.style.display = "inline-block";
    }


    // Fetch auction items from API
    async function loadAuctionItems() {
        try {
            const response = await fetch("https://blockchain-auction-site.onrender.com/api/auction-items");
            const items = await response.json();

            if (items.length === 0) {
                auctionItemsContainer.innerHTML = "<p>No items available.</p>";
                return;
            }

            auctionItemsContainer.innerHTML = items.map(item => `
                <div class="auction-item">
                    <img src="${item.item_image}" alt="${item.item_name}">
                    <h3>${item.item_name}</h3>
                    <p>Starting Bid: ${parseFloat(item.item_price).toFixed(4)} ETH</p>
                    <p>Seller: ${item.seller_name}</p>
                </div>
            `).join("");
        } catch (error) {
            console.error("Error fetching auction items:", error);
            auctionItemsContainer.innerHTML = "<p>Failed to load items. Please try again.</p>";
        }
    }

    // Load auction items on page load
    loadAuctionItems();
});
