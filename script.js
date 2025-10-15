// Live data from Google Sheet (CSV)
const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSRbk9yRx6UAAq3zSeaRJY2FJ9vC2dElOOQo0o2IQYjkk1Ql6LvV74ndh_ngIZe4w/pub?output=csv';

// --- tiny CSV parser that handles quotes and commas ---
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
  return rows;
}

function norm(s) { return String(s || '').trim(); }
function keyify(s) { return norm(s).toLowerCase().replace(/\s+/g, ''); }

function buildLine(rec) {
  // Show fields in order, skip empties
  const parts = [
    rec.name, rec.branch, rec.conflict, rec.service,
    rec.rank, rec.unit, rec.serviceyears
  ].map(norm).filter(Boolean);
  return parts.join(' — ');
}

async function openPlot(plotId) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const list  = document.getElementById('veteran-list');

  try {
    title.innerText = `Plot ${String(plotId).toUpperCase()}`;
    list.innerHTML = '<li>Loading…</li>';

    const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('CSV fetch failed');
    const text = await res.text();

    const rows = parseCSV(text).filter(r => r.length);
    if (!rows.length) throw new Error('Empty CSV');

    const header = rows[0].map(keyify);
    const data = rows.slice(1);

    // map common header variants -> canonical keys
    const aliases = {
      name: ['name'],
      branch: ['branch','servicebranch'],
      conflict: ['conflict','war','era','campaign'],
      service: ['service','mos','role'],
      rank: ['rank','grade'],
      unit: ['unit','regiment','battalion','company','division','ship'],
      serviceyears: ['serviceyears','serviceyears','serviceyear','years','yearsservice','serviceyears','serviceyears','serviceyears','serviceyears','serviceyears','serviceyears','serviceyears','serviceyears','serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears', 'serviceyears'],
      plot: ['plot']
    };
    // fix: accept "serviceyears" or "serviceyears"/"serviceyears"/"serviceyears", also "serviceyears" with space or typo like "serviceshare"
    aliases.serviceyears = ['serviceyears','serviceyears','serviceyears','service years','years','dates','service dates','served','serviceshare'];

    function colIndex(keys) {
      for (const k of keys) {
        const i = header.indexOf(keyify(k));
        if (i !== -1) return i;
      }
      return -1;
    }

    const idx = {
      name: colIndex(aliases.name),
      branch: colIndex(aliases.branch),
      conflict: colIndex(aliases.conflict),
      service: colIndex(aliases.service),
      rank: colIndex(aliases.rank),
      unit: colIndex(aliases.unit),
      serviceyears: colIndex(aliases.serviceyears),
      plot: colIndex(aliases.plot)
    };
    if (idx.plot === -1) throw new Error('CSV must have a Plot column');

    const targetPlot = keyify(plotId);
    const matches = [];

    for (const r of data) {
      const rplot = keyify(r[idx.plot] || '');
      if (rplot !== targetPlot) continue;
      const rec = {
        name: r[idx.name] || '',
        branch: r[idx.branch] || '',
        conflict: r[idx.conflict] || '',
        service: r[idx.service] || '',
        rank: r[idx.rank] || '',
        unit: r[idx.unit] || '',
        serviceyears: r[idx.serviceyears] || ''
      };
      const line = buildLine(rec);
      if (line) matches.push(line);
    }

    list.innerHTML = '';
    if (!matches.length) {
      const li = document.createElement('li');
      li.textContent = 'No veterans listed for this plot yet.';
      list.appendChild(li);
    } else {
      // sort by Name (first token in line)
      matches.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      for (const t of matches) {
        const li = document.createElement('li');
        li.textContent = t;
        list.appendChild(li);
      }
    }

    modal.style.display = 'block';
  } catch (err) {
    console.error(err);
    alert('Could not load veteran data from the sheet.');
  }
}

// close buttons
document.querySelector('.close').onclick = () => {
  document.getElementById('modal').style.display = 'none';
};
window.onclick = (e) => {
  if (e.target === document.getElementById('modal')) {
    document.getElementById('modal').style.display = 'none';
  }
};
