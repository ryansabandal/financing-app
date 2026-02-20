import { useState, useEffect } from "react";
import { api } from "../api";

export function Transactions() {
  const [items, setItems] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState("expenses");
  const [type, setType] = useState("expense");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () =>
    api.transactions.list().then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.transactions.create({
        amount: parseFloat(amount),
        date,
        category,
        type,
        description: description.trim(),
      });
      setAmount("");
      setDescription("");
      setDate(new Date().toISOString().slice(0, 10));
      load();
      window.dispatchEvent(new CustomEvent("transactions-updated"));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Transactions</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
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
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="savings">Savings</option>
          <option value="investments">Investments</option>
          <option value="emergency">Emergency</option>
          <option value="expenses">Expenses</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          Add
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul>
        {items.map((t) => (
          <li key={t.id}>
            {t.type === "expense" ? "−" : "+"} {t.amount} — {t.category} — {t.date}
            {t.description && ` (${t.description})`}
          </li>
        ))}
      </ul>
    </section>
  );
}
