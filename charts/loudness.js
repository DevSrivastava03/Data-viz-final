// charts/loudness.js
function drawLoudnessChart(yearData) {
  const ctx = document.getElementById("loudnessChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: yearData.map((d) => d.year),
      datasets: [
        {
          label: "Average Loudness (dB)",
          data: yearData.map((d) => d.loudness),
          borderColor: "#f97316",
          backgroundColor: "rgba(249,115,22,0.18)",
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#020617",
          borderColor: "#f97316",
          borderWidth: 1,
          titleColor: "#e5e7eb",
          bodyColor: "#d1d5db"
        }
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.15)" }
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.15)" }
        }
      }
    }
  });
}
