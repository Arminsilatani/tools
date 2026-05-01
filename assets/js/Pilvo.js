/*
  ****************************************************
  *  Author: Armin Silatani
  *  Date: 2026-04-25
  *  Version: 1.0.0
  ****************************************************
*/

/* =========================== RICH TEXT EDITOR ============================ */

document.addEventListener('DOMContentLoaded', function() {

  /* ------------------------- ELEMENTS ------------------------- */
  const editor           = document.getElementById('editor');
  const toolbar          = document.getElementById('toolbar');
  const counter          = document.getElementById('wordCharCounter');
  const fontSizeSelect   = document.getElementById('fontSizeSelect');
  const textColorInput   = document.getElementById('textColorInput');
  const bgColorInput     = document.getElementById('bgColorInput');
  const codeViewBtn      = document.getElementById('codeViewBtn');
  const emojiBtn         = document.getElementById('emojiBtn');
  const emojiPanel       = document.getElementById('emojiPanel');
  const emojiRow         = document.getElementById('emojiRow');
  const fullscreenBtn    = document.getElementById('fullscreenBtn');
  const exportBtn        = document.getElementById('exportTxtBtn');
  const loremBtn         = document.getElementById('loremBtn');
  const insertImageBtn   = document.getElementById('insertImageBtn');

  let isCodeView = false;

  /* ------------------------- COUNTER ------------------------- */
  function updateCounter() {
    const text = editor.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    counter.textContent = `Words: ${words} · Chars: ${chars}`;
  }

  editor.addEventListener('input', updateCounter);
  editor.addEventListener('paste', () => setTimeout(updateCounter, 10));
  updateCounter();

  /* ------------------------- FONT SIZE ------------------------- */
  fontSizeSelect.addEventListener('change', function() {
    document.execCommand('fontSize', false, this.value);
    editor.focus();
    updateToolbarState();
  });

  /* ------------------------- COLOR PICKERS ------------------------- */
  document.getElementById('textColorBtn').addEventListener('click', () => textColorInput.click());
  textColorInput.addEventListener('input', function() {
    document.execCommand('foreColor', false, this.value);
    editor.focus();
  });

  document.getElementById('bgColorBtn').addEventListener('click', () => bgColorInput.click());
  bgColorInput.addEventListener('input', function() {
    document.execCommand('backColor', false, this.value);
    editor.focus();
  });

  /* ------------------------- INSERT IMAGE ------------------------- */
  insertImageBtn.addEventListener('click', function() {
    const url = prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertImage', false, url);
      editor.focus();
      updateToolbarState();
    }
  });

  /* ------------------------- CODE VIEW ------------------------- */
  codeViewBtn.addEventListener('click', function() {
    isCodeView = !isCodeView;
    if (isCodeView) {
      const html = editor.innerHTML;
      editor.classList.add('code-view');
      editor.textContent = html;
      codeViewBtn.classList.add('active');
    } else {
      const html = editor.textContent || '';
      editor.classList.remove('code-view');
      editor.innerHTML = html;
      codeViewBtn.classList.remove('active');
    }
    editor.focus();
    updateCounter();
  });

  /* ------------------------- EMOJI PICKER ------------------------- */
  const emojis = [
    "😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋",
    "😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","😣",
    "😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥",
    "😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴",
    "🤤","😪","😵","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡",
    "💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😿","😾"
  ];

  function buildEmojiRow() {
    emojiRow.innerHTML = '';
    emojis.forEach(emoji => {
      const btn = document.createElement('button');
      btn.textContent = emoji;
      btn.addEventListener('click', function() {
        insertTextAtCursor(emoji);
        emojiPanel.style.display = 'none';
        editor.focus();
      });
      emojiRow.appendChild(btn);
    });
  }

  function positionEmojiPanel() {
    const btnRect = emojiBtn.getBoundingClientRect();
    const panelHeight = 56;
    const panelWidth = Math.min(window.innerWidth - 32, 560);
    emojiPanel.style.maxWidth = panelWidth + 'px';

    let top = btnRect.bottom + 6;
    let left = btnRect.left;

    if (top + panelHeight > window.innerHeight - 10) {
      top = btnRect.top - panelHeight - 6;
    }
    if (left + panelWidth > window.innerWidth - 16) {
      left = window.innerWidth - panelWidth - 16;
    }
    if (left < 16) left = 16;

    emojiPanel.style.top = top + 'px';
    emojiPanel.style.left = left + 'px';
  }

  function insertTextAtCursor(text) {
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (document.selection && document.selection.createRange) {
      document.selection.createRange().text = text;
    }
  }

  buildEmojiRow();

  emojiBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (emojiPanel.style.display === 'flex') {
      emojiPanel.style.display = 'none';
      return;
    }
    positionEmojiPanel();
    emojiPanel.style.display = 'flex';
  });

  window.addEventListener('resize', () => {
    if (emojiPanel.style.display === 'flex') positionEmojiPanel();
  });
  window.addEventListener('scroll', () => {
    if (emojiPanel.style.display === 'flex') positionEmojiPanel();
  });

  document.addEventListener('click', function(event) {
    if (!emojiPanel.contains(event.target) && event.target !== emojiBtn) {
      emojiPanel.style.display = 'none';
    }
  });

  /* ------------------------- FULLSCREEN ------------------------- */
  fullscreenBtn.addEventListener('click', function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
      fullscreenBtn.classList.add('active');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        fullscreenBtn.classList.remove('active');
      }
    }
  });

  document.addEventListener('fullscreenchange', function() {
    fullscreenBtn.classList.toggle('active', !!document.fullscreenElement);
  });

  /* ------------------------- EXPORT ------------------------- */
  exportBtn.addEventListener('click', function() {
    const text = editor.innerText || '';
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pilvo-document.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  /* ------------------------- LOREM IPSUM ------------------------- */
  loremBtn.addEventListener('click', function() {
    const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
    editor.focus();
    const sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt(0).intersectsNode(editor)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(lorem);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.innerHTML += '<p>' + lorem + '</p>';
    }
    updateCounter();
    updateToolbarState();
  });

  /* ------------------------- TOOLBAR COMMANDS ------------------------- */
  // Undo / Redo
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === 'undo' || cmd === 'redo') {
      document.execCommand(cmd);
      editor.focus();
      updateToolbarState();
    }
  });

  // Generic handler for other formatting commands
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (!cmd || cmd === 'undo' || cmd === 'redo') return;

    let value = btn.dataset.value || null;
    if (cmd === 'createLink') {
      const url = prompt('Enter the link URL');
      if (url) document.execCommand('createLink', false, url);
    } else if (cmd === 'formatBlock') {
      document.execCommand('formatBlock', false, `<${value}>`);
    } else {
      document.execCommand(cmd, false, value);
    }
    editor.focus();
    updateToolbarState();
  });

  function updateToolbarState() {
    const buttons = toolbar.querySelectorAll('.tool-btn[data-cmd]');
    buttons.forEach(btn => {
      const cmd = btn.dataset.cmd;
      if (!cmd || cmd === 'createLink' || cmd === 'unlink' || cmd === 'removeFormat' || cmd === 'formatBlock') return;
      let active = false;
      if (cmd === 'justifyLeft' || cmd === 'justifyCenter' || cmd === 'justifyRight') {
        active = document.queryCommandState(cmd);
      } else {
        active = document.queryCommandState(cmd);
      }
      btn.classList.toggle('active', active);
    });

    const headingBtns = toolbar.querySelectorAll('[data-cmd="formatBlock"]');
    headingBtns.forEach(btn => {
      const value = btn.dataset.value;
      const active = document.queryCommandValue('formatBlock').toLowerCase() === value.toLowerCase();
      btn.classList.toggle('active', active);
    });

    const currentSize = document.queryCommandValue('fontSize');
    if (currentSize && fontSizeSelect.querySelector(`option[value="${currentSize}"]`)) {
      fontSizeSelect.value = currentSize;
    }
  }

  document.addEventListener('selectionchange', () => {
    if (document.activeElement === editor || document.activeElement?.closest?.('.editor-wrapper')) {
      updateToolbarState();
    }
  });

  editor.addEventListener('focus', updateToolbarState);
  editor.addEventListener('click', updateToolbarState);
  editor.addEventListener('keyup', updateToolbarState);
  editor.addEventListener('input', updateToolbarState);

  /* ------------------------- INITIALIZATION ------------------------- */
  editor.focus();
});