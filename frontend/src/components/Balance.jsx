import { useState, useEffect } from "react";
import { api } from "../api";

export function Balance() {
  const [income, setIncome] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [incomeData, txData] = await Promise.all([
        api.income.list(),
        api.transactions.list(),
      ]);
      setIncome(incomeData);
      setTransactions(txData);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("income-updated", handler);
    window.addEventListener("transactions-updated", handler);
    return () => {
      window.removeEventListener("income-updated", handler);
      window.removeEventListener("transactions-updated", handler);
    };
  }, []);

  const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSavings = transactions
    .filter((t) => t.category === "savings")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = totalIncome - totalTransactions;

  const formatAmount = (amount) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  if (error) return <section className="card"><p className="error">{error}</p></section>;

  return (
    <section className="card balance-card">
      <h2>Running Balance</h2>
      <div className="balance-grid">
        <div className="balance-item">
          <span className="balance-label">Total Income</span>
          <span className="balance-value income">{formatAmount(totalIncome)}</span>
        </div>
        <div className="balance-item">
          <span className="balance-label">Total Deductions</span>
          <span className="balance-value expense">{formatAmount(totalTransactions)}</span>
        </div>
        <div className="balance-item">
          <span className="balance-label">Total Savings</span>
          <span className="balance-value savings">{formatAmount(totalSavings)}</span>
        </div>
        <div className="balance-item balance-total">
          <span className="balance-label">Remaining Balance</span>
          <span className={`balance-value ${balance >= 0 ? "positive" : "negative"}`}>
            {formatAmount(balance)}
          </span>
        </div>
      </div>
    </section>
  );
}
