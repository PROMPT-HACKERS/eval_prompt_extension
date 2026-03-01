const DEFAULTS = {
  mode: 'local',
  apiKey: '',
  language: 'en',
  evalModel: 'ministral-3b-2512',
  apiEndpoint: 'http://localhost:8080/v1/chat/completions'
};

const LOCALES = {
  en: {
    'title': 'Prompt Evaluator',
    'settings.mode': 'Mode',
    'settings.mode.local': 'Local',
    'settings.mode.api': 'API',
    'settings.apiEndpoint': 'Local Server URL',
    'settings.apiKey': 'API Key',
    'settings.language': 'Language',
    'settings.evalModel': 'Evaluation Model',
    'settings.save': 'Save',
    'settings.saved': 'Settings saved'
  },
  ja: {
    'title': 'プロンプト評価',
    'settings.mode': 'モード',
    'settings.mode.local': 'ローカル',
    'settings.mode.api': 'API',
    'settings.apiEndpoint': 'ローカルサーバーURL',
    'settings.apiKey': 'APIキー',
    'settings.language': '言語',
    'settings.evalModel': '評価モデル',
    'settings.save': '保存',
    'settings.saved': '設定を保存しました'
  },
  fr: {
    'title': 'Prompt Evaluator',
    'settings.mode': 'Mode',
    'settings.mode.local': 'Local',
    'settings.mode.api': 'API',
    'settings.apiEndpoint': 'URL du serveur local',
    'settings.apiKey': 'Clé API',
    'settings.language': 'Langue',
    'settings.evalModel': "Modèle d'évaluation",
    'settings.save': 'Enregistrer',
    'settings.saved': 'Paramètres enregistrés'
  }
};

function localizePopup(lang) {
  const loc = LOCALES[lang] || LOCALES['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (loc[key]) el.textContent = loc[key];
  });
  // Localize mode buttons
  document.getElementById('modeLocal').textContent = loc['settings.mode.local'] || 'Local';
  document.getElementById('modeApi').textContent = loc['settings.mode.api'] || 'API';
}

function setMode(mode) {
  const localFields = document.getElementById('localFields');
  const apiFields = document.getElementById('apiFields');
  const modeLocal = document.getElementById('modeLocal');
  const modeApi = document.getElementById('modeApi');

  if (mode === 'local') {
    localFields.classList.remove('hidden');
    apiFields.classList.add('hidden');
    modeLocal.classList.add('active');
    modeApi.classList.remove('active');
  } else {
    localFields.classList.add('hidden');
    apiFields.classList.remove('hidden');
    modeLocal.classList.remove('active');
    modeApi.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modeLocal = document.getElementById('modeLocal');
  const modeApi = document.getElementById('modeApi');
  const apiEndpointInput = document.getElementById('apiEndpoint');
  const apiKeyInput = document.getElementById('apiKey');
  const languageSelect = document.getElementById('language');
  const evalModelInput = document.getElementById('evalModel');
  const saveBtn = document.getElementById('saveBtn');
  const savedMsg = document.getElementById('savedMsg');
  const toggleKey = document.getElementById('toggleKey');

  let currentMode = DEFAULTS.mode;

  // Load settings
  chrome.storage.sync.get(DEFAULTS, (data) => {
    currentMode = data.mode || DEFAULTS.mode;
    apiEndpointInput.value = data.apiEndpoint;
    apiKeyInput.value = data.apiKey;
    languageSelect.value = data.language;
    evalModelInput.value = data.evalModel;
    setMode(currentMode);
    localizePopup(data.language);
  });

  // Mode toggle
  modeLocal.addEventListener('click', () => {
    currentMode = 'local';
    setMode('local');
  });
  modeApi.addEventListener('click', () => {
    currentMode = 'api';
    setMode('api');
  });

  // Toggle API key visibility
  toggleKey.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
  });

  // Localize on language change
  languageSelect.addEventListener('change', () => {
    localizePopup(languageSelect.value);
  });

  // Save
  saveBtn.addEventListener('click', () => {
    chrome.storage.sync.set({
      mode: currentMode,
      apiEndpoint: apiEndpointInput.value.trim() || DEFAULTS.apiEndpoint,
      apiKey: apiKeyInput.value.trim(),
      language: languageSelect.value,
      evalModel: evalModelInput.value.trim() || DEFAULTS.evalModel
    }, () => {
      savedMsg.classList.remove('hidden');
      setTimeout(() => savedMsg.classList.add('hidden'), 2000);
    });
  });
});
