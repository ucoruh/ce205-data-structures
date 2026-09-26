/* dsanim v2 player — builds the frames in the browser from the chosen example, random data or the user's own values,
 * then plays them: elements are matched by data-id, positions glide, colours fade, new elements appear, removed ones fade.
 * Controls: example picker (normal / hard / edge cases), difficulty + random, own values, first/prev/play/next/last,
 * speed, narration (browser speech synthesis), code language tabs.
 * Keyboard: space = play/pause, ← → = step, Home/End = first/last.
 * URL: lang=tr|en, example=<preset id>, level=easy|normal|hard|extreme, seed=<n>, step=<n>, auto=1, code=c|java|0,
 *      static=1 (print: last step, no controls), mode=slide (compact layout for a 16:9 slide).
 *      Old Turkish names still work: kare, oto, kod, statik, yer=slayt.
 */
(function () {
  'use strict';
  var NUMS = /-?\d*\.?\d+(?:e-?\d+)?/g;
  var TEXT = {
    tr: { play: 'Oynat', pause: 'Duraklat', next: 'Sonraki adım', prev: 'Önceki adım', first: 'Başa dön', last: 'Sona git',
          speed: 'Hız', voice: 'Sesli anlatım', step: 'Adım', example: 'Örnek', level: 'Zorluk', random: 'Rastgele',
          own: 'Kendi değerlerin', apply: 'Uygula', custom: 'Kendi değerleri', randomName: 'Rastgele',
          input: 'Girdi', upNext: 'Sıradaki →', lastStep: 'Son adım.', faster: 'Hızlandır (+)', slower: 'Yavaşlat (−)',
          levels: { easy: 'kolay', normal: 'normal', hard: 'zor', extreme: 'uç' },
          groups: { normal: 'Normal', hard: 'Zor', edge: 'Uç ve anormal durumlar' } },
    en: { play: 'Play', pause: 'Pause', next: 'Next step', prev: 'Previous step', first: 'First step', last: 'Last step',
          speed: 'Speed', voice: 'Narration', step: 'Step', example: 'Example', level: 'Difficulty', random: 'Random',
          own: 'Your values', apply: 'Apply', custom: 'Your values', randomName: 'Random',
          input: 'Input', upNext: 'Next →', lastStep: 'Last step.', faster: 'Faster (+)', slower: 'Slower (−)',
          levels: { easy: 'easy', normal: 'normal', hard: 'hard', extreme: 'extreme' },
          groups: { normal: 'Normal', hard: 'Hard', edge: 'Edge and abnormal cases' } }
  };
  var CODE_NAME = { c: 'C', java: 'Java', cpp: 'C++', py: 'Python', pseudo: 'Pseudocode' };
  var SPEEDS = [0.5, 0.75, 1, 1.5, 2, 3, 4];
  function savedSpeed() { try { var v = +window.localStorage.getItem('dsanim-speed'); return SPEEDS.indexOf(v) >= 0 ? v : 1; } catch (e) { return 1; } }
  function saveSpeed(v) { try { window.localStorage.setItem('dsanim-speed', String(v)); } catch (e) { /* private mode */ } }
  function plain(s) { return String(s || '').replace(/[`*]/g, ''); }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function nums(s) { return (s || '').match(NUMS) || []; }
  function fill(s, n) { var i = 0; return s.replace(NUMS, function () { return (+n[i++]).toFixed(2); }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function fmt(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>'); }
  function pick(v, lang) { return v && typeof v === 'object' ? (v[lang] !== undefined ? v[lang] : v.en) : v; }

  function Player(root, spec, opt) {
    this.root = root; this.spec = spec; this.o = opt || {};
    this.lang = this.o.lang === 'en' ? 'en' : 'tr';
    this.i = 0; this.playing = false; this.speed = savedSpeed(); this.voice = false; this.timer = null; this.anim = null;
    // spec.code may be a function of the data (e.g. #define CAP follows the chosen example)
    this.codeOf = function (d) { return this.o.noCode ? {} : (typeof spec.code === 'function' ? spec.code(d || spec.presets[0].data) : (spec.code || {})); };
    this.code = this.codeOf(null);
    var langs = Object.keys(this.code);
    this.codeLang = (this.o.code && this.code[this.o.code]) ? this.o.code : langs[0];
    this.setup();
    var start = this.presetById(this.o.example) || spec.presets[0];
    if (this.o.seed) this.useRandom(this.o.level || 'normal', +this.o.seed, false);
    else this.useData(start.data, start.id, false);
    var first = Math.max(0, Math.min(this.frames.length - 1, (this.o.step || 1) - 1));
    if (this.o.static) first = this.frames.length - 1;
    this.go(first, false);
    if (this.o.auto && !this.o.static) this.play();
  }

  Player.prototype.presetById = function (id) {
    if (!id) return null;
    for (var i = 0; i < this.spec.presets.length; i++) if (this.spec.presets[i].id === id) return this.spec.presets[i];
    return null;
  };

  Player.prototype.setup = function () {
    var s = this.spec, y = TEXT[this.lang], self = this;
    this.root.classList.add('dsa', 'dsa-dil-' + this.lang);
    if (this.o.static) this.root.classList.add('dsa-statik');
    if (this.o.slide) document.documentElement.classList.add('dsa-slayt');

    var top = el('div', 'dsa-ust');
    top.appendChild(el('div', 'dsa-baslik', esc(pick(s.title, this.lang))));
    this.counter = el('div', 'dsa-sayac');
    top.appendChild(this.counter);
    this.root.appendChild(top);

    // example bar
    var bar = el('div', 'dsa-ornek');
    this.sel = el('select', 'dsa-sec');
    this.sel.title = y.example; this.sel.setAttribute('aria-label', y.example);
    ['normal', 'hard', 'edge'].forEach(function (lvl) {
      var ps = s.presets.filter(function (p) { return (p.level || 'normal') === lvl; });
      if (!ps.length) return;
      var g = el('optgroup'); g.label = y.groups[lvl];
      ps.forEach(function (p) { var op = el('option', '', esc(pick(p.name, self.lang))); op.value = p.id; g.appendChild(op); });
      self.sel.appendChild(g);
    });
    var gx = el('optgroup'); gx.label = '—';
    var opR = el('option', '', '🎲 ' + y.randomName); opR.value = '__random'; gx.appendChild(opR);
    if (s.input) { var opC = el('option', '', '✎ ' + y.custom); opC.value = '__custom'; gx.appendChild(opC); }
    this.sel.appendChild(gx);
    this.sel.addEventListener('change', function () {
      var v = self.sel.value;
      if (v === '__random') self.useRandom(self.levelSel.value, null, true);
      else if (v === '__custom') { self.ownRow.hidden = false; self.ownInput.focus(); }
      else { var p = self.presetById(v); self.useData(p.data, p.id, true); }
    });
    bar.appendChild(el('span', 'dsa-etk', y.example));
    bar.appendChild(this.sel);

    this.levelSel = el('select', 'dsa-sec dsa-zor');
    this.levelSel.title = y.level;
    (s.levels || ['easy', 'normal', 'hard', 'extreme']).forEach(function (l) {
      var op = el('option', '', y.levels[l] || l); op.value = l; if (l === 'normal') op.selected = true; self.levelSel.appendChild(op);
    });
    var dice = el('button', 'dsa-d dsa-zar', '🎲');
    dice.type = 'button'; dice.title = y.random + ' (' + y.level.toLowerCase() + ')';
    dice.addEventListener('click', function () { self.useRandom(self.levelSel.value, null, true); });
    if (s.random) { bar.appendChild(el('span', 'dsa-etk', y.level)); bar.appendChild(this.levelSel); bar.appendChild(dice); }
    this.root.appendChild(bar);

    // own values
    this.ownRow = el('div', 'dsa-kendi');
    this.ownRow.hidden = true;
    if (s.input) {
      this.ownInput = el('input', 'dsa-girdi');
      this.ownInput.type = 'text';
      this.ownInput.placeholder = pick(s.input.hint, this.lang) || '';
      this.ownInput.setAttribute('aria-label', y.own);
      var ap = el('button', 'dsa-d dsa-uygula', y.apply); ap.type = 'button'; this.applyBtn = ap;
      this.err = el('div', 'dsa-hata');
      var applyOwn = function () {
        try {
          var data = s.input.parse(self.ownInput.value);
          self.err.textContent = '';
          self.useData(data, '__custom', true);
        } catch (e) {
          self.err.textContent = pick(e && (e.tr || e.en) ? e : { tr: String(e.message || e), en: String(e.message || e) }, self.lang);
        }
      };
      ap.addEventListener('click', applyOwn);
      this.ownInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyOwn(); } });
      this.ownRow.appendChild(el('span', 'dsa-etk', y.own));
      this.ownRow.appendChild(this.ownInput);
      this.ownRow.appendChild(ap);
      this.ownRow.appendChild(this.err);
    }
    this.root.appendChild(this.ownRow);

    // input strip: every input value from the first step on; the one being processed (frame.at) is highlighted
    this.tape = el('div', 'dsa-serit');
    this.tape.hidden = !s.input;
    this.root.appendChild(this.tape);

    var ctl = el('div', 'dsa-denetim');
    function btn(html, title, fn) { var b = el('button', 'dsa-d', html); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.addEventListener('click', fn); ctl.appendChild(b); return b; }
    btn('&#x23EE;', y.first, function () { self.stop(); self.go(0, true); });
    btn('&#x25C0;', y.prev, function () { self.stop(); self.go(self.i - 1, true); });
    this.playBtn = btn('&#x25B6;', y.play, function () { self.playing ? self.stop() : self.play(); });
    this.playBtn.classList.add('dsa-ana');
    btn('&#x25B6;&#x2759;', y.next, function () { self.stop(); self.go(self.i + 1, true); });
    btn('&#x23ED;', y.last, function () { self.stop(); self.go(self.frames.length - 1, true); });
    this.slider = el('input', 'dsa-cubuk');
    this.slider.type = 'range'; this.slider.min = 1;
    this.slider.setAttribute('aria-label', y.step);
    this.slider.addEventListener('input', function () { self.stop(); self.go(+self.slider.value - 1, false); });
    ctl.appendChild(this.slider);
    var sp = el('select', 'dsa-hiz');
    sp.title = y.speed; sp.setAttribute('aria-label', y.speed);
    SPEEDS.forEach(function (h) { var op = el('option', '', h + '×'); op.value = h; if (h === self.speed) op.selected = true; sp.appendChild(op); });
    this.setSpeed = function (v) { self.speed = v; sp.value = String(v); saveSpeed(v); };
    sp.addEventListener('change', function () { self.setSpeed(+sp.value); });
    btn('&minus;', y.slower, function () { var k = SPEEDS.indexOf(self.speed); if (k > 0) self.setSpeed(SPEEDS[k - 1]); });
    ctl.appendChild(sp);
    btn('+', y.faster, function () { var k = SPEEDS.indexOf(self.speed); if (k < SPEEDS.length - 1) self.setSpeed(SPEEDS[k + 1]); });
    if ('speechSynthesis' in window) {
      this.voiceBtn = btn('&#x1F507;', y.voice, function () {
        self.voice = !self.voice; self.voiceBtn.innerHTML = self.voice ? '&#x1F50A;' : '&#x1F507;';
        self.voiceBtn.classList.toggle('etkin', self.voice);
        if (self.voice) self.say(); else window.speechSynthesis.cancel();
      });
    }
    this.root.appendChild(ctl);


    var body = el('div', 'dsa-govde' + (Object.keys(this.code).length ? '' : ' dsa-kodsuz'));
    var stage = el('div', 'dsa-sahne');
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('role', 'img');
    stage.appendChild(this.svg);
    body.appendChild(stage);
    if (Object.keys(this.code).length) {
      var box = el('div', 'dsa-kod'), tabs = el('div', 'dsa-sekme');
      Object.keys(this.code).forEach(function (k) {
        var b = el('button', k === self.codeLang ? 'etkin' : '', CODE_NAME[k] || k);
        b.type = 'button';
        b.addEventListener('click', function () {
          self.codeLang = k; self.drawCode(); self.markCode();
          Array.prototype.forEach.call(tabs.children, function (c) { c.classList.toggle('etkin', c === b); });
        });
        tabs.appendChild(b);
      });
      box.appendChild(tabs);
      this.pre = el('pre', 'dsa-pre');
      box.appendChild(this.pre);
      body.appendChild(box);
    }
    this.root.appendChild(body);

    this.cap = el('div', 'dsa-cap');
    this.cap.setAttribute('aria-live', 'polite');
    this.root.appendChild(this.cap);
    this.nextEl = el('div', 'dsa-sonraki');
    this.root.appendChild(this.nextEl);


    this.root.tabIndex = 0;
    this.root.addEventListener('keydown', function (e) {
      var t = e.target.tagName;
      if (t === 'SELECT' || t === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); self.playing ? self.stop() : self.play(); }
      else if (e.key === 'ArrowRight' || e.key === 'l') { e.preventDefault(); self.stop(); self.go(self.i + 1, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'j') { e.preventDefault(); self.stop(); self.go(self.i - 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); self.stop(); self.go(0, true); }
      else if (e.key === 'End') { e.preventDefault(); self.stop(); self.go(self.frames.length - 1, true); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); var k1 = SPEEDS.indexOf(self.speed); if (k1 < SPEEDS.length - 1) self.setSpeed(SPEEDS[k1 + 1]); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); var k2 = SPEEDS.indexOf(self.speed); if (k2 > 0) self.setSpeed(SPEEDS[k2 - 1]); }
    });
    this.drawCode();
  };

  /** Build all frames for a dataset and show the first one. */
  Player.prototype.useData = function (data, id, reset) {
    var S = new window.DSAnim.Scene();
    this.spec.build(S, data);
    if (!S.frames.length) S.step({ tr: '(boş)', en: '(empty)' }, {});
    this.frames = S.frames;
    this.data = data;
    if (typeof this.spec.code === 'function') { this.code = this.codeOf(data); this.drawCode(); }
    this.vb = window.DSAnim.viewBox(this.frames);
    this.svg.setAttribute('viewBox', this.vb.join(' '));
    this.svg.innerHTML = window.DSAnim.defs() + '<g class="kat kat-arka"></g><g class="kat kat-ok"></g><g class="kat kat-sekil"></g><g class="kat kat-etiket"></g>';
    this.inner = this.frames.map(function (f) { return window.DSAnim.render(f.state, f.order, null); });
    if (this.sel && id && id.indexOf('__') !== 0) this.sel.value = id;
    if (this.spec.input && this.ownInput) this.ownInput.value = this.spec.input.format(data);
    this.drawTape(data);
    this.slider.max = this.frames.length;
    this.i = 0;
    if (reset) { this.stop(); this.go(0, false); }
  };

  Player.prototype.useRandom = function (level, seed, reset) {
    if (!this.spec.random) return;
    var sd = seed || Math.floor(Math.random() * 1e9);
    var data = this.spec.random(level, window.DSAnim.rng(sd));
    this.useData(data, '__random', reset);
    if (this.sel) this.sel.value = '__random';
    if (this.levelSel) this.levelSel.value = level;
  };

  Player.prototype.drawTape = function (data) {
    if (!this.tape || !this.spec.input) return;
    var inp = this.spec.input, toks = inp.tokens ? inp.tokens(data) : String(inp.format(data)).split(/\s+/).filter(Boolean);
    this.tape.innerHTML = '<span class="dsa-etk">' + esc(TEXT[this.lang].input) + '</span>';
    var self = this;
    this.chips = toks.map(function (t) { var c = el('span', 'dsa-jeton', esc(t)); self.tape.appendChild(c); return c; });
  };
  Player.prototype.markTape = function (at) {
    if (!this.chips) return;
    var cur = null;
    this.chips.forEach(function (c, k) {
      var has = at !== undefined && at !== null;
      c.classList.toggle('bitti', has && k < at);
      c.classList.toggle('simdi', has && k === at);
      c.classList.toggle('sonra', has && k === at + 1);
      if (has && k === at) cur = c;
    });
    if (cur && this.tape.scrollWidth > this.tape.clientWidth) this.tape.scrollLeft = Math.max(0, cur.offsetLeft - this.tape.clientWidth / 3);
  };
  Player.prototype.drawCode = function () {
    if (!this.pre) return;
    var lines = this.code[this.codeLang] || [];
    this.pre.innerHTML = lines.map(function (s, i) {
      return '<span class="dsa-sat" data-n="' + (i + 1) + '"><span class="dsa-no">' + (i + 1) + '</span>' + (esc(s) || ' ') + '</span>';
    }).join('');
  };

  Player.prototype.markCode = function () {
    if (!this.pre) return;
    var f = this.frames[this.i], hot = (f.lines && f.lines[this.codeLang]) || [], first = null;
    Array.prototype.forEach.call(this.pre.children, function (s) {
      var on = hot.indexOf(+s.getAttribute('data-n')) >= 0;
      s.classList.toggle('vurgu', on);
      if (on && !first) first = s;
    });
    if (first) {
      var p = this.pre, top = first.offsetTop - p.offsetTop;
      if (top < p.scrollTop || top > p.scrollTop + p.clientHeight - 30) p.scrollTop = Math.max(0, top - 40);
    }
  };

  Player.prototype.go = function (target, animate) {
    var n = this.frames.length;
    if (target < 0 || target >= n) { if (target >= n) this.stop(); return; }
    var jump = Math.abs(target - this.i) !== 1;
    this.i = target;
    this.morph(this.inner[target], animate && !jump && !this.o.static);
    var f = this.frames[target];
    this.cap.innerHTML = fmt(pick(f.cap, this.lang) || '');
    this.counter.textContent = TEXT[this.lang].step + ' ' + (target + 1) + ' / ' + n;
    this.markTape(f.at);
    var nf = this.frames[target + 1], y2 = TEXT[this.lang];
    if (nf) {
      var nc = plain(pick(nf.cap, this.lang)), cut = nc.search(/[.!?](\s|$)/);
      if (cut > 20 && cut < 150) nc = nc.slice(0, cut + 1); else if (nc.length > 150) nc = nc.slice(0, 147) + '…';
      this.nextEl.innerHTML = '<span class="dsa-sonraki-etk">' + esc(y2.upNext) + '</span> ' + esc(nc);
    } else this.nextEl.innerHTML = '<span class="dsa-sonraki-etk">' + esc(y2.lastStep) + '</span>';
    this.slider.value = target + 1;
    this.markCode();
    if (this.voice) this.say();
  };

  Player.prototype.morph = function (html, animate) {
    var self = this, tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tmp.innerHTML = html;
    if (this.anim) { cancelAnimationFrame(this.anim); this.anim = null; if (this.finish) this.finish(); }
    var jobs = [];
    ['arka', 'ok', 'sekil', 'etiket'].forEach(function (layer) {
      var live = self.svg.querySelector('.kat-' + layer), next = tmp.querySelector('.kat-' + layer);
      if (!live || !next) return;
      var old = {};
      Array.prototype.forEach.call(live.children, function (c) { if (!c.classList.contains('dsa-cikis')) old[c.getAttribute('data-id')] = c; });
      var order = [];
      Array.prototype.slice.call(next.children).forEach(function (y) {
        var id = y.getAttribute('data-id'), o = old[id];
        if (o && o.tagName === y.tagName) {
          delete old[id];
          var attr = y.tagName === 'path' ? 'd' : 'transform', from = o.getAttribute(attr), to = y.getAttribute(attr);
          var a = nums(from), b = nums(to);
          if (y.tagName === 'g') self.updateInner(o, y);
          o.setAttribute('class', y.getAttribute('class'));
          ['stroke', 'marker-end', 'opacity'].forEach(function (k) { if (y.hasAttribute(k)) o.setAttribute(k, y.getAttribute(k)); else if (k !== 'stroke') o.removeAttribute(k); });
          if (animate && a.length && a.length === b.length && from !== to) jobs.push({ e: o, n: attr, a: a, b: b, s: to });
          else o.setAttribute(attr, to);
          order.push(o);
        } else {
          var ne = y.cloneNode(true);
          if (animate) ne.classList.add('dsa-giris');
          order.push(ne);
        }
      });
      Object.keys(old).forEach(function (id) {
        var c = old[id];
        if (animate) { c.classList.add('dsa-cikis'); setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 450); }
        else live.removeChild(c);
      });
      order.forEach(function (e) { live.appendChild(e); });
      if (animate) requestAnimationFrame(function () { requestAnimationFrame(function () {
        Array.prototype.forEach.call(live.querySelectorAll('.dsa-giris'), function (e) { e.classList.remove('dsa-giris'); });
      }); });
    });
    if (!jobs.length) return;
    var dur = 480 / this.speed, t0 = null;
    this.finish = function () { jobs.forEach(function (j) { j.e.setAttribute(j.n, j.s); }); self.finish = null; };
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = ease(p);
      jobs.forEach(function (j) { j.e.setAttribute(j.n, fill(j.s, j.a.map(function (x, k) { return +x + (+j.b[k] - +x) * e; }))); });
      if (p < 1) self.anim = requestAnimationFrame(tick); else { self.anim = null; if (self.finish) self.finish(); }
    }
    this.anim = requestAnimationFrame(tick);
  };

  Player.prototype.updateInner = function (o, y) {
    var a = o.children, b = y.children, same = a.length === b.length;
    for (var k = 0; same && k < a.length; k++) if (a[k].tagName !== b[k].tagName) same = false;
    if (!same) { o.innerHTML = y.innerHTML; return; }
    for (var j = 0; j < a.length; j++) {
      var ea = a[j], eb = b[j];
      Array.prototype.forEach.call(eb.attributes, function (at) { if (ea.getAttribute(at.name) !== at.value) ea.setAttribute(at.name, at.value); });
      Array.prototype.slice.call(ea.attributes).forEach(function (at) { if (!eb.hasAttribute(at.name)) ea.removeAttribute(at.name); });
      if (ea.innerHTML !== eb.innerHTML) ea.innerHTML = eb.innerHTML;
    }
  };

  Player.prototype.wait = function () { var c = pick(this.frames[this.i].cap, this.lang) || ''; return (700 + c.length * 20) / this.speed; };
  Player.prototype.play = function () {
    var self = this;
    if (this.i >= this.frames.length - 1) this.go(0, false);
    this.playing = true; this.playBtn.innerHTML = '&#x23F8;'; this.playBtn.title = TEXT[this.lang].pause;
    function next() {
      if (!self.playing) return;
      if (self.i >= self.frames.length - 1) { self.stop(); return; }
      self.go(self.i + 1, true);
      self.schedule(next);
    }
    this.schedule(next);
  };
  Player.prototype.schedule = function (fn) {
    var self = this;
    clearTimeout(this.timer);
    if (this.voice && this.utter) {
      var done = false, backup = setTimeout(function () { if (!done) { done = true; fn(); } }, 20000);
      this.utter.onend = function () { if (!done) { done = true; clearTimeout(backup); self.timer = setTimeout(fn, 500 / self.speed); } };
    } else this.timer = setTimeout(fn, this.wait());
  };
  Player.prototype.stop = function () {
    this.playing = false; clearTimeout(this.timer);
    if (this.playBtn) { this.playBtn.innerHTML = '&#x25B6;'; this.playBtn.title = TEXT[this.lang].play; }
  };
  Player.prototype.say = function () {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance((pick(this.frames[this.i].cap, this.lang) || '').replace(/[`*]/g, ''));
    u.lang = this.lang === 'tr' ? 'tr-TR' : 'en-US';
    u.rate = Math.min(1.6, 0.95 * this.speed);
    var v = window.speechSynthesis.getVoices().filter(function (s) { return s.lang && s.lang.toLowerCase().indexOf(u.lang.slice(0, 2).toLowerCase()) === 0; });
    if (v.length) u.voice = v[0];
    this.utter = u;
    window.speechSynthesis.speak(u);
  };

  function theme() {
    try {
      var p = window.parent && window.parent !== window ? window.parent.document.body : null, s = p && p.getAttribute('data-md-color-scheme');
      if (s === 'slate') document.documentElement.classList.add('dsa-koyu');
      else if (s === 'default') document.documentElement.classList.add('dsa-acik');
    } catch (e) { /* other origin: follow the OS theme */ }
  }
  function reportHeight(id) {
    if (window.parent === window) return;
    var last = 0;
    function send() {
      var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
      if (Math.abs(h - last) > 2) { last = h; window.parent.postMessage({ dsanim: true, ad: id, yukseklik: h }, '*'); }
    }
    if ('ResizeObserver' in window) new ResizeObserver(send).observe(document.documentElement);
    window.addEventListener('load', send);
    setTimeout(send, 300);
  }

  function start() {
    var q = new URLSearchParams(location.search);
    function p(a, b) { return q.get(a) !== null ? q.get(a) : q.get(b); }
    var ids = Object.keys(window.DSAnim.registry);
    Array.prototype.forEach.call(document.querySelectorAll('[data-dsanim]'), function (root, k) {
      var spec = window.DSAnim.registry[root.getAttribute('data-dsanim')] || window.DSAnim.registry[ids[k]];
      if (!spec) return;
      theme();
      var codeArg = p('code', 'kod'), mode = p('mode', 'yer');
      var player = new Player(root, spec, {
        lang: q.get('lang') || (document.documentElement.lang || 'tr').slice(0, 2),
        example: q.get('example'), level: q.get('level'), seed: q.get('seed'),
        step: +(p('step', 'kare') || 1), auto: p('auto', 'oto') === '1', static: p('static', 'statik') === '1',
        code: codeArg, noCode: codeArg === '0', slide: mode === 'slide' || mode === 'slayt'
      });
      if (window.parent === window || q.get('focus') === '1') root.focus({ preventScroll: true });
      reportHeight(spec.id);
      if (q.get('selftest') === '1') selftest(player, spec);
    });
  }
  /** ?selftest=1 — drive the real UI: every example, random data at every level, own values (good and bad). */
  function selftest(player, spec) {
    var errors = [], runs = 0;
    window.addEventListener('error', function (e) { errors.push('window error: ' + e.message); });
    function walk(label) {
      if (!player.frames.length) errors.push(label + ': no frames');
      for (var i = 0; i < player.frames.length; i++) player.go(i, false);
      if (!player.svg.querySelectorAll('[data-id]').length) errors.push(label + ': nothing drawn');
      if (!player.cap.textContent.trim()) errors.push(label + ': empty caption');
      runs++;
    }
    try {
      spec.presets.forEach(function (p) {
        player.sel.value = p.id; player.sel.dispatchEvent(new Event('change')); walk('example ' + p.id);
      });
      (spec.levels || ['easy', 'normal', 'hard', 'extreme']).forEach(function (l) {
        for (var s = 1; s <= 5; s++) { player.useRandom(l, s, true); walk('random ' + l + '/' + s); }
      });
      if (spec.input) {
        player.ownInput.value = spec.input.format(spec.presets[spec.presets.length - 1].data);
        player.applyBtn.click();
        if (player.err.textContent) errors.push('own values rejected: ' + player.err.textContent);
        walk('own values');
        player.ownInput.value = (spec.input.bad && spec.input.bad[1]) || '@@@';
        player.applyBtn.click();
        if (!player.err.textContent) errors.push('bad own values were accepted');
      }
      player.go(0, false); player.go(1, true); player.go(2, true);   // animated transitions must not throw
    } catch (e) { errors.push(String(e && e.stack || e)); }
    var out = document.createElement('pre');
    out.id = 'dsa-selftest';
    out.textContent = JSON.stringify({ id: spec.id, ok: !errors.length, runs: runs, errors: errors });
    document.body.appendChild(out);
  }

  window.DSAnimPlayer = Player;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
