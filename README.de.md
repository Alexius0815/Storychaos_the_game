# Story Chaos

<p align="center">
  <img src="public/icon-192.png" alt="Story Chaos App-Icon" width="140" />
</p>

> Das browserbasierte Partyspiel fuer geheime Worte, schlechte Pokerfaces und gemeinsame Aufloesungen.

**Story Chaos** ist ein Multiplayer-Partyspiel fuer 2 bis 8 Spieler. Eine Person fuehrt durch die Runde, die anderen haben geheime Worte und geheime Aktionen auf ihren eigenen Geraeten. Reagiert wird waehrend der Geschichte, aufgeloest und gepunktet wird danach in klar getrennten Schritten.

## Live Demo

[storychaos-the-game.vercel.app](https://storychaos-the-game.vercel.app)

Auf dem iPhone laesst sich das Spiel auch wie eine App nutzen:
`Safari -> Teilen -> Zum Home-Bildschirm`

## Kurzueberblick

- 2 bis 8 Spieler
- browserbasiert, ohne Installation spielbar
- mobile-first fuer iPhone, iPad, Browser und optional TV / Beamer
- geheimer Karten-Flow auf dem eigenen Geraet
- Freestyle als primaerer Story-Modus
- zusaetzliche lokale Geschichte als optionale Alternative
- deutscher und englischer Spielmodus

## Aktueller Spielablauf

1. Der Host erstellt einen Raum.
2. Mitspieler treten per QR-Code oder Raumcode bei.
3. Der Host bereitet die Runde vor:
   Schwierigkeit, Wort-Kategorien und Rundensprache.
4. Jeder Mitspieler bekommt ein geheimes Wort und eine geheime Aktion.
5. Alle bestaetigen den Schritt auf dem eigenen Geraet.
6. Der Host startet `Freestyle` oder optional eine vorbereitete Geschichte.
7. Waehrend des Vorlesens bzw. Erzaehlens reagieren die Mitspieler auf ihr Wort.
8. Danach folgt die Aufloesung.
9. Der Erzaehler vergibt Punkte an Mitspieler.
10. Die Mitspieler stimmen darueber ab, ob der Erzaehler einen Punkt bekommt.
11. Der Erzaehler bestimmt den naechsten Erzaehler.

## Feature-Stand

- QR-Code Join und Raumcode Join
- optionales Raumpasswort
- `Party Screen` als optionaler externer gemeinsamer Bildschirm
- getrennte `UI-Sprache` und `Rundensprache`
- Light und Dark Mode
- ein Neuziehen pro Spieler
- Erzaehler kann Mitspieler aus dem Raum entfernen
- Raumuebernahme, wenn kein aktiver Erzaehler mehr da ist
- Aufloesung, Voting, Punktevergabe und Erzaehlerwechsel in getrennten Fokus-Views
- lokaler Story-Generator als stabile Standardbasis
- optionale KI-Neuversuche zusaetzlich zur lokalen Generierung
- Freestyle mit echten Werten plus Ablenkungswoertern
- Debug-Panel fuer Status-, Raum- und API-Pruefung

## Freestyle

Freestyle ist der aktuelle Hauptmodus.

Der Erzaehler bekommt keine fertige Loesungsliste, sondern einen gemischten Begriffspool:

- echte gezogene Begriffe
- passende Ablenkungswoerter aus aehnlichen Kategorien

Dadurch kann frei erzaehlt werden, ohne sofort zu wissen, welche Begriffe wirklich relevant sind.

## Party Screen

Der `Party Screen` ist **optional**.

Wichtig:

- Ein Spiel startet immer ueber `Neues Spiel starten`
- der Party Screen wird erst im laufenden Raum verbunden
- er ist read-only und zeigt nur gemeinsame Informationen
- geheime Karten bleiben privat auf den Geraeten der Mitspieler

## Sprachen

Story Chaos trennt zwei Ebenen:

- `UI-Sprache`
- `Rundensprache`

Das bedeutet:

- ein Spieler kann das Interface auf Deutsch sehen
- waehrend die laufende Runde auf Englisch gespielt wird

Mehr dazu: [docs/bilingual.md](docs/bilingual.md)

## Tech Stack

- `React 18`
- `Vite`
- `Supabase`
- lokaler Story-Generator
- optionale KI-Fallbacks / KI-Neuversuche
- `Vercel`

## Code-Stand

Der aktuelle Stand ist nicht mehr der urspruengliche Ein-Datei-Prototyp.

Bereits ausgelagert sind u. a.:

- `content/`
- `i18n/`
- `lib/supabase.js`
- `constants/phases.js`
- `game/`
- grosse Host-/Player-/TV-Komponenten

Die App wird aber weiterhin aktiv weiter aufgeraeumt und verfeinert.

## Lokal starten

```bash
npm install
npm run dev
```

## Aktuelle offene Themen

- weiterer Feinschliff fuer Storyqualitaet
- weitere Aufraeumarbeiten in der Orchestrierungslogik
- weiteres Code-Splitting fuer kleinere Bundles
- letzte Light-Mode-QA ueber alle Screens

## Lizenz

Aktuell liegt keine Lizenzdatei im Repository.

