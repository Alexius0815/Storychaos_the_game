import { useState } from "react";
import { PRE_STORY_PHASES } from "../../constants/phases";
import { getAudience, getNarratorId } from "../../game/rooms";
import { HelpPopover, QRCode, RemovePlayerIconButton } from "../common/SupportUI";
import useViewport from "../../hooks/useViewport";

export default function HostLobby({ room, players, gameLang, lang, ui, C, S, acc, appUrl, hubPlayerName, onStart, onOpenTv, onRemovePlayer }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const others = getAudience(players, narratorId, hubPlayerName);
  const joinUrl = `${appUrl}?room=${room.id}&lang=${gameLang}`;
  const tvUrl = `${appUrl}?room=${room.id}&lang=${gameLang}&view=tv${room?.password ? `&tv=${encodeURIComponent(room.password)}` : ""}`;
  const [view, setView] = useState("invite");
  const [copied, setCopied] = useState(false);
  const [removingPlayerId, setRemovingPlayerId] = useState(null);

  async function copyTvLink() {
    try {
      await navigator.clipboard.writeText(tvUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function handleRemovePlayer(player) {
    if (!onRemovePlayer || removingPlayerId) return;
    const runningRound = room?.status && !PRE_STORY_PHASES.includes(room.status);
    const confirmed = window.confirm(
      runningRound
        ? ui.hostLobby.confirmRemovePlayerRunning(player.name)
        : ui.hostLobby.confirmRemovePlayer(player.name)
    );
    if (!confirmed) return;
    setRemovingPlayerId(player.id);
    const ok = await onRemovePlayer(player);
    if (!ok) window.alert(ui.hostLobby.removePlayerError);
    setRemovingPlayerId(null);
  }

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(96,165,250,.3)", background: "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.02))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.blue, marginBottom: 6 }}>{ui.common.roomCode}</div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: 6, color: C.txt }}>{room.id}</div>
          </div>
          <HelpPopover title={ui.hostTabs.lobby} ui={ui} C={C} S={S} acc={acc}>
            <div>{ui.hostLobby.joinHint}</div>
            <div>{ui.hostLobby.start(Math.max(others.length, 1)).replace(" →", "")}</div>
          </HelpPopover>
        </div>
        <button onClick={onStart} disabled={others.length === 0} style={{ ...S.pbtn(others.length > 0 ? acc.green : C.bdr, others.length > 0 ? "rgba(74,222,128,.1)" : C.sur), marginBottom: 12 }}>
          {others.length === 0 ? ui.hostLobby.waiting : ui.hostLobby.start(others.length)}
        </button>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={() => setView("invite")} style={{ ...S.sbtn(view === "invite" ? acc.blue : C.muted), background: view === "invite" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.hostLobby.inviteView}</button>
          <button onClick={() => setView("players")} style={{ ...S.sbtn(view === "players" ? acc.blue : C.muted), background: view === "players" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.hostLobby.playersView}</button>
        </div>
        {view === "invite" ? (
          <div style={{ display: "grid", gridTemplateColumns: viewport.width >= 980 ? "minmax(0, 1fr) minmax(300px, .92fr)" : "1fr", gap: 12, alignItems: "start" }}>
            <div style={{ textAlign: "center", background: C.sur2, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><div style={{ padding: 12, borderRadius: 18, background: C.sur, border: `1px solid ${C.bdr}` }}><QRCode url={joinUrl} size={176} C={C} lang={lang} /></div></div>
              <div style={{ fontSize: 11, color: C.muted, wordBreak: "break-all", background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "10px 12px" }}>{joinUrl}</div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {!!room?.password && <div style={{ fontSize: 11, color: C.muted, padding: "0 2px" }}>{ui.hostLobby.tvProtectedHint}</div>}
              {onOpenTv && (
              <div style={{ ...S.card2, marginTop: 0, marginBottom: 0, textAlign: "left", borderColor: "rgba(251,191,36,.26)", background: "linear-gradient(180deg, rgba(251,191,36,.10), rgba(251,191,36,.03))" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.9, textTransform: "uppercase", color: acc.gold, marginBottom: 8 }}>{ui.hostLobby.tvHub}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.txt, letterSpacing: "-0.03em", marginBottom: 6 }}>{ui.hostLobby.tvTitle}</div>
                <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>{ui.hostLobby.tvDesc}</div>
                <div style={{ fontSize: 11, color: C.muted, wordBreak: "break-all", background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>{tvUrl}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={() => onOpenTv(room?.password || "", "open", gameLang)} style={{ ...S.sbtn(acc.gold), background: "rgba(251,191,36,.08)" }}>{ui.hostLobby.tvOpenExternal}</button>
                  <button onClick={copyTvLink} style={S.sbtn(C.muted)}>{copied ? ui.common.copied : ui.hostLobby.tvCopyExternal}</button>
                </div>
              </div>
            )}
            </div>
          </div>
        ) : (
          <div>
            {room?.round > 1 && room?.host_name && (
              <div style={{ ...S.card2, borderColor: "rgba(251,191,36,.35)", background: "linear-gradient(180deg, rgba(251,191,36,.12), rgba(251,191,36,.04))", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: acc.gold, marginBottom: 8 }}>{ui.hostLobby.nextRoundTitle}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.txt }}>{ui.scores.nextUp(room.host_name)}</div>
              </div>
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.txt, marginBottom: 10 }}>{ui.hostLobby.joined(others.length)}</div>
            {others.length === 0 ? (
              <p style={{ ...S.bt, textAlign: "center", padding: "12px 0", fontStyle: "italic" }}>{ui.hostLobby.empty}</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: viewport.width >= 980 ? "1fr 1fr" : "1fr", gap: 10 }}>
                {others.map((player) => (
                  <li
                    key={player.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 12px",
                      border: `1px solid ${C.bdr}`,
                      borderRadius: 14,
                      background: C.sur2,
                      opacity: removingPlayerId === player.id ? 0.45 : 1,
                      transform: removingPlayerId === player.id ? "scale(.985)" : "scale(1)",
                      transition: "opacity .18s ease, transform .18s ease",
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: acc.green, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, fontWeight: 600, color: C.txt, flex: 1 }}>{player.name}</span>
                    <RemovePlayerIconButton onClick={() => handleRemovePlayer(player)} busy={removingPlayerId === player.id} label={ui.hostLobby.removePlayer} C={C} S={S} acc={acc} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
