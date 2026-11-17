/* Application State, Persistence, Curriculum Nodes & Test Mode */
const STORAGE_KEY='rihlat_almalayeen_state_v1';
function getLocalDateString(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function ensureAiQuizDay(){
 const today=getLocalDateString();
 if(!state.aiQuiz||typeof state.aiQuiz!=='object'){
  state.aiQuiz={day:today,rewarded:0,seen:[]};
 }else{
  if(typeof state.aiQuiz.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(state.aiQuiz.day)||state.aiQuiz.day!==today){
   state.aiQuiz.day=today;state.aiQuiz.rewarded=0;
  }
  if(typeof state.aiQuiz.rewarded!=='number'||state.aiQuiz.rewarded<0||!Number.isFinite(state.aiQuiz.rewarded)){
   state.aiQuiz.rewarded=0;
  }
  if(!Array.isArray(state.aiQuiz.seen)){
   state.aiQuiz.seen=[];
  }else if(state.aiQuiz.seen.length>100){
   state.aiQuiz.seen=state.aiQuiz.seen.slice(-100);
  }
 }
}
function createDefaultOnboarding(){
 return{
  warmupDone:false,
  q1:{answered:false,firstAttemptCorrect:false,usedHelp:false,attempts:0,lastChoice:null},
  q2:{answered:false,firstAttemptCorrect:false,usedHelp:false,attempts:0,lastChoice:null},
  pathChosen:null,
  reviewBypassed:false,
  reviewStep:0,
  reviewQ1Done:false,
  reviewQ2Done:false,
  reviewDone:false,
  bridgeLevel:0,
  bridgeCardsCollected:[0,0,0],
  bridgeMerged:[false,false,false],
  gradualStep:0,
  selectedHousePlace:6,
  bridgeDone:false,
  reviewSlidesMode:false,
  station1Phase:'warmup_q1'
 };
}
const state={scene:0,cursors:[0,0],completed:new Set(),records:[],hearts:3,errors:0,muted:false,story:[0,0],flipping:false,finished:false,studentName:'',skillStats:{place:{ok:0,err:0,independentOk:0,assistedOk:0},verbal:{ok:0,err:0,independentOk:0,assistedOk:0},standard:{ok:0,err:0,independentOk:0,assistedOk:0},expanded:{ok:0,err:0,independentOk:0,assistedOk:0}},infiniteMode:false,infiniteSkill:'all',infiniteStep:null,infiniteRecord:{index:0,passed:new Set(),data:{},lastMessage:''},infiniteStats:{solved:0,streak:0,maxStreak:0,bonusPoints:0},aiQuiz:{day:getLocalDateString(),rewarded:0,seen:[]},viewMode:'map',runnerStep:null,mapSubView:'lesson1',unitProjectDone:false,activeNode:0,nodesCompleted:new Set(),nodeStars:{},viewedSlides:[new Set(),new Set()],returnNode:null,rechargeSolved:false,streak:0,maxSessionStreak:0,badges:new Set(),produceBadges:{read:'none',explain:'none'},onboarding:createDefaultOnboarding(),expandedStages:new Set([0])};
const PATH_STAGES=[
 {id:0,num:1,title:'أتذكّر وأكتشف',rangeLabel:'المحطات 1-3',sub:'التهيئة القصيرة، وجسر البطاقات إلى الملايين، وملعب الأعداد، وسكان المملكة',nodeIds:[0,1,2],cls:'u1'},
 {id:1,num:2,title:'أفهم المنزلة والقيمة',rangeLabel:'المحطات 4-6',sub:'تحديد منزلة الرقم الملوّن وسر الأصفار لإيجاد القيمة المنزلية',nodeIds:[3,4,5],cls:'u1'},
 {id:2,num:3,title:'أقرأ العدد وأكتبه',rangeLabel:'المحطات 7-10',sub:'الصيغ القياسية واللفظية والتحليلية، وبوابة التحقق السريع',nodeIds:[6,7,8,9],cls:'u1'},
 {id:3,num:4,title:'أتدرّب خطوة خطوة',rangeLabel:'المحطات 11-16',sub:'تطبيقات متدرجة على القيمة المنزلية والصيغ الثلاث من تدريبات الكتاب',nodeIds:[10,11,12,13,14,15],cls:'u2'},
 {id:4,num:5,title:'أطبّق وأفسّر',rangeLabel:'المحطات 17-21',sub:'المسائل الحياتية، والتبرير، واكتشاف الخطأ، وبطاقة خروج الدرس',nodeIds:[16,17,18,19,20],cls:'u2'}
];
function getStageForNode(nodeId){
 return PATH_STAGES.find(st=>st.nodeIds.includes(nodeId))||PATH_STAGES[0];
}
const PATH_NODES=[
 {id:0,unit:0,type:'story',icon:'book',tag:'تهيئة وجسر الملايين',title:'1. فكرة الدرس وأستكشف',sub:'التهيئة القصيرة وجسر البطاقات لاكتشاف الملايين خطوة خطوة',slides:[0,1,2,3,4,5]},
 {id:1,unit:0,type:'playground',icon:'hand',tag:'ملعب الأعداد',title:'2. ملعب الأعداد التفاعلي',sub:'أنجز 3 تحديات في الملعب لفتح التمارين ومسودة الملعب',questsRequired:3},
 {id:2,unit:0,type:'mission',icon:'city',tag:'مهمة',title:'3. ورشة سكان المملكة',sub:'أصلح لوحة عدد سكان المملكة في فقرة أستكشف',missionId:2},
 {id:3,unit:0,type:'story',icon:'sparkle',tag:'شرح · 4 شرائح',title:'4. مثال 1 وسر الأصفار',sub:'تعلّم كيف نحدد منزلة الرقم وقيمته المنزلية',slides:[6,7,8,9],showMagic:true},
 {id:4,unit:0,type:'mission',icon:'target',tag:'مهمة',title:'5. أين يسكن الرقم؟',sub:'حدّد منزلة الرقم الملوّن في لوحة المنازل',missionId:0},
 {id:5,unit:0,type:'mission',icon:'numbers',tag:'مهمة',title:'6. سر الأصفار الأربعة',sub:'حوّل الرقم إلى قيمته المنزلية بإلحاق الأصفار',missionId:1},
 {id:6,unit:0,type:'story',icon:'rocket',tag:'شرح · 6 شرائح',title:'7. مثال 2 والصيغ الثلاث',sub:'المسافة إلى الشمس وعطارد بالصيغ القياسية واللفظية والتحليلية',slides:[10,11,12,13,14,15],showExperiments:true},
 {id:7,unit:0,type:'mission',icon:'sun',tag:'مهمة',title:'8. رحلة من الأرض إلى الشمس',sub:'اقرأ العدد 149,598,428 واكتشف صيغتيه',missionId:3},
 {id:8,unit:0,type:'mission',icon:'link',tag:'مهمة',title:'9. أتحقّق: صِل واكتشف',sub:'طابق القيم المنزلية واكتب عدد كوكب عطارد بصيغتين',missionId:4},
 {id:9,unit:0,type:'mission',icon:'trophy',tag:'بوابة الفصل',title:'10. صاروخ التحقق السريع',sub:'أجب عن 4 من 5 جولات لتختم الدرس وتفتح فصل التدريب!',missionId:5},
 {id:10,unit:1,type:'story',icon:'book',tag:'مراجعة',title:'11. مراجعة المنازل والأصفار',sub:'راجع خطوات تحديد المنزلة وعدد الأصفار قبل التدريبات',slides:[0,1]},
 {id:11,unit:1,type:'mission',icon:'target',tag:'تدريب 1-3',title:'12. عين على المنزلة',sub:'أجب عن الأسئلة 1 و2 و3 لتحديد القيمة المنزلية',missionId:6},
 {id:12,unit:1,type:'mission',icon:'bridge',tag:'تدريب 4',title:'13. جسور الرقم سبعة',sub:'صِل كل عدد بقيمة الرقم 7 الملوّن فيه',missionId:7},
 {id:13,unit:1,type:'story',icon:'eye',tag:'معلومة',title:'14. معلومة رمشة العين والصيغ',sub:'تعرّف على عدد رمشات العين في السنة وكيف نقرأ الدورات',slides:[2,3]},
 {id:14,unit:1,type:'mission',icon:'speech',tag:'تدريب 5-7، 11',title:'15. أعداد تقول حكايات',sub:'اكتب الصيغتين اللفظية والتحليلية للأعداد',missionId:8},
 {id:15,unit:1,type:'mission',icon:'lock',tag:'تدريب 8-10',title:'16. خزائن الكلمات',sub:'حوّل الكلمات إلى أرقام قياسية وصيغ تحليلية',missionId:9},
 {id:16,unit:1,type:'story',icon:'plane',tag:'معلومة',title:'17. مطار الملكة علياء الدولي',sub:'اقرأ معلومة المطار وعدد المسافرين قبل حل مسائل الصفحة 11',slides:[4,5]},
 {id:17,unit:1,type:'mission',icon:'puzzle',tag:'تدريب 12-15',title:'18. أكمل لوحة الأعداد',sub:'الحد المفقود، ولوحة المنازل، ومسألة المطار والسكان',missionId:10},
 {id:18,unit:1,type:'story',icon:'brain',tag:'تفكير عليا',title:'19. التبرير ودورة الملايين',sub:'قارن القيمة المنزلية في عددين مختلفين في الطول',slides:[6,7]},
 {id:19,unit:1,type:'mission',icon:'search',tag:'الختام والشهادة',title:'20. محقّق الأعداد والتحدي المفتوح',sub:'اكتشف خطأ سميرة وبرّر إجابتك لتستلم الشهادة وتفتح التحدي المتجدد!',missionId:11},
 {id:20,unit:1,type:'exit_ticket',icon:'target',tag:'التقييم المستقل المعتمد',title:'21. بطاقة خروج الدرس',sub:'خمسة أسئلة مستقلة تقيس إتقانك لأهداف الدرس الخمسة بالتساوي (100%)',requiredNodes:[19]}
];
document.addEventListener("DOMContentLoaded",()=>{const banner=document.getElementById("test-mode-banner");const toggle=document.getElementById("test-mode-toggle");const label=banner?.querySelector(".test-mode-text")||banner?.querySelector("span");if(!banner||!toggle)return;banner.hidden=false;const update=()=>{if(label)label.textContent=testModeEnabled?"وضع الاختبار مفعّل: جميع الدروس متاحة دون إكمال السابق.":"وضع الاختبار متوقف: عادت شروط فتح الدروس الأصلية.";toggle.textContent=testModeEnabled?"إيقاف وضع الاختبار":"تفعيل وضع الاختبار";toggle.setAttribute("aria-pressed",String(testModeEnabled));};update();toggle.addEventListener("click",()=>{testModeEnabled=!testModeEnabled;try{localStorage.setItem(TEST_MODE_KEY,testModeEnabled?"on":"off");}catch{}location.reload();});});
function isNodeCompleted(nodeId){
 const node=PATH_NODES[nodeId];if(!node)return false;
 if(state.nodesCompleted.has(nodeId))return true;
 if(node.type==='mission'&&state.completed.has(node.missionId))return true;
 if(node.type==='exit_ticket'&&state.exitTicket&&state.exitTicket.status==='completed'&&state.exitTicket.lastScore===100)return true;
 return false;
}
const TEST_MODE_KEY = "interactiveBookTestMode";
let testModeEnabled = true;
try { testModeEnabled = localStorage.getItem(TEST_MODE_KEY) !== "off"; } catch {}
function isNodeUnlocked(nodeId){
 if(testModeEnabled)return true;
 if(nodeId<=0)return true;
 return isNodeCompleted(nodeId-1)||isNodeCompleted(nodeId);
}
function currentFrontierNodeId(){
 for(let i=0;i<PATH_NODES.length;i++)if(!isNodeCompleted(i))return i;
 return PATH_NODES.length-1;
}
const missions=[
 {title:'أين يسكن الرقم؟',goal:'حدّد منزلة الرقم الملوّن في مثال الكتاب.',source:'ص 8 · مثال 1',steps:[{type:'target',n:2051841,p:4,prompt:'اضغط الرقم 5 في لوحة المنازل.',hint:'على يمين الرقم 5 أربعة أرقام. ابدأ من الآحاد وعدّ أربعة بيوت.',reason:'هذا بيت عشرات الألوف. قيمة الرقم 5 هي 50,000.'}]},
 {title:'سر الأصفار الأربعة',goal:'حوّل الرقم إلى قيمته المنزلية بإلحاق الأصفار.',source:'ص 8 · مثال 1',steps:[{type:'zeros',n:2051841,p:4,prompt:'كم صفرًا تحتاج بعد الرقم 5 لتكتب قيمته المنزلية؟',hint:'عدّ الأرقام على يمين 5 في 2,051,841. عددها يساوي عدد الأصفار المطلوبة.',reason:'أربعة أصفار: 5 × 10,000 = 50,000.'}]},
 {title:'ورشة سكان المملكة',goal:'أكمل العدد الوارد في فقرة «أستكشف»، دون تغيير قيمته.',source:'ص 8 · أستكشف',steps:[{type:'wheels',n:10579747,initial:10579047,prompt:'عدد السكان المقدّر في نهاية 2019 هو 10,579,747 نسمة. أصلح اللوحة لتطابق هذا العدد.',hint:'قارن كل منزلة بالعدد المطلوب. ركّز على دورة الآحاد.'}]},
 {title:'رحلة من الأرض إلى الشمس',goal:'اقرأ العدد 149,598,428 واكتشف صيغتيه.',source:'ص 9 · مثال 2',steps:[verbal(149598428,'مثال 2 · الصيغة اللفظية'),produceReadStep('ص 9 · الآن اقرأ أنت'),mc('أي مجموع يمثل العدد 149,598,428؟',['100,000,000 + 40,000,000 + 9,000,000 + 500,000 + 90,000 + 8,000 + 400 + 20 + 8','100,000,000 + 40,000,000 + 900,000 + 500,000 + 90,000 + 8,000 + 400 + 20 + 8','100,000,000 + 40,000,000 + 9,000,000 + 500,000 + 90,000 + 800 + 400 + 20 + 8'],0,'كل حد هو قيمة رقم في منزلة مختلفة. الرقم 9 في آحاد الملايين قيمته 9,000,000.',{n:149598428,formula:true,hint:'راقب قيمة الرقم 9 في دورة الملايين، والرقم 8 في دورة الألوف.'})]},
 {title:'أتحقّق: صِل واكتشف',goal:'طابق قيمة الرقم الملوّن، ثم اكتب عدد عطارد بصيغتين.',source:'ص 9 · أتحقق من فهمي',steps:[{type:'match',prompt:'صل كل رقم ملوّن بقيمته المنزلية.',pairs:[{n:783596015,p:7,value:80000000},{n:2051841,p:4,value:50000},{n:57909050,p:5,value:900000}],hint:'البطاقة الأولى: الرقم 8 في دورة الملايين، وله سبعة أرقام على يمينه.'},verbal(57909050,'عطارد · الصيغة اللفظية'),fields(57909050,'عطارد · الصيغة التحليلية')]},
 {title:'صاروخ التحقق السريع',goal:'خمس جولات. أربع إجابات صحيحة تكفي للانطلاق!',source:'أعداد من الدرس',steps:[{type:'rapid',prompt:'حدّد قيمة الرقم الأحمر. يمكنك إيقاف المؤقت أو اللعب بلا وقت.',hint:'عدّ الأرقام على يمين الرقم الأحمر، وألحق به العدد نفسه من الأصفار.'}]},
 {title:'عين على المنزلة',goal:'أجب عن الأسئلة 1 و2 و3: قيمة الرقم المسطّر.',source:'ص 10 · الأسئلة 1-3',steps:[mc('ما القيمة المنزلية للرقم الملوّن؟',[6,60,600],1,'الرقم 6 في العشرات؛ قيمته 6 × 10 = 60.',{n:999964,p:1,source:'السؤال 1',hint:'على يمين 6 رقم واحد.'}),mc('ما القيمة المنزلية للرقم الملوّن؟',[3000,30000,300000],1,'الرقم 3 المسطّر في عشرات الألوف، لا الرقم 3 في العشرات.',{n:51232038,p:4,source:'السؤال 2',hint:'يوجد رقمان 3. المطلوب هو 3 الواقع في دورة الألوف.'}),mc('ما القيمة المنزلية للرقم الملوّن؟',[700000,7000000,70000000],1,'الرقم 7 في آحاد الملايين؛ قيمته 7,000,000.',{n:517232038,p:6,source:'السؤال 3',hint:'على يمين الرقم 7 ستة أرقام.'})]},
 {title:'جسور الرقم سبعة',goal:'أنجز جميع توصيلات السؤال 4.',source:'ص 10 · السؤال 4',steps:[{type:'match',prompt:'اسحب كل عدد إلى قيمة الرقم 7 الملوّن فيه. أو اضغط البطاقة ثم قيمتها.',pairs:[{n:578681,p:4,value:70000},{n:92717,p:2,value:700},{n:367709,p:3,value:7000},{n:675573,p:1,value:70}],hint:'الرقم نفسه موجود في بيوت مختلفة. احسب عدد الأرقام على يمين 7 الملوّن فقط.'}]},
 {title:'أعداد تقول حكايات',goal:'الصيغتان اللفظية والتحليلية للأسئلة 5 و6 و7 و11.',source:'ص 10 · 5، 6، 7، 11',steps:[verbal(6082503,'السؤال 5 · بالكلمات'),fields(6082503,'السؤال 5 · بالتحليل'),verbal(57800083,'السؤال 6 · بالكلمات'),fields(57800083,'السؤال 6 · بالتحليل'),verbal(4810926,'السؤال 7 · بالكلمات'),fields(4810926,'السؤال 7 · بالتحليل'),verbal(4927500,'السؤال 11 · رمشات العين في السنة'),fields(4927500,'السؤال 11 · بالتحليل')]},
 {title:'خزائن الكلمات',goal:'حوّل كلمات الأسئلة 8 و9 و10 إلى أرقام وصيغ تحليلية.',source:'ص 10 · الأسئلة 8-10',steps:[vault(1174493,'مليون ومئة وأربعة وسبعون ألفًا وأربعمئة وثلاثة وتسعون.','السؤال 8 · الصيغة القياسية'),fields(1174493,'السؤال 8 · الصيغة التحليلية'),vault(15108007,'خمسة عشر مليونًا ومئة وثمانية آلاف وسبعة.','السؤال 9 · الصيغة القياسية'),fields(15108007,'السؤال 9 · الصيغة التحليلية'),vault(234000087,'مئتان وأربعة وثلاثون مليونًا وسبعة وثمانون.','السؤال 10 · الصيغة القياسية'),fields(234000087,'السؤال 10 · الصيغة التحليلية')]},
 {title:'أكمل لوحة الأعداد',goal:'أكمل الأسئلة 12-15: الحد المفقود، واللوحة، والسفر، والسكان.',source:'ص 10-11 · الأسئلة 12-15',steps:[{type:'missing',source:'السؤال 12',n:1425689,p:4,answer:20000,prompt:'ما العدد المفقود في الصيغة التحليلية؟',hint:'ابحث عن قيمة الرقم 2 في العدد 1,425,689.'},fields(3944727,'السؤال 13 · لوحة القيمة المنزلية',{board:true,prefill:{4:40000,1:20},prompt:'اللوحة تعرض 3,944,727. أكمل قيم المنازل، ثم اقرأ المجموع الذي يبني العدد.'}),mc('استقبل مطار الملكة علياء الدولي 1,053,225 مسافرًا في آب 2019. ما منزلة الرقم 3 وقيمته؟',['آحاد الألوف، وقيمته 3,000','عشرات الألوف، وقيمته 30,000','المئات، وقيمته 300'],0,'على يمين 3 ثلاثة أرقام؛ إذن يقع في آحاد الألوف وقيمته 3,000.',{n:1053225,p:3,source:'السؤال 14 · سفر',hint:'ابدأ من الآحاد في يمين العدد، ثم تحرّك نحو الرقم 3.'}),fields(10579747,'السؤال 15 · سكان المملكة',{prompt:'عُد إلى عدد السكان في «أستكشف»: 10,579,747. أكمل صيغته التحليلية.'})]},
 {title:'محقّق الأعداد',goal:'اكتشف الخطأ، وبرّر إجابتك، ثم تحدّث عن دورة الملايين.',source:'ص 11 · 16، 17، أتحدث',steps:[{type:'error',n:35003936,p:6,terms:[30000000,50000,3000,900,30,6],wrong:1,correct:5000000,source:'السؤال 16 · أكتشف الخطأ',prompt:'كتبت سميرة الصيغة الآتية. اضغط الحد الخاطئ، ثم صحّحه.',hint:'حدّد مكان الرقم 5 في العدد 35,003,936. هل يقع في الألوف أم في الملايين؟'},produceExplainStep('ص 11 · السؤال 17 · فسّر بطريقتك'),mc('ممّ تتكوّن دورة الملايين؟',['آحاد الملايين، وعشرات الملايين، ومئات الملايين','آحاد الألوف، وعشرات الألوف، ومئات الألوف','الآحاد والعشرات والمئات فقط'],0,'دورة الملايين ثلاثة بيوت: آحاد الملايين، وعشرات الملايين، ومئات الملايين.',{source:'أتحدّث',hint:'في كل دورة ثلاث منازل، ونضيف اسم الدورة إلى اسم كل منزلة.'})]}
];
function stepSkill(s){
 if(!s)return'place';if(s.skill)return s.skill;
 if(s.type==='produce_read')return'verbal';
 if(s.type==='produce_explain')return'place';
 if(['target','zeros','match','rapid'].includes(s.type)||(s.type==='choice'&&(s.p!==undefined||s.compare)))return'place';
 if(s.type==='wheels')return'standard';
 if(['fields','missing','error'].includes(s.type)||(s.type==='choice'&&s.formula))return'expanded';
 return'verbal';
}
function makeRecords(){state.records=missions.map(()=>({index:0,passed:new Set(),data:{},lastMessage:''}));}
makeRecords();
let guideTimer,heartTimer,storyTimer,flipTimer,flipEndTimer,finishTimer,confettiTimer,rapidTimer,stepTimer,audioCtx,speechTimers=[],currentStationErrors=0;
function getNodeStars(nodeId){
 if(!isNodeCompleted(nodeId))return 0;
 if(state.nodeStars&&typeof state.nodeStars[nodeId]==='number'){
  return Math.min(3,Math.max(1,state.nodeStars[nodeId]));
 }
 const node=PATH_NODES[nodeId];
 if(!node)return 0;
 return 3;
}
function renderStarsBadgeHTML(starsCount){
 const pts='12,1.5 15.2,8.5 22.8,9.4 17.1,14.6 18.7,22 12,18.2 5.3,22 6.9,14.6 1.2,9.4 8.8,8.5';
 return '<div class="dp-stars-badge" aria-label="'+ar(starsCount)+' من 3 نجوم">'
  +'<svg class="dp-star star-side star-right '+(starsCount>=1?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true"><polygon points="'+pts+'" stroke-linejoin="round"/></svg>'
  +'<svg class="dp-star star-center '+(starsCount>=2?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true"><polygon points="'+pts+'" stroke-linejoin="round"/></svg>'
  +'<svg class="dp-star star-side star-left '+(starsCount>=3?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true"><polygon points="'+pts+'" stroke-linejoin="round"/></svg>'
  +'</div>';
}
function renderStarsSheetHTML(starsCount){
 const pts='12,1.5 15.2,8.5 22.8,9.4 17.1,14.6 18.7,22 12,18.2 5.3,22 6.9,14.6 1.2,9.4 8.8,8.5';
 let html='';
 for(let i=1;i<=3;i++){
  const on=i<=starsCount;
  html+='<svg class="dp-star '+(on?'on':'off')+'" viewBox="0 0 24 24" aria-hidden="true"><polygon points="'+pts+'" stroke-linejoin="round"/></svg>';
 }
 return html;
}
function activeId(){return state.scene*6+state.cursors[state.scene];}
function record(){return state.infiniteMode?state.infiniteRecord:state.records[activeId()];}
function currentStep(){
 if(state.infiniteMode) return state.infiniteStep;
 const r=record();
 const sData=r.data?.[r.index];
 if(sData&&sData.verificationStep) return sData.verificationStep;
 return missions[activeId()].steps[r.index];
}
function stepData(){
 const r=record();
 if(!r.data) r.data={};
 if(!r.data[r.index]) r.data[r.index]={};
 const d=r.data[r.index];
 if(d.wrongAttempts===undefined) d.wrongAttempts=0;
 if(d.helpUnlocked===undefined) d.helpUnlocked=false;
 if(d.hintLevel===undefined) d.hintLevel=d.hintTier||0;
 if(d.hintTier===undefined) d.hintTier=d.hintLevel||0;
 if(d.usedHint===undefined) d.usedHint=Boolean(d.hintLevel>0);
 if(d.revealedAnswer===undefined) d.revealedAnswer=Boolean(d.usedHelp||d.assisted||d.hintLevel>=3);
 if(d.usedHelp===undefined) d.usedHelp=Boolean(d.revealedAnswer);
 if(d.assisted===undefined) d.assisted=Boolean(d.revealedAnswer);
 const isAssistedInRecord=Boolean(r.assistedSteps&&r.assistedSteps.has(r.index));
 if(d.revealedAnswer||d.usedHelp||d.assisted||isAssistedInRecord){
  d.usedHelp=true;
  d.assisted=true;
  d.revealedAnswer=true;
  d.independent=false;
  d.status='assisted';
  if(r.assistedSteps) r.assistedSteps.add(r.index);
  r.independentSteps?.delete?.(r.index);
 }else if(d.independent===undefined){
  d.independent=true;
 }
 return d;
}
function markStepAssisted(reason='assist'){
 const d=stepData(), r=record();
 d.usedHelp=true;
 d.assisted=true;
 d.revealedAnswer=true;
 d.independent=false;
 d.status='assisted';
 d.assistReason=reason;
 if(r){
  r.assistedSteps=r.assistedSteps||new Set();
  r.assistedSteps.add(r.index);
  r.independentSteps?.delete?.(r.index);
 }
 saveState();
}
function isPassed(){return record().passed.has(record().index);}
function totalPoints(){
 let starBonus=0;
 if(state.nodeStars){for(const s of Object.values(state.nodeStars))starBonus+=(s===3?15:s===2?10:5);}
 const l2Pts = typeof getLesson2Points==='function'?getLesson2Points():0;
 const l3Pts = typeof getLesson3Points==='function'?getLesson3Points():0;
 const l4Pts = typeof getLesson4Points==='function'?getLesson4Points():0;
 const l5Pts = typeof getLesson5Points==='function'?getLesson5Points():0;
 return l2Pts + l3Pts + l4Pts + l5Pts + state.completed.size*20+(state.infiniteStats?.bonusPoints||0)+(playgroundState?.questsDone?.size||0)*5+state.nodesCompleted.size*5+starBonus+(state.unitProjectDone?25:0);
}
function serializeLessonRecordMap(recs){
 return Object.fromEntries(Object.entries(recs||{}).map(([k,r])=>[k,{index:Number(r?.index)||0,passed:[...(r?.passed||[])],assistedSteps:[...(r?.assistedSteps||[])],independentSteps:[...(r?.independentSteps||[])],errors:Number(r?.errors)||0,data:r?.data&&typeof r.data==='object'?r.data:{}}]));
}
function saveState(){
 try{
  const payload={
   scene:state.scene,cursors:state.cursors,completed:[...state.completed],hearts:state.hearts,errors:state.errors,
   muted:state.muted,story:state.story,finished:state.finished,studentName:state.studentName||'',streak:state.streak||0,maxSessionStreak:state.maxSessionStreak||0,badges:[...(state.badges||[])],
   skillStats:state.skillStats,infiniteStats:state.infiniteStats,exitTicket:state.exitTicket,lesson2:state.lesson2?{activeNode:state.lesson2.activeNode,completedNodes:[...(state.lesson2.completedNodes||[])],nodeStars:state.lesson2.nodeStars||{},expandedStages:[...(state.lesson2.expandedStages||[0])],records:serializeLessonRecordMap(state.lesson2.records),stats:state.lesson2.stats||null,exitTicket:state.lesson2.exitTicket,unlocked:!!state.lesson2.unlocked}:null,lesson3:state.lesson3?{activeNode:state.lesson3.activeNode,completedNodes:[...(state.lesson3.completedNodes||[])],nodeStars:state.lesson3.nodeStars||{},expandedStages:[...(state.lesson3.expandedStages||[0])],records:serializeLessonRecordMap(state.lesson3.records),stats:state.lesson3.stats||null,exitTicket:state.lesson3.exitTicket,unlocked:state.lesson3.unlocked!==false}:null,lesson4:state.lesson4?{activeNode:state.lesson4.activeNode,completedNodes:[...(state.lesson4.completedNodes||[])],nodeStars:state.lesson4.nodeStars||{},expandedStages:[...(state.lesson4.expandedStages||[0])],records:serializeLessonRecordMap(state.lesson4.records),stats:state.lesson4.stats||null,exitTicket:state.lesson4.exitTicket||null,exitResults:state.lesson4.exitResults||{},unlocked:state.lesson4.unlocked!==false}:null,lesson5:state.lesson5?{activeNode:state.lesson5.activeNode,completedNodes:[...(state.lesson5.completedNodes||[])],nodeStars:state.lesson5.nodeStars||{},expandedStages:[...(state.lesson5.expandedStages||[0])],records:serializeLessonRecordMap(state.lesson5.records),stats:state.lesson5.stats||null,exitTicket:state.lesson5.exitTicket||null,exitResults:state.lesson5.exitResults||{},unlocked:state.lesson5.unlocked!==false}:null,aiQuiz:state.aiQuiz?{day:state.aiQuiz.day,rewarded:state.aiQuiz.rewarded,seen:Array.isArray(state.aiQuiz.seen)?state.aiQuiz.seen.slice(-100):[]}:{day:getLocalDateString(),rewarded:0,seen:[]},
   viewMode:state.viewMode,runnerStep:state.runnerStep||null,mapSubView:state.mapSubView||'sections',unitProjectDone:!!state.unitProjectDone,
   activeNode:state.activeNode,nodesCompleted:[...state.nodesCompleted],
   nodeStars:state.nodeStars||{},
   viewedSlides:[...(state.viewedSlides||[])].map(s=>[...s]),
    onboarding:state.onboarding||createDefaultOnboarding(),
    expandedStages:[...(state.expandedStages||[0])],
   questsDone:playgroundState?.questsDone?[...playgroundState.questsDone]:[],questIndex:playgroundState?.questIndex||0,playgroundNumber:typeof playgroundState?.number==='number'?playgroundState.number:null,
   records:state.records.map(r=>{const cleanData={};for(const [k,v] of Object.entries(r.data||{})){const copy={...v};delete copy.run;cleanData[k]=copy;}return{index:r.index,passed:[...r.passed],assistedSteps:[...(r.assistedSteps||[])],independentSteps:[...(r.independentSteps||[])],data:cleanData,lastMessage:r.lastMessage};})
  };
  localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));
 }catch{}
}
function loadState(){
 try{
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return false;
  const data=JSON.parse(raw);if(!data||typeof data!=='object')return false;
  if(typeof data.scene==='number')state.scene=data.scene===1?1:0;
  if(Array.isArray(data.cursors)&&data.cursors.length===2)state.cursors=data.cursors.map(x=>Math.max(0,Math.min(5,Number(x)||0)));
  if(Array.isArray(data.completed))state.completed=new Set(data.completed.filter(x=>Number.isInteger(x)&&x>=0&&x<12));
  if(typeof data.hearts==='number')state.hearts=Math.max(0,Math.min(3,data.hearts));
  if(typeof data.errors==='number')state.errors=Math.max(0,data.errors);
  if(typeof data.muted==='boolean')state.muted=data.muted;
  if(Array.isArray(data.story)&&data.story.length===2)state.story=data.story.map(x=>Math.max(0,Number(x)||0));
  if(typeof data.finished==='boolean')state.finished=data.finished;
   state.streak=typeof data.streak==='number'?Math.max(0,Number(data.streak)||0):0;
   state.maxSessionStreak=typeof data.maxSessionStreak==='number'?Math.max(0,Number(data.maxSessionStreak)||0):0;
   if(Array.isArray(data.badges))state.badges=new Set(data.badges);else state.badges=new Set();
  if(typeof data.studentName==='string')state.studentName=data.studentName;
  if(Array.isArray(data.nodesCompleted))state.nodesCompleted=new Set(data.nodesCompleted.filter(x=>Number.isInteger(x)&&x>=0&&x<PATH_NODES.length));
  if(data.nodeStars&&typeof data.nodeStars==='object')state.nodeStars=data.nodeStars;
  if(typeof data.unitProjectDone==='boolean')state.unitProjectDone=data.unitProjectDone;
  if(typeof data.mapSubView==='string'&&['units','sections','lesson1','lesson2','lesson3','lesson4','lesson5'].includes(data.mapSubView))state.mapSubView=data.mapSubView;
  if(Array.isArray(data.viewedSlides)&&data.viewedSlides.length===2)state.viewedSlides=data.viewedSlides.map(arr=>new Set(Array.isArray(arr)?arr:[0]));
  if(typeof data.activeNode==='number')state.activeNode=Math.max(0,Math.min(PATH_NODES.length-1,data.activeNode));
  if(typeof data.viewMode==='string'&&['map','story','playground','mission','exit_ticket','lesson2','lesson3','lesson4','lesson5','recharge','scratchpad','result'].includes(data.viewMode))state.viewMode=data.viewMode;
  if(data.lesson5&&typeof data.lesson5==='object'){
   const l5d=data.lesson5;
   state.lesson5={
    activeNode:Number(l5d.activeNode)||0,
    completedNodes:new Set(Array.isArray(l5d.completedNodes)?l5d.completedNodes.map(Number).filter(Number.isInteger):[]),
    nodeStars:l5d.nodeStars&&typeof l5d.nodeStars==='object'?l5d.nodeStars:{},
    expandedStages:new Set(Array.isArray(l5d.expandedStages)&&l5d.expandedStages.length?l5d.expandedStages.map(Number).filter(Number.isInteger):[0]),
    records:Object.fromEntries(Object.entries(l5d.records||{}).map(([k,r])=>[k,{index:Number(r?.index)||0,passed:new Set(Array.isArray(r?.passed)?r.passed.map(Number):[]),assistedSteps:new Set(Array.isArray(r?.assistedSteps)?r.assistedSteps:[]),independentSteps:new Set(Array.isArray(r?.independentSteps)?r.independentSteps:[]),errors:Number(r?.errors)||0,data:r?.data&&typeof r.data==='object'?r.data:{}}])),
    stats:l5d.stats&&typeof l5d.stats==='object'?l5d.stats:{l5_understand_plan:0,l5_ratio_table:0,l5_combinations_grid:0,l5_coin_table:0,l5_pairing_list:0},
    exitTicket:l5d.exitTicket&&typeof l5d.exitTicket==='object'?l5d.exitTicket:{status:'not_attempted',lastScore:0,mastered:false,remedialRound:0,unmasteredSkills:[]},
    exitResults:l5d.exitResults&&typeof l5d.exitResults==='object'?l5d.exitResults:{},
    unlocked:l5d.unlocked!==undefined?!!l5d.unlocked:true
   };
  }
  if(data.lesson4&&typeof data.lesson4==='object'){
   const l4d=data.lesson4;
   state.lesson4={
    activeNode:Number(l4d.activeNode)||0,
    completedNodes:new Set(Array.isArray(l4d.completedNodes)?l4d.completedNodes.map(Number).filter(Number.isInteger):[]),
    nodeStars:l4d.nodeStars&&typeof l4d.nodeStars==='object'?l4d.nodeStars:{},
    expandedStages:new Set(Array.isArray(l4d.expandedStages)&&l4d.expandedStages.length?l4d.expandedStages.map(Number).filter(Number.isInteger):[0]),
    records:Object.fromEntries(Object.entries(l4d.records||{}).map(([k,r])=>[k,{index:Number(r?.index)||0,passed:new Set(Array.isArray(r?.passed)?r.passed.map(Number):[]),assistedSteps:new Set(Array.isArray(r?.assistedSteps)?r.assistedSteps:[]),independentSteps:new Set(Array.isArray(r?.independentSteps)?r.independentSteps:[]),errors:Number(r?.errors)||0,data:r?.data&&typeof r.data==='object'?r.data:{}}])),
    stats:l4d.stats&&typeof l4d.stats==='object'?l4d.stats:{l4_neg_meaning:0,l4_zero_ref:0,l4_number_line:0,l4_thermometer:0,l4_analysis_sym:0,l4_temp_shift:0},
    exitTicket:l4d.exitTicket&&typeof l4d.exitTicket==='object'?l4d.exitTicket:{status:'not_attempted',lastScore:0,mastered:false,remedialRound:0,unmasteredSkills:[]},
    exitResults:l4d.exitResults&&typeof l4d.exitResults==='object'?l4d.exitResults:{},
    unlocked:l4d.unlocked!==undefined?!!l4d.unlocked:true
   };
  }
  if(data.lesson3&&typeof data.lesson3==='object'){
   const l3d=data.lesson3;
   state.lesson3={
    activeNode:Number(l3d.activeNode)||0,
    completedNodes:new Set(Array.isArray(l3d.completedNodes)?l3d.completedNodes.map(Number).filter(Number.isInteger):[]),
    nodeStars:l3d.nodeStars&&typeof l3d.nodeStars==='object'?l3d.nodeStars:{},
    expandedStages:new Set(Array.isArray(l3d.expandedStages)?l3d.expandedStages.map(Number).filter(Number.isInteger):[0]),
    records:Object.fromEntries(Object.entries(l3d.records||{}).map(([k,r])=>[k,{index:Number(r?.index)||0,passed:new Set(Array.isArray(r?.passed)?r.passed:[]),assistedSteps:new Set(Array.isArray(r?.assistedSteps)?r.assistedSteps:[]),independentSteps:new Set(Array.isArray(r?.independentSteps)?r.independentSteps:[]),errors:Number(r?.errors)||0,data:r?.data&&typeof r.data==='object'?r.data:{}}])),
    stats:l3d.stats&&typeof l3d.stats==='object'?l3d.stats:{answered:0,correct:0,firstTry:0,streak:0,bestStreak:0},
    exitTicket:l3d.exitTicket||null,
    unlocked:l3d.unlocked!==undefined?!!l3d.unlocked:true
   };
  }
  if(data.runnerStep&&typeof data.runnerStep==='object')state.runnerStep=data.runnerStep;
  if(typeof data.playgroundNumber==='number'&&typeof playgroundState==='object')playgroundState.number=data.playgroundNumber;
  if(data.skillStats&&typeof data.skillStats==='object'){for(const k of ['place','verbal','standard','expanded'])if(data.skillStats[k])state.skillStats[k]={ok:Number(data.skillStats[k].ok)||0,err:Number(data.skillStats[k].err)||0,independentOk:Number(data.skillStats[k].independentOk)||0,assistedOk:Number(data.skillStats[k].assistedOk)||0};}
  if(data.infiniteStats&&typeof data.infiniteStats==='object')state.infiniteStats={solved:Number(data.infiniteStats.solved)||0,streak:Number(data.infiniteStats.streak)||0,maxStreak:Number(data.infiniteStats.maxStreak)||0,bonusPoints:Number(data.infiniteStats.bonusPoints)||0};
  if(data.exitTicket&&typeof data.exitTicket==='object')state.exitTicket=data.exitTicket;
  if(data.lesson2&&typeof data.lesson2==='object'){
   const l2StageMax=(typeof L2_STAGES!=='undefined'&&Array.isArray(L2_STAGES))?L2_STAGES.length:5;
   const expArr=Array.isArray(data.lesson2.expandedStages)
    ?data.lesson2.expandedStages.filter(x=>Number.isInteger(x)&&x>=0&&x<l2StageMax)
    :null;
   const hydratedRecords={};
   if(data.lesson2.records&&typeof data.lesson2.records==='object'){
    for(const [k,r] of Object.entries(data.lesson2.records)){
     if(!r||typeof r!=='object')continue;
     hydratedRecords[k]={
      index:Math.max(0,Number(r.index)||0),
      passed:new Set(Array.isArray(r.passed)?r.passed:[]),
      assistedSteps:new Set(Array.isArray(r.assistedSteps)?r.assistedSteps:[]),
      independentSteps:new Set(Array.isArray(r.independentSteps)?r.independentSteps:[]),
      errors:Math.max(0,Number(r.errors)||0),
      data:r.data&&typeof r.data==='object'?r.data:{}
     };
    }
   }
   state.lesson2={
    activeNode:Number(data.lesson2.activeNode)||0,
    completedNodes:new Set(Array.isArray(data.lesson2.completedNodes)?data.lesson2.completedNodes:[]),
    nodeStars:data.lesson2.nodeStars&&typeof data.lesson2.nodeStars==='object'?data.lesson2.nodeStars:{},
    expandedStages:expArr?new Set(expArr):null,
    records:hydratedRecords,
    stats:data.lesson2.stats&&typeof data.lesson2.stats==='object'?data.lesson2.stats:{compare_count:0,symbols_count:0,order_count:0,patterns_count:0,higher_count:0},
    exitTicket:data.lesson2.exitTicket||{status:'not_attempted',lastScore:0},
    unlocked:!!data.lesson2.unlocked
   };
  }
  if(data.aiQuiz&&typeof data.aiQuiz==='object'){
   const today=getLocalDateString();
   const dStr=(typeof data.aiQuiz.day==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(data.aiQuiz.day))?data.aiQuiz.day:today;
   const rew=(typeof data.aiQuiz.rewarded==='number'&&Number.isFinite(data.aiQuiz.rewarded)&&data.aiQuiz.rewarded>=0)?Math.floor(data.aiQuiz.rewarded):0;
   const seenArr=Array.isArray(data.aiQuiz.seen)?data.aiQuiz.seen.filter(x=>typeof x==='string'||typeof x==='number').map(String).slice(-100):[];
   state.aiQuiz={day:dStr,rewarded:dStr===today?rew:0,seen:seenArr};
  }else{
   state.aiQuiz={day:getLocalDateString(),rewarded:0,seen:[]};
  }
  ensureAiQuizDay();
  if(Array.isArray(data.questsDone)&&typeof playgroundState==='object')playgroundState.questsDone=new Set(data.questsDone);
  if(typeof data.questIndex==='number'&&typeof playgroundState==='object')playgroundState.questIndex=Math.max(0,Math.min(4,data.questIndex));
  if(typeof playgroundState==='object'&&playgroundState.questsDone.has(playgroundState.questIndex)){
   const nextUnsolved=playgroundQuests.findIndex((_,idx)=>!playgroundState.questsDone.has(idx));
   if(nextUnsolved>=0)playgroundState.questIndex=nextUnsolved;
  }
  if(Array.isArray(data.records)){
   state.records=missions.map((m,i)=>{const r=(Array.isArray(data.records)&&data.records[i])||{};return{index:Math.max(0,Math.min(m.steps.length-1,Number(r.index)||0)),passed:new Set(Array.isArray(r.passed)?r.passed:[]),assistedSteps:new Set(Array.isArray(r.assistedSteps)?r.assistedSteps:[]),independentSteps:new Set(Array.isArray(r.independentSteps)?r.independentSteps:[]),data:r.data&&typeof r.data==='object'?r.data:{},lastMessage:r.lastMessage||''};});
  }
  const hasLegacyProgress=state.completed.size>0||state.nodesCompleted.size>0||state.infiniteStats.solved>0||(Array.isArray(data.questsDone)&&data.questsDone.length>0);
   if(data.onboarding&&typeof data.onboarding==='object'){
    const defOb=createDefaultOnboarding();
    state.onboarding={
     ...defOb,
     ...data.onboarding,
     q1:{...defOb.q1,...(data.onboarding.q1||{})},
     q2:{...defOb.q2,...(data.onboarding.q2||{})},
     bridgeCardsCollected:Array.isArray(data.onboarding.bridgeCardsCollected)&&data.onboarding.bridgeCardsCollected.length===3?data.onboarding.bridgeCardsCollected.map(x=>Math.max(0,Math.min(10,Number(x)||0))):[0,0,0],
     bridgeMerged:Array.isArray(data.onboarding.bridgeMerged)&&data.onboarding.bridgeMerged.length===3?data.onboarding.bridgeMerged.map(Boolean):[false,false,false]
    };
   }else if(hasLegacyProgress){
    const defOb=createDefaultOnboarding();
    defOb.warmupDone=true;defOb.bridgeDone=true;defOb.pathChosen='shortcut';defOb.reviewBypassed=true;defOb.station1Phase='gradual_millions';defOb.gradualStep=3;defOb.bridgeMerged=[true,true,true];defOb.bridgeCardsCollected=[10,10,10];
    state.onboarding=defOb;
    state.nodesCompleted.add(0);
    if(!data.mapSubView||data.mapSubView==='sections')state.mapSubView='lesson1';
   }else{
    state.onboarding=createDefaultOnboarding();
   }
   if(Array.isArray(data.expandedStages)){
    state.expandedStages=new Set(data.expandedStages.filter(x=>Number.isInteger(x)&&x>=0&&x<PATH_STAGES.length));
   }else{
    state.expandedStages=new Set([getStageForNode(currentFrontierNodeId()).id]);
   }
   const hasObProgress=Boolean(state.onboarding&&(state.onboarding.warmupDone||state.onboarding.q1?.answered||state.onboarding.q1?.usedHelp||state.onboarding.station1Phase!=='warmup_q1'));
   const l2Done=state.lesson2?.completedNodes;
   const l2DoneCount=l2Done instanceof Set?l2Done.size:(Array.isArray(l2Done)?l2Done.length:0);
   const hasL2Progress=Boolean(state.lesson2&&(l2DoneCount>0||Object.keys(state.lesson2.records||{}).length>0||state.mapSubView==='lesson2'));
   const l3Done=state.lesson3?.completedNodes;
   const l3DoneCount=l3Done instanceof Set?l3Done.size:(Array.isArray(l3Done)?l3Done.length:0);
   const hasL3Progress=Boolean(state.lesson3&&(l3DoneCount>0||Object.keys(state.lesson3.records||{}).length>0||state.mapSubView==='lesson3'));
   const l4Done=state.lesson4?.completedNodes;
   const l4DoneCount=l4Done instanceof Set?l4Done.size:(Array.isArray(l4Done)?l4Done.length:0);
   const hasL4Progress=Boolean(state.lesson4&&(l4DoneCount>0||Object.keys(state.lesson4.records||{}).length>0||state.mapSubView==='lesson4'));
   const l5Done=state.lesson5?.completedNodes;
   const l5DoneCount=l5Done instanceof Set?l5Done.size:(Array.isArray(l5Done)?l5Done.length:0);
   const hasL5Progress=Boolean(state.lesson5&&(l5DoneCount>0||Object.keys(state.lesson5.records||{}).length>0||state.mapSubView==='lesson5'));
   const hasRunnerProgress=Boolean(state.runnerStep&&Number.isInteger(state.runnerStep.nodeId));
   return hasLegacyProgress||hasObProgress||hasL2Progress||hasL3Progress||hasL4Progress||hasL5Progress||hasRunnerProgress;
 }catch{return false;}
}
