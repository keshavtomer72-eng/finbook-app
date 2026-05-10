// UPDATED IMPORT
import { useState, useEffect, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────────────────
   IMPROVED HELPERS
───────────────────────────────────────────────────────── */

const fmt = n =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const fmtD = n =>
  "₹" + (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const safeNum = v => parseFloat(v) || 0;

const today = () => new Date().toISOString().slice(0, 10);

/* ─────────────────────────────────────────────────────────
   IMPROVED STORAGE HOOK
───────────────────────────────────────────────────────── */

function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : init;
    } catch (err) {
      console.warn("Storage read failed", err);
      return init;
    }
  });

  const set = useCallback(
    v => {
      setVal(prev => {
        const next = typeof v === "function" ? v(prev) : v;

        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch (err) {
          console.warn("Storage save failed", err);
        }

        return next;
      });
    },
    [key]
  );

  return [val, set];
}

/* ─────────────────────────────────────────────────────────
   EXPORT / IMPORT
───────────────────────────────────────────────────────── */

function exportData({
  salaries,
  expenses,
  emis,
  investments,
  budgets,
  savingsGoals,
}) {
  const data = {
    salaries,
    expenses,
    emis,
    investments,
    budgets,
    savingsGoals,
    exportedAt: new Date().toISOString(),
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "finbook-backup.json";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(a.href);
}

function importData(
  file,
  {
    setSalaries,
    setExpenses,
    setEmis,
    setInvestments,
    setBudgets,
    setSavingsGoals,
  }
) {
  const reader = new FileReader();

  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);

      setSalaries(data.salaries || []);
      setExpenses(data.expenses || []);
      setEmis(data.emis || []);
      setInvestments(data.investments || []);
      setBudgets(data.budgets || {});
      setSavingsGoals(data.savingsGoals || []);

      alert("Backup restored successfully!");
    } catch (err) {
      alert("Invalid backup file");
      console.error(err);
    }
  };

  reader.readAsText(file);
}

/* ─────────────────────────────────────────────────────────
   SAFER SPARKBAR
───────────────────────────────────────────────────────── */

function SparkBar({ data = [], color }) {
  const max = Math.max(...(data.length ? data : [1]), 1);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 3,
        height: 32,
      }}
    >
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: i === data.length - 1 ? color : "#ddd",
            borderRadius: 3,
            height: `${Math.max(4, (v / max) * 32)}px`,
            transition: "height .4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MEMOIZED CALCULATIONS
───────────────────────────────────────────────────────── */

// REPLACE YOUR EXISTING COMPUTED SECTION WITH THIS

const monthSalary = useMemo(
  () =>
    salaries
      .filter(s => s.date.startsWith(thisMonth))
      .reduce((a, s) => a + s.amount, 0),
  [salaries, thisMonth]
);

const monthExpenses = useMemo(
  () =>
    expenses
      .filter(e => e.date.startsWith(thisMonth))
      .reduce((a, e) => a + e.amount, 0),
  [expenses, thisMonth]
);

const monthEMI = useMemo(
  () => emis.reduce((a, e) => a + e.amount, 0),
  [emis]
);

const totalInvested = useMemo(
  () => investments.reduce((a, i) => a + i.invested, 0),
  [investments]
);

const totalCurrent = useMemo(
  () => investments.reduce((a, i) => a + i.current, 0),
  [investments]
);

const investGain = useMemo(
  () => totalCurrent - totalInvested,
  [totalCurrent, totalInvested]
);

const balance = useMemo(
  () => monthSalary - monthExpenses - monthEMI,
  [monthSalary, monthExpenses, monthEMI]
);

const totalSaved = useMemo(
  () => savingsGoals.reduce((a, g) => a + g.saved, 0),
  [savingsGoals]
);

const budgetAlerts = useMemo(() => {
  return Object.entries(budgets)
    .map(([cat, limit]) => {
      const spent = expenses
        .filter(
          e =>
            e.category === cat &&
            e.date.startsWith(thisMonth)
        )
        .reduce((a, e) => a + e.amount, 0);

      const pct = limit ? (spent / limit) * 100 : 0;

      return { cat, spent, limit, pct };
    })
    .filter(b => b.pct > 60)
    .sort((a, b) => b.pct - a.pct);
}, [budgets, expenses, thisMonth]);

const expByCat = useMemo(() => {
  return EXP_CATS.map(cat => ({
    label: cat,
    value: expenses
      .filter(
        e =>
          e.category === cat &&
          e.date.startsWith(thisMonth)
      )
      .reduce((a, e) => a + e.amount, 0),
    color: CAT_COLORS[cat],
  })).filter(d => d.value > 0);
}, [expenses, thisMonth]);

const last6 = useMemo(() => {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();

    d.setMonth(d.getMonth() - (5 - i));

    const ym = `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}`;

    return expenses
      .filter(e => e.date.startsWith(ym))
      .reduce((a, e) => a + e.amount, 0);
  });
}, [expenses]);

/* ─────────────────────────────────────────────────────────
   FAB FIX
───────────────────────────────────────────────────────── */

/* REPLACE OLD FAB CSS */

.fab {
  position: fixed;
  bottom: 74px;
  right: 16px;
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: linear-gradient(135deg,#2d6a4f,#52b788);
  color: #fff;
  font-size: 26px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
}

/* ─────────────────────────────────────────────────────────
   DELETE CONFIRMATION
───────────────────────────────────────────────────────── */

function confirmDelete(type, id) {
  const ok = window.confirm(
    "Are you sure you want to delete this item?"
  );

  if (!ok) return;

  deleteItem(type, id);
}

/* REPLACE ALL DELETE BUTTONS */

<button
  className="btn btn-danger btn-sm"
  onClick={() => confirmDelete("expense", form.id)}
>
  Delete
</button>

/* ─────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────── */

function validateAmount(v) {
  return Number(v) > 0;
}

/* EXAMPLE SAVE FUNCTION */

function saveExpense() {
  if (!form.name?.trim()) {
    alert("Enter expense name");
    return;
  }

  if (!validateAmount(form.amount)) {
    alert("Amount must be greater than 0");
    return;
  }

  const item = {
    id: form.id || uid(),
    name: form.name.trim(),
    amount: safeNum(form.amount),
    category: form.category || "Other",
    date: form.date || today(),
    note: form.note || "",
  };

  if (form.id) {
    setExpenses(e =>
      e.map(x => (x.id === form.id ? item : x))
    );
  } else {
    setExpenses(e => [item, ...e]);
  }

  closeModal();
}

/* ─────────────────────────────────────────────────────────
   INPUT MOBILE OPTIMIZATION
───────────────────────────────────────────────────────── */

/* REPLACE NUMBER INPUTS */

<input
  className="inp"
  type="number"
  inputMode="numeric"
  placeholder="0"
  value={form.amount || ""}
  onChange={e =>
    setForm(f => ({
      ...f,
      amount: e.target.value,
    }))
  }
/>

/* ─────────────────────────────────────────────────────────
   ACCESSIBILITY FIX
───────────────────────────────────────────────────────── */

/* FAB */

<button
  aria-label="Add Transaction"
  className="fab"
  onClick={FAB_ACTIONS[tab]}
>
  +
</button>

/* NAV */

<button
  aria-label={t.label}
  key={t.id}
  className={`nav-btn ${tab === t.id ? "on" : ""}`}
  onClick={() => setTab(t.id)}
>

/* ─────────────────────────────────────────────────────────
   GOALS EMPTY STATE
───────────────────────────────────────────────────────── */

{
  savingsGoals.length === 0 ? (
    <div className="empty">
      <div className="empty-ic">🎯</div>
      No savings goals yet
    </div>
  ) : (
    savingsGoals.map(g => (
      // existing goal card
    ))
  );
}

/* ─────────────────────────────────────────────────────────
   SEARCH FEATURE
───────────────────────────────────────────────────────── */

const [search, setSearch] = useState("");

/* SEARCH INPUT */

<input
  className="inp"
  placeholder="Search expenses..."
  value={search}
  onChange={e => setSearch(e.target.value)}
/>

/* FILTER */

const filtered =
  filterCat === "All"
    ? expenses.filter(e =>
        e.name
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : expenses.filter(
        e =>
          e.category === filterCat &&
          e.name
            .toLowerCase()
            .includes(search.toLowerCase())
      );

/* ─────────────────────────────────────────────────────────
   IMPORT / EXPORT UI
───────────────────────────────────────────────────────── */

<div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 12,
  }}
>
  <button
    className="btn btn-outline btn-sm"
    onClick={() =>
      exportData({
        salaries,
        expenses,
        emis,
        investments,
        budgets,
        savingsGoals,
      })
    }
  >
    ⬇ Export
  </button>

  <label className="btn btn-outline btn-sm">
    ⬆ Import
    <input
      hidden
      type="file"
      accept=".json"
      onChange={e => {
        if (!e.target.files?.[0]) return;

        importData(e.target.files[0], {
          setSalaries,
          setExpenses,
          setEmis,
          setInvestments,
          setBudgets,
          setSavingsGoals,
        });
      }}
    />
  </label>
</div>

/* ─────────────────────────────────────────────────────────
   SAFER INVESTMENT PROGRESS
───────────────────────────────────────────────────────── */

<div
  className="prog-fill"
  style={{
    width:
      totalInvested > 0
        ? `${Math.min(
            100,
            (totalCurrent / totalInvested) * 100
          )}%`
        : "0%",
    background: "#2d6a4f",
  }}
/>

/* ─────────────────────────────────────────────────────────
   DYNAMIC DEMO DATES
───────────────────────────────────────────────────────── */

const DEMO_DATE = today();

/* Example */

{
  id: "e1",
  name: "Grocery Shopping",
  amount: 3200,
  category: "Groceries",
  date: DEMO_DATE,
  note: "",
}

/* ─────────────────────────────────────────────────────────
   DARK MODE READY
───────────────────────────────────────────────────────── */

const THEMES = {
  light: {
    bg: "#f8f6f0",
    card: "#ffffff",
    text: "#1a1a2e",
  },

  dark: {
    bg: "#111827",
    card: "#1f2937",
    text: "#f9fafb",
  },
};

const [theme, setTheme] = useStorage(
  "fin_theme",
  "light"
);

const G = THEMES[theme];

/* TOGGLE */

<button
  className="btn-icon"
  onClick={() =>
    setTheme(t =>
      t === "light" ? "dark" : "light"
    )
  }
>
  {theme === "light" ? "🌙" : "☀️"}
</button>
