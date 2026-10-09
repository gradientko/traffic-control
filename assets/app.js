const canvas=document.querySelector('#game');
const ctx=canvas.getContext('2d');

const scoreEl=document.querySelector('#score');
const bestEl=document.querySelector('#best');
const passedEl=document.querySelector('#passed');
const timeEl=document.querySelector('#time');

const nsLabel=document.querySelector('#ns-label');
const ewLabel=document.querySelector('#ew-label');
const nsLight=document.querySelector('#ns-light');
const ewLight=document.querySelector('#ew-light');

const statusTitle=document.querySelector('#status-title');
const statusCopy=document.querySelector('#status-copy');

const overlay=document.querySelector('#overlay');
const overlayKicker=document.querySelector('#overlay-kicker');
const overlayTitle=document.querySelector('#overlay-title');
const overlayCopy=document.querySelector('#overlay-copy');
const startBtn=document.querySelector('#start');
const restartBtn=document.querySelector('#restart');
const switchBtn=document.querySelector('#switch');
const pauseBtn=document.querySelector('#pause');

const W=canvas.width;
const H=canvas.height;
const CX=W/2;
const CY=H/2;
const ROAD=190;
const LANE=42;
const STOP=ROAD/2+28;

let cars=[];
let particles=[];
let running=false;
let paused=false;
let ended=false;
let last=0;
let raf=0;
let elapsed=0;
let spawnTimer=0;
let score=0;
let passed=0;
let best=Number(window.TRAFFIC_STATS.highScore||0);
let nsGreen=true;
let switchCooldown=0;

const directions=['N','S','E','W'];

function reset(){
  cancelAnimationFrame(raf);
  cars=[];
  particles=[];
  running=false;
  paused=false;
  ended=false;
  last=0;
  elapsed=0;
  spawnTimer=0;
  score=0;
  passed=0;
  nsGreen=true;
  switchCooldown=0;

  ui();
  draw();

  show(
    'READY',
    'Control the intersection.',
    'North/South starts green. Switch before traffic blocks or crashes.',
    'Start game'
  );
}

function start(){
  if(ended) reset();

  if(!running){
    running=true;
    paused=false;
    hide();
    last=performance.now();
    ui();
    raf=requestAnimationFrame(loop);
  }
}

function show(k,t,c,b){
  overlayKicker.textContent=k;
  overlayTitle.textContent=t;
  overlayCopy.textContent=c;
  startBtn.textContent=b;
  overlay.hidden=false;
}

function hide(){
  overlay.hidden=true;
}

function ui(){
  scoreEl.textContent=score;
  bestEl.textContent=best;
  passedEl.textContent=passed;
  timeEl.textContent=`${Math.floor(elapsed)}s`;

  nsLabel.textContent=nsGreen?'GREEN':'RED';
  ewLabel.textContent=nsGreen?'RED':'GREEN';

  nsLight.className=`light ${nsGreen?'green':'red'}`;
  ewLight.className=`light ${nsGreen?'red':'green'}`;

  if(paused){
    statusTitle.textContent='Paused';
    statusCopy.textContent='Continue when ready.';
  }else if(running){
    statusTitle.textContent=`Traffic ${difficulty().toFixed(1)}×`;
    statusCopy.textContent=`${cars.length} cars currently on the map.`;
  }else{
    statusTitle.textContent='Ready';
    statusCopy.textContent='Cars stop at red lights and continue on green.';
  }
}

function difficulty(){
  return 1+Math.min(elapsed/35,2.2);
}

function switchLights(){
  if(!running||paused||ended||switchCooldown>0) return;

  nsGreen=!nsGreen;
  switchCooldown=.22;
  ui();
}

function spawnCar(){
  const dir=directions[Math.floor(Math.random()*directions.length)];

  if(!spawnLaneClear(dir)) return;

  const d=difficulty();
  const fast=Math.random()<Math.min(.32,.08+(d-1)*.10);
  const speed=(fast?155:118)*(1+(d-1)*.18);

  const car={
    dir,
    speed,
    fast,
    width:dir==='N'||dir==='S'?28:50,
    height:dir==='N'||dir==='S'?50:28,
    passedCenter:false,
    removed:false
  };

  if(dir==='N'){
    car.x=CX-LANE*.5;
    car.y=-70;
    car.vx=0;
    car.vy=speed;
  }else if(dir==='S'){
    car.x=CX+LANE*.5;
    car.y=H+70;
    car.vx=0;
    car.vy=-speed;
  }else if(dir==='E'){
    car.x=W+70;
    car.y=CY-LANE*.5;
    car.vx=-speed;
    car.vy=0;
  }else{
    car.x=-70;
    car.y=CY+LANE*.5;
    car.vx=speed;
    car.vy=0;
  }

  cars.push(car);
}

function spawnLaneClear(dir){
  return !cars.some(car=>{
    if(car.dir!==dir) return false;

    if(dir==='N') return car.y<85;
    if(dir==='S') return car.y>H-85;
    if(dir==='E') return car.x>W-95;
    return car.x<95;
  });
}

function shouldStop(car){
  const green=(car.dir==='N'||car.dir==='S')?nsGreen:!nsGreen;
  if(green||car.passedCenter) return false;

  if(car.dir==='N'){
    return car.y+car.height/2>=CY-STOP && car.y<CY;
  }
  if(car.dir==='S'){
    return car.y-car.height/2<=CY+STOP && car.y>CY;
  }
  if(car.dir==='E'){
    return car.x-car.width/2<=CX+STOP && car.x>CX;
  }
  return car.x+car.width/2>=CX-STOP && car.x<CX;
}

function carAhead(car){
  let closest=null;
  let distance=Infinity;

  for(const other of cars){
    if(other===car||other.dir!==car.dir) continue;

    let d=Infinity;

    if(car.dir==='N'&&other.y>car.y) d=other.y-car.y;
    if(car.dir==='S'&&other.y<car.y) d=car.y-other.y;
    if(car.dir==='E'&&other.x<car.x) d=car.x-other.x;
    if(car.dir==='W'&&other.x>car.x) d=other.x-car.x;

    if(d>0&&d<distance){
      distance=d;
      closest=other;
    }
  }

  if(!closest) return false;

  const minGap=(car.dir==='N'||car.dir==='S')
    ? (car.height+closest.height)/2+12
    : (car.width+closest.width)/2+12;

  return distance<minGap;
}

function update(dt){
  elapsed+=dt;
  spawnTimer+=dt;
  switchCooldown=Math.max(0,switchCooldown-dt);

  const interval=Math.max(.38,1.16-difficulty()*.19);

  if(spawnTimer>=interval){
    spawnTimer=0;
    spawnCar();

    if(Math.random()<Math.min(.34,(difficulty()-1)*.13)){
      spawnCar();
    }
  }

  for(const car of cars){
    const stopped=shouldStop(car)||carAhead(car);

    if(!stopped){
      car.x+=car.vx*dt;
      car.y+=car.vy*dt;
    }

    if(
      !car.passedCenter &&
      Math.abs(car.x-CX)<ROAD*.42 &&
      Math.abs(car.y-CY)<ROAD*.42
    ){
      car.passedCenter=true;
    }

    if(
      car.x<-110||car.x>W+110||
      car.y<-110||car.y>H+110
    ){
      car.removed=true;
      passed++;
      score+=10+Math.floor(difficulty()*3);
      best=Math.max(best,score);
    }
  }

  cars=cars.filter(car=>!car.removed);

  const crash=findCollision();

  if(crash){
    createCrash(crash[0],crash[1]);
    gameOver();
    return;
  }

  for(const p of particles){
    p.x+=p.vx*dt;
    p.y+=p.vy*dt;
    p.life-=dt;
  }
  particles=particles.filter(p=>p.life>0);

  score=Math.max(score,Math.floor(elapsed*2)+passed*10);
  best=Math.max(best,score);
  ui();
}

function findCollision(){
  for(let i=0;i<cars.length;i++){
    for(let j=i+1;j<cars.length;j++){
      const a=cars[i],b=cars[j];

      if(a.dir===b.dir) continue;

      const sameAxis=
        ((a.dir==='N'||a.dir==='S')&&(b.dir==='N'||b.dir==='S'))||
        ((a.dir==='E'||a.dir==='W')&&(b.dir==='E'||b.dir==='W'));

      if(sameAxis) continue;

      if(rectOverlap(a,b)) return [a,b];
    }
  }

  return null;
}

function rectOverlap(a,b){
  return Math.abs(a.x-b.x)<(a.width+b.width)*.40 &&
         Math.abs(a.y-b.y)<(a.height+b.height)*.40;
}

function createCrash(a,b){
  const x=(a.x+b.x)/2;
  const y=(a.y+b.y)/2;

  for(let i=0;i<34;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=50+Math.random()*190;
    particles.push({
      x,y,
      vx:Math.cos(angle)*speed,
      vy:Math.sin(angle)*speed,
      life:.4+Math.random()*.65,
      max:1.05
    });
  }
}

function drawBackground(){
  ctx.fillStyle='#17211b';
  ctx.fillRect(0,0,W,H);

  ctx.fillStyle='#28313a';
  ctx.fillRect(CX-ROAD/2,0,ROAD,H);
  ctx.fillRect(0,CY-ROAD/2,W,ROAD);

  ctx.fillStyle='#202830';
  ctx.fillRect(CX-ROAD/2-9,0,9,H);
  ctx.fillRect(CX+ROAD/2,0,9,H);
  ctx.fillRect(0,CY-ROAD/2-9,W,9);
  ctx.fillRect(0,CY+ROAD/2,W,9);

  ctx.strokeStyle='rgba(255,255,255,.42)';
  ctx.lineWidth=3;
  ctx.setLineDash([18,18]);

  ctx.beginPath();
  ctx.moveTo(CX,0);
  ctx.lineTo(CX,CY-ROAD/2);
  ctx.moveTo(CX,CY+ROAD/2);
  ctx.lineTo(CX,H);
  ctx.moveTo(0,CY);
  ctx.lineTo(CX-ROAD/2,CY);
  ctx.moveTo(CX+ROAD/2,CY);
  ctx.lineTo(W,CY);
  ctx.stroke();

  ctx.setLineDash([]);

  ctx.strokeStyle='rgba(255,255,255,.72)';
  ctx.lineWidth=5;

  ctx.beginPath();
  ctx.moveTo(CX-ROAD/2,CY-STOP);
  ctx.lineTo(CX,CY-STOP);
  ctx.moveTo(CX,CY+STOP);
  ctx.lineTo(CX+ROAD/2,CY+STOP);

  ctx.moveTo(CX+STOP,CY-ROAD/2);
  ctx.lineTo(CX+STOP,CY);
  ctx.moveTo(CX-STOP,CY);
  ctx.lineTo(CX-STOP,CY+ROAD/2);
  ctx.stroke();

  drawTrafficLight(CX-ROAD/2-28,CY-ROAD/2-28,nsGreen);
  drawTrafficLight(CX+ROAD/2+28,CY+ROAD/2+28,nsGreen);
  drawTrafficLight(CX+ROAD/2+28,CY-ROAD/2-28,!nsGreen);
  drawTrafficLight(CX-ROAD/2-28,CY+ROAD/2+28,!nsGreen);
}

function drawTrafficLight(x,y,green){
  ctx.fillStyle='#0c1116';
  ctx.beginPath();
  ctx.roundRect(x-10,y-16,20,32,6);
  ctx.fill();

  ctx.fillStyle=green?'#2d4b3c':'#ef6675';
  ctx.beginPath();
  ctx.arc(x,y-7,5,0,Math.PI*2);
  ctx.fill();

  ctx.fillStyle=green?'#5bd997':'#4d2c31';
  ctx.beginPath();
  ctx.arc(x,y+7,5,0,Math.PI*2);
  ctx.fill();
}

function drawCar(car){
  ctx.save();
  ctx.translate(car.x,car.y);

  const vertical=car.dir==='N'||car.dir==='S';

  ctx.fillStyle=car.fast?'#f4b55f':'#6ea8e8';
  ctx.shadowColor='rgba(0,0,0,.28)';
  ctx.shadowBlur=8;
  ctx.shadowOffsetY=4;

  ctx.beginPath();
  ctx.roundRect(-car.width/2,-car.height/2,car.width,car.height,6);
  ctx.fill();

  ctx.shadowBlur=0;
  ctx.shadowOffsetY=0;

  ctx.fillStyle='rgba(225,241,255,.72)';

  if(vertical){
    ctx.fillRect(-car.width*.28,-car.height*.2,car.width*.56,car.height*.23);
    ctx.fillRect(-car.width*.28,car.height*.08,car.width*.56,car.height*.18);
  }else{
    ctx.fillRect(-car.width*.2,-car.height*.28,car.width*.23,car.height*.56);
    ctx.fillRect(car.width*.08,-car.height*.28,car.width*.18,car.height*.56);
  }

  ctx.restore();
}

function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life/p.max);
    ctx.fillStyle=Math.random()>.5?'#ef6675':'#f5c667';
    ctx.beginPath();
    ctx.arc(p.x,p.y,3,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawHUD(){
  ctx.fillStyle='rgba(255,255,255,.60)';
  ctx.font='700 12px system-ui';
  ctx.textAlign='left';
  ctx.fillText(`TRAFFIC ${difficulty().toFixed(1)}x`,14,20);

  ctx.textAlign='right';
  ctx.fillText(`${cars.length} CARS`,W-14,20);
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawBackground();
  drawHUD();

  for(const car of cars) drawCar(car);
  drawParticles();
}

function loop(time){
  if(!running||paused||ended){
    draw();
    return;
  }

  const dt=Math.min((time-last)/1000,.032);
  last=time;

  update(dt);
  draw();

  if(running&&!paused&&!ended){
    raf=requestAnimationFrame(loop);
  }
}

async function saveResult(){
  try{
    const response=await fetch('score.php',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        score,
        time:Math.floor(elapsed),
        passed
      })
    });

    const data=await response.json();

    if(response.ok){
      best=Number(data.highScore||best);
      ui();
    }
  }catch(_){}
}

function gameOver(){
  if(ended) return;

  running=false;
  paused=false;
  ended=true;
  void saveResult();

  show(
    'CRASH',
    `${score} points`,
    `${passed} cars passed safely in ${Math.floor(elapsed)} seconds.`,
    'Play again'
  );
}

function togglePause(){
  if(ended||(!running&&!paused)) return;

  paused=!paused;

  if(paused){
    running=false;
    cancelAnimationFrame(raf);
    ui();
    show('PAUSED','Intersection frozen.','Continue when ready.','Continue');
  }else{
    hide();
    running=true;
    last=performance.now();
    ui();
    raf=requestAnimationFrame(loop);
  }
}

startBtn.addEventListener('click',()=>{
  if(paused) togglePause();
  else start();
});

restartBtn.addEventListener('click',reset);
switchBtn.addEventListener('click',switchLights);
pauseBtn.addEventListener('click',()=>paused?togglePause():running&&togglePause());

canvas.addEventListener('pointerdown',event=>{
  event.preventDefault();

  if(!running&&!paused){
    start();
    return;
  }

  if(running) switchLights();
});

document.addEventListener('keydown',event=>{
  if(event.key===' '){
    event.preventDefault();

    if(!running&&!paused) start();
    else switchLights();
  }

  if(event.key.toLowerCase()==='p'){
    event.preventDefault();
    togglePause();
  }
});

reset();
