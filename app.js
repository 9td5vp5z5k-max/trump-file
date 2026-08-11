
let archive={entries:[],lastUpdated:null},sourceArchive={count:0,records:[]},receiptsOnly=false,deferredPrompt=null;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const fmt=d=>new Date(d+"T12:00:00").toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});
const today=()=>new Date().toISOString().slice(0,10);
function daysAgo(n){let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-n);return d}
function sound(){const A=window.AudioContext||window.webkitAudioContext;if(!A)return;const c=new A(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.connect(g);g.connect(c.destination);o.type="sawtooth";o.frequency.setValueAtTime(230,t);o.frequency.exponentialRampToValueAtTime(72,t+.7);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.75);o.start();o.stop(t+.78)}
function links(e){return e.sources.map(s=>`<a class="source-link" href="${s.url}" target="_blank" rel="noopener">${s.label} ↗</a>`).join("")}
function card(e){return `<article class="card" data-id="${e.id}"><div class="meta"><span>#${e.id} · ${e.type} · ${e.sourceTier}</span><span>${fmt(e.date)}</span></div><h3 class="satire">${e.satiricalTitle}</h3><p>${e.summary}</p><p><b>Context:</b> ${e.context}</p><div>${links(e)}</div><div class="chips"><span class="chip">${e.category}</span>${e.tags.map(t=>`<span class="chip">${t}</span>`).join("")}</div></article>`}
function sorted(a){return [...a].sort((x,y)=>y.date.localeCompare(x.date)||y.id-x.id)}
function renderLatest(){
 const q=$("#search").value.toLowerCase().trim(),f=$("#filter").value;
 const a=sorted(archive.entries).filter(e=>(f==="all"||e.type===f)&&(!q||JSON.stringify(e).toLowerCase().includes(q)));
 $("#cards").innerHTML=a.map(card).join("")||'<div class="card">No matching entries.</div>'
}
function render(){
 const pub=archive.entries.filter(e=>["verified","mixed"].includes(e.verdict));
 $("#counter").textContent=pub.length.toLocaleString(); $("#sourceCount").textContent=(sourceArchive.count||0).toLocaleString();
 $("#todayCount").textContent=pub.filter(e=>e.date===today()).length;
 $("#weekCount").textContent=pub.filter(e=>new Date(e.date+"T12:00:00")>=daysAgo(7)).length;
 $("#monthCount").textContent=pub.filter(e=>new Date(e.date+"T12:00:00")>=daysAgo(30)).length;
 $("#updated").textContent="Updated "+new Date(archive.lastUpdated).toLocaleString();
 renderLatest();
 $("#promiseCards").innerHTML=sorted(pub.filter(e=>e.type==="promise")).map(card).join("");
 $("#vsCards").innerHTML=sorted(pub.filter(e=>e.type==="contradiction")).map(card).join("")||'<div class="card">Contradiction pairs appear here as they are verified.</div>';
 document.body.classList.toggle("receipts-only",receiptsOnly)
}
const defenses=[
["He said he was going to do that.","promise","Campaign promise records"],
["He kept his promises.","promise","Promise-status records"],
["That's not what he said.","statement","Quoted statement records"],
["That's fake news.","all","Broad sourced archive"],
["You're taking him out of context.","statement","Statement + context records"],
["The courts are just against him.","contradiction","Court-linked contradiction records"],
["Show me a primary source.","primary","Primary-source-backed records"],
["Biden did the same thing.","all","Comparable claims need a separately sourced comparison"]
];
function renderDefenseButtons(){
 $("#defenseButtons").innerHTML=defenses.map((d,i)=>`<button class="defense-choice" data-defense="${i}" aria-controls="defenseResults">${d[0]}<br><small>${d[2]}</small><span class="choice-arrow">›</span></button>`).join("");
 $$("[data-defense]").forEach(b=>b.addEventListener("click",()=>runDefense(+b.dataset.defense,b)));
}
function runDefense(i,button){
 const [label,type]=defenses[i];let pool;
 if(type==="all")pool=archive.entries;
 else if(type==="primary")pool=archive.entries.filter(e=>(e.sourceTier||"").includes("primary"));
 else pool=archive.entries.filter(e=>e.type===type);

 $$(".defense-choice").forEach(b=>b.classList.toggle("selected",b===button));

 const countText=pool.length
   ? `Found ${pool.length} relevant sourced ${pool.length===1?"record":"records"} in the current archive.`
   : "No matching verified record yet. The app should say that instead of manufacturing a rebuttal.";

 $("#defenseResults").innerHTML=`<section class="defense-answer">
   <div class="answer-top"><div><div class="eyebrow">REALITY CHECK</div><h3>${label}</h3></div>
   <span class="answer-count">${pool.length}</span></div>
   <p>${countText}</p>
   ${pool.length?'<button class="buzzer" id="buzz">🔊 Play wrong-answer buzzer</button>':""}
   <div class="answer-records">${sorted(pool).slice(0,10).map(card).join("")}</div>
 </section>`;

 const buzz=$("#buzz"); if(buzz)buzz.addEventListener("click",sound);

 // Make the tap visibly do something on mobile.
 requestAnimationFrame(()=>{
   const result=$("#defenseResults");
   result.classList.remove("flash");
   void result.offsetWidth;
   result.classList.add("flash");
   result.scrollIntoView({behavior:"smooth",block:"start"});
 });
}
function switchTab(id){
 $$(".tabpanel").forEach(x=>x.classList.toggle("active",x.id===id));
 $$(".tabs button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));
 const panel=$("#"+id);
 if(panel)panel.scrollIntoView({behavior:"smooth",block:"start"});
}
async function boot(){
 archive=await fetch("data/entries.json",{cache:"no-store"}).then(r=>r.json()); try{sourceArchive=await fetch("data/source_archive.json",{cache:"no-store"}).then(r=>r.json())}catch(e){} render();renderDefenseButtons();
 if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js")
}
$$(".tabs button").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
$("#search").oninput=renderLatest;$("#filter").onchange=renderLatest;
$("#receiptsBtn").onclick=()=>{receiptsOnly=!receiptsOnly;$("#receiptsBtn").textContent=receiptsOnly?"🎭 Bring Back Satire":"🧾 Receipts Only";render()};
$("#randomBtn").onclick=()=>{switchTab("latest");const e=archive.entries[Math.floor(Math.random()*archive.entries.length)];$("#search").value="";$("#filter").value="all";renderLatest();setTimeout(()=>document.querySelector(`[data-id="${e.id}"]`)?.scrollIntoView({behavior:"smooth",block:"center"}),100)};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#installBtn").hidden=false});
$("#installBtn").onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;$("#installBtn").hidden=true}};
boot();
