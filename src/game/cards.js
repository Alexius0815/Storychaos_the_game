export function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function buildCardLookups(content) {
  const allWordsByLang = Object.fromEntries(Object.entries(content).map(([lang, data]) => [lang, Object.values(data.words).flat()]));
  const allActionsByLang = Object.fromEntries(Object.entries(content).map(([lang, data]) => [lang, [...data.actions.easy, ...data.actions.medium, ...data.actions.chaos]]));
  const wordLookups = Object.fromEntries(Object.entries(allWordsByLang).map(([lang, words]) => [lang, new Set(words.map((word) => word.toLowerCase()))]));
  const actionLookups = Object.fromEntries(Object.entries(allActionsByLang).map(([lang, actions]) => [lang, new Set(actions.map((action) => action.toLowerCase()))]));
  return { allWordsByLang, allActionsByLang, wordLookups, actionLookups };
}

export function detectLanguageFromSample(word, action, fallback = 'de', wordLookups = {}, actionLookups = {}) {
  const wordValue = word?.toLowerCase();
  const actionValue = action?.toLowerCase();
  if (wordValue && wordLookups.en?.has(wordValue)) return 'en';
  if (actionValue && actionLookups.en?.has(actionValue)) return 'en';
  if (wordValue && wordLookups.de?.has(wordValue)) return 'de';
  if (actionValue && actionLookups.de?.has(actionValue)) return 'de';
  return fallback;
}

export function roomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}
