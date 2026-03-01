(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'mistral',
    match(hostname) {
      return hostname === 'chat.mistral.ai';
    },
    findInputElement() {
      return document.querySelector('textarea')
        || document.querySelector('div[contenteditable="true"]');
    },
    getTextContent(el) {
      if (el.tagName === 'TEXTAREA') return el.value;
      return el.innerText || el.textContent || '';
    },
    getAnchorElement(el) {
      return el.closest('form') || el.parentElement;
    }
  });
})();
