document.addEventListener('DOMContentLoaded', function () {
  // Load the site times when the popup is opened
  loadSiteTimes();

  // Set up the reload button click event
  document.getElementById('reload-btn').addEventListener('click', function () {
    loadSiteTimes();
  });
});

// Function to load and display site times
function loadSiteTimes() {
  chrome.storage.local.get({ siteTimes: {} }, function (result) {
    const siteTimes = result.siteTimes;
    const siteTimesList = document.getElementById('site-times');
    
    // Clear any existing list items
    siteTimesList.innerHTML = '';

    // Populate the list with stored data
    if (Object.keys(siteTimes).length === 0) {
      siteTimesList.innerHTML = '<li class="no-data">No data available</li>';
    } else {
      const sortedSites = Object.entries(siteTimes).sort((a, b) => b[1] - a[1]);
      sortedSites.forEach(([site, time]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${site}</span> <span>${Math.round(time)}s</span>`;
        siteTimesList.appendChild(li);
      });
    }
  });
}
