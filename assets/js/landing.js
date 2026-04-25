document.addEventListener("DOMContentLoaded", () => {

  const tools = [
    { name: "Service Generator", icon: "assets/images/logos/Sg.svg" },
    { name: "Sitemap Builder", icon: "assets/images/logos/Sm.svg" },
    { name: "Image Converter", icon: "assets/images/logos/Ic.svg" },
    { name: "CRM & Accounting", icon: "assets/images/logos/Ca.svg" },
    { name: "Schema Generator", icon: "assets/images/logos/Sc.svg" },
    { name: "TOC Builder", icon: "assets/images/logos/Tb.svg" },
    { name: "Text Editor", icon: "assets/images/logos/Te.svg" },
    { name: "Bot Builder", icon: "assets/images/logos/Rb.svg" },
    { name: "Redirect Tool", icon: "assets/images/logos/Rm.svg" },
    { name: "Keyword Density Checker", icon: "assets/images/logos/Kd.svg" },
    { name: "Keyword Research", icon: "assets/images/logos/Kr.svg" },
    { name: "Checklist Tool", icon: "assets/images/logos/Cl.svg" }
  ];

  const cloud = document.getElementById("logo-cloud");

  function spawnLogo() {
    const t = tools[Math.floor(Math.random() * tools.length)];

    const img = document.createElement("img");
    img.src = t.icon;
    img.className = "logo-floating";

    img.style.left = Math.random() * 100 + "vw";
    img.style.top = Math.random() * 100 + "vh";

    cloud.appendChild(img);

    setTimeout(() => img.remove(), 9000);
  }

  setInterval(spawnLogo, 1200);
const box = document.querySelector('.search-box');
const input = document.getElementById('search-input');

input.addEventListener('input', () => {
  box.style.boxShadow =
    "0 8px 26px rgba(0, 229, 255, 0.18), inset 0 0 12px rgba(0, 229, 255, 0.22)";
  
  clearTimeout(window._searchFX);
  window._searchFX = setTimeout(() => {
    box.style.boxShadow =
      "0 8px 25px rgba(0, 0, 0, 0.18), inset 0 0 0 0 rgba(255,255,255,0.25)";
  }, 300);
});

});
