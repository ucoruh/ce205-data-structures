"""Converts a Marp Markdown deck into an editable, small PPTX (python-pptx).

Marp's own PPTX export embeds every slide as a picture (large and not editable). This module writes
headings, lists, tables, code, quotes and speaker notes with PowerPoint's native shapes instead.
Slide classes recognised in the Markdown (kept identical to the course's Marp theme so existing decks
do not need to change): baslik (title), bolum (section break), yogun (dense), sema (diagram-heavy).

Data-structure animations: a slide may embed an operation animation as
    <iframe class="dsanim" src="anim/NAME.html?yer=slayt&lang=xx" ...></iframe>
PowerPoint cannot run that HTML player, so the matching animated GIF (anim/NAME.<lang>.gif, produced by
tools/dsanim) is embedded instead, sized to fill the space the iframe would have used. The animation name
is always derived from the iframe's src attribute -- nothing here hard-codes a list of animation names.
"""
import math
import os
import pathlib
import re

from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Inches, Pt

# ---------------------------------------------------------------- palette (CEN207 green theme)
GREEN = RGBColor(0x2E, 0x7D, 0x32)
INK = RGBColor(0x1F, 0x2D, 0x3A)
GREY = RGBColor(0x5B, 0x67, 0x70)
SOFT = RGBColor(0xEA, 0xF6, 0xEC)
CODE_BG = RGBColor(0xF3, 0xF4, 0xF6)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

SLIDE_W, SLIDE_H = Inches(13.333), Inches(7.5)
LEFT, RIGHT = Inches(0.7), Inches(0.7)
BODY_TOP, BODY_BOTTOM = Inches(1.45), Inches(6.85)
BODY_W = SLIDE_W - LEFT - RIGHT

SOURCE_DIR = None      # set by convert(): folder holding the source .md (slides/week-N)
CURRENT_LANG = 'en'    # set by convert(): language of the deck being rendered, used for anim GIFs

_ANIM_IFRAME = re.compile(r'^<iframe\s+class="dsanim"\s+[^>]*\bsrc="([^"?]+?)(?:\?[^"]*)?"[^>]*>\s*</iframe>$')


# ------------------------------------------------------------------ parsing
def parse_front_matter(md):
    m = re.match(r'\A---\n(.*?)\n---\n', md, flags=re.S)
    if not m:
        return {}, md
    info = {}
    for line in m.group(1).split('\n'):
        k = re.match(r'^(\w+):\s*"?(.*?)"?\s*$', line)
        if k:
            info[k.group(1)] = k.group(2)
    return info, md[m.end():]


def split_slides(md):
    """Splits the deck body on '---' separators (ignored while inside a fenced code block)."""
    slides, current, in_code = [], [], False
    for line in md.split('\n'):
        if line.startswith('```'):
            in_code = not in_code
        if line.strip() == '---' and not in_code:
            slides.append('\n'.join(current))
            current = []
        else:
            current.append(line)
    slides.append('\n'.join(current))
    return [s for s in slides if s.strip()]


def anim_gif_relpath(src, lang):
    """'anim/hanoi.html' + 'tr' -> 'anim/hanoi.tr.gif' (name always derived from the iframe src)."""
    p = pathlib.PurePosixPath(src)
    return str(p.parent / f'{p.stem}.{lang}.gif')


def parse_slide(text):
    """Returns (slide_class, blocks, speaker_notes) for one slide's raw Markdown."""
    slide_class, notes = '', []
    for comment in re.findall(r'<!--(.*?)-->', text, flags=re.S):
        c = comment.strip()
        m = re.match(r'_class:\s*(\w+)', c)
        if m:
            slide_class = m.group(1)
        elif not re.match(r'_?\w+:', c):
            notes.append(re.sub(r'^Speaker note:\s*', '', c))
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    blocks, lines, i = [], text.split('\n'), 0
    while i < len(lines):
        s = lines[i]
        if not s.strip():
            i += 1
            continue
        anim = _ANIM_IFRAME.match(s.strip())
        if anim:
            blocks.append(('anim', anim.group(1)))
            i += 1
            continue
        if s.startswith('```'):
            lang, code, i = s[3:].strip(), [], i + 1
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i])
                i += 1
            blocks.append(('code', lang, code))
            i += 1
            continue
        m = re.match(r'^(#{1,3})\s+(.*)', s)
        if m:
            blocks.append((f'h{len(m.group(1))}', m.group(2)))
            i += 1
            continue
        if s.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                cells = [c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r':?-{2,}:?', c) for c in cells if c):
                    rows.append(cells)
                i += 1
            blocks.append(('table', rows))
            continue
        if s.lstrip().startswith('>'):
            quote = []
            while i < len(lines) and lines[i].lstrip().startswith('>'):
                quote.append(lines[i].lstrip()[1:].strip())
                i += 1
            blocks.append(('quote', ' '.join(q for q in quote if q)))
            continue
        if re.match(r'^\s*([-*]|\d+\.)\s+', s):
            items = []
            while i < len(lines) and (re.match(r'^\s*([-*]|\d+\.)\s+', lines[i]) or
                                       (lines[i].startswith('   ') and lines[i].strip() and items)):
                m = re.match(r'^(\s*)([-*]|\d+\.)\s+(.*)', lines[i])
                if m:
                    items.append([len(m.group(1)) // 2, m.group(2)[0].isdigit(), m.group(3)])
                else:
                    items[-1][2] += ' ' + lines[i].strip()
                i += 1
            blocks.append(('list', items))
            continue
        mg = re.match(r'^!\[([^\]]*)\]\(([^)]+)\)\s*$', s.strip())
        if mg:
            blocks.append(('image', mg.group(1), mg.group(2)))
            i += 1
            continue
        para = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(```|#|\||>|!\[|<iframe|\s*([-*]|\d+\.)\s)', lines[i]):
            para.append(lines[i].strip())
            i += 1
        blocks.append(('p', ' '.join(para)))
    return slide_class, blocks, '\n\n'.join(notes)


# ------------------------------------------------------------------ text runs
INLINE = re.compile(r'(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*|\[[^\]]+\]\([^)]+\))')


def clean_text(text):
    return text.replace('\\+', '+').replace('\\', '')


def write_runs(paragraph, text, size, color=INK, bold=False):
    for part in INLINE.split(clean_text(text)):
        if not part:
            continue
        run = paragraph.add_run()
        run.font.size = Pt(size)
        run.font.color.rgb = color
        run.font.bold = bold
        if part.startswith('**') and part.endswith('**'):
            run.text, run.font.bold = part[2:-2], True
        elif part.startswith('`') and part.endswith('`'):
            run.text = part[1:-1]
            run.font.name = 'Consolas'
            run.font.color.rgb = RGBColor(0xA1, 0x12, 0x3F) if color == INK else color
        elif part.startswith('*') and part.endswith('*') and len(part) > 2:
            run.text, run.font.italic = part[1:-1], True
        elif part.startswith('['):
            run.text = re.match(r'\[([^\]]+)\]', part).group(1)
        else:
            run.text = part


# ------------------------------------------------------------------ media (images and animation GIFs)
def resolve_image_path(rel_path):
    """Resolves a Markdown-relative image path to a real file. PPTX cannot embed SVG, so a PNG sibling
    is preferred. The deck source lives under slides/week-N while images live under docs/week-N/assets,
    so both locations are tried."""
    if SOURCE_DIR is None:
        return None
    root = pathlib.Path(SOURCE_DIR)
    candidates = [root / rel_path, root.parent.parent / 'docs' / root.name / rel_path]
    for c in candidates:
        png = c.with_suffix('.png')
        if png.exists():
            return png
        if c.exists() and c.suffix.lower() != '.svg':
            return c
    return None


def resolve_anim_gif(src, lang):
    """Resolves an animation iframe's src ('anim/NAME.html') to anim/NAME.<lang>.gif, wherever it lives
    (slides/week-N/anim or, more commonly, docs/week-N/anim next to the lecture note)."""
    if SOURCE_DIR is None:
        return None
    root = pathlib.Path(SOURCE_DIR)
    rel = anim_gif_relpath(src, lang)
    for c in (root / rel, root.parent.parent / 'docs' / root.name / rel):
        if c.exists():
            return c
    return None


def media_path(block):
    if block[0] == 'anim':
        return resolve_anim_gif(block[1], CURRENT_LANG)
    return resolve_image_path(block[2])


def media_size(block, width_in):
    """(width_in, height_in) preserving the source's aspect ratio, fit to the available width."""
    p = media_path(block)
    if not p:
        return 0.0, 0.0
    with Image.open(p) as im:
        gw, gh = im.size
    ratio = gh / float(gw)
    return width_in, width_in * ratio


def write_media(slide, block, top, remaining_in):
    w, h = media_size(block, BODY_W / 914400)
    if w <= 0:
        return 0.0
    if remaining_in and h > remaining_in:
        scale = remaining_in / h
        w, h = w * scale, remaining_in
    p = media_path(block)
    left = LEFT + int((BODY_W - Inches(w)) / 2)
    slide.shapes.add_picture(str(p), left, top, width=Inches(w), height=Inches(h))
    return h


def add_textbox(slide, left, top, width, height):
    box = slide.shapes.add_textbox(left, top, width, height)
    tf = box.text_frame
    tf.word_wrap = True
    for margin in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'):
        setattr(tf, margin, Inches(0.05))
    return box, tf


# ------------------------------------------------------------------ height estimation
def line_count(text, size, width_in, factor=1.0):
    chars = max(len(re.sub(r'[*`]', '', clean_text(text))), 1)
    char_w = size * 0.52 / 72 * factor          # average character width (inches)
    return max(1, math.ceil(chars * char_w / width_in))


def block_height(block, size, width_in):
    kind = block[0]
    line_h = size * 1.3 / 72
    if kind == 'p':
        return line_count(block[1], size, width_in) * line_h + 0.12
    if kind == 'quote':
        return line_count(block[1], size, width_in - 0.4) * line_h + 0.3
    if kind == 'list':
        return sum(line_count(o[2], size, width_in - 0.4 - 0.35 * o[0]) * line_h + 0.05 for o in block[1]) + 0.1
    if kind == 'code':
        code_size = max(size * 0.62, 10)
        return len(block[2]) * code_size * 1.2 / 72 + 0.3
    if kind == 'table':
        ts = max(size * 0.72, 10)
        cols = max(len(r) for r in block[1])
        total = 0
        for r in block[1]:
            longest = max(line_count(h, ts, width_in / cols) for h in r) if r else 1
            total += longest * ts * 1.3 / 72 + 0.12
        return total + 0.15
    if kind in ('image', 'anim'):
        return media_size(block, width_in)[1]
    if kind in ('h2', 'h3'):
        return size * 1.5 / 72 + 0.1
    return 0.3


# ------------------------------------------------------------------ block writers
def write_list(slide, block, top, size):
    height = block_height(block, size, BODY_W / 914400)
    _, tf = add_textbox(slide, LEFT, top, BODY_W, Inches(height))
    counters = {}
    for j, (depth, ordered, text) in enumerate(block[1]):
        p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
        p.level = min(depth, 4)
        p.space_after = Pt(3)
        if ordered:
            counters[depth] = counters.get(depth, 0) + 1
            bullet = f'{counters[depth]}. '
        else:
            bullet = '• ' if depth == 0 else '– '
        run = p.add_run()
        run.text = '    ' * depth + bullet
        run.font.size, run.font.color.rgb, run.font.bold = Pt(size), GREEN, True
        write_runs(p, text, size)
    return height


def write_table(slide, block, top, size):
    rows = block[1]
    cols = max(len(r) for r in rows)
    rows = [r + [''] * (cols - len(r)) for r in rows]
    ts = max(size * 0.72, 10)
    height = block_height(block, size, BODY_W / 914400)
    widths = [max(len(clean_text(r[c])) for r in rows) + 4 for c in range(cols)]
    total_w = sum(widths)
    table_w = BODY_W if total_w > 60 else int(BODY_W * max(0.55, total_w / 60))
    shape = slide.shapes.add_table(len(rows), cols, LEFT, top, table_w, Inches(height))
    table = shape.table
    for c in range(cols):
        table.columns[c].width = int(table_w * widths[c] / total_w)
    for r, row in enumerate(rows):
        for c, cell_text in enumerate(row):
            cell = table.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.06)
            cell.margin_top = cell.margin_bottom = Inches(0.03)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            tf = cell.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            if r == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = GREEN
                write_runs(p, cell_text, ts, WHITE, bold=True)
            else:
                cell.fill.solid()
                cell.fill.fore_color.rgb = SOFT if r % 2 == 0 else WHITE
                write_runs(p, cell_text, ts)
    return height


def write_code(slide, block, top, size):
    code_size = max(size * 0.62, 10)
    height = block_height(block, size, BODY_W / 914400)
    box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, LEFT, top, BODY_W, Inches(height))
    box.fill.solid()
    box.fill.fore_color.rgb = CODE_BG
    box.line.color.rgb = RGBColor(0xD9, 0xDE, 0xE3)
    tf = box.text_frame
    tf.word_wrap = False
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_right = Inches(0.15)
    tf.margin_top = tf.margin_bottom = Inches(0.1)
    for j, line in enumerate(block[2] or ['']):
        p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        run.text = line if line else ' '
        run.font.name = 'Consolas'
        run.font.size = Pt(code_size)
        run.font.color.rgb = INK
    return height


def write_paragraph(slide, text, top, size, color=INK, align=PP_ALIGN.LEFT, quote=False):
    height = block_height(('quote' if quote else 'p', text), size, BODY_W / 914400)
    if quote:
        box = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, LEFT, top, BODY_W, Inches(height))
        box.fill.solid()
        box.fill.fore_color.rgb = SOFT
        box.line.color.rgb = GREEN
        tf = box.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.2)
    else:
        _, tf = add_textbox(slide, LEFT, top, BODY_W, Inches(height))
    p = tf.paragraphs[0]
    p.alignment = align
    write_runs(p, text, size, color)
    return height


# ------------------------------------------------------------------ slide frame (header/footer/page no.)
def draw_frame(slide, info, number, logo, dark=False):
    color = RGBColor(0xD8, 0xF0, 0xF2) if dark else GREY
    if logo and not dark:
        slide.shapes.add_picture(logo, LEFT, Inches(0.18), height=Inches(0.36))
    _, tf = add_textbox(slide, LEFT + Inches(0.45), Inches(0.2), Inches(8), Inches(0.35))
    write_runs(tf.paragraphs[0], info.get('header', ''), 11, color)
    _, tf = add_textbox(slide, LEFT, SLIDE_H - Inches(0.45), Inches(8), Inches(0.3))
    write_runs(tf.paragraphs[0], info.get('footer', ''), 10, color)
    if number:
        _, tf = add_textbox(slide, SLIDE_W - RIGHT - Inches(1), SLIDE_H - Inches(0.45), Inches(1), Inches(0.3))
        tf.paragraphs[0].alignment = PP_ALIGN.RIGHT
        write_runs(tf.paragraphs[0], str(number), 10, color)


def convert(md_path, pptx_path, logo=None, lang='en'):
    """Converts one Marp Markdown deck (md_path) to pptx_path. `lang` selects which language's
    animation GIF (anim/NAME.<lang>.gif) is embedded for any <iframe class="dsanim"> slide."""
    global SOURCE_DIR, CURRENT_LANG
    SOURCE_DIR = os.path.dirname(os.path.abspath(md_path))
    CURRENT_LANG = lang
    md = open(md_path, encoding='utf-8').read()
    info, body = parse_front_matter(md)
    deck = Presentation()
    deck.slide_width, deck.slide_height = SLIDE_W, SLIDE_H
    blank = deck.slide_layouts[6]
    number = 0
    for number, raw in enumerate(split_slides(body), start=1):
        slide_class, blocks, notes = parse_slide(raw)
        slide = deck.slides.add_slide(blank)
        dark = slide_class == 'bolum'
        if dark:
            bg = slide.background.fill
            bg.solid()
            bg.fore_color.rgb = GREEN
        draw_frame(slide, info, None if number == 1 else number, logo, dark)

        if slide_class in ('baslik', 'bolum'):
            title = next((b[1] for b in blocks if b[0] == 'h1'), '')
            rest = [b for b in blocks if b[0] != 'h1']
            top = Inches(2.4) if rest else Inches(3.0)
            _, tf = add_textbox(slide, LEFT, top, BODY_W, Inches(1.4))
            tf.paragraphs[0].alignment = PP_ALIGN.CENTER if slide_class == 'baslik' else PP_ALIGN.LEFT
            write_runs(tf.paragraphs[0], title, 40, WHITE if dark else GREEN, bold=True)
            top += Inches(1.5)
            for b in rest:
                if b[0] == 'p':
                    top += Inches(write_paragraph(slide, b[1], top, 20, WHITE if dark else INK,
                                                   PP_ALIGN.CENTER if slide_class == 'baslik' else PP_ALIGN.LEFT) + 0.05)
        else:
            title = next((b[1] for b in blocks if b[0] == 'h1'), '')
            if title:
                _, tf = add_textbox(slide, LEFT, Inches(0.6), BODY_W, Inches(0.8))
                tf.vertical_anchor = MSO_ANCHOR.MIDDLE
                write_runs(tf.paragraphs[0], title, 30 if slide_class != 'yogun' else 26, GREEN, bold=True)
            body_blocks = [b for b in blocks if b[0] != 'h1']
            size = 18 if slide_class == 'yogun' else 20
            area = (BODY_BOTTOM - BODY_TOP) / 914400
            # Media blocks (images and animation GIFs) share whatever area is LEFT after the text blocks,
            # same rule as the HTML theme: a tall drawing never pushes the bullets off the slide.
            media_count = sum(1 for b in body_blocks if b[0] in ('image', 'anim'))
            text_blocks = [b for b in body_blocks if b[0] not in ('image', 'anim')]
            while size > 11:
                total = sum(block_height(b, size, BODY_W / 914400) + 0.12 for b in text_blocks)
                total += media_count * (1.5 + 0.12)
                if total <= area:
                    break
                size -= 1
            text_total = sum(block_height(b, size, BODY_W / 914400) + 0.12 for b in text_blocks)
            media_area = (area - text_total - 0.12 * media_count) / media_count if media_count else 0
            top = BODY_TOP
            for b in body_blocks:
                if b[0] == 'list':
                    h = write_list(slide, b, top, size)
                elif b[0] == 'table':
                    h = write_table(slide, b, top, size)
                elif b[0] == 'code':
                    h = write_code(slide, b, top, size)
                elif b[0] == 'quote':
                    h = write_paragraph(slide, b[1], top, size, quote=True)
                elif b[0] in ('image', 'anim'):
                    h = write_media(slide, b, top, max(0.8, min(media_area, (BODY_BOTTOM - top) / 914400)))
                elif b[0] in ('h2', 'h3'):
                    h = write_paragraph(slide, f'**{b[1]}**', top, size + 2, GREEN)
                else:
                    h = write_paragraph(slide, b[1], top, size)
                top += Inches(h + 0.12)
        if notes:
            slide.notes_slide.notes_text_frame.text = notes
    deck.core_properties.title = info.get('title', '')
    deck.core_properties.author = info.get('author', '')
    deck.save(pptx_path)
    return number
