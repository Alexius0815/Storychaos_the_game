# Story Chaos

<p align="center">
  <img src="public/icon-192.png" alt="Story Chaos app icon" width="140" />
</p>

> DE: Das Echtzeit-Partyspiel, bei dem niemand unauffaellig bleibt.
>
> EN: The real-time party game where nobody stays unnoticed.

**DE**  
Story Chaos ist ein browserbasiertes Multiplayer-Partyspiel fuer 2 bis 8 Spieler. Eine Person liest eine KI-generierte Geschichte vor, waehrend die anderen geheime Woerter und geheime Aktionen auf ihren Smartphones haben. Sobald das eigene Wort faellt, muss reagiert werden, ohne sich zu offensichtlich zu verraten.

**EN**  
Story Chaos is a browser-based multiplayer party game for 2 to 8 players. One person reads an AI-generated story aloud while the others hold secret words and secret actions on their phones. As soon as a player's word appears, they have to react without making it too obvious.

## Live Demo

[storychaos-the-game.vercel.app](https://storychaos-the-game.vercel.app)

**DE**  
Auf dem iPhone laesst sich das Spiel auch wie eine App nutzen: `Safari -> Teilen -> Zum Home-Bildschirm`

**EN**  
On iPhone, the game can also be used like an app: `Safari -> Share -> Add to Home Screen`

## Visual Preview

![Story Chaos gameplay preview](public/readme-preview.svg)

## At A Glance

**DE**
- 2 bis 8 Spieler
- ca. 15 bis 30 Minuten pro Runde
- Echtzeit-Multiplayer via QR-Code
- Handy-friendly, keine Installation notwendig
- KI-generierte Geschichten fuer jede Runde

**EN**
- 2 to 8 players
- around 15 to 30 minutes per round
- real-time multiplayer via QR code
- phone-friendly, no installation required
- AI-generated stories every round

## How It Works

**DE**
1. Der Host erstellt einen Raum und bekommt einen QR-Code.
2. Die Mitspieler scannen den Code und treten mit ihrem Handy bei.
3. Der Host waehlt Schwierigkeit, Spielsprache und Wortkategorien.
4. Jeder Spieler erhaelt ein geheimes Wort und eine geheime Aktion.
5. Alle markieren sich als bereit.
6. Der Host waehlt ein Genre, dann wird eine passende Geschichte erzeugt.
7. Die Geschichte wird vorgelesen.
8. Immer wenn das eigene Wort faellt, muss die geheime Aktion ausgefuehrt werden.
9. Danach raet der Erzaehler, wer welches Wort hatte.
10. Aufloesung, Punkte, naechste Runde.

**EN**
1. The host creates a room and gets a QR code.
2. The other players scan the code and join on their phones.
3. The host chooses difficulty, game language, and word categories.
4. Each player receives a secret word and a secret action.
5. Everyone marks themselves as ready.
6. The host picks a genre and generates a matching story.
7. The story is read aloud.
8. Whenever a player's word appears, they must perform their secret action.
9. After that, the narrator guesses who had which word.
10. Reveal, score points, next round.

## Why It Works

**DE**  
Story Chaos verbindet soziale Deduktion, Theater, Timing und kontrolliertes Fremdschaemen in einem einzigen Format. Es lebt davon, dass alle gleichzeitig versuchen, unauffaellig aufzufallen.

**EN**  
Story Chaos mixes social deduction, performance, timing, and delightful second-hand embarrassment into one format. The fun comes from everybody trying to stand out without getting caught.

## Feature Highlights

**DE**
- QR-Code Join fuer schnellen Einstieg
- Optionales Raum-Passwort
- Deutsche und englische UI
- Deutsche und englische Spielinhalte
- Mehr als 150 Woerter in mehreren Kategorien pro Sprache
- Schwierigkeitsstufen fuer Aktionen: `Leicht`, `Mittel`, `Chaos`, `Mix`
- Bereit-System vor Story-Start
- Einmaliges Neuziehen pro Spieler
- KI-Story-Generierung mit Fallback-Strategie
- Aufloesungsscreen mit allen Karten
- Punkte, Rangliste und Medaillen
- Rundenuebersicht mit bereits gewesenen Erzhaehlern
- Timer mit visuellen Signalen, Sound und Vibration
- Dark/Light Mode
- Offline-Hinweis
- Verstecktes Debug-Panel

**EN**
- QR code join for a frictionless setup
- Optional room password
- German and English UI
- German and English game content
- More than 150 words across multiple categories per language
- Action difficulty levels: `Easy`, `Medium`, `Chaos`, `Mix`
- Ready check before story start
- One reroll per player
- AI story generation with fallback strategy
- Reveal screen with all cards
- Scores, ranking, and medals
- Round overview with narrator rotation
- Timer with visual cues, sound, and vibration
- Dark/light mode
- Offline indicator
- Hidden debug panel

## Bilingual Mode

**DE**  
Seit der bilingualen Erweiterung unterscheidet Story Chaos zwischen zwei Ebenen:
- `UI-Sprache`: Welche Sprache das Interface auf einem Geraet zeigt
- `Spielsprache`: Welche Sprache fuer Woerter, Aktionen und KI-Geschichten verwendet wird

Das bedeutet: Ein Host kann ein englisches Spiel starten, waehrend einzelne Spieler ihr Interface weiterhin auf Deutsch sehen.

**EN**  
Since the bilingual update, Story Chaos separates two layers:
- `UI language`: the language shown in the interface on a device
- `Game language`: the language used for words, actions, and AI stories

That means a host can run an English game while individual players still keep their interface in German.

More details: [docs/bilingual.md](docs/bilingual.md)

## Tech Stack

- `React 18`
- `Vite`
- `Supabase` for database and real-time sync
- `Pollinations.ai` for story generation
- `OpenRouter` as an AI fallback
- `Vercel` for hosting

## Local Setup

```bash
npm install
npm run dev
```

**DE**  
Danach laeuft die App lokal ueber Vite im Browser.

**EN**  
After that, the app runs locally in the browser through Vite.

## Backend / Realtime

**DE**  
Das Spiel nutzt Supabase fuer Raeume, Spielerverwaltung, Realtime-Updates waehrend der Runde und Statuswechsel zwischen Lobby, Story, Aufloesung und Scoreboard.

**EN**  
The game uses Supabase for rooms, player management, real-time updates during a round, and state transitions between lobby, story, reveal, and scoreboard.

## Project Status

**DE**  
Das Projekt ist spielbar und auf schnelle, mobile-first Runden mit Freunden ausgelegt.

**EN**  
The project is playable and optimized for quick, mobile-first rounds with friends.

## Next Ideas

**DE**
- mehr Wortpakete und Themenwelten
- weitere Story-Genres
- feinere Balancing-Optionen fuer Aktionen
- bessere Auswertung pro Runde
- weiterer PWA-Ausbau

**EN**
- more word packs and themed sets
- additional story genres
- finer balancing options for actions
- better per-round evaluation
- further PWA improvements

## Demo Focus

**DE**  
Wenn du das Projekt praesentierst, lohnt es sich besonders, den QR-Join, die geheimen Karten und den Story-/Aufloesungsfluss zu zeigen.

**EN**  
When presenting the project, the strongest moments to show are QR joining, the secret-card reveal, and the story/reveal flow.

## License

**DE**  
Derzeit ist keine Lizenzdatei hinterlegt.

**EN**  
There is currently no license file in the repository.
