const DEFAULT_EVAL_MODEL = 'ministral-3b-2512';
const API_TIMEOUT_MS = 30000;

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(
      { apiKey: '', language: 'en', evalModel: DEFAULT_EVAL_MODEL },
      resolve
    );
  });
}

async function callMistral(apiKey, model, systemPrompt, userContent) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const resp = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
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
      throw new Error('Mistral API error ' + resp.status + ': ' + errText);
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
    console.log('[PE] Settings loaded:', { hasKey: !!settings.apiKey, lang: settings.language, model: settings.evalModel });
    if (!settings.apiKey) {
      sendResponse({ error: 'API_KEY_MISSING' });
      return;
    }
    var lang = settings.language || 'en';
    var prompt = msg.evalPrompts[lang] || msg.evalPrompts['en'];
    var model = settings.evalModel || DEFAULT_EVAL_MODEL;
    console.log('[PE] Calling Mistral API, model:', model, 'text length:', msg.text.length);
    var result = await callMistral(settings.apiKey, model, prompt, msg.text);
    console.log('[PE] API response received, length:', result.length);
    sendResponse({ result: result });
  } catch (e) {
    console.error('[PE] API error:', e.message);
    sendResponse({ error: e.message });
  }
}
