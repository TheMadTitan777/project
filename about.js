document.addEventListener("DOMContentLoaded", function () {
    console.log("✅ About Page Loaded");

    // Team Members Data
    const teamMembers = [
        { name: "Adesanya Oluwabukunmi", role: "Developer", img: "team1.jpg" },
        { name: "Dare-Abel Ayomide", role: "Developer", img: "team2.jpg" },
    ];

    const teamContainer = document.getElementById("team-container");

    // Load team members dynamically
    teamMembers.forEach(member => {
        let memberDiv = document.createElement("div");
        memberDiv.classList.add("team-member");

        memberDiv.innerHTML = `
            <img src="${member.img}" alt="${member.name}" onerror="this.src='default-avatar.jpg'">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
        `;

        teamContainer.appendChild(memberDiv);
    });

    console.log("👥 Team Members Loaded:", teamMembers);
});
