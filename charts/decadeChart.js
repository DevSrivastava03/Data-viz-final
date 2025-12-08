// charts/decadeChart.js
function drawDecadeChart(decadeData) {
  const ctx = document.getElementById("decadeChart");

  // Keep order nice: 2000s, 2010s, 2020s
  const order = ["2000s", "2010s", "2020s"];
  decadeData.sort((a, b) => order.indexOf(a.decade) - order.indexOf(b.decade));

  const labels = decadeData.map((d) => d.decade);
  const tempo = decadeData.map((d) => d.tempo);
  const valence = decadeData.map((d) => d.valence);
  const loudness = decadeData.map((d) => d.loudness);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tempo (BPM)",
          data: tempo,
          backgroundColor: "rgba(59,130,246,0.9)"
        },
        {
          label: "Valence",
          data: valence,
          backgroundColor: "rgba(45,212,191,0.9)"
        },
        {
          label: "Loudness (dB)",
          data: loudness,
          backgroundColor: "rgba(239,68,68,0.9)"
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
