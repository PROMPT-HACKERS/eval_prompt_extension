(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'chatgpt',
    match(hostname) {
      return hostname === 'chatgpt.com' || hostname === 'chat.openai.com';
    },
    findInputElement() {
      return document.querySelector('#prompt-textarea')
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
