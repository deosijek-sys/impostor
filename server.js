import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3000;

const WORDS = {
  "Hrana": [
    ["Pizza","Burek"],["Hamburger","Ćevapi"],["Sushi","Riblji štapići"],
    ["Torta","Palačinke"],["Vafli","Krafna"],["Sladoled","Puding"],
    ["Kava","Čaj"],["Pivo","Vino"],["Sok","Voda"],
    ["Kruh","Lepinja"],["Sir","Slanina"],["Jaje","Kaša"],
    ["Tjestenina","Riža"],["Piletina","Riba"],["Odrezak","Ćufte"],
    ["Salata","Juha"],["Čokolada","Gumene bombone"],["Čips","Pereci"],
    ["Sendvič","Tost"],["Pečena piletina","Ražnjići"],["Naranča","Breskva"],
    ["Jabuka","Banana"],["Mango","Kivi"],["Jagoda","Borovnica"],
    ["Rajčica","Krastavac"],["Mrkva","Kukuruz"],["Luk","Češnjak"],
    ["Tiramisu","Cheesecake"],["Nutella","Džem"],
    ["Popcorn","Kikiriki"],["Smoothie","Matcha"],["Rižoto","Gulaš"],
    ["Pršut","Salama"],["Ajvar","Senf"]
  ],
  "Sport": [
    ["Nogomet","Košarka"],["Tenis","Badminton"],["Plivanje","Atletika"],
    ["Boks","Karate"],["Biciklizam","Rolanje"],
    ["Skijanje","Surfanje"],["Skateboarding","Parkour"],
    ["Odbojka","Rukomet"],["Golf","Kuglanje"],
    ["Gimnastika","Akrobatika"],["Judo","Taekwondo"],
    ["Jedrenje","Kajak"],["Penjanje","Planinarenje"],
    ["Hokej","Curling"],["Maraton","Triatlon"],
    ["Veslanje","Vaterpolo"],["Futsal","Ragbi"],
    ["Joga","Pilates"],["Kickboxing","MMA"],
    ["Streličarstvo","Pikado"],["Stolni tenis","Squash"],
    ["Boćanje","Picigin"],["Ribolov","Lov"]
  ],
  "Životinje": [
    ["Pas","Vuk"],["Mačka","Leopard"],["Lav","Tigar"],
    ["Slon","Nosorog"],["Majmun","Gorila"],["Delfin","Kit"],
    ["Konj","Zebra"],["Krava","Svinja"],["Kokoš","Patka"],
    ["Orao","Sova"],["Papiga","Flamingo"],["Žaba","Gušter"],
    ["Zec","Jež"],["Medvjed","Lisica"],["Pingvin","Tuljan"],
    ["Žirafa","Deva"],["Koala","Klokan"],
    ["Gepard","Puma"],["Krokodil","Zmija"],
    ["Bubamara","Leptir"],["Hobotnica","Morski pas"],
    ["Vjeverica","Jazavac"],["Lama","Alpaka"],
    ["Bizon","Los"],["Morski konjic","Meduza"]
  ],
  "Mjesta": [
    ["Plaža","Bazen"],["Škola","Bolnica"],
    ["Restoran","Knjižnica"],["Kino","Kazalište"],
    ["Tržnica","Muzej"],["Crkva","Stadion"],
    ["Park","Teretana"],["Hotel","Kamp"],
    ["Aerodrop","Luka"],["Galerija","Zoološki vrt"],
    ["Banka","Pošta"],["Frizerski salon","Ljekarna"],
    ["Zagreb","Dubrovnik"],["Split","Osijek"],
    ["Pariz","Tokio"],["London","New York"],
    ["Berlin","Amsterdam"],["Rim","Istanbul"],
    ["Otok","Tvrđava"],["Kanjon","Dolina"],
    ["Zabavni park","Aquapark"],["Tržni centar","Igralište"],
    ["Vatrogasna postaja","Policijska postaja"]
  ],
  "Predmeti": [
    ["Automobil","Bicikl"],["Motor","Romobil"],
    ["Kišobran","Kabanica"],["Torba","Ruksak"],
    ["Novčanik","Ključevi"],["Sat","Kompas"],
    ["Naočale","Kontaktne leće"],["Slušalice","Kamera"],
    ["Olovka","Kemijska"],["Bilježnica","Rokovnik"],
    ["Šešir","Kačket"],["Čizme","Sandale"],
    ["Krevet","Hammock"],["Stol","Polica"],
    ["Stolica","Fotelja"],["Hladnjak","Mikrovalna"],
    ["Tava","Nož"],["Harmonika","Ukulele"],
    ["Truba","Saksofon"],["Videokamera","Teleskop"],
    ["Lopta","Frisbee"],["Karte","Šah"],
    ["Sapun","Dezodorans"],["Metla","Usisavač"],
    ["Baterijska lampa","Sveća"],["Punjač","Produžni kabel"]
  ],
  "Filmovi i serije": [
    ["Titanic","Schindler's List"],["The Godfather","Scarface"],
    ["Inception","The Matrix"],["The Dark Knight","Joker"],
    ["Pulp Fiction","Fight Club"],
    ["Game of Thrones","Peaky Blinders"],
    ["Breaking Bad","The Wire"],
    ["Stranger Things","Black Mirror"],["Friends","The Office"],
    ["Squid Game","Hunger Games"],["Money Heist","Narcos"],
    ["True Detective","Mindhunter"],
    ["1917","Dunkirk"],["Interstellar","Dune"],
    ["Avengers","Star Wars"],["Harry Potter","Narnia"],
    ["Parasite","Oldboy"],["Chernobyl","Sicario"],
    ["Succession","Billions"],["Euphoria","Skins"],
    ["Sherlock","Elementary"],["Wednesday","Coraline"],
    ["Ted Lasso","Abbott Elementary"],
    ["Severance","Dark"],["The Bear","Ramsay's Kitchen Nightmares"],
    ["The Mandalorian","Avatar"],["Cobra Kai","Karate Kid"],
    ["Yellowstone","Outer Range"]
  ],
  "Profesije": [
    ["Liječnik","Vatrogasac"],["Zubar","Frizer"],
    ["Učitelj","Trener"],["Odgajatelj","Psiholog"],
    ["Policajac","Vojnik"],["Kuhar","Konobar"],
    ["Farmer","Šumar"],["Taksist","Pilot"],
    ["Arhitekt","Programer"],["Električar","Vodoinstalater"],
    ["Fotograf","Novinar"],["Glumac","Pjevač"],
    ["Odvjetnik","Sudac"],["Ekonomist","Računovođa"],
    ["Ribar","Lovac"],["Tesar","Stolar"],
    ["Vozač kamiona","Dostavljač"],["Redatelj","Scenarist"],
    ["Prevoditelj","Bibliotekar"],["Socijalni radnik","Pedagog"],
    ["Meteorolog","Geograf"],["Mehaničar","Dizajner"]
  ],
  "Glazba": [
    ["Pop","Rock"],["Metal","Jazz"],["Hip-hop","Blues"],
    ["Klasična glazba","Reggae"],["Elektronika","Folk"],
    ["House","Country"],["Soul","Punk"],
    ["Gitara","Violina"],["Bubnjevi","Klavir"],
    ["Mikrofon","Sintesajzer"],["Koncert","Festival"],
    ["Album","Single"],["Spotify","Vinyl"],
    ["Grammy","MTV nagrade"],["Bend","DJ"],
    ["Balada","Himna"],["Coldplay","Eminem"],
    ["Taylor Swift","Beyoncé"],["Zbor","Rap"]
  ],
  "Svakodnevni život": [
    ["Jutarnja kava","Trening"],["Buđenje","Alarm"],
    ["Tuš","Sauna"],["Pranje zuba","Brijanje"],
    ["Odlazak na posao","Rad od kuće"],["Autom","Pješice"],
    ["Ručak","Večera"],["Šetnja","Meditacija"],
    ["Kupovina","Online narudžba"],["Kuhanje","Naručivanje hrane"],
    ["Pranje posuđa","Usisavanje"],["Gledanje TV-a","Čitanje knjige"],
    ["Telefonski poziv","Poruka"],["Pismo","Razglednica"],
    ["Vikend izlet","Piknik"],["Roštilj","Fondue"],
    ["Posjet prijatelju","Obiteljski ručak"],
    ["Rođendan","Vjenčanje"],["Godišnji odmor","Božić"],
    ["Jutarnja šetnja","Večernji film"],["Uređivanje stana","Vrtlarstvo"]
  ],
  "Priroda": [
    ["Kiša","Snijeg"],["Vjetar","Oluja"],
    ["Sunce","Magla"],["Duga","Munja"],
    ["Poplava","Suša"],["Planina","More"],
    ["Rijeka","Gejzir"],["Jezero","Vulkan"],
    ["Šuma","Livada"],["Savana","Džungla"],
    ["Hrast","Palma"],["Ruža","Kaktus"],
    ["Suncokret","Bambus"],["Gljiva","Mahovina"],
    ["Komarac","Mrav"],["Pauk","Stonoga"],
    ["Litica","Klisura"],["Maslina","Trešnja"]
  ],
  "Tehnologija": [
    ["Mobitel","Pametni sat"],["Laptop","Tablet"],
    ["WiFi","Bluetooth"],["WhatsApp","Signal"],
    ["Instagram","YouTube"],["TikTok","Netflix"],
    ["Google","Bing"],["Chrome","Firefox"],
    ["iPhone","Android"],["Windows","MacOS"],
    ["USB","SD kartica"],["Printer","Skener"],
    ["Tipkovnica","Touchscreen"],["Monitor","Projektor"],
    ["PlayStation","Xbox"],["Nintendo Switch","PC gaming"],
    ["Cloud","Vanjski disk"],["Lozinka","PIN"],
    ["QR kod","Barcode"],["Robot","Dron"],
    ["AI asistent","VR naočale"],["Powerbank","Router"]
  ]
};

const recentWords = new Map();
const disconnectTimers = new Map();
const RECONNECT_GRACE_MS = 90_000;

function scoreKey(player) { return player?.playerToken || player?.id; }
function makePlayerToken() { return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }

function cancelDisconnectRemoval(code, playerToken) {
  const key = `${code}:${playerToken}`;
  const t = disconnectTimers.get(key);
  if (t) { clearTimeout(t); disconnectTimers.delete(key); }
}

function getRandomWord(category, roomCode) {
  const list = WORDS[category] || WORDS["Hrana"];
  if (!recentWords.has(roomCode)) recentWords.set(roomCode, []);
  const recent = recentWords.get(roomCode);
  const pool = list.map((_, i) => i).filter(i => !recent.includes(i));
  const available = pool.length > 0 ? pool : list.map((_, i) => i);
  const idx = available[Math.floor(Math.random() * available.length)];
  recent.push(idx);
  if (recent.length > 15) recent.shift();
  const pair = list[idx];
  return Math.random() > 0.5
    ? { citizen: pair[0], impostor: pair[1] }
    : { citizen: pair[1], impostor: pair[0] };
}

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

function safeRoom(room) {
  return {
    ...room,
    fairPlay: !!room.fairPlay,
    hasCustomPair: !!room.customPair,
    customPair: undefined, // never expose words to client via safeRoom
    words: undefined,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isReady: p.isReady,
      hasRevealed: !!p.hasRevealed,
      voted: !!p.voted,
      isConnected: p.isConnected !== false,
      score: room.scores?.[scoreKey(p)] || 0,
      playerToken: p.playerToken,
      isSpectator: p.role === 'SPECTATOR'
    }))
  };
}

io.on('connection', (socket) => {
  socket.on('rtc-offer',   ({ to, offer })     => io.to(to).emit('rtc-offer',   { from: socket.id, offer }));
  socket.on('rtc-answer',  ({ to, answer })    => io.to(to).emit('rtc-answer',  { from: socket.id, answer }));
  socket.on('rtc-ice',     ({ to, candidate }) => io.to(to).emit('rtc-ice',     { from: socket.id, candidate }));
  // Signal to all room members that this peer has mic ready — triggers peer re-linking
  socket.on('peer-mic-ready', ({ code }) => {
    const room = rooms.get((code||'').toUpperCase());
    if (!room) return;
    socket.to(room.code).emit('peer-mic-ready', { from: socket.id });
  });

  socket.on('createRoom', ({ playerName }) => {
    const code = generateCode();
    const token = makePlayerToken();
    const room = {
      code, state: 'LOBBY',
      category: 'Hrana', impostorCount: 1,
      discussionTime: 120, votingTime: 60,
      words: null, votes: {}, results: null,
      scores: {}, roundNumber: 0,
      speakOrder: [], currentSpeakerIdx: 0,
      players: [{ id: socket.id, name: playerName, isHost: true, isReady: true, playerToken: token, isConnected: true }]
    };
    room.scores[token] = 0;
    rooms.set(code, room);
    socket.join(code);
    socket.emit('roomCreated', { ...safeRoom(room), playerToken: token });
  });

  socket.on('joinRoom', ({ code, playerName, playerToken }) => {
    const roomCode = (code || '').toUpperCase();
    const room = rooms.get(roomCode);
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (room.state !== 'LOBBY') return socket.emit('error', 'Igra je već počela.');

    // Try to resume by token
    if (playerToken) {
      const existing = room.players.find(p => p.playerToken === playerToken);
      if (existing) {
        cancelDisconnectRemoval(roomCode, existing.playerToken);
        existing.id = socket.id;
        if (playerName) existing.name = playerName;
        existing.isConnected = true;
        socket.join(roomCode);
        socket.emit('sessionResumed', buildPlayerPayload(room, existing));
        io.to(roomCode).emit('roomUpdated', safeRoom(room));
        return;
      }
    }

    if (room.players.length >= 10) return socket.emit('error', 'Soba je puna (max 10).');
    const nameTaken = room.players.find(p =>
      p.name.toLowerCase() === (playerName||'').toLowerCase() &&
      p.isConnected !== false &&
      p.id !== socket.id
    );
    if (nameTaken) return socket.emit('error', 'To ime je već zauzeto.');

    const token = playerToken || makePlayerToken();
    room.players.push({ id: socket.id, name: playerName, isHost: false, isReady: false, playerToken: token, isConnected: true });
    room.scores[token] = room.scores[token] || 0;
    socket.join(roomCode);
    socket.emit('roomJoined', { ...safeRoom(room), playerToken: token });
    io.to(roomCode).emit('roomUpdated', safeRoom(room));
  });

  socket.on('resumeSession', ({ code, playerToken, playerName }) => {
    const roomCode = (code || '').toUpperCase();
    const room = rooms.get(roomCode);
    if (!room || !playerToken) return socket.emit('resumeFailed');
    const player = room.players.find(p => p.playerToken === playerToken);
    if (!player) return socket.emit('resumeFailed');
    cancelDisconnectRemoval(roomCode, player.playerToken);
    player.id = socket.id;
    if (playerName) player.name = playerName;
    player.isConnected = true;
    socket.join(roomCode);
    socket.emit('sessionResumed', buildPlayerPayload(room, player));
    io.to(roomCode).emit('roomUpdated', safeRoom(room));
  });

  socket.on('updateConfig', ({ code, category, impostors, discussionTime, votingTime, customPair, fairPlay }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || room.state !== 'LOBBY' || !room.players.find(p => p.id === socket.id && p.isHost)) return;

    if (customPair === null) {
      room.customPair = null;
      room.fairPlay = false;
      if (room.category === '\u270f\ufe0f Custom') room.category = 'Hrana';
    } else if (customPair && customPair.citizen && customPair.impostor) {
      const c = customPair.citizen.trim().slice(0, 40);
      const i = customPair.impostor.trim().slice(0, 40);
      if (c && i && c.toLowerCase() !== i.toLowerCase()) {
        room.customPair = { citizen: c, impostor: i };
        room.category = '\u270f\ufe0f Custom';
        room.fairPlay = true;
      }
    } else {
      if (!room.customPair) {
        if (WORDS[category]) room.category = category;
        room.fairPlay = !!fairPlay;
      }
    }

    room.impostorCount = Math.max(1, Math.min(3, parseInt(impostors) || 1));
    if (discussionTime) room.discussionTime = Math.max(30, Math.min(300, parseInt(discussionTime)));
    if (votingTime) room.votingTime = Math.max(20, Math.min(120, parseInt(votingTime)));
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('toggleReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (p && !p.isHost) { p.isReady = !p.isReady; io.to(code).emit('roomUpdated', safeRoom(room)); }
  });

  socket.on('kickPlayer', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.state !== 'LOBBY') return;
    const idx = room.players.findIndex(p => p.id === targetId);
    if (idx === -1) return;
    const kicked = room.players[idx];
    room.players.splice(idx, 1);
    delete room.scores[scoreKey(kicked)];
    io.to(targetId).emit('kicked', { reason: 'Host te uklonio iz sobe.' });
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('kickPlayerMidGame', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.state !== 'DISCUSSION' && room.state !== 'VOTING') return;
    const idx = room.players.findIndex(p => p.id === targetId);
    if (idx === -1) return;
    const kicked = room.players[idx];
    const kickedName = kicked.name;
    room.players.splice(idx, 1);
    delete room.scores[scoreKey(kicked)];
    io.to(code).emit('playerKickedMidGame', { kickedId: targetId, kickedName });
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('transferHost', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.state !== 'LOBBY') return;
    room.players.forEach(p => { p.isHost = p.id === targetId; if (p.isHost) p.isReady = true; });
    io.to(code).emit('roomUpdated', safeRoom(room));
    io.to(targetId).emit('becameHost');
  });

  socket.on('extendDiscussion', ({ code, seconds }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'DISCUSSION') return;
    if (!room.players.find(p => p.id === socket.id && p.isHost)) return;
    const add = Math.min(60, Math.max(10, parseInt(seconds) || 30));
    io.to(code).emit('timerExtended', { phase: 'discussion', added: add });
    clearTimer(code);
    startTimer(code, add,
      t => io.to(code).emit('timer', { phase: 'discussion', remaining: t }),
      () => { if (rooms.get(code)?.state === 'DISCUSSION') startVotingPhase(code); }
    );
  });

  socket.on('leaveRoom', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;
    const leaving = room.players[idx];
    room.players.splice(idx, 1);
    delete room.scores[scoreKey(leaving)];
    socket.leave(code);
    socket.emit('leftRoom');
    if (room.players.length === 0) {
      rooms.delete(code); recentWords.delete(code); clearTimer(code);
    } else {
      if (!room.players.some(p => p.isHost)) room.players[0].isHost = true;
      io.to(code).emit('roomUpdated', safeRoom(room));
    }
  });

  socket.on('startGame', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (!room.players.find(p => p.id === socket.id && p.isHost))
      return socket.emit('error', 'Samo host može pokrenuti igru.');
    if (room.players.length < 3)
      return socket.emit('error', 'Potrebno je minimalno 3 igrača.');

    room.roundNumber++;

    // Use custom pair if set, otherwise pick from category
    if (room.customPair) {
      room.words = Math.random() > 0.5
        ? { citizen: room.customPair.citizen, impostor: room.customPair.impostor }
        : { citizen: room.customPair.impostor, impostor: room.customPair.citizen };
    } else {
      room.words = getRandomWord(room.category, code);
    }

    room.state = 'REVEAL';
    room.votes = {};
    room.impostorGuess = null;

    room.players.forEach(p => { const key = scoreKey(p); if (room.scores[key] === undefined) room.scores[key] = 0; });

    // Fair play: host is spectator — excluded from impostor assignment and word reveal
    const fairPlay = !!room.fairPlay;
    const activePlayers = fairPlay
      ? room.players.filter(p => !p.isHost)
      : room.players;

    const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
    const impCount = Math.min(room.impostorCount, Math.floor(activePlayers.length / 2));
    const impIds = new Set(shuffled.slice(0, impCount).map(p => p.id));

    room.players.forEach(p => {
      if (fairPlay && p.isHost) {
        p.role = 'SPECTATOR';
        p.word = null;
      } else {
        p.role = impIds.has(p.id) ? 'IMPOSTOR' : 'CITIZEN';
        p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
      }
      p.hasRevealed = false;
      p.voted = false;
    });

    room.speakOrder = [...activePlayers].sort(() => Math.random() - 0.5).map(p => p.id);
    room.currentSpeakerIdx = 0;

    const base = safeRoom(room);
    room.players.forEach(p => {
      if (p.role === 'SPECTATOR') {
        io.to(p.id).emit('gameStarted', { ...base, myWord: null, myRole: 'SPECTATOR', fairPlay: true, words: room.words });
      } else {
        io.to(p.id).emit('gameStarted', { ...base, myWord: p.word, myRole: p.role, fairPlay });
      }
    });
  });

  socket.on('playerReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'REVEAL') return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p || p.hasRevealed) return; // prevent double-fire
    if (p.role === 'SPECTATOR') { p.hasRevealed = true; } // spectator auto-confirms
    else { p.hasRevealed = true; }
    const activePlayers = room.fairPlay ? room.players.filter(pl => !pl.isHost) : room.players;
    const readyCount = activePlayers.filter(p => p.hasRevealed).length;
    io.to(code).emit('revealProgress', { readyCount, total: activePlayers.length });
    if (readyCount === activePlayers.length) {
      room.state = 'DISCUSSION';
      const firstSpeakerId = room.speakOrder[0];
      const firstSpeaker = room.players.find(p => p.id === firstSpeakerId);
      io.to(code).emit('startDiscussion', { ...safeRoom(room), firstSpeakerName: firstSpeaker?.name || '' });
      startTimer(code, room.discussionTime,
        t => io.to(code).emit('timer', { phase: 'discussion', remaining: t }),
        () => { if (rooms.get(code)?.state === 'DISCUSSION') startVotingPhase(code); }
      );
    }
  });

  socket.on('rerollWord', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'REVEAL') return;
    if (!room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.customPair) {
      room.words = Math.random() > 0.5
        ? { citizen: room.customPair.citizen, impostor: room.customPair.impostor }
        : { citizen: room.customPair.impostor, impostor: room.customPair.citizen };
    } else {
      room.words = getRandomWord(room.category, code);
    }
    room.players.forEach(p => { p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen; p.hasRevealed = false; });
    const base = safeRoom(room);
    room.players.forEach(p => { io.to(p.id).emit('wordRerolled', { ...base, myWord: p.word, myRole: p.role }); });
  });

  socket.on('startVoting', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.state !== 'DISCUSSION') return;
    startVotingPhase(code);
  });

  function startVotingPhase(code) {
    const room = rooms.get(code);
    if (!room || room.state === 'VOTING' || room.state === 'RESULTS') return;
    clearTimer(code);
    room.state = 'VOTING';
    room.votes = {};
    room.players.forEach(p => { p.voted = false; });
    io.to(code).emit('votingStarted', safeRoom(room));
    startTimer(code, room.votingTime,
      t => io.to(code).emit('timer', { phase: 'voting', remaining: t }),
      () => { if (rooms.get(code)?.state === 'VOTING') finalizeVotes(code); }
    );
  }

  socket.on('castVote', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'VOTING') return;
    const voter = room.players.find(p => p.id === socket.id);
    if (!voter || voter.voted) return; // already voted
    if (targetId === socket.id) return; // can't vote self
    if (!room.players.find(p => p.id === targetId)) return; // target must exist
    room.votes[socket.id] = targetId;
    voter.voted = true;
    const total = Object.keys(room.votes).length;
    const max = room.players.length;
    io.to(code).emit('voteCast', { total, max });
    io.to(code).emit('roomUpdated', safeRoom(room));
    // All players voted → finalize immediately
    if (total >= max) {
      finalizeVotes(code);
    }
  });

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
        winner: 'IMPOSTORS', reason: 'guess', impostorGuessedCorrectly: true,
        guesserToken: scoreKey(p),
        isTie: false, votedOutId: null, votedOutName: null, isImpostor: false,
        impostors: room.players.filter(p => p.role === 'IMPOSTOR').map(p => p.name),
        tally: {}
      };
      calcScores(room);
      const gr1 = buildResults(room);
      room.players.forEach(p => io.to(p.id).emit('gameEnded', { ...gr1, myWord: p.word || null, myRole: p.role || null }));
    } else {
      socket.emit('impostorGuessFailed', { guess });
    }
  });

  function finalizeVotes(code) {
    const room = rooms.get(code);
    if (!room || room.state !== 'VOTING') return; // guard double-fire
    clearTimer(code);
    room.state = 'RESULTS';

    const tally = {};
    Object.values(room.votes).forEach(id => { tally[id] = (tally[id] || 0) + 1; });

    let maxV = 0, votedOutId = null;
    for (const [id, cnt] of Object.entries(tally)) {
      if (cnt > maxV) { maxV = cnt; votedOutId = id; }
    }
    const tied = Object.entries(tally).filter(([, c]) => c === maxV).length > 1
      || Object.keys(tally).length === 0; // no votes = tie
    const votedOut = (!tied && votedOutId) ? room.players.find(p => p.id === votedOutId) : null;
    const isImp = !tied && votedOut?.role === 'IMPOSTOR';

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
    const gr2 = buildResults(room);
    room.players.forEach(p => io.to(p.id).emit('gameEnded', { ...gr2, myWord: p.word || null, myRole: p.role || null }));
  }

  function calcScores(room) {
    room.scoreDeltas = {};
    room.players.forEach(p => { room.scoreDeltas[scoreKey(p)] = 0; });

    if (room.results.winner === 'CITIZENS') {
      room.players.forEach(p => {
        const key = scoreKey(p);
        if (p.role === 'CITIZEN') {
          const votedForId = room.votes[p.id];
          const votedPlayer = votedForId ? room.players.find(x => x.id === votedForId) : null;
          const correct = votedPlayer?.role === 'IMPOSTOR';
          const delta = correct ? 2 : 0;
          room.scores[key] = (room.scores[key] || 0) + delta;
          room.scoreDeltas[key] = delta;
        }
      });
    } else if (room.results.impostorGuessedCorrectly) {
      const guesserToken = room.results.guesserToken;
      room.players.forEach(p => {
        const key = scoreKey(p);
        if (p.role === 'IMPOSTOR') {
          const delta = key === guesserToken ? 4 : 2;
          room.scores[key] = (room.scores[key] || 0) + delta;
          room.scoreDeltas[key] = delta;
        }
      });
    } else {
      room.players.forEach(p => {
        const key = scoreKey(p);
        if (p.role === 'IMPOSTOR') {
          const delta = 3;
          room.scores[key] = (room.scores[key] || 0) + delta;
          room.scoreDeltas[key] = delta;
        }
      });
    }
  }

  function buildPlayerPayload(room, player) {
    const base = { ...safeRoom(room), playerToken: player.playerToken, myWord: player.word || null, myRole: player.role || null };
    if (room.state === 'RESULTS') {
      base.results = room.results;
      base.words = room.words;
      base.votes = room.votes;
      base.scores = room.scores;
      base.scoreDeltas = room.scoreDeltas || {};
      base.players = room.players.map(p => ({
        id: p.id, name: p.name, playerToken: p.playerToken,
        isHost: p.isHost, role: p.role, word: p.word,
        hasRevealed: p.hasRevealed, voted: p.voted,
        isConnected: p.isConnected !== false,
        score: room.scores?.[scoreKey(p)] || 0
      }));
    }
    return base;
  }

  function buildResults(room) {
    return {
      ...safeRoom(room),
      results: room.results,
      words: room.words,
      votes: room.votes,
      scores: room.scores,
      scoreDeltas: room.scoreDeltas || {},
      players: room.players.map(p => ({
        id: p.id, name: p.name, playerToken: p.playerToken,
        isHost: p.isHost, role: p.role, word: p.word,
        hasRevealed: p.hasRevealed, voted: p.voted,
        isConnected: p.isConnected !== false,
        score: room.scores?.[scoreKey(p)] || 0
      }))
    };
  }

  socket.on('playAgain', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    clearTimer(code);
    room.state = 'LOBBY'; room.votes = {}; room.results = null; room.words = null; room.scoreDeltas = {};
    room.speakOrder = []; room.currentSpeakerIdx = 0; room.impostorGuess = null;
    room.players.forEach(p => { p.isReady = p.isHost; delete p.role; delete p.word; delete p.hasRevealed; delete p.voted; });
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('resetScores', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    room.scores = {}; room.roundNumber = 0;
    room.players.forEach(p => { room.scores[scoreKey(p)] = 0; });
    io.to(code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('nextSpeaker', ({ code }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'DISCUSSION') return;
    if (!room.players.find(p => p.id === socket.id && p.isHost)) return;
    room.currentSpeakerIdx = (room.currentSpeakerIdx + 1) % room.speakOrder.length;
    const nextId = room.speakOrder[room.currentSpeakerIdx];
    const next = room.players.find(p => p.id === nextId);
    io.to(code).emit('speakerChanged', { name: next?.name || '', id: nextId });
  });

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
