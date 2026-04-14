import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iioipzphjxzoiofnukjs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb2lwenBoanh6b2lvZm51a2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzYzOTMsImV4cCI6MjA5MTc1MjM5M30.aIO5sXDUNNk01lTcqb79f4BowKXy4YH4Er0OrB8gx8U";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const APP_URL = "https://storychaos-the-game.vercel.app";

const WORDS = ["Auto","Katze","Pizza","Schule","Urlaub","Handy","Regen","Geburtstag","Chef","Kaffee","Polizei","Internet","Garten","Fussball","Zug","Krankenhaus","Party","Nachbar","Schatz","Computer","Arzt","Supermarkt","Hotel","Strand","Wald","Feuer","Wasser","Film","Musik","Lehrer","Geschenk","Hund","Eis","Spielplatz","Familie","Arbeit","Meeting","Chaos","Schloss","Rakete","Kuehlschrank","Fahrrad","Bruecke","Balkon","Schluessel","Teppich","Fenster","Treppe","Aufzug","Sushi","Burger","Nudeln","Kuchen","Brot","Kaese","Bier","Wein","Tee","Smoothie","Pommes","Salat","Steak","Schokolade","Chips","Ananas","Erdbeere","Honig","Blitz","Schnee","Nebel","Sturm","Regenbogen","Vollmond","Baum","Rose","Pilz","Schmetterling","Adler","Wolf","Baer","Fuchs","Podcast","Passwort","Selfie","Roboter","Drohne","KI","Detektiv","Heldin","Schurke","Guru","Kapitaen","Flughafen","Bahnhof","Museum","Bibliothek","Bunker","Tempel","Palast","Insel","Panik","Eifersucht","Euphorie","Heimweh","Albtraum","Stille","Koffer","Kompass","Tagebuch","Spiegel","Kerze","Brief","Maske","Uhr","Loewe","Pinguin","Kaktus","Vulkan","Geist","Einhorn","Schere","Luftballon","Bumerang","Laterne","Zauberstab","Schnorchel"];
const ACTIONS = ["Zwinkere","Kratz dich an der Nase","Raeuspere dich","Schau auf den Boden","Strecke dich","Richte deine Haare","Klopf auf den Tisch","Verschraenke die Arme","Lehne dich zurueck","Seufze leise","Beiss dir auf die Lippe","Reib dir die Haende","Zucke mit den Schultern","Schnippe mit den Fingern","Lache ploetzlich laut","Sag: Interessant...","Klatsche in die Haende","Sag: Ach wirklich?!","Mach ein ueberraschtes Gesicht","Steh halb auf und setz dich wieder","Tipp jemanden an","Mach ein Foto","Spring auf: HEUREKA!","Wiederhole das letzte Wort","Unterbrech mit Hmm!","Tu so als suchst du etwas","Starre jemanden 3 Sek an","Laechle voellig unpassend","Schau zur Decke und nicke","Reagiere zu spaet","Reagiere zu frueh","Nicke bei jedem Wort","Halte den Atem an","Zeig auf jemand anderen","Sing eine kurze Note","Fake-Gaehne","Klatsch dir auf die Stirn","Summ leise vor dich hin","Stell dir vor du hoerst schlecht","Tu so als haette dich jemand getreten","Mach eine dramatische Pause","Sag: Das kenn ich und nicke wissend","Schreib etwas Imaginaeres auf","Tue so als wuerdest du heimlich SMSen","Sag: Moment mal... nachdenklich","Streich dir ueber den Bart auch ohne einen","Ruf: Bingo! und bereue es sofort","Klopf Rhythmus auf Schenkel","Tue so als verscheuchst du eine Fliege","Huste einmal auffaellig","Sag: Na sowas! mit breitem Grinsen","Rutsch auf deinem Stuhl rum","Mach ein Peace-Zeichen ohne Erklaerung","Klapp imaginaeren Laptop zu","Heb die Hand als waerst du in der Schule","Zieh imaginaere Krawatte gerade","Tu so als haettest du etwas vergessen","Schau dramatisch auf deine Uhr","Klatsch Haende auf Wangen wie Kevin","Sag: Wusste ich es doch!","Tu so als greifst du etwas aus der Luft","Fluester Nachbar etwas Unverstaendliches","Heb beide Daumen hoch ohne Erklaerung","Sag: Ich sage nur... und schweige danach"];
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

const FF = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const C = {
  bg:"#0d0d14",sur:"#16161f",sur2:"#1e1e2a",bdr:"#2a2a3a",
  blue:"#60a5fa",bluel:"#bfdbfe",red:"#f87171",redl:"#fecaca",
  gold:"#fbbf24",txt:"#f0f0f5",muted:"#9090a8",green:"#4ade80",greenl:"#bbf7d0",
};
const GS = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${C.bg};color:${C.txt};font-family:${FF};}
  button{font-family:${FF};cursor:pointer;}
  input{font-family:${FF};}
  *:focus-visible{outline:3px solid #fff!important;outline-offset:2px!important;border-radius:4px;}
  *:focus:not(:focus-visible){outline:none!important;}
  @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
  @keyframes spin{to{transform:rotate(360deg);}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.5;}}
  input::placeholder{color:${C.muted};}
`;
const CARD = {background:C.sur,border:`1px solid ${C.bdr}`,borderRadius:10,padding:18,marginBottom:12};
const ST = {fontSize:16,fontWeight:700,color:C.txt,display:"flex",alignItems:"center",gap:8,marginBottom:12};
const BT = {fontSize:14,lineHeight:1.7,color:C.muted};
const SR = {position:"absolute",left:-9999,width:1,height:1,overflow:"hidden"};

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function roomCode(){return Math.random().toString(36).substring(2,7).toUpperCase();}

// ─── QR CODE (via goqr.me – free, no key) ────────────────────────────────────
function QRCode({url,size=200}){
  const enc = encodeURIComponent(url);
  return(
    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}&bgcolor=16161f&color=f0f0f5&qzone=2`}
      alt={`QR Code: ${url}`} width={size} height={size}
      style={{borderRadius:8,display:"block"}}/>
  );
}

// ─── LOBBY (Host view) ────────────────────────────────────────────────────────
function HostLobby({room,players,onStart}){
  const joinUrl = `${APP_URL}?room=${room.id}`;
  const others = players.filter(p=>!p.is_host);
  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...CARD,borderColor:"rgba(96,165,250,.3)",background:"rgba(96,165,250,.05)",textAlign:"center"}}>
        <div style={{fontSize:12,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.blue,marginBottom:6}}>Raumcode</div>
        <div style={{fontSize:42,fontWeight:800,letterSpacing:6,color:C.txt,marginBottom:4}}>{room.id}</div>
        <div style={{fontSize:12,color:C.muted,marginBottom:16}}>Mitspieler scannen den QR-Code oder geben den Code ein</div>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <QRCode url={joinUrl} size={180}/>
        </div>
        <div style={{fontSize:11,color:C.muted,wordBreak:"break-all"}}>{joinUrl}</div>
      </div>

      <div style={CARD}>
        <div style={{...ST,marginBottom:10}}>👥 Beigetreten ({others.length})</div>
        {others.length===0?(
          <p style={{...BT,textAlign:"center",padding:"10px 0",fontStyle:"italic"}}>Noch niemand da... QR-Code scannen!</p>
        ):(
          <ul style={{listStyle:"none",padding:0}}>
            {others.map(p=>(
              <li key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${C.bdr}`}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:C.green,flexShrink:0,animation:"pulse 2s infinite"}}/>
                <span style={{fontSize:15,fontWeight:600}}>{p.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={onStart} disabled={others.length===0}
        style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${others.length>0?C.green:C.bdr}`,background:others.length>0?"rgba(74,222,128,.1)":C.sur,color:others.length>0?C.greenl:C.muted,cursor:others.length>0?"pointer":"not-allowed",transition:"all .2s"}}>
        {others.length===0?"Warte auf Mitspieler...": `Spiel starten mit ${others.length} Spieler${others.length!==1?"n":""} →`}
      </button>
    </div>
  );
}

// ─── CARDS (Host distributes) ─────────────────────────────────────────────────
function HostCards({room,players,onCardsDealt}){
  const [loading,setLoading] = useState(false);
  const others = players.filter(p=>!p.is_host);

  async function dealCards(){
    setLoading(true);
    const ws = shuffle(WORDS).slice(0,others.length);
    const as = shuffle(ACTIONS).slice(0,others.length);
    for(let i=0;i<others.length;i++){
      await sb.from("players").update({secret_word:ws[i],secret_action:as[i]}).eq("id",others[i].id);
    }
    await sb.from("rooms").update({status:"playing",story_words:ws}).eq("id",room.id);
    onCardsDealt(ws);
    setLoading(false);
  }

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={CARD}>
        <div style={ST}>🎴 Karten austeilen</div>
        <p style={BT}>Jeder Mitspieler bekommt ein geheimes Wort und eine Aktion – direkt auf sein Handy. Tippe unten auf austeilen.</p>
      </div>
      <div style={{...CARD,marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,color:C.txt,marginBottom:8}}>Mitspieler ({others.length})</div>
        {others.map(p=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:`1px solid ${C.bdr}`}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:C.green,flexShrink:0}}/>
            <span style={{fontSize:14,color:C.txt}}>{p.name}</span>
          </div>
        ))}
      </div>
      <button onClick={dealCards} disabled={loading||others.length===0}
        style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${C.blue}`,background:"rgba(96,165,250,.1)",color:C.bluel,cursor:"pointer",transition:"all .2s",opacity:loading?0.6:1}}>
        {loading?"Verteile Karten...":"🃏 Karten austeilen"}
      </button>
    </div>
  );
}

// ─── STORY (Host) ─────────────────────────────────────────────────────────────
function HostStory({room,players,storyWords}){
  const [genre,setGenre] = useState(null);
  const [story,setStory] = useState(room.story||"");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const [revealed,setRevealed] = useState(false);

  async function generate(){
    if(!genre) return;
    setLoading(true);setError("");setStory("");setRevealed(false);
    const sel = genre==="random"?GENRES[Math.floor(Math.random()*(GENRES.length-1))].label:GENRES.find(g=>g.id===genre).label;
    const wl = storyWords||[];
    const prompt = `Schreibe eine kurze witzige Geschichte auf Deutsch im Stil "${sel}". 8-12 Saetze. Diese Woerter NATUERLICH einbauen: ${wl.join(", ")}. Jedes Wort mit **Wort** markieren. NUR die Geschichte, kein Titel. Locker lustig zum Vorlesen.`;
    let text="";
    try{
      const r=await fetch("https://text.pollinations.ai/openai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"openai",messages:[{role:"system",content:"Du bist ein kreativer Geschichtenerzaehler."},{role:"user",content:prompt}],seed:Math.floor(Math.random()*99999)})});
      const d=await r.json();text=d.choices?.[0]?.message?.content||"";
    }catch{}
    if(!text){setError("KI nicht erreichbar. Nochmal versuchen.");setLoading(false);return;}
    setStory(text);
    await sb.from("rooms").update({story:text,status:"playing"}).eq("id",room.id);
    setLoading(false);
  }

  function renderStory(t){
    return t.split(/\*\*(.*?)\*\*/g).map((p,i)=>
      i%2===1?<strong key={i} style={{color:C.gold,textDecoration:"underline dotted",textUnderlineOffset:3}}>{p}</strong>:p
    );
  }

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={CARD}>
        <div style={ST}>✨ KI-Geschichte</div>
        <p style={BT}>Waehle ein Thema. Die KI schreibt eine Geschichte mit den geheimen Woertern. Du liest laut vor – ohne die Woerter zu kennen – und beobachtest die Reaktionen.</p>
      </div>

      <fieldset style={{border:"none",margin:"0 0 14px",padding:0}}>
        <legend style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10,display:"block"}}>Thema waehlen</legend>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {GENRES.map(g=>(
            <button key={g.id} onClick={()=>setGenre(g.id)} aria-pressed={genre===g.id}
              style={{background:genre===g.id?"rgba(251,191,36,.1)":C.sur,border:`2px solid ${genre===g.id?C.gold:C.bdr}`,borderRadius:8,padding:12,cursor:"pointer",textAlign:"left",gridColumn:g.id==="random"?"span 2":"span 1",transition:"all .15s",display:"block"}}>
              <div style={{fontSize:18,marginBottom:3}} aria-hidden="true">{g.emoji}</div>
              <div style={{fontSize:13,fontWeight:700,color:genre===g.id?C.gold:C.txt}}>{g.label}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{g.desc}</div>
            </button>
          ))}
        </div>
      </fieldset>

      <button onClick={generate} disabled={!genre||loading}
        style={{width:"100%",padding:13,borderRadius:8,fontSize:15,fontWeight:700,border:`2px solid ${genre?C.gold:C.bdr}`,background:genre?"rgba(251,191,36,.08)":C.sur,color:genre?C.gold:C.muted,cursor:genre?"pointer":"not-allowed",marginBottom:16,opacity:loading?.7:1,transition:"all .15s"}}>
        {loading?"Wird geschrieben...":"Geschichte generieren"}
      </button>

      {loading&&<div style={{textAlign:"center",padding:24}}><div style={{fontSize:28,display:"inline-block",animation:"spin 1.5s linear infinite"}}>✍️</div><div style={{fontSize:13,color:C.muted,marginTop:8}}>KI schreibt...</div></div>}
      {error&&<div style={{...CARD,borderColor:"rgba(248,113,113,.4)",background:"rgba(248,113,113,.06)"}}><p style={{...BT,color:C.redl}}>{error}</p></div>}

      {story&&!loading&&(
        <div style={{animation:"fadeIn .3s ease"}}>
          <div style={{...CARD,borderColor:"rgba(251,191,36,.3)",background:"rgba(251,191,36,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.gold}}>Jetzt vorlesen!</span>
              <button onClick={generate} style={{background:"transparent",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:6,cursor:"pointer"}}>Neu ↻</button>
            </div>
            <p style={{...BT,marginBottom:14,fontStyle:"italic"}}>Woerter sind versteckt – beobachte wer wann reagiert!</p>
            <div style={{fontSize:16,lineHeight:2.1,color:C.txt}}>{story.replace(/\*\*(.*?)\*\*/g,"$1")}</div>
          </div>
          <div style={{...CARD,borderColor:"rgba(248,113,113,.3)",background:"rgba(248,113,113,.05)"}}>
            <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.red,marginBottom:12}}>Aufloesen – erst nach dem Raten!</div>
            {!revealed?(
              <button onClick={()=>setRevealed(true)}
                style={{width:"100%",padding:13,borderRadius:8,fontSize:15,fontWeight:700,border:`2px solid ${C.red}`,background:"rgba(248,113,113,.08)",color:C.redl,cursor:"pointer"}}>
                Woerter aufdecken
              </button>
            ):(
              <div>
                <div style={{fontSize:15,lineHeight:2.1,color:C.txt,marginBottom:14}}>{renderStory(story)}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingTop:12,borderTop:`1px solid ${C.bdr}`}}>
                  {(storyWords||[]).map(w=><span key={w} style={{fontSize:12,fontWeight:600,color:C.gold,background:"rgba(251,191,36,.1)",padding:"4px 12px",borderRadius:20,border:"1px solid rgba(251,191,36,.3)"}}>{w}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TIMER ────────────────────────────────────────────────────────────────────
function Timer(){
  const [dur,setDur] = useState(60);
  const [rem,setRem] = useState(60);
  const [running,setRunning] = useState(false);
  const [done,setDone] = useState(false);
  const ref = useRef(null);

  useEffect(()=>{
    if(!running)return;
    ref.current=setInterval(()=>{
      setRem(r=>{
        if(r<=1){clearInterval(ref.current);setRunning(false);setDone(true);if(navigator.vibrate)navigator.vibrate([200,100,200]);return 0;}
        return r-1;
      });
    },1000);
    return()=>clearInterval(ref.current);
  },[running]);

  const ratio=rem/dur;
  const offset=565*(1-ratio);
  const sc=ratio>.5?C.blue:ratio>.25?C.gold:C.red;
  const nc=rem<=10?C.red:rem<=20?C.gold:C.txt;
  const mins=Math.floor(rem/60);
  const secs=rem%60;
  const display=mins>0?`${mins}:${String(secs).padStart(2,"0")}`:String(rem);

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <fieldset style={{border:"none",width:"100%",padding:0}}>
        <legend style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:8,display:"block"}}>Dauer</legend>
        <div style={{display:"flex",gap:8}}>
          {[60,90,120,180].map(d=>(
            <button key={d} onClick={()=>{setDur(d);if(!running){setRem(d);setDone(false);}}}
              aria-pressed={dur===d}
              style={{flex:1,background:dur===d?"rgba(248,113,113,.1)":C.sur,border:`2px solid ${dur===d?C.red:C.bdr}`,color:dur===d?C.redl:C.muted,fontSize:14,fontWeight:600,padding:"10px 0",borderRadius:6,cursor:"pointer"}}>
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
          <div style={{fontSize:11,letterSpacing:3,color:C.muted,textTransform:"uppercase",marginTop:2}}>{mins>0?"min:sek":"Sekunden"}</div>
        </div>
      </div>
      {done&&(
        <div role="alert" style={{width:"100%",background:"linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.12))",border:"1.5px solid rgba(248,113,113,.4)",borderRadius:10,padding:18,textAlign:"center"}}>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:2,color:C.redl,textTransform:"uppercase"}}>Zeit ist um!</div>
          <div style={{fontSize:12,color:C.muted,marginTop:4}}>Jetzt Ratephase starten</div>
        </div>
      )}
      <div style={{display:"flex",gap:10,width:"100%"}}>
        <button onClick={()=>{if(done)return;setRunning(r=>!r);}} disabled={done}
          style={{flex:1,padding:14,borderRadius:8,fontSize:17,fontWeight:700,letterSpacing:1,border:`2px solid ${C.red}`,background:"rgba(248,113,113,.1)",color:C.redl,cursor:done?"not-allowed":"pointer",opacity:done?.4:1}}>
          {running?"PAUSE":"START"}
        </button>
        <button onClick={()=>{clearInterval(ref.current);setRunning(false);setRem(dur);setDone(false);}}
          style={{flex:1,padding:14,borderRadius:8,fontSize:17,fontWeight:700,letterSpacing:1,border:`2px solid ${C.bdr}`,background:C.sur,color:C.muted,cursor:"pointer"}}>
          RESET
        </button>
      </div>
    </div>
  );
}

// ─── SCORES ───────────────────────────────────────────────────────────────────
function Scores({players}){
  const [scores,setScores] = useState(()=>{
    const m={};players.filter(p=>!p.is_host).forEach(p=>{m[p.id]=0;});return m;
  });

  function change(id,d){setScores(s=>({...s,[id]:Math.max(0,(s[id]||0)+d)}));}

  const others = players.filter(p=>!p.is_host);
  const sorted = [...others].sort((a,b)=>(scores[b.id]||0)-(scores[a.id]||0));

  return(
    <div>
      <ul style={{listStyle:"none",padding:0,marginBottom:12}}>
        {sorted.map((p,i)=>(
          <li key={p.id} style={{display:"flex",alignItems:"center",gap:8,background:C.sur2,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
            <span style={{fontSize:14,minWidth:24,color:i===0?C.gold:C.muted}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span>
            <span style={{flex:1,fontSize:14,fontWeight:600}}>{p.name}</span>
            <button onClick={()=>change(p.id,-1)} style={{background:C.bdr,border:"none",color:C.txt,width:32,height:32,borderRadius:6,fontSize:18,fontWeight:700,cursor:"pointer"}}>-</button>
            <span style={{fontSize:24,fontWeight:800,color:C.gold,minWidth:36,textAlign:"center"}}>{scores[p.id]||0}</span>
            <button onClick={()=>change(p.id,+1)} style={{background:C.bdr,border:"none",color:C.txt,width:32,height:32,borderRadius:6,fontSize:18,fontWeight:700,cursor:"pointer"}}>+</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PLAYER VIEW (on mobile after QR scan) ────────────────────────────────────
function PlayerView({roomId,playerName,onLeave}){
  const [player,setPlayer] = useState(null);
  const [room,setRoom] = useState(null);
  const [cardRevealed,setCardRevealed] = useState({word:false,action:false});
  const [rerolled,setRerolled] = useState(false);

  useEffect(()=>{
    // Load player + room
    async function load(){
      const {data:rm} = await sb.from("rooms").select("*").eq("id",roomId).single();
      setRoom(rm);
      const {data:pl} = await sb.from("players").select("*").eq("room_id",roomId).eq("name",playerName).order("joined_at",{ascending:false}).limit(1).single();
      setPlayer(pl);
    }
    load();
    // Realtime updates
    const ch = sb.channel(`player-${roomId}-${playerName}`)
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"players",filter:`room_id=eq.${roomId}`},payload=>{
        if(payload.new.name===playerName)setPlayer(payload.new);
      })
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"rooms",filter:`id=eq.${roomId}`},payload=>{
        setRoom(payload.new);
      })
      .subscribe();
    return()=>sb.removeChannel(ch);
  },[roomId,playerName]);

  async function doReroll(){
    if(rerolled||!player)return;
    const {data:allPlayers} = await sb.from("players").select("secret_word,secret_action").eq("room_id",roomId);
    const usedW = allPlayers.map(p=>p.secret_word).filter(Boolean);
    const usedA = allPlayers.map(p=>p.secret_action).filter(Boolean);
    const newW = shuffle(WORDS.filter(w=>!usedW.includes(w)))[0]||player.secret_word;
    const newA = shuffle(ACTIONS.filter(a=>!usedA.includes(a)))[0]||player.secret_action;
    await sb.from("players").update({secret_word:newW,secret_action:newA}).eq("id",player.id);
    setPlayer(p=>({...p,secret_word:newW,secret_action:newA}));
    setCardRevealed({word:false,action:false});
    setRerolled(true);
  }

  if(!player||!room) return(
    <div style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:28,animation:"spin 1.5s linear infinite",display:"inline-block"}}>⏳</div>
      <div style={{fontSize:14,color:C.muted,marginTop:12}}>Verbinde...</div>
    </div>
  );

  const hasCards = player.secret_word && player.secret_action;

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...CARD,borderColor:"rgba(96,165,250,.3)",background:"rgba(96,165,250,.05)",textAlign:"center",padding:"14px 18px"}}>
        <div style={{fontSize:12,color:C.muted,marginBottom:2}}>Du bist in Raum</div>
        <div style={{fontSize:24,fontWeight:800,letterSpacing:4,color:C.txt}}>{roomId}</div>
        <div style={{fontSize:13,color:C.blue,marginTop:2}}>als {playerName}</div>
      </div>

      {!hasCards?(
        <div style={{...CARD,textAlign:"center",padding:"28px 20px"}}>
          <div style={{fontSize:32,marginBottom:12,animation:"pulse 2s infinite"}}>⏳</div>
          <div style={{fontSize:15,fontWeight:700,color:C.txt,marginBottom:6}}>Warte auf Karten...</div>
          <p style={{...BT}}>Der Host teilt gleich die Karten aus. Lass dich ueberraschen!</p>
        </div>
      ):(
        <div>
          <div style={{...CARD,borderColor:"rgba(251,191,36,.3)",background:"rgba(251,191,36,.04)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:C.txt}}>Deine geheimen Karten</div>
              <button onClick={doReroll} disabled={rerolled}
                style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:10,cursor:rerolled?"not-allowed":"pointer",border:`1px solid ${rerolled?C.bdr:"rgba(251,191,36,.4)"}`,background:rerolled?"rgba(90,90,110,.2)":"rgba(251,191,36,.12)",color:rerolled?C.muted:C.gold}}>
                {rerolled?"bereits neu gezogen":"1x neu ziehen"}
              </button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
              {[{key:"word",typ:"Geheimwort",val:player.secret_word,blue:true},{key:"action",typ:"Geheime Aktion",val:player.secret_action,blue:false}].map((cell,ci)=>{
                const rv=cardRevealed[cell.key];
                return(
                  <button key={cell.key} onClick={()=>setCardRevealed(c=>({...c,[cell.key]:!c[cell.key]}))}
                    style={{padding:14,cursor:"pointer",minHeight:90,textAlign:"left",background:"transparent",border:"none",borderRight:ci===0?`1px solid ${C.bdr}`:"none",display:"block",width:"100%"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:6,color:cell.blue?C.blue:C.red}}>
                      <span aria-hidden="true">{cell.blue?"🔵":"🔴"} </span>{cell.typ}
                    </div>
                    <div style={{fontSize:15,fontWeight:700,lineHeight:1.4,color:cell.blue?C.bluel:C.redl,filter:rv?"none":"blur(7px)",transition:"filter .25s",userSelect:rv?"auto":"none"}}>
                      {cell.val}
                    </div>
                    {!rv&&<div style={{fontSize:11,color:C.muted,marginTop:6}}>Tippen zum Aufdecken</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {room.story&&(
            <div style={{...CARD,borderColor:"rgba(96,165,250,.2)",background:"rgba(96,165,250,.04)"}}>
              <div style={{fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:C.blue,marginBottom:8}}>Story laeuft – reagiere wenn dein Wort faellt!</div>
              <p style={{...BT,fontStyle:"italic"}}>Fuehre deine Aktion aus sobald du dein Wort hoerst. Bleib unauffaellig 😏</p>
            </div>
          )}
        </div>
      )}

      <button onClick={onLeave}
        style={{width:"100%",padding:12,borderRadius:8,fontSize:14,fontWeight:600,border:`1px solid ${C.bdr}`,background:"transparent",color:C.muted,cursor:"pointer",marginTop:8}}>
        Raum verlassen
      </button>
    </div>
  );
}

// ─── JOIN SCREEN ──────────────────────────────────────────────────────────────
function JoinScreen({initialCode,onJoined}){
  const [code,setCode] = useState(initialCode||"");
  const [name,setName] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  async function join(){
    if(!code.trim()||!name.trim()){setError("Bitte Code und Namen eingeben.");return;}
    setLoading(true);setError("");
    const {data:room} = await sb.from("rooms").select("*").eq("id",code.toUpperCase().trim()).single();
    if(!room){setError("Raum nicht gefunden. Code pruefen!");setLoading(false);return;}
    const {data:existing} = await sb.from("players").select("id").eq("room_id",room.id).eq("name",name.trim()).single();
    if(existing){setError("Dieser Name ist in diesem Raum schon vergeben.");setLoading(false);return;}
    const {error:err} = await sb.from("players").insert({room_id:room.id,name:name.trim(),is_host:false});
    if(err){setError("Fehler beim Beitreten. Nochmal versuchen.");setLoading(false);return;}
    onJoined(room.id,name.trim());
    setLoading(false);
  }

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...CARD,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎮</div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Raum beitreten</div>
        <p style={{...BT}}>Gib den Raumcode und deinen Namen ein</p>
      </div>
      <div style={CARD}>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Raumcode</label>
        <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="z.B. ABC12" maxLength={5}
          style={{width:"100%",background:C.sur2,border:`1.5px solid ${C.bdr}`,color:C.txt,fontSize:22,fontWeight:800,letterSpacing:6,padding:"12px 14px",borderRadius:8,outline:"none",textAlign:"center",marginBottom:16}}/>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Dein Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&join()} placeholder="Dein Spitzname" maxLength={20}
          style={{width:"100%",background:C.sur2,border:`1.5px solid ${C.bdr}`,color:C.txt,fontSize:16,padding:"12px 14px",borderRadius:8,outline:"none",marginBottom:16}}/>
        {error&&<p style={{fontSize:13,color:C.redl,marginBottom:12}}>{error}</p>}
        <button onClick={join} disabled={loading}
          style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${C.green}`,background:"rgba(74,222,128,.1)",color:C.greenl,cursor:"pointer",opacity:loading?.6:1}}>
          {loading?"Verbinde...":"Beitreten →"}
        </button>
      </div>
    </div>
  );
}

// ─── CREATE ROOM ──────────────────────────────────────────────────────────────
function CreateRoom({onCreated}){
  const [name,setName] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  async function create(){
    if(!name.trim()){setError("Bitte Namen eingeben.");return;}
    setLoading(true);setError("");
    const id = roomCode();
    const {error:err} = await sb.from("rooms").insert({id,host_name:name.trim(),status:"waiting"});
    if(err){setError("Fehler beim Erstellen. Nochmal versuchen.");setLoading(false);return;}
    await sb.from("players").insert({room_id:id,name:name.trim(),is_host:true});
    onCreated(id,name.trim());
    setLoading(false);
  }

  return(
    <div style={{animation:"fadeIn .3s ease"}}>
      <div style={{...CARD,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🎲</div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>Neues Spiel starten</div>
        <p style={{...BT}}>Du erstellst einen Raum und laedt andere per QR-Code ein</p>
      </div>
      <div style={CARD}>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,display:"block",marginBottom:8}}>Dein Name (Host)</label>
        <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&create()} placeholder="Dein Spitzname" maxLength={20}
          style={{width:"100%",background:C.sur2,border:`1.5px solid ${C.bdr}`,color:C.txt,fontSize:16,padding:"12px 14px",borderRadius:8,outline:"none",marginBottom:16}}/>
        {error&&<p style={{fontSize:13,color:C.redl,marginBottom:12}}>{error}</p>}
        <button onClick={create} disabled={loading}
          style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${C.blue}`,background:"rgba(96,165,250,.1)",color:C.bluel,cursor:"pointer",opacity:loading?.6:1}}>
          {loading?"Erstelle Raum...":"Raum erstellen →"}
        </button>
      </div>
    </div>
  );
}

// ─── HOST APP ─────────────────────────────────────────────────────────────────
function HostApp({roomId,hostName,onLeave}){
  const [room,setRoom] = useState(null);
  const [players,setPlayers] = useState([]);
  const [tab,setTab] = useState("lobby");
  const [storyWords,setStoryWords] = useState([]);

  useEffect(()=>{
    async function load(){
      const {data:rm}=await sb.from("rooms").select("*").eq("id",roomId).single();
      setRoom(rm);
      if(rm?.story_words)setStoryWords(rm.story_words);
      const {data:pl}=await sb.from("players").select("*").eq("room_id",roomId).order("joined_at");
      setPlayers(pl||[]);
    }
    load();
    const ch=sb.channel(`host-${roomId}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"players",filter:`room_id=eq.${roomId}`},()=>load())
      .on("postgres_changes",{event:"UPDATE",schema:"public",table:"rooms",filter:`id=eq.${roomId}`},payload=>{
        setRoom(payload.new);
        if(payload.new.story_words)setStoryWords(payload.new.story_words);
      })
      .subscribe();
    return()=>sb.removeChannel(ch);
  },[roomId]);

  const HTABS=[
    {id:"lobby",icon:"🏠",label:"Lobby"},
    {id:"cards",icon:"🎴",label:"Karten"},
    {id:"story",icon:"✨",label:"Story"},
    {id:"timer",icon:"⏱",label:"Timer"},
    {id:"scores",icon:"🏆",label:"Punkte"},
  ];

  return(
    <div>
      <div style={{background:C.sur2,borderRadius:8,padding:"8px 14px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <span style={{fontSize:11,color:C.muted}}>Raum </span>
          <span style={{fontSize:15,fontWeight:800,letterSpacing:3,color:C.txt}}>{roomId}</span>
          <span style={{fontSize:11,color:C.muted}}> · {hostName} (Host)</span>
        </div>
        <button onClick={onLeave} style={{background:"transparent",border:`1px solid ${C.bdr}`,color:C.muted,fontSize:12,padding:"4px 10px",borderRadius:6,cursor:"pointer"}}>Verlassen</button>
      </div>
      <nav>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:16}}>
          {HTABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} aria-selected={tab===t.id}
              style={{background:tab===t.id?"#1a1a2e":C.sur,border:`1.5px solid ${tab===t.id?C.blue:C.bdr}`,color:tab===t.id?C.bluel:C.muted,fontSize:9,fontWeight:600,padding:"9px 2px 7px",borderRadius:6,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer"}}>
              <span style={{fontSize:14}}>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {tab==="lobby"&&<HostLobby room={room||{id:roomId}} players={players} onStart={()=>setTab("cards")}/>}
      {tab==="cards"&&<HostCards room={room||{id:roomId}} players={players} onCardsDealt={w=>{setStoryWords(w);setTab("story");}}/>}
      {tab==="story"&&<HostStory room={room||{id:roomId}} players={players} storyWords={storyWords}/>}
      {tab==="timer"&&<Timer/>}
      {tab==="scores"&&<Scores players={players}/>}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get("room");

  const [screen,setScreen] = useState(urlRoom?"join":"home");
  const [roomId,setRoomId] = useState(urlRoom||"");
  const [myName,setMyName] = useState("");
  const [isHost,setIsHost] = useState(false);

  function handleCreated(id,name){setRoomId(id);setMyName(name);setIsHost(true);setScreen("host");}
  function handleJoined(id,name){setRoomId(id);setMyName(name);setIsHost(false);setScreen("player");}
  function handleLeave(){setScreen("home");setRoomId("");setMyName("");setIsHost(false);window.history.replaceState({},"","/");}

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.txt,fontFamily:FF}}>
      <style>{GS}</style>
      <div style={{maxWidth:500,margin:"0 auto",padding:"0 16px 60px"}}>
        <header style={{textAlign:"center",padding:"22px 0 14px"}}>
          <h1 style={{fontSize:"clamp(34px,9vw,54px)",fontWeight:800,letterSpacing:-1,textTransform:"uppercase",background:"linear-gradient(135deg,#f87171,#fbbf24 50%,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1,margin:0}}>
            Story Chaos
          </h1>
          <p style={{fontSize:11,letterSpacing:3,color:C.muted,textTransform:"uppercase",marginTop:5}}>Das Partyspiel gegen den Erzaehler</p>
        </header>

        <main>
          {screen==="home"&&(
            <div style={{animation:"fadeIn .3s ease"}}>
              <div style={{...CARD,textAlign:"center",padding:"28px 20px",marginBottom:10}}>
                <div style={{fontSize:48,marginBottom:12}}>🎲</div>
                <div style={{fontSize:18,fontWeight:700,marginBottom:8}}>Willkommen!</div>
                <p style={{...BT,marginBottom:20}}>Erstelle einen Raum und lade deine Freunde per QR-Code ein – oder tritt einem bestehenden Raum bei.</p>
                <button onClick={()=>setScreen("create")}
                  style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${C.blue}`,background:"rgba(96,165,250,.1)",color:C.bluel,cursor:"pointer",marginBottom:10}}>
                  🎮 Neues Spiel starten
                </button>
                <button onClick={()=>setScreen("join")}
                  style={{width:"100%",padding:14,borderRadius:8,fontSize:16,fontWeight:700,border:`2px solid ${C.bdr}`,background:C.sur,color:C.muted,cursor:"pointer"}}>
                  🔗 Raum beitreten
                </button>
              </div>
              <div style={{...CARD,padding:"14px 18px"}}>
                <div style={{fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.muted,marginBottom:10}}>Wie es funktioniert</div>
                {["Host erstellt Raum und zeigt QR-Code","Mitspieler scannen QR mit dem Handy","Jeder bekommt sein Wort und seine Aktion","Host liest Geschichte vor – alle reagieren heimlich","Host raet wer welches Wort hatte"].map((t,i)=>(
                  <div key={i} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:i<4?`1px solid ${C.bdr}`:"none"}}>
                    <span style={{fontSize:13,color:C.blue,fontWeight:700,minWidth:20}}>{i+1}.</span>
                    <span style={{fontSize:13,color:C.muted}}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {screen==="create"&&(
            <div>
              <button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:12,padding:"4px 0"}}>← Zurueck</button>
              <CreateRoom onCreated={handleCreated}/>
            </div>
          )}
          {screen==="join"&&(
            <div>
              <button onClick={()=>setScreen("home")} style={{background:"transparent",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:12,padding:"4px 0"}}>← Zurueck</button>
              <JoinScreen initialCode={urlRoom||""} onJoined={handleJoined}/>
            </div>
          )}
          {screen==="host"&&<HostApp roomId={roomId} hostName={myName} onLeave={handleLeave}/>}
          {screen==="player"&&<PlayerView roomId={roomId} playerName={myName} onLeave={handleLeave}/>}
        </main>
      </div>
    </div>
  );
}
