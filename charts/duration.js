// charts/duration.js
function drawDurationChart(yearData) {
  const ctx = document.getElementById("durationChart");

  const labels = yearData.map((d) => d.year);
  const minutes = yearData.map((d) => d.duration_ms / 60000); // ms → minutes

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Average Song Length (minutes)",
          data: minutes,
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.2)",
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
          borderColor: "#6366f1",
          borderWidth: 1,
          titleColor: "#e5e7eb",
          bodyColor: "#d1d5db",
          callbacks: {
            label: (ctx) => `${ctx.parsed.y.toFixed(2)} min`
          }
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
