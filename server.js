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
    ["Pizza","Burek"],["Hamburger","Ćevapi"],["Sushi","Riblji štapići"],["Torta","Kolač"],["Palačinke","Vafli"],["Sladoled","Puding"],["Kava","Čaj"],["Pivo","Cider"],["Sok","Cola"],["Kruh","Tortilja"],["Sir","Jogurt"],["Jaje","Kobasica"],["Tjestenina","Riža"],["Piletina","Puretina"],["Riba","Lignje"],["Salata","Pizza"],["Čokolada","Kolač"],["Čips","Pereci"],["Sendvič","Tost"],["Naranča","Grejpfrut"],["Jabuka","Kruška"],["Banana","Mango"],["Jagoda","Malina"],["Rajčica","Paprika"],["Krumpir","Mrkva"],["Luk","Češnjak"],["Tiramisu","Panna cotta"],["Krafna","Fritula"],["Nutella","Džem"],["Popcorn","Kikiriki"],["Smoothie","Kakao"],["Rižoto","Pomfrit"],["Pršut","Salama"],["Ajvar","Senf"],["Punjena paprika","Sarma"],["Lješnjak","Badem"],["Grah","Leća"],["Jaje na oko","Kuhano jaje"],["Hot dog","Kobasica"],["Cappuccino","Latte"],["Espresso","Turska kava"],["Kokos","Ananas"],["Lubenica","Dinja"],["Grožđe","Šljiva"]
  ],
  "Sport": [
    ["Nogomet","Ragbi"],["Košarka","Vaterpolo"],["Tenis","Badminton"],["Plivanje","Ronjenje"],["Boks","Karate"],["Sprint","Maraton"],["Skijanje","Snowboard"],["Biciklizam","Rolanje"],["Odbojka","Odbojka na pijesku"],["Golf","Nogomet"],["Gimnastika","Akrobatika"],["Judo","Hrvanje"],["Surfanje","Jedrenje"],["Penjanje","Planinarenje"],["Hokej","Klizanje"],["Maraton","Polumaraton"],["Veslanje","Kajak"],["Rukomet","Futsal"],["Joga","Pilates"],["Kickboxing","MMA"],["Streličarstvo","Pikado"],["Taekwondo","Kung fu"],["Stolni tenis","Biljar"],["Baseball","Košarka"],["Američki nogomet","Rukomet"],["Parkour","Trčanje s preprekama"],["Boćanje","Picigin"],["Ribolov","Lov"],["Skateboarding","BMX"]
  ],
  "Životinje": [
    ["Pas","Mačka"],["Mačka","Lav"],["Lav","Tigar"],["Slon","Nosorog"],["Majmun","Gorila"],["Delfin","Hobotnica"],["Konj","Magarac"],["Krava","Bik"],["Svinja","Ovca"],["Kokoš","Patka"],["Orao","Gavran"],["Sova","Papiga"],["Zec","Vjeverica"],["Medvjed","Panda"],["Pingvin","Tuljan"],["Flamingo","Pelikan"],["Žirafa","Deva"],["Koala","Klokan"],["Gepard","Puma"],["Krokodil","Gušter"],["Zmija","Leguan"],["Pčela","Osa"],["Leptir","Bubamara"],["Hobotnica","Lignja"],["Morski pas","Sabljarka"],["Labud","Čaplja"],["Miš","Hrčak"],["Jež","Krtica"],["Lama","Koza"],["Bizon","Los"],["Hijena","Šakal"],["Morski konjic","Meduza"],["Riba","Jegulja"]
  ],
  "Mjesta": [
    ["Plaža","Bazen"],["Škola","Fakultet"],["Bolnica","Privatna klinika"],["Restoran","Kafić"],["Kino","Kazalište"],["Tržnica","Supermarket"],["Crkva","Džamija"],["Park","Trg"],["Hotel","Apartman"],["Aerodrom","Kolodvor"],["Muzej","Galerija"],["Stadion","Igralište"],["Teretana","Sportski centar"],["Knjižnica","Knjižara"],["Banka","Mjenjačnica"],["Frizerski salon","Kozmetički salon"],["Zagreb","Split"],["Dubrovnik","Šibenik"],["Rijeka","Osijek"],["Pariz","Madrid"],["London","Berlin"],["New York","Los Angeles"],["Tokio","Bangkok"],["Planina","Brežuljak"],["Jezero","More"],["Otok","Poluotok"],["Dvorac","Tvrđava"],["Centar grada","Selo"],["Kamp","Bungalov"],["Zabavni park","Aquapark"],["Tržni centar","Prodavaonica"],["Benzinska postaja","Autopraonica"],["Igralište","Skatepark"],["Zoološki vrt","Akvarij"],["Vatrogasna postaja","Policijska postaja"]
  ],
  "Predmeti": [
    ["Mobitel","Tablet"],["Laptop","Tablet"],["Televizor","Projektor"],["Automobil","Motor"],["Bicikl","Skateboard"],["Motor","Moped"],["Kišobran","Kabanica"],["Torba","Ruksak"],["Novčanik","Torbica"],["Sat","Budilnik"],["Naočale","Sunčane naočale"],["Slušalice","Zvučnik"],["Knjiga","Tablet"],["Olovka","Kemijska"],["Bilježnica","Rokovnik"],["Šešir","Kačket"],["Čizme","Tenisice"],["Sandale","Papuče"],["Krevet","Kauč"],["Stol","Polica"],["Stolica","Fotelja"],["Hladnjak","Zamrzivač"],["Tava","Lonac"],["Nož","Vilica"],["Gitara","Ukulele"],["Klavir","Harmonika"],["Bubnjevi","Činele"],["Kamera","Telefon"],["Lopta","Frisbee"],["Karte","Šah"],["Sapun","Šampon"],["Četkica za zube","Konac za zube"],["Ručnik","Ogrtač"],["Punjač","Produžni kabel"],["Baterijska lampa","Svijeća"],["Metla","Usisavač"],["Pegla","Sušilo za kosu"]
  ],
  "Filmovi i serije": [
    ["Titanic","Pearl Harbor"],["The Godfather","Scarface"],["Inception","The Matrix"],["The Dark Knight","Joker"],["Pulp Fiction","Reservoir Dogs"],["Game of Thrones","House of the Dragon"],["Breaking Bad","Better Call Saul"],["Stranger Things","Dark"],["Friends","The Office"],["The Office","Brooklyn 99"],["Squid Game","Hunger Games"],["Money Heist","Lupin"],["Peaky Blinders","Boardwalk Empire"],["Narcos","Sicario"],["1917","Dunkirk"],["Interstellar","Gravity"],["Dune","Avatar"],["Avengers","Justice League"],["Harry Potter","Narnia"],["Star Wars","Star Trek"],["Parasite","Oldboy"],["Chernobyl","Narcos"],["Succession","Breaking Bad"],["Euphoria","Skins"],["Sherlock","Breaking Bad"],["The Wire","The Shield"],["Wednesday","Coraline"],["Emily in Paris","Sex and the City"],["Ted Lasso","Abbott Elementary"],["Severance","Black Mirror"],["The Bear","Ramsay's Kitchen Nightmares"],["White Lotus","The Undoing"],["The Mandalorian","Andor"],["The Hobbit","Rings of Power"],["Cobra Kai","Karate Kid"],["Yellowstone","Outer Range"]
  ],
  "Profesije": [
    ["Liječnik","Medicinska sestra"],["Zubar","Ortodont"],["Učitelj","Trener"],["Odgajatelj","Babysitter"],["Policajac","Detektiv"],["Vojnik","Specijalac"],["Kuhar","Dostavljač hrane"],["Farmer","Vrtlar"],["Taksist","Vozač autobusa"],["Pilot","Stjuardesa"],["Arhitekt","Građevinar"],["Električar","Vodoinstalater"],["Programer","Serviser"],["Fotograf","Novinar"],["Glumac","Pjevač"],["Novinar","Urednik"],["Odvjetnik","Sudac"],["Frizer","Kozmetičar"],["Psiholog","Logoped"],["Trener","Fizioterapeut"],["Ekonomist","Računovođa"],["Šumar","Lovočuvar"],["Ribar","Lovac"],["Tesar","Stolar"],["Vozač kamiona","Dostavljač"],["Redatelj","Scenarist"],["Prevoditelj","Lektor"],["Bibliotekar","Arhivist"],["Socijalni radnik","Pedagog"],["Meteorolog","Geograf"],["Mehaničar","Autolimar"]
  ],
  "Glazba": [
    ["Pop","Hip-hop"],["Rock","Elektronika"],["Jazz","Blues"],["Klasična","Film glazba"],["Elektronika","Techno"],["House","Trance"],["Reggae","Ska"],["Folk","Country"],["Soul","R&B"],["Punk","Grunge"],["Rap","Govor"],["Gitara","Bas gitara"],["Bubnjevi","Sintesajzer"],["Klavir","Harmonika"],["Violina","Viola"],["Koncert","Festival"],["Album","Single"],["Aplikacija","Radio"],["Ploča","Mobitel"],["Nagrada","MTV nagrada"],["Mikrofon","Zvučnik"],["Zbor","Bend"],["DJ","Producent"],["Balada","Himna"],["Disco","Funk"],["Coldplay","Radiohead"],["Beyoncé","Rihanna"],["Taylor Swift","Billie Eilish"],["Eminem","Kendrick Lamar"]
  ],
  "Svakodnevni život": [
    ["Jutarnja kava","Doručak"],["Buđenje","Alarm"],
    ["Tuš","Kupanje"],["Pranje zuba","Brijanje"],
    ["Odlazak na posao","Home office"],["Autom na posao","Pješice"],
    ["Ručak","Snack"],["Šetnja","Trčanje"],
    ["Kupovina","Online narudžba"],["Kuhanje","Naručivanje hrane"],
    ["Pranje posuđa","Perilica"],["Usisavanje","Brisanje prašine"],
    ["Gledanje TV-a","Streaming"],["Čitanje knjige","Audiobook"],
    ["Telefonski poziv","Video poziv"],["Poruka","Email"],
    ["Vikend izlet","Dan na plaži"],["Piknik","BBQ"],
    ["Posjet prijatelju","Obiteljski ručak"],
    ["Rodjendan","Proslava"],["Vjenčanje","Krštenje"],
    ["Godišnji odmor","Produženi vikend"]
  ],
  "Priroda": [
    ["Kiša","Tuča"],["Snijeg","Led"],["Vjetar","Oluja"],
    ["Sunce","Oblaci"],["Duga","Munja"],["Magla","Izmaglica"],
    ["Poplave","Suša"],["Planina","Brežuljak"],
    ["Rijeka","Potok"],["Jezero","Bara"],["More","Zaljev"],
    ["Šuma","Džungla"],["Livada","Polje"],
    ["Pustinja","Savana"],["Vulkan","Gejzir"],
    ["Hrast","Bor"],["Palma","Bambus"],
    ["Ruža","Lala"],["Suncokret","Lavanda"],
    ["Gljiva","Mahovina"],["Komarac","Muha"],
    ["Bubamara","Leptir"],["Mravi","Pčele"]
  ],
  "Tehnologija": [
    ["Mobitel","Pametni sat"],["Laptop","Tablet"],["WiFi","Bluetooth"],["Internet","Bez interneta"],["WhatsApp","Telegram"],["Signal","Viber"],["Instagram","TikTok"],["YouTube","Netflix"],["Google","Bing"],["Chrome","Firefox"],["iPhone","Android"],["Windows","Mac"],["USB","SD kartica"],["Printer","Skener"],["Miš","Touchpad"],["Tipkovnica","Dodirni ekran"],["Monitor","Projektor"],["Kamera","Webcam"],["PlayStation","Xbox"],["Nintendo","Steam Deck"],["Internet","USB"],["Lozinka","PIN"],["QR kod","Barcode"],["Robot","Dron"],["Asistent","Čovjek"],["VR","AR"],["Powerbank","Punjač"],["Pametna TV","IPTV"],["WiFi","Hotspot"]
  ],
  "Boje": [
    ["Crvena","Narančasta"],["Plava","Tirkizna"],["Zelena","Maslinasta"],["Žuta","Zlatna"],["Ljubičasta","Indigo"],["Ružičasta","Breskva"],["Smeđa","Bež"],["Crna","Tamno siva"],["Bijela","Krem"],["Siva","Bijela"],["Bordo","Tamnocrvena"],["Tirkizna","Mintna"],["Limeta","Neon zelena"],["Koraljna","Losos"],["Lavanda","Lila"],["Teget","Plava"],["Smeđa","Čokolada"]
  ],
  "Prijevoz": [
    ["Automobil","Kombi"],["Autobus","Taksi"],["Vlak","Avion"],["Avion","Helikopter"],["Bicikl","Romobil"],["Motor","Moped"],["Brod","Jedrilica"],["Taksi","Prijatelj vozi"],["Kamion","Traktor"],["Podmornica","Čamac"],["Žičara","Uspinjača"],["Kabriolet","Limuzina"],["Pickup","Džip"],["Kamp prikolica","Autodom"],["Električni auto","Benzinski auto"],["Električni romobil","Bicikl"]
  ],
  "Emocije": [
    ["Sreća","Uzbuđenje"],["Tuga","Melankolija"],["Ljutnja","Frustracija"],["Strah","Uzbuđenje"],["Iznenađenje","Zbunjenost"],["Gađenje","Nelagoda"],["Ljubav","Divljenje"],["Zavist","Razočaranje"],["Ponos","Samopouzdanje"],["Stid","Neugoda"],["Krivnja","Žaljenje"],["Nada","Optimizam"],["Dosada","Umor"],["Zahvalnost","Ponos"],["Nostalgija","Čežnja"],["Panika","Strah"]
  ],
  "Godišnja doba i praznici": [
    ["Proljeće","Ljeto"],["Jesen","Zima"],["Božić","Nova godina"],["Uskrs","Fašnik"],["Valentinovo","Majčin dan"],["Halloween","Maskenbal"],["Karneval","Maskenbal"],["Dan državnosti","Dan neovisnosti"],["Majčin dan","Očev dan"],["Proslava","Godišnjica"],["Ljetni odmor","Zimski odmor"],["Doček Nove godine","Silvestar"]
  ],
  "Hobiji": [
    ["Slikanje","Fotografija"],["Fotografija","Snimanje videa"],["Kuhanje","Naručivanje hrane"],["Vrtlarstvo","Uzgoj biljaka"],["Šivanje","Pletenje"],["Čitanje","Podcast"],["Igranje igara","Sport"],["Kolekcionarstvo","Skupljanje marki"],["Planinarenje","Kampiranje"],["Ribolov","Lov"],["Plesanje","Pjevanje"],["Meditacija","Joga"],["Origami","Modelarstvo"],["3D printanje","Modelarstvo"],["Mađioničarstvo","Žongliranje"],["Podcasting","Blogging"],["Sudoku","Križaljka"],["Escape room","Društvene igre"]
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
    room.words = getRandomWord(room.category, code);
    room.state = 'REVEAL';
    room.votes = {};
    room.impostorGuess = null;

    room.players.forEach(p => { const key = scoreKey(p); if (room.scores[key] === undefined) room.scores[key] = 0; });

    const shuffled = [...room.players].sort(() => Math.random() - 0.5);
    const impCount = Math.min(room.impostorCount, Math.floor(room.players.length / 2));
    const impIds = new Set(shuffled.slice(0, impCount).map(p => p.id));
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
    if (!room || room.state !== 'REVEAL') return;
    const p = room.players.find(p => p.id === socket.id);
    if (!p || p.hasRevealed) return; // prevent double-fire
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
