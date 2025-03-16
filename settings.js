// Fetch user data from backend
async function fetchUserData() {
    try {
        const response = await fetch('/api/buyer/profile', { 
            method: 'GET',
            credentials: 'include' // Ensures authentication cookies/session are sent
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data.');
        }

        const userData = await response.json();

        // Update UI with fetched user data
        document.getElementById("display-username").textContent = userData.username;
        document.getElementById("display-email").textContent = userData.email;
    } catch (error) {
        console.error("❌ ERROR:", error);
        alert("Failed to load user data. Please log in again.");
        window.location.href = "login.html"; // Redirect to login if data is missing
    }
}

// Call function on page load
document.addEventListener("DOMContentLoaded", fetchUserData);

// Change password function
async function changePassword() {
    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        alert("❌ Please fill in all password fields.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("❌ New passwords do not match.");
        return;
    }

    try {
        const response = await fetch('/api/buyer/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ Password updated successfully!");
        } else {
            alert(`❌ ${result.message || "Password update failed."}`);
        }
    } catch (error) {
        console.error("❌ ERROR:", error);
        alert("An error occurred while updating the password.");
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/buyer/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.ok) {
            alert("👋 Logged out successfully.");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert("❌ Logout failed. Try again.");
        }
    } catch (error) {
        console.error("❌ ERROR:", error);
        alert("An error occurred while logging out.");
    }
}

// Delete account function
async function deleteAccount() {
    if (!confirm("⚠️ Are you sure you want to delete your account? This action cannot be undone!")) {
        return;
    }

    try {
        const response = await fetch('/api/buyer/delete', {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            alert("🗑️ Account deleted successfully.");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert("❌ Failed to delete account.");
        }
    } catch (error) {
        console.error("❌ ERROR:", error);
        alert("An error occurred while deleting the account.");
    }
}
