document.addEventListener("DOMContentLoaded", async function () {
    let userId = sessionStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        window.location.href = "login.html";
        return;
    }

    try {
        // Fetch buyer details from API
        const response = await fetch(`/buyer-profile?userId=${userId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        if (!response.ok) throw new Error("Failed to fetch profile");

        const user = await response.json();

        document.getElementById("firstName").textContent = user.firstName || "N/A";
        document.getElementById("lastName").textContent = user.lastName || "N/A";
        document.getElementById("username").textContent = user.username || "N/A";
        document.getElementById("email").textContent = user.email || "N/A";
        document.getElementById("dob").textContent = user.dob || "N/A";
        document.getElementById("shippingAddress").textContent = user.shippingAddress || "N/A";

        // Load wallets from user data
        updateWalletList(user.wallets || []);
    } catch (error) {
        console.error("Error loading profile:", error);
        alert("Error loading profile.");
    }

    // Load saved profile picture from localStorage
    const savedPic = localStorage.getItem("profilePic");
    if (savedPic) {
        document.getElementById("profile-img").src = savedPic;
    }
});

// Profile Image Upload
document.getElementById("upload-img").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("profile-img").src = e.target.result;
            localStorage.setItem("profilePic", e.target.result);
        };
        reader.readAsDataURL(file);
    }
});

// Function to connect a wallet
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts.length > 0) {
                updateWalletList([accounts[0]]);
                saveWallet(accounts[0]);
            }
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Failed to connect wallet.");
        }
    } else {
        alert("Please install MetaMask or another Web3 wallet extension.");
    }
}

// Function to update wallet list
function updateWalletList(wallets) {
    const walletList = document.getElementById("wallet-list");
    walletList.innerHTML = wallets.length
        ? wallets.map(wallet => `<li>${wallet}</li>`).join("")
        : "<li>Not connected</li>";
}

// Function to save wallet in localStorage
function saveWallet(walletAddress) {
    let userData = JSON.parse(localStorage.getItem("userData")) || {};
    userData.wallets = userData.wallets || [];
    if (!userData.wallets.includes(walletAddress)) {
        userData.wallets.push(walletAddress);
        localStorage.setItem("userData", JSON.stringify(userData));
    }
}

// Function to reset wallets
function resetWallets() {
    localStorage.removeItem("userData");
    document.getElementById("wallet-list").innerHTML = "<li>Not connected</li>";
}

// Logout function
document.getElementById("logout-btn").addEventListener("click", function () {
    sessionStorage.removeItem("userId");
    alert("Logged out successfully!");
    window.location.href = "login.html";
});

// Event listeners
document.getElementById("connect-wallet").addEventListener("click", connectWallet);
document.getElementById("add-wallet").addEventListener("click", connectWallet);
document.getElementById("change-wallet").addEventListener("click", resetWallets);
