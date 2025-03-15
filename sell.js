document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("sell-form");
    const sellerName = sessionStorage.getItem("sellerUsername");

    if (!sellerName) {
        alert("❌ You must be logged in as a seller to list an item.");
        window.location.href = "selllog.html"; // Redirect to login
        return;
    }

    document.getElementById("seller-name").value = sellerName;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const itemName = document.getElementById("item-name").value.trim();
        const itemDescription = document.getElementById("item-description").value.trim();
        const itemPrice = parseFloat(document.getElementById("item-price").value.trim());
        const bidDuration = parseInt(document.getElementById("bid-duration").value.trim());
        const itemImage = document.getElementById("item-image").files[0];

        if (!itemImage) {
            alert("❌ Please upload an item image.");
            return;
        }

        // Calculate bid end time
        const bidEndTime = Date.now() + bidDuration * 60 * 60 * 1000;

        const formData = new FormData();
        formData.append("itemImage", itemImage);
        formData.append("itemName", itemName);
        formData.append("itemDescription", itemDescription);
        formData.append("itemPrice", itemPrice);
        formData.append("sellerName", sellerName);
        formData.append("bidDuration", bidDuration);
        formData.append("bidEndTime", bidEndTime);
        formData.append("watchers", 0);
        formData.append("bidCount", 0);

        try {
            const response = await fetch("https://blockchain-auction-site.onrender.com/api/seller/list-item", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Item listed successfully!");
                window.location.href = "sellerdashboard.html";
            } else {
                alert("❌ " + (data.message || "Failed to list item."));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Server error. Try again later.");
        }
    });
});
