import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://iioipzphjxzoiofnukjs.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpb2lwenBoanh6b2lvZm51a2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzYzOTMsImV4cCI6MjA5MTc1MjM5M30.aIO5sXDUNNk01lTcqb79f4BowKXy4YH4Er0OrB8gx8U";
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const APP_URL = "https://storychaos-the-game.vercel.app";
const APP_ICON = "/icon-192.png";

const CONTENT = {
  de: {
    words: {
      alltag: ["Auto","Katze","Pizza","Schule","Chef","Kaffee","Polizei","Internet","Garten","Fußball","Zug","Krankenhaus","Party","Nachbar","Arzt","Supermarkt","Kühlschrank","Fahrrad","Briefkasten","Teppich","Fenster","Treppe","Aufzug","Klingel"],
      essen: ["Sushi","Burger","Nudeln","Kuchen","Brot","Käse","Bier","Wein","Smoothie","Pommes","Salat","Steak","Schokolade","Chips","Ananas","Erdbeere","Honig","Marmelade","Espresso","Wassermelone"],
      natur: ["Blitz","Schnee","Nebel","Sturm","Regenbogen","Vollmond","Baum","Rose","Pilz","Schmetterling","Adler","Wolf","Bär","Fuchs","Löwe","Pinguin","Kaktus","Vulkan","Lawine","Gletscher"],
      tech: ["Passwort","Selfie","Roboter","Drohne","KI","Podcast","Streaming","Update","Meme","Emoji","Algorithmus","Darkmode","WLAN","Akku","Hologramm","Smartwatch","VR-Brille","Satellit","Chip","Ladestation"],
      orte: ["Flughafen","Bahnhof","Museum","Bibliothek","Bunker","Tempel","Palast","Insel","Gefängnis","Leuchtturm","Marktplatz","Dachterrasse","Tiefgarage","Höhle","Wüste","Dschungel","Friedhof","Kaserne","Schloss","Turm"],
      gefühle: ["Panik","Eifersucht","Euphorie","Heimweh","Albtraum","Stille","Neugier","Schwindel","Gänsehaut","Langeweile","Sehnsucht","Trotz","Scham","Stolz","Ehrfurcht"],
      objekte: ["Koffer","Kompass","Tagebuch","Spiegel","Kerze","Brief","Maske","Uhr","Schere","Luftballon","Bumerang","Laterne","Zauberstab","Fernglas","Schnorchel","Lupe","Würfel","Teleskop","Schachtel","Schlüssel"],
      misc: ["Geist","Einhorn","Detektiv","Heldin","Schurke","Guru","Kapitän","Influencer","Therapeut","Rentner","Azubi","Praktikant","Zwilling","Legende","Fremder"],
    },
    actions: {
      easy: [
        "Zwinkere","Kratz dich an der Nase","Räuspere dich","Schau kurz auf den Boden",
        "Strecke dich","Richte deine Haare","Klopf einmal auf den Tisch","Verschränke die Arme",
        "Lehne dich zurück","Seufze leise","Beiß dir auf die Lippe","Reib dir die Hände",
        "Zucke mit den Schultern","Schnippe mit den Fingern","Schau auf deine Uhr",
        "Nicke einmal kurz","Lege einen Finger an die Lippen","Streich dir übers Kinn",
      ],
      medium: [
        "Lache plötzlich laut","Sag: Interessant...","Klatsche in die Hände","Sag: Ach wirklich?!",
        "Mach ein überraschtes Gesicht","Steh halb auf und setz dich wieder","Tipp jemanden an",
        "Mach ein Foto (oder so tun als ob)","Sag: Moment mal...","Sag: Na sowas!",
        "Klatsch dir auf die Stirn","Heb die Hand als wärst du in der Schule",
        "Schau dramatisch zur Seite","Rutsch auf dem Stuhl rum","Zeig auf jemand anderen",
        "Sag: Das kenn ich und nicke wissend","Summ leise vor dich hin","Schau zur Decke und nicke",
      ],
      chaos: [
        "Spring auf und ruf: HEUREKA!","Wiederhole laut das letzte Wort","Unterbrech mit: HMM!",
        "Tu so als hätte dich jemand getreten","Mach eine dramatische Pause und schau alle an",
        "Ruf: Bingo! und bereue es sofort","Sag deinen Namen rückwärts",
        "Klatsch beide Hände auf Wangen wie Kevin","Flüster Nachbar etwas Unverständliches",
        "Steh auf geh einen Schritt und setz dich wieder","Sing eine kurze Note",
        "Tu so als greifst du etwas aus der Luft","Sag: Ich sage nur... dann schweigen",
        "Fake-Niese dreimal hintereinander","Schreib etwas Imaginäres in die Luft",
        "Starre jemanden 4 Sekunden stumm an","Heb beide Daumen hoch und grinse",
      ],
    },
    genres: [
      { id: "alltag", label: "Alltag", emoji: "🏠", desc: "Supermarkt, Büro, Nachbarschaft" },
      { id: "urlaub", label: "Urlaub", emoji: "✈️", desc: "Strand, Hotel, Abenteuer" },
      { id: "party", label: "Party", emoji: "🎉", desc: "Feiern, Freunde, Chaos" },
      { id: "arbeit", label: "Arbeit", emoji: "💼", desc: "Meeting, Chef, Kantine" },
      { id: "natur", label: "Natur", emoji: "🌲", desc: "Wald, Tiere, Abenteuer" },
      { id: "zukunft", label: "Zukunft", emoji: "🚀", desc: "KI, Roboter, Raumfahrt" },
      { id: "krimi", label: "Krimi", emoji: "🔍", desc: "Detektiv, Verdacht, Spannung" },
      { id: "random", label: "Zufall", emoji: "🎲", desc: "Komplett überraschend" },
    ],
    diffLabels: { easy: "😇 Leicht", medium: "😏 Mittel", chaos: "😈 Chaos", mix: "🎲 Mix" },
    categoryLabels: { alltag: "🏠 Alltag", essen: "🍕 Essen", natur: "🌲 Natur", tech: "🤖 Tech", orte: "🏛 Orte", gefühle: "💫 Gefühle", objekte: "🎩 Objekte", misc: "👤 Personen" },
    aiSystem: "Kreativer Geschichtenerzähler auf Deutsch.",
    aiPrompt: (genre, words) => `Schreibe eine kurze witzige Geschichte auf Deutsch im Stil "${genre}". 8-12 Sätze. Diese Wörter ALLE einbauen: ${words.join(", ")}. Jedes dieser Wörter mit **Wort** markieren. NUR die Geschichte, kein Titel. Locker lustig zum Vorlesen.`,
  },
  en: {
    words: {
      alltag: ["Car","Cat","Pizza","School","Boss","Coffee","Police","Internet","Garden","Soccer","Train","Hospital","Party","Neighbor","Doctor","Supermarket","Fridge","Bicycle","Mailbox","Carpet","Window","Stairs","Elevator","Doorbell"],
      essen: ["Sushi","Burger","Noodles","Cake","Bread","Cheese","Beer","Wine","Smoothie","Fries","Salad","Steak","Chocolate","Chips","Pineapple","Strawberry","Honey","Jam","Espresso","Watermelon"],
      natur: ["Lightning","Snow","Fog","Storm","Rainbow","Full Moon","Tree","Rose","Mushroom","Butterfly","Eagle","Wolf","Bear","Fox","Lion","Penguin","Cactus","Volcano","Avalanche","Glacier"],
      tech: ["Password","Selfie","Robot","Drone","AI","Podcast","Streaming","Update","Meme","Emoji","Algorithm","Dark Mode","Wi-Fi","Battery","Hologram","Smartwatch","VR Headset","Satellite","Chip","Charging Station"],
      orte: ["Airport","Station","Museum","Library","Bunker","Temple","Palace","Island","Prison","Lighthouse","Market Square","Rooftop Terrace","Parking Garage","Cave","Desert","Jungle","Graveyard","Barracks","Castle","Tower"],
      gefühle: ["Panic","Jealousy","Euphoria","Homesickness","Nightmare","Silence","Curiosity","Dizziness","Goosebumps","Boredom","Longing","Defiance","Shame","Pride","Awe"],
      objekte: ["Suitcase","Compass","Diary","Mirror","Candle","Letter","Mask","Clock","Scissors","Balloon","Boomerang","Lantern","Magic Wand","Binoculars","Snorkel","Magnifying Glass","Dice","Telescope","Box","Key"],
      misc: ["Ghost","Unicorn","Detective","Heroine","Villain","Guru","Captain","Influencer","Therapist","Retiree","Apprentice","Intern","Twin","Legend","Stranger"],
    },
    actions: {
      easy: [
        "Wink","Scratch your nose","Clear your throat","Look briefly at the floor",
        "Stretch","Fix your hair","Tap the table once","Cross your arms",
        "Lean back","Sigh quietly","Bite your lip","Rub your hands",
        "Shrug your shoulders","Snap your fingers","Look at your watch",
        "Nod once","Put a finger to your lips","Stroke your chin",
      ],
      medium: [
        "Laugh out loud","Say: Interesting...","Clap your hands","Say: Oh really?!",
        "Make a surprised face","Half-stand up and sit back down","Tap someone",
        "Pretend to take a photo","Say: Hold on...","Say: No way!",
        "Slap your forehead","Raise your hand like you're in school",
        "Look dramatically to the side","Wiggle in your chair","Point at someone else",
        "Say: I know that and nod wisely","Hum quietly","Look at the ceiling and nod",
      ],
      chaos: [
        "Jump up and shout: EUREKA!","Repeat the last word out loud","Interrupt with: HMM!",
        "Pretend someone kicked you","Make a dramatic pause and stare at everyone",
        "Shout: Bingo! and regret it immediately","Say your name backwards",
        "Put both hands on your cheeks like Kevin","Whisper something unintelligible to your neighbor",
        "Stand up, take one step, and sit back down","Sing one short note",
        "Pretend to grab something from the air","Say: I will only say this... then fall silent",
        "Fake sneeze three times in a row","Write something imaginary in the air",
        "Stare at someone silently for 4 seconds","Give two thumbs up and grin",
      ],
    },
    genres: [
      { id: "alltag", label: "Everyday Life", emoji: "🏠", desc: "Supermarket, office, neighborhood" },
      { id: "urlaub", label: "Vacation", emoji: "✈️", desc: "Beach, hotel, adventure" },
      { id: "party", label: "Party", emoji: "🎉", desc: "Celebration, friends, chaos" },
      { id: "arbeit", label: "Work", emoji: "💼", desc: "Meeting, boss, cafeteria" },
      { id: "natur", label: "Nature", emoji: "🌲", desc: "Forest, animals, adventure" },
      { id: "zukunft", label: "Future", emoji: "🚀", desc: "AI, robots, space travel" },
      { id: "krimi", label: "Mystery", emoji: "🔍", desc: "Detective, suspicion, suspense" },
      { id: "random", label: "Random", emoji: "🎲", desc: "Completely unexpected" },
    ],
    diffLabels: { easy: "😇 Easy", medium: "😏 Medium", chaos: "😈 Chaos", mix: "🎲 Mix" },
    categoryLabels: { alltag: "🏠 Everyday", essen: "🍕 Food", natur: "🌲 Nature", tech: "🤖 Tech", orte: "🏛 Places", gefühle: "💫 Feelings", objekte: "🎩 Objects", misc: "👤 Characters" },
    aiSystem: "Creative storyteller in English.",
    aiPrompt: (genre, words) => `Write a short funny story in English in the style "${genre}". Use 8-12 sentences. Include ALL of these words: ${words.join(", ")}. Mark each of those words with **word**. Return ONLY the story, no title. Keep it light and fun to read aloud.`,
  },
};

const UI = {
  de: {
    subtitle: "Das Partyspiel gegen den Erzähler",
    aria: { toggleTheme: "Theme wechseln", toggleLanguage: "Sprache wechseln" },
    common: {
      room: "Raum",
      leave: "Verlassen",
      leaveRoom: "Raum verlassen",
      back: "← Zurück",
      loading: "Verbinde…",
      optional: "optional",
      close: "Schließen",
      refresh: "Erneut prüfen",
      none: "Keine",
      roomCode: "Raumcode",
      password: "Passwort",
      yourName: "Dein Name",
      host: "Host",
      status: "Status",
      story: "Story",
    },
    offline: "Keine Verbindung – bitte WLAN pruefen",
    home: {
      welcome: "Willkommen!",
      desc: "Erstelle einen Raum und lade per QR-Code ein – oder tritt einem bestehenden Raum bei.",
      newGame: "🎮 Neues Spiel starten",
      joinRoom: "🔗 Raum beitreten",
      howItWorks: "Wie es funktioniert",
      steps: [
        "Host erstellt Raum – optional mit Passwort",
        "Mitspieler scannen QR mit dem Handy",
        "Jeder bekommt sein Wort + Aktion aufs Handy",
        "Alle auf Ich bin bereit drücken",
        "Host liest KI-Geschichte vor",
        "Alle reagieren heimlich – Host rät wer was hatte",
      ],
    },
    join: {
      title: "Raum beitreten",
      desc: "Gib den Raumcode und deinen Namen ein",
      roomPlaceholder: "z.B. ABC12",
      namePlaceholder: "Dein Spitzname",
      passwordPlaceholder: "Raumpasswort",
      button: "Beitreten →",
      connecting: "Verbinde…",
      emptyError: "Bitte Code und Namen eingeben.",
      roomNotFound: "Raum nicht gefunden.",
      wrongPassword: "Falsches Passwort!",
      nameTaken: "Dieser Name ist schon vergeben.",
      genericError: "Fehler. Nochmal versuchen.",
    },
    create: {
      title: "Neues Spiel",
      desc: "Erstelle einen Raum und lade per QR-Code ein",
      hostName: "Dein Name (Host)",
      namePlaceholder: "Dein Spitzname",
      emptyPassword: "Leer = kein Passwort",
      button: "Raum erstellen →",
      creating: "Erstelle…",
      emptyError: "Bitte Namen eingeben.",
      genericError: "Fehler. Nochmal versuchen.",
    },
    hostLobby: {
      joinHint: "Mitspieler scannen den QR-Code oder geben den Code ein",
      joined: (n) => `👥 Beigetreten (${n})`,
      empty: "Noch niemand… QR-Code scannen!",
      waiting: "Warte auf Mitspieler…",
      start: (n) => `Spiel starten mit ${n} Spieler${n !== 1 ? "n" : ""} →`,
    },
    cards: {
      title: "🎴 Karten austeilen",
      desc: 'Jeder bekommt ein geheimes Wort und eine Aktion direkt aufs Handy. Danach muss jeder auf "Ich bin bereit" drücken bevor du die Geschichte generieren kannst.',
      gameLanguage: "Spielsprache",
      difficulty: "Aktions-Schwierigkeit",
      categories: "Wort-Kategorien",
      minCategory: "Mindestens eine Kategorie auswählen!",
      players: (n) => `Mitspieler (${n})`,
      noPlayers: "Noch keine Mitspieler beigetreten.",
      deal: "🃏 Karten austeilen",
      dealing: "Verteile…",
    },
    ready: {
      title: "⏳ Warte auf Bereitschaft",
      desc: 'Jeder Mitspieler muss seine Karte angeschaut und auf "Ich bin bereit" getippt haben.',
      status: "Status",
      readyCount: (a, b) => `${a} / ${b} bereit`,
      rerolled: "neu gezogen",
      allReady: "Alle sind bereit!",
      continue: "Geschichte generieren →",
    },
    storyGen: {
      title: "✨ KI-Geschichte",
      desc: "Wähle ein Thema. Die Geschichte enthält die Wörter aller Mitspieler. Du liest vor – beobachte die Reaktionen!",
      includedWords: "Einzubauende Wörter",
      theme: "Thema",
      generate: "Geschichte generieren",
      generating: "Wird geschrieben…",
      writing: "KI schreibt…",
      aiError: "KI gerade nicht erreichbar. Kurz warten und nochmal versuchen.",
      readNow: "Jetzt vorlesen!",
      regenerate: "Neu ↻",
      hiddenHint: "Wörter sind versteckt – beobachte wer wann reagiert!",
      revealTitle: "Auflösen – erst nach dem Raten!",
      revealWords: "Wörter aufdecken",
      resolveReady: "Auflösung bereit",
      resolveCta: "Zur Auflösung und Punktevergabe",
    },
    resolution: {
      title: "🎭 Auflösung",
      desc: "Wer hatte was? Hier die Karten aller Mitspieler auf einen Blick.",
      word: "🔵 Wort",
      action: "🔴 Aktion",
      pointsTitle: "Punkte vergeben",
      pointsDesc: "Du entscheidest als Erzähler, wer für diese Runde Punkte bekommt.",
      currentScore: "Punktestand",
      addPoint: "+1 Punkt",
      removePoint: "-1 Punkt",
      nextTitle: "Nächsten Erzähler wählen",
      nextDesc: "Bestimme jetzt, wer in der nächsten Runde die Hauptansicht bekommt.",
      nextAuto: "Der nächste Erzähler steht schon fest.",
      nextRound: "Nächste Runde starten",
      chooseFirst: "Wähle zuerst den nächsten Erzähler.",
    },
    scores: {
      title: "🏆 Punktestand",
      desc: "Gespeicherte Punkte aller Mitspieler.",
    },
    timer: {
      duration: "Dauer",
      minutes: "min",
      seconds: "Sekunden",
      minSec: "min:sek",
      done: "Zeit ist um!",
      guessPhase: "Ratephase starten",
      start: "START",
      pause: "PAUSE",
      reset: "RESET",
      aria: (n) => `${n} Sekunden`,
    },
    rounds: {
      title: "🔄 Runden-Übersicht",
      round: "Runde",
      currentNarrator: "Aktueller Erzähler",
      current: "dran",
      done: "war dran",
      waiting: "wartet",
      chooseNext: "Nächster",
      allNarrators: "🎉 Alle waren Erzähler!",
      gameFinished: "Spiel beendet – Endstand im Punkte-Tab",
    },
    hostTabs: { lobby: "Lobby", cards: "Karten", ready: "Bereit", story: "Story", timer: "Timer", resolve: "Lösung", scores: "Punkte", rounds: "Runden" },
    player: {
      inRoom: "Du bist in Raum",
      as: "als",
      waitingCards: "Warte auf Karten…",
      hostDealing: "Der Host teilt gleich die Karten aus!",
      secretCards: "Deine geheimen Karten",
      reroll: "1x neu ziehen",
      rerolled: "neu gezogen",
      secretWord: "Geheimwort",
      secretAction: "Geheime Aktion",
      tapReveal: "Tippen zum Aufdecken",
      readyButton: "✅ Ich bin bereit!",
      readyState: "✅ Bereit – warte auf die Geschichte!",
      revealBoth: 'Decke beide Karten auf um "Ich bin bereit" zu sehen',
      storyRunning: "Story läuft!",
      reactHint: "Reagiere wenn dein Wort fällt. Bleib unauffällig 😏",
      yourWord: "Dein Wort:",
    },
    debug: {
      title: "🛠 Debug Panel",
      supabase: "Supabase",
      connection: "Verbindung",
      checking: "Prüfe...",
      aiApis: "KI-APIs",
      testAll: "Alle testen",
      testing: "Teste…",
      notTested: "Noch nicht getestet",
      rooms: (n) => `Räume (${n})`,
      deleteOld: "Alte löschen",
      noRooms: "Keine Räume",
      logs: (n) => `Logs (${n})`,
      noLogs: "Keine Logs",
      ok: "OK",
      fail: "FEHLER",
      deletedRooms: "Alte Räume gelöscht",
      debugOpened: "Debug geöffnet",
    },
  },
  en: {
    subtitle: "The party game against the narrator",
    aria: { toggleTheme: "Toggle theme", toggleLanguage: "Toggle language" },
    common: {
      room: "Room",
      leave: "Leave",
      leaveRoom: "Leave room",
      back: "← Back",
      loading: "Connecting…",
      optional: "optional",
      close: "Close",
      refresh: "Check again",
      none: "None",
      roomCode: "Room code",
      password: "Password",
      yourName: "Your name",
      host: "Host",
      status: "Status",
      story: "Story",
    },
    offline: "No connection – please check your Wi-Fi",
    home: {
      welcome: "Welcome!",
      desc: "Create a room and invite players by QR code – or join an existing room.",
      newGame: "🎮 Start new game",
      joinRoom: "🔗 Join room",
      howItWorks: "How it works",
      steps: [
        "The host creates a room – optionally with a password",
        "Players scan the QR code with their phones",
        "Everyone gets a secret word + action on their phone",
        "Everyone taps I'm ready",
        "The host reads the AI story out loud",
        "Everyone reacts secretly – the host guesses who had what",
      ],
    },
    join: {
      title: "Join room",
      desc: "Enter the room code and your name",
      roomPlaceholder: "e.g. ABC12",
      namePlaceholder: "Your nickname",
      passwordPlaceholder: "Room password",
      button: "Join →",
      connecting: "Connecting…",
      emptyError: "Please enter a code and a name.",
      roomNotFound: "Room not found.",
      wrongPassword: "Wrong password!",
      nameTaken: "That name is already taken.",
      genericError: "Something went wrong. Please try again.",
    },
    create: {
      title: "New game",
      desc: "Create a room and invite players by QR code",
      hostName: "Your name (host)",
      namePlaceholder: "Your nickname",
      emptyPassword: "Leave blank = no password",
      button: "Create room →",
      creating: "Creating…",
      emptyError: "Please enter a name.",
      genericError: "Something went wrong. Please try again.",
    },
    hostLobby: {
      joinHint: "Players scan the QR code or enter the code manually",
      joined: (n) => `👥 Joined (${n})`,
      empty: "No one yet… scan the QR code!",
      waiting: "Waiting for players…",
      start: (n) => `Start game with ${n} player${n !== 1 ? "s" : ""} →`,
    },
    cards: {
      title: "🎴 Deal cards",
      desc: 'Each player gets a secret word and a secret action right on their phone. After that, everyone must tap "I\'m ready" before you can generate the story.',
      gameLanguage: "Game language",
      difficulty: "Action difficulty",
      categories: "Word categories",
      minCategory: "Select at least one category!",
      players: (n) => `Players (${n})`,
      noPlayers: "No players have joined yet.",
      deal: "🃏 Deal cards",
      dealing: "Dealing…",
    },
    ready: {
      title: "⏳ Waiting for readiness",
      desc: 'Every player needs to inspect their card and tap "I\'m ready".',
      status: "Status",
      readyCount: (a, b) => `${a} / ${b} ready`,
      rerolled: "rerolled",
      allReady: "Everyone is ready!",
      continue: "Generate story →",
    },
    storyGen: {
      title: "✨ AI story",
      desc: "Choose a theme. The story includes every player's word. Read it aloud and watch the reactions!",
      includedWords: "Words to include",
      theme: "Theme",
      generate: "Generate story",
      generating: "Writing…",
      writing: "AI is writing…",
      aiError: "The AI is unavailable right now. Wait a moment and try again.",
      readNow: "Read this aloud!",
      regenerate: "New ↻",
      hiddenHint: "The words are hidden – watch who reacts and when!",
      revealTitle: "Reveal – only after the guesses!",
      revealWords: "Reveal words",
      resolveReady: "Reveal ready",
      resolveCta: "Go to reveal and scoring",
    },
    resolution: {
      title: "🎭 Reveal",
      desc: "Who had what? Here are all player cards at a glance.",
      word: "🔵 Word",
      action: "🔴 Action",
      pointsTitle: "Award points",
      pointsDesc: "As the narrator, you decide who earns points this round.",
      currentScore: "Score",
      addPoint: "+1 point",
      removePoint: "-1 point",
      nextTitle: "Choose the next narrator",
      nextDesc: "Decide who gets the main narrator view for the next round.",
      nextAuto: "The next narrator is already decided.",
      nextRound: "Start next round",
      chooseFirst: "Choose the next narrator first.",
    },
    scores: {
      title: "🏆 Scoreboard",
      desc: "Saved points for all players.",
    },
    timer: {
      duration: "Duration",
      minutes: "min",
      seconds: "seconds",
      minSec: "min:sec",
      done: "Time's up!",
      guessPhase: "Start the guessing phase",
      start: "START",
      pause: "PAUSE",
      reset: "RESET",
      aria: (n) => `${n} seconds`,
    },
    rounds: {
      title: "🔄 Round overview",
      round: "Round",
      currentNarrator: "Current narrator",
      current: "active",
      done: "done",
      waiting: "waiting",
      chooseNext: "Next",
      allNarrators: "🎉 Everyone has been the narrator!",
      gameFinished: "Game finished – final scores are in the score tab",
    },
    hostTabs: { lobby: "Lobby", cards: "Cards", ready: "Ready", story: "Story", timer: "Timer", resolve: "Reveal", scores: "Scores", rounds: "Rounds" },
    player: {
      inRoom: "You are in room",
      as: "as",
      waitingCards: "Waiting for cards…",
      hostDealing: "The host is about to deal the cards!",
      secretCards: "Your secret cards",
      reroll: "reroll once",
      rerolled: "rerolled",
      secretWord: "Secret word",
      secretAction: "Secret action",
      tapReveal: "Tap to reveal",
      readyButton: "✅ I'm ready!",
      readyState: "✅ Ready – waiting for the story!",
      revealBoth: 'Reveal both cards to see "I\'m ready"',
      storyRunning: "Story in progress!",
      reactHint: "React when your word appears. Stay subtle 😏",
      yourWord: "Your word:",
    },
    debug: {
      title: "🛠 Debug Panel",
      supabase: "Supabase",
      connection: "Connection",
      checking: "Checking...",
      aiApis: "AI APIs",
      testAll: "Test all",
      testing: "Testing…",
      notTested: "Not tested yet",
      rooms: (n) => `Rooms (${n})`,
      deleteOld: "Delete old",
      noRooms: "No rooms",
      logs: (n) => `Logs (${n})`,
      noLogs: "No logs",
      ok: "OK",
      fail: "FAIL",
      deletedRooms: "Deleted old rooms",
      debugOpened: "Opened debug panel",
    },
  },
};

const FF = "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif";
const THEMES = {
  dark: { bg: "#0d0d14", sur: "#16161f", sur2: "#1e1e2a", bdr: "#2a2a3a", txt: "#f0f0f5", muted: "#9090a8" },
  light: { bg: "#f4f4f8", sur: "#ffffff", sur2: "#eeeef4", bdr: "#d0d0e0", txt: "#111118", muted: "#606078" },
};
const ACC = { blue: "#60a5fa", bluel: "#bfdbfe", red: "#f87171", redl: "#fecaca", gold: "#fbbf24", green: "#4ade80", greenl: "#bbf7d0" };

const ALL_WORDS_BY_LANG = Object.fromEntries(Object.entries(CONTENT).map(([lang, data]) => [lang, Object.values(data.words).flat()]));
const ALL_ACTIONS_BY_LANG = Object.fromEntries(Object.entries(CONTENT).map(([lang, data]) => [lang, [...data.actions.easy, ...data.actions.medium, ...data.actions.chaos]]));
const WORD_LOOKUPS = Object.fromEntries(Object.entries(ALL_WORDS_BY_LANG).map(([lang, words]) => [lang, new Set(words.map((word) => word.toLowerCase()))]));
const ACTION_LOOKUPS = Object.fromEntries(Object.entries(ALL_ACTIONS_BY_LANG).map(([lang, actions]) => [lang, new Set(actions.map((action) => action.toLowerCase()))]));

function normalizeLang(value) {
  return value === "en" ? "en" : "de";
}

function detectLanguageFromSample(word, action, fallback = "de") {
  const wordValue = word?.toLowerCase();
  const actionValue = action?.toLowerCase();
  if (wordValue && WORD_LOOKUPS.en.has(wordValue)) return "en";
  if (actionValue && ACTION_LOOKUPS.en.has(actionValue)) return "en";
  if (wordValue && WORD_LOOKUPS.de.has(wordValue)) return "de";
  if (actionValue && ACTION_LOOKUPS.de.has(actionValue)) return "de";
  return normalizeLang(fallback);
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("sc-theme") !== "light"; } catch { return true; }
  });
  function toggle() {
    setDark((current) => {
      try { localStorage.setItem("sc-theme", current ? "light" : "dark"); } catch {}
      return !current;
    });
  }
  return [dark ? THEMES.dark : THEMES.light, dark, toggle];
}

function useLanguage(initial) {
  const [lang, setLang] = useState(() => {
    const fromParam = initial && ["de", "en"].includes(initial) ? initial : null;
    if (fromParam) return fromParam;
    try {
      const stored = localStorage.getItem("sc-lang");
      if (stored === "de" || stored === "en") return stored;
    } catch {}
    return navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
  });

  useEffect(() => {
    try { localStorage.setItem("sc-lang", lang); } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}

function makeStyles(C) {
  return {
    card: { background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: C.bg === "#0d0d14" ? "0 12px 32px rgba(0,0,0,.18)" : "0 16px 40px rgba(15,23,42,.06)" },
    card2: { background: C.sur2, border: `1px solid ${C.bdr}`, borderRadius: 16, padding: 18, marginBottom: 14 },
    st: { fontSize: 16, fontWeight: 800, color: C.txt, display: "flex", alignItems: "center", gap: 8, marginBottom: 12, letterSpacing: "-0.02em" },
    bt: { fontSize: 14, lineHeight: 1.7, color: C.muted },
    input: { width: "100%", background: C.sur2, border: `1.5px solid ${C.bdr}`, color: C.txt, fontFamily: FF, fontSize: 16, padding: "14px 15px", borderRadius: 13, outline: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,.03)" },
    pbtn: (col, bg) => ({ width: "100%", minHeight: 56, padding: "15px 16px", borderRadius: 13, fontSize: 17, fontWeight: 800, lineHeight: 1.2, border: `1.5px solid ${col}`, background: bg, color: col, cursor: "pointer", transition: "all .15s", display: "block", boxShadow: `0 0 0 1px ${col}18 inset` }),
    sbtn: (col) => ({ fontSize: 13, fontWeight: 800, padding: "8px 12px", borderRadius: 10, border: `1px solid ${col}`, background: "transparent", color: col, cursor: "pointer" }),
  };
}

function shuffle(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function roomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

function timeAgo(ts) {
  const seconds = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

function getNarratorId(room, players = []) {
  return room?.narrator_id || players.find((player) => player.is_host)?.id || null;
}

function getAudience(players = [], narratorId) {
  return players.filter((player) => player.id !== narratorId);
}

const debugLog = [];
function addLog(level, msg, detail = "") {
  debugLog.unshift({ time: new Date().toLocaleTimeString(), level, msg, detail: String(detail).slice(0, 200) });
  if (debugLog.length > 50) debugLog.pop();
}

function QRCode({ url, size = 180, C, lang }) {
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

function OfflineBanner({ C, ui }) {
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
  return (
    <div style={{ background: "rgba(248,113,113,.15)", border: `1px solid ${ACC.red}`, borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
      <span>📡</span>
      <span style={{ fontSize: 13, color: ACC.redl, fontWeight: 600 }}>{ui.offline}</span>
    </div>
  );
}

function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
}

function playBeep(freq = 440, dur = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {}
}

async function generateStory(prompt, contentLang) {
  const requestOpenRouter = async (model) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "HTTP-Referer": APP_URL, "X-Title": "Story Chaos" },
      body: JSON.stringify({ model, max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
    });
    if (!response.ok) throw new Error(`${model}:fail`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  };

  const apis = [
    async () => {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai",
          messages: [
            { role: "system", content: CONTENT[contentLang].aiSystem },
            { role: "user", content: prompt },
          ],
          seed: Math.floor(Math.random() * 99999),
        }),
      });
      if (!response.ok) throw new Error("fail");
      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    },
    async () => {
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
      if (!response.ok) throw new Error("fail");
      return await response.text();
    },
    async () => requestOpenRouter("mistralai/mistral-7b-instruct:free"),
    async () => requestOpenRouter("google/gemma-2-9b-it:free"),
    async () => requestOpenRouter("meta-llama/llama-3.1-8b-instruct:free"),
    async () => {
      const fallbackWords = prompt.match(/: (.*)\. Jedes/s)?.[1] || "";
      if (contentLang === "de") {
        return `Im alten Viertel begann alles ganz harmlos, bis plötzlich ${fallbackWords} in einer einzigen absurder werdenden Geschichte zusammenliefen. Erst lachte niemand, dann lachten alle. Jedes Detail wirkte zu seltsam, um Zufall zu sein, und genau das machte die Sache verdächtig. Eine Person blieb auffällig ruhig, während eine andere viel zu spät auf das Offensichtliche reagierte. Je länger die Geschichte dauerte, desto klarer wurde, dass hier jede Kleinigkeit beobachtet wurde. Am Ende war zwar nicht alles logisch, aber alles irgendwie perfekt vorbereitet. Genau deshalb schaute der Erzähler jetzt ganz genau hin.`;
      }
      return `What started as an ordinary scene quickly spiraled into chaos when ${fallbackWords} all collided inside one increasingly suspicious story. At first nobody reacted, and then everybody tried a little too hard not to react. Every detail felt slightly too specific to be accidental. One player stayed unnervingly calm while another overcorrected at exactly the wrong moment. The longer the story went on, the more obvious it became that every tiny gesture mattered. By the end, the plot barely made sense, but the tension absolutely did. That was exactly when the narrator started watching everyone much more closely.`;
    },
  ];
  const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
  for (const api of apis) {
    try {
      const text = await Promise.race([api(), timeout(9000)]);
      if (text && text.length > 50) {
        addLog("info", contentLang === "de" ? "KI OK" : "AI OK", text.slice(0, 40));
        return text;
      }
    } catch (error) {
      addLog("warn", contentLang === "de" ? "KI-API fail" : "AI API fail", error.message);
    }
  }
  return null;
}

function DebugPanel({ onClose, C, S, ui }) {
  const [logs, setLogs] = useState([...debugLog]);
  const [apiStatus, setApiStatus] = useState({});
  const [sbStatus, setSbStatus] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => { checkSb(); loadRooms(); }, []);

  async function checkSb() {
    try {
      const start = Date.now();
      const { error } = await sb.from("rooms").select("id").limit(1);
      setSbStatus({ ok: !error, ms: Date.now() - start, err: error?.message });
    } catch (error) {
      setSbStatus({ ok: false, err: error.message });
    }
  }

  async function loadRooms() {
    const { data } = await sb.from("rooms").select("id,host_name,status,created_at,round").order("created_at", { ascending: false }).limit(15);
    setRooms(data || []);
  }

  async function testApis() {
    setTesting(true);
    const prompt = ui === UI.de ? "Schreibe einen witzigen Satz auf Deutsch." : "Write one funny sentence in English.";
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
    const tests = [
      {
        key: "pollinations1",
        name: "Pollinations /openai",
        fn: async () => {
          const response = await fetch("https://text.pollinations.ai/openai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "openai", messages: [{ role: "user", content: prompt }], seed: 1 }) });
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        },
      },
      {
        key: "pollinations2",
        name: "Pollinations GET",
        fn: async () => {
          const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`);
          return await response.text();
        },
      },
      {
        key: "openrouter",
        name: "OpenRouter (Mistral free)",
        fn: async () => {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "HTTP-Referer": APP_URL, "X-Title": "Story Chaos" }, body: JSON.stringify({ model: "mistralai/mistral-7b-instruct:free", max_tokens: 60, messages: [{ role: "user", content: prompt }] }) });
          const data = await response.json();
          return data.choices?.[0]?.message?.content || "";
        },
      },
    ];
    const results = {};
    for (const test of tests) {
      const start = Date.now();
      try {
        const text = await Promise.race([test.fn(), timeout(9000)]);
        results[test.key] = { ok: text.length > 5, ms: Date.now() - start, preview: text.slice(0, 70), name: test.name };
      } catch (error) {
        results[test.key] = { ok: false, ms: Date.now() - start, err: error.message, name: test.name };
      }
      setApiStatus({ ...results });
    }
    setTesting(false);
  }

  async function deleteOldRooms() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    loadRooms();
    addLog("info", ui.debug.deletedRooms);
  }

  const badge = (ok) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: ok === undefined ? "transparent" : ok ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.15)", color: ok === undefined ? C.muted : ok ? ACC.greenl : ACC.redl, border: `1px solid ${ok === undefined ? C.bdr : ok ? "rgba(74,222,128,.3)" : "rgba(248,113,113,.3)"}` }}>
      {ok === undefined ? "–" : ok ? ui.debug.ok : ui.debug.fail}
    </span>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.88)", overflowY: "auto" }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "16px 16px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.txt }}>{ui.debug.title}</div>
          <button onClick={onClose} style={S.sbtn(C.muted)}>✕ {ui.common.close}</button>
        </div>

        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.debug.supabase}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: C.txt }}>{ui.debug.connection} {sbStatus?.ms ? `(${sbStatus.ms}ms)` : ""}</span>
            {sbStatus ? badge(sbStatus.ok) : <span style={{ fontSize: 11, color: C.muted }}>{ui.debug.checking}</span>}
          </div>
          {sbStatus?.err && <div style={{ fontSize: 11, color: ACC.redl, marginTop: 4 }}>{sbStatus.err}</div>}
          <button onClick={checkSb} style={{ ...S.sbtn(C.muted), marginTop: 10 }}>{ui.common.refresh}</button>
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.aiApis}</div>
            <button onClick={testApis} disabled={testing} style={S.sbtn(ACC.blue)}>{testing ? ui.debug.testing : ui.debug.testAll}</button>
          </div>
          {Object.values(apiStatus).length === 0 && !testing && <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.notTested}</p>}
          {Object.values(apiStatus).map((status) => (
            <div key={status.name} style={{ padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.txt }}>{status.name}</span>
                {badge(status.ok)}
              </div>
              {status.ms && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{status.ms}ms</div>}
              {status.preview && <div style={{ fontSize: 11, color: C.muted, marginTop: 2, fontStyle: "italic" }}>&quot;{status.preview}&quot;</div>}
              {status.err && <div style={{ fontSize: 11, color: ACC.redl, marginTop: 2 }}>{status.err}</div>}
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.rooms(rooms.length)}</div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={loadRooms} style={S.sbtn(C.muted)}>↻</button>
              <button onClick={deleteOldRooms} style={S.sbtn(ACC.red)}>{ui.debug.deleteOld}</button>
            </div>
          </div>
          {rooms.length === 0 ? <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.noRooms}</p> : rooms.map((room) => (
            <div key={room.id} style={{ padding: "7px 0", borderBottom: `1px solid ${C.bdr}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: 3, color: C.txt }}>{room.id}</span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{room.host_name} · R{room.round || 1}</span>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: C.sur2, color: C.muted }}>{room.status}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{timeAgo(room.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted }}>{ui.debug.logs(logs.length)}</div>
            <button onClick={() => setLogs([...debugLog])} style={S.sbtn(C.muted)}>↻</button>
          </div>
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {logs.length === 0 ? <p style={{ fontSize: 13, color: C.muted }}>{ui.debug.noLogs}</p> : logs.map((log, index) => (
              <div key={index} style={{ padding: "4px 0", borderBottom: `1px solid ${C.bdr}`, display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: C.muted, whiteSpace: "nowrap" }}>{log.time}</span>
                <span style={{ fontWeight: 700, color: log.level === "error" ? ACC.red : log.level === "warn" ? ACC.gold : ACC.blue, minWidth: 34 }}>{log.level.toUpperCase()}</span>
                <span style={{ color: C.txt, wordBreak: "break-all" }}>{log.msg} <span style={{ color: C.muted }}>{log.detail}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HostLobby({ room, players, gameLang, lang, ui, C, S, onStart }) {
  const narratorId = getNarratorId(room, players);
  const others = getAudience(players, narratorId);
  const joinUrl = `${APP_URL}?room=${room.id}&lang=${gameLang}`;

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(96,165,250,.3)", background: "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.02))", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 6 }}>{ui.common.roomCode}</div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: 6, color: C.txt, marginBottom: 4 }}>{room.id}</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>{ui.hostLobby.joinHint}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><div style={{ padding: 12, borderRadius: 18, background: C.sur, border: `1px solid ${C.bdr}` }}><QRCode url={joinUrl} size={176} C={C} lang={lang} /></div></div>
        <div style={{ fontSize: 11, color: C.muted, wordBreak: "break-all", background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 12, padding: "10px 12px" }}>{joinUrl}</div>
      </div>

      <div style={S.card}>
        <div style={{ ...S.st, marginBottom: 10 }}>{ui.hostLobby.joined(others.length)}</div>
        {others.length === 0 ? (
          <p style={{ ...S.bt, textAlign: "center", padding: "12px 0", fontStyle: "italic" }}>{ui.hostLobby.empty}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {others.map((player) => (
              <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: ACC.green, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: C.txt, flex: 1 }}>{player.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={onStart} disabled={others.length === 0} style={S.pbtn(others.length > 0 ? ACC.green : C.bdr, others.length > 0 ? "rgba(74,222,128,.1)" : C.sur)}>
        {others.length === 0 ? ui.hostLobby.waiting : ui.hostLobby.start(others.length)}
      </button>
    </div>
  );
}

function HostCards({ room, players, ui, contentLang, setContentLang, C, S, onCardsDealt }) {
  const [diff, setDiff] = useState("mix");
  const [cats, setCats] = useState(Object.keys(CONTENT[contentLang].words));
  const [loading, setLoading] = useState(false);
  const narratorId = getNarratorId(room, players);
  const others = getAudience(players, narratorId);
  const content = CONTENT[contentLang];
  const allWords = ALL_WORDS_BY_LANG[contentLang];
  const allActions = ALL_ACTIONS_BY_LANG[contentLang];

  useEffect(() => {
    setCats(Object.keys(CONTENT[contentLang].words));
  }, [contentLang]);

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
    await sb.from("rooms").update({ status: "cards", story_words: ws, difficulty: diff }).eq("id", room.id);
    onCardsDealt(ws);
    vibrate([100, 50, 100]);
    setLoading(false);
  }

  function toggleCat(category) {
    setCats((selected) => (selected.includes(category) ? selected.filter((value) => value !== category) : [...selected, category]));
  }

  return (
    <div>
      <div style={{ ...S.card, background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))", borderColor: "rgba(251,191,36,.26)" }}>
        <div style={S.st}>{ui.cards.title}</div>
        <p style={S.bt}>{ui.cards.desc}</p>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.cards.gameLanguage}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[{ id: "de", label: "Deutsch" }, { id: "en", label: "English" }].map((option) => (
            <button
              key={option.id}
              onClick={() => setContentLang(option.id)}
              aria-pressed={contentLang === option.id}
              style={{ minHeight: 48, padding: "10px 8px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1.5px solid ${contentLang === option.id ? ACC.blue : C.bdr}`, background: contentLang === option.id ? "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))" : C.sur2, color: contentLang === option.id ? ACC.bluel : C.muted, cursor: "pointer" }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={S.card}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>{ui.cards.difficulty}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(content.diffLabels).map(([key, label]) => (
            <button key={key} onClick={() => setDiff(key)} aria-pressed={diff === key} style={{ minHeight: 48, padding: "10px 8px", borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1.5px solid ${diff === key ? ACC.gold : C.bdr}`, background: diff === key ? "linear-gradient(180deg, rgba(251,191,36,.16), rgba(251,191,36,.08))" : C.sur2, color: diff === key ? ACC.gold : C.muted, cursor: "pointer" }}>
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
              <button key={key} onClick={() => toggleCat(key)} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1.5px solid ${active ? ACC.blue : C.bdr}`, background: active ? "linear-gradient(180deg, rgba(96,165,250,.14), rgba(96,165,250,.08))" : C.sur2, color: active ? ACC.bluel : C.muted, cursor: "pointer" }}>
                {label}
              </button>
            );
          })}
        </div>
        {cats.length === 0 && <p style={{ fontSize: 12, color: ACC.redl, marginTop: 8 }}>{ui.cards.minCategory}</p>}
      </div>

      <div style={{ ...S.card, marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.txt, marginBottom: 8 }}>{ui.cards.players(others.length)}</div>
        {others.length === 0 ? <p style={S.bt}>{ui.cards.noPlayers}</p> : others.map((player) => (
          <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.bdr}` }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: ACC.green, flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: C.txt }}>{player.name}</span>
          </div>
        ))}
      </div>

      <button onClick={deal} disabled={loading || others.length === 0 || cats.length === 0} style={S.pbtn(ACC.blue, "rgba(96,165,250,.1)")}>
        {loading ? ui.cards.dealing : ui.cards.deal}
      </button>
    </div>
  );
}

function ReadyCheck({ room, players, ui, C, S, onAllReady }) {
  const narratorId = getNarratorId(room, players);
  const others = getAudience(players, narratorId);
  const readyOnes = others.filter((player) => player.ready);
  const allReady = others.length > 0 && readyOnes.length === others.length;

  useEffect(() => {
    if (allReady) vibrate([100, 50, 200]);
  }, [allReady]);

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))" }}>
        <div style={S.st}>{ui.ready.title}</div>
        <p style={S.bt}>{ui.ready.desc}</p>
      </div>

      <div style={S.card}>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{ui.ready.status}</div>
          <div style={{ fontSize: 13, color: C.muted }}>{ui.ready.readyCount(readyOnes.length, others.length)}</div>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: C.sur2, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, background: allReady ? ACC.green : ACC.gold, width: `${others.length > 0 ? (readyOnes.length / others.length) * 100 : 0}%`, transition: "width .4s ease" }} />
        </div>
        {others.map((player) => (
          <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
            <span style={{ fontSize: 16 }}>{player.ready ? "✅" : "⏳"}</span>
            <span style={{ fontSize: 14, color: C.txt, flex: 1 }}>{player.name}</span>
            {player.rerolled && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, background: "rgba(251,191,36,.12)", color: ACC.gold, border: "1px solid rgba(251,191,36,.3)" }}>{ui.ready.rerolled}</span>}
          </div>
        ))}
      </div>

      {allReady && (
        <div style={{ animation: "fadeIn .3s ease" }}>
          <div style={{ ...S.card, borderColor: "rgba(74,222,128,.3)", background: "linear-gradient(180deg, rgba(74,222,128,.12), rgba(74,222,128,.05))", textAlign: "center", padding: "20px 18px", marginBottom: 12 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: ACC.greenl }}>{ui.ready.allReady}</div>
          </div>
          <button onClick={onAllReady} style={S.pbtn(ACC.green, "rgba(74,222,128,.1)")}>{ui.ready.continue}</button>
        </div>
      )}
    </div>
  );
}

function HostStory({ room, storyWords, ui, contentLang, C, S, onOpenResolution }) {
  const [genre, setGenre] = useState(null);
  const [story, setStory] = useState(room.story || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const words = storyWords || [];
  const content = CONTENT[contentLang];

  async function generate() {
    if (!genre || words.length === 0) return;
    setLoading(true);
    setError("");
    setStory("");
    setRevealed(false);
    const selection = genre === "random" ? content.genres[Math.floor(Math.random() * (content.genres.length - 1))].label : content.genres.find((entry) => entry.id === genre)?.label;
    const prompt = content.aiPrompt(selection, words);
    const text = await generateStory(prompt, contentLang);
    if (!text) {
      setError(ui.storyGen.aiError);
      setLoading(false);
      return;
    }
    setStory(text);
    await sb.from("rooms").update({ story: text, status: "playing" }).eq("id", room.id);
    setLoading(false);
  }

  function renderStory(text, highlightWords) {
    const clean = text.replace(/\*\*(.*?)\*\*/g, "$1");
    if (!highlightWords?.length) return clean;
    const escaped = highlightWords.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
    return clean.split(pattern).map((part, index) => (
      highlightWords.some((word) => word.toLowerCase() === part.toLowerCase())
        ? <strong key={index} style={{ color: ACC.gold, textDecoration: "underline dotted", textUnderlineOffset: 3 }}>{part}</strong>
        : part
    ));
  }

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>{ui.storyGen.title}</div>
        <p style={S.bt}>{ui.storyGen.desc}</p>
      </div>

      <fieldset style={{ border: "none", margin: "0 0 14px", padding: 0 }}>
        <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 10, display: "block" }}>{ui.storyGen.theme}</legend>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {content.genres.map((entry) => (
            <button key={entry.id} onClick={() => setGenre(entry.id)} aria-pressed={genre === entry.id} style={{ background: genre === entry.id ? "rgba(251,191,36,.1)" : C.sur, border: `2px solid ${genre === entry.id ? ACC.gold : C.bdr}`, borderRadius: 8, padding: 12, cursor: "pointer", textAlign: "left", gridColumn: entry.id === "random" ? "span 2" : "span 1", transition: "all .15s", display: "block" }}>
              <div style={{ fontSize: 17, marginBottom: 3 }}>{entry.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: genre === entry.id ? ACC.gold : C.txt }}>{entry.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{entry.desc}</div>
            </button>
          ))}
        </div>
      </fieldset>

      <button onClick={generate} disabled={!genre || loading || words.length === 0} style={S.pbtn(genre ? ACC.gold : C.bdr, genre ? "rgba(251,191,36,.08)" : C.sur)}>
        {loading ? ui.storyGen.generating : ui.storyGen.generate}
      </button>

      {loading && <div style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 28, display: "inline-block", animation: "spin 1.5s linear infinite" }}>✍️</div><div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>{ui.storyGen.writing}</div></div>}
      {error && <div style={{ ...S.card, borderColor: "rgba(248,113,113,.4)", background: "rgba(248,113,113,.06)", marginTop: 12 }}><p style={{ ...S.bt, color: ACC.redl }}>{error}</p></div>}

      {story && !loading && (
        <div style={{ animation: "fadeIn .3s ease", marginTop: 12 }}>
          <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "rgba(251,191,36,.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.gold }}>{ui.storyGen.readNow}</span>
              <button onClick={generate} style={S.sbtn(C.muted)}>{ui.storyGen.regenerate}</button>
            </div>
            <p style={{ ...S.bt, marginBottom: 14, fontStyle: "italic" }}>{ui.storyGen.hiddenHint}</p>
            <div style={{ fontSize: 16, lineHeight: 2.1, color: C.txt }}>{story.replace(/\*\*(.*?)\*\*/g, "$1")}</div>
          </div>
          <div style={{ ...S.card, borderColor: "rgba(248,113,113,.3)", background: "rgba(248,113,113,.05)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.red, marginBottom: 12 }}>{ui.storyGen.revealTitle}</div>
            {!revealed ? (
              <button onClick={() => setRevealed(true)} style={S.pbtn(ACC.red, "rgba(248,113,113,.08)")}>{ui.storyGen.revealWords}</button>
            ) : (
              <div>
                <div style={{ fontSize: 15, lineHeight: 2.1, color: C.txt, marginBottom: 14 }}>{renderStory(story, words)}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 12, borderTop: `1px solid ${C.bdr}` }}>
                  {words.map((word) => <span key={word} style={{ fontSize: 12, fontWeight: 600, color: ACC.gold, background: "rgba(251,191,36,.1)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(251,191,36,.3)" }}>{word}</span>)}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.bdr}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.red, marginBottom: 8 }}>
                    {ui.storyGen.resolveReady}
                  </div>
                  <button onClick={onOpenResolution} style={S.pbtn(ACC.red, "rgba(248,113,113,.08)")}>
                    {ui.storyGen.resolveCta}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Resolution({ room, players, ui, C, S, onChooseNarrator }) {
  const narratorId = getNarratorId(room, players);
  const others = getAudience(players, narratorId);
  const [selectedNextId, setSelectedNextId] = useState("");
  const [savingScoreId, setSavingScoreId] = useState(null);
  const [startingNextRound, setStartingNextRound] = useState(false);

  useEffect(() => {
    const candidates = others.filter((player) => player.id !== narratorId);
    if (candidates.length === 1) {
      setSelectedNextId(candidates[0].id);
      return;
    }
    setSelectedNextId((current) => (candidates.some((player) => player.id === current) ? current : ""));
  }, [others, narratorId]);

  async function changeScore(player, delta) {
    const nextScore = Math.max(0, (player.score || 0) + delta);
    setSavingScoreId(player.id);
    await sb.from("players").update({ score: nextScore }).eq("id", player.id);
    setSavingScoreId(null);
  }

  async function startNextRound() {
    if (!onChooseNarrator) return;
    const nextPlayer = others.find((player) => player.id === selectedNextId);
    if (!nextPlayer) return;
    setStartingNextRound(true);
    await onChooseNarrator(nextPlayer);
    setStartingNextRound(false);
  }

  const nextCandidates = others.filter((player) => player.id !== narratorId);
  const canAdvance = !!selectedNextId;

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>{ui.resolution.title}</div>
        <p style={S.bt}>{ui.resolution.desc}</p>
      </div>
      {others.map((player) => (
        <div key={player.id} style={{ ...S.card, borderColor: player.ready ? "rgba(74,222,128,.25)" : C.bdr }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.txt, marginBottom: 10 }}>{player.name}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: C.sur2, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ACC.blue, marginBottom: 6 }}>{ui.resolution.word}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: ACC.bluel }}>{player.secret_word || "–"}</div>
            </div>
            <div style={{ background: C.sur2, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: ACC.red, marginBottom: 6 }}>{ui.resolution.action}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: ACC.redl }}>{player.secret_action || "–"}</div>
            </div>
          </div>
        </div>
      ))}
      <div style={{ ...S.card, marginTop: 12 }}>
        <div style={{ ...S.st, marginBottom: 8 }}>{ui.resolution.pointsTitle}</div>
        <p style={S.bt}>{ui.resolution.pointsDesc}</p>
        <div style={{ display: "grid", gap: 10 }}>
          {others.map((player) => (
            <div key={`${player.id}-score`} style={{ background: C.sur2, borderRadius: 12, padding: "12px 14px", border: `1px solid ${C.bdr}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.txt }}>{player.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    {ui.resolution.currentScore}: <span style={{ color: ACC.gold, fontWeight: 800 }}>{player.score || 0}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => changeScore(player, 1)} disabled={savingScoreId === player.id} style={{ ...S.sbtn(ACC.gold), minWidth: 92 }}>
                    {ui.resolution.addPoint}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {nextCandidates.length > 0 && (
        <div style={{ ...S.card, marginTop: 12 }}>
          <div style={{ ...S.st, marginBottom: 8 }}>{ui.resolution.nextTitle}</div>
          <p style={S.bt}>{nextCandidates.length > 1 ? ui.resolution.nextDesc : ui.resolution.nextAuto}</p>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {nextCandidates.map((player) => {
              const active = selectedNextId === player.id;
              return (
                <button
                  key={`${player.id}-next`}
                  onClick={() => setSelectedNextId(player.id)}
                  aria-pressed={active}
                  style={{
                    background: active ? "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))" : C.sur2,
                    border: `1.5px solid ${active ? ACC.blue : C.bdr}`,
                    color: active ? ACC.bluel : C.txt,
                    fontSize: 14,
                    fontWeight: 700,
                    padding: "14px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {player.name}
                </button>
              );
            })}
          </div>
          <button onClick={startNextRound} disabled={!canAdvance || startingNextRound} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), marginTop: 14 }}>
            {startingNextRound ? ui.common.loading : ui.resolution.nextRound}
          </button>
          {!canAdvance && <p style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>{ui.resolution.chooseFirst}</p>}
        </div>
      )}
    </div>
  );
}

function Scores({ room, players, ui, C, S }) {
  const sorted = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>{ui.scores.title}</div>
        <p style={{ ...S.bt, marginBottom: 12 }}>{ui.scores.desc}</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {sorted.map((player, index) => (
            <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 8, background: C.sur2, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
              <span style={{ fontSize: 16, minWidth: 26 }}>{medals[index] || `${index + 1}.`}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.txt }}>{player.name}</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: ACC.gold, minWidth: 36, textAlign: "center" }}>{player.score || 0}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Timer({ ui, C, S }) {
  const [dur, setDur] = useState(60);
  const [rem, setRem] = useState(60);
  const [run, setRun] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!run) return undefined;
    ref.current = setInterval(() => {
      setRem((remaining) => {
        if (remaining === 10) { vibrate([100]); playBeep(880, 0.1); }
        if (remaining <= 1) {
          clearInterval(ref.current);
          setRun(false);
          setDone(true);
          vibrate([300, 100, 300]);
          playBeep(440, 0.5);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [run]);

  const ratio = rem / dur;
  const offset = 565 * (1 - ratio);
  const strokeColor = ratio > 0.5 ? ACC.blue : ratio > 0.25 ? ACC.gold : ACC.red;
  const numberColor = rem <= 10 ? ACC.red : rem <= 20 ? ACC.gold : C.txt;
  const minutes = Math.floor(rem / 60);
  const seconds = rem % 60;
  const display = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, "0")}` : String(rem);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <fieldset style={{ border: "none", width: "100%", padding: 0 }}>
        <legend style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: C.muted, marginBottom: 8, display: "block" }}>{ui.timer.duration}</legend>
        <div style={{ display: "flex", gap: 8 }}>
          {[60, 90, 120, 180].map((value) => (
            <button key={value} onClick={() => { setDur(value); if (!run) { setRem(value); setDone(false); } }} aria-pressed={dur === value} style={{ flex: 1, background: dur === value ? "rgba(248,113,113,.1)" : C.sur, border: `2px solid ${dur === value ? ACC.red : C.bdr}`, color: dur === value ? ACC.redl : C.muted, fontSize: 13, fontWeight: 600, padding: "10px 0", borderRadius: 6, cursor: "pointer" }}>
              {value >= 60 ? `${value / 60} ${ui.timer.minutes}` : `${value}s`}
            </button>
          ))}
        </div>
      </fieldset>
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
          <circle cx="100" cy="100" r="90" fill="none" stroke={C.bdr} strokeWidth="10" />
          <circle cx="100" cy="100" r="90" fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="round" strokeDasharray="565" strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s linear,stroke 0.5s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }} role="timer" aria-label={ui.timer.aria(rem)}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, color: numberColor }}>{display}</div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: C.muted, textTransform: "uppercase", marginTop: 2 }}>{minutes > 0 ? ui.timer.minSec : ui.timer.seconds}</div>
        </div>
      </div>
      {done && (
        <div role="alert" style={{ width: "100%", background: "linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.12))", border: "1.5px solid rgba(248,113,113,.4)", borderRadius: 10, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, color: ACC.redl, textTransform: "uppercase" }}>{ui.timer.done}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.timer.guessPhase}</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10, width: "100%" }}>
        <button onClick={() => { if (done) return; setRun((current) => !current); }} disabled={done} style={S.pbtn(ACC.red, "rgba(248,113,113,.1)")}>{run ? ui.timer.pause : ui.timer.start}</button>
        <button onClick={() => { clearInterval(ref.current); setRun(false); setRem(dur); setDone(false); }} style={{ ...S.pbtn(C.bdr, C.sur), color: C.muted }}>{ui.timer.reset}</button>
      </div>
    </div>
  );
}

function RoundOverview({ room, players, ui, C, S }) {
  const narratorId = getNarratorId(room, players);
  const others = getAudience(players, narratorId);
  const narrator = players.find((player) => player.id === narratorId);
  const past = room.past_narrators || [];
  const doneAll = others.every((player) => past.includes(player.id));

  return (
    <div>
      <div style={S.card}>
        <div style={S.st}>{ui.rounds.title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 14, color: C.muted }}>{ui.rounds.round}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: ACC.gold }}>{room.round || 1}</div>
        </div>
        {narrator && (
          <div style={{ background: C.sur2, borderRadius: 8, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎤</span>
            <div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, textTransform: "uppercase" }}>{ui.rounds.currentNarrator}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.txt }}>{narrator.name}</div>
            </div>
          </div>
        )}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {others.map((player) => {
            const was = past.includes(player.id);
            const current = player.id === room.narrator_id;
            return (
              <li key={player.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${C.bdr}` }}>
                <span style={{ fontSize: 16 }}>{current ? "🎤" : was ? "✅" : "⏳"}</span>
                <span style={{ fontSize: 14, color: C.txt, flex: 1 }}>{player.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{current ? ui.rounds.current : was ? ui.rounds.done : ui.rounds.waiting}</span>
                </div>
              </li>
            );
          })}
        </ul>
        {doneAll && (
          <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(74,222,128,.08)", border: "1px solid rgba(74,222,128,.3)", borderRadius: 8, textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: ACC.greenl }}>{ui.rounds.allNarrators}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{ui.rounds.gameFinished}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function HostApp({ roomId, hostName, onLeave, lang, ui, contentLang, setContentLang, C, S }) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [tab, setTab] = useState("lobby");
  const [storyWords, setStoryWords] = useState([]);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      if (currentRoom?.story_words) setStoryWords(currentRoom.story_words);
      const { data: currentPlayers } = await sb.from("players").select("*").eq("room_id", roomId).order("joined_at");
      setPlayers(currentPlayers || []);
    }
    load();
    const channel = sb.channel(`host-${roomId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => {
        setRoom(payload.new);
        if (payload.new.story_words) setStoryWords(payload.new.story_words);
      })
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [roomId]);

  const narratorId = getNarratorId(room, players);
  const currentWords = getAudience(players, narratorId).map((player) => player.secret_word).filter(Boolean);
  useEffect(() => {
    if (currentWords.length > 0) setContentLang((current) => detectLanguageFromSample(currentWords[0], null, current));
  }, [currentWords.join("|"), setContentLang]);

  async function chooseNextNarrator(nextPlayer) {
    const currentPast = room?.past_narrators || [];
    const nextPast = Array.from(new Set([...currentPast, nextPlayer.id]));
    await sb.from("rooms").update({
      narrator_id: nextPlayer.id,
      host_name: nextPlayer.name,
      round: (room?.round || 1) + 1,
      past_narrators: nextPast,
      story: null,
      story_words: [],
      status: "waiting",
    }).eq("id", roomId);

    await sb.from("players").update({
      secret_word: null,
      secret_action: null,
      ready: false,
      rerolled: false,
    }).eq("room_id", roomId);

    setStoryWords([]);
    setTab("lobby");
  }

  const tabs = [
    { id: "lobby", icon: "🏠", label: ui.hostTabs.lobby },
    { id: "cards", icon: "🎴", label: ui.hostTabs.cards },
    { id: "ready", icon: "⏳", label: ui.hostTabs.ready },
    { id: "story", icon: "✨", label: ui.hostTabs.story },
    { id: "timer", icon: "⏱", label: ui.hostTabs.timer },
    { id: "resolve", icon: "🎭", label: ui.hostTabs.resolve },
    { id: "scores", icon: "🏆", label: ui.hostTabs.scores },
    { id: "rounds", icon: "🔄", label: ui.hostTabs.rounds },
  ];

  return (
    <div>
      <div style={{ background: C.sur, border: `1px solid ${C.bdr}`, borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: C.bg === "#0d0d14" ? "0 10px 24px rgba(0,0,0,.14)" : "0 12px 26px rgba(15,23,42,.05)" }}>
        <div>
          <span style={{ fontSize: 11, color: C.muted }}>{ui.common.room} </span>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3, color: C.txt }}>{roomId}</span>
          <span style={{ fontSize: 11, color: C.muted }}> · {hostName}</span>
        </div>
        <button onClick={onLeave} style={S.sbtn(C.muted)}>{ui.common.leave}</button>
      </div>
      <nav>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 16 }}>
          {tabs.map((tabEntry) => (
            <button key={tabEntry.id} onClick={() => setTab(tabEntry.id)} aria-selected={tab === tabEntry.id} style={{ background: tab === tabEntry.id ? "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))" : C.sur, border: `1.5px solid ${tab === tabEntry.id ? ACC.blue : C.bdr}`, color: tab === tabEntry.id ? ACC.bluel : C.muted, fontSize: 9, fontWeight: 700, padding: "10px 4px 8px", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", minHeight: 62 }}>
              <span style={{ fontSize: 15 }}>{tabEntry.icon}</span><span>{tabEntry.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {tab === "lobby" && <HostLobby room={room || { id: roomId }} players={players} gameLang={contentLang} lang={lang} ui={ui} C={C} S={S} onStart={() => setTab("cards")} />}
      {tab === "cards" && <HostCards room={room || { id: roomId }} players={players} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} onCardsDealt={(words) => { setStoryWords(words); setTab("ready"); }} />}
      {tab === "ready" && <ReadyCheck room={room || { id: roomId }} players={players} ui={ui} C={C} S={S} onAllReady={() => setTab("story")} />}
      {tab === "story" && <HostStory room={room || { id: roomId }} storyWords={currentWords.length > 0 ? currentWords : storyWords} ui={ui} contentLang={contentLang} C={C} S={S} onOpenResolution={() => setTab("resolve")} />}
      {tab === "timer" && <Timer ui={ui} C={C} S={S} />}
      {tab === "resolve" && <Resolution room={room || { id: roomId }} players={players} ui={ui} C={C} S={S} onChooseNarrator={chooseNextNarrator} />}
      {tab === "scores" && <Scores room={room || { id: roomId }} players={players} ui={ui} C={C} S={S} />}
      {tab === "rounds" && <RoundOverview room={room || { id: roomId, round: 1, past_narrators: [] }} players={players} ui={ui} C={C} S={S} />}
    </div>
  );
}

function PlayerView({ roomId, playerName, onLeave, ui, contentLang, setContentLang, C, S }) {
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);
  const [cardRevealed, setCardRevealed] = useState({ word: false, action: false });
  const [rerolled, setRerolled] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [markingReady, setMarkingReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      const { data: currentPlayer } = await sb.from("players").select("*").eq("room_id", roomId).eq("name", playerName).order("joined_at", { ascending: false }).limit(1).single();
      if (currentPlayer) {
        setPlayer(currentPlayer);
        setIsReady(!!currentPlayer.ready);
        setRerolled(!!currentPlayer.rerolled);
        setContentLang((current) => detectLanguageFromSample(currentPlayer.secret_word, currentPlayer.secret_action, current));
      }
    }
    load();
    const channel = sb.channel(`player-${roomId}-${playerName}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.new.name === playerName) {
          setPlayer(payload.new);
          setIsReady(!!payload.new.ready);
          setRerolled(!!payload.new.rerolled);
          setContentLang((current) => detectLanguageFromSample(payload.new.secret_word, payload.new.secret_action, current));
          if (!payload.old?.secret_word && payload.new.secret_word) {
            vibrate([100, 50, 200]);
            setCardRevealed({ word: false, action: false });
          }
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [roomId, playerName, setContentLang]);

  async function doReroll() {
    if (rerolled || !player) return;
    const { data: all } = await sb.from("players").select("secret_word,secret_action").eq("room_id", roomId);
    const usedWords = all.map((entry) => entry.secret_word).filter(Boolean);
    const usedActions = all.map((entry) => entry.secret_action).filter(Boolean);
    const activeLang = detectLanguageFromSample(player.secret_word, player.secret_action, contentLang);
    const newWord = shuffle(ALL_WORDS_BY_LANG[activeLang].filter((word) => !usedWords.includes(word)))[0] || player.secret_word;
    const newAction = shuffle(ALL_ACTIONS_BY_LANG[activeLang].filter((action) => !usedActions.includes(action)))[0] || player.secret_action;
    await sb.from("players").update({ secret_word: newWord, secret_action: newAction, rerolled: true, ready: false }).eq("id", player.id);
    setPlayer((current) => ({ ...current, secret_word: newWord, secret_action: newAction, rerolled: true, ready: false }));
    setCardRevealed({ word: false, action: false });
    setIsReady(false);
    setRerolled(true);
    setContentLang(activeLang);
    vibrate([80, 40, 80]);
  }

  async function markReady() {
    if (isReady || !player) return;
    setMarkingReady(true);
    await sb.from("players").update({ ready: true }).eq("id", player.id);
    setIsReady(true);
    vibrate([100, 50, 200]);
    setMarkingReady(false);
  }

  if (!player || !room) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⏳</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>{ui.common.loading}</div>
      </div>
    );
  }

  const hasCards = player.secret_word && player.secret_action;
  const bothRevealed = cardRevealed.word && cardRevealed.action;

  return (
    <div>
      <div style={{ ...S.card, borderColor: "rgba(96,165,250,.3)", background: "linear-gradient(180deg, rgba(96,165,250,.08), rgba(96,165,250,.03))", textAlign: "center", padding: "12px 18px" }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{ui.player.inRoom}</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 4, color: C.txt }}>{roomId}</div>
        <div style={{ fontSize: 13, color: ACC.blue, marginTop: 2 }}>{ui.player.as} {playerName}</div>
      </div>

      {!hasCards ? (
        <div style={{ ...S.card, textAlign: "center", padding: "28px 20px", borderStyle: "dashed" }}>
          <div style={{ fontSize: 32, marginBottom: 12, animation: "pulse 2s infinite" }}>⏳</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.txt, marginBottom: 6 }}>{ui.player.waitingCards}</div>
          <p style={S.bt}>{ui.player.hostDealing}</p>
        </div>
      ) : (
        <div>
          <div style={{ ...S.card, borderColor: "rgba(251,191,36,.3)", background: "linear-gradient(180deg, rgba(251,191,36,.08), rgba(251,191,36,.03))" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.txt }}>{ui.player.secretCards}</div>
              <button onClick={doReroll} disabled={rerolled} style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 10, cursor: rerolled ? "not-allowed" : "pointer", border: `1px solid ${rerolled ? C.bdr : "rgba(251,191,36,.4)"}`, background: rerolled ? "rgba(90,90,110,.2)" : "rgba(251,191,36,.12)", color: rerolled ? C.muted : ACC.gold }}>
                {rerolled ? ui.player.rerolled : ui.player.reroll}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
              {[
                { key: "word", type: ui.player.secretWord, value: player.secret_word, blue: true },
                { key: "action", type: ui.player.secretAction, value: player.secret_action, blue: false },
              ].map((cell, index) => {
                const revealed = cardRevealed[cell.key];
                return (
                  <button key={cell.key} onClick={() => setCardRevealed((current) => ({ ...current, [cell.key]: !current[cell.key] }))} style={{ padding: 14, cursor: "pointer", minHeight: 90, textAlign: "left", background: "transparent", border: "none", borderRight: index === 0 ? `1px solid ${C.bdr}` : "none", display: "block", width: "100%" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, color: cell.blue ? ACC.blue : ACC.red }}>
                      <span aria-hidden="true">{cell.blue ? "🔵" : "🔴"} </span>{cell.type}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: cell.blue ? ACC.bluel : ACC.redl, filter: revealed ? "none" : "blur(7px)", transition: "filter .25s", userSelect: revealed ? "auto" : "none" }}>{cell.value}</div>
                    {!revealed && <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{ui.player.tapReveal}</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {bothRevealed && !isReady && (
            <button onClick={markReady} disabled={markingReady} style={{ ...S.pbtn(ACC.green, "rgba(74,222,128,.1)"), marginBottom: 12, animation: "fadeIn .3s ease" }}>
              {markingReady ? "…" : ui.player.readyButton}
            </button>
          )}

          {isReady && (
            <div style={{ ...S.card, borderColor: "rgba(74,222,128,.3)", background: "rgba(74,222,128,.06)", textAlign: "center", padding: "14px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: ACC.greenl }}>{ui.player.readyState}</div>
            </div>
          )}

          {!bothRevealed && (
            <div style={{ ...S.card2, textAlign: "center", padding: "12px 16px", marginBottom: 12 }}>
              <p style={{ ...S.bt, fontSize: 13 }}>{ui.player.revealBoth}</p>
            </div>
          )}

          {room.story && (
            <div style={{ ...S.card, borderColor: "rgba(96,165,250,.2)", background: "rgba(96,165,250,.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: ACC.blue, marginBottom: 8 }}>{ui.player.storyRunning}</div>
              <p style={{ ...S.bt, fontStyle: "italic" }}>{ui.player.reactHint}</p>
              <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: ACC.bluel }}>{ui.player.yourWord} <span style={{ background: "rgba(96,165,250,.15)", padding: "2px 10px", borderRadius: 20 }}>{player.secret_word}</span></div>
            </div>
          )}
        </div>
      )}

      <button onClick={onLeave} style={{ ...S.pbtn(C.bdr, "transparent"), color: C.muted, marginTop: 8, background: C.sur }}>{ui.common.leaveRoom}</button>
    </div>
  );
}

function JoinScreen({ initialCode, onJoined, ui, C, S }) {
  const [code, setCode] = useState(initialCode || "");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [needPw, setNeedPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function join() {
    if (!code.trim() || !name.trim()) { setError(ui.join.emptyError); return; }
    setLoading(true);
    setError("");
    const { data: room } = await sb.from("rooms").select("*").eq("id", code.toUpperCase().trim()).single();
    if (!room) { setError(ui.join.roomNotFound); setLoading(false); return; }
    if (room.password && room.password !== pw) { setNeedPw(true); setError(ui.join.wrongPassword); setLoading(false); return; }
    const { data: existing } = await sb.from("players").select("id").eq("room_id", room.id).eq("name", name.trim()).single();
    if (existing) { setError(ui.join.nameTaken); setLoading(false); return; }
    const { error: joinError } = await sb.from("players").insert({ room_id: room.id, name: name.trim(), is_host: false });
    if (joinError) { setError(ui.join.genericError); setLoading(false); return; }
    onJoined(room.id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ ...S.card, textAlign: "center", padding: "24px 18px 18px", background: C.bg === "#0d0d14" ? "linear-gradient(180deg, rgba(96,165,250,.10), rgba(96,165,250,.03))" : "linear-gradient(180deg, rgba(96,165,250,.10), rgba(255,255,255,.9))" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 12px", borderRadius: 18, display: "grid", placeItems: "center", background: C.sur, border: `1px solid ${C.bdr}`, overflow: "hidden", padding: 8 }}>
          <img src={APP_ICON} alt="Story Chaos icon" width="48" height="48" style={{ display: "block", borderRadius: 12 }} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.txt, marginBottom: 6, letterSpacing: "-0.03em" }}>{ui.join.title}</div>
        <p style={S.bt}>{ui.join.desc}</p>
      </div>
      <div style={{ ...S.card, padding: "18px 16px" }}>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.roomCode}</label>
        <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder={ui.join.roomPlaceholder} maxLength={5} style={{ ...S.input, fontSize: 22, fontWeight: 800, letterSpacing: 6, textAlign: "center", marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.yourName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && !needPw && join()} placeholder={ui.join.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: needPw ? 14 : 0 }} />
        {needPw && <>
          <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.common.password}</label>
          <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} onKeyDown={(event) => event.key === "Enter" && join()} placeholder={ui.join.passwordPlaceholder} style={S.input} />
        </>}
        {error && <p style={{ fontSize: 13, color: ACC.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
        <button onClick={join} disabled={loading} style={{ ...S.pbtn(ACC.green, "rgba(74,222,128,.1)"), marginTop: 16 }}>
          {loading ? ui.join.connecting : ui.join.button}
        </button>
      </div>
    </div>
  );
}

function CreateRoom({ onCreated, ui, C, S }) {
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function create() {
    if (!name.trim()) { setError(ui.create.emptyError); return; }
    setLoading(true);
    setError("");
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await sb.from("rooms").delete().lt("created_at", cutoff);
    const id = roomCode();
    const { error: createError } = await sb.from("rooms").insert({ id, host_name: name.trim(), status: "waiting", password: pw || null });
    if (createError) { setError(ui.create.genericError); setLoading(false); return; }
    const { data: hostPlayer, error: hostError } = await sb.from("players").insert({ room_id: id, name: name.trim(), is_host: true }).select().single();
    if (hostError) { setError(ui.create.genericError); setLoading(false); return; }
    await sb.from("rooms").update({ narrator_id: hostPlayer.id, past_narrators: [hostPlayer.id], round: 1 }).eq("id", id);
    onCreated(id, name.trim());
    setLoading(false);
  }

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <div style={{ ...S.card, textAlign: "center", padding: "24px 18px 18px", background: C.bg === "#0d0d14" ? "linear-gradient(180deg, rgba(251,191,36,.11), rgba(251,191,36,.03))" : "linear-gradient(180deg, rgba(251,191,36,.10), rgba(255,255,255,.9))" }}>
        <div style={{ width: 64, height: 64, margin: "0 auto 12px", borderRadius: 18, display: "grid", placeItems: "center", background: C.sur, border: `1px solid ${C.bdr}`, overflow: "hidden", padding: 8 }}>
          <img src={APP_ICON} alt="Story Chaos icon" width="48" height="48" style={{ display: "block", borderRadius: 12 }} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.txt, marginBottom: 6, letterSpacing: "-0.03em" }}>{ui.create.title}</div>
        <p style={S.bt}>{ui.create.desc}</p>
      </div>
      <div style={{ ...S.card, padding: "18px 16px" }}>
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>{ui.create.hostName}</label>
        <input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && create()} placeholder={ui.create.namePlaceholder} maxLength={20} style={{ ...S.input, marginBottom: 14 }} />
        <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 8 }}>
          {ui.common.password} <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>({ui.common.optional})</span>
        </label>
        <input type="password" value={pw} onChange={(event) => setPw(event.target.value)} placeholder={ui.create.emptyPassword} maxLength={20} style={S.input} />
        {error && <p style={{ fontSize: 13, color: ACC.redl, margin: "12px 0 0", padding: "11px 12px", borderRadius: 12, background: "rgba(248,113,113,.08)", border: "1px solid rgba(248,113,113,.18)" }}>{error}</p>}
        <button onClick={create} disabled={loading} style={{ ...S.pbtn(ACC.blue, "rgba(96,165,250,.1)"), marginTop: 16 }}>
          {loading ? ui.create.creating : ui.create.button}
        </button>
      </div>
    </div>
  );
}

function RoomShell({ roomId, playerName, onLeave, lang, ui, contentLang, setContentLang, C, S }) {
  const [player, setPlayer] = useState(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: currentRoom } = await sb.from("rooms").select("*").eq("id", roomId).single();
      setRoom(currentRoom);
      const { data: currentPlayer } = await sb.from("players").select("*").eq("room_id", roomId).eq("name", playerName).order("joined_at", { ascending: false }).limit(1).single();
      setPlayer(currentPlayer || null);
    }
    load();
    const channel = sb.channel(`room-shell-${roomId}-${playerName}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` }, () => load())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${roomId}` }, (payload) => setRoom(payload.new))
      .subscribe();
    return () => sb.removeChannel(channel);
  }, [roomId, playerName]);

  if (!player || !room) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 28, animation: "spin 1.5s linear infinite", display: "inline-block" }}>⏳</div>
        <div style={{ fontSize: 14, color: C.muted, marginTop: 12 }}>{ui.common.loading}</div>
      </div>
    );
  }

  const isNarrator = room.narrator_id ? room.narrator_id === player.id : player.is_host;

  if (isNarrator) {
    return <HostApp roomId={roomId} hostName={playerName} onLeave={onLeave} lang={lang} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />;
  }

  return <PlayerView roomId={roomId} playerName={playerName} onLeave={onLeave} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />;
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const urlRoom = params.get("room");
  const rawUrlLang = params.get("lang");
  const urlLang = rawUrlLang === "de" || rawUrlLang === "en" ? rawUrlLang : null;

  const [lang, setLang] = useLanguage(urlLang);
  const [contentLang, setContentLang] = useState(() => urlLang || lang);
  const [C, dark, toggleTheme] = useTheme();
  const S = makeStyles(C);
  const ui = UI[lang];

  const [screen, setScreen] = useState(urlRoom ? "join" : "home");
  const [roomId, setRoomId] = useState(urlRoom || "");
  const [myName, setMyName] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  useEffect(() => {
    document.title = "Story Chaos";
  }, [lang]);

  function handleLogoTap() {
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      setShowDebug(true);
      addLog("info", ui.debug.debugOpened);
    }
  }

  function handleCreated(id, name) {
    setRoomId(id);
    setMyName(name);
    setScreen("host");
  }

  function handleJoined(id, name) {
    setRoomId(id);
    setMyName(name);
    setScreen("player");
  }

  function handleLeave() {
    setScreen("home");
    setRoomId("");
    setMyName("");
    window.history.replaceState({}, "", "/");
  }

  const GS = `
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:${C.bg};color:${C.txt};font-family:${FF};}
    button,input{font-family:${FF};}
    *:focus-visible{outline:3px solid ${dark ? "#fff" : "#000"}!important;outline-offset:2px!important;border-radius:4px;}
    *:focus:not(:focus-visible){outline:none!important;}
    @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
    @keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
    input::placeholder{color:${C.muted};}
    input{color:${C.txt};}
  `;

  return (
    <div style={{ background: `radial-gradient(circle at top, ${dark ? "rgba(96,165,250,.08)" : "rgba(96,165,250,.10)"} 0%, ${C.bg} 34%)`, minHeight: "100vh", color: C.txt, fontFamily: FF }}>
      <style>{GS}</style>
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "0 14px 64px" }}>
        <header style={{ textAlign: "center", padding: "24px 0 16px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <h1 onClick={handleLogoTap} style={{ fontSize: "clamp(27px,8.8vw,50px)", fontWeight: 900, letterSpacing: "-0.06em", textTransform: "uppercase", background: "linear-gradient(135deg,#f59e0b,#facc15 45%,#60a5fa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", lineHeight: 0.94, margin: 0, cursor: "default", userSelect: "none" }}>
                Story Chaos
              </h1>
              <p style={{ fontSize: 10, letterSpacing: 3.2, color: C.muted, textTransform: "uppercase", marginTop: 8, paddingLeft: 2 }}>
                {ui.subtitle}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, paddingTop: 2 }}>
            <button onClick={() => setLang((current) => current === "de" ? "en" : "de")} aria-label={ui.aria.toggleLanguage} style={{ background: C.sur, border: `1px solid ${C.bdr}`, color: C.txt, minWidth: 42, height: 34, padding: "0 10px", borderRadius: 11, cursor: "pointer", fontSize: 11, fontWeight: 800, boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.03)" : "0 8px 20px rgba(15,23,42,.06)" }}>
              {lang === "de" ? "DE" : "EN"}
            </button>
            <button onClick={toggleTheme} aria-label={ui.aria.toggleTheme} style={{ background: C.sur, border: `1px solid ${C.bdr}`, color: C.txt, width: 38, height: 34, padding: 0, borderRadius: 11, cursor: "pointer", fontSize: 15, boxShadow: dark ? "inset 0 1px 0 rgba(255,255,255,.03)" : "0 8px 20px rgba(15,23,42,.06)" }}>
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
          </div>
        </header>

        <OfflineBanner C={C} ui={ui} />

        <main>
          {screen === "home" && (
            <div style={{ animation: "fadeIn .3s ease" }}>
              <div style={{ ...S.card, textAlign: "center", padding: "26px 16px 18px", marginBottom: 14, borderRadius: 16, background: dark ? "linear-gradient(180deg, rgba(28,28,40,.96), rgba(22,22,31,.96))" : "linear-gradient(180deg, rgba(255,255,255,.98), rgba(244,246,252,.98))", boxShadow: dark ? "0 12px 40px rgba(0,0,0,.24)" : "0 18px 45px rgba(15,23,42,.08)" }}>
                <div style={{ width: 70, height: 70, margin: "0 auto 14px", borderRadius: 20, display: "grid", placeItems: "center", background: dark ? "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))" : "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))", border: `1px solid ${dark ? "rgba(255,255,255,.08)" : "rgba(96,165,250,.18)"}`, overflow: "hidden", padding: 9 }}>
                  <img src={APP_ICON} alt="Story Chaos icon" width="52" height="52" style={{ display: "block", borderRadius: 14 }} />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: C.txt, marginBottom: 8, letterSpacing: "-0.03em" }}>{ui.home.welcome}</div>
                <p style={{ ...S.bt, fontSize: 15, lineHeight: 1.65, marginBottom: 22, maxWidth: 290, marginInline: "auto" }}>{ui.home.desc}</p>
                <button onClick={() => setScreen("create")} style={{ ...S.pbtn(ACC.blue, dark ? "linear-gradient(180deg, rgba(96,165,250,.18), rgba(96,165,250,.08))" : "linear-gradient(180deg, rgba(96,165,250,.16), rgba(96,165,250,.08))"), marginBottom: 10, minHeight: 56, borderRadius: 13, boxShadow: "0 0 0 1px rgba(96,165,250,.18) inset" }}>{ui.home.newGame}</button>
                <button onClick={() => setScreen("join")} style={{ ...S.pbtn(C.bdr, C.sur), minHeight: 54, borderRadius: 13, color: C.txt, background: dark ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.7)" }}>{ui.home.joinRoom}</button>
              </div>
              <div style={{ ...S.card, padding: "16px 16px 12px", borderRadius: 16, background: dark ? "rgba(24,24,35,.92)" : "rgba(255,255,255,.92)", boxShadow: dark ? "0 10px 30px rgba(0,0,0,.18)" : "0 16px 40px rgba(15,23,42,.06)" }}>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2.2, textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>{ui.home.howItWorks}</div>
                {ui.home.steps.map((step, index) => (
                  <div key={index} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: index < ui.home.steps.length - 1 ? `1px solid ${C.bdr}` : "none" }}>
                    <span style={{ fontSize: 13, color: ACC.blue, fontWeight: 800, minWidth: 22, paddingTop: 1 }}>{index + 1}.</span>
                    <span style={{ fontSize: 13.5, color: C.txt, lineHeight: 1.45 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {screen === "create" && <div><button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>{ui.common.back}</button><CreateRoom onCreated={handleCreated} ui={ui} C={C} S={S} /></div>}
          {screen === "join" && <div><button onClick={() => setScreen("home")} style={{ background: "transparent", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginBottom: 12 }}>{ui.common.back}</button><JoinScreen initialCode={urlRoom || ""} onJoined={handleJoined} ui={ui} C={C} S={S} /></div>}
          {(screen === "host" || screen === "player") && <RoomShell roomId={roomId} playerName={myName} onLeave={handleLeave} lang={lang} ui={ui} contentLang={contentLang} setContentLang={setContentLang} C={C} S={S} />}
        </main>
      </div>
      {showDebug && <DebugPanel onClose={() => setShowDebug(false)} C={C} S={S} ui={ui} />}
    </div>
  );
}
