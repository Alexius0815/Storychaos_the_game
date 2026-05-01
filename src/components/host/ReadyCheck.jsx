import { useEffect } from "react";
import { getAudience, getNarratorId } from "../../game/rooms";
import { HelpPopover } from "../common/SupportUI";

export default function ReadyCheck({ room, players, ui, C, S, acc, hubPlayerName, onAllReady, onCelebrate }) {
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const others = getAudience(players, narratorId, hubPlayerName);
  const readyOnes = others.filter((player) => player.ready);
  const allReady = others.length > 0 && readyOnes.length === others.length;

  useEffect(() => {
    if (allReady) onCelebrate?.([100, 50, 200]);
  }, [allReady, onCelebrate]);

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={S.st}>{ui.ready.title}</div>
          <HelpPopover title={ui.ready.title} ui={ui} C={C} S={S} acc={acc}>
            <div>{ui.ready.desc}</div>
          </HelpPopover>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{ui.ready.status}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{ui.ready.readyCount(readyOnes.length, others.length)}</div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: C.sur2, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: allReady ? acc.green : acc.gold, width: `${others.length > 0 ? (readyOnes.length / others.length) * 100 : 0}%`, transition: "width .4s ease" }} />
        </div>
        {others.map((player) => (
          <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
            <span style={{ fontSize: 16 }}>{player.ready ? "✅" : "⏳"}</span>
            <span style={{ fontSize: 14, color: C.txt, flex: 1 }}>{player.name}</span>
            {player.rerolled && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "rgba(251,191,36,.12)", color: acc.gold, border: "1px solid rgba(251,191,36,.3)" }}>{ui.ready.rerolled}</span>}
          </div>
        ))}
      </div>

      {allReady && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <div style={{ ...S.card, borderColor: "rgba(74,222,128,.3)", background: "linear-gradient(180deg, rgba(74,222,128,.12), rgba(74,222,128,.05))", textAlign: "center", padding: "20px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: acc.greenl }}>{ui.ready.allReady}</div>
          </div>
          <button onClick={onAllReady} style={S.pbtn(acc.green, "rgba(74,222,128,.1)")}>{ui.ready.continue}</button>
        </div>
      )}
    </div>
  );
}
