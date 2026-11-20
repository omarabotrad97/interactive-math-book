/* Mobile Bottom Tab Bar & Desktop Side Navigation Rail */
(function(){
 const tabs=[...document.querySelectorAll('#bottom-tabs .bt')],sheet=$('more-sheet');
 function getActiveTabKey(){
  if($('finish-dialog')?.open)return 'report';
  if($('ai-tutor-sheet')?.open)return 'ai';
  if(sheet?.open||$('prefs-dialog')?.open||$('reset-dialog')?.open)return 'more';
  if(state.infiniteMode)return 'challenge';
  if(state.viewMode==='map')return 'map';
  return '';
 }
 function syncTabs(){
  const activeKey=getActiveTabKey();
  tabs.forEach(b=>{
   const on=b.dataset.tab===activeKey;
   b.classList.toggle('on',on);
   if(on)b.setAttribute('aria-current','page');
   else b.removeAttribute('aria-current');
  });
  const infUnlocked=state.completed.size===12||isNodeCompleted(19);
  const ico=$('bt-challenge-ico');if(ico)ico.innerHTML=getIconSVG(infUnlocked?'trophy':'lock');
 }
 function soundLabel(){$('more-sound-state').textContent=state.muted?'متوقف (اضغط للتشغيل)':'مفعّل';$('more-sound').firstElementChild.innerHTML=getIconSVG(state.muted?'mute':'sound');}
 tabs.forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.tab;
  if(k==='map'){
   if(state.viewMode!=='map')showDuolingoMap(true);
   else if(state.mapSubView==='units'||state.mapSubView==='sections')window.scrollTo?.({top:0,behavior:reduced.matches?'instant':'smooth'});
   else scrollToCurrentStation(true);
  }else if(k==='challenge')$('infinite-toggle').click();
  else if(k==='report'){$('report-open').click();syncTabs();}
  else if(k==='ai'){openAiTutor();syncTabs();}
  else if(k==='more'){try{pauseRapid();stopStory();}catch{}soundLabel();if(typeof window.syncTestModeUI==='function')window.syncTestModeUI();sheet.showModal();syncTabs();}
 }));
 $('more-sound').addEventListener('click',()=>{$('sound-toggle').click();soundLabel();});
 $('more-prefs').addEventListener('click',()=>{sheet.close();$('prefs-open').click();syncTabs();});
 $('more-reset').addEventListener('click',()=>{sheet.close();$('reset-open').click();syncTabs();});
 $('more-close').addEventListener('click',()=>sheet.close());
 sheet.addEventListener('click',e=>{if(e.target===sheet)sheet.close();});
 ['more-sheet','finish-dialog','ai-tutor-sheet','prefs-dialog','reset-dialog'].forEach(id=>{
  $(id)?.addEventListener('close',syncTabs);
 });
 const _u=updateViewDom;
 updateViewDom=function(){_u();try{syncTabs();}catch{}};
 syncTabs();
})();

