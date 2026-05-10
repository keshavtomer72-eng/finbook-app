import React, { useState, useCallback } from "react";

// ---------- STORAGE ----------
function useStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (val) => {
      setValue((prev) => {
        const next = typeof val === "function" ? val(prev) : val;

        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}

        return next;
      });
    },
    [key]
  );

  return [value, setStoredValue];
}

// ---------- HELPERS ----------
const fmt = (n) =>
  "₹" +
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

const today = () => new Date().toISOString().slice(0, 10);

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Groceries",
  "Rent",
  "Other",
];

const COLORS = {
  bg: "#f8f6f0",
  card: "#ffffff",
  border: "#e7e1d8",
  text: "#1a1a2e",
  muted: "#7f7f7f",
  accent: "#2d6a4f",
  accent2: "#52b788",
  danger: "#e63946",
};

// ---------- STYLES ----------
const css = `
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

body{
  font-family:Arial,sans-serif;
  background:${COLORS.bg};
  color:${COLORS.text};
}

.app{
  max-width:430px;
  margin:0 auto;
  min-height:100vh;
  padding-bottom:90px;
}

.header{
  background:linear-gradient(135deg,#2d6a4f,#52b788);
  padding:24px 18px 30px;
  color:white;
}

.title{
  font-size:28px;
  font-weight:bold;
  margin-bottom:18px;
}

.balance{
  font-size:38px;
  font-weight:bold;
}

.small{
  margin-top:8px;
  opacity:.9;
}

.card{
  background:${COLORS.card};
  border:1px solid ${COLORS.border};
  border-radius:16px;
  padding:16px;
  margin:14px;
}

.cardTitle{
  font-size:15px;
  font-weight:bold;
  margin-bottom:12px;
}

.row{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 0;
  border-bottom:1px solid ${COLORS.border};
}

.row:last-child{
  border-bottom:none;
}

.green{
  color:${COLORS.accent};
}

.red{
  color:${COLORS.danger};
}

.nav{
  position:fixed;
  bottom:0;
  left:50%;
  transform:translateX(-50%);
  width:100%;
  max-width:430px;
  display:flex;
  background:white;
  border-top:1px solid ${COLORS.border};
}

.nav button{
  flex:1;
  border:none;
  background:none;
  padding:14px 0;
  font-size:13px;
}

.active{
  color:${COLORS.accent};
  font-weight:bold;
}

.fab{
  position:fixed;
  right:calc(50% - 190px);
  bottom:80px;
  width:56px;
  height:56px;
  border:none;
  border-radius:50%;
  background:${COLORS.accent};
  color:white;
  font-size:28px;
}

.overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.4);
  display:flex;
  align-items:flex-end;
}

.sheet{
  width:100%;
  max-width:430px;
  margin:0 auto;
  background:white;
  border-radius:22px 22px 0 0;
  padding:20px;
}

.input{
  width:100%;
  padding:12px;
  margin-top:6px;
  margin-bottom:14px;
  border:1px solid ${COLORS.border};
  border-radius:10px;
}

.btn{
  width:100%;
  border:none;
  padding:14px;
  border-radius:12px;
  background:${COLORS.accent};
  color:white;
  font-weight:bold;
}

.deleteBtn{
  background:${COLORS.danger};
  margin-top:10px;
}
`;

// ---------- MAIN ----------
export default function App() {
  const [tab, setTab] = useState("home");

  const [expenses, setExpenses] = useStorage("expenses", [
    {
      id: uid(),
      name: "Groceries",
      amount: 2500,
      category: "Groceries",
      date: today(),
    },
  ]);

  const [income, setIncome] = useStorage("income", [
    {
      id: uid(),
      source: "Salary",
      amount: 55000,
      date: today(),
    },
  ]);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  // ---------- TOTALS ----------
  const totalIncome = income.reduce((a, b) => a + b.amount, 0);

  const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);

  const balance = totalIncome - totalExpenses;

  // ---------- SAVE EXPENSE ----------
  function saveExpense() {
    if (!form.name || !form.amount) return;

    const item = {
      id: form.id || uid(),
      name: form.name,
      amount: Number(form.amount),
      category: form.category || "Other",
      date: form.date || today(),
    };

    if (form.id) {
      setExpenses((prev) =>
        prev.map((x) => (x.id === form.id ? item : x))
      );
    } else {
      setExpenses((prev) => [item, ...prev]);
    }

    setModal(null);
    setForm({});
  }

  // ---------- SAVE INCOME ----------
  function saveIncome() {
    if (!form.source || !form.amount) return;

    const item = {
      id: form.id || uid(),
      source: form.source,
      amount: Number(form.amount),
      date: form.date || today(),
    };

    if (form.id) {
      setIncome((prev) =>
        prev.map((x) => (x.id === form.id ? item : x))
      );
    } else {
      setIncome((prev) => [item, ...prev]);
    }

    setModal(null);
    setForm({});
  }

  // ---------- DELETE ----------
  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
    setModal(null);
  }

  function deleteIncome(id) {
    setIncome((prev) => prev.filter((x) => x.id !== id));
    setModal(null);
  }

  return (
    <>
      <style>{css}</style>

      <div className="app">
        {/* HEADER */}
        <div className="header">
          <div className="title">FinBook</div>

          <div>
            {MONTHS[new Date().getMonth()]}{" "}
            {new Date().getFullYear()}
          </div>

          <div className="small">Current Balance</div>

          <div className="balance">
            {balance >= 0 ? "" : "-"}
            {fmt(Math.abs(balance))}
          </div>
        </div>

        {/* HOME */}
        {tab === "home" && (
          <>
            <div className="card">
              <div className="cardTitle">Summary</div>

              <div className="row">
                <span>Income</span>
                <span className="green">
                  +{fmt(totalIncome)}
                </span>
              </div>

              <div className="row">
                <span>Expenses</span>
                <span className="red">
                  -{fmt(totalExpenses)}
                </span>
              </div>

              <div className="row">
                <span>Balance</span>
                <span
                  className={
                    balance >= 0 ? "green" : "red"
                  }
                >
                  {fmt(balance)}
                </span>
              </div>
            </div>
          </>
        )}

        {/* EXPENSES */}
        {tab === "expenses" && (
          <div className="card">
            <div className="cardTitle">Expenses</div>

            {expenses.map((e) => (
              <div
                key={e.id}
                className="row"
                onClick={() => {
                  setForm(e);
                  setModal("expense");
                }}
              >
                <div>
                  <div>{e.name}</div>

                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.muted,
                    }}
                  >
                    {e.category}
                  </div>
                </div>

                <div className="red">
                  -{fmt(e.amount)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* INCOME */}
        {tab === "income" && (
          <div className="card">
            <div className="cardTitle">Income</div>

            {income.map((i) => (
              <div
                key={i.id}
                className="row"
                onClick={() => {
                  setForm(i);
                  setModal("income");
                }}
              >
                <div>{i.source}</div>

                <div className="green">
                  +{fmt(i.amount)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button
          className="fab"
          onClick={() => {
            if (tab === "income") {
              setForm({});
              setModal("income");
            } else {
              setForm({});
              setModal("expense");
            }
          }}
        >
          +
        </button>

        {/* NAV */}
        <div className="nav">
          <button
            className={tab === "home" ? "active" : ""}
            onClick={() => setTab("home")}
          >
            Home
          </button>

          <button
            className={tab === "expenses" ? "active" : ""}
            onClick={() => setTab("expenses")}
          >
            Expenses
          </button>

          <button
            className={tab === "income" ? "active" : ""}
            onClick={() => setTab("income")}
          >
            Income
          </button>
        </div>

        {/* EXPENSE MODAL */}
        {modal === "expense" && (
          <div
            className="overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setModal(null);
              }
            }}
          >
            <div className="sheet">
              <h2 style={{ marginBottom: 20 }}>
                {form.id
                  ? "Edit Expense"
                  : "Add Expense"}
              </h2>

              <input
                className="input"
                placeholder="Expense name"
                value={form.name || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Amount"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: e.target.value,
                  }))
                }
              />

              <select
                className="input"
                value={form.category || "Other"}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                  }))
                }
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <button
                className="btn"
                onClick={saveExpense}
              >
                Save Expense
              </button>

              {form.id && (
                <button
                  className="btn deleteBtn"
                  onClick={() =>
                    deleteExpense(form.id)
                  }
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}

        {/* INCOME MODAL */}
        {modal === "income" && (
          <div
            className="overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setModal(null);
              }
            }}
          >
            <div className="sheet">
              <h2 style={{ marginBottom: 20 }}>
                {form.id
                  ? "Edit Income"
                  : "Add Income"}
              </h2>

              <input
                className="input"
                placeholder="Income source"
                value={form.source || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    source: e.target.value,
                  }))
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Amount"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    amount: e.target.value,
                  }))
                }
              />

              <button
                className="btn"
                onClick={saveIncome}
              >
                Save Income
              </button>

              {form.id && (
                <button
                  className="btn deleteBtn"
                  onClick={() =>
                    deleteIncome(form.id)
                  }
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
