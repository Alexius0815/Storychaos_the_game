import { useEffect, useState } from "react";
import { GAME_PHASES } from "../../constants/phases";
import { getAudience, getNarratorId, getVisiblePlayers } from "../../game/rooms";
import { HelpPopover } from "../common/SupportUI";
import NextNarratorView from "./NextNarratorView";
import useViewport from "../../hooks/useViewport";

export default function Scores({
  room,
  players,
  ui,
  C,
  S,
  acc,
  appIcon,
  hubPlayerName,
  votes = {},
  narratorAwarded,
  onChooseNarrator,
  onFinalizeNarratorVote,
  finalizingNarratorVote,
  awardedPlayerIds = [],
  onAwardPlayer,
}) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const narrator = getVisiblePlayers(players, hubPlayerName).find((player) => player.id === narratorId);
  const others = getAudience(players, narratorId, hubPlayerName);
  const sorted = [...getVisiblePlayers(players, hubPlayerName)].sort((a, b) => (b.score || 0) - (a.score || 0));
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

  return (
    <div>
      <div style={{ ...S.card, padding: viewport.isDesktop ? 16 : 18, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", background: C.mode === "dark" ? "linear-gradient(135deg, rgba(22,22,31,.88), rgba(36,36,52,.76))" : "linear-gradient(135deg, rgba(255,255,255,.92), rgba(244,244,252,.82))", borderColor: "rgba(96,165,250,.24)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur2, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={appIcon} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.scores.title}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => setView("action")} style={{ ...S.sbtn(view === "action" ? acc.blue : C.muted), background: view === "action" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.actionView}</button>
            <button onClick={() => setView("vote")} style={{ ...S.sbtn(view === "vote" ? acc.blue : C.muted), background: view === "vote" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.voteView}</button>
            <button onClick={() => setView("board")} style={{ ...S.sbtn(view === "board" ? acc.blue : C.muted), background: view === "board" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.scores.boardView}</button>
            <HelpPopover title={ui.scores.title} ui={ui} C={C} S={S} acc={acc}>
              <div>{ui.scores.desc}</div>
              {ui.scores.rules.map((rule) => <div key={rule}>{rule}</div>)}
            </HelpPopover>
          </div>
        </div>
        {view === "action" && (
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: acc.gold, background: "rgba(251,191,36,.10)", border: "1px solid rgba(251,191,36,.24)", padding: "6px 10px", borderRadius: 999 }}>
              {others.length} · {ui.scores.pointsTitle}
            </span>
          </div>
        )}
      </div>

      {view === "action" ? (
        <div style={{ animation: "fadeIn .22s ease" }}>
          <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.mode === "dark" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", minHeight: compactScoreHeight }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.scores.pointsTitle}</div>
              <button onClick={() => setView("vote")} style={{ ...S.sbtn(acc.blue), background: "rgba(96,165,250,.1)" }}>
                {ui.scores.continueToVote}
              </button>
            </div>
            <div style={{ marginTop: 0, marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: "rgba(251,191,36,.08)", border: "1px solid rgba(251,191,36,.22)", color: C.txt, fontSize: 13, fontWeight: 700 }}>
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
                          {ui.scores.currentScore}: <span style={{ color: acc.gold, fontWeight: 800 }}>{player.score || 0}</span>
                        </div>
                      </div>
                      <button onClick={() => givePoint(player)} disabled={savingScoreId === player.id || alreadyAwarded} style={{ ...S.sbtn(alreadyAwarded ? acc.green : acc.gold), minWidth: 120, background: alreadyAwarded ? "rgba(74,222,128,.10)" : "rgba(251,191,36,.10)", opacity: savingScoreId === player.id ? 0.7 : 1, cursor: alreadyAwarded ? "default" : "pointer" }}>
                        {alreadyAwarded ? ui.scores.pointGiven : ui.scores.addPoint}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : view === "vote" ? (
        <div style={{ animation: "fadeIn .22s ease" }}>
          <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.mode === "dark" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", minHeight: compactScoreHeight }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.scores.narratorVoteTitle}</div>
              {nextCandidates.length > 0 && room?.status === GAME_PHASES.VOTED && (
                <button onClick={() => setView("next")} style={{ ...S.sbtn(acc.blue), background: "rgba(96,165,250,.1)" }}>
                  {ui.scores.continueToNext}
                </button>
              )}
            </div>
            <p style={S.bt}>{ui.scores.narratorVoteDesc}</p>
            {narrator && (
              <div style={{ background: C.sur2, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.bdr}`, marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.txt }}>{narrator.name}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.scores.currentScore}: <span style={{ color: acc.gold, fontWeight: 800 }}>{narrator.score || 0}</span></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ ...S.sbtn(acc.green), cursor: "default" }}>{ui.scores.narratorVoteYes}: {yesVotes}</span>
                    <span style={{ ...S.sbtn(C.muted), cursor: "default" }}>{ui.scores.narratorVoteNo}: {noVotes}</span>
                  </div>
                </div>
                <p style={{ ...S.bt, marginTop: 12 }}>{ui.scores.narratorVoteWaiting(voteEntries.length, audienceCount)}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                  <div style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(74,222,128,.10)", border: "1px solid rgba(74,222,128,.26)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: acc.green, marginBottom: 6 }}>{ui.scores.narratorVoteYes}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: acc.greenl, lineHeight: 1 }}>{yesVotes}</div>
                  </div>
                  <div style={{ borderRadius: 14, padding: "14px 16px", background: "rgba(148,163,184,.10)", border: `1px solid ${C.bdr}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{ui.scores.narratorVoteNo}</div>
                    <div style={{ fontSize: 30, fontWeight: 800, color: C.txt, lineHeight: 1 }}>{noVotes}</div>
                  </div>
                </div>
                {room?.status === GAME_PHASES.VOTED ? (
                  <div style={{ marginTop: 14, padding: "18px 18px", borderRadius: 16, background: narratorAwarded ? "linear-gradient(180deg, rgba(74,222,128,.16), rgba(74,222,128,.06))" : "linear-gradient(180deg, rgba(148,163,184,.14), rgba(148,163,184,.06))", border: `1px solid ${narratorAwarded ? "rgba(74,222,128,.30)" : C.bdr}`, color: narratorAwarded ? acc.greenl : C.txt }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 8 }}>
                      {ui.scores.narratorVoteDone}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.35 }}>
                      {narratorAwarded ? ui.scores.narratorVoteApproved : ui.scores.narratorVoteRejected}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 16, background: "linear-gradient(180deg, rgba(96,165,250,.10), rgba(96,165,250,.04))", border: "1px solid rgba(96,165,250,.24)", color: C.txt }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: acc.blue, marginBottom: 8 }}>
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
        <div style={{ ...S.card, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: C.mode === "dark" ? "rgba(22,22,31,.78)" : "rgba(255,255,255,.82)", padding: 14 }}>
          <div style={{ ...S.st, marginBottom: 12 }}>{ui.scores.boardView}</div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr", gap: 8 }}>
            {sorted.map((player, index) => (
              <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 8, background: C.sur2, borderRadius: 8, padding: "10px 12px", marginBottom: 0 }}>
                <span style={{ fontSize: 16, minWidth: 26 }}>{medals[index] || `${index + 1}.`}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.txt }}>{player.name}</span>
                <span style={{ fontSize: 24, fontWeight: 800, color: acc.gold, minWidth: 36, textAlign: "center" }}>{player.score || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <NextNarratorView room={room} players={players} ui={ui} C={C} S={S} acc={acc} hubPlayerName={hubPlayerName} onChooseNarrator={onChooseNarrator} onBack={() => setView("action")} />
      )}
    </div>
  );
}
