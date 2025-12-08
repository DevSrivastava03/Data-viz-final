// charts/acoustic.js
function drawAcousticChart(yearData) {
  const ctx = document.getElementById("acousticChart");

  const labels = yearData.map((d) => d.year);
  const acoustic = yearData.map((d) => d.acousticness);
  const electronic = acoustic.map((a) => 1 - a);

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Acousticness",
          data: acoustic,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34,197,94,0.15)",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: "Electronic-leaning (1 - acoustic)",
          data: electronic,
          borderColor: "#0ea5e9",
          backgroundColor: "rgba(14,165,233,0.1)",
          borderWidth: 2.5,
          tension: 0.3,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#e5e7eb" }
        },
        tooltip: {
          backgroundColor: "#020617",
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
          min: 0,
          max: 1,
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.15)" }
        }
      }
    }
  });
}
