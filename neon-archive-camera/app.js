const video=document.querySelector('#camera'),canvas=document.querySelector('#render'),ctx=canvas.getContext('2d'),startBtn=document.querySelector('#start'),recordBtn=document.querySelector('#record'),saveBtn=document.querySelector('#save'),statusEl=document.querySelector('#status'),message=document.querySelector('#message'),recmark=document.querySelector('#recmark'),clockEl=document.querySelector('#clock'),clipExport=document.querySelector('#clipExport'),playback=document.querySelector('#playback'),openVideo=document.querySelector('#openVideo');
const toggles={soft:document.querySelector('#softLook'),lines:document.querySelector('#scanlines'),hud:document.querySelector('#burnHud'),day:document.querySelector('#dayMode'),night:document.querySelector('#nightMode')};
const toggleInputs=Object.values(toggles),settingsKey='neon-archive-camera-settings';
let cameraStream=null,recorder=null,chunks=[],lastURL=null,timer=null,startedAt=0,drawing=false;
const CLEAN={w:1440,h:1080},SOFT={w:960,h:720};
try{const saved=JSON.parse(localStorage.getItem(settingsKey)||'{}');for(const [key,input] of Object.entries(toggles))if(typeof saved[key]==='boolean')input.checked=saved[key]}catch{}
function saveSettings(){try{localStorage.setItem(settingsKey,JSON.stringify(Object.fromEntries(Object.entries(toggles).map(([k,v])=>[k,v.checked]))))}catch{}}
function setCanvasSize(){const size=toggles.soft.checked?SOFT:CLEAN;canvas.width=size.w;canvas.height=size.h}
setCanvasSize();toggleInputs.forEach(input=>input.addEventListener('change',()=>{saveSettings();if(recorder?.state!=='recording')setCanvasSize()}));
function drawFrame(){if(!drawing)return;if(video.readyState>=2){const w=canvas.width,h=canvas.height,vw=video.videoWidth,vh=video.videoHeight,scale=Math.max(w/vw,h/vh),sw=w/scale,sh=h/scale,sx=(vw-sw)/2,sy=(vh-sh)/2;
let filters=[];if(toggles.soft.checked)filters.push('brightness(1.13)','contrast(.88)','saturate(.78)','blur(.45px)');if(toggles.day.checked)filters.push('brightness(1.05)','contrast(1.02)','saturate(.93)');if(toggles.night.checked)filters.push('brightness(1.09)','contrast(1.12)','saturate(1.28)');ctx.save();ctx.filter=filters.length?filters.join(' '):'none';ctx.drawImage(video,sx,sy,sw,sh,0,0,w,h);ctx.restore();
if(toggles.soft.checked){ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.13;ctx.filter='blur(9px) brightness(1.18)';ctx.drawImage(video,sx,sy,sw,sh,0,0,w,h);ctx.restore();const wash=ctx.createLinearGradient(0,0,0,h);wash.addColorStop(0,'rgba(183,218,242,.15)');wash.addColorStop(.52,'rgba(170,204,231,.07)');wash.addColorStop(1,'rgba(255,212,156,.11)');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h)}
if(toggles.day.checked){ctx.fillStyle='rgba(255,230,194,.055)';ctx.fillRect(0,0,w,h)}
if(toggles.night.checked){ctx.fillStyle='rgba(22,70,145,.16)';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(0,238,255,.045)';ctx.fillRect(0,0,w,h)}
if(toggles.lines.checked){ctx.fillStyle='rgba(0,0,0,.2)';const step=Math.max(4,Math.round(h/180));for(let y=1;y<h;y+=step)ctx.fillRect(0,y,w,Math.max(1,h/720))}
if(toggles.hud.checked){ctx.save();ctx.strokeStyle='rgba(255,190,62,.9)';ctx.lineWidth=Math.max(2,w/480);ctx.strokeRect(w*.02,h*.025,w*.96,h*.95);ctx.fillStyle='#ffc84a';ctx.shadowColor='#1b1406';ctx.shadowBlur=8;ctx.font=`bold ${Math.round(w*.022)}px monospace`;ctx.fillText('◉ CAM 01',w*.04,h*.06);ctx.textAlign='right';ctx.fillText(recorder?.state==='recording'?'● REC':'● LIVE',w*.96,h*.06);ctx.textAlign='left';ctx.fillText('4:3 • 24 FPS',w*.04,h*.96);ctx.textAlign='right';ctx.fillText(clockEl.textContent,w*.96,h*.96);ctx.restore()}}
requestAnimationFrame(drawFrame)}
function showTime(){const s=Math.floor((Date.now()-startedAt)/1000);clockEl.textContent=`00:${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function lockSettings(locked){toggleInputs.forEach(input=>input.disabled=locked)}
startBtn.onclick=async()=>{
  if(!navigator.mediaDevices?.getUserMedia){message.textContent='CAMERA NEEDS HTTPS — OPEN THIS SITE IN SAFARI';statusEl.textContent='UNAVAILABLE';return}
  startBtn.disabled=true;startBtn.textContent='STARTING CAMERA…';message.textContent='ALLOW CAMERA ACCESS WHEN ASKED';
  try{
    const videoOnly={facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}};
    let result,hasAudio=true;
    try{result=await navigator.mediaDevices.getUserMedia({video:videoOnly,audio:true})}
    catch(audioError){result=await navigator.mediaDevices.getUserMedia({video:videoOnly,audio:false});hasAudio=false}
    cameraStream=result;video.srcObject=cameraStream;await video.play();drawing=true;drawFrame();recordBtn.disabled=false;startBtn.hidden=true;statusEl.textContent='CAMERA READY';message.textContent=hasAudio?'HOLD STEADY. LET IT HAPPEN.':'CAMERA READY • MICROPHONE OFF';
  }catch(e){
    startBtn.disabled=false;startBtn.textContent='ENABLE CAMERA';statusEl.textContent='NO CAMERA';
    const errors={NotAllowedError:'CAMERA ACCESS BLOCKED — ALLOW IT IN SAFARI WEBSITE SETTINGS',NotFoundError:'NO CAMERA WAS FOUND ON THIS DEVICE',NotReadableError:'CAMERA IS BUSY — CLOSE OTHER APPS USING IT',OverconstrainedError:'CAMERA SETTINGS UNSUPPORTED — RELOAD AND TRY AGAIN'};
    message.textContent=errors[e.name]||'CAMERA COULD NOT START — RELOAD THE PAGE AND TRY AGAIN';
  }
};
recordBtn.onclick=()=>{if(recorder?.state==='recording'){recorder.stop();return}try{chunks=[];setCanvasSize();const visual=canvas.captureStream(24),tracks=[...visual.getVideoTracks(),...cameraStream.getAudioTracks()],stream=new MediaStream(tracks),type=['video/mp4;codecs="avc1.42E01E,mp4a.40.2"','video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));recorder=new MediaRecorder(stream,type?{mimeType:type}:undefined);recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{clearInterval(timer);lockSettings(false);const blob=new Blob(chunks,{type:recorder.mimeType||'video/mp4'});if(lastURL)URL.revokeObjectURL(lastURL);lastURL=URL.createObjectURL(blob);playback.src=lastURL;playback.load();clipExport.hidden=false;saveBtn.hidden=false;message.textContent='CLIP READY — TAP EXPORT VIDEO';recordBtn.classList.remove('active');recordBtn.querySelector('span').textContent='RECORD';statusEl.textContent='CLIP READY';recmark.textContent='● LIVE'};recorder.start(1000);lockSettings(true);startedAt=Date.now();showTime();timer=setInterval(showTime,250);recordBtn.classList.add('active');recordBtn.querySelector('span').textContent='STOP';statusEl.textContent='RECORDING';recmark.textContent='● REC';message.textContent='ROLLING — KEEP THE CAMERA STEADY'}catch(e){lockSettings(false);message.textContent='RECORDING NOT SUPPORTED IN THIS BROWSER'}};
saveBtn.onclick=()=>{
  if(!lastURL)return;
  const ext=recorder?.mimeType?.includes('webm')?'webm':'mp4',filename=`neon-archive-${new Date().toISOString().replace(/[:.]/g,'-')}.${ext}`;
  const blob=new Blob(chunks,{type:recorder?.mimeType||'video/mp4'}),file=new File([blob],filename,{type:blob.type||'video/mp4',lastModified:Date.now()});
  if(navigator.share&&navigator.canShare?.({files:[file]})){
    message.textContent='CHOOSE SAVE VIDEO OR SAVE TO FILES IN THE SHARE SHEET';
    navigator.share({files:[file],title:'Neon Archive recording'}).then(()=>{message.textContent='SHARE COMPLETE'}).catch(error=>{if(error.name==='AbortError')message.textContent='SHARE CANCELLED — CLIP IS STILL AVAILABLE BELOW';else message.textContent='USE OPEN VIDEO BELOW TO SAVE OR SHARE THE CLIP'});
  }else{message.textContent='USE OPEN VIDEO BELOW, THEN SHARE OR SAVE THE CLIP'}
};
openVideo.onclick=()=>{if(lastURL)window.open(lastURL,'_blank','noopener')};
window.addEventListener('pagehide',()=>{drawing=false;cameraStream?.getTracks().forEach(t=>t.stop());if(lastURL)URL.revokeObjectURL(lastURL)});



