import { useEffect, useRef, useState } from "react";
import { ACTIVE_ROUND_PHASES, GAME_PHASES, SCORE_PHASES } from "../../constants/phases";
import { detectLanguageFromSample, shuffle } from "../../game/cards";
import { sb } from "../../lib/supabase";
import { ExitIconButton, HelpPopover } from "../common/SupportUI";
import useViewport from "../../hooks/useViewport";

export default function PlayerView({
  roomId,
  playerName,
  onLeave,
  ui,
  contentLang,
  setContentLang,
  C,
  S,
  acc,
  wordLookups,
  actionLookups,
  allWordsByLang,
  allActionsByLang,
  getPlayerPhase,
  vibrate,
}) {
  const isLight = C.mode === "light";
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
        setContentLang((current) => detectLanguageFromSample(currentPlayer.secret_word, currentPlayer.secret_action, current, wordLookups, actionLookups));
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
          setContentLang((current) => detectLanguageFromSample(payload.new.secret_word, payload.new.secret_action, current, wordLookups, actionLookups));
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
  }, [roomId, playerName, setContentLang, onLeave, ui.player.kicked, wordLookups, actionLookups, vibrate]);

  async function doReroll() {
    const storyStarted = !!room?.story || ACTIVE_ROUND_PHASES.includes(room?.status);
    if (rerolled || !player || storyStarted) return;
    const { data: all } = await sb.from("players").select("secret_word,secret_action").eq("room_id", roomId);
    const usedWords = all.map((entry) => entry.secret_word).filter(Boolean);
    const usedActions = all.map((entry) => entry.secret_action).filter(Boolean);
    const activeLang = detectLanguageFromSample(player.secret_word, player.secret_action, contentLang, wordLookups, actionLookups);
    const newWord = shuffle(allWordsByLang[activeLang].filter((word) => !usedWords.includes(word)))[0] || player.secret_word;
    const newAction = shuffle(allActionsByLang[activeLang].filter((action) => !usedActions.includes(action)))[0] || player.secret_action;
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
      <div style={{ ...S.card, borderColor: isLight ? "rgba(37,99,235,.26)" : "rgba(96,165,250,.3)", background: isLight ? "linear-gradient(180deg, rgba(37,99,235,.10), rgba(37,99,235,.03))" : "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03))", textAlign: "center", padding: "12px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 34px", alignItems: "start", gap: 10 }}>
          <div />
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{ui.player.inRoom}</div>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: C.txt }}>{roomId}</div>
            <div style={{ fontSize: 13, color: acc.blue, marginTop: 2 }}>{ui.player.as} {playerName}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <ExitIconButton onClick={onLeave} label={ui.common.leaveRoom} C={C} S={S} />
          </div>
        </div>
      </div>

      <div style={{ ...S.card, borderColor: isLight ? "rgba(37,99,235,.22)" : "rgba(96,165,250,.24)", background: isLight ? "linear-gradient(180deg, rgba(37,99,235,.10), rgba(37,99,235,.03))" : "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03))" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: acc.blue, marginBottom: 8 }}>{ui.common.phaseTitle}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.txt }}>{playerPhase}</div>
          </div>
          <HelpPopover title={playerPhase} ui={ui} C={C} S={S} acc={acc} align="left">
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
            <div style={{ ...S.card, borderColor: isLight ? "rgba(180,83,9,.24)" : "rgba(251,191,36,.3)", background: isLight ? "rgba(180,83,9,.06)" : "rgba(251,191,36,.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ ...S.st, marginBottom: 0 }}>{ui.player.pointsTitle}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setPointsView("vote")} style={{ ...S.sbtn(pointsView === "vote" ? acc.blue : C.muted), background: pointsView === "vote" ? (isLight ? "rgba(37,99,235,.12)" : "rgba(96,165,250,.1)") : "transparent" }}>{ui.player.voteView}</button>
                  <button onClick={() => setPointsView("card")} style={{ ...S.sbtn(pointsView === "card" ? acc.blue : C.muted), background: pointsView === "card" ? (isLight ? "rgba(37,99,235,.12)" : "rgba(96,165,250,.1)") : "transparent" }}>{ui.player.cardView}</button>
                </div>
              </div>
              <p style={{ ...S.bt, marginBottom: pointsView === "card" ? 12 : 0 }}>{ui.player.pointsDesc}</p>
              {pointsView === "card" && (
                <div style={{ ...S.card2, marginBottom: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.blue, marginBottom: 8 }}>{ui.player.secretWord}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: acc.bluel }}>{player.secret_word}</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto" }}>
            {pointsView === "vote" && room.status === GAME_PHASES.VOTING && (
              <div style={{ ...S.card, borderColor: isLight ? "rgba(180,83,9,.24)" : "rgba(251,191,36,.3)", background: isLight ? "rgba(180,83,9,.06)" : "rgba(251,191,36,.05)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.gold, marginBottom: 8 }}>{ui.player.narratorVoteTitle}</div>
                <p style={{ ...S.bt, marginBottom: 12 }}>{ui.player.narratorVoteDesc}</p>
                {narratorVote === null ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
                    <button onClick={() => castNarratorVote(true)} style={S.pbtn(acc.green, "rgba(74,222,128,.1)")}>{ui.player.narratorVoteYes}</button>
                    <button onClick={() => castNarratorVote(false)} style={S.pbtn(C.bdr, C.sur2)}>{ui.player.narratorVoteNo}</button>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, padding: "14px 16px", borderRadius: 14, background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.24)", color: acc.greenl, fontSize: 14, fontWeight: 700 }}>
                    {ui.player.narratorVoteSent}
                  </div>
                )}
              </div>
            )}

            {pointsView === "vote" && room.status === GAME_PHASES.VOTED && voteResult !== null && (
              <div style={{ ...S.card, borderColor: voteResult ? "rgba(74,222,128,.3)" : C.bdr, background: voteResult ? "linear-gradient(180deg, rgba(74,222,128,.12), rgba(74,222,128,.05))" : "linear-gradient(180deg, rgba(148,163,184,.14), rgba(148,163,184,.06))", marginTop: 12, padding: "18px 18px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: voteResult ? acc.green : C.muted, marginBottom: 8 }}>
                  {ui.player.narratorVoteTitle}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: voteResult ? acc.greenl : C.txt, lineHeight: 1.35 }}>
                  {voteResult ? ui.player.narratorVoteApproved : ui.player.narratorVoteRejected}
                </div>
              </div>
            )}

            {pointsView === "vote" && room.status === GAME_PHASES.VOTED && voteResult === null && (
              <div style={{ ...S.card, borderColor: isLight ? "rgba(37,99,235,.22)" : "rgba(96,165,250,.24)", background: isLight ? "rgba(37,99,235,.07)" : "rgba(96,165,250,.06)", marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: acc.bluel }}>{ui.player.narratorVotePending}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, alignItems: "start" }}>
          <div>
            <div style={{ ...S.card, borderColor: isLight ? "rgba(180,83,9,.24)" : "rgba(251,191,36,.3)", background: isLight ? "linear-gradient(180deg, rgba(180,83,9,.10), rgba(180,83,9,.03))" : "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: acc.gold, marginBottom: 6 }}>{ui.player.phaseCards}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.txt }}>{ui.player.secretCards}</div>
                </div>
                <button onClick={doReroll} disabled={rerolled || storyStarted} style={{ fontSize: 11, fontWeight: 700, padding: "6px 11px", borderRadius: 999, cursor: rerolled || storyStarted ? "not-allowed" : "pointer", border: `1px solid ${rerolled || storyStarted ? C.bdr : isLight ? "rgba(180,83,9,.30)" : "rgba(251,191,36,.4)"}`, background: rerolled || storyStarted ? C.sur2 : isLight ? "rgba(180,83,9,.10)" : "rgba(251,191,36,.12)", color: rerolled || storyStarted ? C.muted : acc.gold }}>
                  {rerolled ? ui.player.rerolled : ui.player.reroll}
                </button>
              </div>
              {bothRevealed && !isReady && (
                <button onClick={markReady} disabled={markingReady} style={{ ...S.pbtn(acc.green, "rgba(74,222,128,.1)"), marginBottom: 12, animation: "fadeIn .3s ease" }}>
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
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: cell.blue ? acc.blue : acc.red }}>
                        <span aria-hidden="true">{cell.blue ? "🔵" : "🔴"} </span>{cell.type}
                      </div>
                      <div style={{ fontSize: viewport.isDesktop ? 17 : 15, fontWeight: 700, lineHeight: 1.4, color: cell.blue ? acc.bluel : acc.redl, filter: revealed ? "none" : "blur(7px)", transition: "filter .25s", userSelect: revealed ? "auto" : "none" }}>{cell.value}</div>
                      {!revealed && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{ui.player.tapReveal}</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {isReady && (
              <div style={{ ...S.card, borderColor: "rgba(74,222,128,.3)", background: "rgba(74,222,128,.06)", textAlign: "center", padding: "14px 18px", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: acc.greenl }}>{ui.player.readyState}</div>
              </div>
            )}

            {!bothRevealed && (
              <div style={{ ...S.card2, textAlign: "center", padding: "12px 16px", marginBottom: 12, borderStyle: "dashed" }}>
                <p style={{ ...S.bt, fontSize: 13 }}>{ui.player.revealBoth}</p>
              </div>
            )}

            {room.story && (
              <div style={{ ...S.card, borderColor: isLight ? "rgba(37,99,235,.20)" : "rgba(96,165,250,.2)", background: isLight ? "rgba(37,99,235,.06)" : "rgba(96,165,250,.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.blue, marginBottom: 8 }}>{ui.player.storyRunning}</div>
                <p style={{ ...S.bt, fontStyle: "italic" }}>{ui.player.reactHint}</p>
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: acc.bluel }}>{ui.player.yourWord}</span>
                  <span style={{ background: isLight ? "rgba(37,99,235,.12)" : "rgba(96,165,250,.15)", padding: "4px 10px", borderRadius: 20, color: acc.bluel, fontSize: 13, fontWeight: 800 }}>{player.secret_word}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
