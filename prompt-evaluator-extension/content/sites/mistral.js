(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'mistral',
    match(hostname) {
      return hostname === 'chat.mistral.ai';
    },
    findInputElement() {
      // chat.mistral.ai uses ProseMirror inside a Radix ScrollArea
      return document.querySelector('[data-radix-scroll-area-viewport] .ProseMirror[contenteditable="true"]')
        || document.querySelector('.caret-brand-500 .ProseMirror[contenteditable="true"]')
        || document.querySelector('.ProseMirror[contenteditable="true"]');
    },
    getTextContent(el) {
      return el.innerText || el.textContent || '';
    },
    getAnchorElement(el) {
      return el.closest('[data-radix-scroll-area-viewport]') || el.closest('form') || el.parentElement;
    }
  });
})();
