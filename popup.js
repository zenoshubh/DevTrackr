document.addEventListener("DOMContentLoaded", async function () {
    const leetcodeUsername = "shubh-v21";  // Change this
    const code360UUID = "ShubhDevs";  // Change this (UUID for Code360)
    const githubUsername = "shubh-v21";  // Change this (Your GitHub Username)

    const platformSelect = document.getElementById("platform-select");

    // Load saved platform choice
    const savedPlatform = localStorage.getItem("selectedPlatform") || "leetcode";
    platformSelect.value = savedPlatform;
    updatePlatformDisplay(savedPlatform);

    platformSelect.addEventListener("change", function () {
        const selectedPlatform = platformSelect.value;
        localStorage.setItem("selectedPlatform", selectedPlatform);
        updatePlatformDisplay(selectedPlatform);
    });

    // Fetch data for DSA platforms
    await fetchLeetCodeStats(leetcodeUsername);
    await fetchCode360Stats(code360UUID);

    // Fetch GitHub stats
    await fetchGitHubStats(githubUsername);
});

// Function to show the selected DSA platform's data
function updatePlatformDisplay(platform) {
    document.getElementById("leetcode-section").style.display = (platform === "leetcode") ? "block" : "none";
    document.getElementById("code360-section").style.display = (platform === "code360") ? "block" : "none";
}

// Fetch LeetCode Stats
async function fetchLeetCodeStats(username) {
    const apiURL = `https://leetcode-stats-api.herokuapp.com/${username}`;

    try {
        const response = await fetch(apiURL);
        const data = await response.json();

        document.getElementById("lc-username").innerText = username;
        document.getElementById("lc-totalSolved").innerText = data.totalSolved;
        document.getElementById("lc-easy").innerText = data.easySolved;
        document.getElementById("lc-medium").innerText = data.mediumSolved;
        document.getElementById("lc-hard").innerText = data.hardSolved;
    } catch (error) {
        console.error("LeetCode Error:", error);
        document.getElementById("lc-username").innerText = "Failed to load";
    }
}

// Fetch Code360 Stats
async function fetchCode360Stats(uuid) {
    const apiURL = `https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=${uuid}`;

    try {
        const response = await fetch(apiURL);
        const data = await response.json();

        if (data.status == 200) {
            document.getElementById("code360-username").innerText = uuid;
            document.getElementById("code360-totalSolved").innerText = data.data.dsa_domain_data.problem_count_data.total_count;
            document.getElementById("code360-rank").innerText = data.data.rank;
        } else {
            throw new Error("Invalid Code360 response");
        }
    } catch (error) {
        console.error("Code360 Error:", error);
        document.getElementById("code360-username").innerText = "Failed to load";
    }
}

// Fetch GitHub Stats
async function fetchGitHubStats(username) {
    const userApiURL = `https://api.github.com/users/${username}`;
    const contributionsApiURL = `https://github-contributions-api.jogruber.de/v4/${username}`;

    try {
        // Fetch basic GitHub profile stats
        const userResponse = await fetch(userApiURL);
        const userData = await userResponse.json();

        document.getElementById("github-username").innerText = username;
        document.getElementById("github-repos").innerText = userData.public_repos;
        document.getElementById("github-followers").innerText = userData.followers;
        document.getElementById("github-following").innerText = userData.following;

        // Fetch total contributions in the last year
        const contributionsResponse = await fetch(contributionsApiURL);
        const contributionsData = await contributionsResponse.json();

        if (contributionsData.total) {
            document.getElementById("github-contributions").innerText = contributionsData.total["2025"];
        } else {
            throw new Error("Invalid GitHub contributions response");
        }
    } catch (error) {
        console.error("GitHub Error:", error);
        document.getElementById("github-username").innerText = "Failed to load";
    }
}
