import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { api } from "../api";

function getMonthKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthKey) {
  const [y, m] = monthKey.split("-");
  const date = new Date(y, parseInt(m, 10) - 1);
  return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export function BalanceTrend() {
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

  const months = new Set();
  income.forEach((i) => months.add(getMonthKey(i.date)));
  transactions.forEach((t) => months.add(getMonthKey(t.date)));
  const sortedMonths = [...months].sort();

  const chartData = sortedMonths.map((monthKey) => {
    const [y, m] = monthKey.split("-");
    const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0);

    const incomeUpTo = income
      .filter((i) => new Date(i.date) <= lastDay)
      .reduce((s, i) => s + Number(i.amount), 0);
    const txUpTo = transactions
      .filter((t) => new Date(t.date) <= lastDay)
      .reduce((s, t) => s + Number(t.amount), 0);

    return {
      month: getMonthLabel(monthKey),
      monthKey,
      balance: incomeUpTo - txUpTo,
    };
  });

  const formatAmount = (v) =>
    new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(v);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="chart-tooltip">
        {payload[0].payload.month}: {formatAmount(payload[0].value)}
      </div>
    );
  };

  if (error) return <section className="card"><p className="error">{error}</p></section>;
  if (chartData.length === 0) return null;

  return (
    <section className="card">
      <h2>Balance Trend</h2>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAmount}
              tick={{ fontSize: 12 }}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#059669"
              strokeWidth={2}
              dot={{ fill: "#059669" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="monthly-list">
        {chartData.map((d) => (
          <div key={d.monthKey} className="monthly-item">
            <span>{d.month}</span>
            <span className={d.balance >= 0 ? "positive" : "negative"}>
              {formatAmount(d.balance)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
