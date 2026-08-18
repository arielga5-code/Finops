#!/usr/bin/env python3
"""
Rewrite the deck's typography into the punctuation a person types.

The generated slides used em dashes, middots, arrows and multiplication signs.
They are correct typography and they are also a tell, so this pass replaces
every one of them with plain equivalents: commas, colons, full stops, slashes,
hyphens, "to" and "x".

An em dash is not one thing, so it does not get one rule. `PHRASES` holds a
curated replacement for every dash on a slide — the choice between a comma, a
colon and a full stop is a judgement about that sentence, and a blanket rule
would leave comma splices behind. `CHARS` then sweeps the mechanical cases and
anything the curated list did not reach, including the speaker notes.

Runs over both .pptx files and the .js content that generates them, so a
rebuild does not undo the pass:

    python3 tools/plain-text.py Harel_Cloud_Cost_CIO_Final_fixed.pptx
    python3 tools/plain-text.py content*.js data/*.js

Reports any phrase it could not find, so a stale entry here shows up as a
warning instead of silently doing nothing.
"""

import re
import shutil
import sys
import zipfile
from pathlib import Path

# Curated first: each entry is a fragment short enough to survive the string
# concatenation in the content files, centred on the punctuation it fixes.
PHRASES = [
    # A platform name, an "empty" cell and a legend, all carrying a dash.
    # The card label is uppercased at render, so the slide carries a second
    # spelling of this name that the source never shows.
    ("AWS Bedrock — Claude", "AWS Bedrock (Claude)"),
    ("AWS BEDROCK — CLAUDE", "AWS BEDROCK (CLAUDE)"),
    # Harel brands this internally as Cowork, so that is the only name it
    # carries. The parenthesised form has to go first or it leaves "(Cowork)"
    # dangling behind the rename.
    ("Copilot Studio (Cowork)", "Cowork"),
    ("Copilot Studio", "Cowork"),

    # Titles and headings.
    ("Where the $16,100.27 sits — July Bedrock", "Where the $16,100.27 sits: July Bedrock"),
    ("at a discount — AWS buys 93%", "at a discount, AWS 93%"),
    ("Cost centre — ", "Cost centre: "),
    ("Default model — routine coding", "Default model: routine coding"),

    # Notes under a title.
    ("May–Jul invoiced — the only window", "May-Jul invoiced, the only window"),
    ("far more than models — API Management", "far more than models. API Management"),
    ("needs no new platform — only a policy", "needs no new platform, only a policy"),

    # Stat tile notes and table cells.
    ("API Management — ahead of the models", "API Management, ahead of the models"),
    ("May–Jul — this part still bills", "May-Jul, this part still bills"),
    ("RI renewal — blob storage", "RI renewal, blob storage"),
    ("support 1.33 — preprod", "support 1.33, preprod"),
    ("App Service — reserved instance", "App Service, reserved instance"),
    ("North Europe — $5,871/mo removed", "North Europe, $5,871/mo removed"),

    # Footnotes.
    ("taking it over is not — and today", "taking it over is not, and today"),
    ("alone is $17,311 — 27.2% of the tag", "alone is $17,311, or 27.2% of the tag"),
    ("total just $4,279 — the tag is what", "total just $4,279. The tag is what"),
    ("flat against each other — the first month", "flat against each other, the first month"),
    ("not automatically wrong — models need somewhere to run — but it is",
     "not automatically wrong, since models need somewhere to run, but it is"),
    ("month to month — Opus 5 appears in July — which is exactly",
     "month to month, with Opus 5 appearing in July, which is exactly"),
    ("growth this year is AI — which makes it", "growth this year is AI, which makes it"),
    ("makes the trend unreadable — it belongs", "makes the trend unreadable. It belongs"),
    ("endpoint is blocked — all traffic", "endpoint is blocked. All traffic"),
    ("cannot obtain a key — so it never reaches", "cannot obtain a key, so it never reaches"),
    ("month to month — Opus 4.8 ran and stopped", "month to month: Opus 4.8 ran and stopped"),
    ("savings plan — right-sizing", "savings plan: right-sizing"),
    ("for chargeback — plus per-request metadata", "for chargeback, plus per-request metadata"),
    ("entirely virtual machines — the flattest", "entirely virtual machines, the flattest"),
    ("per consumer — which is why", "per consumer, which is why"),
    ("zero from May — that is the reserved", "zero from May. That is the reserved"),
    ("in the estate — and the best candidate", "in the estate, and the best candidate"),
    ("and barely vary — a flat, reservable", "and barely vary, a flat and reservable"),

    # Separators that carry a sentence rather than a label.
    ("July 2026 · CIO briefing", "July 2026, CIO briefing"),
    ("run-rate today  ·  July consumption", "run-rate today. July consumption"),
    ("since January  ·  +21.1%", "since January, +21.1%"),
    ("Opus 4.7 · Opus 5 · Sonnet 4.6 · Haiku 4.5 · Sonnet 4.5",
     "Opus 4.7, Opus 5, Sonnet 4.6, Haiku 4.5, Sonnet 4.5"),
]

# Mechanical sweeps, applied after the curated list.
#
# Every pattern matches spaces and tabs explicitly rather than \s. These rules
# also run over the .js sources, where a dash routinely sits at the end of a
# line inside a comment — \s would swallow the newline and the comment marker
# with it, splicing two lines of source into one.
CHARS = [
    (r"[ \t]*→[ \t]*", " to "),    # Jan→Jul, $97 → $8,920
    (r"[ \t]+·[ \t]+", " / "),     # AZURE · AIFACTORY
    (r"·", "/"),
    (r"–", "-"),                   # Jan–Jul, 8–24 h
    (r"×", "x"),                   # × 12, 2.6×
    (r"−", "-"),                   # true minus
    (r"…", "..."),
    (r"≈[ \t]*", "about "),
    (r"[ \t]+—[ \t]+", ", "),      # anything the curated list did not reach
    (r"—", "-"),                   # a bare dash used as an empty cell
]

# A dash that was already deleted by hand leaves a gap where the punctuation
# should be: "$29,927 a month  billed AI accounts for...". Close it with the
# comma the sentence needs.
#
# Only ever applied to slide text. Speaker notes and the .js sources both
# contain space-aligned tables ("  Jan  8,640    Feb 10,593") that this would
# turn into nonsense.
GAP = re.compile(r"(?<=[^\s.;:])[ \t]{2,}(?=\S)")

TEXT_NODES = re.compile(r"(<a:t>|<c:v>)(.*?)(</a:t>|</c:v>)", re.S)
PART = re.compile(r"ppt/(slides/slide|notesSlides/notesSlide|charts/chart)\d+\.xml$")
SLIDE = re.compile(r"ppt/slides/slide\d+\.xml$")


def rewrite(text: str, hits: dict, close_gaps: bool = False) -> str:
    for before, after in PHRASES:
        if before in text:
            hits[before] = hits.get(before, 0) + text.count(before)
            text = text.replace(before, after)
    for pattern, repl in CHARS:
        text = re.sub(pattern, repl, text)
    if close_gaps:
        text = GAP.sub(", ", text)
    return text


def do_pptx(path: Path, hits: dict) -> int:
    src = zipfile.ZipFile(path)
    changed = 0
    out: dict[str, bytes] = {}
    for name in src.namelist():
        if not PART.fullmatch(name):
            continue
        xml = src.read(name).decode("utf8")
        gaps = bool(SLIDE.fullmatch(name))
        new = TEXT_NODES.sub(
            lambda m: m.group(1) + rewrite(m.group(2), hits, gaps) + m.group(3), xml)
        if new != xml:
            out[name] = new.encode("utf8")
            changed += 1

    tmp = path.with_suffix(".tmp.pptx")
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as z:
        for item in src.infolist():
            z.writestr(item, out.get(item.filename) or src.read(item.filename))
    src.close()
    shutil.move(tmp, path)
    return changed


def do_text(path: Path, hits: dict) -> int:
    old = path.read_text(encoding="utf8")
    new = rewrite(old, hits)
    if new == old:
        return 0
    path.write_text(new, encoding="utf8")
    return 1


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit("usage: plain-text.py FILE...")
    hits: dict = {}
    for arg in sys.argv[1:]:
        p = Path(arg)
        n = do_pptx(p, hits) if p.suffix == ".pptx" else do_text(p, hits)
        print(f"  {p.name}: {n} part(s) rewritten" if n else f"  {p.name}: unchanged")

    missed = [b for b, _ in PHRASES if b not in hits]
    if missed:
        print("\n  phrases not found in these files:")
        for b in missed:
            print(f"    {b!r}")


if __name__ == "__main__":
    main()
