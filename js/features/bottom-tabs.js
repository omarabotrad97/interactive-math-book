/* Mobile Bottom Tab Bar & More Sheet */
/* ===== شريط التبويب السفلي (هاتف) ===== */
(function(){
 const tabs=[...document.querySelectorAll('#bottom-tabs .bt')],sheet=$('more-sheet');
 function syncTabs(){
  const onMap=state.viewMode==='map';
  tabs.forEach(b=>{const on=b.dataset.tab==='map'&&onMap;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  const infUnlocked=state.completed.size===12||isNodeCompleted(19);
  const ico=$('bt-challenge-ico');if(ico)ico.innerHTML=getIconSVG(infUnlocked?'trophy':'lock');
 }
 function soundLabel(){$('more-sound-state').textContent=state.muted?'متوقف (اضغط للتشغيل)':'مفعّل';$('more-sound').firstElementChild.innerHTML=getIconSVG(state.muted?'mute':'sound');}
 tabs.forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.tab;
  if(k==='map'){
   if(state.viewMode!=='map')showDuolingoMap(true);
   else scrollToCurrentStation(true);
  }else if(k==='challenge')$('infinite-toggle').click();
  else if(k==='report')$('report-open').click();
   else if(k==='ai'){openAiTutor();}
  else if(k==='more'){try{pauseRapid();stopStory();}catch{}soundLabel();sheet.showModal();}
 }));
 $('more-sound').addEventListener('click',()=>{$('sound-toggle').click();soundLabel();});
 $('more-prefs').addEventListener('click',()=>{sheet.close();$('prefs-open').click();});
 $('more-reset').addEventListener('click',()=>{sheet.close();$('reset-open').click();});
 $('more-close').addEventListener('click',()=>sheet.close());
 sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();});
 const _u=updateViewDom;
 updateViewDom=function(){_u();try{syncTabs();}catch{}};
 syncTabs();
})();
