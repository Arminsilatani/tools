/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-30
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== SERVICE ITEM GENERATOR ============================ */
(function() {
    "use strict";

    /* :::::::::::::::::::::::::: DOM REFERENCES & STATE :::::::::::::::::::::::::: */
    const outputEl = document.getElementById('output-code');
    const form      = document.getElementById('generator-form');
    const copyBtn   = document.getElementById('copy-button');
    let typewriterTimer = null;

    /* ------------------------- HELPER: HTML FORMATTING ------------------------- */
    const prettyPrintHtml = (function() {
        const tab = '  '; // two spaces per indent level
        return function(html) {
            let indent = 0;
            // collapse whitespace and split tags
            let formatted = html
                .replace(/>\s*</g, '>\n<')
                .replace(/(<[^/][^>]*>)/g, '\n$1')
                .replace(/(<\/[^>]+>)/g, '$1\n')
                .replace(/\n\s*\n/g, '\n')
                .trim();

            let lines = formatted.split('\n');
            let result = [];

            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                // closing tag → decrease indent before output
                if (line.match(/^<\/\w/)) indent = Math.max(0, indent - 1);
                result.push(tab.repeat(indent) + line);
                // opening tag (not self-closing) → increase indent after output
                if (line.match(/^<\w[^>]*[^/]>$/) && !line.match(/\/>$/)) indent++;
            }
            return result.join('\n');
        };
    })();

    /* ------------------------- HELPER: VALUE FETCH ------------------------- */
    function getVal(id) {
        return document.getElementById(id).value;
    }

    /* ------------------------- CORE: SERVICE ITEM MARKUP ------------------------- */
    function generateServiceItem(cfg) {
        const { tab, pkg, category, plan, title, finalClass, group, hasQty } = cfg;

        const baseClass = finalClass;
        const containerClass = `${finalClass}-container`;
        const labelClass = "yellow-checkbox-checked-label"; // visual style class
        const qtyAttr = hasQty === "yes" ? ' data-qty="1"' : '';

        let titleHTML = "";
        let qtyControls = "";

        if (hasQty === "yes") {
            titleHTML = `<span class="qty-text">1</span>
<span class="sliding-text-container">
    <span class="scrolling-text-inner sliding-text">${title || 'Untitled'}</span>
</span>`;
            qtyControls = `<div class="qty-control-minimal">
    <button type="button" class="qty-btn qty-plus">+</button>
    <button type="button" class="qty-btn qty-minus">-</button>
</div>`;
        } else {
            titleHTML = title || 'Service name';
        }

        const qtySection = qtyControls ? `\n    ${qtyControls}` : '';

        return `
<div class="sub-item" data-tab="${tab || ''}" data-package="${pkg || ''}"${qtyAttr}>
<span class="price-display">Calculating...</span>

<label class="${containerClass}">
    <input
        type="checkbox"
        class="${baseClass} service-checkbox"
        data-category="${category || ''}"
        data-plan="${plan || ''}"
        data-group="${group || ''}"
    >
    <span class="${labelClass}">
        ${titleHTML}
    </span>
</label>${qtySection}
</div>`;
    }

    /* ------------------------- TYPEWRITER EFFECT ------------------------- */
    function typewriterEffect(fullText) {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            typewriterTimer = null;
        }

        outputEl.classList.add('typewriter-active');
        let i = 0;
        const baseSpeed = 12; // ms per character
        outputEl.value = '';

        function typeNext() {
            if (i < fullText.length) {
                outputEl.value += fullText.charAt(i);
                i++;
                outputEl.scrollTop = outputEl.scrollHeight;

                // slight random speed variation for realism
                const variance = Math.random() * 8 - 4;
                const speed = Math.max(5, baseSpeed + variance);

                typewriterTimer = setTimeout(typeNext, speed);
            } else {
                outputEl.classList.remove('typewriter-active');
                typewriterTimer = null;
            }
        }

        typeNext();
    }

    /* ------------------------- OUTPUT UPDATE LOGIC ------------------------- */
    function updateOutput() {
        const serviceConfig = {
            tab:         getVal('tab'),
            pkg:         getVal('pkg'),
            category:    getVal('category'),
            plan:        getVal('plan'),
            group:       getVal('data-group'),
            title:       getVal('title'),
            finalClass:  getVal('finalCheckboxClass'),
            hasQty:      getVal('hasQty')
        };

        const rawHtml = generateServiceItem(serviceConfig);
        const formatted = prettyPrintHtml(rawHtml);
        typewriterEffect(formatted);
    }

    /* ------------------------- CLIPBOARD COPY ------------------------- */
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    copyBtn.addEventListener('click', () => {
        const text = outputEl.value;
        if (!text) return;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
        copyBtn.textContent = 'Copied';
        setTimeout(() => { copyBtn.textContent = 'Copy to Clipboard'; }, 1500);
    });

    /* ------------------------- EVENT BINDINGS & INIT ------------------------- */
    form.addEventListener('input', updateOutput);

    document.addEventListener('DOMContentLoaded', () => {
        updateOutput(); // initial render
    });

    window.addEventListener('beforeunload', () => {
        if (typewriterTimer) {
            clearTimeout(typewriterTimer);
            outputEl.classList.remove('typewriter-active');
        }
    });
})();