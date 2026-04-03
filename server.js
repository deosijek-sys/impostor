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
    ["Kruh","Pecivo"],["Maslac","Margarina"],["Mlijeko","Jogurt"],["Sir","Vrhnje"],["Jaje","Omlet"],["Juha","Varivo"],["Sendvič","Tost"],["Hamburger","Ćevapi"],["Pomfrit","Pire"],["Riža","Tjestenina"],["Piletina","Puretina"],["Kobasica","Hrenovka"],["Salata","Kupus"],["Jabuka","Kruška"],["Banana","Mandarina"],["Limun","Naranča"],["Čokolada","Keks"],["Sladoled","Puding"],["Kava","Čaj"],["Sok","Gazirani sok"],
    ["Pizza","Focaccia"],["Sushi","Sashimi"],["Hamburger","Sendvič"],["Lazanje","Musaka"],
    ["Rižoto","Paella"],["Tacos","Burrito"],["Croissant","Brioche"],["Cheesecake","Tiramisù"],
    ["Ramen","Pho"],["Hummus","Baba ganoush"],["Pancake","Waffle"],["Steak","Kotlet"],
    ["Ćevapi","Pljeskavica"],["Punjene paprike","Sarma"],["Gulaš","Paprikaš"],
    ["Burek","Pita"],["Baklava","Kadaif"],["Palačinke","Vafli"],["Fondue","Raclette"],
    ["Gyros","Döner kebab"],["Falafel","Shawarma"],["Pad thai","Chow mein"],
    ["Kimchi","Sauerkraut"],["Curry","Masala"],["Dim sum","Bao"],
    ["Gazpacho","Salmorejo"],["Ceviche","Tartare"],["Crème brûlée","Panna cotta"],
    ["Macaron","Financier"],["Gelato","Sorbetto"],["Baguette","Ciabatta"],
    ["Gnocchi","Pelmeni"],["Couscous","Quinoa"],["Tagine","Shakshuka"],
    ["Bibimbap","Japchae"],["Rendang","Satay"],["Osso buco","Saltimbocca"],
    ["Mozzarella","Burrata"],["Brie","Camembert"],["Cacio e pepe","Carbonara"],
    ["Biryani","Pilav"],["Spring roll","Egg roll"],["Miso juha","Tom yum"],
    ["Banh mi","Goi cuon"],["Nasi goreng","Mie goreng"],["Pretzel","Bagel"]
  ],
  "Sport": [
    ["Nogomet","Košarka"],["Tenis","Stolni tenis"],["Odbojka","Rukomet"],["Bazen","Plaža"],["Trčanje","Hodanje"],["Bicikl","Romobil"],["Skijanje","Snowboard"],["Teretana","Fitness"],["Sutiranje","Dodavanje"],["Trener","Sudac"],["Golman","Napadač"],["Prvenstvo","Turnir"],["Medalja","Pehar"],["Stadion","Dvorana"],["Zagrijavanje","Istezanje"],
    ["Nogomet","Ragbi"],["Košarka","Netball"],["Tenis","Squash"],
    ["Badminton","Pickleball"],["Odbojka","Beach volley"],["Plivanje","Vaterpolo"],
    ["Atletika","Triatlon"],["Biatlon","Skijaško trčanje"],["Alpsko skijanje","Snowboard"],
    ["Hokej na ledu","Curling"],["Bob","Skeleton"],["Boks","Kickboxing"],
    ["Karate","Taekwondo"],["Judo","Aikido"],["MMA","Muay thai"],
    ["Hrvanje","Sumo"],["Gimnastika","Akrobatika"],["Skok u vis","Skok s motkom"],
    ["Bacanje koplja","Bacanje diska"],["Maraton","Ultramaraton"],
    ["Cestovni biciklizam","Mountain biking"],["Jedriličarstvo","Veslanje"],
    ["Surfanje","Kitesurfing"],["Baseball","Softball"],["Lacrosse","Hokej na travi"],
    ["Golf","Disc golf"],["Kuglanje","Bocce"],["Streljaštvo","Streličarstvo"],
    ["Penjanje","Bouldering"],["CrossFit","Powerlifting"],["Fencing","Mačevanje"],
    ["Skateboard","Longboard"],["Paragliding","Skydiving"],["Darts","Biljar"],
    ["Airsoft","Paintball"],["Rukomet","Futsal"],["Polo","Kriket"]
  ],
  "Životinje": [
    ["Pas","Mačka"],["Štene","Mačić"],["Krava","Bik"],["Konj","Magarac"],["Ovca","Koza"],["Svinja","Vepar"],["Kokoš","Pijetao"],["Patka","Guska"],["Vrabac","Golub"],["Riba","Morski pas"],["Pčela","Osa"],["Mrav","Bubamara"],["Lav","Tigar"],["Medvjed","Vuk"],["Zec","Kunić"],
    ["Lav","Gepard"],["Tigar","Leopard"],["Jaguar","Puma"],
    ["Medvjed","Polarni medvjed"],["Vuk","Divlji pas"],["Slon","Mamut"],
    ["Nosorog","Tapir"],["Hipopotam","Nilski konj"],["Žirafa","Okapi"],
    ["Zebra","Divlji konj"],["Bizon","Musk ox"],["Šimpanza","Bonobo"],
    ["Gorila","Orangutan"],["Delfin","Pliskavica"],["Orka","Pilot kit"],
    ["Morski pas","Raža"],["Hobotnica","Lignja"],["Krokodil","Aligator"],
    ["Piton","Boa constrictor"],["Kameleont","Gekko"],["Komodo zmaj","Monitor gušter"],
    ["Orao","Kondor"],["Soko","Kobac"],["Sova","Ušara"],
    ["Papiga","Kakadu"],["Tukan","Hornbill"],["Flamingo","Ibis"],
    ["Pingvin","Razorbill"],["Kolibri","Sunbird"],["Koala","Kuskus"],
    ["Klokam","Vombat"],["Armadillo","Pangolin"],["Alpaka","Ljama"],
    ["Kamila","Dromedар"],["Fenekh","Arktička lisica"],["Mangusta","Meerkat"],
    ["Vidra","Dabar"],["Foka","Morž"],["Dugong","Manatee"]
  ],
  "Mjesta": [
    ["Škola","Fakultet"],["Bolnica","Dom zdravlja"],["Trgovina","Supermarket"],["Pekara","Slastičarnica"],["Kafić","Restoran"],["Park","Igralište"],["Stan","Kuća"],["Selo","Grad"],["Ured","Banka"],["Pošta","Ljekarna"],["Aerodrom","Kolodvor"],["Autobusna stanica","Tramvajska stanica"],["Plaža","Bazen"],["Kino","Kazalište"],["Teretana","Stadion"],
    ["Tokio","Osaka"],["Pariz","Lyon"],["New York","Chicago"],
    ["London","Manchester"],["Dubai","Abu Dhabi"],["Sydney","Melbourne"],
    ["Barcelona","Madrid"],["Rim","Milano"],["Atena","Solun"],
    ["Istanbul","Ankara"],["Moskva","Sankt Peterburg"],["Peking","Shanghai"],
    ["Bangkok","Chiang Mai"],["Singapur","Kuala Lumpur"],["Seoul","Busan"],
    ["Beč","Salzburg"],["Amsterdam","Rotterdam"],["Stockholm","Göteborg"],
    ["Lisabon","Porto"],["Prag","Brno"],["Varšava","Krakov"],
    ["Zagreb","Split"],["Dubrovnik","Hvar"],["Sarajevo","Mostar"],
    ["Beograd","Novi Sad"],["Ljubljana","Maribor"],["Marrakech","Fes"],
    ["Himalaja","Andi"],["Kilimanjaro","Mont Blanc"],["Grand Canyon","Bryce Canyon"],
    ["Yellowstone","Yosemite"],["Maldivi","Sejšeli"],["Galapagos","Komodo"],
    ["Plitvička jezera","Krka"],["Venecija","Bruges"],["Santorini","Mykonos"],
    ["Machu Picchu","Chichen Itza"],["Petra","Palmira"],["Pompeji","Herkulaneum"]
  ],
  "Predmeti": [
    ["Stol","Stolica"],["Krevet","Kauč"],["Jastuk","Pokrivač"],["Žlica","Vilica"],["Nož","Škare"],["Tanjur","Zdjelica"],["Čaša","Šalica"],["Lonac","Tava"],["Hladnjak","Zamrzivač"],["Perilica","Sušilica"],["Usisavač","Metla"],["Televizor","Radio"],["Mobitel","Daljinski"],["Punjač","Kabel"],["Ključ","Lokot"],["Ruksak","Torba"],["Novčanik","Torbica"],["Kišobran","Kabanica"],["Olovka","Marker"],["Bilježnica","Knjiga"],
    ["Mobitel","Pametni sat"],["Laptop","Chromebook"],["Tablet","E-čitač"],
    ["Slušalice","Airpods"],["Zvučnik","Soundbar"],["Projektor","Smart TV"],
    ["Fotoaparat","Videokamera"],["Tipkovnica","Gamepad"],["Monitor","Televizor"],
    ["Printer","3D printer"],["Hard disk","SSD"],["Power bank","Punjač"],
    ["Lampa","Luster"],["Dalekozor","Teleskop"],["Mikroskop","Lupa"],
    ["Šalica","Termos"],["Lonac","Wok"],["Blender","Mikser"],
    ["Espresso aparat","French press"],["Kišobran","Poncho"],
    ["Naočale","Kontaktne leće"],["Ruksak","Kovčeg"],
    ["Gitara","Ukulele"],["Klavir","Sintesajzer"],["Violina","Viola"],
    ["Saksofon","Klarinet"],["Bubnjevi","Udaraljke"],["Dron","RC auto"],
    ["Skateboard","Longboard"],["Bicikl","Romobil"],
    ["Nalivpero","Flomaster"],["Šestar","Pantograf"]
  ],
  "Filmovi i serije": [
    ["Titanic","Avatar"],["Gladiator","Troja"],["Batman","Superman"],["Spiderman","Iron Man"],["Frozen","Moana"],["Shrek","Madagaskar"],["Harry Potter","Percy Jackson"],["Gospodar prstenova","Hobit"],["The Office","Brooklyn Nine-Nine"],["Friends","Modern Family"],["Breaking Bad","Better Call Saul"],["Peaky Blinders","Narcos"],["Dark","Black Mirror"],["Stranger Things","Wednesday"],["Home Alone","Mr. Bean"],
    ["Titanic","Pearl Harbor"],["The Godfather","Goodfellas"],
    ["Inception","Interstellar"],["The Dark Knight","Batman Begins"],
    ["Fight Club","American Psycho"],["Pulp Fiction","Reservoir Dogs"],
    ["The Silence of the Lambs","Se7en"],["Shutter Island","Black Swan"],
    ["The Matrix","Dark City"],["Star Wars","Star Trek"],
    ["Game of Thrones","House of the Dragon"],["Breaking Bad","Ozark"],
    ["Peaky Blinders","Boardwalk Empire"],["Narcos","Snowfall"],
    ["Stranger Things","Dark"],["Black Mirror","Years and Years"],
    ["Money Heist","Lupin"],["Squid Game","Alice in Borderland"],
    ["The Crown","The Queen's Gambit"],["Friends","How I Met Your Mother"],
    ["The Office","Parks and Recreation"],["Succession","Billions"],
    ["Westworld","Altered Carbon"],["The Witcher","Shadow and Bone"],
    ["Euphoria","Skins"],["True Detective","Mindhunter"],
    ["The Wire","The Shield"],["Grey's Anatomy","House M.D."],
    ["Dexter","You"],["Interstellar","The Martian"],
    ["Dunkirk","1917"],["Parasite","Burning"],
    ["La La Land","Whiplash"],["Midsommar","Hereditary"],
    ["Dune","Foundation"],["Arrival","Annihilation"],
    ["Oppenheimer","Dunkirk"],["Mad Max: Fury Road","Children of Men"]
  ],
  "Profesije": [
    ["Doktor","Medicinska sestra"],["Učitelj","Profesor"],["Konobar","Kuhar"],["Vozač","Mehaničar"],["Policajac","Vatrogasac"],["Poštar","Dostavljač"],["Frizer","Kozmetičar"],["Prodavač","Blagajnik"],["Električar","Vodoinstalater"],["Zidar","Keramičar"],["Programer","Dizajner"],["Fotograf","Snimatelj"],["Pjevač","Glumac"],["Pilot","Stjuardesa"],["Vrtlar","Cvjećar"],
    ["Kirurg","Anesteziolog"],["Kardiolog","Neurolog"],["Psihijatar","Psiholog"],
    ["Dermatolog","Plastični kirurg"],["Oftalmolog","Optometrist"],
    ["Profesor","Nastavnik"],["Arhitekt","Urbanist"],
    ["Softverski inženjer","Full-stack developer"],["Data scientist","ML inženjer"],
    ["UI/UX dizajner","Grafički dizajner"],["Fotograf","Snimatelj"],
    ["Redatelj","Producent"],["Glumac","Kazališni redatelj"],
    ["Chef","Sous chef"],["Slastičar","Čokolatijer"],["Sommelier","Barista"],
    ["Pilot","Ko-pilot"],["Meteorolog","Klimatolog"],
    ["Biokemičar","Molekularni biolog"],["Genetičar","Fiziolog"],
    ["Paleontolog","Arkeolog"],["Antropolog","Etnolog"],
    ["Lingvist","Prevodilac"],["Odvjetnik","Tužilac"],["Sudac","Arbitar"],
    ["Diplomata","Konzul"],["Forenzičar","Kriminalist"],
    ["Burzovni broker","Fund manager"],["Brand manager","Product manager"],
    ["Personal trainer","Fizioterapeut"],["Nutricionist","Dijetetičar"]
  ],
  "Glazba": [
    ["Gitara","Klavir"],["Bubnjevi","Violina"],["Mikrofon","Zvučnik"],["Koncert","Festival"],["Refren","Strofa"],["Album","Singl"],["DJ","Pjevač"],["Rap","Pop"],["Rock","Metal"],["Jazz","Blues"],["Narodna glazba","Zabavna glazba"],["Ples","Koreografija"],["Slušalice","Pojačalo"],["Bend","Orkestar"],["Ulaznica","Pozornica"],
    ["Hip-hop","Trap"],["Jazz","Blues"],["Klasična glazba","Barokna glazba"],
    ["Rock","Metal"],["Punk","Grunge"],["Pop","Indie pop"],
    ["R&B","Soul"],["Funk","Disco"],["Electronic","Techno"],
    ["House","Trance"],["Drum and bass","Dubstep"],["Reggae","Ska"],
    ["Bossa nova","Samba"],["Flamenco","Fado"],["Country","Bluegrass"],
    ["Opera","Musical"],["Ambient","New age"],["Synth-pop","New wave"],
    ["Gitara","Bas gitara"],["Električna gitara","Akustična gitara"],
    ["Klavir","Klavijature"],["Violina","Viola"],["Bubnjevi","Udaraljke"],
    ["Saksofon","Klarinet"],["Flauta","Oboe"],["Harfa","Lira"],
    ["Studijski album","Live album"],["Glastonbury","Coachella"],
    ["Grammy","Brit Awards"],["Lo-fi","Hi-fi"]
  ],
  "Priroda i znanosti": [
    ["Sunce","Mjesec"],["Zvijezda","Planet"],["Kiša","Snijeg"],["Vjetar","Oluja"],["More","Jezero"],["Rijeka","Potok"],["Planina","Brdo"],["Šuma","Livada"],["Cvijet","Drvo"],["List","Grana"],["Kamen","Pijesak"],["Vatra","Dim"],["Led","Para"],["Ljeto","Proljeće"],["Jesen","Zima"],["Atom","Molekula"],["Struja","Magnet"],
    ["Vulkan","Gejzir"],["Potres","Tsunami"],["Tornado","Hurikan"],
    ["El Niño","La Niña"],["Polarna svjetlost","Zodijačka svjetlost"],
    ["Crna rupa","Neutronska zvijezda"],["Bijeli patuljak","Supernova"],
    ["Kvazar","Pulsar"],["Egzoplaneta","Super-Zemlja"],
    ["Klif","Fjord"],["Atol","Koraljni greben"],
    ["Tundra","Tajga"],["Savana","Prerija"],
    ["Tropska prašuma","Borealna šuma"],["Stalagmit","Stalaktit"],
    ["Fotosinteza","Kemosinteza"],["Simbioza","Parasitizam"],
    ["Migracija","Hibernacija"],["DNA","RNA"],
    ["Mutacija","Evolucija"],["Kvantna mehanika","Teorija relativnosti"],
    ["Tamna materija","Tamna energija"],["Fuzija","Fisija"],
    ["Osmoza","Difuzija"],["Polimeri","Monomeri"]
  ],
  "Tehnologija": [
    ["Mobitel","Tablet"],["Laptop","Računalo"],["Tipkovnica","Miš"],["Monitor","Televizor"],["Aplikacija","Program"],["Lozinka","PIN"],["Wi‑Fi","Bluetooth"],["Punjač","Powerbank"],["Printer","Skener"],["Kamera","Web kamera"],["Poruka","Email"],["Web stranica","Online trgovina"],["USB","Memorijska kartica"],["Router","Modem"],["Slušalice","Zvučnik"],["Pametni sat","Narukvica"],
    ["Blockchain","Kriptovaluta"],["Bitcoin","Ethereum"],
    ["AI","Machine learning"],["Neural network","Deep learning"],
    ["VR","AR"],["Cloud computing","Edge computing"],
    ["Cybersecurity","Etički hacking"],["Quantum computing","Supercomputer"],
    ["5G","Wi-Fi 6E"],["IoT","Smart home"],
    ["Autonomno vozilo","LIDAR sustav"],["3D printing","CNC obrada"],
    ["CRISPR","Gene therapy"],["Solarne ćelije","Vjetroturbina"],
    ["GPS","GLONASS"],["API","SDK"],
    ["Open source","Proprietary software"],["Agile","Waterfall"],
    ["Microservices","Monolith"],["Kubernetes","Docker"],
    ["SQL","NoSQL"],["React","Vue.js"],
    ["Python","Julia"],["Rust","C++"],
    ["PostgreSQL","MongoDB"],["Kafka","RabbitMQ"]
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
  // Randomly swap which word is citizen/impostor
  return Math.random() > 0.5
    ? { citizen: pair[0], impostor: pair[1] }
    : { citizen: pair[1], impostor: pair[0] };
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
    }))
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
    const room = rooms.get(code.toUpperCase());
    if (!room) return socket.emit('error', 'Soba nije pronađena.');
    if (room.state !== 'LOBBY') return socket.emit('error', 'Igra je već počela.');

    const existingByToken = playerToken ? room.players.find(p => p.playerToken === playerToken) : null;
    if (existingByToken) {
      cancelDisconnectRemoval(code.toUpperCase(), existingByToken.playerToken);
      existingByToken.id = socket.id;
      existingByToken.name = playerName || existingByToken.name;
      existingByToken.isConnected = true;
      existingByToken.disconnectedAt = null;
      socket.join(code.toUpperCase());
      socket.emit('sessionResumed', buildPlayerPayload(room, existingByToken));
      io.to(code.toUpperCase()).emit('roomUpdated', safeRoom(room));
      return;
    }

    if (room.players.length >= 10) return socket.emit('error', 'Soba je puna (max 10).');
    if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase()))
      return socket.emit('error', 'To ime je već zauzeto.');

    const token = playerToken || makePlayerToken();
    room.players.push({ id: socket.id, name: playerName, isHost: false, isReady: false, playerToken: token, isConnected: true, disconnectedAt: null });
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
    player.disconnectedAt = null;
    socket.join(room.code);
    socket.emit('sessionResumed', buildPlayerPayload(room, player));
    io.to(room.code).emit('roomUpdated', safeRoom(room));
  });

  // ── updateConfig
  socket.on('updateConfig', ({ code, category, impostors, discussionTime, votingTime }) => {
    const room = rooms.get((code || '').toUpperCase());
    if (!room || room.state !== 'LOBBY' || !room.players.find(p => p.id === socket.id && p.isHost)) return;
    if (WORDS[category]) room.category = category;
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
    room.votes = {}; room.results = null; room.words = null; room.scoreDeltas = {};
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
