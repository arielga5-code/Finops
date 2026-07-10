"""Load and normalize an AWS Cost and Usage Report (CUR) or Cost Explorer export
into a standard schema the rest of the app can work with.

Handles both legacy CUR column names (lineItem/UnblendedCost) and CUR 2.0 /
Data Export names (line_item_unblended_cost), plus simplified exports that
already use plain column names (cost, service, date, account).
"""
from __future__ import annotations

import io
import re
from dataclasses import dataclass, field

import pandas as pd

# Candidate source column names -> normalized field, checked in order.
COLUMN_CANDIDATES: dict[str, list[str]] = {
    "account_id": [
        "lineItem/UsageAccountId", "line_item_usage_account_id",
        "bill/PayerAccountId", "AccountId", "account_id", "account",
    ],
    "service": [
        "lineItem/ProductCode", "line_item_product_code",
        "product/ProductName", "product_name", "service",
    ],
    "usage_type": [
        "lineItem/UsageType", "line_item_usage_type", "usage_type",
    ],
    "region": [
        "product/region", "product_region_code", "product_region", "region",
    ],
    "date": [
        "lineItem/UsageStartDate", "line_item_usage_start_date",
        "usage_start_time", "usage_date", "date",
    ],
    "cost_unblended": [
        "lineItem/UnblendedCost", "line_item_unblended_cost",
        "unblended_cost", "cost",
    ],
    "cost_blended": [
        "lineItem/BlendedCost", "line_item_blended_cost", "blended_cost",
    ],
    "cost_amortized": [
        "savingsPlan/SavingsPlanEffectiveCost",
        "reservation/EffectiveCost",
        "savings_plan_savings_plan_effective_cost",
        "reservation_effective_cost",
        "amortized_cost",
    ],
    "record_type": [
        "lineItem/LineItemType", "line_item_line_item_type", "record_type",
    ],
}

TAG_PREFIXES = ("resourceTags/user:", "resource_tags_user_", "tag:", "tags/")


@dataclass
class LoadResult:
    df: pd.DataFrame
    tag_keys: list[str] = field(default_factory=list)
    unmatched_required: list[str] = field(default_factory=list)


def _find_column(columns: list[str], candidates: list[str]) -> str | None:
    lower_map = {c.lower(): c for c in columns}
    for cand in candidates:
        if cand in columns:
            return cand
        if cand.lower() in lower_map:
            return lower_map[cand.lower()]
    return None


def _extract_tag_columns(columns: list[str]) -> list[str]:
    return [c for c in columns if c.startswith(TAG_PREFIXES)]


def _tag_key_from_column(col: str) -> str:
    for prefix in TAG_PREFIXES:
        if col.startswith(prefix):
            return col[len(prefix):]
    return col


def load_cur(file_or_buffer, filename: str | None = None) -> LoadResult:
    """Load a CUR/usage CSV (or gzip-compressed CSV) into a normalized DataFrame.

    `file_or_buffer` may be a path, a file-like object, or raw bytes (e.g. from
    a Streamlit file_uploader).
    """
    compression = "infer"
    if isinstance(file_or_buffer, (bytes, bytearray)):
        buf = io.BytesIO(file_or_buffer)
        if filename and filename.endswith(".gz"):
            compression = "gzip"
        raw = pd.read_csv(buf, compression=compression, low_memory=False)
    else:
        raw = pd.read_csv(file_or_buffer, low_memory=False)

    columns = list(raw.columns)
    normalized = pd.DataFrame(index=raw.index)
    unmatched_required = []

    for field_name, candidates in COLUMN_CANDIDATES.items():
        col = _find_column(columns, candidates)
        if col is not None:
            normalized[field_name] = raw[col]
        elif field_name in ("account_id", "service", "date", "cost_unblended"):
            unmatched_required.append(field_name)
            normalized[field_name] = None
        else:
            normalized[field_name] = None

    # Keep all line item types (Usage, Credit, Refund, Tax, ...) unfiltered so
    # totals reconcile with the actual bill; the dashboard nets them out.
    for field_name in ("cost_unblended", "cost_blended", "cost_amortized"):
        normalized[field_name] = pd.to_numeric(normalized[field_name], errors="coerce")

    normalized["date"] = pd.to_datetime(normalized["date"], errors="coerce", utc=True)
    normalized["month"] = normalized["date"].dt.tz_localize(None).dt.to_period("M").astype(str)
    normalized["day"] = normalized["date"].dt.date.astype(str)

    tag_columns = _extract_tag_columns(columns)
    tag_keys = sorted({_tag_key_from_column(c) for c in tag_columns})
    for col in tag_columns:
        key = _tag_key_from_column(col)
        normalized[f"tag_{key}"] = raw[col]

    if tag_keys:
        tag_cols = [f"tag_{k}" for k in tag_keys]
        normalized["is_tagged"] = normalized[tag_cols].notna().any(axis=1) & (
            normalized[tag_cols].apply(lambda s: s.astype(str).str.strip().ne("")).any(axis=1)
        )
    else:
        normalized["is_tagged"] = False

    normalized["service"] = normalized["service"].fillna("(unknown service)")
    normalized["account_id"] = normalized["account_id"].fillna("(unknown account)").astype(str)

    return LoadResult(df=normalized, tag_keys=tag_keys, unmatched_required=unmatched_required)
