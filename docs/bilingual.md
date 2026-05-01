# Bilingual Mode

## Overview

Story Chaos supports bilingual play in German and English.

The game separates two different language layers:

- `UI language`
- `Round language`

## What These Mean

`UI language`

- buttons
- labels
- helper text
- status messages
- screen copy on the current device

`Round language`

- secret words
- secret actions
- category labels
- genre labels
- local story generation
- optional AI retry prompts
- Freestyle prompt pool language

## Current Behavior

- The `UI language` can be switched locally on each device.
- Before cards are dealt, the round follows the active top-level `DE / EN` setting.
- After cards are dealt, the round language stays stable for that round.
- Join and Party Screen links carry the current round language.
- Rerolls stay within the current round language.
- Freestyle prompt pools are built in the active round language.
- Local stories and optional AI retries also use the active round language.

## Why The Split Exists

This lets mixed-language groups play together more comfortably.

Examples:

- One player can keep the interface in German while the round itself runs in English.
- A host can prepare an English round while another player still prefers German UI labels.
- The optional Party Screen can show the shared round in the correct round language without forcing every personal device into the same UI language.

## Current Scope

The bilingual support currently covers:

- home screen
- create / join flow
- host lobby
- round setup
- ready flow
- story / freestyle flow
- reveal flow
- scoring and narrator vote
- next narrator flow
- player view
- Party Screen
- debug panel
- German and English content pools
- German and English story-generation prompts

## Implementation Status

The bilingual setup is no longer embedded as one giant block inside `src/App.jsx`.

It is already split into dedicated modules:

- `src/content/`
- `src/i18n/`
- `src/constants/`
- `src/game/`

That means the product now has a cleaner distinction between:

- visible UI copy
- gameplay content
- round-state logic

## Remaining Long-Term Improvement

The current app logic keeps round language stable well enough for live play.

The cleanest future step would still be:

- persisting `game_language` or `round_language` directly on the room in the database

That would make the language state even more explicit across reconnects, older links, and future backend features.

