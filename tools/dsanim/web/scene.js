/* dsanim v2 — scene model, SVG renderer and frame recorder.
 *
 * An animation is a function build(S, data) that adds elements to a Scene S, changes them and calls S.step(...)
 * after every visible change. The same code runs in the browser (player: frames are built from the dataset the
 * user picks, types or randomises) and in Node (export.js: GIF/PNG for slides and printed notes).
 *
 * Elements (all positions in scene units; the view box is cropped to the content automatically):
 *   box(id, {x, y, w, h, text, style, below, above, size, mono})      array cell, stack slot, generic rectangle
 *   node(id, {x, y, w, h, value, style, isNull, below})               linked-list node: [ value | • ]
 *   circle(id, {x, y, r, text, style, below})                          tree / graph vertex (x, y = centre)
 *   label(id, {x, y, text, style, size, anchor, bold, mono})           free text
 *   pointer(id, {target, text, side, style, dist})                     named pointer (top, head, front…) that follows its target
 *   arrow(id, {from, to, kind, style, text, bend, head})               kind 'next' (from a node's pointer cell) or 'center'
 *   region(id, {x, y, w, h, title, style})                             dashed background frame
 *   brace(id, {from, to, text, side, style, dist})                     curly brace over the elements from … to (their
 *                                                                      union), with a label: "already sorted", "< key"
 * Styles: normal, hl (highlight), new, del (removed), dim, active, empty.
 * Any text may be a plain string or {tr: '…', en: '…'}.
 *
 * Following the instructor's static drawings: name every array row on its left (label "A ="), put index numbers
 * above the cells (box `above`), mark regions with braces, write the comparison on the right ("< 9"), and when the
 * path matters (binary search, partition…) keep earlier states visible as rows with S.snapshot().
 *   S.at(k)                          the input value with index k (in input.tokens / input.format order) is being
 *                                    processed from the next step on; the player highlights it in the input strip
 *   S.snapshot(prefix, ids, dx, dy, style)   copy elements (pointers/arrows/braces between them follow) to new ids
 *                                    prefix+id, shifted by (dx, dy) — a "trace row" that stays on screen
 */
(function (root) {
  'use strict';

  var COLORS = {
    normal: ['#ffffff', '#37474f', '#1f2933'],
    hl: ['#fff3bf', '#f08c00', '#1f2933'],
    new: ['#d3f9d8', '#2f9e44', '#1f2933'],
    del: ['#ffe3e3', '#e03131', '#1f2933'],
    dim: ['#f1f3f5', '#adb5bd', '#868e96'],
    active: ['#d0ebff', '#1971c2', '#1f2933'],
    empty: ['#f8f9fa', '#ced4da', '#adb5bd']
  };
  var ARROW = { normal: '#495057', hl: '#f08c00', new: '#2f9e44', del: '#e03131', dim: '#adb5bd', active: '#1971c2', empty: '#ced4da' };
  var FONT = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
  var MONO = "Consolas, 'DejaVu Sans Mono', 'Cascadia Mono', monospace";
  var PW = 26; // width of the pointer cell of a list node

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function num(v) { return (Math.round(v * 10) / 10).toString(); }
  function txt(v, lang) {
    if (v === null || v === undefined) return '';
    if (typeof v !== 'object') return esc(v);
    if (lang) return esc(v[lang] !== undefined ? v[lang] : (v.en || ''));
    return '<tspan class="l-tr">' + esc(v.tr || '') + '</tspan><tspan class="l-en">' + esc(v.en || '') + '</tspan>';
  }
  function longest(v) {
    if (v && typeof v === 'object') return (v.tr || '').length > (v.en || '').length ? (v.tr || '') : (v.en || '');
    return String(v === undefined || v === null ? '' : v);
  }
  function copy(o) { return JSON.parse(JSON.stringify(o)); }

  // ------------------------------------------------------------------ scene
  function Scene() { this.el = {}; this.order = []; this.frames = []; this.cursor = undefined; }

  Scene.prototype._add = function (id, kind, p) {
    p = p || {};
    p.kind = kind;
    if (!p.style) p.style = kind === 'pointer' ? 'active' : (kind === 'region' ? 'dim' : 'normal');
    if (!(id in this.el)) this.order.push(id);
    this.el[id] = p;
    return id;
  };
  Scene.prototype.box = function (id, p) { p = p || {}; p.w = p.w || 58; p.h = p.h || 44; p.size = p.size || 18; if (p.mono === undefined) p.mono = true; return this._add(id, 'box', p); };
  Scene.prototype.node = function (id, p) { p = p || {}; p.w = p.w || 46; p.h = p.h || 40; return this._add(id, 'node', p); };
  Scene.prototype.circle = function (id, p) { p = p || {}; p.r = p.r || 22; return this._add(id, 'circle', p); };
  Scene.prototype.label = function (id, p) { p = p || {}; p.size = p.size || 15; p.anchor = p.anchor || 'middle'; return this._add(id, 'label', p); };
  Scene.prototype.pointer = function (id, p) { p = p || {}; p.side = p.side || 'top'; p.dist = p.dist === undefined ? 34 : p.dist; p.x = 0; p.y = 0; return this._add(id, 'pointer', p); };
  Scene.prototype.arrow = function (id, p) { p = p || {}; p.type = p.kind || 'next'; delete p.kind; p.bend = p.bend || 0; p.x = 0; p.y = 0; if (p.head === undefined) p.head = true; return this._add(id, 'arrow', p); };
  Scene.prototype.region = function (id, p) { return this._add(id, 'region', p || {}); };
  Scene.prototype.brace = function (id, p) { p = p || {}; p.side = p.side || 'top'; p.dist = p.dist === undefined ? 8 : p.dist; p.x = 0; p.y = 0; if (!p.style) p.style = 'active'; return this._add(id, 'brace', p); };
  /** From the next recorded step on, input value k is the one being processed (player: input strip). null = none. */
  Scene.prototype.at = function (k) { this.cursor = k === null ? undefined : k; };
  /** Copy elements to prefix+id, shifted by (dx, dy); links among the copied ids are re-pointed to the copies. */
  Scene.prototype.snapshot = function (prefix, ids, dx, dy, style) {
    var out = [], self = this;
    ids.forEach(function (id) {
      var o = self.el[id];
      if (!o) return;
      var c = copy(o), linked = ['target', 'from', 'to'].filter(function (k) { return c[k] !== undefined; });
      if (linked.some(function (k) { return ids.indexOf(c[k]) < 0; })) return;   // would point outside the copy
      linked.forEach(function (k) { c[k] = prefix + c[k]; });
      if (c.kind !== 'pointer' && c.kind !== 'arrow' && c.kind !== 'brace') { c.x += dx || 0; c.y += dy || 0; }
      if (style) c.style = style;
      self._add(prefix + id, c.kind, c);
      out.push(prefix + id);
    });
    return out;
  };

  Scene.prototype.has = function (id) { return id in this.el; };
  Scene.prototype.get = function (id) { return this.el[id]; };
  Scene.prototype.set = function (id, p) { var o = this.el[id]; if (!o) return; for (var k in p) o[k] = p[k]; };
  Scene.prototype.move = function (id, x, y) { var o = this.el[id]; if (!o) return; if (x !== null && x !== undefined) o.x = x; if (y !== null && y !== undefined) o.y = y; };
  Scene.prototype.remove = function () {
    for (var i = 0; i < arguments.length; i++) {
      var id = arguments[i];
      if (id in this.el) { delete this.el[id]; this.order.splice(this.order.indexOf(id), 1); }
    }
  };
  Scene.prototype.styleAll = function (style, kind) {
    for (var id in this.el) {
      var o = this.el[id];
      if ((!kind || o.kind === kind) && o.kind !== 'pointer' && o.kind !== 'region') o.style = style;
    }
  };
  /** Record the current state. caption: {tr, en}; lines: {c: n | [n…], java: …} (1-based code lines). */
  Scene.prototype.step = function (caption, lines) {
    var l = {};
    for (var k in (lines || {})) l[k] = Array.isArray(lines[k]) ? lines[k] : [lines[k]];
    var state = {};
    for (var i = 0; i < this.order.length; i++) state[this.order[i]] = copy(this.el[this.order[i]]);
    this.frames.push({ state: state, order: this.order.slice(), cap: caption, lines: l, at: this.cursor });
  };

  // ------------------------------------------------------------------ geometry
  function bbox(d, id) {
    var o = d[id];
    switch (o.kind) {
      case 'box': case 'region': return [o.x, o.y, o.w, o.h];
      case 'node': return [o.x, o.y, o.w + PW, o.h];
      case 'circle': return [o.x - o.r, o.y - o.r, 2 * o.r, 2 * o.r];
      case 'label':
        var w = Math.max(20, longest(o.text).length * o.size * 0.58);
        var x0 = o.x - (o.anchor === 'middle' ? w / 2 : (o.anchor === 'end' ? w : 0));
        return [x0, o.y - o.size, w, o.size * 1.3];
      default: return [o.x - 20, o.y - 10, 40, 20];
    }
  }
  function centre(d, id) { var b = bbox(d, id); return [b[0] + b[2] / 2, b[1] + b[3] / 2]; }
  function edgePoint(d, id, dx, dy) {
    var o = d[id], c = centre(d, id), n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
    if (o.kind === 'circle') return [c[0] + ux * o.r, c[1] + uy * o.r];
    var b = bbox(d, id), tx = ux ? (b[2] / 2) / Math.abs(ux) : 1e9, ty = uy ? (b[3] / 2) / Math.abs(uy) : 1e9, t = Math.min(tx, ty);
    return [c[0] + ux * t, c[1] + uy * t];
  }
  function pointerPos(d, o) {
    if (!(o.target in d)) return [o.x, o.y];
    var b = bbox(d, o.target), u = o.dist, isNode = d[o.target].kind === 'node';
    var cx = isNode ? b[0] + (b[2] - PW) / 2 : b[0] + b[2] / 2;
    return { top: [cx, b[1] - u], bottom: [cx, b[1] + b[3] + u], left: [b[0] - u - 14, b[1] + b[3] / 2], right: [b[0] + b[2] + u + 14, b[1] + b[3] / 2] }[o.side];
  }
  /** Brace over the union of `from` … `to`: {x1, x2, yb (base, next to the elements), yt (tip)} or null. */
  function braceGeom(d, o) {
    if (!(o.from in d) || !(o.to in d)) return null;
    var a = bbox(d, o.from), b = bbox(d, o.to), top = o.side !== 'bottom';
    var x1 = Math.min(a[0], b[0]), x2 = Math.max(a[0] + a[2], b[0] + b[2]);
    var extra = function (e) { return top ? (e.above !== undefined && e.above !== null ? 18 : 0) : (e.below !== undefined && e.below !== null ? 18 : 0); };
    var pad = o.dist + Math.max(extra(d[o.from]), extra(d[o.to]));
    var yb = top ? Math.min(a[1], b[1]) - pad : Math.max(a[1] + a[3], b[1] + b[3]) + pad;
    return { x1: x1 + 2, x2: x2 - 2, yb: yb, yt: top ? yb - 12 : yb + 12, top: top };
  }
  function bracePathD(g) {
    var xm = (g.x1 + g.x2) / 2, ym = (g.yb + g.yt) / 2, r = Math.min(10, (g.x2 - g.x1) / 4);
    return 'M' + num(g.x1) + ' ' + num(g.yb) + ' Q' + num(g.x1) + ' ' + num(ym) + ' ' + num(g.x1 + r) + ' ' + num(ym) +
      ' L' + num(xm - r) + ' ' + num(ym) + ' Q' + num(xm) + ' ' + num(ym) + ' ' + num(xm) + ' ' + num(g.yt) +
      ' Q' + num(xm) + ' ' + num(ym) + ' ' + num(xm + r) + ' ' + num(ym) + ' L' + num(g.x2 - r) + ' ' + num(ym) +
      ' Q' + num(g.x2) + ' ' + num(ym) + ' ' + num(g.x2) + ' ' + num(g.yb);
  }
  function arrowPath(d, o) {
    var k = o.from, h = o.to;
    if (!(k in d) || !(h in d)) return null;
    if (o.type === 'next' && d[k].kind === 'node') {
      var ko = d[k], x1 = ko.x + ko.w + PW / 2, y1 = ko.y + ko.h / 2, hb = bbox(d, h), b = o.bend;
      if (hb[0] >= x1 + 10) {
        var x2 = hb[0], y2 = hb[1] + hb[3] / 2;
        return [x1, y1, x1 + (x2 - x1) * 0.4, y1 - b, x1 + (x2 - x1) * 0.6, y2 - b, x2 - 2, y2];
      }
      var X2 = hb[0] + hb[2] / 2, Y2 = hb[1] + hb[3], low = Math.max(y1, Y2) + 46 + b;
      return [x1, y1 + 8, x1 + 30, low, X2 - 30, low, X2, Y2 + 2];
    }
    var c1 = centre(d, k), c2 = centre(d, h);
    var p1 = edgePoint(d, k, c2[0] - c1[0], c2[1] - c1[1]), p2 = edgePoint(d, h, c1[0] - c2[0], c1[1] - c2[1]);
    var nx = -(p2[1] - p1[1]), ny = p2[0] - p1[0], n = Math.hypot(nx, ny) || 1, ox = nx / n * o.bend, oy = ny / n * o.bend;
    return [p1[0], p1[1], p1[0] + (p2[0] - p1[0]) / 3 + ox, p1[1] + (p2[1] - p1[1]) / 3 + oy,
            p1[0] + 2 * (p2[0] - p1[0]) / 3 + ox, p1[1] + 2 * (p2[1] - p1[1]) / 3 + oy, p2[0], p2[1]];
  }

  // ------------------------------------------------------------------ renderer
  function defs() {
    var m = '';
    for (var st in ARROW) {
      m += '<marker id="ah-' + st + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
           '<path d="M0 0 L10 5 L0 10 z" fill="' + ARROW[st] + '"/></marker>';
    }
    return '<defs>' + m + '</defs>';
  }

  /** Render a state to the inner SVG (four layers). lang null → both languages as tspans (player); 'tr'/'en' → one. */
  function render(d, order, lang, opacity) {
    opacity = opacity || {};
    var L = { back: [], arrow: [], shape: [], label: [] };
    var ids = order || Object.keys(d);
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i], o = d[id];
      if (!o) continue;
      var st = COLORS[o.style] ? o.style : 'normal', c = COLORS[st], fill = c[0], line = c[1], ink = c[2];
      var op = opacity[id] === undefined ? 1 : opacity[id], ops = op >= 0.999 ? '' : ' opacity="' + num(op) + '"';
      var did = ' data-id="' + esc(id) + '"';
      if (o.kind === 'arrow') {
        var p = arrowPath(d, o);
        if (!p) continue;
        var ds = 'M' + num(p[0]) + ' ' + num(p[1]) + ' C' + num(p[2]) + ' ' + num(p[3]) + ' ' + num(p[4]) + ' ' + num(p[5]) + ' ' + num(p[6]) + ' ' + num(p[7]);
        L.arrow.push('<path' + did + ' class="ok st-' + st + '"' + ops + ' d="' + ds + '" fill="none" stroke="' + ARROW[st] +
          '" stroke-width="2.2"' + (o.head ? ' marker-end="url(#ah-' + st + ')"' : '') + '/>');
        if (o.text !== undefined && o.text !== null && o.text !== '') {
          var mx = (p[0] + 3 * p[2] + 3 * p[4] + p[6]) / 8, my = (p[1] + 3 * p[3] + 3 * p[5] + p[7]) / 8;
          L.label.push('<g data-id="' + esc(id) + '~m" class="e st-' + st + '"' + ops + ' transform="translate(' + num(mx) + ',' + num(my) + ')">' +
            '<rect x="-14" y="-11" width="28" height="20" rx="4" fill="#ffffff" stroke="none"/>' +
            '<text x="0" y="4" text-anchor="middle" font-size="13" font-family="' + MONO + '" fill="' + ARROW[st] + '" font-weight="600">' + txt(o.text, lang) + '</text></g>');
        }
        continue;
      }
      if (o.kind === 'brace') {
        var g = braceGeom(d, o);
        if (!g) continue;
        L.arrow.push('<path' + did + ' class="ok brc st-' + st + '"' + ops + ' d="' + bracePathD(g) + '" fill="none" stroke="' + line + '" stroke-width="2"/>');
        if (o.text !== undefined && o.text !== null && o.text !== '') {
          L.label.push('<g data-id="' + esc(id) + '~t" class="e lbl st-' + st + '"' + ops + ' transform="translate(' + num((g.x1 + g.x2) / 2) + ',' + num(g.top ? g.yt - 6 : g.yt + 17) + ')">' +
            '<text x="0" y="0" text-anchor="middle" font-size="15" font-weight="700" font-family="' + FONT + '" fill="' + line + '">' + txt(o.text, lang) + '</text></g>');
        }
        continue;
      }
      if (o.kind === 'pointer') {
        var pp = pointerPos(d, o), side = o.side, path, ty, anch, tx;
        if (side === 'top') { path = 'M0 6 L0 24'; ty = 0; anch = 'middle'; tx = 0; }
        else if (side === 'bottom') { path = 'M0 -6 L0 -24'; ty = 14; anch = 'middle'; tx = 0; }
        else if (side === 'left') { path = 'M14 0 L32 0'; ty = 5; anch = 'end'; tx = 10; }
        else { path = 'M-14 0 L-32 0'; ty = 5; anch = 'start'; tx = -10; }
        L.label.push('<g' + did + ' class="e isr st-' + st + '"' + ops + ' transform="translate(' + num(pp[0]) + ',' + num(pp[1]) + ')">' +
          '<path d="' + path + '" stroke="' + line + '" stroke-width="2" marker-end="url(#ah-' + st + ')"/>' +
          '<text x="' + tx + '" y="' + ty + '" text-anchor="' + anch + '" font-size="15" font-weight="700" font-family="' + MONO + '" fill="' + line + '">' + txt(o.text, lang) + '</text></g>');
        continue;
      }
      if (o.kind === 'label') {
        L.label.push('<g' + did + ' class="e lbl st-' + st + '"' + ops + ' transform="translate(' + num(o.x) + ',' + num(o.y) + ')">' +
          '<text x="0" y="0" text-anchor="' + o.anchor + '" font-size="' + o.size + '"' + (o.bold ? ' font-weight="700"' : '') +
          ' font-family="' + (o.mono ? MONO : FONT) + '" fill="' + ink + '">' + txt(o.text, lang) + '</text></g>');
        continue;
      }
      if (o.kind === 'region') {
        var r = '<rect x="0" y="0" width="' + num(o.w) + '" height="' + num(o.h) + '" rx="10" fill="' + fill + '" fill-opacity="0.45" stroke="' + line + '" stroke-dasharray="6 5" stroke-width="1.5"/>';
        if (o.title) r += '<text x="10" y="-8" font-size="13" font-family="' + FONT + '" fill="' + ink + '" font-weight="600">' + txt(o.title, lang) + '</text>';
        L.back.push('<g' + did + ' class="e frm st-' + st + '"' + ops + ' transform="translate(' + num(o.x) + ',' + num(o.y) + ')">' + r + '</g>');
        continue;
      }
      var inner = '';
      if (o.kind === 'box') {
        var dash = st === 'empty' ? ' stroke-dasharray="5 4"' : '';
        inner = '<rect x="0" y="0" width="' + num(o.w) + '" height="' + num(o.h) + '" rx="6" fill="' + fill + '" stroke="' + line + '" stroke-width="2"' + dash + '/>' +
          '<text x="' + num(o.w / 2) + '" y="' + num(o.h / 2 + o.size * 0.36) + '" text-anchor="middle" font-size="' + o.size + '" font-weight="600" font-family="' +
          (o.mono ? MONO : FONT) + '" fill="' + ink + '">' + txt(o.text, lang) + '</text>';
        if (o.below !== undefined && o.below !== null) inner += '<text x="' + num(o.w / 2) + '" y="' + num(o.h + 16) + '" text-anchor="middle" font-size="13" font-family="' + MONO + '" fill="#5c6770">' + txt(o.below, lang) + '</text>';
        if (o.above !== undefined && o.above !== null) inner += '<text x="' + num(o.w / 2) + '" y="-7" text-anchor="middle" font-size="13" font-family="' + MONO + '" fill="#5c6770">' + txt(o.above, lang) + '</text>';
      } else if (o.kind === 'node') {
        inner = '<rect x="0" y="0" width="' + num(o.w + PW) + '" height="' + num(o.h) + '" rx="6" fill="' + fill + '" stroke="' + line + '" stroke-width="2"/>' +
          '<line x1="' + num(o.w) + '" y1="0" x2="' + num(o.w) + '" y2="' + num(o.h) + '" stroke="' + line + '" stroke-width="2"/>' +
          '<text x="' + num(o.w / 2) + '" y="' + num(o.h / 2 + 6) + '" text-anchor="middle" font-size="17" font-weight="600" font-family="' + MONO + '" fill="' + ink + '">' + txt(o.value, lang) + '</text>';
        inner += o.isNull
          ? '<line x1="' + num(o.w + 4) + '" y1="' + num(o.h - 4) + '" x2="' + num(o.w + PW - 4) + '" y2="4" stroke="' + line + '" stroke-width="2"/>'
          : '<circle cx="' + num(o.w + PW / 2) + '" cy="' + num(o.h / 2) + '" r="3.5" fill="' + line + '"/>';
        if (o.below !== undefined && o.below !== null) inner += '<text x="' + num((o.w + PW) / 2) + '" y="' + num(o.h + 16) + '" text-anchor="middle" font-size="13" font-family="' + MONO + '" fill="#5c6770">' + txt(o.below, lang) + '</text>';
      } else if (o.kind === 'circle') {
        inner = '<circle cx="0" cy="0" r="' + num(o.r) + '" fill="' + fill + '" stroke="' + line + '" stroke-width="2"/>' +
          '<text x="0" y="6" text-anchor="middle" font-size="16" font-weight="600" font-family="' + MONO + '" fill="' + ink + '">' + txt(o.text, lang) + '</text>';
        if (o.below !== undefined && o.below !== null) inner += '<text x="0" y="' + num(o.r + 16) + '" text-anchor="middle" font-size="13" font-family="' + MONO + '" fill="#5c6770">' + txt(o.below, lang) + '</text>';
      } else continue;
      L.shape.push('<g' + did + ' class="e shp st-' + st + '"' + ops + ' transform="translate(' + num(o.x) + ',' + num(o.y) + ')">' + inner + '</g>');
    }
    return ['back', 'arrow', 'shape', 'label'].map(function (k) { return '<g class="kat kat-' + { back: 'arka', arrow: 'ok', shape: 'sekil', label: 'etiket' }[k] + '">' + L[k].join('') + '</g>'; }).join('');
  }

  /** Union bounding box of every element in every frame → [x, y, w, h]. */
  function viewBox(frames, pad) {
    pad = pad === undefined ? 26 : pad;
    var X0 = 1e9, Y0 = 1e9, X1 = -1e9, Y1 = -1e9;
    frames.forEach(function (f) {
      var d = f.state;
      for (var id in d) {
        var o = d[id], b;
        if (o.kind === 'arrow') {
          var p = arrowPath(d, o);
          if (!p) continue;
          b = [Math.min(p[0], p[2], p[4], p[6]), Math.min(p[1], p[3], p[5], p[7]), Math.max(p[0], p[2], p[4], p[6]), Math.max(p[1], p[3], p[5], p[7])];
        } else if (o.kind === 'brace') {
          var g = braceGeom(d, o);
          if (!g) continue;
          var tw = longest(o.text).length * 8.7 + 8, xm = (g.x1 + g.x2) / 2;
          b = g.top ? [Math.min(g.x1, xm - tw / 2), g.yt - 24, Math.max(g.x2, xm + tw / 2), g.yb]
                    : [Math.min(g.x1, xm - tw / 2), g.yb, Math.max(g.x2, xm + tw / 2), g.yt + 24];
        } else if (o.kind === 'pointer') {
          var pp = pointerPos(d, o), w = longest(o.text).length * 9.5 + 8;
          b = { top: [pp[0] - w / 2, pp[1] - 18, pp[0] + w / 2, pp[1] + 26], bottom: [pp[0] - w / 2, pp[1] - 26, pp[0] + w / 2, pp[1] + 20],
                left: [pp[0] - w - 12, pp[1] - 12, pp[0] + 34, pp[1] + 12], right: [pp[0] - 34, pp[1] - 12, pp[0] + w + 12, pp[1] + 12] }[o.side];
        } else {
          var q = bbox(d, id);
          b = [q[0], q[1], q[0] + q[2], q[1] + q[3]];
          if ((o.kind === 'box' || o.kind === 'node' || o.kind === 'circle') && o.below !== undefined && o.below !== null) b[3] += 20;
          if (o.kind === 'box' && o.above !== undefined && o.above !== null) b[1] -= 20;
          if (o.kind === 'region' && o.title) b[1] -= 24;
        }
        X0 = Math.min(X0, b[0]); Y0 = Math.min(Y0, b[1]); X1 = Math.max(X1, b[2]); Y1 = Math.max(Y1, b[3]);
      }
    });
    if (X0 > X1) return [0, 0, 800, 360];
    var w2 = X1 - X0 + 2 * pad, h2 = Y1 - Y0 + 2 * pad;
    if (w2 < 360) { X0 -= (360 - w2) / 2; w2 = 360; }
    return [Math.round(X0 - pad), Math.round(Y0 - pad), Math.round(w2), Math.round(h2)];
  }

  /** In-between state for exports (GIF): positions eased, entering/leaving elements faded. */
  function tween(a, b, t) {
    var e = t * t * (3 - 2 * t), d = {}, opacity = {}, order = [];
    for (var id in b.state) {
      var o = copy(b.state[id]);
      if (id in a.state) {
        var p = a.state[id];
        ['x', 'y', 'w', 'h', 'r'].forEach(function (k) { if (typeof p[k] === 'number' && typeof o[k] === 'number') o[k] = p[k] + (o[k] - p[k]) * e; });
        if (e < 0.5) { o.style = p.style; ['text', 'value', 'isNull'].forEach(function (k) { if (k in p) o[k] = p[k]; }); }
      } else opacity[id] = e;
      d[id] = o; order.push(id);
    }
    for (var id2 in a.state) if (!(id2 in b.state)) { d[id2] = copy(a.state[id2]); opacity[id2] = 1 - e; order.push(id2); }
    return { state: d, order: order, opacity: opacity };
  }

  function svg(frameLike, vb, lang, width) {
    var W = width || vb[2], H = Math.round(W * vb[3] / vb[2]);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb.join(' ') + '" width="' + W + '" height="' + H + '">' + defs() +
      '<rect x="' + vb[0] + '" y="' + vb[1] + '" width="' + vb[2] + '" height="' + vb[3] + '" fill="#ffffff"/>' +
      render(frameLike.state, frameLike.order, lang, frameLike.opacity) + '</svg>';
  }

  // ------------------------------------------------------------------ small helpers for algorithm scripts
  /** Deterministic RNG (mulberry32) so a random example can be reproduced from its seed. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function randInt(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
  function T(tr, en) { return { tr: tr, en: en }; }
  /** Parse "5, 8 13; 2" → [5, 8, 13, 2]; throws {tr, en} when a token is not an integer. */
  function parseInts(text) {
    var parts = String(text).split(/[\s,;]+/).filter(Boolean), out = [];
    for (var i = 0; i < parts.length; i++) {
      if (!/^-?\d+$/.test(parts[i])) throw T('"' + parts[i] + '" bir tamsayı değil.', '"' + parts[i] + '" is not an integer.');
      out.push(parseInt(parts[i], 10));
    }
    return out;
  }

  var api = {
    Scene: Scene, render: render, defs: defs, viewBox: viewBox, tween: tween, svg: svg,
    rng: rng, randInt: randInt, T: T, parseInts: parseInts, COLORS: COLORS,
    registry: {}, define: function (spec) { api.registry[spec.id] = spec; return spec; }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DSAnim = api;
})(typeof window !== 'undefined' ? window : this);
