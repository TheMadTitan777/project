document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ Contact Page Loaded");

    document.getElementById("contact-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();
        const statusMsg = document.getElementById("form-status");

        if (!name || !email || !message) {
            statusMsg.textContent = "⚠️ Please fill out all fields!";
            statusMsg.style.color = "red";
            return;
        }

        // Simulated form submission
        setTimeout(() => {
            statusMsg.textContent = "✅ Message sent successfully!";
            statusMsg.style.color = "green";
            document.getElementById("contact-form").reset();
        }, 1000);
    });
});
