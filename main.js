// ---------------- GLOBAL CHART SETUP ----------------
Chart.defaults.plugins.annotation = {
  annotations: {},
  drawTime: "afterDatasetsDraw",
};

// Register annotation plugin if available
if (typeof ChartAnnotation !== 'undefined') {
  Chart.register(ChartAnnotation);
  console.log('✓ Annotation plugin registered as ChartAnnotation');
} else if (window.chartjs && window.chartjs.annotation) {
  Chart.register(window.chartjs.annotation);
  console.log('✓ Annotation plugin registered via window.chartjs');
} else if (Chart.registry && Chart.registry.plugins.get('annotation')) {
  console.log('✓ Annotation plugin already registered');
} else {
  console.error('❌ chartjs-plugin-annotation not found. Trying to continue anyway...');
}

// Global chart defaults
Chart.defaults.font.family = '-apple-system, system-ui, BlinkMacSystemFont, "Inter", sans-serif';
Chart.defaults.color = '#a2a2b8';

const gridStyle = {
  color: 'rgba(255, 255, 255, 0.03)',
  drawBorder: false
};

const tickStyle = {
  color: '#8e8ea0',
  font: { size: 11, weight: '500' }
};

const palette = {
  primaryLine: '#ff3b7d',
  secondaryLine: '#35c4ff',
  tertiaryLine: '#ffc857',
  primaryFill: 'rgba(255, 59, 125, 0.18)',
  secondaryFill: 'rgba(53, 196, 255, 0.15)',
  tertiaryFill: 'rgba(255, 200, 87, 0.16)',
  barPrimary: 'rgba(255, 59, 125, 0.9)',
  barSecondary: 'rgba(53, 196, 255, 0.9)',
  barTertiary: 'rgba(255, 200, 87, 0.9)'
};

// Fallback Faith Hill profile if CSV does not contain the track
const FAITH_FALLBACK = {
  year: 2000,
  tempo: 136,
  energy: 0.68,
  danceability: 0.52,
  valence: 0.55,
  loudness: -7.2,
  duration_ms: 249000,
  acousticness: 0.45
};

// ---------------- HELPERS ----------------

function initSectionObserver() {
  const chapters = document.querySelectorAll('.chapter');
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  chapters.forEach(ch => observer.observe(ch));
}

function normaliseKeys(row) {
  const clean = {};
  Object.keys(row).forEach(key => {
    const k = key.trim().toLowerCase();
    clean[k] = row[key];
  });
  return clean;
}

/**
 * Build a refined annotation point for "Breathe" on timeline charts.
 * Pentagram-level design approach: minimal, purposeful, sophisticated.
 */
function buildBreathePoint(labels, faith, key, options = {}) {
  if (!faith || faith.year == null) return null;
  
  // Find the FIRST occurrence of the year to avoid duplicates
  const yearIndex = labels.findIndex(y => y === faith.year);
  if (yearIndex === -1) {
    console.warn("[Annotation] Year not found in labels:", faith.year);
    return null;
  }

  let yValue = {
    tempo: faith.tempo,
    loudness: faith.loudness,
    duration: faith.duration_ms / 60000,
    valence: faith.valence,
    energy: faith.energy,
    danceability: faith.danceability
  }[key];

  if (yValue == null || Number.isNaN(yValue)) return null;

  // Design-refined styling - use index to ensure correct position
  return {
    id: options.id || 'breathePoint',
    type: 'point',
    xValue: yearIndex,
    yValue: yValue,
    radius: 8,
    backgroundColor: '#ffc857',
    borderColor: '#ffffff',
    borderWidth: 2.5,
    z: 999,
    drawTime: 'afterDatasetsDraw',
    label: {
      display: true,
      content: '"Breathe"',
      position: 'top',
      yAdjust: -18,
      xAdjust: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.92)',
      color: '#ffc857',
      padding: { top: 8, bottom: 8, left: 14, right: 14 },
      borderRadius: 8,
      font: { 
        size: 12, 
        weight: '600',
        family: '-apple-system, system-ui, BlinkMacSystemFont, "Inter", sans-serif'
      }
    }
  };
}

// ---------------- DATA LOADING ----------------

async function loadData() {
  try {
    const response = await fetch('billboard_24years_lyrics_spotify.csv');
    if (!response.ok) {
      throw new Error('CSV not found');
    }
    const text = await response.text();

    Papa.parse(text, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: res => {
        fileLoadedBanner(true);
        handleParsedData(res.data);
      },
      error: err => {
        console.error('CSV parse error:', err);
        fileLoadedBanner(false);
        useSampleData();
      }
    });
  } catch (err) {
    console.warn('Falling back to sample data:', err);
    fileLoadedBanner(false);
    useSampleData();
  }
}

function fileLoadedBanner(success) {
  if (success) {
    console.log(
      '%c✔ CSV Loaded Successfully: billboard_24years_lyrics_spotify.csv',
      'color:#35ff9d; font-size:16px; font-weight:700;'
    );
  } else {
    console.error(
      '%c✘ CSV Failed to Load - using sample data instead',
      'color:#ff5f8d; font-size:16px; font-weight:700;'
    );
  }

  const banner = document.createElement('div');
  banner.textContent = success
    ? 'Data successfully loaded'
    : 'CSV failed. Sample data loaded instead.';
  banner.style.position = 'fixed';
  banner.style.top = '20px';
  banner.style.right = '20px';
  banner.style.padding = '10px 16px';
  banner.style.background = success
    ? 'rgba(53,255,157,0.15)'
    : 'rgba(255,95,141,0.15)';
  banner.style.border = success ? '1px solid #35ff9d' : '1px solid #ff5f8d';
  banner.style.color = success ? '#35ff9d' : '#ff5f8d';
  banner.style.fontSize = '13px';
  banner.style.borderRadius = '8px';
  banner.style.zIndex = 99999;
  banner.style.backdropFilter = 'blur(8px)';
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3200);
}

function handleParsedData(rawRows) {
  const rows = rawRows.map(normaliseKeys);

  const valid = rows.filter(
    d =>
      d.year &&
      typeof d.tempo === 'number' &&
      typeof d.energy === 'number' &&
      typeof d.danceability === 'number' &&
      typeof d.valence === 'number' &&
      typeof d.loudness === 'number' &&
      typeof d.duration_ms === 'number' &&
      typeof d.acousticness === 'number'
  );

  if (!valid.length) {
    console.warn('No valid numeric rows found. Using sample data.');
    useSampleData();
    return;
  }

  // Aggregate by year
  const yearMap = new Map();
  valid.forEach(row => {
    const y = row.year;
    if (!yearMap.has(y)) {
      yearMap.set(y, {
        year: y,
        tempoSum: 0,
        loudSum: 0,
        valenceSum: 0,
        energySum: 0,
        danceSum: 0,
        durationSum: 0,
        acousticSum: 0,
        count: 0
      });
    }
    const agg = yearMap.get(y);
    agg.tempoSum += row.tempo;
    agg.loudSum += row.loudness;
    agg.valenceSum += row.valence;
    agg.energySum += row.energy;
    agg.danceSum += row.danceability;
    agg.durationSum += row.duration_ms;
    agg.acousticSum += row.acousticness;
    agg.count += 1;
  });

  const yearly = Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year)
    .map(a => ({
      year: a.year,
      tempo: a.tempoSum / a.count,
      loudness: a.loudSum / a.count,
      valence: a.valenceSum / a.count,
      energy: a.energySum / a.count,
      danceability: a.danceSum / a.count,
      duration_ms: a.durationSum / a.count,
      acousticness: a.acousticSum / a.count
    }));

  // Decade summaries for tempo
  const decades = [
    { name: '2000s', start: 2000, end: 2009 },
    { name: '2010s', start: 2010, end: 2019 },
    { name: '2020s', start: 2020, end: 2029 }
  ];

  const decadeSummaries = decades
    .map(dec => {
      const subset = valid.filter(
        r => r.year >= dec.start && r.year <= dec.end
      );
      if (!subset.length) return null;
      const agg = subset.reduce(
        (acc, r) => {
          acc.tempo += r.tempo;
          acc.count += 1;
          return acc;
        },
        { tempo: 0, count: 0 }
      );
      return {
        decade: dec.name,
        tempo: agg.tempo / agg.count
      };
    })
    .filter(Boolean);

  // Genre grouping
  function guessGenre(row) {
    const artist = String(
      row.band_singer || row.artist || row.artist_name || ''
    ).toLowerCase();

    if (
      /drake|kendrick|jay z|jay-z|nicki|minaj|kanye|ye |eminem|lil |future|migos|travis scott|cardi b|post malone|21 savage/.test(
        artist
      )
    ) {
      return 'Hip-Hop';
    }
    if (
      /coldplay|linkin park|green day|u2|paramore|foo fighters|red hot chili peppers|nirvana|radiohead|metallica/.test(
        artist
      )
    ) {
      return 'Rock';
    }
    if (
      /faith hill|carrie underwood|tim mcgraw|luke bryan|miranda lambert/.test(
        artist
      )
    ) {
      return 'Country';
    }
    return 'Pop';
  }

  const genreBuckets = {};
  valid.forEach(r => {
    const g = guessGenre(r);
    if (!genreBuckets[g]) {
      genreBuckets[g] = {
        energy: 0,
        danceability: 0,
        valence: 0,
        count: 0
      };
    }
    const b = genreBuckets[g];
    b.energy += r.energy;
    b.danceability += r.danceability;
    b.valence += r.valence;
    b.count += 1;
  });

  const genreData = Object.keys(genreBuckets).map(g => {
    const b = genreBuckets[g];
    return {
      genre: g,
      energy: b.energy / b.count,
      danceability: b.danceability / b.count,
      valence: b.valence / b.count
    };
  });

  // Detect Faith Hill "Breathe"
  const faithRow = rows.find(r => {
    const artist = String(
      r.band_singer || r.artist || r.artist_name || ''
    ).toLowerCase();
    const title = String(r.track_name || r.song || r.title || '').toLowerCase();
    return artist.includes('faith hill') && title.includes('breathe');
  });

  const faith = faithRow
    ? {
        year: faithRow.year || 2000,
        tempo: faithRow.tempo,
        energy: faithRow.energy,
        danceability: faithRow.danceability,
        valence: faithRow.valence,
        loudness: faithRow.loudness,
        duration_ms: faithRow.duration_ms,
        acousticness: faithRow.acousticness
      }
    : FAITH_FALLBACK;

  if (!faithRow) {
    console.info('Faith Hill row not found in CSV. Using fallback values.');
  } else {
    console.log('Faith Hill "Breathe" detected from CSV:', faith);
  }

  const avg2020s = computeAvg2020s(yearly);

  updateFaithText(faith, avg2020s);
  drawMiniTempoSparkline(yearly);

  // Draw charts
  drawDecadeTempoChart(decadeSummaries);
  drawTempoChart(yearly, faith);
  drawLoudnessChart(yearly, faith);
  drawDurationChart(yearly, faith);
  drawEnergyDanceChart(yearly, faith);
  drawValenceChart(yearly, faith);
  drawGenreChart(genreData);
  drawMusicalStructureChart(faith, avg2020s);
  drawEmotionalProfileChart(faith, avg2020s);
}

function useSampleData() {
  const yearly = [
    {
      year: 2000,
      tempo: 122,
      loudness: -7.1,
      valence: 0.56,
      energy: 0.64,
      danceability: 0.63,
      duration_ms: 240000,
      acousticness: 0.4
    },
    {
      year: 2005,
      tempo: 123,
      loudness: -6.3,
      valence: 0.52,
      energy: 0.66,
      danceability: 0.66,
      duration_ms: 232000,
      acousticness: 0.34
    },
    {
      year: 2010,
      tempo: 123,
      loudness: -5.5,
      valence: 0.49,
      energy: 0.69,
      danceability: 0.7,
      duration_ms: 222000,
      acousticness: 0.28
    },
    {
      year: 2015,
      tempo: 118,
      loudness: -4.6,
      valence: 0.47,
      energy: 0.67,
      danceability: 0.71,
      duration_ms: 210000,
      acousticness: 0.22
    },
    {
      year: 2020,
      tempo: 114,
      loudness: -3.8,
      valence: 0.44,
      energy: 0.66,
      danceability: 0.72,
      duration_ms: 198000,
      acousticness: 0.16
    },
    {
      year: 2024,
      tempo: 116,
      loudness: -3.4,
      valence: 0.45,
      energy: 0.68,
      danceability: 0.73,
      duration_ms: 192000,
      acousticness: 0.13
    }
  ];

  const decadeSummaries = [
    { decade: '2000s', tempo: 122.5 },
    { decade: '2010s', tempo: 120.0 },
    { decade: '2020s', tempo: 115.0 }
  ];

  const genreData = [
    { genre: 'Pop', energy: 0.66, danceability: 0.68, valence: 0.51 },
    { genre: 'Hip-Hop', energy: 0.72, danceability: 0.82, valence: 0.48 },
    { genre: 'Rock', energy: 0.78, danceability: 0.54, valence: 0.46 },
    { genre: 'Country', energy: 0.62, danceability: 0.55, valence: 0.56 }
  ];

  const faith = FAITH_FALLBACK;
  const avg2020s = computeAvg2020s(yearly);

  updateFaithText(faith, avg2020s);
  drawMiniTempoSparkline(yearly);

  drawDecadeTempoChart(decadeSummaries);
  drawTempoChart(yearly, faith);
  drawLoudnessChart(yearly, faith);
  drawDurationChart(yearly, faith);
  drawEnergyDanceChart(yearly, faith);
  drawValenceChart(yearly, faith);
  drawGenreChart(genreData);
  drawMusicalStructureChart(faith, avg2020s);
  drawEmotionalProfileChart(faith, avg2020s);
}

// ---------------- DERIVED METRICS + TEXT ----------------

function computeAvg2020s(yearly) {
  const recent = yearly.filter(d => d.year >= 2020);
  if (!recent.length) {
    return {
      tempo: 116,
      energy: 0.68,
      danceability: 0.73,
      valence: 0.44,
      loudness: -3.5,
      duration_ms: 192000,
      acousticness: 0.15
    };
  }
  const agg = recent.reduce(
    (acc, r) => {
      acc.tempo += r.tempo;
      acc.energy += r.energy;
      acc.danceability += r.danceability;
      acc.valence += r.valence;
      acc.loudness += r.loudness;
      acc.duration_ms += r.duration_ms;
      acc.acousticness += r.acousticness;
      acc.count += 1;
      return acc;
    },
    {
      tempo: 0,
      energy: 0,
      danceability: 0,
      valence: 0,
      loudness: 0,
      duration_ms: 0,
      acousticness: 0,
      count: 0
    }
  );
  return {
    tempo: agg.tempo / agg.count,
    energy: agg.energy / agg.count,
    danceability: agg.danceability / agg.count,
    valence: agg.valence / agg.count,
    loudness: agg.loudness / agg.count,
    duration_ms: agg.duration_ms / agg.count,
    acousticness: agg.acousticness / agg.count
  };
}

function updateFaithText(faith, avg2020s) {
  const tempoEl = document.getElementById('fh-tempo');
  const lengthEl = document.getElementById('fh-length');
  const valenceEl = document.getElementById('fh-valence');
  const tempoNoteEl = document.getElementById('fh-tempo-note');
  const lengthNoteEl = document.getElementById('fh-length-note');

  if (tempoEl) {
    tempoEl.textContent = Math.round(faith.tempo) + ' bpm';
  }

  if (lengthEl) {
    const mins = Math.floor(faith.duration_ms / 60000);
    const secs = Math.round((faith.duration_ms % 60000) / 1000);
    lengthEl.textContent = mins + ':' + String(secs).padStart(2, '0');
  }

  if (valenceEl) {
    const moodLabel =
      faith.valence >= 0.6
        ? 'Very bright'
        : faith.valence >= 0.5
        ? 'Bright'
        : 'Moderate';
    valenceEl.textContent = moodLabel;
  }

  if (tempoNoteEl && avg2020s) {
    if (faith.tempo > avg2020s.tempo + 5) {
      tempoNoteEl.textContent = 'Faster than most twenty twenties hits.';
    } else if (faith.tempo < avg2020s.tempo - 5) {
      tempoNoteEl.textContent = 'Slower than the average modern hit.';
    } else {
      tempoNoteEl.textContent = 'Close to the modern average tempo.';
    }
  }

  if (lengthNoteEl && avg2020s) {
    if (faith.duration_ms > avg2020s.duration_ms + 30000) {
      // lengthNoteEl.textContent = 'Long for today\'s single-driven landscape.';
    } else if (faith.duration_ms < avg2020s.duration_ms - 30000) {
      lengthNoteEl.textContent = 'Shorter than a typical modern hit.';
    } else {
      lengthNoteEl.textContent = 'Similar length to many recent singles.';
    }
  }
}

function drawMiniTempoSparkline(yearly) {
  const canvas = document.getElementById('miniTempoSparkline');
  if (!canvas) return;

  const recent = yearly.filter(d => d.year >= 2000);
  new Chart(canvas, {
    type: 'line',
    data: {
      labels: recent.map(d => d.year),
      datasets: [
        {
          data: recent.map(d => d.tempo),
          borderColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1.2,
          tension: 0.55,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { capBezierPoints: true } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

// ---------------- CHART BUILDERS ----------------

function drawDecadeTempoChart(data) {
  const canvas = document.getElementById('decadeTempoChart');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: data.map(d => d.decade),
      datasets: [
        {
          label: 'Average tempo',
          data: data.map(d => d.tempo),
          backgroundColor: palette.barPrimary,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.primaryLine,
          borderWidth: 2
        }
      },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: { grid: gridStyle, ticks: tickStyle }
      }
    }
  });
}

function drawTempoChart(yearly, faith) {
  const canvas = document.getElementById('tempoChart');
  if (!canvas) return;

  const labels = yearly.map(d => d.year);
  const data = yearly.map(d => d.tempo);

  const annotations = {};
  const breathe = buildBreathePoint(labels, faith, 'tempo', {
    id: 'breatheTempo'
  });
  if (breathe) annotations.breatheTempo = breathe;

  const allVals = data.concat(breathe ? [breathe.yValue] : []);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Average tempo',
          data,
          borderColor: palette.primaryLine,
          backgroundColor: palette.primaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.primaryLine,
          borderWidth: 2
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: {
          min: Math.floor(minVal - 4),
          max: Math.ceil(maxVal + 4),
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

function drawLoudnessChart(yearly, faith) {
  const canvas = document.getElementById('loudnessChart');
  if (!canvas) return;

  const labels = yearly.map(d => d.year);
  const values = yearly.map(d => d.loudness);

  const annotations = {};
  const breathe = buildBreathePoint(labels, faith, 'loudness', {
    id: 'breatheLoud'
  });
  if (breathe) annotations.breatheLoud = breathe;

  const allVals = values.concat(breathe ? [breathe.yValue] : []);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Average loudness (dB)',
          data: values,
          borderColor: palette.tertiaryLine,
          backgroundColor: palette.tertiaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.tertiaryLine,
          borderWidth: 2
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: {
          min: Math.floor(minVal - 1),
          max: Math.ceil(maxVal + 1),
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

function drawDurationChart(yearly, faith) {
  const canvas = document.getElementById('durationChart');
  if (!canvas) return;

  const labels = yearly.map(d => d.year);
  const values = yearly.map(d => d.duration_ms / 60000);

  const annotations = {};
  const breathe = buildBreathePoint(labels, faith, 'duration', {
    id: 'breatheDuration'
  });
  if (breathe) annotations.breatheDuration = breathe;

  const allVals = values.concat(breathe ? [breathe.yValue] : []);
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Length (minutes)',
          data: values,
          borderColor: palette.secondaryLine,
          backgroundColor: palette.secondaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.secondaryLine,
          borderWidth: 2
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: {
          min: Math.floor(minVal * 10) / 10 - 0.1,
          max: Math.ceil(maxVal * 10) / 10 + 0.1,
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

function drawEnergyDanceChart(yearly, faith) {
  const canvas = document.getElementById('energyDanceChart');
  if (!canvas) return;

  const labels = yearly.map(d => d.year);
  const energyVals = yearly.map(d => d.energy);
  const danceVals = yearly.map(d => d.danceability);

  const annotations = {};
  const breatheEnergy = buildBreathePoint(labels, faith, 'energy', {
    id: 'breatheEnergy'
  });
  const breatheDance = buildBreathePoint(labels, faith, 'danceability', {
    id: 'breatheDance'
  });

  if (breatheEnergy) annotations.breatheEnergy = breatheEnergy;
  if (breatheDance) annotations.breatheDance = breatheDance;

  new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Energy',
          data: energyVals,
          borderColor: palette.primaryLine,
          backgroundColor: palette.primaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: false
        },
        {
          label: 'Danceability',
          data: danceVals,
          borderColor: palette.secondaryLine,
          backgroundColor: palette.secondaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#f5f5f7',
            usePointStyle: true,
            padding: 14,
            font: { size: 13, weight: '600' }
          }
        },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.primaryLine,
          borderWidth: 2
        }
      },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: {
          min: 0,
          max: 1,
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

function drawValenceChart(yearly, faith) {
  const canvas = document.getElementById('valenceChart');
  if (!canvas) return;

  const labels = yearly.map(d => d.year);
  const valenceValues = yearly.map(d => d.valence);

  const annotations = {};
  const breathe = buildBreathePoint(labels, faith, 'valence', {
    id: 'breatheValence'
  });
  if (breathe) annotations.breatheValence = breathe;

  new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Valence',
          data: valenceValues,
          borderColor: palette.tertiaryLine,
          backgroundColor: palette.tertiaryFill,
          borderWidth: 3,
          tension: 0.55,
          pointRadius: 0,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        annotation: { annotations },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.tertiaryLine,
          borderWidth: 2
        }
      },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: { min: 0, max: 1, grid: gridStyle, ticks: tickStyle }
      }
    }
  });
}

function drawGenreChart(genreData) {
  const canvas = document.getElementById('genreChart');
  if (!canvas) return;

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: genreData.map(d => d.genre),
      datasets: [
        {
          label: 'Energy',
          data: genreData.map(d => d.energy),
          backgroundColor: palette.barPrimary,
          borderRadius: 10
        },
        {
          label: 'Danceability',
          data: genreData.map(d => d.danceability),
          backgroundColor: palette.barSecondary,
          borderRadius: 10
        },
        {
          label: 'Valence',
          data: genreData.map(d => d.valence),
          backgroundColor: palette.barTertiary,
          borderRadius: 10
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#f5f5f7',
            usePointStyle: true,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.barPrimary,
          borderWidth: 2
        }
      },
      scales: {
        x: { grid: gridStyle, ticks: tickStyle },
        y: { min: 0, max: 1, grid: gridStyle, ticks: tickStyle }
      }
    }
  });
}

function drawMusicalStructureChart(faith, avg) {
  const canvas = document.getElementById('musicalStructureChart');
  if (!canvas) return;

  const tempoNorm = val => val / 150;
  const durNorm = val => val / (5 * 60000);
  const loudNorm = val => {
    const min = -12;
    const max = -3;
    const clamped = Math.max(min, Math.min(max, val));
    return (clamped - min) / (max - min);
  };

  const labels = ['Tempo (BPM)', 'Length (min)', 'Loudness (dB)'];

  const faithData = [
    tempoNorm(faith.tempo),
    durNorm(faith.duration_ms),
    loudNorm(faith.loudness)
  ];

  const avgData = [
    tempoNorm(avg.tempo),
    durNorm(avg.duration_ms),
    loudNorm(avg.loudness)
  ];

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '"Breathe" (2000)',
          data: faithData,
          backgroundColor: palette.barPrimary,
          borderRadius: 12
        },
        {
          label: 'Average 2020s hit',
          data: avgData,
          backgroundColor: palette.barSecondary,
          borderRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#f5f5f7',
            usePointStyle: true,
            padding: 14,
            font: { size: 13, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.primaryLine,
          borderWidth: 2,
          callbacks: {
            label: ctx => {
              const i = ctx.dataIndex;
              const v = ctx.raw;

              if (i === 0) {
                return `${ctx.dataset.label}: ${Math.round(v * 150)} bpm`;
              }
              if (i === 1) {
                return `${ctx.dataset.label}: ${(v * 5).toFixed(2)} minutes`;
              }
              if (i === 2) {
                const db = (v * (-3 - -12) + -12).toFixed(1);
                return `${ctx.dataset.label}: ${db} dB`;
              }
              return ctx.formattedValue;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          grid: gridStyle,
          ticks: tickStyle
        },
        x: {
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

function drawEmotionalProfileChart(faith, avg) {
  const canvas = document.getElementById('emotionalProfileChart');
  if (!canvas) return;

  const labels = ['Energy', 'Danceability', 'Valence', 'Acousticness'];

  const faithData = [
    faith.energy,
    faith.danceability,
    faith.valence,
    faith.acousticness
  ];

  const avgData = [
    avg.energy,
    avg.danceability,
    avg.valence,
    avg.acousticness
  ];

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: '"Breathe" (2000)',
          data: faithData,
          backgroundColor: palette.barPrimary,
          borderRadius: 12
        },
        {
          label: 'Average 2020s hit',
          data: avgData,
          backgroundColor: palette.barSecondary,
          borderRadius: 12
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#f5f5f7',
            usePointStyle: true,
            padding: 14,
            font: { size: 13, weight: '600' }
          }
        },
        tooltip: {
          backgroundColor: '#050509',
          borderColor: palette.secondaryLine,
          borderWidth: 2
        }
      },
      scales: {
        y: {
          min: 0,
          max: 1,
          grid: gridStyle,
          ticks: tickStyle
        },
        x: {
          grid: gridStyle,
          ticks: tickStyle
        }
      }
    }
  });
}

// ---------------- INIT ----------------

document.addEventListener('DOMContentLoaded', () => {
  initSectionObserver();
  loadData();
});