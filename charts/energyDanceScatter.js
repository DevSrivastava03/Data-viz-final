// charts/energyDanceScatter.js
function drawEnergyDanceScatter(fullData) {
  const points2000s = [];
  const points2010s = [];
  const points2020s = [];

  fullData.forEach((d) => {
    if (d.energy == null || d.danceability == null) return;
    const point = { x: d.energy, y: d.danceability };

    if (d.year >= 2000 && d.year <= 2009) {
      points2000s.push(point);
    } else if (d.year >= 2010 && d.year <= 2019) {
      points2010s.push(point);
    } else if (d.year >= 2020) {
      points2020s.push(point);
    }
  });

  const ctx = document.getElementById("energyDanceScatter");

  new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "2000s",
          data: points2000s,
          backgroundColor: "rgba(59,130,246,0.8)",
          pointRadius: 3.5
        },
        {
          label: "2010s",
          data: points2010s,
          backgroundColor: "rgba(45,212,191,0.8)",
          pointRadius: 3.5
        },
        {
          label: "2020s",
          data: points2020s,
          backgroundColor: "rgba(239,68,68,0.9)",
          pointRadius: 4.2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          labels: {
            usePointStyle: true,
            pointStyle: "circle",
            padding: 18
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `Energy: ${ctx.parsed.x.toFixed(2)}, Dance: ${ctx.parsed.y.toFixed(
                2
              )}`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Energy" },
          // zoom in to the interesting range
          min: 0.3,
          max: 1,
          grid: { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          title: { display: true, text: "Danceability" },
          min: 0.25,
          max: 1,
          grid: { color: "rgba(255,255,255,0.04)" }
        }
      }
    }
  });
}
