#!/usr/bin/env python3
"""
Generate an importable Kibana NDJSON for the Azure AI FinOps dashboard.

Emits: assets/kibana/azure-ai-finops-dashboard.ndjson

The Lens state shape is modelled on the dashboard Elastic ships inside the
azure_billing integration package, so it matches something known to work rather
than something invented.

Run:  python3 assets/kibana/build_dashboard.py
"""

import json
import os

DV_BILLING = "finops-dv-azure-billing"
DV_OPENAI = "finops-dv-azure-openai"
DASHBOARD_ID = "finops-azure-ai-dashboard"

# Cost documents carry both actual and forecast rows in the same data stream.
# Every cost aggregation must exclude forecast rows or totals inflate.
ACTUAL_ONLY = "azure.billing.actual_cost: *"

# Azure OpenAI / AI Foundry spend. Widen if you run other AI services.
AI_SCOPE = (
    "azure.resource.type: *cognitiveservices* "
    "or azure.resource.type: *machinelearningservices* "
    "or azure.billing.product: *openai*"
)
AI_COST = "(%s) and (%s)" % (ACTUAL_ONLY, AI_SCOPE)


# ------------------------------------------------------------------ saved objs

def data_view(obj_id, title, name):
    return {
        "type": "index-pattern",
        "id": obj_id,
        "managed": False,
        "attributes": {
            "title": title,
            "name": name,
            # The global time picker filters on @timestamp (ingest time).
            # Cost panels deliberately bucket on azure.billing.usage_date.
            "timeFieldName": "@timestamp",
            "fieldAttrs": "{}",
            "runtimeFieldMap": "{}",
            "fieldFormatMap": "{}",
            "sourceFilters": "[]",
            "allowNoIndex": True,
        },
        "references": [],
        "typeMigrationVersion": "8.0.0",
    }


# ------------------------------------------------------------------ lens cols

def col_sum(field, label, filt=None):
    c = {
        "customLabel": True,
        "dataType": "number",
        "isBucketed": False,
        "label": label,
        "operationType": "sum",
        "params": {"emptyAsNull": True},
        "scale": "ratio",
        "sourceField": field,
    }
    if filt:
        c["filter"] = {"language": "kuery", "query": filt}
    return c


def col_avg(field, label, filt=None):
    c = {
        "customLabel": True,
        "dataType": "number",
        "isBucketed": False,
        "label": label,
        "operationType": "average",
        "params": {"emptyAsNull": True},
        "scale": "ratio",
        "sourceField": field,
    }
    if filt:
        c["filter"] = {"language": "kuery", "query": filt}
    return c


def col_date(field, interval="1d"):
    return {
        "dataType": "date",
        "isBucketed": True,
        "label": field,
        "operationType": "date_histogram",
        "params": {
            "interval": interval,
            "includeEmptyRows": True,
            "dropPartials": False,
        },
        "scale": "interval",
        "sourceField": field,
    }


def col_terms(field, order_col, size=10, label=None, other=True):
    return {
        "dataType": "string",
        "isBucketed": True,
        "label": label or ("Top %d values of %s" % (size, field)),
        "operationType": "terms",
        "params": {
            "missingBucket": False,
            "orderBy": {"columnId": order_col, "type": "column"},
            "orderDirection": "desc",
            "otherBucket": other,
            "parentFormat": {"id": "terms"},
            "secondaryFields": [],
            "size": size,
        },
        "scale": "ordinal",
        "sourceField": field,
    }


# ------------------------------------------------------------------ assembly

def lens_attributes(viz_type, layer_id, columns, column_order, visualization,
                    dv_id, query=""):
    return {
        "references": [
            {
                "id": dv_id,
                "name": "indexpattern-datasource-layer-%s" % layer_id,
                "type": "index-pattern",
            }
        ],
        "state": {
            "datasourceStates": {
                "formBased": {
                    "layers": {
                        layer_id: {
                            "columnOrder": column_order,
                            "columns": columns,
                            "incompleteColumns": {},
                        }
                    }
                }
            },
            "filters": [],
            "query": {"language": "kuery", "query": query},
            "visualization": visualization,
            "internalReferences": [],
            "adHocDataViews": {},
        },
        "title": "",
        "type": "lens",
        "visualizationType": viz_type,
    }


def panel(pid, title, attributes, x, y, w, h):
    return {
        "type": "lens",
        "panelIndex": pid,
        "gridData": {"x": x, "y": y, "w": w, "h": h, "i": pid},
        # "embeddableConfig" (not "panelConfig") — this is the key the shipped
        # integration dashboards use, and the one every 8.x/9.x Kibana reads.
        # panelConfig is only understood by newer versions.
        "embeddableConfig": {
            "attributes": attributes,
            "enhancements": {},
            "hidePanelTitles": False,
        },
        "title": title,
    }


def metric_panel(pid, title, layer, metric_col, dv, x, y, w, h, subtitle=None):
    mid = layer + "-metric"
    viz = {"layerId": layer, "layerType": "data", "metricAccessor": mid}
    if subtitle:
        viz["subtitle"] = subtitle
    attrs = lens_attributes(
        "lnsMetric", layer, {mid: metric_col}, [mid], viz, dv
    )
    return panel(pid, title, attrs, x, y, w, h)


def xy_panel(pid, title, layer, dv, x_col, metrics, split_col, x, y, w, h,
             series_type="bar_stacked", legend_pos="right"):
    """metrics: list of (col_id_suffix, column_dict)."""
    xid = layer + "-x"
    columns = {xid: x_col}
    order = []
    accessors = []
    for suffix, col in metrics:
        cid = layer + "-" + suffix
        columns[cid] = col
        accessors.append(cid)
    split_id = None
    if split_col is not None:
        split_id = layer + "-split"
        columns[split_id] = split_col
        order = [split_id, xid] + accessors
    else:
        order = [xid] + accessors

    layer_cfg = {
        "layerId": layer,
        "layerType": "data",
        "accessors": accessors,
        "position": "top",
        "seriesType": series_type,
        "showGridlines": False,
        "xAccessor": xid,
    }
    if split_id:
        layer_cfg["splitAccessor"] = split_id

    viz = {
        "legend": {"isVisible": True, "position": legend_pos},
        "valueLabels": "hide",
        "fittingFunction": "None",
        "axisTitlesVisibilitySettings": {"x": False, "yLeft": False,
                                         "yRight": False},
        "preferredSeriesType": series_type,
        "layers": [layer_cfg],
    }
    attrs = lens_attributes("lnsXY", layer, columns, order, viz, dv)
    return panel(pid, title, attrs, x, y, w, h)


def table_panel(pid, title, layer, dv, cols, x, y, w, h, query=""):
    """cols: list of (suffix, column_dict). First is the bucket."""
    columns = {}
    order = []
    viz_cols = []
    for suffix, col in cols:
        cid = layer + "-" + suffix
        columns[cid] = col
        order.append(cid)
        viz_cols.append({"columnId": cid, "isTransposed": False})
    viz = {"layerId": layer, "layerType": "data", "columns": viz_cols}
    attrs = lens_attributes("lnsDatatable", layer, columns, order, viz, dv,
                            query=query)
    return panel(pid, title, attrs, x, y, w, h)


# ------------------------------------------------------------------ build

def build_panels():
    panels = []

    # --- row 0: headline metrics -------------------------------------------
    panels.append(metric_panel(
        "p-total-spend", "Total Azure spend", "l-total",
        col_sum("azure.billing.actual_cost", "Total Azure spend",
                filt=ACTUAL_ONLY),
        DV_BILLING, 0, 0, 16, 7,
        subtitle="All services, selected period",
    ))

    panels.append(metric_panel(
        "p-ai-spend", "AI spend", "l-aispend",
        col_sum("azure.billing.actual_cost", "AI spend", filt=AI_COST),
        DV_BILLING, 16, 0, 16, 7,
        subtitle="Azure OpenAI + AI Foundry",
    ))

    panels.append(metric_panel(
        "p-ptu", "PTU utilization", "l-ptu",
        col_avg("azure.open_ai.provisioned_managed_utilization_v2.avg",
                "Avg PTU utilization %"),
        DV_OPENAI, 32, 0, 16, 7,
        subtitle="Throttling begins at 100%",
    ))

    # --- row 1: spend breakdowns -------------------------------------------
    # NOTE: buckets on usage_date (when cost was incurred), not @timestamp.
    panels.append(xy_panel(
        "p-daily-ai", "Daily AI spend by resource", "l-dailyai", DV_BILLING,
        col_date("azure.billing.usage_date"),
        [("cost", col_sum("azure.billing.actual_cost", "AI spend",
                          filt=AI_COST))],
        col_terms("azure.resource.name", "l-dailyai-cost", size=6),
        0, 7, 32, 15,
    ))

    panels.append(xy_panel(
        "p-by-group", "AI spend by resource group", "l-bygroup", DV_BILLING,
        col_terms("azure.resource.group", "l-bygroup-cost", size=10),
        [("cost", col_sum("azure.billing.actual_cost", "AI spend",
                          filt=AI_COST))],
        None,
        32, 7, 16, 15,
        series_type="bar_horizontal", legend_pos="bottom",
    ))

    # --- row 2: token telemetry --------------------------------------------
    panels.append(xy_panel(
        "p-tokens", "Input vs output tokens", "l-tokens", DV_OPENAI,
        col_date("@timestamp", interval="1h"),
        [
            ("in", col_sum("azure.open_ai.processed_prompt_tokens.total",
                           "Input tokens")),
            ("out", col_sum("azure.open_ai.generated_tokens.total",
                            "Output tokens")),
        ],
        None,
        0, 22, 24, 14,
        series_type="bar_stacked",
    ))

    panels.append(xy_panel(
        "p-cache", "Prompt cache match rate", "l-cache", DV_OPENAI,
        col_date("@timestamp", interval="1h"),
        [("rate", col_avg("azure.open_ai.context_tokens_cache_match_rate.avg",
                          "Cache match rate %"))],
        col_terms("azure.resource.name", "l-cache-rate", size=6),
        24, 22, 24, 14,
        series_type="line",
    ))

    # --- row 3: deployment table -------------------------------------------
    panels.append(table_panel(
        "p-deployments", "AI deployments by cost", "l-deploy", DV_BILLING,
        # Bucket columns must come before the metric in columnOrder. The
        # resource group nests inside the deployment at size=1, which is exact:
        # a resource belongs to exactly one group.
        [
            ("name", col_terms("azure.resource.name", "l-deploy-cost",
                               size=20, label="Deployment")),
            ("group", col_terms("azure.resource.group", "l-deploy-cost",
                                size=1, label="Resource group", other=False)),
            ("cost", col_sum("azure.billing.actual_cost", "MTD cost",
                             filt=AI_COST)),
        ],
        0, 36, 48, 14,
        query=ACTUAL_ONLY,
    ))

    return panels


def build():
    panels = build_panels()

    # Top-level references mirror each panel's own data view reference.
    refs = []
    for p in panels:
        for r in p["embeddableConfig"]["attributes"]["references"]:
            refs.append({
                "id": r["id"],
                "name": "%s:%s" % (p["panelIndex"], r["name"]),
                "type": r["type"],
            })

    dashboard = {
        "type": "dashboard",
        "id": DASHBOARD_ID,
        "managed": False,
        "attributes": {
            "title": "[FinOps] Azure AI consumption & cost allocation",
            "description": (
                "AI spend, token consumption and provisioned-capacity "
                "utilization across Azure OpenAI and AI Foundry. Cost panels "
                "bucket on azure.billing.usage_date and exclude forecast "
                "documents."
            ),
            "hits": 0,
            "timeRestore": True,
            "timeFrom": "now-30d",
            "timeTo": "now",
            "refreshInterval": {"pause": True, "value": 60000},
            "optionsJSON": json.dumps({
                "useMargins": True,
                "syncColors": True,
                "syncCursor": True,
                "syncTooltips": False,
                "hidePanelTitles": False,
            }),
            "panelsJSON": json.dumps(panels),
            "kibanaSavedObjectMeta": {
                "searchSourceJSON": json.dumps({
                    "query": {"language": "kuery", "query": ""},
                    "filter": [],
                })
            },
            "version": 3,
        },
        "references": refs,
        "typeMigrationVersion": "10.2.0",
    }

    objects = [
        data_view(DV_BILLING, "metrics-azure.billing-*",
                  "Azure billing (FinOps)"),
        data_view(DV_OPENAI, "metrics-azure_openai.metrics-*",
                  "Azure OpenAI metrics (FinOps)"),
        dashboard,
    ]

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                            "azure-ai-finops-dashboard.ndjson")
    with open(out_path, "w") as fh:
        for obj in objects:
            fh.write(json.dumps(obj, separators=(",", ":")) + "\n")
        fh.write(json.dumps({
            "excludedObjects": [],
            "excludedObjectsCount": 0,
            "exportedCount": len(objects),
            "missingRefCount": 0,
            "missingReferences": [],
        }, separators=(",", ":")) + "\n")

    print("wrote %s (%d objects, %d panels)"
          % (out_path, len(objects), len(panels)))


if __name__ == "__main__":
    build()
