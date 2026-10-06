export const YEAR = new Date().getFullYear();

export const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const todayStr = () => toISODate(new Date());
export const addDays = (dateStr, n) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

export const fmtDate = (s) =>
  s
    ? new Date(s.length > 10 ? s : `${s}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';
export const fmtDateTime = (s) =>
  s
    ? new Date(s).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';
export const fmtMoney = (n) => `${(Number(n) || 0).toLocaleString('en-US')} RWF`;
export const fmtPrice = (n) => (Number(n) > 0 ? fmtMoney(n) : 'Free');
export const pct = (a, b) => (b > 0 ? Math.round((a / b) * 1000) / 10 : 0);
export const short = (s, n = 16) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export const monthKey = (dateStr) => dateStr.slice(0, 7);
export const monthLabel = (key) =>
  new Date(`${key}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });

// ---- ID and number generation: EVT-2026-0001, REG-2026-0001, TKT-2026-0001
export const makeCode = (prefix, n) => `${prefix}-${YEAR}-${String(n).padStart(4, '0')}`;
export const nextId = (list) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1;
export const nextSeq = (list, field) =>
  list.reduce((m, x) => Math.max(m, parseInt(String(x[field]).split('-').pop(), 10) || 0), 0) + 1;

// ---- Validators
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v) => /^\+?[0-9\s-]{9,15}$/.test(v.trim());

export const groupBy = (list, fn) =>
  list.reduce((acc, item) => {
    const k = fn(item);
    (acc[k] = acc[k] || []).push(item);
    return acc;
  }, {});

// ---- Frontend-generated CSV export
export function exportCsv(filename, columns, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [
    columns.map((c) => esc(c.label)).join(','),
    ...rows.map((r) => columns.map((c) => esc(r[c.key])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// kind = 'page' (print the page's .print-area) or 'dialog' (print only the open dialog)
export function printNow(kind = 'page') {
  document.body.dataset.printing = kind;
  const clear = () => {
    delete document.body.dataset.printing;
    window.removeEventListener('afterprint', clear);
  };
  window.addEventListener('afterprint', clear);
  setTimeout(() => window.print(), 80);
}
