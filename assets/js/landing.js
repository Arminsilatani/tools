/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-25
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== MAIN PAGE SCRIPTS ============================ */
document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------- TOOLS DATA ------------------------- */
  const tools = [
    { name: "Service Generator", icon: "assets/images/logos/Sg.svg", url: "Service-Item-Generator" },
    { name: "Sitemap Builder", icon: "assets/images/logos/Sm.svg", url: "#" },
    { name: "Image Converter", icon: "assets/images/logos/Ic.svg", url: "#" },
    { name: "CRM & Accounting", icon: "assets/images/logos/Ca.svg", url: "#" },
    { name: "Schema Generator", icon: "assets/images/logos/Sc.svg", url: "#" },
    { name: "TOC Builder", icon: "assets/images/logos/Tb.svg", url: "#" },
    { name: "Text Editor", icon: "assets/images/logos/Te.svg", url: "#" },
    { name: "Bot Builder", icon: "assets/images/logos/Rb.svg", url: "#" },
    { name: "Redirect Tool", icon: "assets/images/logos/Rm.svg", url: "#" },
    { name: "Keyword Density Checker", icon: "assets/images/logos/Kd.svg", url: "#" },
    { name: "Keyword Research", icon: "assets/images/logos/Kr.svg", url: "#" },
    { name: "Checklist Tool", icon: "assets/images/logos/Cl.svg", url: "#" }
  ];

  /* ------------------------- FLOATING LOGOS CLOUD ------------------------- */
  const cloud = document.getElementById("logo-cloud");
  const MAX_LOGOS = 7;
  const SPAWN_INTERVAL = 3600;
  const LOGO_LIFETIME = 14000;

  function pruneLogos() {
    while (cloud.children.length > MAX_LOGOS) {
      const oldest = cloud.firstElementChild;
      if (oldest) oldest.remove();
    }
  }

  function spawnLogo() {
    pruneLogos();
    const t = tools[Math.floor(Math.random() * tools.length)];
    const img = document.createElement("img");
    img.src = t.icon;
    img.className = "logo-floating";
    img.style.left = (10 + Math.random() * 80) + "vw";
    img.style.top = (20 + Math.random() * 60) + "vh";
    const size = 28 + Math.floor(Math.random() * 16);
    img.style.width = size + "px";
    img.style.height = size + "px";
    img.style.opacity = 0.12 + Math.random() * 0.18;
    cloud.appendChild(img);

    setTimeout(() => {
      img.style.transition = "opacity 2s ease, transform 2s ease";
      img.style.opacity = "0";
      img.style.transform = "translateY(-20px) scale(0.8)";
      setTimeout(() => img.remove(), 2000);
    }, LOGO_LIFETIME - 2000);
  }

  setInterval(spawnLogo, SPAWN_INTERVAL);
  for (let i = 0; i < 4; i++) {
    setTimeout(spawnLogo, i * 400);
  }

  /* ------------------------- SEARCH ENGINE ------------------------- */
  const searchWrapper = document.querySelector('.search-wrapper');
  const input = document.getElementById('search-input');

  // Results container
  const resultsDiv = document.createElement('div');
  resultsDiv.className = 'search-results';
  resultsDiv.style.display = 'none';
  searchWrapper.appendChild(resultsDiv);

  // Delegate clicks on result items
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

  // Hide results on outside click
  document.addEventListener('click', (e) => {
    if (!searchWrapper.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });

  // Hide results on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      resultsDiv.style.display = 'none';
    }
  });

  // Re‑show results if input is focused and has text
  input.addEventListener('focus', () => {
    if (input.value.trim() !== '') {
      resultsDiv.style.display = 'block';
    }
  });
});