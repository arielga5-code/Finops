#!/usr/bin/env python3
"""
Dump every sheet of an .xlsx to JSON, without openpyxl.

An .xlsx is a zip of XML. Cell values are either inline, or (for text) an index
into a shared string table, so both paths have to be handled. Dates arrive as
serial numbers under a date number format, and are converted back so a column
of dates does not read as five-digit integers.

    python3 tools/xlsx-dump.py book.xlsx            # human-readable survey
    python3 tools/xlsx-dump.py book.xlsx --json out.json
"""

import argparse
import datetime
import json
import re
import sys
import zipfile
from xml.etree import ElementTree as ET

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
}
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"

# Number-format ids Excel reserves for dates and times.
BUILTIN_DATE_FMTS = set(range(14, 23)) | set(range(45, 48))
# A format code carries colour names, conditions and literal text that are not
# date tokens: "$#,##0.00;[Red]($#,##0.00)" is money, but the "d" in [Red] will
# look like a day token unless the brackets and literals come out first.
NOISE = re.compile(r'\[[^\]]*\]|"[^"]*"|\\.|_.|\*.')
DATE_TOKENS = re.compile(r"[dmyh]", re.I)
EPOCH = datetime.datetime(1899, 12, 30)  # Excel's 1900 system, leap-year bug included


def col_index(ref):
    """'BC12' -> 54. Column letters are base-26 with no zero digit."""
    n = 0
    for ch in ref:
        if not ch.isalpha():
            break
        n = n * 26 + (ord(ch.upper()) - 64)
    return n - 1


def shared_strings(z):
    if "xl/sharedStrings.xml" not in z.namelist():
        return []
    root = ET.fromstring(z.read("xl/sharedStrings.xml"))
    out = []
    for si in root.findall("m:si", NS):
        # A string may be split into runs by formatting; join them back.
        out.append("".join(t.text or "" for t in si.iter(f"{{{NS['m']}}}t")))
    return out


def date_styles(z):
    """Which cell-style indices point at a date-ish number format."""
    if "xl/styles.xml" not in z.namelist():
        return set()
    root = ET.fromstring(z.read("xl/styles.xml"))
    custom = {}
    for nf in root.iter(f"{{{NS['m']}}}numFmt"):
        custom[int(nf.get("numFmtId"))] = nf.get("formatCode", "")
    styles = set()
    cellXfs = root.find("m:cellXfs", NS)
    if cellXfs is None:
        return styles
    for i, xf in enumerate(cellXfs.findall("m:xf", NS)):
        fmt = int(xf.get("numFmtId", 0))
        if fmt in BUILTIN_DATE_FMTS or (
            fmt in custom and DATE_TOKENS.search(NOISE.sub("", custom[fmt]))
        ):
            styles.add(i)
    return styles


def sheet_names(z):
    """Sheet name -> part path, in workbook order."""
    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    target = {
        r.get("Id"): r.get("Target") for r in rels.findall(f"{{{REL_NS}}}Relationship")
    }
    out = []
    for s in wb.iter(f"{{{NS['m']}}}sheet"):
        t = target[s.get(f"{{{NS['r']}}}id")]
        out.append((s.get("name"), "xl/" + t.lstrip("/").replace("xl/", "", 1)))
    return out


def read_sheet(z, path, strings, dates):
    root = ET.fromstring(z.read(path))
    rows = []
    for row in root.iter(f"{{{NS['m']}}}row"):
        cells = {}
        for c in row.findall("m:c", NS):
            ref = c.get("r", "")
            t = c.get("t", "n")
            v = c.find("m:v", NS)
            if t == "inlineStr":
                is_ = c.find("m:is", NS)
                val = (
                    "".join(x.text or "" for x in is_.iter(f"{{{NS['m']}}}t"))
                    if is_ is not None
                    else None
                )
            elif v is None or v.text is None:
                val = None
            elif t == "s":
                val = strings[int(v.text)]
            elif t == "b":
                val = v.text == "1"
            elif t in ("str", "e"):
                val = v.text
            else:
                val = float(v.text)
                if val == int(val):
                    val = int(val)
                if c.get("s") and int(c.get("s")) in dates and isinstance(val, (int, float)):
                    val = (EPOCH + datetime.timedelta(days=float(val))).strftime(
                        "%Y-%m-%d"
                    )
            cells[col_index(ref)] = val
        if not cells:
            rows.append([])
            continue
        width = max(cells) + 1
        rows.append([cells.get(i) for i in range(width)])
    # Trim trailing blank rows, which Excel leaves behind freely.
    while rows and not any(x not in (None, "") for x in rows[-1]):
        rows.pop()
    return rows


def load(path):
    with zipfile.ZipFile(path) as z:
        strings = shared_strings(z)
        dates = date_styles(z)
        return {
            name: read_sheet(z, part, strings, dates)
            for name, part in sheet_names(z)
        }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("xlsx")
    ap.add_argument("--json", help="write the whole workbook here")
    ap.add_argument("--sheet", help="print only this sheet")
    ap.add_argument("--rows", type=int, default=12, help="rows to print per sheet")
    args = ap.parse_args()

    book = load(args.xlsx)
    if args.json:
        with open(args.json, "w") as f:
            json.dump(book, f, indent=1)
        print(f"wrote {args.json}")

    for name, rows in book.items():
        if args.sheet and name != args.sheet:
            continue
        print(f"\n=== {name}  ({len(rows)} rows) ===")
        for r in rows[: args.rows]:
            print(" | ".join("" if c is None else str(c) for c in r))
        if len(rows) > args.rows:
            print(f"... {len(rows) - args.rows} more rows")


if __name__ == "__main__":
    sys.exit(main())
