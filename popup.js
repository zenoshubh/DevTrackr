document.addEventListener("DOMContentLoaded", async function () {
    const platformSelect = document.getElementById("platform-select");
    const saveButton = document.getElementById("save-settings");
    const settingsToggle = document.getElementById("settings-toggle");
    const closeSettings = document.getElementById("close-settings");
    const getStartedBtn = document.getElementById("get-started-btn");
    const clearDataBtn = document.getElementById("clear-data");
    const loadingOverlay = document.getElementById("loading-overlay");
    const errorMessage = document.getElementById("error-message");

    // Initialize the app
    await initializeApp();

    // Event listeners
    if (platformSelect) {
        platformSelect.addEventListener("change", function () {
            const selectedPlatform = platformSelect.value;
            localStorage.setItem("selectedPlatform", selectedPlatform);
            updatePlatformDisplay(selectedPlatform);
        });
    }

    saveButton.addEventListener("click", handleSaveAndFetch);
    settingsToggle.addEventListener("click", showSettings);
    closeSettings.addEventListener("click", hideSettings);
    getStartedBtn.addEventListener("click", showSettings);
    clearDataBtn.addEventListener("click", handleClearData);
});

async function initializeApp() {
    const usernames = getSavedUsernames();
    const hasAnyUsername = usernames.leetcode || usernames.code360 || usernames.github;

    if (hasAnyUsername) {
        // Show main content
        showMainContent();
        await loadSavedSettings();
        
        // Load saved platform choice
        const savedPlatform = localStorage.getItem("selectedPlatform") || "leetcode";
        const platformSelect = document.getElementById("platform-select");
        if (platformSelect) {
            platformSelect.value = savedPlatform;
            updatePlatformDisplay(savedPlatform);
        }

        // Auto-fetch data
        await fetchAllData();
    } else {
        // Show welcome screen
        showWelcomeScreen();
    }
}

function showWelcomeScreen() {
    document.getElementById("welcome-section").style.display = "block";
    document.getElementById("dsa-section").style.display = "none";
    document.getElementById("github-section").style.display = "none";
    document.getElementById("settings-section").style.display = "none";
}

function showMainContent() {
    document.getElementById("welcome-section").style.display = "none";
    document.getElementById("dsa-section").style.display = "block";
    document.getElementById("github-section").style.display = "block";
    document.getElementById("settings-section").style.display = "none";
}

function showSettings() {
    document.getElementById("settings-section").style.display = "block";
    loadSavedSettings(); // Load current values into form
}

function hideSettings() {
    const usernames = getSavedUsernames();
    const hasAnyUsername = usernames.leetcode || usernames.code360 || usernames.github;
    
    if (hasAnyUsername) {
        document.getElementById("settings-section").style.display = "none";
        showMainContent();
    } else {
        document.getElementById("settings-section").style.display = "none";
        showWelcomeScreen();
    }
}

async function handleClearData() {
    if (confirm("Are you sure you want to clear all saved data? This will remove all usernames and reset the extension.")) {
        // Clear all stored data
        localStorage.removeItem("leetcode-username");
        localStorage.removeItem("code360-username");
        localStorage.removeItem("github-username");
        localStorage.removeItem("selectedPlatform");

        // Reset UI
        resetAllStats();
        showWelcomeScreen();
        
        // Clear input fields
        document.getElementById("leetcode-username").value = "";
        document.getElementById("code360-username").value = "";
        document.getElementById("github-username").value = "";
    }
}

function resetAllStats() {
    // Reset LeetCode stats
    updateLeetCodeUI({
        totalSolved: "-",
        easy: "-",
        medium: "-",
        hard: "-"
    });

    // Reset Code360 stats
    updateCode360UI({
        totalSolved: "-",
        rank: "-"
    });

    // Reset GitHub stats
    updateGitHubUI({
        repos: "-",
        followers: "-",
        following: "-",
        contributions: "-"
    });

    // Reset display usernames
    document.getElementById("lc-username-display").textContent = "Not configured";
    document.getElementById("code360-username-display").textContent = "Not configured";
    document.getElementById("github-username-display").textContent = "Not configured";
}

function getSavedUsernames() {
    return {
        leetcode: localStorage.getItem("leetcode-username") || "",
        code360: localStorage.getItem("code360-username") || "",
        github: localStorage.getItem("github-username") || ""
    };
}

async function loadSavedSettings() {
    const usernames = getSavedUsernames();
    
    document.getElementById("leetcode-username").value = usernames.leetcode;
    document.getElementById("code360-username").value = usernames.code360;
    document.getElementById("github-username").value = usernames.github;

    // Update display usernames
    document.getElementById("lc-username-display").textContent = usernames.leetcode || "Not configured";
    document.getElementById("code360-username-display").textContent = usernames.code360 || "Not configured";
    document.getElementById("github-username-display").textContent = usernames.github || "Not configured";
}

async function handleSaveAndFetch() {
    const leetcodeUsername = document.getElementById("leetcode-username").value.trim();
    const code360Username = document.getElementById("code360-username").value.trim();
    const githubUsername = document.getElementById("github-username").value.trim();

    if (!leetcodeUsername && !code360Username && !githubUsername) {
        showError("Please enter at least one username");
        return;
    }

    // Save usernames
    localStorage.setItem("leetcode-username", leetcodeUsername);
    localStorage.setItem("code360-username", code360Username);
    localStorage.setItem("github-username", githubUsername);

    // Update display usernames
    document.getElementById("lc-username-display").textContent = leetcodeUsername || "Not configured";
    document.getElementById("code360-username-display").textContent = code360Username || "Not configured";
    document.getElementById("github-username-display").textContent = githubUsername || "Not configured";

    // Show main content and hide settings
    showMainContent();
    
    // Set default platform if not set
    if (!localStorage.getItem("selectedPlatform")) {
        localStorage.setItem("selectedPlatform", "leetcode");
    }
    
    const platformSelect = document.getElementById("platform-select");
    if (platformSelect) {
        platformSelect.value = localStorage.getItem("selectedPlatform");
        updatePlatformDisplay(platformSelect.value);
    }

    await fetchAllData();
}

async function fetchAllData() {
    showLoading(true);
    hideError();

    const usernames = getSavedUsernames();
    const promises = [];

    if (usernames.leetcode) {
        promises.push(fetchLeetCodeStats(usernames.leetcode));
    }
    if (usernames.code360) {
        promises.push(fetchCode360Stats(usernames.code360));
    }
    if (usernames.github) {
        promises.push(fetchGitHubStats(usernames.github));
    }

    try {
        await Promise.allSettled(promises);
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        showLoading(false);
    }
}

function updatePlatformDisplay(platform) {
    document.getElementById("leetcode-section").style.display = (platform === "leetcode") ? "block" : "none";
    document.getElementById("code360-section").style.display = (platform === "code360") ? "block" : "none";
}

async function fetchLeetCodeStats(username) {
    if (!username) return;

    const apiURL = `https://leetcode-stats-api.herokuapp.com/${username}`;

    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();

        if (data.status === "error") {
            throw new Error(data.message || "User not found");
        }

        updateLeetCodeUI({
            totalSolved: data.totalSolved || 0,
            easy: data.easySolved || 0,
            medium: data.mediumSolved || 0,
            hard: data.hardSolved || 0
        });

    } catch (error) {
        console.error("LeetCode Error:", error);
        updateLeetCodeUI({
            totalSolved: "Error",
            easy: "Error",
            medium: "Error",
            hard: "Error"
        });
        showError(`LeetCode: ${error.message}`);
    }
}

async function fetchCode360Stats(username) {
    if (!username) return;

    const apiURL = `https://www.naukri.com/code360/api/v3/public_section/profile/user_details?uuid=${username}`;

    try {
        const response = await fetch(apiURL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();

        if (data.status !== 200) {
            throw new Error("User not found or invalid response");
        }

        updateCode360UI({
            totalSolved: data.data?.dsa_domain_data?.problem_count_data?.total_count || 0,
            rank: data.data?.rank || "N/A"
        });

    } catch (error) {
        console.error("Code360 Error:", error);
        updateCode360UI({
            totalSolved: "Error",
            rank: "Error"
        });
        showError(`Code360: ${error.message}`);
    }
}

async function fetchGitHubStats(username) {
    if (!username) return;

    const userApiURL = `https://api.github.com/users/${username}`;

    try {
        const userResponse = await fetch(userApiURL);
        if (!userResponse.ok) {
            if (userResponse.status === 404) {
                throw new Error("User not found");
            }
            throw new Error(`HTTP ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();

        // Get current year contributions
        const currentYear = new Date().getFullYear();
        let contributions = "N/A";

        try {
            const contributionsApiURL = `https://github-contributions-api.jogruber.de/v4/${username}`;
            const contributionsResponse = await fetch(contributionsApiURL);
            
            if (contributionsResponse.ok) {
                const contributionsData = await contributionsResponse.json();
                contributions = contributionsData.total?.[currentYear] || contributionsData.total?.[(currentYear - 1)] || "N/A";
            }
        } catch (contribError) {
            console.warn("Could not fetch contributions:", contribError);
        }

        updateGitHubUI({
            repos: userData.public_repos || 0,
            followers: userData.followers || 0,
            following: userData.following || 0,
            contributions: contributions
        });

    } catch (error) {
        console.error("GitHub Error:", error);
        updateGitHubUI({
            repos: "Error",
            followers: "Error",
            following: "Error",
            contributions: "Error"
        });
        showError(`GitHub: ${error.message}`);
    }
}

function updateLeetCodeUI(data) {
    document.getElementById("lc-totalSolved").textContent = data.totalSolved;
    document.getElementById("lc-easy").textContent = data.easy;
    document.getElementById("lc-medium").textContent = data.medium;
    document.getElementById("lc-hard").textContent = data.hard;
}

function updateCode360UI(data) {
    document.getElementById("code360-totalSolved").textContent = data.totalSolved;
    document.getElementById("code360-rank").textContent = data.rank;
}

function updateGitHubUI(data) {
    document.getElementById("github-repos").textContent = data.repos;
    document.getElementById("github-followers").textContent = data.followers;
    document.getElementById("github-following").textContent = data.following;
    document.getElementById("github-contributions").textContent = data.contributions;
}

function showLoading(show) {
    document.getElementById("loading-overlay").style.display = show ? "flex" : "none";
}

function showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    errorElement.style.display = "block";
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    document.getElementById("error-message").style.display = "none";
}
