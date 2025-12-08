// charts/faithHill.js
function drawFaithHillChart(fullData, decadeData) {
  const ctx = document.getElementById("faithHillChart");

  // Find Faith Hill's 2000 #1 song (Breathe)
  const faith = fullData.find(
    (d) =>
      String(d.band_singer).toLowerCase().includes("faith hill") &&
      d.year === 2000
  );

  if (!faith) {
    console.warn("Faith Hill song not found in data");
    return;
  }

  // Get 2020s averages from decadeData
  const d2020s = decadeData.find((d) => d.decade === "2020s");
  if (!d2020s) {
    console.warn("2020s decade summary not found");
    return;
  }

  const metrics = ["tempo", "energy", "danceability", "valence", "loudness"];

  const faithVals = metrics.map((m) => faith[m]);
  const modernVals = metrics.map((m) => d2020s[m]);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: metrics.map((m) => m.charAt(0).toUpperCase() + m.slice(1)),
      datasets: [
        {
          label: 'Faith Hill — "Breathe" (2000)',
          data: faithVals,
          backgroundColor: "rgba(129,140,248,0.95)"
        },
        {
          label: "Average 2020s Hit",
          data: modernVals,
          backgroundColor: "rgba(34,197,94,0.9)"
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
