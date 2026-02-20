import { useState, useEffect } from "react";
import { api } from "../api";

export function Allocations() {
  const [items, setItems] = useState([]);
  const [income, setIncome] = useState([]);
  const [category, setCategory] = useState("");
  const [percentage, setPercentage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const [allocations, incomeData] = await Promise.all([
      api.allocations.list(),
      api.income.list(),
    ]);
    setItems(allocations);
    setIncome(incomeData);
  };

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener("income-updated", handler);
    return () => window.removeEventListener("income-updated", handler);
  }, []);

  const mostRecentIncome = [...income]
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const totalIncome = mostRecentIncome ? Number(mostRecentIncome.amount) : 0;
  const totalPercentage = items.reduce((sum, a) => sum + Number(a.percentage), 0);
  const pendingPercentage = parseFloat(percentage) || 0;
  const wouldExceed = totalPercentage + pendingPercentage > 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (wouldExceed) {
      setError(`Total would be ${(totalPercentage + pendingPercentage).toFixed(1)}%. Cannot exceed 100%.`);
      return;
    }
    setLoading(true);
    try {
      await api.allocations.create({
        category: category.trim(),
        percentage: parseFloat(percentage),
      });
      setCategory("");
      setPercentage("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.allocations.delete(id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <section className="card">
      <h2>Allocations</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Category (e.g. savings)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          placeholder="Percentage"
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          required
        />
        <button type="submit" disabled={loading || wouldExceed}>
          Add
        </button>
      </form>
      {wouldExceed && percentage && (
        <p className="error">
          Would exceed 100% (current: {totalPercentage.toFixed(1)}%, adding: {pendingPercentage}%)
        </p>
      )}
      {error && !wouldExceed && <p className="error">{error}</p>}
      {totalIncome > 0 && (
        <p className="breakdown-header">
          Amount guide (most recent income: {formatAmount(totalIncome)}
          {mostRecentIncome && ` — ${mostRecentIncome.date}`})
        </p>
      )}
      <ul>
        {items.map((a) => {
          const amount = totalIncome * (Number(a.percentage) / 100);
          return (
            <li key={a.id} className="allocation-row">
              <span className="allocation-category">{a.category}</span>
              <span className="allocation-pct">{a.percentage}%</span>
              {totalIncome > 0 && (
                <span className="allocation-amount">{formatAmount(amount)}</span>
              )}
              <button
                type="button"
                className="btn-remove"
                onClick={() => handleDelete(a.id)}
                title="Remove allocation"
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
