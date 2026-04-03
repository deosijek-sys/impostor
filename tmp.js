
// ── AUDIO ─────────────────────────────────────────────────────────────────────
let AC; function gAC(){ if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}} return AC; }
function beep(f=440,d=.1,v=.25,t='sine'){
  try{const a=gAC();if(!a)return;if(a.state==='suspended')a.resume();
  const o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);
  o.frequency.value=f;o.type=t;g.gain.setValueAtTime(v,a.currentTime);
  g.gain.exponentialRampToValueAtTime(.001,a.currentTime+d);
  o.start(a.currentTime);o.stop(a.currentTime+d);}catch(e){}}
const SFX={
  join:()=>{beep(660,.08,.2);setTimeout(()=>beep(880,.1,.2),100);},
  reveal:()=>{beep(500,.06,.18);setTimeout(()=>beep(620,.1,.18),90);},
  imp:()=>{beep(220,.18,.28,'sawtooth');setTimeout(()=>beep(160,.22,.22,'sawtooth'),130);},
  tick:()=>beep(900,.04,.1),
  warn:()=>{beep(440,.08,.22);setTimeout(()=>beep(330,.12,.2),90);},
  vote:()=>beep(660,.06,.15),
  win:()=>{[0,100,200].forEach((d,i)=>setTimeout(()=>beep([523,659,784][i],.15,.2),d));},
  lose:()=>{beep(300,.2,.22,'sawtooth');setTimeout(()=>beep(200,.28,.2,'sawtooth'),160);},
  next:()=>beep(600,.07,.15),
};

// ── STATE ─────────────────────────────────────────────────────────────────────
const socket=io({
  transports:['websocket'],
  upgrade:false,
  reconnection:true,
  reconnectionAttempts:Infinity,
  reconnectionDelay:1000,
  reconnectionDelayMax:5000,
  timeout:20000
});
let G={},me=null,myWord=null,myRole=null,selVote=null,impCount=1,discTotal=120,voteTotal=60;
let micStream=null,pcs={},pendingOffers=[],rulesFrom='s-join';
let micWanted=false,micInitPromise=null,micRestartTimer=null,resumeTried=false;
const SESSION_KEY='impostor.session.v1';
const AUDIO_PREFS_KEY='impostor.audioPrefs.v2';
let selfMuted=false, remoteMuted={}, remoteMeters={}, localMeterStop=null;
let mobileResumeLock=false, lastMicInitAt=0;

const $=id=>document.getElementById(id);
const ini=n=>(n||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const esc=s=>String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const meNow=()=>G?.players?G.players.find(p=>p.id===socket.id):null;
const connectedPlayers=()=> (G?.players||[]).filter(p=>p.isConnected!==false);
const disconnectedPlayers=()=> (G?.players||[]).filter(p=>p.isConnected===false);
const canManagePlayer=p=> !!(me?.isHost && p && p.id!==socket.id);

function show(id){
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('on'));
  $(id).classList.add('on');
  document.querySelector('.scroll').scrollTo(0,0);
}
function badge(){
  if(!me){ $('pb').classList.remove('on'); $('btn-rules-icon').style.display='none'; return; }
  $('pbav').textContent=ini(me.name);
  $('pbname').textContent=me.name;
  $('pb').classList.add('on');
  $('btn-rules-icon').style.display='flex';
}

function toast(msg,dur=2600){
  const t=$('toast');t.textContent=msg;t.classList.add('on');
  clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('on'),dur);
}
function spinner(name,cb){
  $('spn-name').textContent=(name||'').toUpperCase();
  $('spinov').classList.add('on');
  SFX.join();
  setTimeout(()=>{$('spinov').classList.remove('on');cb&&cb();},2600);
}
function fmt(s){return s>=60?`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`:`${s}s`;}
function saveSession(extra={}){
  const current=JSON.parse(localStorage.getItem(SESSION_KEY)||'{}');
  const next={
    code:G?.code||current.code||'',
    name:me?.name||$('j-name')?.value?.trim()||current.name||'',
    playerToken:current.playerToken||'',
    ...extra
  };
  if(next.code||next.name||next.playerToken)localStorage.setItem(SESSION_KEY,JSON.stringify(next));
}
function getSession(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'{}');}catch{return {};}}
function clearSession(){localStorage.removeItem(SESSION_KEY);}
function leaveToHome({ keepName = true, toastMessage = '' } = {}){
  const ss = getSession();
  const fallbackName = me?.name || $('j-name')?.value?.trim() || ss.name || '';
  if (keepName && fallbackName) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: fallbackName }));
  } else {
    clearSession();
  }
  stopMic({ fullStop: true });
  G = null;
  me = null;
  myWord = '';
  myRole = '';
  badge();
  $('j-err').textContent = '';
  $('j-code').value = '';
  if (fallbackName) $('j-name').value = fallbackName;
  show('s-join');
  if (toastMessage) toast(toastMessage);
}
function requestLeaveRoom(){
  if (!G?.code) return leaveToHome({ keepName: true });
  socket.emit('leaveRoom', { code: G.code });
}
function maybeResumeSession(){
  if(resumeTried) return;
  resumeTried=true;
  const ss=getSession();
  if(ss.code&&ss.name&&ss.playerToken){
    $('j-name').value=ss.name;
    $('j-code').value=ss.code;
    socket.emit('resumeSession', ss);
  } else {
    if(ss.name) $('j-name').value=ss.name;
    if(ss.code) $('j-code').value=ss.code;
  }
}


function getAudioPrefs(){try{return JSON.parse(localStorage.getItem(AUDIO_PREFS_KEY)||'{}');}catch{return {};}}
function saveAudioPrefs(){localStorage.setItem(AUDIO_PREFS_KEY,JSON.stringify({selfMuted,remoteMuted}));}
function loadAudioPrefs(){
  const prefs=getAudioPrefs();
  selfMuted=!!prefs.selfMuted;
  remoteMuted=prefs.remoteMuted||{};
}
function applySelfMute(){
  if(micStream){ micStream.getAudioTracks().forEach(t=>{t.enabled=!selfMuted;}); }
  updateVoiceButtons();
  if(selfMuted) setMicUi('idle','Mikrofon utišan');
  else if(hasLiveMic()) setMicUi('live','Mikrofon aktivan · Svi se čuju');
}
function updateVoiceButtons(){
  ['btn-self-mute','btn-self-mute-res'].forEach(id=>{
    const b=$(id); if(!b) return;
    b.textContent=selfMuted?'MIC OFF':'MIC ON';
    b.className='vbtn '+(selfMuted?'muted':'live');
  });
}
async function unlockAudio(){
  try{ const a=gAC(); if(a?.state==='suspended') await a.resume(); }catch(e){}
  document.querySelectorAll('audio').forEach(au=>au.play?.().catch(()=>{}));
  toast('Audio aktiviran');
}
function speakerStatus(pid){
  const p=(G.players||[]).find(x=>x.id===pid);
  if(!p) return 'Igrač';
  const tags=[];
  if(pid===socket.id) tags.push('Vi');
  if(p.role==='IMPOSTOR') tags.push('IMPOSTOR');
  else if(p.role==='CITIZEN') tags.push('CITIZEN');
  if(p.isHost) tags.push('HOST');
  return tags.join(' · ') || 'Igrač';
}
function setVoiceLevel(pid, level){
  document.querySelectorAll(`[data-vmeter="${pid}"] > span`).forEach(el=>el.style.width=`${Math.max(0,Math.min(100,level))}%`);
  document.querySelectorAll(`[data-vrow="${pid}"]`).forEach(el=>el.classList.toggle('speaking', level>18));
}
function monitorRemoteStream(pid, stream){
  try{ if(remoteMeters[pid]?.stop) remoteMeters[pid].stop(); }catch(e){}
  try{
    const a=gAC(); if(!a) return;
    const src=a.createMediaStreamSource(stream), an=a.createAnalyser();
    an.fftSize=128; src.connect(an);
    const buf=new Uint8Array(an.frequencyBinCount);
    let live=true;
    remoteMeters[pid]={stop:()=>{live=false; try{src.disconnect();an.disconnect();}catch(e){}; setVoiceLevel(pid,0);}};
    (function tick(){
      if(!live) return;
      an.getByteFrequencyData(buf);
      const avg=buf.reduce((s,v)=>s+v,0)/buf.length;
      setVoiceLevel(pid, avg*1.8);
      requestAnimationFrame(tick);
    })();
  }catch(e){}
}
function stopRemoteMonitor(pid){
  try{remoteMeters[pid]?.stop?.();}catch(e){}
  delete remoteMeters[pid];
}
function renderVoiceList(targetId){
  const host=$(targetId); if(!host) return;
  host.innerHTML='';
  (G.players||[]).forEach(p=>{
    const row=document.createElement('div'); row.className='vrow'; row.dataset.vrow=p.id;
    const muted=!!remoteMuted[p.id];
    const offline=p.isConnected===false;
    const actionBtn = p.id===socket.id
      ? '<button class="vtoggle '+(selfMuted?'on':'')+'" data-self-toggle="1">'+(selfMuted?'UNMUTE':'MUTE')+'</button>'
      : ((canManagePlayer(p) && offline)
          ? '<button class="vtoggle on" data-remove-player="'+p.id+'">UKLONI</button>'
          : ((canManagePlayer(p) && G.state==='DISCUSSION')
              ? '<button class="vtoggle warn" data-kick-player="'+p.id+'">IZBACI</button>'
              : '<button class="vtoggle '+(muted?'on':'')+'" data-peer-toggle="'+p.id+'">'+(muted?'UNMUTE':'MUTE')+'</button>'));
    row.innerHTML=`<div class="av ${p.id===socket.id?'t':(p.isHost?'r':'')}">${ini(p.name)}</div>
      <div class="vmeta"><div class="vname">${esc(p.name)}</div><div class="vsub">${esc(speakerStatus(p.id))}${offline?' · OFFLINE':''}</div></div>
      <div class="vmeter" data-vmeter="${p.id}"><span></span></div>
      ${actionBtn}`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-peer-toggle]').forEach(btn=>btn.onclick=()=>toggleRemoteMute(btn.dataset.peerToggle));
  host.querySelectorAll('[data-self-toggle]').forEach(btn=>btn.onclick=()=>toggleSelfMute());
  host.querySelectorAll('[data-remove-player]').forEach(btn=>btn.onclick=()=>removeDisconnectedPlayer(btn.dataset.removePlayer));
  host.querySelectorAll('[data-kick-player]').forEach(btn=>btn.onclick=()=>kickPlayer(btn.dataset.kickPlayer));
}
function renderHostTools(targetId){
  const box=$(targetId); if(!box) return;
  const offline=disconnectedPlayers().filter(p=>canManagePlayer(p));
  const kickable=(G.players||[]).filter(p=>canManagePlayer(p) && p.isConnected!==false);
  if(!me?.isHost || !((G.state==='DISCUSSION' && kickable.length) || ((G.state==='DISCUSSION' || G.state==='RESULTS') && offline.length))){ box.style.display='none'; box.innerHTML=''; return; }
  box.style.display='block';
  const sections=[];
  if(G.state==='DISCUSSION' && kickable.length){
    sections.push(`<div class="rowb g8"><span class="lbl" style="margin-bottom:0;">Izbaci igrača</span><span class="pstatus">${kickable.length}</span></div>` + kickable.map(p=>`<div class="row"><div><div class="pn">${esc(p.name)}</div><div class="ps">Host može izbaciti igrača tijekom diskusije</div></div><button class="mini-btn" data-kick-live="${p.id}">IZBACI</button></div>`).join(''));
  }
  if((G.state==='DISCUSSION' || G.state==='RESULTS') && offline.length){
    sections.push(`<div class="rowb g8" style="margin-top:${sections.length?10:0}px;"><span class="lbl" style="margin-bottom:0;">Offline igrači</span><span class="pstatus off">${offline.length}</span></div>` + offline.map(p=>`<div class="row"><div><div class="pn">${esc(p.name)}</div><div class="ps">Izgubio vezu · host ga može ukloniti</div></div><button class="mini-btn warn" data-remove-offline="${p.id}">UKLONI</button></div>`).join(''));
  }
  box.innerHTML=sections.join('');
  box.querySelectorAll('[data-remove-offline]').forEach(btn=>btn.onclick=()=>removeDisconnectedPlayer(btn.dataset.removeOffline));
  box.querySelectorAll('[data-kick-live]').forEach(btn=>btn.onclick=()=>kickPlayer(btn.dataset.kickLive));
}
function renderAllVoiceLists(){ renderVoiceList('voice-list'); renderVoiceList('voice-list-res'); renderHostTools('disc-host-tools'); renderHostTools('res-host-tools'); }
function applyRemoteMute(pid){
  const au=document.getElementById('au-'+pid);
  if(au) au.muted=!!remoteMuted[pid];
  renderAllVoiceLists();
}
function toggleRemoteMute(pid){ remoteMuted[pid]=!remoteMuted[pid]; saveAudioPrefs(); applyRemoteMute(pid); }
function toggleSelfMute(){ selfMuted=!selfMuted; saveAudioPrefs(); applySelfMute(); renderAllVoiceLists(); }

// ── RULES ─────────────────────────────────────────────────────────────────────
$('btn-rules-join').onclick=()=>{rulesFrom='s-join';show('s-rules');};
$('btn-rules-icon').onclick=()=>{rulesFrom=document.querySelector('.sc.on')?.id||'s-lobby';show('s-rules');};
$('btn-rbk').onclick=$('btn-rbk2').onclick=()=>show(rulesFrom);

// ── JOIN ──────────────────────────────────────────────────────────────────────
$('btn-join').onclick=()=>{
  const name=$('j-name').value.trim(),code=$('j-code').value.trim().toUpperCase(),err=$('j-err');
  err.textContent='';
  if(!name){err.textContent='Unesite ime agenta.';return;}
  if(!code||code.length<3){err.textContent='Unesite ispravan kod sobe.';return;}
  saveSession({code,name,playerToken:getSession().playerToken||''});
  socket.emit('joinRoom',{code,playerName:name,playerToken:getSession().playerToken||'',roomPin:$('j-pin').value.trim()});
};
$('j-code').oninput=function(){this.value=this.value.toUpperCase();};
$('j-pin').oninput=function(){this.value=this.value.replace(/\D/g,'').slice(0,6);};
$('cfg-pin').oninput=function(){this.value=this.value.replace(/\D/g,'').slice(0,6);};
$('btn-create').onclick=()=>{
  const name=$('j-name').value.trim();
  if(!name){$('j-err').textContent='Unesite ime agenta.';return;}
  saveSession({name});
  socket.emit('createRoom',{playerName:name,playerToken:getSession().playerToken||''});
};

// ── LOBBY ─────────────────────────────────────────────────────────────────────
function renderLobby(){
  if(!G||!$('l-code'))return;
  const customCount=(G.customWords||[]).length;
  $('l-code').textContent=G.code;
  $('rnd').textContent=G.roundNumber>0?`R${G.roundNumber}`:'';
  $('l-round').textContent=G.roundNumber>0?`Runda ${G.roundNumber}`:'Lobby';
  $('chip-category').textContent=G.category;
  $('chip-impostors').textContent=`${G.impostorCount} ${G.impostorCount===1?'impostor':'impostora'}`;
  $('chip-custom').textContent=customCount>=6?`${customCount} custom riječi · fair mode`:'Standardne riječi';
  $('chip-privacy').textContent=G.privateRoom?'Privatna soba':'Javna soba';
  $('chip-privacy').className=`chip ${G.privateRoom?'lock':''}`;
  const activePlayers=connectedPlayers();
  const rc=activePlayers.filter(p=>p.isReady || p.isHost).length;
  $('rcount').textContent=`${rc}/${activePlayers.length}`;
  $('l-status-mini').textContent=`${activePlayers.length} aktivno · ${(G.players||[]).length-activePlayers.length} offline`;
  const isHost=me&&me.isHost;
  $('hcfg').style.display=isHost?'block':'none';
  $('cfg-cat').disabled=!isHost; $('cfg-disc').disabled=!isHost; $('cfg-vote').disabled=!isHost;
  $('cfg-private').disabled=!isHost; $('cfg-pin').disabled=!isHost; $('cfg-custom').disabled=!isHost;
  $('imp-m').disabled=!isHost; $('imp-p').disabled=!isHost;
  $('l-wait').style.display=isHost?'none':'block';
  $('btn-start').style.display='none';
  if(isHost){
    $('cfg-cat').value=G.category;
    $('imp-v').textContent=G.impostorCount;impCount=G.impostorCount;
    $('cfg-disc').value=String(Math.max(1, Math.round((G.discussionTime || 120)/60)));
    $('cfg-vote').value=String(Math.max(1, Math.round((G.votingTime || 60)/60)));
    $('cfg-private').checked=!!G.privateRoom;
    $('cfg-pin').value=G.roomPin||'';
    $('cfg-custom').value=(G.customWords||[]).join(', ');
    $('pin-wrap').style.display=G.privateRoom?'block':'none';
    const needsFairHost=customCount>=6;
    const minPlayers=needsFairHost?4:3;
    const ok=activePlayers.length>=minPlayers&&activePlayers.every(p=>p.isReady || p.isHost);
    $('btn-start').style.display=ok?'flex':'none';
    $('l-err').textContent=activePlayers.length<minPlayers?`Potrebno još ${minPlayers-activePlayers.length} igrač(a) ${needsFairHost?'(min 4 zbog fair custom mode-a)':'(min 3)'}`:(!ok?'Čekanje da svi povezani igrači budu spremni...':'');
  } else {
    $('pin-wrap').style.display='none';
  }
  const list=$('plist');list.innerHTML='';
  G.players.forEach(p=>{
    const sc=p.score??0;
    const offline=p.isConnected===false;
    const status = offline ? '<span class="pstatus off">offline</span>' : `<div class="dot ${(p.isReady || p.isHost)?'on':''}"></div>`;
    const action = canManagePlayer(p)
      ? (offline
          ? `<button class="mini-btn warn" data-remove="${p.id}">UKLONI</button>`
          : ((G.state==='LOBBY' || G.state==='DISCUSSION') ? `<button class="mini-btn" data-kick="${p.id}">IZBACI</button>` : ''))
      : '';
    const d=document.createElement('div');d.className='pr';
    d.innerHTML=`<div class="av ${p.isHost?'r':''}">${ini(p.name)}</div><div class="pi"><div class="pn">${esc(p.name)}</div><div class="ps">${p.isSpectator?'Host moderator':(p.isHost?'Host · Leader':'Operative')}${offline?' · Offline':''}</div></div><div style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--tx3);margin-right:5px;">${sc}pt</div><div class="pactions">${action}${status}</div>`;
    list.appendChild(d);
  });
  list.querySelectorAll('[data-kick]').forEach(btn=>btn.onclick=()=>kickPlayer(btn.dataset.kick));
  list.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>removeDisconnectedPlayer(btn.dataset.remove));
  const mr=me&&me.isReady;
  $('btn-ready').textContent=mr?'NIJE SPREMAN':'SPREMAN';
  $('btn-ready').className=`btn ${mr?'bo':'bt'} mb`;
}
function kickPlayer(targetId){ if(!me?.isHost) return; socket.emit('kickPlayer',{code:G.code,targetId}); }
function removeDisconnectedPlayer(targetId){ if(!me?.isHost) return; socket.emit('removeDisconnectedPlayer',{code:G.code,targetId}); }
function emitCfg(){socket.emit('updateConfig',{code:G.code,category:$('cfg-cat').value,impostors:impCount,discussionTime:(parseInt($('cfg-disc').value)||2)*60,votingTime:(parseInt($('cfg-vote').value)||1)*60,privateRoom:$('cfg-private').checked,roomPin:$('cfg-pin').value.trim(),customWords:$('cfg-custom').value});}
$('cfg-cat').onchange=$('cfg-disc').onchange=$('cfg-vote').onchange=$('cfg-pin').onchange=emitCfg;
$('cfg-private').onchange=()=>{ $('pin-wrap').style.display=$('cfg-private').checked?'block':'none'; emitCfg(); };
$('cfg-custom').onblur=emitCfg;
$('imp-m').onclick=()=>{impCount=Math.max(1,impCount-1);$('imp-v').textContent=impCount;emitCfg();};
$('imp-p').onclick=()=>{impCount=Math.min(3,impCount+1);$('imp-v').textContent=impCount;emitCfg();};
$('btn-ready').onclick=()=>socket.emit('toggleReady',{code:G.code});
$('btn-start').onclick=()=>socket.emit('startGame',{code:G.code});

// ── REVEAL ────────────────────────────────────────────────────────────────────
function setupReveal(){
  const btn=$('btn-rev-done');
  btn.disabled=false;btn.textContent='VIDIO SAM — GOTOVO ✓';btn.style.opacity='1';
  $('reroll-wrap').style.display=(me&&me.isHost)?'block':'none';
  const isImp=myRole==='IMPOSTOR';
  const isSpectator=myRole==='SPECTATOR';
  $('fb-lbl').textContent=isSpectator?'Host moderira ovu rundu':(isImp?'⚠ Vaša riječ (IMPOSTOR)':'Vaša riječ');
  $('fb-word').textContent=isSpectator?'BEZ RIJEČI':(myWord||'?');
  $('fb-word').className='fb-word'+(isImp?' ri':'');
  $('fback').className='fb'+(isImp?' fi':'');
  $('fb-role').innerHTML=`<span class="rtag ${isSpectator?'':(isImp?'imp':'cit')}">${isSpectator?'HOST MODERATOR':(isImp?'IMPOSTOR':'CITIZEN')}</span>`;
  $('fwrap').classList.remove('flip');
  updateRevealProgress(0,(G.players||[]).filter(p=>!p.isSpectator).length);
  if(isImp){setTimeout(()=>{SFX.imp();toast('⚠ Ti si IMPOSTOR! Pazi što govoriš.',3500);},400);}
  if(isSpectator){setTimeout(()=>toast('Fair custom mode: ti moderiraš rundu i nemaš tajnu riječ.',3600),250);}
  wantMic(true);
}
function updateRevealProgress(done,total){
  $('rev-count').textContent=`${done}/${total}`;
  $('rev-fill').style.width=`${total>0?(done/total*100):0}%`;
}
function revealIdentityCard(){
  const card=$('fwrap');
  if(!card) return;
  if(card.classList.contains('flip')) return;
  card.classList.add('revealing');
  SFX.reveal();
  requestAnimationFrame(()=>{
    card.classList.add('flip');
    window.setTimeout(()=>card.classList.remove('revealing'),700);
  });
}
function bindRevealCard(){
  const card=$('fwrap');
  if(!card || card.dataset.bound==='1') return;
  const onReveal=(e)=>{
    if(e.type==='touchend') e.preventDefault();
    if(e.type==='keydown' && !['Enter',' '].includes(e.key)) return;
    revealIdentityCard();
  };
  ['click','touchend','keydown'].forEach(evt=>{
    card.addEventListener(evt,onReveal,{passive:false});
  });
  card.dataset.bound='1';
}
bindRevealCard();
$('btn-rev-done').onclick=()=>{
  if(myRole==='SPECTATOR'){
    $('btn-rev-done').disabled=true;
    $('btn-rev-done').textContent='MODERIRAM RUNDU ✓';
    $('btn-rev-done').style.opacity='.5';
    return;
  }
  socket.emit('playerReady',{code:G.code});
  $('btn-rev-done').disabled=true;
  $('btn-rev-done').textContent='POTVRĐENO ✓';
  $('btn-rev-done').style.opacity='.5';
};
$('btn-reroll').onclick=()=>{
  socket.emit('rerollWord',{code:G.code});
  toast('↻ Nova riječ u pripremi...');
};
socket.on('wordRerolled',room=>{
  myWord=room.myWord;myRole=room.myRole;
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  setupReveal();
  toast('↻ Riječ promijenjena — svi potvrđuju iznova');SFX.next();
});

// ── DISCUSSION ────────────────────────────────────────────────────────────────
function setupDisc(room){
  const isHost=me&&me.isHost;
  $('disc-host').style.display=isHost?'block':'none';
  $('disc-wait').style.display=isHost?'none':'block';
  discTotal=room.discussionTime||120;
  renderAllVoiceLists();
  updateVoiceButtons();
  wantMic(true); // production-safe: uvijek osiguraj aktivan mikrofon u discussion fazi
}
$('btn-start-vote').onclick=()=>socket.emit('startVoting',{code:G.code});

// ── OPEN MIC ──────────────────────────────────────────────────────────────────
function makeAudio(id){
  let au=document.getElementById('au-'+id);
  if(!au){au=document.createElement('audio');au.id='au-'+id;au.autoplay=true;au.playsInline=true;document.body.appendChild(au);}
  au.muted=!!remoteMuted[id];
  return au;
}
function removeAudio(pid){
  stopRemoteMonitor(pid);
  const au=document.getElementById('au-'+pid);
  if(au){au.srcObject=null;au.remove();}
  setVoiceLevel(pid,0);
}
function hasLiveMic(){
  return !!(micStream && micStream.getAudioTracks().some(t=>t.readyState==='live'));
}
function setMicUi(state,msg){
  $('mtxt').textContent=msg;
  $('mled').classList.toggle('live',state==='live');
  $('mwaves').style.display=state==='live'?'flex':'none';
  if(state!=='live') $('mled').style.background='var(--tx3)';
}
function scheduleMicEnsure(delay=500,{force=false}={}){
  clearTimeout(micRestartTimer);
  micRestartTimer=setTimeout(()=>{if(micWanted) initMic({force:force || !hasLiveMic()}).catch(()=>{});},delay);
}
function teardownPeerGraph(){
  Object.entries(pcs).forEach(([pid,pc])=>{try{pc.onicecandidate=null;pc.ontrack=null;pc.close();}catch(e){} removeAudio(pid);});
  pcs={};
  pendingOffers=[];
}
function stopMic({fullStop=true}={}){
  clearTimeout(micRestartTimer);
  if(micStream){
    try{if(localMeterStop)localMeterStop(); localMeterStop=null;}catch(e){}
    try{if(micStream._stopMon)micStream._stopMon();}catch(e){}
    micStream.getTracks().forEach(t=>{try{t.onended=null;t.onmute=null;t.onunmute=null;t.stop();}catch(e){}});
    micStream=null;
  }
  teardownPeerGraph();
  if(fullStop){
    micWanted=false;
    setMicUi('idle','Mikrofon neaktivan');
  }
  renderAllVoiceLists();
  updateVoiceButtons();
}

function bindMicTrackLifecycle(stream){
  stream.getAudioTracks().forEach(track=>{
    track.onended=()=>{setMicUi('idle','Mikrofon prekinut — ponovno spajanje...'); if(micWanted) scheduleMicEnsure(300);};
    track.onmute=()=>{setMicUi('idle','Mikrofon utišan ili nedostupan...');};
    track.onunmute=()=>{if(hasLiveMic()) setMicUi('live','Mikrofon aktivan · Svi se čuju');};
  });
}
async function initMic({force=false}={}){
  if(micInitPromise) return micInitPromise;
  if(!force && hasLiveMic()) return micStream;

  const now=Date.now();
  if(now-lastMicInitAt<1200 && hasLiveMic()) return micStream;
  lastMicInitAt=now;

  micInitPromise=(async()=>{
    setMicUi('pending','Spajanje mikrofona...');
    const oldStream=micStream;
    try{
      const stream=await navigator.mediaDevices.getUserMedia({
        audio:{
          echoCancellation:true,
          noiseSuppression:true,
          autoGainControl:true,
          channelCount:1
        },
        video:false
      });
      micStream=stream;
      bindMicTrackLifecycle(stream);
      applySelfMute();
      if(!selfMuted) setMicUi('live','Mikrofon aktivan · Svi se čuju');
      monitorMic();
      renderAllVoiceLists();

      if(oldStream && oldStream!==stream){
        try{if(oldStream._stopMon)oldStream._stopMon();}catch(e){}
        oldStream.getTracks().forEach(t=>{try{t.onended=null;t.onmute=null;t.onunmute=null;t.stop();}catch(e){}});
      }

      teardownPeerGraph();
      (G.players||[]).forEach(p=>{if(p.id!==socket.id)initPC(p.id);});
      const queued=[...pendingOffers];pendingOffers=[];
      for(const {from,offer} of queued) await handleOffer(from,offer);
      return stream;
    }catch(e){
      console.error('Mic init failed',e);
      setMicUi('idle','Mikrofon nedostupan — pričajte uživo');
      toast('⚠ Mikrofon nije dostupan');
      throw e;
    }finally{
      micInitPromise=null;
    }
  })();

  return micInitPromise;
}
function wantMic(enabled){
  micWanted=enabled;
  if(enabled) initMic({force:!hasLiveMic()}).catch(()=>{});
  else stopMic({fullStop:true});
}
function monitorMic(){
  if(!micStream)return;
  try{
    const a=gAC();if(!a)return;
    const src=a.createMediaStreamSource(micStream),an=a.createAnalyser();
    an.fftSize=128;src.connect(an);
    const buf=new Uint8Array(an.frequencyBinCount);
    let alive=true;
    localMeterStop=()=>{alive=false; try{src.disconnect();an.disconnect();}catch(e){}; setVoiceLevel(socket.id,0);};
    micStream._stopMon=localMeterStop;
    (function tick(){
      if(!alive||!micStream)return;
      an.getByteFrequencyData(buf);
      const avg=buf.reduce((s,v)=>s+v,0)/buf.length;
      $('mled').style.background=selfMuted?'var(--tx3)':(avg>12?'var(--red)':'var(--teal)');
      setVoiceLevel(socket.id, selfMuted?0:(avg*1.8));
      requestAnimationFrame(tick);
    })();
  }catch(e){}
}

function initPC(pid){
  if(!hasLiveMic()||pcs[pid])return;
  const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
  const pc=new RTCPeerConnection(ICE);pcs[pid]=pc;
  micStream.getTracks().forEach(t=>pc.addTrack(t,micStream));
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('rtc-ice',{to:pid,candidate:e.candidate});};
  pc.ontrack=e=>{const au=makeAudio(pid); au.srcObject=e.streams[0]; au.play?.().catch(()=>{}); monitorRemoteStream(pid,e.streams[0]); renderAllVoiceLists();};
  pc.onconnectionstatechange=()=>{
    if(['failed','disconnected','closed'].includes(pc.connectionState)){
      removeAudio(pid);
      if(micWanted && pc.connectionState!=='closed'){ try{pc.close();}catch(e){} delete pcs[pid]; scheduleMicEnsure(700); }
    }
  };
  pc.createOffer().then(async o=>{await pc.setLocalDescription(o);socket.emit('rtc-offer',{to:pid,offer:o});}).catch(()=>{});
}
async function handleOffer(from,offer){
  if(!hasLiveMic()){ pendingOffers.push({from,offer}); if(micWanted) initMic().catch(()=>{}); return; }
  if(pcs[from]){try{pcs[from].close();}catch(e){} delete pcs[from];}
  const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}]};
  const pc=new RTCPeerConnection(ICE);pcs[from]=pc;
  micStream.getTracks().forEach(t=>pc.addTrack(t,micStream));
  pc.onicecandidate=e=>{if(e.candidate)socket.emit('rtc-ice',{to:from,candidate:e.candidate});};
  pc.ontrack=e=>{const au=makeAudio(from); au.srcObject=e.streams[0]; au.play?.().catch(()=>{}); monitorRemoteStream(from,e.streams[0]); renderAllVoiceLists();};
  pc.onconnectionstatechange=()=>{
    if(['failed','disconnected','closed'].includes(pc.connectionState)){
      removeAudio(from);
      if(micWanted && pc.connectionState!=='closed'){ try{pc.close();}catch(e){} delete pcs[from]; scheduleMicEnsure(700); }
    }
  };
  try{
    await pc.setRemoteDescription(offer);
    const ans=await pc.createAnswer();
    await pc.setLocalDescription(ans);
    socket.emit('rtc-answer',{to:from,answer:ans});
  }catch(e){}
}
socket.on('rtc-offer',({from,offer})=>{
  if(!hasLiveMic()){pendingOffers.push({from,offer}); if(micWanted) initMic().catch(()=>{});}
  else handleOffer(from,offer);
});
socket.on('rtc-answer',({from,answer})=>pcs[from]?.setRemoteDescription(answer).catch(()=>{}));
socket.on('rtc-ice',({from,candidate})=>pcs[from]?.addIceCandidate(candidate).catch(()=>{}));

function safeMobileResume(){
  if(!micWanted) return;
  if(mobileResumeLock) return;
  mobileResumeLock=true;
  setTimeout(()=>{
    if(micWanted && (G.state==='DISCUSSION' || G.state==='RESULTS')){
      initMic({force:!hasLiveMic()}).catch(()=>{});
    }
    mobileResumeLock=false;
  },1200);
}
window.addEventListener('focus',safeMobileResume);
window.addEventListener('pageshow',safeMobileResume);
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible') safeMobileResume();
});
if(navigator.mediaDevices?.addEventListener){
  navigator.mediaDevices.addEventListener('devicechange',()=>{if(micWanted) safeMobileResume();});
}
window.addEventListener('online',()=>{if(micWanted) safeMobileResume();});

// ── TIMER ─────────────────────────────────────────────────────────────────────
socket.on('timer',({phase,remaining})=>{
  if(phase==='discussion'){
    const pct=Math.max(0,remaining/discTotal*100);
    const bar=$('disc-tf'),val=$('disc-tv');
    if(bar){bar.style.width=pct+'%';bar.style.background=pct<25?'var(--red)':pct<50?'var(--amb)':'var(--teal)';}
    if(val){val.textContent=fmt(remaining);val.style.color=remaining<=10?'var(--red)':remaining<=30?'var(--amb)':'var(--tx2)';}
    if(remaining===30||remaining===10)SFX.warn();
    if(remaining>0&&remaining<=5)SFX.tick();
  } else if(phase==='voting'){
    const pct=Math.max(0,remaining/voteTotal*100);
    const bar=$('vote-tf'),val=$('vote-tv');
    if(bar){bar.style.width=pct+'%';bar.style.background=pct<25?'var(--red)':pct<50?'var(--amb)':'var(--red)';}
    if(val){val.textContent=fmt(remaining);val.style.color=remaining<=10?'var(--red)':'var(--tx2)';}
    if(remaining===10)SFX.warn();
    if(remaining>0&&remaining<=5){SFX.tick();toast(`⚠ Glasanje završava za ${remaining}s`);}
  }
});

// ── VOTING ────────────────────────────────────────────────────────────────────
function renderVoting(){
  selVote=null;
  $('cfm').classList.remove('on');
  $('vsent').style.display='none';
  $('vgrid').style.opacity='1';
  $('vgrid').style.pointerEvents='auto';
  const isImp=myRole==='IMPOSTOR';
  $('igbox').className=`igbox${isImp?' on':''}`;
  const grid=$('vgrid');grid.innerHTML='';
  G.players.filter(p=>!p.isSpectator).forEach(p=>{
    const c=document.createElement('div');c.className='vc';c.id='vc-'+p.id;
    c.innerHTML=`<div class="vav">${ini(p.name)}</div><div class="vn">${esc(p.name)}</div>`;
    c.onclick=()=>{
      document.querySelectorAll('.vc').forEach(x=>{x.classList.remove('sel');x.querySelector('.vchk')?.remove();});
      c.classList.add('sel');
      const ch=document.createElement('div');ch.className='vchk';ch.textContent='✓';c.appendChild(ch);
      selVote=p.id;$('vtname').textContent=p.name;$('cfm').classList.add('on');
      SFX.vote();
    };
    grid.appendChild(c);
  });
}
$('btn-cfm').onclick=()=>{
  if(!selVote)return;
  socket.emit('castVote',{code:G.code,targetId:selVote});
  $('cfm').classList.remove('on');
  $('vgrid').style.opacity='.4';$('vgrid').style.pointerEvents='none';
  $('igbox').style.display='none';
  $('vsent').style.display='block';
  $('vsent').textContent='Glas poslan. Čekam ostale…';
};
$('ig-sub').onclick=()=>{
  const g=$('ig-in').value.trim();if(!g)return;
  socket.emit('impostorGuess',{code:G.code,guess:g});
  $('ig-in').value='';toast('Pogodak poslan...');
};
socket.on('impostorGuessFailed',({guess})=>{toast(`❌ "${guess}" nije točno!`);SFX.warn();});
socket.on('voteCast',data=>{
  $('vcnt').textContent=`${data.total} od ${data.max} glasova`;
  if(G.state==='VOTING' && data.total>=data.max){
    $('vsent').style.display='block';
    $('vsent').textContent='Svi glasovi su poslani… otvaram rezultate';
  }
});

// ── RESULTS ───────────────────────────────────────────────────────────────────
function renderResults(){
  const res=G.results,b=$('rbanner');
  if(res.isTie){b.className='rbanner tie';$('rtitle').textContent='NERIJEŠENO!';$('remoji').textContent='🤝';$('rsub').textContent='Nitko nije izbačen.';SFX.warn();}
  else if(res.winner==='CITIZENS'){b.className='rbanner win';$('rtitle').textContent='IMPOSTOR UHVAĆEN!';$('remoji').textContent='✅';$('rsub').textContent=`${esc(res.votedOutName)} je bio impostor.`;SFX.win();}
  else if(res.impostorGuessedCorrectly){b.className='rbanner lose';$('rtitle').textContent='IMPOSTOR POBIJEDIO!';$('remoji').textContent='🧠';$('rsub').textContent='Pogodio je pravu riječ!';SFX.lose();}
  else{b.className='rbanner lose';$('rtitle').textContent='MISIJA KOMPROMITIRANA!';$('remoji').textContent='💀';$('rsub').textContent=`${esc(res.votedOutName||'?')} nije bio impostor.`;SFX.lose();}
  $('rw-r').textContent=G.words?.citizen||'—';
  $('rw-i').textContent=G.words?.impostor||'—';
  // Scoreboard
  const sb=$('scoreboard');sb.innerHTML='';
  [...G.players].sort((a,b)=>(b.score||0)-(a.score||0)).forEach((p,i)=>{
    const pts=p.score||0,isImp=p.role==='IMPOSTOR',isSpec=p.role==='SPECTATOR';
    const delta=G.scoreDeltas?.[p.playerToken||p.id] ?? G.scoreDeltas?.[p.id] ?? 0;
    const rk=i===0?'g':i===1?'s':i===2?'b':'';
    const d=document.createElement('div');d.className='srow';
    d.innerHTML=`<span class="srk ${rk}">${i+1}</span><div class="av ${isImp?'r':'t'}">${ini(p.name)}</div><div class="pi"><div class="pn">${esc(p.name)}</div><div class="ps">${isSpec?'HOST MODERATOR':(isImp?'IMPOSTOR':'CITIZEN')}</div></div><div class="spt">${pts}<span class="sdelta ${delta>0?'up':'z'}">+${delta}</span></div>`;
    sb.appendChild(d);
  });
  // Debrief
  const rl=$('rlist');rl.innerHTML='';
  G.players.forEach(p=>{
    const isImp=p.role==='IMPOSTOR',isSpec=p.role==='SPECTATOR',vf=G.players.find(v=>v.id===G.votes?.[p.id]);
    const d=document.createElement('div');d.className=`rrow${isImp?' ir':''}`;
    d.innerHTML=`<div class="av ${isImp?'r':'t'}">${ini(p.name)}</div><div class="pi"><div class="pn">${esc(p.name)}</div><div class="ps">Glasao za: ${vf?esc(vf.name):'—'}</div></div><span class="rtag ${isSpec?'':(isImp?'imp':'cit')}">${isSpec?'HOST MODERATOR':(isImp?'IMPOSTOR':'CITIZEN')}</span>`;
    rl.appendChild(d);
  });
  $('btn-rst').style.display=me&&me.isHost?'flex':'none';
  renderAllVoiceLists();
  updateVoiceButtons();
}

$('btn-again').onclick=()=>socket.emit('playAgain',{code:G.code});
$('btn-quit').onclick=()=>requestLeaveRoom();
$('btn-leave-room').onclick=()=>requestLeaveRoom();
$('btn-leave-room-top').onclick=()=>requestLeaveRoom();
$('btn-copy-code').onclick=async()=>{ try{ await navigator.clipboard.writeText(G.code); toast('Kod sobe kopiran'); } catch { toast('Ne mogu kopirati kod'); } };
$('btn-rst').onclick=()=>{socket.emit('resetScores',{code:G.code});toast('Bodovi resetirani');};


['btn-self-mute','btn-self-mute-res'].forEach(id=>{ const el=$(id); if(el) el.onclick=()=>toggleSelfMute(); });
['btn-audio-unlock','btn-audio-unlock-res'].forEach(id=>{ const el=$(id); if(el) el.onclick=()=>unlockAudio(); });

// ── SOCKET EVENTS ─────────────────────────────────────────────────────────────
socket.on('roomCreated',room=>{G=room;me=room.players[0];saveSession({code:room.code,name:me?.name,playerToken:room.playerToken});badge();show('s-lobby');renderLobby();SFX.join();});
socket.on('roomJoined',room=>{G=room;me=meNow();saveSession({code:room.code,name:me?.name||$('j-name').value.trim(),playerToken:room.playerToken});badge();show('s-lobby');renderLobby();SFX.join();});
socket.on('sessionResumed',room=>{G=room;me=meNow();myWord=room.myWord;myRole=room.myRole;saveSession({code:room.code,name:me?.name||$('j-name').value.trim(),playerToken:room.playerToken});badge();
  if(G.state==='LOBBY'){show('s-lobby');renderLobby();}
  else if(G.state==='REVEAL'){show('s-reveal');setupReveal();}
  else if(G.state==='DISCUSSION'){show('s-disc');setupDisc(room); wantMic(true);}
  else if(G.state==='VOTING'){show('s-vote');renderVoting(); wantMic(false);}
  else if(G.state==='RESULTS'){show('s-res');renderResults(); wantMic(true); unlockAudio();}
  toast('✅ Veza obnovljena');
});
socket.on('resumeFailed',()=>{clearSession();});
socket.on('connect',()=>{loadAudioPrefs();
updateVoiceButtons();
maybeResumeSession();});

socket.on('roomLeft',()=>{
  leaveToHome({ keepName: true, toastMessage: 'Napustio si sobu.' });
});
socket.on('kicked',()=>{
  leaveToHome({ keepName: true, toastMessage: 'Host vas je izbacio iz sobe.' });
});
socket.on('roomNotice',({message})=>{ if(message) toast(message,3200); });
socket.on('roundAborted',({reason})=>{ wantMic(false); if(reason) toast(reason,3600); });

socket.on('roomUpdated',room=>{
  G=room;me=meNow();
  if (G.state === 'LOBBY' && me?.isHost) {
    $('cfg-cat').value = G.category;
    $('cfg-disc').value = String(Math.max(1, Math.round((G.discussionTime || 120)/60)));
    $('cfg-vote').value = String(Math.max(1, Math.round((G.votingTime || 60)/60)));
    $('cfg-private').checked = !!G.privateRoom;
    $('cfg-pin').value = G.roomPin || '';
    $('cfg-custom').value = (G.customWords || []).join(', ');
    $('pin-wrap').style.display = G.privateRoom ? 'block' : 'none';
    impCount = G.impostorCount || 1;
    $('imp-v').textContent = impCount;
  }
  saveSession({code:G.code,name:me?.name||getSession().name||$('j-name').value.trim()});
  if((G.state==='DISCUSSION' || G.state==='RESULTS') && micWanted) scheduleMicEnsure(300,{force:false});
  renderAllVoiceLists();
  if(G.state==='LOBBY'){
    wantMic(false);
    if(!$('s-lobby').classList.contains('on'))show('s-lobby');
    renderLobby();
  }
});

socket.on('gameStarted',room=>{
  // Server sends myWord and myRole privately to each player
  myWord=room.myWord;
  myRole=room.myRole;
  G=room;
  me=meNow();
  // Patch our word/role into our player entry (for display in debrief etc.)
  if(me){me.word=myWord;me.role=myRole;}
  $('rnd').textContent=`R${G.roundNumber}`;
  wantMic(false);
  show('s-reveal');
  setupReveal();
});

socket.on('revealProgress',({readyCount,total})=>{
  updateRevealProgress(readyCount,total);
  if(readyCount===total) toast('Svi su potvrdili — počinjemo!');
});

socket.on('startDiscussion',room=>{
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  discTotal=room.discussionTime||120;
  voteTotal=room.votingTime||60;
  show('s-disc');
  setupDisc(room);
  spinner('POČINJEMO',null);
});

socket.on('votingStarted',room=>{
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  voteTotal=room.votingTime||60;
  wantMic(false);
  show('s-vote');
  renderVoting();
});

socket.on('gameEnded',room=>{
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  show('s-res');
  renderResults();
  wantMic(true);
  unlockAudio();
});

socket.on('error',msg=>{
  $('j-err').textContent=msg;
  $('l-err').textContent=msg;
  toast('⚠ '+msg);
});
