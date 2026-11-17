/* Lesson 1: HUD, Assessment, Hints, Infinite Mode, Audio Eval & Step Renderers */
function renderHUD(){
 const done=state.completed.size,nodesDone=PATH_NODES.filter(n=>isNodeCompleted(n.id)).length,percent=Math.round(nodesDone/PATH_NODES.length*100);
 const names=['مبتدئ','مستكشف','خبير','بطل','أسطورة'],level=done===12?4:Math.floor(nodesDone/5);
 $('level-name').textContent=names[Math.min(4,level)];
 const lvlIcons=['sprout','compass','lightbulb','star','crown'];
 const lvlSpan=document.querySelector('.level>span');
 if(lvlSpan)lvlSpan.innerHTML=getIconSVG(lvlIcons[Math.min(4,level)],'gold');
 $('points').textContent=totalPoints();$('percent').textContent=percent+'%';
 $('progress-caption').textContent='مسارك · '+ar(nodesDone)+' من '+ar(PATH_NODES.length)+' محطة'+(state.infiniteStats.solved?' (+'+ar(state.infiniteStats.solved)+' تحدٍّ)':'');
 $('progress').setAttribute('aria-valuenow',percent);$('progress-fill').style.width=percent+'%';$('progress-fill').style.background='hsl('+(3+percent*1.18)+' 45% 42%)';
 $('hearts').innerHTML=renderHeartsSVG(state.hearts);$('hearts').setAttribute('aria-label',state.hearts+' قلوب');
 if($('hud-badge'))$('hud-badge').hidden=true;
 const unlocked=isNodeUnlocked(10)||[0,1,2,3,4,5].every(i=>state.completed.has(i));
 document.querySelector('[data-scene="1"]').setAttribute('aria-disabled',String(!unlocked));
 $('training-tab-label').innerHTML=(unlocked?'':'<span class="btn-svg">'+getIconSVG('lock')+'</span>')+'الصفحتان <bdi>10 - 11</bdi>';
 updateLearningNav();
 renderMilestoneBadgesHUD();
 renderStreakIndicator();
}
function updateLearningNav(){
 const playUnlocked=isNodeUnlocked(1),missionUnlocked=isNodeUnlocked(2),infUnlocked=state.completed.size===12||isNodeCompleted(19);
 const mapBtn=$('nav-map-btn'),storyBtn=$('nav-story-btn'),playBtn=$('nav-play-btn'),missionBtn=$('nav-mission-btn'),infBtn=$('infinite-toggle');
 if(mapBtn)mapBtn.classList.toggle('active-nav',state.viewMode==='map');
 if(storyBtn)storyBtn.classList.toggle('active-nav',state.viewMode==='story');
 if(mapBtn)mapBtn.innerHTML='<span class="btn-svg">'+getIconSVG('map')+'</span><span>المسار</span>';
 if(storyBtn)storyBtn.innerHTML='<span class="btn-svg">'+getIconSVG('book')+'</span><span>الشرح</span>';
 if(playBtn){
  playBtn.classList.toggle('active-nav',['playground','recharge','scratchpad'].includes(state.viewMode));
  playBtn.setAttribute('aria-disabled',String(!playUnlocked));
  playBtn.innerHTML='<span class="btn-svg">'+getIconSVG(playUnlocked?'hand':'lock')+'</span><span>الملعب</span>';
 }
 if(missionBtn){
  missionBtn.classList.toggle('active-nav',state.viewMode==='mission'&&!state.infiniteMode);
  missionBtn.setAttribute('aria-disabled',String(!missionUnlocked));
  missionBtn.innerHTML='<span class="btn-svg">'+getIconSVG(missionUnlocked?'target':'lock')+'</span><span>مهمتي</span>';
 }
 if(infBtn){
  infBtn.classList.toggle('active-nav',state.infiniteMode);
  infBtn.setAttribute('aria-disabled',String(!infUnlocked));
  infBtn.innerHTML='<span class="btn-svg">'+getIconSVG(infUnlocked?'infinity':'lock')+'</span><span>تحدٍّ متجدد</span>';
 }
}
function wrong(reason,element,analysis=null){
 if(isPassed())return;
 const d=stepData();
 d.wrongAttempts=(d.wrongAttempts||0)+1;
 if(d.wrongAttempts>=2){
  d.helpUnlocked=true;
 }
 const sk=stepSkill(currentStep());if(state.skillStats[sk])state.skillStats[sk].err++;
 state.streak=0;
 renderStreakIndicator();
 if(state.infiniteMode){
  state.infiniteStats.streak=0;
  renderInfiniteBar();
 }else{
  state.errors++;
  state.hearts=Math.max(0,state.hearts-1);
  currentStationErrors++;
 }
 sound(false);haptic(false);shakeElement(element||$('mission-content').querySelector('.spin:focus,.answer:focus,input:focus,.verbal-tile-btn:focus,.expanded-tile:focus')||$('mission-content'));
 updateCoach('لا بأس! اقرأ التوجيه المقارن أدناه، وراجع عدد الأصفار على يمين الرقم.');
 $('feedback').className='feedback bad';
 if(analysis){
  $('feedback').innerHTML=renderMismatchFeedbackHTML(reason,analysis);
 }else{
  $('feedback').textContent='حاول من جديد. '+reason;
 }
 renderHintState();
 renderHUD();saveState();
 if(!state.infiniteMode&&state.hearts===0){
  openInPlaceRecharge();
 }else{
  const guideMsg=analysis?.directObservation?analysis.directObservation+' '+analysis.guidance:reason;
  guide('لا بأس! '+guideMsg,5500);
 }
}
function pass(reason){
 const r=record();if(r.passed.has(r.index))return;r.passed.add(r.index);r.lastMessage=reason;
 const d=stepData();
 const isAssisted=Boolean(
  d.revealedAnswer||
  d.usedHelp||
  d.assisted||
  (d.hintLevel>=3)||
  (d.hintTier>=3)||
  d.status==='assisted'||
  (r.assistedSteps&&r.assistedSteps.has(r.index))
 );
 d.status=isAssisted?'assisted':'independent';
 d.independent=!isAssisted;
 if(isAssisted){
  d.usedHelp=true;
  d.assisted=true;
  d.revealedAnswer=true;
  r.assistedSteps=r.assistedSteps||new Set();
  r.assistedSteps.add(r.index);
  r.independentSteps?.delete?.(r.index);
 }else{
  r.independentSteps=r.independentSteps||new Set();
  r.independentSteps.add(r.index);
 }
 const sk=stepSkill(currentStep());
 if(state.skillStats[sk]){
  state.skillStats[sk].ok++;
  if(isAssisted){
   state.skillStats[sk].assistedOk=(state.skillStats[sk].assistedOk||0)+1;
  }else{
   state.skillStats[sk].independentOk=(state.skillStats[sk].independentOk||0)+1;
  }
 }
 state.streak=(state.streak||0)+1;
 state.maxSessionStreak=Math.max(state.maxSessionStreak||0,state.streak);
 renderStreakIndicator();
 sound(true);haptic(true);$('mission-content').querySelectorAll('.spin').forEach(el=>el.classList.add('correct'));
 if(isAssisted){
  $('feedback').className='feedback good assisted-feedback';
  $('feedback').innerHTML='<span class="feedback-badge-assisted">أُنجز بمساعدة</span> '+'أحسنت! أكملت التدريب بمساعدة. '+reason;
 }else{
  $('feedback').className='feedback good';
  $('feedback').textContent='صحيح! '+reason;
 }
 if(state.infiniteMode){
  state.infiniteStats.solved++;state.infiniteStats.streak++;state.infiniteStats.maxStreak=Math.max(state.infiniteStats.maxStreak,state.infiniteStats.streak);state.infiniteStats.bonusPoints+=10;
  renderHUD();renderInfiniteBar();celebrate(16);guide('أحسنت في التحدي المتجدد! +10 نقاط إضافية. اضغط «مسألة جديدة» أو «التالي».',4200);updateNext();renderSubProgress();saveState();return;
 }
 const id=activeId(),all=r.passed.size===missions[id].steps.length;
 if(all){
  const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
  if(mNode){
   state.nodesCompleted.add(mNode.id);
   let earnedStars=3;
   if(currentStationErrors===1)earnedStars=2;
   else if(currentStationErrors>=2)earnedStars=1;
   if(!state.nodeStars)state.nodeStars={};
   const oldStars=state.nodeStars[mNode.id]||0;
   state.nodeStars[mNode.id]=Math.max(oldStars,earnedStars);
  }
  checkMilestoneBadges();
 }
 if(all&&!state.completed.has(id)){
  state.completed.add(id);renderHUD();renderMissionSteps();renderDuolingoMap();
  const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
  const finalStars=state.nodeStars?.[mNode?.id]||3;
  let starNotice=finalStars===3?'بإتقان تام (3 نجوم)!':finalStars===2?'(نجمتان · خطأ واحد)':('نجمة واحدة · يمكنك الإعادة لتحسينها');
  const inRunner=typeof L1Runner!=='undefined'&&L1Runner.isActive();
  if(!inRunner){
   guide('أحسنت! اكتملت المهمة '+ar(id+1)+' '+starNotice+' وفتحت المحطة التالية في مسارك (+25 نقطة).');celebrate(18);
   if(id===5)guide('أكملت محطات الفصل الأول! اضغط «المحطة التالية» لنفتح فصل التدريب.',7000);
   if(state.completed.size===12&&!state.finished){state.finished=true;finishTimer=setTimeout(showFinish,900);}
  }else if(state.completed.size===12&&!state.finished){
   state.finished=true;
  }
 }else if(all){
  renderHUD();renderMissionSteps();renderDuolingoMap();
  const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
  const finalStars=state.nodeStars?.[mNode?.id]||3;
  let starNotice=finalStars===3?'حققت 3 نجوم بإتقان تام دون أخطاء!':'أنهيت المحطة بنتيجة '+ar(finalStars)+' من 3 نجوم.';
  guide('أحسنت في تحسين المحطة! '+starNotice);celebrate(18);
 }else{
  if(isAssisted){
   guide('أحسنت! أكملت التدريب بمساعدة. يمكنك المتابعة أو خوض مسألة تحقق جديدة لإثبات إتقانك.',5000);
  }else{
   guide('صحيح! تابع إلى الجزء التالي.',3500);
  }
 }
 updateNext();renderSubProgress();renderStationTopbar();renderAssistedNoticeCard();saveState();
}
function celebrate(count=40){if(reduced.matches)return;clearTimeout(confettiTimer);$('confetti').replaceChildren();const colors=['#91b857','#e5bf50','#d694ab','#69abb8'];for(let i=0;i<count;i++){const el=document.createElement('i');el.style.left=Math.random()*100+'%';el.style.background=colors[i%4];el.style.animationDelay=Math.random()*.4+'s';el.style.animationDuration=(2.1+Math.random())+'s';$('confetti').append(el);}confettiTimer=setTimeout(()=>$('confetti').replaceChildren(),3700);}
function computeSkillReport(){
 const meta=[
  {key:'place',name:'تحديد المنزلة والقيمة المنزلية',exitKeys:['place']},
  {key:'verbal',name:'قراءة الأعداد والصيغة اللفظية',exitKeys:['reading']},
  {key:'standard',name:'بناء العدد والصيغة القياسية',exitKeys:['standard']},
  {key:'expanded',name:'الصيغة التحليلية واكتشاف الخطأ',exitKeys:['expanded','reasoning']}
 ];
 const et=state.exitTicket;
 const hasExitTicket=Boolean(et&&et.status==='completed'&&et.lastScore!==null&&et.lastResult);
 const etSkills=hasExitTicket?(et.lastResult.skillResults||{}):{};
 return meta.map(m=>{
  let totalSteps=0,passedSteps=0,independentCount=0,assistedCount=0;
  missions.forEach((ms,mIdx)=>ms.steps.forEach((st,sIdx)=>{
   if(stepSkill(st)===m.key){
    totalSteps++;
    const rec=state.records[mIdx];
    if(rec?.passed?.has(sIdx)){
     passedSteps++;
     const sData=rec.data?.[sIdx]||{};
     const isAssisted=Boolean(
      sData.usedHelp||
      sData.assisted||
      (sData.hintTier>=3)||
      (sData.status==='assisted')||
      rec.assistedSteps?.has?.(sIdx)
     );
     if(isAssisted)assistedCount++;
     else independentCount++;
    }
   }
  }));
  const st=state.skillStats[m.key]||{ok:0,err:0};
  const progressPct=totalSteps?Math.round((passedSteps/totalSteps)*100):0;
  let verifiedScore=null;
  let isAssessed=false;
  if(hasExitTicket){
   let totalPts=0,maxPts=0;
   m.exitKeys.forEach(ek=>{
    if(etSkills[ek]){
     totalPts+=etSkills[ek].pts||0;
     maxPts+=etSkills[ek].max||20;
    }
   });
   if(maxPts>0){
    isAssessed=true;
    verifiedScore=Math.round((totalPts/maxPts)*100);
   }
  }
  let status='لم يُقيّم';
  if(isAssessed){
   if(verifiedScore===100)status='متقن';
   else if(verifiedScore>=50)status='قيد الإتقان';
   else status='يحتاج إلى تدريب';
  }
  const score=isAssessed?(verifiedScore||0):0;
  const needsReview=isAssessed?(verifiedScore<100):false;
  return{
   ...m,
   score,
   verifiedScore,
   status,
   assessed:isAssessed,
   needsReview,
   progressPct,
   passedSteps,
   totalSteps,
   independentCount,
   assistedCount,
   ok:st.ok,
   err:st.err
  };
 });
}
let activeReportLesson=null;
function detectActiveLessonForReport(){
 if(typeof state==='object'&&state){
  if(state.viewMode==='lesson5'||(state.viewMode==='map'&&state.mapSubView==='lesson5'))return 'lesson5';
  if(state.viewMode==='lesson4'||(state.viewMode==='map'&&state.mapSubView==='lesson4'))return 'lesson4';
  if(state.viewMode==='lesson3'||(state.viewMode==='map'&&state.mapSubView==='lesson3'))return 'lesson3';
  if(state.viewMode==='lesson2'||(state.viewMode==='map'&&state.mapSubView==='lesson2'))return 'lesson2';
 }
 return 'lesson1';
}
function getReportLessonTarget(lessonOverride){
 let target=(lessonOverride==='lesson1'||lessonOverride==='lesson2'||lessonOverride==='lesson3'||lessonOverride==='lesson4'||lessonOverride==='lesson5')
  ?lessonOverride
  :(activeReportLesson||detectActiveLessonForReport());
 if(target==='lesson5'&&(typeof L5_NODES==='undefined'||typeof getLesson5State!=='function'))target='lesson1';
 if(target==='lesson4'&&(typeof L4_NODES==='undefined'||typeof getLesson4State!=='function'))target='lesson1';
 if(target==='lesson3'&&(typeof L3_NODES==='undefined'||typeof getLesson3State!=='function'))target='lesson1';
 if(target==='lesson2'&&(typeof L2_NODES==='undefined'||typeof getLesson2State!=='function'))target='lesson1';
 activeReportLesson=target;
 return target;
}
function buildMultiLessonReportItems(groups,cfg){
 const etDone=cfg.isCompleted(cfg.exitNodeId);
 const etRec=cfg.getRecord(cfg.exitNodeId);
 const etSkills=(etRec&&etRec.data&&etRec.data.skills&&typeof etRec.data.skills==='object')?etRec.data.skills:(cfg.extraExitSkills||{});
 const hasExitAttempt=etDone||Object.keys(etSkills).length>0||(typeof cfg.fallbackExitScore==='number');
 return groups.map(grp=>{
  let totalSteps=0,passedSteps=0,independentCount=0,assistedCount=0,errors=0;
  let firstUncompleted=null,firstUnlocked=null;
  grp.nodeIds.forEach(id=>{
   const stepCnt=Math.max(1,Number(cfg.getStepCount(id)||1));
   const rec=cfg.getRecord(id)||{};
   const isDone=cfg.isCompleted(id);
   const pSize=rec.passed instanceof Set?rec.passed.size:(Array.isArray(rec.passed)?rec.passed.length:0);
   const iSize=rec.independentSteps instanceof Set?rec.independentSteps.size:(rec.independent instanceof Set?rec.independent.size:0);
   const aSize=rec.assistedSteps instanceof Set?rec.assistedSteps.size:(rec.assisted instanceof Set?rec.assisted.size:0);
   totalSteps+=stepCnt;
   passedSteps+=isDone?stepCnt:Math.min(stepCnt,pSize);
   independentCount+=iSize;
   assistedCount+=aSize;
   errors+=Number(rec.errors||0);
   if(!isDone&&firstUncompleted===null)firstUncompleted=id;
   if(!isDone&&firstUnlocked===null&&cfg.isUnlocked(id))firstUnlocked=id;
  });
  const targetNodeId=firstUnlocked!==null?firstUnlocked:(firstUncompleted!==null?firstUncompleted:grp.nodeIds[0]);
  const progressPct=totalSteps?Math.round((passedSteps/totalSteps)*100):0;
  let assessed=false,verifiedScore=0;
  if(etDone){
   assessed=true;
   verifiedScore=100;
  }else if(hasExitAttempt){
   if(Array.isArray(grp.exitSkills)&&grp.exitSkills.length>0&&Object.keys(etSkills).length>0){
    assessed=true;
    const hit=grp.exitSkills.filter(k=>etSkills[k]===true).length;
    verifiedScore=Math.round((hit/grp.exitSkills.length)*100);
   }else if(typeof cfg.fallbackExitScore==='number'){
    assessed=true;
    verifiedScore=cfg.fallbackExitScore;
   }
  }
  const status=!assessed?'لم يُقيّم':(verifiedScore===100?'متقن':verifiedScore>=50?'قيد الإتقان':'يحتاج إلى تدريب');
  return{
   key:grp.key,
   name:grp.name,
   nodeIds:grp.nodeIds,
   targetNodeId,
   totalSteps,
   passedSteps,
   independentCount,
   assistedCount,
   errors,
   progressPct,
   assessed,
   verifiedScore,
   score:assessed?verifiedScore:progressPct,
   status,
   needsReview:assessed&&verifiedScore<100
  };
 });
}
function computeLesson5SkillReport(){
 const groups=[
  {key:'l5_plan',name:'فهم المسألة وتحديد قاعدة الجدول',nodeIds:[0,2,8],exitSkills:['l5_understand_plan']},
  {key:'l5_ratio',name:'جداول النِّسَب والمجاميع (مهند ولمياء)',nodeIds:[1,3],exitSkills:['l5_ratio_table']},
  {key:'l5_comb',name:'توافيق القمصان وربطات العنق (مازن)',nodeIds:[4],exitSkills:['l5_combinations_grid']},
  {key:'l5_coin',name:'مجموعات القطع النقدية (آلة القهوة)',nodeIds:[5],exitSkills:['l5_coin_table']},
  {key:'l5_pair',name:'بدائل الأزواج والتحقق (القفز بالحبل)',nodeIds:[6,7],exitSkills:['l5_pairing_list']}
 ];
 return buildMultiLessonReportItems(groups,{
  exitNodeId:9,
  isCompleted:id=>isLesson5NodeCompleted(id),
  isUnlocked:id=>typeof isLesson5NodeUnlocked==='function'?isLesson5NodeUnlocked(id):true,
  getRecord:id=>getLesson5NodeRecord(id),
  getStepCount:id=>(typeof Lesson5RunnerDefs!=='undefined'&&typeof Lesson5RunnerDefs.getStepCount==='function')?Lesson5RunnerDefs.getStepCount(id):2
 });
}
function computeLesson4SkillReport(){
 const groups=[
  {key:'l4_neg',name:'تمثيل المواقف بأعداد سالبة وموجبة',nodeIds:[2,3,5,12],exitSkills:['l4_neg_meaning']},
  {key:'l4_zero',name:'دلالة الصفر ومكانته المحايدة',nodeIds:[4,6,10],exitSkills:['l4_zero_ref']},
  {key:'l4_line',name:'تمثيل وإكمال خط الأعداد',nodeIds:[1,8],exitSkills:['l4_number_line']},
  {key:'l4_thermo',name:'قراءة موازين الحرارة والحرارة دون الصفر',nodeIds:[0,7],exitSkills:['l4_thermometer']},
  {key:'l4_sym',name:'تحليل الحروف والتناظر حول الصفر',nodeIds:[9],exitSkills:['l4_analysis_sym']},
  {key:'l4_shift',name:'التغير عبر الصفر واكتشاف الخطأ',nodeIds:[11],exitSkills:['l4_temp_shift']}
 ];
 return buildMultiLessonReportItems(groups,{
  exitNodeId:13,
  isCompleted:id=>isLesson4NodeCompleted(id),
  isUnlocked:id=>typeof isLesson4NodeUnlocked==='function'?isLesson4NodeUnlocked(id):true,
  getRecord:id=>getLesson4NodeRecord(id),
  getStepCount:id=>(typeof Lesson4RunnerDefs!=='undefined'&&typeof Lesson4RunnerDefs.getStepCount==='function')?Lesson4RunnerDefs.getStepCount(id):2
 });
}
function computeLesson3SkillReport(){
 const groups=[
  {key:'l3_add',name:'جمع الأعداد ضمن 7 منازل',nodeIds:[2,3,8],exitSkills:['l3_add_regroup','l3_three_addends']},
  {key:'l3_sub',name:'طرح الأعداد ضمن 7 منازل مع الاستلاف',nodeIds:[4,5,7],exitSkills:['l3_sub_borrow','l3_sub_zeros']},
  {key:'l3_est',name:'تقدير المجموع والفرق',nodeIds:[0,1,6],exitSkills:['l3_est_round']},
  {key:'l3_open',name:'الجمل المفتوحة واكتشاف الخطأ',nodeIds:[11,13,14],exitSkills:['l3_missing_digit','l3_error_detect']},
  {key:'l3_life',name:'المسائل الحياتية ومتعددة الخطوات',nodeIds:[9,10,12],exitSkills:['l3_word_multistep']}
 ];
 return buildMultiLessonReportItems(groups,{
  exitNodeId:15,
  isCompleted:id=>isLesson3NodeCompleted(id),
  isUnlocked:id=>typeof isLesson3NodeUnlocked==='function'?isLesson3NodeUnlocked(id):true,
  getRecord:id=>getLesson3NodeRecord(id),
  getStepCount:id=>(typeof Lesson3RunnerDefs!=='undefined'&&typeof Lesson3RunnerDefs.getStepCount==='function')?Lesson3RunnerDefs.getStepCount(id):3
 });
}
function computeLesson2SkillReport(){
 const l2=getLesson2State();
 const groups=(typeof L2_STAGES!=='undefined'?L2_STAGES:[]).map(st=>({
  key:'l2_stage_'+st.id,
  name:st.title,
  nodeIds:st.nodeIds||[],
  exitSkills:[]
 }));
 const hasSavedScore=l2&&l2.exitTicket&&l2.exitTicket.status==='completed'&&typeof l2.exitTicket.lastScore==='number';
 return buildMultiLessonReportItems(groups,{
  exitNodeId:14,
  isCompleted:id=>isLesson2NodeCompleted(id),
  isUnlocked:id=>typeof isLesson2NodeUnlocked==='function'?isLesson2NodeUnlocked(id):true,
  getRecord:id=>getLesson2NodeRecord(id),
  getStepCount:id=>(typeof Lesson2RunnerDefs!=='undefined'&&typeof Lesson2RunnerDefs.getStepCount==='function')?Lesson2RunnerDefs.getStepCount(id):3,
  extraExitSkills:(l2&&l2.exitTicket&&l2.exitTicket.skills)||null,
  fallbackExitScore:hasSavedScore?l2.exitTicket.lastScore:null
 });
}
function trainWeakestFromReport(){
 const target=getReportLessonTarget();
 if(target==='lesson5'){
  const items=computeLesson5SkillReport().sort((a,b)=>(a.assessed?a.verifiedScore:a.progressPct)-(b.assessed?b.verifiedScore:b.progressPct));
  const unlockedItem=items.find(it=>typeof isLesson5NodeUnlocked==='function'&&isLesson5NodeUnlocked(it.targetNodeId));
  const nodeId=unlockedItem?unlockedItem.targetNodeId:(typeof currentLesson5Frontier==='function'?currentLesson5Frontier():0);
  $('finish-dialog').close();
  if(typeof openLesson5Node==='function')openLesson5Node(nodeId);
  return;
 }
 if(target==='lesson4'){
  const items=computeLesson4SkillReport().sort((a,b)=>(a.assessed?a.verifiedScore:a.progressPct)-(b.assessed?b.verifiedScore:b.progressPct));
  const unlockedItem=items.find(it=>typeof isLesson4NodeUnlocked==='function'&&isLesson4NodeUnlocked(it.targetNodeId));
  const nodeId=unlockedItem?unlockedItem.targetNodeId:(typeof currentLesson4Frontier==='function'?currentLesson4Frontier():0);
  $('finish-dialog').close();
  if(typeof openLesson4Node==='function')openLesson4Node(nodeId);
  return;
 }
 if(target==='lesson3'){
  const items=computeLesson3SkillReport().sort((a,b)=>(a.assessed?a.verifiedScore:a.progressPct)-(b.assessed?b.verifiedScore:b.progressPct));
  const unlockedItem=items.find(it=>typeof isLesson3NodeUnlocked==='function'&&isLesson3NodeUnlocked(it.targetNodeId));
  const nodeId=unlockedItem?unlockedItem.targetNodeId:(typeof currentLesson3Frontier==='function'?currentLesson3Frontier():0);
  $('finish-dialog').close();
  if(typeof openLesson3Node==='function')openLesson3Node(nodeId);
  return;
 }
 if(target==='lesson2'){
  const items=computeLesson2SkillReport().sort((a,b)=>(a.assessed?a.verifiedScore:a.progressPct)-(b.assessed?b.verifiedScore:b.progressPct));
  const unlockedItem=items.find(it=>typeof isLesson2NodeUnlocked==='function'&&isLesson2NodeUnlocked(it.targetNodeId));
  const nodeId=unlockedItem?unlockedItem.targetNodeId:(typeof currentLesson2Frontier==='function'?currentLesson2Frontier():0);
  $('finish-dialog').close();
  if(typeof openLesson2Node==='function')openLesson2Node(nodeId);
  return;
 }
 const weakest=computeSkillReport().sort((a,b)=>(a.score-b.score)||(a.progressPct-b.progressPct))[0];
 $('finish-dialog').close();
 startInfiniteMode(weakest.key);
}
function ensureReportLessonTabs(targetLesson){
 const header=document.querySelector('#finish-dialog .report-header');
 if(!header)return;
 let tabs=$('report-lesson-tabs');
 if(!tabs){
  tabs=document.createElement('div');
  tabs.id='report-lesson-tabs';
  tabs.className='report-lesson-tabs';
  tabs.setAttribute('role','tablist');
  tabs.setAttribute('aria-label','اختيار الدرس في التقرير');
  const eyebrow=$('finish-eyebrow');
  if(eyebrow&&eyebrow.parentNode===header)header.insertBefore(tabs,eyebrow);
  else header.prepend(tabs);
 }
 const defs=[
  {id:'lesson1',label:'الدرس 1: الملايين'},
  {id:'lesson2',label:'الدرس 2: المقارنة والترتيب'},
  {id:'lesson3',label:'الدرس 3: الجمع والطرح'},
  {id:'lesson4',label:'الدرس 4: الأعداد السالبة'},
  {id:'lesson5',label:'الدرس 5: أنشئ جدولاً'}
 ];
 tabs.replaceChildren();
 defs.forEach(def=>{
  const btn=document.createElement('button');
  btn.type='button';
  const active=targetLesson===def.id;
  btn.className='report-lesson-tab'+(active?' is-active':'');
  btn.setAttribute('role','tab');
  btn.setAttribute('aria-selected',String(active));
  btn.dataset.reportLesson=def.id;
  btn.textContent=def.label;
  btn.addEventListener('click',()=>renderReportModal(def.id));
  tabs.append(btn);
 });
}
function renderReportModal(lessonOverride){
 const targetLesson=getReportLessonTarget(lessonOverride);
 ensureReportLessonTabs(targetLesson);
 const isL1=targetLesson==='lesson1';
 const statSmalls=document.querySelectorAll('#finish-dialog .finish-stats.four-cols > div > small');
 const skillDiagSection=document.querySelector('#finish-dialog .skill-diag');
 const skillDiagTitleSpan=document.querySelector('#finish-dialog .skill-diag h3 > span');
 const badgesSection=document.querySelector('#finish-dialog .report-badges-section');
 const finishInfBtn=$('finish-infinite');
 const certTitle=document.querySelector('#cert-card h3');
 if(finishInfBtn)finishInfBtn.hidden=!isL1;
 if(badgesSection)badgesSection.hidden=!isL1;

 let done=0,totalStations=12,pts=0,thirdStatVal=0,errorsCount=0;
 let report=[],hasET=false,verifiedScore=null,exitTargetNodeId=20,exitQCount=5;
 const names=['مبتدئ','مستكشف','خبير','بطل','أسطورة'];

 if(targetLesson==='lesson5'){
  totalStations=typeof L5_NODES!=='undefined'?L5_NODES.length:10;
  done=typeof getLesson5DoneCount==='function'?getLesson5DoneCount():0;
  pts=typeof getLesson5Points==='function'?getLesson5Points():0;
  report=computeLesson5SkillReport();
  for(let i=0;i<totalStations;i++){
   const rec=getLesson5NodeRecord(i);
   errorsCount+=Number(rec&&rec.errors?rec.errors:0);
  }
  report.forEach(item=>{thirdStatVal+=item.passedSteps;});
  const etDone=isLesson5NodeCompleted(9);
  const etRec=getLesson5NodeRecord(9);
  const etSkills=(etRec&&etRec.data&&etRec.data.skills)?etRec.data.skills:{};
  const qList=(typeof Lesson5RunnerDefs!=='undefined'&&Array.isArray(Lesson5RunnerDefs.L5_MASTERY_QUESTIONS))?Lesson5RunnerDefs.L5_MASTERY_QUESTIONS:[];
  exitQCount=qList.length||5;
  exitTargetNodeId=9;
  if(etDone){
   hasET=true;
   verifiedScore=100;
  }else if(Object.keys(etSkills).length>0&&qList.length>0){
   hasET=true;
   const rightCnt=qList.filter(q=>etSkills[q.skill]===true).length;
   verifiedScore=Math.round((rightCnt/qList.length)*100);
  }
  if(statSmalls.length>=4){
   statSmalls[0].textContent='نقاط الدرس 5';
   statSmalls[1].textContent='محطات الدرس';
   statSmalls[2].textContent='تمارين منجزة';
   statSmalls[3].textContent='محاولات تعلّمت منها';
  }
  if($('finish-eyebrow'))$('finish-eyebrow').textContent='تقرير الإنجاز وتشخيص مهارات الدرس الخامس';
  $('finish-title').textContent=(hasET&&verifiedScore===100)?'أنت بطل خطة أنشئ جدولاً (إتقان تام معتمد)!':done===totalStations?'أكملت مسار الدرس الخامس (بانتظار التحقق المستقل)':'تقرير الدرس 5: خطة حل المسألة: أنشئ جدولاً';
  $('finish-subtitle').textContent=(hasET&&verifiedScore===100)?'أثبتت إتقان جميع أهداف الدرس الخامس بنتيجة 100% في بطاقة الخروج المستقلة.':'تعرّف على تقدّمك في محطات الدرس الخامس وتشخيص مهارات إنشاء الجداول وحصر البدائل.';
  if(skillDiagTitleSpan)skillDiagTitleSpan.textContent='بطاقة تشخيص مهارات الدرس 5';
  if(skillDiagSection)skillDiagSection.setAttribute('aria-label','تشخيص مهارات الدرس الخامس');
  if(certTitle)certTitle.textContent='شهادة إتقان خطة حل المسألة (أنشئ جدولاً)';
 }else if(targetLesson==='lesson4'){
  totalStations=typeof L4_NODES!=='undefined'?L4_NODES.length:14;
  done=typeof getLesson4DoneCount==='function'?getLesson4DoneCount():0;
  pts=typeof getLesson4Points==='function'?getLesson4Points():0;
  report=computeLesson4SkillReport();
  for(let i=0;i<totalStations;i++){
   const rec=getLesson4NodeRecord(i);
   errorsCount+=Number(rec&&rec.errors?rec.errors:0);
  }
  report.forEach(item=>{thirdStatVal+=item.passedSteps;});
  const etDone=isLesson4NodeCompleted(13);
  const etRec=getLesson4NodeRecord(13);
  const etSkills=(etRec&&etRec.data&&etRec.data.skills)?etRec.data.skills:{};
  const qList=(typeof Lesson4RunnerDefs!=='undefined'&&Array.isArray(Lesson4RunnerDefs.L4_MASTERY_QUESTIONS))?Lesson4RunnerDefs.L4_MASTERY_QUESTIONS:[];
  exitQCount=qList.length||6;
  exitTargetNodeId=13;
  if(etDone){
   hasET=true;
   verifiedScore=100;
  }else if(Object.keys(etSkills).length>0&&qList.length>0){
   hasET=true;
   const rightCnt=qList.filter(q=>etSkills[q.skill]===true).length;
   verifiedScore=Math.round((rightCnt/qList.length)*100);
  }
  if(statSmalls.length>=4){
   statSmalls[0].textContent='نقاط الدرس 4';
   statSmalls[1].textContent='محطات الدرس';
   statSmalls[2].textContent='تمارين منجزة';
   statSmalls[3].textContent='محاولات تعلّمت منها';
  }
  if($('finish-eyebrow'))$('finish-eyebrow').textContent='تقرير الإنجاز وتشخيص مهارات الدرس الرابع';
  $('finish-title').textContent=(hasET&&verifiedScore===100)?'أنت بطل الأعداد السالبة (إتقان تام معتمد)!':done===totalStations?'أكملت مسار الدرس الرابع (بانتظار التحقق المستقل)':'تقرير الدرس 4: الأعداد السالبة';
  $('finish-subtitle').textContent=(hasET&&verifiedScore===100)?'أثبتت إتقان جميع أهداف الدرس الرابع بنتيجة 100% في بطاقة الخروج المستقلة.':'تعرّف على تقدّمك في محطات الدرس الرابع وتشخيص مهارات الأعداد السالبة وخط الأعداد والميزان.';
  if(skillDiagTitleSpan)skillDiagTitleSpan.textContent='بطاقة تشخيص مهارات الدرس 4';
  if(skillDiagSection)skillDiagSection.setAttribute('aria-label','تشخيص مهارات الدرس الرابع');
  if(certTitle)certTitle.textContent='شهادة إتقان الأعداد السالبة';
 }else if(targetLesson==='lesson3'){
  totalStations=typeof L3_NODES!=='undefined'?L3_NODES.length:16;
  done=typeof getLesson3DoneCount==='function'?getLesson3DoneCount():0;
  pts=typeof getLesson3Points==='function'?getLesson3Points():0;
  report=computeLesson3SkillReport();
  for(let i=0;i<totalStations;i++){
   const rec=getLesson3NodeRecord(i);
   errorsCount+=Number(rec&&rec.errors?rec.errors:0);
  }
  report.forEach(item=>{thirdStatVal+=item.passedSteps;});
  const etDone=isLesson3NodeCompleted(15);
  const etRec=getLesson3NodeRecord(15);
  const etSkills=(etRec&&etRec.data&&etRec.data.skills)?etRec.data.skills:{};
  const qList=(typeof Lesson3RunnerDefs!=='undefined'&&Array.isArray(Lesson3RunnerDefs.L3_MASTERY_QUESTIONS))?Lesson3RunnerDefs.L3_MASTERY_QUESTIONS:[];
  exitQCount=qList.length||8;
  exitTargetNodeId=15;
  if(etDone){
   hasET=true;
   verifiedScore=100;
  }else if(Object.keys(etSkills).length>0&&qList.length>0){
   hasET=true;
   const rightCnt=qList.filter(q=>etSkills[q.skill]===true).length;
   verifiedScore=Math.round((rightCnt/qList.length)*100);
  }
  if(statSmalls.length>=4){
   statSmalls[0].textContent='نقاط الدرس 3';
   statSmalls[1].textContent='محطات الدرس';
   statSmalls[2].textContent='تمارين منجزة';
   statSmalls[3].textContent='محاولات تعلّمت منها';
  }
  if($('finish-eyebrow'))$('finish-eyebrow').textContent='تقرير الإنجاز وتشخيص مهارات الدرس الثالث';
  $('finish-title').textContent=(hasET&&verifiedScore===100)?'أنت بطل الجمع والطرح (إتقان تام معتمد)!':done===totalStations?'أكملت مسار الدرس الثالث (بانتظار التحقق المستقل)':'تقرير الدرس 3: جمع الأعداد الكلية وطرحها';
  $('finish-subtitle').textContent=(hasET&&verifiedScore===100)?'أثبتت إتقان جميع أهداف الدرس الثالث بنتيجة 100% في بطاقة الخروج المستقلة.':'تعرّف على تقدّمك في محطات الدرس الثالث وتشخيص مهارات الجمع والطرح والتقدير.';
  if(skillDiagTitleSpan)skillDiagTitleSpan.textContent='بطاقة تشخيص مهارات الدرس 3';
  if(skillDiagSection)skillDiagSection.setAttribute('aria-label','تشخيص مهارات الدرس الثالث');
  if(certTitle)certTitle.textContent='شهادة إتقان جمع الأعداد وطرحها';
 }else if(targetLesson==='lesson2'){
  totalStations=typeof L2_NODES!=='undefined'?L2_NODES.length:15;
  done=typeof getLesson2DoneCount==='function'?getLesson2DoneCount():0;
  pts=typeof getLesson2Points==='function'?getLesson2Points():0;
  report=computeLesson2SkillReport();
  for(let i=0;i<totalStations;i++){
   const rec=getLesson2NodeRecord(i);
   errorsCount+=Number(rec&&rec.errors?rec.errors:0);
  }
  report.forEach(item=>{thirdStatVal+=item.passedSteps;});
  const l2=getLesson2State();
  const etDone=isLesson2NodeCompleted(14);
  const etObj=(l2&&l2.exitTicket)?l2.exitTicket:{};
  const qList=(typeof Lesson2RunnerDefs!=='undefined'&&Array.isArray(Lesson2RunnerDefs.L2_MASTERY_QUESTIONS))?Lesson2RunnerDefs.L2_MASTERY_QUESTIONS:[];
  exitQCount=qList.length||6;
  exitTargetNodeId=14;
  if(etDone){
   hasET=true;
   verifiedScore=100;
  }else if(etObj.status==='completed'&&typeof etObj.lastScore==='number'){
   hasET=true;
   verifiedScore=etObj.lastScore;
  }
  if(statSmalls.length>=4){
   statSmalls[0].textContent='نقاط الدرس 2';
   statSmalls[1].textContent='محطات الدرس';
   statSmalls[2].textContent='تمارين منجزة';
   statSmalls[3].textContent='محاولات تعلّمت منها';
  }
  if($('finish-eyebrow'))$('finish-eyebrow').textContent='تقرير الإنجاز وتشخيص مهارات الدرس الثاني';
  $('finish-title').textContent=(hasET&&verifiedScore===100)?'أنت بطل المقارنة والترتيب (إتقان تام معتمد)!':done===totalStations?'أكملت مسار الدرس الثاني (بانتظار التحقق المستقل)':'تقرير الدرس 2: مقارنة الأعداد وترتيبها';
  $('finish-subtitle').textContent=(hasET&&verifiedScore===100)?'أثبتت إتقان جميع أهداف الدرس الثاني بنتيجة 100% في بطاقة الخروج المستقلة.':'تعرّف على تقدّمك في محطات الدرس الثاني وتشخيص مهارات المقارنة والترتيب.';
  if(skillDiagTitleSpan)skillDiagTitleSpan.textContent='بطاقة تشخيص مهارات الدرس 2';
  if(skillDiagSection)skillDiagSection.setAttribute('aria-label','تشخيص مهارات الدرس الثاني');
  if(certTitle)certTitle.textContent='شهادة إتقان المقارنة والترتيب';
 }else{
  done=state.completed.size;
  totalStations=12;
  pts=totalPoints();
  report=computeSkillReport();
  thirdStatVal=state.infiniteStats.solved;
  errorsCount=state.errors;
  const et=state.exitTicket||createDefaultExitTicketState();
  hasET=Boolean(et&&et.status==='completed'&&et.lastScore!==null);
  verifiedScore=hasET?et.lastScore:null;
  exitTargetNodeId=20;
  exitQCount=5;
  if(statSmalls.length>=4){
   statSmalls[0].textContent='مجموع النقاط';
   statSmalls[1].textContent='مهام الكتاب';
   statSmalls[2].textContent='تحديات متجددة';
   statSmalls[3].textContent='محاولات تعلّمت منها';
  }
  if($('finish-eyebrow'))$('finish-eyebrow').textContent='تقرير الإنجاز وتشخيص المهارات';
  $('finish-title').textContent=(hasET&&verifiedScore===100)?'أنت أسطورة الملايين (إتقان تام معتمد)!':done===12?'أكملت مسار التدريب (بانتظار التحقق المستقل)':'تقرير رحلة الملايين وتشخيص المهارات';
  $('finish-subtitle').textContent=(hasET&&verifiedScore===100)?'أثبتت إتقان جميع أهداف الدرس بنتيجة 100% في التقييم المستقل واستحققت الشهادة المعتمدة.':'تعرّف على الفرق بين تقدّمك في التدريبات ومستوى إتقانك المستقل المعتمد.';
  if(skillDiagTitleSpan)skillDiagTitleSpan.textContent='بطاقة تشخيص المهارات';
  if(skillDiagSection)skillDiagSection.setAttribute('aria-label','تشخيص المهارات الأربع');
  if(certTitle)certTitle.textContent='شهادة أسطورة الملايين';
 }

 const level=done>=totalStations?4:Math.min(3,Math.floor((done/Math.max(1,totalStations))*4));
 $('final-score').textContent=ar(pts);
 $('final-done').innerHTML='<bdi dir="ltr">'+ar(done)+' / '+ar(totalStations)+'</bdi>';
 $('final-infinite').textContent=ar(thirdStatVal);
 $('final-errors').textContent=ar(errorsCount);

 const etBannerBox=$('finish-exit-ticket-banner');
 if(etBannerBox){
  etBannerBox.className='et-finish-callout '+(hasET?'completed':'not-attempted');
  etBannerBox.innerHTML='<div class="et-finish-callout-head">'+
   '<strong style="color:#0f5346">بطاقة خروج الدرس (التقييم المستقل المعتمد)</strong>'+
   (hasET?'<span class="skill-pill-status '+(verifiedScore===100?'status-mastered':verifiedScore>=60?'status-partial':'status-needs-practice')+'">النتيجة: '+ar(verifiedScore)+'% ('+(verifiedScore===100?'متقن':verifiedScore>=60?'قيد الإتقان':'يحتاج إلى تدريب')+')</span>':'<span class="skill-pill-status status-unassessed">لم يُقيّم بعد</span>')+
   '</div>'+
   '<p style="margin:4px 0 8px;font-size:12px;color:#55604e">'+
   (hasET?(verifiedScore===100?'أحسنت! أثبتت إتقانك لجميع أهداف الدرس بنتيجة 100% دون مساعدة.':'حققت '+ar(verifiedScore)+'% في بطاقة الخروج. يمكنك مراجعة المهارات غير المتقنة وإعادة التقييم بنماذج جديدة.'):'تنبيه تربوي: مشاهدة المحتوى أو إكمال التدريبات لا يمنح الإتقان التام تلقائيًا. يرجى تقديم بطاقة الخروج ('+ar(exitQCount)+' أسئلة مستقلة دون مساعدة) لاعتماد إتقانك.')+
   '</p>'+
   '<button type="button" class="et-start-btn" id="finish-open-exit-ticket">'+
   '<span class="btn-svg">'+getIconSVG('target')+'</span>'+
   '<span>'+(hasET?'عرض بطاقة الخروج أو إعادة التقييم ←':'بدء بطاقة الخروج المستقلة ('+ar(exitQCount)+' أسئلة) ←')+'</span>'+
   '</button>';
  const openEtBtn=etBannerBox.querySelector('#finish-open-exit-ticket');
  if(openEtBtn){
   openEtBtn.onclick=()=>{
    $('finish-dialog').close();
    if(targetLesson==='lesson5'&&typeof openLesson5Node==='function')openLesson5Node(exitTargetNodeId);
    else if(targetLesson==='lesson4'&&typeof openLesson4Node==='function')openLesson4Node(exitTargetNodeId);
    else if(targetLesson==='lesson3'&&typeof openLesson3Node==='function')openLesson3Node(exitTargetNodeId);
    else if(targetLesson==='lesson2'&&typeof openLesson2Node==='function')openLesson2Node(exitTargetNodeId);
    else openNode(exitTargetNodeId);
   };
  }
 }

 const progressPct=Math.round((done/Math.max(1,totalStations))*100);
 let totalIndep=0,totalAssist=0,totalPassed=0,totalStepsAll=0;
 report.forEach(item=>{
  totalIndep+=item.independentCount;
  totalAssist+=item.assistedCount;
  totalPassed+=item.passedSteps;
  totalStepsAll+=item.totalSteps;
 });
 const verifiedStatus=!hasET?'لم يُقيّم':(verifiedScore===100?'متقن':verifiedScore>=60?'قيد الإتقان':'يحتاج إلى تدريب');
 let triadBox=$('report-triad-dashboard');
 if(!triadBox){
  triadBox=document.createElement('div');
  triadBox.id='report-triad-dashboard';
  triadBox.className='mastery-triad-dashboard';
  if($('finish-exit-ticket-banner'))$('finish-exit-ticket-banner').after(triadBox);
 }
 triadBox.innerHTML='<div class="triad-card progress-card">'+
  '<div class="triad-card-head"><span class="triad-badge">1. التقدم التعليمي</span><strong class="triad-val num">'+ar(progressPct)+'%</strong></div>'+
  '<div class="triad-sub">أنجزت '+ar(done)+' من '+ar(totalStations)+' محطة تدريبية ('+ar(totalPassed)+'/'+ar(totalStepsAll)+' تمرين)</div>'+
  '<div class="triad-bar"><i style="width:'+progressPct+'%"></i></div>'+
  '</div>'+
  '<div class="triad-card practice-card">'+
  '<div class="triad-card-head"><span class="triad-badge">2. الأداء في التدريبات</span><div class="practice-chips"><span class="chip-indep">'+ar(totalIndep)+' مستقل</span><span class="chip-assist">'+ar(totalAssist)+' بمساعدة</span></div></div>'+
  '<div class="triad-sub">'+(totalAssist>0?'استعنت بالمساعدة في '+ar(totalAssist)+' تمرين؛ يلزم التحقق المستقل':'جميع التدريبات المنجزة حُلّت باستقلالية')+'</div>'+
  '<div class="triad-bar"><i style="width:'+(totalPassed?Math.round((totalIndep/totalPassed)*100):0)+'%"></i></div>'+
  '</div>'+
  '<div class="triad-card mastery-card '+(hasET?(verifiedScore===100?'is-mastered':'is-partial'):'is-unassessed')+'">'+
  '<div class="triad-card-head"><span class="triad-badge">3. الإتقان المستقل المعتمد</span><strong class="triad-val num">'+(hasET?ar(verifiedScore)+'%':'—')+'</strong></div>'+
  '<div class="triad-sub"><span class="skill-pill-status status-'+(hasET?(verifiedScore===100?'mastered':verifiedScore>=60?'partial':'needs-practice'):'unassessed')+'">'+verifiedStatus+'</span></div>'+
  '<div class="triad-sub-note">'+(hasET?(verifiedScore===100?'أثبتت إتقان جميع الأهداف بنجاح':'توجد مهارات بحاجة لمراجعة وإعادة اختبار'):'يتحدد حصراً باختبار بطاقة الخروج المستقل')+'</div>'+
  '</div>';
 const masteredList=report.filter(item=>item.assessed&&item.status==='متقن');
 const reviewList=report.filter(item=>item.assessed&&item.needsReview);
 let skillsSummaryBox=$('report-skills-summary');
 if(!skillsSummaryBox){
  skillsSummaryBox=document.createElement('div');
  skillsSummaryBox.id='report-skills-summary';
  skillsSummaryBox.className='report-skills-summary-box';
  triadBox.after(skillsSummaryBox);
 }
 if(hasET){
  skillsSummaryBox.innerHTML='<div class="skills-summary-col">'+
   '<strong style="color:#15803d;font-size:12px;display:flex;align-items:center;gap:4px"><span class="btn-svg" style="width:14px;height:14px">'+getIconSVG('check')+'</span>المهارات المتقنة ('+ar(masteredList.length)+'):</strong>'+
   '<div class="skills-tags-wrap">'+(masteredList.length>0?masteredList.map(s=>'<span class="skill-tag-chip mastered">'+s.name+'</span>').join(''):'<small style="color:#64748b">لا توجد مهارات متقنة بالكامل بعد</small>')+'</div>'+
   '</div>'+
   '<div class="skills-summary-col">'+
   '<strong style="color:#b45309;font-size:12px;display:flex;align-items:center;gap:4px"><span class="btn-svg" style="width:14px;height:14px">'+getIconSVG('alert')+'</span>المهارات التي تحتاج إلى مراجعة ('+ar(reviewList.length)+'):</strong>'+
   '<div class="skills-tags-wrap">'+(reviewList.length>0?reviewList.map(s=>'<span class="skill-tag-chip review">'+s.name+' ('+ar(s.verifiedScore)+'%)</span>').join(''):'<small style="color:#15803d">جميع المهارات متقنة 100%!</small>')+'</div>'+
   '</div>';
  skillsSummaryBox.hidden=false;
 }else{
  skillsSummaryBox.innerHTML='<div class="unassessed-notice"><span class="btn-svg" style="width:18px;height:18px;color:#d97706">'+getIconSVG('lightbulb')+'</span><span>لم يتم تقييم الإتقان المستقل بعد. حل التدريبات بمساعدة لا يمنح علامة «متقن». قدّم بطاقة الخروج لمعرفة تشخيص مهاراتك بدقة.</span></div>';
  skillsSummaryBox.hidden=false;
 }
 const bGrid=$('report-badges-grid');
 if(bGrid&&isL1){
  bGrid.replaceChildren();
  MILESTONE_BADGES.forEach(b=>{
   const unlocked=state.badges&&state.badges.has(b.id);
   const card=document.createElement('div');
   card.className='report-badge-card '+(unlocked?'unlocked':'locked');
   card.innerHTML='<div class="report-badge-card-icon">'+getIconSVG(b.icon)+'</div><strong>'+b.title+'</strong><small>'+(unlocked?'مكتمل بإتقان':b.tag)+'</small>';
   card.onclick=()=>showBadgeUnlockModal(b,!unlocked);
   bGrid.append(card);
  });
 }
 const rows=$('skill-rows');
 rows.replaceChildren();
 report.forEach(item=>{
  const row=document.createElement('div');
  row.className='skill-row';
  const statusCls=item.status==='متقن'?'mastered':item.status==='قيد الإتقان'?'partial':item.status==='يحتاج إلى تدريب'?'needs-practice':'unassessed';
  row.innerHTML='<div class="skill-info-block">'+
   '<div class="skill-name-row"><strong>'+item.name+'</strong><span class="skill-pill-status status-'+statusCls+'">'+item.status+(item.assessed?' · '+ar(item.verifiedScore)+'%':'')+'</span></div>'+
   '<div class="skill-sub-meta">التقدم في التدريب: '+ar(item.progressPct)+'% ('+ar(item.passedSteps)+'/'+ar(item.totalSteps)+' تمرين · '+ar(item.independentCount)+' مستقل · '+ar(item.assistedCount)+' بمساعدة)</div>'+
   '</div>'+
   '<div class="skill-bar '+(item.assessed?'':'bar-unassessed')+'" role="progressbar" aria-label="مستوى إتقان '+item.name.replace(/"/g,'')+'" aria-valuenow="'+(item.assessed?item.verifiedScore:0)+'" aria-valuemin="0" aria-valuemax="100">'+
   '<i style="width:'+(item.assessed?item.verifiedScore:0)+'%;background:'+(item.status==='متقن'?'#15803d':item.status==='قيد الإتقان'?'#d97706':item.status==='يحتاج إلى تدريب'?'#dc2626':'#94a3b8')+'"></i>'+
   '</div>'+
   '<button type="button" class="skill-train-btn" data-train-skill="'+item.key+'"><span class="btn-svg">'+getIconSVG(isL1?'infinity':'target')+'</span><span>تدريب</span></button>';
  row.querySelector('[data-train-skill]').addEventListener('click',()=>{
   $('finish-dialog').close();
   if(targetLesson==='lesson5'&&typeof openLesson5Node==='function')openLesson5Node(item.targetNodeId);
   else if(targetLesson==='lesson4'&&typeof openLesson4Node==='function')openLesson4Node(item.targetNodeId);
   else if(targetLesson==='lesson3'&&typeof openLesson3Node==='function')openLesson3Node(item.targetNodeId);
   else if(targetLesson==='lesson2'&&typeof openLesson2Node==='function')openLesson2Node(item.targetNodeId);
   else startInfiniteMode(item.key);
  });
  rows.append(row);
 });
 $('student-name-input').value=state.studentName||'';
 $('cert-student-name').textContent=(state.studentName&&state.studentName.trim())?state.studentName.trim():'بطل/بطلة رحلة الملايين';
 $('cert-score-badge').textContent='النقاط: '+ar(pts);
 $('cert-level-badge').textContent='المستوى: '+names[level];
 const certAch=$('cert-achievement');
 if(certAch){
  const lessonScope=targetLesson==='lesson5'
   ?'لخطة حل المسألة: أنشئ جدولاً'
   :(targetLesson==='lesson4'
   ?'للأعداد السالبة وتمثيلها على خط الأعداد'
   :(targetLesson==='lesson3'?'لجمع الأعداد الكلية وطرحها':(targetLesson==='lesson2'?'لمقارنة الأعداد وترتيبها':'للأعداد ضمن الملايين')));
  if(hasET&&verifiedScore===100){
   certAch.textContent='أثبت إتقانه التام لجميع أهداف الدرس ('+lessonScope+') بنسبة 100% في بطاقة خروج الدرس المعتمدة.';
  }else if(hasET){
   certAch.textContent='أنجز تدريبات الدرس ('+lessonScope+') وحقق نسبة إتقان معتمدة '+ar(verifiedScore)+'% في بطاقة خروج الدرس.';
  }else{
   certAch.textContent='أنجز تدريبات الدرس ('+lessonScope+') (بانتظار تقديم بطاقة الخروج لاعتماد الإتقان التام).';
  }
 }
 try{$('cert-date').textContent='التاريخ: '+new Intl.DateTimeFormat('ar-JO-u-nu-latn',{year:'numeric',month:'short',day:'numeric'}).format(new Date());}catch{$('cert-date').textContent='';}
}
function showFinish(lessonOverride){
 activeReportLesson=(lessonOverride==='lesson1'||lessonOverride==='lesson2'||lessonOverride==='lesson3'||lessonOverride==='lesson4'||lessonOverride==='lesson5')?lessonOverride:detectActiveLessonForReport();
 renderReportModal(activeReportLesson);
 if(!$('finish-dialog').open)$('finish-dialog').showModal();
 const target=getReportLessonTarget();
 const allDone=(target==='lesson5'&&typeof getLesson5DoneCount==='function'&&typeof L5_NODES!=='undefined')
  ?(getLesson5DoneCount()>=L5_NODES.length)
  :(target==='lesson4'&&typeof getLesson4DoneCount==='function'&&typeof L4_NODES!=='undefined')
  ?(getLesson4DoneCount()>=L4_NODES.length)
  :(target==='lesson3'&&typeof getLesson3DoneCount==='function'&&typeof L3_NODES!=='undefined')
   ?(getLesson3DoneCount()>=L3_NODES.length)
   :(target==='lesson2'&&typeof getLesson2DoneCount==='function'&&typeof L2_NODES!=='undefined')
    ?(getLesson2DoneCount()>=L2_NODES.length)
    :(state.completed.size===12);
 if(allDone)celebrate(50);
}
function unlockedTask(id){
 const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
 if(mNode)return isNodeUnlocked(mNode.id);
 return id===0||state.completed.has(id-1)||state.completed.has(id);
}
function renderMissionSteps(){const root=$('mission-steps');root.hidden=state.infiniteMode;if(state.infiniteMode)return;root.replaceChildren();for(let i=0;i<6;i++){const id=state.scene*6+i,b=document.createElement('button');b.type='button';b.dataset.task=id;const allowed=unlockedTask(id),done=state.completed.has(id);b.innerHTML=done?getIconSVG('check'):allowed?String(i+1):getIconSVG('lock');b.className=(id===activeId()?'current ':'')+(done?'complete':'');b.setAttribute('aria-label','المهمة '+(id+1)+': '+(done?'مكتملة':allowed?'متاحة':'مقفلة'));b.setAttribute('aria-disabled',String(!allowed));b.setAttribute('aria-current',id===activeId()?'step':'false');b.addEventListener('click',()=>{if(!allowed){const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);const prevTitle=mNode&&mNode.id>0?PATH_NODES[mNode.id-1].title:'المحطة السابقة';guide('هذه المهمة مقفلة! أكمل «'+prevTitle+'» أولًا.');return;}pauseRapid();const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);if(mNode)openNode(mNode.id);else{state.cursors[state.scene]=i;renderMission();saveState();}});root.append(b);}}
function renderSubProgress(){if(state.infiniteMode){$('sub-progress').hidden=false;$('sub-progress').innerHTML='<i class="'+(isPassed()?'done':'current')+'" aria-hidden="true"></i><span>تحدٍّ متجدد ذكي · كل مسألة تمنحك +10 نقاط</span>';return;}const r=record(),count=missions[activeId()].steps.length;$('sub-progress').hidden=count<=1;$('sub-progress').innerHTML=Array.from({length:count},(_,i)=>'<i class="'+(r.passed.has(i)?'done':i===r.index?'current':'')+'" aria-hidden="true"></i>').join('')+'<span>الجزء '+ar(r.index+1)+' من '+ar(count)+'</span>';}
function updateNext(){
 const b=$('task-next');
 if(state.infiniteMode){b.disabled=false;b.textContent=isPassed()?'التالي · مسألة متجددة جديدة ←':'تخطَّ إلى مسألة جديدة ↻';$('task-prev').disabled=false;$('task-prev').textContent='العودة لخريطة المسار';updateCoach();return;}
 const id=activeId(),r=record(),last=r.index===missions[id].steps.length-1;
 $('task-prev').disabled=false;
 $('task-prev').textContent=r.index>0?'→ الجزء السابق':'خريطة المسار';
 b.disabled=!isPassed();
 const mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
 const nextNode=mNode?PATH_NODES[mNode.id+1]:null;
 b.textContent=!isPassed()?'أنجز هذا الجزء أولًا ←':!last?'التالي · الجزء التالي ←':id===11?'شاهد إنجازك وشهادتك':nextNode?'المحطة التالية: '+nextNode.title+' ←':'التالي ←';
 updateCoach();
}
function createHint(level,type,text,revealsAnswer=false){
 return{
  level,type,text,revealsAnswer,isRevealing:revealsAnswer,
  toString(){return this.text;}
 };
}

function isHintRevealing(h){
 if(!h)return false;
 if(typeof h==='object'&&h.revealsAnswer!==undefined)return Boolean(h.revealsAnswer);
 const s=String(h);
 return(
  s.includes('الحل المباشر')||
  s.includes('الإجابة الصحيحة هي')||
  s.includes('الحد الخاطئ في القائمة هو')||
  s.includes('الحد المفقود في الفراغ هو')||
  s.includes('الصيغة اللفظية الكاملة هي')||
  s.includes('صل البطاقة')||
  s.includes('اكتب القيمة')||
  s.includes('اضبط عدّاد الأصفار')||
  s.includes('اضغط الخانة التي تحمل')||
  s.includes('اجعل رقم منزلة')
 );
}

function getProgressiveHints(s){
 let t1Text='',t2Text='',t3Text='';
 if(s.type==='target'||s.type==='zeros'){
  const d=digit(s.n,s.p),val=d*10**s.p;
  t1Text='تذكير بالمفهوم: حدّد دورة الرقم الملوّن أولاً (الآحاد، الألوف، أو الملايين) وفكّر في اسم بيته.';
  t2Text='طريقة التفكير: القيمة المنزلية تساوي الرقم مضروباً في قيمة منزلته (عدّ كم رقماً على يمينه).';
  t3Text=s.type==='target'?'مساعدة عملية: ابحث عن عمود «'+places[s.p]+'» في اللوحة واضغط الخانة التي تحوي الرقم '+d+'.':'مساعدة عملية: اضبط عدّاد الأصفار على '+ar(s.p)+' أصفار لتصبح القيمة '+fmt(val)+' ثم اضغط «تحقّق».';
 }else if(s.type==='wheels'){
  const cur=stepData().value??s.initial??0;let diffP=-1;for(let p=8;p>=0;p--)if(digit(cur,p)!==digit(s.n,p)){diffP=p;break;}
  t1Text='تذكير بالمفهوم: افحص العدد المطلوب دورة بدورة بدءاً من الملايين في أقصى اليسار.';
  t2Text='طريقة التفكير: قارن كل رقم في اللوحة بالرقم المقابل له في العدد المطلوب لمعرفة المنزلة المختلفة.';
  t3Text=diffP>=0?'مساعدة عملية: حرّك سهم منزلة «'+places[diffP]+'» ليصبح رقمها '+digit(s.n,diffP)+'.':'مساعدة عملية: تأكد من مطابقة جميع أرقام العدد '+fmt(s.n)+' ثم اضغط زر التحقق.';
 }else if(s.type==='verbal'){
  const m=Math.floor(s.n/1e6),k=Math.floor(s.n/1e3)%1000,o=s.n%1000;
  t1Text='تذكير بالمفهوم: في الصيغة اللفظية، نقرأ الدورات من اليسار إلى اليمين ونصل بينها بحرف الواو.';
  t2Text='طريقة التفكير: قسّم العدد إلى دورات: دورة الملايين أولاً، ثم الألوف، ثم الآحاد.';
  t3Text='مساعدة عملية: رتّب بطاقات الدورات بالترتيب التالي: «'+words(s.n)+'».';
 }else if(s.type==='choice'){
  t1Text='تذكير بالمفهوم: اقرأ المطلوب جيداً واستبعد الخيارات البعيدة تماماً عن المنزلة المطلوبة.';
  t2Text=s.p!==undefined?'طريقة التفكير: الرقم '+digit(s.n||0,s.p)+' في منزلة «'+places[s.p]+'»؛ احسب قيمته بضرب الرقم في قيمة المنزلة.':s.formula?'طريقة التفكير: طابق كل حد في الصيغة التحليلية مع منزلة رقمه في العدد.':'طريقة التفكير: ابدأ بالقراءة من دورة الملايين ثم الألوف ثم الآحاد.';
  t3Text='مساعدة عملية: الإجابة الصحيحة المطابقة للمنزلة هي: «'+s.options[s.correct]+'».';
 }else if(s.type==='match'){
  const d=stepData(),unmatched=s.pairs.findIndex((_,i)=>!(d.matches||[]).includes(i));const idx=unmatched>=0?unmatched:0,pair=s.pairs[idx];
  t1Text='تذكير بالمفهوم: كل منزلة على اليسار تعطي الرقم أصفاراً إضافية بحسب عدد المنازل على يمينه.';
  t2Text='طريقة التفكير: في البطاقة '+fmt(pair.n)+'، عدّ كم خانة على يمين الرقم الملوّن لتعرف عدد أصفاره.';
  t3Text='مساعدة عملية: صل البطاقة '+fmt(pair.n)+' بالقيمة المنزلية '+fmt(pair.value)+' (منزلة '+places[pair.p]+').';
 }else if(s.type==='fields'){
  const terms=expansion(s.n),d=stepData();const missingTerm=terms.find(t=>!(s.prefill&&s.prefill[t.p]!==undefined)&&parseNum(d.fields?.[t.p]||'')!==t.value)||terms[0];
  t1Text='تذكير بالمفهوم: الصيغة التحليلية هي كتابة العدد كمجموع لقيم أرقامه حسب منازلها، دون كتابة المنازل الصفرية.';
  t2Text='طريقة التفكير: في منزلة «'+places[missingTerm.p]+'» الرقم هو '+digit(s.n,missingTerm.p)+'؛ قيمته المنزلية تساوي الرقم متبوعاً بأصفار بعدد المنازل على يمينه.';
  t3Text='مساعدة عملية: في خانة «'+places[missingTerm.p]+'» اضبط الأصفار على '+ar(missingTerm.p)+' لتكتب القيمة '+fmt(missingTerm.value)+'.';
 }else if(s.type==='missing'){
  const p=s.p??4;
  t1Text='تذكير بالمفهوم: مجموع حدود الصيغة التحليلية يجب أن يُعيد بناء العدد الأصلي بالكامل.';
  t2Text='طريقة التفكير: قارن منازل العدد '+fmt(s.n)+' بالحدود المكتوبة؛ ابحث عن المنزلة التي لم يُكتب حدّها بعد.';
  t3Text='مساعدة عملية: المنزلة الناقصة هي «'+places[p]+'»، وقيمتها التحليلية هي '+fmt(s.answer)+'.';
 }else if(s.type==='error'){
  const badVal=s.terms[s.wrong];
  t1Text='تذكير بالمفهوم: كل حد يمثل قيمة رقم واحد فقط، وعدد أصفاره يعتمد بدقة على اسم منزلته.';
  t2Text='طريقة التفكير: عدّ أصفار كل حد وقارنها بموقع الرقم المناظر له في العدد الأصلي لاكتشاف الحد الشاذ.';
  t3Text='مساعدة عملية: الحد الخاطئ هو '+fmt(badVal)+'، والقيمة الصحيحة الواجب كتابتها هي '+fmt(s.correct)+'.';
 }else if(s.type==='rapid'){
  const run=stepData().run,q=run&&run.questions&&run.questions[run.round];
  t1Text='تذكير بالمفهوم: عدد أصفار القيمة المنزلية يطابق عدد الأرقام على يمين الرقم الملوّن.';
  t2Text=q?'طريقة التفكير: الرقم '+digit(q.n,q.p)+' يسكن في منزلة «'+places[q.p]+'».':'طريقة التفكير: انظر إلى عدد الخانات على يمين الرقم الملوّن.';
  t3Text=q?'مساعدة عملية: القيمة المنزلية الصحيحة هي '+fmt(q.value)+'.':'مساعدة عملية: اختر القيمة المطابقة لمنزلة الرقم.';
 }else{
  t1Text=s.hint||'تذكير بالمفهوم: اقرأ العدد وقسّمه إلى دورات ثلاثية من اليمين إلى اليسار.';
  t2Text='طريقة التفكير: القيمة المنزلية = الرقم × قيمة المنزلة التي يسكن فيها.';
  t3Text='مساعدة عملية: راجع منازل العدد خطوة بخطوة وطابق الإجابة الصحيحة.';
 }
 return [
  createHint(1,'guidance',t1Text,false),
  createHint(2,'scaffolding',t2Text,false),
  createHint(3,'reveal',t3Text,true)
 ];
}

function renderHintState(){
 const d=stepData(),tier=d.hintTier||0,isDone=isPassed();
 const unlocked=Boolean(isDone||d.helpUnlocked||tier>0);
 const hintArea=$('hint-button')?.closest('.hint-area');
 if(hintArea){
  hintArea.hidden=!unlocked;
 }
 if(!unlocked) return;

 const tierLabel=tier===0?'أحتاج مساعدة (1/3)':tier<3?'تلميح '+(tier===1?'إرشادي':'مساعدة عملية')+' ('+ar(tier+1)+'/3)':'إعادة المساعدة العملية (3/3)';
 $('hint-button').innerHTML='<span class="btn-svg">'+getIconSVG('lightbulb')+'</span><span>'+tierLabel+'</span>';
 $('hint-button').setAttribute('aria-expanded',String(tier>0));
 [...$('hint-dots').querySelectorAll('i')].forEach((dot,i)=>dot.classList.toggle('on',i<tier));
 if(tier===0){
  $('hint-text').hidden=true;$('hint-text').textContent='';
 }else{
  const hints=getProgressiveHints(currentStep());
  const h=hints[tier-1];
  const hText=typeof h==='object'?h.text:h;
  $('hint-text').hidden=false;
  const levelNames=['المرحلة 1: تلميح بسيط','المرحلة 2: توجيه وطريقة تفكير','المرحلة 3: مساعدة عملية'];
  $('hint-text').innerHTML='<span class="hint-badge hint-badge-'+tier+'">'+levelNames[tier-1]+'</span> '+esc(hText);
 }
 const s=currentStep();
 if(s.type==='fields'){
  const showChips=tier>=3||isDone;
  document.querySelectorAll('.quick-zero-chips').forEach(el=>{
   el.hidden=!showChips;
  });
 }else if(s.type==='missing'){
  const showOpts=tier>=3||isDone;
  document.querySelectorAll('.missing-options-section').forEach(el=>{
   el.hidden=!showOpts;
  });
 }
}
function generateVerificationStep(originalStep){
 const sk=stepSkill(originalStep);
 const type=originalStep.type;
 if(type==='target'){
  const n=randomLargeNumber(7,9,false);
  const p=randInt(1,String(n).length-1);
  const d=digit(n,p),val=d*10**p;
  return{skill:'place',type:'target',n,p,source:'مسألة تحقق مستقلة · تحديد المنزلة',prompt:'اضغط موقع الرقم '+d+' الملوّن في لوحة المنازل.',hint:'عدّ المنازل من اليمين (الآحاد) وصولًا إلى الرقم الملوّن.',reason:'أحسنت! الرقم '+d+' يقع في منزلة '+places[p]+' وقيمته '+fmt(val)+'.'};
 }
 if(type==='zeros'){
  const n=randomLargeNumber(7,9,false);
  const p=randInt(1,String(n).length-1);
  const d=digit(n,p),val=d*10**p;
  return{skill:'place',type:'zeros',n,p,source:'مسألة تحقق مستقلة · سر الأصفار',prompt:'كم صفرًا نُلحق بالرقم '+d+' الملوّن لنكتب قيمته المنزلية؟',hint:'عدّ الأرقام الواقعة على يمين الرقم الملوّن.',reason:'رائع! '+ar(p)+' أصفار تعطي القيمة '+fmt(val)+'.'};
 }
 if(type==='wheels'){
  const n=randomLargeNumber(7,9,true);
  return{...vault(n,words(n)+'.','مسألة تحقق مستقلة · الصيغة القياسية'),skill:'standard'};
 }
 if(type==='verbal'){
  const n=randomLargeNumber(7,9,true);
  return verbal(n,'مسألة تحقق مستقلة · الصيغة اللفظية');
 }
 if(type==='fields'){
  let n=0;const activePlaces=[0,randInt(1,2),randInt(3,4),5,randInt(6,7)];activePlaces.forEach(p=>{n+=randInt(1,9)*10**p;});
  return{...fields(n,'مسألة تحقق مستقلة · الصيغة التحليلية'),skill:'expanded'};
 }
 if(type==='missing'){
  let n=0;const activePlaces=[0,randInt(1,2),randInt(3,4),5,randInt(6,7)];activePlaces.forEach(p=>{n+=randInt(1,9)*10**p;});
  const terms=expansion(n);
  const pickIdx=randInt(1,terms.length-2),missingTerm=terms[pickIdx];
  const before=terms.slice(0,pickIdx).map(t=>fmt(t.value)).join(' + ')+' +';
  const after='+ '+terms.slice(pickIdx+1).map(t=>fmt(t.value)).join(' + ');
  return{skill:'expanded',type:'missing',n,p:missingTerm.p,answer:missingTerm.value,before,after,source:'مسألة تحقق مستقلة · إكمال الحد المفقود',prompt:'اكتب الحد المفقود لإكمال الصيغة التحليلية للعدد '+fmt(n)+':',hint:'قارن حدود المجموع بمنازل العدد المعطى لتكتشف المنزلة الناقصة.'};
 }
 if(type==='error'){
  let n=0;const activePlaces=[0,randInt(1,2),randInt(3,4),5,randInt(6,7)];activePlaces.forEach(p=>{n+=randInt(1,9)*10**p;});
  const terms=expansion(n);
  const wrongIdx=randInt(1,terms.length-2);
  const wrongPlace=terms[wrongIdx].p;
  const wrongShift=wrongPlace>1?wrongPlace-1:wrongPlace+1;
  const wrongVal=digit(n,wrongPlace)*10**wrongShift;
  const termsList=terms.map((t,i)=>i===wrongIdx?wrongVal:t.value);
  return{skill:'expanded',type:'error',n,p:wrongPlace,wrong:wrongIdx,correct:terms[wrongIdx].value,terms:termsList,source:'مسألة تحقق مستقلة · اكتشف الخطأ',prompt:'اكتشف الحد الخاطئ في الصيغة التحليلية للعدد '+fmt(n)+' وصحّحه:',hint:'عدّ الأصفار في كل حد وتأكد من مطابقتها لمنزلة كل رقم.'};
 }
 return generateInfiniteStep(sk);
}

function launchVerificationChallenge(originalStep){
 const baseStep=originalStep||missions[activeId()].steps[record().index];
 const newStep=generateVerificationStep(baseStep);
 const r=record();
 const sIdx=r.index;
 r.data[sIdx]={
  hintLevel:0,
  hintTier:0,
  usedHint:false,
  revealedAnswer:false,
  usedHelp:false,
  assisted:false,
  independent:true,
  status:'none',
  isVerificationChallenge:true,
  originalStep:baseStep,
  verificationStep:newStep
 };
 r.passed.delete(sIdx);
 r.assistedSteps?.delete?.(sIdx);
 renderMission();
 guide('بدأت مسألة تحقق جديدة بأرقام مختلفة لقياس مهارتك بشكل مستقل تماماً. أجب دون مساعدة لإثبات إتقانك!',5500);
}

function renderAssistedNoticeCard(){
 const existing=$('mission-content')?.querySelector('#assisted-notice-card');
 if(existing) existing.remove();
 if(!isPassed()) return;
 const d=stepData(), r=record();
 const isAssisted=Boolean(d.revealedAnswer||d.usedHelp||d.assisted||d.status==='assisted'||(r.assistedSteps&&r.assistedSteps.has(r.index)));
 if(!isAssisted) return;

 const notice=document.createElement('div');
 notice.className='assisted-notice-card';
 notice.id='assisted-notice-card';
 notice.innerHTML='<div class="assisted-notice-head"><div class="assisted-notice-icon">'+getIconSVG('lightbulb')+'</div><div class="assisted-notice-content"><div class="assisted-notice-title">أكملت التدريب بمساعدة</div><div class="assisted-notice-body">أحسنت في إكمال التدريب! تم تسجيل هذه المحاولة كحل بمساعدة. يمكنك الانتقال للتدريب التالي، أو خوض مسألة تحقق جديدة بأرقام مختلفة لإثبات إتقانك المستقل.</div></div></div><button type="button" class="assisted-verify-btn" id="assisted-verify-btn"><span class="btn-svg">'+getIconSVG('sparkle')+'</span><span>جرّب مسألة تحقق جديدة لإثبات الإتقان المستقل</span></button>';
 notice.querySelector('#assisted-verify-btn').addEventListener('click',()=>{
  launchVerificationChallenge(d.originalStep||missions[activeId()].steps[r.index]);
 });
 $('mission-content')?.append(notice);
}
function triggerHintHighlight(s){
 const root=$('mission-content');
 if(s.type==='target'){const cell=root.querySelector('[data-place="'+s.p+'"]');cell?.classList.remove('target-glow');void cell?.offsetWidth;cell?.classList.add('target-glow');}
 else if(s.type==='wheels'){const cur=stepData().value??s.initial??0;for(let p=8;p>=0;p--)if(digit(cur,p)!==digit(s.n,p)){const w=$('wheel-'+p);w?.classList.remove('target-glow');void w?.offsetWidth;w?.classList.add('target-glow');break;}}
 else if(s.type==='error'){const b=root.querySelector('[data-error-term="'+s.wrong+'"]');b?.classList.remove('target-glow');void b?.offsetWidth;b?.classList.add('target-glow');}
}
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function randomLargeNumber(minDigits=7,maxDigits=9,allowZeros=true){
 const len=randInt(minDigits,maxDigits);let n=0;
 for(let p=len-1;p>=0;p--){const d=p===len-1?randInt(1,9):(allowZeros&&Math.random()<0.28?0:randInt(1,9));n+=d*10**p;}
 return n;
}
function generateInfiniteStep(skillFilter){
 let skill=skillFilter;
 if(skill==='all'){
  const rep=computeSkillReport().sort((a,b)=>a.score-b.score);
  skill=Math.random()<0.55?rep[0].key:['place','verbal','standard','expanded'][randInt(0,3)];
 }
 if(skill==='place'){
  const sub=['target','zeros','choice','match'][randInt(0,3)];
  const n=randomLargeNumber(7,9,false),p=randInt(1,String(n).length-1),d=digit(n,p),val=d*10**p;
  if(sub==='target')return{skill:'place',type:'target',n,p,source:'تحدٍّ متجدد · تحديد المنزلة',prompt:'اضغط موقع الرقم '+d+' الملوّن في لوحة المنازل.',hint:'عدّ المنازل من اليمين (الآحاد) وصولًا إلى الرقم الملوّن.',reason:'أحسنت! الرقم '+d+' يقع في منزلة '+places[p]+' وقيمته '+fmt(val)+'.'};
  if(sub==='zeros')return{skill:'place',type:'zeros',n,p,source:'تحدٍّ متجدد · سر الأصفار',prompt:'كم صفرًا نُلحق بالرقم '+d+' الملوّن لنكتب قيمته المنزلية؟',hint:'عدّ الأرقام الواقعة على يمين الرقم الملوّن.',reason:'رائع! '+ar(p)+' أصفار تعطي القيمة '+fmt(val)+'.'};
  if(sub==='match'){
   const usedP=new Set();const pairs=[];
   while(pairs.length<3){const pp=randInt(1,7);if(usedP.has(pp))continue;usedP.add(pp);const mn=randomLargeNumber(Math.max(7,pp+1),9,false);pairs.push({n:mn,p:pp,value:digit(mn,pp)*10**pp});}
   return{skill:'place',type:'match',source:'تحدٍّ متجدد · توصيل القيم',prompt:'صل كل عدد بقيمة الرقم الملوّن فيه.',pairs,hint:'عدّ الأرقام على يمين الرقم الملوّن في كل بطاقة.'};
  }
  const pAlt1=p>0?p-1:p+2,pAlt2=p<8?p+1:p-2;
  const opts=[val,d*10**pAlt1,d*10**pAlt2];
  return{...mc('ما القيمة المنزلية للرقم الملوّن في العدد؟',opts,0,'الرقم '+d+' في '+places[p]+'؛ قيمته '+fmt(val)+'.',{n,p,source:'تحدٍّ متجدد · القيمة المنزلية',hint:'احسب عدد المنازل على يمين الرقم الملوّن.'}),skill:'place'};
 }
 if(skill==='verbal'){
  const n=randomLargeNumber(7,9,true);
  return verbal(n,'تحدٍّ متجدد · الصيغة اللفظية');
 }
 if(skill==='standard'){
  const n=randomLargeNumber(7,9,true);
  return{...vault(n,words(n)+'.','تحدٍّ متجدد · خزنة الصيغة القياسية'),skill:'standard'};
 }
 const sub=['fields','missing','error'][randInt(0,2)];
 let n=0;const activePlaces=[0,randInt(1,2),randInt(3,4),5,randInt(6,7)];activePlaces.forEach(p=>{n+=randInt(1,9)*10**p;});
 const terms=expansion(n);
 if(sub==='fields')return{...fields(n,'تحدٍّ متجدد · الصيغة التحليلية'),skill:'expanded'};
 if(sub==='missing'){
  const pickIdx=randInt(1,terms.length-2),missingTerm=terms[pickIdx];
  const before=terms.slice(0,pickIdx).map(t=>fmt(t.value)).join(' + ')+' +';
  const after='+ '+terms.slice(pickIdx+1).map(t=>fmt(t.value)).join(' + ');
  return{skill:'expanded',type:'missing',source:'تحدٍّ متجدد · الحد المفقود',n,p:missingTerm.p,answer:missingTerm.value,before,after,prompt:'ما العدد المفقود في الصيغة التحليلية للعدد '+fmt(n)+'؟',hint:'ابحث عن قيمة الرقم '+digit(n,missingTerm.p)+' في منزلة '+places[missingTerm.p]+'.'};
 }
 const wrongIdx=randInt(0,terms.length-1),targetTerm=terms[wrongIdx];
 const wrongVal=targetTerm.p>=2?digit(n,targetTerm.p)*10**(targetTerm.p-1):digit(n,targetTerm.p)*10**(targetTerm.p+1);
 const errTerms=terms.map((t,i)=>i===wrongIdx?wrongVal:t.value);
 return{skill:'expanded',type:'error',source:'تحدٍّ متجدد · اكتشف الخطأ',n,p:targetTerm.p,terms:errTerms,wrong:wrongIdx,correct:targetTerm.value,prompt:'كُتبت الصيغة التحليلية الآتية للعدد '+fmt(n)+'. اضغط الحد الخاطئ ثم صحّحه.',hint:'راقب الرقم '+digit(n,targetTerm.p)+' في منزلة '+places[targetTerm.p]+' وعدّ أصفاره.'};
}
function renderInfiniteBar(){
 const bar=$('infinite-bar'),btn=$('infinite-toggle');if(!bar||!btn)return;
 bar.hidden=!state.infiniteMode;
 btn.classList.toggle('active',state.infiniteMode);
 btn.setAttribute('aria-pressed',String(state.infiniteMode));
 $('infinite-stats').innerHTML='<span class="btn-svg">'+getIconSVG('flame','gold')+'</span>سلسلة: '+ar(state.infiniteStats.streak)+' · <span class="btn-svg">'+getIconSVG('check')+'</span>حُلّت: '+ar(state.infiniteStats.solved);
 document.querySelectorAll('#infinite-skills button').forEach(b=>b.classList.toggle('active',b.dataset.skill===state.infiniteSkill));
}
function startInfiniteMode(skill){
 pauseRapid();stopStory();
 if(skill)state.infiniteSkill=skill;
 state.infiniteMode=true;
 state.viewMode='mission';
 state.infiniteStep=generateInfiniteStep(state.infiniteSkill);
 state.infiniteRecord={index:0,passed:new Set(),data:{},lastMessage:''};
 if(typeof L1Runner!=='undefined'){L1Runner.openInfinite(state.infiniteSkill);return;}
 updateViewDom();renderInfiniteBar();renderMission();renderStationTopbar();
}
function exitInfiniteMode(){
 state.infiniteMode=false;renderInfiniteBar();showDuolingoMap();
}

/* وحدة الصوت والتسجيل للأنشطة الإنتاجية */
const BookAudio = {
 mediaRecorder: null,
 audioChunks: [],
 recordedBlob: null,
 recordedUrl: null,
 currentStream: null,
 recognition: null,
 isRecording: false,
 timerInterval: null,
 audioCtx: null,
 analyser: null,
 animFrameId: null,
 mimeType: 'audio/webm',

 getSupportedMimeType(){
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/wav'];
  for (const t of types) {
   if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return 'audio/webm';
 },

 initRecognition(onTranscript, onError){
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) return null;
  try {
   const rec = new SpeechRec();
   rec.lang = 'ar-SA';
   rec.interimResults = true;
   rec.continuous = true;
   rec.maxAlternatives = 1;
   rec.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = 0; i < e.results.length; ++i) {
     if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
     else interim += e.results[i][0].transcript;
    }
    const full = (final + interim).trim();
    if (full && onTranscript) onTranscript(full, !!final);
   };
   rec.onerror = (e) => {
    if (onError && e.error !== 'no-speech') onError(e);
   };
   return rec;
  } catch (err) {
   return null;
  }
 },

 async startRecording(onUpdateSeconds, onTranscript, onError, onVolumeChange){
  this.stopPlayback();
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
   if (onError) onError('الميكروفون غير متاح أو مقفل في المتصفح. يمكنك كتابة قراءتك.');
   return false;
  }
  try {
   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
   this.currentStream = stream;
   this.audioChunks = [];
   this.mimeType = this.getSupportedMimeType();

   try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
     this.audioCtx = new AudioContextClass();
     const source = this.audioCtx.createMediaStreamSource(stream);
     this.analyser = this.audioCtx.createAnalyser();
     this.analyser.fftSize = 256;
     source.connect(this.analyser);
     const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

     const checkVol = () => {
      if (!this.isRecording || !this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const avg = sum / dataArray.length;
      const volPercent = Math.min(100, Math.round((avg / 128) * 100));
      if (onVolumeChange) onVolumeChange(volPercent);
      this.animFrameId = requestAnimationFrame(checkVol);
     };
     this.animFrameId = requestAnimationFrame(checkVol);
    }
   } catch (e) {
    console.warn('AudioContext analysis not available:', e);
   }

   const recorder = new MediaRecorder(stream, { mimeType: this.mimeType });
   recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) this.audioChunks.push(e.data);
   };
   recorder.start(100);
   this.mediaRecorder = recorder;
   this.isRecording = true;

   this.recognition = this.initRecognition(onTranscript, onError);
   if (this.recognition) {
    try { this.recognition.start(); } catch (e) {}
   }

   let sec = 0;
   if (this.timerInterval) clearInterval(this.timerInterval);
   this.timerInterval = setInterval(() => {
    sec++;
    if (onUpdateSeconds) onUpdateSeconds(sec);
   }, 1000);
   return true;
  } catch (err) {
   console.error('Mic error:', err);
   if (onError) onError('تعذر تشغيل الميكروفون (' + (err.name || 'خطأ') + '). يمكنك كتابة قراءتك أو تفعيل الميكروفون من إعدادات المتصفح.');
   return false;
  }
 },

 async stopRecording(){
  this.isRecording = false;
  if (this.timerInterval) {
   clearInterval(this.timerInterval);
   this.timerInterval = null;
  }
  if (this.animFrameId) {
   cancelAnimationFrame(this.animFrameId);
   this.animFrameId = null;
  }
  if (this.audioCtx) {
   try { await this.audioCtx.close(); } catch (e) {}
   this.audioCtx = null;
   this.analyser = null;
  }
  if (this.recognition) {
   try { this.recognition.stop(); } catch (e) {}
   this.recognition = null;
  }

  return new Promise((resolve) => {
   if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
    if (this.currentStream) {
     this.currentStream.getTracks().forEach(t => t.stop());
     this.currentStream = null;
    }
    resolve(this.recordedBlob);
    return;
   }

   this.mediaRecorder.onstop = () => {
    this.recordedBlob = new Blob(this.audioChunks, { type: this.mimeType });
    if (this.recordedUrl) URL.revokeObjectURL(this.recordedUrl);
    this.recordedUrl = URL.createObjectURL(this.recordedBlob);
    if (this.currentStream) {
     this.currentStream.getTracks().forEach(t => t.stop());
     this.currentStream = null;
    }
    resolve(this.recordedBlob);
   };

   try {
    this.mediaRecorder.stop();
   } catch (e) {
    resolve(null);
   }
  });
 },

 stopPlayback(){
  document.querySelectorAll('.produce-audio-player').forEach(a => {
   try { a.pause(); a.currentTime = 0; } catch (e) {}
  });
 },

 reset(){
  this.stopRecording();
  this.stopPlayback();
  if (this.recordedUrl) {
   URL.revokeObjectURL(this.recordedUrl);
   this.recordedUrl = null;
  }
  this.recordedBlob = null;
  this.audioChunks = [];
 }
};

function blobToBase64(blob){
 return new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => {
   const res = reader.result;
   if (typeof res === 'string') {
    const comma = res.indexOf(',');
    resolve(comma >= 0 ? res.slice(comma + 1) : res);
   } else {
    resolve('');
   }
  };
  reader.onerror = reject;
  reader.readAsDataURL(blob);
 });
}

/* دوال التقييم اللغوي والرياضي المحلي والأذكى */
function getGeminiApiKey(){
 const fromVar=(typeof apiKey!=='undefined'?apiKey:'')||'';
 const fromK1=localStorage.getItem('millions_gemini_api_key_v1')||'';
 const fromK2=localStorage.getItem('gemini_api_key')||'';
 return (fromVar||fromK1||fromK2).trim();
}
function setGeminiApiKey(val){
 const clean=(val||'').trim();
 if(typeof apiKey!=='undefined')apiKey=clean;
 try{
  if(clean){
   localStorage.setItem('millions_gemini_api_key_v1',clean);
   localStorage.setItem('gemini_api_key',clean);
  }else{
   localStorage.removeItem('millions_gemini_api_key_v1');
   localStorage.removeItem('gemini_api_key');
  }
 }catch{}
 return clean;
}

function normalizeArabicEvaluationText(text){
 if(!text)return'';
 let str=String(text);
 str=str.replace(/[ً-ٰٟـ]/g,'');
 str=str.replace(/[إأآا]/g,'ا');
 str=str.replace(/[ة]/g,'ه');
 str=str.replace(/[ى]/g,'ي');
 str=str.replace(/[,،؛.\-_'"?!]/g,' ');
 str=str.replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632));
 str=str.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
 str=str.replace(/م[ا]?ئ?[هة]|ميه/g,'مئه');
 str=str.replace(/م[ا]?ئ?ت(ان|ين|ا)/g,'مئتان');
 str=str.replace(/(عشر|ثلاث|اربع|خمس|ست|سبع|ثمان|تسع)ين/g,'$1ون');
 str=str.replace(/(ثلاث|اربع|خمس|ست|سبع|ثماني?|تسع)ه/g,'$1');
 str=str.replace(/(^|\s)الفا($|\s)/g,'$1الف$2');
 str=str.replace(/(^|\s)مليونا($|\s)/g,'$1مليون$2');
 return str.replace(/\s+/g,' ').trim().toLowerCase();
}

function evaluateLocalNumberReading(rawInput,targetNumber){
 const norm=normalizeArabicEvaluationText(rawInput);
 if(!norm)return{status:'empty',feedback:'يرجى إدخال قراءتك للعدد أولاً.'};

 const targetWords=normalizeArabicEvaluationText(typeof words==='function'?words(targetNumber):'');
 if(targetWords&&norm===targetWords){
  return{status:'correct',feedback:'قراءة ممتازة ونموذجية مطابقة للفصحى تماماً! أحسنت يا بطل الملايين.'};
 }

 const m=Math.floor(targetNumber/1e6);
 const k=Math.floor(targetNumber/1e3)%1000;
 const o=targetNumber%1000;

 // فحص خطأ ذكر الألوف عند وجود دورة صفرية (مثل 25,000,084)
 if(k===0){
  const mentionsNonZeroThousands=/(خمس|ست|سبع|ثمان|تسع|عشر|مئه|[1-9])\s*(الف|الاف)/.test(norm)&&!/صفر\s*(الف|الاف)/.test(norm);
  if(mentionsNonZeroThousands){
   return{status:'error',feedback:'لاحظ أن دورة الألوف كلها أصفار (000)، لذلك لا نذكر الألوف في القراءة وننتقل مباشرة إلى دورة الآحاد.'};
  }
 }

 function matchPeriod(val,unitType){
  if(val===0)return true;
  const standardWord=normalizeArabicEvaluationText(
   unitType==='m'?groupWords(val,'مليون','مليونان','ملايين')
   :unitType==='k'?groupWords(val,'ألف','ألفان','آلاف')
   :below1000(val)
  );
  if(norm.includes(standardWord))return true;

  if(unitType==='m'&&new RegExp('(^|\\s|و)'+val+'\\s*(مليون|ملايين)($|\\s)').test(norm))return true;
  if(unitType==='k'&&new RegExp('(^|\\s|و)'+val+'\\s*(الف|الاف)($|\\s)').test(norm))return true;
  if(unitType==='o'&&new RegExp('(^|\\s|و)'+val+'($|\\s)').test(norm))return true;

  const keywords=standardWord.split(/\s+/).filter(w=>w!=='و');
  if(keywords.length>0&&keywords.every(kw=>norm.includes(kw)))return true;
  return false;
 }

 const hasM=m===0||matchPeriod(m,'m');
 const hasK=k===0||matchPeriod(k,'k');
 const hasO=o===0||matchPeriod(o,'o');

 if(hasM&&hasK&&hasO){
  return{status:'correct',feedback:'قراءة ممتازة ودقيقة للعدد! قرأت دورات العدد بالترتيب السليم وبإتقان.'};
 }

 if(!hasM){
  return{status:'partial',feedback:'ابدأ بقراءة دورة الملايين أولاً على اليسار ('+groupWords(m,'مليون','مليونان','ملايين')+').'};
 }
 if(!hasK){
  return{status:'partial',feedback:'اقرأ دورة الألوف في الوسط بدقة ('+groupWords(k,'ألف','ألفان','آلاف')+').'};
 }
 return{status:'partial',feedback:'أكمل قراءة دورة الآحاد في نهاية العدد ('+below1000(o)+').'};
}

function evaluateLocalJustification(rawInput,targetDigit=9){
 const norm=normalizeArabicEvaluationText(rawInput);
 if(!norm)return{status:'empty',feedback:'يرجى كتابة تبريرك الرياضي أولاً.'};

 const negationPattern=/(ليس|ليست|غير|لا يقع|لا تقع)\s+(في\s+)?(احاد\s+)?الالوف/;
 if(negationPattern.test(norm)){
  return{status:'incorrect',feedback:'الرقم يقع بالفعل في آحاد الألوف في العددين. تتبع منازل العددين بدقة.'};
 }

 if(/العدد(ين|ان)\s+متساوي(ان|ين)/.test(norm)||/متساوي(ان|ين)\s+في\s+كل\s+شيء/.test(norm)){
  return{status:'misconception',feedback:'انتبه يا بطل: العددان مختلفان في الطول والقيمة الكلية، بينما قيمة الرقم 9 فقط هي المتساوية. لماذا تتساوى قيمته المنزلية؟'};
 }

 const isSameDigitOnly=/(لانه|لانها)\s+(نفس\s+الرقم|الرقم\s+نفسه|الرقم\s+9)/.test(norm)||/كلاهما\s+9/.test(norm);
 const mentionsPlace=/(احاد\s+)?الالوف|منزله|خانه|خانة|بيوت/.test(norm);
 const mentionsZerosOrDigitsCount=/(3|ثلاث)\s+(خانات|منازل|ارقام|اصفار)/.test(norm);

 if(isSameDigitOnly&&!mentionsPlace&&!mentionsZerosOrDigitsCount){
  return{status:'insufficient',feedback:'تبرير غير كافٍ يا بطل: الرقم نفسه تتغير قيمته تماماً إذا تغير مكانه (مثل 90 و 9,000). ما اسم المنزلة المشتركة للرقم 9 في العددين؟'};
 }

 const mentions9000=/9000|9\s*000|تسع\s+الاف/.test(norm);
 if(mentions9000&&!mentionsPlace&&!mentionsZerosOrDigitsCount){
  return{status:'incomplete',feedback:'نتيجة صحيحة (قيمته 9,000)! ولكن ما سبب ذلك؟ في أي منزلة يقع الرقم 9 في كلا العددين؟'};
 }

 const mentionsWrongPlace=/عشرات\s+الالوف|مئات\s+الالوف|عشرات|مئات|ملايين/.test(norm);
 if(!mentionsWrongPlace&&(mentionsPlace||mentionsZerosOrDigitsCount)){
  return{status:'correct',feedback:'أحسنت! تبرير رياضي دقيق: يقع الرقم 9 في منزلة آحاد الألوف في العددين على بعد 3 خانات من اليمين، لذلك قيمته 9,000 في كليهما بغض النظر عن طول العدد.'};
 }

 return{status:'unclear',feedback:'وضّح إجابتك أكثر: اذكر اسم المنزلة التي يقع فيها الرقم 9 في كلا العددين.'};
}
async function evaluateSemanticWithGemini(prompt, systemInstruction){
 const key = ((typeof apiKey !== 'undefined' ? apiKey : '') || localStorage.getItem('gemini_api_key') || '').trim();
 if (!key) return null;
 try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key);
  const resp = await fetch(endpoint, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   signal: controller.signal,
   body: JSON.stringify({
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 250, temperature: 0.2 }
   })
  });
  clearTimeout(timeoutId);
  if (!resp.ok) return null;
  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  return parsed;
 } catch (err) {
  console.warn('Semantic Gemini eval error:', err);
  return null;
 }
}

async function evaluateAudioWithGemini(audioBlob, targetVal, mode = 'reading'){
 const key = ((typeof apiKey !== 'undefined' ? apiKey : '') || localStorage.getItem('gemini_api_key') || '').trim();
 if (!key || !audioBlob) return null;
 try {
  const base64Data = await blobToBase64(audioBlob);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + encodeURIComponent(key);

  const prompt = mode === 'reading'
   ? `أنت معلم رياضيات ذكي للصف الخامس الابتدائي. استمع جيدًا لهذا التسجيل الصوتي للطفل.
العدد المطلوب قراءته باللغة العربية الفصحى هو: ${targetVal} (${typeof words === 'function' ? words(targetVal) : ''}).
1. استخرج النص الدقيق لما نطق به الطفل باللغة العربية الفصحى واكتبه في transcript.
2. قيّم صحة القراءة الرياضية:
   - status: "correct" (إذا كانت القراءة صحيحة ومطابقة للعدد)، أو "partial" (إذا أخطأ في دورة أو نطق جزءاً)، أو "error" (إذا كانت خاطئة تماماً).
   - feedback: جملة مشجعة ومختصرة باللغة العربية الفصحى بدون أي رموز إيموجي نهائياً توضح للطفل ما نطقه وتقييمه.
أجب بصيغة JSON فقط: {"transcript": "...", "status": "correct", "feedback": "..."}`
   : `أنت معلم رياضيات ذكي للصف الخامس الابتدائي. استمع لتسجيل الطفل لتبرير مسألة السؤال 17: هل تتساوى القيمة المنزلية للرقم 9 في العددين 9,605 و 149,605 ولماذا؟
1. استخرج النص الدقيق لما نطق به الطفل واكتبه في transcript.
2. قيّم تبريره الرياضي:
   - status: "correct" (إذا بيّن أنه في آحاد الألوف في العددين أو 3 خانات لليمين)، أو "incomplete" (إذا ذكر 9000 فقط دون بيان المنزلة)، أو "insufficient" (إذا قال فقط لأنه نفس الرقم)، أو "misconception" (إذا قال العددان متساويان).
   - feedback: جملة عربية مشجعة وموجهة بدون أي رموز إيموجي نهائياً.
أجب بصيغة JSON فقط: {"transcript": "...", "status": "correct", "feedback": "..."}`;

  const resp = await fetch(endpoint, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   signal: controller.signal,
   body: JSON.stringify({
    contents: [{
     role: 'user',
     parts: [
      { inline_data: { mime_type: audioBlob.type || 'audio/webm', data: base64Data } },
      { text: prompt }
     ]
    }],
    generationConfig: { maxOutputTokens: 350, temperature: 0.1 }
   })
  });
  clearTimeout(timeoutId);

  if (!resp.ok) {
   console.warn('Gemini Audio API returned HTTP', resp.status);
   return null;
  }
  const data = await resp.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanJson = rawText.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleanJson);
  return parsed;
 } catch (err) {
  console.warn('Audio Gemini eval error:', err);
  return null;
 }
}

/* عرض نشاط: الآن اقرأ أنت */
function renderProduceRead(s, root){
 const d = stepData();
 d.currentNumber = d.currentNumber || 3040125;
 d.mode = d.mode || 'write';
 d.status = d.status || (isPassed() ? (d.usedHelp ? 'assisted' : 'independent') : 'none');
 d.writtenText = d.writtenText || '';
 d.audioTranscript = d.audioTranscript || '';
 d.hasAudio = d.hasAudio || false;
 d.hintShown = d.hintShown || false;
 d.usedHelp = d.usedHelp || false;
 d.evaluation = d.evaluation || null;
 d.showSelfAssessment = d.showSelfAssessment || false;

 const statusLabels = {
  none: 'لم يحاول بعد',
  attempted: 'حاول ويحتاج مراجعة',
  assisted: 'أنجز بمساعدة',
  independent: 'نجح مستقلًا',
  teacher: 'بانتظار مراجعة المعلم'
 };

 const card = document.createElement('div');
 card.className = 'produce-card';

 const header = document.createElement('div');
 header.className = 'produce-header';
 header.innerHTML = '<div class="produce-badge-row">'
  + '<span class="produce-owl-badge">' + getIconSVG('owl') + ' البومة الحكيمة</span>'
  + '<span class="produce-status-pill status-' + d.status + '" id="produce-read-status">الحالة: ' + statusLabels[d.status] + '</span>'
  + '</div>'
  + '<h3 class="produce-instruction">تدرّبت جيدًا! الآن اقرأ هذا العدد بنفسك.</h3>';
 card.append(header);

 const numBox = document.createElement('div');
 numBox.className = 'produce-number-box';
 numBox.innerHTML = '<div class="produce-number-label">العدد المطلوب قراءته:</div>'
  + '<div class="produce-number-digits" id="produce-read-digits">' + fmt(d.currentNumber) + '</div>'
  + '<div class="produce-cycles-legend">'
  + '<span>دورة الملايين</span><b aria-hidden="true">·</b>'
  + '<span>دورة الألوف</span><b aria-hidden="true">·</b>'
  + '<span>دورة الآحاد</span>'
  + '</div>';
 card.append(numBox);

 const modeBar = document.createElement('div');
 modeBar.className = 'produce-mode-bar';
 modeBar.innerHTML = '<button type="button" class="produce-mode-btn ' + (d.mode === 'write' ? 'active' : '') + '" data-pmode="write">' + getIconSVG('pencil') + ' أكتب قراءتي</button>'
  + '<button type="button" class="produce-mode-btn ' + (d.mode === 'voice' ? 'active' : '') + '" data-pmode="voice">' + getIconSVG('mic') + ' أقرأ بصوتي</button>'
  + '<button type="button" class="produce-mode-btn ' + (d.mode === 'teacher' ? 'active' : '') + '" data-pmode="teacher">' + getIconSVG('speaker') + ' أعرض على المعلم</button>';
 card.append(modeBar);

 const bodyWrap = document.createElement('div');
 bodyWrap.className = 'produce-body-wrap';
 card.append(bodyWrap);

 function renderModeBody(){
  bodyWrap.replaceChildren();
  const currentKey = getGeminiApiKey();
  const modelText = words(d.currentNumber);

  if (d.mode === 'write') {
   const wWrap = document.createElement('div');
   wWrap.innerHTML = '<div class="produce-input-label">اكتب قراءة العدد بالكلمات باللغة العربية الفصحى:</div>'
    + '<textarea class="produce-textarea" id="produce-read-input" placeholder="مثال: ثلاثة ملايين وأربعون ألفًا ومئة وخمسة وعشرون..." aria-label="حقل كتابة قراءة العدد">' + esc(d.writtenText) + '</textarea>';
   bodyWrap.append(wWrap);
   const ta = wWrap.querySelector('#produce-read-input');
   ta.addEventListener('input', (e) => { d.writtenText = e.target.value; saveState(); });
  } else if (d.mode === 'voice') {
   const vWrap = document.createElement('div');
   vWrap.className = 'produce-voice-wrap';

   if (!BookAudio.isRecording && !d.hasAudio) {
    vWrap.innerHTML = '<button type="button" class="produce-record-btn" id="produce-start-rec-btn">' + getIconSVG('mic') + ' ابدأ التسجيل</button>'
     + '<p class="produce-mic-notice" id="produce-mic-notice" style="display:none"></p>'
     + (!currentKey ? '<div class="produce-gemini-key-box">'
         + '<div class="produce-gemini-key-label">مفتاح الذكاء الاصطناعي (Gemini) لتقييم الصوت تلقائيًا:</div>'
         + '<div class="produce-gemini-key-row">'
         + '<input type="password" class="produce-inline-key-input" id="produce-inline-key" placeholder="AIzaSy..." value="">'
         + '<button type="button" class="produce-save-key-btn" id="produce-save-key-btn">حفظ وتفعيل</button>'
         + '</div>'
         + '<div style="font-size:11px;color:#716447">المفتاح اختياري. في حال عدم توفره، ستتمكن من تأكيد قراءتك أو إرسالها لمعلمك ومتابعة الدرس مباشرة.</div>'
         + '</div>' : '');
   } else if (BookAudio.isRecording) {
    vWrap.innerHTML = '<div class="produce-recording-box">'
     + '<div class="produce-rec-indicator"><span class="produce-rec-dot"></span><span id="produce-rec-timer">جاري التسجيل... (0 ثانية)</span></div>'
     + '<div class="produce-volume-wrap" title="مستوى التقاط الصوت">'
     + '<span class="produce-vol-label">مستوى الصوت:</span>'
     + '<div class="produce-vol-track"><div class="produce-vol-fill" id="produce-vol-fill"></div></div>'
     + '</div>'
     + '<div class="produce-live-hearing" id="produce-live-hearing">الميكروفون يستمع... تحدث بوضوح لقراءة العدد</div>'
     + '<button type="button" class="produce-stop-btn" id="produce-stop-rec-btn">انتهيت</button>'
     + '</div>';
   } else {
    // Rehydrate audio from base64 if needed across reloads
    if (!BookAudio.recordedUrl && d.audioBase64) {
     try {
      const bChars = atob(d.audioBase64);
      const bNums = new Array(bChars.length);
      for (let i = 0; i < bChars.length; i++) bNums[i] = bChars.charCodeAt(i);
      BookAudio.recordedBlob = new Blob([new Uint8Array(bNums)], { type: d.audioMimeType || 'audio/webm' });
      BookAudio.recordedUrl = URL.createObjectURL(BookAudio.recordedBlob);
     } catch (e) {}
    }

    // Recorded state
    let recHtml = '<div class="produce-recorded-box">'
     + '<div class="produce-audio-controls">'
     + (BookAudio.recordedUrl
         ? '<audio class="produce-audio-player" controls src="' + BookAudio.recordedUrl + '"></audio>'
         : '<div class="produce-audio-saved-note">' + getIconSVG('check') + ' تم حفظ محاولتك الصوتية بنجاح!</div>')
     + '<button type="button" class="produce-del-btn" id="produce-del-rec-btn">' + getIconSVG('trash') + ' إعادة التسجيل</button>'
     + '</div>'
     + '<div class="produce-transcript-box">'
     + '<div class="produce-transcript-label">تأكيد النص المفرغ من صوتك (اختياري، يمكنك كتابته أو مراجعته هنا):</div>'
     + '<input type="text" class="produce-transcript-input" id="produce-transcript-input" value="' + esc(d.audioTranscript) + '" placeholder="إذا ظهر تفريغ صوتي أو أردت كتابة ما نطقته...">'
     + '</div>';

    // Show Self-Assessment box whenever d.showSelfAssessment is true OR whenever user has audio recorded
    recHtml += '<div class="produce-self-eval-box" id="produce-read-self-eval">'
     + '<div class="produce-self-eval-title">' + getIconSVG('sparkle') + ' المقارنة والتأكيد الذاتي:</div>'
     + '<div class="produce-model-reading"><span class="pmr-label">القراءة النموذجية:</span> «' + modelText + '»</div>'
     + '<p class="produce-self-eval-prompt">استمع لتسجيلك، هل قرأت العدد باللغة العربية الفصحى مثل النموذج أعلاه؟</p>'
     + '<div class="produce-self-eval-actions">'
     + '<button type="button" class="produce-self-confirm-btn" id="produce-self-confirm-btn">' + getIconSVG('check') + ' تأكيد القراءة والمتابعة</button>'
     + '<button type="button" class="produce-teacher-confirm-btn" id="produce-teacher-confirm-btn">' + getIconSVG('speaker') + ' إرسال للمعلم</button>'
     + '</div>'
     + '</div>';

    if (!currentKey) {
     recHtml += '<div class="produce-gemini-key-box">'
      + '<div class="produce-gemini-key-label">مفتاح الذكاء الاصطناعي (Gemini) لتقييم الصوت تلقائيًا:</div>'
      + '<div class="produce-gemini-key-row">'
      + '<input type="password" class="produce-inline-key-input" id="produce-inline-key" placeholder="AIzaSy..." value="">'
      + '<button type="button" class="produce-save-key-btn" id="produce-save-key-btn">حفظ وتفعيل</button>'
      + '</div>'
      + '<div style="font-size:11px;color:#716447">أدخل المفتاح ليقوم الذكاء الاصطناعي بفحص تسجيلك الصوتي وتفريغه بدقة.</div>'
      + '</div>';
    }

    recHtml += '</div>';
    vWrap.innerHTML = recHtml;
   }
   bodyWrap.append(vWrap);

   const startBtn = vWrap.querySelector('#produce-start-rec-btn');
   if (startBtn) {
    startBtn.addEventListener('click', async () => {
     const notice = vWrap.querySelector('#produce-mic-notice');
     startBtn.disabled = true;
     startBtn.textContent = 'جاري تشغيل الميكروفون...';
     const ok = await BookAudio.startRecording(
      (sec) => {
       const timerEl = card.querySelector('#produce-rec-timer');
       if (timerEl) timerEl.textContent = 'جاري التسجيل... (' + ar(sec) + ' ثانية)';
      },
      (text) => {
       d.audioTranscript = text;
       const lh = card.querySelector('#produce-live-hearing');
       if (lh) lh.textContent = 'المسموع: ' + text;
       saveState();
      },
      (errText) => {
       if (notice) {
        notice.textContent = errText;
        notice.style.display = 'block';
       }
      },
      (volPercent) => {
       const fill = card.querySelector('#produce-vol-fill');
       if (fill) fill.style.width = volPercent + '%';
      }
     );
     if (ok) {
      renderModeBody();
     } else {
      startBtn.disabled = false;
      startBtn.innerHTML = getIconSVG('mic') + ' ابدأ التسجيل';
     }
    });
   }

   const stopBtn = vWrap.querySelector('#produce-stop-rec-btn');
   if (stopBtn) {
    stopBtn.addEventListener('click', async () => {
     stopBtn.disabled = true;
     stopBtn.textContent = 'جاري حفظ التسجيل...';
     const blob = await BookAudio.stopRecording();
     d.hasAudio = true;
     d.showSelfAssessment = true;
     if (blob) {
      try {
       d.audioBase64 = await blobToBase64(blob);
       d.audioMimeType = BookAudio.mimeType || blob.type;
      } catch (e) {}
     }
     saveState();
     renderModeBody();
    });
   }

   const delBtn = vWrap.querySelector('#produce-del-rec-btn');
   if (delBtn) {
    delBtn.addEventListener('click', () => {
     BookAudio.reset();
     d.hasAudio = false;
     d.audioTranscript = '';
     d.showSelfAssessment = false;
     d.evaluation = null;
     saveState();
     renderModeBody();
     updateStatusUI();
    });
   }

   const keyInp = vWrap.querySelector('#produce-inline-key');
   const keyBtn = vWrap.querySelector('#produce-save-key-btn');
   if (keyBtn && keyInp) {
    keyBtn.addEventListener('click', () => {
     const val = keyInp.value.trim();
     if (val) {
      localStorage.setItem('gemini_api_key', val);
      if (typeof apiKey !== 'undefined') apiKey = val;
      alert('تم حفظ مفتاح Gemini وتفعيله بنجاح!');
      renderModeBody();
     }
    });
   }

   const tInput = vWrap.querySelector('#produce-transcript-input');
   if (tInput) {
    tInput.addEventListener('input', (e) => {
     d.audioTranscript = e.target.value;
     saveState();
    });
   }

   const selfConfirmBtn = vWrap.querySelector('#produce-self-confirm-btn');
   if (selfConfirmBtn) {
    selfConfirmBtn.addEventListener('click', () => {
     const isIndep = !d.usedHelp;
     d.status = isIndep ? 'independent' : 'assisted';
     state.produceBadges.read = d.status;
     d.evaluation = {
      status: 'correct',
      feedback: 'أحسنت! أكّدت قراءتك الصوتية الصحيحة للعدد (' + modelText + '). مبارك إتمام المحطة!'
     };
     pass(s.reason);
     updateStatusUI();
     saveState();
    });
   }

   const teacherConfirmBtn = vWrap.querySelector('#produce-teacher-confirm-btn');
   if (teacherConfirmBtn) {
    teacherConfirmBtn.addEventListener('click', () => {
     d.status = 'teacher';
     state.produceBadges.read = 'teacher';
     d.evaluation = {
      status: 'unclear',
      feedback: 'تم تسجيل محاولتك الصوتية بانتظار مراجعة المعلم، ويمكنك الآن متابعة المحطة التالية.'
     };
     pass(s.reason);
     updateStatusUI();
     saveState();
    });
   }
  } else if (d.mode === 'teacher') {
   const tWrap = document.createElement('div');
   tWrap.className = 'produce-teacher-wrap';
   tWrap.innerHTML = '<div class="produce-teacher-instruction">اقرأ هذا العدد بصوت واضح ومسموع لمعلمك أو ولي أمرك:</div>'
    + '<div class="produce-teacher-card">' + fmt(d.currentNumber) + '</div>'
    + '<button type="button" class="produce-teacher-btn" id="produce-teacher-btn">تسجيل كـ «بانتظار مراجعة المعلم»</button>';
   bodyWrap.append(tWrap);

   const tBtn = tWrap.querySelector('#produce-teacher-btn');
   tBtn.addEventListener('click', () => {
    d.status = 'teacher';
    state.produceBadges.read = 'teacher';
    d.evaluation = { status: 'unclear', feedback: 'تم تسجيل محاولتك أمام المعلم وهي بانتظار مراجعة المعلم.' };
    pass(s.reason);
    updateStatusUI();
    saveState();
   });
  }
 }
 renderModeBody();

 modeBar.querySelectorAll('[data-pmode]').forEach(btn => {
  btn.addEventListener('click', () => {
   d.mode = btn.dataset.pmode;
   modeBar.querySelectorAll('[data-pmode]').forEach(b => b.classList.toggle('active', b.dataset.pmode === d.mode));
   renderModeBody();
   saveState();
  });
 });

 const hintBox = document.createElement('div');
 hintBox.className = 'produce-scaffold-box ' + (d.hintShown ? 'show' : '');
 hintBox.id = 'produce-read-hint';
 hintBox.innerHTML = '<div class="produce-scaffold-title">' + getIconSVG('lightbulb') + ' تلميح البومة لمساعدتك:</div>'
  + '<p class="produce-scaffold-step">1. <strong>دورة الملايين:</strong> اقرأ عدد الملايين في أقصى اليسار.</p>'
  + '<p class="produce-scaffold-step">2. <strong>دورة الألوف:</strong> اقرأ المنازل الثلاث في الوسط (إذا كانت الدورة أصفاراً نهمل ذكرها).</p>'
  + '<p class="produce-scaffold-step">3. <strong>دورة الآحاد:</strong> اقرأ المنازل الثلاث الأخيرة في اليمين.</p>'
  + '<p class="produce-scaffold-note">ملاحظة تربوية: استخدام التلميح يسجّل الإنجاز «بمساعدة»، وبعده سيتاح لك عدد جديد لتثبت إتقانك مستقلًا.</p>';
 card.append(hintBox);

 const fbBox = document.createElement('div');
 fbBox.className = 'produce-feedback ' + (d.evaluation ? ('show status-' + d.evaluation.status) : '');
 fbBox.id = 'produce-read-fb';
 if (d.evaluation) fbBox.textContent = d.evaluation.feedback;
 card.append(fbBox);

 const footer = document.createElement('div');
 footer.className = 'produce-footer';
 card.append(footer);

 function updateStatusUI(){
  const pill = card.querySelector('#produce-read-status');
  if (pill) {
   pill.className = 'produce-status-pill status-' + d.status;
   pill.textContent = 'الحالة: ' + statusLabels[d.status];
  }
  if (d.evaluation) {
   fbBox.className = 'produce-feedback show status-' + d.evaluation.status;
   fbBox.textContent = d.evaluation.feedback;
  }
  renderFooter();
 }

 function renderFooter(){
  footer.replaceChildren();
  const isDone = isPassed() || d.status === 'independent' || d.status === 'assisted' || d.status === 'teacher';

  if (!d.hintShown && !isDone) {
   const helpBtn = document.createElement('button');
   helpBtn.type = 'button';
   helpBtn.className = 'produce-help-btn';
   helpBtn.innerHTML = getIconSVG('lightbulb') + ' أحتاج مساعدة';
   helpBtn.addEventListener('click', () => {
    d.hintShown = true;
    d.usedHelp = true;
    hintBox.classList.add('show');
    updateStatusUI();
    saveState();
   });
   footer.append(helpBtn);
  }

  if (!isDone && d.mode !== 'teacher') {
   const submitBtn = document.createElement('button');
   submitBtn.type = 'button';
   submitBtn.className = 'produce-submit-btn';
   submitBtn.textContent = 'تحقق من قراءتي';
   submitBtn.addEventListener('click', async () => {
    let text = d.mode === 'write' ? d.writtenText : d.audioTranscript;
    const gemKey = getGeminiApiKey();

    if (d.mode === 'voice') {
     if (!d.hasAudio && (!text || !text.trim())) {
      d.evaluation = { status: 'empty', feedback: 'يرجى تسجيل قراءتك أولاً بالضغط على «ابدأ التسجيل».' };
      updateStatusUI();
      return;
     }

     submitBtn.disabled = true;
     submitBtn.textContent = 'جاري تقييم الصوت بالذكاء الاصطناعي...';

     let aiEvaluated = false;
     if (gemKey && BookAudio.recordedBlob) {
      try {
       const audioRes = await evaluateAudioWithGemini(BookAudio.recordedBlob, d.currentNumber, 'reading');
       if (audioRes && audioRes.status && audioRes.feedback) {
        if (audioRes.transcript) {
         d.audioTranscript = audioRes.transcript;
         text = audioRes.transcript;
         const tInp = card.querySelector('#produce-transcript-input');
         if (tInp) tInp.value = audioRes.transcript;
        }
        d.evaluation = audioRes;
        aiEvaluated = true;
       }
      } catch (err) {
       console.warn('Audio Gemini eval failed, falling back:', err);
      }
     }

     // If AI evaluated:
     if (aiEvaluated && d.evaluation) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'تحقق من قراءتي';
      if (d.evaluation.status === 'correct') {
       const isIndep = !d.usedHelp;
       d.status = isIndep ? 'independent' : 'assisted';
       state.produceBadges.read = d.status;
       pass(s.reason);
      } else {
       d.status = 'attempted';
      }
      updateStatusUI();
      saveState();
      return;
     }

     // If text is available (from Web Speech or student typed):
     if (text && text.trim()) {
      let evalRes = evaluateLocalNumberReading(text, d.currentNumber);
      if (gemKey && evalRes.status !== 'correct') {
       const semanticRes = await evaluateSemanticWithGemini(
        text,
        `أنت معلم رياضيات. قيّم قراءة الطفل للعدد ${d.currentNumber}. النص: "${text}". أجب بصيغة JSON: {"status":"correct"|"partial"|"error","feedback":"تغذية راجعة مشجعة بدون إيموجي"}`
       );
       if (semanticRes && semanticRes.status && semanticRes.feedback) evalRes = semanticRes;
      }
      d.evaluation = evalRes;
      submitBtn.disabled = false;
      submitBtn.textContent = 'تحقق من قراءتي';
      if (d.evaluation.status === 'correct') {
       const isIndep = !d.usedHelp;
       d.status = isIndep ? 'independent' : 'assisted';
       state.produceBadges.read = d.status;
       pass(s.reason);
      } else {
       d.status = 'attempted';
      }
      updateStatusUI();
      saveState();
      return;
     }

     // If neither AI nor speech text could evaluate:
     // Activate self-assessment panel immediately so child can complete the station seamlessly!
     submitBtn.disabled = false;
     submitBtn.textContent = 'تحقق من قراءتي';
     d.showSelfAssessment = true;
     d.evaluation = {
      status: 'unclear',
      feedback: 'تم حفظ تسجيلك الصوتي بنجاح! قارن تسجيلك بالقراءة النموذجية أعلاه واضغط زر «نعم، قرأتُه هكذا» لتأكيد إنجازك ومتابعة الدرس.'
     };
     renderModeBody();
     updateStatusUI();
     saveState();
     const selfBox = card.querySelector('#produce-read-self-eval');
     if (selfBox) selfBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
     return;
    } else {
     // Write mode
     if (!text || !text.trim()) {
      d.evaluation = { status: 'empty', feedback: 'يرجى كتابة قراءة العدد أولاً للمتابعة.' };
      updateStatusUI();
      return;
     }
     submitBtn.disabled = true;
     submitBtn.textContent = 'جاري تقييم القراءة...';
     let evalRes = evaluateLocalNumberReading(text, d.currentNumber);
     if (gemKey && evalRes.status !== 'correct') {
      const aiRes = await evaluateSemanticWithGemini(
       text,
       `أنت معلم رياضيات. قيّم قراءة الطفل للعدد ${d.currentNumber}. النص: "${text}". أجب بصيغة JSON: {"status":"correct"|"partial"|"error","feedback":"تغذية راجعة مشجعة بدون إيموجي"}`
      );
      if (aiRes && aiRes.status && aiRes.feedback) evalRes = aiRes;
     }
     d.evaluation = evalRes;

     submitBtn.disabled = false;
     submitBtn.textContent = 'تحقق من قراءتي';

     if (d.evaluation && d.evaluation.status === 'correct') {
      const isIndep = !d.usedHelp;
      d.status = isIndep ? 'independent' : 'assisted';
      state.produceBadges.read = d.status;
      pass(s.reason);
     } else {
      d.status = 'attempted';
     }

     updateStatusUI();
     saveState();
    }
   });
   footer.append(submitBtn);
  }

  if (isDone && d.status === 'assisted') {
   const nextBtn = document.createElement('button');
   nextBtn.type = 'button';
   nextBtn.className = 'produce-next-challenge-btn';
   nextBtn.textContent = 'تحدي جديد مستقل لتأكيد الإتقان';
   nextBtn.addEventListener('click', () => {
    let nextNum = 7060314;
    if (d.currentNumber === 3040125) nextNum = 7060314;
    else if (d.currentNumber === 25000084) nextNum = 42000019;
    else if (d.currentNumber === 604200007) nextNum = 805400003;
    d.currentNumber = nextNum;
    d.writtenText = '';
    d.audioTranscript = '';
    d.hasAudio = false;
    d.showSelfAssessment = false;
    BookAudio.reset();
    d.hintShown = false;
    d.usedHelp = false;
    d.evaluation = null;
    d.status = 'none';
    record().passed.delete(record().index);
    const digEl = card.querySelector('#produce-read-digits');
    if (digEl) digEl.textContent = fmt(d.currentNumber);
    hintBox.classList.remove('show');
    renderModeBody();
    updateStatusUI();
    saveState();
   });
   footer.append(nextBtn);
  }
 }
 renderFooter();

 root.append(card);
}

/* عرض نشاط: السؤال 17 - فسّر بطريقتك */
function renderProduceExplain(s, root){
 const d = stepData();
 d.pair = d.pair || (s.compare ? [...s.compare] : [9605, 149605]);
 d.targetDigit = d.targetDigit || (s.targetDigit !== undefined ? s.targetDigit : 9);
 d.mode = d.mode || 'write';
 d.status = d.status || (isPassed() ? (d.usedHelp ? 'assisted' : 'independent') : 'none');
 d.writtenReason = d.writtenReason || '';
 d.audioTranscript = d.audioTranscript || '';
 d.hasAudio = d.hasAudio || false;
 d.hintLevel = d.hintLevel || 0;
 d.usedHelp = d.usedHelp || false;
 d.evaluation = d.evaluation || null;
 d.isCounterExample = d.isCounterExample || false;
 d.showSelfAssessment = d.showSelfAssessment || false;

 const statusLabels = {
  none: 'لم يحاول بعد',
  attempted: 'حاول ويحتاج مراجعة',
  assisted: 'أنجز بمساعدة',
  independent: 'نجح مستقلًا',
  teacher: 'بانتظار مراجعة المعلم'
 };

 const card = document.createElement('div');
 card.className = 'produce-card';

 const header = document.createElement('div');
 header.className = 'produce-header';
 header.innerHTML = '<div class="produce-badge-row">'
  + '<span class="produce-owl-badge">' + getIconSVG('target') + ' السؤال 17 · فسّر بطريقتك</span>'
  + '<span class="produce-status-pill status-' + d.status + '" id="produce-explain-status">الحالة: ' + statusLabels[d.status] + '</span>'
  + '</div>'
  + '<h3 class="produce-instruction">'
  + (d.isCounterExample
      ? 'تحدي التحقق المستقل: هل تتساوى قيمة الرقم 7 في هذين العددين؟'
      : 'هل تتساوى القيمة المنزلية للرقم 9 في العددين الآتيين؟ ولماذا؟')
  + '</h3>';
 card.append(header);

 function renderHighlightedNum(num, tDigit){
  const sNum = fmt(num);
  const tStr = String(tDigit);
  let html = '<div class="produce-pair-badge">';
  for (const c of sNum) {
   if (c === tStr) html += '<span class="hl-digit">' + c + '</span>';
   else html += c;
  }
  html += '</div>';
  return html;
 }

 const pairBox = document.createElement('div');
 pairBox.className = 'produce-pair-display';
 pairBox.id = 'produce-explain-pair-box';
 pairBox.innerHTML = renderHighlightedNum(d.pair[0], d.targetDigit)
  + '<strong style="color:#163d31;font-size:18px">وَ</strong>'
  + renderHighlightedNum(d.pair[1], d.targetDigit);
 card.append(pairBox);

 const stemBox = document.createElement('div');
 stemBox.className = 'produce-stem-box';
 stemBox.id = 'produce-explain-stem';
 stemBox.textContent = d.isCounterExample
  ? 'بيّن بالتبرير الرياضي: هل تختلف قيمة الرقم 7 في العددين؟'
  : 'قيمة الرقم ' + ar(d.targetDigit) + ' متساوية في العددين لأن…';
 card.append(stemBox);

 const modeBar = document.createElement('div');
 modeBar.className = 'produce-mode-bar';
 modeBar.innerHTML = '<button type="button" class="produce-mode-btn ' + (d.mode === 'write' ? 'active' : '') + '" data-pmode="write">' + getIconSVG('pencil') + ' أكتب تبريري</button>'
  + '<button type="button" class="produce-mode-btn ' + (d.mode === 'voice' ? 'active' : '') + '" data-pmode="voice">' + getIconSVG('mic') + ' أفسّر بصوتي</button>'
  + '<button type="button" class="produce-mode-btn ' + (d.mode === 'teacher' ? 'active' : '') + '" data-pmode="teacher">' + getIconSVG('speaker') + ' أعرض على المعلم</button>';
 card.append(modeBar);

 const bodyWrap = document.createElement('div');
 bodyWrap.className = 'produce-body-wrap';
 card.append(bodyWrap);

 function renderModeBody(){
  bodyWrap.replaceChildren();
  const currentKey = getGeminiApiKey();
  const modelExplainText = d.isCounterExample
   ? 'تختلف قيمة الرقم 7 في العددين؛ لأن 7 في 7,420 تقع في آحاد الألوف وقيمتها 7,000، بينما في 72,400 تقع في عشرات الألوف وقيمتها 70,000.'
   : 'الرقم 9 يقع في منزلة آحاد الألوف (الخانة الرابعة من اليمين) في كلا العددين، وقيمته المنزلية 9,000 في كليهما مهما اختلف طول العدد.';

  if (d.mode === 'write') {
   const wWrap = document.createElement('div');
   wWrap.innerHTML = '<div class="produce-input-label">اكتب تبريرك الرياضي بأسلوبك وبكلماتك الخاصة:</div>'
    + '<textarea class="produce-textarea" id="produce-explain-input" placeholder="مثال: يقع في منزلة آحاد الألوف في العددين..." aria-label="حقل كتابة التبرير الرياضي">' + esc(d.writtenReason) + '</textarea>';
   bodyWrap.append(wWrap);
   const ta = wWrap.querySelector('#produce-explain-input');
   ta.addEventListener('input', (e) => { d.writtenReason = e.target.value; saveState(); });
  } else if (d.mode === 'voice') {
   const vWrap = document.createElement('div');
   vWrap.className = 'produce-voice-wrap';

   if (!BookAudio.isRecording && !d.hasAudio) {
    vWrap.innerHTML = '<button type="button" class="produce-record-btn" id="produce-explain-start-rec">' + getIconSVG('mic') + ' ابدأ تسجيل التبرير</button>'
     + '<p class="produce-mic-notice" id="produce-explain-mic-notice" style="display:none"></p>'
     + (!currentKey ? '<div class="produce-gemini-key-box">'
         + '<div class="produce-gemini-key-label">مفتاح الذكاء الاصطناعي (Gemini) لتقييم الصوت تلقائيًا:</div>'
         + '<div class="produce-gemini-key-row">'
         + '<input type="password" class="produce-inline-key-input" id="produce-explain-inline-key" placeholder="AIzaSy..." value="">'
         + '<button type="button" class="produce-save-key-btn" id="produce-explain-save-key">حفظ وتفعيل</button>'
         + '</div>'
         + '<div style="font-size:11px;color:#716447">المفتاح اختياري لتقييم صوتك مباشرة بالذكاء الاصطناعي.</div>'
         + '</div>' : '');
   } else if (BookAudio.isRecording) {
    vWrap.innerHTML = '<div class="produce-recording-box">'
     + '<div class="produce-rec-indicator"><span class="produce-rec-dot"></span><span id="produce-explain-rec-timer">جاري تسجيل التبرير... (0 ثانية)</span></div>'
     + '<div class="produce-volume-wrap" title="مستوى التقاط الصوت">'
     + '<span class="produce-vol-label">مستوى الصوت:</span>'
     + '<div class="produce-vol-track"><div class="produce-vol-fill" id="produce-explain-vol-fill"></div></div>'
     + '</div>'
     + '<div class="produce-live-hearing" id="produce-explain-live-hearing">الميكروفون يستمع... اشرح تبريرك الرياضي بوضوح</div>'
     + '<button type="button" class="produce-stop-btn" id="produce-explain-stop-rec">انتهيت</button>'
     + '</div>';
   } else {
    // Rehydrate audio from base64 if needed across reloads
    if (!BookAudio.recordedUrl && d.audioBase64) {
     try {
      const bChars = atob(d.audioBase64);
      const bNums = new Array(bChars.length);
      for (let i = 0; i < bChars.length; i++) bNums[i] = bChars.charCodeAt(i);
      BookAudio.recordedBlob = new Blob([new Uint8Array(bNums)], { type: d.audioMimeType || 'audio/webm' });
      BookAudio.recordedUrl = URL.createObjectURL(BookAudio.recordedBlob);
     } catch (e) {}
    }

    let recHtml = '<div class="produce-recorded-box">'
     + '<div class="produce-audio-controls">'
     + (BookAudio.recordedUrl
         ? '<audio class="produce-audio-player" controls src="' + BookAudio.recordedUrl + '"></audio>'
         : '<div class="produce-audio-saved-note">' + getIconSVG('check') + ' تم حفظ محاولتك الصوتية بنجاح!</div>')
     + '<button type="button" class="produce-del-btn" id="produce-explain-del-rec">' + getIconSVG('trash') + ' إعادة التسجيل</button>'
     + '</div>'
     + '<div class="produce-transcript-box">'
     + '<div class="produce-transcript-label">تأكيد النص المفرغ قبل الإرسال (اختياري):</div>'
     + '<input type="text" class="produce-transcript-input" id="produce-explain-transcript" value="' + esc(d.audioTranscript) + '" placeholder="إذا ظهر تفريغ صوتي، يمكنك مراجعته أو كتابته هنا...">'
     + '</div>';

    recHtml += '<div class="produce-self-eval-box" id="produce-explain-self-eval">'
     + '<div class="produce-self-eval-title">' + getIconSVG('sparkle') + ' المقارنة والتأكيد الذاتي:</div>'
     + '<div class="produce-model-reading"><span class="pmr-label">التبرير النموذجي:</span> «' + modelExplainText + '»</div>'
     + '<p class="produce-self-eval-prompt">استمع لتسجيلك، هل وضّحت اسم المنزلة (آحاد الألوف) وتساوي القيمة (9,000)؟</p>'
     + '<div class="produce-self-eval-actions">'
     + '<button type="button" class="produce-self-confirm-btn" id="produce-explain-self-confirm">' + getIconSVG('check') + ' تأكيد التبرير والمتابعة</button>'
     + '<button type="button" class="produce-teacher-confirm-btn" id="produce-explain-teacher-confirm">' + getIconSVG('speaker') + ' إرسال للمعلم</button>'
     + '</div>'
     + '</div>';

    if (!currentKey) {
     recHtml += '<div class="produce-gemini-key-box">'
      + '<div class="produce-gemini-key-label">مفتاح الذكاء الاصطناعي (Gemini) لتقييم الصوت تلقائيًا:</div>'
      + '<div class="produce-gemini-key-row">'
      + '<input type="password" class="produce-inline-key-input" id="produce-explain-inline-key" placeholder="AIzaSy..." value="">'
      + '<button type="button" class="produce-save-key-btn" id="produce-explain-save-key">حفظ وتفعيل</button>'
      + '</div>'
      + '<div style="font-size:11px;color:#716447">أدخل المفتاح ليقوم الذكاء الاصطناعي بتقييم صوتك بدقة.</div>'
      + '</div>';
    }

    recHtml += '</div>';
    vWrap.innerHTML = recHtml;
   }
   bodyWrap.append(vWrap);

   const startBtn = vWrap.querySelector('#produce-explain-start-rec');
   if (startBtn) {
    startBtn.addEventListener('click', async () => {
     const notice = vWrap.querySelector('#produce-explain-mic-notice');
     startBtn.disabled = true;
     startBtn.textContent = 'جاري تشغيل الميكروفون...';
     const ok = await BookAudio.startRecording(
      (sec) => {
       const timerEl = card.querySelector('#produce-explain-rec-timer');
       if (timerEl) timerEl.textContent = 'جاري تسجيل التبرير... (' + ar(sec) + ' ثانية)';
      },
      (text) => {
       d.audioTranscript = text;
       const lh = card.querySelector('#produce-explain-live-hearing');
       if (lh) lh.textContent = 'المسموع: ' + text;
       saveState();
      },
      (errText) => {
       if (notice) {
        notice.textContent = errText;
        notice.style.display = 'block';
       }
      },
      (volPercent) => {
       const fill = card.querySelector('#produce-explain-vol-fill');
       if (fill) fill.style.width = volPercent + '%';
      }
     );
     if (ok) {
      renderModeBody();
     } else {
      startBtn.disabled = false;
      startBtn.innerHTML = getIconSVG('mic') + ' ابدأ تسجيل التبرير';
     }
    });
   }

   const stopBtn = vWrap.querySelector('#produce-explain-stop-rec');
   if (stopBtn) {
    stopBtn.addEventListener('click', async () => {
     stopBtn.disabled = true;
     stopBtn.textContent = 'جاري حفظ التسجيل...';
     const blob = await BookAudio.stopRecording();
     d.hasAudio = true;
     d.showSelfAssessment = true;
     if (blob) {
      try {
       d.audioBase64 = await blobToBase64(blob);
       d.audioMimeType = BookAudio.mimeType || blob.type;
      } catch (e) {}
     }
     saveState();
     renderModeBody();
    });
   }

   const delBtn = vWrap.querySelector('#produce-explain-del-rec');
   if (delBtn) {
    delBtn.addEventListener('click', () => {
     BookAudio.reset();
     d.hasAudio = false;
     d.audioTranscript = '';
     d.showSelfAssessment = false;
     d.evaluation = null;
     saveState();
     renderModeBody();
     updateStatusUI();
    });
   }

   const keyInp = vWrap.querySelector('#produce-explain-inline-key');
   const keyBtn = vWrap.querySelector('#produce-explain-save-key');
   if (keyBtn && keyInp) {
    keyBtn.addEventListener('click', () => {
     const val = keyInp.value.trim();
     if (val) {
      localStorage.setItem('gemini_api_key', val);
      if (typeof apiKey !== 'undefined') apiKey = val;
      alert('تم حفظ مفتاح Gemini وتفعيله بنجاح!');
      renderModeBody();
     }
    });
   }

   const tInput = vWrap.querySelector('#produce-explain-transcript');
   if (tInput) {
    tInput.addEventListener('input', (e) => {
     d.audioTranscript = e.target.value;
     saveState();
    });
   }

   const selfConfirmBtn = vWrap.querySelector('#produce-explain-self-confirm');
   if (selfConfirmBtn) {
    selfConfirmBtn.addEventListener('click', () => {
     const isIndep = !d.usedHelp;
     d.status = isIndep ? 'independent' : 'assisted';
     state.produceBadges.explain = d.status;
     d.evaluation = {
      status: 'correct',
      feedback: 'أحسنت! تبرير رياضي دقيق يثبت فهمك لتساوي القيمة في منزلة آحاد الألوف. مبارك إتمام المحطة!'
     };
     pass(s.reason);
     updateStatusUI();
     saveState();
    });
   }

   const teacherConfirmBtn = vWrap.querySelector('#produce-explain-teacher-confirm');
   if (teacherConfirmBtn) {
    teacherConfirmBtn.addEventListener('click', () => {
     d.status = 'teacher';
     state.produceBadges.explain = 'teacher';
     d.evaluation = {
      status: 'unclear',
      feedback: 'تم تسجيل تبريرك الصوتي بانتظار مراجعة المعلم، ويمكنك الآن متابعة المحطة.'
     };
     pass(s.reason);
     updateStatusUI();
     saveState();
    });
   }
  } else if (d.mode === 'teacher') {
   const tWrap = document.createElement('div');
   tWrap.className = 'produce-teacher-wrap';
   tWrap.innerHTML = '<div class="produce-teacher-instruction">اشرح لمعلمك شفهياً لماذا تتساوى القيمة المنزلية للرقم 9 في العددين.</div>'
    + '<button type="button" class="produce-teacher-btn" id="produce-explain-teacher-btn">تسجيل كـ «بانتظار مراجعة المعلم»</button>';
   bodyWrap.append(tWrap);

   const tBtn = tWrap.querySelector('#produce-explain-teacher-btn');
   tBtn.addEventListener('click', () => {
    d.status = 'teacher';
    state.produceBadges.explain = 'teacher';
    d.evaluation = { status: 'unclear', feedback: 'تم تسجيل التبرير الشفهي أمام المعلم وهو بانتظار مراجعة المعلم.' };
    pass(s.reason);
    updateStatusUI();
    saveState();
   });
  }
 }
 renderModeBody();

 modeBar.querySelectorAll('[data-pmode]').forEach(btn => {
  btn.addEventListener('click', () => {
   d.mode = btn.dataset.pmode;
   modeBar.querySelectorAll('[data-pmode]').forEach(b => b.classList.toggle('active', b.dataset.pmode === d.mode));
   renderModeBody();
   saveState();
  });
 });

 const scaffoldBox = document.createElement('div');
 scaffoldBox.className = 'produce-scaffold-box ' + (d.hintLevel > 0 ? 'show' : '');
 scaffoldBox.id = 'produce-explain-hint';
 card.append(scaffoldBox);

 function renderScaffoldContent(){
  if (d.hintLevel <= 0) {
   scaffoldBox.classList.remove('show');
   return;
  }
  scaffoldBox.classList.add('show');
  let html = '<div class="produce-scaffold-title">' + getIconSVG('lightbulb') + ' تلميح متدرج (المستوى ' + ar(d.hintLevel) + ' من 3):</div>';
  if (d.hintLevel >= 1) {
   html += '<p class="produce-scaffold-step"><strong>المستوى 1:</strong> حدد موقع الرقم في جدول المنازل: عد الخانات بدءًا من اليمين في كلا العددين.</p>';
  }
  if (d.hintLevel >= 2) {
   html += '<p class="produce-scaffold-step"><strong>المستوى 2:</strong> الرقم 9 يقع في المنزلة الرابعة من اليمين في كلا العددين، ما اسم هذه المنزلة؟</p>';
  }
  if (d.hintLevel >= 3) {
   html += '<p class="produce-scaffold-step"><strong>المستوى 3 (نموذج محلول):</strong> في العدد 9,605 يقع في آحاد الألوف وقيمته 9,000. وفي 149,605 يقع أيضًا في آحاد الألوف وقيمته 9,000، لذلك تساوت قيمته المنزلية.</p>';
  }
  scaffoldBox.innerHTML = html;
 }
 renderScaffoldContent();

 const fbBox = document.createElement('div');
 fbBox.className = 'produce-feedback ' + (d.evaluation ? ('show status-' + d.evaluation.status) : '');
 fbBox.id = 'produce-explain-fb';
 if (d.evaluation) fbBox.textContent = d.evaluation.feedback;
 card.append(fbBox);

 const footer = document.createElement('div');
 footer.className = 'produce-footer';
 card.append(footer);

 function updateStatusUI(){
  const pill = card.querySelector('#produce-explain-status');
  if (pill) {
   pill.className = 'produce-status-pill status-' + d.status;
   pill.textContent = 'الحالة: ' + statusLabels[d.status];
  }
  if (d.evaluation) {
   fbBox.className = 'produce-feedback show status-' + d.evaluation.status;
   fbBox.textContent = d.evaluation.feedback;
  }
  renderFooter();
 }

 function renderFooter(){
  footer.replaceChildren();
  const isDone = isPassed() || d.status === 'independent' || d.status === 'assisted' || d.status === 'teacher';

  if (!isDone && d.hintLevel < 3) {
   const hintBtn = document.createElement('button');
   hintBtn.type = 'button';
   hintBtn.className = 'produce-help-btn';
   hintBtn.innerHTML = getIconSVG('lightbulb') + (d.hintLevel === 0 ? ' أحتاج تلميحاً' : ' تلميح أعمق (' + ar(d.hintLevel + 1) + '/3)');
   hintBtn.addEventListener('click', () => {
    d.hintLevel = Math.min(3, d.hintLevel + 1);
    d.usedHelp = true;
    renderScaffoldContent();
    updateStatusUI();
    saveState();
   });
   footer.append(hintBtn);
  }

  if (!isDone && d.mode !== 'teacher') {
   const submitBtn = document.createElement('button');
   submitBtn.type = 'button';
   submitBtn.className = 'produce-submit-btn';
   submitBtn.textContent = 'تحقق من تبريري';
   submitBtn.addEventListener('click', async () => {
    let text = d.mode === 'write' ? d.writtenReason : d.audioTranscript;
    const gemKey = getGeminiApiKey();

    if (d.mode === 'voice') {
     if (!d.hasAudio && (!text || !text.trim())) {
      d.evaluation = { status: 'empty', feedback: 'يرجى تسجيل تبريرك أولاً بالضغط على «ابدأ تسجيل التبرير».' };
      updateStatusUI();
      return;
     }

     submitBtn.disabled = true;
     submitBtn.textContent = 'جاري تقييم التبرير الصوتي بالذكاء الاصطناعي...';

     let aiEvaluated = false;
     if (gemKey && BookAudio.recordedBlob) {
      try {
       const audioRes = await evaluateAudioWithGemini(BookAudio.recordedBlob, d.targetDigit, 'explain');
       if (audioRes && audioRes.status && audioRes.feedback) {
        if (audioRes.transcript) {
         d.audioTranscript = audioRes.transcript;
         text = audioRes.transcript;
         const tInp = card.querySelector('#produce-explain-transcript');
         if (tInp) tInp.value = audioRes.transcript;
        }
        d.evaluation = audioRes;
        aiEvaluated = true;
       }
      } catch (err) {
       console.warn('Audio Gemini eval failed, falling back:', err);
      }
     }

     // If AI evaluated:
     if (aiEvaluated && d.evaluation) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'تحقق من تبريري';
      if (d.evaluation.status === 'correct') {
       const isIndep = !d.usedHelp;
       d.status = isIndep ? 'independent' : 'assisted';
       state.produceBadges.explain = d.status;
       pass(s.reason);
      } else {
       d.status = 'attempted';
      }
      updateStatusUI();
      saveState();
      return;
     }

     // If text is available:
     if (text && text.trim()) {
      let evalRes = evaluateLocalJustification(text, d.targetDigit);
      if (gemKey && evalRes.status !== 'correct') {
       const aiRes = await evaluateSemanticWithGemini(
        text,
        'أنت معلم رياضيات. السؤال: قيمة الرقم 9 متساوية في العددين 9,605 و 149,605 لأن... صنّف الإجابة بصيغة JSON: {"status":"correct"|"incomplete"|"insufficient"|"misconception"|"incorrect","feedback":"تغذية راجعة مشجعة بدون إيموجي"}'
       );
       if (aiRes && aiRes.status && aiRes.feedback) evalRes = aiRes;
      }
      d.evaluation = evalRes;
      submitBtn.disabled = false;
      submitBtn.textContent = 'تحقق من تبريري';
      if (d.evaluation.status === 'correct') {
       const isIndep = !d.usedHelp;
       d.status = isIndep ? 'independent' : 'assisted';
       state.produceBadges.explain = d.status;
       pass(s.reason);
      } else {
       d.status = 'attempted';
      }
      updateStatusUI();
      saveState();
      return;
     }

     // If neither AI nor speech text could evaluate:
     submitBtn.disabled = false;
     submitBtn.textContent = 'تحقق من تبريري';
     d.showSelfAssessment = true;
     d.evaluation = {
      status: 'unclear',
      feedback: 'تم حفظ تسجيلك الصوتي بنجاح! قارن تبريرك بالتبرير النموذجي أعلاه واضغط «نعم، فسّرتُه هكذا» لتأكيد إنجازك ومتابعة الدرس.'
     };
     renderModeBody();
     updateStatusUI();
     saveState();
     const selfBox = card.querySelector('#produce-explain-self-eval');
     if (selfBox) selfBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
     return;
    } else {
     // Write mode
     if (!text || !text.trim()) {
      d.evaluation = { status: 'empty', feedback: 'يرجى كتابة التبرير أولاً للمتابعة.' };
      updateStatusUI();
      return;
     }

     submitBtn.disabled = true;
     submitBtn.textContent = 'جاري تقييم التبرير...';

     let evalRes = evaluateLocalJustification(text, d.targetDigit);
     if (gemKey && evalRes.status !== 'correct') {
      const aiRes = await evaluateSemanticWithGemini(
       text,
       'أنت معلم رياضيات. السؤال: قيمة الرقم 9 متساوية في العددين 9,605 و 149,605 لأن... صنّف الإجابة بصيغة JSON: {"status":"correct"|"incomplete"|"insufficient"|"misconception"|"incorrect","feedback":"تغذية راجعة مشجعة بدون إيموجي"}'
      );
      if (aiRes && aiRes.status && aiRes.feedback) evalRes = aiRes;
     }
     d.evaluation = evalRes;

     submitBtn.disabled = false;
     submitBtn.textContent = 'تحقق من تبريري';

     if (d.evaluation && d.evaluation.status === 'correct') {
      const isIndep = !d.usedHelp;
      d.status = isIndep ? 'independent' : 'assisted';
      state.produceBadges.explain = d.status;
      pass(s.reason);
     } else {
      d.status = 'attempted';
     }

     updateStatusUI();
     saveState();
    }
   });
   footer.append(submitBtn);
  }

  if (isDone && !d.isCounterExample) {
   const counterBtn = document.createElement('button');
   counterBtn.type = 'button';
   counterBtn.className = 'produce-counter-btn';
   counterBtn.textContent = 'تطبيق على مثال مغاير (تحقق مستقل)';
   counterBtn.addEventListener('click', () => {
    d.pair = [7420, 72400];
    d.targetDigit = 7;
    d.isCounterExample = true;
    d.writtenReason = '';
    d.audioTranscript = '';
    d.hasAudio = false;
    d.showSelfAssessment = false;
    BookAudio.reset();
    d.hintLevel = 0;
    d.usedHelp = false;
    d.evaluation = null;
    d.status = 'none';
    record().passed.delete(record().index);

    const pairEl = card.querySelector('#produce-explain-pair-box');
    if (pairEl) {
     pairEl.innerHTML = renderHighlightedNum(d.pair[0], d.targetDigit)
      + '<strong style="color:#163d31;font-size:18px">وَ</strong>'
      + renderHighlightedNum(d.pair[1], d.targetDigit);
    }
    const stemEl = card.querySelector('#produce-explain-stem');
    if (stemEl) stemEl.textContent = 'بيّن بالتبرير الرياضي: هل تختلف قيمة الرقم 7 في العددين؟';

    renderScaffoldContent();
    renderModeBody();
    updateStatusUI();
    saveState();
   });
   footer.append(counterBtn);
  }
 }
 renderFooter();

 root.append(card);
}

function renderMission(){
 pauseRapid();resetTaskInteractions();renderInfiniteBar();
 const s=currentStep(),r=record();renderMissionSteps();
 if($('heart-recharge-box'))$('heart-recharge-box').hidden=!(state.hearts===0&&!state.infiniteMode);
 if(state.infiniteMode){
  const skillNames={all:'تحدٍّ ذكي شامل',place:'المنزلة والقيمة المنزلية',verbal:'الصيغة اللفظية',standard:'خزنة الصيغة القياسية',expanded:'الصيغة التحليلية واكتشاف الخطأ'};
  $('mission-index').textContent='التحدي المتجدد · المسألة '+ar(state.infiniteStats.solved+1);
  $('mission-source').textContent=s.source||'مسائل مولّدة تلقائيًا';
  $('mission-title').textContent=skillNames[state.infiniteSkill]||'تحدٍّ متجدد';
  $('mission-goal').textContent='مسائل جديدة في كل مرة لتثبيت المهارة وكسب نقاط إضافية.';
 }else{
  const id=activeId(),m=missions[id],mNode=PATH_NODES.find(n=>n.type==='mission'&&n.missionId===id);
  $('mission-index').textContent=(mNode?mNode.title:'المهمة '+ar(id+1)+' من 12')+' · '+(state.scene?'التدريب':'الدرس');
  $('mission-source').textContent=m.source;$('mission-title').textContent=m.title;
  $('mission-goal').textContent=m.goal+(['wheels','zeros'].includes(s.type)?' المس الرقم واسحبه لأعلى أو لأسفل.':'');
 }
 renderSubProgress();renderHintState();
 if(isPassed()){
  const d=stepData();
  const isAssisted=Boolean(d.revealedAnswer||d.usedHelp||d.assisted||d.status==='assisted'||(r.assistedSteps&&r.assistedSteps.has(r.index)));
  if(isAssisted){
   $('feedback').className='feedback good assisted-feedback';
   $('feedback').innerHTML='<span class="feedback-badge-assisted">أُنجز بمساعدة</span> '+(r.lastMessage||'أكملت التدريب بمساعدة.');
  }else{
   $('feedback').className='feedback good';
   $('feedback').textContent=(r.lastMessage||'أنجزت هذا الجزء بنجاح!')+' (حل مستقل)';
  }
 }else{
  $('feedback').className='feedback';
  $('feedback').textContent='فكّر وجرّب بنفسك أولاً. المساعدة التدريجية ستكون متاحة إذا احتجت إليها.';
 }
 const root=$('mission-content');root.replaceChildren();if(s.source)root.innerHTML='<p class="question-title">'+esc(s.source)+'</p>';root.insertAdjacentHTML('beforeend','<p class="question-prompt">'+esc(s.prompt)+'</p>');
 if(s.type==='target')renderTarget(s,root);else if(s.type==='zeros')renderZeros(s,root);else if(s.type==='wheels')renderWheels(s,root);else if(s.type==='choice')renderChoice(s,root);else if(s.type==='verbal')renderVerbal(s,root);else if(s.type==='match')renderMatch(s,root);else if(s.type==='fields')renderFields(s,root);else if(s.type==='missing')renderMissing(s,root);else if(s.type==='error')renderError(s,root);else if(s.type==='rapid')renderRapid(s,root);else if(s.type==='produce_read')renderProduceRead(s,root);else if(s.type==='produce_explain')renderProduceExplain(s,root);
 bindSpeakButtons(root);updateNext();renderStationTopbar();renderAssistedNoticeCard();
 const hintArea=$('hint-button')?.closest('.hint-area');
 if(hintArea&&root.parentNode){
  root.after(hintArea);
 }
 clearTimeout(stepTimer);
 const curD=stepData();
 if(!isPassed()&&!curD.helpUnlocked){
  stepTimer=setTimeout(()=>{
   if(!isPassed()&&record().index===r.index){
    curD.helpUnlocked=true;
    renderHintState();
    saveState();
   }
  },30000);
 }
}
function numberBoard(n,options={}){const root=document.createElement('div');root.className='place-board'+(options.interactive?' interactive':'');for(let g=2;g>=0;g--){const cycle=document.createElement('div');cycle.className='cycle '+['ones','thousands','millions'][g];cycle.innerHTML='<div class="cycle-name">'+['دورة الآحاد','دورة الألوف','دورة الملايين'][g]+'</div>';const row=document.createElement('div');row.className='cycle-digits';for(let p=g*3+2;p>=g*3;p--){const house=document.createElement(options.interactive?'button':'div');if(options.interactive)house.type='button';house.className='house'+(p===options.selected?' selected':'')+(options.drop?' drop-in':'')+(options.count&&p<options.selected?' counted':'')+(10**p>n&&digit(n,p)===0?' dim':'');house.dataset.place=p;house.style.setProperty('--delay',(8-p)*.09+'s');house.innerHTML='<small>'+['آحاد','عشرات','مئات'][p%3]+'</small><strong class="num">'+digit(n,p)+'</strong>';house.setAttribute('aria-label',places[p]+'؛ الرقم '+digit(n,p));row.append(house);}cycle.append(row);root.append(cycle);}return root;}
function renderTarget(s,root){
 root.insertAdjacentHTML('beforeend',bigNumberHTML(s.n,s.p));
 const board=numberBoard(s.n,{interactive:true});
 root.append(board);
 board.querySelectorAll('button').forEach(b=>{
  b.disabled=isPassed();
  if(isPassed()&&Number(b.dataset.place)===s.p)b.classList.add('selected');
  b.addEventListener('click',()=>{
   const chosenP=Number(b.dataset.place);
   if(chosenP===s.p){
    b.classList.add('selected');
    pass(s.reason);
    board.querySelectorAll('button').forEach(x=>x.disabled=true);
   }else{
    b.classList.add('wrong');
    const targetBtn=board.querySelector('button[data-place="'+s.p+'"]');
    triggerDualHighlight(root,b,targetBtn,chosenP,s.p,s.n);
    const d=digit(s.n,s.p);
    const chosenVal=d*10**chosenP;
    const correctVal=d*10**s.p;
    const analysis={
     type:'target_mismatch',
     targetDigit:d,
     number:s.n,
     chosenVal:chosenVal,
     chosenZeros:chosenP,
     chosenPlace:chosenP,
     chosenPlaceName:places[chosenP],
     chosenLabel:places[chosenP]+' ('+fmt(chosenVal)+')',
     targetVal:correctVal,
     targetZeros:s.p,
     targetPlace:s.p,
     targetPlaceName:places[s.p],
     targetLabel:places[s.p]+' ('+fmt(correctVal)+')',
     directObservation:'اخترت منزلة '+places[chosenP]+' (بـ '+ar(chosenP)+' أصفار).',
     visualComparison:'انظر إلى العدد '+fmt(s.n)+': يوجد '+ar(s.p)+' أرقام على يمين الرقم '+d+'.',
     guidance:'إذن قيمته '+fmt(correctVal)+' في «'+places[s.p]+'». اضغط خانة «'+places[s.p]+'» في اللوحة.'
    };
    wrong('هذه منزلة '+places[chosenP]+'. الرقم '+d+' في العدد يقع في '+places[s.p]+'.',b,analysis);
   }
  });
 });
}
function renderZeros(s,root){
 const d=stepData();if(d.zeros===undefined)d.zeros=0;
 root.insertAdjacentHTML('beforeend',bigNumberHTML(s.n,s.p)+'<p class="mini-instruction">1. غيّر عدد الأصفار بإصبعك · 2. راقب القيمة في الشاشة العلوية · 3. تحقّق</p><div class="zero-monitor"><div class="zero-value" id="zero-value"></div><p class="live-caption" id="zero-live" role="status"></p></div><div class="zero-controls"><button type="button" data-zero="-1" aria-label="تقليل عدد الأصفار">−</button><strong id="zeros-count" '+spinAttributes('zeros',0,d.zeros,'عدد الأصفار',8)+'>'+d.zeros+'</strong><button type="button" data-zero="1" aria-label="زيادة عدد الأصفار">+</button></div><div class="check-row"><button type="button" class="primary" id="zero-check">تحقّق من القيمة</button></div>');
 const update=()=>{
  updateSpin($('zeros-count'),d.zeros,isPassed());
  $('zero-value').innerHTML=digit(s.n,s.p)+'<span>'+'0'.repeat(d.zeros)+'</span>';
  $('zero-live').textContent=ar(d.zeros)+' أصفار ← القيمة الآن '+fmt(digit(s.n,s.p)*10**d.zeros)+'.';
  root.querySelector('[data-zero="-1"]').disabled=d.zeros===0||isPassed();root.querySelector('[data-zero="1"]').disabled=d.zeros===8||isPassed();
  updateCoach();
 };
 const change=(el,steps)=>{if(isPassed())return;d.zeros=Math.max(0,Math.min(8,d.zeros+steps));update();};
 touchDigits(root,change,false);update();
 root.querySelectorAll('[data-zero]').forEach(b=>b.addEventListener('click',()=>change($('zeros-count'),Number(b.dataset.zero))));
 $('zero-check').disabled=isPassed();$('zero-check').addEventListener('click',()=>{
  if(d.zeros===s.p){pass(s.reason);$('zero-check').disabled=true;update();}
  else{
   const dig=digit(s.n,s.p);
   const chosenVal=dig*10**d.zeros;
   const correctVal=dig*10**s.p;
   triggerVisualSweep(root,s.n,s.p);
   const analysis={
    type:'zeros_mismatch',
    targetDigit:dig,
    number:s.n,
    chosenVal:chosenVal,
    chosenZeros:d.zeros,
    chosenPlace:d.zeros,
    chosenPlaceName:places[d.zeros]||(ar(d.zeros)+' أصفار'),
    chosenLabel:fmt(chosenVal),
    targetVal:correctVal,
    targetZeros:s.p,
    targetPlace:s.p,
    targetPlaceName:places[s.p],
    targetLabel:fmt(correctVal),
    directObservation:'اخترت '+ar(d.zeros)+' أصفار (القيمة '+fmt(chosenVal)+').',
    visualComparison:'انظر إلى العدد '+fmt(s.n)+': يوجد '+ar(s.p)+' أرقام على يمين الرقم '+dig+'.',
    guidance:'إذن يحتاج إلى '+ar(s.p)+' أصفار لتصبح قيمته المنزلية '+fmt(correctVal)+' ('+places[s.p]+').'
   };
   wrong('عدد الأصفار يجب أن يساوي عدد الأرقام على يمين الرقم الملوّن ('+dig+'). عدّها مرة أخرى.',$('zeros-count'),analysis);
  }
 });
}
function renderWheels(s,root){
 const d=stepData();if(d.value===undefined)d.value=s.initial;if(d.selected===undefined)d.selected=0;
 if(s.wording)root.insertAdjacentHTML('beforeend','<div class="note-book">'+esc(s.wording)+'</div>');
 root.insertAdjacentHTML('beforeend','<p class="mini-instruction">1. المس رقمًا واسحبه أو اضغط ▲▼ · 2. راقب شاشة العدد في الأعلى · 3. تحقّق</p><div class="wheel-monitor"><div class="big-number-bar"><div class="wheel-readout" id="wheel-readout">'+fmt(d.value)+'</div><button type="button" class="speak-inline" id="wheel-speak"><span class="btn-svg"><svg viewBox="0 0 24 24" class="svg-ico" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg></span><span>اقرأ تكوينك</span></button></div><p class="live-caption" id="wheel-live" role="status"></p><div class="expanded-preview" id="wheel-expanded" aria-label="التحليل المباشر"></div><div class="wheel-color-coded-wrap" id="wheel-color-coded-wrap"></div></div>');
 const wheels=document.createElement('div');wheels.className='wheels';
 for(let g=2;g>=0;g--){
  const cKey=['ones','thousands','millions'][g];
  const group=document.createElement('div');group.className='wheel-group '+cKey;group.dataset.cycle=cKey;group.innerHTML='<span>'+['دورة الآحاد','دورة الألوف','دورة الملايين'][g]+'</span>';
  const row=document.createElement('div');row.className='wheel-row';
  for(let p=g*3+2;p>=g*3;p--){
   const wheel=document.createElement('div');wheel.className='wheel';
   wheel.innerHTML='<button type="button" data-wheel="'+p+'" data-delta="1" aria-label="زيادة رقم '+places[p]+'">▲</button><strong id="wheel-'+p+'" '+spinAttributes('wheel-'+p,p,digit(d.value,p),'رقم '+places[p])+'>'+digit(d.value,p)+'</strong><button type="button" data-wheel="'+p+'" data-delta="-1" aria-label="إنقاص رقم '+places[p]+'">▼</button>';
   row.append(wheel);
  }
  group.append(row);wheels.append(group);
 }
 root.append(wheels);
 root.insertAdjacentHTML('beforeend','<div class="check-row"><button id="wheel-check" class="primary" type="button">'+(s.initial?'تحقّق من اللوحة':'افتح الخزنة')+'</button></div>');
 $('wheel-speak').addEventListener('click',()=>speakNumber(d.value,root));
 const update=()=>{
  for(let p=0;p<9;p++){const spin=$('wheel-'+p);updateSpin(spin,digit(d.value,p),isPassed());spin.classList.toggle('selected',p===d.selected);}
  $('wheel-readout').textContent=fmt(d.value);
  $('wheel-live').textContent='اخترت الرقم '+digit(d.value,d.selected)+' في '+places[d.selected]+'؛ قيمته '+fmt(digit(d.value,d.selected)*10**d.selected)+'.';
  liveExpansion($('wheel-expanded'),d.value);
  const wheelWrap = $('wheel-color-coded-wrap');
  if(wheelWrap){
   const prevBox = wheelWrap.querySelector('.color-coded-box');
   const prevMode = prevBox ? (prevBox.dataset.colorMode || 'cycle') : 'cycle';
   renderColorCodedNumberBlock(d.value, wheelWrap, prevMode, {
    selectedPlace: d.selected,
    onSelectPlace: (newP) => {
     d.selected = newP;
     update();
    }
   });
  }
  root.querySelectorAll('[data-wheel]').forEach(b=>b.disabled=isPassed());updateCoach();
 };
 const change=(el,steps)=>{
  if(isPassed())return;
  const p=Number(el.dataset.p),old=digit(d.value,p),value=((old+steps)%10+10)%10;
  d.selected=p;d.value+=(value-old)*10**p;update();
 };
 touchDigits(root,change,false);update();
 root.querySelectorAll('[data-wheel]').forEach(b=>b.addEventListener('click',()=>change($('wheel-'+b.dataset.wheel),Number(b.dataset.delta))));
 $('wheel-check').disabled=isPassed();$('wheel-check').addEventListener('click',()=>{
  if(d.value===s.n){pass('أحسنت! '+fmt(s.n)+' هو العدد الصحيح.');$('wheel-check').disabled=true;update();}
  else{const expected=String(s.n).padStart(9,'0'),actual=String(d.value).padStart(9,'0');let p=8;for(let i=0;i<9;i++)if(expected[i]!==actual[i]){p=8-i;break;}wrong('راجع '+places[p]+'. طابقها مع العدد المطلوب.',$('wheel-'+p));}
 });
}
function renderChoice(s,root){
 if(s.n!==undefined)root.insertAdjacentHTML('beforeend',bigNumberHTML(s.n,s.p));
 if(s.compare)root.insertAdjacentHTML('beforeend','<div class="compare"><div class="num">'+marked(s.compare[0],s.p)+'</div><span>و</span><div class="num">'+marked(s.compare[1],s.p)+'</div></div>');
 const answers=document.createElement('div');answers.className='answers';
 const d=stepData();
 if(!d.order)d.order=s.options.map((_,i)=>i).sort(()=>Math.random()-.5);
 d.order.forEach(i=>{
  const b=document.createElement('button');
  b.type='button';
  b.className='answer'+(typeof s.options[i]==='number'?' numeric':'');
  b.dataset.answer=i;
  b.innerHTML=typeof s.options[i]==='number'?fmt(s.options[i]):s.formula?'<bdi>'+esc(s.options[i])+'</bdi>':esc(s.options[i]);
  b.disabled=isPassed();
  if(isPassed()&&i===s.correct)b.classList.add('correct');
  b.addEventListener('click',()=>{
   if(i===s.correct){
    b.classList.add('correct');
    pass(s.reason);
    answers.querySelectorAll('button').forEach(x=>x.disabled=true);
   }else{
    b.classList.add('wrong');
    b.disabled=true;
    const correctBtn=answers.querySelector('button[data-answer="'+s.correct+'"]');
    const chosenOpt=s.options[i];
    const correctOpt=s.options[s.correct];
    let analysis=null;
    if(typeof chosenOpt==='number' && typeof correctOpt==='number' && s.n!==undefined && s.p!==undefined){
     const dig=digit(s.n,s.p);
     const chosenZeros=String(chosenOpt).match(/0*$/)[0].length;
     const targetZeros=s.p;
     const chosenP=Math.min(8,chosenZeros);
     triggerDualHighlight(root,b,correctBtn,chosenP,s.p,s.n);
     analysis={
      type:'choice_numeric_mismatch',
      targetDigit:dig,
      number:s.n,
      chosenVal:chosenOpt,
      chosenZeros:chosenZeros,
      chosenPlace:chosenP,
      chosenPlaceName:places[chosenP],
      chosenLabel:fmt(chosenOpt),
      targetVal:correctOpt,
      targetZeros:targetZeros,
      targetPlace:s.p,
      targetPlaceName:places[s.p],
      targetLabel:fmt(correctOpt),
      directObservation:'اخترت '+fmt(chosenOpt)+' ('+places[chosenP]+' بـ '+ar(chosenZeros)+' أصفار).',
      visualComparison:'انظر إلى العدد '+fmt(s.n)+': يوجد '+ar(targetZeros)+' أرقام على يمين الرقم '+dig+'.',
      guidance:'إذن قيمته '+fmt(correctOpt)+' ('+places[s.p]+' بـ '+ar(targetZeros)+' أصفار).'
     };
    }else if(s.n!==undefined && s.p!==undefined){
     const dig=digit(s.n,s.p);
     triggerVisualSweep(root,s.n,s.p);
     const targetVal=dig*10**s.p;
     analysis={
      type:'choice_text_mismatch',
      targetDigit:dig,
      number:s.n,
      chosenVal:chosenOpt,
      chosenZeros:0,
      chosenLabel:String(chosenOpt),
      targetVal:targetVal,
      targetZeros:s.p,
      targetPlace:s.p,
      targetPlaceName:places[s.p],
      targetLabel:places[s.p]+' ('+fmt(targetVal)+')',
      directObservation:'اخترت «'+chosenOpt+'».',
      visualComparison:'انظر إلى العدد: يوجد '+ar(s.p)+' أرقام على يمين الرقم '+dig+'.',
      guidance:'إذن منزلة الرقم هي '+places[s.p]+' وقيمته المنزلية '+fmt(targetVal)+'.'
     };
    }else if(s.compare && s.p!==undefined){
     analysis={
      type:'choice_compare_mismatch',
      chosenLabel:String(chosenOpt),
      targetLabel:String(correctOpt),
      directObservation:'اخترت: «'+chosenOpt+'».',
      visualComparison:'عدّ الأرقام على يمين الرقم في كلا العددين: تجد عدد الأصفار متساوياً.',
      guidance:'إذن القيمتان متساويتان لأن المنزلة وعدد الأصفار متطابقان.'
     };
    }
    const hintMsg=analysis?.directObservation?(analysis.directObservation+' '+analysis.visualComparison+' '+analysis.guidance):(s.hint||'قسّم العدد إلى دورات، ثم قارِن كل دورة بالإجابة.');
    wrong(hintMsg,b,analysis);
   }
  });
  answers.append(b);
 });
 root.append(answers);
}
function renderVerbal(s,root){
 root.insertAdjacentHTML('beforeend',bigNumberHTML(s.n));
 const d=stepData();
 d.verbalStep=d.verbalStep||0;
 d.chosenParts=d.chosenParts||[];
 const periodParts=getPeriodParts(s.n);
 const totalSteps=periodParts.length;
 const scaffold=document.createElement('div');
 scaffold.className='verbal-scaffold';

 const slotsBar=document.createElement('div');
 slotsBar.className='verbal-slots-bar';
 slotsBar.setAttribute('role','region');
 slotsBar.setAttribute('aria-label','دورات العدد بالصيغة اللفظية');

 const allCycles=[{key:'millions',name:'دورة الملايين'},{key:'thousands',name:'دورة الألوف'},{key:'ones',name:'دورة الآحاد'}];
 allCycles.forEach(cycle=>{
  const partIdx=periodParts.findIndex(p=>p.periodKey===cycle.key);
  const slot=document.createElement('div');
  slot.className='verbal-cycle-slot '+cycle.key;
  if(partIdx===-1){
   slot.classList.add('skipped');
   slot.innerHTML='<span class="cycle-slot-label">'+cycle.name+'</span><span class="cycle-slot-val">(أصفار · تُتخطى)</span>';
  }else{
   const isDone=d.verbalStep>partIdx||isPassed();
   const isCurrent=d.verbalStep===partIdx&&!isPassed();
   slot.classList.toggle('filled',isDone);
   slot.classList.toggle('active',isCurrent);
   slot.innerHTML='<span class="cycle-slot-label">'+cycle.name+'</span><span class="cycle-slot-val">'+(isDone?esc(periodParts[partIdx].text):isCurrent?'الخطوة '+ar(partIdx+1)+': قيد الاختيار...':'في انتظار دورها')+'</span>'+(isDone?'<span class="slot-check" aria-hidden="true">'+getIconSVG('check')+'</span>':'');
  }
  slotsBar.append(slot);
 });
 scaffold.append(slotsBar);

 const assembly=document.createElement('div');
 assembly.className='verbal-assembly-box';
 const currentAssembledText=(isPassed()||d.verbalStep>=totalSteps)?words(s.n):d.chosenParts.join(' ');
 assembly.innerHTML='<div class="assembly-header"><strong>الصيغة اللفظية المتكوّنة:</strong></div><div class="assembly-sentence'+(isPassed()||d.verbalStep>=totalSteps?' complete':'')+'">'+(currentAssembledText?'<span class="quote-text">«'+esc(currentAssembledText)+'»</span>':'<span class="empty-placeholder">اختر بطاقة الدورة الأولى للبدء في تجميع الجملة...</span>')+'</div>';
 scaffold.append(assembly);

 const cardsSection=document.createElement('div');
 cardsSection.className='verbal-cards-section';
 if(isPassed()||d.verbalStep>=totalSteps){
  cardsSection.innerHTML='<div class="verbal-complete-card"><div class="complete-badge"><span class="btn-svg">'+getIconSVG('check')+'</span><span>اكتملت الصيغة اللفظية بنجاح!</span></div><button type="button" class="primary speak-full-btn" id="verbal-speak-btn"><span class="btn-svg">'+getIconSVG('volume')+'</span><span>استمع للجملة المكتملة</span></button></div>';
  scaffold.append(cardsSection);
  root.append(scaffold);
  root.querySelector('#verbal-speak-btn')?.addEventListener('click',()=>speakText(words(s.n)));
  return;
 }

 const activePart=periodParts[d.verbalStep];
 const stepNum=d.verbalStep+1;
 cardsSection.innerHTML='<div class="verbal-step-prompt"><span class="step-num-pill">الخطوة '+ar(stepNum)+' من '+ar(totalSteps)+'</span><strong>اختر بطاقة '+activePart.periodName+' للعدد <bdi class="verbal-target-num">'+fmt(s.n)+'</bdi>:</strong></div><div class="verbal-cards-grid" role="group" aria-label="بطاقات '+activePart.periodName+'"></div>';
 const grid=cardsSection.querySelector('.verbal-cards-grid');

 if(!d['order_'+d.verbalStep]){
  const opts=[{text:activePart.text,correct:true},{text:activePart.distractors[0],correct:false},{text:activePart.distractors[1],correct:false}].sort(()=>Math.random()-.5);
  d['order_'+d.verbalStep]=opts;
 }
 const options=d['order_'+d.verbalStep];
 options.forEach((opt,idx)=>{
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='verbal-tile-btn';
  btn.innerHTML='<span class="tile-card-num">'+ar(idx+1)+'</span><span class="tile-card-text">'+esc(opt.text)+'</span>';
  btn.setAttribute('aria-label',activePart.periodName+'؛ الخيار '+ar(idx+1)+': '+opt.text);
  btn.addEventListener('click',()=>{
   if(opt.correct){
    sound(true);haptic(true);
    btn.classList.add('correct');
    d.chosenParts.push(opt.text);
    d.verbalStep++;
    saveState();
    if(d.verbalStep>=totalSteps){
     pass('أحسنت! كوّنت الصيغة اللفظية للعدد بدقة: «'+words(s.n)+'».');
    }
    renderMission();
   }else{
    btn.classList.add('wrong');btn.disabled=true;
    const correctBtn=Array.from(grid.querySelectorAll('.verbal-tile-btn')).find((_,oIdx)=>options[oIdx].correct);
    triggerDualHighlight(scaffold,btn,correctBtn);
    const analysis={
     type:'verbal_period_mismatch',
     number:s.n,
     chosenLabel:opt.text,
     targetLabel:activePart.text,
     directObservation:'اخترت بطاقة «'+opt.text+'».',
     visualComparison:'انظر إلى دورة '+activePart.periodName+' في العدد '+fmt(s.n)+': قيمتها '+fmt(activePart.value)+'.',
     guidance:'الصيغة الصحيحة لهذه الدورة هي: «'+activePart.text+'».'
    };
    wrong('اخترت بطاقة لا تطابق أرقام '+activePart.periodName+'. طابق الأرقام بدقة.',btn,analysis);
   }
  });
  grid.append(btn);
 });
 scaffold.append(cardsSection);
 root.append(scaffold);
}
function renderMatch(s,root){
 const d=stepData();if(!d.matches)d.matches=[];if(!d.targets)d.targets=s.pairs.map((_,i)=>i).sort(()=>Math.random()-.5);d.selected=null;d.selectedValue=null;
 const board=document.createElement('div');board.className='drag-board';
 board.innerHTML='<div class="drag-column sources"><div class="drag-label">العدد والرقم المطلوب</div></div><div class="drag-column targets"><div class="drag-label">القيمة المنزلية</div></div>';
 s.pairs.forEach((pair,i)=>{
  const b=document.createElement('button');b.className='drag-card'+(d.matches.includes(i)?' matched':'');b.type='button';b.dataset.card=i;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label','العدد '+fmt(pair.n)+'؛ الرقم '+digit(pair.n,pair.p)+' في '+places[pair.p]);b.innerHTML='<span class="num">'+marked(pair.n,pair.p)+'</span>';b.disabled=d.matches.includes(i);board.querySelector('.sources').append(b);
 });
 d.targets.forEach(i=>{const b=document.createElement('button');b.className='target'+(d.matches.includes(i)?' correct':'');b.type='button';b.dataset.drop=i;b.setAttribute('aria-label','القيمة '+fmt(s.pairs[i].value));b.textContent=fmt(s.pairs[i].value);b.disabled=d.matches.includes(i);board.querySelector('.targets').append(b);});
 root.append(board);root.insertAdjacentHTML('beforeend','<p class="drag-help">اسحب العدد إلى قيمته، أو القيمة إلى عددها. ويمكنك الضغط على بطاقة ثم البطاقة المطابقة لها.</p>');
 dragController=bindMatching(root,board,s,d);
}
function selectCard(i,board,d){
 if(d.matches.includes(i))return;d.selected=i;d.selectedValue=null;
 board.querySelectorAll('.target').forEach(b=>b.classList.remove('selected'));
 board.querySelectorAll('.drag-card').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.card)===i);b.setAttribute('aria-pressed',String(Number(b.dataset.card)===i));});
 updateCoach('اخترت العدد. الآن المس قيمته في العمود الآخر.');
}
function selectValue(i,board,d){
 if(d.matches.includes(i))return;d.selectedValue=i;d.selected=null;
 board.querySelectorAll('.drag-card').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
 board.querySelectorAll('.target').forEach(b=>b.classList.toggle('selected',Number(b.dataset.drop)===i));
 updateCoach('اخترت القيمة. الآن المس العدد الذي تنتمي إليه.');
}
function matchPair(from,to,s,board,d){
 if(isPassed()||d.matches.includes(to)||d.matches.includes(from))return;
 if(from===null||from===undefined){guide('اختر بطاقة أولًا، ثم البطاقة المطابقة لها.');return;}
 if(from===to){
  d.matches.push(from);const card=board.querySelector('[data-card="'+from+'"]'),target=board.querySelector('[data-drop="'+to+'"]');
  card.classList.remove('selected');card.classList.add('matched');card.disabled=true;target.classList.remove('selected','over');target.classList.add('correct');target.disabled=true;target.textContent=fmt(s.pairs[to].value);d.selected=null;d.selectedValue=null;
  if(d.matches.length===s.pairs.length)pass('وصلت كل رقم بقيمته الصحيحة. البيت هو الذي يحدد القيمة.');
  else{sound(true);haptic(true);$('feedback').className='feedback good';$('feedback').textContent='مطابقة صحيحة! أكمل البطاقات المتبقية.';updateCoach('رائع! اختر بطاقة أخرى، ثم صِلها ببطاقتها المطابقة.');}
 }else{
  const card=board.querySelector('[data-card="'+from+'"]');
  const target=board.querySelector('[data-drop="'+to+'"]');
  const correctTarget=board.querySelector('[data-drop="'+from+'"]');
  triggerDualHighlight(board,target,correctTarget);
  const pair=s.pairs[from];
  const chosenVal=s.pairs[to].value;
  const dig=digit(pair.n,pair.p);
  const chosenZeros=String(chosenVal).match(/0*$/)[0].length;
  const chosenP=Math.min(8,chosenZeros);
  const analysis={
   type:'match_mismatch',
   targetDigit:dig,
   number:pair.n,
   chosenVal:chosenVal,
   chosenZeros:chosenZeros,
   chosenPlace:chosenP,
   chosenPlaceName:places[chosenP],
   chosenLabel:fmt(chosenVal),
   targetVal:pair.value,
   targetZeros:pair.p,
   targetPlace:pair.p,
   targetPlaceName:places[pair.p],
   targetLabel:places[pair.p]+' ('+fmt(pair.value)+')',
   directObservation:'وصلت الرقم '+dig+' بالقيمة '+fmt(chosenVal)+' ('+places[chosenP]+' بـ '+ar(chosenZeros)+' أصفار).',
   visualComparison:'انظر إلى العدد '+fmt(pair.n)+': يوجد '+ar(pair.p)+' أرقام على يمين الرقم '+dig+' الملوّن.',
   guidance:'إذن قيمته الصحيحة هي '+fmt(pair.value)+' ('+places[pair.p]+' بـ '+ar(pair.p)+' أصفار).'
  };
  wrong('هذه ليست قيمة الرقم الملوّن ('+dig+'). عدّ الأرقام على يمينه في العدد.',target,analysis);
 }
}
function bindMatching(root,board,s,d){
 let gesture=null,lastPointer=0;
 const get=(kind,index)=>board.querySelector(kind==='card'?'[data-card="'+index+'"]':'[data-drop="'+index+'"]');
 const clearOver=()=>board.querySelectorAll('.over').forEach(el=>el.classList.remove('over'));
 function cancel(){
  const previous=gesture;
  gesture=null;
  if(previous){
   previous.ghost?.remove();
   const original=previous.originalEl||get(previous.kind,previous.index);
   original?.classList.remove('dragging-origin');
   if(previous.pointerId!==undefined&&root.hasPointerCapture(previous.pointerId)){
    try{root.releasePointerCapture(previous.pointerId);}catch(_){}
   }
  }
  clearOver();
 }
 function destination(event,g){
  const selector=g.kind==='card'?'[data-drop]':'[data-card]';
  const directEl=document.elementFromPoint(event.clientX,event.clientY)?.closest(selector);
  if(directEl&&board.contains(directEl)&&!directEl.disabled)return directEl;
  if(g&&g.ghost){
   const gr=g.ghost.getBoundingClientRect();
   const cx=gr.left+gr.width/2;
   const cy=gr.top+gr.height/2;
   const centerEl=document.elementFromPoint(cx,cy)?.closest(selector);
   if(centerEl&&board.contains(centerEl)&&!centerEl.disabled)return centerEl;
   const candidates=Array.from(board.querySelectorAll(selector)).filter(t=>!t.disabled);
   let best=null,maxArea=0;
   for(const t of candidates){
    const tr=t.getBoundingClientRect();
    const ox=Math.max(0,Math.min(gr.right,tr.right)-Math.max(gr.left,tr.left));
    const oy=Math.max(0,Math.min(gr.bottom,tr.bottom)-Math.max(gr.top,tr.top));
    const area=ox*oy;
    if(area>maxArea&&area>(tr.width*tr.height*0.2)){
     maxArea=area;
     best=t;
    }
   }
   if(best)return best;
  }
  return null;
 }
 function tap(kind,index){
  if(kind==='card'){
   if(d.selectedValue!==null)matchPair(index,d.selectedValue,s,board,d);
   else selectCard(index,board,d);
  }else{
   if(d.selected!==null)matchPair(d.selected,index,s,board,d);
   else selectValue(index,board,d);
  }
 }
 const handlers={
  pointerdown(event){
   const el=event.target.closest('[data-card],[data-drop]');
   if(!el||!board.contains(el)||el.disabled||gesture||event.button!==0||event.isPrimary===false)return;
   event.preventDefault();
   const kind=el.hasAttribute('data-card')?'card':'value';
   const index=Number(kind==='card'?el.dataset.card:el.dataset.drop);
   const rect=el.getBoundingClientRect();
   gesture={
    kind,
    index,
    pointerId:event.pointerId,
    startX:event.clientX,
    startY:event.clientY,
    grabOffsetX:event.clientX-rect.left,
    grabOffsetY:event.clientY-rect.top,
    width:rect.width,
    height:rect.height,
    moved:false,
    ghost:null,
    originalEl:el
   };
   try{root.setPointerCapture(event.pointerId);}catch(_){}
   el.focus({preventScroll:true});
  },
  pointermove(event){
   if(!gesture||gesture.pointerId!==event.pointerId)return;
   const g=gesture;
   if(!g.moved&&Math.hypot(event.clientX-g.startX,event.clientY-g.startY)>6){
    g.moved=true;
    const original=g.originalEl||get(g.kind,g.index);
    const ghost=original.cloneNode(true);
    ghost.removeAttribute('data-card');
    ghost.removeAttribute('data-drop');
    ghost.classList.add('drag-ghost');
    ghost.setAttribute('aria-hidden','true');
    ghost.tabIndex=-1;
    ghost.style.width=g.width+'px';
    ghost.style.height=g.height+'px';
    ghost.style.boxSizing='border-box';
    ghost.style.margin='0';
    ghost.style.transform='none';
    ghost.style.left=(event.clientX-g.grabOffsetX)+'px';
    ghost.style.top=(event.clientY-g.grabOffsetY)+'px';
    document.body.append(ghost);
    g.ghost=ghost;
    original.classList.add('dragging-origin');
   }
   if(g.ghost){
    g.ghost.style.left=(event.clientX-g.grabOffsetX)+'px';
    g.ghost.style.top=(event.clientY-g.grabOffsetY)+'px';
    clearOver();
    const target=destination(event,g);
    if(target)target.classList.add('over');
   }
  },
  pointerup(event){
   if(!gesture||gesture.pointerId!==event.pointerId)return;
   const g=gesture;
   const target=destination(event,g);
   lastPointer=performance.now()+700;
   const wasMoved=g.moved;
   const kind=g.kind;
   const index=g.index;
   cancel();
   if(wasMoved){
    if(target){
     const other=Number(kind==='card'?target.dataset.drop:target.dataset.card);
     matchPair(kind==='card'?index:other,kind==='card'?other:index,s,board,d);
    }
   }else{
    tap(kind,index);
   }
  },
  pointercancel(event){if(gesture?.pointerId===event.pointerId)cancel();},
  lostpointercapture(event){if(gesture?.pointerId===event.pointerId)cancel();},
  click(event){
   const el=event.target.closest('[data-card],[data-drop]');
   if(!el||!board.contains(el)||el.disabled)return;
   if(event.detail>0&&performance.now()<lastPointer)return;
   const kind=el.hasAttribute('data-card')?'card':'value';
   tap(kind,Number(kind==='card'?el.dataset.card:el.dataset.drop));
  }
 };
 for(const [type,handler] of Object.entries(handlers))root['on'+type]=handler;
 return {cancel,dispose(){cancel();for(const [type,handler]of Object.entries(handlers))if(root['on'+type]===handler)root['on'+type]=null;}};
}
function resetTaskInteractions(){
 clearTimeout(stepTimer);
 if(typeof BookAudio!=='undefined')BookAudio.reset();
 touchControllers.get($('mission-content'))?.dispose();
 dragController?.dispose();
 dragController=null;
 document.querySelectorAll('.mismatch-chosen, .mismatch-target, .sweep-active').forEach(el=>{
  el.classList.remove('mismatch-chosen','mismatch-target','sweep-active');
 });
 document.querySelectorAll('.mismatch-tag-badge, .sweep-badge-chip, .sweep-counter-bar').forEach(el=>el.remove());
}
function renderFields(s,root){
 const d=stepData();
 d.fields=d.fields||{};
 const terms=expansion(s.n);
 const numDigits=String(s.n).length;

 const monitor=document.createElement('div');
 monitor.className='fields-monitor';
 if(s.board)monitor.append(numberBoard(s.n));else monitor.insertAdjacentHTML('beforeend',bigNumberHTML(s.n));
 monitor.insertAdjacentHTML('beforeend','<div class="expanded-preview" aria-live="polite"></div>');
 root.append(monitor);

 const slices=[];
 const mTerms=terms.filter(t=>t.p>=6);
 if(mTerms.length>0){
  const zeroPlaces=[8,7,6].filter(p=>p<numDigits&&digit(s.n,p)===0);
  slices.push({key:'millions',name:'دورة الملايين',terms:mTerms,zeroPlaces});
 }
 const kTerms=terms.filter(t=>t.p>=3&&t.p<=5);
 if(kTerms.length>0){
  const zeroPlaces=[5,4,3].filter(p=>p<numDigits&&digit(s.n,p)===0);
  slices.push({key:'thousands',name:'دورة الألوف',terms:kTerms,zeroPlaces});
 }
 const oTerms=terms.filter(t=>t.p<=2);
 if(oTerms.length>0){
  const zeroPlaces=[2,1,0].filter(p=>p<numDigits&&digit(s.n,p)===0);
  slices.push({key:'ones',name:'دورة الآحاد',terms:oTerms,zeroPlaces});
 }

 if(s.prefill){
  for(const [p,val] of Object.entries(s.prefill)){
   d.fields[p]=fmt(val);
  }
 }

 const isTermOk=t=>parseNum(d.fields[t.p]||'')===t.value;
 const isSliceComplete=sl=>sl.terms.every(isTermOk);

 if(d.activeSlice===undefined){
  const firstInc=slices.findIndex(sl=>!isSliceComplete(sl));
  d.activeSlice=firstInc>=0?firstInc:0;
 }
 if(d.activeSlice>=slices.length)d.activeSlice=slices.length-1;

 const scaffold=document.createElement('div');
 scaffold.className='expanded-scaffold';

 const stepper=document.createElement('div');
 stepper.className='fields-slice-stepper';
 stepper.setAttribute('role','tablist');
 stepper.setAttribute('aria-label','خطوات تفكيك دورات العدد');
 slices.forEach((sl,idx)=>{
  const done=isSliceComplete(sl);
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='slice-tab-btn'+(idx===d.activeSlice?' active':'')+(done?' completed':'');
  btn.setAttribute('role','tab');
  btn.setAttribute('aria-selected',String(idx===d.activeSlice));
  btn.innerHTML=(done?'<span class="btn-svg">'+getIconSVG('check')+'</span>':ar(idx+1)+'. ')+sl.name;
  btn.addEventListener('click',()=>{
   d.activeSlice=idx;
   renderMission();
  });
  stepper.append(btn);
 });
 scaffold.append(stepper);

 const curSlice=slices[d.activeSlice];

 if(curSlice&&curSlice.zeroPlaces&&curSlice.zeroPlaces.length>0){
  const zNames=curSlice.zeroPlaces.map(p=>places[p]).join(' و');
  const callout=document.createElement('div');
  callout.className='zero-exclusion-callout';
  callout.setAttribute('role','note');
  callout.innerHTML='<span class="callout-icon">'+getIconSVG('lightbulb')+'</span><span>تعليمات الصيغة التحليلية: منزلة «'+zNames+'» تحوي الرقم (0)؛ الصفر لا يغيّر القيمة التحليلية وتبقى قيمته صفراً دائماً، لذلك استبعدناها من الحدود المكتوبة.</span>';
  scaffold.append(callout);
 }

 const tilesContainer=document.createElement('div');
 tilesContainer.className='expanded-tiles-list';
 const activeTermInSlice = curSlice.terms.find(x=>!isTermOk(x)) || curSlice.terms[curSlice.terms.length-1];
 const displayedTerms = isPassed() ? terms : (activeTermInSlice ? [activeTermInSlice] : curSlice.terms);

 displayedTerms.forEach(t=>{
  const dVal=digit(s.n,t.p);
  const given=s.prefill&&s.prefill[t.p]!==undefined;
  const isOk=isTermOk(t);

  const getZerosCount=()=>{
   const curVal=parseNum(d.fields[t.p]||'');
   if(curVal===null||curVal===0)return 0;
   const str=String(curVal);
   const m=str.match(/0*$/);
   return m?m[0].length:0;
  };

  let curZeros=getZerosCount();

  const tile=document.createElement('div');
  tile.className='expanded-tile'+(isOk?' tile-complete':'');
  tile.id='tile-p-'+t.p;

  const showChips = (d.hintTier||0) >= 3;
  tile.innerHTML='<div class="tile-head-row">'
   +'<span class="tile-place-title">'+places[t.p]+'</span>'
   +'<span class="tile-digit-badge">الرقم في العدد: <b>'+dVal+'</b></span>'
   +(isOk?'<span class="tile-check-icon" style="color:#2b7a0b;font-weight:700">'+getIconSVG('check')+' مؤكدة</span>':'')
   +'</div>'
   +'<div class="tile-zeros-builder" id="zb-'+t.p+'">'
   +'<div class="live-zero-representation" id="rep-'+t.p+'" title="المس الرقم لإضافة صفر">'
   +'<span class="rep-base">'+dVal+'</span>'
   +'<span class="rep-zeros" id="rep-zeros-'+t.p+'">'+'0'.repeat(curZeros)+'</span>'
   +'</div>'
   +'<div class="live-math-formula" id="formula-'+t.p+'">'
   +dVal+' × '+fmt(10**curZeros)+' = <bdi class="num">'+fmt(dVal*10**curZeros)+'</bdi>'
   +'</div>'
   +'</div>'
   +'<div class="tile-zero-controls">'
   +'<div class="tile-zero-btn-group">'
   +'<button type="button" class="zero-step-btn" data-zact="minus" aria-label="إنقاص صفر">− صفر</button>'
   +'<span class="zero-count-display" id="zcnt-'+t.p+'">'+ar(curZeros)+' أصفار</span>'
   +'<button type="button" class="zero-step-btn" data-zact="plus" aria-label="زيادة صفر">+ صفر</button>'
   +'</div>'
   +'<div class="quick-zero-chips" '+(showChips?'':'hidden')+'>'
   +'<button type="button" class="quick-chip" data-zval="0">بلا أصفار</button>'
   +'<button type="button" class="quick-chip" data-zval="3">000</button>'
   +'<button type="button" class="quick-chip" data-zval="'+t.p+'">المطلوب ('+ar(t.p)+')</button>'
   +'</div>'
   +'</div>'
   +'<div class="tile-input-row">'
   +'<label for="input-p-'+t.p+'">القيمة التحليلية:</label>'
   +'<input type="text" id="input-p-'+t.p+'" inputmode="numeric" maxlength="20" data-term="'+t.p+'" value="'+esc(d.fields[t.p]||'')+'" '+(given||isPassed()?'readonly':'')+' aria-label="قيمة '+places[t.p]+'">'
   +'<button type="button" class="confirm-tile-action" data-action-confirm="'+t.p+'" '+(isPassed()?'disabled':'')+'>'
   +'<span>'+(isOk?'مؤكدة':'تحقّق من المنزلة')+'</span>'
   +'</button>'
   +'</div>';

  const input=tile.querySelector('input');
  const repZeros=tile.querySelector('#rep-zeros-'+t.p);
  const repFormula=tile.querySelector('#formula-'+t.p);
  const zcnt=tile.querySelector('#zcnt-'+t.p);

  const syncZerosUI=()=>{
   repZeros.textContent='0'.repeat(curZeros);
   repFormula.innerHTML=dVal+' × '+fmt(10**curZeros)+' = <bdi class="num">'+fmt(dVal*10**curZeros)+'</bdi>';
   zcnt.textContent=ar(curZeros)+' أصفار';
  };

  const setZeros=(newZ)=>{
   if(isPassed()||given)return;
   curZeros=Math.max(0,Math.min(8,newZ));
   const newVal=dVal*10**curZeros;
   input.value=fmt(newVal);
   d.fields[t.p]=input.value;
   syncZerosUI();
   updateFieldsMonitorPreview();
  };

  tile.querySelector('[data-zact="plus"]')?.addEventListener('click',()=>setZeros(curZeros+1));
  tile.querySelector('[data-zact="minus"]')?.addEventListener('click',()=>setZeros(curZeros-1));
  tile.querySelector('#rep-'+t.p)?.addEventListener('click',()=>setZeros(curZeros+1));

  tile.querySelectorAll('.quick-chip').forEach(btn=>{
   btn.addEventListener('click',()=>{
    const zval=Number(btn.dataset.zval);
    if(zval===t.p){
     markStepAssisted('quick_chip_required_zeros');
    }
    setZeros(zval);
   });
  });

  input.addEventListener('input',()=>{
   d.fields[t.p]=input.value;
   curZeros=getZerosCount();
   syncZerosUI();
   updateFieldsMonitorPreview();
  });

  const confirmTerm=()=>{
   if(isPassed())return;
   const parsed=parseNum(input.value);
   if(parsed===t.value){
    sound(true);haptic(true);
    d.fields[t.p]=fmt(t.value);
    input.classList.add('good');
    tile.classList.add('tile-complete');
    updateFieldsMonitorPreview();
    saveState();

    if(terms.every(isTermOk)){
     pass('صيغة تحليلية دقيقة ومكتملة! مجموع القيم المنزلية يطابق العدد '+fmt(s.n)+'.');
     renderMission();
     return;
    }

    const unconfirmedInSlice=curSlice.terms.find(x=>!isTermOk(x));
    if(unconfirmedInSlice){
     guide('أحسنت! الإجابة صحيحة. والآن إلى المنزلة التالية: «'+places[unconfirmedInSlice.p]+'».',3000);
     renderMission();
     setTimeout(()=>{
      const nextIn=root.querySelector('#input-p-'+unconfirmedInSlice.p);
      nextIn?.focus();
     },80);
    }else{
     if(d.activeSlice<slices.length-1){
      d.activeSlice++;
      guide('أحسنت! اكتملت '+curSlice.name+'، والآن ننتقل إلى '+slices[d.activeSlice].name+'!',3500);
      renderMission();
      setTimeout(()=>{
       const firstNewIn=root.querySelector('.expanded-tile input:not([readonly])');
       firstNewIn?.focus();
      },80);
     }
    }
   }else{
    const entZeros=curZeros;
    const analysis={
     type:'fields_mismatch',
     targetDigit:dVal,
     number:s.n,
     chosenVal:parsed||0,
     chosenZeros:entZeros,
     chosenPlace:t.p,
     chosenPlaceName:places[t.p],
     chosenLabel:fmt(parsed||0),
     targetVal:t.value,
     targetZeros:t.p,
     targetPlace:t.p,
     targetPlaceName:places[t.p],
     targetLabel:places[t.p]+' ('+fmt(t.value)+')',
     directObservation:'كتبت '+fmt(parsed||0)+' ('+ar(entZeros)+' أصفار).',
     visualComparison:'انظر إلى العدد: الرقم '+dVal+' في منزلة '+places[t.p]+' وعلى يمينه '+ar(t.p)+' منازل.',
     guidance:'إذن يحتاج إلى '+ar(t.p)+' أصفار وتكون قيمته '+fmt(t.value)+' في الصيغة التحليلية.'
    };
    wrong('قيمة الرقم '+dVal+' في منزلة '+places[t.p]+' تحتاج إلى '+ar(t.p)+' أصفار.',input,analysis);
   }
  };

  tile.querySelector('[data-action-confirm]')?.addEventListener('click',confirmTerm);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();confirmTerm();}});

  tilesContainer.append(tile);
 });

 scaffold.append(tilesContainer);
 root.append(scaffold);

 function updateFieldsMonitorPreview(){
  const parts=terms.map(t=>parseNum(d.fields[t.p]||''));
  const prev=monitor.querySelector('.expanded-preview');
  if(prev)prev.innerHTML='<span>'+fmt(s.n)+' =</span>'+parts.map(n=>'<span class="term">'+(n===null?'□':fmt(n))+'</span>').join('<span>+</span>');
 }

 updateFieldsMonitorPreview();
}
function updateExpansionPreview(form,s,monitor){const parts=[...form.querySelectorAll('input')].map(x=>parseNum(x.value));const prev=(monitor||form).querySelector('.expanded-preview');if(prev)prev.innerHTML='<span>'+fmt(s.n)+' =</span>'+parts.map(n=>'<span class="term">'+(n===null?'□':fmt(n))+'</span>').join('<span>+</span>');}
function renderMissing(s,root){
 const d=stepData(),p=s.p??4,before=s.before||'1,000,000 + 400,000 +',after=s.after||'+ 5,000 + 600 + 80 + 9';
 const dig=digit(s.n,p),correctVal=s.answer!==undefined?s.answer:dig*10**p;
 if(!d.options||!Array.isArray(d.options)||d.options.length<4){
  const optsSet=new Set();
  optsSet.add(correctVal);
  if(p>0)optsSet.add(dig*10**(p-1));
  if(p<8)optsSet.add(dig*10**(p+1));
  if(p>1)optsSet.add(dig*10**(p-2));
  if(p<7)optsSet.add(dig*10**(p+2));
  optsSet.add(dig*10);
  optsSet.add(dig);
  const genOpts=[correctVal];
  for(const v of optsSet){
   if(v!==correctVal&&genOpts.length<4)genOpts.push(v);
  }
  d.options=genOpts.sort(()=>Math.random()-.5);
 }
 const badgeHtml='<div class="missing-target-box"><span class="missing-target-badge">الرقم المطلوب تحديده: <strong>'+dig+'</strong> في منزلة <strong>'+places[p]+'</strong></span></div>';
 const eqHtml='<div class="missing-equation"><span>'+marked(s.n,p)+' =</span><span>'+esc(before)+'</span><input id="missing-number" type="text" inputmode="numeric" maxlength="20" value="'+esc(d.value||'')+'" aria-label="الحد المفقود"><span>'+esc(after)+'</span></div>';
 const showOpts = isPassed() || (d.hintTier||0) >= 3;
 const optsHtml='<div class="missing-options-section" '+(showOpts?'':'hidden')+'><div class="missing-options-title">اختر قيمة الحد المفقود أو اكتبها:</div><div class="missing-options-grid">'+d.options.map(val=>'<button type="button" class="missing-opt-btn'+(d.value==val?' active':'')+'" data-missing-val="'+val+'" '+(isPassed()?'disabled':'')+'>'+fmt(val)+'</button>').join('')+'</div></div>';
 root.insertAdjacentHTML('beforeend','<form id="missing-form" novalidate>'+badgeHtml+eqHtml+optsHtml+'<div class="check-row"><button class="primary" type="submit">أكمل المجموع</button></div></form>');
 const input=$('missing-number');
 input.disabled=isPassed();
 root.querySelector('button[type="submit"]').disabled=isPassed();
 const updateOptButtons=(val)=>{
  root.querySelectorAll('.missing-opt-btn').forEach(btn=>{
   btn.classList.toggle('active',btn.getAttribute('data-missing-val')===String(val));
  });
 };
 root.querySelectorAll('.missing-opt-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
   const val=btn.getAttribute('data-missing-val');
   input.value=fmt(Number(val));
   d.value=val;
   input.removeAttribute('aria-invalid');
   updateOptButtons(val);
   sound(true);
   saveState();
  });
 });
 input.addEventListener('input',()=>{
  d.value=input.value;
  input.removeAttribute('aria-invalid');
  updateOptButtons(parseNum(input.value));
 });
 $('missing-form').addEventListener('submit',e=>{
  e.preventDefault();
  if(parseNum(input.value)===s.answer){
   pass('الحد المفقود هو '+fmt(s.answer)+'؛ قيمة الرقم '+dig+' في '+places[p]+'.');
   input.classList.add('good');
   input.disabled=true;
   root.querySelector('button[type="submit"]').disabled=true;
   root.querySelectorAll('.missing-opt-btn').forEach(b=>b.disabled=true);
  }else{
   input.setAttribute('aria-invalid','true');
   wrong('مجموع الحدود المعطاة لا يطابق العدد المطلوب. راجع منزلة الرقم '+dig+' ('+places[p]+').');
  }
 });
}
function renderError(s,root){const d=stepData(),p=s.p??6,badVal=s.terms[s.wrong],dig=digit(s.n,p);root.insertAdjacentHTML('beforeend',bigNumberHTML(s.n)+'<div class="error-terms"></div>');const terms=root.querySelector('.error-terms');s.terms.forEach((n,i)=>{const b=document.createElement('button');b.type='button';b.dataset.errorTerm=i;b.textContent=fmt(n);b.disabled=!!d.found||isPassed();if(d.found&&i===s.wrong)b.classList.add('correct');b.addEventListener('click',()=>{if(i===s.wrong){d.found=true;b.classList.add('correct');terms.querySelectorAll('button').forEach(x=>x.disabled=true);$('correction').hidden=false;$('correction-number').focus();$('feedback').className='feedback good';$('feedback').textContent='وجدت الحد الخاطئ! اكتب قيمته الصحيحة لتكمل المهمة.';sound(true);saveState();}else wrong('هذا الحد صحيح. ابحث عن القيمة التي لا تناسب منزلة الرقم '+dig+'.');});terms.append(b);});root.insertAdjacentHTML('beforeend','<form id="correction" class="correction" novalidate '+(d.found?'':'hidden')+'><label for="correction-number">ما القيمة الصحيحة بدلًا من '+fmt(badVal)+'؟</label><input id="correction-number" type="text" inputmode="numeric" maxlength="20" value="'+esc(d.correction||'')+'"><div class="check-row"><button class="primary" type="submit">صحّح الحل</button></div></form>');const input=$('correction-number');input.disabled=isPassed();$('correction').querySelector('button').disabled=isPassed();input.addEventListener('input',()=>{d.correction=input.value;input.removeAttribute('aria-invalid');});$('correction').addEventListener('submit',e=>{e.preventDefault();if(parseNum(input.value)===s.correct){pass('الصحيح '+fmt(s.correct)+' بدل '+fmt(badVal)+'؛ لأن الرقم '+dig+' في '+places[p]+'.');input.classList.add('good');input.disabled=true;$('correction').querySelector('button').disabled=true;}else{input.setAttribute('aria-invalid','true');wrong('الرقم '+dig+' يقع في منزلة '+places[p]+'. عدّ المنازل التي تقع على يمينه.');}});}
function makeRapidQuestions(){const source=[2051841,149598428,10579747,57909050];return[{n:783596015,p:7},...source.sort(()=>Math.random()-.5).map(n=>{const ps=expansion(n).map(t=>t.p);return{n,p:ps[Math.floor(Math.random()*ps.length)]};})].map(q=>{const value=digit(q.n,q.p)*10**q.p,ps=[q.p,(q.p+1)%9,(q.p+2)%9];return{...q,value,options:ps.map(p=>digit(q.n,q.p)*10**p).sort(()=>Math.random()-.5)};});}
function renderRapid(s,root){let area=document.createElement('div');area.id='rapid-area';root.append(area);drawRapid();}
function drawRapid(){const d=stepData(),area=$('rapid-area');if(!area)return;const run=d.run;area.replaceChildren();if(!run){area.innerHTML='<div class="rapid-intro"><span class="rocket-symbol" aria-hidden="true">'+getIconSVG('rocket')+'</span><h3>جاهز للانطلاق؟</h3><p>5 جولات، و18 ثانية لكل جولة.<br>أجب عن 4 أسئلة على الأقل لتنجح.</p><label class="check-label"><input type="checkbox" id="untimed"> ألعب بلا مؤقت</label><button type="button" class="primary" id="rapid-start">أطلق الصاروخ</button></div>';$('rapid-start').addEventListener('click',()=>{d.run={questions:makeRapidQuestions(),round:0,correct:0,streak:0,maxStreak:0,remaining:18,timed:!$('untimed').checked,running:false,answered:false,done:false};drawRapid();startRapidClock();});return;}
 if(run.done){const win=run.correct>=4;area.innerHTML='<div class="rapid-result"><span class="rocket-symbol" aria-hidden="true">'+(win?getIconSVG('trophy'):getIconSVG('rocket'))+'</span><h3>'+ar(run.correct)+' من 5 إجابات صحيحة</h3><p>'+(win?'وصل صاروخك بنجاح!':'اقتربت! نحتاج إلى أربع إجابات صحيحة. جرّب مرة أخرى، ويمكنك إلغاء المؤقت.')+'</p><p>أطول سلسلة: '+ar(run.maxStreak)+' <span class="btn-svg">'+getIconSVG('flame','gold')+'</span></p><button type="button" id="rapid-retry" class="secondary">ألعب مرة أخرى</button></div>';$('rapid-retry').addEventListener('click',()=>{pauseRapid();d.run=null;drawRapid();$('feedback').className='feedback';$('feedback').textContent=isPassed()?'يمكنك إعادة اللعب. نقاط هذه المهمة تُحتسب مرة واحدة فقط.':'لنحاول مرة أخرى. التلميح يساعدك.';});return;}
 const q=run.questions[run.round];area.innerHTML='<div class="rapid-info"><span>الجولة '+ar(run.round+1)+' / 5</span><span><span class="btn-svg">'+getIconSVG('flame','gold')+'</span>سلسلة '+ar(run.streak)+'</span><span id="rapid-time">'+(run.timed?Math.ceil(run.remaining)+' ثانية':'بلا مؤقت')+'</span></div><div class="timer-line" '+(!run.timed?'hidden':'')+'><i id="timer-fill"></i></div><div class="big-number">'+marked(q.n,q.p)+'</div><div class="answers" id="rapid-answers"></div><div class="rapid-tools"><button type="button" id="rapid-pause" '+(!run.timed||run.answered?'hidden':'')+'>'+(!run.running?'▶ استئناف المؤقت':'Ⅱ إيقاف المؤقت')+'</button><button type="button" id="rapid-round-next" class="primary" '+(!run.answered?'hidden':'')+'>'+(run.round===4?'نتيجة الرحلة':'الجولة التالية ←')+'</button></div>';q.options.forEach(value=>{const b=document.createElement('button');b.type='button';b.className='answer numeric';b.dataset.rapidValue=value;b.textContent=fmt(value);b.disabled=run.answered;if(run.answered&&value===q.value)b.classList.add('correct');if(run.answered&&value===run.chosen&&value!==q.value)b.classList.add('wrong');b.addEventListener('click',()=>answerRapid(value));$('rapid-answers').append(b);});$('rapid-pause').addEventListener('click',()=>{if(run.running){pauseRapid();drawRapid();}else startRapidClock();});$('rapid-round-next').addEventListener('click',()=>{if(run.round===4){run.done=true;drawRapid();if(run.correct>=4){if(isPassed()){guide('نجحت من جديد! نقاط المهمة محفوظة ولا تتكرر.');updateNext();}else pass('صاروخ ناجح: '+ar(run.correct)+' إجابات صحيحة من 5.');}else{$('feedback').className='feedback bad';$('feedback').textContent='تحتاج إلى 4 إجابات صحيحة. يمكنك إعادة اللعب دون فقدان نقاطك.';guide('المحاولة الجديدة فرصة جديدة. يمكنك اللعب بلا مؤقت.');}}else{run.round++;run.answered=false;run.chosen=null;run.remaining=18;drawRapid();startRapidClock();}});updateRapidTimer();}
function updateRapidTimer(){const run=stepData().run;if(!run||!$('rapid-time'))return;$('rapid-time').textContent=run.timed?Math.ceil(run.remaining)+' ثانية':'بلا مؤقت';if($('timer-fill'))$('timer-fill').style.width=run.remaining/18*100+'%';}
function startRapidClock(){const run=stepData().run;if(!run||run.done||run.answered||!run.timed)return;clearInterval(rapidTimer);run.running=true;run.end=performance.now()+run.remaining*1000;if($('rapid-pause'))$('rapid-pause').textContent='Ⅱ إيقاف المؤقت';rapidTimer=setInterval(()=>{run.remaining=Math.max(0,(run.end-performance.now())/1000);updateRapidTimer();if(run.remaining===0)answerRapid(null);},150);}
function pauseRapid(){clearInterval(rapidTimer);rapidTimer=null;for(const r of state.records)for(const d of Object.values(r.data)){const run=d.run;if(run?.running){run.remaining=Math.max(0,(run.end-performance.now())/1000);run.running=false;}}}
function answerRapid(value){const run=stepData().run;if(!run||run.answered||run.done)return;pauseRapid();const q=run.questions[run.round];run.answered=true;run.chosen=value;const correct=value===q.value;if(correct){run.correct++;run.streak++;run.maxStreak=Math.max(run.maxStreak,run.streak);sound(true);$('feedback').className='feedback good';$('feedback').textContent='صحيح! '+digit(q.n,q.p)+' × '+fmt(10**q.p)+' = '+fmt(q.value)+'.';}else{run.streak=0;const reason=(value===null?'انتهى الوقت. ':'')+'الرقم في '+places[q.p]+'، وقيمته '+fmt(q.value)+'.';if(isPassed()){$('feedback').className='feedback bad';$('feedback').textContent=reason;}else wrong(reason);}drawRapid();}

const lessonSlides=[
 {tab:'فكرة الدرس',type:'street',n:645230697,caption:'تخيّل العدد شارعًا، وكل رقم يسكن بيتًا. اسم البيت هو «المنزلة».'},
 {tab:'فكرة الدرس',type:'board',n:645230697,caption:'كل ثلاثة بيوت تكوّن «دورة». من اليمين: الآحاد، ثم الألوف، ثم الملايين.'},
 {tab:'أستكشف',type:'city',n:10579747,caption:'في نهاية 2019، كان العدد المقدّر لسكان المملكة 10,579,747 نسمة، كما ورد في الكتاب.'},
 {tab:'أستكشف',type:'board',n:10579747,caption:'نضع كل رقم في بيته. أرقام هذا العدد موزّعة على ثلاث دورات. جرّب قيمها في «تجارب إضافية».'},
 {tab:'أتعلّم',type:'board',n:645230697,caption:'نفصل العدد إلى 645 | 230 | 697. لا نغيّر الأرقام؛ نرتّبها في دورات ليسهل قراءتها.'},
 {tab:'أتعلّم',type:'place-rule',n:645230697,caption:'كل بيت إلى اليسار قيمته عشرة أمثال البيت السابق. قيمة الرقم = الرقم × قيمة المنزلة.'},
 {tab:'مثال 1',type:'board',n:2051841,drop:true,caption:'المثال الأول: 2,051,841. تسقط الأرقام في منازلها، بدءًا من الآحاد في اليمين.'},
 {tab:'مثال 1',type:'board',n:2051841,p:4,caption:'نضيء الرقم 5. بيته هو «عشرات الألوف».'},
 {tab:'مثال 1',type:'count',n:2051841,p:4,caption:'على يمين 5 أربعة أرقام: 1، ثم 8، ثم 4، ثم 1. إذن نحتاج إلى أربعة أصفار.'},
 {tab:'مثال 1',type:'zeros',n:2051841,p:4,caption:'نُلحق أربعة أصفار بالرقم 5، فتصبح قيمته 50,000. الرقم لم يتغيّر، لكننا كتبنا قيمته.'},
 {tab:'مثال 2',type:'space',n:149598428,planet:'الأرض',caption:'المسافة التقريبية بين الأرض والشمس في مثال الكتاب هي 149,598,428 كيلومترًا.'},
 {tab:'مثال 2',type:'board',n:149598428,drop:true,caption:'دورة الملايين: 149. دورة الألوف: 598. دورة الآحاد: 428.'},
 {tab:'مثال 2',type:'words',n:149598428,caption:'هذه الصيغة اللفظية: نكتب العدد بالكلمات، ونصل الدورات بحرف الواو.'},
 {tab:'مثال 2',type:'expanded',n:149598428,caption:'هذه الصيغة التحليلية: كل حد هو قيمة رقم. مجموع الحدود يعيد العدد الأصلي.'},
 {tab:'أتحقّق',type:'board',n:783596015,p:7,caption:'أتحقّق من فهمي: ما قيمة الرقم 8 المسطّر في 783,596,015؟ ستجيبه في المهام الأخيرة.'},
 {tab:'أتحقّق',type:'space',n:57909050,planet:'عطارد',caption:'عطارد أصغر كواكب المجموعة الشمسية وأقربها إلى الشمس. المسافة في الكتاب نحو 57,909,050 كيلومترًا. سنكتب العدد بالكلمات وبالتحليل.'}
];
const trainingSlides=[
 {tab:'أراجع',type:'board',n:3944727,caption:'كل رقم له بيت. اقرأ الرقم، ثم اسم منزلته، ثم اكتب قيمته. سنملأ لوحة هذا العدد في السؤال 13.'},
 {tab:'أراجع',type:'zeros',n:1053225,p:3,caption:'في 1,053,225، على يمين 3 ثلاثة أرقام. نلحق ثلاثة أصفار، فتكون قيمته 3,000.'},
 {tab:'العين',type:'eye',n:4927500,caption:'السؤال 11: يرمش الإنسان حوالي 4,927,500 رمشة في السنة، وفق العدد المذكور في الكتاب. سنكتب العدد بصيغتين.'},
 {tab:'العين',type:'words',n:4927500,caption:'نقرأ دوراته: 4 ملايين، و927 ألفًا، و500. لاحظ أن المنازل الصفرية لا تحتاج حدودًا في التحليل.'},
 {tab:'السفر',type:'airport',n:1053225,caption:'سفر: استقبل مطار الملكة علياء الدولي 1,053,225 مسافرًا خلال آب 2019. هذا هو عدد السؤال 14.'},
 {tab:'السفر',type:'airport-info',n:1983,caption:'معلومة الكتاب: أُنشئ مطار الملكة علياء الدولي عام 1983، وسُمّي تخليدًا لذكرى الملكة علياء الحسين التي توفيت في حادث طيران.'},
 {tab:'أتذكّر',type:'compare',caption:'قد يطول العدد وتبقى قيمة رقم فيه كما هي. انظر إلى الأرقام التي على يمين الرقم، لا إلى طول العدد كله.'},
 {tab:'أتذكّر',type:'place-rule',n:645230697,caption:'دورة الملايين تتكوّن من آحاد الملايين وعشرات الملايين ومئات الملايين. والقاعدة دائمًا: الرقم × قيمة المنزلة.'}
];
