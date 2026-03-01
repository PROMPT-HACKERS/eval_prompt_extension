(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'claude',
    match(hostname) {
      return hostname === 'claude.ai';
    },
    findInputElement() {
      return document.querySelector('div.ProseMirror[contenteditable="true"]');
    },
    getTextContent(el) {
      return el.innerText || el.textContent || '';
    },
    getAnchorElement(el) {
      return el.closest('fieldset') || el.closest('form') || el.parentElement;
    }
  });
})();
