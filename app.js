
const STORE_KEY='englishDailyTrainer365_v2';
const START_DATE='2026-09-13';
const REVIEW_STEPS=[1,3,7,14,30];
const $=id=>document.getElementById(id);

const defaultState={progress:{},translations:{},dictionary:{},settings:{direction:'en-de',englishLocale:'en-GB',speechRate:0.88}};
let state;
try{
  state=Object.assign({},defaultState,JSON.parse(localStorage.getItem(STORE_KEY)||'{}'));
  state.progress=state.progress||{};
  state.translations=state.translations||{};
  state.dictionary=state.dictionary||{};
  state.settings=Object.assign({direction:'en-de',englishLocale:'en-GB',speechRate:0.88},state.settings||{});
}catch(e){state=structuredClone(defaultState)}

function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state))}
function localISO(d=new Date()){
 const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
 return `${y}-${m}-${day}`;
}
function fmtDate(iso){return new Date(iso+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'})}
function daysBetween(a,b){return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function packForDate(iso){return window.YEAR_PACKS.find(p=>p.date===iso)}
function unlockedPacks(){
 const today=localISO();
 return window.YEAR_PACKS.filter(p=>p.date<=today);
}
function todayPack(){
 const today=localISO();
 return packForDate(today) || unlockedPacks().slice(-1)[0] || window.YEAR_PACKS[0];
}
function wid(pack,w){return `${pack.date}:${w[0].toLowerCase()}`}
function translationOf(w){
 if(w[1]) return w[1];
 return state.translations[w[0].toLowerCase()]||'';
}
function pstate(pack,w){
 const id=wid(pack,w);
 return state.progress[id]||{level:0,next:null,last:null};
}
function setResult(pack,w,known){
 const id=wid(pack,w), today=localISO(), prev=pstate(pack,w);
 let level=prev.level||0;
 if(known) level=Math.min(REVIEW_STEPS.length,level+1);
 else level=Math.max(0,level-1);
 const step=known ? REVIEW_STEPS[Math.min(level-1,REVIEW_STEPS.length-1)] : 1;
 const next=new Date(today+'T12:00:00'); next.setDate(next.getDate()+step);
 state.progress[id]={level,next:localISO(next),last:today};
 save(); renderToday(); renderArchive();
}
function isKnown(pack,w){return (pstate(pack,w).level||0)>=1}
function dueItems(){
 const today=localISO(), items=[];
 for(const p of unlockedPacks()){
   for(const w of p.words){
     const s=pstate(p,w);
     if(s.next && s.next<=today) items.push({pack:p,word:w});
   }
 }
 return items;
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

// Pronunciation uses the device's built-in Web Speech voices. No audio files are stored in the app.
let speechVoices=[];
function speechSupported(){return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window}
function refreshVoices(){if(speechSupported()) speechVoices=window.speechSynthesis.getVoices()||[]}
function preferredVoice(lang){
 refreshVoices();
 const exact=speechVoices.filter(v=>(v.lang||'').toLowerCase()===lang.toLowerCase());
 const base=lang.split('-')[0].toLowerCase();
 const same=speechVoices.filter(v=>(v.lang||'').toLowerCase().split('-')[0]===base);
 return exact.find(v=>v.localService)||exact[0]||same.find(v=>v.localService)||same[0]||null;
}
function cleanSpeechText(text){
 return String(text||'').replace(/\s*\/\s*/g,', ').replace(/\s+/g,' ').trim();
}
function speakText(text,lang){
 const spoken=cleanSpeechText(text);
 if(!spoken)return;
 if(!speechSupported()){
   alert('Die Sprachausgabe wird von diesem Browser nicht unterstützt. Öffne die App auf dem iPhone am besten über Safari.');
   return;
 }
 window.speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(spoken);
 u.lang=lang;
 u.rate=Number(state.settings.speechRate||0.88);
 u.pitch=1;
 const voice=preferredVoice(lang);
 if(voice)u.voice=voice;
 window.speechSynthesis.speak(u);
}
if(speechSupported()){
 refreshVoices();
 window.speechSynthesis.addEventListener?.('voiceschanged',refreshVoices);
}


function maskTargetInSentence(sentence,target){
 const s=String(sentence||'');
 const t=String(target||'').trim();
 if(!s||!t)return s;
 // Hide the exact target token, case-insensitively, so DE→EN hints do not reveal the answer.
 const escaped=t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const re=new RegExp('\\b'+escaped+'\\b','gi');
 const masked=s.replace(re,'_____');
 return masked===s ? s : masked;
}
function resetFrontExample(){
 $('frontExampleWrap').classList.add('hidden');
 $('showExample').textContent='💡 Beispielsatz';
}
async function revealFrontExample(){
 if(!deck.length)return;
 const item=deck[idx], w=item.word;
 let sentence=cachedExampleForWord(w);

 $('showExample').disabled=true;
 if(!sentence){
   $('showExample').textContent='Lade …';
   const info=await dictionaryInfo(w[0]);
   sentence=info.example||'';
 }
 $('showExample').disabled=false;

 if(!sentence){
   $('frontExample').textContent='Für dieses Wort ist aktuell kein Beispielsatz verfügbar.';
   $('frontExampleWrap').classList.remove('hidden');
   $('frontExampleSpeak').style.display='none';
   $('showExample').textContent='Kein Satz verfügbar';
   return;
 }

 const visible=item.dir==='de-en' ? maskTargetInSentence(sentence,w[0]) : sentence;
 $('frontExample').textContent=visible;
 $('frontExampleWrap').classList.remove('hidden');
 $('showExample').textContent='Hinweis sichtbar';
 $('frontExampleSpeak').style.display='inline-block';
 $('frontExampleSpeak').dataset.text=sentence;
 $('frontExampleSpeak').dataset.lang=state.settings.englishLocale||'en-GB';

 // Also populate the back of the same card once the sentence has been retrieved.
 $('backExample').textContent=sentence;
 $('exampleSpeak').style.display='inline-block';
 $('exampleSpeak').dataset.text=sentence;
}


const dictionaryInflight=new Map();

function normalizeAudioUrl(url){
 const u=String(url||'').trim();
 if(!u)return '';
 if(u.startsWith('//'))return 'https:'+u;
 return u;
}

function pickDictionaryAudio(data,locale){
 const entries=Array.isArray(data)?data:[];
 const audios=[];
 for(const entry of entries){
   for(const p of (entry.phonetics||[])){
     const u=normalizeAudioUrl(p.audio);
     if(u)audios.push(u);
   }
 }
 if(!audios.length)return '';
 const wantUS=(locale||'').toLowerCase()==='en-us';
 const markers=wantUS?['_us_','-us-','/us/']:['_gb_','-gb-','_uk_','/uk/'];
 return audios.find(u=>markers.some(m=>u.toLowerCase().includes(m)))||audios[0];
}

function pickDictionaryExample(data){
 const entries=Array.isArray(data)?data:[];
 for(const entry of entries){
   for(const meaning of (entry.meanings||[])){
     for(const def of (meaning.definitions||[])){
       if(def && typeof def.example==='string' && def.example.trim()){
         return def.example.trim();
       }
     }
   }
 }
 return '';
}

function pickDictionaryPhonetic(data){
 const entries=Array.isArray(data)?data:[];
 for(const entry of entries){
   if(entry && typeof entry.phonetic==='string' && entry.phonetic.trim())return entry.phonetic.trim();
   for(const p of (entry.phonetics||[])){
     if(p && typeof p.text==='string' && p.text.trim())return p.text.trim();
   }
 }
 return '';
}

async function dictionaryInfo(word){
 const key=String(word||'').trim().toLowerCase();
 if(!key)return {example:'',audioGB:'',audioUS:'',phonetic:''};
 if(state.dictionary[key])return state.dictionary[key];
 if(dictionaryInflight.has(key))return dictionaryInflight.get(key);

 const promise=(async()=>{
   try{
     const url='https://api.dictionaryapi.dev/api/v2/entries/en/'+encodeURIComponent(key);
     const r=await fetch(url,{method:'GET',mode:'cors'});
     if(!r.ok)throw new Error('HTTP '+r.status);
     const data=await r.json();
     const info={
       example:pickDictionaryExample(data),
       audioGB:pickDictionaryAudio(data,'en-GB'),
       audioUS:pickDictionaryAudio(data,'en-US'),
       phonetic:pickDictionaryPhonetic(data)
     };
     state.dictionary[key]=info;
     save();
     return info;
   }catch(e){
     const info={example:'',audioGB:'',audioUS:'',phonetic:''};
     state.dictionary[key]=info;
     save();
     return info;
   }
 })().finally(()=>dictionaryInflight.delete(key));

 dictionaryInflight.set(key,promise);
 return promise;
}

async function speakEnglishWord(word){
 const locale=state.settings.englishLocale||'en-GB';
 const info=await dictionaryInfo(word);
 const audioUrl=locale==='en-US'?(info.audioUS||info.audioGB):(info.audioGB||info.audioUS);
 if(audioUrl){
   try{
     window.speechSynthesis?.cancel();
     const audio=new Audio(audioUrl);
     audio.preload='auto';
     await audio.play();
     return;
   }catch(e){}
 }
 speakText(word,locale);
}

function cachedExampleForWord(w){
 if(w[2])return w[2];
 const info=state.dictionary[String(w[0]||'').toLowerCase()];
 return info?.example||'';
}

let deck=[],idx=0,currentMode='today';

function renderToday(){
 const pack=todayPack(); if(!pack)return;
 const known=pack.words.filter(w=>isKnown(pack,w)).length;
 $('todayTitle').textContent=`${pack.title} · ${fmtDate(pack.date)}`;
 $('todayCount').textContent=`${pack.words.length} Wörter`;
 $('knownToday').textContent=`${known}/${pack.words.length} begonnen`;
 $('todayProgress').style.width=`${Math.round(known/pack.words.length*100)}%`;
 $('dayBadge').textContent=pack.title;
 $('todayInfo').textContent=pack.date===localISO()
   ? 'Dieses Tagespaket wurde heute automatisch freigeschaltet.'
   : `Der Jahreskurs läuft vom 13.09.2026 bis 12.09.2027. Aktuell angezeigt: ${pack.title}.`;

 const due=dueItems();
 $('reviewCount').textContent=due.length;
 $('startReview').disabled=due.length===0;

 $('todayWords').innerHTML=pack.words.map(w=>{
   const tr=translationOf(w);
   return `<div class="word-chip"><b>${escapeHtml(w[0])}</b>
     <div class="translation-mini">${tr?escapeHtml(tr):'Übersetzung noch nicht geladen'}</div></div>`;
 }).join('');
}

function showView(id){
 document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));
}

function directionForCard(){
 const d=state.settings.direction||'en-de';
 if(d==='mixed') return Math.random()<.5?'en-de':'de-en';
 return d;
}

function startPack(pack){
 currentMode='pack';
 deck=pack.words.map(w=>({pack,word:w,dir:null}));
 idx=0;showView('practiceView');renderCard();
}
function startDue(){
 currentMode='review';
 deck=dueItems().map(x=>({pack:x.pack,word:x.word,dir:null}));
 if(!deck.length){alert('Aktuell ist keine Wiederholung fällig.');return}
 idx=0;showView('practiceView');renderCard();
}
function renderCard(){
 if(!deck.length)return;
 const item=deck[idx], w=item.word;
 if(!item.dir)item.dir=directionForCard();
 const tr=translationOf(w);
 $('flashcard').classList.remove('flipped');
 resetFrontExample();
 const existingExample=cachedExampleForWord(w);
 $('showExample').style.display='inline-block';
 $('showExample').textContent=existingExample?'💡 Beispielsatz':'💡 Beispielsatz laden';
 $('frontExampleSpeak').style.display=existingExample?'inline-block':'none';
 $('frontExample').textContent='';
 $('frontExampleSpeak').dataset.text=existingExample;
 $('frontExampleSpeak').dataset.lang=state.settings.englishLocale||'en-GB';

 if(item.dir==='de-en'){
   $('frontWord').textContent=tr||'Übersetzung wird geladen …';
   $('backTranslation').textContent=w[0];
   $('frontSpeakLabel').textContent='DE';
   $('backSpeakLabel').textContent=(state.settings.englishLocale==='en-US'?'US':'UK');
 }else{
   $('frontWord').textContent=w[0];
   $('backTranslation').textContent=tr||'Übersetzung wird geladen …';
   $('frontSpeakLabel').textContent=(state.settings.englishLocale==='en-US'?'US':'UK');
   $('backSpeakLabel').textContent='DE';
 }
 $('frontSpeak').dataset.text=item.dir==='de-en'?(tr||''):w[0];
 $('frontSpeak').dataset.lang=item.dir==='de-en'?'de-DE':state.settings.englishLocale;
 $('backSpeak').dataset.text=item.dir==='de-en'?w[0]:(tr||'');
 $('backSpeak').dataset.lang=item.dir==='de-en'?state.settings.englishLocale:'de-DE';
 const backEx=cachedExampleForWord(w);
 $('backExample').textContent=backEx||'';
 $('exampleSpeak').style.display=backEx?'inline-block':'none';
 $('exampleSpeak').dataset.text=backEx||'';
 $('exampleSpeak').dataset.lang=state.settings.englishLocale;
 $('practiceCounter').textContent=`${idx+1} / ${deck.length}`;
 $('practiceTitle').textContent=currentMode==='review'?'Wiederholung':`${item.pack.title} · ${fmtDate(item.pack.date)}`;

 if(!tr){
   translateWord(w[0]).then(()=>{
     const fresh=translationOf(w);
     if(idx<deck.length && deck[idx]===item){
       if(item.dir==='de-en'){
         $('frontWord').textContent=fresh||'Keine Übersetzung verfügbar';
         $('frontSpeak').dataset.text=fresh||'';
       }else{
         $('backTranslation').textContent=fresh||'Keine Übersetzung verfügbar';
         $('backSpeak').dataset.text=fresh||'';
       }
     }
     renderToday();
   });
 }
}
function nextCard(){
 if(idx<deck.length-1){idx++;renderCard();return}
 const remaining=deck.filter(x=>(pstate(x.pack,x.word).level||0)===0);
 if(currentMode==='pack' && remaining.length){
   deck=remaining;idx=0;deck.forEach(x=>x.dir=null);renderCard();
 }else{
   alert(currentMode==='review'?'Wiederholung abgeschlossen.':'Tagesrunde abgeschlossen.');
   showView('todayView');renderToday();
 }
}
function shuffleDeck(){
 for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
 idx=0;deck.forEach(x=>x.dir=null);renderCard();
}

// Free translation API; cached locally after first successful request.
const inflight=new Map();
async function translateWord(word){
 const key=word.toLowerCase();
 if(state.translations[key]) return state.translations[key];
 if(inflight.has(key)) return inflight.get(key);
 const promise=(async()=>{
   try{
     const u='https://api.mymemory.translated.net/get?q='+encodeURIComponent(word)+'&langpair=en%7Cde';
     const r=await fetch(u,{method:'GET',mode:'cors'});
     if(!r.ok) throw new Error('HTTP '+r.status);
     const j=await r.json();
     const tr=(j?.responseData?.translatedText||'').trim();
     if(tr && tr.toLowerCase()!==word.toLowerCase()){
       state.translations[key]=tr;
       save();
       return tr;
     }
   }catch(e){}
   return '';
 })().finally(()=>inflight.delete(key));
 inflight.set(key,promise);
 return promise;
}
async function preloadTranslations(pack){
 const todo=pack.words.filter(w=>!translationOf(w));
 if(!todo.length){alert('Für diesen Tag sind bereits alle Übersetzungen gespeichert.');return}
 $('translateToday').disabled=true;
 $('translateToday').textContent='Lade …';
 let cursor=0;
 async function worker(){
   while(cursor<todo.length){
     const i=cursor++;
     await translateWord(todo[i][0]);
     await new Promise(r=>setTimeout(r,120));
   }
 }
 await Promise.all([worker(),worker(),worker()]);
 $('translateToday').disabled=false;
 $('translateToday').textContent='Übersetzungen laden';
 renderToday();
 const left=todo.filter(w=>!translationOf(w)).length;
 alert(left?`${todo.length-left} Übersetzungen geladen; ${left} konnten gerade nicht geladen werden.`:'Alle 30 Übersetzungen sind jetzt lokal gespeichert.');
}

function renderArchive(){
 const packs=unlockedPacks().slice().reverse();
 $('archive').innerHTML=packs.map(p=>{
   const begun=p.words.filter(w=>isKnown(p,w)).length;
   return `<details><summary>${escapeHtml(p.title)} · ${fmtDate(p.date)} — ${begun}/${p.words.length} begonnen</summary>
     <div class="word-grid">${p.words.map(w=>`<div class="word-chip"><b>${escapeHtml(w[0])}</b><div class="translation-mini">${escapeHtml(translationOf(w)||'noch nicht geladen')}</div></div>`).join('')}</div>
     <div style="margin-top:12px"><button onclick="window.practiceDate('${p.date}')">Diesen Tag üben</button></div>
   </details>`;
 }).join('');
}
window.practiceDate=date=>{const p=packForDate(date);if(p)startPack(p)};

document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
$('startToday').onclick=()=>startPack(todayPack());
$('startReview').onclick=startDue;
$('translateToday').onclick=()=>preloadTranslations(todayPack());
$('flashcard').onclick=()=>$('flashcard').classList.toggle('flipped');
['frontSpeak','backSpeak'].forEach(id=>{
 const btn=$(id);
 btn.addEventListener('click',async e=>{
   e.stopPropagation();
   const lang=btn.dataset.lang||'en-GB';
   const text=btn.dataset.text||'';
   if(lang.toLowerCase().startsWith('en'))await speakEnglishWord(text);
   else speakText(text,lang);
 });
});
['exampleSpeak','frontExampleSpeak'].forEach(id=>{
 const btn=$(id);
 btn.addEventListener('click',e=>{
   e.stopPropagation();
   speakText(btn.dataset.text||'',btn.dataset.lang||'en-GB');
 });
});
$('showExample').addEventListener('click',e=>{
 e.stopPropagation();
 revealFrontExample();
});
$('shuffleBtn').onclick=shuffleDeck;
$('knownBtn').onclick=()=>{const x=deck[idx];setResult(x.pack,x.word,true);nextCard()};
$('againBtn').onclick=()=>{const x=deck[idx];setResult(x.pack,x.word,false);nextCard()};

$('direction').value=state.settings.direction||'en-de';
$('direction').onchange=e=>{state.settings.direction=e.target.value;save()};
$('englishLocale').value=state.settings.englishLocale||'en-GB';
$('englishLocale').onchange=e=>{state.settings.englishLocale=e.target.value;save();if(deck.length)renderCard()};
$('speechRate').value=String(state.settings.speechRate||0.88);
$('speechRate').onchange=e=>{state.settings.speechRate=Number(e.target.value);save()};
$('testEnglish').onclick=()=>speakText('Good morning. I am learning English every day.',state.settings.englishLocale||'en-GB');
$('testGerman').onclick=()=>speakText('Guten Morgen. Ich lerne jeden Tag Englisch.','de-DE');
$('speechSupportNote').textContent=speechSupported()?'Sprachausgabe ist auf diesem Gerät verfügbar.':'Sprachausgabe ist in diesem Browser nicht verfügbar.';

$('exportBtn').onclick=()=>{
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='english-trainer-365-backup.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),500);
};
$('importFile').addEventListener('change',async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
   const obj=JSON.parse(await f.text());
   state.progress=obj.progress||{};
   state.translations=obj.translations||{};
   state.dictionary=obj.dictionary||{};
   state.settings=Object.assign({direction:'en-de',englishLocale:'en-GB',speechRate:0.88},obj.settings||{});
   save();$('direction').value=state.settings.direction;$('englishLocale').value=state.settings.englishLocale;$('speechRate').value=String(state.settings.speechRate);renderToday();renderArchive();
   alert('Backup importiert.');
 }catch(err){alert('Import fehlgeschlagen: '+err.message)}
});

renderToday();renderArchive();

if('serviceWorker'in navigator){
 navigator.serviceWorker.register('sw.js').catch(()=>{});
}
