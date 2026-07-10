# FinOps Dashboard

A local Streamlit app for AWS cost analysis: upload a Cost and Usage Report
(CUR) or usage export, get dashboards, and (optionally) AI-generated cost
recommendations and a chat interface over your spend data.

## Setup

```bash
cd app
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
streamlit run streamlit_app.py
```

Opens at http://localhost:8501. Upload a CUR/usage CSV (or `.csv.gz`) export
in the sidebar.

## AI features (optional)

The "AI Recommendations" and "Chat" tabs call the Claude API. To enable them:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

Without a key set, the dashboard still works — those two tabs just show a
prompt to configure the key.

## Supported input

Any CSV with either legacy AWS CUR columns (`lineItem/UnblendedCost`,
`lineItem/ProductCode`, ...) or CUR 2.0 / Data Export columns
(`line_item_unblended_cost`, ...). Resource allocation tags
(`resourceTags/user:*` or `resource_tags_user_*`) are picked up automatically
for the tagged-vs-untagged breakdown.

See `cur_loader.py` for the exact column-detection logic.
