document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("seller-signup-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const username = document.getElementById("username").value.trim();
        const dob = document.getElementById("dob").value;
        const storeName = document.getElementById("storeName").value.trim();
        const storeAddress = document.getElementById("storeAddress").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("❌ Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/seller/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName, lastName, email, username, dob,
                    storeName, storeAddress, password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("✅ Sign-up successful! Redirecting to login...");
                window.location.href = "selllog.html"; // Redirect to seller login page
            } else {
                alert("❌ " + (data.message || "Sign-up failed. Please try again."));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("❌ Server error. Please try again later.");
        }
    });
});

// Toggle Password Visibility
function togglePassword(fieldId, eyeId) {
    const field = document.getElementById(fieldId);
    const eyeIcon = document.getElementById(eyeId);

    if (field.type === "password") {
        field.type = "text";
        eyeIcon.src = "eye-open.png"; // Ensure this image exists
    } else {
        field.type = "password";
        eyeIcon.src = "eye-closed.png";
    }
}
