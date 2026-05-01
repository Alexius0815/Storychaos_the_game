import { useState } from "react";
import { CONTENT } from "../../content";
import { sb } from "../../lib/supabase";
import { GAME_PHASES } from "../../constants/phases";
import { analyzeStory, buildStoryAttemptLine, generateLocalStory, generateStory, repairStoryToRules, stripStoryMarkup } from "../../game/storyGeneration";
import { HelpPopover } from "../common/SupportUI";
import useViewport from "../../hooks/useViewport";

export default function HostStory({
  room,
  storyWords,
  ui,
  contentLang,
  C,
  S,
  acc,
  appIcon,
  appUrl,
  addLog,
  onOpenResolution,
  stageMode = false,
  onExitStage,
  isFreestyleStory,
  parseFreestyleWords,
  buildFreestyleStory,
  buildFreestylePromptWords,
}) {
  const viewport = useViewport();
  const [genre, setGenre] = useState(null);
  const [story, setStory] = useState(room.story || "");
  const [loading, setLoading] = useState(false);
  const [loadingMode, setLoadingMode] = useState("local");
  const [error, setError] = useState("");
  const [attemptStatus, setAttemptStatus] = useState("");
  const [storyMinChars, setStoryMinChars] = useState(350);
  const words = storyWords || [];
  const content = CONTENT[contentLang];
  const compactStageHeight = viewport.isDesktop ? "min(62vh, 620px)" : "auto";
  const storyDifficulty = room?.difficulty || "mix";
  const hasStoryStage = !!story && !loading;
  const freestyleMode = isFreestyleStory(story);
  const freestyleWords = parseFreestyleWords(story);
  const selectedGenreLabel = content.genres.find((entry) => entry.id === genre)?.label || "";

  async function buildStory(mode = "local") {
    if (words.length === 0) return;
    if (mode !== "freestyle" && !genre) return;
    setLoading(true);
    setLoadingMode(mode);
    setError("");
    if (mode === "local") setStory("");
    setAttemptStatus("");
    const selectedGenre = genre === "random"
      ? content.genres[Math.floor(Math.random() * (content.genres.length - 1))]
      : content.genres.find((entry) => entry.id === genre);
    const selection = selectedGenre?.label;
    const selectedGenreId = selectedGenre?.id || "alltag";
    const targetChars = Math.max(storyMinChars + 120, Math.round(storyMinChars * 1.25));
    let validStory = null;
    const pushAttemptLine = (line) => setAttemptStatus(line);

    if (mode === "local") {
      const text = await generateLocalStory({ contentLang, genreId: selectedGenreId, words, minChars: storyMinChars, difficulty: storyDifficulty }, pushAttemptLine);
      validStory = stripStoryMarkup(text);
    } else if (mode === "freestyle") {
      validStory = buildFreestyleStory(buildFreestylePromptWords(words, contentLang));
    } else {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const strictness = attempt === 0 ? "" : contentLang === "de"
          ? " Wichtig: Prüfe vor der Ausgabe selbst, dass jedes Zielwort mindestens zweimal vorkommt, möglichst in unterschiedlichen Sätzen, und dass die Geschichte lang genug ist."
          : " Important: before answering, verify that every target word appears at least twice, preferably in different sentences, and that the story is long enough.";
        const prompt = `${content.aiPrompt(selection, words, storyMinChars, targetChars)}${strictness}`;
        const text = await generateStory({ prompt, contentLang, words, minChars: storyMinChars, content: CONTENT, appUrl, addLog }, pushAttemptLine);
        if (!text) continue;
        pushAttemptLine(buildStoryAttemptLine(contentLang, "repair", "local-fallback"));
        const repaired = repairStoryToRules(text, words, storyMinChars, contentLang);
        const analysis = analyzeStory(repaired, words, storyMinChars);
        if (analysis.valid) {
          validStory = analysis.clean;
          break;
        }
      }
    }

    if (!validStory) {
      setError(ui.storyGen.aiError);
      setLoading(false);
      return;
    }
    setStory(validStory);
    await sb.from("rooms").update({ story: validStory, status: GAME_PHASES.PLAYING }).eq("id", room.id);
    setLoading(false);
  }

  return (
    <div>
      <div style={{ ...S.card, padding: stageMode ? (viewport.isDesktop ? 18 : 16) : (viewport.isDesktop ? 16 : 18), background: "linear-gradient(135deg, rgba(251,191,36,.12), rgba(96,165,250,.08))", borderColor: "rgba(251,191,36,.26)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: C.sur, border: `1px solid ${C.bdr}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(0,0,0,.12)" }}>
              <img src={appIcon} alt="Story Chaos" style={{ width: 30, height: 30, borderRadius: 8 }} />
            </div>
            <div>
              <div style={{ ...S.st, marginBottom: 0 }}>{ui.storyGen.title}</div>
              {stageMode && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{room?.id ? `${ui.common.room} ${room.id}` : ""}</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasStoryStage && <button onClick={() => setStory("")} style={S.sbtn(C.muted)}>{ui.storyGen.regenerate}</button>}
            {stageMode && onExitStage && <button onClick={onExitStage} style={S.sbtn(C.muted)}>{ui.common.back}</button>}
            <HelpPopover title={ui.storyGen.title} ui={ui} C={C} S={S} acc={acc}>
              <div>{ui.storyGen.desc}</div>
              {ui.storyGen.flowSteps.map((step, index) => <div key={step}>{index + 1}. {step}</div>)}
              <div>{ui.storyGen.hiddenHint}</div>
              <div>{ui.storyGen.freestyleHelp}</div>
            </HelpPopover>
          </div>
        </div>
      </div>

      {!hasStoryStage ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, alignItems: "start" }}>
          <div>
            <div style={{ ...S.card2, marginBottom: 14, padding: 14, display: "grid", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>{ui.storyGen.title}</div>
                  <div style={{ fontSize: 16, color: C.txt, fontWeight: 800, letterSpacing: "-0.02em" }}>{ui.storyGen.primaryMode}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button onClick={() => buildStory("freestyle")} disabled={loading || words.length === 0} style={{ ...S.sbtn(acc.blue), minHeight: 40, padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap", background: "rgba(96,165,250,.10)" }}>
                    {loading && loadingMode === "freestyle" ? ui.storyGen.generating : ui.storyGen.freestylePrimary}
                  </button>
                  <button onClick={() => buildStory("local")} disabled={!genre || loading || words.length === 0} style={{ ...S.sbtn(genre ? acc.gold : C.muted), minHeight: 40, padding: "8px 12px", fontSize: 12, whiteSpace: "nowrap", background: genre ? "rgba(251,191,36,.10)" : "transparent" }}>
                    {loading && loadingMode === "local" ? ui.storyGen.generating : ui.storyGen.generate}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: acc.blue, background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.24)", padding: "6px 10px", borderRadius: 999 }}>
                  {ui.storyGen.freestyleChip}
                </span>
                {genre && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: acc.gold, background: "rgba(251,191,36,.10)", border: "1px solid rgba(251,191,36,.24)", padding: "6px 10px", borderRadius: 999 }}>
                    {ui.storyGen.localThemeChip(selectedGenreLabel)}
                  </span>
                )}
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: C.sur, border: `1px solid ${C.bdr}`, padding: "6px 10px", borderRadius: 999 }}>
                  {ui.storyGen.storyLengthValue(storyMinChars)}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "minmax(0, 1.45fr) minmax(260px, .75fr)" : "1fr", gap: 14, alignItems: "start" }}>
              <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
                <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10, display: "block" }}>{ui.storyGen.theme}</legend>
                <div style={{ display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr 1fr" : "1fr 1fr", gap: 8 }}>
                  {content.genres.map((entry) => (
                    <button key={entry.id} onClick={() => setGenre(entry.id)} aria-pressed={genre === entry.id} style={{ background: genre === entry.id ? "rgba(251,191,36,.1)" : C.sur, border: `2px solid ${genre === entry.id ? acc.gold : C.bdr}`, borderRadius: 12, padding: viewport.isDesktop ? 12 : 10, cursor: "pointer", textAlign: "left", gridColumn: entry.id === "random" ? "span 2" : "span 1", transition: "all .15s", display: "block", minHeight: viewport.isDesktop ? 82 : 74 }}>
                      <div style={{ fontSize: 15, marginBottom: 3 }}>{entry.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: genre === entry.id ? acc.gold : C.txt }}>{entry.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{entry.desc}</div>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div style={{ ...S.card2, marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: acc.gold, marginBottom: 10 }}>{ui.storyGen.localOptionTitle}</div>
                <p style={{ ...S.bt, marginTop: 0, marginBottom: 12 }}>{ui.storyGen.localOptionDesc}</p>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.storyGen.storyLength}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 10 }}>{ui.storyGen.storyLengthValue(storyMinChars)}</div>
                <input type="range" min="350" max="900" step="50" value={storyMinChars} onChange={(event) => setStoryMinChars(Number(event.target.value))} style={{ width: "100%", accentColor: acc.gold, cursor: "pointer" }} />
                <p style={{ ...S.bt, marginTop: 10 }}>{ui.storyGen.storyLengthHelp}</p>
              </div>
            </div>

            {loading && (
              <div style={{ ...S.card2, marginTop: 12, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 28, display: "inline-block", animation: "spin 1.5s linear infinite" }}>✍️</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>
                  {loadingMode === "ai" ? ui.storyGen.writingAi : loadingMode === "freestyle" ? ui.storyGen.writingFreestyle : ui.storyGen.writing}
                </div>
                {attemptStatus && <div style={{ fontSize: 13, lineHeight: 1.45, color: C.txt, marginTop: 12 }}>{attemptStatus}</div>}
              </div>
            )}
            {error && <div style={{ ...S.card, borderColor: "rgba(248,113,113,.4)", background: "rgba(248,113,113,.06)", marginTop: 12 }}><p style={{ ...S.bt, color: acc.redl }}>{error}</p></div>}
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <div style={{ position: viewport.isDesktop ? "sticky" : "static", top: viewport.isDesktop ? 16 : "auto", minHeight: compactStageHeight }}>
            <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))", minHeight: viewport.isDesktop ? "100%" : "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.gold }}>
                  {freestyleMode ? ui.storyGen.freestyleNow : ui.storyGen.readNow}
                </span>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {freestyleMode && <button onClick={() => buildStory("freestyle")} style={S.sbtn(acc.blue)}>{ui.storyGen.regenerateFreestyle}</button>}
                  <button onClick={() => buildStory("local")} style={S.sbtn(C.muted)}>{ui.storyGen.regenerate}</button>
                  <button onClick={() => buildStory("ai")} style={S.sbtn(acc.blue)}>{ui.storyGen.regenerateAi}</button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateRows: "auto 1fr auto", gap: 14, minHeight: viewport.isDesktop ? compactStageHeight : "auto" }}>
                <p style={{ ...S.bt, marginBottom: 0, fontStyle: "italic" }}>{freestyleMode ? ui.storyGen.freestyleHint : ui.storyGen.hiddenHint}</p>
                {freestyleMode ? (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.blue, marginBottom: 10 }}>{ui.storyGen.freestyleWordPool}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignContent: "flex-start" }}>
                      {freestyleWords.map((word) => (
                        <span key={word} style={{ fontSize: 14, fontWeight: 700, color: C.txt, background: "rgba(96,165,250,.10)", border: "1px solid rgba(96,165,250,.26)", padding: "7px 12px", borderRadius: 999 }}>
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: viewport.isDesktop ? 16 : 16, lineHeight: viewport.isDesktop ? 1.85 : 1.95, color: C.txt, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: viewport.isDesktop ? 10 : "unset", WebkitBoxOrient: "vertical" }}>
                    {story.replace(/\*\*(.*?)\*\*/g, "$1")}
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${C.bdr}`, paddingTop: 14, display: "grid", gridTemplateColumns: viewport.isDesktop ? "1fr auto" : "1fr", gap: 12, alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: acc.red, marginBottom: 8 }}>{ui.storyGen.revealTitle}</div>
                    <p style={{ ...S.bt, margin: 0 }}>{freestyleMode ? ui.storyGen.freestyleRevealDesc : ui.storyGen.revealDesc}</p>
                  </div>
                  <button onClick={onOpenResolution} style={{ ...S.pbtn(acc.red, "rgba(248,113,113,.08)"), width: viewport.isDesktop ? 220 : "100%" }}>
                    {ui.storyGen.resolveCta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
