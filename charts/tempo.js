// charts/tempo.js
function drawTempoChart(yearData) {
  const ctx = document.getElementById("tempoChart");

  new Chart(ctx, {
    type: "line",
    data: {
      labels: yearData.map((d) => d.year),
      datasets: [
        {
          label: "Average Tempo (BPM)",
          data: yearData.map((d) => d.tempo),
          borderColor: "#38bdf8",
          backgroundColor: "rgba(56, 189, 248, 0.15)",
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
          borderColor: "#38bdf8",
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
