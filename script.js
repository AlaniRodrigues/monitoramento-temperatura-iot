// Configuração pública do Supabase. Nunca inclua INGEST_KEY ou service_role aqui.
const SUPABASE_URL = 'https://tlhhljuouxpnskyrzgzq.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_IY2JAuppXWG31DVwdUMOgg_QKnu45yk';
const STALE_AFTER_MS = 30000;
const $ = (id) => document.getElementById(id);
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
function renderChart(items) {
  const c = $('chart'), ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);
  const data = [...items].reverse().filter(x => Number.isFinite(Number(x.temperatura)));
  ctx.strokeStyle = '#344761'; ctx.fillStyle = '#9caec8'; ctx.font = '13px system-ui';
  if (!data.length) { ctx.fillText('Sem dados para exibir', 24, 45); return; }
  const vals = data.map(x => Number(x.temperatura));
  let lo = Math.min(...vals, 30) - 3, hi = Math.max(...vals, 30) + 3;
  if (hi <= lo) hi = lo + 1;
  const x = i => 52 + (w - 78) * (data.length === 1 ? 0.5 : i / (data.length - 1));
  const y = v => h - 35 - (v - lo) / (hi - lo) * (h - 62);
  for (let i = 0; i < 4; i++) {
    const v = lo + (hi - lo) * i / 3;
    ctx.beginPath(); ctx.moveTo(52, y(v)); ctx.lineTo(w - 22, y(v)); ctx.stroke();
    ctx.fillText(v.toFixed(1) + '°', 4, y(v) + 4);
  }
  ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = '#edab62';
  ctx.beginPath(); ctx.moveTo(52, y(30)); ctx.lineTo(w - 22, y(30)); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = '#58d8cc'; ctx.lineWidth = 3; ctx.beginPath();
  data.forEach((d, i) => i ? ctx.lineTo(x(i), y(Number(d.temperatura))) : ctx.moveTo(x(i), y(Number(d.temperatura))));
  ctx.stroke(); ctx.fillStyle = '#58d8cc';
  data.forEach((d, i) => { ctx.beginPath(); ctx.arc(x(i), y(Number(d.temperatura)), 3.5, 0, Math.PI * 2); ctx.fill(); });
}
function updateFreshness() {
  const latest = latestReadings[0];
  const alert = $('alert');
  if (!latest) {
    alert.textContent = 'Sem dados'; alert.className = 'alertValue';
    if (lastFetchSucceeded) status('Conectado ao Supabase', 'online');
    return;
  }
  const timestamp = new Date(latest.created_at).getTime();
  const age = Date.now() - timestamp;
  const stale = !Number.isFinite(timestamp) || age > STALE_AFTER_MS;
  if (stale) {
    alert.textContent = 'Dados desatualizados';
    alert.className = 'alertValue bad';
    $('tempInfo').textContent = 'Última leitura: ' + timeLabel(latest.created_at) + ' (sem novas leituras)';
    if (lastFetchSucceeded) status('Sem novas leituras do sensor', '');
  } else {
    alert.textContent = Number(latest.temperatura) >= 30 ? 'Temperatura alta' : 'Normal';
    alert.className = Number(latest.temperatura) >= 30 ? 'alertValue bad' : 'alertValue good';
    $('tempInfo').textContent = 'Última leitura: ' + timeLabel(latest.created_at);
    if (lastFetchSucceeded) status('Conectado ao Supabase', 'online');
  }
}
function render(data) {
  latestReadings = data;
  const latest = data[0];
  $('temp').textContent = latest ? number(latest.temperatura, '°C') : '-- °C';
  $('humidity').textContent = latest ? number(latest.umidade, '%') : '-- %';
  $('tempInfo').textContent = latest ? 'Última leitura: ' + timeLabel(latest.created_at) : 'Sem leitura';
  $('rows').replaceChildren();
  if (!data.length) {
    const tr = document.createElement('tr'), td = document.createElement('td');
    td.colSpan = 4; td.textContent = 'Nenhuma leitura cadastrada'; tr.append(td); $('rows').append(tr);
  }
  data.forEach(d => {
    const tr = document.createElement('tr');
    [timeLabel(d.created_at), number(d.temperatura, '°C'), number(d.umidade, '%'), String(d.device_id ?? '--')]
      .forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.append(td); });
    $('rows').append(tr);
  });
  renderChart(data);
  $('updated').textContent = 'Atualizado: ' + new Date().toLocaleTimeString('pt-BR');
  updateFreshness();
}
async function load() {
  if (!configured()) {
    status('Configure a URL e a chave pública no script.js');
    $('rows').innerHTML = '<tr><td colspan="4">Preencha a configuração no arquivo script.js antes de publicar.</td></tr>';
    return;
  }
  try {
    const base = SUPABASE_URL.replace(/\/$/, '');
    const res = await fetch(base + '/rest/v1/leituras?select=id,created_at,temperatura,umidade,device_id&order=created_at.desc&limit=30', {
      headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY, 'Authorization': 'Bearer ' + SUPABASE_PUBLISHABLE_KEY }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status + ' — confira a chave pública e a política SELECT da tabela');
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Resposta inesperada');
    lastFetchSucceeded = true;
    render(data);
  } catch (e) {
    console.error(e); lastFetchSucceeded = false;
    status('Erro ao consultar Supabase', 'error');
    $('updated').textContent = e.message;
  }
}
load();
setInterval(load, 10000);
setInterval(updateFreshness, 1000);
