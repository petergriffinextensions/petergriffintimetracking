let activeTabId = null;
let startTime = null;

// Track when the active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
    updateTimeSpent(); // Save time spent on the previous tab
    activeTabId = activeInfo.tabId;
    startTime = Date.now();
});

// Track when a tab is updated or a page is fully loaded
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.tabId === activeTabId) {
        updateTimeSpent();
        startTime = Date.now(); // Restart time tracking for the new page
    }
}, { url: [{ urlMatches: '.*' }] });

// Save the time spent on the current site
function updateTimeSpent() {
    if (activeTabId !== null && startTime !== null) {
        const endTime = Date.now();
        const timeSpent = (endTime - startTime) / 1000; // Time in seconds

        chrome.tabs.get(activeTabId, (tab) => {
            if (chrome.runtime.lastError || !tab.url) return; // Handle tabs that no longer exist
            const url = new URL(tab.url).hostname;

            chrome.storage.local.get({ siteTimes: {} }, (result) => {
                let siteTimes = result.siteTimes;
                if (!siteTimes[url]) {
                    siteTimes[url] = 0;
                }
                siteTimes[url] += timeSpent;
                chrome.storage.local.set({ siteTimes: siteTimes });
            });
        });
    }
}

// Ensure time is updated when the service worker shuts down
chrome.runtime.onSuspend.addListener(() => {
    updateTimeSpent();
});
