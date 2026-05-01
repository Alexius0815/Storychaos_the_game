import { useEffect, useState } from "react";

export function QRCode({ url, size = 180, C, lang }) {
  const enc = encodeURIComponent(url);
  const bg = C.sur.replace("#", "");
  const fg = C.txt.replace("#", "");
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${enc}&bgcolor=${bg}&color=${fg}&qzone=2`}
      alt={lang === "de" ? `QR-Code für ${url}` : `QR code for ${url}`}
      width={size}
      height={size}
      style={{ borderRadius: 8, display: "block" }}
    />
  );
}

export function OfflineBanner({ C, ui, acc }) {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;
  const isLight = C.mode === "light";

  return (
    <div style={{ background: isLight ? "rgba(248,113,113,.10)" : "rgba(248,113,113,.15)", border: `1.5px solid ${acc.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <span>📡</span>
      <span style={{ fontSize: 13, color: isLight ? "#991b1b" : acc.redl, fontWeight: 700 }}>{ui.offline}</span>
    </div>
  );
}

export function HelpPopover({ title, children, ui, C, S, acc, align = "right" }) {
  const [open, setOpen] = useState(false);
  const isLight = C.mode === "light";

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((current) => !current)}
        aria-label={ui.common.help}
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          border: isLight ? "1.5px solid rgba(180,83,9,.34)" : "1px solid rgba(251,191,36,.36)",
          background: isLight ? "rgba(251,191,36,.18)" : "rgba(251,191,36,.12)",
          color: acc.gold,
          fontSize: 16,
          fontWeight: 900,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isLight ? "0 1px 0 rgba(255,255,255,.7) inset, 0 0 0 1px rgba(180,83,9,.06) inset" : "0 0 0 1px rgba(251,191,36,.12) inset",
        }}
      >
        ?
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 10px)", [align]: 0, zIndex: 40, width: "min(320px, calc(100vw - 48px))" }}>
          <div style={{ ...S.card, marginBottom: 0, padding: 14, background: isLight ? "rgba(255,255,255,.99)" : "rgba(22,22,31,.96)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: isLight ? "0 18px 40px rgba(15,23,42,.12)" : "0 18px 40px rgba(0,0,0,.2)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase", color: acc.gold }}>{title}</div>
              <button onClick={() => setOpen(false)} style={S.sbtn(C.muted)}>{ui.common.close}</button>
            </div>
            <div style={{ display: "grid", gap: 8, fontSize: 13, color: C.txt, lineHeight: 1.6 }}>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExitIconButton({ onClick, label, C, S }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        ...S.sbtn(C.muted),
        width: 34,
        height: 34,
        minWidth: 34,
        padding: 0,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 16,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      ⎋
    </button>
  );
}

export function RemovePlayerIconButton({ onClick, label, busy, C, S, acc }) {
  const isLight = C.mode === "light";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={busy ? `${label}…` : label}
      aria-label={busy ? `${label}…` : label}
      style={{
        ...S.sbtn(acc.red),
        width: 30,
        height: 30,
        minWidth: 30,
        padding: 0,
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1,
        background: busy ? "rgba(248,113,113,.14)" : isLight ? "rgba(248,113,113,.10)" : "rgba(248,113,113,.06)",
        borderColor: isLight ? "rgba(248,113,113,.30)" : "rgba(248,113,113,.22)",
        opacity: busy ? 0.7 : 0.9,
        cursor: busy ? "wait" : "pointer",
      }}
    >
      {busy ? "…" : "✕"}
    </button>
  );
}

export function EntryHero({ C, S, title, desc, accent, appIcon }) {
  const isLight = C.mode === "light";
  return (
    <div style={{ ...S.card, textAlign: "left", padding: "22px 18px 18px", background: `linear-gradient(180deg, ${isLight ? `${accent}24` : `${accent}18`}, ${C.sur})`, borderColor: isLight ? `${accent}55` : `${accent}44` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 64, height: 64, display: "grid", placeItems: "center", filter: "drop-shadow(0 10px 24px rgba(0,0,0,.22))" }}>
          <img src={appIcon} alt="Story Chaos icon" width="60" height="60" style={{ display: "block", objectFit: "contain" }} />
        </div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.txt, marginBottom: 8, letterSpacing: "-0.04em" }}>{title}</div>
      <p style={{ ...S.bt, fontSize: 14.5, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

export function EntryNoteCard({ label, title, text, C }) {
  const isLight = C.mode === "light";
  return (
    <div style={{ borderRadius: 14, padding: 14, border: `${isLight ? 1.5 : 1}px solid ${C.bdr}`, background: C.sur2, minWidth: 0 }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.9, textTransform: "uppercase", color: C.muted, marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color: C.txt, letterSpacing: "-0.03em", marginBottom: 5 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

export function HelpScreen({ ui, C, S, acc, appIcon }) {
  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <EntryHero C={C} S={S} title={ui.helpScreen.title} desc={ui.helpScreen.desc} accent={acc.gold} appIcon={appIcon} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {ui.helpScreen.cards.map((card) => (
          <EntryNoteCard key={card.title} label={card.label} title={card.title} text={card.text} C={C} />
        ))}
      </div>
    </div>
  );
}
