"""FinOps dashboard: upload an AWS CUR/usage export, explore cost dashboards,
and get AI-generated recommendations or ask ad-hoc questions about the spend.

Run with: streamlit run app/streamlit_app.py
"""
from __future__ import annotations

import pandas as pd
import streamlit as st

import ai
import aggregate
import charts
from cur_loader import load_cur

st.set_page_config(page_title="FinOps Dashboard", layout="wide")


def build_summary_markdown(df: pd.DataFrame) -> str:
    monthly = aggregate.monthly_trend(df)
    top_services = aggregate.top_dimension(df, "service", n=10)
    top_accounts = aggregate.top_dimension(df, "account_id", n=10)
    coverage = aggregate.tag_coverage(df)
    anomalies = aggregate.daily_anomalies(df)

    lines = [f"Total spend: ${df['cost_unblended'].sum():,.2f}", ""]
    lines.append("Monthly spend:")
    for _, row in monthly.iterrows():
        lines.append(f"- {row['month']}: ${row['cost_unblended']:,.2f}")
    lines.append("\nTop services:")
    for _, row in top_services.iterrows():
        lines.append(f"- {row['service']}: ${row['cost_unblended']:,.2f} ({row['pct']:.1f}%)")
    lines.append("\nTop accounts:")
    for _, row in top_accounts.iterrows():
        lines.append(f"- {row['account_id']}: ${row['cost_unblended']:,.2f} ({row['pct']:.1f}%)")
    lines.append(
        f"\nTagged spend: ${coverage['tagged']:,.2f}; "
        f"Untagged spend: ${coverage['untagged']:,.2f} ({coverage['untagged_pct']:.1f}%)"
    )
    if len(anomalies):
        lines.append("\nDaily cost anomalies (service/day outliers):")
        for _, row in anomalies.head(10).iterrows():
            lines.append(f"- {row['service']} on {row['day']}: ${row['cost_unblended']:,.2f} (z={row['z']:.1f})")
    return "\n".join(lines)


def render_dashboard(df: pd.DataFrame) -> None:
    monthly = aggregate.monthly_trend(df)
    latest, mom_pct = aggregate.mom_change(monthly)
    coverage = aggregate.tag_coverage(df)

    col1, col2, col3 = st.columns(3)
    col1.metric("Total spend", f"${df['cost_unblended'].sum():,.2f}")
    col2.metric(
        "Latest month",
        f"${latest:,.2f}" if latest is not None else "N/A",
        f"{mom_pct:+.1f}% vs prior month" if mom_pct is not None else None,
    )
    col3.metric("Untagged spend", f"{coverage['untagged_pct']:.1f}%", f"${coverage['untagged']:,.2f}")

    st.plotly_chart(charts.trend_line(monthly, "month", "cost_unblended", "Monthly spend"), use_container_width=True)

    col1, col2 = st.columns(2)
    with col1:
        top_services = aggregate.top_dimension(df, "service", n=10)
        st.plotly_chart(charts.top_n_bar(top_services, "service", "cost_unblended", "Top 10 services"), use_container_width=True)
    with col2:
        top_accounts = aggregate.top_dimension(df, "account_id", n=10)
        st.plotly_chart(charts.category_breakdown(top_accounts, "account_id", "cost_unblended", "Spend by account"), use_container_width=True)

    st.plotly_chart(charts.tagged_vs_untagged(coverage["tagged"], coverage["untagged"]), use_container_width=True)

    anomalies = aggregate.daily_anomalies(df)
    if len(anomalies):
        st.subheader("Cost anomalies")
        st.caption("Service/day combinations whose daily cost is a statistical outlier vs. that service's own recent average.")
        st.dataframe(anomalies[["service", "day", "cost_unblended", "z"]].rename(columns={"cost_unblended": "cost", "z": "z-score"}), use_container_width=True)

    st.subheader("Data table")
    st.dataframe(df, use_container_width=True)


def render_ai_tab(df: pd.DataFrame) -> None:
    if not ai.is_configured():
        st.info("Set the `ANTHROPIC_API_KEY` environment variable to enable AI recommendations.")
        return
    if st.button("Generate recommendations"):
        summary = build_summary_markdown(df)
        st.write_stream(ai.generate_recommendations(summary))


def render_chat_tab(df: pd.DataFrame) -> None:
    if not ai.is_configured():
        st.info("Set the `ANTHROPIC_API_KEY` environment variable to enable chat.")
        return
    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    for msg in st.session_state.chat_history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    question = st.chat_input("Ask about your AWS cost data")
    if question:
        st.session_state.chat_history.append({"role": "user", "content": question})
        with st.chat_message("user"):
            st.markdown(question)
        summary = build_summary_markdown(df)
        with st.chat_message("assistant"):
            answer = st.write_stream(ai.chat(summary, st.session_state.chat_history[:-1], question))
        st.session_state.chat_history.append({"role": "assistant", "content": answer})


def main() -> None:
    st.title("FinOps Dashboard")
    st.caption("Upload an AWS Cost and Usage Report (CUR) or usage export to analyze spend.")

    uploaded = st.sidebar.file_uploader("CUR / usage export (CSV or .csv.gz)", type=["csv", "gz"])
    if uploaded is None:
        st.info("Upload a CUR CSV export in the sidebar to get started.")
        return

    result = load_cur(uploaded.getvalue(), filename=uploaded.name)
    if result.unmatched_required:
        st.error(f"Could not find required columns: {', '.join(result.unmatched_required)}. Check the file format.")
        return

    df = result.df

    accounts = sorted(df["account_id"].unique())
    services = sorted(df["service"].unique())
    with st.sidebar:
        st.subheader("Filters")
        selected_accounts = st.multiselect("Account", accounts, default=accounts)
        selected_services = st.multiselect("Service", services, default=services)

    df = df[df["account_id"].isin(selected_accounts) & df["service"].isin(selected_services)]
    if df.empty:
        st.warning("No rows match the current filters.")
        return

    tab_dashboard, tab_ai, tab_chat = st.tabs(["Dashboard", "AI Recommendations", "Chat"])
    with tab_dashboard:
        render_dashboard(df)
    with tab_ai:
        render_ai_tab(df)
    with tab_chat:
        render_chat_tab(df)


if __name__ == "__main__":
    main()
