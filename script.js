const schedules = {
  lundi: [
    ["10h55", "Hall"],
    ["10h55–11h25", "Perm 1"],
    ["11h25–11h55", "REPAS"],
    ["11h55–12h30", "Passage self"],
    ["12h30–13h00", "Cour WC"],
    ["13h00–13h25", "SELF"],
    ["13h25–13h30", "Hall"],
    ["13h30–14h25", "Perm 3 ou suivi élèves"],
    ["14h25", "Portail loge"],
    ["14h25–15h20", "Perm 2"],
    ["15h20–15h35", "Portail cour"]
  ],
  jeudi: [
    ["9h50–10h05", "Cour"],
    ["10h05–11h00", "Perm 3 ou suivi élèves"],
    ["10h55–11h25", "Perm 1"],
    ["11h25–11h55", "REPAS"],
    ["11h55–12h30", "Cour"],
    ["12h30–13h00", "Hall + portail loge 12h30 + 12h55"],
    ["13h00–13h25", "Cour Basket"],
    ["13h25–13h30", "Cour"],
    ["13h30–14h25", "Perm 1"],
    ["14h25", "Couloirs"],
    ["14h25–15h20", "Perm 3 ou suivi élèves"],
    ["15h20–15h35", "Portail cour + cour"],
    ["15h35–16h30", "Perm 2"],
    ["16h30", "Portail cour"],
    ["16h30–17h30", "Retenues"]
  ],
  vendredi: [
    ["7h40–7h55", "Cour"],
    ["7h55–8h05", "Cour"],
    ["8h05–8h55", "Perm 1"],
    ["8h55", "Hall"],
    ["8h55–9h50", "Perm 2"],
    ["9h50–10h05", "Cour WC"],
    ["10h05–11h00", "Perm 3 ou suivi élèves"],
    ["10h55–11h25", "REPAS"],
    ["11h25–11h55", "Portail 11h30 puis Self"],
    ["11h55–12h30", "Passage Self"],
    ["12h30–13h00", "Cour WC"],
    ["13h00–13h25", "SELF"],
    ["13h25–13h30", "Hall"],
    ["13h30–14h25", "Aide Bureau"],
    ["14h25", "Couloirs"],
    ["14h25–15h20", "Perm 3 ou suivi élèves"],
    ["15h20–15h35", "Portail cour"]
  ]
};

const labels = {
  lundi: "Lundi", mardi: "Mardi", mercredi: "Mercredi",
  jeudi: "Jeudi", vendredi: "Vendredi"
};
const order = ["lundi","mardi","mercredi","jeudi","vendredi"];
let selected = null;

function minutes(t){
  const m = t.match(/(\d{1,2})h(\d{2})/);
  return m ? Number(m[1])*60 + Number(m[2]) : null;
}
function rangeStart(s){ return minutes(s.split("–")[0] || s); }
function rangeEnd(s){
  const parts=s.split("–");
  return parts.length>1 ? minutes(parts[1]) : null;
}
function durationMinutes(time){
  const parts = time.split("–");
  if(parts.length < 2) return 0;
  const start = minutes(parts[0]);
  const end = minutes(parts[1]);
  if(start === null || end === null) return 0;
  return Math.max(0, end - start);
}
function taskClass(name){
  const n=name.toLowerCase();
  if(n.includes("perm")) return "PERM";
  if(n.includes("passage")) return "PASSAGE SELFenfin ";
  if(n.includes("hall") || n.includes("portail") || n.includes("couloir")|| n.includes("self")|| n.includes("cour")) return "SURVEILLANCE";
  if(n.includes("repas") ) return "REPAS";
  return "AUTRE";
}
function isCurrent(time){
  const start=rangeStart(time), end=rangeEnd(time);
  if(start===null) return false;
  const now=new Date();
  const cur=now.getHours()*60+now.getMinutes();
  return cur>=start && (end===null ? cur===start : cur<end);
}
function render(day){
  selected=day;
  document.querySelectorAll(".day-btn").forEach(b=>b.classList.toggle("active",b.dataset.day===day));
  document.getElementById("dayTitle").textContent=labels[day];
  document.getElementById("daySubtitle").textContent =
    schedules[day] ? `${schedules[day].length} missions prévues` : "Journée sans travail";
  const box=document.getElementById("schedule");
  if(!schedules[day]){
    box.innerHTML=`<div class="empty"><div class="icon">😴</div><h3>Pas de travail aujourd'hui</h3><p>Profite bien de ta journée.</p></div>`;
    return;
  }
  box.innerHTML=schedules[day].map(([time,name])=>{
    const current=isCurrent(time);
    return `<div class="mission ${current?'current':''}">
      <div class="time">${time}</div>
      <div class="task">
        <div>
          <div class="task-name">${name}</div>
          <div class="duration">${durationMinutes(time)} min</div>
        </div>
        <div class="task-tag ${current?'current-label':''}">${current?'EN COURS':taskClass(name)}</div>
      </div>
    </div>`;
  }).join("");
}
function init(){
  const jsDay=new Date().getDay(); // 0 dimanche, 1 lundi...
  const map={1:"lundi",2:"mardi",3:"mercredi",4:"jeudi",5:"vendredi"};
  const today=map[jsDay] || "lundi";
  const now=new Date();
  document.getElementById("dateLabel").textContent =
    now.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const days=document.getElementById("days");
  days.innerHTML=order.map(d=>`<button class="day-btn" data-day="${d}">${labels[d]}<small>${schedules[d]?'Travail':'Repos'}</small></button>`).join("");
  days.querySelectorAll(".day-btn").forEach(b=>b.onclick=()=>render(b.dataset.day));
  render(today);
}
init();
setInterval(()=>{ if(selected) render(selected); },60000);