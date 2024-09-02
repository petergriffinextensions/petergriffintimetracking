document.addEventListener('DOMContentLoaded', () => {
  displaySiteTimes();
});

function displaySiteTimes() {
  chrome.storage.local.get({ siteTimes: {} }, (result) => {
    const siteTimes = result.siteTimes;
    const siteTimesDiv = document.getElementById('site-times');
    
    if (Object.keys(siteTimes).length === 0) {
      siteTimesDiv.textContent = 'No data available.';
      return;
    }

    // Sort the sites by time spent in descending order
    const sortedSiteTimes = Object.entries(siteTimes).sort((a, b) => b[1] - a[1]);

    let html = '<ul>';
    for (const [site, time] of sortedSiteTimes) {
      html += `<li>${site}: ${time.toFixed(2)} seconds</li>`;
    }
    html += '</ul>';

    siteTimesDiv.innerHTML = html;
  });
}
