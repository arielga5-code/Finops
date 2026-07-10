"""Aggregation helpers that turn a normalized CUR DataFrame into dashboard-ready summaries."""
from __future__ import annotations

import pandas as pd

COST_COL = "cost_unblended"


def monthly_trend(df: pd.DataFrame) -> pd.DataFrame:
    out = df.groupby("month", dropna=True)[COST_COL].sum().reset_index()
    return out.sort_values("month")


def daily_trend(df: pd.DataFrame) -> pd.DataFrame:
    out = df.groupby("day", dropna=True)[COST_COL].sum().reset_index()
    return out.sort_values("day")


def top_dimension(df: pd.DataFrame, column: str, n: int = 10) -> pd.DataFrame:
    out = df.groupby(column, dropna=True)[COST_COL].sum().reset_index()
    out = out.sort_values(COST_COL, ascending=False).head(n)
    total = df[COST_COL].sum()
    out["pct"] = (out[COST_COL] / total * 100) if total else 0.0
    return out


def tag_coverage(df: pd.DataFrame) -> dict:
    total = df[COST_COL].sum()
    tagged = df.loc[df["is_tagged"], COST_COL].sum()
    untagged = total - tagged
    return {
        "total": total,
        "tagged": tagged,
        "untagged": untagged,
        "untagged_pct": (untagged / total * 100) if total else 0.0,
    }


def mom_change(monthly: pd.DataFrame) -> tuple[float | None, float | None]:
    """Return (latest_month_cost, pct_change_vs_prior_month)."""
    if len(monthly) < 1:
        return None, None
    latest = monthly.iloc[-1][COST_COL]
    if len(monthly) < 2:
        return latest, None
    prior = monthly.iloc[-2][COST_COL]
    pct = ((latest - prior) / prior * 100) if prior else None
    return latest, pct


def daily_anomalies(df: pd.DataFrame, z_threshold: float = 2.5) -> pd.DataFrame:
    """Flag service/day combinations whose daily cost is an outlier (z-score) vs
    that service's own recent daily average. A lightweight anomaly screen, not a
    forecasting model."""
    by_service_day = (
        df.groupby(["service", "day"], dropna=True)[COST_COL].sum().reset_index()
    )
    stats = by_service_day.groupby("service")[COST_COL].agg(["mean", "std"]).reset_index()
    merged = by_service_day.merge(stats, on="service", how="left")
    merged["std"] = merged["std"].fillna(0)
    merged["z"] = (merged[COST_COL] - merged["mean"]) / merged["std"].replace(0, pd.NA)
    anomalies = merged[(merged["z"].abs() >= z_threshold) & merged["std"].gt(0)]
    return anomalies.sort_values("z", key=lambda s: s.abs(), ascending=False)
