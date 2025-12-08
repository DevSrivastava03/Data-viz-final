// main.js
// Global Chart.js defaults for a cohesive "modern tech" look
Chart.defaults.font.family = "Inter, system-ui, sans-serif";
Chart.defaults.color = "#E5E7EB";

Chart.defaults.scale.grid.color = "rgba(255,255,255,0.06)";
Chart.defaults.scale.ticks.color = "#9CA3AF";

Chart.defaults.plugins.legend.labels.usePointStyle = true;

Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 7;

Chart.defaults.elements.line.tension = 0.32;
Chart.defaults.elements.line.borderWidth = 3;

Chart.defaults.plugins.tooltip.backgroundColor = "rgba(0,0,0,0.85)";
Chart.defaults.plugins.tooltip.borderColor = "#38bdf8";
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.borderRadius = 6;

Chart.defaults.plugins.legend.position = "bottom";

if (window.Chart) {
  Chart.defaults.font.family =
    'system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif';
  Chart.defaults.color = "#e5e7eb";

  // gridlines
  Chart.defaults.scale.grid.color = "rgba(255,255,255,0.04)";
  Chart.defaults.scale.ticks.color = "#9ca3af";

  // line charts
  Chart.defaults.elements.line.borderWidth = 3;
  Chart.defaults.elements.line.tension = 0.32;

  // points
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 6;

  // layout
  Chart.defaults.layout.padding = {
    top: 10,
    right: 14,
    bottom: 8,
    left: 8
  };

  // tooltips
  Chart.defaults.plugins.tooltip.backgroundColor = "#020617";
  Chart.defaults.plugins.tooltip.borderColor = "#38bdf8";
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = "#e5e7eb";
  Chart.defaults.plugins.tooltip.bodyColor = "#d1d5db";

  // legends
  Chart.defaults.plugins.legend.labels.color = "#e5e7eb";
}

// Load JSON data, then draw all 10 charts
Promise.all([
  fetch("data/year.json").then((r) => r.json()),
  fetch("data/full-data.json").then((r) => r.json()),
  fetch("data/decade.json").then((r) => r.json()),
  fetch("data/genre.json").then((r) => r.json()),
  fetch("data/hits.json").then((r) => r.json())
])
  .then(([yearData, fullData, decadeData, genreData, hitsData]) => {
    yearData.sort((a, b) => a.year - b.year);

    drawTempoChart(yearData);
    drawEnergyDanceScatter(fullData);
    drawValenceChart(yearData);
    drawGenreChart(genreData);
    drawLoudnessChart(yearData);
    drawDurationChart(yearData);
    drawAcousticChart(yearData);
    drawHitFormulaChart(hitsData, fullData);
    drawDecadeChart(decadeData);
    drawFaithHillChart(fullData, decadeData);

    setupScrollReveal();
  })
  .catch((err) => console.error("Error loading data:", err));

// Fade-in sections when they scroll into view
function setupScrollReveal() {
  const cards = document.querySelectorAll(".data-card");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  cards.forEach((card) => observer.observe(card));
}
