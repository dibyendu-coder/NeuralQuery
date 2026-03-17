from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import duckdb
import pandas as pd
import json
import os
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from dotenv import load_dotenv
load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# In-memory DuckDB connection
con = duckdb.connect()

# ── Seed default sales database ──────────────────────────────────────────────
def seed_default_data():
    con.execute("""
        CREATE TABLE IF NOT EXISTS orders AS
        SELECT * FROM (VALUES
          (1,'2023-01-05','North','Alice','Laptop',1200.00,2),
          (2,'2023-01-12','South','Bob','Phone',800.00,1),
          (3,'2023-02-03','East','Carol','Laptop',1200.00,1),
          (4,'2023-02-18','West','Dave','Tablet',450.00,3),
          (5,'2023-03-07','North','Alice','Phone',800.00,2),
          (6,'2023-03-22','South','Eve','Monitor',350.00,2),
          (7,'2023-04-10','East','Frank','Laptop',1200.00,1),
          (8,'2023-04-25','West','Grace','Keyboard',80.00,5),
          (9,'2023-05-14','North','Hank','Tablet',450.00,2),
          (10,'2023-05-30','South','Ivy','Monitor',350.00,1),
          (11,'2023-06-08','East','Bob','Phone',800.00,3),
          (12,'2023-06-21','West','Carol','Laptop',1200.00,1),
          (13,'2023-07-03','North','Dave','Keyboard',80.00,10),
          (14,'2023-07-19','South','Alice','Monitor',350.00,2),
          (15,'2023-08-05','East','Eve','Tablet',450.00,1),
          (16,'2023-08-22','West','Frank','Phone',800.00,2),
          (17,'2023-09-11','North','Grace','Laptop',1200.00,3),
          (18,'2023-09-28','South','Hank','Keyboard',80.00,4),
          (19,'2023-10-06','East','Ivy','Monitor',350.00,3),
          (20,'2023-10-20','West','Alice','Tablet',450.00,2),
          (21,'2023-11-09','North','Bob','Laptop',1200.00,1),
          (22,'2023-11-25','South','Carol','Phone',800.00,2),
          (23,'2023-12-04','East','Dave','Keyboard',80.00,6),
          (24,'2023-12-18','West','Eve','Monitor',350.00,1)
        ) t(order_id, order_date, region, customer, product, unit_price, quantity)
    """)

seed_default_data()

# ── Helper: get schema string ─────────────────────────────────────────────────
def get_schema():
    tables = con.execute("SHOW TABLES").fetchdf()
    schema_lines = []
    for table in tables["name"].tolist():
        cols = con.execute(f"DESCRIBE {table}").fetchdf()
        col_str = ", ".join(f"{r['column_name']} ({r['column_type']})" for _, r in cols.iterrows())
        schema_lines.append(f"Table '{table}': {col_str}")
    return "\n".join(schema_lines)

# ── LLM call helper ───────────────────────────────────────────────────────────
def ask_llm(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000,
    )
    return response.choices[0].message.content.strip()

# ── Routes ────────────────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    question: str
    history: list = []

@app.post("/api/query")
async def run_query(req: QueryRequest):
    schema = get_schema()

    history_text = ""
    if req.history:
        history_text = "\n\nConversation so far:\n" + "\n".join(
            f"User: {h['question']}\nSQL used: {h.get('sql','')}" for h in req.history[-3:]
        )

    prompt = f"""You are a BI analyst. Given a database schema and user question, return ONLY valid JSON (no markdown, no explanation, no code fences).

Format:
{{"sql": "SELECT ...", "charts": [{{"type": "bar", "x": "col", "y": "col", "title": "Chart title"}}], "insight": "One sentence insight."}}

Rules:
- Only use columns that actually exist in the schema below
- type must be one of: bar, line, pie, scatter, area
- Follow these strict chart selection rules based on data characteristics:

  USE LINE when:
  * Data has dates, months, years, or any time-based column
  * Question uses words like "trend", "over time", "monthly", "yearly", "growth"
  * Showing continuous change or progression

  USE BAR when:
  * Comparing discrete categories (products, regions, names, countries)
  * Question uses words like "compare", "top", "best", "worst", "by category"
  * Ranking items against each other
  * X axis has less than 15 distinct values

  USE PIE when:
  * Showing parts of a whole or percentage breakdown
  * Question uses words like "share", "distribution", "proportion", "breakdown", "percentage"
  * There are less than 7 categories total

  USE SCATTER when:
  * Showing correlation or relationship between two numeric columns
  * Question uses words like "relationship", "correlation", "affect", "impact", "vs"
  * Both X and Y axes are continuous numeric values

  USE AREA when:
  * Same as line but when showing cumulative totals over time
  * Question uses words like "cumulative", "total over time", "growth over time"

- If multiple chart types apply, return multiple charts in the array — one of each relevant type
- Never use pie chart if there are more than 7 categories
- Always pick the chart type that makes the data easiest to understand
```

Save and restart backend:
```
uvicorn main:app --reload
- If the question cannot be answered from available data, return: {{"error": "Short explanation"}}
- You may return multiple charts in the charts array if useful
- For pie charts, x = category column, y = value column
- Always include a non-empty insight string{history_text}

Schema (use EXACTLY these table and column names):
{schema}

User question: {req.question}"""

    try:
        raw = ask_llm(prompt)
        raw = re.sub(r"^```json\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        result = json.loads(raw)

        if "error" in result:
            return {"error": result["error"]}

        sql = result.get("sql", "")
        df = con.execute(sql).fetchdf()
        data = df.to_dict(orient="records")

        return {
            "data": data,
            "charts": result.get("charts", []),
            "insight": result.get("insight", ""),
            "sql": sql,
        }
    except json.JSONDecodeError:
        return {"error": "The AI returned an unexpected format. Try rephrasing your question."}
    except Exception as e:
        try:
            fix_prompt = f"This SQL failed: {sql}\nError: {str(e)}\nSchema: {schema}\nReturn fixed JSON only, no markdown."
            fix_raw = ask_llm(fix_prompt)
            fix_raw = re.sub(r"```json|```", "", fix_raw).strip()
            fix_result = json.loads(fix_raw)
            sql2 = fix_result.get("sql", "")
            df2 = con.execute(sql2).fetchdf()
            data2 = df2.to_dict(orient="records")
            return {"data": data2, "charts": fix_result.get("charts", []), "insight": fix_result.get("insight", ""), "sql": sql2}
        except:
            return {"error": "Could not answer this query. Try asking differently."}

@app.post("/api/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        table_name = os.path.splitext(file.filename)[0].replace(" ", "_").lower()
        con.execute(f"DROP TABLE IF EXISTS {table_name}")
        con.register(table_name, df)
        con.execute(f"CREATE TABLE {table_name} AS SELECT * FROM {table_name}")
        cols = con.execute(f"DESCRIBE {table_name}").fetchdf()
        col_list = ", ".join(f"{r['column_name']} ({r['column_type']})" for _, r in cols.iterrows())
        return {"success": True, "table": table_name, "columns": col_list, "rows": len(df)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/schema")
def get_schema_route():
    return {"schema": get_schema()}
class SummaryRequest(BaseModel):
    data: list
    charts: list
    question: str

@app.post("/api/summary")
async def generate_summary(req: SummaryRequest):
    try:
        prompt = f"""You are a senior business analyst. A user asked: "{req.question}"

The dashboard returned this data: {json.dumps(req.data[:20], indent=2)}
Charts shown: {json.dumps(req.charts, indent=2)}

Write a professional AI summary with exactly these 4 sections:
1. KEY FINDING: One powerful sentence about the most important insight
2. TREND: What pattern or trend is visible in this data
3. ANOMALY: Any outlier, surprise, or unusual data point worth noting
4. RECOMMENDATION: One concrete business action based on this data

Keep each section to 1-2 sentences. Be specific with numbers from the data. Be direct and confident."""

        raw = ask_llm(prompt)
        return {"summary": raw}
    except Exception as e:
        return {"error": str(e)}

