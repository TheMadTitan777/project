document.addEventListener("DOMContentLoaded", async function () {
    const sellerUsername = sessionStorage.getItem("sellerUsername");

    if (!sellerUsername) {
        alert("Session expired. Please log in again.");
        window.location.href = "selllog.html";
        return;
    }

    document.getElementById("seller-username").textContent = sellerUsername;

    try {
        const response = await fetch("http://localhost:5000/api/auction-items");
        const data = await response.json();
        console.log(data);

        if (!Array.isArray(data)) {
            throw new Error("Invalid response format: Expected an array");
        }

        const itemsContainer = document.getElementById("items-container");
        itemsContainer.innerHTML = "";

        data.forEach(item => {
            let itemCard = document.createElement("div");
            itemCard.classList.add("item-card");
            itemCard.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Starting Bid: ${item.price}</p>
                <p>Seller: ${item.seller}</p>
                <button class="bid-btn" onclick="placeBid(${item.id})">Place Bid</button>
            `;
            itemsContainer.appendChild(itemCard);
        });
    } catch (error) {
        console.error("Error fetching items:", error);
        alert("❌ Error loading auction items. Please try again later.");
    }

    document.getElementById("my-items").addEventListener("click", async function () {
        try {
            const response = await fetch(`http://localhost:5000/api/seller/login?username=${sellerUsername}`);
            const data = await response.json();
            const itemsContainer = document.getElementById("items-container");
            itemsContainer.innerHTML = "<h2>My Listed Items</h2>";

            if (data.length === 0) {
                itemsContainer.innerHTML += "<p>You have not listed any items yet.</p>";
                return;
            }

            data.forEach(item => {
                let itemCard = document.createElement("div");
                itemCard.classList.add("item-card");
                itemCard.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>Starting Bid: ${item.price}</p>
                    <button onclick="editItem(${item.id})">Edit</button>
                    <button onclick="deleteItem(${item.id})">Delete</button>
                `;
                itemsContainer.appendChild(itemCard);
            });
        } catch (error) {
            console.error("Error fetching seller items:", error);
        }
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
        sessionStorage.clear();
        alert("Logged out successfully!");
        window.location.href = "selllog.html";
    });
});

function placeBid(itemId) {
    sessionStorage.setItem("selectedItem", itemId);
    window.location.href = "bid.html";
}

function editItem(itemId) {
    alert("Edit function coming soon!");
}

async function deleteItem(itemId) {
    if (confirm("Are you sure you want to delete this item?")) {
        try {
            const response = await fetch(`http://localhost:5000/api/seller/delete/${itemId}`, { method: "DELETE" });
            const data = await response.json();
            
            if (data.success) {
                alert("Item deleted successfully.");
                location.reload();
            } else {
                alert("Error deleting item: " + data.message);
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }
    }
}
