const DEFAULTS = {
  apiKey: '',
  language: 'en',
  evalModel: 'ministral-3b-2512'
};

const LOCALES = {
  en: {
    'title': 'Prompt Evaluator',
    'settings.apiKey': 'Mistral API Key',
    'settings.language': 'Language',
    'settings.evalModel': 'Evaluation Model',
    'settings.save': 'Save',
    'settings.saved': 'Settings saved'
  },
  ja: {
    'title': 'プロンプト評価',
    'settings.apiKey': 'Mistral APIキー',
    'settings.language': '言語',
    'settings.evalModel': '評価モデル',
    'settings.save': '保存',
    'settings.saved': '設定を保存しました'
  },
  fr: {
    'title': 'Prompt Evaluator',
    'settings.apiKey': 'Clé API Mistral',
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
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const languageSelect = document.getElementById('language');
  const evalModelInput = document.getElementById('evalModel');
  const saveBtn = document.getElementById('saveBtn');
  const savedMsg = document.getElementById('savedMsg');
  const toggleKey = document.getElementById('toggleKey');

  // Load settings
  chrome.storage.sync.get(DEFAULTS, (data) => {
    apiKeyInput.value = data.apiKey;
    languageSelect.value = data.language;
    evalModelInput.value = data.evalModel;
    localizePopup(data.language);
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
      apiKey: apiKeyInput.value.trim(),
      language: languageSelect.value,
      evalModel: evalModelInput.value.trim() || DEFAULTS.evalModel
    }, () => {
      savedMsg.classList.remove('hidden');
      setTimeout(() => savedMsg.classList.add('hidden'), 2000);
    });
  });
});
