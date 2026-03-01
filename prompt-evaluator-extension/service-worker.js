const DEFAULT_EVAL_MODEL = 'ministral-3b-2512';
const DEFAULT_API_ENDPOINT = 'http://localhost:8080/v1/chat/completions';
const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';
const API_TIMEOUT_MS = 60000;

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(
      { mode: 'local', apiKey: '', language: 'en', evalModel: DEFAULT_EVAL_MODEL, apiEndpoint: DEFAULT_API_ENDPOINT },
      resolve
    );
  });
}

async function callLLM(apiEndpoint, apiKey, model, systemPrompt, userContent) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = 'Bearer ' + apiKey;
  }

  try {
    const resp = await fetch(apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error('API error ' + resp.status + ': ' + errText);
    }

    const data = await resp.json();
    return data.choices[0].message.content;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('API request timed out after ' + (API_TIMEOUT_MS / 1000) + 's');
    }
    throw e;
  }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === 'GET_SETTINGS') {
    getSettings().then(function (s) { sendResponse(s); });
    return true;
  }

  if (msg.type === 'EVALUATE') {
    handleEvaluate(msg, sendResponse);
    return true;
  }

});

async function handleEvaluate(msg, sendResponse) {
  try {
    var settings = await getSettings();
    var mode = settings.mode || 'local';
    var endpoint = mode === 'local'
      ? (settings.apiEndpoint || DEFAULT_API_ENDPOINT)
      : MISTRAL_API_ENDPOINT;
    console.log('[PE] Settings loaded:', { mode: mode, hasKey: !!settings.apiKey, lang: settings.language, model: settings.evalModel, endpoint: endpoint });
    if (mode === 'api' && !settings.apiKey) {
      sendResponse({ error: 'API_KEY_MISSING' });
      return;
    }
    var lang = settings.language || 'en';
    var prompt = msg.evalPrompts[lang] || msg.evalPrompts['en'];
    var model = settings.evalModel || DEFAULT_EVAL_MODEL;
    var apiKey = mode === 'api' ? settings.apiKey : '';
    console.log('[PE] Calling LLM (' + mode + '), model:', model, 'endpoint:', endpoint, 'text length:', msg.text.length);
    var result = await callLLM(endpoint, apiKey, model, prompt, msg.text);
    console.log('[PE] API response received, length:', result.length);
    sendResponse({ result: result });
  } catch (e) {
    console.error('[PE] API error:', e.message);
    sendResponse({ error: e.message });
  }
}
