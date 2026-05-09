import { useState, useEffect, useCallback } from "react";

// ── PERSISTENT STORAGE ──────────────────────────────────
function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch { return init; }
  });
  const set = useCallback(v => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

// ── HELPERS ──────────────────────────────────────────────
const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtD = n => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const now = () => new Date();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const curMonth = () => `${now().getFullYear()}-${String(now().getMonth()+1).padStart(2,"0")}`;

const EXP_CATS = ["Food","Transport","Shopping","Bills","Entertainment","Health","Education","Groceries","Rent","Other"];
const INV_TYPES = ["Mutual Fund","Stocks","FD","PPF","Gold","NPS","RD","Crypto","Other"];
const CAT_ICONS = { Food:"🍽️", Transport:"🚗", Shopping:"🛍️", Bills:"⚡", Entertainment:"🎬", Health:"💊", Education:"📚", Groceries:"🛒", Rent:"🏠", Other:"📦", Salary:"💰", Bonus:"🎁", Freelance:"💼", Business:"🏢", Investment:"📈" };
const CAT_COLORS = { Food:"#ff6b6b", Transport:"#ffa94d", Shopping:"#da77f2", Bills:"#4dabf7", Entertainment:"#f06595", Health:"#69db7c", Education:"#74c0fc", Groceries:"#a9e34b", Rent:"#ffd43b", Other:"#adb5bd", Salary:"#51cf66", Bonus:"#fcc419", Freelance:"#339af0", Business:"#cc5de8", Investment:"#20c997" };

// ── STYLES ────────────────────────────────────────────────
const G = {
  bg: "#f8f6f0", card: "#ffffff", border: "#e8e2d9",
  text: "#1a1a2e", muted: "#8b8680", accent: "#2d6a4f",
  accent2: "#52b788", danger: "#e63946", warn: "#f4a261",
  info: "#457b9d", purple: "#6c5ce7",
  grad: "linear-gradient(135deg, #2d6a4f 0%, #52b788 100%)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root { font-size: 15px; }
  body { background: ${G.bg}; color: ${G.text}; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
  input, select, textarea { font-family: inherit; }
  button { cursor: pointer; font-family: inherit; }
  * { -webkit-tap-highlight-color: transparent; }

  .app { min-height: 100vh; max-width: 430px; margin: 0 auto; background: ${G.bg}; position: relative; padding-bottom: 80px; }

  /* HEADER */
  .header { background: ${G.grad}; padding: 20px 20px 32px; position: relative; overflow: hidden; }
  .header::before { content:''; position:absolute; top:-40px; right:-40px; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.06); }
  .header::after { content:''; position:absolute; bottom:-60px; left:-20px; width:140px; height:140px; border-radius:50%; background:rgba(255,255,255,.04); }
  .header-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; position:relative; }
  .app-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:#fff; letter-spacing:-.3px; }
  .month-chip { background:rgba(255,255,255,.2); color:#fff; padding:5px 12px; border-radius:20px; font-size:12px; font-weight:500; border:1px solid rgba(255,255,255,.25); backdrop-filter:blur(4px); }
  .balance-label { font-size:12px; color:rgba(255,255,255,.7); margin-bottom:4px; letter-spacing:.5px; text-transform:uppercase; }
  .balance-big { font-family:'Playfair Display',serif; font-size:38px; font-weight:900; color:#fff; line-height:1; position:relative; }
  .balance-sub { display:flex; gap:16px; margin-top:14px; }
  .bsub { background:rgba(255,255,255,.12); border-radius:12px; padding:10px 14px; flex:1; border:1px solid rgba(255,255,255,.15); }
  .bsub-l { font-size:10px; color:rgba(255,255,255,.65); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
  .bsub-v { font-family:'DM Mono',monospace; font-size:15px; font-weight:500; color:#fff; }

  /* QUICK STATS STRIP */
  .strip { display:flex; gap:8px; padding:14px 16px 0; overflow-x:auto; scrollbar-width:none; }
  .strip::-webkit-scrollbar { display:none; }
  .strip-card { background:${G.card}; border:1px solid ${G.border}; border-radius:14px; padding:12px 14px; flex-shrink:0; min-width:110px; }
  .sc-icon { font-size:20px; margin-bottom:6px; }
  .sc-val { font-family:'DM Mono',monospace; font-size:14px; font-weight:500; color:${G.text}; }
  .sc-lbl { font-size:10px; color:${G.muted}; margin-top:2px; }

  /* BOTTOM NAV */
  .nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:430px; background:${G.card}; border-top:1px solid ${G.border}; display:flex; z-index:100; padding-bottom:env(safe-area-inset-bottom,0); }
  .nav-btn { flex:1; display:flex; flex-direction:column; align-items:center; padding:10px 0 8px; background:none; border:none; color:${G.muted}; font-size:10px; font-weight:600; gap:3px; transition:color .2s; letter-spacing:.3px; text-transform:uppercase; }
  .nav-btn.on { color:${G.accent}; }
  .nav-ic { font-size:21px; }

  /* PAGE */
  .page { padding:16px; animation:fadeUp .25s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* SECTION */
  .sec-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:${G.text}; margin-bottom:12px; }
  .sec-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }

  /* CARD */
  .card { background:${G.card}; border:1px solid ${G.border}; border-radius:18px; padding:16px; margin-bottom:12px; }
  .card-title { font-size:11px; font-weight:600; color:${G.muted}; text-transform:uppercase; letter-spacing:.8px; margin-bottom:12px; }

  /* BUTTONS */
  .btn { padding:11px 20px; border-radius:12px; border:none; font-size:14px; font-weight:600; transition:all .2s; }
  .btn-primary { background:${G.grad}; color:#fff; box-shadow:0 4px 16px rgba(45,106,79,.3); }
  .btn-primary:active { transform:scale(.97); }
  .btn-outline { background:transparent; color:${G.accent}; border:1.5px solid ${G.accent2}; }
  .btn-sm { padding:7px 14px; font-size:12px; border-radius:8px; }
  .btn-danger { background:rgba(230,57,70,.1); color:${G.danger}; border:1px solid rgba(230,57,70,.2); }
  .btn-icon { width:36px; height:36px; border-radius:10px; border:1px solid ${G.border}; background:${G.card}; display:flex; align-items:center; justify-content:center; font-size:17px; }

  /* FAB */
  .fab { position:fixed; bottom:74px; right:calc(50% - 200px); width:54px; height:54px; border-radius:16px; background:${G.grad}; color:#fff; font-size:26px; border:none; display:flex; align-items:center; justify-content:center; box-shadow:0 6px 24px rgba(45,106,79,.4); z-index:99; transition:transform .2s; }
  .fab:active { transform:scale(.93); }

  /* TRANSACTION ROW */
  .txn { display:flex; align-items:center; gap:12px; padding:11px 0; border-bottom:1px solid ${G.border}; }
  .txn:last-child { border:none; }
  .txn-icon { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .txn-info { flex:1; min-width:0; }
  .txn-name { font-size:14px; font-weight:500; color:${G.text}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .txn-meta { font-size:11px; color:${G.muted}; margin-top:1px; }
  .txn-amt { font-family:'DM Mono',monospace; font-size:14px; font-weight:500; text-align:right; flex-shrink:0; }

  /* PROGRESS BAR */
  .prog-wrap { margin-bottom:12px; }
  .prog-head { display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px; }
  .prog-bar { height:8px; background:${G.border}; border-radius:4px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:4px; transition:width .6s ease; }

  /* MODAL */
  .overlay { position:fixed; inset:0; background:rgba(26,26,46,.5); backdrop-filter:blur(4px); z-index:200; display:flex; align-items:flex-end; justify-content:center; animation:fadeIn .2s ease; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .sheet { background:${G.card}; border-radius:24px 24px 0 0; width:100%; max-width:430px; padding:20px 20px calc(env(safe-area-inset-bottom,0px) + 20px); max-height:90vh; overflow-y:auto; animation:slideUp .3s cubic-bezier(.4,0,.2,1); }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .sheet-handle { width:36px; height:4px; background:${G.border}; border-radius:2px; margin:0 auto 18px; }
  .sheet-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; margin-bottom:18px; }

  /* FORM */
  .field { margin-bottom:14px; }
  .field label { display:block; font-size:12px; font-weight:600; color:${G.muted}; text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; }
  .inp { width:100%; background:${G.bg}; border:1.5px solid ${G.border}; color:${G.text}; padding:12px 14px; border-radius:12px; font-size:14px; outline:none; transition:border-color .2s; }
  .inp:focus { border-color:${G.accent2}; }
  select.inp { cursor:pointer; }

  /* DONUT CHART */
  .donut-wrap { display:flex; align-items:center; gap:16px; }
  .donut-svg { flex-shrink:0; }
  .donut-legend { flex:1; display:flex; flex-direction:column; gap:7px; }
  .leg-item { display:flex; align-items:center; gap:8px; font-size:12px; }
  .leg-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }
  .leg-name { flex:1; color:${G.muted}; }
  .leg-val { font-family:'DM Mono',monospace; font-size:11px; font-weight:500; }

  /* EMI CARD */
  .emi-card { background:${G.card}; border:1px solid ${G.border}; border-radius:16px; padding:14px; margin-bottom:10px; display:flex; align-items:center; gap:12px; }
  .emi-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .emi-info { flex:1; }
  .emi-name { font-size:14px; font-weight:600; }
  .emi-meta { font-size:11px; color:${G.muted}; margin-top:2px; }
  .emi-amt { text-align:right; }
  .emi-val { font-family:'DM Mono',monospace; font-size:15px; font-weight:500; color:${G.danger}; }
  .emi-due { font-size:10px; color:${G.muted}; margin-top:2px; }

  /* INVEST CARD */
  .inv-card { background:${G.card}; border:1px solid ${G.border}; border-radius:16px; padding:14px; margin-bottom:10px; }
  .inv-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
  .inv-name { font-size:14px; font-weight:600; }
  .inv-type { font-size:10px; color:${G.accent}; background:rgba(82,183,136,.12); padding:2px 8px; border-radius:6px; }
  .inv-nums { display:flex; gap:12px; }
  .inv-n { flex:1; }
  .inv-nl { font-size:10px; color:${G.muted}; margin-bottom:2px; }
  .inv-nv { font-family:'DM Mono',monospace; font-size:13px; font-weight:500; }

  /* SALARY CARD */
  .sal-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid ${G.border}; }
  .sal-row:last-child { border:none; }
  .sal-source { font-size:14px; font-weight:500; }
  .sal-date { font-size:11px; color:${G.muted}; margin-top:2px; }

  /* BUDGET ALERT */
  .alert { border-radius:12px; padding:10px 14px; margin-bottom:8px; display:flex; align-items:center; gap:10px; font-size:13px; }
  .alert.warn { background:rgba(244,162,97,.12); border:1px solid rgba(244,162,97,.3); color:#c47a2a; }
  .alert.danger { background:rgba(230,57,70,.1); border:1px solid rgba(230,57,70,.2); color:${G.danger}; }
  .alert.ok { background:rgba(82,183,136,.1); border:1px solid rgba(82,183,136,.25); color:${G.accent}; }

  /* SUMMARY ROW */
  .sum-row { display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid ${G.border}; }
  .sum-row:last-child { border:none; }
  .sum-lbl { font-size:13px; color:${G.muted}; }
  .sum-val { font-family:'DM Mono',monospace; font-size:13px; font-weight:500; }

  /* CHIPS */
  .chips { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
  .chip { padding:5px 12px; border-radius:20px; font-size:12px; font-weight:500; border:1.5px solid ${G.border}; background:${G.bg}; color:${G.muted}; cursor:pointer; transition:all .15s; }
  .chip.on { background:${G.accent}; border-color:${G.accent}; color:#fff; }

  .tag { display:inline-block; padding:2px 8px; border-radius:6px; font-size:10px; font-weight:600; }
  .empty { text-align:center; padding:32px 16px; color:${G.muted}; }
  .empty-ic { font-size:40px; margin-bottom:8px; }
  .divider { height:1px; background:${G.border}; margin:14px 0; }
  .badge { display:inline-flex; align-items:center; justify-content:center; width:20px; height:20px; border-radius:6px; font-size:10px; font-weight:700; background:${G.danger}; color:#fff; margin-left:4px; }
`;

// ── DONUT CHART ───────────────────────────────────────────
function DonutChart({ data, size = 120 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return <div style={{ color: G.muted, fontSize: 12, textAlign: "center" }}>No data</div>;
  const r = 44, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = data.map(d => {
    const pct = d.value / total;
    const slice = { ...d, pct, dasharray: circ, dashoffset: circ - pct * circ, rotation: offset * 360 };
    offset += pct;
    return slice;
  });
  return (
    <div className="donut-wrap">
      <svg width={size} height={size} viewBox="0 0 120 120" className="donut-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={G.border} strokeWidth="16" />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
            strokeWidth="16" strokeDasharray={`${s.dasharray}`}
            strokeDashoffset={s.dashoffset}
            transform={`rotate(${s.rotation - 90} ${cx} ${cy})`}
            strokeLinecap="butt" />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={G.text} fontSize="9" fontFamily="DM Sans" fontWeight="600">Total</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill={G.text} fontSize="11" fontFamily="DM Mono" fontWeight="500">
          {fmt(total).replace("₹", "")}
        </text>
      </svg>
      <div className="donut-legend">
        {slices.slice(0, 5).map((s, i) => (
          <div key={i} className="leg-item">
            <div className="leg-dot" style={{ background: s.color }} />
            <span className="leg-name">{s.label}</span>
            <span className="leg-val">{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MINI BAR SPARKLINE ────────────────────────────────────
function SparkBar({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 32 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, background: i === data.length - 1 ? color : G.border, borderRadius: 3, height: `${Math.max(4, v / max * 32)}px`, transition: "height .4s ease" }} />
      ))}
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");

  // DATA
  const [salaries, setSalaries] = useStorage("fin_salaries", [
    { id: "s1", source: "Primary Salary", amount: 55000, date: "2025-05-01", category: "Salary", note: "" },
  ]);
  const [expenses, setExpenses] = useStorage("fin_expenses", [
    { id: "e1", name: "Grocery Shopping", amount: 3200, category: "Groceries", date: "2025-05-03", note: "" },
    { id: "e2", name: "Electricity Bill", amount: 1800, category: "Bills", date: "2025-05-04", note: "" },
    { id: "e3", name: "Zomato", amount: 650, category: "Food", date: "2025-05-05", note: "" },
    { id: "e4", name: "Metro Card", amount: 500, category: "Transport", date: "2025-05-06", note: "" },
  ]);
  const [emis, setEmis] = useStorage("fin_emis", [
    { id: "em1", name: "Home Loan", amount: 18500, dueDay: 5, totalMonths: 240, paidMonths: 36, icon: "🏠", color: "#4dabf7" },
    { id: "em2", name: "Car Loan", amount: 8200, dueDay: 10, totalMonths: 60, paidMonths: 24, icon: "🚗", color: "#ffa94d" },
  ]);
  const [investments, setInvestments] = useStorage("fin_investments", [
    { id: "i1", name: "HDFC Flexi Cap Fund", type: "Mutual Fund", invested: 120000, current: 143500, monthly: 5000, startDate: "2023-01-01" },
    { id: "i2", name: "PPF Account", type: "PPF", invested: 85000, current: 92000, monthly: 0, startDate: "2022-04-01" },
    { id: "i3", name: "Zerodha Stocks", type: "Stocks", invested: 50000, current: 63200, monthly: 0, startDate: "2024-01-01" },
  ]);
  const [budgets, setBudgets] = useStorage("fin_budgets", {
    Food: 5000, Groceries: 8000, Transport: 3000, Entertainment: 2000, Shopping: 5000, Bills: 4000,
  });
  const [savingsGoals, setSavingsGoals] = useStorage("fin_goals", [
    { id: "g1", name: "Emergency Fund", target: 200000, saved: 75000, icon: "🛡️", color: "#51cf66" },
    { id: "g2", name: "Vacation", target: 80000, saved: 22000, icon: "✈️", color: "#339af0" },
  ]);

  // MODAL STATE
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const openModal = (type, data = {}) => { setModal(type); setForm(data); };
  const closeModal = () => { setModal(null); setForm({}); };

  // ── COMPUTED ──────────────────────────────────────────
  const thisMonth = curMonth();
  const monthSalary = salaries.filter(s => s.date.startsWith(thisMonth)).reduce((a, s) => a + s.amount, 0);
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0);
  const monthEMI = emis.reduce((a, e) => a + e.amount, 0);
  const totalInvested = investments.reduce((a, i) => a + i.invested, 0);
  const totalCurrent = investments.reduce((a, i) => a + i.current, 0);
  const investGain = totalCurrent - totalInvested;
  const balance = monthSalary - monthExpenses - monthEMI;
  const totalSaved = savingsGoals.reduce((a, g) => a + g.saved, 0);

  // Budget alerts
  const budgetAlerts = Object.entries(budgets).map(([cat, limit]) => {
    const spent = expenses.filter(e => e.category === cat && e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0);
    const pct = limit ? spent / limit * 100 : 0;
    return { cat, spent, limit, pct };
  }).filter(b => b.pct > 60).sort((a, b) => b.pct - a.pct);

  // Expense by category (this month)
  const expByCat = EXP_CATS.map(cat => ({
    label: cat,
    value: expenses.filter(e => e.category === cat && e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0),
    color: CAT_COLORS[cat],
  })).filter(d => d.value > 0);

  // Last 6 months spending
  const last6 = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return expenses.filter(e => e.date.startsWith(ym)).reduce((a, e) => a + e.amount, 0);
  });

  // ── ACTIONS ───────────────────────────────────────────
  function saveExpense() {
    if (!form.name || !form.amount) return;
    const item = { id: uid(), name: form.name, amount: Number(form.amount), category: form.category || "Other", date: form.date || new Date().toISOString().slice(0, 10), note: form.note || "" };
    if (form.id) {
      setExpenses(e => e.map(x => x.id === form.id ? { ...x, ...item, id: form.id } : x));
    } else {
      setExpenses(e => [item, ...e]);
    }
    closeModal();
  }

  function saveSalary() {
    if (!form.source || !form.amount) return;
    const item = { id: uid(), source: form.source, amount: Number(form.amount), date: form.date || new Date().toISOString().slice(0, 10), category: form.category || "Salary", note: form.note || "" };
    if (form.id) {
      setSalaries(s => s.map(x => x.id === form.id ? { ...x, ...item, id: form.id } : x));
    } else {
      setSalaries(s => [item, ...s]);
    }
    closeModal();
  }

  function saveEMI() {
    if (!form.name || !form.amount) return;
    const item = { id: uid(), name: form.name, amount: Number(form.amount), dueDay: Number(form.dueDay) || 5, totalMonths: Number(form.totalMonths) || 12, paidMonths: Number(form.paidMonths) || 0, icon: form.icon || "💳", color: form.color || "#4dabf7" };
    if (form.id) {
      setEmis(e => e.map(x => x.id === form.id ? { ...x, ...item, id: form.id } : x));
    } else {
      setEmis(e => [item, ...e]);
    }
    closeModal();
  }

  function saveInvestment() {
    if (!form.name || !form.invested) return;
    const item = { id: uid(), name: form.name, type: form.type || "Mutual Fund", invested: Number(form.invested), current: Number(form.current) || Number(form.invested), monthly: Number(form.monthly) || 0, startDate: form.startDate || new Date().toISOString().slice(0, 10) };
    if (form.id) {
      setInvestments(i => i.map(x => x.id === form.id ? { ...x, ...item, id: form.id } : x));
    } else {
      setInvestments(i => [item, ...i]);
    }
    closeModal();
  }

  function saveGoal() {
    if (!form.name || !form.target) return;
    const item = { id: uid(), name: form.name, target: Number(form.target), saved: Number(form.saved) || 0, icon: form.icon || "🎯", color: form.color || G.accent };
    if (form.id) {
      setSavingsGoals(g => g.map(x => x.id === form.id ? { ...x, ...item, id: form.id } : x));
    } else {
      setSavingsGoals(g => [item, ...g]);
    }
    closeModal();
  }

  function deleteItem(type, id) {
    if (type === "expense") setExpenses(e => e.filter(x => x.id !== id));
    if (type === "salary") setSalaries(s => s.filter(x => x.id !== id));
    if (type === "emi") setEmis(e => e.filter(x => x.id !== id));
    if (type === "investment") setInvestments(i => i.filter(x => x.id !== id));
    if (type === "goal") setSavingsGoals(g => g.filter(x => x.id !== id));
    closeModal();
  }

  // ── PAGES ─────────────────────────────────────────────
  function HomePage() {
    const recentTxns = [
      ...expenses.map(e => ({ ...e, kind: "expense" })),
      ...salaries.map(s => ({ ...s, name: s.source, kind: "salary" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    return (
      <div className="page">
        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {budgetAlerts.slice(0, 2).map(b => (
              <div key={b.cat} className={`alert ${b.pct >= 100 ? "danger" : "warn"}`}>
                <span>{b.pct >= 100 ? "🚨" : "⚠️"}</span>
                <span><b>{b.cat}</b> budget {b.pct >= 100 ? "exceeded" : `${Math.round(b.pct)}% used`} — {fmt(b.spent)} / {fmt(b.limit)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spending trend */}
        <div className="card">
          <div className="card-title">6-Month Spending Trend</div>
          <SparkBar data={last6} color={G.accent} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - (5 - i)); return MONTHS[d.getMonth()]; }).map((m, i) => (
              <span key={i} style={{ fontSize: 9, color: G.muted }}>{m}</span>
            ))}
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="card">
          <div className="card-title">This Month</div>
          {[
            { l: "Income", v: monthSalary, c: G.accent },
            { l: "Expenses", v: monthExpenses, c: G.danger },
            { l: "EMIs", v: monthEMI, c: G.warn },
            { l: "Net Savings", v: balance, c: balance >= 0 ? G.accent : G.danger },
          ].map(r => (
            <div key={r.l} className="sum-row">
              <span className="sum-lbl">{r.l}</span>
              <span className="sum-val" style={{ color: r.c }}>{fmtD(r.v)}</span>
            </div>
          ))}
        </div>

        {/* Expense Donut */}
        {expByCat.length > 0 && (
          <div className="card">
            <div className="card-title">Spending Breakdown</div>
            <DonutChart data={expByCat} />
          </div>
        )}

        {/* Recent Transactions */}
        <div className="sec-row" style={{ marginTop: 4 }}>
          <div className="sec-title">Recent Activity</div>
        </div>
        <div className="card">
          {recentTxns.length === 0 ? (
            <div className="empty"><div className="empty-ic">📭</div>No transactions yet</div>
          ) : recentTxns.map(t => (
            <div key={t.id} className="txn" onClick={() => openModal(t.kind === "salary" ? "editSalary" : "editExpense", t)}>
              <div className="txn-icon" style={{ background: (CAT_COLORS[t.category] || G.accent) + "20" }}>
                {CAT_ICONS[t.category] || "💸"}
              </div>
              <div className="txn-info">
                <div className="txn-name">{t.name}</div>
                <div className="txn-meta">{t.category} · {t.date}</div>
              </div>
              <div className="txn-amt" style={{ color: t.kind === "salary" ? G.accent : G.danger }}>
                {t.kind === "salary" ? "+" : "-"}{fmt(t.amount)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ExpensePage() {
    const [filterCat, setFilterCat] = useState("All");
    const filtered = filterCat === "All" ? expenses : expenses.filter(e => e.category === filterCat);

    return (
      <div className="page">
        <div className="sec-row">
          <div className="sec-title">Expenses</div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 14, color: G.danger }}>{fmt(monthExpenses)}</div>
        </div>

        {/* Budget progress */}
        <div className="card">
          <div className="card-title">Budget Status</div>
          {Object.entries(budgets).map(([cat, limit]) => {
            const spent = expenses.filter(e => e.category === cat && e.date.startsWith(thisMonth)).reduce((a, e) => a + e.amount, 0);
            const pct = Math.min(100, limit ? spent / limit * 100 : 0);
            const color = pct >= 100 ? G.danger : pct >= 80 ? G.warn : G.accent;
            return (
              <div key={cat} className="prog-wrap">
                <div className="prog-head">
                  <span>{CAT_ICONS[cat]} {cat}</span>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: G.muted }}>{fmt(spent)} / {fmt(limit)}</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: pct + "%", background: color }} />
                </div>
              </div>
            );
          })}
          <button className="btn btn-outline btn-sm" style={{ marginTop: 4 }} onClick={() => openModal("editBudgets")}>
            ✏️ Edit Budgets
          </button>
        </div>

        {/* Filter */}
        <div className="chips" style={{ overflowX: "auto", flexWrap: "nowrap" }}>
          {["All", ...EXP_CATS].map(c => (
            <div key={c} className={`chip ${filterCat === c ? "on" : ""}`} style={{ flexShrink: 0 }} onClick={() => setFilterCat(c)}>{c}</div>
          ))}
        </div>

        <div className="card">
          {filtered.length === 0 ? (
            <div className="empty"><div className="empty-ic">🧾</div>No expenses yet</div>
          ) : filtered.map(e => (
            <div key={e.id} className="txn" onClick={() => openModal("editExpense", e)}>
              <div className="txn-icon" style={{ background: (CAT_COLORS[e.category] || G.accent) + "20" }}>
                {CAT_ICONS[e.category] || "💸"}
              </div>
              <div className="txn-info">
                <div className="txn-name">{e.name}</div>
                <div className="txn-meta">{e.category} · {e.date}{e.note ? " · " + e.note : ""}</div>
              </div>
              <div className="txn-amt" style={{ color: G.danger }}>-{fmt(e.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function SalaryPage() {
    const totalIncome = salaries.reduce((a, s) => a + s.amount, 0);
    return (
      <div className="page">
        <div className="sec-row">
          <div className="sec-title">Income</div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 14, color: G.accent }}>{fmt(monthSalary)} this month</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          {[
            { l: "This Month", v: monthSalary, c: G.accent, ic: "📅" },
            { l: "All Time", v: totalIncome, c: G.info, ic: "📊" },
          ].map(s => (
            <div key={s.l} className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.ic}</div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 16, fontWeight: 500, color: s.c }}>{fmt(s.v)}</div>
              <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div className="card">
          {salaries.length === 0 ? (
            <div className="empty"><div className="empty-ic">💰</div>No income added yet</div>
          ) : salaries.map(s => (
            <div key={s.id} className="sal-row" onClick={() => openModal("editSalary", s)}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{CAT_ICONS[s.category] || "💰"}</span>
                  <div>
                    <div className="sal-source">{s.source}</div>
                    <div className="sal-date">{s.category} · {s.date}</div>
                  </div>
                </div>
              </div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 15, color: G.accent }}>+{fmt(s.amount)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function EMIPage() {
    const totalEMI = emis.reduce((a, e) => a + e.amount, 0);
    const today = new Date().getDate();
    const dueSoon = emis.filter(e => {
      const diff = e.dueDay - today;
      return diff >= 0 && diff <= 5;
    });

    return (
      <div className="page">
        <div className="sec-row">
          <div className="sec-title">EMI & Bills</div>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 14, color: G.danger }}>{fmt(totalEMI)}/mo</div>
        </div>

        {dueSoon.length > 0 && (
          <div className="alert warn" style={{ marginBottom: 12 }}>
            ⏰ <span><b>{dueSoon.map(e => e.name).join(", ")}</b> due in ≤5 days!</span>
          </div>
        )}

        <div className="card" style={{ background: "linear-gradient(135deg,#fff5f5,#fff)", marginBottom: 12 }}>
          <div className="card-title">Monthly EMI Burden</div>
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 28, fontWeight: 700, color: G.danger }}>{fmt(totalEMI)}</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
            {monthSalary > 0 ? `${Math.round(totalEMI / monthSalary * 100)}% of your monthly income` : "Add income to see ratio"}
          </div>
        </div>

        {emis.length === 0 ? (
          <div className="empty"><div className="empty-ic">🏦</div>No EMIs added</div>
        ) : emis.map(e => {
          const progress = e.totalMonths > 0 ? e.paidMonths / e.totalMonths * 100 : 0;
          const remaining = e.totalMonths - e.paidMonths;
          return (
            <div key={e.id} className="emi-card" onClick={() => openModal("editEMI", e)}>
              <div className="emi-icon" style={{ background: e.color + "22" }}>{e.icon}</div>
              <div className="emi-info">
                <div className="emi-name">{e.name}</div>
                <div className="emi-meta">Due on {e.dueDay}th · {remaining} months left</div>
                <div style={{ marginTop: 6 }}>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: progress + "%", background: e.color }} />
                  </div>
                </div>
              </div>
              <div className="emi-amt">
                <div className="emi-val">{fmt(e.amount)}</div>
                <div className="emi-due">/month</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function InvestPage() {
    const gainPct = totalInvested > 0 ? (investGain / totalInvested * 100).toFixed(1) : 0;
    return (
      <div className="page">
        <div className="sec-row">
          <div className="sec-title">Investments</div>
        </div>

        {/* Portfolio Summary */}
        <div className="card" style={{ background: "linear-gradient(135deg,#f0faf5,#fff)", marginBottom: 12 }}>
          <div className="card-title">Portfolio Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              { l: "Invested", v: fmt(totalInvested), c: G.info },
              { l: "Current", v: fmt(totalCurrent), c: G.text },
              { l: "Gain", v: `${investGain >= 0 ? "+" : ""}${fmt(investGain)}`, c: investGain >= 0 ? G.accent : G.danger },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 13, fontWeight: 500, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 10, color: G.muted, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div className="prog-bar" style={{ height: 10 }}>
              <div className="prog-fill" style={{ width: Math.min(100, totalInvested > 0 ? totalCurrent / totalInvested * 100 : 0) + "%", background: G.grad }} />
            </div>
            <div style={{ textAlign: "center", fontSize: 11, color: G.accent, marginTop: 4 }}>
              {gainPct}% total returns
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="sec-row">
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 700 }}>Savings Goals</div>
          <button className="btn btn-outline btn-sm" onClick={() => openModal("addGoal")}>+ Goal</button>
        </div>
        {savingsGoals.map(g => {
          const pct = Math.min(100, g.target > 0 ? g.saved / g.target * 100 : 0);
          return (
            <div key={g.id} className="card" style={{ marginBottom: 10 }} onClick={() => openModal("editGoal", g)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: G.muted }}>{fmt(g.saved)} of {fmt(g.target)}</div>
                  </div>
                </div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 16, fontWeight: 700, color: g.color }}>{Math.round(pct)}%</div>
              </div>
              <div className="prog-bar" style={{ height: 10 }}>
                <div className="prog-fill" style={{ width: pct + "%", background: g.color }} />
              </div>
            </div>
          );
        })}

        <div className="divider" />

        {/* Investments list */}
        <div className="sec-row">
          <div style={{ fontFamily: "'Playfair Display'", fontSize: 16, fontWeight: 700 }}>Portfolio</div>
        </div>
        {investments.length === 0 ? (
          <div className="empty"><div className="empty-ic">📈</div>No investments added</div>
        ) : investments.map(inv => {
          const gain = inv.current - inv.invested;
          const gainP = inv.invested > 0 ? (gain / inv.invested * 100).toFixed(1) : 0;
          return (
            <div key={inv.id} className="inv-card" onClick={() => openModal("editInvestment", inv)}>
              <div className="inv-top">
                <div>
                  <div className="inv-name">{inv.name}</div>
                  <div style={{ marginTop: 4 }}><span className="inv-type">{inv.type}</span></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'DM Mono'", fontSize: 15, fontWeight: 500, color: gain >= 0 ? G.accent : G.danger }}>
                    {gain >= 0 ? "+" : ""}{fmt(gain)}
                  </div>
                  <div style={{ fontSize: 10, color: G.muted }}>{gainP}% returns</div>
                </div>
              </div>
              <div className="inv-nums">
                <div className="inv-n">
                  <div className="inv-nl">Invested</div>
                  <div className="inv-nv">{fmt(inv.invested)}</div>
                </div>
                <div className="inv-n">
                  <div className="inv-nl">Current</div>
                  <div className="inv-nv" style={{ color: gain >= 0 ? G.accent : G.danger }}>{fmt(inv.current)}</div>
                </div>
                {inv.monthly > 0 && (
                  <div className="inv-n">
                    <div className="inv-nl">Monthly SIP</div>
                    <div className="inv-nv">{fmt(inv.monthly)}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── MODALS ────────────────────────────────────────────
  function ModalExpense({ isEdit }) {
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">{isEdit ? "Edit Expense" : "Add Expense"}</div>
          <div className="field"><label>Description</label><input className="inp" placeholder="e.g. Swiggy order" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="field"><label>Amount (₹)</label><input className="inp" type="number" placeholder="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div className="field"><label>Category</label>
            <select className="inp" value={form.category || "Other"} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {EXP_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Date</label><input className="inp" type="date" value={form.date || new Date().toISOString().slice(0, 10)} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div className="field"><label>Note (optional)</label><input className="inp" placeholder="Any notes..." value={form.note || ""} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {isEdit && <button className="btn btn-danger btn-sm" onClick={() => deleteItem("expense", form.id)}>Delete</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveExpense}>{isEdit ? "Save Changes" : "Add Expense"}</button>
          </div>
        </div>
      </div>
    );
  }

  function ModalSalary({ isEdit }) {
    const incCats = ["Salary", "Bonus", "Freelance", "Business", "Investment", "Other"];
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">{isEdit ? "Edit Income" : "Add Income"}</div>
          <div className="field"><label>Source</label><input className="inp" placeholder="e.g. Monthly Salary" value={form.source || ""} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></div>
          <div className="field"><label>Amount (₹)</label><input className="inp" type="number" placeholder="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div className="field"><label>Type</label>
            <select className="inp" value={form.category || "Salary"} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {incCats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field"><label>Date</label><input className="inp" type="date" value={form.date || new Date().toISOString().slice(0, 10)} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {isEdit && <button className="btn btn-danger btn-sm" onClick={() => deleteItem("salary", form.id)}>Delete</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveSalary}>{isEdit ? "Save Changes" : "Add Income"}</button>
          </div>
        </div>
      </div>
    );
  }

  function ModalEMI({ isEdit }) {
    const icons = ["🏠", "🚗", "📱", "💳", "🏥", "📚", "✈️", "💰", "🏦"];
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">{isEdit ? "Edit EMI" : "Add EMI / Loan"}</div>
          <div className="field"><label>Name</label><input className="inp" placeholder="e.g. Home Loan" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="field"><label>Monthly EMI (₹)</label><input className="inp" type="number" placeholder="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field"><label>Due Day</label><input className="inp" type="number" min="1" max="31" placeholder="5" value={form.dueDay || ""} onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} /></div>
            <div className="field"><label>Total Months</label><input className="inp" type="number" placeholder="60" value={form.totalMonths || ""} onChange={e => setForm(f => ({ ...f, totalMonths: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Months Paid</label><input className="inp" type="number" placeholder="0" value={form.paidMonths || ""} onChange={e => setForm(f => ({ ...f, paidMonths: e.target.value }))} /></div>
          <div className="field"><label>Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {icons.map(ic => (
                <div key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", border: `2px solid ${form.icon === ic ? G.accent : G.border}`, background: G.bg }}>
                  {ic}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {isEdit && <button className="btn btn-danger btn-sm" onClick={() => deleteItem("emi", form.id)}>Delete</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEMI}>{isEdit ? "Save Changes" : "Add EMI"}</button>
          </div>
        </div>
      </div>
    );
  }

  function ModalInvestment({ isEdit }) {
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">{isEdit ? "Edit Investment" : "Add Investment"}</div>
          <div className="field"><label>Name</label><input className="inp" placeholder="e.g. HDFC Flexi Cap" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="field"><label>Type</label>
            <select className="inp" value={form.type || "Mutual Fund"} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {INV_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field"><label>Invested (₹)</label><input className="inp" type="number" placeholder="0" value={form.invested || ""} onChange={e => setForm(f => ({ ...f, invested: e.target.value }))} /></div>
            <div className="field"><label>Current Value (₹)</label><input className="inp" type="number" placeholder="0" value={form.current || ""} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Monthly SIP (₹, optional)</label><input className="inp" type="number" placeholder="0" value={form.monthly || ""} onChange={e => setForm(f => ({ ...f, monthly: e.target.value }))} /></div>
          <div className="field"><label>Start Date</label><input className="inp" type="date" value={form.startDate || new Date().toISOString().slice(0, 10)} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {isEdit && <button className="btn btn-danger btn-sm" onClick={() => deleteItem("investment", form.id)}>Delete</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveInvestment}>{isEdit ? "Save" : "Add Investment"}</button>
          </div>
        </div>
      </div>
    );
  }

  function ModalGoal({ isEdit }) {
    const icons = ["🎯", "🏠", "✈️", "🚗", "💍", "🛡️", "📱", "🎓", "🏖️", "💰"];
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">{isEdit ? "Edit Goal" : "New Savings Goal"}</div>
          <div className="field"><label>Goal Name</label><input className="inp" placeholder="e.g. Dream Vacation" value={form.name || ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="field"><label>Target (₹)</label><input className="inp" type="number" placeholder="0" value={form.target || ""} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} /></div>
            <div className="field"><label>Saved So Far (₹)</label><input className="inp" type="number" placeholder="0" value={form.saved || ""} onChange={e => setForm(f => ({ ...f, saved: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Icon</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {icons.map(ic => (
                <div key={ic} onClick={() => setForm(f => ({ ...f, icon: ic }))}
                  style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", border: `2px solid ${form.icon === ic ? G.accent : G.border}`, background: G.bg }}>
                  {ic}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            {isEdit && <button className="btn btn-danger btn-sm" onClick={() => deleteItem("goal", form.id)}>Delete</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveGoal}>{isEdit ? "Save" : "Add Goal"}</button>
          </div>
        </div>
      </div>
    );
  }

  function ModalBudgets() {
    const [localB, setLocalB] = useState({ ...budgets });
    return (
      <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="sheet">
          <div className="sheet-handle" />
          <div className="sheet-title">Monthly Budgets</div>
          {EXP_CATS.slice(0, 8).map(cat => (
            <div key={cat} className="field">
              <label>{CAT_ICONS[cat]} {cat}</label>
              <input className="inp" type="number" placeholder="0" value={localB[cat] || ""} onChange={e => setLocalB(b => ({ ...b, [cat]: Number(e.target.value) }))} />
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 4 }} onClick={() => { setBudgets(localB); closeModal(); }}>Save Budgets</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "home", ic: "🏠", label: "Home" },
    { id: "salary", ic: "💰", label: "Income" },
    { id: "expenses", ic: "🧾", label: "Expenses" },
    { id: "emi", ic: "🏦", label: "EMI" },
    { id: "invest", ic: "📈", label: "Invest" },
  ];

  const FAB_ACTIONS = {
    home: () => openModal("addExpense"),
    expenses: () => openModal("addExpense"),
    salary: () => openModal("addSalary"),
    emi: () => openModal("addEMI"),
    invest: () => openModal("addInvestment"),
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="header-top">
            <div className="app-title">FinBook</div>
            <div className="month-chip">{MONTHS[now().getMonth()]} {now().getFullYear()}</div>
          </div>
          <div className="balance-label">Net Balance This Month</div>
          <div className="balance-big" style={{ color: balance >= 0 ? "#fff" : "#ffb3b3" }}>
            {balance >= 0 ? "" : "-"}{fmt(Math.abs(balance))}
          </div>
          <div className="balance-sub">
            <div className="bsub">
              <div className="bsub-l">Income</div>
              <div className="bsub-v">{fmt(monthSalary)}</div>
            </div>
            <div className="bsub">
              <div className="bsub-l">Spent</div>
              <div className="bsub-v">{fmt(monthExpenses + monthEMI)}</div>
            </div>
            <div className="bsub">
              <div className="bsub-l">Invested</div>
              <div className="bsub-v">{fmt(totalInvested)}</div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="strip">
          {[
            { ic: "📈", v: `${investGain >= 0 ? "+" : ""}${fmt(investGain)}`, l: "Inv. Gain", c: investGain >= 0 ? G.accent : G.danger },
            { ic: "🏦", v: fmt(monthEMI), l: "EMI/month", c: G.warn },
            { ic: "🛡️", v: fmt(totalSaved), l: "Goal Saved", c: G.info },
            { ic: "💳", v: `${emis.length}`, l: "Active EMIs", c: G.purple },
            { ic: "📊", v: `${investments.length}`, l: "Investments", c: G.accent2 },
          ].map(s => (
            <div key={s.l} className="strip-card">
              <div className="sc-icon">{s.ic}</div>
              <div className="sc-val" style={{ color: s.c }}>{s.v}</div>
              <div className="sc-lbl">{s.l}</div>
            </div>
          ))}
        </div>

        {/* PAGES */}
        {tab === "home" && <HomePage />}
        {tab === "salary" && <SalaryPage />}
        {tab === "expenses" && <ExpensePage />}
        {tab === "emi" && <EMIPage />}
        {tab === "invest" && <InvestPage />}

        {/* FAB */}
        <button className="fab" onClick={FAB_ACTIONS[tab] || (() => openModal("addExpense"))}>+</button>

        {/* BOTTOM NAV */}
        <nav className="nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-btn ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)}>
              <span className="nav-ic">{t.ic}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* MODALS */}
        {modal === "addExpense" && <ModalExpense isEdit={false} />}
        {modal === "editExpense" && <ModalExpense isEdit={true} />}
        {modal === "addSalary" && <ModalSalary isEdit={false} />}
        {modal === "editSalary" && <ModalSalary isEdit={true} />}
        {modal === "addEMI" && <ModalEMI isEdit={false} />}
        {modal === "editEMI" && <ModalEMI isEdit={true} />}
        {modal === "addInvestment" && <ModalInvestment isEdit={false} />}
        {modal === "editInvestment" && <ModalInvestment isEdit={true} />}
        {modal === "addGoal" && <ModalGoal isEdit={false} />}
        {modal === "editGoal" && <ModalGoal isEdit={true} />}
        {modal === "editBudgets" && <ModalBudgets />}
      </div>
    </>
  );
}
