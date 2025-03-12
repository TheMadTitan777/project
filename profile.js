// Load profile data from localStorage
document.addEventListener("DOMContentLoaded", function () {
    const userData = JSON.parse(localStorage.getItem("userData")) || {};
    
    if (userData.firstName) document.getElementById("firstName").innerText = userData.firstName;
    if (userData.lastName) document.getElementById("lastName").innerText = userData.lastName;
    if (userData.username) document.getElementById("username").innerText = userData.username;
    if (userData.email) document.getElementById("email").innerText = userData.email;
    if (userData.dob) document.getElementById("dob").innerText = userData.dob;
    if (userData.shippingAddress) document.getElementById("shippingAddress").innerText = userData.shippingAddress;
    
    // Load wallets from localStorage
    const walletList = document.getElementById("wallet-list");
    walletList.innerHTML = ""; 
    const savedWallets = userData.wallets || [];
    if (savedWallets.length > 0) {
        savedWallets.forEach(wallet => {
            const walletItem = document.createElement("li");
            walletItem.innerText = wallet;
            walletList.appendChild(walletItem);
        });
    } else {
        walletList.innerHTML = "<li>Not connected</li>";
    }
});

// Handle profile picture upload
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

// Load saved profile picture
document.addEventListener("DOMContentLoaded", function () {
    const savedPic = localStorage.getItem("profilePic");
    if (savedPic) {
        document.getElementById("profile-img").src = savedPic;
    }
});

// Function to connect a wallet and allow selecting a new one
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            // Always prompt user to select a wallet, even if one is already connected
            const accounts = await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
                .then(() => window.ethereum.request({ method: 'eth_requestAccounts' }));

            if (accounts.length > 0) {
                updateWalletList(accounts[0]); // Update wallet display
            }
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Failed to connect wallet.");
        }
    } else {
        alert("Please install MetaMask or another Web3 wallet extension.");
    }
}

// Function to update wallet list display
function updateWalletList(walletAddress) {
    const walletList = document.getElementById('wallet-list');
    walletList.innerHTML = `<li>${walletAddress}</li>`;
}

// Function to reset wallets
function resetWallets() {
    const walletList = document.getElementById('wallet-list');
    walletList.innerHTML = `<li>Not connected</li>`;
}

// Event listeners
document.getElementById('connect-wallet').addEventListener('click', connectWallet);
document.getElementById('add-wallet').addEventListener('click', connectWallet);
document.getElementById('change-wallet').addEventListener('click', resetWallets);

document.addEventListener("DOMContentLoaded", function () {
    let userId = sessionStorage.getItem("userId");

    if (!userId) {
        alert("Please log in first.");
        window.location.href = "login.html";
    } else {
        db.collection("users").doc(userId).get()
            .then((doc) => {
                if (doc.exists) {
                    let user = doc.data();
                    document.getElementById("firstName").textContent = user.firstName;
                    document.getElementById("lastName").textContent = user.lastName;
                    document.getElementById("username").textContent = user.username;
                    document.getElementById("email").textContent = user.email;
                    document.getElementById("shippingAddress").textContent = user.shippingAddress;
                } else {
                    alert("User data not found!");
                }
            })
            .catch((error) => alert("Error fetching data: " + error.message));
    }
});

document.getElementById("logout-btn").addEventListener("click", function () {
    auth.signOut().then(() => {
        sessionStorage.removeItem("userId");
        alert("Logged out successfully!");
        window.location.href = "login.html";
    }).catch((error) => alert(error.message));
});
