// charts/genreChart.js
function drawGenreChart(genreData) {
  const ctx = document.getElementById("genreChart");

  const labels = genreData.map((d) => d.genre);
  const energy = genreData.map((d) => d.energy);
  const dance = genreData.map((d) => d.danceability);
  const valence = genreData.map((d) => d.valence);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Energy",
          data: energy,
          backgroundColor: "rgba(59,130,246,0.9)"
        },
        {
          label: "Danceability",
          data: dance,
          backgroundColor: "rgba(45,212,191,0.9)"
        },
        {
          label: "Valence",
          data: valence,
          backgroundColor: "rgba(234,179,8,0.95)"
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
          grid: { color: "rgba(148,163,184,0.15)" },
          min: 0,
          max: 1
        }
      }
    }
  });
}
