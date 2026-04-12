import { useState, useEffect, useRef } from "react";

const BLUE_WORDS = [
  "Auto","Katze","Pizza","Schule","Urlaub","Handy","Regen","Geburtstag","Chef","Kaffee",
  "Polizei","Internet","Garten","Fussball","Zug","Krankenhaus","Party","Nachbar","Schatz","Computer",
  "Arzt","Supermarkt","Hotel","Strand","Wald","Feuer","Wasser","Film","Musik","Lehrer",
  "Geschenk","Hund","Eis","Spielplatz","Familie","Arbeit","Meeting","Chaos","Schloss","Rakete",
  "Kuehlschrank","Fahrrad","Bruecke","Balkon","Schluessel","Teppich","Fenster","Treppe","Aufzug","Sushi",
  "Burger","Nudeln","Kuchen","Brot","Kaese","Bier","Wein","Tee","Smoothie","Pommes",
  "Salat","Steak","Schokolade","Chips","Ananas","Erdbeere","Honig","Blitz","Schnee","Nebel",
  "Sturm","Regenbogen","Vollmond","Baum","Rose","Pilz","Schmetterling","Adler","Wolf","Baer",
  "Fuchs","Podcast","Passwort","Selfie","Roboter","Drohne","KI","Detektiv","Heldin","Schurke",
  "Guru","Kapitaen","Flughafen","Bahnhof","Museum","Bibliothek","Bunker","Tempel","Palast","Insel",
  "Panik","Eifersucht","Euphorie","Heimweh","Albtraum","Stille","Koffer","Kompass","Tagebuch","Spiegel",
  "Kerze","Brief","Maske","Uhr","Loewe","Pinguin","Kaktus","Vulkan","Geist","Einhorn",
  "Schere","Luftballon","Bumerang","Laterne","Tretboot","Thermoskanne","Regenschirm","Fernglas","Zauberstab","Schnorchel"
];

const RED_ACTIONS = [
  "Zwinkere","Kratz dich an der Nase","Raeuspere dich","Schau auf den Boden","Strecke dich",
  "Richte deine Haare","Klopf auf den Tisch","Verschraenke die Arme","Lehne dich zurueck","Seufze leise",
  "Beiss dir auf die Lippe","Reib dir die Haende","Zucke mit den Schultern","Schnippe mit den Fingern",
  "Lache ploetzlich laut","Sag: Interessant...","Klatsche in die Haende","Sag: Ach wirklich?!",
  "Mach ein ueberraschtes Gesicht","Steh halb auf und setz dich wieder",
  "Tipp jemanden an","Mach ein Foto","Spring auf: HEUREKA!","Wiederhole das letzte Wort",
  "Unterbrech mit Hmm!","Tu so als suchst du etwas","Starre jemanden 3 Sek an",
  "Laechle voellig unpassend","Schau zur Decke und nicke","Reagiere zu spaet","Reagiere zu frueh",
  "Nicke bei jedem Wort","Halte den Atem an","Zeig auf jemand anderen","Sing eine kurze Note","Fake-Gaehne",
  "Klatsch dir auf die Stirn","Fang an leise vor dich hin zu summen",
  "Stell dir vor du hoerst schlecht und frag nach",
  "Tu so als haette dich jemand gerade getreten",
  "Mach eine dramatische Pause und schau in die Runde",
  "Sag: Das kenn ich und nicke wissend",
  "Fang an deine Fingernaegel zu untersuchen",
  "Schreib etwas Imaginaeres auf",
  "Tue so als wuerdest du heimlich SMSen",
  "Sag: Moment mal... und schau nachdenklich",
  "Streich dir langsam ueber den Bart auch wenn du keinen hast",
  "Ruf: Bingo! und bereue es sofort",
  "Klopf einen Rhythmus auf deinen Schenkel",
  "Sag: Interessant, weiter... und lehn dich vor",
  "Tue so als wuerdest du eine Fliege verscheuchen",
  "Huste einmal auffaellig",
  "Rieche kurz an deiner Schulter",
  "Sag: Na sowas! mit breitem Grinsen",
  "Rutsch einmal komplett auf deinem Stuhl rum",
  "Mach ein Peace-Zeichen ohne Erklaerung",
  "Klapp einen imaginaeren Laptop zu",
  "Sag deinen Namen rueckwaerts",
  "Heb kurz die Hand als waerst du in der Schule",
  "Zieh eine imaginaere Krawatte gerade",
  "Tu so als haettest du etwas Wichtiges vergessen",
  "Schau dramatisch auf deine Uhr",
  "Steh auf hol tief Luft und setz dich wieder",
  "Klatsch dir beide Haende auf die Wangen wie Kevin",
  "Sag: Wusste ich es doch! und klopf auf den Tisch",
  "Tu so als wuerdest du etwas aus der Luft greifen",
  "Fluester deinem Nachbarn etwas Unverstaendliches ins Ohr",
  "Heb beide Daumen hoch ohne Erklaerung",
  "Sag: Ich sage nur... und schweige danach",
  "Schau betroffen zur Seite als haettest du was gesehen"
];

const GENRES = [
  { id: "alltag",  label: "Alltag",  emoji: "🏠", desc: "Supermarkt, Buero, Nachbarschaft" },
  { id: "urlaub",  label: "Urlaub",  emoji: "✈️", desc: "Strand, Hotel, Abenteuer" },
  { id: "party",   label: "Party",   emoji: "🎉", desc: "Feiern, Freunde, Chaos" },
  { id: "arbeit",  label: "Arbeit",  emoji: "💼", desc: "Meeting, Chef, Kantine" },
  { id: "natur",   label: "Natur",   emoji: "🌲", desc: "Wald, Tiere, Abenteuer" },
  { id: "zukunft", label: "Zukunft", emoji: "🚀", desc: "KI, Roboter, Raumfahrt" },
  { id: "krimi",   label: "Krimi",   emoji: "🔍", desc: "Detektiv, Verdacht, Spannung" },
  { id: "random",  label: "Zufall",  emoji: "🎲", desc: "Komplett ueberraschend" },
];

const FF = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const C = {
  bg: "#0d0d14", sur: "#16161f", sur2: "#1e1e2a", bdr: "#2a2a3a",
  blue: "#60a5fa", bluel: "#bfdbfe", red: "#f87171", redl: "#fecaca",
  gold: "#fbbf24", txt: "#f0f0f5", muted: "#9090a8",
};

const G = `
  *{box-sizing:border-box;}
  body{background:${C.bg};color:${C.txt};font-family:${FF};}
  button{font-family:${FF};}
  *:focus-visible{outline:3px solid #fff!important;outline-offset:2px!important;border-radius:4px;}
  *:focus:not(:focus-visible){outline:none!important;}
  @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
  input::placeholder{color:${C.muted};}
`;

const CARD = { background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 18, marginBottom: 12 };
const STITLE = { fontSize: 16, fontWeight: 700, color: C.txt, display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontFamily: FF };
const BTEXT = { fontSize: 14, lineHeight: 1.7, color: C.muted };
const SR = { position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" };

// Live region hook
function useLive() {
  const ref = useRef(null);
  const announce = (msg) => { if (ref.current) ref.current.textContent = msg; };
  const node = <div ref={ref} aria-live="polite" aria-atomic="true" style={SR} />;
  return [node, announce];
}

// ===== RULES =====
function Rules() {
  return (
    <section aria-labelledby="h-rules">
      <div style={CARD}>
        <h2 id="h-rules" style={STITLE}>📋 Spielregeln</h2>
        <p style={BTEXT}>Ein Spieler liest eine KI-Geschichte vor. Die anderen haben geheime Woerter und Aktionen. Sobald ihr Wort faellt, muessen sie reagieren. Der Erzaehler beobachtet und raet danach: wer hatte welches Wort?</p>
      </div>
      <div style={CARD}>
        <h3 style={STITLE}>Ablauf</h3>
        <ol style={{ paddingLeft: 0, listStyle: "none" }}>
          {["Spieler anlegen im Spieler-Tab","Karten austeilen – jeder zieht Wort und Aktion geheim","Jeder Spieler kann einmal neu ziehen falls gewuenscht","Story-Tab: Genre waehlen und Geschichte generieren","Erzaehler liest vor – sieht die Woerter NICHT","Mitspieler reagieren heimlich bei ihrem Wort","Erzaehler raet wer welches Wort hatte","Aufdecken und Punkte vergeben"].map((t, i) => (
            <li key={t} style={{ fontSize: 14, lineHeight: 1.9, color: C.muted, display: "flex", gap: 10 }}>
              <span style={{ color: C.blue, fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>{t}
            </li>
          ))}
        </ol>
      </div>
      <div style={CARD}>
        <h3 style={STITLE}>🏆 Punkte</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          {[["Erzaehler", "+1", "pro richtig erratenem Wort"], ["Erratener", "+1", "fuer seine rote Karte"]].map(([l, v, d]) => (
            <div key={l} style={{ background: C.sur2, borderRadius: 8, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: C.gold, margin: "4px 0" }}>{v}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={CARD}>
        <h3 style={STITLE}>🔥 Bonus-Modi</h3>
        {[["Profi-Modus","Erzaehler muss Woerter exakt zuordnen. Falsch = 0 Punkte."],["Chaos-Modus","2 Woerter, 1 Aktion. Absolute Eskalation!"],["Theater-Modus","Aktionen kombinieren. Publikum bewertet die beste Performance."]].map(([t, d]) => (
          <div key={t} style={{ background: C.sur2, borderRadius: 8, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 4 }}>{t}</div>
            <p style={BTEXT}>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== CARDS =====
function Cards({ onDeal }) {
  const [count, setCount] = useState(3);
  const [dealt, setDealt] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [liveNode, announce] = useLive();

  function deal() {
    const words = shuffle(BLUE_WORDS).slice(0, count);
    const actions = shuffle(RED_ACTIONS).slice(0, count);
    const newDealt = words.map((w, i) => ({ word: w, action: actions[i], rerolled: false }));
    setDealt(newDealt);
    setRevealed({});
    if (onDeal) onDeal(words);
    announce(`Karten fuer ${count} Spieler ausgeteilt.`);
  }

  function reroll(i) {
    const usedWords = dealt.map((d, idx) => idx !== i ? d.word : "");
    const usedActions = dealt.map((d, idx) => idx !== i ? d.action : "");
    const freeW = shuffle(BLUE_WORDS.filter(w => !usedWords.includes(w)));
    const freeA = shuffle(RED_ACTIONS.filter(a => !usedActions.includes(a)));
    const updated = dealt.map((d, idx) =>
      idx === i ? { word: freeW[0] || d.word, action: freeA[0] || d.action, rerolled: true } : d
    );
    setDealt(updated);
    setRevealed(r => { const n = {...r}; delete n[`w${i}`]; delete n[`a${i}`]; return n; });
    if (onDeal) onDeal(updated.map(d => d.word));
    announce(`Spieler ${i + 1} hat neue Karten gezogen.`);
  }

  function toggle(key, label) {
    setRevealed(r => {
      const next = { ...r, [key]: !r[key] };
      announce(next[key] ? `${label} aufgedeckt.` : `Verborgen.`);
      return next;
    });
  }

  return (
    <section aria-labelledby="h-cards">
      {liveNode}
      <h2 id="h-cards" style={{ ...STITLE, marginBottom: 14 }}>🎴 Karten ziehen</h2>
      <div style={{ ...CARD, marginBottom: 12 }}>
        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10, display: "block" }}>Anzahl Mitspieler</legend>
          <div style={{ display: "flex", gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setCount(n)} aria-pressed={count === n} aria-label={`${n} Mitspieler`}
                style={{ flex: 1, background: count === n ? "#1a2a4a" : C.sur2, border: `2px solid ${count === n ? C.blue : C.bdr}`, color: count === n ? C.bluel : C.muted, fontSize: 20, fontWeight: 700, padding: "8px 0", borderRadius: 6, cursor: "pointer", transition: "all .15s" }}>
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button onClick={deal} aria-label={`Karten fuer ${count} Mitspieler austeilen`}
        style={{ width: "100%", padding: 13, borderRadius: 8, fontSize: 15, fontWeight: 700, letterSpacing: .5, border: `2px solid ${C.blue}`, background: "rgba(96,165,250,.1)", color: C.bluel, cursor: "pointer", marginBottom: 16, display: "block", transition: "all .15s" }}>
        Karten austeilen
      </button>

      {dealt.map((p, i) => (
        <div key={i} style={{ background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Spieler {i + 1}</span>
            <button onClick={() => !p.rerolled && reroll(i)} disabled={p.rerolled}
              aria-label={p.rerolled ? `Spieler ${i+1} hat bereits neu gezogen` : `Spieler ${i+1} neu ziehen`}
              style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 10, cursor: p.rerolled ? "not-allowed" : "pointer", border: `1px solid ${p.rerolled ? C.bdr : "rgba(251,191,36,.4)"}`, background: p.rerolled ? "rgba(90,90,110,.2)" : "rgba(251,191,36,.12)", color: p.rerolled ? C.muted : C.gold, transition: "all .15s" }}>
              {p.rerolled ? "bereits neu gezogen" : "1x neu ziehen"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[{ key: `w${i}`, typ: "Geheimwort", val: p.word, blue: true }, { key: `a${i}`, typ: "Geheime Aktion", val: p.action, blue: false }].map((cell, ci) => {
              const rv = !!revealed[cell.key];
              return (
                <button key={cell.key} onClick={() => toggle(cell.key, cell.typ)}
                  aria-label={rv ? `${cell.typ}: ${cell.val}. Tippen zum Verbergen.` : `${cell.typ} verborgen. Tippen zum Aufdecken.`}
                  aria-expanded={rv}
                  style={{ padding: 14, cursor: "pointer", minHeight: 88, textAlign: "left", background: "transparent", border: "none", borderRight: ci === 0 ? `1px solid ${C.bdr}` : "none", display: "block", width: "100%", transition: "background .15s" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: cell.blue ? C.blue : C.red }}>
                    <span aria-hidden="true">{cell.blue ? "🔵" : "🔴"} </span>{cell.typ}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4, color: cell.blue ? C.bluel : C.redl, filter: rv ? "none" : "blur(7px)", transition: "filter .25s", userSelect: rv ? "auto" : "none" }} aria-hidden={!rv}>
                    {cell.val}
                  </div>
                  {!rv && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>Tippen zum Aufdecken</div>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

// ===== PLAYERS =====
function Players() {
  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState("");
  const [liveNode, announce] = useLive();

  function addPlayer() {
    const n = newName.trim();
    if (!n) return;
    setPlayers(p => [...p, { name: n, score: 0 }]);
    setNewName("");
    announce(`${n} hinzugefuegt.`);
  }
  function changeScore(i, d) {
    setPlayers(p => p.map((x, idx) => {
      if (idx !== i) return x;
      const sc = Math.max(0, x.score + d);
      announce(`${x.name}: ${sc} Punkte.`);
      return { ...x, score: sc };
    }));
  }
  function removePlayer(i) {
    announce(`${players[i].name} entfernt.`);
    setPlayers(p => p.filter((_, idx) => idx !== i));
  }

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <section aria-labelledby="h-players">
      {liveNode}
      <h2 id="h-players" style={{ ...STITLE, marginBottom: 14 }}>👥 Spieler &amp; Punkte</h2>
      <div style={CARD}>
        {players.length === 0 && (
          <p style={{ ...BTEXT, textAlign: "center", padding: "10px 0" }}>Noch keine Spieler – unten hinzufuegen</p>
        )}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label="Spielerliste">
          {players.map((p, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: C.sur2, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{p.name}</span>
              <button onClick={() => changeScore(i, -1)} aria-label={`${p.name} minus 1`}
                style={{ background: C.bdr, border: "none", color: C.txt, width: 34, height: 34, borderRadius: 6, fontSize: 20, fontWeight: 700, cursor: "pointer" }}>-</button>
              <span style={{ fontSize: 26, fontWeight: 800, color: C.gold, minWidth: 38, textAlign: "center" }} aria-live="polite">{p.score}</span>
              <button onClick={() => changeScore(i, +1)} aria-label={`${p.name} plus 1`}
                style={{ background: C.bdr, border: "none", color: C.txt, width: 34, height: 34, borderRadius: 6, fontSize: 20, fontWeight: 700, cursor: "pointer" }}>+</button>
              <button onClick={() => removePlayer(i)} aria-label={`${p.name} entfernen`}
                style={{ background: "transparent", border: "none", color: C.muted, fontSize: 16, padding: "0 4px", cursor: "pointer" }}>✕</button>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 8, marginTop: players.length > 0 ? 10 : 0 }}>
          <label htmlFor="pinput" style={SR}>Spielername</label>
          <input id="pinput" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addPlayer()}
            placeholder="Name eingeben..." maxLength={20} autoComplete="off"
            style={{ flex: 1, background: C.sur2, border: `1.5px solid ${C.bdr}`, color: C.txt, fontFamily: FF, fontSize: 14, padding: "10px 14px", borderRadius: 8, outline: "none" }} />
          <button onClick={addPlayer} aria-label="Spieler hinzufuegen"
            style={{ background: C.sur, border: `1.5px solid ${C.bdr}`, color: C.muted, fontSize: 22, padding: "0 16px", borderRadius: 8, cursor: "pointer", transition: "all .15s" }}>+</button>
        </div>
      </div>

      {players.length > 0 && (
        <div style={{ ...CARD, borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.05)" }} aria-live="polite">
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.gold, marginBottom: 10 }}>Rangliste</div>
          {sorted.map((p, i) => (
            <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: i < sorted.length - 1 ? `1px solid ${C.bdr}` : "none" }}>
              <span style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.txt : C.muted }}>{i === 0 ? "🥇 " : i === 1 ? "🥈 " : i === 2 ? "🥉 " : `${i+1}. `}{p.name}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.gold }}>{p.score} Pkt</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ===== REVEAL =====
function RevealWords({ words, story, renderStory }) {
  const [revealed, setRevealed] = useState(false);
  const ref = useRef(null);
  function reveal() { setRevealed(true); setTimeout(() => ref.current?.focus(), 100); }
  return (
    <div style={{ background: "rgba(248,113,113,.05)", border: "1.5px solid rgba(248,113,113,.3)", borderRadius: 10, padding: 18 }} role="region" aria-label="Aufloesung">
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.red, marginBottom: 12 }}>Aufloesen – erst nach dem Raten!</div>
      {!revealed ? (
        <button onClick={reveal} aria-label="Woerter aufdecken"
          style={{ width: "100%", padding: 13, borderRadius: 8, fontSize: 15, fontWeight: 700, letterSpacing: .5, border: `2px solid ${C.red}`, background: "rgba(248,113,113,.08)", color: C.redl, cursor: "pointer", display: "block" }}>
          Woerter aufdecken
        </button>
      ) : (
        <div ref={ref} tabIndex={-1}>
          <div style={{ fontSize: 16, lineHeight: 2.1, color: C.txt, marginBottom: 16 }} aria-live="polite">{renderStory(story)}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 12, borderTop: `1px solid ${C.bdr}` }}>
            {words.map(w => (
              <span key={w} style={{ fontSize: 12, fontWeight: 600, color: C.gold, background: "rgba(251,191,36,.1)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(251,191,36,.3)" }}>{w}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== STORY =====
function StoryTab({ dealtWords }) {
  const [genre, setGenre] = useState(null);
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState([]);
  const [revStory, setRevStory] = useState(false);
  const storyRef = useRef(null);
  const [liveNode, announce] = useLive();

  async function generateStory() {
    if (!genre) return;
    setLoading(true); setError(""); setStory(""); setRevStory(false);
    announce("Geschichte wird generiert.");
    const wordList = dealtWords?.length > 0 ? dealtWords : shuffle(BLUE_WORDS).slice(0, 3);
    setWords(wordList);
    const sel = genre === "random"
      ? GENRES[Math.floor(Math.random() * (GENRES.length - 1))].label
      : GENRES.find(g => g.id === genre).label;
    const prompt = `Schreibe eine kurze witzige Geschichte auf Deutsch im Stil "${sel}". 8-12 Saetze. Diese Woerter NATUERLICH einbauen: ${wordList.join(", ")}. Jedes dieser Woerter mit **Wort** markieren. NUR die Geschichte, kein Titel. Locker lustig zum Vorlesen bei einer Party.`;
    let text = "";
    try { text = await callPollinations(prompt); } catch {}
    if (!text) { try { text = await callOpenRouter(prompt); } catch {} }
    if (!text) {
      setError("KI gerade nicht erreichbar. Kurz warten und nochmal versuchen.");
      announce("Fehler aufgetreten.");
    } else {
      setStory(text);
      announce("Geschichte fertig! Jetzt vorlesen.");
      setTimeout(() => storyRef.current?.focus(), 100);
    }
    setLoading(false);
  }

  async function callOpenRouter(prompt) {
    // OpenRouter free tier - no account needed for free models
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HTTP-Referer": "https://storychaos-the-game.vercel.app",
        "X-Title": "Story Chaos"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }]
      })
    });
    if (!res.ok) throw new Error("openrouter failed");
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("empty");
    return text;
  }

  async function callPollinations(prompt) {
    // Pollinations.ai - completely free, no key needed
    const res = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: "Du bist ein kreativer Geschichtenerzaehler auf Deutsch." },
          { role: "user", content: prompt }
        ],
        seed: Math.floor(Math.random() * 99999)
      })
    });
    if (!res.ok) throw new Error("pollinations failed");
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("empty");
    return text;
  }

  function renderStory(text) {
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: C.gold, fontWeight: 700, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{part}</strong>
        : part
    );
  }

  return (
    <section aria-labelledby="h-story">
      {liveNode}
      <h2 id="h-story" style={{ ...STITLE, marginBottom: 14 }}>✨ KI-Geschichte</h2>

      <div style={CARD}>
        <p style={BTEXT}>Waehle ein Thema. Die KI schreibt eine Geschichte mit den Woertern der Mitspieler. Der Erzaehler liest laut vor – ohne die Woerter zu kennen – und beobachtet alle Reaktionen. Danach raet er: wer hatte welches Wort?</p>
      </div>

      {!dealtWords?.length && (
        <div style={{ ...CARD, borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.05)" }}>
          <p style={{ ...BTEXT, color: C.gold }}>Zuerst im Karten-Tab Karten austeilen – dann hier Geschichte generieren.</p>
        </div>
      )}

      <fieldset style={{ border: "none", margin: "0 0 14px", padding: 0 }}>
        <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10, display: "block" }}>Thema waehlen</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setGenre(g.id)} aria-pressed={genre === g.id} aria-label={`${g.label}: ${g.desc}`}
              style={{ background: genre === g.id ? "rgba(251,191,36,.08)" : C.sur, border: `2px solid ${genre === g.id ? C.gold : C.bdr}`, borderRadius: 8, padding: "12px", cursor: "pointer", textAlign: "left", gridColumn: g.id === "random" ? "span 2" : "span 1", transition: "all .15s", display: "block" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }} aria-hidden="true">{g.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: genre === g.id ? C.gold : C.txt }}>{g.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{g.desc}</div>
            </button>
          ))}
        </div>
      </fieldset>

      <button onClick={generateStory} disabled={!genre || loading} aria-label={genre ? `Geschichte generieren` : "Bitte zuerst ein Thema auswaehlen"}
        style={{ width: "100%", padding: 13, borderRadius: 8, fontSize: 15, fontWeight: 700, letterSpacing: .5, border: `2px solid ${genre ? C.gold : C.bdr}`, background: genre ? "rgba(251,191,36,.08)" : C.sur, color: genre ? C.gold : C.muted, cursor: genre ? "pointer" : "not-allowed", marginBottom: 16, display: "block", opacity: loading ? 0.7 : 1, transition: "all .15s" }}>
        {loading ? "Wird geschrieben..." : "Geschichte generieren"}
      </button>

      {loading && (
        <div role="status" aria-label="Wird generiert" style={{ textAlign: "center", padding: 28 }}>
          <div style={{ fontSize: 30, display: "inline-block", animation: "spin 1.5s linear infinite" }} aria-hidden="true">✍️</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 10 }}>KI schreibt gerade...</div>
        </div>
      )}

      {error && (
        <div role="alert" style={{ background: "rgba(248,113,113,.07)", border: "1px solid rgba(248,113,113,.35)", borderRadius: 8, padding: 14, marginBottom: 12 }}>
          <p style={{ ...BTEXT, color: C.redl }}>{error}</p>
        </div>
      )}

      {story && !loading && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <div style={{ background: C.sur, border: "1.5px solid rgba(251,191,36,.35)", borderRadius: 10, padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: C.gold }}>Jetzt vorlesen!</span>
              <button onClick={generateStory} aria-label="Neue Geschichte generieren"
                style={{ background: "transparent", border: `1px solid ${C.bdr}`, color: C.muted, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, cursor: "pointer" }}>
                Neu generieren ↻
              </button>
            </div>
            <p style={{ ...BTEXT, marginBottom: 14, fontStyle: "italic" }}>Woerter sind versteckt – beobachte wer wann reagiert, dann rate!</p>
            <div ref={storyRef} tabIndex={-1} style={{ fontSize: 16, lineHeight: 2.1, color: C.txt }} aria-label="Vorlesetext">
              {story.replace(/\*\*(.*?)\*\*/g, "$1")}
            </div>
          </div>
          <RevealWords words={words} renderStory={renderStory} story={story} />
        </div>
      )}
    </section>
  );
}

// ===== TIMER =====
function TimerTab() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef(null);
  const doneRef = useRef(null);
  const [liveNode, announce] = useLive();

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r === 10) announce("10 Sekunden!");
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false); setDone(true);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          setTimeout(() => doneRef.current?.focus(), 100);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function changeDuration(d) { setDuration(d); if (!running) { setRemaining(d); setDone(false); } }
  function toggle() { if (done) return; const next = !running; announce(next ? "Timer gestartet." : "Pausiert."); setRunning(next); }
  function reset() { clearInterval(intervalRef.current); setRunning(false); setRemaining(duration); setDone(false); announce("Zurueckgesetzt."); }

  const ratio = remaining / duration;
  const offset = 565 * (1 - ratio);
  const strokeColor = ratio > 0.5 ? C.blue : ratio > 0.25 ? C.gold : C.red;
  const numColor = remaining <= 10 ? C.red : remaining <= 20 ? C.gold : C.txt;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0 ? `${mins}:${String(secs).padStart(2, "0")}` : String(remaining);

  return (
    <section aria-labelledby="h-timer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {liveNode}
      <h2 id="h-timer" style={{ ...STITLE, width: "100%", marginBottom: 0 }}>⏱ Timer</h2>

      <fieldset style={{ border: "none", margin: 0, padding: 0, width: "100%" }}>
        <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 8, display: "block" }}>Dauer waehlen</legend>
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 90, 120, 180].map(d => (
            <button key={d} onClick={() => changeDuration(d)} aria-pressed={duration === d} aria-label={`${d} Sekunden`}
              style={{ flex: 1, background: duration === d ? "rgba(248,113,113,.1)" : C.sur, border: `2px solid ${duration === d ? C.red : C.bdr}`, color: duration === d ? C.redl : C.muted, fontSize: 14, fontWeight: 600, padding: "10px 0", borderRadius: 6, cursor: "pointer", transition: "all .15s" }}>
              {d >= 60 ? `${d / 60} min` : `${d}s`}
            </button>
          ))}
        </div>
      </fieldset>

      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.bdr} strokeWidth="10" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={strokeColor} strokeWidth="10"
            strokeLinecap="round" strokeDasharray="565" strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          role="timer" aria-label={`${remaining} Sekunden verbleibend`}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: numColor }} aria-hidden="true">{display}</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginTop: 2 }} aria-hidden="true">
            {mins > 0 ? "min : sek" : "Sekunden"}
          </div>
        </div>
      </div>

      {done && (
        <div ref={doneRef} tabIndex={-1} role="alert"
          style={{ width: "100%", background: "linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.12))", border: "1.5px solid rgba(248,113,113,.4)", borderRadius: 10, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, color: C.redl, textTransform: "uppercase" }}>Zeit ist um!</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>Jetzt Ratephase starten</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={toggle} disabled={done} aria-label={running ? "Pausieren" : "Starten"} aria-pressed={running}
          style={{ flex: 1, padding: 14, borderRadius: 8, fontSize: 17, fontWeight: 700, letterSpacing: 1, border: `2px solid ${C.red}`, background: "rgba(248,113,113,.1)", color: C.redl, cursor: done ? "not-allowed" : "pointer", opacity: done ? 0.4 : 1, transition: "all .15s" }}>
          {running ? "PAUSE" : "START"}
        </button>
        <button onClick={reset} aria-label="Zuruecksetzen"
          style={{ flex: 1, padding: 14, borderRadius: 8, fontSize: 17, fontWeight: 700, letterSpacing: 1, border: `2px solid ${C.bdr}`, background: C.sur, color: C.muted, cursor: "pointer", transition: "all .15s" }}>
          RESET
        </button>
      </div>
    </section>
  );
}

// ===== APP =====
const TABS = [
  { id: "rules",   icon: "📋", label: "Regeln"  },
  { id: "cards",   icon: "🎴", label: "Karten"  },
  { id: "players", icon: "👥", label: "Spieler" },
  { id: "story",   icon: "✨", label: "Story"   },
  { id: "timer",   icon: "⏱",  label: "Timer"   },
];

export default function App() {
  const [tab, setTab] = useState("rules");
  const [dealtWords, setDealtWords] = useState([]);
  const mainRef = useRef(null);

  function switchTab(id) { setTab(id); setTimeout(() => mainRef.current?.focus(), 50); }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.txt, fontFamily: FF }}>
      <style>{G}</style>
      <a href="#main" style={{ position: "fixed", top: -60, left: 8, zIndex: 9999, background: "#fff", color: "#000", padding: "10px 18px", borderRadius: 6, fontWeight: 700, fontSize: 14, textDecoration: "none", transition: "top .2s" }}
        onFocus={e => e.currentTarget.style.top = "8px"} onBlur={e => e.currentTarget.style.top = "-60px"}>
        Zum Hauptinhalt springen
      </a>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 16px 80px" }}>
        <header style={{ textAlign: "center", padding: "24px 0 12px" }}>
          <h1 style={{ fontSize: "clamp(36px,10vw,56px)", fontWeight: 800, letterSpacing: -1, textTransform: "uppercase", background: "linear-gradient(135deg,#f87171,#fbbf24 50%,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 1, margin: 0 }}>
            Story Chaos
          </h1>
          <p style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginTop: 5 }}>Das Partyspiel gegen den Erzaehler</p>
        </header>

        <nav aria-label="Spielbereiche">
          <div role="tablist" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, margin: "12px 0 16px" }}>
            {TABS.map(t => (
              <button key={t.id} role="tab" onClick={() => switchTab(t.id)} aria-selected={tab === t.id} aria-label={t.label}
                style={{ background: tab === t.id ? "#1a1a2e" : C.sur, border: `1.5px solid ${tab === t.id ? C.blue : C.bdr}`, color: tab === t.id ? C.bluel : C.muted, fontSize: 10, fontWeight: 600, letterSpacing: .5, padding: "9px 2px 7px", borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", transition: "all .15s" }}>
                <span style={{ fontSize: 15 }} aria-hidden="true">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <main id="main" ref={mainRef} tabIndex={-1} aria-label={TABS.find(t => t.id === tab)?.label} style={{ outline: "none" }}>
          {tab === "rules"   && <Rules />}
          {tab === "cards"   && <Cards onDeal={setDealtWords} />}
          {tab === "players" && <Players />}
          {tab === "story"   && <StoryTab dealtWords={dealtWords} />}
          {tab === "timer"   && <TimerTab />}
        </main>

        <footer style={{ textAlign: "center", padding: "20px 0 8px" }}>
          <p style={{ fontSize: 10, color: "#4a5a6a", letterSpacing: 1.5, textTransform: "uppercase" }}>Story Chaos · Party Game · 2–6 Spieler</p>
        </footer>
      </div>
    </div>
  );
}
