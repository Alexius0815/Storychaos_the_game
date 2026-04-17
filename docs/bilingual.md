# Bilingual Mode

## Overview

Story Chaos now supports bilingual play in German and English.

The project distinguishes between two different language concepts:

- `UI language`: the language of buttons, labels, helper text, and interface messages on a device
- `Game language`: the language used for secret words, secret actions, category labels, genre labels, and AI-generated stories

## Behavior

- The UI language can be toggled locally per device.
- The host selects the game language when dealing cards.
- Join links carry the active game language so the room context stays consistent.
- Rerolls try to stay in the same game language as the original card set.
- The AI story prompt is generated in the selected game language.

## Why This Split Exists

This separation allows mixed-language groups to play together more comfortably.

Examples:
- A German-speaking player can keep the interface in German while joining an English round.
- A host can run a German round while another player prefers the English UI.

## Current Scope

The bilingual update currently covers:

- home screen
- create/join flow
- host controls
- player card flow
- timer, reveal, scoreboard, and round overview
- debug panel
- German and English game content pools
- German and English AI prompts

## Future Cleanup

Right now the language dictionaries live inside `src/App.jsx` for speed and simplicity.

If the project grows further, a good follow-up would be:

- move UI strings into dedicated translation files
- move game content into separate data modules
- add automated checks for missing translation keys
