// charts/valence.js
function drawValenceChart(yearData) {
  const ctx = document.getElementById("valenceChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: yearData.map((d) => d.year),
      datasets: [
        {
          label: "Average Valence (Happiness)",
          data: yearData.map((d) => d.valence),
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          borderWidth: 3,
          tension: 0.3,
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
          borderColor: "#22c55e",
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
          grid: { color: "rgba(148,163,184,0.15)" },
          min: 0,
          max: 1
        }
      }
    }
  });
}
