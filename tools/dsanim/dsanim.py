# -*- coding: utf-8 -*-
"""dsanim — veri yapısı operasyonlarını adım adım canlandıran kare üretici.

Bir animasyon, sahnedeki öğelerin (kutu, liste düğümü, daire, ok, işaretçi, etiket) durumlarının art arda
kaydedilmesidir. Her ``kare()`` çağrısı o anki durumu saklar. Çıktılar:

* ``<ad>.json``  : oynatıcı (dsanim.js) için kareler (SVG), açıklamalar (tr/en) ve kod satırı eşlemesi
* ``<ad>.html``  : kendi başına açılan oynatıcı sayfası (site ve sunumlarda iframe ile gömülür)
* ``<ad>.<dil>.gif`` : ara karelerle yumuşatılmış animasyon (PPTX sunumları için; açıklama altta)
* ``<ad>.<dil>.png`` : anahtar karelerin şeridi (PDF sunum ve ders notu için)

Oynatıcı kareler arasında öğeleri ``data-id`` ile eşler; konumlar yumuşak kayar, renk değişimleri CSS geçişiyle
olur, yeni öğeler belirir, silinenler solar. Python tarafı tek çizim kaynağıdır.
"""
import copy
import html
import io
import json
import math
import os
import pathlib

# ---------------------------------------------------------------- biçemler
# st: normal | vurgu | yeni | sil | soluk | aktif | bos
RENK = {
    'normal': ('#ffffff', '#37474f', '#1f2933'),
    'vurgu': ('#fff3bf', '#f08c00', '#1f2933'),
    'yeni': ('#d3f9d8', '#2f9e44', '#1f2933'),
    'sil': ('#ffe3e3', '#e03131', '#1f2933'),
    'soluk': ('#f1f3f5', '#adb5bd', '#868e96'),
    'aktif': ('#d0ebff', '#1971c2', '#1f2933'),
    'bos': ('#f8f9fa', '#ced4da', '#adb5bd'),
}
OK_RENK = {k: v[1] for k, v in RENK.items()}
OK_RENK['normal'] = '#495057'
YAZI = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
KOD_YAZI = "Consolas, 'DejaVu Sans Mono', 'Cascadia Mono', monospace"   # bitişik harf (->) olmayan yazı tipleri
PW = 26  # liste düğümünde işaretçi bölmesinin genişliği


def _e(s):
    return html.escape(str(s), quote=True)


def _f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def _y(v, dil):
    """Metin: düz dize ya da {'tr':…, 'en':…}. dil=None → oynatıcı için iki dilli tspan."""
    if not isinstance(v, dict):
        return _e(v)
    if dil:
        return _e(v.get(dil, v.get('en', '')))
    return (f'<tspan class="l-tr">{_e(v.get("tr", ""))}</tspan>'
            f'<tspan class="l-en">{_e(v.get("en", ""))}</tspan>')


class Anim:
    """Bir operasyon animasyonu. Öğeler id ile tutulur; her kare o anın kopyasıdır."""

    def __init__(self, ad, baslik_tr, baslik_en, gen=820, yuk=340, kod=None):
        self.ad = ad
        self.baslik = {'tr': baslik_tr, 'en': baslik_en}
        self.gen, self.yuk = gen, yuk
        self.kod = kod or {}          # {'c': [satırlar], 'java': [...]}
        self.og = {}                  # id -> öğe sözlüğü (ekleme sırası katman içi sıradır)
        self.kareler = []             # [{'durum':…, 'cap':{tr,en}, 'satir':{c:[..]}}]

    # ------------------------------------------------------------ öğe ekleme
    def _ekle(self, id_, tur, **p):
        p.setdefault('st', 'normal')
        p['tur'] = tur
        self.og[id_] = p
        return id_

    def kutu(self, id_, x, y, metin='', w=58, h=44, st='normal', alt=None, ust=None, boyut=18, kod=True):
        """Dikdörtgen hücre (dizi elemanı, yığın hücresi). alt/ust: küçük etiket (indis gibi)."""
        return self._ekle(id_, 'kutu', x=x, y=y, w=w, h=h, metin=metin, st=st, alt=alt, ust=ust, boyut=boyut, kod=kod)

    def dugum(self, id_, x, y, deger='', w=46, h=40, st='normal', bos=False, alt=None):
        """Bağlı liste düğümü: [ deger | • ]  (bos=True ise işaretçi bölmesinde NULL çizgisi)."""
        return self._ekle(id_, 'dugum', x=x, y=y, w=w, h=h, deger=deger, st=st, bos=bos, alt=alt)

    def daire(self, id_, cx, cy, metin='', r=22, st='normal', alt=None):
        """Ağaç/çizge düğümü."""
        return self._ekle(id_, 'daire', x=cx, y=cy, r=r, metin=metin, st=st, alt=alt)

    def etiket(self, id_, x, y, metin, st='normal', boyut=15, hiza='middle', kalin=False, kod=False):
        return self._ekle(id_, 'etiket', x=x, y=y, metin=metin, st=st, boyut=boyut, hiza=hiza, kalin=kalin, kod=kod)

    def isaretci(self, id_, hedef, metin, yon='ust', st='aktif', uzak=34):
        """Bir öğeyi gösteren adlandırılmış işaretçi (top, head, front…). Hedef kayınca onunla gider."""
        return self._ekle(id_, 'isaretci', hedef=hedef, metin=metin, yon=yon, st=st, uzak=uzak, x=0, y=0)

    def ok(self, id_, kaynak, hedef, tur='sonraki', st='normal', metin=None, bukum=0):
        """kaynak→hedef oku. tur: 'sonraki' (düğüm işaretçisinden), 'merkez' (merkezden merkeze)."""
        return self._ekle(id_, 'ok', kaynak=kaynak, hedef=hedef, oktur=tur, st=st, metin=metin, bukum=bukum,
                          x=0, y=0)

    def cerceve(self, id_, x, y, w, h, baslik=None, st='soluk'):
        """Arka plan çerçevesi (bellek bölgesi, dizi sınırı)."""
        return self._ekle(id_, 'cerceve', x=x, y=y, w=w, h=h, baslik=baslik, st=st)

    # ------------------------------------------------------------ değiştirme
    def tasi(self, id_, x=None, y=None):
        o = self.og[id_]
        if x is not None:
            o['x'] = x
        if y is not None:
            o['y'] = y

    def ayarla(self, id_, **p):
        self.og[id_].update(p)

    def sil(self, *ids):
        for i in ids:
            self.og.pop(i, None)

    def var(self, id_):
        return id_ in self.og

    def hepsi_st(self, st='normal', tur=None):
        for o in self.og.values():
            if tur is None or o['tur'] == tur:
                if o['tur'] not in ('isaretci', 'cerceve'):
                    o['st'] = st

    def kare(self, tr, en, satir=None):
        """O anki durumu kaydet. satir: {'c': 3} ya da {'c': [3, 4], 'java': 5} (1'den başlar)."""
        s = {}
        for k, v in (satir or {}).items():
            s[k] = v if isinstance(v, list) else [v]
        self.kareler.append({'durum': copy.deepcopy(self.og), 'cap': {'tr': tr, 'en': en}, 'satir': s})

    # ------------------------------------------------------------ geometri
    def _kutu_sinir(self, d, id_):
        o = d[id_]
        t = o['tur']
        if t == 'kutu' or t == 'cerceve':
            return o['x'], o['y'], o['w'], o['h']
        if t == 'dugum':
            return o['x'], o['y'], o['w'] + PW, o['h']
        if t == 'daire':
            return o['x'] - o['r'], o['y'] - o['r'], 2 * o['r'], 2 * o['r']
        if t == 'etiket':
            m = o['metin']
            m = max(m.values(), key=len) if isinstance(m, dict) else str(m)
            w = max(20, len(m) * o['boyut'] * 0.58)
            x0 = o['x'] - (w / 2 if o['hiza'] == 'middle' else (w if o['hiza'] == 'end' else 0))
            return x0, o['y'] - o['boyut'], w, o['boyut'] * 1.3
        if t == 'isaretci':
            return o['x'] - 20, o['y'] - 10, 40, 20
        return o['x'], o['y'], 0, 0

    def _merkez(self, d, id_):
        x, y, w, h = self._kutu_sinir(d, id_)
        return x + w / 2, y + h / 2

    def _kenar_nokta(self, d, id_, dx, dy):
        """id_ şeklinin merkezinden (dx,dy) yönündeki sınır noktası."""
        o = d[id_]
        cx, cy = self._merkez(d, id_)
        n = math.hypot(dx, dy) or 1
        ux, uy = dx / n, dy / n
        if o['tur'] == 'daire':
            return cx + ux * o['r'], cy + uy * o['r']
        x, y, w, h = self._kutu_sinir(d, id_)
        tx = (w / 2) / abs(ux) if ux else 1e9
        ty = (h / 2) / abs(uy) if uy else 1e9
        t = min(tx, ty)
        return cx + ux * t, cy + uy * t

    def _isaretci_konum(self, d, o):
        if o['hedef'] not in d:
            return o['x'], o['y']
        x, y, w, h = self._kutu_sinir(d, o['hedef'])
        u = o['uzak']
        return {'ust': (x + w / 2 if d[o['hedef']]['tur'] != 'dugum' else x + (w - PW) / 2, y - u),
                'alt': (x + w / 2 if d[o['hedef']]['tur'] != 'dugum' else x + (w - PW) / 2, y + h + u),
                'sol': (x - u - 14, y + h / 2),
                'sag': (x + w + u + 14, y + h / 2)}[o['yon']]

    def _ok_yol(self, d, o):
        k, h = o['kaynak'], o['hedef']
        if k not in d or h not in d:
            return None
        if o['oktur'] == 'sonraki' and d[k]['tur'] == 'dugum':
            ko = d[k]
            x1, y1 = ko['x'] + ko['w'] + PW / 2, ko['y'] + ko['h'] / 2
            hx, hy, hw, hh = self._kutu_sinir(d, h)
            if hx >= x1 + 10:                         # hedef sağda: düz ok sol kenara
                x2, y2 = hx, hy + hh / 2
                b = o['bukum']
                return (x1, y1, x1 + (x2 - x1) * .4, y1 - b, x1 + (x2 - x1) * .6, y2 - b, x2 - 2, y2)
            # hedef solda ya da üstte: alttan dolaşan eğri
            x2, y2 = hx + hw / 2, hy + hh
            alt = max(y1, y2) + 46 + o['bukum']
            return (x1, y1 + 8, x1 + 30, alt, x2 - 30, alt, x2, y2 + 2)
        cx1, cy1 = self._merkez(d, k)
        cx2, cy2 = self._merkez(d, h)
        x1, y1 = self._kenar_nokta(d, k, cx2 - cx1, cy2 - cy1)
        x2, y2 = self._kenar_nokta(d, h, cx1 - cx2, cy1 - cy2)
        b = o['bukum']
        nx, ny = -(y2 - y1), (x2 - x1)
        n = math.hypot(nx, ny) or 1
        ox, oy = nx / n * b, ny / n * b
        return (x1, y1, x1 + (x2 - x1) / 3 + ox, y1 + (y2 - y1) / 3 + oy,
                x1 + 2 * (x2 - x1) / 3 + ox, y1 + 2 * (y2 - y1) / 3 + oy, x2, y2)

    # ------------------------------------------------------------ sahne sınırı (otomatik kırpma)
    def _sinir(self, pay=26):
        """Bütün karelerdeki öğelerin birleşik sınır kutusu → viewBox (x0, y0, w, h)."""
        X0 = Y0 = 1e9
        X1 = Y1 = -1e9
        for k in self.kareler:
            d = k['durum']
            for id_, o in d.items():
                t = o['tur']
                if t == 'ok':
                    p = self._ok_yol(d, o)
                    if not p:
                        continue
                    xs, ys = p[0::2], p[1::2]
                    b = (min(xs), min(ys), max(xs), max(ys))
                elif t == 'isaretci':
                    x, y = self._isaretci_konum(d, o)
                    w = len(str(o['metin'])) * 9.5 + 8
                    b = {'ust': (x - w / 2, y - 18, x + w / 2, y + 26), 'alt': (x - w / 2, y - 26, x + w / 2, y + 20),
                         'sol': (x - w - 12, y - 12, x + 34, y + 12), 'sag': (x - 34, y - 12, x + w + 12, y + 12)}[o['yon']]
                else:
                    x, y, w, h = self._kutu_sinir(d, id_)
                    b = [x, y, x + w, y + h]
                    if t in ('kutu', 'dugum', 'daire') and o.get('alt') is not None:
                        b[3] += 20
                    if t == 'kutu' and o.get('ust') is not None:
                        b[1] -= 20
                    if t == 'cerceve' and o.get('baslik'):
                        b[1] -= 24
                X0, Y0, X1, Y1 = min(X0, b[0]), min(Y0, b[1]), max(X1, b[2]), max(Y1, b[3])
        if X0 > X1:
            return (0, 0, self.gen, self.yuk)
        w, h = X1 - X0 + 2 * pay, Y1 - Y0 + 2 * pay
        if w < 360:                                   # çok dar sahneleri ortala
            X0 -= (360 - w) / 2
            w = 360
        return (round(X0 - pay), round(Y0 - pay), round(w), round(h))

    def _hazirla(self):
        self.vb = self._sinir()

    # ------------------------------------------------------------ çizim
    def _svg_icerik(self, d, opak=None, dil=None):
        """Durumu üç katmanlı SVG iç metnine çevir. opak: {id: 0..1} (ara karelerde belirme/solma)."""
        opak = opak or {}
        kat = {'arka': [], 'ok': [], 'sekil': [], 'etiket': []}
        for id_, o in d.items():
            st = o['st']
            dolgu, cizgi, yazi = RENK.get(st, RENK['normal'])
            op = opak.get(id_, 1)
            ops = '' if op >= 0.999 else f' opacity="{_f(op)}"'
            t = o['tur']
            if t == 'ok':
                p = self._ok_yol(d, o)
                if not p:
                    continue
                ds = 'M%s %s C%s %s %s %s %s %s' % tuple(_f(v) for v in p)
                kat['ok'].append(
                    f'<path data-id="{_e(id_)}" class="ok st-{st}"{ops} d="{ds}" fill="none" '
                    f'stroke="{OK_RENK[st]}" stroke-width="2.2" marker-end="url(#ah-{st})"/>')
                if o.get('metin') is not None:
                    mx = (p[0] + 3 * p[2] + 3 * p[4] + p[6]) / 8
                    my = (p[1] + 3 * p[3] + 3 * p[5] + p[7]) / 8
                    kat['etiket'].append(
                        f'<g data-id="{_e(id_)}~m" class="e st-{st}"{ops} transform="translate({_f(mx)},{_f(my)})">'
                        f'<rect x="-13" y="-11" width="26" height="20" rx="4" fill="#ffffff" stroke="none"/>'
                        f'<text x="0" y="4" text-anchor="middle" font-size="13" font-family="{YAZI}" '
                        f'fill="{OK_RENK[st]}" font-weight="600">{_y(o["metin"], dil)}</text></g>')
                continue
            if t == 'isaretci':
                x, y = self._isaretci_konum(d, o)
                yon = o['yon']
                if yon == 'ust':
                    cz = '<path d="M0 6 L0 24" stroke="%s" stroke-width="2" marker-end="url(#ah-%s)"/>' % (cizgi, st)
                    ty = 0
                elif yon == 'alt':
                    cz = '<path d="M0 -6 L0 -24" stroke="%s" stroke-width="2" marker-end="url(#ah-%s)"/>' % (cizgi, st)
                    ty = 14
                elif yon == 'sol':
                    cz = '<path d="M14 0 L32 0" stroke="%s" stroke-width="2" marker-end="url(#ah-%s)"/>' % (cizgi, st)
                    ty = 5
                else:
                    cz = '<path d="M-14 0 L-32 0" stroke="%s" stroke-width="2" marker-end="url(#ah-%s)"/>' % (cizgi, st)
                    ty = 5
                hz = {'ust': 'middle', 'alt': 'middle', 'sol': 'end', 'sag': 'start'}[yon]
                tx = {'ust': 0, 'alt': 0, 'sol': 10, 'sag': -10}[yon]
                kat['etiket'].append(
                    f'<g data-id="{_e(id_)}" class="e isr st-{st}"{ops} transform="translate({_f(x)},{_f(y)})">'
                    f'{cz}<text x="{tx}" y="{ty}" text-anchor="{hz}" font-size="15" font-weight="700" '
                    f'font-family="{KOD_YAZI}" fill="{cizgi}">{_y(o["metin"], dil)}</text></g>')
                continue
            if t == 'etiket':
                aile = KOD_YAZI if o.get('kod') else YAZI
                kal = ' font-weight="700"' if o.get('kalin') else ''
                kat['etiket'].append(
                    f'<g data-id="{_e(id_)}" class="e lbl st-{st}"{ops} transform="translate({_f(o["x"])},{_f(o["y"])})">'
                    f'<text x="0" y="0" text-anchor="{o["hiza"]}" font-size="{o["boyut"]}"{kal} '
                    f'font-family="{aile}" fill="{yazi}">{_y(o["metin"], dil)}</text></g>')
                continue
            if t == 'cerceve':
                ic = (f'<rect x="0" y="0" width="{_f(o["w"])}" height="{_f(o["h"])}" rx="10" fill="{dolgu}" '
                      f'fill-opacity="0.45" stroke="{cizgi}" stroke-dasharray="6 5" stroke-width="1.5"/>')
                if o.get('baslik'):
                    ic += (f'<text x="10" y="-8" font-size="13" font-family="{YAZI}" fill="{yazi}" '
                           f'font-weight="600">{_y(o["baslik"], dil)}</text>')
                kat['arka'].append(f'<g data-id="{_e(id_)}" class="e frm st-{st}"{ops} '
                                   f'transform="translate({_f(o["x"])},{_f(o["y"])})">{ic}</g>')
                continue
            if t == 'kutu':
                w, h = o['w'], o['h']
                kesik = ' stroke-dasharray="5 4"' if st == 'bos' else ''
                aile = KOD_YAZI if o.get('kod') else YAZI
                ic = (f'<rect x="0" y="0" width="{_f(w)}" height="{_f(h)}" rx="6" fill="{dolgu}" stroke="{cizgi}" '
                      f'stroke-width="2"{kesik}/>'
                      f'<text x="{_f(w / 2)}" y="{_f(h / 2 + o["boyut"] * .36)}" text-anchor="middle" '
                      f'font-size="{o["boyut"]}" font-weight="600" font-family="{aile}" fill="{yazi}">'
                      f'{_y(o["metin"], dil)}</text>')
                if o.get('alt') is not None:
                    ic += (f'<text x="{_f(w / 2)}" y="{_f(h + 16)}" text-anchor="middle" font-size="12" '
                           f'font-family="{KOD_YAZI}" fill="#868e96">{_y(o["alt"], dil)}</text>')
                if o.get('ust') is not None:
                    ic += (f'<text x="{_f(w / 2)}" y="-7" text-anchor="middle" font-size="12" '
                           f'font-family="{KOD_YAZI}" fill="#868e96">{_y(o["ust"], dil)}</text>')
            elif t == 'dugum':
                w, h = o['w'], o['h']
                ic = (f'<rect x="0" y="0" width="{_f(w + PW)}" height="{_f(h)}" rx="6" fill="{dolgu}" '
                      f'stroke="{cizgi}" stroke-width="2"/>'
                      f'<line x1="{_f(w)}" y1="0" x2="{_f(w)}" y2="{_f(h)}" stroke="{cizgi}" stroke-width="2"/>'
                      f'<text x="{_f(w / 2)}" y="{_f(h / 2 + 6)}" text-anchor="middle" font-size="17" '
                      f'font-weight="600" font-family="{KOD_YAZI}" fill="{yazi}">{_y(o["deger"], dil)}</text>')
                if o.get('bos'):
                    ic += (f'<line x1="{_f(w + 4)}" y1="{_f(h - 4)}" x2="{_f(w + PW - 4)}" y2="4" '
                           f'stroke="{cizgi}" stroke-width="2"/>')
                else:
                    ic += f'<circle cx="{_f(w + PW / 2)}" cy="{_f(h / 2)}" r="3.5" fill="{cizgi}"/>'
                if o.get('alt') is not None:
                    ic += (f'<text x="{_f((w + PW) / 2)}" y="{_f(h + 16)}" text-anchor="middle" font-size="12" '
                           f'font-family="{KOD_YAZI}" fill="#868e96">{_y(o["alt"], dil)}</text>')
            elif t == 'daire':
                r = o['r']
                ic = (f'<circle cx="0" cy="0" r="{_f(r)}" fill="{dolgu}" stroke="{cizgi}" stroke-width="2"/>'
                      f'<text x="0" y="6" text-anchor="middle" font-size="16" font-weight="600" '
                      f'font-family="{KOD_YAZI}" fill="{yazi}">{_y(o["metin"], dil)}</text>')
                if o.get('alt') is not None:
                    ic += (f'<text x="0" y="{_f(r + 16)}" text-anchor="middle" font-size="12" '
                           f'font-family="{KOD_YAZI}" fill="#868e96">{_y(o["alt"], dil)}</text>')
            else:
                continue
            kat['sekil'].append(f'<g data-id="{_e(id_)}" class="e shp st-{st}"{ops} '
                                f'transform="translate({_f(o["x"])},{_f(o["y"])})">{ic}</g>')
        return ''.join(f'<g class="kat kat-{k}">{"".join(v)}</g>' for k, v in kat.items())

    def _tanimlar(self):
        m = ''.join(
            f'<marker id="ah-{st}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
            f'orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="{OK_RENK[st]}"/></marker>'
            for st in RENK)
        return f'<defs>{m}</defs>'

    def svg(self, i, opak=None, durum=None, arka=True, dil=None, genislik=None):
        d = durum if durum is not None else self.kareler[i]['durum']
        x0, y0, w, h = self.vb
        W = genislik or w
        H = round(W * h / w)
        a = f'<rect x="{x0}" y="{y0}" width="{w}" height="{h}" fill="#ffffff"/>' if arka else ''
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0} {y0} {w} {h}" '
                f'width="{W}" height="{H}">{self._tanimlar()}{a}{self._svg_icerik(d, opak, dil)}</svg>')

    # ------------------------------------------------------------ ara kareler (GIF)
    def _ara(self, d1, d2, t):
        """d1→d2 arasında t (0..1) anındaki durum ve saydamlıklar."""
        e = t * t * (3 - 2 * t)
        d, opak = {}, {}
        for id_, o2 in d2.items():
            o = copy.deepcopy(o2)
            if id_ in d1:
                o1 = d1[id_]
                for k in ('x', 'y', 'w', 'h', 'r'):
                    if k in o1 and k in o2 and isinstance(o1[k], (int, float)):
                        o[k] = o1[k] + (o2[k] - o1[k]) * e
                if e < .5:
                    o['st'] = o1['st']
                    for k in ('metin', 'deger', 'bos'):
                        if k in o1:
                            o[k] = o1[k]
            else:
                opak[id_] = e
            d[id_] = o
        for id_, o1 in d1.items():
            if id_ not in d2:
                d[id_] = copy.deepcopy(o1)
                opak[id_] = 1 - e
        return d, opak

    # ------------------------------------------------------------ çıktı
    def json_veri(self):
        self._hazirla()
        return {
            'ad': self.ad, 'baslik': self.baslik, 'gen': self.vb[2], 'yuk': self.vb[3], 'vb': list(self.vb), 'kod': self.kod,
            'tanim': self._tanimlar(),
            'kareler': [{'ic': self._svg_icerik(k['durum']), 'cap': k['cap'], 'satir': k['satir']}
                        for k in self.kareler],
        }

    def _png(self, svg_metin, olcek=1.0):
        import cairosvg
        return cairosvg.svg2png(bytestring=svg_metin.encode('utf-8'), scale=olcek)

    def _alt_yazi(self, img, metin, gen):
        """Kare görüntüsünün altına açıklama bandı ekle (GIF ve şerit için)."""
        from PIL import Image, ImageDraw, ImageFont
        font = None
        for f in ('segoeui.ttf', 'arial.ttf', 'DejaVuSans.ttf'):
            try:
                font = ImageFont.truetype(f, 20)
                break
            except OSError:
                pass
        font = font or ImageFont.load_default()
        duz = metin.replace('`', '').replace('**', '')
        dr = ImageDraw.Draw(img)
        satirlar, s = [], ''
        for k in duz.split():
            dene = (s + ' ' + k).strip()
            if dr.textlength(dene, font=font) > gen - 40:
                satirlar.append(s)
                s = k
            else:
                s = dene
        satirlar.append(s)
        bant = 16 + 28 * len(satirlar)
        yeni = Image.new('RGB', (img.width, img.height + bant), '#ffffff')
        yeni.paste(img, (0, 0))
        dr = ImageDraw.Draw(yeni)
        dr.rectangle([0, img.height, img.width, img.height + bant], fill='#f1f3f5')
        for i, s in enumerate(satirlar):
            dr.text((20, img.height + 10 + 28 * i), s, fill='#1f2933', font=font)
        return yeni

    def _png_img(self, i, dil, genislik):
        from PIL import Image
        return Image.open(io.BytesIO(self._png(self.svg(i, dil=dil, genislik=genislik)))).convert('RGB')

    def gif(self, yol, dil='tr', ara=9, ara_ms=55, bekle_ms=1600, genislik=880):
        from PIL import Image
        self._hazirla()
        kareler, sureler = [], []
        n = len(self.kareler)
        for i in range(n):
            if i > 0:
                for j in range(1, ara + 1):
                    d, op = self._ara(self.kareler[i - 1]['durum'], self.kareler[i]['durum'], j / (ara + 1))
                    img = Image.open(io.BytesIO(self._png(self.svg(0, op, d, dil=dil, genislik=genislik)))).convert('RGB')
                    kareler.append(self._alt_yazi(img, self.kareler[i]['cap'][dil], img.width))
                    sureler.append(ara_ms)
            img = Image.open(io.BytesIO(self._png(self.svg(i, dil=dil, genislik=genislik)))).convert('RGB')
            kareler.append(self._alt_yazi(img, self.kareler[i]['cap'][dil], img.width))
            sureler.append(bekle_ms + 25 * len(self.kareler[i]['cap'][dil]))
        h = max(k.height for k in kareler)
        kareler = [k if k.height == h else self._pad(k, h) for k in kareler]
        pal = [k.convert('P', palette=Image.ADAPTIVE, colors=96) for k in kareler]
        pal[0].save(yol, save_all=True, append_images=pal[1:], duration=sureler, loop=0, optimize=True, disposal=1)

    @staticmethod
    def _pad(img, h):
        from PIL import Image
        y = Image.new('RGB', (img.width, h), '#f1f3f5')
        y.paste(img, (0, 0))
        return y

    def serit(self, yol, dil='tr', secim=None, sutun=2, genislik=520):
        """Anahtar karelerin numaralı ızgarası (PDF için)."""
        from PIL import Image, ImageDraw
        self._hazirla()
        idx = secim or list(range(len(self.kareler)))
        parca = []
        for i in idx:
            img = Image.open(io.BytesIO(self._png(self.svg(i, dil=dil, genislik=genislik)))).convert('RGB')
            img = self._alt_yazi(img, f'{i + 1}. ' + self.kareler[i]['cap'][dil], img.width)
            parca.append(img)
        w = max(p.width for p in parca)
        h = max(p.height for p in parca)
        satir = math.ceil(len(parca) / sutun)
        tuval = Image.new('RGB', (sutun * w + (sutun + 1) * 12, satir * h + (satir + 1) * 12), '#ffffff')
        dr = ImageDraw.Draw(tuval)
        for k, p in enumerate(parca):
            x = 12 + (k % sutun) * (w + 12)
            y = 12 + (k // sutun) * (h + 12)
            tuval.paste(p, (x, y))
            dr.rectangle([x - 1, y - 1, x + p.width, y + p.height], outline='#ced4da')
        tuval.save(yol, optimize=True)

    def yaz(self, klasor, gif=True, serit=True, secim=None):
        """JSON + bağımsız HTML (+ GIF, şerit) üret."""
        k = pathlib.Path(klasor)
        k.mkdir(parents=True, exist_ok=True)
        veri = self.json_veri()
        metin = json.dumps(veri, ensure_ascii=False, separators=(',', ':'))
        (k / f'{self.ad}.json').write_text(metin, encoding='utf-8')
        oyn = pathlib.Path(__file__).with_name('oynatici')
        sablon = (oyn / 'sablon.html').read_text(encoding='utf-8')
        sayfa = (sablon.replace('/*CSS*/', (oyn / 'dsanim.css').read_text(encoding='utf-8'))
                 .replace('/*JS*/', (oyn / 'dsanim.js').read_text(encoding='utf-8'))
                 .replace('/*VERI*/', metin.replace('</', '<\\/'))
                 .replace('{{BASLIK}}', html.escape(self.baslik['en'])))
        # Site çok dilli (mkdocs-static-i18n, ek kipi): `<ad>.html` varsayılan dil (en), `<ad>.tr.html` Türkçe
        # sürümde `<ad>.html` olarak sunulur; böylece iki dilin sayfası da `anim/<ad>.html` diye aynı yolu kullanır.
        for dil, ad in (('en', f'{self.ad}.html'), ('tr', f'{self.ad}.tr.html')):
            (k / ad).write_text(sayfa.replace('<html lang="tr">', f'<html lang="{dil}">'), encoding='utf-8')
        for dil in ('tr', 'en'):
            # PDF sunum/not için tek kare: animasyonun son hâli (site dili eki kuralı: <ad>-son.<dil>.png)
            if gif or serit:
                self._hazirla()
                son = self._alt_yazi(self._png_img(len(self.kareler) - 1, dil, 1000), self.kareler[-1]['cap'][dil], 1000)
                son.save(str(k / f'{self.ad}-son.{dil}.png'), optimize=True)
            if gif:
                self.gif(str(k / f'{self.ad}.{dil}.gif'), dil)
            if serit:
                self.serit(str(k / f'{self.ad}.{dil}.png'), dil, secim)
        return k / f'{self.ad}.html'
