const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRbk9yRx6UAAq3zSeaRJY2FJ9vC2dElOOQo0o2IQYjkk1Ql6LvV74ndh_ngIZe4w/pub?output=csv';

function parseCSV(text) {
  const rows = [];
  let cell = '', row = [], inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (c === '"' && n === '"') { cell += '"'; i++; continue; }
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { row.push(cell); cell = ''; continue; }
    if ((c === '\n' || c === '\r') && !inQ) {
      if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
      cell = ''; row = []; continue;
    }
    cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.length);
}

const norm  = s => String(s ?? '').trim();
const keyOf = s => norm(s).toLowerCase().replace(/\s+/g, '');

async function openPlot(plotId) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const list  = document.getElementById('veteran-list');

  title.textContent = `Plot ${String(plotId).toUpperCase()}`;
  list.innerHTML = '<li>Loading…</li>';

  try {
    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    const csvText = await res.text();

    const rows = parseCSV(csvText);
    const header = rows[0].map(keyOf);
    const data = rows.slice(1);
    const plotCol = header.indexOf('plot');
    const nameCol = header.indexOf('name');

    const matches = data.filter(r => keyOf(r[plotCol]) === keyOf(plotId));
    list.innerHTML = '';

    if (matches.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No veterans listed for this plot yet.';
      list.appendChild(li);
    } else {
      for (const r of matches) {
        const line = r.filter(Boolean).join(' — ');
        const li = document.createElement('li');
        li.textContent = line;
        list.appendChild(li);
      }
    }

    modal.style.display = 'block';
  } catch (err) {
    console.error(err);
    list.innerHTML = '<li>Could not load data.</li>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close');
  if (closeBtn && modal) {
    closeBtn.onclick = () => (modal.style.display = 'none');
    window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
  }
});
