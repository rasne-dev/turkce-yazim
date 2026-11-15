(function(){
'use strict';
const TYEngine=(typeof window!=='undefined'&&window.TYEngine)||(typeof globalThis!=='undefined'&&globalThis.TYEngine)||(typeof require==='function'?require('./engine.js'):{});
const {tl,tu,tuAll,esc,WB,WE,wb,ABBRS,SPELL,DEDA,KI,WARNS,PROPER_BASES,STOP_WORDS,personAgrees,getLastVowel,convertCase,cleanText,findAndReplace,computeReadability,getNumberPhonology,normalizeNumberSuffix,analyze,computeWordDiff}=TYEngine;

// ============================================================
// DURUM & RENDER
// ============================================================
let curText='',curIssues=[],displayedIssues=[],activeFilter=null,searchQuery='',activeRepWord=null;
const ignored=new Set();

function getCustomDict(){
  try{
    const raw=localStorage.getItem('ty_dict');
    return raw?JSON.parse(raw):[];
  }catch(e){return[];}
}
function saveCustomDict(list){
  try{localStorage.setItem('ty_dict',JSON.stringify(list));}catch(e){}
}
let customDict=new Set(getCustomDict().map(tl));

function isDictIgnored(w){
  if(!w) return false;
  const clean=tl(w.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,''));
  if(customDict.has(clean)||customDict.has(tl(w.trim()))) return true;
  if(clean.includes("'")||clean.includes('\u2019')){
    const base=clean.split(/['\u2019]/)[0];
    if(base&&customDict.has(base)) return true;
  }
  return false;
}

function showToast(msg){
  const el=document.getElementById('toast');
  if(!el) return;
  el.textContent=msg;
  el.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer=setTimeout(()=>{el.classList.remove('show');},2600);
}

const HC={spell:'h-sp',gram:'h-gr',warn:'h-wn',punct:'h-pu',suggest:'h-su'};
const LBL={spell:'Yazım Hatası',gram:'Dilbilgisi',warn:'Kontrol Edin',punct:'Noktalama',suggest:'Öneri'};

function countLabel(t,selText){
  const chars=t.length;
  const noSpace=t.replace(/\s/g,'').length;
  const words=t.trim()?(t.trim().match(/[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*/g)||[]).length:0;
  if(typeof updateTargetDisplay==='function') updateTargetDisplay(words,chars);
  let base=chars.toLocaleString('tr-TR')+' karakter (boşluksuz: '+noSpace.toLocaleString('tr-TR')+') · '+words.toLocaleString('tr-TR')+' kelime';
  if(selText&&selText.trim()){
    const sChars=selText.length;
    const sWords=(selText.trim().match(/[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*/g)||[]).length;
    base+=` (Seçilen: ${sWords.toLocaleString('tr-TR')} kelime · ${sChars.toLocaleString('tr-TR')} karakter)`;
  }
  return base;
}

function setEditorText(t){
  curText=t;
  const el=document.getElementById('inp');
  el.value=t;
  autoResize.call(el);
  document.getElementById('cc').textContent=countLabel(t);
  try{if(t.trim())localStorage.setItem('ty_draft',t);else localStorage.removeItem('ty_draft');}catch(e){}
}

let initialInputText='',viewMode='text';

function renderDiffContent(){
  const orig=initialInputText||curText;
  if(!orig||orig===curText){
    return `<div class="diff-empty-notice">
      ℹ️ Henüz metin üzerinde bir düzeltme yapılmadı.<br>
      Önerilere tıklayarak veya <b>⚡ Tümünü Düzelt</b> butonunu kullanarak düzeltme yaptığınızda, orijinal metin ile son hali arasındaki tüm farklar burada kırmızı (silinen) ve yeşil (eklenen) olarak gösterilecektir.
    </div>`;
  }
  const diff=computeWordDiff(orig,curText);
  const dels=diff.filter(d=>d.type==='del').length;
  const inss=diff.filter(d=>d.type==='ins').length;
  return `
    <div class="diff-bar-top">
      <span style="font-size:.82rem;color:var(--slate)">
        Orijinal metne kıyasla <b style="color:var(--ink)">${dels+inss} değişiklik</b> yapıldı.
      </span>
      <span class="diff-badge-cnt">✓ ${dels} silinen / ${inss} eklenen</span>
    </div>
    <div class="diff-view-wrap">${diff.map(d=>{
      if(d.type==='del') return `<del class="diff-del">${esc(d.val)}</del>`;
      if(d.type==='ins') return `<ins class="diff-ins">${esc(d.val)}</ins>`;
      return esc(d.val);
    }).join('')}</div>
  `;
}

const undoStack=[],redoStack=[];
function updateUndoRedoBtns(){
  const u=document.getElementById('undoBtn');
  const r=document.getElementById('redoBtn');
  if(u) u.disabled=undoStack.length===0;
  if(r) r.disabled=redoStack.length===0;
}
function snapshotUndo(clearRedo=true){
  const el=document.getElementById('inp');
  if(el&&el.value!==curText) curText=el.value;
  if(!initialInputText) initialInputText=curText;
  undoStack.push({text:curText,ignored:new Set(ignored)});
  if(undoStack.length>50) undoStack.shift();
  if(clearRedo) redoStack.length=0;
  updateUndoRedoBtns();
}
function undo(){
  const st=undoStack.pop();
  if(!st) return;
  redoStack.push({text:curText,ignored:new Set(ignored)});
  ignored.clear();
  for(const v of st.ignored) ignored.add(v);
  setEditorText(st.text);
  closePop();run();
  if(!undoStack.length){
    initialInputText=curText;
  }
  updateUndoRedoBtns();
  const banner=document.getElementById('diffBanner');
  if(banner) banner.style.display='none';
  showToast('↩ Son işlem geri alındı.');
}
function redo(){
  const st=redoStack.pop();
  if(!st) return;
  undoStack.push({text:curText,ignored:new Set(ignored)});
  ignored.clear();
  for(const v of st.ignored) ignored.add(v);
  setEditorText(st.text);
  closePop();run();
  updateUndoRedoBtns();
  showToast('↪ İşlem ileri alındı.');
}

function setLiveStatus(state,text){
  const el=document.getElementById('liveStatus');
  const txt=document.getElementById('liveStatusTxt');
  if(!el||!txt) return;
  el.className='live-status'+(state?' '+state:'');
  txt.textContent=text;
}

function renderPlainSeg(seg){
  if(!seg) return '';
  const fbEl=document.getElementById('findBar');
  const fiEl=document.getElementById('findInp');
  const findActive=fbEl&&fbEl.style.display==='flex'&&fiEl&&fiEl.value.length>0;
  const findVal=findActive?fiEl.value:null;

  function renderRepSeg(sub){
    if(!sub) return '';
    if(!activeRepWord) return esc(sub).replace(/\n/g,'<br>');
    const parts=sub.split(/([\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*)/g);
    return parts.map(p=>{
      if(p&&tl(p)===activeRepWord) return `<mark class="h-rep" title="Sık tekrarlanan kelime">${esc(p)}</mark>`;
      return esc(p).replace(/\n/g,'<br>');
    }).join('');
  }

  if(!findVal) return renderRepSeg(seg);

  const lseg=tl(seg);
  const lf=tl(findVal);
  if(!lf) return renderRepSeg(seg);
  let out='',pos=0,idx;
  while((idx=lseg.indexOf(lf,pos))!==-1){
    out+=renderRepSeg(seg.slice(pos,idx));
    out+=`<mark class="h-find" title="Arama eşleşmesi">${esc(seg.slice(idx,idx+lf.length))}</mark>`;
    pos=idx+lf.length;
  }
  out+=renderRepSeg(seg.slice(pos));
  return out;
}

function renderOut(text,issues){
  let html='',pos=0;
  for(let i=0;i<issues.length;i++){
    const iss=issues[i];
    html+=renderPlainSeg(text.slice(pos,iss.start));
    const tipText=(iss.msg||'')+(iss.detail?' — '+iss.detail:'');
    html+=`<span class="${HC[iss.type]}" id="mark-${i}" tabindex="0" role="button" title="${esc(tipText)}" aria-label="${esc(LBL[iss.type])}: ${esc(iss.word.trim()||'boşluk')}" onclick="TY.pop(event,${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();TY.pop(event,${i})}">${esc(iss.word)||'&nbsp;&nbsp;'}</span>`;
    pos=iss.end;
  }
  return html+renderPlainSeg(text.slice(pos));
}

function renderSide(issues){
  if(!issues.length){
    return'<div style="font-size:.78rem;color:var(--slate);padding:.5rem;text-align:center">Aramaya uygun hata bulunamadı.</div>';
  }
  return issues.map((iss,i)=>{
    const w=iss.word.trim()||'(boşluk)';
    const firstSug=iss.suggestions&&iss.suggestions.length>0?iss.suggestions[0]:undefined;
    const s=firstSug!==undefined?`<div class="is">→ ${firstSug===''?'(Kaldır)':esc(firstSug)}</div>`:'';
    const d=iss.detail?`<div class="id" style="font-size:.72rem;color:var(--slate);margin-top:.25rem;line-height:1.3">💡 ${esc(iss.detail)}</div>`:'';
    const tipText=(iss.msg||'')+(iss.detail?' — '+iss.detail:'');
    const canQuickFix=iss.type!=='warn'&&firstSug!==undefined;
    const qFixTitle=firstSug===''?'Tek tıkla kaldır':`Tek tıkla düzelt: ${esc(firstSug||'')}`;
    const qFixBtn=canQuickFix?`<button type="button" class="ii-qbtn fix" title="${qFixTitle}" aria-label="Tek tıkla düzelt" onclick="TY.qfix(event,${i})">✓</button>`:'';
    const qIgnBtn=`<button type="button" class="ii-qbtn ign" title="Yoksay" aria-label="Yoksay" onclick="TY.qign(event,${i})">✕</button>`;
    return`<div class="ii ${iss.type}" role="listitem" title="${esc(tipText)}" onclick="TY.pop(event,${i})">
      <div class="ii-top"><div class="iw" tabindex="0" role="button" aria-label="${esc(LBL[iss.type])}: ${esc(w)} — ${esc(iss.msg)}" onclick="TY.pop(null,${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();TY.pop(null,${i})}">${esc(w)}</div><div class="ii-acts">${qFixBtn}${qIgnBtn}</div></div><div class="im" onclick="TY.pop(null,${i})">${esc(iss.msg)}</div>${d}${s}</div>`;
  }).join('');
}

function renderRes(issues,isFiltered){
  if(!issues.length){
    if(isFiltered) return`<div class="okcard">
      <div style="font-size:2.5rem;margin-bottom:.75rem">🔍</div>
      <div style="font-size:1.1rem;font-weight:700;color:var(--ink)">Bu filtrede hata yok.</div>
      <div style="color:var(--slate);font-size:.85rem;margin-top:.4rem">Diğer hataları görmek için filtreyi kaldırın.</div>
    </div>`;
    const hasDiff=initialInputText&&initialInputText!==curText;
    const fbEl=document.getElementById('findBar');
    const fiEl=document.getElementById('findInp');
    const findActive=fbEl&&fbEl.style.display==='flex'&&fiEl&&fiEl.value.length>0;
    const showCleanText=findActive||!!activeRepWord;
    return`<div class="okcard">
      <div style="font-size:2.5rem;margin-bottom:.75rem">✅</div>
      <div style="font-size:1.1rem;font-weight:700;color:var(--green)">Harika! Hata bulunamadı.</div>
      <div style="color:var(--slate);font-size:.85rem;margin-top:.4rem">Metninizde tespit edilebilen bir yazım veya noktalama sorunu yok.</div>
    </div>
    ${hasDiff ? `
    <div class="ocard" style="margin-top:1.25rem">
      <div class="ctit" style="display:flex;align-items:center;justify-content:space-between">
        <span>Değişiklik Karşılaştırması (Orijinal → Düzeltilmiş)</span>
        <button type="button" class="btn btn-g btn-xs" id="diffUndoBtnOk">↩ Geri Al</button>
      </div>
      <div id="otxt">${renderDiffContent()}</div>
    </div>` : showCleanText ? `
    <div class="ocard" style="margin-top:1.25rem">
      <div class="ctit"><span>Denetlenen Metin (Vurgulamalar)</span></div>
      <div id="otxt">${renderOut(curText,[])}</div>
    </div>` : ''}`;
  }
  return`<div class="rgrid">
    <div class="ocard">
      <div class="ctit" style="display:flex;align-items:center;justify-content:space-between">
        <span>${viewMode==='diff'?'Değişiklik Karşılaştırması':'Denetlenen Metin'}</span>
        <div class="view-toggles">
          <button type="button" class="vt-btn ${viewMode==='text'?'active':''}" id="vtEditor">İşaretli Metin</button>
          <button type="button" class="vt-btn ${viewMode==='diff'?'active':''}" id="vtDiff">Karşılaştırma (Fark)</button>
        </div>
      </div>
      <div id="otxt">${viewMode==='diff'?renderDiffContent():renderOut(curText,issues)}</div>
    </div>
    <div class="scard">
      <div class="ctit"><span id="sideTitle">Hatalar &amp; Öneriler (${issues.length})</span></div>
      <div class="side-search-wrap">
        <input type="text" class="side-search" id="errSearch" placeholder="Hatalarda ara..." value="${esc(searchQuery)}">
        <button type="button" class="side-search-clear" id="errSearchClear" aria-label="Aramayı temizle" style="${searchQuery?'display:block':''}">✕</button>
      </div>
      <div id="slist" role="list" aria-label="Hatalar ve öneriler listesi">${renderSide(issues)}</div>
    </div>
  </div>`;
}

window.TY={
  positionPopNearMark(markEl){
    const pop=document.getElementById('pop');
    if(!pop) return;
    if(window.innerWidth<=600){
      pop.style.left='50%';pop.style.top='auto';pop.style.bottom='1rem';pop.style.transform='translateX(-50%)';
      return;
    }
    if(markEl&&markEl.getBoundingClientRect){
      const r=markEl.getBoundingClientRect();
      let x=r.left,y=r.bottom+8;
      if(x+286>window.innerWidth) x=r.right-286;
      if(y+380>window.innerHeight) y=Math.max(4,r.top-380);
      pop.style.transform='';
      pop.style.left=Math.max(4,x)+'px';pop.style.top=Math.max(4,y)+'px';
    } else {
      pop.style.left='50%';pop.style.top='40%';pop.style.transform='translate(-50%,-50%)';
    }
  },
  pop(ev,idx){
    if(ev) ev.stopPropagation();
    if(viewMode==='diff'){
      viewMode='text';
      renderCurrent();
    }
    if(!TY.render(idx)) return;
    const pop=document.getElementById('pop');
    pop.style.display='block';pop.style.transform='';
    const markEl=document.getElementById('mark-'+idx);
    if(markEl){
      markEl.scrollIntoView({behavior:'smooth',block:'center'});
      markEl.classList.remove('pulse-target');
      void markEl.offsetWidth;
      markEl.classList.add('pulse-target');
      setTimeout(()=>{if(markEl)markEl.classList.remove('pulse-target');},1300);
    }
    const isMobile=window.innerWidth<=600;
    if(isMobile){
      pop.style.left='50%';pop.style.top='auto';pop.style.bottom='1rem';pop.style.transform='translateX(-50%)';
    } else {
      const isMouse=ev&&typeof ev.clientX==='number'&&(ev.clientX!==0||ev.clientY!==0||ev.type.startsWith('click')||ev.type.startsWith('mouse'));
      if(isMouse){
        let x=ev.clientX+10,y=ev.clientY+14;
        if(x+286>window.innerWidth) x=ev.clientX-294;
        if(y+380>window.innerHeight) y=ev.clientY-390;
        pop.style.left=Math.max(4,x)+'px';pop.style.top=Math.max(4,y)+'px';
      } else if(ev&&ev.target&&ev.target.getBoundingClientRect){
        TY.positionPopNearMark(ev.target);
      } else {
        TY.positionPopNearMark(markEl);
      }
    }
    lastFocused=(ev&&ev.target)||document.activeElement;
    document.getElementById('pc').focus();
  },
  render(idx){
    const iss=displayedIssues[idx];if(!iss)return false;
    curPopIdx=idx;
    document.querySelectorAll('.active-mark').forEach(el=>el.classList.remove('active-mark'));
    const activeEl=document.getElementById('mark-'+idx);
    if(activeEl) activeEl.classList.add('active-mark');
    const p=document.getElementById('pb');p.textContent=LBL[iss.type];p.className='pb '+iss.type;
    document.getElementById('pw').textContent=iss.word.trim()||'(boşluk)';
    document.getElementById('pm').textContent=iss.msg;
    const body=document.getElementById('pbody');
    if(iss.type==='warn'){
      const g=iss.guess;
      const guessBox=g?`<div class="wgb">🔎 <b>En olası:</b> ${esc(g.opt==='A'?iss.optA.label:iss.optB.label)} — ${esc(g.reason)}</div>`:'';
      body.innerHTML=`<div class="wbox">
        <div class="wbt">📌 ${esc(iss.rule)}</div>
        <div class="wbr">${esc(iss.detail).replace(/\n/g,'<br>')}</div>
      </div>
      ${guessBox}
      <div class="ol">Ne yapmak istersiniz?</div>
      ${iss.optA.val?`<button class="ob${g&&g.opt==='A'?' obGuess':''}" data-fix="${esc(iss.optA.val)}"><span class="oi">✏️</span><span class="ot">${esc(iss.optA.label)}${g&&g.opt==='A'?' ⭐':''}<span class="os">${esc(iss.optA.sub||'')}</span></span></button>`:''}
      <button class="ob${g&&g.opt==='B'?' obGuess':''}" data-ign-word="${esc(iss.word)}" data-ign-type="${esc(iss.type)}"><span class="oi">✓</span><span class="ot">${esc(iss.optB.label)}${g&&g.opt==='B'?' ⭐':''}<span class="os">${esc(iss.optB.sub||'')}</span></span></button>`;
    } else if(iss.suggestions.length){
      const ruleBox=iss.detail?`<div class="wbox" style="margin-bottom:.75rem;padding:.5rem .75rem;border-radius:6px;background:rgba(59,130,246,.08);border-left:3px solid var(--accent)">
        <div style="font-weight:700;font-size:.78rem;color:var(--accent);margin-bottom:.2rem">📌 ${esc(iss.rule||'Kural & Neden')}</div>
        <div style="font-size:.76rem;line-height:1.4;color:var(--ink)">${esc(iss.detail)}</div>
      </div>`:'';
      body.innerHTML=ruleBox+'<div class="sl">Öneriler</div>'+
        iss.suggestions.map(s=>`<button class="sb" data-fix="${esc(s)}">${s===''?'🗑️ Fazla işareti kaldır':esc(s)}</button>`).join('');
    } else { body.innerHTML='<div style="font-size:.76rem;color:var(--slate);font-style:italic">Öneri bulunamadı</div>'; }

    body.onclick=e=>{
      const fixBtn=e.target.closest('[data-fix]');
      if(fixBtn){
        TY.fix(curPopIdx, fixBtn.getAttribute('data-fix'));
        return;
      }
      const ignBtn=e.target.closest('[data-ign-word]');
      if(ignBtn){
        TY.ign(ignBtn.getAttribute('data-ign-word'), ignBtn.getAttribute('data-ign-type'));
        return;
      }
    };
    const ft=document.getElementById('pf');ft.innerHTML='';
    if(iss.type!=='warn'){
      const actRow=document.createElement('div');
      actRow.style.cssText='display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;';
      const b=document.createElement('button');b.className='pa';b.textContent='Yoksay';b.onclick=()=>TY.ign(iss.word,iss.type);
      actRow.append(b);
      const cleanW=iss.word.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,'');
      if(iss.type!=='punct'&&cleanW.length>0){
        const d=document.createElement('button');d.className='pa';d.textContent='➕ Sözlüğe Ekle';d.onclick=()=>TY.addToDict(iss.word);
        actRow.append(d);
      }
      ft.appendChild(actRow);
    }
    if(displayedIssues.length>1){
      const nav=document.createElement('div');nav.className='pnav';
      const prevB=document.createElement('button');prevB.className='pnb';prevB.textContent='‹ Önceki';
      prevB.disabled=idx<=0;prevB.onclick=(ev2)=>{ev2.stopPropagation();TY.nav(-1);};
      const cnt=document.createElement('span');cnt.className='pcnt';cnt.textContent=(idx+1)+' / '+displayedIssues.length;
      const nextB=document.createElement('button');nextB.className='pnb';nextB.textContent='Sonraki ›';
      nextB.disabled=idx>=displayedIssues.length-1;nextB.onclick=(ev2)=>{ev2.stopPropagation();TY.nav(1);};
      nav.append(prevB,cnt,nextB);ft.appendChild(nav);
    }
    return true;
  },
  nav(dir){
    const ni=curPopIdx+dir;
    if(ni<0||ni>=displayedIssues.length) return;
    TY.render(ni);
    const markEl=document.getElementById('mark-'+ni);
    if(markEl){
      markEl.scrollIntoView({behavior:'smooth',block:'center'});
      TY.positionPopNearMark(markEl);
    }
  },
  fix(idx,sug){
    const iss=displayedIssues[idx];if(!iss)return;
    snapshotUndo();
    setEditorText(curText.slice(0,iss.start)+sug+curText.slice(iss.end));
    closePop();run();
  },
  qfix(ev,idx){
    if(ev) ev.stopPropagation();
    const iss=displayedIssues[idx];
    if(!iss||!iss.suggestions||iss.suggestions[0]===undefined) return;
    TY.fix(idx,iss.suggestions[0]);
  },
  qign(ev,idx){
    if(ev) ev.stopPropagation();
    const iss=displayedIssues[idx];
    if(!iss) return;
    TY.ign(iss.word,iss.type);
  },
  ign(word,type){snapshotUndo();ignored.add((type||'')+'|'+tl(word));closePop();run();},
  addToDict(word){
    const clean=tl(word.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,''));
    if(!clean) return;
    snapshotUndo();
    customDict.add(clean);
    saveCustomDict(Array.from(customDict));
    closePop();run();
    renderDictList();
    showToast(`"${clean}" kişisel sözlüğe eklendi.`);
  },
  removeFromDict(word){
    const clean=tl(word.trim());
    customDict.delete(clean);
    saveCustomDict(Array.from(customDict));
    renderDictList();run();
    showToast(`"${word}" sözlükten silindi.`);
  }
};
let curPopIdx=-1;

let lastFocused=null;
function closePop(){
  document.getElementById('pop').style.display='none';
  document.querySelectorAll('.active-mark').forEach(el=>el.classList.remove('active-mark'));
  if(lastFocused&&lastFocused.focus){lastFocused.focus();}
  lastFocused=null;
}
document.getElementById('pc').addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();closePop();}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Tab'){
    const modals=[document.getElementById('pop'),document.getElementById('kbdModal'),document.getElementById('dictModal'),document.getElementById('exportModal'),document.getElementById('targetModal')];
    const openM=modals.find(m=>m&&(m.style.display==='flex'||(m.style.display!=='none'&&m.style.display!=='')));
    if(openM){
      const focusables=Array.from(openM.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(el=>el.offsetParent!==null);
      if(focusables.length>0){
        const first=focusables[0];
        const last=focusables[focusables.length-1];
        if(e.shiftKey&&document.activeElement===first){
          e.preventDefault();
          last.focus();
        } else if(!e.shiftKey&&document.activeElement===last){
          e.preventDefault();
          first.focus();
        }
      }
    }
  }
  if(e.key==='Escape'){
    if(document.getElementById('pop').style.display!=='none') closePop();
    if(document.getElementById('kbdModal').style.display!=='none'){
      document.getElementById('kbdModal').style.display='none';
      if(kbdBtn) kbdBtn.focus();
    }
    if(document.getElementById('dictModal').style.display!=='none'){
      document.getElementById('dictModal').style.display='none';
      if(dictBtn) dictBtn.focus();
    }
    if(document.getElementById('exportModal').style.display!=='none'){
      document.getElementById('exportModal').style.display='none';
      if(toolsBtn) toolsBtn.focus();
    }
    if(document.getElementById('targetModal')&&document.getElementById('targetModal').style.display!=='none'){
      document.getElementById('targetModal').style.display='none';
      const tb=document.getElementById('targetBtn');
      if(tb) tb.focus();
    }
    const fb=document.getElementById('findBar');
    if(fb&&fb.style.display==='flex'){
      if(typeof toggleFindBar==='function') toggleFindBar(false);
      else fb.style.display='none';
    }
    if(typeof toggleFxMenu==='function') toggleFxMenu(false);
    if(typeof toggleCaseMenu==='function') toggleCaseMenu(false);
    if(typeof toggleToolsMenu==='function') toggleToolsMenu(false);
  }
  if(document.getElementById('pop').style.display!=='none'){
    if(e.key==='ArrowRight'){e.preventDefault();TY.nav(1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();TY.nav(-1);}
  }
  if(e.key==='?'&&document.activeElement!==inp&&!['INPUT','TEXTAREA'].includes((document.activeElement||{}).tagName)){
    e.preventDefault();
    document.getElementById('kbdModal').style.display='flex';
    const kc=document.getElementById('kbdClose');
    if(kc) kc.focus();
  }
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==='h'||e.key==='H'||e.key==='f'||e.key==='F')){
    e.preventDefault();
    if(typeof toggleFindBar==='function') toggleFindBar();
  }
  if((e.ctrlKey||e.metaKey)&&e.shiftKey&&(e.key==='F'||e.key==='f')){
    e.preventDefault();
    fixByType(['spell','gram','punct','suggest']);
  }
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&(e.key==='z'||e.key==='Z')&&document.activeElement!==inp){
    e.preventDefault();
    undo();
  }
  if((e.ctrlKey||e.metaKey)&&((!e.shiftKey&&(e.key==='y'||e.key==='Y'))||(e.shiftKey&&(e.key==='z'||e.key==='Z')))&&document.activeElement!==inp){
    e.preventDefault();
    redo();
  }
  if((e.ctrlKey||e.metaKey)&&e.altKey&&(e.key==='c'||e.key==='C')){
    e.preventDefault();
    document.getElementById('cpyBtn').click();
  }
});

function run(){
  curText=document.getElementById('inp').value;
  if(typeof updateFindCount==='function') updateFindCount();
  const emptyHints=document.getElementById('emptyHints');
  if(emptyHints) emptyHints.style.display=curText.trim()?'none':'flex';
  if(!curText.trim()){
    ['statsBar','res'].forEach(id=>document.getElementById(id).style.display='none');
    setLiveStatus('','Hazır');
    curIssues=[];displayedIssues=[];activeRepWord=null;closePop();return;
  }
  curIssues=analyze(curText).filter(i=>!ignored.has(i.type+'|'+tl(i.word))&&!isDictIgnored(i.word));
  setLiveStatus('done','✓ Denetlendi');

  document.getElementById('cSp').textContent=curIssues.filter(i=>i.type==='spell').length;
  document.getElementById('cGr').textContent=curIssues.filter(i=>i.type==='gram').length;
  document.getElementById('cWn').textContent=curIssues.filter(i=>i.type==='warn').length;
  document.getElementById('cPu').textContent=curIssues.filter(i=>i.type==='punct').length;
  document.getElementById('cSu').textContent=curIssues.filter(i=>i.type==='suggest').length;
  document.getElementById('cTo').textContent=curIssues.length;

  const rStats=computeReadability(curText);
  if(rStats){
    document.getElementById('readScore').textContent=rStats.isShort?'- / 100':(rStats.score+' / 100');
    const b=document.getElementById('readBadge');
    b.textContent=rStats.label;
    b.className='read-badge '+rStats.cls;
    const meter=document.getElementById('readMeterFill');
    if(meter){
      meter.style.width=rStats.isShort?'0%':Math.max(5,rStats.score)+'%';
      let mColor='#ef4444';
      if(rStats.score>=90) mColor='#22c55e';
      else if(rStats.score>=70) mColor='#3b82f6';
      else if(rStats.score>=50) mColor='#eab308';
      else if(rStats.score>=30) mColor='#f97316';
      meter.style.background=mColor;
    }
    document.getElementById('readTime').textContent='~'+rStats.readTimeStr;
    const spEl=document.getElementById('speechTime');
    if(spEl) spEl.textContent='~'+rStats.speechTimeStr;
    document.getElementById('stNoSpace').textContent=rStats.noSpaceChars.toLocaleString('tr-TR');
    document.getElementById('stEstPages').textContent=rStats.estPagesStr;
    document.getElementById('stSent').textContent=rStats.totalSentences;
    document.getElementById('stAvgSent').textContent=rStats.avgSentenceLength+' kelime';
    const parEl=document.getElementById('stParas');
    if(parEl) parEl.textContent=rStats.totalParagraphs;
    const divEl=document.getElementById('stDiversity');
    if(divEl) divEl.textContent='%'+rStats.diversityRatio+' ('+rStats.uniqueWords+' tekil)';
    const repBar=document.getElementById('repWordsBar');
    if(repBar){
      if(rStats.topRepeated&&rStats.topRepeated.length>0){
        if(activeRepWord&&!rStats.topRepeated.some(r=>r.word===activeRepWord)) activeRepWord=null;
        repBar.style.display='flex';
        repBar.innerHTML='<span>🔁 <b>Sık Tekrarlanan Kelimeler</b> <small style="opacity:.75">(vurgulamak için tıklayın)</small>:</span>'+
          rStats.topRepeated.map(({word,count})=>`<span class="rep-chip${activeRepWord===word?' active':''}" tabindex="0" role="button" data-rep-word="${esc(word)}" title="Metin içinde '${esc(word)}' kelimesini vurgula">${esc(word)} <b>${count}×</b></span>`).join('');
      } else {
        activeRepWord=null;
        repBar.style.display='none';
      }
    }
  }

  document.getElementById('statsBar').style.display='block';
  updateFxButton();
  renderCurrent();
}

function updateFxButton(){
  const allowedTypes=activeFilter?[activeFilter]:['spell','gram','punct','suggest'];
  const fixableCount=curIssues.filter(i=>allowedTypes.includes(i.type)&&i.type!=='warn'&&i.suggestions.length>0).length;
  const totalFixable=curIssues.filter(i=>['spell','gram','punct','suggest'].includes(i.type)&&i.type!=='warn'&&i.suggestions.length>0).length;

  const fxBtn=document.getElementById('fxAll');
  if(fxBtn){
    fxBtn.disabled=fixableCount===0;
    const catLabel=activeFilter?(
      activeFilter==='spell'?'Yazımı Düzelt':
      activeFilter==='punct'?'Noktalamayı Düzelt':
      activeFilter==='gram'?'Dilbilgisini Düzelt':
      activeFilter==='suggest'?'Önerileri Uygula':'Düzelt'
    ):'Tümünü Düzelt';
    fxBtn.textContent=fixableCount>0?`⚡ ${catLabel} (${fixableCount})`:`⚡ ${catLabel}`;
    fxBtn.title=activeFilter?`Sadece seçili kategorideki (${catLabel}) sorunları düzeltir`:'Tüm otomatik düzeltilebilir sorunları uygular';
  }
  const fxDropdownBtn=document.getElementById('fxDropdownBtn');
  if(fxDropdownBtn){
    fxDropdownBtn.disabled=totalFixable===0;
  }
}

function renderCurrent(){
  let list=activeFilter?curIssues.filter(i=>i.type===activeFilter):curIssues;
  if(searchQuery.trim()){
    const q=tl(searchQuery.trim());
    list=list.filter(i=>tl(i.word).includes(q)||tl(i.msg).includes(q));
  }
  displayedIssues=list;
  const ra=document.getElementById('res');ra.style.display='block';
  ra.innerHTML=renderRes(displayedIssues,!!activeFilter||!!searchQuery);

  const vtEd=document.getElementById('vtEditor');
  const vtDf=document.getElementById('vtDiff');
  if(vtEd) vtEd.addEventListener('click',()=>{viewMode='text';renderCurrent();});
  if(vtDf) vtDf.addEventListener('click',()=>{viewMode='diff';renderCurrent();});
  const uOk=document.getElementById('diffUndoBtnOk');
  if(uOk) uOk.addEventListener('click',undo);

  function updateSideSearchResults(){
  let list=activeFilter?curIssues.filter(i=>i.type===activeFilter):curIssues;
  if(searchQuery.trim()){
    const q=tl(searchQuery.trim());
    list=list.filter(i=>tl(i.word).includes(q)||tl(i.msg).includes(q));
  }
  displayedIssues=list;
  const slist=document.getElementById('slist');
  if(slist) slist.innerHTML=renderSide(displayedIssues);
  const otxt=document.getElementById('otxt');
  if(otxt&&viewMode==='text') otxt.innerHTML=renderOut(curText,displayedIssues);
  const sTitle=document.getElementById('sideTitle');
  if(sTitle) sTitle.textContent=`Hatalar & Öneriler (${displayedIssues.length})`;
  const sClear=document.getElementById('errSearchClear');
  if(sClear) sClear.style.display=searchQuery?'block':'none';
}

  const sInput=document.getElementById('errSearch');
  const sClear=document.getElementById('errSearchClear');
  if(sInput){
    sInput.addEventListener('input',e=>{
      searchQuery=e.target.value;
      updateSideSearchResults();
    });
    sInput.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        searchQuery='';
        e.target.value='';
        updateSideSearchResults();
      }
    });
  }
  if(sClear){
    sClear.addEventListener('click',()=>{
      searchQuery='';
      const ni=document.getElementById('errSearch');
      if(ni){ ni.value=''; ni.focus(); }
      updateSideSearchResults();
    });
  }
}

function setFilter(t){
  activeFilter=(t===''||activeFilter===t)?null:t;
  document.querySelectorAll('#statsBar .st[data-type]').forEach(el=>{
    const isAct=activeFilter?el.dataset.type===activeFilter:el.dataset.type==='';
    el.classList.toggle('active',isAct);
    el.setAttribute('aria-pressed',String(isAct));
  });
  updateFxButton();
  if(document.getElementById('res').style.display!=='none') renderCurrent();
}
document.querySelectorAll('#statsBar .st[data-type]').forEach(el=>{
  el.addEventListener('click',()=>setFilter(el.dataset.type));
  el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setFilter(el.dataset.type);}});
});

function showDiffBanner(changes){
  const banner=document.getElementById('diffBanner');
  const sumText=document.getElementById('diffSummaryText');
  const details=document.getElementById('diffDetails');
  const toggleBtn=document.getElementById('diffToggleBtn');
  if(!banner||!sumText||!details) return;

  sumText.innerHTML=`⚡ <b>${changes.length} otomatik düzeltme yapıldı.</b>`;
  const seen=new Set();
  const unique=[];
  for(const c of changes){
    const key=c.before+'->'+c.after;
    if(!seen.has(key)){
      seen.add(key);
      unique.push(c);
    }
  }
  details.innerHTML=unique.map(c=>`
    <span class="diff-chip"><del>${esc(c.before)}</del> → <ins>${esc(c.after)}</ins></span>
  `).join('');
  toggleBtn.textContent='Ayrıntıları Göster ↓';
  details.style.display='none';
  banner.style.display='block';
}

function fixByType(types){
  snapshotUndo();
  let t=curText;
  const changes=[];
  for(let pass=0;pass<8;pass++){
    const issues=analyze(t).filter(i=>!ignored.has(i.type+'|'+tl(i.word))&&!isDictIgnored(i.word));
    const safe=issues
      .filter(i=>types.includes(i.type)&&i.type!=='warn'&&i.suggestions.length>0)
      .sort((a,b)=>b.start-a.start);
    if(!safe.length) break;
    for(const iss of safe){
      changes.push({before:iss.word,after:iss.suggestions[0],type:iss.type});
      t=t.slice(0,iss.start)+iss.suggestions[0]+t.slice(iss.end);
    }
  }
  setEditorText(t);run();
  if(changes.length>0){
    showDiffBanner(changes);
  }
}

document.getElementById('chkBtn').addEventListener('click',()=>{
  run();
  if(!curText.trim()){
    showToast('Lütfen denetlemek için bir metin girin.');
    return;
  }
  const statsEl=document.getElementById('statsBar');
  if(statsEl&&statsEl.style.display!=='none'){
    statsEl.scrollIntoView({behavior:'smooth',block:'start'});
  }
  if(curIssues.length===0){
    showToast('✅ Harika! Hiçbir yazım veya noktalama hatası bulunamadı.');
  } else {
    showToast(`🔍 ${curIssues.length} olası sorun tespit edildi.`);
  }
});
document.getElementById('clrBtn').addEventListener('click',()=>{
  if(!curText.trim()) return;
  snapshotUndo();
  const el=document.getElementById('inp');
  el.value='';
  el.style.height='auto';
  ['statsBar','res','diffBanner'].forEach(id=>{
    const d=document.getElementById(id);
    if(d) d.style.display='none';
  });
  const emptyHints=document.getElementById('emptyHints');
  if(emptyHints) emptyHints.style.display='flex';
  setLiveStatus('','Hazır');
  document.getElementById('cc').textContent=countLabel('');
  document.getElementById('draftNotice').style.display='none';
  curText='';initialInputText='';curIssues=[];displayedIssues=[];ignored.clear();closePop();
  updateFindCount();
  try{localStorage.removeItem('ty_draft');}catch(e){}
  showToast('🗑 Metin temizlendi. (Geri almak için: ↩ Geri Al)');
});
const cpyBtnTop=document.getElementById('cpyBtnTop');
const cpyBtn=document.getElementById('cpyBtn');

function copyEditorText(btn){
  const val=document.getElementById('inp').value;
  if(!val.trim()){
    showToast('Kopyalanacak metin bulunamadı.');
    return;
  }
  const btns=[cpyBtn,cpyBtnTop].filter(Boolean);
  const showResult=ok=>{
    btns.forEach(b=>{ b.textContent=ok?'✓ Kopyalandı!':'✕ Kopyalanamadı'; });
    if(ok) showToast('📋 Metin panoya kopyalandı.');
    clearTimeout(copyEditorText._timer);
    copyEditorText._timer=setTimeout(()=>{
      btns.forEach(b=>{ b.textContent='⎘ Kopyala'; });
    },2000);
  };
  const legacyCopy=()=>{
    try{
      const ta=document.createElement('textarea');
      ta.value=val;ta.style.position='fixed';ta.style.opacity='0';
      document.body.appendChild(ta);ta.focus();ta.select();
      const ok=document.execCommand('copy');
      document.body.removeChild(ta);
      showResult(ok);
    }catch(e){showResult(false);}
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(val).then(()=>showResult(true)).catch(legacyCopy);
  } else {
    legacyCopy();
  }
}

if(cpyBtn) cpyBtn.addEventListener('click',function(){ copyEditorText(this); });
if(cpyBtnTop) cpyBtnTop.addEventListener('click',function(){ copyEditorText(this); });

async function handlePasteAction(){
  try{
    if(navigator.clipboard&&navigator.clipboard.readText){
      const text=await navigator.clipboard.readText();
      if(!text||!text.trim()){
        showToast('Panoda yapıştırılacak metin bulunamadı.');
        return;
      }
      snapshotUndo();
      const el=document.getElementById('inp');
      if(el&&el.value.trim().length>0&&typeof el.selectionStart==='number'&&typeof el.selectionEnd==='number'&&el.selectionStart!==el.selectionEnd){
        const s=el.selectionStart,e=el.selectionEnd;
        const nextVal=el.value.slice(0,s)+text+el.value.slice(e);
        setEditorText(nextVal);
        try{el.focus();el.setSelectionRange(s+text.length,s+text.length);}catch(err){}
      } else {
        setEditorText(text);
        initialInputText=text;
      }
      const dn=document.getElementById('draftNotice');
      if(dn) dn.style.display='none';
      const db=document.getElementById('diffBanner');
      if(db) db.style.display='none';
      run();
      showToast('📋 Metin panodan yapıştırıldı ve denetlendi.');
    } else {
      const el=document.getElementById('inp');
      if(el) el.focus();
      showToast('Lütfen Ctrl+V kısayolu ile yapıştırın.');
    }
  }catch(err){
    const el=document.getElementById('inp');
    if(el) el.focus();
    showToast('Pano erişim izni verilmedi. Lütfen Ctrl+V ile yapıştırın.');
  }
}

['pasteBtn','pasteBtnHeader','pasteBtnBottom','pasteHintBtn'].forEach(id=>{
  const b=document.getElementById(id);
  if(b) b.addEventListener('click',handlePasteAction);
});

function updateEditorCount(){
  const el=document.getElementById('inp');
  if(!el) return;
  const sStart=el.selectionStart,sEnd=el.selectionEnd;
  const sel=typeof sStart==='number'&&typeof sEnd==='number'&&sStart!==sEnd?el.value.slice(sStart,sEnd):null;
  document.getElementById('cc').textContent=countLabel(el.value,sel);
}
document.getElementById('inp').addEventListener('input',updateEditorCount);
['select','keyup','mouseup','pointerup'].forEach(ev=>{
  document.getElementById('inp').addEventListener(ev,updateEditorCount);
});
document.getElementById('inp').addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();document.getElementById('chkBtn').click();}
});
const fxDropdownBtn=document.getElementById('fxDropdownBtn');
const fxMenu=document.getElementById('fxMenu');
function toggleFxMenu(open){
  if(!fxMenu) return;
  const show=typeof open==='boolean'?open:fxMenu.style.display==='none';
  fxMenu.style.display=show?'block':'none';
  if(fxDropdownBtn) fxDropdownBtn.setAttribute('aria-expanded',show?'true':'false');
}
if(fxDropdownBtn){
  fxDropdownBtn.addEventListener('click',e=>{
    e.stopPropagation();
    toggleFxMenu();
  });
}
if(fxMenu){
  fxMenu.addEventListener('click',e=>{
    const item=e.target.closest('.dropdown-item');
    if(!item) return;
    const cat=item.getAttribute('data-fix-cat');
    toggleFxMenu(false);
    if(cat==='all'){
      fixByType(['spell','gram','punct','suggest']);
    } else if(cat){
      fixByType([cat]);
    }
  });
}

const caseBtn=document.getElementById('caseBtn');
const caseMenu=document.getElementById('caseMenu');
function toggleCaseMenu(open){
  if(!caseMenu) return;
  const show=typeof open==='boolean'?open:caseMenu.style.display==='none';
  caseMenu.style.display=show?'block':'none';
  if(caseBtn) caseBtn.setAttribute('aria-expanded',show?'true':'false');
}
if(caseBtn){
  caseBtn.addEventListener('click',e=>{
    e.stopPropagation();
    if(typeof toggleToolsMenu==='function') toggleToolsMenu(false);
    toggleCaseMenu();
  });
}
if(caseMenu){
  caseMenu.addEventListener('click',e=>{
    const item=e.target.closest('.dropdown-item');
    if(!item) return;
    const mode=item.getAttribute('data-case');
    toggleCaseMenu(false);
    const el=document.getElementById('inp');
    const val=el.value;
    if(!val.trim()){
      showToast('Dönüştürülecek metin bulunamadı.');
      return;
    }
    snapshotUndo();
    const selStart=el.selectionStart,selEnd=el.selectionEnd;
    let nextVal=val;
    let hasSel=false,convertedLen=0;
    if(typeof selStart==='number'&&typeof selEnd==='number'&&selStart!==selEnd){
      const part=val.slice(selStart,selEnd);
      const conv=convertCase(part,mode);
      convertedLen=conv.length;
      hasSel=true;
      nextVal=val.slice(0,selStart)+conv+val.slice(selEnd);
    } else {
      nextVal=convertCase(val,mode);
    }
    setEditorText(nextVal);
    if(hasSel){
      try{el.focus();el.setSelectionRange(selStart,selStart+convertedLen);}catch(e){}
    }
    run();
    const labels={sentence:'Tümce düzenine',lower:'küçük harfe',upper:'BÜYÜK HARFE',title:'Başlık Düzenine'};
    showToast(`🔤 Metin ${labels[mode]||'yeni düzene'} dönüştürüldü.`);
  });
}

const toolsBtn=document.getElementById('toolsBtn');
const toolsMenu=document.getElementById('toolsMenu');
function toggleToolsMenu(open){
  if(!toolsMenu) return;
  const show=typeof open==='boolean'?open:toolsMenu.style.display==='none';
  toolsMenu.style.display=show?'block':'none';
  if(toolsBtn) toolsBtn.setAttribute('aria-expanded',show?'true':'false');
}
if(toolsBtn){
  toolsBtn.addEventListener('click',e=>{
    e.stopPropagation();
    if(typeof toggleCaseMenu==='function') toggleCaseMenu(false);
    toggleToolsMenu();
  });
}
const fileBtnMenu=document.getElementById('fileBtnMenu');
if(fileBtnMenu){
  fileBtnMenu.addEventListener('click',()=>{
    toggleToolsMenu(false);
    fileInp.click();
  });
}

document.addEventListener('click',e=>{
  if(fxMenu&&fxMenu.style.display!=='none'&&!e.target.closest('.btn-group')){
    toggleFxMenu(false);
  }
  if(caseMenu&&caseMenu.style.display!=='none'&&!e.target.closest('#caseBtn')&&!e.target.closest('#caseMenu')){
    toggleCaseMenu(false);
  }
  if(toolsMenu&&toolsMenu.style.display!=='none'&&!e.target.closest('#toolsBtn')&&!e.target.closest('#toolsMenu')){
    toggleToolsMenu(false);
  }
});

document.getElementById('fxAll').addEventListener('click',()=>{
  const types=activeFilter?[activeFilter]:['spell','gram','punct','suggest'];
  fixByType(types);
});

const inp=document.getElementById('inp');
function autoResize(){
  this.style.height='auto';
  if(this.value.trim()){
    const target=Math.min(Math.max(170,this.scrollHeight+4),480);
    this.style.height=target+'px';
    this.style.overflowY=this.scrollHeight>480?'auto':'hidden';
  } else {
    this.style.height='170px';
    this.style.overflowY='hidden';
  }
}
inp.addEventListener('input',autoResize,false);

let autoTimer=null;
inp.addEventListener('input',()=>{
  const val=inp.value;
  try{
    if(val.trim()) localStorage.setItem('ty_draft',val);
    else localStorage.removeItem('ty_draft');
  }catch(e){}
  if(undoStack.length===0){
    initialInputText=inp.value;
  }
  const emptyHints=document.getElementById('emptyHints');
  if(emptyHints) emptyHints.style.display=inp.value.trim()?'none':'flex';
  if(inp.value.trim()) setLiveStatus('typing','Denetleniyor...');
  else setLiveStatus('','Hazır');
  clearTimeout(autoTimer);
  autoTimer=setTimeout(run,700);
});

function handleLoadedFile(file){
  if(!file) return;
  if(file.size > 5 * 1024 * 1024){
    showToast('⚠️ Dosya çok büyük! Lütfen 5 MB altı bir metin dosyası seçin.');
    return;
  }
  const reader=new FileReader();
  reader.onload=evt=>{
    let content=String(evt.target.result||'');
    if(content.charCodeAt(0)===0xFEFF) content=content.slice(1);
    snapshotUndo();
    setEditorText(content);
    initialInputText=content;
    const dn=document.getElementById('draftNotice');
    if(dn) dn.style.display='none';
    const db=document.getElementById('diffBanner');
    if(db) db.style.display='none';
    run();
    showToast(`📂 "${file.name}" yüklendi.`);
  };
  reader.onerror=()=>{
    showToast('❌ Dosya okunurken bir hata oluştu.');
  };
  reader.readAsText(file,'UTF-8');
}

const fileBtn=document.getElementById('fileBtn');
const fileInp=document.getElementById('fileInp');
fileBtn.addEventListener('click',()=>fileInp.click());
fileInp.addEventListener('change',e=>{
  handleLoadedFile(e.target.files[0]);
  fileInp.value='';
});

const dropZone=document.getElementById('dropZone');
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop',e=>{
  e.preventDefault();dropZone.classList.remove('dragover');
  handleLoadedFile(e.dataTransfer.files[0]);
});

function downloadFile(content,filename,mimeType){
  const blob=new Blob([content],{type:mimeType});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename;
  a.style.display='none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

const exportModal=document.getElementById('exportModal');
const exportClose=document.getElementById('exportClose');
const exportDoneBtn=document.getElementById('exportDoneBtn');

function openExportModal(){
  if(typeof toggleToolsMenu==='function') toggleToolsMenu(false);
  const val=document.getElementById('inp').value;
  if(!val.trim()){
    showToast('Dışa aktarılacak metin bulunamadı.');
    return;
  }
  if(exportModal){
    exportModal.style.display='flex';
    const firstBtn=document.getElementById('expTxt');
    if(firstBtn) firstBtn.focus();
  }
}
function closeExportModal(){
  if(exportModal) exportModal.style.display='none';
  if(toolsBtn) toolsBtn.focus();
}

document.getElementById('downBtn').addEventListener('click',openExportModal);
if(exportClose) exportClose.addEventListener('click',closeExportModal);
if(exportDoneBtn) exportDoneBtn.addEventListener('click',closeExportModal);
if(exportModal) exportModal.addEventListener('click',e=>{if(e.target===exportModal)closeExportModal();});

document.getElementById('expTxt').addEventListener('click',()=>{
  const val=document.getElementById('inp').value;
  if(!val.trim()) return;
  downloadFile(val,'turkce-yazim-duzeltilmis.txt','text/plain;charset=utf-8');
  closeExportModal();
  showToast('📄 Düz metin (.txt) olarak indirildi.');
});

document.getElementById('expMd').addEventListener('click',()=>{
  const val=document.getElementById('inp').value;
  if(!val.trim()) return;
  const md=`# Düzeltilmiş Metin\n\n${val}\n`;
  downloadFile(md,'turkce-yazim.md','text/markdown;charset=utf-8');
  closeExportModal();
  showToast('📝 Markdown (.md) belgesi indirildi.');
});

document.getElementById('expHtml').addEventListener('click',()=>{
  const val=document.getElementById('inp').value;
  if(!val.trim()) return;
  const paras=val.split(/\n\s*\n/).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('\n  ');
  const htmlDoc=`<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Türkçe Yazım Denetimi - Düzeltilmiş Metin</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; line-height: 1.75; color: #1e293b; background: #ffffff; }
    h1 { font-size: 1.35rem; color: #b5202a; border-bottom: 2px solid #fee2e2; padding-bottom: .5rem; margin-bottom: 1.5rem; }
    p { margin-bottom: 1.2em; font-size: 1.05rem; }
    footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b; }
  </style>
</head>
<body>
  <h1>Türkçe Yazım Denetimi — Metin Çıktısı</h1>
  ${paras}
  <footer>Oluşturulma: ${new Date().toLocaleString('tr-TR')} • TürkçeYazım</footer>
</body>
</html>`;
  downloadFile(htmlDoc,'turkce-yazim.html','text/html;charset=utf-8');
  closeExportModal();
  showToast('🌐 Web sayfası (.html) olarak indirildi.');
});

document.getElementById('expRichCopy').addEventListener('click',()=>{
  const val=document.getElementById('inp').value;
  if(!val.trim()) return;
  const paras=val.split(/\n\s*\n/).map(p=>`<p style="margin-bottom:1em;line-height:1.6">${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
  const richHtml=`<div style="font-family:Arial,sans-serif;font-size:11pt;line-height:1.6;color:#1e293b">${paras}</div>`;
  if(navigator.clipboard&&navigator.clipboard.write&&window.ClipboardItem){
    const item=new ClipboardItem({
      'text/html':new Blob([richHtml],{type:'text/html'}),
      'text/plain':new Blob([val],{type:'text/plain'})
    });
    navigator.clipboard.write([item]).then(()=>{
      closeExportModal();
      showToast('📋 Zengin metin panoya kopyalandı (Word & Docs uyumlu).');
    }).catch(()=>{
      copyEditorText();
      closeExportModal();
    });
  } else {
    copyEditorText();
    closeExportModal();
  }
});

document.getElementById('expReport').addEventListener('click',()=>{
  const val=document.getElementById('inp').value;
  if(!val.trim()) return;
  const rStats=computeReadability(val);
  const now=new Date().toLocaleString('tr-TR');
  const issues=analyze(val).filter(i=>!ignored.has(i.type+'|'+tl(i.word))&&!isDictIgnored(i.word));
  let rep=`============================================================\n`;
  rep+=`TÜRKÇE YAZIM DENETİM & OKUNABİLİRLİK RAPORU\n`;
  rep+=`Tarih: ${now}\n`;
  rep+=`============================================================\n\n`;
  rep+=`[METİN METRİKLERİ]\n`;
  rep+=`- Karakter Sayısı: ${val.length.toLocaleString('tr-TR')} (Boşluksuz: ${val.replace(/\s/g,'').length.toLocaleString('tr-TR')})\n`;
  if(rStats){
    rep+=`- Kelime Sayısı: ${rStats.totalWords.toLocaleString('tr-TR')} (Kelime Çeşitliliği: %${rStats.diversityRatio}, ${rStats.uniqueWords} tekil kelime)\n`;
    rep+=`- Cümle Sayısı: ${rStats.totalSentences} (Ortalama cümle uzunluğu: ${rStats.avgSentenceLength} kelime)\n`;
    rep+=`- Paragraf Sayısı: ${rStats.totalParagraphs}\n`;
    rep+=`- Heceler: ${rStats.totalSyllables} (Ortalama kelime uzunluğu: ${rStats.avgWordLengthSyllables} hece)\n`;
    rep+=`- Ateşman Okunabilirlik Skoru: ${rStats.score} / 100 (${rStats.label})\n`;
    rep+=`- Tahmini Okuma Süresi: ~${rStats.readTimeStr}\n`;
    rep+=`- Tahmini Konuşma / Sunum Süresi: ~${rStats.speechTimeStr}\n`;
    rep+=`- Tahmini Kitap/Rapor Sayfası: ~${rStats.estPagesStr}\n`;
  }
  rep+=`\n[DENETİM DURUMU]\n`;
  rep+=`- Kalan Hata/Uyarı: ${issues.length}\n`;
  if(issues.length>0){
    issues.forEach((iss,idx)=>{
      rep+=`  ${idx+1}. [${LBL[iss.type]||iss.type}] "${iss.word}": ${iss.msg}${iss.suggestions[0]?' -> '+iss.suggestions[0]:''}\n`;
    });
  } else {
    rep+=`  ✓ Metinde tespit edilebilen herhangi bir hata veya eksiklik yok.\n`;
  }
  rep+=`\n------------------------------------------------------------\n`;
  rep+=`DÜZELTİLMİŞ METİN:\n`;
  rep+=`------------------------------------------------------------\n`;
  rep+=val;
  rep+=`\n\n============================================================\n`;

  downloadFile(rep,'turkce-yazim-raporu.txt','text/plain;charset=utf-8');
  closeExportModal();
  showToast('📊 Denetim raporu (.txt) indirildi.');
});

function printCleanDocument(){
  if(typeof toggleToolsMenu==='function') toggleToolsMenu(false);
  const em=document.getElementById('exportModal');
  if(em) em.style.display='none';
  const val=document.getElementById('inp').value;
  if(!val.trim()){
    showToast('Yazdırılacak metin bulunamadı.');
    return;
  }
  let pDoc=document.getElementById('printDoc');
  if(!pDoc){
    pDoc=document.createElement('div');
    pDoc.id='printDoc';
    const wrap=document.querySelector('.wrap');
    if(wrap) wrap.appendChild(pDoc);
  }
  if(pDoc) pDoc.textContent=val;
  window.print();
}
if(typeof window!=='undefined'&&window.addEventListener){
  window.addEventListener('beforeprint',()=>{
    let pDoc=document.getElementById('printDoc');
    if(!pDoc){
      pDoc=document.createElement('div');
      pDoc.id='printDoc';
      const wrap=document.querySelector('.wrap');
      if(wrap) wrap.appendChild(pDoc);
    }
    const el=document.getElementById('inp');
    if(pDoc&&el) pDoc.textContent=el.value;
  });
}
const printBtn=document.getElementById('printBtn');
if(printBtn) printBtn.addEventListener('click',printCleanDocument);
const expPrint=document.getElementById('expPrint');
if(expPrint) expPrint.addEventListener('click',printCleanDocument);

// === YAZIM HEDEFİ (KOTA İZLEYİCİ) ===
let targetConfig=null;
try{
  const rawTarget=localStorage.getItem('ty_target');
  if(rawTarget){
    const parsed=JSON.parse(rawTarget);
    if(parsed&&typeof parsed.count==='number'&&parsed.count>0&&!isNaN(parsed.count)){
      targetConfig=parsed;
    }
  }
}catch(e){targetConfig=null;}

function updateTargetDisplay(wCount,cCount){
  const btn=document.getElementById('targetBtn');
  if(!btn) return;
  if(!targetConfig||typeof targetConfig.count!=='number'||targetConfig.count<=0||isNaN(targetConfig.count)){
    btn.textContent='🎯 Hedef Belirle';
    btn.className='target-badge';
    btn.title='Kelime veya karakter hedefi belirle';
    return;
  }
  const isWord=targetConfig.type==='word';
  let current=0;
  if(typeof wCount==='number'&&typeof cCount==='number'){
    current=isWord?wCount:cCount;
  } else {
    const text=document.getElementById('inp').value;
    const words=text.trim()?(text.trim().match(/[\wığüşöçİĞÜŞÖÇ]+(?:['\u2019][\wığüşöçİĞÜŞÖÇ]+)*/g)||[]).length:0;
    current=isWord?words:text.length;
  }
  const goal=targetConfig.count;
  const pct=goal>0?Math.round((current/goal)*100):0;
  const unitLabel=isWord?'kelime':'karakter';

  btn.textContent=`🎯 ${current.toLocaleString('tr-TR')} / ${goal.toLocaleString('tr-TR')} ${unitLabel} (%${pct})`;
  btn.title=`Hedef: ${goal} ${unitLabel}. Değiştirmek veya kaldırmak için tıklayın.`;
  btn.classList.remove('active','achieved','exceeded');
  if(pct>100){
    btn.classList.add('exceeded');
  } else if(pct===100){
    btn.classList.add('achieved');
  } else {
    btn.classList.add('active');
  }
}

const targetBtn=document.getElementById('targetBtn');
const targetModal=document.getElementById('targetModal');
const targetClose=document.getElementById('targetClose');
const targetCancelBtn=document.getElementById('targetCancelBtn');
const targetSaveBtn=document.getElementById('targetSaveBtn');
const targetClearBtn=document.getElementById('targetClearBtn');
const targetCountInp=document.getElementById('targetCountInp');
const targetTypeSel=document.getElementById('targetTypeSel');

function openTargetModal(){
  if(targetConfig&&targetConfig.count){
    targetCountInp.value=targetConfig.count;
    targetTypeSel.value=targetConfig.type||'word';
    targetClearBtn.style.display='inline-block';
  } else {
    targetCountInp.value='';
    targetTypeSel.value='word';
    targetClearBtn.style.display='none';
  }
  targetModal.style.display='flex';
  targetCountInp.focus();
}
function closeTargetModal(){
  targetModal.style.display='none';
  if(targetBtn) targetBtn.focus();
}

if(targetBtn) targetBtn.addEventListener('click',openTargetModal);
if(targetClose) targetClose.addEventListener('click',closeTargetModal);
if(targetCancelBtn) targetCancelBtn.addEventListener('click',closeTargetModal);
if(targetModal) targetModal.addEventListener('click',e=>{if(e.target===targetModal)closeTargetModal();});

if(targetSaveBtn){
  targetSaveBtn.addEventListener('click',()=>{
    const count=parseInt(targetCountInp.value,10);
    if(!count||count<=0||count>1000000){
      showToast('Lütfen 1 ile 1.000.000 arasında bir hedef sayı girin.');
      targetCountInp.focus();
      return;
    }
    targetConfig={count,type:targetTypeSel.value||'word'};
    try{localStorage.setItem('ty_target',JSON.stringify(targetConfig));}catch(e){}
    updateTargetDisplay();
    closeTargetModal();
    showToast(`🎯 Hedef belirlendi: ${count} ${targetConfig.type==='word'?'kelime':'karakter'}`);
  });
}
if(targetCountInp){
  targetCountInp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      if(targetSaveBtn) targetSaveBtn.click();
    }
  });
}
if(targetClearBtn){
  targetClearBtn.addEventListener('click',()=>{
    targetConfig=null;
    try{localStorage.removeItem('ty_target');}catch(e){}
    updateTargetDisplay();
    closeTargetModal();
    showToast('Hedef kaldırıldı.');
  });
}

document.getElementById('pc').addEventListener('click',closePop);
document.addEventListener('click',e=>{
  const pop=document.getElementById('pop');
  if(pop.style.display==='none') return;
  if(!pop.contains(e.target)&&!e.target.closest('.h-sp,.h-gr,.h-wn,.h-pu,.h-su,.ii'))closePop();
});

document.getElementById('smpBtn').addEventListener('click',()=>{
  const val="ali'nin topu kaçtığı icin markete gitti.\n"+
    "birşey söylemek istiyorum ama bilmiyorum ,gerçekten.\n"+
    "masada ki kitabı hemde dün okudum, çünkü ki sınav vardı.\n"+
    "Türkiyede herkes bu konuyu biliyo.bu çok önemli bir konu!\n"+
    "ünvanı değişen kayyum, yeşilzeytin ve dogalgaz faturalarını inceledi.\n"+
    "orjinal evrakları laboratuar ortamında teslim ettiler.\n"+
    "bende para yok ama ben de bu konuya ve ve diğer detaylara katılıyorum.";
  snapshotUndo();
  setEditorText(val);
  initialInputText=val;
  const db=document.getElementById('diffBanner');
  if(db) db.style.display='none';
  document.getElementById('draftNotice').style.display='none';
  run();
});

document.getElementById('undoBtn').addEventListener('click',undo);
const redoBtn=document.getElementById('redoBtn');
if(redoBtn) redoBtn.addEventListener('click',redo);

const themeBtn=document.getElementById('themeBtn');
function applyTheme(isDark){
  const metaTheme=document.querySelector('meta[name="theme-color"]');
  if(isDark){
    document.body.classList.add('dark');
    themeBtn.textContent='☀️';
    themeBtn.title='Aydınlık Mod';
    if(metaTheme) metaTheme.setAttribute('content','#10121A');
  } else {
    document.body.classList.remove('dark');
    themeBtn.textContent='🌙';
    themeBtn.title='Karanlık Mod';
    if(metaTheme) metaTheme.setAttribute('content','#B5202A');
  }
}
let savedTheme=null;
try{savedTheme=localStorage.getItem('ty_theme');}catch(e){}
if(savedTheme){
  applyTheme(savedTheme==='dark');
} else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches){
  applyTheme(true);
}
themeBtn.addEventListener('click',()=>{
  const isDark=document.body.classList.toggle('dark');
  applyTheme(isDark);
  try{localStorage.setItem('ty_theme',isDark?'dark':'light');}catch(e){}
});

const kbdBtn=document.getElementById('kbdBtn');
const kbdModal=document.getElementById('kbdModal');
const kbdClose=document.getElementById('kbdClose');
kbdBtn.addEventListener('click',()=>{
  kbdModal.style.display='flex';
  if(kbdClose) kbdClose.focus();
});
kbdClose.addEventListener('click',()=>{kbdModal.style.display='none';if(kbdBtn)kbdBtn.focus();});
kbdModal.addEventListener('click',e=>{if(e.target===kbdModal)kbdModal.style.display='none';});

document.querySelectorAll('.info-tip').forEach(tip=>{
  tip.addEventListener('click',e=>{
    e.stopPropagation();
    tip.classList.toggle('open');
  });
  tip.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      e.preventDefault();
      tip.classList.toggle('open');
    } else if(e.key==='Escape'){
      tip.classList.remove('open');
    }
  });
});
document.addEventListener('click',e=>{
  if(!e.target.closest('.info-tip')){
    document.querySelectorAll('.info-tip.open').forEach(t=>t.classList.remove('open'));
  }
});

// === KİŞİSEL SÖZLÜK MODAL & ETKİLEŞİM ===
function renderDictList(){
  const listEl=document.getElementById('dictList');
  const countEl=document.getElementById('dictCount');
  if(!listEl) return;
  const items=Array.from(customDict).sort();
  if(countEl) countEl.textContent=items.length?`(${items.length} kelime)`:'';
  if(!items.length){
    listEl.innerHTML='<div style="font-size:.82rem;color:var(--slate);padding:.8rem 0;width:100%;text-align:center">Kişisel sözlüğünüzde henüz kayıtlı kelime yok.</div>';
    return;
  }
  listEl.innerHTML=items.map(w=>`
    <span class="dict-chip">${esc(w)} <button type="button" class="dict-del" data-word="${esc(w)}" aria-label="${esc(w)} kelimesini sil">×</button></span>
  `).join('');
}

const listEl=document.getElementById('dictList');
if(listEl){
  listEl.addEventListener('click',e=>{
    const btn=e.target.closest('.dict-del');
    if(btn&&btn.dataset.word){
      TY.removeFromDict(btn.dataset.word);
    }
  });
}

const dictBtn=document.getElementById('dictBtn');
const dictModal=document.getElementById('dictModal');
const dictClose=document.getElementById('dictClose');
const dictDoneBtn=document.getElementById('dictDoneBtn');
const dictInp=document.getElementById('dictInp');
const dictAddBtn=document.getElementById('dictAddBtn');
const dictClearAll=document.getElementById('dictClearAll');

function openDictModal(){
  renderDictList();
  dictModal.style.display='flex';
  if(dictInp) dictInp.focus();
}
function closeDictModal(){
  dictModal.style.display='none';
  if(dictBtn) dictBtn.focus();
}
if(dictBtn) dictBtn.addEventListener('click',openDictModal);
if(dictClose) dictClose.addEventListener('click',closeDictModal);
if(dictDoneBtn) dictDoneBtn.addEventListener('click',closeDictModal);
if(dictModal) dictModal.addEventListener('click',e=>{if(e.target===dictModal)closeDictModal();});

function addDictFromInput(){
  const val=dictInp.value.trim();
  if(!val) return;
  const parts=val.split(/[,;\n\t]+/).map(p=>tl(p.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,''))).filter(p=>p.length>0);
  if(!parts.length) return;
  parts.forEach(p=>customDict.add(p));
  saveCustomDict(Array.from(customDict));
  dictInp.value='';
  renderDictList();
  run();
  showToast(parts.length===1?`"${parts[0]}" sözlüğe eklendi.`:`${parts.length} kelime sözlüğe eklendi.`);
}
if(dictAddBtn) dictAddBtn.addEventListener('click',addDictFromInput);
if(dictInp) dictInp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addDictFromInput();}});

if(dictClearAll) dictClearAll.addEventListener('click',()=>{
  if(!customDict.size) return;
  if(confirm('Kişisel sözlükteki tüm kelimeleri silmek istediğinize emin misiniz?')){
    customDict.clear();
    saveCustomDict([]);
    renderDictList();
    run();
    showToast('Kişisel sözlük temizlendi.');
  }
});

const dictExportTxtBtn=document.getElementById('dictExportTxtBtn');
const dictExportBtn=document.getElementById('dictExportBtn');
const dictImportBtn=document.getElementById('dictImportBtn');
const dictFileInp=document.getElementById('dictFileInp');

if(dictExportTxtBtn){
  dictExportTxtBtn.addEventListener('click',()=>{
    if(!customDict.size){
      showToast('Dışa aktarılacak kayıtlı kelime yok.');
      return;
    }
    const txt=Array.from(customDict).sort().join('\r\n');
    downloadFile(txt,'turkce-yazim-sozluk.txt','text/plain;charset=utf-8');
    showToast('📤 Kişisel sözlük (.txt) indirildi.');
  });
}

if(dictExportBtn){
  dictExportBtn.addEventListener('click',()=>{
    if(!customDict.size){
      showToast('Dışa aktarılacak kayıtlı kelime yok.');
      return;
    }
    const json=JSON.stringify(Array.from(customDict).sort(),null,2);
    downloadFile(json,'turkce-yazim-sozluk.json','application/json;charset=utf-8');
    showToast('📤 Kişisel sözlük (.json) indirildi.');
  });
}

if(dictImportBtn&&dictFileInp){
  dictImportBtn.addEventListener('click',()=>dictFileInp.click());
  dictFileInp.addEventListener('change',e=>{
    const f=e.target.files[0];
    if(!f) return;
    if(f.size>2*1024*1024){
      showToast('⚠️ Sözlük dosyası 2 MB\'den küçük olmalıdır.');
      dictFileInp.value='';
      return;
    }
    const reader=new FileReader();
    reader.onload=evt=>{
      try{
        let raw=String(evt.target.result||'').trim();
        if(raw.charCodeAt(0)===0xFEFF) raw=raw.slice(1);
        let words=[];
        if(raw.startsWith('[')||raw.startsWith('{')){
          try{
            const parsed=JSON.parse(raw);
            if(Array.isArray(parsed)) words=parsed.map(String);
            else if(typeof parsed==='object') words=Object.keys(parsed);
          }catch(je){
            words=raw.split(/[\r\n;,]+/);
          }
        } else {
          words=raw.split(/[\r\n;,]+/);
        }
        const initialSize=customDict.size;
        const cleaned=words.map(p=>tl(p.trim().replace(/^['"\(\[\{]+|['"\)\]\}.,;:!?]+$/g,''))).filter(p=>p.length>0);
        if(!cleaned.length){
          showToast('İçe aktarılacak geçerli kelime bulunamadı.');
          return;
        }
        cleaned.forEach(w=>customDict.add(w));
        const addedCount=customDict.size-initialSize;
        saveCustomDict(Array.from(customDict));
        renderDictList();
        run();
        showToast(addedCount>0?`📥 ${cleaned.length} kelime işlendi (${addedCount} yeni kelime eklendi).`:`📥 ${cleaned.length} kelime işlendi (hepsi zaten sözlükte vardı).`);
      }catch(err){
        showToast('❌ Sözlük dosyası okunamadı.');
      }finally{
        dictFileInp.value='';
      }
    };
    reader.onerror=()=>{
      dictFileInp.value='';
      showToast('❌ Dosya okunamadı.');
    };
    reader.readAsText(f,'UTF-8');
  });
}

// === SIK TEKRARLANAN KELİME VURGULAMA ===
const repWordsBarEl=document.getElementById('repWordsBar');
if(repWordsBarEl){
  const handleRepToggle=chip=>{
    if(!chip) return;
    const w=chip.getAttribute('data-rep-word');
    if(!w) return;
    activeRepWord=(activeRepWord===w)?null:w;
    repWordsBarEl.querySelectorAll('.rep-chip').forEach(c=>{
      c.classList.toggle('active',c.getAttribute('data-rep-word')===activeRepWord);
    });
    if(viewMode==='diff') viewMode='text';
    renderCurrent();
    if(activeRepWord){
      const firstMark=document.querySelector('#otxt .h-rep');
      if(firstMark) firstMark.scrollIntoView({behavior:'smooth',block:'center'});
      showToast(`🔁 "${activeRepWord}" kelimesi metin içinde vurgulandı.`);
    }
  };
  repWordsBarEl.addEventListener('click',e=>{
    const chip=e.target.closest('.rep-chip');
    if(chip) handleRepToggle(chip);
  });
  repWordsBarEl.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      const chip=e.target.closest('.rep-chip');
      if(chip){e.preventDefault();handleRepToggle(chip);}
    }
  });
}

// === BUL VE DEĞİŞTİR ÇUBUĞU ===
const findToggleBtn=document.getElementById('findToggleBtn');
const findBar=document.getElementById('findBar');
const findInp=document.getElementById('findInp');
const replaceInp=document.getElementById('replaceInp');
const findCount=document.getElementById('findCount');
const replaceOneBtn=document.getElementById('replaceOneBtn');
const replaceAllBtn=document.getElementById('replaceAllBtn');
const findCloseBtn=document.getElementById('findCloseBtn');

let currentFindIdx=-1;
function updateFindCount(){
  if(!findCount||!findInp) return;
  const f=findInp.value;
  if(!f){
    findCount.textContent='0 eşleşme';
    currentFindIdx=-1;
    return;
  }
  const res=findAndReplace(document.getElementById('inp').value,f,'',false);
  findCount.textContent=`${res.count} eşleşme`;
  currentFindIdx=-1;
}
function toggleFindBar(open){
  if(!findBar) return;
  const show=typeof open==='boolean'?open:findBar.style.display!=='flex';
  if(show&&typeof toggleToolsMenu==='function') toggleToolsMenu(false);
  if(show&&viewMode==='diff'){viewMode='text';renderCurrent();}
  findBar.style.display=show?'flex':'none';findBar.classList.toggle('open',show);
  if(findToggleBtn){
    findToggleBtn.setAttribute('aria-expanded',String(show));
    findToggleBtn.classList.toggle('active',show);
  }
  if(show&&findInp){
    const selStart=inp.selectionStart,selEnd=inp.selectionEnd;
    if(typeof selStart==='number'&&typeof selEnd==='number'&&selStart!==selEnd){
      const sel=inp.value.slice(selStart,selEnd).trim();
      if(sel&&!sel.includes('\n')) findInp.value=sel;
    }
    updateFindCount();
    findInp.focus();
    findInp.select();
  }
  if(viewMode==='text') renderCurrent();
}
if(findToggleBtn) findToggleBtn.addEventListener('click',()=>toggleFindBar());
if(findCloseBtn) findCloseBtn.addEventListener('click',()=>toggleFindBar(false));
if(findInp){
  findInp.addEventListener('input',()=>{
    updateFindCount();
    if(viewMode==='text') renderCurrent();
  });
  findInp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      const marks=document.querySelectorAll('#otxt .h-find');
      if(marks.length>0){
        if(e.shiftKey){
          currentFindIdx=currentFindIdx<=0?marks.length-1:currentFindIdx-1;
        } else {
          currentFindIdx=(currentFindIdx+1)%marks.length;
        }
        marks.forEach((m,idx)=>m.classList.toggle('active-find',idx===currentFindIdx));
        marks[currentFindIdx].scrollIntoView({behavior:'smooth',block:'center'});
        if(findCount) findCount.textContent=`${currentFindIdx+1} / ${marks.length} eşleşme`;
      } else if(replaceInp){
        replaceInp.focus();
      }
    }
  });
}
function execReplace(all){
  if(!findInp) return;
  const f=findInp.value;
  if(!f){
    showToast('Lütfen aranacak kelime veya ifadeyi girin.');
    findInp.focus();
    return;
  }
  const r=replaceInp?replaceInp.value:'';
  const current=document.getElementById('inp').value;
  const tgtIdx=currentFindIdx>=0?currentFindIdx:0;
  const res=findAndReplace(current,f,r,all,tgtIdx);
  if(res.replaced===0){
    showToast(`"${f}" metinde bulunamadı.`);
    return;
  }
  snapshotUndo();
  setEditorText(res.text);
  run();
  updateFindCount();
  showToast(`🔍 ${res.replaced} eşleşme değiştirildi.`);
}
if(replaceOneBtn) replaceOneBtn.addEventListener('click',()=>execReplace(false));
if(replaceAllBtn) replaceAllBtn.addEventListener('click',()=>execReplace(true));
if(replaceInp){
  replaceInp.addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      e.preventDefault();
      execReplace(true);
    }
  });
}

// === METİN TEMİZLEYİCİ BUTONU ===
const cleanBtn=document.getElementById('cleanBtn');
if(cleanBtn){
  cleanBtn.addEventListener('click',()=>{
    if(typeof toggleToolsMenu==='function') toggleToolsMenu(false);
    const val=document.getElementById('inp').value;
    if(!val.trim()){
      showToast('Temizlenecek metin bulunamadı.');
      return;
    }
    snapshotUndo();
    const cleaned=cleanText(val);
    if(cleaned===val){
      showToast('Metin zaten temiz ve düzgün.');
      return;
    }
    setEditorText(cleaned);
    run();
    showToast('🧹 Bozuk satırlar birleştirildi ve gereksiz boşluklar temizlendi.');
  });
}

// === DEĞİŞİKLİK BİLDİRİMİ / DIFF TOGGLE ===
const diffToggleBtn=document.getElementById('diffToggleBtn');
if(diffToggleBtn){
  diffToggleBtn.addEventListener('click',()=>{
    const det=document.getElementById('diffDetails');
    if(det.style.display==='none'){
      det.style.display='flex';
      diffToggleBtn.textContent='Ayrıntıları Gizle ↑';
    } else {
      det.style.display='none';
      diffToggleBtn.textContent='Ayrıntıları Göster ↓';
    }
  });
}
const diffUndoBtn=document.getElementById('diffUndoBtn');
if(diffUndoBtn){
  diffUndoBtn.addEventListener('click',undo);
}
const diffDismiss=document.getElementById('diffDismiss');
if(diffDismiss){
  diffDismiss.addEventListener('click',()=>{
    document.getElementById('diffBanner').style.display='none';
  });
}

try{
  const saved=localStorage.getItem('ty_draft');
  if(saved&&saved.trim()){
    inp.value=saved;
    initialInputText=saved;
    document.getElementById('cc').textContent=countLabel(saved);
    autoResize.call(inp);
    run();
    document.getElementById('draftNotice').style.display='flex';
  }
}catch(e){}
document.getElementById('draftDismiss').addEventListener('click',()=>{
  document.getElementById('draftNotice').style.display='none';
});
inp.addEventListener('input',()=>{document.getElementById('draftNotice').style.display='none';},{once:true});
try{if(typeof updateTargetDisplay==='function') updateTargetDisplay();}catch(e){}
try{document.getElementById('inp').focus();}catch(e){}
try{
  if(typeof window!=='undefined'&&'serviceWorker' in navigator&&location.protocol.startsWith('http')){
    window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js').catch(()=>{});});
  }
}catch(e){}

if(typeof module!=='undefined'&&module.exports){
  module.exports={...TYEngine,analyze,computeReadability,cleanText,findAndReplace,esc,computeWordDiff,convertCase,normalizeNumberSuffix,SPELL,DEDA,KI,WARNS,personAgrees,countLabel,downloadFile};
}
})();
