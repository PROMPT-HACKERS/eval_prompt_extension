(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'gemini',
    match(hostname) {
      return hostname === 'gemini.google.com';
    },
    findInputElement() {
      return document.querySelector('div[contenteditable="true"][role="textbox"]')
        || document.querySelector('div[contenteditable="true"]');
    },
    getTextContent(el) {
      return el.innerText || el.textContent || '';
    },
    getAnchorElement(el) {
      return el.closest('form') || el.parentElement;
    }
  });
})();
