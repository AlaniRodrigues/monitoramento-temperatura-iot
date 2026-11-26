// Configuração pública do Supabase. Nunca inclua INGEST_KEY ou service_role aqui.
const SUPABASE_URL = 'https://tlhhljuouxpnskyrzgzq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IY2JAuppXWG31DVwdUMOgg_QKnu45yk';
const STALE_AFTER_MS = 30000;
function setup(device,low,ideal,critical){
const $ = (id) => document.getElementById(id === "status" || id === "theme" || id === "refresh" ? id : device + "-" + id);
const configured = () => SUPABASE_URL.startsWith('https://') && !SUPABASE_PUBLISHABLE_KEY.startsWith('COLE_AQUI');
let latestReadings = [];
let lastFetchSucceeded = false;

function status(message, kind = '') {
  $('status').textContent = message;
  $('status').className = 'status ' + kind;
}
function number(v, unit) {
  return v === null || v === undefined || !Number.isFinite(Number(v))
    ? '-- ' + unit : Number(v).toFixed(1) + ' ' + unit;
}
function timeLabel(s) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '--' : d.toLocaleString('pt-BR');
}
const chartInteractions = new Map();
function renderChart(items, field = "temperatura", canvasId = "chart") {
  const c = $(canvasId), ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);
  const previous = chartInteractions.get(canvasId);
  if (previous) { previous.hide(); previous.points=[]; previous.base=null; ctx.clearRect(0,0,w,h); }
  const data = [...items].reverse().filter(x => x[field] != null && Number.isFinite(Number(x[field])));
  ctx.lineWidth = 1; ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border'); ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--muted'); ctx.font = '13px system-ui';
  if (!data.length) { ctx.fillText('Sem dados para exibir', 24, 45); return; }
  const vals = data.map(x => Number(x[field]));
  let lo = Math.min(...vals, ...(field === "temperatura" ? [low, ideal, critical] : [])) - 3, hi = Math.max(...vals, ...(field === "temperatura" ? [low, ideal, critical] : [])) + 3;
  if (hi <= lo) hi = lo + 1;
  const x = i => 52 + (w - 78) * (data.length === 1 ? 0.5 : i / (data.length - 1));
  const y = v => h - 35 - (v - lo) / (hi - lo) * (h - 62);
  for (let i = 0; i < 4; i++) {
    const v = lo + (hi - lo) * i / 3;
    ctx.beginPath(); ctx.moveTo(52, y(v)); ctx.lineTo(w - 22, y(v)); ctx.stroke();
    ctx.fillText(v.toFixed(1) + (field === 'temperatura' ? '°' : '%'), 4, y(v) + 4);
  }
  if (field === "temperatura") { ctx.save(); ctx.setLineDash([6,6]); for(const [v,color] of [[low,'#38bdf8'],[ideal,'#eab308'],[critical,'#ef4444']]) {ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(52,y(v));ctx.lineTo(w-22,y(v));ctx.stroke();} ctx.restore(); }
  ctx.strokeStyle = field === 'temperatura' ? '#159e96' : '#3985db'; ctx.lineWidth = 3; ctx.beginPath();
  data.forEach((d, i) => i ? ctx.lineTo(x(i), y(Number(d[field]))) : ctx.moveTo(x(i), y(Number(d[field]))));
  ctx.stroke(); ctx.fillStyle = field === 'temperatura' ? '#159e96' : '#3985db';
  data.forEach((d, i) => { ctx.beginPath(); ctx.arc(x(i), y(Number(d[field])), 3.5, 0, Math.PI * 2); ctx.fill(); });
  const points = data.map((d,i) => ({d, x:x(i), y:y(Number(d[field]))}));
  let interaction = chartInteractions.get(canvasId);
  if (!interaction) {
    const tip = document.createElement('div');
    tip.setAttribute('role','tooltip');
    Object.assign(tip.style,{position:'fixed',zIndex:'9999',pointerEvents:'none',display:'none',padding:'12px 15px',borderRadius:'10px',background:'#111c30',color:'#f1f5f9',border:'1px solid #64748b',boxShadow:'0 8px 24px #0005',font:'13px/1.6 system-ui',whiteSpace:'pre-line',maxWidth:'calc(100vw - 24px)'});
    document.body.append(tip);
    const hide = () => {tip.style.display='none'; if(interaction.base) ctx.putImageData(interaction.base,0,0);};
    interaction = {hide, points:[], base:null};
    chartInteractions.set(canvasId,interaction);
    const show = e => {
      const r=c.getBoundingClientRect();
      if(!r.width || !r.height || !interaction.points.length) return;
      const px=(e.clientX-r.left)*c.width/r.width;
      const py=(e.clientY-r.top)*c.height/r.height;
      if(px<45 || px>c.width-15 || py<10 || py>c.height-20){hide();return;}
      const p=interaction.points.reduce((a,b)=>Math.abs(b.x-px)<Math.abs(a.x-px)?b:a);
      if(interaction.base) ctx.putImageData(interaction.base,0,0);
      ctx.save();ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(p.x,15);ctx.lineTo(p.x,c.height-35);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=field==='temperatura'?'#159e96':'#3985db';ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
      tip.textContent=timeLabel(p.d.created_at)+'\nTemperatura: '+number(p.d.temperatura,'°C')+'\nDispositivo: '+String(p.d.device_id??'--');
      tip.style.display='block';
      tip.style.left=Math.max(8,Math.min(e.clientX+14,window.innerWidth-tip.offsetWidth-8))+'px';
      tip.style.top=Math.max(8,Math.min(e.clientY+14,window.innerHeight-tip.offsetHeight-8))+'px';
    };
    c.style.cursor='crosshair';
    c.addEventListener('pointermove',show);c.addEventListener('pointerdown',show);c.addEventListener('pointerleave',hide);c.addEventListener('pointercancel',hide);
    document.addEventListener('pointerdown',e=>{if(e.target!==c)hide();});
    window.addEventListener('scroll',hide,{passive:true});
  }
  interaction.points=points;
  interaction.base=ctx.getImageData(0,0,w,h);
}
function updateFreshness() {
  const latest = latestReadings[0];
  const alert = $('alert');
  if (!latest) {
    alert.textContent = 'Sem dados'; alert.className = 'alertValue';
    
    return;
  }
  const timestamp = new Date(latest.created_at).getTime();
  const age = Date.now() - timestamp;
  $('age').textContent = Number.isFinite(age) ? 'Última leitura há ' + Math.max(0,Math.floor(age/1000)) + ' s' : 'Horário indisponível';
  const stale = !Number.isFinite(timestamp) || age > STALE_AFTER_MS;
  if (stale || !lastFetchSucceeded) {
    alert.textContent = lastFetchSucceeded ? 'Dados desatualizados' : 'Falha de consulta';
    alert.className = 'alertValue bad';
    $('tempInfo').textContent = 'Última leitura: ' + timeLabel(latest.created_at) + ' (sem novas leituras)';
    
  } else {
    const t = Number(latest.temperatura);
    const state = classify(latest.temperatura);
    alert.textContent = ({high:'Temperatura crítica',low:'Temperatura baixa',warning:'Atenção',normal:'Normal',unknown:'Sem leitura'})[state];
    alert.className = 'alertValue ' + ({high:'bad',low:'cold',warning:'warning',normal:'good',unknown:''})[state];
    $('tempInfo').textContent = 'Última leitura: ' + timeLabel(latest.created_at);
    
  }
}
function classify(v){if(v==null || !Number.isFinite(Number(v)))return 'unknown'; const t=Number(v);return t<low?'low':t>critical?'high':t>ideal?'warning':'normal';}
function filtered(){const q=$('search').value.toLowerCase(),f=$('filter').value;return latestReadings.filter(d=>String(d.device_id??'').toLowerCase().includes(q)&&(f==='all'||classify(d.temperatura)===f));}
function renderRows(){const data=filtered();
  $('rows').replaceChildren();
  if (!data.length) {
    const tr = document.createElement('tr'), td = document.createElement('td');
    td.colSpan = 3; td.textContent = 'Nenhuma leitura cadastrada'; tr.append(td); $('rows').append(tr);
  }
  data.forEach(d => {
    const tr = document.createElement('tr');
    [timeLabel(d.created_at), number(d.temperatura, '°C'), String(d.device_id ?? '--')]
      .forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    $('rows').append(tr);
  });
 }
function render(data) {
  latestReadings = data;
  const latest = data[0];
  $('temp').textContent = latest ? number(latest.temperatura, '°C') : '-- °C';
  $('tempInfo').textContent = latest ? 'Última leitura: ' + timeLabel(latest.created_at) : 'Sem leitura';
  renderRows();
  const vals = data.filter(d=>d.temperatura!=null && Number.isFinite(Number(d.temperatura))).map(d=>Number(d.temperatura));
  $('min').textContent = vals.length ? number(Math.min(...vals),'°C') : '--';
  $('max').textContent = vals.length ? number(Math.max(...vals),'°C') : '--';
  $('avg').textContent = vals.length ? number(vals.reduce((a,b)=>a+b,0)/vals.length,'°C') : '--';
  $('count').textContent = data.length;
  renderChart(data);
  $('updated').textContent = 'Atualizado: ' + new Date().toLocaleTimeString('pt-BR');
  updateFreshness();
}
async function load() {
  if (!configured()) {
    status('Configure a URL e a chave pública no script.js');
    $('rows').innerHTML = '<tr><td colspan="3">Preencha a configuração no arquivo script.js antes de publicar.</td></tr>';
    return;
  }
  try {
    const base = SUPABASE_URL.replace(/\/$/, '');
    const res = await fetch(base + '/rest/v1/leituras?select=id,created_at,temperatura,device_id&device_id=eq.' + encodeURIComponent(device) + '&order=created_at.desc&limit=30', {
      headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY, 'Authorization': 'Bearer ' + SUPABASE_PUBLISHABLE_KEY }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — confira a chave pública e a política SELECT da tabela');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada');
    lastFetchSucceeded = true;
    render(data);
    return true;
  } catch (e) {
    console.error(e); lastFetchSucceeded = false;
    status('Erro ao consultar Supabase', 'error');
    $('updated').textContent = e.message;
    return false;
  }
}
$('filter').addEventListener('change',renderRows);
$('search').addEventListener('input',renderRows);

$('export').addEventListener('click',()=>{const cell=v=>{let s=String(v??'');if(/^[=+@-]/.test(s)&&typeof v==='string')s="'"+s;return '"'+s.replaceAll('"','""')+'"';};const lines=[['Data e hora','Temperatura (°C)','Dispositivo'],...filtered().map(d=>[timeLabel(d.created_at),d.temperatura==null?'':String(d.temperatura).replace('.',','),d.device_id])];const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.map(r=>r.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=device+'-leituras.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
return {load, updateFreshness, redraw:()=>{renderChart(latestReadings);}};

}

const panels=[setup('cerveja-01',0,5,8),setup('guarana-01',0,5,8),setup('suco-01',0,5,8),setup('energetico-01',0,5,8),setup('agua-01',0,5,8)];
let busy=false;
async function refresh(){if(busy)return;busy=true;try{const ok=await Promise.all(panels.map(p=>p.load()));const el=document.getElementById('status');el.textContent=ok.every(Boolean)?'Conectado ao Supabase':'Falha de consulta';el.className='status '+(ok.every(Boolean)?'online':'error');}finally{busy=false;}}
document.getElementById('refresh').onclick=refresh;
document.getElementById('theme').onclick=()=>{const light=document.body.classList.toggle('light');document.getElementById('theme').textContent=light?'☾ Tema escuro':'☀ Tema claro';panels.forEach(p=>p.redraw());};
refresh();setInterval(refresh,10000);setInterval(()=>panels.forEach(p=>p.updateFreshness()),1000);

function syncPreviews(){for(const id of ["cerveja-01", "guarana-01", "suco-01", "energetico-01", "agua-01"]){const get=s=>document.getElementById(id+"-"+s);get("previewTemp").textContent=get("temp").textContent;get("previewAlert").textContent=get("alert").textContent;get("previewAlert").className=get("alert").className.replace("alertValue","");}}
for(const id of ["cerveja-01", "guarana-01", "suco-01", "energetico-01", "agua-01"]){const root=document.getElementById(id);const observer=new MutationObserver(syncPreviews);for(const suffix of ["temp","alert"])observer.observe(document.getElementById(id+"-"+suffix),{childList:true,characterData:true,subtree:true,attributes:true});}syncPreviews();
for(const b of document.querySelectorAll('.deviceCard')) b.addEventListener('click',()=>{for(const other of document.querySelectorAll('.deviceCard')){const active=other===b;other.setAttribute('aria-pressed',String(active));document.getElementById(other.dataset.device).hidden=!active;}document.getElementById('historico').textContent='Histórico · '+b.querySelector('.equipmentName').textContent;panels.forEach(p=>p.redraw());});
