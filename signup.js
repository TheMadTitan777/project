// Toggle password visibility
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


// Handle wallet connection button click
document.getElementById("wallet-connect").addEventListener("click", connectWallet);

// Handle signup form submission
document.getElementById("signup-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    // Retrieve form values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const dob = document.getElementById("dob").value;
    const shippingAddress = document.getElementById("shippingAddress").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const walletAddress = document.getElementById("walletAddress").value.trim(); // Hidden field for wallet

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !dob || !shippingAddress || !password || !confirmPassword) {
        alert("Please fill in all required fields.");
        return;
    }

    // Validate password match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Create user data object
    const userData = {
        firstName,
        lastName,
        email,
        username,
        dob,
        shippingAddress,
        password, // This should be hashed on the backend!
        walletAddress
    };

    try {
        // Send data to Aiven PostgreSQL backend
        const response = await fetch("https://blockchain-auction-site.onrender.com/api/buyer/signup", {  // Adjust API URL if needed
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful!");
            window.location.href = "login.html"; // Redirect to login page
        } else {
            alert("Signup failed: " + data.message);
        }
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again.");
    }
});
