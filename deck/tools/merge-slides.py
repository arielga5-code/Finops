#!/usr/bin/env python3
"""
Splice generated slides into a hand-assembled deck, and repair the background.

The CIO deck is assembled by hand in PowerPoint from slides this repo generates.
That works, with one trap: PowerPoint drops a slide-level background when you
paste onto a different master. Our slides carry their dark canvas as an explicit
`<p:bg>` on the slide, while the master this deck inherited from Office still
says `bg1` — which resolves to white. So every pasted slide arrives white, with
near-white text on it, and is effectively blank.

This script fixes both halves of that:

  1. Replaces named slides with freshly generated ones (`--map`).
  2. Repairs the background everywhere — it rewrites the master and layout to
     the deck's own dark canvas, so anything pasted in future inherits the right
     colour, and stamps an explicit `<p:bg>` onto every slide that lacks one, so
     each slide is right on its own terms as well.

Usage:

    python3 tools/merge-slides.py --into Final.pptx --from patch-slides.pptx \\
        --map 5=1,7=2,19=3 --out Final_fixed.pptx

`--map` is target=source, both 1-based slide numbers, target in `--into` and
source in `--from`. Run with no `--map` to do the background repair alone.

The background colour is read from `lib/theme.js` rather than hard-coded here,
so this stays in step with the deck if the palette ever moves.
"""

import argparse
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
NOTES_CT = ("application/vnd.openxmlformats-officedocument."
            "presentationml.notesSlide+xml")


def theme_background() -> str:
    """The `bg` token out of lib/theme.js — the deck's one canvas colour."""
    src = (ROOT / "lib" / "theme.js").read_text(encoding="utf8")
    m = re.search(r'\bbg:\s*"([0-9A-Fa-f]{6})"', src)
    if not m:
        sys.exit("merge-slides: could not find the `bg` token in lib/theme.js")
    return m.group(1).upper()


def bg_element(color: str) -> str:
    return (f'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>'
            f'<a:effectLst/></p:bgPr></p:bg>')


def ensure_slide_bg(xml: str, color: str) -> tuple[str, bool]:
    """Give a slide its own explicit background if it does not already have one."""
    if "<p:bg>" in xml:
        return xml, False
    out, n = re.subn(r"(<p:cSld(?:\s[^>]*)?>)",
                     lambda m: m.group(1) + bg_element(color), xml, count=1)
    if not n:
        sys.exit("merge-slides: a slide has no <p:cSld> to attach a background to")
    return out, True


def force_bg(xml: str, color: str) -> tuple[str, bool]:
    """Replace whatever background a master or layout declares with the deck's."""
    if "<p:bg>" not in xml:
        return ensure_slide_bg(xml, color)
    out = re.sub(r"<p:bg>.*?</p:bg>", bg_element(color), xml, count=1, flags=re.S)
    return out, out != xml


def rels_targets(xml: str) -> list[str]:
    return re.findall(r'Target="([^"]+)"', xml)


REL_ENTRY = re.compile(r'<Relationship\b[^>]*/>')
REL_ID = re.compile(r'Id="([^"]+)"')
REL_TYPE = re.compile(r'Type="[^"]*/(\w+)"')


def rewrite_slide_rels(src_rels: str, layout_target: str,
                       notes_target: str | None, retarget) -> str:
    """
    Take the replacement slide's own rels and point them at the target deck.

    Rebuilding this from scratch would be simpler but wrong: the slide XML
    refers to its parts by relationship id, and pptxgenjs does not hand out the
    same ids every time — a chart may be rId1 on one slide and rId3 on another.
    Keeping each entry's id and rewriting only its target preserves the link.
    """
    out = []
    for entry in REL_ENTRY.findall(src_rels):
        kind = REL_TYPE.search(entry).group(1)
        rid = REL_ID.search(entry).group(1)
        if kind == "slideLayout":
            target = layout_target
        elif kind == "notesSlide":
            if not notes_target:
                continue
            target = notes_target
        else:
            target = retarget(kind, entry)
            if target is None:
                continue
        out.append(f'<Relationship Id="{rid}" Type="{R_NS}/{kind}" '
                   f'Target="{target}"/>')
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<Relationships xmlns="{REL_NS}">'
            + "".join(out) + "</Relationships>")


def rel_target_path(entry: str) -> str:
    """The part a relationship points at, as a package path."""
    t = re.search(r'Target="([^"]+)"', entry).group(1)
    return t.lstrip("/") if t.startswith("/") else t.replace("../", "ppt/")


def notes_rels(slide_no: int) -> str:
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<Relationships xmlns="{REL_NS}">'
            f'<Relationship Id="rId1" Type="{R_NS}/notesMaster" '
            f'Target="../notesMasters/notesMaster1.xml"/>'
            f'<Relationship Id="rId2" Type="{R_NS}/slide" '
            f'Target="../slides/slide{slide_no}.xml"/>'
            "</Relationships>")


def parse_map(spec: str) -> dict[int, int]:
    out = {}
    for pair in filter(None, (p.strip() for p in spec.split(","))):
        if "=" not in pair:
            sys.exit(f"merge-slides: bad --map entry {pair!r}, want target=source")
        t, s = pair.split("=", 1)
        out[int(t)] = int(s)
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--into", required=True, help="the deck to repair")
    ap.add_argument("--from", dest="src", help="deck holding the replacement slides")
    ap.add_argument("--map", default="", help="target=source,… (1-based slide numbers)")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    mapping = parse_map(args.map)
    if mapping and not args.src:
        sys.exit("merge-slides: --map needs --from")

    color = theme_background()
    dst = zipfile.ZipFile(args.into)
    src = zipfile.ZipFile(args.src) if args.src else None
    names = dst.namelist()

    replaced: dict[str, bytes] = {}
    log: list[str] = []
    added: dict[str, bytes] = {}
    origin: dict[str, str] = {}   # imported part name -> the name it had in --from

    # Parts a replacement slide brings with it — a chart, its embedded workbook,
    # an image — land under names the target deck is not already using, so a
    # spliced chart cannot overwrite one the deck already had.
    taken = {n for n in names}
    imported = 0

    def import_part(path: str, from_zip: zipfile.ZipFile) -> str:
        """Copy one part in under a free name, following its own rels."""
        nonlocal imported
        stem, ext = path.rsplit(".", 1)
        base = re.sub(r"\d+$", "", stem)
        n = 1
        while f"{base}{n}.{ext}" in taken:
            n += 1
        new = f"{base}{n}.{ext}"
        taken.add(new)
        imported += 1

        rels_path = f"{Path(path).parent}/_rels/{Path(path).name}.rels"
        if rels_path in from_zip.namelist():
            child = from_zip.read(rels_path).decode("utf8")
            for entry in REL_ENTRY.findall(child):
                dep = rel_target_path(entry)
                if dep in from_zip.namelist():
                    moved = import_part(dep, from_zip)
                    child = child.replace(
                        re.search(r'Target="([^"]+)"', entry).group(1),
                        "../" + moved.split("/", 1)[1])
            added[f"{Path(new).parent}/_rels/{Path(new).name}.rels"] = child.encode("utf8")

        added[new] = from_zip.read(path)
        origin[new] = path
        return new

    # ---- 1. splice the replacement slides in ----
    for target, source in sorted(mapping.items()):
        s_slide = f"ppt/slides/slide{source}.xml"
        t_slide = f"ppt/slides/slide{target}.xml"
        if s_slide not in src.namelist():
            sys.exit(f"merge-slides: {args.src} has no slide {source}")
        if t_slide not in names:
            sys.exit(f"merge-slides: {args.into} has no slide {target}")

        replaced[t_slide] = src.read(s_slide)

        # Keep the target deck's own layout — it is the one its master serves.
        old_rels = dst.read(f"ppt/slides/_rels/slide{target}.xml.rels").decode("utf8")
        layout = next(t for t in rels_targets(old_rels) if "slideLayout" in t)

        s_notes = f"ppt/notesSlides/notesSlide{source}.xml"
        notes_target = None
        if s_notes in src.namelist():
            t_notes = f"ppt/notesSlides/notesSlide{target}.xml"
            replaced[t_notes] = src.read(s_notes)
            replaced[f"ppt/notesSlides/_rels/notesSlide{target}.xml.rels"] = \
                notes_rels(target).encode("utf8")
            notes_target = f"../notesSlides/notesSlide{target}.xml"

        def retarget(kind, entry, _src=src):
            dep = rel_target_path(entry)
            if dep not in _src.namelist():
                return None
            return "../" + import_part(dep, _src).split("/", 1)[1]

        src_rels = src.read(f"ppt/slides/_rels/slide{source}.xml.rels").decode("utf8")
        replaced[f"ppt/slides/_rels/slide{target}.xml.rels"] = \
            rewrite_slide_rels(src_rels, layout, notes_target, retarget).encode("utf8")
        log.append(f"slide {target} ← {Path(args.src).name} slide {source}")

    if imported:
        log.append(f"imported {imported} part(s) the replacements brought with them")

    # ---- 2. drop chart parts nothing points at any more ----
    #
    # A replaced slide's chart is usually not the replacement's chart, and an
    # orphan drags its embedded workbook along with it, so sweep both out rather
    # than leaving several hundred KB of unreachable parts in a file that gets
    # mailed around.
    live: set[str] = set()
    for n in names:
        if n.startswith("ppt/slides/_rels/"):
            xml = (replaced.get(n) or dst.read(n)).decode("utf8")
            for t in rels_targets(xml):
                live.add(t.replace("../", "ppt/"))

    dropped: set[str] = set()
    for n in names:
        if n.startswith("ppt/charts/chart") and n not in live:
            dropped.add(n)
            rel = f"ppt/charts/_rels/{Path(n).name}.rels"
            if rel in names:
                dropped.add(rel)
                for t in rels_targets(dst.read(rel).decode("utf8")):
                    dropped.add(t.replace("../", "ppt/"))
    if dropped:
        log.append(f"dropped {len(dropped)} unreferenced chart parts")

    # ---- 3. repair every background ----
    stamped = 0
    for n in names:
        if n in dropped:
            continue
        is_slide = re.fullmatch(r"ppt/slides/slide\d+\.xml", n)
        is_shell = re.fullmatch(r"ppt/(slideMasters/slideMaster|slideLayouts/slideLayout)\d+\.xml", n)
        if not (is_slide or is_shell):
            continue
        xml = (replaced.get(n) or dst.read(n)).decode("utf8")
        xml, changed = (force_bg if is_shell else ensure_slide_bg)(xml, color)
        if changed:
            replaced[n] = xml.encode("utf8")
            if is_slide:
                stamped += 1
    log.append(f"stamped a #{color} background onto {stamped} slide(s); "
               "master and layouts rewritten to match")

    # ---- 4. write it out ----
    ct = dst.read("[Content_Types].xml").decode("utf8")
    for n in dropped:
        ct = re.sub(rf'<Override PartName="/{re.escape(n)}"[^>]*/>', "", ct)
    for n in replaced:
        if n.startswith("ppt/notesSlides/notesSlide") and f'PartName="/{n}"' not in ct:
            ct = ct.replace("</Types>",
                            f'<Override PartName="/{n}" ContentType="{NOTES_CT}"/></Types>')

    # An imported part needs the content type it had in the deck it came from.
    # Parts covered by a Default extension rule (the embedded workbooks, images)
    # have no Override of their own and need none here either.
    src_ct = src.read("[Content_Types].xml").decode("utf8") if src else ""
    src_types = dict(re.findall(r'<Override PartName="/([^"]+)" ContentType="([^"]+)"/>',
                                src_ct))
    for new in added:
        if new.endswith(".rels") or f'PartName="/{new}"' in ct:
            continue
        kind = src_types.get(origin[new])
        if kind:
            ct = ct.replace("</Types>",
                            f'<Override PartName="/{new}" ContentType="{kind}"/></Types>')
        elif f'Extension="{new.rsplit(".", 1)[1]}"' not in ct:
            sys.exit(f"merge-slides: no content type for imported part {new}")
    replaced["[Content_Types].xml"] = ct.encode("utf8")

    out = Path(args.out)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for item in dst.infolist():
            if item.filename in dropped:
                continue
            z.writestr(item, replaced.get(item.filename) or dst.read(item.filename))
        for n, data in replaced.items():
            if n not in names:
                z.writestr(n, data)
        for n, data in added.items():
            z.writestr(n, data)

    slide_count = sum(1 for n in names if re.fullmatch(r"ppt/slides/slide\d+\.xml", n))
    for line in log:
        print("  " + line)
    print(f"Wrote {out} — {slide_count} slides")


if __name__ == "__main__":
    main()
