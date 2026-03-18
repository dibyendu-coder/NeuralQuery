# 🧠 NeuralQuery — Conversational AI for Instant Business Intelligence

<div align="center">

![NeuralQuery Banner](https://img.shields.io/badge/NeuralQuery-AI%20BI%20Dashboard-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyeiIvPjwvc3ZnPg==)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-F55036?style=for-the-badge)](https://groq.com/)
[![DuckDB](https://img.shields.io/badge/DuckDB-Latest-FFF000?style=for-the-badge)](https://duckdb.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

### **From Plain English to Interactive Dashboards in Under 4 Seconds**

*No SQL. No coding. No training required.*

[🚀 Live Demo](#demo) • [⚡ Quick Start](#quick-start) • [🏗️ Architecture](#architecture) • [✨ Features](#features)

</div>

---

## 🎯 The Problem

Business users have important questions about their data. But getting answers requires:
- ❌ Writing complex SQL queries
- ❌ Learning BI tools like Tableau or Power BI
- ❌ Waiting days for the data team to build reports
- ❌ Paying thousands for enterprise software

**Result**: A massive bottleneck between business decisions and data insights.

---

## ✅ Our Solution

**NeuralQuery** eliminates this bottleneck entirely.

Type a question in plain English → Get a fully interactive dashboard in seconds.
```
"Show me monthly revenue trend for 2023 broken down by region"
```
↓
**Instant interactive line chart + AI insights + recommendations**

---

## ✨ Features

### 🗣️ Natural Language to Dashboard
Type any business question in plain English. NeuralQuery converts it to SQL, executes it, and renders the perfect chart — automatically.

### 🧠 Smart Chart Selection
AI automatically picks the best visualization:
- 📊 **Bar Chart** — category comparisons
- 📈 **Line Chart** — time series and trends  
- 🥧 **Pie Chart** — proportions and breakdowns
- 🔵 **Scatter Chart** — correlations between metrics
- 📉 **Area Chart** — cumulative trends over time

### 📁 Upload Any CSV
Upload your own data file and immediately start querying it. No database setup. No configuration. Just upload and ask.

### 🤖 AI Summary Insights
Every dashboard comes with a 4-section AI analysis:
- 🟢 **Key Finding** — the most important number or insight
- 🔵 **Trend** — what pattern is visible in the data
- 🟡 **Anomaly** — outliers and surprises worth noting
- 🔴 **Recommendation** — one concrete business action to take

### 💬 Follow-up Questions
Chat with your dashboard:
> "Now filter this to only show the North region"
> "Show the same data but for Q4 only"

### 📥 Export as PDF
Download your entire dashboard — charts, insights, AI summary — as a clean PDF with one click.

### ⚡ Real-time Loading
Animated progress bar and loading indicators while your dashboard generates — so the experience always feels fast and responsive.

---

## 🏗️ Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     USER INTERFACE                       │
│              React + Vite + Recharts                     │
└─────────────────────┬───────────────────────────────────┘
                      │ Natural Language Query
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND                        │
│         Schema Injection + Prompt Engineering            │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐      ┌──────────────────────────────┐
│   GROQ API       │      │         DUCKDB               │
│ LLaMA 3.3 70B    │      │   In-Memory Analytics DB     │
│                  │      │   Executes Generated SQL     │
│ Returns:         │      │   Handles CSV Upload         │
│ • SQL Query      │      └──────────────────────────────┘
│ • Chart Config   │
│ • Insight Text   │
└──────────────────┘
```

### Flow
```
User Query
    │
    ▼
FastAPI injects DB schema into prompt
    │
    ▼
Groq LLaMA 3.3 70B generates SQL + chart type + insight (JSON)
    │
    ▼
DuckDB executes SQL in milliseconds
    │
    ▼
React renders interactive Recharts visualization
    │
    ▼
User clicks "Generate AI Summary" for deeper analysis
```

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite | Fast, component-based UI |
| Charts | Recharts | React-native, interactive, beautiful |
| Backend | FastAPI (Python) | Async, fast, auto-validation |
| LLM | LLaMA 3.3 70B via Groq | Fastest inference, free tier, structured output |
| Database | DuckDB | Columnar, analytical, zero-config, CSV-native |
| Styling | Inline CSS | Zero dependencies, full control |
| PDF Export | html2canvas + jsPDF | Client-side, no server needed |

---

## ⚡ Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API Key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repository
```bash
git clone https://github.com/dibyendu-coder/NeuralQuery.git
cd NeuralQuery/bi-dashboard
```

### 2. Set up the Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn groq pandas duckdb python-multipart python-dotenv
```

### 3. Configure API Key
Create a `.env` file inside the `backend` folder:
```
GROQ_API_KEY=your_groq_api_key_here
```
Get your free API key at [console.groq.com](https://console.groq.com)

### 4. Start the Backend
```bash
uvicorn main:app --reload
```
Backend runs at `http://localhost:8000`

### 5. Set up the Frontend
Open a new terminal:
```bash
cd frontend
npm install
npm install recharts axios lucide-react html2canvas jspdf
npm run dev
```
Frontend runs at `http://localhost:5173`

### 6. Open the App
Go to `http://localhost:5173` in your browser and start asking questions! 🎉

---

## 🎮 Demo Queries to Try

### Simple
```
Show total revenue by product
Show revenue breakdown by region
```

### Medium
```
Show monthly revenue trend for 2023
Who are the top 5 sales reps by total revenue?
Compare revenue across all countries
```

### Complex
```
Show top 3 products by revenue per region with monthly trend
Compare sales rep performance by category and region
Show revenue growth month over month for 2023
```

---

## 📁 Project Structure
```
NeuralQuery/
└── bi-dashboard/
    ├── backend/
    │   ├── main.py          # FastAPI app, LLM pipeline, DuckDB
    │   ├── .env             # API keys (not committed)
    │   └── venv/            # Python virtual environment
    └── frontend/
        ├── src/
        │   ├── App.jsx      # Main React component
        │   └── index.css    # Global styles
        ├── package.json
        └── vite.config.js
```

---

## 🔒 Security

- API keys stored in `.env` file — never committed to git
- `.env` excluded via `.gitignore`
- Raw CSV data never sent to LLM — only schema structure
- DuckDB runs in read-only analytical mode — no data modification possible
- All uploaded data cleared automatically on server restart

---

## 🚀 Evaluation Criteria Coverage

| Criteria | Points | How We Address It |
|----------|--------|-------------------|
| Data Retrieval Accuracy | 40 | Schema injection + self-correcting SQL pipeline |
| Chart Selection | 40 | LLM-driven smart chart rules (5 chart types) |
| Error Handling | 40 | Two-layer error recovery + friendly messages |
| Design & Aesthetics | 30 | Dark modern UI, gradient accents, smooth animations |
| Interactivity | 30 | Hover tooltips, zoom, responsive charts |
| User Flow | 30 | Loading states, sample queries, progress bar |
| Architecture | 30 | Clean pipeline: NL → LLM → SQL → Chart |
| Prompt Engineering | 30 | Schema injection, structured output, history |
| Hallucination Handling | 30 | Error JSON response, self-correction loop |
| Follow-up Questions | +10 | Conversation history with last 3 turns |
| CSV Upload | +20 | Any CSV → instant queryable table |

---

## 👨‍💻 Team

Built with ❤️ for the Hackathon 2025

---

## 📄 License

MIT License — feel free to use and build on this project.

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with 🧠 AI + ⚡ Groq + 🦆 DuckDB + ⚛️ React

</div>
```

---

## How to add this to your GitHub:

1. Open VS Code
2. Find `README.md` in your `NeuralQuery` root folder
3. Delete everything inside it
4. Paste the entire content above
5. Save with **Ctrl + S**
6. Then push:
```
git add .
git commit -m "docs: add comprehensive README"
git push origin main