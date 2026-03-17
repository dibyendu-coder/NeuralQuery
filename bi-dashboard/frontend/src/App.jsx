import { useState, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from "recharts";
import axios from "axios";
import { Send, Upload, Loader2, BarChart2, Lightbulb, Trash2, Database, ChevronRight, Brain, TrendingUp, AlertTriangle, Target, Download } from "lucide-react";

const API = "http://localhost:8000";
const COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316","#06b6d4"];

const SAMPLE_QUERIES = [
  "Show total revenue by product",
  "Monthly revenue trend for 2023",
  "Top 5 sales reps by revenue",
  "Revenue breakdown by region",
  "Compare revenue across countries",
];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1a1a2e", border: "1px solid #3d3d5f", borderRadius: 10, padding: "10px 14px" }}>
        <p style={{ color: "#a0a0c0", fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || "#6366f1", fontSize: 13, fontWeight: 600 }}>
            {p.name}: {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Chart Block ───────────────────────────────────────────────────────────────
function ChartBlock({ chart, data }) {
  const { type, x, y, title } = chart;
  const commonProps = {
    data,
    margin: { top: 10, right: 20, left: 0, bottom: 30 }
  };
  const axisStyle = { fill: "#666", fontSize: 11 };
  const gridStyle = { strokeDasharray: "3 3", stroke: "#2d2d3f" };

  return (
    <div style={{
      background: "linear-gradient(145deg, #1a1a2e, #16162a)",
      borderRadius: 16,
      padding: "20px 16px 12px",
      border: "1px solid #2d2d4f",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)"
    }}>
      <p style={{ color: "#c0c0e0", fontSize: 13, marginBottom: 16, textAlign: "center", fontWeight: 600, letterSpacing: 0.3 }}>
        {title}
      </p>
      <ResponsiveContainer width="100%" height={260}>
        {type === "bar" ? (
          <BarChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={x} tick={axisStyle} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
            <Bar dataKey={y} radius={[6, 6, 0, 0]} maxBarSize={60}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : type === "line" ? (
          <LineChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={x} tick={axisStyle} angle={-20} textAnchor="end" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
            <Line type="monotone" dataKey={y} stroke="#6366f1" strokeWidth={3}
              dot={{ fill: "#6366f1", r: 5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 8, fill: "#818cf8" }} />
          </LineChart>
        ) : type === "area" ? (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={x} tick={axisStyle} angle={-20} textAnchor="end" />
            <YAxis tick={axisStyle} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
            <Area type="monotone" dataKey={y} stroke="#6366f1" strokeWidth={3} fill="url(#areaGrad)" />
          </AreaChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={y} nameKey={x} cx="50%" cy="50%"
              outerRadius={100} innerRadius={40}
              paddingAngle={3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: "#555" }}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: "#888" }} />
          </PieChart>
        ) : (
          <ScatterChart {...commonProps}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey={x} tick={axisStyle} name={x} />
            <YAxis dataKey={y} tick={axisStyle} name={y} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={data} fill="#f59e0b" />
          </ScatterChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ── Loading Dots ──────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "12px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#6366f1",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
        }} />
      ))}
      <span style={{ color: "#666", fontSize: 13, marginLeft: 8 }}>Generating dashboard...</span>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar() {
  return (
    <div style={{ width: "100%", height: 3, background: "#1e1e2e", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
      <div style={{
        height: "100%", background: "linear-gradient(90deg, #6366f1, #10b981, #6366f1)",
        backgroundSize: "200% 100%",
        animation: "progress 1.5s linear infinite",
        borderRadius: 2
      }} />
      <style>{`@keyframes progress { 0%{background-position:100% 0} 100%{background-position:-100% 0} }`}</style>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hi! I'm **NeuralQuery** — your AI-powered BI assistant.\n\nUpload a CSV or use the sample queries to get started. I'll instantly generate interactive dashboards from plain English!",
      charts: [], insight: ""
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const fileRef = useRef();
  const bottomRef = useRef();
  const dashboardRef = useRef();

  const scrollToBottom = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

  const sendMessage = async (overrideInput) => {
    const question = (overrideInput || input).trim();
    if (!question || loading) return;
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
        setMessages(m => [...m, {
          role: "assistant", text: "", charts: d.charts || [],
          insight: d.insight || "", data: d.data
        }]);
        setHistory(h => [...h, { question, sql: d.sql }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "❌ Cannot connect to backend. Make sure it's running.", charts: [], insight: "" }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  const uploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file.name);
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
        setMessages(m => [...m, {
          role: "assistant",
          text: `✅ Loaded **"${d.table}"** — ${d.rows.toLocaleString()} rows\n📋 Columns: ${d.columns}\n\nNow ask me anything about it!`,
          charts: [], insight: ""
        }]);
      }
    } catch {
      setMessages(m => [...m, { role: "assistant", text: "❌ Upload error.", charts: [], insight: "" }]);
    }
    setLoading(false);
    scrollToBottom();
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", text: "Chat cleared! Upload a CSV or ask a new question.", charts: [], insight: "" }]);
    setHistory([]);
  };
  const generateSummary = async (messageIndex, data, charts, question) => {
  setLoadingSummary(messageIndex);
  try {
    const res = await axios.post(`${API}/api/summary`, { data, charts, question });
    if (res.data.summary) {
      setSummaries(s => ({ ...s, [messageIndex]: res.data.summary }));
    }
  } catch {
    setSummaries(s => ({ ...s, [messageIndex]: "Could not generate summary." }));
  }
  setLoadingSummary(null);
};
const exportPDF = async () => {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  const element = dashboardRef.current;
  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0a14",
    scale: 2,
    useCORS: true,
    logging: false
  });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width / 2, canvas.height / 2]
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save("NeuralQuery-Dashboard.pdf");
};

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a14", color: "#e0e0f0", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div style={{ width: 240, background: "#0f0f1e", borderRight: "1px solid #1e1e3f", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 6 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "0 4px" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, color: "#fff", lineHeight: 1 }}>NeuralQuery</p>
            <p style={{ fontSize: 10, color: "#555", marginTop: 2 }}>AI BI Dashboard</p>
          </div>
        </div>

        {/* Uploaded file badge */}
        {uploadedFile && (
          <div style={{ background: "#1a2a1a", border: "1px solid #2a4a2a", borderRadius: 8, padding: "8px 10px", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            <Database size={12} color="#10b981" />
            <span style={{ fontSize: 11, color: "#10b981", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadedFile}</span>
          </div>
        )}

        {/* Sample queries */}
        <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: 1, padding: "0 4px", marginBottom: 4 }}>Try asking</p>
        {SAMPLE_QUERIES.map(q => (
          <button key={q} onClick={() => sendMessage(q)} style={{
            background: "transparent", border: "1px solid #1e1e3f", borderRadius: 8,
            padding: "8px 10px", color: "#888", fontSize: 11, cursor: "pointer",
            textAlign: "left", lineHeight: 1.4, transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 6
          }}
            onMouseEnter={e => { e.target.style.background = "#1a1a2e"; e.target.style.color = "#aaa"; e.target.style.borderColor = "#3d3d5f"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#888"; e.target.style.borderColor = "#1e1e3f"; }}>
            <ChevronRight size={10} style={{ flexShrink: 0 }} />{q}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Upload CSV */}
        <button onClick={() => fileRef.current.click()} style={{
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none",
          borderRadius: 10, padding: "11px", color: "#fff", fontSize: 13,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontWeight: 600
        }}>
          <Upload size={14} /> Upload CSV
        </button>

        {/* Clear chat */}
        <button onClick={clearChat} style={{
          background: "transparent", border: "1px solid #2d2d3f", borderRadius: 10,
          padding: "9px", color: "#666", fontSize: 12, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, justifyContent: "center"
        }}>
          <Trash2 size={13} /> Clear chat
        </button>

        <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={uploadCSV} />
      </div>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid #1e1e3f", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0a0a14" }}>
  <div>
    <p style={{ fontWeight: 600, fontSize: 15, color: "#fff" }}>Dashboard</p>
    <p style={{ fontSize: 11, color: "#444" }}>{history.length} queries this session</p>
  </div>
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <button onClick={exportPDF} style={{
      background: "linear-gradient(135deg,#1a1a3e,#2d1f4e)",
      border: "1px solid #4c3a7a", borderRadius: 8,
      padding: "7px 14px", color: "#a78bfa",
      fontSize: 12, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 6, fontWeight: 600
    }}>
      <Download size={13} /> Download PDF
    </button>
    {["Powered by Groq", "LLaMA 3.3 70B"].map(tag => (
              <span key={tag} style={{ background: "#1a1a2e", border: "1px solid #2d2d4f", borderRadius: 20, padding: "4px 10px", fontSize: 10, color: "#666" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={dashboardRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              {m.role === "user" ? (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{
                    background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                    borderRadius: "16px 16px 4px 16px", padding: "10px 16px",
                    maxWidth: "65%", fontSize: 14, lineHeight: 1.5
                  }}>{m.text}</div>
                </div>
              ) : (
                <div>
                  {/* Bot avatar */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <BarChart2 size={14} color="#fff" />
                    </div>
                    <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>NeuralQuery</span>
                  </div>

                  {/* Text */}
                  {m.text && (
                    <div style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 14, color: "#ccc", whiteSpace: "pre-line", maxWidth: "80%" }}>
                      {m.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </div>
                  )}

                  {/* Insight box */}
                  {m.insight && (
                    <div style={{
                      background: "#1a1a2e", border: "1px solid #2d2d4f",
                      borderLeft: "3px solid #f59e0b",
                      borderRadius: "0 10px 10px 0", padding: "10px 14px",
                      marginBottom: 16, display: "flex", gap: 8, alignItems: "flex-start", maxWidth: "80%"
                    }}>
                      <Lightbulb size={15} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: "#c0c0e0", lineHeight: 1.5 }}>{m.insight}</span>
                    </div>
                  )}

                  {/* Charts grid */}
                  {m.charts && m.charts.length > 0 && (
  <div>
    <div style={{
      display: "grid",
      gridTemplateColumns: m.charts.length === 1 ? "minmax(0,680px)" : "repeat(auto-fill, minmax(360px,1fr))",
      gap: 16, marginTop: 8
    }}>
      {m.charts.map((c, ci) => <ChartBlock key={ci} chart={c} data={m.data || []} />)}
    </div>

    {/* Generate Summary Button */}
    {!summaries[i] && (
      <button
        onClick={() => generateSummary(i, m.data, m.charts, history[history.length-1]?.question || "")}
        disabled={loadingSummary === i}
        style={{
          marginTop: 14,
          background: "linear-gradient(135deg,#1a1a3e,#2d1f4e)",
          border: "1px solid #4c3a7a", borderRadius: 10,
          padding: "9px 16px", color: "#a78bfa",
          fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 600
        }}>
        {loadingSummary === i
          ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Analyzing...</>
          : <><Brain size={14} /> Generate AI Summary</>}
      </button>
    )}

    {/* Summary Panel */}
    {summaries[i] && (
      <div style={{
        marginTop: 14,
        background: "linear-gradient(145deg,#0f0f2e,#1a1230)",
        border: "1px solid #4c3a7a", borderRadius: 14,
        padding: "18px 20px", maxWidth: 800
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={14} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#a78bfa" }}>AI Summary</span>
          <span style={{ fontSize: 10, color: "#555", background: "#1a1a2e", border: "1px solid #2d2d4f", borderRadius: 20, padding: "2px 8px" }}>LLaMA 3.3 70B</span>
        </div>

        {/* Sections */}
        {summaries[i].split('\n').filter(l => l.trim()).map((line, li) => {
          const isKeyFinding   = line.includes("KEY FINDING");
          const isTrend        = line.includes("TREND");
          const isAnomaly      = line.includes("ANOMALY");
          const isRecommend    = line.includes("RECOMMENDATION");
          const isHeader       = isKeyFinding || isTrend || isAnomaly || isRecommend;
          const icon = isKeyFinding ? <TrendingUp size={13} color="#10b981" />
                     : isTrend      ? <TrendingUp size={13} color="#6366f1" />
                     : isAnomaly    ? <AlertTriangle size={13} color="#f59e0b" />
                     : isRecommend  ? <Target size={13} color="#ef4444" />
                     : null;
          const color = isKeyFinding ? "#10b981"
                      : isTrend     ? "#818cf8"
                      : isAnomaly   ? "#f59e0b"
                      : isRecommend ? "#f87171"
                      : "#c0c0e0";
          return (
            <div key={li} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: isHeader ? 4 : 14 }}>
              {icon && <span style={{ marginTop: 2, flexShrink: 0 }}>{icon}</span>}
              <p style={{
                margin: 0, lineHeight: 1.6,
                fontSize: isHeader ? 11 : 13,
                fontWeight: isHeader ? 700 : 400,
                color,
                textTransform: isHeader ? "uppercase" : "none",
                letterSpacing: isHeader ? 0.8 : 0
              }}>
                {line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
              </p>
            </div>
          );
        })}

        {/* Regenerate */}
        <button
          onClick={() => { setSummaries(s => ({...s, [i]: null})); generateSummary(i, m.data, m.charts, history[history.length-1]?.question || ""); }}
          style={{ marginTop: 8, background: "transparent", border: "1px solid #4c3a7a", borderRadius: 8, padding: "5px 12px", color: "#7c3aed", fontSize: 11, cursor: "pointer" }}>
          ↻ Regenerate
        </button>
      </div>
    )}
  </div>
)}
                </div>
              )}
            </div>
          ))}

          {/* Loading state */}
          {loading && (
            <div>
              <ProgressBar />
              <LoadingDots />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input Bar ── */}
        <div style={{ padding: "14px 28px 20px", borderTop: "1px solid #1e1e3f", background: "#0a0a14" }}>
          <div style={{
            display: "flex", gap: 10, background: "#0f0f1e",
            border: "1px solid #2d2d4f", borderRadius: 14, padding: "10px 14px",
            transition: "border-color 0.2s",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask anything about your data... (e.g. 'Show monthly revenue trend')"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e0e0f0", fontSize: 14, lineHeight: 1.5
              }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim() ? "#2d2d4f" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
              border: "none", borderRadius: 10, padding: "8px 14px",
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
            }}>
              {loading ? <Loader2 size={16} color="#888" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} color="#fff" />}
            </button>
          </div>
          <p style={{ fontSize: 10, color: "#333", textAlign: "center", marginTop: 8 }}>
            NeuralQuery uses AI to generate SQL and visualizations — always verify critical data
          </p>
        </div>
      </div>
    </div>
  );
}