const BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { ...options.headers };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let msg = text;
    try {
      const json = JSON.parse(text);
      if (json.detail) msg = Array.isArray(json.detail) ? json.detail.map((d) => d.msg).join(", ") : json.detail;
    } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  allocations: {
    list: () => request("/api/allocations"),
    create: (data) => request("/api/allocations", { method: "POST", body: JSON.stringify(data) }),
    delete: (id) => request(`/api/allocations/${id}`, { method: "DELETE" }),
  },
  income: {
    list: () => request("/api/income"),
    create: (data) => request("/api/income", { method: "POST", body: JSON.stringify(data) }),
  },
  transactions: {
    list: () => request("/api/transactions"),
    create: (data) =>
      request("/api/transactions", { method: "POST", body: JSON.stringify(data) }),
  },
};
