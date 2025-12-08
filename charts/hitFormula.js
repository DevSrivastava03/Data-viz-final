// charts/hitFormula.js
function drawHitFormulaChart(hitsData, fullData) {
  const metrics = ["tempo", "energy", "danceability", "valence", "loudness"];

  function avgMetric(rows, key) {
    const vals = rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const hitsAvg = metrics.map((m) => avgMetric(hitsData, m));
  const allAvg = metrics.map((m) => avgMetric(fullData, m));

  const ctx = document.getElementById("hitFormulaChart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: metrics.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
      datasets: [
        {
          label: "#1 Songs",
          data: hitsAvg,
          backgroundColor: "rgba(56,189,248,0.95)"
        },
        {
          label: "All Songs",
          data: allAvg,
          backgroundColor: "rgba(148,163,184,0.7)"
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
          grid: { display: false }
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(148,163,184,0.15)" }
        }
      }
    }
  });
}
