import { buildBackupStory } from '../backupStories';

function shortModelName(model) {
  const map = {
    'pollinations-openai': 'Polli OpenAI',
    'pollinations-text': 'Polli Text',
    'openrouter/free': 'OR Free',
    'mistralai/mistral-7b-instruct:free': 'Mistral',
    'google/gemma-2-9b-it:free': 'Gemma',
    'meta-llama/llama-3.1-8b-instruct:free': 'Llama',
    'llama-3.1-8b-instant': 'Groq Llama',
    'openai/gpt-oss-20b': 'GPT-OSS',
    'local-fallback': 'Hausautor',
  };
  return map[model] || model.split('/').pop()?.replace(':free', '') || model;
}

export function buildStoryAttemptLine(contentLang, phase, model, detail = '') {
  const name = shortModelName(model);
  if (contentLang === 'de') {
    if (phase === 'start' && model === 'local-fallback') return `${name} ist jetzt Plan A und baut lokal eine Geschichte fuer diese Runde.`;
    if (phase === 'start') return `${name} versucht gerade, aus dem Chaos eine brauchbare Geschichte zu kochen.`;
    if (phase === 'success') return `${name} hat etwas geliefert. Wir machen kurz den Regel-TUEV.`;
    if (phase === 'fail') return `${name} zickt rum${detail ? ` (${detail})` : ''}. Nächstes Modell darf auf die Bühne.`;
    if (phase === 'repair') return `Wir helfen ${name} noch kurz nach: mehr Länge, mehr Worttreffer, weniger Drama.`;
  }
  if (phase === 'start' && model === 'local-fallback') return `${name} is now plan A and builds a local story for this round.`;
  if (phase === 'start') return `${name} is trying to cook up a usable story from the chaos.`;
  if (phase === 'success') return `${name} delivered something. Running a quick rule check now.`;
  if (phase === 'fail') return `${name} is being difficult${detail ? ` (${detail})` : ''}. Sending in the next model.`;
  if (phase === 'repair') return `Giving ${name} a tiny cleanup pass: more length, more word hits, less drama.`;
  return name;
}

export function stripStoryMarkup(text = '') {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitIntoSentences(text = '') {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function analyzeStory(text, words, minChars) {
  const clean = stripStoryMarkup(text);
  const sentences = splitIntoSentences(clean);
  const wordChecks = words.map((word) => {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
    const matches = clean.match(regex) || [];
    const sentenceIndexes = sentences.reduce((indexes, sentence, index) => {
      if (new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(sentence)) indexes.push(index);
      return indexes;
    }, []);
    return {
      word,
      occurrences: matches.length,
      spreadAcrossSentences: new Set(sentenceIndexes).size >= 2,
    };
  });

  const validLength = clean.length >= minChars;
  const validOccurrences = wordChecks.every((check) => check.occurrences >= 2);
  const validSpread = wordChecks.every((check) => check.spreadAcrossSentences);

  return {
    clean,
    validLength,
    validOccurrences,
    validSpread,
    valid: validLength && validOccurrences && validSpread,
    wordChecks,
  };
}

function buildRepairSentence(word, contentLang, index = 0) {
  const de = [
    `Dabei kam **${word}** spaeter noch einmal zur Sprache, und genau diese betont lockere Erwaehnung machte alles erst richtig komisch.`,
    `Kurz danach fiel **${word}** erneut, diesmal so laessig, dass es sofort wieder verdaechtig wirkte.`,
    `Spaeter wurde **${word}** noch einmal eingeworfen, mit genau der Energie eines Details, auf das eigentlich niemand zu deutlich reagieren wollte.`,
  ];
  const en = [
    `A moment later, **${word}** came up again, and that overly relaxed mention somehow made the whole scene funnier.`,
    `Soon after that, **${word}** returned in such a casual way that it became suspicious immediately.`,
    `Later, **${word}** was mentioned again with exactly the kind of energy nobody wanted to react to too obviously.`,
  ];
  const bank = contentLang === 'de' ? de : en;
  return bank[index % bank.length];
}

function buildPaddingSentence(contentLang, index = 0) {
  const de = [
    'Je laenger die Szene lief, desto klarer wurde, dass hier weniger die Geschichte als die Gesichter die groesste Show lieferten.',
    'Niemand wollte zu viel verraten, aber genau dieses uebermotivierte Nicht-Reagieren machte alles erst richtig unterhaltsam.',
    'Am Ende lebte die Geschichte weniger von Logik als von herrlich schlechtem Timing und viel zu ehrgeizigen Pokerfaces.',
  ];
  const en = [
    'The longer the scene went on, the clearer it became that the faces were putting on the real show.',
    'Nobody wanted to reveal too much, but that overcommitted effort to stay subtle made everything more entertaining.',
    'By the end, the story lived less from logic than from terrible timing and wildly ambitious poker faces.',
  ];
  const bank = contentLang === 'de' ? de : en;
  return bank[index % bank.length];
}

export function repairStoryToRules(text, words, minChars, contentLang) {
  let clean = stripStoryMarkup(text);
  let analysis = analyzeStory(clean, words, minChars);
  let sentenceCursor = 0;

  for (const check of analysis.wordChecks) {
    let occurrenceGuard = 0;
    while (check.occurrences < 2) {
      occurrenceGuard += 1;
      if (occurrenceGuard > 6) break;
      clean = `${clean} ${buildRepairSentence(check.word, contentLang, sentenceCursor)}`.trim();
      sentenceCursor += 1;
      analysis = analyzeStory(clean, words, minChars);
      const updated = analysis.wordChecks.find((entry) => entry.word === check.word);
      check.occurrences = updated?.occurrences || check.occurrences;
      check.spreadAcrossSentences = updated?.spreadAcrossSentences || check.spreadAcrossSentences;
    }
    if (!check.spreadAcrossSentences) {
      clean = `${clean} ${buildRepairSentence(check.word, contentLang, sentenceCursor)}`.trim();
      sentenceCursor += 1;
      analysis = analyzeStory(clean, words, minChars);
    }
  }

  let paddingGuard = 0;
  while (stripStoryMarkup(clean).length < minChars) {
    paddingGuard += 1;
    if (paddingGuard > 20) break;
    clean = `${clean} ${buildPaddingSentence(contentLang, sentenceCursor)}`.trim();
    sentenceCursor += 1;
  }

  return clean;
}

export async function generateStory({ prompt, contentLang, words, minChars, content, appUrl, addLog }, onStatus = () => {}) {
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  const requestOpenRouter = async (model) => {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': appUrl,
        'X-Title': 'Story Chaos',
        ...(openRouterKey ? { Authorization: `Bearer ${openRouterKey}` } : {}),
      },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) throw new Error(`${model}:fail`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  };

  const requestGroq = async (model) => {
    if (!groqKey) throw new Error('groq:no-key');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: content[contentLang].aiSystem },
          { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 900,
      }),
    });
    if (!response.ok) throw new Error(`${model}:fail`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  };

  const providers = [
    {
      model: 'pollinations-openai',
      run: async () => {
        const response = await fetch('https://text.pollinations.ai/openai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'openai',
            messages: [
              { role: 'system', content: content[contentLang].aiSystem },
              { role: 'user', content: prompt },
            ],
            seed: Math.floor(Math.random() * 99999),
          }),
        });
        if (!response.ok) throw new Error('fail');
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      },
    },
    {
      model: 'pollinations-text',
      run: async () => {
        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
        if (!response.ok) throw new Error('fail');
        return await response.text();
      },
    },
    { model: 'openrouter/free', run: async () => requestOpenRouter('openrouter/free') },
    { model: 'mistralai/mistral-7b-instruct:free', run: async () => requestOpenRouter('mistralai/mistral-7b-instruct:free') },
    { model: 'google/gemma-2-9b-it:free', run: async () => requestOpenRouter('google/gemma-2-9b-it:free') },
    { model: 'meta-llama/llama-3.1-8b-instruct:free', run: async () => requestOpenRouter('meta-llama/llama-3.1-8b-instruct:free') },
    { model: 'llama-3.1-8b-instant', run: async () => requestGroq('llama-3.1-8b-instant') },
    { model: 'openai/gpt-oss-20b', run: async () => requestGroq('openai/gpt-oss-20b') },
  ];

  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
  for (const provider of providers) {
    try {
      onStatus(buildStoryAttemptLine(contentLang, 'start', provider.model));
      const text = await Promise.race([provider.run(), timeout(15000)]);
      if (text && text.length > 50) {
        onStatus(buildStoryAttemptLine(contentLang, 'success', provider.model));
        addLog('info', contentLang === 'de' ? 'KI OK' : 'AI OK', text.slice(0, 40));
        return text;
      }
    } catch (error) {
      const detail = error.message === 'timeout'
        ? (contentLang === 'de' ? 'zu langsam' : 'too slow')
        : error.message === 'groq:no-key'
          ? (contentLang === 'de' ? 'kein Key' : 'no key')
          : (contentLang === 'de' ? 'keine Lust' : 'not in the mood');
      onStatus(buildStoryAttemptLine(contentLang, 'fail', provider.model, detail));
      addLog('warn', contentLang === 'de' ? 'KI-API fail' : 'AI API fail', error.message);
    }
  }
  return null;
}

export async function generateLocalStory({ contentLang, genreId, words, minChars, difficulty }, onStatus = () => {}) {
  onStatus(buildStoryAttemptLine(contentLang, 'start', 'local-fallback'));
  let text = '';
  try {
    text = buildBackupStory({ lang: contentLang, genreId, words, minChars, difficulty, salt: `${genreId}:${difficulty}:${words.join('|')}` });
  } catch {
    const repeatedWords = words.map((word) => `**${word}**`).join(', ');
    text = contentLang === 'de'
      ? `Die Runde begann ganz harmlos, doch schnell wurde klar, dass ${repeatedWords} heute wichtiger waren als allen lieb sein konnte. Erst tauchten ${repeatedWords} in einer scheinbar normalen Szene auf, dann wurden ${repeatedWords} noch einmal erwähnt, diesmal deutlich verdächtiger. Niemand wollte zu viel reagieren, doch genau dieses Bemühen machte alles nur noch lustiger. Am Ende wirkte die Geschichte wie ein harmloser Vorfall mit sehr auffälligen Gesichtern und noch auffälligeren Pausen.`
      : `The round started harmlessly enough, but it quickly became clear that ${repeatedWords} mattered far more than anyone wanted. First ${repeatedWords} appeared in what seemed like a normal scene, then ${repeatedWords} showed up again in a much more suspicious way. Nobody wanted to react too visibly, and that effort only made the whole thing funnier. By the end, the story felt like a simple event surrounded by very noticeable faces and even more noticeable pauses.`;
  }
  onStatus(buildStoryAttemptLine(contentLang, 'success', 'local-fallback'));
  return text;
}
