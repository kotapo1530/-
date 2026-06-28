const PLAT = [
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "instagram", label: "Reels" },
];
const LS = (id, p) => `q_${id}_${p}`;
const isPosted = (id, p) => localStorage.getItem(LS(id, p)) === "1";
const setPosted = (id, p, v) => v ? localStorage.setItem(LS(id, p), "1") : localStorage.removeItem(LS(id, p));
const allPosted = (e) => PLAT.every(p => isPosted(e.id, p.key));

function fmt(dt) {
  if (!dt) return "日時未定";
  const d = new Date(dt);
  const days = ["日","月","火","水","木","金","土"];
  const today = new Date(); today.setHours(0,0,0,0);
  const t2 = new Date(d); t2.setHours(0,0,0,0);
  const diff = Math.round((t2 - today) / 86400000);
  let day = diff === 0 ? "今日" : diff === 1 ? "明日" : `${d.getMonth()+1}/${d.getDate()}(${days[d.getDay()]})`;
  const hh = String(d.getHours()).padStart(2,"0"), mm = String(d.getMinutes()).padStart(2,"0");
  return `${day} ${hh}:${mm}`;
}
function isToday(dt){ if(!dt) return false; const d=new Date(dt),n=new Date();
  return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate(); }

function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove("show"),1500); }

async function copyText(txt){
  try{ await navigator.clipboard.writeText(txt); }
  catch(e){ const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy"); ta.remove(); }
  toast("コピーしました");
}

function toggleRow(id){
  return PLAT.map(p=>{
    const on=isPosted(id,p.key);
    return `<button class="tg ${on?'on':''}" data-id="${id}" data-p="${p.key}">
      ${on?'✓':'　'} ${p.label}<span class="lab">${on?'投稿済':'未投稿'}</span></button>`;
  }).join("");
}

function todayCard(e){
  const ready=e.ready;
  return `<div class="card today">
    <div class="crow">
      <img class="thumb" src="${e.thumb||''}" alt="" onerror="this.style.visibility='hidden'">
      <div class="cmeta">
        <div class="cgenre">${e.genre}</div>
        <div class="ctitle">${e.id} ${e.title}</div>
        <div class="ctime">🕖 ${fmt(e.scheduled)} 予定</div>
        <div class="btnrow">
          ${ready?`<a class="btn primary" href="${e.video}" target="_blank" rel="noopener" download="${e.id}.mp4">⬇ 動画</a>
          <a class="btn" href="${e.thumb}" target="_blank" rel="noopener" download="${e.id}.png">⬇ サムネ</a>`
          :`<span class="btn" style="opacity:.5">準備中</span>`}
        </div>
      </div>
    </div>
    ${ready?`<div class="copybar"><button data-copy="${e.id}" data-p="youtube_title" style="background:var(--gold);color:#2a2208">📋 YouTubeタイトル</button></div>
    <div class="copybar">
      ${PLAT.map(p=>`<button data-copy="${e.id}" data-p="${p.key}">📋 ${p.label}本文</button>`).join("")}
    </div>`:""}
    <div class="toggles">${toggleRow(e.id)}</div>
  </div>`;
}

function miniRow(e){
  const dots=PLAT.map(p=>`<i class="${isPosted(e.id,p.key)?'on':''}"></i>`).join("");
  const done=allPosted(e);
  return `<div class="mini ${e.ready?'':'soon'}">
    ${e.thumb?`<img class="sw" src="${e.thumb}">`:`<div class="sw" style="background:${e.ready?'#3fd0c8':'#33344f'}"></div>`}
    <div class="mt"><b>${e.id} ${e.title}</b><span>${e.genre}・${fmt(e.scheduled)}${e.ready?'':'・準備中'}</span></div>
    ${done?`<span class="pill" style="color:var(--ok);border-color:var(--ok)">完了</span>`:`<div class="dots">${dots}</div>`}
  </div>`;
}

let DATA=null;
function render(){
  const eps=DATA.episodes;
  // pick "today's video": today's scheduled & not fully posted, else next ready & not posted
  let today=eps.find(e=>e.ready&&isToday(e.scheduled)&&!allPosted(e))
          || eps.find(e=>e.ready&&!allPosted(e));
  const tw=document.getElementById("today-wrap");
  tw.innerHTML = today ? `<div class="sec"><span>今日 投稿する動画</span></div>`+todayCard(today)
                       : `<div class="sec"><span>今日のぶんは投稿済み 🎉</span></div>`;
  const rest=eps.filter(e=>e!==today);
  document.getElementById("up-sec").style.display = rest.length?"flex":"none";
  document.getElementById("list").innerHTML = rest.map(miniRow).join("");
  // stats
  const ready=eps.filter(e=>e.ready);
  const week=ready.filter(e=>{const d=new Date(e.scheduled),n=new Date();
    const wk=(x)=>{const y=new Date(x);const day=(y.getDay()+6)%7;y.setDate(y.getDate()-day);y.setHours(0,0,0,0);return +y;};
    return wk(d)===wk(n);});
  const weekDone=week.filter(allPosted).length;
  document.getElementById("st-week").textContent=`${weekDone} / ${week.length}`;
  document.getElementById("st-todo").textContent=ready.filter(e=>!allPosted(e)).length;
  document.getElementById("st-stock").textContent=ready.length;
  // streak: consecutive days up to today with a fully-posted episode
  const doneDays=new Set(ready.filter(allPosted).map(e=>new Date(e.scheduled).toDateString()));
  let s=0,cur=new Date();
  while(doneDays.has(cur.toDateString())){s++;cur.setDate(cur.getDate()-1);}
  const sk=document.getElementById("streak"); if(sk) sk.textContent=`連続 ${s}日`;
}

document.addEventListener("click",e=>{
  const tg=e.target.closest(".tg");
  if(tg){ const id=tg.dataset.id,p=tg.dataset.p; setPosted(id,p,!isPosted(id,p)); render(); return; }
  const cp=e.target.closest("[data-copy]");
  if(cp){ const ep=DATA.episodes.find(x=>x.id===cp.dataset.copy); copyText(ep.captions[cp.dataset.p]); }
});

fetch("episodes.json").then(r=>r.json()).then(d=>{DATA=d;render();})
  .catch(()=>{document.getElementById("list").innerHTML='<p style="color:#a6a3c4">episodes.json を読み込めませんでした。</p>';});

if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }

const _rf=document.getElementById("refresh");
if(_rf) _rf.addEventListener("click", async ()=>{
  _rf.textContent="⏳";
  try{ const ks=await caches.keys(); await Promise.all(ks.map(k=>caches.delete(k))); }catch(e){}
  try{ const rs=await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r=>r.unregister())); }catch(e){}
  location.reload();
});
