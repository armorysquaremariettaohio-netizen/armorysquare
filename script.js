
function openPlot(plotId) {
  fetch(`data/${plotId}.json`)
    .then(response => response.json())
    .then(data => {
      document.getElementById("modal-title").innerText = `Plot ${plotId.toUpperCase()}`;
      const list = document.getElementById("veteran-list");
      list.innerHTML = "";
      data.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = Object.values(entry).join(" — ");
        list.appendChild(li);
      });
      document.getElementById("modal").style.display = "block";
    });
}
document.querySelector(".close").onclick = function () {
  document.getElementById("modal").style.display = "none";
};
window.onclick = function(event) {
  if (event.target == document.getElementById("modal")) {
    document.getElementById("modal").style.display = "none";
  }
};
