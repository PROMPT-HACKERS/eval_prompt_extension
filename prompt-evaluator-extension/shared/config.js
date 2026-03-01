const CRITERIA_CONFIG = {
  criteria: [
    {
      name: "Clarity",
      displayName: { en: "Clarity", ja: "明確さ", fr: "Clarté" },
      description: {
        en: "How clear and unambiguous is the prompt?",
        ja: "プロンプトはどの程度明確で曖昧さがないか？",
        fr: "Le prompt est-il clair et sans ambiguïté ?"
      },
      options: [
        { value: "1: Very Vague", note: { en: "Extremely unclear", ja: "非常に曖昧", fr: "Très vague" } },
        { value: "2: Somewhat Vague", note: { en: "Partially unclear", ja: "やや曖昧", fr: "Assez vague" } },
        { value: "3: Average", note: { en: "Moderately clear", ja: "普通", fr: "Moyen" } },
        { value: "4: Somewhat Clear", note: { en: "Mostly clear", ja: "やや明瞭", fr: "Assez clair" } },
        { value: "5: Very Clear", note: { en: "Perfectly clear", ja: "非常に明瞭", fr: "Très clair" } }
      ]
    },
    {
      name: "Role Assignment",
      displayName: { en: "Role Assignment", ja: "役割", fr: "Rôle" },
      type: "boolean",
      description: {
        en: "Does the prompt assign a specific role to the AI?",
        ja: "プロンプトはAIに特定の役割を割り当てているか？",
        fr: "Le prompt attribue-t-il un rôle spécifique à l'IA ?"
      },
      options: [
        { value: "No", note: { en: "No role assigned", ja: "役割なし", fr: "Aucun rôle attribué" } },
        { value: "Yes", note: { en: "Role is assigned", ja: "役割あり", fr: "Rôle attribué" } }
      ]
    },
    {
      name: "Prompt Structure Order",
      displayName: { en: "Structure", ja: "文章構成", fr: "Structure" },
      description: {
        en: "Does the prompt follow a logical structure?",
        ja: "プロンプトは論理的な構造に従っているか？",
        fr: "Le prompt suit-il une structure logique ?"
      },
      options: [
        { value: "1: Not Followed", note: { en: "No structure", ja: "守られていない", fr: "Non respecté" } },
        { value: "2: Partially Followed", note: { en: "Some structure", ja: "一部守られている", fr: "Partiellement respecté" } },
        { value: "3: Fully Followed", note: { en: "Well structured", ja: "完全に守られている", fr: "Entièrement respecté" } }
      ]
    },
    {
      name: "Target Audience",
      displayName: { en: "Audience", ja: "対象者", fr: "Public cible" },
      description: {
        en: "Is the target audience specified?",
        ja: "ターゲットオーディエンスは指定されているか？",
        fr: "Le public cible est-il spécifié ?"
      },
      options: [
        { value: "1: None", note: { en: "Not mentioned", ja: "指定なし", fr: "Non spécifié" } },
        { value: "2: Vague", note: { en: "Vaguely mentioned", ja: "曖昧な指定", fr: "Spécification vague" } },
        { value: "3: Mentioned", note: { en: "Mentioned", ja: "言及あり", fr: "Mentionné" } },
        { value: "4: Clear", note: { en: "Clearly defined", ja: "明確に指定", fr: "Clairement spécifié" } },
        { value: "5: Detailed", note: { en: "Detailed description", ja: "詳細に指定", fr: "Spécifié en détail" } }
      ]
    },
    {
      name: "Scope Limitation",
      displayName: { en: "Scope", ja: "範囲", fr: "Portée" },
      description: {
        en: "Is the scope well defined and limited?",
        ja: "スコープは適切に定義・制限されているか？",
        fr: "Le périmètre est-il bien défini et limité ?"
      },
      options: [
        { value: "1: None", note: { en: "No limitation", ja: "限定なし", fr: "Aucune limitation" } },
        { value: "2: Too Broad", note: { en: "Too broad", ja: "広すぎる", fr: "Trop large" } },
        { value: "3: Moderate", note: { en: "Moderate scope", ja: "ある程度限定", fr: "Modérément limité" } },
        { value: "4: Well Scoped", note: { en: "Well scoped", ja: "適切に限定", fr: "Bien délimité" } },
        { value: "5: Precisely Scoped", note: { en: "Precisely scoped", ja: "的確に限定", fr: "Précisément délimité" } }
      ]
    },
    {
      name: "Output Format & Examples",
      displayName: { en: "Output Format", ja: "出力形式", fr: "Format de sortie" },
      description: {
        en: "Are output format and examples provided?",
        ja: "出力形式と例は提供されているか？",
        fr: "Le format de sortie et des exemples sont-ils fournis ?"
      },
      options: [
        { value: "1: None", note: { en: "Nothing specified", ja: "指定なし", fr: "Non spécifié" } },
        { value: "2: Minimal", note: { en: "Minimal info", ja: "曖昧な形式のみ", fr: "Format vague uniquement" } },
        { value: "3: Partial", note: { en: "Partially specified", ja: "形式または例の一方あり", fr: "Format ou exemple fourni" } },
        { value: "4: Clear", note: { en: "Clearly specified", ja: "形式と例が明確", fr: "Format clair avec exemples" } },
        { value: "5: Comprehensive", note: { en: "Comprehensive", ja: "詳細な形式と完全なテンプレート", fr: "Format détaillé avec modèle complet" } }
      ]
    }
  ]
};

function getCriterionDisplayName(name, lang) {
  var cfg = CRITERIA_CONFIG.criteria.find(function (c) { return c.name === name; });
  if (!cfg || !cfg.displayName) return name;
  return cfg.displayName[lang] || cfg.displayName['en'] || name;
}

function getValueDisplayNote(name, value, lang) {
  var cfg = CRITERIA_CONFIG.criteria.find(function (c) { return c.name === name; });
  if (!cfg) return value;
  var opt = cfg.options.find(function (o) { return o.value === value; });
  if (!opt || !opt.note) return value;
  var note = typeof opt.note === 'object' ? (opt.note[lang] || opt.note['en']) : opt.note;
  return note || value;
}

function localizeConfig(lang) {
  return CRITERIA_CONFIG.criteria.map(c => {
    const localized = { ...c };
    if (c.description && typeof c.description === 'object') {
      localized.description = c.description[lang] || c.description['en'];
    }
    if (c.displayName && typeof c.displayName === 'object') {
      localized.localizedName = c.displayName[lang] || c.displayName['en'];
    }
    localized.options = c.options.map(o => {
      const lo = { ...o };
      if (o.note && typeof o.note === 'object') {
        lo.note = o.note[lang] || o.note['en'];
      }
      return lo;
    });
    return localized;
  });
}
