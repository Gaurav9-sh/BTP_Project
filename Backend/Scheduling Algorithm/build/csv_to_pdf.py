#!/usr/bin/env python3
"""
Usage: python csv_to_pdf.py schedule.csv out.pdf
Input CSV must have header: Course,Slot,Room
Slot format examples: Mon-A, MON-A, Fri-C, Friday-B, FRI-A, or "Mon-A (08:00-09:00)".
Script normalizes day to Mon/Tue/Wed/Thu/Fri and slot label to single letter A..E.
"""

import sys
import re
import pandas as pd
from jinja2 import Template
from weasyprint import HTML

DAYS = ["Mon","Tue","Wed","Thu","Fri"]   # order pages
SLOT_ORDER = ["A","B","C","D","E"]      # columns per day, will detect if subset present

def normalize_slot(s):
    if pd.isna(s): return None
    s = str(s).strip()
    # extract day (3 letters) and slot letter
    # Accept formats like "Monday-A", "Mon-A", "MON A", "Fri - C", "FRI-A (08:00-09:00)"
    s2 = re.sub(r'[\(\)].*','', s)         # remove parentheses contents
    s2 = s2.replace('_',' ').replace('.', ' ')
    parts = re.split(r'[\s\-:]+', s2)
    # find day token
    day = None
    slot = None
    for token in parts:
        tok = token.strip()
        if not tok: continue
        t = tok[:3].capitalize()
        if t in [d[:3] for d in DAYS]:
            day = t
            continue
        # if token equals single letter slot A..E
        if len(tok) == 1 and tok.upper() in SLOT_ORDER:
            slot = tok.upper()
            continue
        # sometimes combined like Mon-A => token 'Mon-A' split yields 'Mon','A' handled above
        # fallback: search for letter anywhere
        m = re.search(r'\b([A-Ea-e])\b', tok)
        if m and not slot:
            slot = m.group(1).upper()
    # if day not found, try beginning of original
    if not day:
        m = re.match(r'^(Mon|Tue|Wed|Thu|Fri|Monday|Tuesday|Wednesday|Thursday|Friday|MON|TUE|WED|THU|FRI)', s, re.I)
        if m:
            day = m.group(0)[:3].capitalize()
    return f"{day}-{slot}" if day and slot else s

def build_grid(df):
    # normalize slots and extract day, letter
    df = df.copy()
    df['SlotRaw'] = df['Slot'].astype(str)
    df['SlotNorm'] = df['SlotRaw'].apply(normalize_slot)
    # split into Day and Col
    def split_norm(x):
        if isinstance(x, str) and '-' in x:
            D,L = x.split('-',1)
            return D[:3].capitalize(), L[:1].upper()
        return None, None
    df['Day'], df['Col'] = zip(*df['SlotNorm'].map(split_norm))
    # sanitize rooms
    df['Room'] = df['Room'].astype(str).str.strip()
    return df

HTML_TMPL = """
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<style>
@page { size: A4 landscape; margin: 8mm; }
body { font-family: Arial, sans-serif; font-size: 9px; margin: 4mm; }
h1 { font-size: 14px; margin: 6px 0 8px 0; text-align:center;}
.table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.table td, .table th { border: 1px solid #111; padding:6px; vertical-align: top; overflow: hidden; word-wrap: break-word; }
.table th { text-align:center; font-weight: bold; background: #f2f2f2; }
.col-A { background: #fff27b; }   /* yellow */
.col-B { background: #37b7f0; }   /* blue */
.col-C { background: #9ad08b; }   /* green */
.col-D { background: #f6b733; }   /* orange */
.col-E { background: #1fa65a; }   /* dark green */
.room-cell { width: 12%; min-width:60px; max-width:160px; font-weight: bold; }
.slot-cell { font-size: 8.5px; line-height:1; }
.page-break { page-break-after: always; }
.small { font-size: 8px; color: #333; }
</style>
</head>
<body>
{% for day in pages %}
  <h1>{{day.title}}</h1>
  <table class="table">
    <thead>
      <tr>
        <th class="room-cell">Room / Slot</th>
        {% for col in day.cols %}
          <th class="slot-header col-{{col}}">{{col}}<div class="small">({{day.slot_labels[col]}})</div></th>
        {% endfor %}
      </tr>
    </thead>
    <tbody>
      {% for room in day.rooms %}
        <tr>
          <td class="room-cell">{{room}}</td>
          {% for col in day.cols %}
            <td class="slot-cell col-{{col}}">
              {% set items = day.grid.get(room, {}).get(col, []) %}
              {% if items %}
                {% for it in items %}
                  <div>{{it}}</div>
                {% endfor %}
              {% else %}
                &nbsp;
              {% endif %}
            </td>
          {% endfor %}
        </tr>
      {% endfor %}
    </tbody>
  </table>
  <div class="page-break"></div>
{% endfor %}
</body>
</html>
"""

def make_pages(df):
    pages = []
    # detect available slot letters per day and preserve order A..E
    for D in DAYS:
        sub = df[df['Day'] == D[:3]]
        if sub.empty: continue
        cols_present = sorted(sub['Col'].dropna().unique(), key=lambda c: SLOT_ORDER.index(c) if c in SLOT_ORDER else 99)
        if not cols_present:
            cols_present = SLOT_ORDER.copy()
        # gather rooms sorted
        rooms = sorted(sub['Room'].unique())
        # build grid: dict room -> col -> [courses]
        grid = {}
        slot_labels = {}  # preserve original Slot strings for header if multiple variants
        for _, row in sub.iterrows():
            room = row['Room']
            col = row['Col'] or 'A'
            slot_labels[col] = row['SlotRaw']  # last seen; ok for simple label
            grid.setdefault(room, {}).setdefault(col, []).append(row['Course'])
        pages.append({
            'title': D,
            'cols': cols_present,
            'rooms': rooms,
            'grid': grid,
            'slot_labels': slot_labels
        })
    return pages

def render_pdf(pages, outpath):
    tpl = Template(HTML_TMPL)
    html = tpl.render(pages=pages)
    HTML(string=html).write_pdf(outpath)
    print("Wrote:", outpath)

def main():
    if len(sys.argv) < 3:
        print("Usage: csv_to_pdf.py input.csv output.pdf")
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2]
    df = pd.read_csv(inp, dtype=str).fillna('')
    required = {'Course','Slot','Room'}
    if not required.issubset(set(df.columns)):
        print("CSV must contain header columns: Course,Slot,Room")
        sys.exit(1)
    df = build_grid(df)
    pages = make_pages(df)
    if not pages:
        print("No pages (no Mon-Fri day slots found). Check Slot values in CSV.")
        sys.exit(1)
    render_pdf(pages, out)

if __name__ == "__main__":
    main()
