(function () {
  if (window.__PE_INITIALIZED) return;
  window.__PE_INITIALIZED = true;

  // ── Shadow DOM Styles ──
  const SHADOW_STYLES = `
    :host {
      all: initial;
      font-family: 'Segoe UI', system-ui, sans-serif;
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .pe-overlay {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: rgba(20, 20, 30, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      z-index: 2147483647;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      transition: height 0.3s ease;
    }

    .pe-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      cursor: grab;
      user-select: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .pe-header:active { cursor: grabbing; }

    .pe-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .pe-title {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.85);
    }

    .pe-status-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
    }
    .pe-status-dot.typing { background: #94a3b8; }
    .pe-status-dot.loading { background: #f59e0b; animation: pe-pulse 1.2s ease-in-out infinite; }
    .pe-status-dot.done { background: #22c55e; }
    .pe-status-dot.error { background: #ef4444; }

    @keyframes pe-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .pe-status-text {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
    }

    .pe-header-btns {
      display: flex; gap: 4px;
    }
    .pe-header-btns button {
      background: rgba(255,255,255,0.06);
      border: none;
      color: rgba(255,255,255,0.4);
      width: 24px; height: 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: background 0.15s;
    }
    .pe-header-btns button:hover {
      background: rgba(255,255,255,0.12);
      color: rgba(255,255,255,0.7);
    }

    .pe-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .pe-body.collapsed { display: none; }

    .pe-canvas-wrap {
      display: flex; justify-content: center;
    }

    .pe-overall {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.3);
      text-align: center;
    }

    /* Criteria list under chart */
    .pe-criteria-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .pe-criterion-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 8px;
      background: rgba(255,255,255,0.03);
      border-radius: 6px;
      font-size: 11px;
    }
    .pe-criterion-name {
      color: rgba(255,255,255,0.5);
    }
    .pe-criterion-value {
      color: rgba(255,255,255,0.7);
      font-weight: 500;
    }

  `;

  // ── PromptEvaluatorOverlay ──
  class PromptEvaluatorOverlay {
    constructor() {
      this.host = document.createElement('div');
      this.host.id = 'prompt-evaluator-host';
      this.shadow = this.host.attachShadow({ mode: 'closed' });
      this.collapsed = false;
      this._dragState = null;

      const style = document.createElement('style');
      style.textContent = SHADOW_STYLES;
      this.shadow.appendChild(style);

      this._buildUI();
      document.documentElement.appendChild(this.host);
    }

    _buildUI() {
      // Overlay container
      this.overlay = document.createElement('div');
      this.overlay.className = 'pe-overlay';

      // Header
      const header = document.createElement('div');
      header.className = 'pe-header';

      const left = document.createElement('div');
      left.className = 'pe-header-left';

      this.statusDot = document.createElement('div');
      this.statusDot.className = 'pe-status-dot';

      this.titleEl = document.createElement('span');
      this.titleEl.className = 'pe-title';
      this.titleEl.textContent = t('title');

      this.statusText = document.createElement('span');
      this.statusText.className = 'pe-status-text';
      this.statusText.textContent = t('status.idle');

      left.append(this.statusDot, this.titleEl, this.statusText);

      const btns = document.createElement('div');
      btns.className = 'pe-header-btns';

      this.collapseBtn = document.createElement('button');
      this.collapseBtn.textContent = '−';
      this.collapseBtn.title = t('overlay.collapse');
      this.collapseBtn.addEventListener('click', () => this._toggleCollapse());

      this.closeBtn = document.createElement('button');
      this.closeBtn.textContent = '×';
      this.closeBtn.title = t('overlay.close');
      this.closeBtn.addEventListener('click', () => this.hide());

      btns.append(this.collapseBtn, this.closeBtn);
      header.append(left, btns);

      // Drag
      header.addEventListener('mousedown', (e) => this._onDragStart(e));

      // Body
      this.body = document.createElement('div');
      this.body.className = 'pe-body';

      const canvasWrap = document.createElement('div');
      canvasWrap.className = 'pe-canvas-wrap';
      this.canvas = document.createElement('canvas');
      canvasWrap.appendChild(this.canvas);

      this.radarChart = new RadarChart(this.canvas, 280);

      this.overallLabel = document.createElement('div');
      this.overallLabel.className = 'pe-overall';
      this.overallLabel.textContent = t('overall');

      this.criteriaList = document.createElement('div');
      this.criteriaList.className = 'pe-criteria-list';

      this.body.append(canvasWrap, this.overallLabel, this.criteriaList);

      this.overlay.append(header, this.body);
      this.shadow.appendChild(this.overlay);
    }

    show() { this.overlay.style.display = ''; }
    hide() { this.overlay.style.display = 'none'; }

    resetChart() {
      this.radarChart.reset();
      this.overallLabel.textContent = t('overall');
      this.criteriaList.innerHTML = '';
    }

    refreshLocale() {
      this.titleEl.textContent = t('title');
      this.collapseBtn.title = this.collapsed ? t('overlay.expand') : t('overlay.collapse');
      this.closeBtn.title = t('overlay.close');
      this.overallLabel.textContent = t('overall');
    }

    setStatus(state, text) {
      this.statusDot.className = 'pe-status-dot ' + state;
      this.statusText.textContent = text || '';
    }

    updateResults(enriched) {
      var lang = _currentLang;
      var localizedLabels = enriched.criteria.map(function (c) {
        return getCriterionDisplayName(c.name, lang);
      });
      this.radarChart.update(enriched.criteria, enriched.overall, localizedLabels);
      this.overallLabel.textContent = t('overall') + ': ' + enriched.overall;

      this.criteriaList.innerHTML = '';
      for (var i = 0; i < enriched.criteria.length; i++) {
        var c = enriched.criteria[i];
        var row = document.createElement('div');
        row.className = 'pe-criterion-row';
        var nameEl = document.createElement('span');
        nameEl.className = 'pe-criterion-name';
        nameEl.textContent = getCriterionDisplayName(c.name, lang);
        var valEl = document.createElement('span');
        valEl.className = 'pe-criterion-value';
        valEl.textContent = getValueDisplayNote(c.name, c.value, lang);
        row.append(nameEl, valEl);
        this.criteriaList.appendChild(row);
      }
    }

    _toggleCollapse() {
      this.collapsed = !this.collapsed;
      if (this.collapsed) {
        this.body.classList.add('collapsed');
        this.collapseBtn.textContent = '+';
        this.collapseBtn.title = t('overlay.expand');
      } else {
        this.body.classList.remove('collapsed');
        this.collapseBtn.textContent = '−';
        this.collapseBtn.title = t('overlay.collapse');
      }
    }

    _onDragStart(e) {
      if (e.target.tagName === 'BUTTON') return;
      const rect = this.overlay.getBoundingClientRect();
      this._dragState = {
        startX: e.clientX, startY: e.clientY,
        origLeft: rect.left, origTop: rect.top
      };
      this.overlay.style.right = 'auto';
      this.overlay.style.left = rect.left + 'px';
      this.overlay.style.top = rect.top + 'px';

      const onMove = (ev) => {
        if (!this._dragState) return;
        const dx = ev.clientX - this._dragState.startX;
        const dy = ev.clientY - this._dragState.startY;
        this.overlay.style.left = (this._dragState.origLeft + dx) + 'px';
        this.overlay.style.top = (this._dragState.origTop + dy) + 'px';
      };
      const onUp = () => {
        this._dragState = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

  }

  // ── InputWatcher ──
  class InputWatcher {
    constructor(overlay) {
      this.overlay = overlay;
      this.siteModule = null;
      this.inputEl = null;
      this._debounceTimer = null;
      this._requestId = 0;
      this._observer = null;
      this._inputObserver = null;
      this._retryCount = 0;
      this._maxRetries = 3;
      this._retryDelays = [500, 1500, 3000];
    }

    start() {
      this._resolveSiteModule();
      this._watchForInput();
      this._watchNavigation();
    }

    _resolveSiteModule() {
      const hostname = location.hostname;
      const modules = window.__PE_SITE_MODULES || [];
      for (const mod of modules) {
        if (mod.match(hostname)) {
          this.siteModule = mod;
          break;
        }
      }
    }

    _watchForInput() {
      this._tryAttach();
      if (!this.inputEl) {
        this._observer = new MutationObserver(() => {
          if (!this.inputEl) this._tryAttach();
        });
        this._observer.observe(document.body, { childList: true, subtree: true });
      }
    }

    _tryAttach() {
      if (!this.siteModule) return;
      const el = this.siteModule.findInputElement();
      if (!el || el === this.inputEl) return;

      this.inputEl = el;
      this._retryCount = 0;
      this.overlay.show();
      this.overlay.setStatus('idle', t('status.idle'));

      // Remove old listener
      if (this._inputObserver) {
        this._inputObserver.disconnect();
        this._inputObserver = null;
      }

      if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
        el.addEventListener('input', () => this._onTextChange());
      } else {
        // contentEditable
        this._inputObserver = new MutationObserver(() => this._onTextChange());
        this._inputObserver.observe(el, {
          childList: true, characterData: true, subtree: true
        });
      }
    }

    _watchNavigation() {
      // SPA navigation detection
      let lastUrl = location.href;
      const navObserver = new MutationObserver(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          this._onNavigate();
        }
      });
      navObserver.observe(document.body, { childList: true, subtree: true });
    }

    _onNavigate() {
      this.inputEl = null;
      if (this._inputObserver) {
        this._inputObserver.disconnect();
        this._inputObserver = null;
      }
      this._retryCount = 0;
      this._retryAttach();
    }

    _retryAttach() {
      if (this._retryCount >= this._maxRetries) return;
      const delay = this._retryDelays[this._retryCount] || 3000;
      this._retryCount++;
      setTimeout(() => {
        this._tryAttach();
        if (!this.inputEl) this._retryAttach();
      }, delay);
    }

    _onTextChange() {
      if (!this.siteModule || !this.inputEl) return;
      const text = this.siteModule.getTextContent(this.inputEl).trim();

      if (!text) {
        this.overlay.setStatus('idle', t('status.idle'));
        this.overlay.resetChart();
        return;
      }

      if (text.length < 5) {
        this.overlay.setStatus('idle', t('status.idle'));
        return;
      }

      this.overlay.setStatus('typing', t('status.typing'));

      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => {
        this._evaluate(text);
      }, DEBOUNCE_MS);
    }

    _evaluate(text) {
      const reqId = ++this._requestId;
      this.overlay.setStatus('loading', t('status.evaluating'));

      // Client-side timeout in case service worker dies
      const timeoutId = setTimeout(() => {
        if (reqId !== this._requestId) return;
        this.overlay.setStatus('error', t('status.error'));
      }, 35000);

      try {
        chrome.runtime.sendMessage({
          type: 'EVALUATE',
          text,
          evalPrompts: EVAL_PROMPTS
        }, (resp) => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            if (reqId === this._requestId) {
              this.overlay.setStatus('error', t('status.error'));
            }
            return;
          }
          if (reqId !== this._requestId) return; // stale

          if (!resp || resp.error) {
            this.overlay.setStatus('error', resp && resp.error === 'API_KEY_MISSING'
              ? t('settings.apiKeyMissing')
              : t('status.error'));
            return;
          }

          const parsed = extractJson(resp.result);
          if (!parsed || !parsed.criteria) {
            this.overlay.setStatus('error', t('status.error'));
            return;
          }

          const enriched = enrich(parsed.criteria, CRITERIA_CONFIG.criteria);
          this.overlay.updateResults(enriched);
          this.overlay.setStatus('done', t('status.done'));
        });
      } catch (e) {
        clearTimeout(timeoutId);
        this.overlay.setStatus('error', t('status.error'));
      }
    }
  }

  // ── Initialize ──
  function init() {
    chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (settings) => {
      if (chrome.runtime.lastError) {
        // Service worker not ready, use defaults
      } else if (settings && settings.language) {
        setLanguage(settings.language);
      }
      const overlay = new PromptEvaluatorOverlay();
      overlay.hide(); // hidden until input detected
      const watcher = new InputWatcher(overlay);
      watcher.start();

      // Listen for language changes from popup
      chrome.storage.onChanged.addListener(function (changes) {
        if (changes.language && changes.language.newValue) {
          setLanguage(changes.language.newValue);
          overlay.refreshLocale();
          overlay.setStatus('idle', t('status.idle'));
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
