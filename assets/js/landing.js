/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-05-01
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== MAIN PAGE SCRIPTS ============================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------- TOOLS DATA ------------------------- */
  const tools = [
    { name: "Codara Service Generator", icon: "assets/images/logos/Co.svg", url: "https://codara.arminsilatani.com/" },
    { name: "Nolvo Sitemap Builder", icon: "assets/images/logos/No.svg", url: "nolvo" },
    { name: "Qerlo Shortener", icon: "assets/images/logos/Qe.svg", url: "#" },
    { name: "Tivra Minify", icon: "assets/images/logos/Ti.svg", url: "#" },
    { name: "Semora Schema Generator", icon: "assets/images/logos/Se.svg", url: "semora" },
    { name: "Brilo Speed Check", icon: "assets/images/logos/Br.svg", url: "#" },
    { name: "Sorbi Robots Builder", icon: "assets/images/logos/So.svg", url: "#" },
    { name: "Velto Meta Inspector", icon: "assets/images/logos/Ve.svg", url: "#" },
    { name: "Zorio Image Converter", icon: "assets/images/logos/Zo.svg", url: "https://zorio.arminsilatani.com/" },
    { name: "Galvo Video Converter", icon: "assets/images/logos/Ga.svg", url: "#" },
    { name: "Xelpo Pass Generator", icon: "assets/images/logos/Xe.svg", url: "#" },
    { name: "Dirmo DNS Checker", icon: "assets/images/logos/Di.svg", url: "#" },
    { name: "Lemro Keyword Research", icon: "assets/images/logos/Le.svg", url: "#" },
    { name: "Hirvo Density", icon: "assets/images/logos/Hi.svg", url: "#" },
    { name: "Jorvi Redirect", icon: "assets/images/logos/Jo.svg", url: "#" },
    { name: "Mirto CRM", icon: "assets/images/logos/Mi.svg", url: "#" },
    { name: "Ravlo Calendar", icon: "assets/images/logos/Ra.svg", url: "#" },
    { name: "Rinvo Accounting", icon: "assets/images/logos/Ri.svg", url: "#" },
    { name: "Yelmo Brand Namer", icon: "assets/images/logos/Ye.svg", url: "#" },
    { name: "Cedro Flashcards", icon: "assets/images/logos/ce.svg", url: "#" },
    { name: "Fresca Colors Tool", icon: "assets/images/logos/Fr.svg", url: "#" },
    { name: "Ubiro Beer Cost", icon: "assets/images/logos/Ub.svg", url: "ubiro" },
    { name: "Refacto Code Beautifier", icon: "assets/images/logos/Re.svg", url: "refacto" },
    { name: "Pilvo Text Editor", icon: "assets/images/logos/Pi.svg", url: "https://pilvo.arminsilatani.com/" },
    { name: "Tavio Prompt Library", icon: "assets/images/logos/Ta.svg", url: "https://tavio.arminsilatani.com/" },
    { name: "Falco Favicon Generator", icon: "assets/images/logos/Fa.svg", url: "https://falco.arminsilatani.com/" },
    { name: "Lume Epoch Converter", icon: "assets/images/logos/Lu.svg", url: "https://lume.arminsilatani.com/" },
    { name: "Valeno Expiry Date Reminder", icon: "assets/images/logos/Va.svg", url: "#" },
    { name: "Alviano Recipe Manager", icon: "assets/images/logos/Al.svg", url: "#" },
    { name: "Mavero Workout Tracker", icon: "assets/images/logos/Ma.svg", url: "#" },
    { name: "Tempozio Time Tracker", icon: "assets/images/logos/Te.svg", url: "#" },
    { name: "Belluno Wishlist", icon: "assets/images/logos/Be.svg", url: "#" },
  ];

  /* ------------------------- FLOATING LOGOS CLOUD ------------------------- */
  const cloud = document.getElementById("logo-cloud");
  const MAX_LOGOS = 3;
  const GRID_COLS = 8;
  const GRID_ROWS = 5;

  let activeLogos = [];

  /* Build grid of possible cell positions */
  function getCells() {
    const cells = [];
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cellW = vw / GRID_COLS;
    const cellH = vh / GRID_ROWS;

    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        cells.push({
          id: `${x}-${y}`,
          x: x * cellW + cellW / 2,
          y: y * cellH + cellH / 2
        });
      }
    }
    return cells;
  }

  /* Create and animate a single floating logo */
  function spawnLogo() {
    if (activeLogos.length >= MAX_LOGOS) return;

    const cells = getCells();
    const usedCells = activeLogos.map(l => l.cell);
    const freeCells = cells.filter(c => !usedCells.includes(c.id));

    if (!freeCells.length) return;

    const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
    const tool = tools[Math.floor(Math.random() * tools.length)];

    const img = document.createElement("img");
    img.src = tool.icon;
    img.className = "logo-floating";
    img.style.left = `${cell.x}px`;
    img.style.top = `${cell.y}px`;
    img.style.transform = "translate(-50%, -50%)";

    const size = 28 + Math.random() * 14;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.opacity = 0;

    cloud.appendChild(img);

    activeLogos.push({
      el: img,
      cell: cell.id
    });

    /* fade in */
    requestAnimationFrame(() => {
      img.style.opacity = 0.15 + Math.random() * 0.15;
    });

    /* random lifetime then fade out and respawn */
    const lifetime = 5000 + Math.random() * 7000;
    setTimeout(() => {
      img.style.opacity = 0;
      img.style.transform = "translate(-50%, -60%) scale(0.85)";

      setTimeout(() => {
        img.remove();
        activeLogos = activeLogos.filter(l => l.el !== img);
        spawnLogo();
      }, 1200);
    }, lifetime);
  }

  /* initial population */
  for (let i = 0; i < MAX_LOGOS; i++) {
    setTimeout(spawnLogo, i * 600);
  }

  /* ------------------------- SEARCH ENGINE ------------------------- */
  const searchWrapper = document.querySelector('.search-wrapper');
  const input = document.getElementById('search-input');

  const resultsDiv = document.createElement('div');
  resultsDiv.className = 'search-results';
  resultsDiv.style.display = 'none';
  searchWrapper.appendChild(resultsDiv);

  /* Handle clicks on result items */
  resultsDiv.addEventListener('click', (e) => {
    const item = e.target.closest('.result-item');
    if (!item) return;
    const url = item.dataset.url;
    if (url && url !== '#') {
      window.open(url, '_blank');
    } else {
      alert('Coming Soon!!');
    }
  });

  /* Live filtering */
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();

    if (query === '') {
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      return;
    }

    const match = tools.find(tool => tool.name.toLowerCase().includes(query));

    if (!match) {
      resultsDiv.innerHTML = '<div class="no-result">No result found</div>';
    } else {
      resultsDiv.innerHTML = `
        <div class="result-item" data-url="${match.url}">
          <img src="${match.icon}" alt="${match.name}" class="result-icon">
          <span>${match.name}</span>
        </div>`;
    }

    resultsDiv.style.display = 'block';
  });

  /* Hide results when clicking outside */
  document.addEventListener('click', (e) => {
    if (!searchWrapper.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });

  /* Hide results on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultsDiv.style.display = 'none';
    }
  });

  /* Re-shows results if input refocused with text */
  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') {
      resultsDiv.style.display = 'block';
    }
  });

  /* ------------------------- PREVENT DEFAULT SCROLLING ------------------------- */
  /**
   * Disable all native scrolling gestures (touch, wheel, keyboard)
   * to create a completely static non-scrollable page. (iOS-safe)
   */
  function preventTouchScroll(e) {
    e.preventDefault();
  }

  window.addEventListener('touchmove', preventTouchScroll, { passive: false });
  window.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });

  window.addEventListener('keydown', (e) => {
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    if (scrollKeys.includes(e.key)) {
      e.preventDefault();
    }
  }, { passive: false });

});