import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3000;

// ── WORD DATABASE ─────────────────────────────────────────────────────────────
const WORDS = {
  "Hrana": [
    ["Kruh", "Pecivo"],["Mlijeko", "Jogurt"],["Sir", "Vrhnje"],["Jaje", "Omlet"],["Juha", "Varivo"],["Sendvič", "Tost"],["Pizza", "Burger"],["Pomfrit", "Pire"],["Riža", "Tjestenina"],["Piletina", "Puretina"],["Kobasica", "Hrenovka"],["Salata", "Kupus"],["Jabuka", "Kruška"],["Banana", "Mandarina"],["Limun", "Naranča"],["Čokolada", "Keks"],["Sladoled", "Puding"],["Kava", "Čaj"],["Sok", "Voda"],["Burek", "Pita"],["Palačinke", "Vafli"],["Gulaš", "Paprikaš"],["Sarma", "Punjene paprike"],["Krafna", "Mafini"]
  ],
  "Sport": [
    ["Nogomet", "Košarka"],["Tenis", "Stolni tenis"],["Odbojka", "Rukomet"],["Trčanje", "Hodanje"],["Bicikl", "Romobil"],["Skijanje", "Snowboard"],["Teretana", "Fitness"],["Sudac", "Trener"],["Golman", "Napadač"],["Prvenstvo", "Turnir"],["Medalja", "Pehar"],["Stadion", "Dvorana"],["Zagrijavanje", "Istezanje"],["Plivanje", "Ronjenje"],["Boks", "Hrvanje"],["Badminton", "Squash"],["Golf", "Kuglanje"],["Dres", "Kopačke"],["Start", "Cilj"],["Lopta", "Mreža"]
  ],
  "Životinje": [
    ["Pas", "Mačka"],["Štene", "Mačić"],["Krava", "Bik"],["Konj", "Magarac"],["Ovca", "Koza"],["Svinja", "Vepar"],["Lav", "Tigar"],["Vuk", "Lisica"],["Medvjed", "Panda"],["Zec", "Kunić"],["Miš", "Štakor"],["Ptica", "Golub"],["Patka", "Guska"],["Pijetao", "Kokoš"],["Riba", "Morski pas"],["Dupin", "Kit"],["Pčela", "Osa"],["Mrav", "Pauk"],["Žaba", "Gušter"],["Zmija", "Kornjača"]
  ],
  "Mjesta": [
    ["Škola", "Fakultet"],["Bolnica", "Ambulanta"],["Ljekarna", "Drogerija"],["Trgovina", "Supermarket"],["Pekara", "Slastičarnica"],["Kafić", "Restoran"],["Park", "Igralište"],["Kino", "Kazalište"],["Bazen", "Plaža"],["Stadion", "Dvorana"],["Kolodvor", "Aerodrom"],["Hotel", "Apartman"],["Banka", "Pošta"],["Knjižnica", "Čitaonica"],["Crkva", "Samostan"],["Muzej", "Galerija"],["Frizer", "Kozmetički salon"],["Benzinska", "Punjačnica"],["Tržnica", "Sajam"],["Most", "Tunel"]
  ],
  "Predmeti": [
    ["Stol", "Stolica"],["Krevet", "Kauč"],["Ormar", "Komoda"],["Jastuk", "Deka"],["Čaša", "Šalica"],["Tanjur", "Zdjelica"],["Vilica", "Žlica"],["Nož", "Škare"],["Olovka", "Kemijska"],["Bilježnica", "Knjiga"],["Torba", "Ruksak"],["Novčanik", "Torbica"],["Ključ", "Brava"],["Sat", "Budilica"],["Četkica", "Pasta"],["Ručnik", "Maramica"],["Kišobran", "Kabanica"],["Daljinski", "Punjač"],["Televizor", "Radio"],["Lampa", "Svjetiljka"],["Perilica", "Sušilica"],["Usisavač", "Metla"],["Mobitel", "Tablet"],["Laptop", "Računalo"]
  ],
  "Filmovi i serije": [
    ["Film", "Serija"],["Kino", "Netflix"],["Glumac", "Pjevač"],["Redatelj", "Scenarist"],["Trailer", "Najava"],["Kokice", "Piće"],["Epizoda", "Sezona"],["Horor", "Triler"],["Komedija", "Romansa"],["Akcija", "Avantura"],["Dokumentarac", "Reportaža"],["Superheroj", "Negativac"],["Policajac", "Detektiv"],["Zatvor", "Sudnica"],["Vjenčanje", "Maturalna"],["Brod", "Avion"],["Škola", "Kampus"],["Bolnica", "Hitna"],["Obitelj", "Susjedi"],["Kralj", "Kraljica"]
  ],
  "Profesije": [
    ["Doktor", "Medicinska sestra"],["Učitelj", "Profesor"],["Vozač", "Kondukter"],["Kuhar", "Konobar"],["Policajac", "Vatrogasac"],["Zidar", "Stolar"],["Automehaničar", "Vulkanizer"],["Frizer", "Brijač"],["Prodavač", "Blagajnik"],["Poštar", "Dostavljač"],["Novinar", "Voditelj"],["Pjevač", "Glumac"],["Fotograf", "Snimatelj"],["Električar", "Vodoinstalater"],["Odvjetnik", "Sudac"],["Programer", "Dizajner"],["Trener", "Sudac"],["Domar", "Zaštitar"],["Pilot", "Stjuardesa"],["Poljoprivrednik", "Vrtlar"]
  ],
  "Glazba": [
    ["Pjesma", "Album"],["Pjevač", "Bend"],["Gitara", "Klavir"],["Bubnjevi", "Mikrofon"],["Koncert", "Festival"],["Publika", "Pozornica"],["Refren", "Strofa"],["Radio", "Playlist"],["Slušalice", "Zvučnik"],["Takt", "Ritam"],["Note", "Tekst"],["DJ", "Producent"],["Rock", "Pop"],["Rap", "Trap"],["Narodna", "Zabavna"],["Violina", "Violončelo"],["Truba", "Saksofon"],["Klub", "Diskoteka"],["Aplauz", "Bis"],["Proba", "Nastup"]
  ],
  "Priroda i znanosti": [
    ["Sunce", "Mjesec"],["Kiša", "Snijeg"],["More", "Jezero"],["Rijeka", "Potok"],["Planina", "Brdo"],["Šuma", "Livada"],["Oblak", "Magla"],["Vjetar", "Oluja"],["Munja", "Grom"],["Cvijet", "Drvo"],["List", "Grana"],["Kamen", "Pijesak"],["Zemlja", "Blato"],["Zvijezda", "Planet"],["Teleskop", "Mikroskop"],["Baterija", "Žarulja"],["Magneta", "Kompas"],["Kemija", "Fizika"],["Pokus", "Mjerenje"],["Laboratorij", "Učionica"]
  ],
  "Tehnologija": [
    ["Mobitel", "Tablet"],["Laptop", "Računalo"],["Tipkovnica", "Miš"],["Ekran", "Monitor"],["Punjač", "Kabel"],["Internet", "Wi-Fi"],["Lozinka", "PIN"],["Aplikacija", "Program"],["Fotografija", "Video"],["Kamera", "Selfie"],["Poruka", "Poziv"],["Email", "Chat"],["Printer", "Skener"],["USB", "Memorijska kartica"],["Televizor", "Projektor"],["Sat", "Pametna narukvica"],["Mapa", "Navigacija"],["Tražilica", "Preglednik"],["Cloud", "Backup"],["Bluetooth", "Slušalice"]
  ],
  "Svakodnevica": [
    ["Jutro", "Večer"],["Doručak", "Večera"],["Posao", "Smjena"],["Plaća", "Račun"],["Kupovina", "Račun"],["Vikend", "Godišnji"],["Odmor", "Pauza"],["Tuš", "Kupka"],["Pranje", "Čišćenje"],["Spavanje", "Buđenje"],["Autobus", "Tramvaj"],["Lift", "Stepenice"],["Red", "Gužva"],["Ključevi", "Novčanik"],["Vrata", "Prozor"],["Susjed", "Prijatelj"],["Poruka", "Obavijest"],["Rođendan", "Slavlje"],["Poklon", "Čestitka"],["Kiša", "Suncobran"],["Kupon", "Popust"],["Pijaca", "Tržnica"],["Radni stol", "Kuhinjski stol"],["Perilica posuđa", "Perilica rublja"]
  ]
};};

const recentWords = new Map();
const disconnectTimers = new Map();
const RECONNECT_GRACE_MS = 90_000;

function scoreKey(player) {
  return player?.playerToken || player?.id;
}

function makePlayerToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function cancelDisconnectRemoval(code, playerToken) {
  const key = `${code}:${playerToken}`;
  const t = disconnectTimers.get(key);
  if (t) {
    clearTimeout(t);
    disconnectTimers.delete(key);
  }
}

function getRandomWord(category, roomCode) {
  const actualCategory = category === 'Random' ? randomCategory(roomCode) : category;
  const list = WORDS[actualCategory] || WORDS['Hrana'];
  if (!recentWords.has(roomCode)) recentWords.set(roomCode, []);
  const recent = recentWords.get(roomCode);
  const pool = list.map((_, i) => i).filter(i => !recent.includes(i));
  const available = pool.length > 0 ? pool : list.map((_, i) => i);
  const idx = available[Math.floor(Math.random() * available.length)];
  recent.push(idx);
  if (recent.length > 15) recent.shift();
  const pair = list[idx];
  // Randomly swap which word is citizen/impostor
  const words = Math.random() > 0.5
    ? { citizen: pair[0], impostor: pair[1] }
    : { citizen: pair[1], impostor: pair[0] };
  return { ...words, category: actualCategory };
}

function randomCategory(roomCode) {
  const categories = Object.keys(WORDS);
  if (!recentWords.has(roomCode + ':cat')) recentWords.set(roomCode + ':cat', []);
  const recentCats = recentWords.get(roomCode + ':cat');
  const pool = categories.filter(c => !recentCats.includes(c));
  const available = pool.length ? pool : categories;
  const picked = available[Math.floor(Math.random() * available.length)];
  recentCats.push(picked);
  if (recentCats.length > 4) recentCats.shift();
  return picked;
}

// ── ROOMS ─────────────────────────────────────────────────────────────────────
const rooms = new Map();
const timers = new Map();

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}

function clearTimer(code) {
  if (timers.has(code)) { clearInterval(timers.get(code)); timers.delete(code); }
}

function startTimer(code, seconds, onTick, onEnd) {
  clearTimer(code);
  let rem = seconds;
  onTick(rem);
  const iv = setInterval(() => {
    rem--;
    onTick(rem);
    if (rem <= 0) { clearTimer(code); onEnd(); }
  }, 1000);
  timers.set(code, iv);
}

// Build a safe room snapshot — strips word/role from all players
function safeRoom(room) {
  return {
    ...room,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isReady: p.isReady,
      hasRevealed: !!p.hasRevealed,
      voted: !!p.voted,
      isConnected: p.isConnected !== false,
      score: room.scores?.[scoreKey(p)] || 0
    })),
    activeCategory: room.activeCategory || room.category
  };
}

// ── SOCKET HANDLERS ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {

  // WebRTC signaling
  socket.on('rtc-offer',   ({ to, offer })     => io.to(to).emit('rtc-offer',   { from: socket.id, offer }));
  socket.on('rtc-answer',  ({ to, answer })    => io.to(to).emit('rtc-answer',  { from: socket.id, answer }));
  socket.on('rtc-ice',     ({ to, candidate }) => io.to(to).emit('rtc-ice',     { from: socket.id, candidate }));

  // ── createRoom
  socket.on('createRoom', ({ playerName }) => {
    const code = generateCode();
    const room = {
      code, state: 'LOBBY',
      category: 'Hrana', impostorCount: 1,
      discussionTime: 120, votingTime: 60,
      words: null, votes: {}, results: null,
      scores: {}, roundNumber: 0,
      speakOrder: [], currentSpeakerIdx: 0,
      players: [{ id: socket.id, name: playerName, isHost: true, isReady: true, playerToken: makePlayerToken(), isConnected: true, disconnectedAt: null }]
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('roomCreated', { ...safeRoom(room), playerToken: room.players[0].playerToken });
  });

  // ── joinRoom
  socket.on('joinRoom', ({ code, playerName, playerToken }) => {
    const normalizedCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    const room = rooms.get(normalizedCode);
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (room.state !== 'LOBBY') return socket.emit('error', 'Igra je već počela.');

    const existingByToken = playerToken ? room.players.find(p => p.playerToken === playerToken) : null;
    if (existingByToken) {
      cancelDisconnectRemoval(normalizedCode, existingByToken.playerToken);
      existingByToken.id = socket.id;
      existingByToken.name = playerName || existingByToken.name;
      existingByToken.isConnected = true;
      existingByToken.disconnectedAt = null;
      socket.join(normalizedCode);
      socket.emit('sessionResumed', buildPlayerPayload(room, existingByToken));
      io.to(normalizedCode).emit('roomUpdated', safeRoom(room));
      return;
    }

    if (room.players.length >= 10) return socket.emit('error', 'Soba je puna (max 10).');
    if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase()))
      return socket.emit('error', 'To ime je već zauzeto.');

    const token = playerToken || makePlayerToken();
    room.players.push({ id: socket.id, name: playerName, isHost: false, isReady: false, playerToken: token, isConnected: true, disconnectedAt: null });
    socket.join(normalizedCode);
    socket.emit('roomJoined', { ...safeRoom(room), playerToken: token });
    io.to(code.toUpperCase()).emit('roomUpdated', safeRoom(room));
  });

  socket.on('resumeSession', ({ code, playerToken, playerName }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || !playerToken) return socket.emit('resumeFailed');
    const player = room.players.find(p => p.playerToken === playerToken);
    if (!player) return socket.emit('resumeFailed');

    cancelDisconnectRemoval(room.code, player.playerToken);
    player.id = socket.id;
    if (playerName) player.name = playerName;
    player.isConnected = true;
    player.disconnectedAt = null;
    socket.join(room.code);
    socket.emit('sessionResumed', buildPlayerPayload(room, player));
    io.to(room.code).emit('roomUpdated', safeRoom(room));
  });

  // ── updateConfig
  socket.on('updateConfig', ({ code, category, impostors, discussionTime, votingTime }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || room.state !== 'LOBBY' || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (category === 'Random' || WORDS[category]) room.category = category;
    room.impostorCount = Math.max(1, Math.min(3, parseInt(impostors) || 1));
    if (discussionTime) room.discussionTime = Math.max(30, Math.min(300, parseInt(discussionTime)));
    if (votingTime) room.votingTime = Math.max(20, Math.min(120, parseInt(votingTime)));
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  // ── toggleReady
  socket.on('toggleReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (p && !p.isHost) {
      p.isReady = !p.isReady;
      io.to(code).emit('roomUpdated', safeRoom(room));
    }
  });

  // ── startGame
  socket.on('startGame', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (!room.players.find(p => p.id === socket.id && p.isHost))
      return socket.emit('error', 'Samo host može pokrenuti igru.');
    if (room.players.length < 3)
      return socket.emit('error', 'Potrebno je minimalno 3 igrača.');

    room.roundNumber++;
    room.words = getRandomWord(room.category, code);
    room.activeCategory = room.words.category || room.category;
    room.activeCategory = room.words.category || room.category;
    room.state = 'REVEAL';
    room.votes = {};
    room.impostorGuess = null;

    // Init scores
    room.players.forEach(p => { const key = scoreKey(p); if (room.scores[key] === undefined) room.scores[key] = 0; });

    // Assign roles
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const impIds = new Set(shuffled.slice(0, room.impostorCount).map(p => p.id));
    room.players.forEach(p => {
      p.role = impIds.has(p.id) ? 'IMPOSTOR' : 'CITIZEN';
      p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
      p.hasRevealed = false;
      p.voted = false;
    });

    // Random speak order
    room.speakOrder = [...room.players].sort(() => Math.random() - 0.5).map(p => p.id);
    room.currentSpeakerIdx = 0;

    // Send each player ONLY their own word — never leak others
    const base = safeRoom(room);
    room.players.forEach(p => {
      io.to(p.id).emit('gameStarted', {
        ...base,
        myWord: p.word,
        myRole: p.role
      });
    });
  });

  // ── playerReady
  socket.on('playerReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p) return;
    p.hasRevealed = true;
    const readyCount = room.players.filter(p => p.hasRevealed).length;
    io.to(code).emit('revealProgress', { readyCount, total: room.players.length });
    if (readyCount === room.players.length) {
      room.state = 'DISCUSSION';
      io.to(code).emit('startDiscussion', safeRoom(room));
      startTimer(code, room.discussionTime,
        t => io.to(code).emit('timer', { phase: 'discussion', remaining: t }),
        () => { if (rooms.get(code)?.state === 'DISCUSSION') startVotingPhase(code); }
      );
    }
  });

  // ── rerollWord — host changes word pair during REVEAL
  socket.on('rerollWord', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'REVEAL') return;
    if (!room.players.find(p => p.id === socket.id && p.isHost)) return;
    room.words = getRandomWord(room.category, code);
    room.activeCategory = room.words.category || room.category;
    room.players.forEach(p => {
      p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
      p.hasRevealed = false;
    });
    const base = safeRoom(room);
    room.players.forEach(p => {
      io.to(p.id).emit('wordRerolled', { ...base, myWord: p.word, myRole: p.role });
    });
  });

  // ── startVoting (host trigger)
  socket.on('startVoting', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    startVotingPhase(code);
  });

  function startVotingPhase(code) {
    const room = rooms.get(code);
    if (!room) return;
    clearTimer(code);
    room.state = 'VOTING';
    room.votes = {};
    io.to(code).emit('votingStarted', safeRoom(room));
    startTimer(code, room.votingTime,
      t => io.to(code).emit('timer', { phase: 'voting', remaining: t }),
      () => { if (rooms.get(code)?.state === 'VOTING') finalizeVotes(code); }
    );
  }

  // ── castVote
  socket.on('castVote', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'VOTING' || room.votes[socket.id]) return;
    room.votes[socket.id] = targetId;
    const total = Object.keys(room.votes).length;
    io.to(code).emit('voteCast', { total, max: room.players.length });
    if (total === room.players.length) finalizeVotes(code);
  });

  // ── impostorGuess
  socket.on('impostorGuess', ({ code, guess }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'VOTING') return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p || p.role !== 'IMPOSTOR') return;
    const correct = guess.trim().toLowerCase() === room.words.citizen.toLowerCase();
    if (correct) {
      clearTimer(code);
      room.state = 'RESULTS';
      room.results = {
        winner: 'IMPOSTORS', reason: 'guess',
        impostorGuessedCorrectly: true,
        isTie: false, votedOutId: null, votedOutName: null, isImpostor: false,
        impostors: room.players.filter(p => p.role === 'IMPOSTOR').map(p => p.name),
        tally: {}
      };
      calcScores(room);
      io.to(code).emit('gameEnded', buildResults(room));
    } else {
      socket.emit('impostorGuessFailed', { guess });
    }
  });

  function finalizeVotes(code) {
    clearTimer(code);
    const room = rooms.get(code);
    if (!room) return;
    const tally = {};
    Object.values(room.votes).forEach(id => { tally[id] = (tally[id] || 0) + 1; });
    let maxV = 0, votedOutId = null;
    for (const [id, cnt] of Object.entries(tally)) { if (cnt > maxV) { maxV = cnt; votedOutId = id; } }
    const tied = Object.entries(tally).filter(([, c]) => c === maxV).length > 1;
    const votedOut = tied ? null : room.players.find(p => p.id === votedOutId);
    const isImp = !tied && votedOut?.role === 'IMPOSTOR';
    room.state = 'RESULTS';
    room.results = {
      isTie: tied,
      votedOutId: tied ? null : votedOutId,
      votedOutName: votedOut?.name || null,
      isImpostor: isImp,
      winner: isImp ? 'CITIZENS' : 'IMPOSTORS',
      impostors: room.players.filter(p => p.role === 'IMPOSTOR').map(p => p.name),
      tally, reason: 'vote', impostorGuessedCorrectly: false
    };
    calcScores(room);
    io.to(code).emit('gameEnded', buildResults(room));
  }

  function calcScores(room) {
    room.scoreDeltas = {};

    if (room.results.winner === 'CITIZENS') {
      room.players.forEach(p => {
        const key = scoreKey(p);
        let delta = 0;
        if (p.role === 'CITIZEN') {
          const votedPlayer = room.players.find(x => x.id === room.votes[p.id]);
          delta = votedPlayer?.role === 'IMPOSTOR' ? 2 : 1;
        }
        room.scores[key] = (room.scores[key] || 0) + delta;
        room.scoreDeltas[key] = delta;
      });
    } else {
      room.players.forEach(p => {
        const key = scoreKey(p);
        let delta = 0;
        if (p.role === 'IMPOSTOR') {
          delta = room.results.impostorGuessedCorrectly ? 4 : 3;
        }
        room.scores[key] = (room.scores[key] || 0) + delta;
        room.scoreDeltas[key] = delta;
      });
    }
  }

  function buildPlayerPayload(room, player) {
    const base = safeRoom(room);
    return {
      ...base,
      playerToken: player.playerToken,
      myWord: player.word || null,
      myRole: player.role || null
    };
  }

  function buildResults(room) {
    // Include role/word in results so UI can show debrief
    return {
      ...safeRoom(room),
      results: room.results,
      words: room.words,
      votes: room.votes,
      scores: room.scores,
      players: room.players.map(p => ({
        id: p.id,
        name: p.name,
        playerToken: p.playerToken,
        isHost: p.isHost,
        role: p.role,
        hasRevealed: p.hasRevealed,
        voted: p.voted,
        isConnected: p.isConnected !== false,
        score: room.scores?.[scoreKey(p)] || 0
      })),
      scoreDeltas: room.scoreDeltas || {}
    };
  }

  // ── playAgain
  socket.on('playAgain', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    clearTimer(code);
    room.state = 'LOBBY';
    room.votes = {}; room.results = null; room.words = null; room.activeCategory = room.category; room.scoreDeltas = {};
    room.speakOrder = []; room.currentSpeakerIdx = 0; room.impostorGuess = null;
    room.players.forEach(p => {
      p.isReady = p.isHost;
      delete p.role; delete p.word; delete p.hasRevealed; delete p.voted;
    });
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  // ── resetScores
  socket.on('resetScores', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    room.scores = {}; room.roundNumber = 0;
    io.to(code).emit('roomUpdated', safeRoom(room));
  });


// ── leaveRoom
socket.on('leaveRoom', ({ code, playerToken }) => {
  const normalizedCode = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const room = rooms.get(normalizedCode);
  if (!room) return socket.emit('roomLeft');

  const idx = room.players.findIndex(p => p.id === socket.id || (playerToken && p.playerToken === playerToken));
  if (idx === -1) return socket.emit('roomLeft');

  const leaving = room.players[idx];
  cancelDisconnectRemoval(normalizedCode, leaving.playerToken);
  room.players.splice(idx, 1);
  try { socket.leave(normalizedCode); } catch {}

  if (room.players.length === 0) {
    clearTimer(normalizedCode);
    recentWords.delete(normalizedCode);
    rooms.delete(normalizedCode);
    socket.emit('roomLeft');
    return;
  }

  if (leaving.isHost || !room.players.some(p => p.isHost)) {
    room.players.forEach(p => { p.isHost = false; });
    room.players[0].isHost = true;
    room.players[0].isReady = true;
  }

  room.players.forEach(p => {
    if (p.id === socket.id) return;
    if (room.state === 'LOBBY' && p.isHost) p.isReady = true;
  });

  socket.emit('roomLeft');
  io.to(normalizedCode).emit('roomUpdated', safeRoom(room));
});

  // ── disconnect
  socket.on('disconnect', () => {
    rooms.forEach((room, code) => {
      const player = room.players.find(p => p.id === socket.id);
      if (!player) return;

      player.isConnected = false;
      player.disconnectedAt = Date.now();

      const key = `${code}:${player.playerToken}`;
      cancelDisconnectRemoval(code, player.playerToken);
      const timer = setTimeout(() => {
        const liveRoom = rooms.get(code);
        if (!liveRoom) return;
        const idx = liveRoom.players.findIndex(p => p.playerToken === player.playerToken);
        if (idx === -1) return;
        const removed = liveRoom.players[idx];
        liveRoom.players.splice(idx, 1);
        delete liveRoom.scores[scoreKey(removed)];

        if (liveRoom.players.length === 0) {
          rooms.delete(code); recentWords.delete(code); clearTimer(code);
        } else {
          if (!liveRoom.players.some(p => p.isHost)) liveRoom.players[0].isHost = true;
          io.to(code).emit('roomUpdated', safeRoom(liveRoom));
        }
        disconnectTimers.delete(key);
      }, RECONNECT_GRACE_MS);

      disconnectTimers.set(key, timer);
      io.to(code).emit('roomUpdated', safeRoom(room));
    });
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
httpServer.listen(PORT, '0.0.0.0', () => console.log(`✓ Impostor server on port ${PORT}`));
