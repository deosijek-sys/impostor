import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket'],
  pingInterval: 25000,
  pingTimeout: 60000
});
const PORT = process.env.PORT || 3000;
// ── WORD DATABASE ─────────────────────────────────────────────────────────────
const WORDS = {
  "Hrana": [
    [
      "Kruh",
      "Pecivo"
    ],
    [
      "Maslac",
      "Marmelada"
    ],
    [
      "Mlijeko",
      "Jogurt"
    ],
    [
      "Sir",
      "Vrhnje"
    ],
    [
      "Jaje",
      "Omlet"
    ],
    [
      "Juha",
      "Varivo"
    ],
    [
      "Sendvič",
      "Tost"
    ],
    [
      "Pizza",
      "Hamburger"
    ],
    [
      "Pomfrit",
      "Pire"
    ],
    [
      "Riža",
      "Tjestenina"
    ],
    [
      "Piletina",
      "Puretina"
    ],
    [
      "Kobasica",
      "Hrenovka"
    ],
    [
      "Salata",
      "Kupus"
    ],
    [
      "Jabuka",
      "Kruška"
    ],
    [
      "Banana",
      "Mandarina"
    ],
    [
      "Limun",
      "Naranča"
    ],
    [
      "Čokolada",
      "Keks"
    ],
    [
      "Sladoled",
      "Puding"
    ],
    [
      "Kava",
      "Čaj"
    ],
    [
      "Sok",
      "Voda"
    ],
    [
      "Burek",
      "Pita"
    ],
    [
      "Palačinke",
      "Vafli"
    ],
    [
      "Gulaš",
      "Paprikaš"
    ],
    [
      "Sarma",
      "Punjene paprike"
    ],
    [
      "Krafna",
      "Mafini"
    ]
  ],
  "Sport": [
    [
      "Nogomet",
      "Košarka"
    ],
    [
      "Tenis",
      "Stolni tenis"
    ],
    [
      "Odbojka",
      "Rukomet"
    ],
    [
      "Bazen",
      "Plaža"
    ],
    [
      "Trčanje",
      "Hodanje"
    ],
    [
      "Bicikl",
      "Romobil"
    ],
    [
      "Skijanje",
      "Snowboard"
    ],
    [
      "Teretana",
      "Fitness"
    ],
    [
      "Sudac",
      "Trener"
    ],
    [
      "Golman",
      "Napadač"
    ],
    [
      "Prvenstvo",
      "Turnir"
    ],
    [
      "Medalja",
      "Pehar"
    ],
    [
      "Stadion",
      "Dvorana"
    ],
    [
      "Zagrijavanje",
      "Istezanje"
    ],
    [
      "Plivanje",
      "Ronjenje"
    ],
    [
      "Boks",
      "Hrvanje"
    ],
    [
      "Badminton",
      "Squash"
    ],
    [
      "Golf",
      "Kuglanje"
    ],
    [
      "Dres",
      "Kopačke"
    ],
    [
      "Start",
      "Cilj"
    ]
  ],
  "Životinje": [
    [
      "Pas",
      "Mačka"
    ],
    [
      "Štene",
      "Mačić"
    ],
    [
      "Krava",
      "Bik"
    ],
    [
      "Konj",
      "Magarac"
    ],
    [
      "Ovca",
      "Koza"
    ],
    [
      "Svinja",
      "Vepar"
    ],
    [
      "Kokoš",
      "Pijetao"
    ],
    [
      "Patka",
      "Guska"
    ],
    [
      "Vrabac",
      "Golub"
    ],
    [
      "Riba",
      "Morski pas"
    ],
    [
      "Pčela",
      "Osa"
    ],
    [
      "Mrav",
      "Bubamara"
    ],
    [
      "Lav",
      "Tigar"
    ],
    [
      "Medvjed",
      "Vuk"
    ],
    [
      "Zec",
      "Kunić"
    ],
    [
      "Slon",
      "Žirafa"
    ],
    [
      "Delfin",
      "Kit"
    ],
    [
      "Krokodil",
      "Aligator"
    ],
    [
      "Papiga",
      "Kanarinac"
    ],
    [
      "Žaba",
      "Kornjača"
    ]
  ],
  "Mjesta": [
    [
      "Škola",
      "Fakultet"
    ],
    [
      "Bolnica",
      "Dom zdravlja"
    ],
    [
      "Trgovina",
      "Supermarket"
    ],
    [
      "Pekara",
      "Slastičarnica"
    ],
    [
      "Kafić",
      "Restoran"
    ],
    [
      "Park",
      "Igralište"
    ],
    [
      "Stan",
      "Kuća"
    ],
    [
      "Selo",
      "Grad"
    ],
    [
      "Ured",
      "Banka"
    ],
    [
      "Pošta",
      "Ljekarna"
    ],
    [
      "Aerodrom",
      "Kolodvor"
    ],
    [
      "Autobusna stanica",
      "Tramvajska stanica"
    ],
    [
      "Plaža",
      "Bazen"
    ],
    [
      "Kino",
      "Kazalište"
    ],
    [
      "Teretana",
      "Stadion"
    ],
    [
      "Knjižnica",
      "Čitaonica"
    ],
    [
      "Tržnica",
      "Shopping centar"
    ],
    [
      "Garaža",
      "Parkiralište"
    ],
    [
      "Most",
      "Tunel"
    ],
    [
      "Muzej",
      "Galerija"
    ]
  ],
  "Predmeti": [
    [
      "Stol",
      "Stolica"
    ],
    [
      "Krevet",
      "Kauč"
    ],
    [
      "Jastuk",
      "Pokrivač"
    ],
    [
      "Žlica",
      "Vilica"
    ],
    [
      "Nož",
      "Škare"
    ],
    [
      "Tanjur",
      "Zdjelica"
    ],
    [
      "Čaša",
      "Šalica"
    ],
    [
      "Lonac",
      "Tava"
    ],
    [
      "Hladnjak",
      "Zamrzivač"
    ],
    [
      "Perilica",
      "Sušilica"
    ],
    [
      "Usisavač",
      "Metla"
    ],
    [
      "Televizor",
      "Radio"
    ],
    [
      "Mobitel",
      "Tablet"
    ],
    [
      "Punjač",
      "Kabel"
    ],
    [
      "Ključ",
      "Lokot"
    ],
    [
      "Ruksak",
      "Torba"
    ],
    [
      "Novčanik",
      "Torbica"
    ],
    [
      "Kišobran",
      "Kabanica"
    ],
    [
      "Olovka",
      "Marker"
    ],
    [
      "Bilježnica",
      "Knjiga"
    ],
    [
      "Naočale",
      "Sat"
    ],
    [
      "Lampa",
      "Prekidač"
    ],
    [
      "Gitara",
      "Klavir"
    ],
    [
      "Mikrofon",
      "Zvučnik"
    ],
    [
      "Bicikl",
      "Romobil"
    ]
  ],
  "Filmovi i serije": [
    [
      "Titanic",
      "Avatar"
    ],
    [
      "Gladiator",
      "Troja"
    ],
    [
      "Batman",
      "Superman"
    ],
    [
      "Spider-Man",
      "Iron Man"
    ],
    [
      "Frozen",
      "Moana"
    ],
    [
      "Shrek",
      "Madagaskar"
    ],
    [
      "Harry Potter",
      "Percy Jackson"
    ],
    [
      "Gospodar prstenova",
      "Hobit"
    ],
    [
      "The Office",
      "Brooklyn Nine-Nine"
    ],
    [
      "Friends",
      "How I Met Your Mother"
    ],
    [
      "Breaking Bad",
      "Better Call Saul"
    ],
    [
      "Peaky Blinders",
      "Narcos"
    ],
    [
      "Dark",
      "Black Mirror"
    ],
    [
      "Stranger Things",
      "Wednesday"
    ],
    [
      "Home Alone",
      "Mr. Bean"
    ],
    [
      "Game of Thrones",
      "House of the Dragon"
    ],
    [
      "The Crown",
      "Suits"
    ],
    [
      "Squid Game",
      "Alice in Borderland"
    ],
    [
      "La Casa de Papel",
      "Lupin"
    ],
    [
      "The Simpsons",
      "Family Guy"
    ]
  ],
  "Profesije": [
    [
      "Doktor",
      "Medicinska sestra"
    ],
    [
      "Učitelj",
      "Profesor"
    ],
    [
      "Konobar",
      "Kuhar"
    ],
    [
      "Vozač",
      "Mehaničar"
    ],
    [
      "Policajac",
      "Vatrogasac"
    ],
    [
      "Poštar",
      "Dostavljač"
    ],
    [
      "Frizer",
      "Kozmetičar"
    ],
    [
      "Prodavač",
      "Blagajnik"
    ],
    [
      "Električar",
      "Vodoinstalater"
    ],
    [
      "Zidar",
      "Keramičar"
    ],
    [
      "Programer",
      "Dizajner"
    ],
    [
      "Fotograf",
      "Snimatelj"
    ],
    [
      "Pjevač",
      "Glumac"
    ],
    [
      "Pilot",
      "Stjuardesa"
    ],
    [
      "Vrtlar",
      "Cvjećar"
    ],
    [
      "Pekar",
      "Mesar"
    ],
    [
      "Novinar",
      "Voditelj"
    ],
    [
      "Odvjetnik",
      "Sudac"
    ],
    [
      "Arhitekt",
      "Građevinar"
    ],
    [
      "Trener",
      "Sudac"
    ]
  ],
  "Glazba": [
    [
      "Gitara",
      "Klavir"
    ],
    [
      "Bubnjevi",
      "Violina"
    ],
    [
      "Mikrofon",
      "Zvučnik"
    ],
    [
      "Koncert",
      "Festival"
    ],
    [
      "Refren",
      "Strofa"
    ],
    [
      "Album",
      "Singl"
    ],
    [
      "DJ",
      "Pjevač"
    ],
    [
      "Rap",
      "Pop"
    ],
    [
      "Rock",
      "Metal"
    ],
    [
      "Jazz",
      "Blues"
    ],
    [
      "Narodna glazba",
      "Zabavna glazba"
    ],
    [
      "Ples",
      "Koreografija"
    ],
    [
      "Slušalice",
      "Pojačalo"
    ],
    [
      "Bend",
      "Orkestar"
    ],
    [
      "Ulaznica",
      "Pozornica"
    ],
    [
      "Akustična gitara",
      "Električna gitara"
    ],
    [
      "Bas gitara",
      "Gitara"
    ],
    [
      "Klavijature",
      "Sintisajzer"
    ],
    [
      "Flauta",
      "Truba"
    ],
    [
      "Radio",
      "Playlist"
    ]
  ],
  "Priroda i znanosti": [
    [
      "Sunce",
      "Mjesec"
    ],
    [
      "Zvijezda",
      "Planet"
    ],
    [
      "Kiša",
      "Snijeg"
    ],
    [
      "Vjetar",
      "Oluja"
    ],
    [
      "More",
      "Jezero"
    ],
    [
      "Rijeka",
      "Potok"
    ],
    [
      "Planina",
      "Brdo"
    ],
    [
      "Šuma",
      "Livada"
    ],
    [
      "Cvijet",
      "Drvo"
    ],
    [
      "List",
      "Grana"
    ],
    [
      "Kamen",
      "Pijesak"
    ],
    [
      "Vatra",
      "Dim"
    ],
    [
      "Led",
      "Para"
    ],
    [
      "Ljeto",
      "Proljeće"
    ],
    [
      "Jesen",
      "Zima"
    ],
    [
      "Atom",
      "Molekula"
    ],
    [
      "Struja",
      "Magnet"
    ],
    [
      "Vulkan",
      "Potres"
    ],
    [
      "Duga",
      "Oblak"
    ],
    [
      "Baterija",
      "Žarulja"
    ]
  ],
  "Tehnologija": [
    [
      "Mobitel",
      "Tablet"
    ],
    [
      "Laptop",
      "Računalo"
    ],
    [
      "Tipkovnica",
      "Miš"
    ],
    [
      "Monitor",
      "Televizor"
    ],
    [
      "Aplikacija",
      "Program"
    ],
    [
      "Lozinka",
      "PIN"
    ],
    [
      "WiFi",
      "Bluetooth"
    ],
    [
      "Punjač",
      "Powerbank"
    ],
    [
      "Printer",
      "Skener"
    ],
    [
      "Kamera",
      "Web kamera"
    ],
    [
      "Poruka",
      "Email"
    ],
    [
      "Web stranica",
      "Online trgovina"
    ],
    [
      "USB",
      "Memorijska kartica"
    ],
    [
      "Router",
      "Modem"
    ],
    [
      "Slušalice",
      "Zvučnik"
    ],
    [
      "Pametni sat",
      "Narukvica"
    ],
    [
      "Fotografija",
      "Video"
    ],
    [
      "Pretraživač",
      "Stranica"
    ],
    [
      "Kod",
      "Datoteka"
    ],
    [
      "Mapa",
      "Cloud"
    ]
  ],
  "Svakodnevica": [
    [
      "Tuš",
      "Kada"
    ],
    [
      "Četkica",
      "Pasta za zube"
    ],
    [
      "Sapun",
      "Šampon"
    ],
    [
      "Ručnik",
      "Ogrtač"
    ],
    [
      "Jastuk",
      "Madrac"
    ],
    [
      "Budilica",
      "Sat"
    ],
    [
      "Kava",
      "Doručak"
    ],
    [
      "Ručak",
      "Večera"
    ],
    [
      "Ključevi",
      "Novčanik"
    ],
    [
      "Mobitel",
      "Punjač"
    ],
    [
      "Autobus",
      "Tramvaj"
    ],
    [
      "Lift",
      "Stepenice"
    ],
    [
      "Red",
      "Čekanje"
    ],
    [
      "Račun",
      "Kusur"
    ],
    [
      "Torba",
      "Ruksak"
    ],
    [
      "Jakna",
      "Kaput"
    ],
    [
      "Tenisice",
      "Cipele"
    ],
    [
      "Daljinski",
      "Televizor"
    ],
    [
      "Vrata",
      "Prozor"
    ],
    [
      "Balkon",
      "Terasa"
    ],
    [
      "Kupaonica",
      "Kuhinja"
    ],
    [
      "Perilica",
      "Deterdžent"
    ],
    [
      "Čajnik",
      "Lonac"
    ],
    [
      "Tanjur",
      "Čaša"
    ],
    [
      "Kruh",
      "Maslac"
    ]
  ]
};
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
function normalizeWord(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function editDistance(a = '', b = '') {
  const aa = normalizeWord(a);
  const bb = normalizeWord(b);
  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
  for (let i = 0; i <= aa.length; i++) dp[i][0] = i;
  for (let j = 0; j <= bb.length; j++) dp[0][j] = j;
  for (let i = 1; i <= aa.length; i++) {
    for (let j = 1; j <= bb.length; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[aa.length][bb.length];
}
function wordsTooSimilar(a, b) {
  const aa = normalizeWord(a);
  const bb = normalizeWord(b);
  if (!aa || !bb) return true;
  if (aa === bb) return true;
  if (aa.includes(bb) || bb.includes(aa)) return true;
  const dist = editDistance(aa, bb);
  if (Math.max(aa.length, bb.length) <= 6) return dist <= 2;
  if (aa.slice(0, 5) === bb.slice(0, 5) && dist <= 3) return true;
  return false;
}
function getRandomWord(category, roomCode) {
  const list = WORDS[category] || WORDS['Hrana'];
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
function getPlayableCategories() {
  return Object.keys(WORDS).filter(Boolean);
}
function getRandomCategory(room) {
  const categories = getPlayableCategories();
  if (!categories.length) return 'Hrana';
  room._recentCategories = Array.isArray(room._recentCategories) ? room._recentCategories : [];
  const pool = categories.filter(cat => !room._recentCategories.includes(cat));
  const available = pool.length ? pool : categories;
  const picked = available[Math.floor(Math.random() * available.length)] || 'Hrana';
  room._recentCategories.push(picked);
  if (room._recentCategories.length > 4) room._recentCategories.shift();
  return picked;
}
function sanitizeCustomWords(input) {
  const raw = Array.isArray(input)
    ? input
    : String(input || '').split(/[\n,]/g);
  const cleaned = [];
  const seen = new Set();
  for (const item of raw) {
    const word = String(item || '').trim().replace(/\s+/g, ' ');
    const normalized = normalizeWord(word);
    if (!word || word.length < 3 || word.length > 22) continue;
    if (!/^[A-Za-zÀ-ž0-9 ]+$/.test(word)) continue;
    if (normalized.split(' ').length > 2) continue;
    if (seen.has(normalized)) continue;
    if (cleaned.some(existing => wordsTooSimilar(existing, word))) continue;
    cleaned.push(word);
    seen.add(normalized);
    if (cleaned.length >= 80) break;
  }
  return cleaned;
}
function roomUsesCustomWords(room) {
  return sanitizeCustomWords(room?.customWords || []).length >= 6;
}
function roomUsesFairHostMode(room) {
  return roomUsesCustomWords(room);
}
function getRoomWordPair(room) {
  const custom = sanitizeCustomWords(room?.customWords || []);
  if (custom.length >= 6) {
    room.currentCategory = 'Custom riječi';
    const shuffled = [...custom].sort(() => Math.random() - 0.5);
    const subset = shuffled.slice(0, Math.min(6, shuffled.length));
    const citizen = subset[Math.floor(Math.random() * subset.length)];
    const impostorPool = subset.filter(word => !wordsTooSimilar(word, citizen));
    const impostor = (impostorPool[Math.floor(Math.random() * impostorPool.length)]) || custom.find(word => !wordsTooSimilar(word, citizen)) || custom.find(word => word !== citizen) || citizen;
    return { citizen, impostor };
  }
  const selectedCategory = room?.category === 'Random' ? getRandomCategory(room) : (room?.category || 'Hrana');
  room.currentCategory = selectedCategory;
  return getRandomWord(selectedCategory, room?.code);
}
// ── ROOMS ─────────────────────────────────────────────────────────────────────
const rooms = new Map();
const timers = new Map();
function normalizeCode(code = '') {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do { code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''); }
  while (rooms.has(code));
  return code;
}
function emitAppError(socket, scope, message, requestId = '') {
  socket.emit('appError', { scope, message, requestId });
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
    currentCategory: room.currentCategory || room.category,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isHost: p.isHost,
      isReady: p.isReady,
      hasRevealed: !!p.hasRevealed,
      voted: !!p.voted,
      isConnected: p.isConnected !== false,
      disconnectedAt: p.disconnectedAt || null,
      score: room.scores?.[scoreKey(p)] || 0,
      isSpectator: !!p.isSpectator
    }))
  };
}
function ensureHost(room) {
  if (!room?.players?.length) return;
  room.players.forEach((p, i) => { p.isHost = i === 0 ? p.isHost : false; });
  if (!room.players.some(p => p.isHost)) room.players[0].isHost = true;
}
function abortRoundToLobby(room, reason = 'Premalo igrača za nastavak.') {
  if (!room) return;
  clearTimer(room.code);
  room.state = 'LOBBY';
  room.votes = {};
  room.results = null;
  room.words = null;
  room.scoreDeltas = {};
  room.speakOrder = [];
  room.currentSpeakerIdx = 0;
  room.impostorGuess = null;
  room.players.forEach(p => {
    p.isReady = p.isHost;
    delete p.role;
    delete p.word;
    delete p.hasRevealed;
    delete p.voted;
    delete p.isSpectator;
  });
  io.to(room.code).emit('roundAborted', { reason });
}
function normalizeRoomAfterRemoval(room, removedPlayer) {
  if (!room) return;
  ensureHost(room);
  if ([ 'REVEAL', 'DISCUSSION', 'VOTING' ].includes(room.state) && room.players.length < 3) {
    abortRoundToLobby(room, 'Premalo igrača za nastavak ove runde. Vraćamo vas u lobby.');
    return;
  }
  if (room.state === 'REVEAL') {
    const activePlayers = room.players.filter(p => !p.isSpectator);
    const readyCount = activePlayers.filter(p => p.hasRevealed).length;
    io.to(room.code).emit('revealProgress', { readyCount, total: activePlayers.length });
    if (activePlayers.length > 0 && readyCount === activePlayers.length) {
      room.state = 'DISCUSSION';
      io.to(room.code).emit('startDiscussion', safeRoom(room));
      startTimer(room.code, room.discussionTime,
        t => io.to(room.code).emit('timer', { phase: 'discussion', remaining: t }),
        () => { if (rooms.get(room.code)?.state === 'DISCUSSION') startVotingPhase(room.code); }
      );
    }
    return;
  }
  if (room.state === 'DISCUSSION') {
    room.speakOrder = (room.speakOrder || []).filter(id => id !== removedPlayer.id);
    room.currentSpeakerIdx = Math.min(room.currentSpeakerIdx || 0, Math.max(0, room.speakOrder.length - 1));
    return;
  }
  if (room.state === 'VOTING') {
    delete room.votes[removedPlayer.id];
    Object.keys(room.votes).forEach(voterId => {
      if (room.votes[voterId] === removedPlayer.id) delete room.votes[voterId];
    });
    refreshVotingProgress(room);
  }
}
function connectedPlayers(room) {
  return room.players.filter(p => p.isConnected !== false);
}
function activeRoundPlayers(room) {
  return room.players.filter(p => p.isConnected !== false && !p.isSpectator);
}
function votingEligiblePlayers(room) {
  const eligible = activeRoundPlayers(room);
  return eligible.length ? eligible : room.players.filter(p => !p.isSpectator);
}
function votingTargetCount(room) {
  return votingEligiblePlayers(room).length;
}
function refreshVotingProgress(room) {
  const total = Object.keys(room.votes || {}).length;
  io.to(room.code).emit('voteCast', { total, max: votingTargetCount(room) });
  if (votingTargetCount(room) > 0 && total >= votingTargetCount(room)) finalizeVotes(room.code);
}
function detachPlayerFromRoom(socket, code, { preserveScore = true, notice = null } = {}) {
  const room = rooms.get(normalizeCode(code));
  if (!room) return null;
  const idx = room.players.findIndex(p => p.id === socket.id);
  if (idx === -1) return room;
  const leaving = room.players[idx];
  cancelDisconnectRemoval(room.code, leaving.playerToken);
  room.players.splice(idx, 1);
  if (!preserveScore) {
    delete room.scores[scoreKey(leaving)];
  }
  try { socket.leave?.(room.code); } catch {}
  if (room.players.length === 0) {
    rooms.delete(room.code);
    recentWords.delete(room.code);
    clearTimer(room.code);
    return null;
  }
  const hadHost = room.players.some(p => p.isHost);
  if (!hadHost) room.players[0].isHost = true;
  if (leaving.isHost && !room.players.some(p => p.isHost)) room.players[0].isHost = true;
  normalizeRoomAfterRemoval(room, leaving);
  io.to(room.code).emit('roomUpdated', safeRoom(room));
  if (notice) io.to(room.code).emit('roomNotice', { message: notice });
  return room;
}
function forceLeaveCurrentRoom(socket, { preserveScore = true } = {}) {
  rooms.forEach((room, code) => {
    if (room.players.some(p => p.id === socket.id)) {
      detachPlayerFromRoom(socket, code, { preserveScore });
    }
  });
}
function calcScores(room) {
  room.scoreDeltas = {};
  if (room.results.winner === 'CITIZENS') {
    room.players.forEach(p => {
      const key = scoreKey(p);
      let delta = 0;
      if (p.isSpectator) { room.scoreDeltas[key] = 0; return; }
      if (p.isSpectator) { room.scoreDeltas[key] = 0; return; }
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
      if (p.isSpectator) { room.scoreDeltas[key] = 0; return; }
      if (p.isSpectator) { room.scoreDeltas[key] = 0; return; }
      if (p.role === 'IMPOSTOR') {
        delta = room.results.impostorGuessedCorrectly ? 4 : 3;
      }
      room.scores[key] = (room.scores[key] || 0) + delta;
      room.scoreDeltas[key] = delta;
    });
  }
}
function buildResults(room) {
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
      isSpectator: !!p.isSpectator,
      score: room.scores?.[scoreKey(p)] || 0,
      isSpectator: !!p.isSpectator
    })),
    scoreDeltas: room.scoreDeltas || {}
  };
}
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
// ── SOCKET HANDLERS ───────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  // WebRTC signaling
  socket.on('rtc-offer',   ({ to, offer })     => io.to(to).emit('rtc-offer',   { from: socket.id, offer }));
  socket.on('rtc-answer',  ({ to, answer })    => io.to(to).emit('rtc-answer',  { from: socket.id, answer }));
  socket.on('rtc-ice',     ({ to, candidate }) => io.to(to).emit('rtc-ice',     { from: socket.id, candidate }));
  // ── createRoom
  socket.on('createRoom', ({ playerName, playerToken, requestId }) => {
    playerName = String(playerName || '').trim().slice(0, 24);
    if (!playerName) return emitAppError(socket, 'join', 'Unesite ime agenta.', requestId);
    forceLeaveCurrentRoom(socket, { preserveScore: true });
    const code = generateCode();
    const room = {
      code, state: 'LOBBY',
      category: 'Random', impostorCount: 1,
      discussionTime: 120, votingTime: 60,
      privateRoom: false, roomPin: '', customWords: [],
      words: null, votes: {}, results: null,
      scores: {}, roundNumber: 0,
      speakOrder: [], currentSpeakerIdx: 0, lastDiscussionStarterId: null,
      players: [{ id: socket.id, name: playerName, isHost: true, isReady: true, playerToken: playerToken || makePlayerToken(), isConnected: true, disconnectedAt: null }]
    };
    rooms.set(code, room);
    socket.join(code);
    socket.emit('roomCreated', { ...safeRoom(room), playerToken: room.players[0].playerToken, requestId });
  });
  // ── joinRoom
  socket.on('joinRoom', ({ code, playerName, playerToken, roomPin, requestId }) => {
    const normalizedCode = normalizeCode(code);
    const normalizedPin = String(roomPin || '').replace(/\D/g, '').slice(0, 6);
    playerName = String(playerName || '').trim().slice(0, 24);
    if (!playerName) return emitAppError(socket, 'join', 'Unesite ime agenta.', requestId);
    if (normalizedCode.length < 4) return emitAppError(socket, 'join', 'Unesite ispravan kod sobe.', requestId);
    const room = rooms.get(normalizedCode);
    if (!room) return emitAppError(socket, 'join', 'Soba nije pronađena.', requestId);
    let existingByToken = playerToken ? room.players.find(p => p.playerToken === playerToken) : null;
    if (!existingByToken && room.state === 'LOBBY') {
      const reclaimByName = room.players.find(p => p.isConnected === false && p.name.toLowerCase() === playerName.toLowerCase());
      if (reclaimByName) existingByToken = reclaimByName;
    }
    if (room.state !== 'LOBBY' && !existingByToken) return emitAppError(socket, 'join', 'Igra je već počela.', requestId);
    if (room.privateRoom && String(room.roomPin || '') !== normalizedPin) {
      return emitAppError(socket, 'join', 'Privatna soba — unesite ispravan PIN.', requestId);
    }
    forceLeaveCurrentRoom(socket, { preserveScore: true });
    if (existingByToken) {
      cancelDisconnectRemoval(normalizedCode, existingByToken.playerToken);
      existingByToken.id = socket.id;
      existingByToken.name = playerName || existingByToken.name;
      existingByToken.isConnected = true;
      existingByToken.disconnectedAt = null;
      socket.join(normalizedCode);
      socket.emit('sessionResumed', { ...buildPlayerPayload(room, existingByToken), requestId });
      io.to(normalizedCode).emit('roomUpdated', safeRoom(room));
      return;
    }
    if (room.players.length >= 10) return emitAppError(socket, 'join', 'Soba je puna (max 10).', requestId);
    if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase()))
      return emitAppError(socket, 'join', 'To ime je već zauzeto.', requestId);
    const token = playerToken || makePlayerToken();
    room.players.push({ id: socket.id, name: playerName, isHost: false, isReady: false, playerToken: token, isConnected: true, disconnectedAt: null });
    socket.join(normalizedCode);
    socket.emit('roomJoined', { ...safeRoom(room), playerToken: token, requestId });
    io.to(normalizedCode).emit('roomUpdated', safeRoom(room));
  });
  socket.on('resumeSession', ({ code, playerToken, playerName, requestId }) => {
    const room = rooms.get(normalizeCode(code));
    if (!room || !playerToken) return socket.emit('resumeFailed', { requestId });
    const player = room.players.find(p => p.playerToken === playerToken);
    if (!player) return socket.emit('resumeFailed', { requestId });
    cancelDisconnectRemoval(room.code, player.playerToken);
    player.id = socket.id;
    if (playerName) player.name = playerName;
    player.isConnected = true;
    player.disconnectedAt = null;
    socket.join(room.code);
    socket.emit('sessionResumed', { ...buildPlayerPayload(room, player), requestId });
    io.to(room.code).emit('roomUpdated', safeRoom(room));
  });
  socket.on('leaveRoom', ({ code } = {}) => {
    const targetCode = normalizeCode(code);
    let leftAny = false;
    if (targetCode) {
      const room = rooms.get(targetCode);
      if (room && room.players.some(p => p.id === socket.id)) {
        detachPlayerFromRoom(socket, targetCode, { preserveScore: true, notice: 'Igrač je napustio sobu.' });
        leftAny = true;
      }
    }
    if (!leftAny) {
      rooms.forEach((room, roomCode) => {
        if (room.players.some(p => p.id === socket.id)) {
          detachPlayerFromRoom(socket, roomCode, { preserveScore: true, notice: 'Igrač je napustio sobu.' });
          leftAny = true;
        }
      });
    }
    socket.emit('roomLeft');
  });
  socket.on('kickPlayer', ({ code, targetId }) => {
    const room = rooms.get(normalizeCode(code));
    if (!room) return;
    const host = room.players.find(p => p.id === socket.id && p.isHost);
    if (!host) return;
    const target = room.players.find(p => p.id === targetId);
    if (!target || target.id === socket.id) return;
    const targetSocket = io.sockets.sockets.get(target.id);
    if (targetSocket) targetSocket.emit('kicked', { code: room.code });
    detachPlayerFromRoom(targetSocket || { id: target.id, leave: () => {} }, room.code, {
      preserveScore: true,
      notice: `${target.name} je izbačen iz sobe.`
    });
  });
  socket.on('removeDisconnectedPlayer', ({ code, targetId }) => {
    const room = rooms.get(normalizeCode(code));
    if (!room) return;
    const host = room.players.find(p => p.id === socket.id && p.isHost);
    if (!host) return;
    const target = room.players.find(p => p.id === targetId);
    if (!target || target.isConnected !== false) return;
    cancelDisconnectRemoval(room.code, target.playerToken);
    detachPlayerFromRoom({ id: target.id, leave: () => {} }, room.code, {
      preserveScore: true,
      notice: `${target.name} je uklonjen kako bi igra mogla dalje.`
    });
  });
  // ── updateConfig
  socket.on('updateConfig', ({ code, category, impostors, discussionTime, votingTime, privateRoom, roomPin, customWords }) => {
    const room = rooms.get(normalizeCode(code));
    if (!room || room.state !== 'LOBBY' || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (category === 'Random' || WORDS[category]) room.category = category;
    room.impostorCount = Math.max(1, Math.min(3, parseInt(impostors) || 1));
    if (discussionTime) room.discussionTime = Math.max(60, Math.min(600, parseInt(discussionTime)));
    if (votingTime) room.votingTime = Math.max(60, Math.min(300, parseInt(votingTime)));
    room.privateRoom = !!privateRoom;
    room.roomPin = room.privateRoom ? String(roomPin || '').replace(/\D/g, '').slice(0, 6) : '';
    room.customWords = sanitizeCustomWords(customWords);
    io.to(room.code).emit('roomUpdated', safeRoom(room));
  });
  // ── toggleReady
  socket.on('toggleReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (p && !p.isHost) {
      p.isReady = !p.isReady;
      io.to(room.code).emit('roomUpdated', safeRoom(room));
    }
  });
  // ── startGame
  socket.on('startGame', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return socket.emit('appError', { scope: 'room', message: 'Soba nije pronađena.' });
    if (!room.players.find(p => p.id === socket.id && p.isHost))
      return socket.emit('appError', { scope: 'lobby', message: 'Samo host može pokrenuti igru.' });
    if (room.players.length < 3)
      return socket.emit('appError', { scope: 'lobby', message: 'Potrebno je minimalno 3 igrača.' });
    const activePlayersBefore = connectedPlayers(room);
    const fairHostMode = roomUsesFairHostMode(room);
    const minConnectedPlayers = fairHostMode ? 4 : 3;
    if (activePlayersBefore.length < minConnectedPlayers)
      return socket.emit('appError', { scope: 'lobby', message: fairHostMode
        ? 'Potrebna su najmanje 4 povezana igrača jer host moderira rundu i ne igra.'
        : 'Potrebna su najmanje 3 povezana igrača za početak runde.' });
    room.roundNumber++;
    room.words = getRoomWordPair(room);
    room.state = 'REVEAL';
    room.votes = {};
    room.impostorGuess = null;
    room.hostSpectating = fairHostMode;
    room.players.forEach(p => {
      delete p.isSpectator;
      delete p.role;
      delete p.word;
      p.hasRevealed = false;
      p.voted = false;
    });
    if (fairHostMode) {
      const hostPlayer = room.players.find(p => p.isHost);
      if (hostPlayer) {
        hostPlayer.isSpectator = true;
        hostPlayer.role = 'SPECTATOR';
        hostPlayer.word = null;
        hostPlayer.hasRevealed = true;
      }
    }
    const roundPlayers = room.players.filter(p => !p.isSpectator);
    if (roundPlayers.length < 3) {
      room.state = 'LOBBY';
      return socket.emit('appError', { scope: 'lobby', message: 'Nema dovoljno aktivnih igrača za rundu.' });
    }
    room.players.forEach(p => { const key = scoreKey(p); if (room.scores[key] === undefined) room.scores[key] = 0; });
    const shuffled = [...roundPlayers].sort(() => Math.random() - 0.5);
    const impostorCount = Math.min(room.impostorCount, Math.max(1, roundPlayers.length - 1));
    const impIds = new Set(shuffled.slice(0, impostorCount).map(p => p.id));
    roundPlayers.forEach(p => {
      p.role = impIds.has(p.id) ? 'IMPOSTOR' : 'CITIZEN';
      p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
    });
    const randomOrder = [...roundPlayers].sort(() => Math.random() - 0.5).map(p => p.id);
    if (randomOrder.length > 1 && room.lastDiscussionStarterId) {
      const firstCandidate = randomOrder[0];
      if (firstCandidate === room.lastDiscussionStarterId) {
        const swapIdx = randomOrder.findIndex(id => id !== room.lastDiscussionStarterId);
        if (swapIdx > 0) [randomOrder[0], randomOrder[swapIdx]] = [randomOrder[swapIdx], randomOrder[0]];
      }
    }
    room.speakOrder = randomOrder;
    room.currentSpeakerIdx = 0;
    room.lastDiscussionStarterId = room.speakOrder[0] || null;
    const base = safeRoom(room);
    room.players.forEach(p => {
      io.to(p.id).emit('gameStarted', {
        ...base,
        myWord: p.word,
        myRole: p.role
      });
    });
    if (room.hostSpectating) io.to(room.code).emit('roomNotice', { message: 'Premium fair mode: host moderira ovu rundu i ne sudjeluje kao igrač.' });
  });
  // ── playerReady
  socket.on('playerReady', ({ code }) => {
    const room = rooms.get(code);
    if (!room) return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p) return;
    if (p.isSpectator) return;
    p.hasRevealed = true;
    const activePlayers = room.players.filter(player => !player.isSpectator);
    const readyCount = activePlayers.filter(player => player.hasRevealed).length;
    io.to(code).emit('revealProgress', { readyCount, total: activePlayers.length });
    if (readyCount === activePlayers.length) {
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
    room.words = getRoomWordPair(room);
    room.players.forEach(p => {
      if (p.isSpectator) return;
      p.word = p.role === 'IMPOSTOR' ? room.words.impostor : room.words.citizen;
      p.hasRevealed = false;
    });
    const base = safeRoom(room);
    room.players.forEach(p => {
      io.to(p.id).emit('wordRerolled', { ...base, myWord: p.word, myRole: p.role });
    });
  });
  // ── startVoting (host trigger)
  socket.on('startVoting', ({ code, playerToken }) => {
    const normalizedCode = normalizeCode(code);
    const room = rooms.get(normalizedCode);
    if (!room || room.state !== 'DISCUSSION') return;
    let host = room.players.find(p => p.id === socket.id && p.isHost);
    if (!host && playerToken) {
      host = room.players.find(p => p.playerToken === playerToken && p.isHost);
      if (host) {
        cancelDisconnectRemoval(room.code, host.playerToken);
        host.id = socket.id;
        host.isConnected = true;
        host.disconnectedAt = null;
        socket.join(room.code);
        io.to(room.code).emit('roomUpdated', safeRoom(room));
      }
    }
    if (!host) return emitAppError(socket, 'room', 'Samo host može otvoriti glasanje.');
    startVotingPhase(normalizedCode);
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
    const voter = room.players.find(p => p.id === socket.id);
    const target = room.players.find(p => p.id === targetId);
    if (!voter || voter.isConnected === false || voter.isSpectator || !target || target.isSpectator) return;
    room.votes[socket.id] = targetId;
    voter.voted = true;
    refreshVotingProgress(room);
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
  socket.on('playAgain', ({ code, playerToken }) => {
    const normalizedCode = normalizeCode(code);
    const room = rooms.get(normalizedCode);
    if (!room) return;
    if (playerToken) {
      const hostByToken = room.players.find(p => p.playerToken === playerToken && p.isHost);
      if (hostByToken && hostByToken.id !== socket.id) {
        cancelDisconnectRemoval(room.code, hostByToken.playerToken);
        hostByToken.id = socket.id;
        hostByToken.isConnected = true;
        hostByToken.disconnectedAt = null;
        socket.join(room.code);
      }
    }
    clearTimer(room.code);
    ensureHost(room);
    room.state = 'LOBBY';
    room.votes = {}; room.results = null; room.words = null; room.scoreDeltas = {};
    room.speakOrder = []; room.currentSpeakerIdx = 0; room.impostorGuess = null;
    room.players.forEach(p => {
      p.isReady = p.isHost;
      delete p.role; delete p.word; delete p.hasRevealed; delete p.voted; delete p.isSpectator;
    });
    io.to(room.code).emit('roomUpdated', safeRoom(room));
    io.to(code).emit('roomNotice', { message: 'Nova runda je spremna. Host može promijeniti kategoriju i postavke.' });
  });
  // ── resetScores
  socket.on('resetScores', ({ code }) => {
    const room = rooms.get(code);
    if (!room || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    room.scores = {}; room.roundNumber = 0;
    io.to(room.code).emit('roomUpdated', safeRoom(room));
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
      const token = player.playerToken;
      const timer = setTimeout(() => {
        const liveRoom = rooms.get(code);
        if (!liveRoom) return;
        const livePlayer = liveRoom.players.find(p => p.playerToken === token);
        if (!livePlayer || livePlayer.isConnected) return;
        disconnectTimers.delete(key);
        detachPlayerFromRoom({ ...socket, id: livePlayer.id, leave: socket.leave.bind(socket) }, code, { preserveScore: false, notice: `${livePlayer.name} je uklonjen nakon prekida veze.` });
      }, RECONNECT_GRACE_MS);
      disconnectTimers.set(key, timer);
      io.to(room.code).emit('roomUpdated', safeRoom(room));
      if (room.state === 'VOTING') refreshVotingProgress(room);
    });
  });
});
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
httpServer.listen(PORT, '0.0.0.0', () => console.log(`✓ Impostor server on port ${PORT}`));