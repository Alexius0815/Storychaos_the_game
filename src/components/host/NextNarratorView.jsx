import { useEffect, useState } from "react";
import { getAudience, getNarratorId } from "../../game/rooms";
import useViewport from "../../hooks/useViewport";

export default function NextNarratorView({ room, players, ui, C, S, acc, hubPlayerName, onChooseNarrator, onBack }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const others = getAudience(players, narratorId, hubPlayerName);
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
      <div style={{ ...S.card, padding: viewport.isDesktop ? 18 : 16, backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", background: C.mode === "dark" ? "linear-gradient(135deg, rgba(22,22,31,.88), rgba(36,36,52,.78))" : "linear-gradient(135deg, rgba(255,255,255,.94), rgba(244,244,252,.84))", borderColor: "rgba(96,165,250,.24)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div style={S.st}>{ui.scores.nextTitle}</div>
          <button onClick={onBack} style={S.sbtn(C.muted)}>{ui.common.back}</button>
        </div>
        <button onClick={startNextRound} disabled={!canAdvance || startingNextRound} style={{ ...S.pbtn(acc.blue, "rgba(96,165,250,.1)"), marginBottom: 16 }}>
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
                  border: `1.5px solid ${active ? acc.blue : C.bdr}`,
                  color: active ? acc.bluel : C.txt,
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
