(function() {
  // تابع کپی کردن محتویات textarea
  window.copy = function(id) {
    const t = document.getElementById(id);
    if (!t) return;
    t.select();
    document.execCommand('copy');
  };

  // انتخاب فولدر
  document.getElementById('folder').addEventListener('change', async (e) => {
    const domain = document.getElementById('domain').value.replace(/\/$/, '');
    if (!domain) {
      alert('لطفاً دامنه را وارد کنید');
      return;
    }

    const files = [...e.target.files];
    const htmlFiles = files.filter(f => f.name.endsWith('.html'));

    const report = [];
    const images = [];
    const videos = [];
    const sections = {};
    const roots = {};

    for (const file of htmlFiles) {
      const text = await file.text();
      const doc = new DOMParser().parseFromString(text, 'text/html');

      // بررسی meta robots
      const robots = doc.querySelector('meta[name="robots"]');
      if (robots && robots.content.includes('noindex')) {
        report.push(`<span class="warn">noindex skipped:</span> ${file.webkitRelativePath}`);
        continue;
      }

      const canonical = doc.querySelector('link[rel="canonical"]');
      let path = file.webkitRelativePath.replace(/index\.html$/, '').replace('.html', '');
      const parts = path.split('/');
      const lang = parts[0];
      const rest = parts.slice(1);
      const section = rest[0] || '_root_';
      const slug = rest.join('/');
      let url = domain + '/' + path;

      if (canonical) {
        // اگر canonical نسبی باشد، از دامنه استفاده می‌کند
        try {
          url = new URL(canonical.href, domain).href;
        } catch (err) {
          url = canonical.href; // fallback
        }
      }

      if (section === '_root_') {
        if (!roots[slug]) roots[slug] = {};
        roots[slug][lang] = url;
      } else {
        if (!sections[section]) sections[section] = {};
        if (!sections[section][slug]) sections[section][slug] = {};
        sections[section][slug][lang] = url;
      }

      // استخراج تصاویر
      doc.querySelectorAll('img').forEach(img => {
        let src = img.getAttribute('src') || img.getAttribute('data-src');
        if (src) {
          try {
            src = new URL(src, domain).href;
          } catch (ex) {}
          images.push(src);
        }
      });

      // استخراج ویدیوها
      doc.querySelectorAll('video source').forEach(v => {
        if (v.src) {
          try {
            videos.push(new URL(v.src, domain).href);
          } catch (ex) {}
        }
      });
      doc.querySelectorAll('iframe').forEach(v => {
        if (v.src && (v.src.includes('youtube') || v.src.includes('vimeo'))) {
          videos.push(v.src);
        }
      });
    }

    // محاسبه priority و changefreq
    function priority(url) {
      const depth = url.split('/').length - 3;
      if (depth <= 1) return '1.0';
      if (depth === 2) return '0.8';
      if (depth === 3) return '0.6';
      return '0.5';
    }

    function changefreq(url) {
      const depth = url.split('/').length - 3;
      if (depth <= 1) return 'daily';
      if (depth === 2) return 'weekly';
      return 'monthly';
    }

    function buildMap(data) {
      let xml = '';
      for (const slug in data) {
        const langs = data[slug];
        const base = Object.values(langs)[0];
        xml += `<url>\n  <loc>${base}</loc>\n  <priority>${priority(base)}</priority>\n  <changefreq>${changefreq(base)}</changefreq>\n`;
        for (const l in langs) {
          xml += `  <xhtml:link rel="alternate" hreflang="${l}" href="${langs[l]}"/>\n`;
        }
        xml += `  <xhtml:link rel="alternate" hreflang="x-default" href="${base}"/>\n</url>\n`;
      }
      return xml;
    }

    function wrap(xml) {
      return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n  xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${xml}</urlset>`;
    }

    let out = '';
    const index = [];

    // ریشه‌ها
    if (Object.keys(roots).length) {
      const map = wrap(buildMap(roots));
      out += `
        <div class="card output-card">
          <div class="card-header">
            <h3>page-sitemap.xml</h3>
            <button class="copy-btn-minimal" onclick="copy('rootmap')">کپی</button>
          </div>
          <textarea id="rootmap" readonly>${map}</textarea>
        </div>`;
      index.push(`<sitemap><loc>${domain}/page-sitemap.xml</loc></sitemap>`);
      report.push(`<span class="good">صفحات ریشه:</span> ${Object.keys(roots).length}`);
    }

    // بخش‌ها
    for (const sec in sections) {
      const map = wrap(buildMap(sections[sec]));
      const id = 'sec' + sec.replace(/\s+/g, '_');
      out += `
        <div class="card output-card">
          <div class="card-header">
            <h3>${sec}-sitemap.xml</h3>
            <button class="copy-btn-minimal" onclick="copy('${id}')">کپی</button>
          </div>
          <textarea id="${id}" readonly>${map}</textarea>
        </div>`;
      index.push(`<sitemap><loc>${domain}/${sec}-sitemap.xml</loc></sitemap>`);
      report.push(`<span class="good">${sec}:</span> ${Object.keys(sections[sec]).length} صفحه`);
    }

    // تصاویر
    if (images.length) {
      const imgxml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${images.map(i => `  <url>\n    <loc>${i}</loc>\n    <image:image>\n      <image:loc>${i}</image:loc>\n    </image:image>\n  </url>`).join('\n')}\n</urlset>`;
      out += `
        <div class="card output-card">
          <div class="card-header">
            <h3>image-sitemap.xml</h3>
            <button class="copy-btn-minimal" onclick="copy('imgmap')">کپی</button>
          </div>
          <textarea id="imgmap" readonly>${imgxml}</textarea>
        </div>`;
      index.push(`<sitemap><loc>${domain}/image-sitemap.xml</loc></sitemap>`);
      report.push(`<span class="good">تصاویر یافت شده:</span> ${images.length}`);
    }

    // ویدیوها
    if (videos.length) {
      const vidxml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n${videos.map(v => `  <url>\n    <loc>${v}</loc>\n    <video:video>\n      <video:content_loc>${v}</video:content_loc>\n      <video:title>Video</video:title>\n    </video:video>\n  </url>`).join('\n')}\n</urlset>`;
      out += `
        <div class="card output-card">
          <div class="card-header">
            <h3>video-sitemap.xml</h3>
            <button class="copy-btn-minimal" onclick="copy('vidmap')">کپی</button>
          </div>
          <textarea id="vidmap" readonly>${vidxml}</textarea>
        </div>`;
      index.push(`<sitemap><loc>${domain}/video-sitemap.xml</loc></sitemap>`);
      report.push(`<span class="good">ویدیوهای یافت شده:</span> ${videos.length}`);
    }

    // ایندکس اصلی
    if (index.length) {
      const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${index.join('\n')}\n</sitemapindex>`;
      out += `
        <div class="card output-card">
          <div class="card-header">
            <h3>sitemap.xml (فهرست اصلی)</h3>
            <button class="copy-btn-minimal" onclick="copy('mainmap')">کپی</button>
          </div>
          <textarea id="mainmap" readonly>${sitemapIndex}</textarea>
        </div>`;
    }

    document.getElementById('output').innerHTML = out;
    document.getElementById('report').innerHTML = report.join('<br>');
  });
})();