# Story Chaos

<p align="center">
  <img src="public/icon-192.png" alt="Story Chaos app icon" width="140" />
</p>

> The browser party game for secret words, bad poker faces, and dramatic reveals.

**Story Chaos** is a multiplayer party game for 2 to 8 players. One player guides the round, everyone else gets secret words and secret actions on their own device. Reactions happen during the story, while reveal and scoring happen afterwards in clearly separated steps.

## Live Demo

[storychaos-the-game.vercel.app](https://storychaos-the-game.vercel.app)

On iPhone, the game can also be used like an app:
`Safari -> Share -> Add to Home Screen`

## At a Glance

- 2 to 8 players
- browser-based, no installation required
- mobile-first for iPhone, iPad, browser, and optional TV / projector use
- secret private card flow on each player's device
- Freestyle as the primary story mode
- optional local ready-made story mode
- German and English round support

## Current Round Flow

1. The host creates a room.
2. Players join by QR code or room code.
3. The host prepares the round:
   difficulty, word categories, and round language.
4. Each player receives a secret word and a secret action.
5. Everyone confirms the step on their own device.
6. The host starts `Freestyle` or optionally a prepared story.
7. While the story is read or narrated, players react to their word.
8. Then the reveal phase begins.
9. The narrator awards points to players.
10. The players vote on whether the narrator earns a point.
11. The narrator chooses the next narrator.

## Current Feature Set

- QR-code and room-code joining
- optional room password
- optional external `Party Screen` for shared display
- separate `UI language` and `round language`
- light and dark mode
- one reroll per player
- narrator can remove players from the room
- room takeover if the active narrator disappears
- reveal, voting, scoring, and narrator choice live in separate focus views
- local story generator as the stable default base
- optional AI retries on top of local generation
- Freestyle with real prompts plus decoy prompts
- debug panel for room, status, and API inspection

## Freestyle

Freestyle is the primary mode right now.

The narrator does not get a clean solution list. Instead, they see a mixed prompt pool:

- real assigned words
- matching decoy words from similar categories

This makes live narration possible without instantly knowing which prompts are actually in play.

## Party Screen

The `Party Screen` is **optional**.

Important:

- a game always starts through `Start new game`
- the Party Screen is connected only after the room already exists
- it is read-only and shows shared information only
- secret player cards stay private on player devices

## Languages

Story Chaos separates two layers:

- `UI language`
- `round language`

That means:

- one player can keep the interface in German
- while the round itself runs in English

More details: [docs/bilingual.md](docs/bilingual.md)

## Tech Stack

- `React 18`
- `Vite`
- `Supabase`
- local story generator
- optional AI fallbacks / AI retries
- `Vercel`

## Code Status

The current project is no longer the original single-file prototype.

Already extracted:

- `content/`
- `i18n/`
- `lib/supabase.js`
- `constants/phases.js`
- `game/`
- major host / player / tv components

The app is still actively being cleaned up and refined.

## Run Locally

```bash
npm install
npm run dev
```

## Current Open Areas

- more story-quality tuning
- further orchestration cleanup
- more code-splitting for smaller bundles
- final light-mode QA across all key views

## License

There is currently no license file in the repository.

