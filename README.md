# 🃏 Story Chaos

> Das Echtzeit-Partyspiel gegen den Erzähler

Ein Spieler liest eine KI-generierte Geschichte vor. Die anderen haben geheime Wörter und Aktionen auf ihrem Handy – sobald ihr Wort fällt, müssen sie reagieren. Der Erzähler beobachtet alle Reaktionen und rät: wer hatte welches Wort?

**2–8 Spieler · 15–30 Minuten · Echtzeit-Multiplayer via QR-Code**

---

## 🚀 Live

👉 **[storychaos-the-game.vercel.app](https://storychaos-the-game.vercel.app)**

Als iPhone App: Safari öffnen → Teilen → „Zum Home-Bildschirm"

---

## 🎮 Spielablauf

1. Host erstellt Raum (optional mit Passwort) → bekommt QR-Code
2. Mitspieler scannen QR mit dem Handy → Name eingeben
3. Host wählt Schwierigkeit und Wort-Kategorien → teilt Karten aus
4. Jeder sieht sein geheimes Wort und seine geheime Aktion auf dem eigenen Handy
5. Optional: 1x neu ziehen falls gewünscht
6. Alle tippen „Ich bin bereit" – erst dann kann der Host die Geschichte generieren
7. Host wählt Genre → KI schreibt eine Geschichte mit allen Wörtern eingebaut
8. Host liest vor – Mitspieler reagieren heimlich wenn ihr Wort fällt
9. Host rät: wer hatte welches Wort?
10. Aufdecken – Auflösung mit allen Karten sichtbar
11. Punkte vergeben → nächste Runde

---

## ✨ Features

- QR-Code Beitritt – Mitspieler scannen einfach den QR-Code
- Raum-Passwort – Optionaler Schutz vor ungebetenen Gästen
- 150+ Wörter in 8 Kategorien wählbar (Alltag, Essen, Natur, Tech…)
- Schwierigkeitsgrade für Aktionen: Leicht / Mittel / Chaos / Mix
- Bereit-System – Geschichte erst wenn alle Karten angeschaut haben
- 1x Neu ziehen pro Spieler
- KI-Geschichte mit 3 API-Fallbacks (Pollinations, OpenRouter)
- Auflösungsscreen – alle Karten nach dem Raten sichtbar
- Punktestand mit Rangliste und Medaillen
- Runden-Übersicht – wer war schon Erzähler
- Timer 1–3 Minuten mit Farbwechsel, Vibration und Ton
- Dark/Light Mode Toggle
- Offline-Erkennung mit Banner
- Debug-Panel (Logo 5x antippen)

---

## 🛠 Tech Stack

- Frontend: React 18 + Vite
- Backend/Realtime: Supabase (PostgreSQL + Websockets)
- KI: Pollinations.ai mit OpenRouter als Fallback (kostenlos)
- Hosting: Vercel

---

## 🗄 Datenbank Setup

supabase-setup.sql und supabase-update.sql im Supabase SQL-Editor ausführen.

---

## 🔧 Lokal

```bash
npm install
npm run dev
```

Made with 🃏 and ✨
