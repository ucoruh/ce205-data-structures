# -*- coding: utf-8 -*-
"""dsanim v2 bundler: one algorithm file → standalone player pages + GIF/PNG for slides and printed notes.

Algorithm files live in tools/dsanim/algorithms/week<N>/<id>.js and call DSAnim.define({...}) (see scene.js).
For each one this writes into docs/week-<N>/anim/:

    <id>.html, <id>.tr.html      player page (EN default, TR served as <id>.html under /tr/ by mkdocs-static-i18n)
    <id>.en.gif, <id>.tr.gif     animated GIF of the export preset (PowerPoint slides)
    <id>.en.png, <id>.tr.png     numbered key-frame strip (printed lecture note)
    <id>-son.en.png, …tr.png     last frame with its caption (PDF slides)

Usage (repo root):  py -3.12 tools/dsanim/build.py <week> [id …] [--fast]      (--fast: pages only, no GIF/PNG)
"""
import io
import json
import math
import pathlib
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
TOOL = pathlib.Path(__file__).resolve().parent
WEB = TOOL / 'web'


def page(algo_js, spec_id, title, lang):
    t = (WEB / 'template.html').read_text(encoding='utf-8')
    for key, value in (('/*CSS*/', (WEB / 'player.css').read_text(encoding='utf-8')),
                       ('/*SCENE*/', (WEB / 'scene.js').read_text(encoding='utf-8')),
                       ('/*ALGORITHM*/', algo_js),
                       ('/*PLAYER*/', (WEB / 'player.js').read_text(encoding='utf-8'))):
        t = t.replace(key, value.replace('</script', '<\\/script'))
    return t.replace('{{LANG}}', lang).replace('{{ID}}', spec_id).replace('{{TITLE}}', title)


def caption_band(img, text, width):
    from PIL import Image, ImageDraw, ImageFont
    font = None
    for f in ('segoeui.ttf', 'arial.ttf', 'DejaVuSans.ttf'):
        try:
            font = ImageFont.truetype(f, 20)
            break
        except OSError:
            pass
    font = font or ImageFont.load_default()
    plain = (text or '').replace('`', '').replace('**', '')
    draw = ImageDraw.Draw(img)
    lines, cur = [], ''
    for word in plain.split():
        trial = (cur + ' ' + word).strip()
        if draw.textlength(trial, font=font) > width - 40:
            lines.append(cur)
            cur = word
        else:
            cur = trial
    lines.append(cur)
    band = 16 + 28 * len(lines)
    out = Image.new('RGB', (img.width, img.height + band), '#ffffff')
    out.paste(img, (0, 0))
    draw = ImageDraw.Draw(out)
    draw.rectangle([0, img.height, img.width, img.height + band], fill='#f1f3f5')
    for i, s in enumerate(lines):
        draw.text((20, img.height + 10 + 28 * i), s, fill='#1f2933', font=font)
    return out


def raster(svg):
    import cairosvg
    from PIL import Image
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode('utf-8')))).convert('RGB')


def exports(algo_file, out_dir, spec_id):
    from PIL import Image, ImageDraw
    tmp = pathlib.Path(tempfile.mkdtemp(prefix='dsanim-')) / 'out.json'
    subprocess.run(['node', str(WEB / 'export.js'), str(algo_file), '', str(tmp)], check=True, cwd=str(WEB))
    data = json.loads(tmp.read_text(encoding='utf-8'))
    for lang in ('tr', 'en'):
        caps = [c.get(lang, '') if isinstance(c, dict) else str(c) for c in data['caps']]
        # last frame (PDF slides)
        last = caption_band(raster(data['key'][lang][-1]), caps[-1], 1000)
        last.save(out_dir / f'{spec_id}-son.{lang}.png', optimize=True)
        # GIF (PowerPoint)
        frames, times = [], []
        for g in data['gif'][lang]:
            frames.append(caption_band(raster(g['svg']), g['cap'], 880))
            times.append(g['ms'])
        h = max(f.height for f in frames)
        padded = []
        for f in frames:
            if f.height != h:
                p = Image.new('RGB', (f.width, h), '#f1f3f5')
                p.paste(f, (0, 0))
                f = p
            padded.append(f.convert('P', palette=Image.ADAPTIVE, colors=96))
        padded[0].save(out_dir / f'{spec_id}.{lang}.gif', save_all=True, append_images=padded[1:], duration=times,
                       loop=0, optimize=True, disposal=1)
        # numbered strip (printed notes); long animations keep at most 16 evenly spread steps
        keys = data['key'][lang]
        idx = list(range(len(keys)))
        if len(idx) > 16:
            idx = sorted({round(i * (len(keys) - 1) / 15) for i in range(16)})
        parts = []
        for i in idx:
            img = raster(keys[i].replace('width="1000"', 'width="520"', 1).replace(
                f'height="{round(1000 * data["vb"][3] / data["vb"][2])}"', f'height="{round(520 * data["vb"][3] / data["vb"][2])}"', 1))
            parts.append(caption_band(img, f'{i + 1}. {caps[i]}', img.width))
        w = max(p.width for p in parts)
        hh = max(p.height for p in parts)
        rows = math.ceil(len(parts) / 2)
        canvas = Image.new('RGB', (2 * w + 36, rows * hh + (rows + 1) * 12), '#ffffff')
        draw = ImageDraw.Draw(canvas)
        for k, p in enumerate(parts):
            x = 12 + (k % 2) * (w + 12)
            y = 12 + (k // 2) * (hh + 12)
            canvas.paste(p, (x, y))
            draw.rectangle([x - 1, y - 1, x + p.width, y + p.height], outline='#ced4da')
        canvas.save(out_dir / f'{spec_id}.{lang}.png', optimize=True)
    return data


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    fast = '--fast' in sys.argv
    week = int(args[0])
    only = set(args[1:])
    src = TOOL / 'algorithms' / f'week{week}'
    out = ROOT / 'docs' / f'week-{week}' / 'anim'
    out.mkdir(parents=True, exist_ok=True)
    for f in sorted(src.glob('*.js')):
        spec_id = f.stem
        if only and spec_id not in only:
            continue
        js = f.read_text(encoding='utf-8')
        meta = subprocess.run(['node', '-e', (
            "const D=require('./scene.js');global.DSAnim=D;require(process.argv[1]);"
            "const s=Object.values(D.registry)[0];console.log(JSON.stringify({id:s.id,title:s.title,n:s.presets.length}))"),
            str(f)], capture_output=True, text=True, encoding='utf-8', cwd=str(WEB), check=True)
        m = json.loads(meta.stdout)
        assert m['id'] == spec_id, f'{f.name}: id {m["id"]} must equal the file name'
        for lang, name in (('en', f'{spec_id}.html'), ('tr', f'{spec_id}.tr.html')):
            (out / name).write_text(page(js, spec_id, m['title']['en' if lang == 'en' else 'tr'], lang), encoding='utf-8')
        if not fast:
            d = exports(f, out, spec_id)
            print(f'{spec_id}: {m["n"]} examples, export {d["preset"]}: {len(d["caps"])} steps')
        else:
            print(f'{spec_id}: {m["n"]} examples (pages only)')


if __name__ == '__main__':
    main()
