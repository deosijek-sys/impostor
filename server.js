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
// Pravilo: citizen i impostor moraju biti prepoznatljive, svakodnevne riječi
// ali DOVOLJNO različite da igra ima smisla (ne previše slične!)
const WORDS = {
  "Hrana": [
    ["Pizza","Burek"],["Hamburger","Ćevapi"],["Sushi","Riblji štapići"],
    ["Torta","Kolač"],["Palačinke","Vafli"],["Sladoled","Jogurt"],
    ["Kava","Čaj"],["Pivo","Vino"],["Sok","Limunade"],
    ["Kruh","Lepinja"],["Sir","Maslac"],["Jaje","Slanina"],
    ["Tjestenina","Riža"],["Piletina","Puretina"],["Riba","Lignje"],
    ["Salata","Juha"],["Čokolada","Bombon"],["Grickalice","Čips"],
    ["Sendvič","Wrap"],["Roštilj","Štrudle"],["Naranča","Limun"],
    ["Jabuka","Kruška"],["Banana","Mango"],["Jagoda","Malina"],
    ["Rajčica","Paprika"],["Krumpir","Mrkva"],["Luk","Češnjak"],
    ["Pizza Margherita","Calzone"],["Lazanje","Ćufte"],
    ["Cheesecake","Tiramisu"],["Krafna","Burek sa sirom"],
    ["Čokoladno mlijeko","Kakao"],["Ketchup","Majonezu"],
    ["Nutella","Džem"],["Popcorn","Kokice s maslacem"],
    ["Cornflakes","Müsli"],["Smoothie","Milkshake"]
  ],
  "Sport": [
    ["Nogomet","Ragbi"],["Košarka","Vaterpolo"],["Tenis","Squash"],
    ["Plivanje","Ronjenje"],["Boks","Karate"],["Trčanje","Hodanje"],
    ["Skijanje","Snowboard"],["Biciklizam","Rolanje"],
    ["Odbojka","Badminton"],["Golf","Kuglanje"],
    ["Gimnastika","Ples"],["Judo","Hrvanje"],
    ["Surfanje","Jedrenje"],["Penjanje","Planinarenje"],
    ["Streljaštvo","Pikado"],["Hokej","Curling"],
    ["Maraton","Triatlоn"],["Veslanje","Kajak"],
    ["Boćanje","Picigin"],["Američki nogomet","Kriket"],
    ["Baseball","Softball"],["Rukomet","Futsal"],
    ["Paragliding","Zmajarenje"],["CrossFit","Aerobik"],
    ["Joga","Pilates"],["Kickboxing","MMA"]
  ],
  "Životinje": [
    ["Pas","Vuk"],["Mačka","Tigar"],["Lav","Leopard"],
    ["Slon","Nosorog"],["Majmun","Gorila"],["Delfin","Kit"],
    ["Konj","Zebra"],["Krava","Bik"],["Svinja","Divlja svinja"],
    ["Kokoš","Fazan"],["Riba","Jegulja"],["Žaba","Kameleon"],
    ["Orao","Sokol"],["Sova","Papiga"],["Patka","Labud"],
    ["Zec","Vjeverica"],["Medvjed","Vuk"],["Lisica","Kojot"],
    ["Pingvin","Tuljap"],["Flamingo","Rode"],
    ["Žirafa","Okapi"],["Zebra","Magarac"],
    ["Koala","Klokam"],["Gepard","Puma"],
    ["Krokodil","Gušter"],["Zmija","Gušter"],
    ["Pčela","Osa"],["Leptir","Moljac"],
    ["Hobotnica","Lignja"],["Morski pas","Raža"]
  ],
  "Mjesta": [
    ["Plaža","Bazen"],["Škola","Fakultet"],["Bolnica","Klinika"],
    ["Restoran","Kafić"],["Kino","Kazalište"],["Tržnica","Supermarket"],
    ["Crkva","Džamija"],["Park","Šuma"],["Hotel","Hostel"],
    ["Aerodrom","Kolodvor"],["Muzej","Galerija"],["Stadion","Dvorana"],
    ["Teretana","Bazen"],["Knjižnica","Arhiv"],
    ["Ljekarma","Ordinacija"],["Banka","Pošta"],
    ["Frizerski salon","Kozmetički salon"],["Frizerski salon","Brijačnica"],
    ["Zagreb","Split"],["Dubrovnik","Šibenik"],["Rijeka","Osijek"],
    ["Rim","Atena"],["Pariz","Madrid"],["London","Dublin"],
    ["New York","Chicago"],["Tokio","Seoul"],["Dubai","Katar"],
    ["Planina","Brdo"],["Jezero","Rijeka"],["Otok","Poluotok"],
    ["Pustinja","Stepa"],["Špilja","Kanjon"],
    ["Tvrđava","Dvorac"],["Ruševine","Muzej na otvorenom"]
  ],
  "Predmeti": [
    ["Mobitel","Tablet"],["Laptop","Računalo"],["Televizor","Monitor"],
    ["Automobil","Kombi"],["Bicikl","Romobil"],["Motor","Moped"],
    ["Kišobran","Kabanica"],["Torba","Ruksak"],["Novčanik","Torbica"],
    ["Sat","Budilnik"],["Naočale","Leće"],["Slušalice","Zvučnik"],
    ["Knjiga","Časopis"],["Olovka","Kemijska"],["Bilježnica","Rokovnik"],
    ["Šešir","Kačket"],["Čizme","Tenisice"],["Sandale","Papuče"],
    ["Krevet","Kauč"],["Stol","Pult"],["Stolica","Fotelja"],
    ["Hladnjak","Zamrzivač"],["Perilica","Sušilica"],
    ["Tava","Lonac"],["Nož","Škare"],["Vilica","Žlica"],
    ["Gitara","Ukulele"],["Klavir","Sintesajzer"],["Bubnjevi","Marimba"],
    ["Kamera","Videokamera"],["Dron","RC auto"],
    ["Šator","Vreća za spavanje"],["Kompas","GPS"],
    ["Lopta","Frisbee"],["Karte","Šah"]
  ],
  "Filmovi i serije": [
    ["Titanic","Pearl Harbor"],["The Godfather","Scarface"],
    ["Inception","The Matrix"],["The Dark Knight","Batman"],
    ["Pulp Fiction","Reservoir Dogs"],
    ["Game of Thrones","House of the Dragon"],
    ["Breaking Bad","Better Call Saul"],
    ["Stranger Things","Dark"],["Friends","Seinfeld"],
    ["The Office","Parks and Recreation"],
    ["Squid Game","Hunger Games"],["Money Heist","Lupin"],
    ["Peaky Blinders","Boardwalk Empire"],
    ["True Detective","Mindhunter"],
    ["The Witcher","Shadow and Bone"],
    ["Narcos","Sicario"],["1917","Dunkirk"],
    ["Interstellar","Gravity"],["Dune","Avatar"],
    ["Avengers","Justice League"],["Spider-Man","Batman"],
    ["Harry Potter","Narnia"],["Star Wars","Star Trek"],
    ["Parasite","Oldboy"],["La La Land","Whiplash"],
    ["Chernobyl","The Terror"],["Succession","Billions"],
    ["Euphoria","Skins"],["Midsommar","Hereditary"],
    ["The Crown","The Queen's Gambit"],
    ["Grey's Anatomy","ER"],["House","Scrubs"],
    ["Sherlock","Elementary"],["The Wire","The Shield"]
  ],
  "Profesije": [
    ["Liječnik","Medicinska sestra"],["Zubар","Ortodont"],
    ["Učitelj","Profesor"],["Odgajatelj","Babysitter"],
    ["Policajac","Vatrogasac"],["Vojnik","Čuvar"],
    ["Kuhar","Konobar"],["Pčelar","Farmer"],
    ["Taksist","Vozač autobusa"],["Pilot","Stjuard"],
    ["Arhitekt","Graditelj"],["Elektrčar","Vodoinstalater"],
    ["Programer","Dizajner"],["Fotograf","Snimatelj"],
    ["Glumac","Pjevač"],["Plesač","Akrobat"],
    ["Novinar","Urednik"],["Pisac","Prevodilac"],
    ["Odvjetnik","Sudac"],["Notar","Javni bilježnik"],
    ["Frizer","Kozmetičar"],["Masažer","Fizioterapeut"],
    ["Psiholog","Psihijatar"],["Nutricionist","Dijetetičar"],
    ["Astronom","Astrofizičar"],["Biolog","Kemičar"],
    ["Ekonomist","Računovođa"],["Bankar","Broker"],
    ["Farmer","Šumar"],["Lovac","Ribar"],
    ["Tesar","Stolar"],["Zidar","Moler"]
  ],
  "Glazba": [
    ["Pop","Indie"],["Rock","Metal"],["Hip-hop","Rap"],
    ["Jazz","Blues"],["Klasična glazba","Opera"],
    ["Elektronika","Techno"],["House","Trance"],
    ["Reggae","Ska"],["Folk","Country"],["Soul","R&B"],
    ["Punk","Grunge"],["Funk","Disco"],
    ["Gitara","Bas gitara"],["Bubnjevi","Perkusija"],
    ["Klavir","Sintesajzer"],["Violina","Viola"],
    ["Truba","Trombon"],["Saksofon","Klarinet"],
    ["Mikrofon","Zvučnik"],["Slušalice","In-ear"],
    ["Koncer","Festival"],["Turne","Rezidencija"],
    ["Album","EP"],["Single","Mixtape"],
    ["Spotify","Apple Music"],["Vinyl","CD"],
    ["Grammy","MTV nagrade"],["Glastonbury","Coachella"]
  ],
  "Svakodnevni život": [
    ["Jutarnja kava","Doručak"],["Buđenje","Alarm"],
    ["Tuš","Kupanje"],["Pranje zuba","Brijanje"],
    ["Odlazak na posao","Home office"],["Autom na posao","Pješice"],
    ["Ručak","Snack"],["Popodnevni odmor","Spavanje"],
    ["Šetnja","Trčanje"],["Kupovina","Online narudžba"],
    ["Kuhanje","Naručivanje hrane"],["Pranje posuđa","Perilica"],
    ["Usisavanje","Brisanje prašine"],["Peglanje","Pranje rublja"],
    ["Gledanje TV-a","Streaming"],["Čitanje knjige","Audiobook"],
    ["Igranje igara","Crossword"],["Vrtlarenje","Balkon uređenje"],
    ["Telefonski poziv","Video poziv"],["Poruka","Email"],
    ["Vikend izlet","Dan na plaži"],["Piknik","BBQ"],
    ["Posjet prijatelju","Obiteljski ručak"],["Kino večer","Netflix večer"],
    ["Rodjendan","Proslava"],["Vjenčanje","Krštenje"],
    ["Godišnji odmor","Produženi vikend"],["Putovanje autom","Let avionom"]
  ],
  "Priroda": [
    ["Kiša","Tuča"],["Snijeg","Led"],["Vjetar","Oluja"],
    ["Sunce","Oblaci"],["Duga","Munja"],["Magla","Izmaglica"],
    ["Poplave","Suša"],["Potres","Klizište"],
    ["Planina","Brežuljak"],["Rijeka","Potok"],
    ["Jezero","Bara"],["More","Zaljev"],
    ["Šuma","Džungla"],["Livada","Polje"],
    ["Pustuinja","Savana"],["Arktik","Antarktika"],
    ["Vulkan","Gejzir"],["Spilja","Klisura"],
    ["Hrast","Bor"],["Palma","Bambus"],
    ["Ruža","Lala"],["Suncokret","Lavanda"],
    ["Gljiva","Mahovina"],["Paprat","Alga"],
    ["Zlatna ribica","Koi"],["Losos","Pastrva"],
    ["Komarac","Muha"],["Bubamara","Leptir"],
    ["Mravi","Pčele"],["Paukova mreža","Košnica"]
  ],
  "Tehnologija": [
    ["Mobitel","Pametni sat"],["Laptop","Tablet"],
    ["WiFi","Bluetooth"],["Internet","Intranet"],
    ["Email","SMS"],["WhatsApp","Telegram"],
    ["Instagram","TikTok"],["YouTube","Netflix"],
    ["Google","Bing"],["Chrome","Firefox"],
    ["iPhone","Android"],["Windows","MacOS"],
    ["USB","Bluetooth"],["Punjač","Power bank"],
    ["Printer","Skener"],["Miš","Trackpad"],
    ["Tipkovnica","Numpad"],["Monitor","Projektor"],
    ["Kamera","Webcam"],["Mikrofon","Zvučnik"],
    ["PlayStation","Xbox"],["Nintendo","PC gaming"],
    ["Streaming","Download"],["Cloud","Hard disk"],
    ["Lozinka","PIN"],["Fingerprint","Face ID"],
    ["QR kod","Barcode"],["NFC","Bluetooth"],
    ["Robot","Dron"],["AI asistent","Chatbot"],
    ["3D printer","CNC stroj"],["VR naočale","AR naočale"]
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
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isReady: p.isReady,
      hasRevealed: !!p.hasRevealed,
      voted: !!p.voted,
      isConnected: p.isConnected !== false,
      score: room.scores?.[scoreKey(p)] || 0,
      playerToken: p.playerToken
    }))
  };
}

io.on('connection', (socket) => {
  socket.on('rtc-offer',   ({ to, offer })     => io.to(to).emit('rtc-offer',   { from: socket.id, offer }));
  socket.on('rtc-answer',  ({ to, answer })    => io.to(to).emit('rtc-answer',  { from: socket.id, answer }));
  socket.on('rtc-ice',     ({ to, candidate }) => io.to(to).emit('rtc-ice',     { from: socket.id, candidate }));

  socket.on('createRoom', ({ playerName }) => {
    const code = generateCode();
    const room = {
      code, state: 'LOBBY',
      category: 'Hrana', impostorCount: 1,
      discussionTime: 120, votingTime: 60,
      words: null, votes: {}, results: null,
      scores: {}, roundNumber: 0,
      speakOrder: [], currentSpeakerIdx: 0,
      players: [{ id: socket.id, name: playerName, isHost: true, isReady: true, playerToken: makePlayerToken(), isConnected: true }]
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('roomCreated', { ...safeRoom(room), playerToken: room.players[0].playerToken });
  });

  socket.on('joinRoom', ({ code, playerName, playerToken }) => {
    const room = rooms.get(code.toUpperCase());
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (room.state !== 'LOBBY') return socket.emit('error', 'Igra je već počela.');

    const existingByToken = playerToken ? room.players.find(p => p.playerToken === playerToken) : null;
    if (existingByToken) {
      cancelDisconnectRemoval(code.toUpperCase(), existingByToken.playerToken);
      existingByToken.id = socket.id;
      existingByToken.name = playerName || existingByToken.name;
      existingByToken.isConnected = true;
      socket.join(code.toUpperCase());
      socket.emit('sessionResumed', buildPlayerPayload(room, existingByToken));
      io.to(code.toUpperCase()).emit('roomUpdated', safeRoom(room));
      return;
    }

    if (room.players.length >= 10) return socket.emit('error', 'Soba je puna (max 10).');
    if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase()))
      return socket.emit('error', 'To ime je već zauzeto.');

    const token = playerToken || makePlayerToken();
    room.players.push({ id: socket.id, name: playerName, isHost: false, isReady: false, playerToken: token, isConnected: true });
    socket.join(code.toUpperCase());
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
    socket.join(room.code);
    socket.emit('sessionResumed', buildPlayerPayload(room, player));
    io.to(room.code).emit('roomUpdated', safeRoom(room));
  });

  socket.on('updateConfig', ({ code, category, impostors, discussionTime, votingTime }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || room.state !== 'LOBBY' || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (WORDS[category]) room.category = category;
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

  // ── HOST CONTROLS ──────────────────────────────────────────────────────────
  // Host može kickati igrača iz lobbyja
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

  // Host može prenijeti host ulogu
  socket.on('transferHost', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (room.state !== 'LOBBY') return;
    room.players.forEach(p => { p.isHost = p.id === targetId; if (p.isHost) p.isReady = true; });
    io.to(code).emit('roomUpdated', safeRoom(room));
    io.to(targetId).emit('becameHost');
  });

  // Host može produžiti timer tokom rasprave
  socket.on('extendDiscussion', ({ code, seconds }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'DISCUSSION') return;
    if (!room.players.find(p => p.id === socket.id && p.isHost)) return;
    const add = Math.min(60, Math.max(10, parseInt(seconds) || 30));
    // Restart timer with extended time by clearing and re-emitting
    io.to(code).emit('timerExtended', { phase: 'discussion', added: add });
    clearTimer(code);
    startTimer(code, add,
      t => io.to(code).emit('timer', { phase: 'discussion', remaining: t }),
      () => { if (rooms.get(code)?.state === 'DISCUSSION') startVotingPhase(code); }
    );
  });

  // Igrač napušta sobu
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
    room.words = getRandomWord(room.category, code);
    room.state = 'REVEAL';
    room.votes = {};
    room.impostorGuess = null;

    room.players.forEach(p => { const key = scoreKey(p); if (room.scores[key] === undefined) room.scores[key] = 0; });

    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const impIds = new Set(shuffled.slice(0, room.impostorCount).map(p => p.id));
    room.players.forEach(p => {
      p.role = impIds.has(p.id) ? 'IMPOSTOR' : 'CITIZEN';
      p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
      p.hasRevealed = false;
      p.voted = false;
    });

    room.speakOrder = [...room.players].sort(() => Math.random() - 0.5).map(p => p.id);
    room.currentSpeakerIdx = 0;

    const base = safeRoom(room);
    room.players.forEach(p => {
      io.to(p.id).emit('gameStarted', { ...base, myWord: p.word, myRole: p.role });
    });
  });

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
    room.words = getRandomWord(room.category, code);
    room.players.forEach(p => { p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen; p.hasRevealed = false; });
    const base = safeRoom(room);
    room.players.forEach(p => { io.to(p.id).emit('wordRerolled', { ...base, myWord: p.word, myRole: p.role }); });
  });

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

  socket.on('castVote', ({ code, targetId }) => {
    const room = rooms.get(code);
    if (!room || room.state !== 'VOTING' || room.votes[socket.id]) return;
    // Ne dopusti glasanje za sebe
    if (targetId === socket.id) return;
    // Ne dopusti glasanje za igrača koji nije u sobi
    if (!room.players.find(p => p.id === targetId)) return;
    room.votes[socket.id] = targetId;
    // Označi igrača kao glasača
    const voter = room.players.find(p => p.id === socket.id);
    if (voter) voter.voted = true;
    const total = Object.keys(room.votes).length;
    io.to(code).emit('voteCast', { total, max: room.players.length });
    io.to(code).emit('roomUpdated', safeRoom(room));
    if (total === room.players.length) finalizeVotes(code);
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

  // ── BODOVANJE ─────────────────────────────────────────────────────────────
  // Citizens pobijede (impostor uhvaćen):
  //   - Svaki citizen koji je glasao za impostora: +2 boda
  //   - Svaki citizen koji NIJE glasao za impostora: +0 bodova
  //   - Impostori: +0 bodova
  //
  // Impostori pobijede (nitko nije uhvaćen ili neriješeno):
  //   - Svaki impostor: +3 boda (preživi glasanje ili neriješeno)
  //   - Citizens: +0 bodova
  //
  // Impostor pogodi pravu riječ:
  //   - Impostor koji je pogodio: +4 boda
  //   - Ostali impostori: +2 boda
  //   - Citizens: +0 bodova
  function calcScores(room) {
    room.scoreDeltas = {};
    room.players.forEach(p => { room.scoreDeltas[scoreKey(p)] = 0; });

    if (room.results.winner === 'CITIZENS') {
      // Samo citizens koji su točno glasali dobivaju bodove
      room.players.forEach(p => {
        const key = scoreKey(p);
        if (p.role === 'CITIZEN') {
          const votedPlayer = room.players.find(x => x.id === room.votes[p.id]);
          const correct = votedPlayer?.role === 'IMPOSTOR';
          const delta = correct ? 2 : 0;
          room.scores[key] = (room.scores[key] || 0) + delta;
          room.scoreDeltas[key] = delta;
        }
        // Impostori ne dobivaju ništa kad izgube
      });
    } else if (room.results.impostorGuessedCorrectly) {
      // Poseban slučaj — impostor pogodio pravu riječ
      // Pogađač: +4, ostali impostori: +2
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
      // Impostori pobijede preživljavanjem (ili neriješeno)
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
    return { ...safeRoom(room), playerToken: player.playerToken, myWord: player.word || null, myRole: player.role || null };
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
