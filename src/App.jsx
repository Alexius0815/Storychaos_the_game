import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://iioipzphjxzoiofnukjs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb2lwenBoanh6b2lvZm51a2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzYzOTMsImV4cCI6MjA5MTc1MjM5M30.aIO5sXDUNNk01lTcqb79f4BowKXy4YH4Er0OrB8gx8U";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const APP_URL = "https://storychaos-the-game.vercel.app";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const WORDS = {
  alltag: ["Auto","Katze","Pizza","Schule","Chef","Kaffee","Polizei","Internet","Garten","Fussball","Zug","Krankenhaus","Party","Nachbar","Arzt","Supermarkt","Kuehlschrank","Fahrrad","Briefkasten","Teppich","Fenster","Treppe","Aufzug","Klingel"],
  essen:  ["Sushi","Burger","Nudeln","Kuchen","Brot","Kaese","Bier","Wein","Smoothie","Pommes","Salat","Steak","Schokolade","Chips","Ananas","Erdbeere","Honig","Marmelade","Espresso","Wassermelone"],
  natur:  ["Blitz","Schnee","Nebel","Sturm","Regenbogen","Vollmond","Baum","Rose","Pilz","Schmetterling","Adler","Wolf","Baer","Fuchs","Loewe","Pinguin","Kaktus","Vulkan","Lawine","Gletscher"],
  tech:   ["Passwort","Selfie","Roboter","Drohne","KI","Podcast","Streaming","Update","Meme","Emoji","Algorithmus","Darkmode","WLAN","Akku","Hologramm","Smartwatch","VR-Brille","Satellit","Chip","Ladestation"],
  orte:   ["Flughafen","Bahnhof","Museum","Bibliothek","Bunker","Tempel","Palast","Insel","Gefaengnis","Leuchtturm","Marktplatz","Dachterrasse","Tiefgarage","Hoehle","Wueste","Dschungel","Friedhof","Kaserne","Schloss","Turm"],
  gefuehle:["Panik","Eifersucht","Euphorie","Heimweh","Albtraum","Stille","Neugier","Schwindel","Gaensehaut","Langeweile","Sehnsucht","Trotz","Scham","Stolz","Ehrfurcht"],
  objekte:["Koffer","Kompass","Tagebuch","Spiegel","Kerze","Brief","Maske","Uhr","Schere","Luftballon","Bumerang","Laterne","Zauberstab","Fernglas","Schnorchel","Lupe","Wuerfel","Teleskop","Schachtel","Schluessel"],
  misc:   ["Geist","Einhorn","Detektiv","Heldin","Schurke","Guru","Kapitaen","Influencer","Therapeut","Rentner","Azubi","Praktikant","Zwilling","Legende","Fremder"],
};
const ALL_WORDS = Object.values(WORDS).flat();

const ACTIONS = {
  easy: [
    "Zwinkere","Kratz dich an der Nase","Raeuspere dich","Schau kurz auf den Boden",
    "Strecke dich","Richte deine Haare","Klopf einmal auf den Tisch","Verschraenke die Arme",
    "Lehne dich zurueck","Seufze leise","Beiss dir auf die Lippe","Reib dir die Haende",
    "Zucke mit den Schultern","Schnippe mit den Fingern","Schau auf deine Uhr",
    "Nicke einmal kurz","Lege einen Finger an die Lippen","Streich dir ubers Kinn",
  ],
  medium: [
    "Lache ploetzlich laut","Sag: Interessant...","Klatsche in die Haende","Sag: Ach wirklich?!",
    "Mach ein ueberraschtes Gesicht","Steh halb auf und setz dich wieder","Tipp jemanden an",
    "Mach ein Foto (oder so tun als ob)","Sag: Moment mal...","Sag: Na sowas!",
    "Klatsch dir auf die Stirn","Heb die Hand als waerst du in der Schule",
    "Schau dramatisch zur Seite","Rutsch auf dem Stuhl rum","Zeig auf jemand anderen",
    "Sag: Das kenn ich und nicke wissend","Summ leise vor dich hin","Schau zur Decke und nicke",
  ],
  chaos: [
    "Spring auf und ruf: HEUREKA!","Wiederhole laut das letzte Wort","Unterbrech mit: HMM!",
    "Tu so als haette dich jemand getreten","Mach eine dramatische Pause und schau alle an",
    "Ruf: Bingo! und bereue es sofort","Sag deinen Namen rueckwaerts",
    "Klatsch beide Haende auf Wangen wie Kevin","Fluester Nachbar etwas Unverstaendliches",
    "Steh auf geh einen Schritt und setz dich wieder","Sing eine kurze Note",
    "Tu so als greifst du etwas aus der Luft","Sag: Ich sage nur... dann schweigen",
    "Fake-Niese dreimal hintereinander","Schreib etwas Imaginaeres in die Luft",
    "Starre jemanden 4 Sekunden stumm an","Heb beide Daumen hoch und grinse",
  ],
};
const ALL_ACTIONS = [...ACTIONS.easy, ...ACTIONS.medium, ...ACTIONS.chaos];

const GENRES = [
  {id:"alltag",label:"Alltag",emoji:"🏠",desc:"Supermarkt, Buero, Nachbarschaft"},
  {id:"urlaub",label:"Urlaub",emoji:"✈️",desc:"Strand, Hotel, Abenteuer"},
  {id:"party",label:"Party",emoji:"🎉",desc:"Feiern, Freunde, Chaos"},
  {id:"arbeit",label:"Arbeit",emoji:"💼",desc:"Meeting, Chef, Kantine"},
  {id:"natur",label:"Natur",emoji:"🌲",desc:"Wald, Tiere, Abenteuer"},
  {id:"zukunft",label:"Zukunft",emoji:"🚀",desc:"KI, Roboter, Raumfahrt"},
  {id:"krimi",label:"Krimi",emoji:"🔍",desc:"Detektiv, Verdacht, Spannung"},
  {id:"random",label:"Zufall",emoji:"🎲",desc:"Komplett ueberraschend"},
];

// ─── DESIGN ───────────────────────────────────────────────────────────────────
const FF = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const THEMES = {
  dark:  { bg:"#0d0d14", sur:"#16161f", sur2:"#1e1e2a", bdr:"#2a2a3a", txt:"#f0f0f5", muted:"#9090a8" },
  light: { bg:"#f4f4f8", sur:"#ffffff", sur2:"#eeeef4", bdr:"#d0d0e0", txt:"#111118", muted:"#6060788" },
};
const ACC = { blue:"#60a5fa", bluel:"#bfdbfe", red:"#f87171", redl:"#fecaca", gold:"#fbbf24", green:"#4ade80", greenl:"#bbf7d0" };

function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("sc-theme") !== "light"; } catch { return true; }
  });
  function toggle() { setDark(d => { try { localStorage.setItem("sc-theme", d ? "light" : "dark"); } catch {} return !d; }); }
  return [dark ? THEMES.dark : THEMES.light, dark, toggle];
}

function makeStyles(C) {
  return {
    card:    { background: C.sur,  border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 18, marginBottom: 12 },
    card2:   { background: C.sur2, border: `1px solid ${C.bdr}`, borderRadius: 10, padding: 18, marginBottom: 12 },
    st:      { fontSize: 16, fontWeight: 700, color: C.txt, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
    bt:      { fontSize: 14, lineHeight: 1.7, color: C.muted },
    sr:      { position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" },
    input:   { width: "100%", background: C.sur2, border: `1.5px solid ${C.bdr}`, color: C.txt, fontFamily: FF, fontSize: 16, padding: "12px 14px", borderRadius: 8, outline: "none" },
    pbtn: (col, bg) => ({ width: "100%", padding: 14, borderRadius: 8, fontSize: 16, fontWeight: 700, border: `2px solid ${col}`, background: bg, color: col, cursor: "pointer", transition: "all .15s", display: "block" }),
    sbtn: (col) => ({ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 6, border: `1px solid ${col}`, background: "transparent", color: col, cursor: "pointer" }),
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function shuffle(a) { const b=[...a]; for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
function roomCode() { return Math.random().toString(36).substring(2,7).toUpperCase(); }
function timeAgo(ts) { const s=Math.floor((Date.now()-new Date(ts))/1000); if(s<60)return `${s}s`; if(s<3600)return `${Math.floor(s/60)}m`; return `${Math.floor(s/3600)}h`; }

const debugLog = [];
function addLog(level, msg, detail="") {
  debugLog.unshift({ time: new Date().toLocaleTimeString("de"), level, msg, detail: String(detail).slice(0,200) });
  if (debugLog.length > 50) debugLog.pop();
}

// ─── QR CODE ──────────────────────────────────────────────────────────────────
function QRCode({ url, size=180, C }) {
  const enc = encodeURIComponent(url);
  const bg  = C.sur.replace("#","");
  const fg  = C.txt.replace("#","");
  return (
    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}&bgcolor=${bg}&color=${fg}&qzone=2`}
      alt={`QR Code fuer ${url}`} width={size} height={size}
      style={{ borderRadius: 8, display: "block" }} />
  );
}

// ─── OFFLINE BANNER ───────────────────────────────────────────────────────────
function OfflineBanner({ C }) {
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const on  = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online",  on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (!offline) return null;
  return (
    <div style={{ background: "rgba(248,113,113,.15)", border: `1px solid ${ACC.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <span>📡</span>
      <span style={{ fontSize: 13, color: ACC.redl, fontWeight: 600 }}>Keine Verbindung – bitte WLAN pruefen</span>
    </div>
  );
}

// ─── SOUND / VIBRATE ─────────────────────────────────────────────────────────
function vibrate(pattern) { try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {} }
function playBeep(freq=440, dur=0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch {}
}

// ─── AI GENERATION ───────────────────────────────────────────────────────────
async function generateStory(prompt) {
  const apis = [
    async () => {
      const r = await fetch("https://text.pollinations.ai/openai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "openai", messages: [{ role: "system", content: "Kreativer Geschichtenerzaehler auf Deutsch." }, { role: "user", content: prompt }], seed: Math.floor(Math.random()*99999) })
      });
      if (!r.ok) throw new Error("fail");
      const d = await r.json();
      return d.choices?.[0]?.message?.content || "";
    },
    async () => {
      const r = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      if (!r.ok) throw new Error("fail");
      return await r.text();
    },
    async () => {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "HTTP-Referer": APP_URL, "X-Title": "Story Chaos" },
        body: JSON.stringify({ model: "mistralai/mistral-7b-instruct:free", max_tokens: 800, messages: [{ role: "user", content: prompt }] })
      });
      if (!r.ok) throw new Error("fail");
      const d = await r.json();
      return d.choices?.[0]?.message?.content || "";
    },
  ];
  const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  for (const api of apis) {
    try {
      const text = await Promise.race([api(), timeout(9000)]);
      if (text && text.length > 50) { addLog("info", "KI OK", text.slice(0,40)); return text; }
    } catch (e) { addLog("warn", "KI-API fail", e.message); }
  }
  return null;
}

// ─── DEBUG PANEL ─────────────────────────────────────────────────────────────
function DebugPanel({ onClose, C, S }) {
  const [logs, setLogs]         = useState([...debugLog]);
  const [apiStatus, setApiStatus] = useState({});
  const [sbStatus, setSbStatus] = useState(null);
  const [rooms, setRooms]       = useState([]);
  const [testing, setTesting]   = useState(false);

  useEffect(() => { checkSb(); loadRooms(); }, []);

  async function checkSb() {
    try {
      const t0 = Date.now();
      const { error } = await sb.from("rooms").select("id").limit(1);
      setSbStatus({ ok: !error, ms: Date.now()-t0, err: error?.message });
    } catch(e) { setSbStatus({ ok: false, err: e.message }); }
  }

  async function loadRooms() {
    const { data } = await sb.from("rooms").select("id,host_name,status,created_at,round").order("created_at", { ascending: false }).limit(15);
    setRooms(data || []);
  }

  async function testApis() {
    setTesting(true);
    const p = "Schreibe einen witzigen Satz auf Deutsch.";
    const timeout = ms => new Promise((_,rej) => setTimeout(() => rej(new Error("timeout")), ms));
    const tests = [
      { key: "pollinations1", name: "Pollinations /openai",
        fn: async () => { const r=await fetch("https://text.pollinations.ai/openai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"openai",messages:[{role:"user",content:p}],seed:1})}); const d=await r.json(); return d.choices?.[0]?.message?.content||""; }},
      { key: "pollinations2", name: "Pollinations GET",
        fn: async () => { const r=await fetch(`https://text.pollinations.ai/${encodeURIComponent(p)}`); return await r.text(); }},
      { key: "openrouter", name: "OpenRouter (Mistral free)",
        fn: async () => { const r=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","HTTP-Referer":APP_URL,"X-Title":"Story Chaos"},body:JSON.stringify({model:"mistralai/mistral-7b-instruct:free",max_tokens:60,messages:[{role:"user",content:p}]})}); const d=await r.json(); return d.choices?.[0]?.message?.content||""; }},
    ];
    const results = {};
    for (const t of tests) {
      const t0 = Date.now();
      try {
        const text = await Promise.race([t.fn(), timeout(9000)]);
        results[t.key] = { ok: text.length>5, ms: Date.now()-t0, preview: text.slice(0,70), name: t.name };
      } catch(e) {
        results[t.key] = { ok: false, ms: Date.now()-t0, err: e.message, name: t.name };
      }
      setApiStatus({...results});
    }
    setTesting(false);
  }

  async function deleteOldRooms() {
    const cutoff = new Date(Date.now()-24*60*60*1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    loadRooms();
    addLog("info","Alte Raeume geloescht");
  }

  const badge = ok => (
    <span style={{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:10,
      background: ok===undefined?"transparent":ok?"rgba(74,222,128,.15)":"rgba(248,113,113,.15)",
      color: ok===undefined?C.muted:ok?ACC.greenl:ACC.redl, border:`1px solid ${ok===undefined?C.bdr:ok?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)"}` }}>
      {ok===undefined?"–":ok?"OK":"FEHLER"}
    </span>
  );

  return (
    <div style={{ position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.88)",overflowY:"auto" }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ maxWidth:500,margin:"0 auto",padding:"16px 16px 60px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div style={{ fontSize:16,fontWeight:800,color:C.txt }}>🛠 Debug Panel</div>
          <button onClick={onClose} style={S.sbtn(C.muted)}>✕ Schliessen</button>
        </div>

        <div style={S.card}>
          <div style={{ fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10 }}>Supabase</div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <span style={{ fontSize:13,color:C.txt }}>Verbindung {sbStatus?.ms?`(${sbStatus.ms}ms)`:""}</span>
            {sbStatus ? badge(sbStatus.ok) : <span style={{fontSize:11,color:C.muted}}>Pruefe...</span>}
          </div>
          {sbStatus?.err && <div style={{fontSize:11,color:ACC.redl,marginTop:4}}>{sbStatus.err}</div>}
          <button onClick={checkSb} style={{...S.sbtn(C.muted),marginTop:10}}>Erneut pruefen</button>
        </div>

        <div style={S.card}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
            <div style={{ fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted }}>KI-APIs</div>
            <button onClick={testApis} disabled={testing} style={S.sbtn(ACC.blue)}>{testing?"Teste…":"Alle testen"}</button>
          </div>
          {Object.values(apiStatus).length === 0 && !testing && <p style={{fontSize:13,color:C.muted}}>Noch nicht getestet</p>}
          {Object.values(apiStatus).map(s => (
            <div key={s.name} style={{padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:C.txt}}>{s.name}</span>
                {badge(s.ok)}
              </div>
              {s.ms && <div style={{fontSize:11,color:C.muted,marginTop:2}}>{s.ms}ms</div>}
              {s.preview && <div style={{fontSize:11,color:C.muted,marginTop:2,fontStyle:"italic"}}>"{s.preview}"</div>}
              {s.err && <div style={{fontSize:11,color:ACC.redl,marginTop:2}}>{s.err}</div>}
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted}}>Raeume ({rooms.length})</div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={loadRooms} style={S.sbtn(C.muted)}>↻</button>
              <button onClick={deleteOldRooms} style={S.sbtn(ACC.red)}>Alte löschen</button>
            </div>
          </div>
          {rooms.length===0 ? <p style={{fontSize:13,color:C.muted}}>Keine Raeume</p> : rooms.map(r => (
            <div key={r.id} style={{padding:"7px 0",borderBottom:`1px solid ${C.bdr}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{fontSize:14,fontWeight:800,letterSpacing:3,color:C.txt}}>{r.id}</span>
                <span style={{fontSize:12,color:C.muted,marginLeft:8}}>{r.host_name} · R{r.round||1}</span>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:C.sur2,color:C.muted}}>{r.status}</span>
                <span style={{fontSize:10,color:C.muted}}>{timeAgo(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted}}>Logs ({logs.length})</div>
            <button onClick={()=>setLogs([...debugLog])} style={S.sbtn(C.muted)}>↻</button>
          </div>
          <div style={{maxHeight:220,overflowY:"auto"}}>
            {logs.length===0 ? <p style={{fontSize:13,color:C.muted}}>Keine Logs</p> : logs.map((l,i) => (
              <div key={i} style={{padding:"4px 0",borderBottom:`1px solid ${C.bdr}`,display:"flex",gap:8,fontSize:12}}>
                <span style={{color:C.muted,whiteSpace:"nowrap"}}>{l.time}</span>
                <span style={{fontWeight:700,color:l.level==="error"?ACC.red:l.level==="warn"?ACC.gold:ACC.blue,minWidth:34}}>{l.level.toUpperCase()}</span>
                <span style={{color:C.txt,wordBreak:"break-all"}}>{l.msg} <span style={{color:C.muted}}>{l.detail}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LOBBY (Host) ─────────────────────────────────────────────────────────────
function HostLobby({ room, players, onStart, C, S }) {
  const others   = players.filter(p => !p.is_host);
  const joinUrl  = `${APP_URL}?room=${room.id}`;

  return (
    <div>
      <div style={{...S.card, borderColor:"rgba(96,165,250,.3)", background:"rgba(96,165,250,.05)", textAlign:"center"}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:ACC.blue,marginBottom:6}}>Raumcode</div>
        <div style={{fontSize:44,fontWeight:800,letterSpacing:6,color:C.txt,marginBottom:4}}>{room.id}</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Mitspieler scannen den QR-Code oder geben den Code ein</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><QRCode url={joinUrl} size={180} C={C}/></div>
        <div style={{fontSize:11,color:C.muted,wordBreak:"break-all"}}>{joinUrl}</div>
      </div>

      <div style={S.card}>
        <div style={{...S.st,marginBottom:10}}>👥 Beigetreten ({others.length})</div>
        {others.length===0 ? (
          <p style={{...S.bt,textAlign:"center",padding:"12px 0",fontStyle:"italic"}}>Noch niemand… QR-Code scannen!</p>
        ) : (
          <ul style={{listStyle:"none",padding:0}}>
            {others.map(p => (
              <li key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:ACC.green,flexShrink:0}}/>
                <span style={{fontSize:15,fontWeight:600,color:C.txt,flex:1}}>{p.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={onStart} disabled={others.length===0}
        style={S.pbtn(others.length>0?ACC.green:C.bdr, others.length>0?"rgba(74,222,128,.1)":C.sur)}>
        {others.length===0 ? "Warte auf Mitspieler…" : `Spiel starten mit ${others.length} Spieler${others.length!==1?"n":""} →`}
      </button>
    </div>
  );
}

// ─── CARDS (Host distributes) ─────────────────────────────────────────────────
function HostCards({ room, players, onCardsDealt, C, S }) {
  const [diff, setDiff]   = useState("mix");
  const [cats, setCats]   = useState(Object.keys(WORDS));
  const [loading, setLoading] = useState(false);
  const others = players.filter(p => !p.is_host);

  function getActions(difficulty) {
    if (difficulty === "mix")  return shuffle([...ACTIONS.easy,...ACTIONS.medium,...ACTIONS.chaos]);
    return shuffle(ACTIONS[difficulty] || ALL_ACTIONS);
  }

  function getWords() {
    const pool = cats.length > 0 ? cats.flatMap(c => WORDS[c] || []) : ALL_WORDS;
    return shuffle(pool);
  }

  async function deal() {
    setLoading(true);
    const ws = getWords().slice(0, others.length);
    const as = getActions(diff).slice(0, others.length);
    for (let i = 0; i < others.length; i++) {
      await sb.from("players").update({ secret_word: ws[i], secret_action: as[i], ready: false, rerolled: false }).eq("id", others[i].id);
    }
    await sb.from("rooms").update({ status: "cards", story_words: ws, difficulty: diff }).eq("id", room.id);
    onCardsDealt(ws);
    vibrate([100, 50, 100]);
    setLoading(false);
  }

  const DIFF_LABELS = { easy:"😇 Leicht", medium:"😏 Mittel", chaos:"😈 Chaos", mix:"🎲 Mix" };
  const CAT_LABELS  = { alltag:"🏠 Alltag", essen:"🍕 Essen", natur:"🌲 Natur", tech:"🤖 Tech", orte:"🏛 Orte", gefuehle:"💫 Gefühle", objekte:"🎩 Objekte", misc:"👤 Personen" };

  function toggleCat(c) { setCats(cs => cs.includes(c) ? cs.filter(x=>x!==c) : [...cs,c]); }

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>🎴 Karten austeilen</div>
        <p style={S.bt}>Jeder bekommt ein geheimes Wort und eine Aktion direkt aufs Handy. Danach muss jeder auf "Ich bin bereit" drücken bevor du die Geschichte generieren kannst.</p>
      </div>

      <div style={S.card}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Aktions-Schwierigkeit</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {Object.entries(DIFF_LABELS).map(([k,v]) => (
            <button key={k} onClick={()=>setDiff(k)} aria-pressed={diff===k}
              style={{padding:"10px 8px",borderRadius:7,fontSize:13,fontWeight:600,border:`2px solid ${diff===k?ACC.gold:C.bdr}`,background:diff===k?"rgba(251,191,36,.1)":C.sur2,color:diff===k?ACC.gold:C.muted,cursor:"pointer"}}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Wort-Kategorien</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {Object.entries(CAT_LABELS).map(([k,v]) => {
            const on = cats.includes(k);
            return (
              <button key={k} onClick={()=>toggleCat(k)}
                style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:`1.5px solid ${on?ACC.blue:C.bdr}`,background:on?"rgba(96,165,250,.1)":C.sur2,color:on?ACC.bluel:C.muted,cursor:"pointer"}}>
                {v}
              </button>
            );
          })}
        </div>
        {cats.length===0 && <p style={{fontSize:12,color:ACC.redl,marginTop:8}}>Mindestens eine Kategorie auswaehlen!</p>}
      </div>

      <div style={{...S.card,marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:C.txt,marginBottom:8}}>Mitspieler ({others.length})</div>
        {others.length===0 ? <p style={{...S.bt}}>Noch keine Mitspieler beigetreten.</p> : others.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bdr}`}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:ACC.green,flexShrink:0}}/>
            <span style={{fontSize:14,color:C.txt}}>{p.name}</span>
          </div>
        ))}
      </div>

      <button onClick={deal} disabled={loading||others.length===0||cats.length===0}
        style={S.pbtn(ACC.blue, "rgba(96,165,250,.1)")}>
        {loading ? "Verteile…" : "🃏 Karten austeilen"}
      </button>
    </div>
  );
}

// ─── READY CHECK (Host watches) ───────────────────────────────────────────────
function ReadyCheck({ room, players, storyWords, onAllReady, C, S }) {
  const others   = players.filter(p => !p.is_host);
  const readyOnes= others.filter(p => p.ready);
  const allReady = others.length > 0 && readyOnes.length === others.length;

  useEffect(() => { if (allReady) vibrate([100,50,200]); }, [allReady]);

  return (
    <div>
      <div style={{...S.card,borderColor:"rgba(251,191,36,.3)",background:"rgba(251,191,36,.04)"}}>
        <div style={S.st}>⏳ Warte auf Bereitschaft</div>
        <p style={S.bt}>Jeder Mitspieler muss seine Karte angeschaut und auf "Ich bin bereit" getippt haben.</p>
      </div>

      <div style={S.card}>
        <div style={{marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:13,fontWeight:700,color:C.txt}}>Status</div>
          <div style={{fontSize:13,color:C.muted}}>{readyOnes.length} / {others.length} bereit</div>
        </div>
        <div style={{height:6,borderRadius:3,background:C.sur2,marginBottom:14,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:3,background:allReady?ACC.green:ACC.gold,width:`${others.length>0?readyOnes.length/others.length*100:0}%`,transition:"width .4s ease"}}/>
        </div>
        {others.map(p => (
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
            <span style={{fontSize:16}}>{p.ready ? "✅" : "⏳"}</span>
            <span style={{fontSize:14,color:C.txt,flex:1}}>{p.name}</span>
            {p.rerolled && <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:10,background:"rgba(251,191,36,.12)",color:ACC.gold,border:"1px solid rgba(251,191,36,.3)"}}>neu gezogen</span>}
          </div>
        ))}
      </div>

      {allReady && (
        <div style={{animation:"fadeIn .3s ease"}}>
          <div style={{...S.card,borderColor:"rgba(74,222,128,.3)",background:"rgba(74,222,128,.06)",textAlign:"center",padding:"20px 18px",marginBottom:12}}>
            <div style={{fontSize:28,marginBottom:8}}>🎉</div>
            <div style={{fontSize:15,fontWeight:700,color:ACC.greenl}}>Alle sind bereit!</div>
          </div>
          <button onClick={onAllReady} style={S.pbtn(ACC.green,"rgba(74,222,128,.1)")}>
            Geschichte generieren →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── STORY (Host) ─────────────────────────────────────────────────────────────
function HostStory({ room, players, storyWords, C, S }) {
  const [genre,    setGenre]    = useState(null);
  const [story,    setStory]    = useState(room.story || "");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [revealed, setRevealed] = useState(false);

  // Use the current storyWords (includes rerolled words)
  const words = storyWords || [];

  async function generate() {
    if (!genre || words.length === 0) return;
    setLoading(true); setError(""); setStory(""); setRevealed(false);
    const sel = genre === "random"
      ? GENRES[Math.floor(Math.random()*(GENRES.length-1))].label
      : GENRES.find(g => g.id === genre).label;
    const prompt = `Schreibe eine kurze witzige Geschichte auf Deutsch im Stil "${sel}". 8-12 Saetze. Diese Woerter ALLE einbauen: ${words.join(", ")}. Jedes dieser Woerter mit **Wort** markieren. NUR die Geschichte, kein Titel. Locker lustig zum Vorlesen.`;
    const text = await generateStory(prompt);
    if (!text) { setError("KI gerade nicht erreichbar. Kurz warten und nochmal versuchen."); setLoading(false); return; }
    setStory(text);
    await sb.from("rooms").update({ story: text, status: "playing" }).eq("id", room.id);
    setLoading(false);
  }

  function renderStory(t, w) {
    const clean   = t.replace(/\*\*(.*?)\*\*/g, "$1");
    if (!w || w.length === 0) return clean;
    const escaped = w.map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
    return clean.split(pattern).map((part, i) =>
      w.some(x => x.toLowerCase() === part.toLowerCase())
        ? <strong key={i} style={{ color: ACC.gold, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{part}</strong>
        : part
    );
  }

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>✨ KI-Geschichte</div>
        <p style={S.bt}>Waehle ein Thema. Die Geschichte enthaelt die Woerter aller Mitspieler. Du liest vor – beobachte die Reaktionen!</p>
        {words.length > 0 && (
          <div style={{marginTop:10,padding:"10px 12px",background:C.sur2,borderRadius:7}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:6}}>Einzubauende Woerter</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {words.map(w => <span key={w} style={{fontSize:12,fontWeight:600,color:ACC.bluel,background:"rgba(96,165,250,.1)",padding:"3px 10px",borderRadius:20,border:"1px solid rgba(96,165,250,.25)"}}>{w}</span>)}
            </div>
          </div>
        )}
      </div>

      <fieldset style={{border:"none",margin:"0 0 14px",padding:0}}>
        <legend style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10,display:"block"}}>Thema</legend>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {GENRES.map(g => (
            <button key={g.id} onClick={()=>setGenre(g.id)} aria-pressed={genre===g.id}
              style={{background:genre===g.id?"rgba(251,191,36,.1)":C.sur,border:`2px solid ${genre===g.id?ACC.gold:C.bdr}`,borderRadius:8,padding:12,cursor:"pointer",textAlign:"left",gridColumn:g.id==="random"?"span 2":"span 1",transition:"all .15s",display:"block"}}>
              <div style={{fontSize:17,marginBottom:3}}>{g.emoji}</div>
              <div style={{fontSize:13,fontWeight:700,color:genre===g.id?ACC.gold:C.txt}}>{g.label}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:1}}>{g.desc}</div>
            </button>
          ))}
        </div>
      </fieldset>

      <button onClick={generate} disabled={!genre||loading||words.length===0}
        style={S.pbtn(genre?ACC.gold:C.bdr, genre?"rgba(251,191,36,.08)":C.sur)}>
        {loading ? "Wird geschrieben…" : "Geschichte generieren"}
      </button>

      {loading && <div style={{textAlign:"center",padding:24}}><div style={{fontSize:28,display:"inline-block",animation:"spin 1.5s linear infinite"}}>✍️</div><div style={{fontSize:13,color:C.muted,marginTop:8}}>KI schreibt…</div></div>}
      {error   && <div style={{...S.card,borderColor:"rgba(248,113,113,.4)",background:"rgba(248,113,113,.06)",marginTop:12}}><p style={{...S.bt,color:ACC.redl}}>{error}</p></div>}

      {story && !loading && (
        <div style={{animation:"fadeIn .3s ease",marginTop:12}}>
          <div style={{...S.card,borderColor:"rgba(251,191,36,.3)",background:"rgba(251,191,36,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:ACC.gold}}>Jetzt vorlesen!</span>
              <button onClick={generate} style={S.sbtn(C.muted)}>Neu ↻</button>
            </div>
            <p style={{...S.bt,marginBottom:14,fontStyle:"italic"}}>Woerter sind versteckt – beobachte wer wann reagiert!</p>
            <div style={{fontSize:16,lineHeight:2.1,color:C.txt}}>{story.replace(/\*\*(.*?)\*\*/g,"$1")}</div>
          </div>
          <div style={{...S.card,borderColor:"rgba(248,113,113,.3)",background:"rgba(248,113,113,.05)"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:ACC.red,marginBottom:12}}>Aufloesen – erst nach dem Raten!</div>
            {!revealed ? (
              <button onClick={()=>setRevealed(true)} style={S.pbtn(ACC.red,"rgba(248,113,113,.08)")}>Woerter aufdecken</button>
            ) : (
              <div>
                <div style={{fontSize:15,lineHeight:2.1,color:C.txt,marginBottom:14}}>{renderStory(story,words)}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingTop:12,borderTop:`1px solid ${C.bdr}`}}>
                  {words.map(w=><span key={w} style={{fontSize:12,fontWeight:600,color:ACC.gold,background:"rgba(251,191,36,.1)",padding:"4px 12px",borderRadius:20,border:"1px solid rgba(251,191,36,.3)"}}>{w}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RESOLUTION SCREEN ────────────────────────────────────────────────────────
function Resolution({ players, C, S }) {
  const others = players.filter(p => !p.is_host);
  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>🎭 Aufloesung</div>
        <p style={S.bt}>Wer hatte was? Hier die Karten aller Mitspieler auf einen Blick.</p>
      </div>
      {others.map(p => (
        <div key={p.id} style={{...S.card,borderColor:p.ready?"rgba(74,222,128,.25)":C.bdr}}>
          <div style={{fontSize:14,fontWeight:700,color:C.txt,marginBottom:10}}>{p.name}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div style={{background:C.sur2,borderRadius:8,padding:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:ACC.blue,marginBottom:6}}>🔵 Wort</div>
              <div style={{fontSize:15,fontWeight:700,color:ACC.bluel}}>{p.secret_word||"–"}</div>
            </div>
            <div style={{background:C.sur2,borderRadius:8,padding:12}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:ACC.red,marginBottom:6}}>🔴 Aktion</div>
              <div style={{fontSize:13,fontWeight:600,color:ACC.redl}}>{p.secret_action||"–"}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SCORES ───────────────────────────────────────────────────────────────────
function Scores({ players, C, S }) {
  const [scores, setScores] = useState(() => {
    const m = {}; players.filter(p=>!p.is_host).forEach(p=>{m[p.id]=p.score||0;}); return m;
  });
  function change(id, d) { setScores(s => ({...s,[id]:Math.max(0,(s[id]||0)+d)})); }
  const others = players.filter(p => !p.is_host);
  const sorted = [...others].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));
  const medals = ["🥇","🥈","🥉"];
  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>🏆 Punktestand</div>
        <ul style={{listStyle:"none",padding:0}}>
          {sorted.map((p,i) => (
            <li key={p.id} style={{display:"flex",alignItems:"center",gap:8,background:C.sur2,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <span style={{fontSize:16,minWidth:26}}>{medals[i]||`${i+1}.`}</span>
              <span style={{flex:1,fontSize:14,fontWeight:600,color:C.txt}}>{p.name}</span>
              <button onClick={()=>change(p.id,-1)} style={{background:C.bdr,border:"none",color:C.txt,width:32,height:32,borderRadius:6,fontSize:18,fontWeight:700,cursor:"pointer"}}>-</button>
              <span style={{fontSize:24,fontWeight:800,color:ACC.gold,minWidth:36,textAlign:"center"}}>{scores[p.id]||0}</span>
              <button onClick={()=>change(p.id,+1)} style={{background:C.bdr,border:"none",color:C.txt,width:32,height:32,borderRadius:6,fontSize:18,fontWeight:700,cursor:"pointer"}}>+</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function Timer({ C, S }) {
  const [dur,  setDur]  = useState(60);
  const [rem,  setRem]  = useState(60);
  const [run,  setRun]  = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!run) return;
    ref.current = setInterval(() => {
      setRem(r => {
        if (r === 10) { vibrate([100]); playBeep(880,0.1); }
        if (r <= 1)   { clearInterval(ref.current); setRun(false); setDone(true); vibrate([300,100,300]); playBeep(440,0.5); return 0; }
        return r-1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [run]);

  const ratio = rem/dur, offset = 565*(1-ratio);
  const sc = ratio>.5?ACC.blue:ratio>.25?ACC.gold:ACC.red;
  const nc = rem<=10?ACC.red:rem<=20?ACC.gold:C.txt;
  const m  = Math.floor(rem/60), s = rem%60;
  const display = m>0 ? `${m}:${String(s).padStart(2,"0")}` : String(rem);

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <fieldset style={{border:"none",width:"100%",padding:0}}>
        <legend style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:8,display:"block"}}>Dauer</legend>
        <div style={{display:"flex",gap:8}}>
          {[60,90,120,180].map(d=>(
            <button key={d} onClick={()=>{setDur(d);if(!run){setRem(d);setDone(false);}}} aria-pressed={dur===d}
              style={{flex:1,background:dur===d?"rgba(248,113,113,.1)":C.sur,border:`2px solid ${dur===d?ACC.red:C.bdr}`,color:dur===d?ACC.redl:C.muted,fontSize:13,fontWeight:600,padding:"10px 0",borderRadius:6,cursor:"pointer"}}>
              {d>=60?`${d/60} min`:`${d}s`}
            </button>
          ))}
        </div>
      </fieldset>
      <div style={{position:"relative",width:200,height:200}}>
        <svg width="200" height="200" style={{transform:"rotate(-90deg)"}} aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.bdr} strokeWidth="10"/>
          <circle cx="100" cy="100" r="90" fill="none" stroke={sc} strokeWidth="10"
            strokeLinecap="round" strokeDasharray="565" strokeDashoffset={offset}
            style={{transition:"stroke-dashoffset 1s linear,stroke 0.5s"}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}} role="timer" aria-label={`${rem} Sekunden`}>
          <div style={{fontSize:64,fontWeight:800,lineHeight:1,color:nc}}>{display}</div>
          <div style={{fontSize:11,letterSpacing:3,color:C.muted,textTransform:"uppercase",marginTop:2}}>{m>0?"min:sek":"Sekunden"}</div>
        </div>
      </div>
      {done && (
        <div role="alert" style={{width:"100%",background:"linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.12))",border:"1.5px solid rgba(248,113,113,.4)",borderRadius:10,padding:18,textAlign:"center"}}>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:2,color:ACC.redl,textTransform:"uppercase"}}>Zeit ist um!</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Ratephase starten</div>
        </div>
      )}
      <div style={{display:"flex",gap:10,width:"100%"}}>
        <button onClick={()=>{if(done)return;setRun(r=>!r);}} disabled={done}
          style={S.pbtn(ACC.red,"rgba(248,113,113,.1)")}>
          {run?"PAUSE":"START"}
        </button>
        <button onClick={()=>{clearInterval(ref.current);setRun(false);setRem(dur);setDone(false);}}
          style={{...S.pbtn(C.bdr,C.sur),color:C.muted}}>
          RESET
        </button>
      </div>
    </div>
  );
}

// ─── ROUND OVERVIEW ───────────────────────────────────────────────────────────
function RoundOverview({ room, players, C, S }) {
  const others   = players.filter(p => !p.is_host);
  const narrator = players.find(p => p.id === room.narrator_id);
  const past     = room.past_narrators || [];
  const doneAll  = others.every(p => past.includes(p.id));

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>🔄 Runden-Uebersicht</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:14,color:C.muted}}>Runde</div>
          <div style={{fontSize:28,fontWeight:800,color:ACC.gold}}>{room.round||1}</div>
        </div>
        {narrator && (
          <div style={{background:C.sur2,borderRadius:8,padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🎤</span>
            <div>
              <div style={{fontSize:11,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>Aktueller Erzaehler</div>
              <div style={{fontSize:16,fontWeight:700,color:C.txt}}>{narrator.name}</div>
            </div>
          </div>
        )}
        <ul style={{listStyle:"none",padding:0}}>
          {others.map(p => {
            const was  = past.includes(p.id);
            const curr = p.id === room.narrator_id;
            return (
              <li key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <span style={{fontSize:16}}>{curr?"🎤":was?"✅":"⏳"}</span>
                <span style={{fontSize:14,color:C.txt,flex:1}}>{p.name}</span>
                <span style={{fontSize:11,color:C.muted}}>{curr?"dran":was?"war dran":"wartet"}</span>
              </li>
            );
          })}
        </ul>
        {doneAll && (
          <div style={{marginTop:14,padding:"12px 14px",background:"rgba(74,222,128,.08)",border:"1px solid rgba(74,222,128,.3)",borderRadius:8,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:ACC.greenl}}>🎉 Alle waren Erzaehler!</div>
            <div style={{fontSize:12,color:C.muted,marginTop:4}}>Spiel beendet – Endstand im Punkte-Tab</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOST APP ─────────────────────────────────────────────────────────────────
function HostApp({ roomId, hostName, onLeave, C, S }) {
  const [room,       setRoom]       = useState(null);
  const [players,    setPlayers]    = useState([]);
  const [tab,        setTab]        = useState("lobby");
  const [storyWords, setStoryWords] = useState([]);

  useEffect(() => {
    async function load() {
      const {data:rm} = await sb.from("rooms").select("*").eq("id",roomId).single();
      setRoom(rm);
      if (rm?.story_words) setStoryWords(rm.story_words);
      const {data:pl} = await sb.from("players").select("*").eq("room_id",roomId).order("joined_at");
      setPlayers(pl||[]);
    }
    load();
    const ch = sb.channel(`host-${roomId}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"players",filter:`room_id=eq.${roomId}`},()=>load())
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"rooms",filter:`id=eq.${roomId}`},payload=>{
        setRoom(payload.new);
        if(payload.new.story_words)setStoryWords(payload.new.story_words);
      })
      .subscribe();
    return () => sb.removeChannel(ch);
  },[roomId]);

  // Update storyWords when a player rerolls
  const currentWords = players.filter(p=>!p.is_host).map(p=>p.secret_word).filter(Boolean);

  const TABS = [
    {id:"lobby",   icon:"🏠",label:"Lobby"},
    {id:"cards",   icon:"🎴",label:"Karten"},
    {id:"ready",   icon:"⏳",label:"Bereit"},
    {id:"story",   icon:"✨",label:"Story"},
    {id:"timer",   icon:"⏱",label:"Timer"},
    {id:"resolve", icon:"🎭",label:"Lösung"},
    {id:"scores",  icon:"🏆",label:"Punkte"},
    {id:"rounds",  icon:"🔄",label:"Runden"},
  ];

  return (
    <div>
      <div style={{background:C.sur2,borderRadius:8,padding:"8px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:11,color:C.muted}}>Raum </span>
          <span style={{fontSize:15,fontWeight:800,letterSpacing:3,color:C.txt}}>{roomId}</span>
          <span style={{fontSize:11,color:C.muted}}> · {hostName}</span>
        </div>
        <button onClick={onLeave} style={S.sbtn(C.muted)}>Verlassen</button>
      </div>
      <nav>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:16}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} aria-selected={tab===t.id}
              style={{background:tab===t.id?"#1a1a2e":C.sur,border:`1.5px solid ${tab===t.id?ACC.blue:C.bdr}`,color:tab===t.id?ACC.bluel:C.muted,fontSize:8,fontWeight:600,padding:"8px 2px 6px",borderRadius:6,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
              <span style={{fontSize:14}}>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {tab==="lobby"   && <HostLobby   room={room||{id:roomId}} players={players} onStart={()=>setTab("cards")} C={C} S={S}/>}
      {tab==="cards"   && <HostCards   room={room||{id:roomId}} players={players} onCardsDealt={w=>{setStoryWords(w);setTab("ready");}} C={C} S={S}/>}
      {tab==="ready"   && <ReadyCheck  room={room||{id:roomId}} players={players} storyWords={currentWords.length>0?currentWords:storyWords} onAllReady={()=>setTab("story")} C={C} S={S}/>}
      {tab==="story"   && <HostStory   room={room||{id:roomId}} players={players} storyWords={currentWords.length>0?currentWords:storyWords} C={C} S={S}/>}
      {tab==="timer"   && <Timer C={C} S={S}/>}
      {tab==="resolve" && <Resolution  players={players} C={C} S={S}/>}
      {tab==="scores"  && <Scores      players={players} C={C} S={S}/>}
      {tab==="rounds"  && <RoundOverview room={room||{id:roomId,round:1,past_narrators:[]}} players={players} C={C} S={S}/>}
    </div>
  );
}

// ─── PLAYER VIEW ─────────────────────────────────────────────────────────────
function PlayerView({ roomId, playerName, onLeave, C, S }) {
  const [player,       setPlayer]       = useState(null);
  const [room,         setRoom]         = useState(null);
  const [cardRevealed, setCardRevealed] = useState({ word:false, action:false });
  const [rerolled,     setRerolled]     = useState(false);
  const [isReady,      setIsReady]      = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    async function load() {
      const {data:rm} = await sb.from("rooms").select("*").eq("id",roomId).single();
      setRoom(rm);
      const {data:pl} = await sb.from("players").select("*").eq("room_id",roomId).eq("name",playerName).order("joined_at",{ascending:false}).limit(1).single();
      if (pl) { setPlayer(pl); setIsReady(!!pl.ready); setRerolled(!!pl.rerolled); }
    }
    load();
    const ch = sb.channel(`player-${roomId}-${playerName}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"players",filter:`room_id=eq.${roomId}`},payload=>{
        if(payload.new.name===playerName){
          const prev = player;
          setPlayer(payload.new);
          setIsReady(!!payload.new.ready);
          setRerolled(!!payload.new.rerolled);
          // Vibrate when cards arrive
          if (!prev?.secret_word && payload.new.secret_word) { vibrate([100,50,200]); setCardRevealed({word:false,action:false}); }
        }
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"rooms",filter:`id=eq.${roomId}`},payload=>setRoom(payload.new))
      .subscribe();
    return () => sb.removeChannel(ch);
  },[roomId,playerName]);

  async function doReroll() {
    if (rerolled || !player) return;
    const {data:all} = await sb.from("players").select("secret_word,secret_action").eq("room_id",roomId);
    const usedW = all.map(p=>p.secret_word).filter(Boolean);
    const usedA = all.map(p=>p.secret_action).filter(Boolean);
    const newW  = shuffle(ALL_WORDS.filter(w=>!usedW.includes(w)))[0]  || player.secret_word;
    const newA  = shuffle(ALL_ACTIONS.filter(a=>!usedA.includes(a)))[0] || player.secret_action;
    await sb.from("players").update({ secret_word:newW, secret_action:newA, rerolled:true, ready:false }).eq("id",player.id);
    setPlayer(p=>({...p,secret_word:newW,secret_action:newA,rerolled:true,ready:false}));
    setCardRevealed({word:false,action:false});
    setIsReady(false);
    setRerolled(true);
    vibrate([80,40,80]);
  }

  async function markReady() {
    if (isReady || !player) return;
    setMarkingReady(true);
    await sb.from("players").update({ ready: true }).eq("id", player.id);
    setIsReady(true);
    vibrate([100,50,200]);
    setMarkingReady(false);
  }

  if (!player || !room) return (
    <div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:28,animation:"spin 1.5s linear infinite",display:"inline-block"}}>⏳</div>
      <div style={{fontSize:14,color:C.muted,marginTop:12}}>Verbinde…</div>
    </div>
  );

  const hasCards = player.secret_word && player.secret_action;
  const bothRevealed = cardRevealed.word && cardRevealed.action;

  return (
    <div>
      <div style={{...S.card,borderColor:"rgba(96,165,250,.3)",background:"rgba(96,165,250,.05)",textAlign:"center",padding:"12px 18px"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:2}}>Du bist in Raum</div>
        <div style={{fontSize:28,fontWeight:800,letterSpacing:4,color:C.txt}}>{roomId}</div>
        <div style={{fontSize:13,color:ACC.blue,marginTop:2}}>als {playerName}</div>
      </div>

      {!hasCards ? (
        <div style={{...S.card,textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:32,marginBottom:12,animation:"pulse 2s infinite"}}>⏳</div>
          <div style={{fontSize:15,fontWeight:700,color:C.txt,marginBottom:6}}>Warte auf Karten…</div>
          <p style={S.bt}>Der Host teilt gleich die Karten aus!</p>
        </div>
      ) : (
        <div>
          <div style={{...S.card,borderColor:"rgba(251,191,36,.3)",background:"rgba(251,191,36,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.txt}}>Deine geheimen Karten</div>
              <button onClick={doReroll} disabled={rerolled}
                style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:10,cursor:rerolled?"not-allowed":"pointer",border:`1px solid ${rerolled?C.bdr:"rgba(251,191,36,.4)"}`,background:rerolled?"rgba(90,90,110,.2)":"rgba(251,191,36,.12)",color:rerolled?C.muted:ACC.gold}}>
                {rerolled?"neu gezogen":"1x neu ziehen"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {[{key:"word",typ:"Geheimwort",val:player.secret_word,blue:true},{key:"action",typ:"Geheime Aktion",val:player.secret_action,blue:false}].map((cell,ci)=>{
                const rv = cardRevealed[cell.key];
                return (
                  <button key={cell.key} onClick={()=>setCardRevealed(c=>({...c,[cell.key]:!c[cell.key]}))}
                    style={{padding:14,cursor:"pointer",minHeight:90,textAlign:"left",background:"transparent",border:"none",borderRight:ci===0?`1px solid ${C.bdr}`:"none",display:"block",width:"100%"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6,color:cell.blue?ACC.blue:ACC.red}}>
                      <span aria-hidden="true">{cell.blue?"🔵":"🔴"} </span>{cell.typ}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,lineHeight:1.4,color:cell.blue?ACC.bluel:ACC.redl,filter:rv?"none":"blur(7px)",transition:"filter .25s",userSelect:rv?"auto":"none"}}>
                      {cell.val}
                    </div>
                    {!rv && <div style={{fontSize:11,color:C.muted,marginTop:6}}>Tippen zum Aufdecken</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ready button – shown after both cards revealed */}
          {bothRevealed && !isReady && (
            <button onClick={markReady} disabled={markingReady}
              style={{...S.pbtn(ACC.green,"rgba(74,222,128,.1)"),marginBottom:12,animation:"fadeIn .3s ease"}}>
              {markingReady ? "…" : "✅ Ich bin bereit!"}
            </button>
          )}

          {isReady && (
            <div style={{...S.card,borderColor:"rgba(74,222,128,.3)",background:"rgba(74,222,128,.06)",textAlign:"center",padding:"14px 18px",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:ACC.greenl}}>✅ Bereit – warte auf die Geschichte!</div>
            </div>
          )}

          {!bothRevealed && (
            <div style={{...S.card2,textAlign:"center",padding:"12px 16px",marginBottom:12}}>
              <p style={{...S.bt,fontSize:13}}>Decke beide Karten auf um "Ich bin bereit" zu sehen</p>
            </div>
          )}

          {room.story && (
            <div style={{...S.card,borderColor:"rgba(96,165,250,.2)",background:"rgba(96,165,250,.04)"}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:ACC.blue,marginBottom:8}}>Story laeuft!</div>
              <p style={{...S.bt,fontStyle:"italic"}}>Reagiere wenn dein Wort faellt. Bleib unauffaellig 😏</p>
              <div style={{marginTop:10,fontSize:13,fontWeight:700,color:ACC.bluel}}>Dein Wort: <span style={{background:"rgba(96,165,250,.15)",padding:"2px 10px",borderRadius:20}}>{player.secret_word}</span></div>
            </div>
          )}
        </div>
      )}

      <button onClick={onLeave} style={{...S.pbtn(C.bdr,"transparent"),color:C.muted,marginTop:8}}>Raum verlassen</button>
    </div>
  );
}

// ─── JOIN SCREEN ──────────────────────────────────────────────────────────────
function JoinScreen({ initialCode, onJoined, C, S }) {
  const [code,    setCode]    = useState(initialCode || "");
  const [name,    setName]    = useState("");
  const [pw,      setPw]      = useState("");
  const [needPw,  setNeedPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function join() {
    if (!code.trim() || !name.trim()) { setError("Bitte Code und Namen eingeben."); return; }
    setLoading(true); setError("");
    const {data:room} = await sb.from("rooms").select("*").eq("id",code.toUpperCase().trim()).single();
    if (!room) { setError("Raum nicht gefunden."); setLoading(false); return; }
    if (room.password && room.password !== pw) { setNeedPw(true); setError("Falsches Passwort!"); setLoading(false); return; }
    const {data:existing} = await sb.from("players").select("id").eq("room_id",room.id).eq("name",name.trim()).single();
    if (existing) { setError("Dieser Name ist schon vergeben."); setLoading(false); return; }
    const {error:err} = await sb.from("players").insert({ room_id:room.id, name:name.trim(), is_host:false });
    if (err) { setError("Fehler. Nochmal versuchen."); setLoading(false); return; }
    onJoined(room.id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...S.card,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎮</div>
        <div style={{fontSize:18,fontWeight:700,color:C.txt,marginBottom:6}}>Raum beitreten</div>
        <p style={S.bt}>Gib den Raumcode und deinen Namen ein</p>
      </div>
      <div style={S.card}>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Raumcode</label>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="z.B. ABC12" maxLength={5}
          style={{...S.input,fontSize:22,fontWeight:800,letterSpacing:6,textAlign:"center",marginBottom:14}}/>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Dein Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!needPw&&join()} placeholder="Dein Spitzname" maxLength={20}
          style={{...S.input,marginBottom:needPw?14:0}}/>
        {needPw && <>
          <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Passwort</label>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="Raumpasswort" style={S.input}/>
        </>}
        {error && <p style={{fontSize:13,color:ACC.redl,margin:"10px 0 0"}}>{error}</p>}
        <button onClick={join} disabled={loading} style={{...S.pbtn(ACC.green,"rgba(74,222,128,.1)"),marginTop:16}}>
          {loading?"Verbinde…":"Beitreten →"}
        </button>
      </div>
    </div>
  );
}

// ─── CREATE ROOM ──────────────────────────────────────────────────────────────
function CreateRoom({ onCreated, C, S }) {
  const [name,    setName]    = useState("");
  const [pw,      setPw]      = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function create() {
    if (!name.trim()) { setError("Bitte Namen eingeben."); return; }
    setLoading(true); setError("");
    // Clean up rooms older than 24h
    const cutoff = new Date(Date.now()-24*60*60*1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    const id = roomCode();
    const {error:err} = await sb.from("rooms").insert({ id, host_name:name.trim(), status:"waiting", password:pw||null });
    if (err) { setError("Fehler. Nochmal versuchen."); setLoading(false); return; }
    await sb.from("players").insert({ room_id:id, name:name.trim(), is_host:true });
    onCreated(id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...S.card,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎲</div>
        <div style={{fontSize:18,fontWeight:700,color:C.txt,marginBottom:6}}>Neues Spiel</div>
        <p style={S.bt}>Erstelle einen Raum und lade per QR-Code ein</p>
      </div>
      <div style={S.card}>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Dein Name (Host)</label>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&create()} placeholder="Dein Spitzname" maxLength={20}
          style={{...S.input,marginBottom:14}}/>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>
          Passwort <span style={{fontSize:10,fontWeight:400,color:C.muted}}>(optional)</span>
        </label>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Leer = kein Passwort" maxLength={20}
          style={S.input}/>
        {error && <p style={{fontSize:13,color:ACC.redl,margin:"10px 0 0"}}>{error}</p>}
        <button onClick={create} disabled={loading} style={{...S.pbtn(ACC.blue,"rgba(96,165,250,.1)"),marginTop:16}}>
          {loading?"Erstelle…":"Raum erstellen →"}
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const params  = new URLSearchParams(window.location.search);
  const urlRoom = params.get("room");

  const [C, dark, toggleTheme] = useTheme();
  const S = makeStyles(C);

  const [screen, setScreen] = useState(urlRoom ? "join" : "home");
  const [roomId, setRoomId] = useState(urlRoom || "");
  const [myName, setMyName] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  function handleLogoTap() {
    tapCount.current++;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    if (tapCount.current >= 5) { tapCount.current = 0; setShowDebug(true); addLog("info","Debug geoeffnet"); }
  }

  function handleCreated(id, name) { setRoomId(id); setMyName(name); setScreen("host"); }
  function handleJoined(id, name)  { setRoomId(id); setMyName(name); setScreen("player"); }
  function handleLeave()  { setScreen("home"); setRoomId(""); setMyName(""); window.history.replaceState({},"","/"); }

  const GS = `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${C.bg};color:${C.txt};font-family:${FF};}
    button,input{font-family:${FF};}
    *:focus-visible{outline:3px solid ${dark?"#fff":"#000"}!important;outline-offset:2px!important;border-radius:4px;}
    *:focus:not(:focus-visible){outline:none!important;}
    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    input::placeholder{color:${C.muted};}
    input{color:${C.txt};}
  `;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.txt, fontFamily: FF }}>
      <style>{GS}</style>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 16px 60px" }}>
        <header style={{ textAlign: "center", padding: "20px 0 12px", position: "relative" }}>
          <button onClick={toggleTheme} aria-label="Theme wechseln"
            style={{ position:"absolute", right:0, top:20, background:C.sur2, border:`1px solid ${C.bdr}`, color:C.muted, padding:"6px 10px", borderRadius:8, cursor:"pointer", fontSize:16 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <h1 onClick={handleLogoTap}
            style={{ fontSize:"clamp(34px,9vw,54px)", fontWeight:800, letterSpacing:-1, textTransform:"uppercase", background:"linear-gradient(135deg,#f87171,#fbbf24 50%,#60a5fa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", lineHeight:1, margin:0, cursor:"default", userSelect:"none" }}>
            Story Chaos
          </h1>
          <p style={{ fontSize:11, letterSpacing:3, color:C.muted, textTransform:"uppercase", marginTop:5 }}>Das Partyspiel gegen den Erzaehler</p>
        </header>

        <OfflineBanner C={C}/>

        <main>
          {screen === "home" && (
            <div style={{ animation:"fadeIn .3s ease" }}>
              <div style={{...S.card, textAlign:"center", padding:"28px 20px", marginBottom:10}}>
                <div style={{fontSize:48,marginBottom:12}}>🎲</div>
                <div style={{fontSize:18,fontWeight:700,color:C.txt,marginBottom:8}}>Willkommen!</div>
                <p style={{...S.bt,marginBottom:20}}>Erstelle einen Raum und lade per QR-Code ein – oder tritt einem bestehenden Raum bei.</p>
                <button onClick={()=>setScreen("create")} style={{...S.pbtn(ACC.blue,"rgba(96,165,250,.1)"),marginBottom:10}}>🎮 Neues Spiel starten</button>
                <button onClick={()=>setScreen("join")}   style={S.pbtn(C.bdr, C.sur)}>🔗 Raum beitreten</button>
              </div>
              <div style={{...S.card,padding:"14px 18px"}}>
                <div style={{fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Wie es funktioniert</div>
                {["Host erstellt Raum – optional mit Passwort","Mitspieler scannen QR mit dem Handy","Jeder bekommt sein Wort + Aktion aufs Handy","Alle auf Ich bin bereit drücken","Host liest KI-Geschichte vor","Alle reagieren heimlich – Host raet wer was hatte"].map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<5?`1px solid ${C.bdr}`:"none"}}>
                    <span style={{fontSize:13,color:ACC.blue,fontWeight:700,minWidth:20}}>{i+1}.</span>
                    <span style={{fontSize:13,color:C.muted}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {screen==="create" && <div><button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:12}}>← Zurueck</button><CreateRoom onCreated={handleCreated} C={C} S={S}/></div>}
          {screen==="join"   && <div><button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:12}}>← Zurueck</button><JoinScreen initialCode={urlRoom||""} onJoined={handleJoined} C={C} S={S}/></div>}
          {screen==="host"   && <HostApp   roomId={roomId} hostName={myName} onLeave={handleLeave} C={C} S={S}/>}
          {screen==="player" && <PlayerView roomId={roomId} playerName={myName} onLeave={handleLeave} C={C} S={S}/>}
        </main>
      </div>
      {showDebug && <DebugPanel onClose={()=>setShowDebug(false)} C={C} S={S}/>}
    </div>
  );
}
