let activeTabId = null;
let startTime = null;

// When a tab is activated, track the time
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Update time spent on the previous active tab
  if (activeTabId !== null && startTime !== null) {
    updateTimeSpent();
  }
  // Update to new active tab and reset start time
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
});

// When a navigation event completes, track the time
chrome.webNavigation.onCompleted.addListener((details) => {
  // Check if the navigation event is for the current active tab
  if (details.tabId === activeTabId) {
    // Update time spent on the previous URL if a new navigation occurs in the active tab
    if (activeTabId !== null && startTime !== null) {
      updateTimeSpent();
    }
    // Update to new navigation details
    startTime = Date.now();
  }
}, { url: [{ urlMatches: '.*' }] });

// Update the time spent on the current site
function updateTimeSpent() {
  const endTime = Date.now();
  const timeSpent = (endTime - startTime) / 1000; // Time in seconds

  // Get the currently active tab to update the time spent
  chrome.tabs.get(activeTabId, (tab) => {
    // Handle cases where tab may be undefined or URL is not available
    if (chrome.runtime.lastError || !tab || !tab.url) {
      console.warn('Error accessing tab:', chrome.runtime.lastError || 'Tab not found or URL missing.');
      return;
    }

    // Extract hostname from URL
    const url = new URL(tab.url).hostname;

    // Update the time spent on the site in local storage
    chrome.storage.local.get({ siteTimes: {} }, (result) => {
      let siteTimes = result.siteTimes || {};
      if (!siteTimes[url]) {
        siteTimes[url] = 0;
      }
      siteTimes[url] += timeSpent;

      // Save the updated time to storage
      chrome.storage.local.set({ siteTimes: siteTimes }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving site times:', chrome.runtime.lastError);
        }
      });
    });
  });
}

// Reset active tab and start time when the browser action (popup) is opened or closed
chrome.action.onClicked.addListener(() => {
  if (activeTabId !== null && startTime !== null) {
    updateTimeSpent();
    activeTabId = null;
    startTime = null;
  }
});
