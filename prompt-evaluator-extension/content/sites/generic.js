(function () {
  window.__PE_SITE_MODULES = window.__PE_SITE_MODULES || [];
  window.__PE_SITE_MODULES.push({
    name: 'generic',
    match() {
      return true; // fallback, always matches
    },
    findInputElement() {
      const candidates = [
        ...document.querySelectorAll('textarea'),
        ...document.querySelectorAll('[contenteditable="true"]')
      ];
      let best = null;
      let bestArea = 0;
      for (const el of candidates) {
        if (el.offsetWidth === 0 || el.offsetHeight === 0) continue;
        const area = el.offsetWidth * el.offsetHeight;
        if (area > bestArea) {
          bestArea = area;
          best = el;
        }
      }
      return best;
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
