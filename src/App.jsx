import { useState, useEffect, useRef } from "react";

const BLUE_WORDS = [
  "Auto","Katze","Pizza","Schule","Urlaub","Handy","Regen","Geburtstag","Chef","Kaffee",
  "Polizei","Internet","Garten","Fussball","Zug","Krankenhaus","Party","Nachbar","Schatz","Computer",
  "Arzt","Supermarkt","Hotel","Strand","Wald","Feuer","Wasser","Film","Musik","Lehrer",
  "Geschenk","Hund","Eis","Spielplatz","Familie","Arbeit","Meeting","Chaos","Schloss","Rakete",
  "Kuehlschrank","Fahrrad","Bruecke","Balkon","Schluessel","Briefkasten","Waschmaschine","Teppich","Fenster","Treppe",
  "Bushaltestelle","Parkplatz","Aufzug","Klingel","Muelltonne","Fernbedienung","Steckdose","Gluehbirne","Vorhang","Tuerklinke",
  "Sushi","Burger","Nudeln","Kuchen","Brot","Kaese","Bier","Wein","Tee","Smoothie",
  "Pommes","Salat","Steak","Schokolade","Chips","Wassermelone","Ananas","Erdbeere","Marmelade","Honig",
  "Blitz","Schnee","Nebel","Sturm","Regenbogen","Sonnenuntergang","Vollmond","Tornado","Lawine","Duerre",
  "Baum","Rose","Pilz","Schmetterling","Spinne","Adler","Hai","Wolf","Baer","Fuchs",
  "Algorithmus","Podcast","Streaming","Passwort","Update","Selfie","Meme","Emoji","Darkmode","WLAN",
  "Roboter","Drohne","Satellit","Hologramm","Chip","Akku","Ladestation","Smartwatch","VR-Brille","KI",
  "Freundin","Opa","Baby","Zwilling","Fremder","Detektiv","Heldin","Schurke","Guru","Legende",
  "Influencer","Therapeut","Rentner","Azubi","Praktikant","Kapitaen","Pilot","Koch","Moderator","Zeuge",
  "Flughafen","Bahnhof","Museum","Bibliothek","Fabrik","Friedhof","Bunker","Leuchtturm","Tempel","Palast",
  "Gefaengnis","Marktplatz","Dachterrasse","Tiefgarage","Hoehle","Insel","Wueste","Dschungel","Gletscher","Kaserne",
  "Panik","Langeweile","Eifersucht","Euphorie","Heimweh","Albtraum","Schwindel","Gaensehaut","Stille","Neugier",
  "Koffer","Kompass","Teleskop","Kalender","Tagebuch","Spiegel","Kerze","Muenze","Brief","Maske",
  "Wuerfel","Karte","Uhr","Lupe","Kette","Ring","Messer","Flasche","Schachtel","Schluesselband"
];

const RED_ACTIONS = [
  "Zwinkere \uD83D\uDE09",
  "Kratz dich an der Nase",
  "Raeuspere dich",
  "Schau kurz auf den Boden",
  "Strecke dich",
  "Richte deine Haare",
  "Klopf einmal auf den Tisch",
  "Verschraenke die Arme",
  "Lehne dich zurueck",
  "Seufze leise",
  "Beiss dir kurz auf die Lippe",
  "Reib dir die Haende",
  "Schau auf deine Naegel",
  "Zucke mit den Schultern",
  "Schnippe mit den Fingern",
  "Lache ploetzlich laut \uD83D\uDE02",
  "Sag: Interessant...",
  "Klatsche einmal in die Haende",
  "Sag: Ach wirklich?!",
  "Mach ein ueberraschtes Gesicht \uD83D\uDE2E",
  "Sag: Warte mal kurz",
  "Steh halb auf und setz dich wieder",
  "Tipp jemanden an",
  "Sag: Na ja... und schuettle den Kopf",
  "Mach ein Foto (oder tu so als ob)",
  "Ruf: Stimmt! in die Runde",
  "Sag laut: Okay okay okay",
  "Klopf dir auf die Stirn",
  "Wedel mit der Hand",
  "Stoehn dramatisch auf",
  "Spring auf und ruf: HEUREKA! \uD83C\uDF89",
  "Wiederhole das letzte Wort",
  "Unterbrech mit: Hmm!",
  "Tu so als suchst du etwas",
  "Fluestere etwas Unverstaendliches",
  "Zaehl lautlos auf den Fingern",
  "Klapp ein imaginaeres Buch zu",
  "Mach eine Vogel-Geste zur Stirn",
  "Steh auf geh einen Schritt setz dich wieder",
  "Ruf: Das ist doch nicht dein Ernst!",
  "Sag deinen eigenen Namen laut",
  "Sing eine kurze Note",
  "Fake-Niese",
  "Fake-Gaehne uebertrieben",
  "Klopf rhythmisch auf deinen Oberschenkel",
  "Starre jemanden 3 Sek an \uD83D\uDC40",
  "Laechle voellig unpassend \uD83D\uDE08",
  "Schau zur Decke und nicke",
  "Reagiere zu spaet",
  "Reagiere zu frueh \uD83D\uDE0F",
  "Nicke zustimmend bei jedem Wort",
  "Schuettle beim Reden den Kopf",
  "Halte den Atem sichtbar an",
  "Zeig auf jemand anderen ohne Grund",
  "Mach ein V-Zeichen unter dem Tisch"
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const C = {
  bg: "#0a0a0f",
  surface: "#13131a",
  dark: "#0f172a",
  border: "#1e293b",
  blue: "#3b82f6",
  blueLight: "#93c5fd",
  red: "#ef4444",
  redLight: "#fca5a5",
  gold: "#f59e0b",
  text: "#e2e8f0",
  muted: "#64748b",
};

const S = {
  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Georgia, serif",
    fontSize: 17,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  p: { fontSize: 13, lineHeight: 1.8, color: "#94a3b8" },
  li: { fontSize: 13, lineHeight: 1.9, color: "#94a3b8", listStyle: "none" },
};

function Rules() {
  return (
    <div>
      <div style={S.card}>
        <div style={S.cardTitle}><span>🧠</span> Das Konzept</div>
        <p style={S.p}>Ein Spieler erzaehlt eine Geschichte unter Zeitdruck. Die anderen haben geheime Woerter und Aktionen. Sobald ihr Wort faellt, muessen sie reagieren. Der Erzaehler versucht danach alles zu durchschauen.</p>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}><span>👥</span> Spieleranzahl & Dauer</div>
        <ul style={{ paddingLeft: 0 }}>
          {["2-6 Spieler (optimal 3-5)", "15-30 Minuten", "Timer: 30-60 Sek pro Runde"].map(t => (
            <li key={t} style={S.li}><span style={{ color: C.blue }}>→ </span>{t}</li>
          ))}
        </ul>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}><span>🔵</span> Vorbereitung</div>
        <p style={S.p}>Jeder Spieler (ausser Erzaehler) zieht:</p>
        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {[["1x Blaue Karte (Wort)", true], ["1x Rote Karte (Aktion)", false]].map(([label, blue]) => (
            <span key={label} style={{
              fontSize: 10, letterSpacing: 1, textTransform: "uppercase",
              padding: "4px 10px", borderRadius: 3,
              background: blue ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)",
              color: blue ? C.blueLight : C.redLight,
              border: `1px solid ${blue ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)"}`
            }}>{label}</span>
          ))}
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: C.gold }}>Geheim halten!</p>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}><span>🗣️</span> Ablauf</div>
        <ul style={{ paddingLeft: 0 }}>
          {[
            "Erzaehler startet Timer und erzaehlt sofort",
            "Nur sprechen solange Zeit laeuft",
            "Faellt dein Wort: Aktion SOFORT ausfuehren",
            "Moeglichst unauffaellig bleiben"
          ].map(t => (
            <li key={t} style={S.li}><span style={{ color: C.blue }}>→ </span>{t}</li>
          ))}
        </ul>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}><span>🏆</span> Punkte</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
          {[["Erzaehler", "+1", "pro richtig erratenem Wort"], ["Erratener", "+1", "fuer seine Rote Karte"]].map(([l, v, d]) => (
            <div key={l} style={{ background: C.dark, borderRadius: 6, padding: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{l}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: 32, color: C.gold, margin: "4px 0" }}>{v}</div>
              <div style={{ fontSize: 10, color: C.muted }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={S.cardTitle}><span>🔥</span> Bonus-Modi</div>
        {[
          ["🕵️ Profi-Modus", "Erzaehler muss jedem Spieler exakt sein Wort zuordnen. Falsche Zuordnung = 0 Punkte."],
          ["💣 Chaos-Modus", "Jeder hat 2 Woerter, nur 1 Aktion. Absolute Eskalation garantiert!"],
          ["🎭 Theater-Modus", "Aktionen duerfen kombiniert werden. Extra Punkt fuer beste Performance."]
        ].map(([t, d]) => (
          <div key={t} style={{ background: C.dark, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, marginBottom: 8 }}>
            <div style={{ fontSize: 13, color: C.gold, marginBottom: 6 }}>{t}</div>
            <p style={S.p}>{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Cards() {
  const [count, setCount] = useState(2);
  const [dealt, setDealt] = useState([]);
  const [revealed, setRevealed] = useState({});

  function deal() {
    const words = shuffle(BLUE_WORDS).slice(0, count);
    const actions = shuffle(RED_ACTIONS).slice(0, count);
    setDealt(words.map((w, i) => ({ word: w, action: actions[i] })));
    setRevealed({});
  }

  function toggle(key) {
    setRevealed(r => ({ ...r, [key]: !r[key] }));
  }

  return (
    <div>
      <div style={{ ...S.card, marginBottom: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
          Mitspieler (ohne Erzaehler)
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              flex: 1, background: count === n ? "#1a1a2e" : C.dark,
              border: `1px solid ${count === n ? C.blue : C.border}`,
              color: count === n ? C.blueLight : C.muted,
              fontFamily: "Georgia,serif", fontSize: 22, padding: "8px 0",
              cursor: "pointer", borderRadius: 4, WebkitTapHighlightColor: "transparent"
            }}>{n}</button>
          ))}
        </div>
      </div>

      <button onClick={deal} style={{
        width: "100%", background: "linear-gradient(135deg,#1a1a3e,#1a0a1e)",
        border: `1px solid ${C.blue}`, color: C.blueLight,
        fontFamily: "Georgia,serif", fontSize: 20, letterSpacing: 3,
        padding: 16, cursor: "pointer", borderRadius: 6, marginBottom: 16,
        textTransform: "uppercase", WebkitTapHighlightColor: "transparent"
      }}>
        Karten austeilen
      </button>

      {dealt.map((p, i) => (
        <div key={i} style={{ ...S.card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted, borderBottom: `1px solid ${C.border}` }}>
            Spieler {i + 1}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
            {[
              { key: `w${i}`, typeLabel: "Wort", emoji: "🔵", value: p.word, blue: true },
              { key: `a${i}`, typeLabel: "Aktion", emoji: "🔴", value: p.action, blue: false }
            ].map((cell, ci) => (
              <div key={cell.key} onClick={() => toggle(cell.key)} style={{
                padding: 14, cursor: "pointer", minHeight: 88,
                borderRight: ci === 0 ? `1px solid ${C.border}` : "none",
                WebkitTapHighlightColor: "transparent"
              }}>
                <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: cell.blue ? C.blue : C.red }}>
                  {cell.emoji} {cell.typeLabel}
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 700, lineHeight: 1.4,
                  color: cell.blue ? C.blueLight : C.redLight,
                  filter: revealed[cell.key] ? "none" : "blur(7px)",
                  transition: "filter 0.25s",
                  userSelect: revealed[cell.key] ? "auto" : "none"
                }}>{cell.value}</div>
                {!revealed[cell.key] && (
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 5, fontStyle: "italic" }}>Tippen</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimerTab() {
  const [duration, setDuration] = useState(45);
  const [remaining, setRemaining] = useState(45);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function changeDuration(d) {
    setDuration(d);
    if (!running) { setRemaining(d); setDone(false); }
  }

  function toggleTimer() {
    if (done) return;
    setRunning(r => !r);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setRemaining(duration);
    setDone(false);
  }

  function addPlayer() {
    const name = newName.trim();
    if (!name) return;
    setPlayers(p => [...p, { name, score: 0 }]);
    setNewName("");
  }

  function changeScore(i, delta) {
    setPlayers(p => p.map((pl, idx) => idx === i ? { ...pl, score: Math.max(0, pl.score + delta) } : pl));
  }

  function removePlayer(i) {
    setPlayers(p => p.filter((_, idx) => idx !== i));
  }

  const ratio = remaining / duration;
  const circ = 565;
  const offset = circ * (1 - ratio);
  const timerColor = ratio > 0.5 ? C.blue : ratio > 0.25 ? C.gold : C.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, width: "100%" }}>
        {[30, 45, 60, 90].map(d => (
          <button key={d} onClick={() => changeDuration(d)} style={{
            flex: 1, background: duration === d ? "#1a0a1e" : C.surface,
            border: `1px solid ${duration === d ? C.red : C.border}`,
            color: duration === d ? C.redLight : C.muted,
            fontFamily: "'Courier New',monospace", fontSize: 13,
            padding: "10px 0", cursor: "pointer", borderRadius: 4,
            WebkitTapHighlightColor: "transparent"
          }}>{d}s</button>
        ))}
      </div>

      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.border} strokeWidth="8" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={timerColor} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            fontFamily: "Georgia,serif", fontSize: 64, lineHeight: 1,
            color: remaining <= 10 ? C.red : remaining <= 15 ? C.gold : C.text,
          }}>{remaining}</div>
          <div style={{ fontSize: 10, letterSpacing: 2, color: C.muted, textTransform: "uppercase" }}>Sek</div>
        </div>
      </div>

      {done && (
        <div style={{
          width: "100%", background: "linear-gradient(135deg,rgba(239,68,68,0.15),rgba(245,158,11,0.15))",
          border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: 16, textAlign: "center"
        }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: 28, letterSpacing: 3, color: C.redLight, textTransform: "uppercase" }}>Zeit ist um!</div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginTop: 4 }}>Jetzt Ratephase starten</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={toggleTimer} disabled={done} style={{
          flex: 1, background: "linear-gradient(135deg,#1a0a1e,#2a0a1e)",
          border: `1px solid ${C.red}`, color: C.redLight,
          fontFamily: "Georgia,serif", fontSize: 20, letterSpacing: 2,
          padding: 14, cursor: done ? "not-allowed" : "pointer", borderRadius: 6,
          textTransform: "uppercase", opacity: done ? 0.4 : 1,
          WebkitTapHighlightColor: "transparent"
        }}>{running ? "PAUSE" : "START"}</button>
        <button onClick={reset} style={{
          flex: 1, background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
          fontFamily: "Georgia,serif", fontSize: 20, letterSpacing: 2,
          padding: 14, cursor: "pointer", borderRadius: 6, textTransform: "uppercase",
          WebkitTapHighlightColor: "transparent"
        }}>RESET</button>
      </div>

      <div style={{ ...S.card, width: "100%" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 18, letterSpacing: 2, color: C.gold, marginBottom: 14, textTransform: "uppercase" }}>
          Punktestand
        </div>
        {players.length === 0 && (
          <div style={{ fontSize: 11, color: C.muted, textAlign: "center", padding: 10 }}>Noch keine Spieler</div>
        )}
        {players.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: C.dark, borderRadius: 4, padding: "8px 10px", marginBottom: 6 }}>
            <div style={{ flex: 1, fontSize: 12, color: C.text }}>{p.name}</div>
            <button onClick={() => changeScore(i, -1)} style={{ background: C.border, border: "none", color: C.text, width: 30, height: 30, borderRadius: 3, cursor: "pointer", fontSize: 18, WebkitTapHighlightColor: "transparent" }}>-</button>
            <div style={{ fontFamily: "Georgia,serif", fontSize: 26, color: C.gold, minWidth: 32, textAlign: "center" }}>{p.score}</div>
            <button onClick={() => changeScore(i, 1)} style={{ background: C.border, border: "none", color: C.text, width: 30, height: 30, borderRadius: 3, cursor: "pointer", fontSize: 18, WebkitTapHighlightColor: "transparent" }}>+</button>
            <button onClick={() => removePlayer(i)} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "0 2px", WebkitTapHighlightColor: "transparent" }}>✕</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addPlayer()}
            placeholder="Spieler hinzufuegen..."
            maxLength={16}
            style={{
              flex: 1, background: C.dark, border: `1px solid ${C.border}`,
              color: C.text, fontFamily: "'Courier New',monospace",
              fontSize: 13, padding: "10px 12px", borderRadius: 4, outline: "none",
              WebkitAppearance: "none"
            }}
          />
          <button onClick={addPlayer} style={{
            background: C.surface, border: `1px solid ${C.border}`, color: C.muted,
            fontSize: 22, padding: "0 16px", borderRadius: 4, cursor: "pointer",
            WebkitTapHighlightColor: "transparent"
          }}>+</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("rules");

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Courier New', monospace" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px 80px" }}>
        <div style={{ textAlign: "center", padding: "32px 0 20px" }}>
          <div style={{
            fontSize: "clamp(48px,15vw,76px)", fontWeight: 900, letterSpacing: 4, lineHeight: 1,
            background: "linear-gradient(135deg, #ef4444 0%, #f59e0b 50%, #3b82f6 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", fontFamily: "Georgia, serif", textTransform: "uppercase"
          }}>Story Chaos</div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginTop: 6 }}>
            Das Spiel gegen den Erzaehler
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, margin: "0 0 20px" }}>
          {[["rules","📘 Regeln"], ["cards","🎴 Karten"], ["timer","⏱ Timer"]].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              background: tab === id ? "#1a1a2e" : C.surface,
              border: `1px solid ${tab === id ? C.blue : C.border}`,
              color: tab === id ? C.blueLight : C.muted,
              fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 1.5,
              textTransform: "uppercase", padding: "11px 4px", cursor: "pointer", borderRadius: 4,
              transition: "all 0.15s", WebkitTapHighlightColor: "transparent"
            }}>{label}</button>
          ))}
        </div>

        {tab === "rules" && <Rules />}
        {tab === "cards" && <Cards />}
        {tab === "timer" && <TimerTab />}

        <div style={{ textAlign: "center", padding: "24px 0 8px", fontSize: 10, color: "#2a3a4a", letterSpacing: 1.5, textTransform: "uppercase" }}>
          Story Chaos · Party Game · 2-6 Players
        </div>
      </div>
    </div>
  );
}
