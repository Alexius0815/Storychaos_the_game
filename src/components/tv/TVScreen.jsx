import { useEffect, useState } from "react";
import { GAME_PHASES, PRE_STORY_PHASES, SCORE_PHASES } from "../../constants/phases";
import { getAudience, getNarratorId, getVisiblePlayers } from "../../game/rooms";
import { sb } from "../../lib/supabase";
import { QRCode } from "../common/SupportUI";
import useViewport from "../../hooks/useViewport";

export default function TVScreen({ roomId, lang, ui, C, S, tvKey, appUrl, hubPlayerName, acc, detectRoundLanguage, parseFreestyleWords, renderHighlightedStory }) {
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
    window.location.href = appUrl;
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
          <div style={{ ...tvLabel, color: acc.gold, marginBottom: 12 }}>{ui.hostLobby.tvHub}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: tvBody.color, marginBottom: 10 }}>{ui.tv.blockedTitle}</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: tvMuted.color, marginBottom: 18 }}>{ui.tv.blockedDesc}</div>
          <button onClick={exitTvScreen} style={S.pbtn(acc.gold, "rgba(251,191,36,.10)")}>{ui.common.back}</button>
        </div>
      </div>
    );
  }

  const narratorId = getNarratorId(room, players, hubPlayerName);
  const narrator = getVisiblePlayers(players, hubPlayerName).find((player) => player.id === narratorId);
  const audience = getAudience(players, narratorId, hubPlayerName);
  const readyCount = audience.filter((player) => player.ready).length;
  const lobbyLikeStatus = PRE_STORY_PHASES.includes(room.status);
  const compactLobbyLayout = lobbyLikeStatus && viewport.width >= 1100;
  const allVotes = Object.values(narratorVotes);
  const yesVotes = allVotes.filter((vote) => vote.value === "yes").length;
  const noVotes = allVotes.filter((vote) => vote.value === "no").length;
  const revealWords = audience.map((player) => player.secret_word).filter(Boolean);
  const roundLang = detectRoundLanguage(room, players, lang);
  const tvJoinUrl = `${appUrl}?room=${room.id}&lang=${roundLang}`;
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
              {room.story ? (
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
              ) : (
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

          {!compactLobbyLayout && (
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>Spieler</div>
              <div style={{ display: "grid", gridTemplateColumns: tvLarge && audience.length > 6 ? "1fr 1fr" : "1fr", gap: 8 }}>
                {audience.map((player) => (
                  <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tvBody.color }}>{player.name}</span>
                    <span style={{ fontSize: 11, color: player.ready ? acc.greenl : tvMuted.color }}>
                      {player.ready ? "bereit" : "wartet"}
                    </span>
                  </div>
                ))}
              </div>
              {audience.length === 0 && <div style={{ fontSize: 13, color: tvMuted.color, lineHeight: 1.5 }}>{ui.hostLobby.empty}</div>}
            </div>
          )}

          {SCORE_PHASES.includes(room.status) && (
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.player.narratorVoteTitle}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(12,48,24,.92)", border: "1px solid rgba(74,222,128,.36)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.greenl, marginBottom: 6 }}>Ja</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: acc.greenl }}>{yesVotes}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: "rgba(28,32,42,.96)", border: "1px solid rgba(255,255,255,.12)" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: tvMuted.color, marginBottom: 6 }}>Nein</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: tvBody.color }}>{noVotes}</div>
                </div>
              </div>
              {room.status === GAME_PHASES.VOTED && narratorAwarded !== null && (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: narratorAwarded ? acc.greenl : acc.gold }}>
                  {narratorAwarded ? ui.player.narratorVoteApproved : ui.player.narratorVoteRejected}
                </div>
              )}
            </div>
          )}

          {SCORE_PHASES.includes(room.status) && (
            <div style={{ ...S.card, ...tvCard, marginBottom: 0, padding: tvPad }}>
              <div style={{ ...tvLabel, marginBottom: 8 }}>{ui.hostTabs.scores}</div>
              <div style={{ display: "grid", gap: 8 }}>
                {[...getVisiblePlayers(players, hubPlayerName)].sort((a, b) => (b.score || 0) - (a.score || 0)).map((player) => (
                  <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tvBody.color }}>{player.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 900, color: acc.gold }}>{player.score || 0}</span>
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
                      <span style={{ fontSize: 11, color: player.ready ? acc.greenl : tvMuted.color }}>
                        {player.ready ? "bereit" : "wartet"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: tvMuted.color, lineHeight: 1.5 }}>{ui.hostLobby.empty}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
