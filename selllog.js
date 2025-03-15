document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("seller-login-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const rememberMe = document.getElementById("rememberMe").checked;

        try {
            const response = await fetch("https://blockchain-auction-site.onrender.com/api/seller/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log("🟢 Login API Response:", data); // ✅ Log full response

            if (response.ok) {
                alert("✅ Login successful! Redirecting...");

                if (data.user && data.user.username) {
                    console.log("🟢 Seller Username (from API):", data.user.username); // ✅ Log extracted username

                    // ✅ Store username correctly
                    sessionStorage.setItem("sellerUsername", data.user.username);
                    sessionStorage.setItem("sellerEmail", email);

                    // ✅ "Remember Me" feature
                    if (rememberMe) {
                        localStorage.setItem("sellerEmail", email);
                        localStorage.setItem("sellerPassword", password);
                    } else {
                        localStorage.removeItem("sellerEmail");
                        localStorage.removeItem("sellerPassword");
                    }

                    // Redirect to seller dashboard
                    window.location.href = "sellerdashboard.html";
                } else {
                    alert("❌ Login failed. User data is missing!");
                    console.error("❌ Error: API response does not contain user data.");
                }
            } else {
                alert("❌ " + (data.message || "Invalid credentials!"));
            }
        } catch (error) {
            console.error("❌ Server error:", error);
            alert("❌ Server error. Please try again.");
        }
    });

    // ✅ Auto-fill "Remember Me" credentials if stored
    if (localStorage.getItem("sellerEmail") && localStorage.getItem("sellerPassword")) {
        document.getElementById("email").value = localStorage.getItem("sellerEmail");
        document.getElementById("password").value = localStorage.getItem("sellerPassword");
        document.getElementById("rememberMe").checked = true;
    }

    // ✅ Verify session before redirecting
    const sellerUsername = sessionStorage.getItem("sellerUsername");
    const sellerEmail = sessionStorage.getItem("sellerEmail");

    if (sellerUsername && sellerEmail) {
        fetch("https://blockchain-auction-site.onrender.com/api/seller/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: sellerEmail }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                window.location.href = "sellerdashboard.html";
            } else {
                console.log("🔴 Session expired. Logging out.");
                sessionStorage.clear(); // Clear session if invalid
            }
        })
        .catch(error => console.error("Error verifying session:", error));
    }
});

// ✅ Password Toggle Function
function togglePassword(fieldId, eyeId) {
    const passwordField = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(eyeId);

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.src = "eye-open.png"; // Ensure this image exists
    } else {
        passwordField.type = "password";
        eyeIcon.src = "eye-closed.png";
    }
}
