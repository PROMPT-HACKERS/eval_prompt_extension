const LOCALES = {
  en: {
    title: "Prompt Evaluator",
    overall: "Overall",
    "status.idle": "Ready",
    "status.evaluating": "Evaluating...",
    "status.done": "Evaluation complete",
    "status.error": "An error occurred",
    "status.typing": "Typing...",
    "settings.apiKey": "Mistral API Key",
    "settings.language": "Language",
    "settings.evalModel": "Evaluation Model",
    "settings.save": "Save",
    "settings.saved": "Settings saved",
    "settings.apiKeyMissing": "Please set your API key in the extension settings.",
    "overlay.collapse": "Collapse",
    "overlay.expand": "Expand",
    "overlay.close": "Close"
  },
  ja: {
    title: "プロンプト評価",
    overall: "総合",
    "status.idle": "待機中",
    "status.evaluating": "評価中...",
    "status.done": "評価完了",
    "status.error": "エラーが発生しました",
    "status.typing": "入力中...",
    "settings.apiKey": "Mistral APIキー",
    "settings.language": "言語",
    "settings.evalModel": "評価モデル",
    "settings.save": "保存",
    "settings.saved": "設定を保存しました",
    "settings.apiKeyMissing": "拡張機能の設定でAPIキーを設定してください。",
    "overlay.collapse": "折りたたむ",
    "overlay.expand": "展開",
    "overlay.close": "閉じる"
  },
  fr: {
    title: "Prompt Evaluator",
    overall: "Global",
    "status.idle": "Prêt",
    "status.evaluating": "Évaluation en cours...",
    "status.done": "Évaluation terminée",
    "status.error": "Une erreur est survenue",
    "status.typing": "Saisie en cours...",
    "settings.apiKey": "Clé API Mistral",
    "settings.language": "Langue",
    "settings.evalModel": "Modèle d'évaluation",
    "settings.save": "Enregistrer",
    "settings.saved": "Paramètres enregistrés",
    "settings.apiKeyMissing": "Veuillez configurer votre clé API dans les paramètres de l'extension.",
    "overlay.collapse": "Réduire",
    "overlay.expand": "Développer",
    "overlay.close": "Fermer"
  }
};

let _currentLang = 'en';

function setLanguage(lang) {
  _currentLang = LOCALES[lang] ? lang : 'en';
}

function t(key) {
  return (LOCALES[_currentLang] && LOCALES[_currentLang][key])
    || (LOCALES['en'] && LOCALES['en'][key])
    || key;
}
