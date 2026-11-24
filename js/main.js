/* Application Bootstrap & Global Event Wiring */
document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>switchScene(Number(b.dataset.scene))));
$('story-prev').addEventListener('click',()=>{stopStory();nextStory(-1);});$('story-next').addEventListener('click',()=>{stopStory();nextStory(1);});$('story-play').addEventListener('click',toggleStory);
$('story-speak').addEventListener('click',()=>{const s=slides()[state.story[state.scene]];if(s&&s.n!==undefined)speakNumber(s.n,$('animation-stage'));});
$('task-next').addEventListener('click',nextTask);$('task-prev').addEventListener('click',previousTask);
if($('nav-map-btn'))$('nav-map-btn').addEventListener('click',()=>{state.mapSubView='lesson1';showDuolingoMap(true);});
if($('s1-back-interactive-btn'))$('s1-back-interactive-btn').addEventListener('click',()=>{
 if(state.onboarding)state.onboarding.reviewSlidesMode=false;
 renderStory();
 updateStepClarityBar();
 saveState();
});
if($('s1-skip-to-play-btn'))$('s1-skip-to-play-btn').addEventListener('click',()=>{
 if(state.onboarding)state.onboarding.reviewSlidesMode=false;
 completeStation1Onboarding();
 openNode(1);
});
if($('scb-review-slides-btn'))$('scb-review-slides-btn').addEventListener('click',openReviewSlidesMode);
if($('scb-opt-review-btn'))$('scb-opt-review-btn').addEventListener('click',startOptionalReview);
if($('scb-bypass-review-now'))$('scb-bypass-review-now').addEventListener('click',startOptionalReview);
if($('back-to-map'))$('back-to-map').addEventListener('click',()=>{
 if(state.viewMode==='lesson2'){
  setMapSubView('lesson2',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 if(state.viewMode==='lesson3'){
  setMapSubView('lesson3',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 if(state.viewMode==='lesson4'){
  setMapSubView('lesson4',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 if(state.viewMode==='lesson5'){
  setMapSubView('lesson5',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 if(state.viewMode==='u2_lesson1'){
  setMapSubView('u2_lesson1',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 if(state.viewMode==='unit1_exam'){
  if(typeof Unit1ExamEngine!=='undefined'&&Unit1ExamEngine.closeToHub){Unit1ExamEngine.closeToHub();return;}
  setMapSubView('unit1_exam',true);
  if(typeof showDuolingoMap==='function')showDuolingoMap(false);
  return;
 }
 state.mapSubView='lesson1';
 showDuolingoMap(true);
});
if($('hud-brand'))$('hud-brand').addEventListener('click',e=>{e.preventDefault();state.mapSubView='sections';showDuolingoMap(false);});
if($('duo-tab-sections'))$('duo-tab-sections').addEventListener('click',()=>setMapSubView('sections',true));
if($('duo-tab-lesson1'))$('duo-tab-lesson1').addEventListener('click',()=>setMapSubView('lesson1',true));
if($('duo-tab-lesson2'))$('duo-tab-lesson2').addEventListener('click',()=>{
 const l2 = getLesson2State();
 l2.unlocked = true;
 saveState();
 setMapSubView('lesson2', true);
});
if($('duo-tab-lesson3'))$('duo-tab-lesson3').addEventListener('click',()=>{
 const l3 = typeof getLesson3State === 'function' ? getLesson3State() : null;
 if(l3) l3.unlocked = true;
 saveState();
 setMapSubView('lesson3', true);
});
if($('duo-tab-lesson4'))$('duo-tab-lesson4').addEventListener('click',()=>{
 const l4 = typeof getLesson4State === 'function' ? getLesson4State() : null;
 if(l4) l4.unlocked = true;
 saveState();
 setMapSubView('lesson4', true);
});
if($('duo-tab-lesson5'))$('duo-tab-lesson5').addEventListener('click',()=>{
 const l5 = typeof getLesson5State === 'function' ? getLesson5State() : null;
 if(l5) l5.unlocked = true;
 saveState();
 setMapSubView('lesson5', true);
});
if($('l2-open-lab-btn'))$('l2-open-lab-btn').addEventListener('click',()=>openComparisonLab());
if($('l3-open-lab-btn'))$('l3-open-lab-btn').addEventListener('click',()=>{ if(typeof openOperationsLab === 'function') openOperationsLab(); });
if($('l4-open-lab-btn'))$('l4-open-lab-btn').addEventListener('click',()=>{ if(typeof openNegativeNumbersLab === 'function') openNegativeNumbersLab(); });
if($('l5-open-lab-btn'))$('l5-open-lab-btn').addEventListener('click',()=>{ if(typeof openTableStrategyLab === 'function') openTableStrategyLab(); });
if($('u2l1-open-lab-btn'))$('u2l1-open-lab-btn').addEventListener('click',()=>{ if(typeof openMentalMulLab === 'function') openMentalMulLab(); });
if($('duo-open-lab-btn'))$('duo-open-lab-btn').addEventListener('click',()=>{
 if(state.mapSubView==='u2_lesson1'&&typeof openMentalMulLab==='function'){ openMentalMulLab(); return; }
 if(state.mapSubView==='lesson5'&&typeof openTableStrategyLab==='function'){ openTableStrategyLab(); return; }
 if(state.mapSubView==='lesson4'&&typeof openNegativeNumbersLab==='function'){ openNegativeNumbersLab(); return; }
 if(state.mapSubView==='lesson3'&&typeof openOperationsLab==='function'){ openOperationsLab(); return; }
 if(state.mapSubView==='lesson2'&&typeof openComparisonLab==='function'){ openComparisonLab(); return; }
 if(typeof showCurriculumSheet==='function'){ showCurriculumSheet('lesson1'); }
});
setupComparisonLabEvents();
if(typeof setupOperationsLabEvents === 'function') setupOperationsLabEvents();
if(typeof setupNegLineLabEvents === 'function') setupNegLineLabEvents();
if(typeof setupTableLabEvents === 'function') setupTableLabEvents();
if(typeof setupMentalMulLabEvents === 'function') setupMentalMulLabEvents();
if(typeof setupUnit2ProjectEvents === 'function') setupUnit2ProjectEvents();
if($('duo-back-sections'))$('duo-back-sections').addEventListener('click',()=>{
 if(state.mapSubView==='u2_lesson1')setMapSubView('u2_sections',true);
 else setMapSubView('sections',true);
});
if($('bc-to-units'))$('bc-to-units').addEventListener('click',()=>setMapSubView('units',true));
if($('compact-brand-home'))$('compact-brand-home').addEventListener('click',()=>{
 if(state.mapSubView==='sections')setMapSubView('units',true);
 else setMapSubView('sections',true);
});
if($('bt-rail-brand')){
 const goSections=()=>{
  if(state.viewMode!=='map')showDuolingoMap(false);
  if(state.mapSubView==='sections')setMapSubView('units',true);
  else setMapSubView('sections',true);
 };
 $('bt-rail-brand').addEventListener('click',goSections);
 $('bt-rail-brand').addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){e.preventDefault();goSections();}
 });
}
if($('duo-rail-all-units'))$('duo-rail-all-units').addEventListener('click',()=>{
 if(state.mapSubView==='units')setMapSubView('sections',true);
 else setMapSubView('units',true);
});
if($('duo-rail-open-tutor'))$('duo-rail-open-tutor').addEventListener('click',()=>{
 if(typeof openAiTutor==='function')openAiTutor();
});
if($('duo-rail-open-report'))$('duo-rail-open-report').addEventListener('click',()=>{
 $('report-open')?.click();
});
if($('lesson-picker-btn'))$('lesson-picker-btn').addEventListener('click',()=>{
 if(typeof openLessonPickerSheet==='function')openLessonPickerSheet();
});
if($('lesson-picker-close'))$('lesson-picker-close').addEventListener('click',()=>{
 if(typeof closeLessonPickerSheet==='function')closeLessonPickerSheet(true);
});
if($('lesson-picker-sheet')){
 const lpSheet=$('lesson-picker-sheet');
 lpSheet.addEventListener('click',e=>{
  if(e.target===lpSheet&&typeof closeLessonPickerSheet==='function')closeLessonPickerSheet(true);
 });
 lpSheet.addEventListener('close',()=>{
  const trigger=$('lesson-picker-btn');
  if(trigger)trigger.setAttribute('aria-expanded','false');
  if(typeof lessonPickerReturnFocus==='undefined'||lessonPickerReturnFocus){
   requestAnimationFrame(()=>trigger?.focus());
  }
 });
 lpSheet.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Home'||e.key==='End'){
   const items=[...lpSheet.querySelectorAll('.lp-switch-btn, .lp-item-btn')];
   if(!items.length)return;
   const idx=items.indexOf(document.activeElement);
   let nextIdx=0;
   if(e.key==='Home')nextIdx=0;
   else if(e.key==='End')nextIdx=items.length-1;
   else if(e.key==='ArrowDown')nextIdx=idx<0?0:(idx+1)%items.length;
   else if(e.key==='ArrowUp')nextIdx=idx<=0?items.length-1:idx-1;
   e.preventDefault();
   items[nextIdx]?.focus();
  }
 });
}
if($('duo-hero-start'))$('duo-hero-start').addEventListener('click',()=>{
 if(state.mapSubView==='lesson2'&&typeof openLesson2Node==='function'){
  openLesson2Node(currentLesson2Frontier());
  return;
 }
 if(state.mapSubView==='lesson3'&&typeof openLesson3Node==='function'){
  openLesson3Node(currentLesson3Frontier());
  return;
 }
 if(state.mapSubView==='lesson4'&&typeof openLesson4Node==='function'){
  openLesson4Node(currentLesson4Frontier());
  return;
 }
 if(state.mapSubView==='lesson5'&&typeof openLesson5Node==='function'){
  openLesson5Node(currentLesson5Frontier());
  return;
 }
 if(state.mapSubView==='u2_lesson1'&&typeof openU2L1Node==='function'){
  openU2L1Node(currentU2L1Frontier());
  return;
 }
 const allDone=PATH_NODES.every(n=>isNodeCompleted(n.id));
 if(allDone)startInfiniteMode('all');
 else openNode(currentFrontierNodeId());
});
if($('duo-jump-current'))$('duo-jump-current').addEventListener('click',()=>scrollToCurrentStation(true));
window.addEventListener('scroll',()=>{
 if(state.viewMode!=='map')return;
 if(!scrollTicking){
  scrollTicking=true;
  requestAnimationFrame(()=>{
   updateJumpButton();
   if(typeof updateStickyStageBanner==='function')updateStickyStageBanner();
   scrollTicking=false;
  });
 }
},{passive:true});
window.addEventListener('resize',()=>{
 if(state.viewMode==='map'){
  updateJumpButton();
  if(typeof updateStickyStageBanner==='function')updateStickyStageBanner();
  updatePathTrackSVGs();
 }
},{passive:true});
if($('st-sheet-close'))$('st-sheet-close').addEventListener('click',()=>$('station-sheet')?.close());
if($('st-sheet-dismiss-btn'))$('st-sheet-dismiss-btn').addEventListener('click',()=>$('station-sheet')?.close());
if($('station-sheet')){
 $('station-sheet').addEventListener('click',e=>{if(e.target===$('station-sheet'))$('station-sheet').close();});
}
if($('st-sheet-start-btn')){
 $('st-sheet-start-btn').addEventListener('click',()=>{
  const id=currentSheetNodeId;
  const curItem=currentSheetCurriculumId;
  $('station-sheet')?.close();
  if(curItem){
   currentSheetCurriculumId=null;
   if(curItem==='project'){
    state.unitProjectDone=true;
    sound(true);
    renderHUD();renderDuolingoMap();saveState();
    guide('أحسنت! أتممت استكشاف مشروع الوحدة (الرياضيات والاجتماعيات) وحصلت على 25 نقطة.',5000);
   }else if(curItem==='lesson2'){
    const l2 = getLesson2State();
    l2.unlocked = true;
    saveState();
    setMapSubView('lesson2',true);
   }else if(curItem==='lesson3'){
    const l3 = typeof getLesson3State === 'function' ? getLesson3State() : null;
    if(l3) l3.unlocked = true;
    saveState();
    setMapSubView('lesson3',true);
   }else if(curItem==='lesson4'){
    const l4 = typeof getLesson4State === 'function' ? getLesson4State() : null;
    if(l4) l4.unlocked = true;
    saveState();
    setMapSubView('lesson4',true);
   }else if(curItem==='lesson5'){
    const l5 = typeof getLesson5State === 'function' ? getLesson5State() : null;
    if(l5) l5.unlocked = true;
    saveState();
    setMapSubView('lesson5',true);
   }else{
    setMapSubView('lesson1',true);
   }
   return;
  }
  if(id!==null&&id!==undefined){
   if(isNodeUnlocked(id)){
    const node=PATH_NODES[id];
    if(node&&node.type==='mission'&&isNodeCompleted(id)){
     const mId=node.missionId;
     state.records[mId]={index:0,passed:new Set(),data:{},lastMessage:''};
     currentStationErrors=0;
    }
    openNode(id);
   }else{
    setMapSubView('lesson1',true);
   }
  }
 });
}
if($('story-gate-btn'))$('story-gate-btn').addEventListener('click',completeCurrentNodeAndAdvance);
if($('playground-gate-btn'))$('playground-gate-btn').addEventListener('click',()=>{
 if(state.viewMode==='scratchpad'||state.viewMode==='recharge'){
  const ret=state.returnNode??currentFrontierNodeId();
  openNode(ret);
  return;
 }
 completeCurrentNodeAndAdvance();
});
if($('start-heart-recharge'))$('start-heart-recharge').addEventListener('click',startHeartRecharge);
if($('scratchpad-open'))$('scratchpad-open').addEventListener('click',openScratchpad);
if($('nav-story-btn'))$('nav-story-btn').addEventListener('click',()=>{
 const sNode=activeStoryNode()||PATH_NODES[0];
 openNode(sNode.id,$('nav-story-btn'));
});
if($('nav-play-btn'))$('nav-play-btn').addEventListener('click',()=>{
 if(!isNodeUnlocked(1)){
  sound(false);haptic(false);shakeElement($('nav-play-btn'));
  guide('ملعب الأعداد مقفل! أكمل مشاهدة شرائح الشرح في المحطة 1 كاملًا ليفتح لك الملعب.',4800);
  return;
 }
 if(state.viewMode==='mission'&&isNodeCompleted(1)){openScratchpad();return;}
 openNode(1,$('nav-play-btn'));
});
if($('nav-mission-btn'))$('nav-mission-btn').addEventListener('click',()=>{
 if(!isNodeUnlocked(2)){
  sound(false);haptic(false);shakeElement($('nav-mission-btn'));
  if(!isNodeCompleted(0))guide('المهام مقفلة! شاهد قسم الشرح في المحطة 1 كاملًا، ثم أنجز ملعب الأعداد أولًا.',5000);
  else guide('المهام مقفلة! أنجز 3 تحديات في «2. ملعب الأعداد التفاعلي» أولًا لتفتح المهام.',5000);
  return;
 }
 const fNode=PATH_NODES[currentFrontierNodeId()];
 const targetMission=fNode&&fNode.type==='mission'?fNode:(PATH_NODES.find(n=>n.type==='mission'&&isNodeUnlocked(n.id)&&!isNodeCompleted(n.id))||PATH_NODES[2]);
 openNode(targetMission.id,$('nav-mission-btn'));
});
$('hint-button').addEventListener('click',()=>{
 const d=stepData(),s=currentStep();
 const oldTier=d.hintTier||0;
 const newTier=oldTier<3?oldTier+1:3;
 d.hintTier=newTier;
 d.hintLevel=newTier;
 d.usedHint=true;

 const hints=getProgressiveHints(s);
 const currentHint=hints[newTier-1];
 const reveals=newTier>=3;

 if(reveals){
  markStepAssisted('hint_tier_'+newTier);
  triggerHintHighlight(s);
 }else{
  if(!d.usedHelp&&!d.revealedAnswer&&d.status!=='assisted'){
   d.independent=true;
   d.revealedAnswer=false;
   d.usedHelp=false;
  }
 }
 renderHintState();
 const levelNames=['المرحلة 1: تلميح بسيط','المرحلة 2: توجيه وطريقة تفكير','المرحلة 3: مساعدة عملية'];
 const hText=typeof currentHint==='object'?currentHint.text:currentHint;
 guide(levelNames[newTier-1]+': '+hText,6500);
});
$('report-open').addEventListener('click',()=>{pauseRapid();stopStory();showFinish();});
$('student-name-input').addEventListener('input',e=>{state.studentName=e.target.value;$('cert-student-name').textContent=(state.studentName&&state.studentName.trim())?state.studentName.trim():'بطل/بطلة رحلة الملايين';saveState();});
$('print-cert').addEventListener('click',()=>window.print());
$('train-weakest').addEventListener('click',()=>{if(typeof trainWeakestFromReport==='function'){trainWeakestFromReport();return;}const weakest=computeSkillReport().sort((a,b)=>(a.score-b.score)||(a.progressPct-b.progressPct))[0];$('finish-dialog').close();startInfiniteMode(weakest.key);});
$('finish-infinite').addEventListener('click',()=>{$('finish-dialog').close();startInfiniteMode('all');});
$('infinite-toggle').addEventListener('click',()=>{
 const infUnlocked=state.completed.size===12||isNodeCompleted(19);
 if(!infUnlocked&&!state.infiniteMode){
  sound(false);haptic(false);shakeElement($('infinite-toggle'));
  guide('التحدي المتجدد اللانهائي يفتح كجائزة كبرى بعد إتمام محطات المسار!',4800);
  return;
 }
 if(state.infiniteMode)exitInfiniteMode();else startInfiniteMode(state.infiniteSkill||'all');
});
$('infinite-new').addEventListener('click',()=>startInfiniteMode(state.infiniteSkill));
$('infinite-exit').addEventListener('click',exitInfiniteMode);
document.querySelectorAll('#infinite-skills button').forEach(b=>b.addEventListener('click',()=>startInfiniteMode(b.dataset.skill)));
$('sound-toggle').addEventListener('click',()=>{state.muted=!state.muted;if(state.muted)stopSpeech();updateSoundButton();if(!state.muted)sound(true);saveState();});
$('guide-close').addEventListener('click',()=>$('guide').classList.remove('show'));
$('reset-open').addEventListener('click',()=>{pauseRapid();stopStory();$('reset-dialog').showModal();});$('reset-cancel').addEventListener('click',()=>{$('reset-dialog').close();if(currentStep().type==='rapid')drawRapid();});$('reset-confirm').addEventListener('click',resetAll);
if($('badge-modal-close'))$('badge-modal-close').addEventListener('click',()=>$('badge-unlock-modal').close());
checkMilestoneBadges(true);
renderStreakIndicator();
$('finish-review').addEventListener('click',()=>$('finish-dialog').close());$('finish-replay').addEventListener('click',resetAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseRapid();stopStory();stopSpeech();cancelDigitGestures();dragController?.cancel();}else if(currentStep().type==='rapid')drawRapid();});
window.addEventListener('blur',()=>{cancelDigitGestures();dragController?.cancel();});
const resumed=loadState();
updateSoundButton();
renderExperiments();initPlayground();applyScene();
if(state.viewMode==='unit1_exam'&&typeof Unit1ExamEngine!=='undefined'&&Unit1ExamEngine.resumeFromSavedState){
 Unit1ExamEngine.resumeFromSavedState();
}else if(typeof L1Runner!=='undefined'&&(state.viewMode!=='map'||(state.runnerStep&&Number.isInteger(state.runnerStep.nodeId)))){
 L1Runner.resumeFromSavedState();
}else if(resumed){
 guide('مرحبًا بعودتك! استعدنا تقدّمك ومحطتك المحفوظة تلقائيًا.',4800);
}
