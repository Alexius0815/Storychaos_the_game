# Story Chaos

<p align="center">
  <img src="public/icon-192.png" alt="Story Chaos app icon" width="140" />
</p>

> The real-time party game where nobody stays unnoticed.

**Story Chaos** is a browser-based multiplayer party game for 2 to 8 players. One person reads an AI-generated story aloud while the others hold secret words and secret actions on their phones. As soon as a player's word appears, they have to react without making it too obvious.

## Live Demo

[storychaos-the-game.vercel.app](https://storychaos-the-game.vercel.app)

On iPhone, the game can also be used like an app:
`Safari -> Share -> Add to Home Screen`

## Visual Preview

![Story Chaos gameplay preview](public/readme-preview.svg)

## At A Glance

- 2 to 8 players
- around 15 to 30 minutes per round
- real-time multiplayer via QR code
- phone-friendly, no installation required
- AI-generated stories every round

## How It Works

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

## Feature Highlights

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

After that, the app runs locally in the browser through Vite.

## Backend / Realtime

The game uses Supabase for rooms, player management, real-time updates during a round, and state transitions between lobby, story, reveal, and scoreboard.

## Project Status

The project is playable and optimized for quick, mobile-first rounds with friends.

## Next Ideas

- more word packs and themed sets
- additional story genres
- finer balancing options for actions
- better per-round evaluation
- further PWA improvements

## Demo Focus

When presenting the project, the strongest moments to show are QR joining, the secret-card reveal, and the story/reveal flow.

## License

There is currently no license file in the repository.
