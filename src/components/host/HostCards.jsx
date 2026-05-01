import { useEffect, useState } from "react";
import { CONTENT } from "../../content";
import { GAME_PHASES } from "../../constants/phases";
import { shuffle } from "../../game/cards";
import { getAudience, getNarratorId } from "../../game/rooms";
import { sb } from "../../lib/supabase";
import { HelpPopover } from "../common/SupportUI";

export default function HostCards({ room, players, ui, lang, contentLang, setContentLang, C, S, acc, hubPlayerName, allWordsByLang, allActionsByLang, onCardsDealt, onCelebrate }) {
  const [diff, setDiff] = useState("mix");
  const [cats, setCats] = useState(Object.keys(CONTENT[contentLang].words));
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("setup");
  const narratorId = getNarratorId(room, players, hubPlayerName);
  const others = getAudience(players, narratorId, hubPlayerName);
  const content = CONTENT[contentLang];
  const allWords = allWordsByLang[contentLang];
  const allActions = allActionsByLang[contentLang];

  useEffect(() => {
    setCats(Object.keys(CONTENT[contentLang].words));
  }, [contentLang]);

  useEffect(() => {
    if (lang === "de" || lang === "en") setContentLang(lang);
  }, [lang, setContentLang]);

  function getActions(difficulty) {
    if (difficulty === "mix") return shuffle([...content.actions.easy, ...content.actions.medium, ...content.actions.chaos]);
    return shuffle(content.actions[difficulty] || allActions);
  }

  function getWords() {
    const pool = cats.length > 0 ? cats.flatMap((category) => content.words[category] || []) : allWords;
    return shuffle(pool);
  }

  async function deal() {
    setLoading(true);
    const ws = getWords().slice(0, others.length);
    const actions = getActions(diff).slice(0, others.length);
    for (let index = 0; index < others.length; index += 1) {
      await sb.from("players").update({ secret_word: ws[index], secret_action: actions[index], ready: false, rerolled: false }).eq("id", others[index].id);
    }
    await sb.from("rooms").update({ status: GAME_PHASES.CARDS, story_words: ws, difficulty: diff }).eq("id", room.id);
    onCardsDealt(ws);
    onCelebrate?.([100, 50, 100]);
    setLoading(false);
  }

  function toggleCat(category) {
    setCats((selected) => (selected.includes(category) ? selected.filter((value) => value !== category) : [...selected, category]));
  }

  return (
    <div>
      <div style={{ ...S.card, background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))", borderColor: "rgba(251,191,36,.26)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={S.st}>{ui.cards.title}</div>
          <HelpPopover title={ui.cards.explainTitle} ui={ui} C={C} S={S} acc={acc}>
            <div>{ui.cards.desc}</div>
            <div>{ui.cards.explainDesc}</div>
            <div>{ui.cards.gameLanguageHelp}</div>
            <div>{ui.cards.categoriesHelp}</div>
          </HelpPopover>
        </div>
        <button onClick={deal} disabled={loading || others.length === 0 || cats.length === 0} style={{ ...S.pbtn(acc.blue, "rgba(96,165,250,.1)"), marginBottom: 12 }}>
          {loading ? ui.cards.dealing : ui.cards.deal}
        </button>
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={() => setView("setup")} style={{ ...S.sbtn(view === "setup" ? acc.blue : C.muted), background: view === "setup" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.cards.setupView}</button>
          <button onClick={() => setView("players")} style={{ ...S.sbtn(view === "players" ? acc.blue : C.muted), background: view === "players" ? "rgba(96,165,250,.1)" : "transparent" }}>{ui.cards.playersView}</button>
        </div>
      </div>

      {view === "setup" ? (
        <>
          <div style={S.card}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.cards.difficulty}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(content.diffLabels).map(([key, label]) => (
                <button key={key} onClick={() => setDiff(key)} aria-pressed={diff === key} style={{ minHeight: 48, padding: "10px 8px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1.5px solid ${diff === key ? acc.gold : C.bdr}`, background: diff === key ? "linear-gradient(180deg, rgba(251,191,36,.16), rgba(251,191,36,.08))" : C.sur2, color: diff === key ? acc.gold : C.muted, cursor: "pointer" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.cards.categories}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(content.categoryLabels).map(([key, label]) => {
                const active = cats.includes(key);
                return (
                  <button key={key} onClick={() => toggleCat(key)} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1.5px solid ${active ? acc.blue : C.bdr}`, background: active ? "linear-gradient(180deg, rgba(96,165,250,.14), rgba(96,165,250,.08))" : C.sur2, color: active ? acc.bluel : C.muted, cursor: "pointer" }}>
                    {label}
                  </button>
                );
              })}
            </div>
            {cats.length === 0 && <p style={{ fontSize: 12, color: acc.redl, marginTop: 8 }}>{ui.cards.minCategory}</p>}
          </div>
        </>
      ) : (
        <div style={{ ...S.card, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.txt, marginBottom: 8 }}>{ui.cards.players(others.length)}</div>
          {others.length === 0 ? <p style={S.bt}>{ui.cards.noPlayers}</p> : others.map((player) => (
            <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.bdr}` }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: acc.green, flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: C.txt }}>{player.name}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
