// Auction Items (Mock Data)
const auctionItems = [
    { id: 1, name: "Vintage Watch", image: "auction items/watch.jpeg", price: "0.0003 ETH", seller: "JohnDoe", watchers: 12, bids: 6, bidEndTime: "2025-03-10T18:00:00Z", description: "A classic 1960s wristwatch." },
    { id: 2, name: "Rare Painting", image: "auction items/painting.jpg", price: "0.5 ETH", seller: "ArtDealer99", watchers: 25, bids: 10, bidEndTime: "2025-03-12T20:00:00Z", description: "A rare 18th-century painting." },
    { id: 3, name: "Gaming Laptop", image: "auction items/laptop.jpg", price: "0.0006 ETH", seller: "TechGuru", watchers: 18, bids: 9, bidEndTime: "2025-03-15T15:30:00Z", description: "A powerful gaming laptop with RTX 4080." },
    { id: 4, name: "Antique Vase", image: "auction items/vase.jpg", price: "0.03 ETH", seller: "AntiqueLover", watchers: 7, bids: 3, bidEndTime: "2025-03-09T12:00:00Z", description: "A delicate vase from the Ming Dynasty." },
    { id: 5, name: "1950 Chair", image: "auction items/chair.jpg", price: "0.0009 ETH", seller: "FurnitureCollector", watchers: 4, bids: 2, bidEndTime: "2025-03-14T10:00:00Z", description: "A vintage chair from the 1950s." },
    { id: 6, name: "Noise-Canceling Headphones", image: "auction items/headphones.jpg", price: "0.005 ETH", seller: "AudioMaster", watchers: 15, bids: 8, bidEndTime: "2025-03-11T21:00:00Z", description: "Premium noise-canceling headphones with spatial audio." }
];

// Ensure the page is fully loaded before executing
document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Home Page Loaded");

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

    // ✅ Load auction items
    const itemsContainer = document.getElementById("items-container");
    if (itemsContainer) {
        itemsContainer.innerHTML = ""; // Clear previous content

        auctionItems.forEach(item => {
            let itemCard = document.createElement("div");
            itemCard.classList.add("item-card");
            itemCard.innerHTML = `
                <img src="${item.image}" alt="${item.name}" onerror="this.src='default-item.jpg'">
                <h3>${item.name}</h3>
                <p>Starting Bid: ${item.price}</p>
                <button class="bid-btn" data-id="${item.id}">Place Bid</button>
            `;
            itemsContainer.appendChild(itemCard);
        });

        // ✅ Attach click event to all bid buttons
        document.querySelectorAll(".bid-btn").forEach(button => {
            button.addEventListener("click", function () {
                const itemId = parseInt(this.dataset.id);
                placeBid(itemId);
            });
        });
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

// ✅ Place Bid Function
function placeBid(itemId) {
    const selectedItem = auctionItems.find(item => item.id === itemId);

    if (selectedItem) {
        sessionStorage.setItem("selectedItem", JSON.stringify(selectedItem));
        window.location.href = "bid.html"; // Redirect to the bid page
    } else {
        alert("❌ Item not found!");
    }
}
