import { useState, useEffect } from "react";
import { api } from "../api";

export function Income() {
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.income.list().then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.income.create({ amount: parseFloat(amount), date });
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      load();
      window.dispatchEvent(new CustomEvent("income-updated"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Income</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Add
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.amount} — {i.date}
          </li>
        ))}
      </ul>
    </section>
  );
}
