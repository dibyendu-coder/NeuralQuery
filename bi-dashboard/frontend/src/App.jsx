import { useState, useRef } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";
import axios from "axios";
import { Send, Upload, Loader2, BarChart2, AlertCircle, Lightbulb } from "lucide-react";

const API = "http://localhost:8000";
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

function ChartBlock({ chart, data }) {
  const { type, x, y, title } = chart;
  return (
    <div style={{ background: "#1e1e2e", borderRadius: 14, padding: "20px 12px 8px", border: "1px solid #2d2d3f" }}>
      <p style={{ color: "#a0a0c0", fontSize: 13, marginBottom: 12, textAlign: "center", fontWeight: 500 }}>{title}</p>
      <ResponsiveContainer width="100%" height={240}>
        {type === "bar" ? (
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
            <XAxis dataKey={x} tick={{ fill: "#888", fontSize: 11 }} angle={-20} textAnchor="end" />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#13131f", border: "1px solid #3d3d5f", borderRadius: 8, color: "#fff" }} />
            <Bar dataKey={y} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        ) : type === "line" ? (
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
            <XAxis dataKey={x} tick={{ fill: "#888", fontSize: 11 }} angle={-20} textAnchor="end" />
            <YAxis tick={{ fill: "#888", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#13131f", border: "1px solid #3d3d5f", borderRadius: 8, color: "#fff" }} />
            <Line type="monotone" dataKey={y} stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={y} nameKey={x} cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: "#555" }}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#13131f", border: "1px solid #3d3d5f", borderRadius: 8, color: "#fff" }} />
          </PieChart>
        ) : (
          <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
            <XAxis dataKey={x} tick={{ fill: "#888", fontSize: 11 }} name={x} />
            <YAxis dataKey={y} tick={{ fill: "#888", fontSize: 11 }} name={y} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#13131f", border: "1px solid #3d3d5f", borderRadius: 8, color: "#fff" }} />
            <Scatter data={data} fill="#f59e0b" />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your BI assistant. Ask me anything about your sales data — or upload your own CSV to get started.", charts: [], insight: "" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const fileRef = useRef();
  const bottomRef = useRef();

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", text: question }]);
    setLoading(true);
    scrollToBottom();

    try {
      const res = await axios.post(`${API}/api/query`, { question, history });
      const d = res.data;
      if (d.error) {
        setMessages(m => [...m, { role: "assistant", text: `⚠️ ${d.error}`, charts: [], insight: "" }]);
      } else {
        setMessages(m => [...m, { role: "assistant", text: "", charts: d.charts || [], insight: d.insight || "", data: d.data }]);
        setHistory(h => [...h, { question, sql: d.sql }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "❌ Could not connect to backend. Make sure it's running.", charts: [], insight: "" }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  const uploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMessages(m => [...m, { role: "user", text: `📎 Uploading: ${file.name}` }]);
    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/upload-csv`, form);
      const d = res.data;
      if (d.error) {
        setMessages(m => [...m, { role: "assistant", text: `❌ Upload failed: ${d.error}`, charts: [], insight: "" }]);
      } else {
        setMessages(m => [...m, { role: "assistant", text: `✅ Loaded "${d.table}" — ${d.rows} rows. Columns: ${d.columns}\n\nNow ask me anything about it!`, charts: [], insight: "" }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "❌ Upload error.", charts: [], insight: "" }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0d1a", color: "#e0e0f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: "#13131f", borderRight: "1px solid #1e1e2e", padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <BarChart2 size={22} color="#6366f1" />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>BIBot</span>
        </div>
        <p style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Try asking</p>
        {[
          "Show total sales by product",
          "Monthly revenue trend in 2023",
          "Top customers by order value",
          "Sales breakdown by region",
        ].map(q => (
          <button key={q} onClick={() => { setInput(q); }} style={{ background: "#1e1e2e", border: "1px solid #2d2d3f", borderRadius: 8, padding: "8px 10px", color: "#aaa", fontSize: 12, cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>
            {q}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={() => fileRef.current.click()} style={{ background: "#6366f1", border: "none", borderRadius: 8, padding: "10px", color: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <Upload size={14} /> Upload CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={uploadCSV} />
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              {m.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ background: "#6366f1", borderRadius: "16px 16px 4px 16px", padding: "10px 16px", maxWidth: "70%", fontSize: 14 }}>{m.text}</div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BarChart2 size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: 13, color: "#888" }}>BIBot</span>
                  </div>
                  {m.text && <p style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12, color: "#ccc", whiteSpace: "pre-line" }}>{m.text}</p>}
                  {m.insight && (
                    <div style={{ background: "#1a1a2e", border: "1px solid #2d2d4f", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start" }}>
                      <Lightbulb size={15} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#c0c0e0" }}>{m.insight}</span>
                    </div>
                  )}
                  {m.charts && m.charts.length > 0 && (
                    <div style={{ display: "grid", gridTemplateColumns: m.charts.length === 1 ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                      {m.charts.map((c, ci) => <ChartBlock key={ci} chart={c} data={m.data || []} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", color: "#666" }}>
              <Loader2 size={16} className="spin" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: 13 }}>Generating dashboard...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ padding: "16px 32px 24px", borderTop: "1px solid #1e1e2e" }}>
          <div style={{ display: "flex", gap: 10, background: "#13131f", border: "1px solid #2d2d3f", borderRadius: 14, padding: "10px 14px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about your data..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e0e0f0", fontSize: 14 }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ background: loading ? "#3d3d5f" : "#6366f1", border: "none", borderRadius: 8, padding: "6px 12px", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center" }}>
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}