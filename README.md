# Story Chaos

<p align="center">
  <img src="public/icon-192.png" alt="Story Chaos app icon" width="140" />
</p>

Choose your language:

- [Deutsch](README.de.md)
- [English](README.en.md)

Quick links:

- [Live Demo](https://storychaos-the-game.vercel.app)
- [Bilingual Mode Docs](docs/bilingual.md)

## What It Is

Story Chaos is a browser-based multiplayer party game for phones, browsers, and optional shared screens.

One player narrates. Everyone else has secret words and secret actions on their own device. During the round, reactions stay private until the reveal and scoring phase.

## Current Product Shape

- `Freestyle` is the primary story mode
- an optional `local story` path is still available
- the `Party Screen` is optional and connected after the room already exists
- UI language and round language are handled separately
- the game is mobile-first and works without installation

## Repo Status

The current codebase has already been refactored beyond the original one-file prototype:

- `content/` and `i18n/` are split out
- Supabase access is centralized
- major host/player/tv views are extracted into components
- local story generation and Freestyle support are implemented

## Notes

- The game is actively evolving.
- The README language pages below contain the full current feature description.

