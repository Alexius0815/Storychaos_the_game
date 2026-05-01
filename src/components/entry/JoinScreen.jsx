import { useState } from "react";
import { sb } from "../../lib/supabase";
import { EntryHero, EntryNoteCard } from "../common/SupportUI";

export default function JoinScreen({ initialCode, onJoined, ui, C, S, acc, hubPlayerName, appIcon }) {
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    if (!code.trim() || !name.trim()) {
      setError(ui.join.emptyError);
      return;
    }
    if (name.trim() === hubPlayerName) {
      setError(ui.join.nameTaken);
      return;
    }
    setLoading(true);
    setError("");
    const { data: room } = await sb.from("rooms").select("*").eq("id", code.toUpperCase().trim()).single();
    if (!room) {
      setError(ui.join.roomNotFound);
      setLoading(false);
      return;
    }
    if (room.password && room.password !== pw) {
      setNeedPw(true);
      setError(ui.join.wrongPassword);
      setLoading(false);
      return;
    }
    const { data: existing } = await sb.from("players").select("id").eq("room_id", room.id).eq("name", name.trim()).single();
    if (existing) {
      setError(ui.join.nameTaken);
      setLoading(false);
      return;
    }
    const { data: joinedPlayer, error: joinError } = await sb.from("players").insert({ room_id: room.id, name: name.trim(), is_host: false }).select().single();
    if (joinError || !joinedPlayer) {
      setError(ui.join.genericError);
      setLoading(false);
      return;
    }
    onJoined(room.id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <EntryHero C={C} S={S} title={ui.join.title} desc={ui.join.desc} accent={acc.blue} appIcon={appIcon} />
      <div style={{ ...S.card, padding: "18px 16px", marginBottom: 12 }}>
        <button onClick={join} disabled={loading} style={{ ...S.pbtn(acc.green, "rgba(74,222,128,.1)"), marginBottom: 16 }}>
          {loading ? ui.join.connecting : ui.join.button}
        </button>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.roomCode}</label>
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder={ui.join.roomPlaceholder} maxLength={5} style={{ ...S.input, fontSize: 22, fontWeight: 800, letterSpacing: 6, textAlign: "center", marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.yourName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && !needPw && join()} placeholder={ui.join.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: needPw ? 14 : 0 }} />
        {needPw && (
          <>
            <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.password}</label>
            <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} onKeyDown={(event) => event.key === "Enter" && join()} placeholder={ui.join.passwordPlaceholder} style={S.input} />
          </>
        )}
        {error && <p style={{ fontSize: 13, color: acc.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        <EntryNoteCard label={ui.common.status} title={ui.join.cardHintTitle} text={ui.join.cardHintText} C={C} />
        <EntryNoteCard label={ui.hostTabs.lobby} title={ui.join.qrHintTitle} text={ui.join.qrHintText} C={C} />
      </div>
    </div>
  );
}
