function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) { /* ignore */ }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (e) { /* ignore */ }
  }
  return null;
}

function valueToScore(value, criterion) {
  if (criterion.type === 'boolean') {
    const score = value.trim().toLowerCase() === 'yes' ? 1 : 0;
    return Math.max(0, Math.min(1, score));
  }
  const maxS = criterion.options.length;
  const m = value.trim().match(/^(\d+)/);
  if (m) {
    return Math.max(1, Math.min(maxS, parseInt(m[1], 10)));
  }
  for (let i = 0; i < criterion.options.length; i++) {
    if (criterion.options[i].value.trim().toLowerCase() === value.trim().toLowerCase()) {
      return i + 1;
    }
  }
  return 0;
}

function normalize(score, criterion) {
  if (criterion.type === 'boolean') {
    return score * 100.0;
  }
  const maxS = criterion.options.length;
  const minS = 1;
  if (maxS === minS) return 100.0;
  return ((score - minS) / (maxS - minS)) * 100.0;
}

function enrich(llmCriteria, configCriteria) {
  const result = [];
  const normalizedScores = [];
  for (const item of llmCriteria) {
    const cfg = configCriteria.find(c => c.name === item.name);
    if (!cfg) { result.push(item); continue; }
    const score = valueToScore(item.value, cfg);
    normalizedScores.push(normalize(score, cfg));
    result.push({
      name: item.name,
      value: item.value,
      score: score,
      comment: item.comment || '',
    });
  }
  const overall = normalizedScores.length > 0
    ? Math.round(normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length)
    : 0;
  return { overall, criteria: result };
}
