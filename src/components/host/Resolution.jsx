import { getAudience, getNarratorId } from "../../game/rooms";
import { HelpPopover } from "../common/SupportUI";
import useViewport from "../../hooks/useViewport";

export default function Resolution({ room, players, storyWords, ui, C, S, acc, appIcon, hubPlayerName, parseFreestyleWords, onOpenScores }) {
  const viewport = useViewport();
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const others = getAudience(players, narratorId, hubPlayerName);
  const words = storyWords || [];
  const compactCardHeight = viewport.isDesktop ? "min(58vh, 560px)" : "auto";
  const freestyleWords = parseFreestyleWords(room.story);
  const freestyleMode = freestyleWords.length > 0;

  function renderStory(text, highlightWords) {
    const clean = (text || "").replace(/\*\*(.*?)\*\*/g, "$1");
    if (!highlightWords?.length) return clean;
    const escaped = highlightWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
    return clean.split(pattern).map((part, index) => (
      highlightWords.some((word) => word.toLowerCase() === part.toLowerCase())
        ? <strong key={index} style={{ color: acc.gold, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{part}</strong>
        : part
    ));
  }

  return (
    <div>
      <div style={{ ...S.card, padding: viewport.isDesktop ? 16 : 18, background: "linear-gradient(135deg, rgba(248,113,113,.12), rgba(251,191,36,.08))", borderColor: "rgba(248,113,113,.26)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={appIcon} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.resolution.title}</div>
            </div>
          </div>
          <HelpPopover title={ui.resolution.title} ui={ui} C={C} S={S} acc={acc}>
            <div>{ui.resolution.desc}</div>
            <div>{ui.resolution.revealStoryDesc}</div>
          </HelpPopover>
          <button onClick={onOpenScores} style={{ ...S.pbtn(acc.gold, "rgba(251,191,36,.08)"), width: viewport.isDesktop ? 220 : "100%" }}>
            {ui.resolution.continueToPoints}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "minmax(0, 1.12fr) minmax(340px, 0.88fr)" : "1fr", gap: 14, alignItems: "start" }}>
        <div>
          <div style={{ ...S.card, borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.05)", minHeight: compactCardHeight }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.red, marginBottom: 10 }}>{ui.resolution.revealStoryTitle}</div>
            <p style={{ ...S.bt, marginBottom: 14 }}>{freestyleMode ? ui.resolution.freestyleDesc : ui.resolution.revealStoryDesc}</p>
            {freestyleMode ? (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.blue, marginBottom: 10 }}>{ui.resolution.freestylePoolTitle}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {freestyleWords.map((word) => (
                    <span key={word} style={{ fontSize: 13, fontWeight: 700, color: C.txt, background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.26)", padding: "7px 12px", borderRadius: 999 }}>
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: viewport.isDesktop ? 16 : 15, lineHeight: viewport.isDesktop ? 1.8 : 1.95, color: C.txt, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: viewport.isDesktop ? 13 : "unset", WebkitBoxOrient: "vertical" }}>
                {renderStory(room.story || "", words)}
              </div>
            )}
            {words.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 14, marginTop: 14, borderTop: `1px solid ${C.bdr}` }}>
                {words.map((word) => (
                  <span key={word} style={{ fontSize: 12, fontWeight: 700, color: acc.gold, background: "rgba(251,191,36,.1)", padding: "4px 12px", borderRadius: 999, border: "1px solid rgba(251,191,36,.3)" }}>
                    {word}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto" }}>
          <div style={{ ...S.card, marginTop: viewport.isDesktop ? 0 : 12, minHeight: compactCardHeight }}>
            <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr", gap: 10 }}>
              {others.map((player) => (
                <div key={player.id} style={{ background: C.sur2, borderRadius: 14, padding: 12, border: `1px solid ${player.ready ? "rgba(74,222,128,.25)" : C.bdr}` }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.txt, marginBottom: 8 }}>{player.name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: C.sur, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: acc.blue, marginBottom: 6 }}>{ui.resolution.word}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: acc.bluel }}>{player.secret_word || "–"}</div>
                    </div>
                    <div style={{ background: C.sur, borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: acc.red, marginBottom: 6 }}>{ui.resolution.action}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: acc.redl }}>{player.secret_action || "–"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
