import { useState } from "react";
import { GAME_PHASES } from "../../constants/phases";
import { roomCode } from "../../game/cards";
import { sb } from "../../lib/supabase";
import { EntryHero, EntryNoteCard } from "../common/SupportUI";

export default function CreateRoom({ onCreated, ui, C, S, acc, appIcon }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!name.trim()) {
      setError(ui.create.emptyError);
      return;
    }
    setLoading(true);
    setError("");
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    const id = roomCode();
    const { error: createError } = await sb.from("rooms").insert({ id, host_name: name.trim(), status: GAME_PHASES.WAITING, password: pw || null });
    if (createError) {
      setError(ui.create.genericError);
      setLoading(false);
      return;
    }
    const { data: hostPlayer, error: hostError } = await sb.from("players").insert({ room_id: id, name: name.trim(), is_host: true }).select().single();
    if (hostError) {
      setError(ui.create.genericError);
      setLoading(false);
      return;
    }
    await sb.from("rooms").update({ narrator_id: hostPlayer.id, past_narrators: [hostPlayer.id], round: 1 }).eq("id", id);
    onCreated(id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <EntryHero C={C} S={S} title={ui.create.title} desc={ui.create.desc} accent={acc.gold} appIcon={appIcon} />
      <div style={{ ...S.card, padding: "18px 16px", marginBottom: 12 }}>
        <button onClick={create} disabled={loading} style={{ ...S.pbtn(acc.blue, "rgba(96,165,250,.1)"), marginBottom: 16 }}>
          {loading ? ui.create.creating : ui.create.button}
        </button>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.create.hostName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && create()} placeholder={ui.create.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>
          {ui.common.password} <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>({ui.common.optional})</span>
        </label>
        <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} placeholder={ui.create.emptyPassword} maxLength={20} style={S.input} />
        {error && <p style={{ fontSize: 13, color: acc.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        <EntryNoteCard label={ui.common.host} title={ui.create.flowTitle} text={ui.create.flowText} C={C} />
        <EntryNoteCard label={ui.hostLobby.tvHub} title={ui.create.partyTitle} text={ui.create.partyText} C={C} />
      </div>
    </div>
  );
}
