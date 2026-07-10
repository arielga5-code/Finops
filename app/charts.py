"""Plotly figure builders, styled per the dataviz skill's mark specs and palette."""
from __future__ import annotations

import pandas as pd
import plotly.graph_objects as go

from palette import CATEGORICAL, CHROME

_BASE_LAYOUT = dict(
    paper_bgcolor=CHROME["surface"],
    plot_bgcolor=CHROME["surface"],
    font=dict(family="system-ui, -apple-system, 'Segoe UI', sans-serif", color=CHROME["primary_ink"]),
    margin=dict(l=48, r=24, t=32, b=40),
)


def _style_axes(fig: go.Figure) -> go.Figure:
    fig.update_xaxes(gridcolor=CHROME["gridline"], linecolor=CHROME["baseline"], tickfont=dict(color=CHROME["muted"]))
    fig.update_yaxes(gridcolor=CHROME["gridline"], linecolor=CHROME["baseline"], tickfont=dict(color=CHROME["muted"]))
    return fig


def trend_line(df: pd.DataFrame, x_col: str, y_col: str, title: str) -> go.Figure:
    fig = go.Figure()
    fig.add_trace(
        go.Scatter(
            x=df[x_col],
            y=df[y_col],
            mode="lines+markers",
            line=dict(color=CATEGORICAL[0], width=2, shape="spline", smoothing=0.3),
            marker=dict(size=8, color=CATEGORICAL[0]),
            hovertemplate="%{x}<br>$%{y:,.2f}<extra></extra>",
        )
    )
    fig.update_layout(title=title, showlegend=False, **_BASE_LAYOUT)
    return _style_axes(fig)


def top_n_bar(df: pd.DataFrame, label_col: str, value_col: str, title: str) -> go.Figure:
    df = df.sort_values(value_col, ascending=True)
    fig = go.Figure(
        go.Bar(
            x=df[value_col],
            y=df[label_col],
            orientation="h",
            marker=dict(color=CATEGORICAL[0]),
            hovertemplate="%{y}<br>$%{x:,.2f}<extra></extra>",
        )
    )
    fig.update_layout(title=title, showlegend=False, **_BASE_LAYOUT)
    return _style_axes(fig)


def category_breakdown(df: pd.DataFrame, label_col: str, value_col: str, title: str) -> go.Figure:
    """Fixed-order categorical bar, e.g. cost by account or by tag value."""
    df = df.sort_values(value_col, ascending=False)
    colors = [CATEGORICAL[i % len(CATEGORICAL)] for i in range(len(df))]
    fig = go.Figure(
        go.Bar(
            x=df[label_col],
            y=df[value_col],
            marker=dict(color=colors),
            hovertemplate="%{x}<br>$%{y:,.2f}<extra></extra>",
        )
    )
    fig.update_layout(title=title, showlegend=False, **_BASE_LAYOUT)
    return _style_axes(fig)


def tagged_vs_untagged(tagged: float, untagged: float) -> go.Figure:
    fig = go.Figure(
        go.Bar(
            x=["Tagged", "Untagged"],
            y=[tagged, untagged],
            marker=dict(color=[CATEGORICAL[1], CHROME["muted"]]),
            hovertemplate="%{x}<br>$%{y:,.2f}<extra></extra>",
        )
    )
    fig.update_layout(title="Tagged vs. untagged spend", showlegend=False, **_BASE_LAYOUT)
    return _style_axes(fig)
