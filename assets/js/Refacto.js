/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-06-01
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== SCRIPTS ============================ */
(function() {
  'use strict';

  /* ------------------------- DOM REFERENCES ------------------------- */
  const inputCode = document.getElementById('inputCode');
  const outputCode = document.getElementById('outputCode');
  const langBadge = document.getElementById('langBadge');
  const inputStats = document.getElementById('inputStats');
  const outputStats = document.getElementById('outputStats');
  const toast = document.getElementById('toast');
  const langSelect = document.getElementById('langSelect');
  const clearBtn = document.getElementById('clearBtn');

  /* ------------------------- CONSTANTS ------------------------- */
  const TARGET_WIDTH = 80;
  const NON_LATIN_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const HTML_TAG_REGEX = /<[^>]*>/i;
  const VOID_ELEMENTS_REGEX = /<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b[^>]*>/i;
  const SCRIPT_STYLE_OPEN_REGEX = /<(script|style)\b[^>]*>/i;
  const SCRIPT_STYLE_CLOSE_REGEX = /<\/(script|style)>/i;

  const SEMANTIC_TAGS = {
    'header': 'HEADER',
    'nav': 'NAVIGATION',
    'main': 'MAIN CONTENT',
    'footer': 'FOOTER',
    'section': 'SECTION',
    'article': 'ARTICLE',
    'aside': 'SIDEBAR',
    'form': 'FORM'
  };

  /* ------------------------- HELPERS ------------------------- */
  function updateStats() {
    const inLen = inputCode.value.length;
    const outLen = outputCode.value.length;
    const inLines = inputCode.value ? inputCode.value.split(/\r?\n/).length : 0;
    const outLines = outputCode.value ? outputCode.value.split(/\r?\n/).length : 0;
    inputStats.innerHTML = `Characters: <strong>${inLen}</strong> | Lines: <strong>${inLines}</strong>`;
    outputStats.innerHTML = `Characters: <strong>${outLen}</strong> | Lines: <strong>${outLines}</strong>`;
  }

  function showToast(msg, type = 'info') {
    toast.textContent = msg;
    toast.className = `toast ${type} show`;
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function hasNonLatin(text) {
    return NON_LATIN_REGEX.test(text);
  }

  /* ------------------------- LANGUAGE DETECTION ------------------------- */
  function detectLanguage(code) {
    const trimmed = code.trim();
    if (!trimmed) return 'html';
    if (/<!DOCTYPE\s+html/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || HTML_TAG_REGEX.test(trimmed)) {
      return 'html';
    }
    if (/[{}]/.test(trimmed) && /[:;]/.test(trimmed) && /[\w-]+\s*\{/.test(trimmed) && !/function\s*\(/.test(trimmed)) {
      return 'css';
    }
    if (/\b(function|var|let|const|=>|import|export)\b/.test(trimmed)) {
      return 'js';
    }
    return 'html';
  }

  /* ------------------------- SIGNATURE GENERATION ------------------------- */
  function generateSignature(lang) {
    if (lang === 'html') {
      return `<!--
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-25
  *  Version: 1.0.0
  ****************************************************
-->`;
    }
    return `/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-25
  *  Version: 1.0.0
  ****************************************************
*/`;
  }

  /* ------------------------- COMMENT GENERATION ------------------------- */
  function createCommentLine(style, label, lang) {
    const open = lang === 'html' ? '<!--' : '/*';
    const close = lang === 'html' ? '-->' : '*/';
    const inner = TARGET_WIDTH - open.length - close.length - 2;
    const symbol = style === 'page' ? ':' : '-';
    const sideCount = Math.floor((inner - label.length - 2) / 2);
    const left = symbol.repeat(sideCount);
    const right = symbol.repeat(sideCount + (label.length % 2 !== (inner - 2) % 2 ? 1 : 0));
    return `${open} ${left} ${label} ${right} ${close}`;
  }

  function isPageLevelCommentText(text) {
    const upper = text.toUpperCase();
    return /(GLOBAL|RESET|BASE|STYLESHEET|SCRIPTS|DOCUMENT|IMPORTS|VARIABLES|FONTS)/.test(upper);
  }

  function addPageLevelComment(code, lang) {
    const label = lang === 'html' ? 'DOCUMENT' : (lang === 'css' ? 'STYLESHEET' : 'SCRIPTS');
    return createCommentLine('page', label, lang) + '\n' + code;
  }

  /* ------------------------- COMMENT REFORMATTING ------------------------- */
  function normalizeExistingComments(code, lang) {
    const lines = code.split('\n');
    const output = [];
    const decorativePattern = (lang === 'html')
      ? /^(\s*)<!--\s*[=\-:*]{3,}\s+(.*?)\s+[=\-:*]{3,}\s*-->\s*$/
      : /^(\s*)\/\*\s*[=\-:*]{3,}\s+(.*?)\s+[=\-:*]{3,}\s*\*\/\s*$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(decorativePattern);
      if (match) {
        const indent = match[1] || '';
        const content = match[2].trim();
        if (!content) continue;
        const style = isPageLevelCommentText(content) ? 'page' : 'section';
        const newComment = createCommentLine(style, content, lang);
        if (output.length > 0 && output[output.length - 1] !== '') {
          output.push('', '');
        } else if (output.length === 1 && output[0] === '') {
          output.push('', '');
        }
        output.push(indent + newComment);
        continue;
      }
      output.push(line);
    }
    return output.join('\n');
  }

  function insertHTMLStructureComments(code) {
    const lines = code.split('\n');
    const output = [];
    const commentPattern = /^\s*<!--\s*[=\-:]{3,}\s+.*\s+[=\-:]{3,}\s*-->$/;

    function ensureBlanks(n = 2) {
      let blanks = 0;
      for (let j = output.length - 1; j >= 0; j--) {
        if (output[j] === '') blanks++;
        else break;
      }
      const missing = Math.max(0, n - blanks);
      for (let k = 0; k < missing; k++) output.push('');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const tagMatch = line.match(/^\s*<([a-zA-Z]+)[\s>]/);
      if (tagMatch) {
        const tag = tagMatch[1].toLowerCase();
        if (SEMANTIC_TAGS[tag] && !commentPattern.test(line) && !commentPattern.test(lines[i - 1] || '')) {
          ensureBlanks(2);
          output.push(createCommentLine('section', SEMANTIC_TAGS[tag], 'html'));
        }
      }
      output.push(line);
      if (/^\s*<script[\s>]/.test(line) && i > 0 && !/<\/head>/i.test(lines[i - 1])) {
        if (!commentPattern.test(lines[i - 1])) {
          ensureBlanks(2);
          output.push(createCommentLine('section', 'SCRIPTS', 'html'));
        }
      }
    }
    return output.join('\n');
  }

  function removeUselessComments(code, lang) {
    const lines = code.split('\n');
    const filtered = lines.filter(line => {
      const trimmed = line.trim();
      if ((lang === 'html' && trimmed === '<!-- -->') ||
          ((lang === 'css' || lang === 'js') && (trimmed === '/**/' || trimmed === '//' || trimmed === '/* */'))) {
        return false;
      }
      const isComment = (lang === 'html' && trimmed.startsWith('<!--')) ||
                        ((lang === 'css' || lang === 'js') && (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')));
      if (isComment) {
        if (hasNonLatin(trimmed)) return false;
        const content = trimmed.replace(/<!--|-->|\/*|\*\/|\/\/|\*/g, '').trim();
        if (content.length < 2 && !/^[A-Za-z]{2,}/.test(content)) return false;
      }
      return true;
    });
    return filtered.join('\n');
  }

  /* ------------------------- CODE BEAUTIFICATION ------------------------- */
  function safeBeautifyHTML(code) {
    const lines = code.split('\n');
    let indent = 0;
    const tab = '  ';
    const result = [];
    let insideSpecial = false;

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        result.push('');
        continue;
      }
      if (insideSpecial) {
        result.push(line);
        if (SCRIPT_STYLE_CLOSE_REGEX.test(trimmed)) insideSpecial = false;
        continue;
      }
      if (SCRIPT_STYLE_OPEN_REGEX.test(trimmed)) {
        insideSpecial = true;
        result.push(tab.repeat(indent) + trimmed);
        continue;
      }
      const isClosing = /^<\//.test(trimmed);
      const isSelfClosing = /\/>$/.test(trimmed) || VOID_ELEMENTS_REGEX.test(trimmed);
      if (isClosing) indent = Math.max(0, indent - 1);
      result.push(tab.repeat(indent) + trimmed);
      if (!isClosing && !isSelfClosing && /^<[a-zA-Z][^>]*[^/]>$/.test(trimmed)) indent++;
    }
    return result.join('\n');
  }

  function safeBeautifyCSS(code) {
    const lines = code.split('\n');
    let indent = 0;
    const tab = '  ';
    const result = [];
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        result.push('');
        continue;
      }
      const openBraces = (trimmed.match(/{/g) || []).length;
      const closeBraces = (trimmed.match(/}/g) || []).length;
      if (closeBraces) indent = Math.max(0, indent - closeBraces);
      result.push(tab.repeat(indent) + trimmed);
      if (openBraces) indent += openBraces;
    }
    return result.join('\n');
  }

  function safeBeautifyJS(code) {
    return code;
  }

  function beautifyCode(code, lang) {
    if (lang === 'html') return safeBeautifyHTML(code);
    if (lang === 'css') return safeBeautifyCSS(code);
    if (lang === 'js') return safeBeautifyJS(code);
    return code;
  }

  /* ------------------------- MAIN REFACTORING ------------------------- */
  function refactorCode(code, forcedLang = null) {
    if (!code.trim()) return '';
    const lang = forcedLang || detectLanguage(code);
    langBadge.textContent = lang.toUpperCase();

    let cleaned = removeUselessComments(code, lang);
    cleaned = normalizeExistingComments(cleaned, lang);

    let result = generateSignature(lang) + '\n\n';
    cleaned = addPageLevelComment(cleaned, lang);

    if (lang === 'html') {
      cleaned = insertHTMLStructureComments(cleaned);
    }

    result += cleaned;
    return result.trim();
  }

  /* ------------------------- EVENT HANDLERS ------------------------- */
  document.getElementById('beautifyOnlyBtn').addEventListener('click', () => {
    const lang = langSelect.value !== 'auto' ? langSelect.value : detectLanguage(inputCode.value);
    try {
      outputCode.value = beautifyCode(inputCode.value, lang);
      updateStats();
      showToast('Beautification completed', 'info');
    } catch (e) {
      showToast('Error during beautification', 'error');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inputCode.value = '';
      outputCode.value = '';
      updateStats();
    });
  }

  document.getElementById('clearOutputBtn').addEventListener('click', () => {
    outputCode.value = '';
    updateStats();
  });

  document.getElementById('copyBtn').addEventListener('click', async () => {
    if (!outputCode.value) return;
    try {
      await navigator.clipboard.writeText(outputCode.value);
      showToast('Copied to clipboard', 'success');
    } catch {
      outputCode.select();
      document.execCommand('copy');
      showToast('Copied (fallback)', 'info');
    }
  });

  document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!outputCode.value) return;
    const lang = langBadge.textContent.toLowerCase();
    const ext = lang === 'html' ? 'html' : (lang === 'css' ? 'css' : 'js');
    const blob = new Blob([outputCode.value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refactored.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File downloaded', 'success');
  });

  /* ------------------------- AUTO-UPDATE LISTENERS ------------------------- */
  inputCode.addEventListener('input', () => {
    updateStats();
    if (langSelect.value === 'auto') {
      langBadge.textContent = detectLanguage(inputCode.value).toUpperCase();
    }
  });

  langSelect.addEventListener('change', () => {
    if (langSelect.value !== 'auto') {
      langBadge.textContent = langSelect.value.toUpperCase();
    } else {
      langBadge.textContent = detectLanguage(inputCode.value).toUpperCase();
    }
  });

  /* ------------------------- INITIALIZATION ------------------------- */
  updateStats();
})();