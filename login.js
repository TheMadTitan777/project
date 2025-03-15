document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://blockchain-auction-site.onrender.com/api/buyer/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
            // Store user info in sessionStorage
            sessionStorage.setItem("buyerUsername", data.user.username);
            sessionStorage.setItem("buyerUserId", data.user.id);
            sessionStorage.setItem("buyerProfilePicture", data.user.profilePicture || "default-pfp.png");

            // Optional: Store in localStorage for persistent login
            localStorage.setItem("authToken", data.token);

            alert("✅ Login successful!");
            window.location.href = "home.html";
        } else {
            alert("❌ " + data.message);
        }
    } catch (error) {
        console.error("Login Error:", error);
        alert("❌ An error occurred while logging in.");
    }
});

// Password Toggle
function togglePassword(fieldId, eyeId) {
    const passwordField = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(eyeId);

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.src = "eye-open.png"; // Change to open eye icon
    } else {
        passwordField.type = "password";
        eyeIcon.src = "eye-closed.png"; // Change to closed eye icon
    }
}
