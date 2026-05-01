import { useState, useEffect, useRef } from "react";
import { CONTENT } from "./content";
import { UI } from "./i18n";
import { sb } from "./lib/supabase";
import { ACTIVE_ROUND_PHASES, GAME_PHASES, PRE_STORY_PHASES, SCORE_PHASES } from "./constants/phases";
import { buildCardLookups, detectLanguageFromSample, roomCode, shuffle } from "./game/cards";
import { flattenPresence, getAudience, getNarratorId, getVisiblePlayers, inspectRoomPresence, timeAgo } from "./game/rooms";
import { analyzeStory, buildStoryAttemptLine, generateLocalStory, generateStory, repairStoryToRules, stripStoryMarkup } from "./game/storyGeneration";
import { EntryHero, EntryNoteCard, ExitIconButton, HelpPopover, HelpScreen, OfflineBanner, QRCode } from "./components/common/SupportUI";
import HostLobby from "./components/host/HostLobby";
import HostCards from "./components/host/HostCards";
import ReadyCheck from "./components/host/ReadyCheck";

const APP_URL = "https://storychaos-the-game.vercel.app";
const APP_ICON = "/icon-192.png";
const APP_VERSION = __APP_VERSION__;
const HUB_PLAYER_NAME = "__storychaos_hub__";
const FREESTYLE_STORY_PREFIX = "[[freestyle]]";


const FF = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const THEMES = {
  dark: { mode: "dark", bg: "#0d0d14", sur: "#16161f", sur2: "#1e1e2a", bdr: "#2a2a3a", txt: "#f0f0f5", muted: "#9090a8" },
  light: { mode: "light", bg: "#eef1f7", sur: "#ffffff", sur2: "#e6ebf3", bdr: "#b8c2d6", txt: "#101521", muted: "#465268" },
};
const ACC = { blue: "#60a5fa", bluel: "#bfdbfe", red: "#f87171", redl: "#fecaca", gold: "#fbbf24", green: "#4ade80", greenl: "#bbf7d0" };

const {
  allWordsByLang: ALL_WORDS_BY_LANG,
  allActionsByLang: ALL_ACTIONS_BY_LANG,
  wordLookups: WORD_LOOKUPS,
  actionLookups: ACTION_LOOKUPS,
} = buildCardLookups(CONTENT);

function normalizeLang(value) {
  return value === "en" ? "en" : "de";
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("sc-theme") !== "light"; } catch { return true; }
  });
  function toggle() {
    setDark((current) => {
      try { localStorage.setItem("sc-theme", current ? "light" : "dark"); } catch {}
      return !current;
    });
  }
  return [dark ? THEMES.dark : THEMES.light, dark, toggle];
}

function useLanguage(initial) {
  const [lang, setLang] = useState(() => {
    const fromParam = initial && ["de", "en"].includes(initial) ? initial : null;
    if (fromParam) return fromParam;
    try {
      const stored = localStorage.getItem("sc-lang");
      if (stored === "de" || stored === "en") return stored;
    } catch {}
    return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
  });

  useEffect(() => {
    try { localStorage.setItem("sc-lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}

function useViewport() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));

  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { width, height } = size;
  return {
    width,
    height,
    isPhone: width < 640,
    isTablet: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  };
}

function makeStyles(C) {
  const isLight = C.mode === "light";
  return {
    card: { background: C.sur, border: `${isLight ? 1.5 : 1}px solid ${C.bdr}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: isLight ? "0 14px 36px rgba(15,23,42,.08)" : "0 12px 32px rgba(0,0,0,.18)" },
    card2: { background: C.sur2, border: `${isLight ? 1.5 : 1}px solid ${C.bdr}`, borderRadius: 16, padding: 18, marginBottom: 14 },
    st: { fontSize: 16, fontWeight: 800, color: C.txt, display: "flex", alignItems: "center", gap: 8, marginBottom: 12, letterSpacing: "-0.02em" },
    bt: { fontSize: 14, lineHeight: 1.7, color: C.muted },
    input: { width: "100%", background: isLight ? "#f8fafc" : C.sur2, border: `1.5px solid ${C.bdr}`, color: C.txt, fontFamily: FF, fontSize: 16, padding: "14px 15px", borderRadius: 13, outline: "none", boxShadow: isLight ? "inset 0 1px 0 rgba(255,255,255,.7)" : "inset 0 1px 0 rgba(255,255,255,.03)" },
    pbtn: (col, bg) => ({ width: "100%", minHeight: 56, padding: "15px 16px", borderRadius: 13, fontSize: 17, fontWeight: 800, lineHeight: 1.2, border: `1.5px solid ${col}`, background: bg, color: col, cursor: "pointer", transition: "all .15s", display: "block", boxShadow: isLight ? `0 1px 0 rgba(255,255,255,.7) inset, 0 0 0 1px ${col}20 inset` : `0 0 0 1px ${col}18 inset` }),
    sbtn: (col) => ({ fontSize: 13, fontWeight: 800, padding: "8px 12px", borderRadius: 10, border: `1px solid ${col}`, background: isLight ? "rgba(15,23,42,.03)" : "transparent", color: col, cursor: "pointer" }),
  };
}

function getPlayerPhase(room, player, bothRevealed, isReady, ui) {
  if (!player?.secret_word || !player?.secret_action) return ui.player.phaseWaiting;
  if (!bothRevealed) return ui.player.phaseCards;
  if (!isReady) return ui.player.phaseReady;
  if (room?.status === GAME_PHASES.REVEALED) return ui.player.phaseReveal;
  if (room?.status === GAME_PHASES.VOTING) return ui.player.phaseVoting;
  if (room?.status === GAME_PHASES.VOTED) return ui.player.phaseResult;
  if (room?.story) return ui.player.phaseStory;
  return ui.player.phaseWaiting;
}

function getHostPhase(tab, ui) {
  const phases = {
    lobby: ui.hostTabs.lobby,
    cards: ui.hostTabs.cards,
    ready: ui.hostTabs.ready,
    story: ui.hostTabs.story,
    resolve: ui.hostTabs.resolve,
    scores: ui.hostTabs.scores,
    next: ui.hostTabs.next,
  };
  return phases[tab] || ui.hostTabs.lobby;
}

function isFreestyleStory(value) {
  return typeof value === "string" && value.startsWith(FREESTYLE_STORY_PREFIX);
}

function parseFreestyleWords(value) {
  if (!isFreestyleStory(value)) return [];
  try {
    const parsed = JSON.parse(value.slice(FREESTYLE_STORY_PREFIX.length));
    return Array.isArray(parsed?.words) ? parsed.words.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function buildFreestyleStory(words) {
  return `${FREESTYLE_STORY_PREFIX}${JSON.stringify({ words })}`;
}

function buildFreestylePromptWords(realWords, contentLang) {
  const sourceWords = ALL_WORDS_BY_LANG[contentLang] || [];
  const realSet = new Set(realWords.map((word) => word.toLowerCase()));
  const decoyPool = shuffle(sourceWords.filter((word) => !realSet.has(word.toLowerCase())));
  const decoyCount = Math.min(decoyPool.length, Math.max(realWords.length * 2, 4));
  return shuffle([...realWords, ...decoyPool.slice(0, decoyCount)]);
}

function detectRoundLanguage(room, players, fallback = "de") {
  const candidates = [
    ...(room?.story_words || []),
    ...((players || []).flatMap((player) => [player.secret_word, player.secret_action]).filter(Boolean)),
  ];

  if (candidates.length === 0) return fallback;

  let deHits = 0;
  let enHits = 0;
  for (const sample of candidates) {
    const detected = detectLanguageFromSample(sample, sample, fallback, WORD_LOOKUPS, ACTION_LOOKUPS);
    if (detected === "en") enHits += 1;
    else deHits += 1;
  }
  return enHits > deHits ? "en" : "de";
}

function renderHighlightedStory(text, highlightWords, C) {
  const clean = (text || "").replace(/\*\*(.*?)\*\*/g, "$1");
  if (!highlightWords?.length) return clean;
  const escaped = highlightWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  return clean.split(pattern).map((part, index) => {
    const match = highlightWords.some((word) => word.toLowerCase() === part.toLowerCase());
    if (!match) return <span key={`${part}-${index}`}>{part}</span>;
    return <span key={`${part}-${index}`} style={{ color: ACC.gold, fontWeight: 800, background: "rgba(251,191,36,.12)", padding: "0 2px", borderRadius: 4 }}>{part}</span>;
  });
}

const debugLog = [];
function addLog(level, msg, detail = "") {
  debugLog.unshift({ time: new Date().toLocaleTimeString(), level, msg, detail: String(detail).slice(0, 200) });
  if (debugLog.length > 50) debugLog.pop();
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

function playBeep(freq = 440, dur = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

function DebugPanel({ onClose, C, S, ui }) {
  const [logs, setLogs] = useState([...debugLog]);
  const [apiStatus, setApiStatus] = useState({});
  const [sbStatus, setSbStatus] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [testing, setTesting] = useState(false);
  const [checkingSessions, setCheckingSessions] = useState(false);
  const [roomSessions, setRoomSessions] = useState({});
  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const groqKey = import.meta.env.VITE_GROQ_API_KEY;

  useEffect(() => { checkSb(); loadRooms(); }, []);

  async function checkSb() {
    try {
      const start = Date.now();
      const { error } = await sb.from("rooms").select("id").limit(1);
      setSbStatus({ ok: !error, ms: Date.now() - start, err: error?.message });
    } catch (error) {
      setSbStatus({ ok: false, err: error.message });
    }
  }

  async function loadRooms() {
    const { data } = await sb.from("rooms").select("id,host_name,status,created_at,round,narrator_id").order("created_at", { ascending: false }).limit(15);
    setRooms(data || []);
  }

  async function checkSessions() {
    setCheckingSessions(true);
    const entries = await Promise.all((rooms || []).map(async (room) => {
      const members = await inspectRoomPresence(room.id);
      const activeIds = members.map((member) => member.playerId).filter(Boolean);
      return [room.id, { count: members.length, narratorOnline: !!room.narrator_id && activeIds.includes(room.narrator_id), members }];
    }));
    setRoomSessions(Object.fromEntries(entries));
    setCheckingSessions(false);
  }

  async function testApis() {
    setTesting(true);
    const prompt = ui === UI.de ? "Schreibe einen witzigen Satz auf Deutsch." : "Write one funny sentence in English.";
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
    const tests = [
      {
        key: "pollinations1",
        name: "Pollinations /openai",
        fn: async () => {
          const response = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "openai", messages: [{ role: "user", content: prompt }], seed: 1 }) });
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        },
      },
      {
        key: "pollinations2",
        name: "Pollinations GET",
        fn: async () => {
          const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
          return await response.text();
        },
      },
      {
        key: "openrouter",
        name: "OpenRouter",
        fn: async () => {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "HTTP-Referer": APP_URL,
              "X-Title": "Story Chaos",
              ...(openRouterKey ? { Authorization: `Bearer ${openRouterKey}` } : {}),
            },
            body: JSON.stringify({ model: "mistralai/mistral-7b-instruct:free", max_tokens: 60, messages: [{ role: "user", content: prompt }] }),
          });
          if (response.status === 401 || response.status === 403) throw new Error("auth");
          if (response.status === 429) throw new Error("rate");
          if (!response.ok) throw new Error(`http:${response.status}`);
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        },
      },
      {
        key: "groq",
        name: "Groq",
        fn: async () => {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(groqKey ? { Authorization: `Bearer ${groqKey}` } : {}),
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { role: "user", content: prompt },
              ],
              max_tokens: 60,
            }),
          });
          if (response.status === 401 || response.status === 403) throw new Error("auth");
          if (response.status === 429) throw new Error("rate");
          if (!response.ok) throw new Error(`http:${response.status}`);
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        },
      },
    ];
    const results = {};
    for (const test of tests) {
      const start = Date.now();
      if (test.key === "openrouter" && !openRouterKey) {
        results[test.key] = { ok: undefined, ms: 0, name: test.name, note: ui.debug.serviceNotConnected };
        setApiStatus({ ...results });
        continue;
      }
      if (test.key === "groq" && !groqKey) {
        results[test.key] = { ok: undefined, ms: 0, name: test.name, note: ui.debug.serviceNotConnected };
        setApiStatus({ ...results });
        continue;
      }
      try {
        const text = await Promise.race([test.fn(), timeout(15000)]);
        results[test.key] = { ok: text.length > 5, ms: Date.now() - start, preview: text.slice(0, 70), name: test.name };
      } catch (error) {
        let note = error.message;
        if (error.message === "auth") note = ui.debug.serviceAuthMissing;
        else if (error.message === "rate") note = ui.debug.serviceRateLimited;
        else if (error.message === "timeout") note = ui.debug.serviceTimeout;
        else if (error.message.startsWith("http:")) note = ui.debug.serviceHttpError(error.message.split(":")[1]);
        results[test.key] = { ok: false, ms: Date.now() - start, err: error.message, note, name: test.name };
      }
      setApiStatus({ ...results });
    }
    setTesting(false);
  }

  async function deleteOldRooms() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    loadRooms();
    addLog("info", ui.debug.deletedRooms);
  }

  async function deleteRoomById(roomId) {
    await sb.from("players").delete().eq("room_id", roomId);
    await sb.from("rooms").delete().eq("id", roomId);
    setRoomSessions((current) => {
      const next = { ...current };
      delete next[roomId];
      return next;
    });
    loadRooms();
    addLog("info", ui.debug.roomDeleted, roomId);
  }

  async function deleteInactiveRooms() {
    const source = Object.keys(roomSessions).length > 0 ? roomSessions : Object.fromEntries(await Promise.all((rooms || []).map(async (room) => {
      const members = await inspectRoomPresence(room.id);
      const activeIds = members.map((member) => member.playerId).filter(Boolean);
      return [room.id, { count: members.length, narratorOnline: !!room.narrator_id && activeIds.includes(room.narrator_id), members }];
    })));
    for (const room of rooms) {
      if ((source[room.id]?.count || 0) === 0) {
        await deleteRoomById(room.id);
      }
    }
  }

  const badge = (ok) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: ok === undefined ? "transparent" : ok ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.15)", color: ok === undefined ? C.muted : ok ? ACC.greenl : ACC.redl, border: `1px solid ${ok === undefined ? C.bdr : ok ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}` }}>
      {ok === undefined ? "–" : ok ? ui.debug.ok : ui.debug.fail}
    </span>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.88)", overflowY: "auto" }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "16px 16px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.txt }}>{ui.debug.title}</div>
          <button onClick={onClose} style={S.sbtn(C.muted)}>✕ {ui.common.close}</button>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.debug.supabase}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.txt }}>{ui.debug.connection} {sbStatus?.ms ? `(${sbStatus.ms}ms)` : ""}</span>
            {sbStatus ? badge(sbStatus.ok) : <span style={{ fontSize: 11, color: C.muted }}>{ui.debug.checking}</span>}
          </div>
          {sbStatus?.err && <div style={{ fontSize: 11, color: ACC.redl, marginTop: 4 }}>{sbStatus.err}</div>}
          <button onClick={checkSb} style={{ ...S.sbtn(C.muted), marginTop: 10 }}>{ui.common.refresh}</button>
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.aiApis}</div>
            <button onClick={testApis} disabled={testing} style={S.sbtn(ACC.blue)}>{testing ? ui.debug.testing : ui.debug.testAll}</button>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>{ui.debug.aiApisHint}</div>
          {Object.values(apiStatus).length === 0 && !testing && <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.notTested}</p>}
          {Object.values(apiStatus).map((status) => (
            <div key={status.name} style={{ padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.txt }}>{status.name}</span>
                {badge(status.ok)}
              </div>
              {status.ms && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{status.ms}ms</div>}
              {status.note && <div style={{ fontSize: 11, color: status.ok === false ? ACC.redl : C.muted, marginTop: 2 }}>{status.note}</div>}
              {status.preview && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>{ui.debug.servicePreview}: &quot;{status.preview}&quot;</div>}
              {status.err && status.err !== status.note && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{status.err}</div>}
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.sessions}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={checkSessions} disabled={checkingSessions} style={S.sbtn(ACC.blue)}>{checkingSessions ? ui.debug.checkingSessions : ui.debug.checkSessions}</button>
              <button onClick={deleteInactiveRooms} style={S.sbtn(ACC.red)}>{ui.debug.deleteInactive}</button>
            </div>
          </div>
          {Object.keys(roomSessions).length === 0 ? <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.notTested}</p> : rooms.map((room) => {
            const session = roomSessions[room.id];
            if (!session) return null;
            return (
              <div key={`${room.id}-session`} style={{ padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: C.txt, fontWeight: 700 }}>{room.id}</span>
                  <span style={{ fontSize: 11, color: session.count > 0 ? ACC.greenl : C.muted }}>
                    {session.count > 0 ? ui.debug.activeSessions(session.count) : ui.debug.noActiveSessions}
                  </span>
                </div>
                {!session.narratorOnline && <div style={{ fontSize: 11, color: ACC.gold, marginTop: 4 }}>{ui.debug.narratorMissing}</div>}
              </div>
            );
          })}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.rooms(rooms.length)}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={loadRooms} style={S.sbtn(C.muted)}>↻</button>
              <button onClick={deleteOldRooms} style={S.sbtn(ACC.red)}>{ui.debug.deleteOld}</button>
            </div>
          </div>
          {rooms.length === 0 ? <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.noRooms}</p> : rooms.map((room) => (
            <div key={room.id} style={{ padding: "7px 0", borderBottom: `1px solid ${C.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 3, color: C.txt }}>{room.id}</span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{room.host_name} · R{room.round || 1}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: C.sur2, color: C.muted }}>{room.status}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(room.created_at)}</span>
                <button onClick={() => deleteRoomById(room.id)} style={S.sbtn(ACC.red)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.logs(logs.length)}</div>
            <button onClick={() => setLogs([...debugLog])} style={S.sbtn(C.muted)}>↻</button>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {logs.length === 0 ? <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.noLogs}</p> : logs.map((log, index) => (
              <div key={index} style={{ padding: "4px 0", borderBottom: `1px solid ${C.bdr}`, display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{log.time}</span>
                <span style={{ fontWeight: 700, color: log.level === "error" ? ACC.red : log.level === "warn" ? ACC.gold : ACC.blue, minWidth: 34 }}>{log.level.toUpperCase()}</span>
                <span style={{ color: C.txt, wordBreak: "break-all" }}>{log.msg} <span style={{ color: C.muted }}>{log.detail}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HostStory({ room, storyWords, ui, contentLang, C, S, onOpenResolution, stageMode = false, onExitStage }) {
  const viewport = useViewport();
  const [genre, setGenre] = useState(null);
  const [story, setStory] = useState(room.story || "");
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState("local");
  const [error, setError] = useState("");
  const [attemptStatus, setAttemptStatus] = useState("");
  const [storyMinChars, setStoryMinChars] = useState(350);
  const words = storyWords || [];
  const content = CONTENT[contentLang];
  const compactStageHeight = viewport.isDesktop ? "min(62vh, 620px)" : "auto";
  const storyDifficulty = room?.difficulty || "mix";
  const hasStoryStage = !!story && !loading;
  const freestyleMode = isFreestyleStory(story);
  const freestyleWords = parseFreestyleWords(story);

  async function buildStory(mode = "local") {
    if (!genre || words.length === 0) return;
    setLoading(true);
    setLoadingMode(mode);
    setError("");
    if (mode === "local") setStory("");
    setAttemptStatus("");
    const selectedGenre = genre === "random"
      ? content.genres[Math.floor(Math.random() * (content.genres.length - 1))]
      : content.genres.find((entry) => entry.id === genre);
    const selection = selectedGenre?.label;
    const selectedGenreId = selectedGenre?.id || "alltag";
    const targetChars = Math.max(storyMinChars + 120, Math.round(storyMinChars * 1.25));
    let validStory = null;
    const pushAttemptLine = (line) => setAttemptStatus(line);

    if (mode === "local") {
      const text = await generateLocalStory({ contentLang, genreId: selectedGenreId, words, minChars: storyMinChars, difficulty: storyDifficulty }, pushAttemptLine);
      validStory = stripStoryMarkup(text);
    } else if (mode === "freestyle") {
      validStory = buildFreestyleStory(buildFreestylePromptWords(words, contentLang));
    } else {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const strictness = attempt === 0 ? "" : contentLang === "de"
          ? " Wichtig: Prüfe vor der Ausgabe selbst, dass jedes Zielwort mindestens zweimal vorkommt, möglichst in unterschiedlichen Sätzen, und dass die Geschichte lang genug ist."
          : " Important: before answering, verify that every target word appears at least twice, preferably in different sentences, and that the story is long enough.";
        const prompt = `${content.aiPrompt(selection, words, storyMinChars, targetChars)}${strictness}`;
        const text = await generateStory({ prompt, contentLang, words, minChars: storyMinChars, content: CONTENT, appUrl: APP_URL, addLog }, pushAttemptLine);
        if (!text) continue;
        pushAttemptLine(buildStoryAttemptLine(contentLang, "repair", "local-fallback"));
        const repaired = repairStoryToRules(text, words, storyMinChars, contentLang);
        const analysis = analyzeStory(repaired, words, storyMinChars);
        if (analysis.valid) {
          validStory = analysis.clean;
          break;
        }
      }
    }

    if (!validStory) {
      setError(ui.storyGen.aiError);
      setLoading(false);
      return;
    }
    setStory(validStory);
    await sb.from("rooms").update({ story: validStory, status: GAME_PHASES.PLAYING }).eq("id", room.id);
    setLoading(false);
  }

  return (
    <div>
      <div style={{ ...S.card, padding: stageMode ? (viewport.isDesktop ? 18 : 16) : (viewport.isDesktop ? 16 : 18), background: "linear-gradient(135deg, rgba(251,191,36,.12), rgba(96,165,250,.08))", borderColor: "rgba(251,191,36,.26)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(0,0,0,.12)" }}>
              <img src={APP_ICON} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.storyGen.title}</div>
              {stageMode && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{room?.id ? `${ui.common.room} ${room.id}` : ""}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasStoryStage && <button onClick={() => setStory("")} style={S.sbtn(C.muted)}>{ui.storyGen.regenerate}</button>}
            {stageMode && onExitStage && <button onClick={onExitStage} style={S.sbtn(C.muted)}>{ui.common.back}</button>}
            <HelpPopover title={ui.storyGen.title} ui={ui} C={C} S={S} acc={ACC}>
              <div>{ui.storyGen.desc}</div>
              {ui.storyGen.flowSteps.map((step, index) => <div key={step}>{index + 1}. {step}</div>)}
              <div>{ui.storyGen.hiddenHint}</div>
              <div>{ui.storyGen.freestyleHelp}</div>
            </HelpPopover>
          </div>
        </div>
      </div>

      {!hasStoryStage ? (
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, alignItems: "start" }}>
        <div>
          <div style={{ ...S.card2, marginBottom: 14, padding: 12, display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 4 }}>{ui.storyGen.title}</div>
              <div style={{ fontSize: 13, color: C.txt, fontWeight: 700 }}>{genre ? content.genres.find((entry) => entry.id === genre)?.label || ui.storyGen.theme : ui.storyGen.theme}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button onClick={() => buildStory("freestyle")} disabled={!genre || loading || words.length === 0} style={{ ...S.sbtn(genre ? ACC.blue : C.muted), minHeight: 40, padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap", background: genre ? "rgba(96,165,250,.10)" : "transparent" }}>
                {ui.storyGen.freestyle}
              </button>
              <button onClick={() => buildStory("local")} disabled={!genre || loading || words.length === 0} style={{ ...S.sbtn(genre ? ACC.gold : C.muted), minHeight: 40, padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap", background: genre ? "rgba(251,191,36,.10)" : "transparent" }}>
                {loading && loadingMode === "local" ? ui.storyGen.generating : ui.storyGen.generate}
              </button>
            </div>
          </div>

          <fieldset style={{ border: "none", margin: "0 0 14px", padding: 0 }}>
            <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10, display: "block" }}>{ui.storyGen.theme}</legend>
            <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
              {content.genres.map((entry) => (
                <button key={entry.id} onClick={() => setGenre(entry.id)} aria-pressed={genre === entry.id} style={{ background: genre === entry.id ? "rgba(251,191,36,.1)" : C.sur, border: `2px solid ${genre === entry.id ? ACC.gold : C.bdr}`, borderRadius: 12, padding: viewport.isDesktop ? 12 : 10, cursor: "pointer", textAlign: "left", gridColumn: entry.id === "random" ? "span 2" : "span 1", transition: "all .15s", display: "block", minHeight: viewport.isDesktop ? 82 : 74 }}>
                  <div style={{ fontSize: 15, marginBottom: 3 }}>{entry.emoji}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: genre === entry.id ? ACC.gold : C.txt }}>{entry.label}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{entry.desc}</div>
                </button>
              ))}
            </div>
          </fieldset>

          <div style={{ ...S.card2, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.storyGen.storyLength}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 10 }}>{ui.storyGen.storyLengthValue(storyMinChars)}</div>
            <input
              type="range"
              min="350"
              max="900"
              step="50"
              value={storyMinChars}
              onChange={(event) => setStoryMinChars(Number(event.target.value))}
              style={{ width: "100%", accentColor: ACC.gold, cursor: "pointer" }}
            />
            <p style={{ ...S.bt, marginTop: 10 }}>{ui.storyGen.storyLengthHelp}</p>
          </div>

          {loading && (
            <div style={{ ...S.card2, marginTop: 12, padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 28, display: "inline-block", animation: "spin 1.5s linear infinite" }}>✍️</div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                {loadingMode === "ai" ? ui.storyGen.writingAi : loadingMode === "freestyle" ? ui.storyGen.writingFreestyle : ui.storyGen.writing}
              </div>
              {attemptStatus && <div style={{ fontSize: 13, lineHeight: 1.45, color: C.txt, marginTop: 12 }}>{attemptStatus}</div>}
            </div>
          )}
          {error && <div style={{ ...S.card, borderColor: "rgba(248,113,113,.4)", background: "rgba(248,113,113,.06)", marginTop: 12 }}><p style={{ ...S.bt, color: ACC.redl }}>{error}</p></div>}
        </div>
      </div>
      ) : (
          <div style={{ animation: "fadeIn .3s ease" }}>
            <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto", minHeight: compactStageHeight }}>
              <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))", minHeight: viewport.isDesktop ? "100%" : "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.gold }}>
                    {freestyleMode ? ui.storyGen.freestyleNow : ui.storyGen.readNow}
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {freestyleMode && <button onClick={() => buildStory("freestyle")} style={S.sbtn(ACC.blue)}>{ui.storyGen.regenerateFreestyle}</button>}
                    <button onClick={() => buildStory("local")} style={S.sbtn(C.muted)}>{ui.storyGen.regenerate}</button>
                    <button onClick={() => buildStory("ai")} style={S.sbtn(ACC.blue)}>{ui.storyGen.regenerateAi}</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 14, minHeight: viewport.isDesktop ? compactStageHeight : "auto" }}>
                  <p style={{ ...S.bt, marginBottom: 0, fontStyle: "italic" }}>{freestyleMode ? ui.storyGen.freestyleHint : ui.storyGen.hiddenHint}</p>
                  {freestyleMode ? (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 10 }}>{ui.storyGen.freestyleWordPool}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start" }}>
                        {freestyleWords.map((word) => (
                          <span key={word} style={{ fontSize: 14, fontWeight: 700, color: C.txt, background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.26)", padding: "7px 12px", borderRadius: 999 }}>
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: viewport.isDesktop ? 16 : 16, lineHeight: viewport.isDesktop ? 1.85 : 1.95, color: C.txt, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: viewport.isDesktop ? 10 : "unset", WebkitBoxOrient: "vertical" }}>
                      {story.replace(/\*\*(.*?)\*\*/g, "$1")}
                    </div>
                  )}
                  <div style={{ borderTop: `1px solid ${C.bdr}`, paddingTop: 14, display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr auto" : "1fr", gap: 12, alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.red, marginBottom: 8 }}>{ui.storyGen.revealTitle}</div>
                      <p style={{ ...S.bt, margin: 0 }}>{freestyleMode ? ui.storyGen.freestyleRevealDesc : ui.storyGen.revealDesc}</p>
                    </div>
                    <button onClick={onOpenResolution} style={{ ...S.pbtn(ACC.red, "rgba(248,113,113,.08)"), width: viewport.isDesktop ? 220 : "100%" }}>
                      {ui.storyGen.resolveCta}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}

function Resolution({ room, players, storyWords, ui, C, S, onOpenScores }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const others = getAudience(players, narratorId, HUB_PLAYER_NAME);
  const words = storyWords || [];
  const compactCardHeight = viewport.isDesktop ? "min(58vh, 560px)" : "auto";
  const freestyleWords = parseFreestyleWords(room.story);
  const freestyleMode = freestyleWords.length > 0;

  function renderStory(text, highlightWords) {
    const clean = (text || "").replace(/\*\*(.*?)\*\*/g, "$1");
    if (!highlightWords?.length) return clean;
    const escaped = highlightWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
    return clean.split(pattern).map((part, index) => (
      highlightWords.some((word) => word.toLowerCase() === part.toLowerCase())
        ? <strong key={index} style={{ color: ACC.gold, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{part}</strong>
        : part
    ));
  }

  return (
    <div>
      <div style={{ ...S.card, padding: viewport.isDesktop ? 16 : 18, background: "linear-gradient(135deg, rgba(248,113,113,.12), rgba(251,191,36,.08))", borderColor: "rgba(248,113,113,.26)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={APP_ICON} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.resolution.title}</div>
            </div>
          </div>
          <HelpPopover title={ui.resolution.title} ui={ui} C={C} S={S} acc={ACC}>
            <div>{ui.resolution.desc}</div>
            <div>{ui.resolution.revealStoryDesc}</div>
          </HelpPopover>
          <button onClick={onOpenScores} style={{ ...S.pbtn(ACC.gold, "rgba(251,191,36,.08)"), width: viewport.isDesktop ? 220 : "100%" }}>
            {ui.resolution.continueToPoints}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "minmax(0, 1.12fr) minmax(340px, 0.88fr)" : "1fr", gap: 14, alignItems: "start" }}>
        <div>
          <div style={{ ...S.card, borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.05)", minHeight: compactCardHeight }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.red, marginBottom: 10 }}>{ui.resolution.revealStoryTitle}</div>
            <p style={{ ...S.bt, marginBottom: 14 }}>{freestyleMode ? ui.resolution.freestyleDesc : ui.resolution.revealStoryDesc}</p>
            {freestyleMode ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 10 }}>{ui.resolution.freestylePoolTitle}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {freestyleWords.map((word) => (
                    <span key={word} style={{ fontSize: 13, fontWeight: 700, color: C.txt, background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.26)", padding: "7px 12px", borderRadius: 999 }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: viewport.isDesktop ? 16 : 15, lineHeight: viewport.isDesktop ? 1.8 : 1.95, color: C.txt, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: viewport.isDesktop ? 13 : "unset", WebkitBoxOrient: "vertical" }}>
                {renderStory(room.story || "", words)}
              </div>
            )}
            {words.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 14, marginTop: 14, borderTop: `1px solid ${C.bdr}` }}>
                {words.map((word) => (
                  <span key={word} style={{ fontSize: 12, fontWeight: 700, color: ACC.gold, background: "rgba(251,191,36,.1)", padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(251,191,36,.3)" }}>
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto" }}>
          <div style={{ ...S.card, marginTop: viewport.isDesktop ? 0 : 12, minHeight: compactCardHeight }}>
            <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
              {others.map((player) => (
                <div key={player.id} style={{ background: C.sur2, borderRadius: 14, padding: 12, border: `1px solid ${player.ready ? "rgba(74,222,128,.25)" : C.bdr}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.txt, marginBottom: 8 }}>{player.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: C.sur, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ACC.blue, marginBottom: 6 }}>{ui.resolution.word}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ACC.bluel }}>{player.secret_word || "–"}</div>
                    </div>
                    <div style={{ background: C.sur, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ACC.red, marginBottom: 6 }}>{ui.resolution.action}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: ACC.redl }}>{player.secret_action || "–"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scores({ room, players, ui, C, S, votes = {}, narratorAwarded, onChooseNarrator, onFinalizeNarratorVote, finalizingNarratorVote, awardedPlayerIds = [], onAwardPlayer }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const narrator = getVisiblePlayers(players, HUB_PLAYER_NAME).find((player) => player.id === narratorId);
  const others = getAudience(players, narratorId, HUB_PLAYER_NAME);
  const sorted = [...getVisiblePlayers(players, HUB_PLAYER_NAME)].sort((a, b) => (b.score || 0) - (a.score || 0));
  const medals = ["🥇", "🥈", "🥉"];
  const [savingScoreId, setSavingScoreId] = useState(null);
  const [view, setView] = useState("action");
  const audienceCount = others.length;
  const voteEntries = Object.values(votes);
  const yesVotes = voteEntries.filter((entry) => entry.vote).length;
  const noVotes = voteEntries.filter((entry) => entry.vote === false).length;
  const allVoted = audienceCount > 0 && voteEntries.length >= audienceCount;
  const compactScoreHeight = viewport.isDesktop ? "min(58vh, 560px)" : "auto";

  useEffect(() => {
    if (!allVoted || room?.status !== GAME_PHASES.VOTING || !onFinalizeNarratorVote || finalizingNarratorVote) return;
    onFinalizeNarratorVote(yesVotes > noVotes);
  }, [allVoted, room?.status, onFinalizeNarratorVote, finalizingNarratorVote, yesVotes, noVotes]);

  async function givePoint(player) {
    if (!onAwardPlayer || savingScoreId === player.id || awardedPlayerIds.includes(player.id)) return;
    setSavingScoreId(player.id);
    await onAwardPlayer(player);
    setSavingScoreId(null);
  }

  const nextCandidates = others.filter((player) => player.id !== narratorId);
  const allPlayersAwarded = others.length > 0 && awardedPlayerIds.length >= others.length;

  return (
    <div>
      <div style={{ ...S.card, padding: viewport.isDesktop ? 16 : 18, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: C.bg === "#0d0d14" ? "linear-gradient(135deg, rgba(22,22,31,.88), rgba(36,36,52,.76))" : "linear-gradient(135deg, rgba(255,255,255,.92), rgba(244,244,252,.82))", borderColor: "rgba(96,165,250,.24)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={APP_ICON} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.scores.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setView("action")} style={{ ...S.sbtn(view === "action" ? ACC.blue : C.muted), background: view === "action" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.actionView}</button>
            <button onClick={() => setView("vote")} style={{ ...S.sbtn(view === "vote" ? ACC.blue : C.muted), background: view === "vote" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.voteView}</button>
            <button onClick={() => setView("board")} style={{ ...S.sbtn(view === "board" ? ACC.blue : C.muted), background: view === "board" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.boardView}</button>
            <HelpPopover title={ui.scores.title} ui={ui} C={C} S={S} acc={ACC}>
              <div>{ui.scores.desc}</div>
              {ui.scores.rules.map((rule) => <div key={rule}>{rule}</div>)}
            </HelpPopover>
          </div>
        </div>
      </div>

      {view === "action" ? (
      <div style={{ animation: "fadeIn .22s ease" }}>
        <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.bg === "#0d0d14" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", minHeight: compactScoreHeight }}>
          <div style={{ ...S.st, marginBottom: 8 }}>{ui.scores.pointsTitle}</div>
          <div style={{ marginTop: 10, marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.22)", color: C.txt, fontSize: 13, fontWeight: 700 }}>
            {ui.scores.pointsRule}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
            {others.map((player) => {
              const alreadyAwarded = awardedPlayerIds.includes(player.id);
              return (
                <div key={`${player.id}-score`} style={{ background: C.sur2, borderRadius: 12, padding: "12px 14px", border: `1px solid ${alreadyAwarded ? "rgba(74,222,128,.28)" : C.bdr}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.txt }}>{player.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                        {ui.scores.currentScore}: <span style={{ color: ACC.gold, fontWeight: 800 }}>{player.score || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => givePoint(player)} disabled={savingScoreId === player.id || alreadyAwarded} style={{ ...S.sbtn(alreadyAwarded ? ACC.green : ACC.gold), minWidth: 120, opacity: savingScoreId === player.id ? 0.7 : 1, cursor: alreadyAwarded ? "default" : "pointer" }}>
                      {alreadyAwarded ? ui.scores.pointGiven : ui.scores.addPoint}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setView("vote")} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), width: viewport.isDesktop ? 220 : "100%" }}>
              {ui.scores.continueToVote}
            </button>
          </div>
        </div>
      </div>
      ) : view === "vote" ? (
      <div style={{ animation: "fadeIn .22s ease" }}>
        <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.bg === "#0d0d14" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", minHeight: compactScoreHeight }}>
          <div style={{ ...S.st, marginBottom: 8 }}>{ui.scores.narratorVoteTitle}</div>
          {nextCandidates.length > 0 && room?.status === GAME_PHASES.VOTED && (
            <button onClick={() => setView("next")} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), marginBottom: 12 }}>
              {ui.scores.continueToNext}
            </button>
          )}
          <p style={S.bt}>{ui.scores.narratorVoteDesc}</p>
          {narrator && (
            <div style={{ background: C.sur2, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.bdr}`, marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.txt }}>{narrator.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.scores.currentScore}: <span style={{ color: ACC.gold, fontWeight: 800 }}>{narrator.score || 0}</span></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ ...S.sbtn(ACC.green), cursor: "default" }}>{ui.scores.narratorVoteYes}: {yesVotes}</span>
                  <span style={{ ...S.sbtn(C.muted), cursor: "default" }}>{ui.scores.narratorVoteNo}: {noVotes}</span>
                </div>
              </div>
              <p style={{ ...S.bt, marginTop: 12 }}>{ui.scores.narratorVoteWaiting(voteEntries.length, audienceCount)}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                <div style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(74,222,128,.10)", border: "1px solid rgba(74,222,128,.26)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ACC.green, marginBottom: 6 }}>{ui.scores.narratorVoteYes}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: ACC.greenl, lineHeight: 1 }}>{yesVotes}</div>
                </div>
                <div style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(148,163,184,.10)", border: `1px solid ${C.bdr}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{ui.scores.narratorVoteNo}</div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: C.txt, lineHeight: 1 }}>{noVotes}</div>
                </div>
              </div>
              {room?.status === GAME_PHASES.VOTED ? (
                <div style={{ marginTop: 14, padding: "18px 18px", borderRadius: 16, background: narratorAwarded ? "linear-gradient(180deg, rgba(74,222,128,.16), rgba(74,222,128,.06))" : "linear-gradient(180deg, rgba(148,163,184,.14), rgba(148,163,184,.06))", border: `1px solid ${narratorAwarded ? "rgba(74,222,128,.30)" : C.bdr}`, color: narratorAwarded ? ACC.greenl : C.txt }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>
                    {ui.scores.narratorVoteDone}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.35 }}>
                    {narratorAwarded ? ui.scores.narratorVoteApproved : ui.scores.narratorVoteRejected}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 16, background: "linear-gradient(180deg, rgba(96,165,250,.10), rgba(96,165,250,.04))", border: "1px solid rgba(96,165,250,.24)", color: C.txt }}>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: ACC.blue, marginBottom: 8 }}>
                    {ui.scores.narratorVoteLive}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {finalizingNarratorVote ? ui.common.loading : ui.scores.narratorVotePending}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      ) : view === "board" ? (
      <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.bg === "#0d0d14" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", padding: 14 }}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
          {sorted.map((player, index) => (
            <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 8, background: C.sur2, borderRadius: 8, padding: "10px 12px", marginBottom: 0 }}>
              <span style={{ fontSize: 16, minWidth: 26 }}>{medals[index] || `${index + 1}.`}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.txt }}>{player.name}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: ACC.gold, minWidth: 36, textAlign: "center" }}>{player.score || 0}</span>
            </li>
          ))}
        </ul>
      </div>
      ) : (
        <NextNarratorView
          room={room}
          players={players}
          ui={ui}
          C={C}
          S={S}
          onChooseNarrator={onChooseNarrator}
          onBack={() => setView("action")}
        />
      )}
    </div>
  );
}

function NextNarratorView({ room, players, ui, C, S, onChooseNarrator, onBack }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const others = getAudience(players, narratorId, HUB_PLAYER_NAME);
  const nextCandidates = others.filter((player) => player.id !== narratorId);
  const [selectedNextId, setSelectedNextId] = useState("");
  const [startingNextRound, setStartingNextRound] = useState(false);

  useEffect(() => {
    if (nextCandidates.length === 1) {
      setSelectedNextId(nextCandidates[0].id);
      return;
    }
    setSelectedNextId((current) => (nextCandidates.some((player) => player.id === current) ? current : ""));
  }, [room?.id, nextCandidates.map((player) => player.id).join("|")]);

  async function startNextRound() {
    if (!onChooseNarrator) return;
    const nextPlayer = others.find((player) => player.id === selectedNextId);
    if (!nextPlayer) return;
    setStartingNextRound(true);
    await onChooseNarrator(nextPlayer);
    setStartingNextRound(false);
  }

  const canAdvance = !!selectedNextId;

  return (
    <div>
      <div style={{ ...S.card, padding: viewport.isDesktop ? 18 : 16, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", background: C.bg === "#0d0d14" ? "linear-gradient(135deg, rgba(22,22,31,.88), rgba(36,36,52,.78))" : "linear-gradient(135deg, rgba(255,255,255,.94), rgba(244,244,252,.84))", borderColor: "rgba(96,165,250,.24)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={S.st}>{ui.scores.nextTitle}</div>
          <button onClick={onBack} style={S.sbtn(C.muted)}>{ui.common.back}</button>
        </div>
        <button onClick={startNextRound} disabled={!canAdvance || startingNextRound} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), marginBottom: 16 }}>
          {startingNextRound ? ui.common.loading : ui.scores.nextRound}
        </button>
        <p style={{ ...S.bt, marginBottom: 16 }}>{nextCandidates.length > 1 ? ui.scores.nextDesc : ui.scores.nextAuto}</p>
        <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop && nextCandidates.length > 2 ? "1fr 1fr" : "1fr", gap: 10, marginTop: 12 }}>
          {nextCandidates.map((player) => {
            const active = selectedNextId === player.id;
            return (
              <button
                key={`${player.id}-next`}
                onClick={() => setSelectedNextId(player.id)}
                aria-pressed={active}
                style={{
                  background: active ? "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))" : C.sur2,
                  border: `1.5px solid ${active ? ACC.blue : C.bdr}`,
                  color: active ? ACC.bluel : C.txt,
                  fontSize: 15,
                  fontWeight: 800,
                  padding: "18px 16px",
                  borderRadius: 14,
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: 74,
                }}
              >
                {player.name}
              </button>
            );
          })}
        </div>
        {!canAdvance && <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>{ui.scores.chooseFirst}</p>}
      </div>
    </div>
  );
}

function Timer({ ui, C, S }) {
  const [dur, setDur] = useState(60);
  const [rem, setRem] = useState(60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!run) return undefined;
    ref.current = setInterval(() => {
      setRem((remaining) => {
        if (remaining === 10) { vibrate([100]); playBeep(880, 0.1); }
        if (remaining <= 1) {
          clearInterval(ref.current);
          setRun(false);
          setDone(true);
          vibrate([300, 100, 300]);
          playBeep(440, 0.5);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [run]);

  const ratio = rem / dur;
  const offset = 565 * (1 - ratio);
  const strokeColor = ratio > 0.5 ? ACC.blue : ratio > 0.25 ? ACC.gold : ACC.red;
  const numberColor = rem <= 10 ? ACC.red : rem <= 20 ? ACC.gold : C.txt;
  const minutes = Math.floor(rem / 60);
  const seconds = rem % 60;
  const display = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : String(rem);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <fieldset style={{ border: "none", width: "100%", padding: 0 }}>
        <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 8, display: "block" }}>{ui.timer.duration}</legend>
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 90, 120, 180].map((value) => (
            <button key={value} onClick={() => { setDur(value); if (!run) { setRem(value); setDone(false); } }} aria-pressed={dur === value} style={{ flex: 1, background: dur === value ? "rgba(248,113,113,.1)" : C.sur, border: `2px solid ${dur === value ? ACC.red : C.bdr}`, color: dur === value ? ACC.redl : C.muted, fontSize: 13, fontWeight: 600, padding: "10px 0", borderRadius: 6, cursor: "pointer" }}>
              {value >= 60 ? `${value / 60} ${ui.timer.minutes}` : `${value}s`}
            </button>
          ))}
        </div>
      </fieldset>
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.bdr} strokeWidth="10" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="round" strokeDasharray="565" strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s linear,stroke 0.5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} role="timer" aria-label={ui.timer.aria(rem)}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: numberColor }}>{display}</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginTop: 2 }}>{minutes > 0 ? ui.timer.minSec : ui.timer.seconds}</div>
        </div>
      </div>
      {done && (
        <div role="alert" style={{ width: "100%", background: "linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.12))", border: "1.5px solid rgba(248,113,113,.4)", borderRadius: 10, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, color: ACC.redl, textTransform: "uppercase" }}>{ui.timer.done}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.timer.guessPhase}</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={() => { if (done) return; setRun((current) => !current); }} disabled={done} style={S.pbtn(ACC.red, "rgba(248,113,113,.1)")}>{run ? ui.timer.pause : ui.timer.start}</button>
        <button onClick={() => { clearInterval(ref.current); setRun(false); setRem(dur); setDone(false); }} style={{ ...S.pbtn(C.bdr, C.sur), color: C.muted }}>{ui.timer.reset}</button>
      </div>
    </div>
  );
}

function RoundOverview({ room, players, ui, C, S }) {
  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const others = getAudience(players, narratorId, HUB_PLAYER_NAME);
  const narrator = getVisiblePlayers(players, HUB_PLAYER_NAME).find((player) => player.id === narratorId);
  const past = room.past_narrators || [];
  const doneAll = others.every((player) => past.includes(player.id));

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>{ui.rounds.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: C.muted }}>{ui.rounds.round}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: ACC.gold }}>{room.round || 1}</div>
        </div>
        {narrator && (
          <div style={{ background: C.sur2, borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎤</span>
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{ui.rounds.currentNarrator}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.txt }}>{narrator.name}</div>
            </div>
          </div>
        )}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {others.map((player) => {
            const was = past.includes(player.id);
            const current = player.id === room.narrator_id;
            return (
              <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <span style={{ fontSize: 16 }}>{current ? "🎤" : was ? "✅" : "⏳"}</span>
                <span style={{ fontSize: 14, color: C.txt, flex: 1 }}>{player.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{current ? ui.rounds.current : was ? ui.rounds.done : ui.rounds.waiting}</span>
                </div>
              </li>
            );
          })}
        </ul>
        {doneAll && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.3)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ACC.greenl }}>{ui.rounds.allNarrators}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.rounds.gameFinished}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function HostApp({ roomId, hostName, onLeave, onOpenTv, lang, ui, contentLang, setContentLang, C, S }) {
  const viewport = useViewport();
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState("lobby");
  const [storyWords, setStoryWords] = useState([]);
  const [narratorVotes, setNarratorVotes] = useState({});
  const [narratorAwarded, setNarratorAwarded] = useState(false);
  const [finalizingNarratorVote, setFinalizingNarratorVote] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [awardedPlayerIds, setAwardedPlayerIds] = useState([]);
  const voteChannelRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      if (currentRoom?.story_words) setStoryWords(currentRoom.story_words);
      const { data: currentPlayers } = await sb.from("players").select("*").eq("room_id", roomId).order("joined_at");
      setPlayers(currentPlayers || []);
    }
    load();
    const channel = sb.channel(`host-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.story_words) setStoryWords(payload.new.story_words);
      })
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [roomId]);

  useEffect(() => {
    const voteChannel = sb.channel(`room-votes-${roomId}`)
      .on("broadcast", { event: "narrator-vote" }, ({ payload }) => {
        setNarratorVotes((current) => ({ ...current, [payload.playerId]: payload }));
      })
      .on("broadcast", { event: "vote-reset" }, () => {
        setNarratorVotes({});
        setNarratorAwarded(false);
        setFinalizingNarratorVote(false);
      })
      .on("broadcast", { event: "vote-result" }, ({ payload }) => {
        setNarratorAwarded(!!payload.awarded);
      })
      .subscribe();
    voteChannelRef.current = voteChannel;
    return () => {
      voteChannelRef.current = null;
      sb.removeChannel(voteChannel);
    };
  }, [roomId]);

  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const currentWords = getAudience(players, narratorId, HUB_PLAYER_NAME).map((player) => player.secret_word).filter(Boolean);

  async function chooseNextNarrator(nextPlayer) {
    const currentPast = room?.past_narrators || [];
    const nextPast = Array.from(new Set([...currentPast, nextPlayer.id]));
    await sb.from("rooms").update({
      narrator_id: nextPlayer.id,
      host_name: nextPlayer.name,
      round: (room?.round || 1) + 1,
      past_narrators: nextPast,
      story: null,
      story_words: [],
      status: GAME_PHASES.WAITING,
    }).eq("id", roomId);

    await sb.from("players").update({
      secret_word: null,
      secret_action: null,
      ready: false,
      rerolled: false,
    }).eq("room_id", roomId);

    setStoryWords([]);
    setNarratorVotes({});
    setNarratorAwarded(false);
    setFinalizingNarratorVote(false);
    setAwardedPlayerIds([]);
    setTab("lobby");
  }

  async function openResolution() {
    setNarratorVotes({});
    setNarratorAwarded(false);
    setFinalizingNarratorVote(false);
    setAwardedPlayerIds([]);
    await sb.from("rooms").update({ status: GAME_PHASES.REVEALED }).eq("id", roomId);
    setTab("resolve");
  }

  async function openScores() {
    setNarratorVotes({});
    setNarratorAwarded(false);
    setFinalizingNarratorVote(false);
    await sb.from("rooms").update({ status: GAME_PHASES.VOTING }).eq("id", roomId);
    if (voteChannelRef.current) {
      await voteChannelRef.current.send({ type: "broadcast", event: "vote-reset", payload: {} });
    }
    setTab("scores");
  }

  async function awardPlayer(player) {
    if (awardedPlayerIds.includes(player.id)) return;
    await sb.from("players").update({ score: (player.score || 0) + 1 }).eq("id", player.id);
    setAwardedPlayerIds((current) => [...current, player.id]);
  }

  async function finalizeNarratorVote(awarded) {
    if (finalizingNarratorVote || room?.status === GAME_PHASES.VOTED) return;
    setFinalizingNarratorVote(true);
    const narrator = players.find((player) => player.id === narratorId);
    if (awarded && narrator) {
      await sb.from("players").update({ score: (narrator.score || 0) + 1 }).eq("id", narrator.id);
    }
    await sb.from("rooms").update({ status: GAME_PHASES.VOTED }).eq("id", roomId);
    setNarratorAwarded(!!awarded);
    if (voteChannelRef.current) {
      await voteChannelRef.current.send({ type: "broadcast", event: "vote-result", payload: { awarded: !!awarded } });
    }
    setFinalizingNarratorVote(false);
  }

  async function deleteRoom() {
    if (deletingRoom) return;
    const confirmed = window.confirm(ui.confirmDeleteRoom);
    if (!confirmed) return;
    setDeletingRoom(true);
    const { error: deletePlayersError } = await sb.from("players").delete().eq("room_id", roomId);
    if (deletePlayersError) {
      setDeletingRoom(false);
      window.alert(ui.deleteRoomError);
      return;
    }
    const { error: deleteRoomError } = await sb.from("rooms").delete().eq("id", roomId);
    if (deleteRoomError) {
      setDeletingRoom(false);
      window.alert(ui.deleteRoomError);
      return;
    }
    setDeletingRoom(false);
    onLeave();
  }

  async function removePlayer(player) {
    const { error } = await sb.from("players").delete().eq("id", player.id);
    return !error;
  }

  const tabs = [
    { id: "lobby", icon: "🏠", label: ui.hostTabs.lobby },
    { id: "cards", icon: "🎴", label: ui.hostTabs.cards },
    { id: "ready", icon: "⏳", label: ui.hostTabs.ready },
    { id: "story", icon: "✨", label: ui.hostTabs.story },
    { id: "resolve", icon: "🎭", label: ui.hostTabs.resolve },
    { id: "scores", icon: "🏆", label: ui.hostTabs.scores },
  ];

  async function handleTabChange(nextTab) {
    if (nextTab === "resolve") {
      await openResolution();
      return;
    }
    if (nextTab === "scores") {
      await openScores();
      return;
    }
    setTab(nextTab);
  }

  if (tab === "story") {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <HostStory
          room={room || { id: roomId, difficulty: room?.difficulty }}
          storyWords={currentWords.length > 0 ? currentWords : storyWords}
          ui={ui}
          contentLang={contentLang}
          C={C}
          S={S}
          onOpenResolution={openResolution}
          stageMode
          onExitStage={() => setTab("ready")}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{ background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "10px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, boxShadow: C.bg === "#0d0d14" ? "0 10px 24px rgba(0,0,0,.14)" : "0 12px 26px rgba(15,23,42,.05)" }}>
        <div>
          <span style={{ fontSize: 11, color: C.muted }}>{ui.common.room} </span>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3, color: C.txt }}>{roomId}</span>
          <span style={{ fontSize: 11, color: C.muted }}> · {hostName}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button onClick={deleteRoom} disabled={deletingRoom} style={{ ...S.sbtn(C.muted), borderColor: "rgba(248,113,113,.3)", color: ACC.redl, background: "transparent", opacity: deletingRoom ? 0.7 : 0.9, fontSize: 11, padding: "8px 10px" }}>
            {deletingRoom ? ui.common.deleting : ui.common.deleteRoom}
          </button>
          <ExitIconButton onClick={onLeave} label={ui.common.leave} C={C} S={S} />
        </div>
      </div>
      <nav>
        <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "repeat(6,1fr)" : viewport.isTablet ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: 6, marginBottom: 12 }}>
          {tabs.map((tabEntry) => (
            <button key={tabEntry.id} onClick={() => handleTabChange(tabEntry.id)} aria-selected={tab === tabEntry.id} style={{ background: tab === tabEntry.id ? "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))" : C.sur, border: `1.5px solid ${tab === tabEntry.id ? ACC.blue : C.bdr}`, color: tab === tabEntry.id ? ACC.bluel : C.muted, fontSize: viewport.isDesktop ? 11 : 9, fontWeight: 700, padding: viewport.isDesktop ? "12px 8px 10px" : "10px 4px 8px", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", minHeight: viewport.isDesktop ? 72 : 62 }}>
              <span style={{ fontSize: viewport.isDesktop ? 17 : 15 }}>{tabEntry.icon}</span><span>{tabEntry.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {tab === "lobby" && <HostLobby room={room || { id: roomId }} players={players} gameLang={contentLang} lang={lang} ui={ui} C={C} S={S} acc={ACC} appUrl={APP_URL} hubPlayerName={HUB_PLAYER_NAME} onStart={() => setTab("cards")} onOpenTv={onOpenTv} onRemovePlayer={removePlayer} />}
      {tab === "cards" && <HostCards room={room || { id: roomId }} players={players} ui={ui} lang={lang} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} acc={ACC} hubPlayerName={HUB_PLAYER_NAME} allWordsByLang={ALL_WORDS_BY_LANG} allActionsByLang={ALL_ACTIONS_BY_LANG} onCardsDealt={(words) => { setStoryWords(words); setAwardedPlayerIds([]); setTab("ready"); }} onCelebrate={vibrate} />}
      {tab === "ready" && <ReadyCheck room={room || { id: roomId }} players={players} ui={ui} C={C} S={S} acc={ACC} hubPlayerName={HUB_PLAYER_NAME} onAllReady={() => setTab("story")} onCelebrate={vibrate} />}
      {tab === "story" && <HostStory room={room || { id: roomId }} storyWords={currentWords.length > 0 ? currentWords : storyWords} ui={ui} contentLang={contentLang} C={C} S={S} onOpenResolution={openResolution} />}
      {tab === "resolve" && <Resolution room={room || { id: roomId }} players={players} storyWords={currentWords.length > 0 ? currentWords : storyWords} ui={ui} C={C} S={S} onOpenScores={openScores} />}
      {tab === "scores" && <Scores room={room || { id: roomId }} players={players} ui={ui} C={C} S={S} votes={narratorVotes} narratorAwarded={narratorAwarded} finalizingNarratorVote={finalizingNarratorVote} onFinalizeNarratorVote={finalizeNarratorVote} onChooseNarrator={chooseNextNarrator} awardedPlayerIds={awardedPlayerIds} onAwardPlayer={awardPlayer} />}
    </div>
  );
}

function PlayerView({ roomId, playerName, onLeave, ui, contentLang, setContentLang, C, S }) {
  const viewport = useViewport();
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [cardRevealed, setCardRevealed] = useState({ word: false, action: false });
  const [rerolled, setRerolled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);
  const [narratorVote, setNarratorVote] = useState(null);
  const [voteResult, setVoteResult] = useState(null);
  const [pointsView, setPointsView] = useState("vote");
  const voteChannelRef = useRef(null);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      const { data: currentPlayer } = await sb.from("players").select("*").eq("room_id", roomId).eq("name", playerName).order("joined_at", { ascending: false }).limit(1).single();
      if (currentPlayer) {
        setPlayer(currentPlayer);
        setIsReady(!!currentPlayer.ready);
        setRerolled(!!currentPlayer.rerolled);
        setContentLang((current) => detectLanguageFromSample(currentPlayer.secret_word, currentPlayer.secret_action, current, WORD_LOOKUPS, ACTION_LOOKUPS));
      } else {
        setPlayer(null);
      }
    }
    load();
    const channel = sb.channel(`player-${roomId}-${playerName}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.new.name === playerName) {
          setPlayer(payload.new);
          setIsReady(!!payload.new.ready);
          setRerolled(!!payload.new.rerolled);
          setContentLang((current) => detectLanguageFromSample(payload.new.secret_word, payload.new.secret_action, current, WORD_LOOKUPS, ACTION_LOOKUPS));
          if (!payload.old?.secret_word && payload.new.secret_word) {
            vibrate([100, 50, 200]);
            setCardRevealed({ word: false, action: false });
          }
        }
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.old?.name === playerName) {
          window.alert(ui.player.kicked);
          onLeave();
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();
    const voteChannel = sb.channel(`room-votes-${roomId}`)
      .on("broadcast", { event: "vote-reset" }, () => {
        setNarratorVote(null);
        setVoteResult(null);
      })
      .on("broadcast", { event: "vote-result" }, ({ payload }) => setVoteResult(!!payload.awarded))
      .subscribe();
    voteChannelRef.current = voteChannel;
    return () => {
      voteChannelRef.current = null;
      sb.removeChannel(channel);
      sb.removeChannel(voteChannel);
    };
  }, [roomId, playerName, setContentLang, onLeave, ui.player.kicked]);

  async function doReroll() {
    const storyStarted = !!room?.story || ACTIVE_ROUND_PHASES.includes(room?.status);
    if (rerolled || !player || storyStarted) return;
    const { data: all } = await sb.from("players").select("secret_word,secret_action").eq("room_id", roomId);
    const usedWords = all.map((entry) => entry.secret_word).filter(Boolean);
    const usedActions = all.map((entry) => entry.secret_action).filter(Boolean);
    const activeLang = detectLanguageFromSample(player.secret_word, player.secret_action, contentLang, WORD_LOOKUPS, ACTION_LOOKUPS);
    const newWord = shuffle(ALL_WORDS_BY_LANG[activeLang].filter((word) => !usedWords.includes(word)))[0] || player.secret_word;
    const newAction = shuffle(ALL_ACTIONS_BY_LANG[activeLang].filter((action) => !usedActions.includes(action)))[0] || player.secret_action;
    await sb.from("players").update({ secret_word: newWord, secret_action: newAction, rerolled: true, ready: false }).eq("id", player.id);
    setPlayer((current) => ({ ...current, secret_word: newWord, secret_action: newAction, rerolled: true, ready: false }));
    setCardRevealed({ word: false, action: false });
    setIsReady(false);
    setRerolled(true);
    setContentLang(activeLang);
    vibrate([80, 40, 80]);
  }

  async function markReady() {
    if (isReady || !player) return;
    setMarkingReady(true);
    await sb.from("players").update({ ready: true }).eq("id", player.id);
    setIsReady(true);
    vibrate([100, 50, 200]);
    setMarkingReady(false);
  }

  async function castNarratorVote(vote) {
    if (!player || narratorVote !== null || !voteChannelRef.current) return;
    await voteChannelRef.current.send({ type: "broadcast", event: "narrator-vote", payload: { playerId: player.id, playerName: player.name, vote } });
    setNarratorVote(vote);
    setVoteResult(null);
  }

  if (!player || !room) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⏳</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>{ui.common.loading}</div>
      </div>
    );
  }

  const hasCards = player.secret_word && player.secret_action;
  const bothRevealed = cardRevealed.word && cardRevealed.action;
  const playerPhase = getPlayerPhase(room, player, bothRevealed, isReady, ui);
  const storyStarted = !!room.story || ACTIVE_ROUND_PHASES.includes(room.status);
  const inPointsView = SCORE_PHASES.includes(room.status);

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(96,165,250,.3)", background: "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03))", textAlign: "center", padding: "12px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 34px", alignItems: "start", gap: 10 }}>
          <div />
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{ui.player.inRoom}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: C.txt }}>{roomId}</div>
            <div style={{ fontSize: 13, color: ACC.blue, marginTop: 2 }}>{ui.player.as} {playerName}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ExitIconButton onClick={onLeave} label={ui.common.leaveRoom} C={C} S={S} />
          </div>
        </div>
      </div>

      <div style={{ ...S.card, borderColor: "rgba(96,165,250,.24)", background: "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: ACC.blue, marginBottom: 8 }}>{ui.common.phaseTitle}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.txt }}>{playerPhase}</div>
          </div>
          <HelpPopover title={playerPhase} ui={ui} C={C} S={S} acc={ACC} align="left">
            <div>{inPointsView ? ui.player.pointsDesc : ui.player.reactHint}</div>
            <div>{inPointsView ? ui.player.narratorVoteDesc : ui.player.revealBoth}</div>
          </HelpPopover>
        </div>
      </div>

      {!hasCards ? (
        <div style={{ ...S.card, textAlign: "center", padding: "28px 20px", borderStyle: "dashed" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 2s infinite" }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 6 }}>{ui.player.waitingCards}</div>
          <p style={S.bt}>{ui.player.hostDealing}</p>
        </div>
      ) : inPointsView ? (
        <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "minmax(0, 1fr) minmax(320px, 0.9fr)" : "1fr", gap: 14, alignItems: "start" }}>
          <div>
            <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ ...S.st, marginBottom: 0 }}>{ui.player.pointsTitle}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPointsView("vote")} style={{ ...S.sbtn(pointsView === "vote" ? ACC.blue : C.muted), background: pointsView === "vote" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.player.voteView}</button>
                  <button onClick={() => setPointsView("card")} style={{ ...S.sbtn(pointsView === "card" ? ACC.blue : C.muted), background: pointsView === "card" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.player.cardView}</button>
                </div>
              </div>
              <p style={{ ...S.bt, marginBottom: pointsView === "card" ? 12 : 0 }}>{ui.player.pointsDesc}</p>
              {pointsView === "card" && (
                <div style={{ ...S.card2, marginBottom: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 8 }}>{ui.player.secretWord}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: ACC.bluel }}>{player.secret_word}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto" }}>
            {pointsView === "vote" && room.status === GAME_PHASES.VOTING && (
              <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.gold, marginBottom: 8 }}>{ui.player.narratorVoteTitle}</div>
                <p style={{ ...S.bt, marginBottom: 12 }}>{ui.player.narratorVoteDesc}</p>
                {narratorVote === null ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <button onClick={() => castNarratorVote(true)} style={S.pbtn(ACC.green, "rgba(74,222,128,.1)")}>{ui.player.narratorVoteYes}</button>
                    <button onClick={() => castNarratorVote(false)} style={S.pbtn(C.bdr, C.sur2)}>{ui.player.narratorVoteNo}</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 14, background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.24)", color: ACC.greenl, fontSize: 14, fontWeight: 700 }}>
                    {ui.player.narratorVoteSent}
                  </div>
                )}
              </div>
            )}

            {pointsView === "vote" && room.status === GAME_PHASES.VOTED && voteResult !== null && (
              <div style={{ ...S.card, borderColor: voteResult ? "rgba(74,222,128,.3)" : C.bdr, background: voteResult ? "linear-gradient(180deg, rgba(74,222,128,.12), rgba(74,222,128,.05))" : "linear-gradient(180deg, rgba(148,163,184,.14), rgba(148,163,184,.06))", marginTop: 12, padding: "18px 18px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: voteResult ? ACC.green : C.muted, marginBottom: 8 }}>
                  {ui.player.narratorVoteTitle}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: voteResult ? ACC.greenl : C.txt, lineHeight: 1.35 }}>
                  {voteResult ? ui.player.narratorVoteApproved : ui.player.narratorVoteRejected}
                </div>
              </div>
            )}

            {pointsView === "vote" && room.status === GAME_PHASES.VOTED && voteResult === null && (
              <div style={{ ...S.card, borderColor: "rgba(96,165,250,.24)", background: "rgba(96,165,250,.06)", marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ACC.bluel }}>{ui.player.narratorVotePending}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, alignItems: "start" }}>
          <div>
          <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{ui.player.secretCards}</div>
              <button onClick={doReroll} disabled={rerolled || storyStarted} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 10, cursor: rerolled || storyStarted ? "not-allowed" : "pointer", border: `1px solid ${rerolled || storyStarted ? C.bdr : "rgba(251,191,36,.4)"}`, background: rerolled || storyStarted ? "rgba(90,90,110,.2)" : "rgba(251,191,36,.12)", color: rerolled || storyStarted ? C.muted : ACC.gold }}>
                {rerolled ? ui.player.rerolled : ui.player.reroll}
              </button>
            </div>
            {bothRevealed && !isReady && (
              <button onClick={markReady} disabled={markingReady} style={{ ...S.pbtn(ACC.green, "rgba(74,222,128,.1)"), marginBottom: 12, animation: "fadeIn .3s ease" }}>
                {markingReady ? "…" : ui.player.readyButton}
              </button>
            )}
            <div style={{ display: "grid", gridTemplateColumns: viewport.isPhone ? "1fr" : "1fr 1fr", gap: 0 }}>
              {[
                { key: "word", type: ui.player.secretWord, value: player.secret_word, blue: true },
                { key: "action", type: ui.player.secretAction, value: player.secret_action, blue: false },
              ].map((cell, index) => {
                const revealed = cardRevealed[cell.key];
                return (
                  <button key={cell.key} onClick={() => setCardRevealed((current) => ({ ...current, [cell.key]: !current[cell.key] }))} style={{ padding: 14, cursor: "pointer", minHeight: viewport.isDesktop ? 130 : 90, textAlign: "left", background: "transparent", border: "none", borderRight: !viewport.isPhone && index === 0 ? `1px solid ${C.bdr}` : "none", borderBottom: viewport.isPhone && index === 0 ? `1px solid ${C.bdr}` : "none", display: "block", width: "100%" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: cell.blue ? ACC.blue : ACC.red }}>
                      <span aria-hidden="true">{cell.blue ? "🔵" : "🔴"} </span>{cell.type}
                    </div>
                    <div style={{ fontSize: viewport.isDesktop ? 17 : 15, fontWeight: 700, lineHeight: 1.4, color: cell.blue ? ACC.bluel : ACC.redl, filter: revealed ? "none" : "blur(7px)", transition: "filter .25s", userSelect: revealed ? "auto" : "none" }}>{cell.value}</div>
                    {!revealed && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{ui.player.tapReveal}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {isReady && (
            <div style={{ ...S.card, borderColor: "rgba(74,222,128,.3)", background: "rgba(74,222,128,.06)", textAlign: "center", padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: ACC.greenl }}>{ui.player.readyState}</div>
            </div>
          )}

          {!bothRevealed && (
            <div style={{ ...S.card2, textAlign: "center", padding: "12px 16px", marginBottom: 12 }}>
              <p style={{ ...S.bt, fontSize: 13 }}>{ui.player.revealBoth}</p>
            </div>
          )}

          {room.story && (
            <div style={{ ...S.card, borderColor: "rgba(96,165,250,.2)", background: "rgba(96,165,250,.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 8 }}>{ui.player.storyRunning}</div>
              <p style={{ ...S.bt, fontStyle: "italic" }}>{ui.player.reactHint}</p>
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: ACC.bluel }}>{ui.player.yourWord} <span style={{ background: "rgba(96,165,250,.15)", padding: "2px 10px", borderRadius: 20 }}>{player.secret_word}</span></div>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

function JoinScreen({ initialCode, onJoined, ui, C, S }) {
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    if (!code.trim() || !name.trim()) { setError(ui.join.emptyError); return; }
    if (name.trim() === HUB_PLAYER_NAME) { setError(ui.join.nameTaken); return; }
    setLoading(true);
    setError("");
    const { data: room } = await sb.from("rooms").select("*").eq("id", code.toUpperCase().trim()).single();
    if (!room) { setError(ui.join.roomNotFound); setLoading(false); return; }
    if (room.password && room.password !== pw) { setNeedPw(true); setError(ui.join.wrongPassword); setLoading(false); return; }
    const { data: existing } = await sb.from("players").select("id").eq("room_id", room.id).eq("name", name.trim()).single();
    if (existing) { setError(ui.join.nameTaken); setLoading(false); return; }
    const { data: joinedPlayer, error: joinError } = await sb.from("players").insert({ room_id: room.id, name: name.trim(), is_host: false }).select().single();
    if (joinError || !joinedPlayer) { setError(ui.join.genericError); setLoading(false); return; }
    onJoined(room.id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <EntryHero C={C} S={S} title={ui.join.title} desc={ui.join.desc} accent={ACC.blue} appIcon={APP_ICON} />
      <div style={{ ...S.card, padding: "18px 16px", marginBottom: 12 }}>
        <button onClick={join} disabled={loading} style={{ ...S.pbtn(ACC.green, "rgba(74,222,128,.1)"), marginBottom: 16 }}>
          {loading ? ui.join.connecting : ui.join.button}
        </button>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.roomCode}</label>
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder={ui.join.roomPlaceholder} maxLength={5} style={{ ...S.input, fontSize: 22, fontWeight: 800, letterSpacing: 6, textAlign: "center", marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.yourName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && !needPw && join()} placeholder={ui.join.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: needPw ? 14 : 0 }} />
        {needPw && <>
          <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.password}</label>
          <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} onKeyDown={(event) => event.key === "Enter" && join()} placeholder={ui.join.passwordPlaceholder} style={S.input} />
        </>}
        {error && <p style={{ fontSize: 13, color: ACC.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <EntryNoteCard label={ui.common.status} title={ui.join.cardHintTitle} text={ui.join.cardHintText} C={C} />
        <EntryNoteCard label={ui.hostTabs.lobby} title={ui.join.qrHintTitle} text={ui.join.qrHintText} C={C} />
      </div>
    </div>
  );
}

function CreateRoom({ onCreated, ui, C, S }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!name.trim()) { setError(ui.create.emptyError); return; }
    setLoading(true);
    setError("");
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    const id = roomCode();
    const { error: createError } = await sb.from("rooms").insert({ id, host_name: name.trim(), status: GAME_PHASES.WAITING, password: pw || null });
    if (createError) { setError(ui.create.genericError); setLoading(false); return; }
    const { data: hostPlayer, error: hostError } = await sb.from("players").insert({ room_id: id, name: name.trim(), is_host: true }).select().single();
    if (hostError) { setError(ui.create.genericError); setLoading(false); return; }
    await sb.from("rooms").update({ narrator_id: hostPlayer.id, past_narrators: [hostPlayer.id], round: 1 }).eq("id", id);
    onCreated(id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <EntryHero C={C} S={S} title={ui.create.title} desc={ui.create.desc} accent={ACC.gold} appIcon={APP_ICON} />
      <div style={{ ...S.card, padding: "18px 16px", marginBottom: 12 }}>
        <button onClick={create} disabled={loading} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), marginBottom: 16 }}>
          {loading ? ui.create.creating : ui.create.button}
        </button>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.create.hostName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && create()} placeholder={ui.create.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>
          {ui.common.password} <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>({ui.common.optional})</span>
        </label>
        <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} placeholder={ui.create.emptyPassword} maxLength={20} style={S.input} />
        {error && <p style={{ fontSize: 13, color: ACC.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <EntryNoteCard label={ui.common.host} title={ui.create.flowTitle} text={ui.create.flowText} C={C} />
        <EntryNoteCard label={ui.hostLobby.tvHub} title={ui.create.partyTitle} text={ui.create.partyText} C={C} />
      </div>
    </div>
  );
}

function RoomShell({ roomId, playerName, onLeave, onOpenTv, lang, ui, contentLang, setContentLang, C, S }) {
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [presenceReady, setPresenceReady] = useState(false);
  const [takingOver, setTakingOver] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      const { data: currentPlayer } = await sb.from("players").select("*").eq("room_id", roomId).eq("name", playerName).order("joined_at", { ascending: false }).limit(1).single();
      setPlayer(currentPlayer || null);
    }
    load();
    const channel = sb.channel(`room-shell-${roomId}-${playerName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [roomId, playerName]);

  useEffect(() => {
    if (!player || !room) return undefined;
    const presenceChannel = sb.channel(`presence-room-${roomId}`, { config: { presence: { key: `player-${player.id}` } } });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        setActiveSessions(flattenPresence(presenceChannel.presenceState()));
        setPresenceReady(true);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ playerId: player.id, playerName: player.name, narrator: room.narrator_id === player.id, joinedAt: new Date().toISOString() });
        }
      });
    return () => sb.removeChannel(presenceChannel);
  }, [roomId, player?.id, player?.name, room?.id, room?.narrator_id]);

  if (!player || !room) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⏳</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>{ui.common.loading}</div>
      </div>
    );
  }

  const isNarrator = room.narrator_id ? room.narrator_id === player.id : player.is_host;
  const activeIds = activeSessions.map((session) => session.playerId).filter(Boolean);
  const narratorOnline = !!room.narrator_id && activeIds.includes(room.narrator_id);
  const canTakeOver = presenceReady && !isNarrator && (!room.narrator_id || !narratorOnline);

  async function takeOverRoom() {
    if (!player || takingOver) return;
    setTakingOver(true);
    await sb.from("rooms").update({ narrator_id: player.id, host_name: player.name }).eq("id", roomId);
    setTakingOver(false);
  }

  if (isNarrator) {
    return <HostApp roomId={roomId} hostName={playerName} onLeave={onLeave} onOpenTv={onOpenTv} lang={lang} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />;
  }

  return (
    <div>
      {canTakeOver && (
        <div style={{ ...S.card, borderColor: "rgba(251,191,36,.35)", background: "linear-gradient(180deg, rgba(251,191,36,.12), rgba(251,191,36,.04))" }}>
          <div style={{ ...S.st, marginBottom: 8 }}>{ui.player.takeOverTitle}</div>
          <p style={{ ...S.bt, marginBottom: 14 }}>{ui.player.takeOverDesc}</p>
          <button onClick={takeOverRoom} disabled={takingOver} style={S.pbtn(ACC.gold, "rgba(251,191,36,.10)")}>
            {takingOver ? ui.common.takingOver : ui.common.takeOverRoom}
          </button>
        </div>
      )}
      <PlayerView roomId={roomId} playerName={playerName} onLeave={onLeave} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />
    </div>
  );
}

function TVScreen({ roomId, lang, ui, C, S, onLeave, tvKey }) {
  const viewport = useViewport();
  const tvTwoPane = viewport.width >= 1360 && viewport.height >= 720;
  const tvLarge = viewport.width >= 1680;
  const tvPad = tvLarge ? 26 : viewport.isDesktop ? 20 : 16;
  const tvCard = {
    background: "rgba(8,10,18,.94)",
    border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 18,
    boxShadow: "0 14px 36px rgba(0,0,0,.28)",
  };
  const tvLabel = { fontSize: 10, fontWeight: 800, letterSpacing: 2.2, textTransform: "uppercase", color: "#d6defa" };
  const tvBody = { color: "#f7f8fc" };
  const tvMuted = { color: "#c5cee6" };
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [narratorVotes, setNarratorVotes] = useState({});
  const [narratorAwarded, setNarratorAwarded] = useState(null);

  function exitTvScreen() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = APP_URL;
  }

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom || null);
      const { data: currentPlayers } = await sb.from("players").select("*").eq("room_id", roomId).order("joined_at");
      setPlayers(currentPlayers || []);
    }
    load();
    const channel = sb.channel(`tv-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, () => load())
      .subscribe();
    const voteChannel = sb.channel(`tv-room-votes-${roomId}`)
      .on("broadcast", { event: "narrator-vote" }, ({ payload }) => {
        setNarratorVotes((current) => ({ ...current, [payload.playerId]: payload }));
      })
      .on("broadcast", { event: "vote-reset" }, () => {
        setNarratorVotes({});
        setNarratorAwarded(null);
      })
      .on("broadcast", { event: "vote-result" }, ({ payload }) => {
        setNarratorAwarded(!!payload.awarded);
      })
      .subscribe();
    return () => {
      sb.removeChannel(channel);
      sb.removeChannel(voteChannel);
    };
  }, [roomId]);

  if (!room) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⏳</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>{ui.common.loading}</div>
      </div>
    );
  }

  const tvLocked = !!room.password && tvKey !== room.password;

  if (tvLocked) {
    return (
      <div style={{ animation: "fadeIn .3s ease" }}>
        <div style={{ ...S.card, ...tvCard, maxWidth: 560, margin: "48px auto 0", textAlign: "center", padding: 22, borderColor: "rgba(251,191,36,.34)", background: "linear-gradient(180deg, rgba(28,20,8,.96), rgba(12,12,18,.96))" }}>
          <div style={{ ...tvLabel, color: ACC.gold, marginBottom: 12 }}>{ui.hostLobby.tvHub}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: tvBody.color, marginBottom: 10 }}>{ui.tv.blockedTitle}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: tvMuted.color, marginBottom: 18 }}>{ui.tv.blockedDesc}</div>
          <button onClick={exitTvScreen} style={S.pbtn(ACC.gold, "rgba(251,191,36,.10)")}>{ui.common.back}</button>
        </div>
      </div>
    );
  }

  const narratorId = getNarratorId(room, players, HUB_PLAYER_NAME);
  const narrator = getVisiblePlayers(players, HUB_PLAYER_NAME).find((player) => player.id === narratorId);
  const audience = getAudience(players, narratorId, HUB_PLAYER_NAME);
  const readyCount = audience.filter((player) => player.ready).length;
  const lobbyLikeStatus = PRE_STORY_PHASES.includes(room.status);
  const compactLobbyLayout = lobbyLikeStatus && viewport.width >= 1100;
  const allVotes = Object.values(narratorVotes);
  const yesVotes = allVotes.filter((vote) => vote.value === "yes").length;
  const noVotes = allVotes.filter((vote) => vote.value === "no").length;
  const revealWords = audience.map((player) => player.secret_word).filter(Boolean);
  const roundLang = detectRoundLanguage(room, players, lang);
  const tvJoinUrl = `${APP_URL}?room=${room.id}&lang=${roundLang}`;
  const tvFreestyleWords = parseFreestyleWords(room.story);
  const tvFreestyleMode = tvFreestyleWords.length > 0;

  return (
    <div style={{ animation: "fadeIn .3s ease", minHeight: "100vh", padding: tvTwoPane ? "16px 20px 20px" : viewport.isDesktop ? "14px 16px 18px" : "10px 10px 14px" }}>
      <div style={{ ...S.card, ...tvCard, marginBottom: 14, padding: tvPad, background: "linear-gradient(135deg, rgba(14,18,32,.98), rgba(18,16,12,.96))", borderColor: "rgba(255,255,255,.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...tvLabel, color: "#95b8ff", marginBottom: 6 }}>{ui.tv.label}</div>
            <div style={{ fontSize: tvLarge ? 56 : viewport.isDesktop ? 46 : 30, fontWeight: 900, letterSpacing: tvLarge ? 7 : 5, color: tvBody.color, lineHeight: 1 }}>{room.id}</div>
            <div style={{ fontSize: tvLarge ? 14 : 12, color: tvMuted.color, marginTop: 6 }}>{ui.tv.meta}</div>
          </div>
          <div style={{ display: "flex", gap: 8, opacity: 0.72 }}>
            <button onClick={exitTvScreen} style={S.sbtn(C.muted)}>{ui.common.back}</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: compactLobbyLayout ? "minmax(0, 1.1fr) minmax(240px, 0.78fr) minmax(220px, 0.7fr)" : tvTwoPane ? "minmax(0, 1.15fr) minmax(300px, 0.75fr)" : "1fr", gap: 12, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ ...S.card, ...tvCard, minHeight: compactLobbyLayout ? 0 : tvTwoPane ? "calc(100vh - 144px)" : viewport.isDesktop ? 360 : "auto", marginBottom: 0, padding: tvPad, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
            <div>
              <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.common.status}</div>
              <div style={{ fontSize: tvLarge ? 30 : viewport.isDesktop ? 25 : 21, fontWeight: 900, color: tvBody.color, marginBottom: 10 }}>
                {room.status === GAME_PHASES.WAITING && ui.hostTabs.lobby}
                {room.status === GAME_PHASES.CARDS && ui.hostTabs.cards}
                {room.status === GAME_PHASES.PLAYING && ui.hostTabs.story}
                {room.status === GAME_PHASES.REVEALED && ui.hostTabs.resolve}
                {room.status === GAME_PHASES.VOTING && ui.hostTabs.scores}
                {room.status === GAME_PHASES.VOTED && ui.hostTabs.scores}
              </div>
              {room.story && (
                tvFreestyleMode ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#95b8ff", marginBottom: 10 }}>{ui.storyGen.freestyleWordPool}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {tvFreestyleWords.map((word) => (
                        <span key={word} style={{ fontSize: tvLarge ? 17 : 14, fontWeight: 700, color: tvBody.color, background: "rgba(96,165,250,.10)", border: "1px solid rgba(149,184,255,.24)", padding: "7px 12px", borderRadius: 999 }}>
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: tvLarge ? 19 : viewport.isDesktop ? 17 : 15, lineHeight: 1.72, color: tvBody.color, overflowWrap: "anywhere" }}>
                    {room.status === GAME_PHASES.REVEALED || SCORE_PHASES.includes(room.status)
                      ? renderHighlightedStory(room.story, revealWords, C)
                      : room.story.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </div>
                )
              )}
              {!room.story && (
                <div style={{ fontSize: tvLarge ? 17 : 15, color: tvMuted.color, lineHeight: 1.55 }}>
                  {room.status === GAME_PHASES.CARDS && `${readyCount} / ${audience.length} bereit`}
                  {room.status === GAME_PHASES.WAITING && ui.hostLobby.waiting}
                  {!PRE_STORY_PHASES.includes(room.status) && ui.common.loading}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
          <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
            <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.hostTabs.lobby}</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: tvBody.color }}>{narrator ? `${ui.common.host}: ${narrator.name}` : ui.common.host}</div>
              <div style={{ fontSize: 12, color: tvMuted.color }}>{audience.length} Mitspieler</div>
              {PRE_STORY_PHASES.includes(room.status) && (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 6 }}>
                    <div style={{ padding: 8, borderRadius: 14, background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.10)" }}>
                      <QRCode url={tvJoinUrl} size={tvLarge ? 176 : viewport.isDesktop ? 156 : 132} C={C} lang={lang} />
                    </div>
                  </div>
                  <div style={{ fontSize: 10, color: tvMuted.color, wordBreak: "break-all", overflowWrap: "anywhere", opacity: 0.9 }}>{tvJoinUrl}</div>
                </>
              )}
            </div>
          </div>

          {!compactLobbyLayout && <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
            <div style={{ ...tvLabel, marginBottom: 8 }}>Spieler</div>
            <div style={{ display: "grid", gridTemplateColumns: tvLarge && audience.length > 6 ? "1fr 1fr" : "1fr", gap: 8 }}>
              {audience.map((player) => (
                <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: tvBody.color }}>{player.name}</span>
                  <span style={{ fontSize: 11, color: player.ready ? ACC.greenl : tvMuted.color }}>
                    {player.ready ? "bereit" : "wartet"}
                  </span>
                </div>
              ))}
            </div>
            {audience.length === 0 && (
              <div style={{ fontSize: 13, color: tvMuted.color, lineHeight: 1.5 }}>
                {ui.hostLobby.empty}
              </div>
            )}
          </div>}

          {(SCORE_PHASES.includes(room.status)) && (
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.player.narratorVoteTitle}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(12,48,24,.92)", border: "1px solid rgba(74,222,128,.36)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.greenl, marginBottom: 6 }}>Ja</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: ACC.greenl }}>{yesVotes}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(28,32,42,.96)", border: "1px solid rgba(255,255,255,.12)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: tvMuted.color, marginBottom: 6 }}>Nein</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: tvBody.color }}>{noVotes}</div>
                </div>
              </div>
              {room.status === GAME_PHASES.VOTED && narratorAwarded !== null && (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: narratorAwarded ? ACC.greenl : ACC.gold }}>
                  {narratorAwarded ? ui.player.narratorVoteApproved : ui.player.narratorVoteRejected}
                </div>
              )}
            </div>
          )}

          {(SCORE_PHASES.includes(room.status)) && (
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.hostTabs.scores}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[...getVisiblePlayers(players, HUB_PLAYER_NAME)].sort((a, b) => (b.score || 0) - (a.score || 0)).map((player) => (
                  <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tvBody.color }}>{player.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: ACC.gold }}>{player.score || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {compactLobbyLayout && (
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>Spieler</div>
              {audience.length > 0 ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {audience.slice(0, 8).map((player) => (
                    <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: tvBody.color }}>{player.name}</span>
                      <span style={{ fontSize: 11, color: player.ready ? ACC.greenl : tvMuted.color }}>
                        {player.ready ? "bereit" : "wartet"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: tvMuted.color, lineHeight: 1.5 }}>
                  {ui.hostLobby.empty}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get("room");
  const rawUrlLang = params.get("lang");
  const rawView = params.get("view");
  const urlTvKey = params.get("tv") || "";
  const urlLang = rawUrlLang === "de" || rawUrlLang === "en" ? rawUrlLang : null;
  const urlView = rawView === "tv" ? "tv" : null;

  const [lang, setLang] = useLanguage(urlLang);
  const [contentLang, setContentLang] = useState(() => urlLang || lang);
  const viewport = useViewport();
  const [C, dark, toggleTheme] = useTheme();
  const S = makeStyles(C);
  const ui = UI[lang];

  const [screen, setScreen] = useState(urlRoom ? (urlView === "tv" ? "tv" : "join") : "home");
  const [roomId, setRoomId] = useState(urlRoom || "");
  const [myName, setMyName] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  const [showVersion, setShowVersion] = useState(false);
  const isGameScreen = screen === "host" || screen === "player" || screen === "tv";
  const isTvScreen = screen === "tv";

  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  const versionTapCount = useRef(0);
  const versionTapTimer = useRef(null);

  useEffect(() => {
    document.title = "Story Chaos";
  }, [lang]);

  function handleLogoTap() {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setShowDebug(true);
      addLog("info", ui.debug.debugOpened);
    }
  }

  function handleSubtitleTap() {
    versionTapCount.current += 1;
    clearTimeout(versionTapTimer.current);
    versionTapTimer.current = setTimeout(() => { versionTapCount.current = 0; }, 1500);
    if (versionTapCount.current >= 3) {
      versionTapCount.current = 0;
      setShowVersion(true);
      setTimeout(() => setShowVersion(false), 4000);
    }
  }

  function handleCreated(id, name) {
    setRoomId(id);
    setMyName(name);
    setScreen("host");
  }

  function handleJoined(id, name) {
    setRoomId(id);
    setMyName(name);
    setScreen("player");
  }

  function handleLeave() {
    setScreen("home");
    setRoomId("");
    setMyName("");
    window.history.replaceState({}, "", "/");
  }

  function handleOpenTv(tvKey = "", mode = "open", targetLang = contentLang) {
    if (!roomId) return;
    const protectedKey = tvKey ? `&tv=${encodeURIComponent(tvKey)}` : "";
    const targetUrl = `${APP_URL}?room=${roomId}&lang=${targetLang || contentLang || lang}&view=tv${protectedKey}`;
    if (mode === "copy") {
      navigator.clipboard?.writeText(targetUrl).catch(() => {});
      return;
    }
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }

  const GS = `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${C.bg};color:${C.txt};font-family:${FF};}
    button,input{font-family:${FF};}
    *:focus-visible{outline:3px solid ${dark ? "#fff" : "#000"}!important;outline-offset:2px!important;border-radius:4px;}
    *:focus:not(:focus-visible){outline:none!important;}
    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    input::placeholder{color:${C.muted};}
    input{color:${C.txt};}
  `;

  return (
    <div style={{ background: `radial-gradient(circle at top, ${dark ? "rgba(96,165,250,.08)" : "rgba(96,165,250,.10)"} 0%, ${C.bg} 34%)`, minHeight: "100vh", color: C.txt, fontFamily: FF }}>
      <style>{GS}</style>
      <div style={{ width: "100%", maxWidth: isTvScreen ? "none" : viewport.isDesktop ? 1160 : viewport.isTablet ? 760 : 500, margin: "0 auto", padding: isTvScreen ? 0 : viewport.isDesktop ? "0 20px 80px" : "0 14px 64px" }}>
        {!isTvScreen && <header style={{ textAlign: "center", padding: isGameScreen ? "12px 0 8px" : "24px 0 16px" }}>
          <div style={{ display: "flex", alignItems: isGameScreen ? "center" : "flex-start", justifyContent: "space-between", gap: 12, marginBottom: isGameScreen ? 6 : 16 }}>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <h1 onClick={handleLogoTap} style={{ fontSize: isGameScreen ? "clamp(18px,6.2vw,28px)" : "clamp(27px,8.8vw,50px)", fontWeight: 900, letterSpacing: isGameScreen ? "-0.045em" : "-0.06em", textTransform: "uppercase", background: "linear-gradient(135deg,#f59e0b,#facc15 45%,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 0.94, margin: 0, cursor: "default", userSelect: "none" }}>
                Story Chaos
              </h1>
              <p onClick={handleSubtitleTap} style={{ fontSize: isGameScreen ? 0 : 10, height: isGameScreen ? 0 : "auto", overflow: "hidden", letterSpacing: 3.2, color: C.muted, textTransform: "uppercase", marginTop: isGameScreen ? 0 : 8, paddingLeft: 2, cursor: "default", userSelect: "none", opacity: isGameScreen ? 0 : 1 }}>
                {ui.subtitle}
              </p>
            </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0, paddingTop: isGameScreen ? 0 : 2 }}>
            {!isGameScreen && screen !== "help" && (
              <button onClick={() => setScreen("help")} aria-label={ui.common.help} style={{ background: C.sur, border: `1px solid ${C.bdr}`, color: C.txt, minWidth: 38, height: isGameScreen ? 30 : 34, padding: "0 10px", borderRadius: 11, cursor: "pointer", fontSize: 11, fontWeight: 800, boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.03)" : "0 8px 20px rgba(15,23,42,.06)" }}>
                ?
              </button>
            )}
            <button onClick={() => setLang((current) => current === "de" ? "en" : "de")} aria-label={ui.aria.toggleLanguage} style={{ background: C.sur, border: `1px solid ${C.bdr}`, color: C.txt, minWidth: isGameScreen ? 38 : 42, height: isGameScreen ? 30 : 34, padding: isGameScreen ? "0 8px" : "0 10px", borderRadius: 11, cursor: "pointer", fontSize: isGameScreen ? 10 : 11, fontWeight: 800, boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.03)" : "0 8px 20px rgba(15,23,42,.06)" }}>
              {lang === "de" ? "DE" : "EN"}
            </button>
            <button onClick={toggleTheme} aria-label={ui.aria.toggleTheme} style={{ background: C.sur, border: `1px solid ${C.bdr}`, color: C.txt, width: isGameScreen ? 34 : 38, height: isGameScreen ? 30 : 34, padding: 0, borderRadius: 11, cursor: "pointer", fontSize: isGameScreen ? 14 : 15, boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.03)" : "0 8px 20px rgba(15,23,42,.06)" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
          </div>
          {showVersion && (
            <div style={{ textAlign: "right", fontSize: 10, color: C.muted, opacity: 0.45, letterSpacing: 0.6, paddingRight: 2, animation: "fadeIn .22s ease" }}>
              {APP_VERSION}
            </div>
          )}
        </header>}

        {!isTvScreen && <OfflineBanner C={C} ui={ui} acc={ACC} />}

        <main>
          {screen === "home" && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={{ ...S.card, textAlign: "left", padding: "22px 18px 18px", marginBottom: 14, borderRadius: 18, background: dark ? "linear-gradient(180deg, rgba(24,28,42,.98), rgba(18,20,30,.96))" : "linear-gradient(180deg, rgba(255,255,255,.98), rgba(243,247,255,.98))", boxShadow: dark ? "0 12px 40px rgba(0,0,0,.24)" : "0 18px 45px rgba(15,23,42,.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, display: "grid", placeItems: "center", filter: "drop-shadow(0 10px 24px rgba(0,0,0,.26))" }}>
                    <img src={APP_ICON} alt="Story Chaos icon" width="66" height="66" style={{ display: "block", objectFit: "contain" }} />
                  </div>
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, color: C.txt, marginBottom: 8, letterSpacing: "-0.04em" }}>{ui.home.welcome}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
                  <button onClick={() => setScreen("create")} style={{ ...S.pbtn(ACC.blue, dark ? "linear-gradient(180deg, rgba(96,165,250,.18), rgba(96,165,250,.08))" : "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))"), minHeight: 56, borderRadius: 13, boxShadow: "0 0 0 1px rgba(96,165,250,.18) inset" }}>{ui.home.newGame}</button>
                  <button onClick={() => setScreen("join")} style={{ ...S.pbtn(C.bdr, C.sur), minHeight: 52, borderRadius: 13, color: C.txt, background: dark ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.7)" }}>{ui.home.joinRoom}</button>
                </div>
                <p style={{ ...S.bt, fontSize: 15, lineHeight: 1.62, marginTop: 18 }}>{ui.home.desc}</p>
              </div>
              <div style={{ ...S.card, padding: "16px", borderRadius: 16, background: dark ? "rgba(24,24,35,.92)" : "rgba(255,255,255,.92)", boxShadow: dark ? "0 10px 30px rgba(0,0,0,.18)" : "0 16px 40px rgba(15,23,42,.06)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.2, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>{ui.home.howItWorks}</div>
                <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr 1fr" : "1fr", gap: 10 }}>
                  {ui.home.highlights.map((item) => (
                    <EntryNoteCard key={item.title} label={ui.home.howItWorks} title={item.title} text={item.text} C={C} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {screen === "help" && <div style={{ animation: "fadeIn .3s ease" }}><button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>{ui.common.back}</button><HelpScreen ui={ui} C={C} S={S} acc={ACC} appIcon={APP_ICON} /></div>}
          {screen === "create" && <div style={{ animation: "fadeIn .3s ease" }}><button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>{ui.common.back}</button><CreateRoom onCreated={handleCreated} ui={ui} C={C} S={S} /></div>}
          {screen === "join" && <div style={{ animation: "fadeIn .3s ease" }}><button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>{ui.common.back}</button><JoinScreen initialCode={urlRoom || ""} onJoined={handleJoined} ui={ui} C={C} S={S} /></div>}
          {screen === "host" && <RoomShell roomId={roomId} playerName={myName} onLeave={handleLeave} lang={lang} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} onOpenTv={handleOpenTv} />}
          {screen === "player" && <RoomShell roomId={roomId} playerName={myName} onLeave={handleLeave} lang={lang} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />}
          {screen === "tv" && <TVScreen roomId={roomId} lang={lang} ui={ui} C={C} S={S} onLeave={handleLeave} tvKey={urlTvKey} />}
        </main>
      </div>
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} C={C} S={S} ui={ui} />}
    </div>
  );
}
