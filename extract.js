
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
let voiceLevels={}, phaseTick=null, phaseEndsAt=0, phaseNow='', phaseTotal=0, phaseRender=null, discussionWordVisible=false, voiceSeenAt={};

const $=id=>document.getElementById(id);
const ini=n=>(n||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
const esc=s=>String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const meNow=()=>G?.players?G.players.find(p=>p.id===socket.id):null;
const connectedPlayers=()=> (G?.players||[]).filter(p=>p.isConnected!==false);
const disconnectedPlayers=()=> (G?.players||[]).filter(p=>p.isConnected===false);
const canManagePlayer=p=> !!(me?.isHost && p && p.id!==socket.id);
function clearJoinErrors(){ if($('j-err')) $('j-err').textContent=''; if($('l-err')) $('l-err').textContent=''; }
let joinPending=false, createPending=false;
let actionSeq=0, pendingAction=null, pendingActionTimer=null;
function nextActionId(kind){ actionSeq+=1; return `${kind}-${Date.now()}-${actionSeq}`; }
function beginPendingAction(kind, requestId, timeoutMs=12000){
  pendingAction={kind,requestId,startedAt:Date.now()};
  clearTimeout(pendingActionTimer);
  pendingActionTimer=setTimeout(()=>{
    if(!pendingAction || pendingAction.requestId!==requestId) return;
    pendingAction=null;
    clearActionLoading();
    const msg=kind==='resume'?'Veza se obnovlja sporije nego inače. Pokušaj ponovno.':'Server se nije javio na vrijeme. Pokušaj ponovno.';
    if(document.querySelector('.sc.on')?.id==='s-join' || kind==='join' || kind==='create') $('j-err').textContent=msg;
    else $('l-err').textContent=msg;
    toast('⚠ '+msg, 3200);
  }, timeoutMs);
}
function clearPendingAction(requestId=''){
  if(!pendingAction) return;
  if(requestId && pendingAction.requestId && pendingAction.requestId!==requestId) return;
  pendingAction=null;
  clearTimeout(pendingActionTimer);
  pendingActionTimer=null;
}
function isMatchingAction(requestId=''){
  if(!requestId) return true;
  if(!pendingAction?.requestId) return true;
  return pendingAction.requestId===requestId;
}
function setJoinLoading(kind, on){
  joinPending = kind === 'join' ? on : joinPending && kind !== 'join';
  createPending = kind === 'create' ? on : createPending && kind !== 'create';
  const joinBtn=$('btn-join'), createBtn=$('btn-create');
  if(joinBtn){
    joinBtn.disabled = on && kind==='join';
    joinBtn.textContent = on && kind==='join' ? 'SPAJAM…' : 'PRIDRUŽI SE';
  }
  if(createBtn){
    createBtn.disabled = on && kind==='create';
    createBtn.textContent = on && kind==='create' ? 'KREIRAM…' : 'KREIRAJ SOBU';
  }
}
function clearActionLoading(){
  clearPendingAction();
  joinPending=false; createPending=false;
  const joinBtn=$('btn-join'), createBtn=$('btn-create');
  if(joinBtn){ joinBtn.disabled=false; joinBtn.textContent='PRIDRUŽI SE'; }
  if(createBtn){ createBtn.disabled=false; createBtn.textContent='KREIRAJ SOBU'; }
}
function normalizedJoinCode(v){
  return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
}
function getOpenerName(){ const idx=Number.isInteger(G?.currentSpeakerIdx)?G.currentSpeakerIdx:0; const openerId=(G?.speakOrder||[])[idx] || (G?.speakOrder||[])[0]; const opener=(G?.players||[]).find(p=>p.id===openerId); return opener?.name || 'Nasumično odabran igrač'; }
function discussionRoleCopy(){ if(myRole==='SPECTATOR') return 'HOST MODERATOR'; if(myRole==='IMPOSTOR') return 'IMPOSTOR'; if(myRole==='CITIZEN') return 'CITIZEN'; return 'OPERATIVAC'; }
function renderDiscussionWord(){
  const card=$('disc-word-card'), value=$('disc-word-value'), note=$('disc-word-note'), btn=$('btn-disc-word-toggle');
  if(!card || !value || !note || !btn) return;
  const visibleRole = myRole==='IMPOSTOR' ? 'imp' : (myRole==='CITIZEN' ? 'cit' : 'mod');
  card.className = `disc-word-card ${visibleRole}`;
  card.classList.toggle('tap-ready', myRole!=='SPECTATOR');
  note.classList.add('soft');
  if(myRole==='SPECTATOR'){
    btn.style.display='none';
    value.classList.remove('hidden');
    value.textContent='HOST MODERATOR';
    note.textContent='Host prati rundu i može otvoriti glasanje, ali nema svoju riječ.';
    return;
  }
  btn.style.display='inline-flex';
  const safeWord = myWord || '—';
  if(discussionWordVisible){
    value.classList.remove('hidden');
    value.textContent=safeWord;
    btn.textContent='SAKRIJ';
    note.textContent=myRole==='IMPOSTOR' ? 'Tvoja riječ je vidljiva samo tebi. Drži priču uvjerljivom.' : 'Tvoja riječ je vidljiva samo tebi.';
  } else {
    value.classList.add('hidden');
    value.textContent='SKRIVENA RIJEČ';
    btn.textContent='PRIKAŽI';
    note.textContent='Dodirni karticu ili klikni Prikaži kad ti riječ zatreba tijekom rasprave.';
  }
}
function applyDiscussionHero(){
  if(!$('disc-opener')) return;
  $('disc-opener').innerHTML=`<strong>${esc(getOpenerName())}</strong>`;
  $('disc-role-copy').textContent=discussionRoleCopy();
  const connected=connectedPlayers().length;
  $('disc-status-copy').textContent=myRole==='SPECTATOR'
    ? `Moderiraš rundu. Prati tok rasprave, ali ne sudjeluješ kao igrač. Aktivno je ${connected} igrača.`
    : `Otvorena je linija za ${connected} aktivnih igrača. Slušaj pažljivo i drži priču prirodnom.`;
  renderDiscussionWord();
}
function clearPhaseTicker(){ if(phaseTick){ clearInterval(phaseTick); phaseTick=null; } phaseEndsAt=0; phaseNow=''; phaseTotal=0; phaseRender=null; }
function renderPhaseTimer(){
  if(!phaseNow || !phaseRender) return;
  const phase = phaseNow;
  const total = phaseTotal;
  const bar = phase==='discussion' ? $('disc-tf') : $('vote-tf');
  const val = phase==='discussion' ? $('disc-tv') : $('vote-tv');
  const secs = Math.max(0, Math.floor((phaseEndsAt - Date.now() + 999) / 1000));
  const pct = total > 0 ? Math.max(0, Math.min(100, secs / total * 100)) : 0;
  if(bar){ bar.style.width = pct + '%'; bar.style.background = phase==='discussion' ? (pct<25?'var(--red)':pct<50?'var(--amb)':'var(--teal)') : (pct<25?'var(--red)':pct<50?'var(--amb)':'var(--red)'); }
  if(val){ val.textContent = fmt(secs); val.style.color = secs<=10 ? 'var(--red)' : (phase==='discussion' && secs<=30 ? 'var(--amb)' : 'var(--tx2)'); }
  if(secs<=0){ clearPhaseTicker(); }
}
function syncPhaseTimer(phase, remaining){
  const total = phase==='discussion' ? discTotal : voteTotal;
  phaseTotal = total;
  if(phaseNow!==phase || !phaseTick){
    clearPhaseTicker();
    phaseNow = phase;
    phaseTotal = total;
    phaseRender = renderPhaseTimer;
    phaseEndsAt = Date.now() + Math.max(0, remaining) * 1000;
    renderPhaseTimer();
    phaseTick = setInterval(renderPhaseTimer, 100);
    return;
  }
  phaseEndsAt = Date.now() + Math.max(0, remaining) * 1000;
  renderPhaseTimer();
}
function parseCustomWordsInput(raw){
  const parts=String(raw||'').split(/[\n,]/g).map(w=>w.trim().replace(/\s+/g,' ')).filter(Boolean);
  const seen=new Set(), out=[];
  for(const word of parts){
    const key=word.toLocaleLowerCase('hr-HR');
    if(seen.has(key)) continue;
    seen.add(key);
    out.push(word);
    if(out.length>=80) break;
  }
  return out;
}
function renderCustomWordsPreview(){
  const ta=$('cfg-custom'); if(!ta) return;
  const words=parseCustomWordsInput(ta.value);
  const count=$('cfg-custom-count'), state=$('cfg-custom-state'), preview=$('cfg-custom-preview');
  if(count) count.textContent=`${words.length} ${words.length===1?'riječ':(words.length<5?'riječi':'riječi')}`;
  if(state){
    const ok=words.length>=6;
    state.textContent=ok?'Fair mode aktivan':'Dodaj barem 6 riječi';
    state.className='words-state '+(ok?'ok':'warn');
  }
  if(preview){
    const shown=words.slice(0,8).map(w=>`<span class="word-tag">${esc(w)}</span>`).join('');
    const more=words.length>8?`<span class="word-tag more">+${words.length-8} još</span>`:'';
    preview.innerHTML=shown+more;
  }
}
function updatePinPill(){
  const pill=$('cfg-pin-pill'); if(!pill) return;
  const pin=String($('cfg-pin')?.value||'').replace(/\D/g,'').slice(0,6);
  pill.textContent=pin||'—';
}
const confirmState={onConfirm:null};
function closeConfirm(){
  const m=$('confirm-modal'); if(!m) return;
  m.classList.remove('on'); m.setAttribute('aria-hidden','true');
  confirmState.onConfirm=null;
}
function openConfirm({kicker='Potvrda',title='Jesi siguran?',message='Provjeri akciju prije nastavka.',points=[],confirmText='POTVRDI',confirmClass='bp',onConfirm=()=>{}}={}){
  $('confirm-kicker').textContent=kicker;
  $('confirm-title').textContent=title;
  $('confirm-sub').textContent=message;
  const box=$('confirm-points');
  if(box){
    if(points?.length){ box.style.display='grid'; box.innerHTML=points.map(p=>`<div class="cmitem">${esc(p)}</div>`).join(''); }
    else { box.style.display='none'; box.innerHTML=''; }
  }
  const ok=$('confirm-ok');
  ok.textContent=confirmText;
  ok.className='btn '+confirmClass;
  confirmState.onConfirm=()=>{ closeConfirm(); onConfirm(); };
  const m=$('confirm-modal');
  m.classList.add('on'); m.setAttribute('aria-hidden','false');
}

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
  openConfirm({
    kicker:'Napuštanje sobe',
    title:'Napusti sobu?',
    message:'Izaći ćeš iz trenutne sobe i vratiti se na početni ekran.',
    points:['Tvoje ime ostaje spremljeno za sljedeći ulazak.','Ako si host, soba ostaje aktivna za ostale igrače.'],
    confirmText:'NAPUSTI',
    confirmClass:'bo',
    onConfirm:()=>socket.emit('leaveRoom', { code: G.code })
  });
}
function maybeResumeSession(){
  if(resumeTried) return;
  resumeTried=true;
  const ss=getSession();
  if(ss.code&&ss.name&&ss.playerToken){
    $('j-name').value=ss.name;
    $('j-code').value=ss.code;
    const requestId=nextActionId('resume');
    beginPendingAction('resume', requestId, 15000);
    socket.emit('resumeSession', {...ss, requestId});
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
  const incoming=Math.max(0,Math.min(100,level||0));
  if(incoming>8) voiceSeenAt[pid]=Date.now();
  const hold = voiceSeenAt[pid] && (Date.now()-voiceSeenAt[pid] < 420);
  const safe = hold ? Math.max(incoming, 10) : incoming;
  voiceLevels[pid]=safe;
  document.querySelectorAll(`[data-vmeter="${pid}"] > span`).forEach(el=>el.style.width=`${safe}%`);
  document.querySelectorAll(`[data-vrow="${pid}"]`).forEach(el=>el.classList.toggle('speaking', safe>18));
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
      <div class="vmeter" data-vmeter="${p.id}"><span style="width:${Math.max(0,Math.min(100,voiceLevels[p.id]||0))}%"></span></div>
      ${actionBtn}`;
    host.appendChild(row);
    row.classList.toggle('speaking',(voiceLevels[p.id]||0)>18);
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
  if(joinPending || createPending) return;
  const name=$('j-name').value.trim();
  const code=normalizedJoinCode($('j-code').value);
  const pin=String($('j-pin').value||'').replace(/\D/g,'').slice(0,6);
  const err=$('j-err');
  err.textContent='';
  $('j-code').value=code;
  $('j-pin').value=pin;
  if(!socket.connected){ err.textContent='Veza sa serverom još nije spremna. Pokušaj ponovno za trenutak.'; return; }
  if(!name){err.textContent='Unesite ime agenta.';return;}
  if(!code||code.length<4){err.textContent='Unesite ispravan kod sobe.';return;}
  const requestId=nextActionId('join');
  setJoinLoading('join', true);
  beginPendingAction('join', requestId);
  saveSession({code,name,playerToken:getSession().playerToken||''});
  socket.emit('joinRoom',{code,playerName:name,playerToken:getSession().playerToken||'',roomPin:pin,requestId});
};
$('j-code').oninput=function(){this.value=normalizedJoinCode(this.value); clearJoinErrors();};
$('j-name').oninput=()=>clearJoinErrors();
function renderJoinPinBoxes(){
  const val=($('j-pin').value||'').replace(/\D/g,'').slice(0,6);
  $('j-pin').value=val;
  const boxes=[...document.querySelectorAll('[data-pin-slot]')];
  boxes.forEach((box,i)=>{
    const ch=val[i]||'';
    box.textContent=ch||'•';
    box.classList.toggle('filled',!!ch);
    box.classList.toggle('active',(!ch && i===val.length) || (val.length===6 && i===5));
  });
}
$('j-pin').oninput=function(){clearJoinErrors(); renderJoinPinBoxes();};
$('j-pin').addEventListener('focus',clearJoinErrors);
$('join-pin-boxes')?.addEventListener('click',clearJoinErrors);
$('j-pin').onfocus=()=>{ renderJoinPinBoxes(); requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'})); };
$('j-pin').onblur=()=>{ setTimeout(()=>window.scrollTo({top:0,left:0,behavior:'instant'}),0); renderJoinPinBoxes(); };

$('j-pin-wrap').onclick=()=>$('j-pin').focus();
$('j-pin-wrap').addEventListener('keydown',e=>{
  if(e.key==='Enter' || e.key===' '){ e.preventDefault(); $('j-pin').focus(); }
});
document.querySelectorAll('[data-pin-slot]').forEach(box=>box.addEventListener('click',()=>$('j-pin').focus()));
renderJoinPinBoxes();
$('btn-create').onclick=()=>{
  if(joinPending || createPending) return;
  const name=$('j-name').value.trim();
  if(!socket.connected){ $('j-err').textContent='Veza sa serverom još nije spremna. Pokušaj ponovno za trenutak.'; return; }
  if(!name){$('j-err').textContent='Unesite ime agenta.';return;}
  clearJoinErrors();
  const requestId=nextActionId('create');
  setJoinLoading('create', true);
  beginPendingAction('create', requestId);
  saveSession({name});
  socket.emit('createRoom',{playerName:name,playerToken:getSession().playerToken||'',requestId});
};

// ── LOBBY ─────────────────────────────────────────────────────────────────────
function setControlValueSafely(id, value){
  const el = $(id);
  if(!el) return;
  if(document.activeElement === el) return;
  const next = value == null ? '' : String(value);
  if(el.value !== next) el.value = next;
}
function hostIsModeratorThisRound(){ return (G.customWords||[]).length>=6; }
function renderLobby(){
  if(!G||!$('l-code'))return;
  const customCount=(G.customWords||[]).length;
  const hostModerates=hostIsModeratorThisRound();
  $('l-code').textContent=G.code;
  $('rnd').textContent=G.roundNumber>0?`R${G.roundNumber}`:'';
  $('l-round').textContent=G.roundNumber>0?`Runda ${G.roundNumber}`:'Lobby';
  $('chip-category').textContent=G.category;
  $('chip-impostors').textContent=`${G.impostorCount} ${G.impostorCount===1?'impostor':'impostora'}`;
  $('chip-custom').textContent=customCount>=6?`${customCount} custom riječi · premium fair mode`:'Standardne riječi';
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
    if(document.activeElement !== $('cfg-cat')) $('cfg-cat').value=G.category;
    $('imp-v').textContent=G.impostorCount;impCount=G.impostorCount;
    setControlValueSafely('cfg-disc', String(Math.max(1, Math.round((G.discussionTime || 120)/60))));
    setControlValueSafely('cfg-vote', String(Math.max(1, Math.round((G.votingTime || 60)/60))));
    $('cfg-private').checked=!!G.privateRoom;
    setControlValueSafely('cfg-pin', G.roomPin||'');
    setControlValueSafely('cfg-custom', (G.customWords||[]).join(', '));
    $('pin-wrap').style.display=G.privateRoom?'block':'none';
    const minPlayers=hostModerates?4:3;
    const ok=activePlayers.length>=minPlayers&&activePlayers.every(p=>p.isReady || p.isHost);
    $('btn-start').style.display=ok?'flex':'none';
    $('l-err').textContent=activePlayers.length<minPlayers?`Potrebno još ${minPlayers-activePlayers.length} igrač(a) ${hostModerates?'jer host moderira rundu (min 4 ukupno).':'za početak igre (min 3 ukupno).'}`:(!ok?'Čekanje da svi povezani igrači budu spremni...':'');
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
    d.innerHTML=`<div class="av ${p.isHost?'r':''}">${ini(p.name)}</div><div class="pi"><div class="pn">${esc(p.name)}</div><div class="ps">${p.isHost?(hostModerates?'Host moderator · ne igra ovu rundu':'Host · igra normalno'):'Operative'}${offline?' · Offline':''}</div></div><div style="font-family:'Bebas Neue',sans-serif;font-size:15px;color:var(--tx3);margin-right:5px;">${sc}pt</div><div class="pactions">${action}${status}</div>`;
    list.appendChild(d);
  });
  list.querySelectorAll('[data-kick]').forEach(btn=>btn.onclick=()=>kickPlayer(btn.dataset.kick));
  list.querySelectorAll('[data-remove]').forEach(btn=>btn.onclick=()=>removeDisconnectedPlayer(btn.dataset.remove));
  const mr=me&&me.isReady;
  $('btn-ready').textContent=mr?'NIJE SPREMAN':'SPREMAN';
  $('btn-ready').className=`btn ${mr?'bo':'bt'} mb`;
}
function kickPlayer(targetId){
  if(!me?.isHost) return;
  const target=(G.players||[]).find(p=>p.id===targetId);
  openConfirm({
    kicker:'Host akcija',
    title:'Izbaciti igrača?',
    message:`${target?.name||'Ovaj igrač'} će odmah biti izbačen iz sobe.`,
    points:['Koristi ovo samo ako igrač ometa rundu ili je neaktivan.'],
    confirmText:'IZBACI',
    confirmClass:'bp',
    onConfirm:()=>socket.emit('kickPlayer',{code:G.code,targetId})
  });
}
function removeDisconnectedPlayer(targetId){
  if(!me?.isHost) return;
  const target=(G.players||[]).find(p=>p.id===targetId);
  openConfirm({
    kicker:'Offline cleanup',
    title:'Ukloniti offline igrača?',
    message:`${target?.name||'Ovaj igrač'} je offline i može blokirati tijek igre.`,
    points:['Igra će nastaviti bez tog mjesta u sobi.'],
    confirmText:'UKLONI',
    confirmClass:'bp',
    onConfirm:()=>socket.emit('removeDisconnectedPlayer',{code:G.code,targetId})
  });
}
function emitCfg(){socket.emit('updateConfig',{code:G.code,category:$('cfg-cat').value,impostors:impCount,discussionTime:(parseInt($('cfg-disc').value)||2)*60,votingTime:(parseInt($('cfg-vote').value)||1)*60,privateRoom:$('cfg-private').checked,roomPin:$('cfg-pin').value.trim(),customWords:$('cfg-custom').value}); updatePinPill(); renderCustomWordsPreview();}
$('cfg-cat').onchange=$('cfg-disc').onchange=$('cfg-vote').onchange=emitCfg;
$('cfg-private').onchange=()=>{ $('pin-wrap').style.display=$('cfg-private').checked?'block':'none'; if($('cfg-private').checked && !$('cfg-pin').value.trim()){ generatePin(); return; } updatePinPill(); emitCfg(); };
$('cfg-pin').oninput=()=>{ $('cfg-pin').value=String($('cfg-pin').value||'').replace(/\D/g,'').slice(0,6); updatePinPill(); emitCfg(); };
$('cfg-pin').onfocus=()=>{ requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'instant'})); };
$('cfg-pin').onblur=()=>{ setTimeout(()=>window.scrollTo({top:0,left:0,behavior:'instant'}),0); };
let customWordsDebounce=null;
$('cfg-custom').oninput=()=>{ renderCustomWordsPreview(); clearTimeout(customWordsDebounce); customWordsDebounce=setTimeout(()=>emitCfg(),180); };
$('cfg-custom').onblur=()=>{ renderCustomWordsPreview(); clearTimeout(customWordsDebounce); emitCfg(); };
function generatePin(){ const pin=String(Math.floor(100000 + Math.random()*900000)); $('cfg-pin').value=pin; updatePinPill(); if(!$('cfg-private').checked) $('cfg-private').checked=true; $('pin-wrap').style.display='block'; emitCfg(); toast('Novi PIN generiran'); }
$('btn-pin-generate').onclick=()=>generatePin();
$('btn-pin-copy').onclick=async()=>{ const pin=String($('cfg-pin').value||'').trim(); if(!pin) return toast('Prvo generiraj PIN'); try{ await navigator.clipboard.writeText(pin); toast('PIN kopiran'); } catch { toast('Ne mogu kopirati PIN'); } };
renderCustomWordsPreview();
updatePinPill();
$('imp-m').onclick=()=>{impCount=Math.max(1,impCount-1);$('imp-v').textContent=impCount;emitCfg();};
$('imp-p').onclick=()=>{impCount=Math.min(3,impCount+1);$('imp-v').textContent=impCount;emitCfg();};
$('btn-ready').onclick=()=>socket.emit('toggleReady',{code:G.code});
$('btn-start').onclick=()=>requestStartGame();

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
  discussionWordVisible=false;
  $('disc-host').style.display=isHost?'block':'none';
  $('disc-wait').style.display=isHost?'none':'block';
  discTotal=room.discussionTime||120;
  $('btn-start-vote').textContent=isHost?'OTVORI GLASANJE':'GLASANJE';
  applyDiscussionHero();
  renderAllVoiceLists();
  updateVoiceButtons();
  wantMic(true);
}
$('btn-start-vote').onclick=()=>{
  if(!G?.code) return;
  if(!socket.connected) socket.connect();
  socket.emit('startVoting',{code:G.code, playerToken:getSession().playerToken});
};
function toggleDiscussionWord(){ if(myRole==='SPECTATOR') return; discussionWordVisible=!discussionWordVisible; renderDiscussionWord(); }
$('btn-disc-word-toggle').onclick=()=>{ toggleDiscussionWord(); };
$('disc-word-card').onclick=(e)=>{ if(myRole==='SPECTATOR') return; if(e.target && e.target.id==='btn-disc-word-toggle') return; toggleDiscussionWord(); };
$('disc-word-value').addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleDiscussionWord(); } });

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
  if(mobileResumeLock) return;
  mobileResumeLock=true;
  setTimeout(()=>{
    if(socket.disconnected){ try{ socket.connect(); }catch(e){} }
    if(micWanted && G && (G.state==='DISCUSSION' || G.state==='RESULTS')){
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
  syncPhaseTimer(phase, remaining);
  if(phase==='discussion'){
    if(remaining===30||remaining===10)SFX.warn();
    if(remaining>0&&remaining<=5)SFX.tick();
  } else if(phase==='voting'){
    if(remaining===10)SFX.warn();
    if(remaining>0&&remaining<=5){SFX.tick();toast(`⚠ Glasanje završava za ${remaining}s`);}
  }
});

// ── VOTING ────────────────────────────────────────────────────────────────────
function renderVoting(){
  selVote=null;
  $('cfm').classList.remove('on');
  $('vsent').style.display='none';
  const isSpec=myRole==='SPECTATOR';
  $('vgrid').style.opacity=isSpec?'.75':'1';
  $('vgrid').style.pointerEvents=isSpec?'none':'auto';
  const isImp=myRole==='IMPOSTOR';
  $('igbox').className=`igbox${isImp?' on':''}`;
  $('igbox').style.display=isSpec?'none':'';
  const grid=$('vgrid');grid.innerHTML='';
  if(isSpec){
    $('vsent').style.display='block';
    $('vsent').textContent='Ti moderiraš rundu. Prati glasanje, ali ne glasaš.';
  }
  G.players.filter(p=>!p.isSpectator).forEach(p=>{
    const c=document.createElement('div');c.className='vc';c.id='vc-'+p.id;
    c.innerHTML=`<div class="vav">${ini(p.name)}</div><div class="vn">${esc(p.name)}</div>`;
    c.onclick=()=>{
      if(myRole==='SPECTATOR') return;
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

function requestStartGame(){
  const connected=connectedPlayers().length;
  const usingCustom=parseCustomWordsInput($('cfg-custom')?.value||'').length>=6;
  const points=[];
  if(usingCustom) points.push('Custom fair mode: host moderira i ne dobiva riječ.');
  points.push(`Povezanih igrača: ${connected}`);
  points.push(usingCustom?'Host moderira ovu rundu.':'Host igra normalno u ovoj rundi.');
  points.push(`Rasprava: ${$('cfg-disc')?.value||2} min · Glasanje: ${$('cfg-vote')?.value||1} min`);
  openConfirm({
    kicker:'Pokretanje misije',
    title:'Pokrenuti novu rundu?',
    message:'Kad krene reveal, postavke sobe više se ne mogu mijenjati do kraja runde.',
    points,
    confirmText:'POKRENI',
    confirmClass:'bp',
    onConfirm:()=>socket.emit('startGame',{code:G.code})
  });
}
function requestPlayAgain(){
  openConfirm({
    kicker:'Nova runda',
    title:'Krenuti u novu rundu?',
    message:'Zadržat će se soba i igrači, a otvorit će se novi lobby za sljedeću rundu.',
    confirmText:'NOVA RUNDA',
    confirmClass:'bp',
    onConfirm:()=>{
      if(!G?.code) return;
      const send=()=>socket.emit('playAgain',{code:G.code, playerToken:getSession().playerToken||''});
      if(socket.connected){ send(); return; }
      toast('Obnavljam vezu prije nove runde…', 2200);
      try{ socket.connect(); }catch(e){}
      const once=()=>{ socket.off('connect_error', fail); send(); };
      const fail=()=>{ socket.off('connect', once); toast('Veza još nije spremna za novu rundu.', 2600); };
      socket.once('connect', once);
      socket.once('connect_error', fail);
    }
  });
}
function requestResetScores(){
  openConfirm({
    kicker:'Reset bodova',
    title:'Resetirati scoreboard?',
    message:'Svi igrači u sobi vratit će se na nula bodova.',
    confirmText:'RESETIRAJ',
    confirmClass:'bp',
    onConfirm:()=>{socket.emit('resetScores',{code:G.code});toast('Bodovi resetirani');}
  });
}
$('btn-again').onclick=()=>requestPlayAgain();
$('btn-quit').onclick=()=>requestLeaveRoom();
$('btn-leave-room').onclick=()=>requestLeaveRoom();
$('btn-leave-room-top').onclick=()=>requestLeaveRoom();
$('btn-copy-code').onclick=async()=>{ try{ await navigator.clipboard.writeText(G.code); toast('Kod sobe kopiran'); } catch { toast('Ne mogu kopirati kod'); } };
$('btn-rst').onclick=()=>requestResetScores();


$('confirm-cancel').onclick=()=>closeConfirm();
$('confirm-ok').onclick=()=>confirmState.onConfirm?.();
$('confirm-modal').onclick=(e)=>{ if(e.target.id==='confirm-modal') closeConfirm(); };
document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeConfirm(); });
['btn-self-mute','btn-self-mute-res'].forEach(id=>{ const el=$(id); if(el) el.onclick=()=>toggleSelfMute(); });
['btn-audio-unlock','btn-audio-unlock-res'].forEach(id=>{ const el=$(id); if(el) el.onclick=()=>unlockAudio(); });

// ── SOCKET EVENTS ─────────────────────────────────────────────────────────────
socket.on('roomCreated',room=>{if(!isMatchingAction(room?.requestId)) return; clearPendingAction(room?.requestId); clearActionLoading();clearJoinErrors(); G=room;me=room.players[0];saveSession({code:room.code,name:me?.name,playerToken:room.playerToken});badge();show('s-lobby');renderLobby();renderCustomWordsPreview();updatePinPill();SFX.join();});
socket.on('roomJoined',room=>{if(!isMatchingAction(room?.requestId)) return; clearPendingAction(room?.requestId); clearActionLoading();clearJoinErrors(); G=room;me=meNow();saveSession({code:room.code,name:me?.name||$('j-name').value.trim(),playerToken:room.playerToken});badge();show('s-lobby');renderLobby();renderCustomWordsPreview();updatePinPill();SFX.join();});
socket.on('sessionResumed',room=>{if(!isMatchingAction(room?.requestId)) return; clearPendingAction(room?.requestId); clearActionLoading();clearJoinErrors(); G=room;me=meNow();myWord=room.myWord;myRole=room.myRole;saveSession({code:room.code,name:me?.name||$('j-name').value.trim(),playerToken:room.playerToken});badge();
  if(G.state==='LOBBY'){show('s-lobby');renderLobby();renderCustomWordsPreview();updatePinPill();}
  else if(G.state==='REVEAL'){show('s-reveal');setupReveal();}
  else if(G.state==='DISCUSSION'){show('s-disc');setupDisc(room); wantMic(true);}
  else if(G.state==='VOTING'){show('s-vote');renderVoting(); wantMic(false);}
  else if(G.state==='RESULTS'){show('s-res');renderResults(); wantMic(true); unlockAudio();}
  toast('✅ Veza obnovljena');
});
socket.on('resumeFailed',payload=>{ if(!isMatchingAction(payload?.requestId)) return; clearPendingAction(payload?.requestId); clearActionLoading(); clearSession(); resumeTried=false; });
socket.on('connect',()=>{clearActionLoading(); loadAudioPrefs();
updateVoiceButtons();
maybeResumeSession();});
socket.on('disconnect',reason=>{
  if(G?.code){ toast('Veza je nakratko prekinuta — pokušavam vratiti sobu…', 2500); }
});
socket.on('connect_error',()=>{
  if(document.querySelector('.sc.on')?.id==='s-join' && !G?.code){ $('j-err').textContent='Ne mogu se spojiti na server. Pokušaj ponovno.'; }
});

socket.on('roomLeft',()=>{ clearActionLoading();
  leaveToHome({ keepName: true, toastMessage: 'Napustio si sobu.' });
});
socket.on('kicked',()=>{ clearActionLoading();
  leaveToHome({ keepName: true, toastMessage: 'Host vas je izbacio iz sobe.' });
});
socket.on('roomNotice',({message})=>{ if(message) toast(message,3200); });
socket.on('roundAborted',({reason})=>{ wantMic(false); if(reason) toast(reason,3600); });

socket.on('roomUpdated',room=>{
  G=room;me=meNow();
  if (G.state === 'LOBBY' && me?.isHost) {
    if(document.activeElement !== $('cfg-cat')) $('cfg-cat').value = G.category;
    setControlValueSafely('cfg-disc', String(Math.max(1, Math.round((G.discussionTime || 120)/60))));
    setControlValueSafely('cfg-vote', String(Math.max(1, Math.round((G.votingTime || 60)/60))));
    $('cfg-private').checked = !!G.privateRoom;
    setControlValueSafely('cfg-pin', G.roomPin || '');
    setControlValueSafely('cfg-custom', (G.customWords || []).join(', '));
    $('pin-wrap').style.display = G.privateRoom ? 'block' : 'none';
    renderCustomWordsPreview();
    updatePinPill();
    impCount = G.impostorCount || 1;
    $('imp-v').textContent = impCount;
  }
  saveSession({code:G.code,name:me?.name||getSession().name||$('j-name').value.trim(),playerToken:getSession().playerToken||me?.playerToken||''});
  if((G.state==='DISCUSSION' || G.state==='RESULTS') && micWanted) scheduleMicEnsure(300,{force:false});
  renderAllVoiceLists();
  if(G.state==='LOBBY'){
    clearActionLoading();
    clearPhaseTicker();
    clearJoinErrors();
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
  clearPhaseTicker();
  show('s-disc');
  setupDisc(room);
  spinner('POČINJEMO',null);
});

socket.on('votingStarted',room=>{
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  voteTotal=room.votingTime||60;
  clearPhaseTicker();
  wantMic(false);
  show('s-vote');
  renderVoting();
});

socket.on('gameEnded',room=>{
  G=room;me=meNow();
  if(me){me.word=myWord;me.role=myRole;}
  clearPhaseTicker();
  show('s-res');
  renderResults();
  wantMic(true);
  unlockAudio();
});

socket.on('appError',payload=>{
  if(!isMatchingAction(payload?.requestId)) return;
  clearPendingAction(payload?.requestId);
  clearActionLoading();
  const msg=typeof payload==='string' ? payload : (payload?.message || 'Došlo je do pogreške.');
  const scope=typeof payload==='string' ? '' : (payload?.scope || '');
  const activeJoin=document.querySelector('.sc.on')?.id==='s-join';
  if(activeJoin || scope==='join') $('j-err').textContent=msg;
  else $('l-err').textContent=msg;
  toast('⚠ '+msg);
});
