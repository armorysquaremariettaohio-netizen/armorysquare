// Horizon Heights Veterans Data Loader
// Pulls live data directly from the Google Sheet CSV
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRbk9yRx6UAAq3zSeaRJY2FJ9vC2dElOOQo0o2IQYjkk1Ql6LvV74ndh_ngIZe4w/pub?output=csv';

async function openPlot(plotId) {
  try {
    const response = await fetch(SHEET_CSV_URL);
    const text = await response.text();
    const rows = text.split('\n').map(r => r.split(','));

    // Assuming header row: Name,Branch,Conflict,Service,Rank,Unit,ServiceYears,Plot
    const header = rows[0].map(h => h.trim().toLowerCase());
    const plotIndex = header.indexOf('plot');
    const list = document.getElementById("veteran-list");
    list.innerHTML = "";

    // Filter rows for selected plot
    const matchingRows = rows.slice(1).filter(row => {
      const plot = row[plotIndex] ? row[plotIndex].trim().toLowerCase() : '';
      return plot === plotId.toLowerCase();
    });

    if (matchingRows.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No veterans listed for this plot.";
      list.appendChild(li);
    } else {
      matchingRows.forEach(row => {
        const li = document.createElement("li");
        li.textContent = row.filter(x => x.trim() !== "").join(" — ");
        list.appendChild(li);
      });
    }

    // Update title and display modal
    document.getElementById("modal-title").innerText = `Plot ${plotId.toUpperCase()}`;
    document.getElementById("modal").style.display = "block";
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Unable to load veteran data right now. Please try again later.");
  }
}

// Close modal when clicking X
document.querySelector(".close").onclick = function () {
  document.getElementById("modal").style.display = "none";
};

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target == document.getElementById("modal")) {
    document.getElementById("modal").style.display = "none";
  }
};
