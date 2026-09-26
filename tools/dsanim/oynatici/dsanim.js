/* dsanim oynatıcı — veri yapısı operasyonlarını adım adım oynatır.
 * Kareler Python (dsanim.py) tarafından SVG olarak üretilir; burada öğeler data-id ile eşlenir,
 * konumlar (transform, path d) yumuşak kaydırılır, renkler CSS geçişiyle değişir, yeni öğeler belirir,
 * silinenler solar. Denetimler: ⏮ ◀ ▶/⏸ ▶ ⏭, hız, sesli anlatım (tarayıcının konuşma sentezi), kod dili.
 * Klavye: boşluk = oynat/duraklat, ← → = adım, Home/End = baş/son.
 * URL parametreleri: lang=tr|en, kare=N, oto=1, kod=c|java, statik=1 (yazdırma: denetim yok, son kare).
 */
(function () {
  'use strict';
  var SAYI = /-?\d*\.?\d+(?:e-?\d+)?/g;
  var YAZI = {
    tr: { oynat: 'Oynat', dur: 'Duraklat', ileri: 'Sonraki adım', geri: 'Önceki adım', bas: 'Başa dön',
          son: 'Sona git', hiz: 'Hız', ses: 'Sesli anlatım', adim: 'Adım', kod: 'Kod' },
    en: { oynat: 'Play', dur: 'Pause', ileri: 'Next step', geri: 'Previous step', bas: 'First step',
          son: 'Last step', hiz: 'Speed', ses: 'Narration', adim: 'Step', kod: 'Code' }
  };
  var KOD_AD = { c: 'C', java: 'Java', cpp: 'C++', py: 'Python', pseudo: 'Pseudocode' };

  function yumusak(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function sayilar(s) { return (s || '').match(SAYI) || []; }
  function doldur(s, n) { var i = 0; return s.replace(SAYI, function () { return (+n[i++]).toFixed(2); }); }
  function el(ad, sinif, ic) { var e = document.createElement(ad); if (sinif) e.className = sinif; if (ic != null) e.innerHTML = ic; return e; }
  function kacis(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function bicim(s) {
    return kacis(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  }

  function Oynatici(kok, veri, secenek) {
    this.kok = kok; this.s = secenek || {};
    this.v = this.s.kodYok ? Object.assign({}, veri, { kod: {} }) : veri;
    veri = this.v;
    this.dil = (this.s.dil === 'en' || this.s.dil === 'tr') ? this.s.dil : 'tr';
    this.i = 0; this.oynuyor = false; this.hiz = 1; this.ses = false; this.zaman = null; this.anim = null;
    var diller = Object.keys(veri.kod || {});
    this.kodDil = (this.s.kod && veri.kod[this.s.kod]) ? this.s.kod : diller[0];
    this.kur();
    var bas = Math.max(0, Math.min(veri.kareler.length - 1, (this.s.kare || 1) - 1));
    if (this.s.statik) bas = veri.kareler.length - 1;
    this.git(bas, false);
    if (this.s.oto && !this.s.statik) this.oynat();
  }

  Oynatici.prototype.kur = function () {
    var v = this.v, y = YAZI[this.dil], self = this;
    this.kok.classList.add('dsa', 'dsa-dil-' + this.dil);
    if (this.s.statik) this.kok.classList.add('dsa-statik');
    if (this.s.yer === 'slayt') document.documentElement.classList.add('dsa-slayt');
    var ust = el('div', 'dsa-ust');
    ust.appendChild(el('div', 'dsa-baslik', kacis(v.baslik[this.dil] || v.baslik.en)));
    this.sayac = el('div', 'dsa-sayac');
    ust.appendChild(this.sayac);
    this.kok.appendChild(ust);

    var govde = el('div', 'dsa-govde' + (v.kod && Object.keys(v.kod).length ? '' : ' dsa-kodsuz'));
    var sahneKap = el('div', 'dsa-sahne');
    var ns = 'http://www.w3.org/2000/svg';
    this.svg = document.createElementNS(ns, 'svg');
    this.svg.setAttribute('viewBox', (v.vb || [0, 0, v.gen, v.yuk]).join(' '));
    this.svg.setAttribute('role', 'img');
    this.svg.innerHTML = v.tanim + '<g class="kat kat-arka"></g><g class="kat kat-ok"></g><g class="kat kat-sekil"></g><g class="kat kat-etiket"></g>';
    sahneKap.appendChild(this.svg);
    govde.appendChild(sahneKap);

    if (v.kod && Object.keys(v.kod).length) {
      var kodKap = el('div', 'dsa-kod');
      var sekme = el('div', 'dsa-sekme');
      Object.keys(v.kod).forEach(function (k) {
        var b = el('button', k === self.kodDil ? 'etkin' : '', KOD_AD[k] || k);
        b.type = 'button';
        b.addEventListener('click', function () { self.kodDil = k; self.kodCiz(); self.kodVurgu(); Array.prototype.forEach.call(sekme.children, function (c) { c.classList.toggle('etkin', c === b); }); });
        sekme.appendChild(b);
      });
      kodKap.appendChild(sekme);
      this.pre = el('pre', 'dsa-pre');
      kodKap.appendChild(this.pre);
      govde.appendChild(kodKap);
    }
    this.kok.appendChild(govde);

    this.cap = el('div', 'dsa-cap');
    this.cap.setAttribute('aria-live', 'polite');
    this.kok.appendChild(this.cap);

    var den = el('div', 'dsa-denetim');
    function dugme(ic, baslik, fn) { var b = el('button', 'dsa-d', ic); b.type = 'button'; b.title = baslik; b.setAttribute('aria-label', baslik); b.addEventListener('click', fn); den.appendChild(b); return b; }
    dugme('&#x23EE;', y.bas, function () { self.dur(); self.git(0, true); });
    dugme('&#x25C0;', y.geri, function () { self.dur(); self.git(self.i - 1, true); });
    this.oBtn = dugme('&#x25B6;', y.oynat, function () { self.oynuyor ? self.dur() : self.oynat(); });
    this.oBtn.classList.add('dsa-ana');
    dugme('&#x25B6;&#x2759;', y.ileri, function () { self.dur(); self.git(self.i + 1, true); });
    dugme('&#x23ED;', y.son, function () { self.dur(); self.git(v.kareler.length - 1, true); });
    this.cubuk = el('input', 'dsa-cubuk');
    this.cubuk.type = 'range'; this.cubuk.min = 1; this.cubuk.max = v.kareler.length; this.cubuk.value = 1;
    this.cubuk.setAttribute('aria-label', y.adim);
    this.cubuk.addEventListener('input', function () { self.dur(); self.git(+self.cubuk.value - 1, false); });
    den.appendChild(this.cubuk);
    var hiz = el('select', 'dsa-hiz');
    hiz.title = y.hiz;
    [0.5, 0.75, 1, 1.5, 2].forEach(function (h) { var o = el('option', '', h + '×'); o.value = h; if (h === 1) o.selected = true; hiz.appendChild(o); });
    hiz.addEventListener('change', function () { self.hiz = +hiz.value; });
    den.appendChild(hiz);
    if ('speechSynthesis' in window) {
      this.sBtn = dugme('&#x1F507;', y.ses, function () {
        self.ses = !self.ses; self.sBtn.innerHTML = self.ses ? '&#x1F50A;' : '&#x1F507;';
        self.sBtn.classList.toggle('etkin', self.ses);
        if (self.ses) self.konus(); else window.speechSynthesis.cancel();
      });
    }
    this.kok.appendChild(den);

    this.kok.tabIndex = 0;
    this.kok.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); self.oynuyor ? self.dur() : self.oynat(); }
      else if (e.key === 'ArrowRight' || e.key === 'l') { e.preventDefault(); self.dur(); self.git(self.i + 1, true); }
      else if (e.key === 'ArrowLeft' || e.key === 'j') { e.preventDefault(); self.dur(); self.git(self.i - 1, true); }
      else if (e.key === 'Home') { e.preventDefault(); self.dur(); self.git(0, true); }
      else if (e.key === 'End') { e.preventDefault(); self.dur(); self.git(v.kareler.length - 1, true); }
    });
    this.kodCiz();
  };

  Oynatici.prototype.kodCiz = function () {
    if (!this.pre) return;
    var satirlar = this.v.kod[this.kodDil] || [];
    this.pre.innerHTML = satirlar.map(function (s, i) {
      return '<span class="dsa-sat" data-n="' + (i + 1) + '"><span class="dsa-no">' + (i + 1) + '</span>' + (kacis(s) || ' ') + '</span>';
    }).join('');
  };

  Oynatici.prototype.kodVurgu = function () {
    if (!this.pre) return;
    var k = this.v.kareler[this.i], hat = (k.satir && k.satir[this.kodDil]) || [], ilk = null;
    Array.prototype.forEach.call(this.pre.children, function (s) {
      var on = hat.indexOf(+s.getAttribute('data-n')) >= 0;
      s.classList.toggle('vurgu', on);
      if (on && !ilk) ilk = s;
    });
    if (ilk) {
      var p = this.pre, ust = ilk.offsetTop - p.offsetTop;
      if (ust < p.scrollTop || ust > p.scrollTop + p.clientHeight - 30) p.scrollTop = Math.max(0, ust - 40);
    }
  };

  Oynatici.prototype.git = function (hedef, gecis) {
    var n = this.v.kareler.length;
    if (hedef < 0 || hedef >= n) { if (hedef >= n) this.dur(); return; }
    var yeni = this.v.kareler[hedef];
    var buyuk = Math.abs(hedef - this.i) !== 1;
    this.i = hedef;
    this.morf(yeni.ic, gecis && !buyuk && !this.s.statik);
    this.cap.innerHTML = bicim(yeni.cap[this.dil] || yeni.cap.en || '');
    this.sayac.textContent = YAZI[this.dil].adim + ' ' + (hedef + 1) + ' / ' + n;
    this.cubuk.value = hedef + 1;
    this.kodVurgu();
    if (this.ses) this.konus();
  };

  Oynatici.prototype.morf = function (ic, gecis) {
    var self = this;
    var tmp = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    tmp.innerHTML = ic;
    if (this.anim) { cancelAnimationFrame(this.anim); this.anim = null; this.animBitir && this.animBitir(); }
    var isler = [];
    ['arka', 'ok', 'sekil', 'etiket'].forEach(function (kat) {
      var canli = self.svg.querySelector('.kat-' + kat), yeniKat = tmp.querySelector('.kat-' + kat);
      if (!canli || !yeniKat) return;
      var eski = {};
      Array.prototype.forEach.call(canli.children, function (c) { if (!c.classList.contains('dsa-cikis')) eski[c.getAttribute('data-id')] = c; });
      var sira = [];
      Array.prototype.slice.call(yeniKat.children).forEach(function (y) {
        var id = y.getAttribute('data-id'), o = eski[id];
        if (o && o.tagName === y.tagName) {
          delete eski[id];
          var nitelik = y.tagName === 'path' ? 'd' : 'transform';
          var bas = o.getAttribute(nitelik), son = y.getAttribute(nitelik);
          var a = sayilar(bas), b = sayilar(son);
          // iç yapı: aynıysa nitelikleri yerinde güncelle (CSS renk geçişi çalışsın), değilse değiştir
          if (y.tagName === 'g') self.icGuncelle(o, y);
          o.setAttribute('class', y.getAttribute('class'));
          ['stroke', 'marker-end', 'opacity'].forEach(function (k) { if (y.hasAttribute(k)) o.setAttribute(k, y.getAttribute(k)); else if (k === 'opacity') o.removeAttribute(k); });
          if (gecis && a.length && a.length === b.length && bas !== son) isler.push({ e: o, n: nitelik, a: a, b: b, s: son });
          else o.setAttribute(nitelik, son);
          sira.push(o);
        } else {
          var yeniE = y.cloneNode(true);
          if (gecis) { yeniE.classList.add('dsa-giris'); }
          sira.push(yeniE);
        }
      });
      Object.keys(eski).forEach(function (id) {
        var c = eski[id];
        if (gecis) { c.classList.add('dsa-cikis'); setTimeout(function () { if (c.parentNode) c.parentNode.removeChild(c); }, 450); }
        else canli.removeChild(c);
      });
      sira.forEach(function (e) { if (e.parentNode !== canli) canli.appendChild(e); });
      if (gecis) requestAnimationFrame(function () { requestAnimationFrame(function () {
        Array.prototype.forEach.call(canli.querySelectorAll('.dsa-giris'), function (e) { e.classList.remove('dsa-giris'); });
      }); });
    });
    if (!isler.length) return;
    var sure = 650 / this.hiz, t0 = null;
    this.animBitir = function () { isler.forEach(function (j) { j.e.setAttribute(j.n, j.s); }); self.animBitir = null; };
    function adim(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / sure), e = yumusak(p);
      isler.forEach(function (j) {
        var ara = j.a.map(function (x, k) { return +x + (+j.b[k] - +x) * e; });
        j.e.setAttribute(j.n, doldur(j.s, ara));
      });
      if (p < 1) self.anim = requestAnimationFrame(adim);
      else { self.anim = null; self.animBitir && self.animBitir(); }
    }
    this.anim = requestAnimationFrame(adim);
  };

  Oynatici.prototype.icGuncelle = function (o, y) {
    var a = o.children, b = y.children, ayni = a.length === b.length;
    for (var k = 0; ayni && k < a.length; k++) if (a[k].tagName !== b[k].tagName) ayni = false;
    if (!ayni) { o.innerHTML = y.innerHTML; return; }
    for (var j = 0; j < a.length; j++) {
      var ea = a[j], eb = b[j];
      Array.prototype.forEach.call(eb.attributes, function (at) { if (ea.getAttribute(at.name) !== at.value) ea.setAttribute(at.name, at.value); });
      Array.prototype.slice.call(ea.attributes).forEach(function (at) { if (!eb.hasAttribute(at.name)) ea.removeAttribute(at.name); });
      if (ea.textContent !== eb.textContent) ea.textContent = eb.textContent;
    }
  };

  Oynatici.prototype.bekleme = function () {
    var c = this.v.kareler[this.i].cap[this.dil] || '';
    return (1300 + c.length * 38) / this.hiz;
  };

  Oynatici.prototype.oynat = function () {
    var self = this;
    if (this.i >= this.v.kareler.length - 1) this.git(0, false);
    this.oynuyor = true;
    this.oBtn.innerHTML = '&#x23F8;'; this.oBtn.title = YAZI[this.dil].dur;
    function sonraki() {
      if (!self.oynuyor) return;
      if (self.i >= self.v.kareler.length - 1) { self.dur(); return; }
      self.git(self.i + 1, true);
      self.zamanla(sonraki);
    }
    this.zamanla(sonraki);
  };

  Oynatici.prototype.zamanla = function (fn) {
    var self = this;
    clearTimeout(this.zaman);
    if (this.ses && this.soz) {
      var bitti = false, yedek = setTimeout(function () { if (!bitti) { bitti = true; fn(); } }, 20000);
      this.soz.onend = function () { if (!bitti) { bitti = true; clearTimeout(yedek); self.zaman = setTimeout(fn, 500 / self.hiz); } };
    } else {
      this.zaman = setTimeout(fn, this.bekleme());
    }
  };

  Oynatici.prototype.dur = function () {
    this.oynuyor = false; clearTimeout(this.zaman);
    if (this.oBtn) { this.oBtn.innerHTML = '&#x25B6;'; this.oBtn.title = YAZI[this.dil].oynat; }
  };

  Oynatici.prototype.konus = function () {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    var metin = (this.v.kareler[this.i].cap[this.dil] || '').replace(/[`*]/g, '');
    var u = new SpeechSynthesisUtterance(metin);
    u.lang = this.dil === 'tr' ? 'tr-TR' : 'en-US';
    u.rate = Math.min(1.6, 0.95 * this.hiz);
    var ses = window.speechSynthesis.getVoices().filter(function (s) { return s.lang && s.lang.toLowerCase().indexOf(u.lang.slice(0, 2).toLowerCase()) === 0; });
    if (ses.length) u.voice = ses[0];
    this.soz = u;
    window.speechSynthesis.speak(u);
  };

  function temaUygula(kok) {
    try {
      var p = window.parent && window.parent !== window ? window.parent.document.body : null;
      var sema = p && p.getAttribute('data-md-color-scheme');
      if (sema === 'slate') kok.classList.add('dsa-koyu');
      else if (sema === 'default') kok.classList.add('dsa-acik');
    } catch (e) { /* farklı köken: işletim sistemi temasına uy */ }
  }

  // Gömülü (iframe) kullanımda sayfaya kendi yüksekliğini bildirir; sayfa iframe boyunu buna göre ayarlar
  function yukseklikBildir(ad) {
    if (window.parent === window) return;
    var son = 0;
    function gonder() {
      var h = Math.ceil(document.documentElement.getBoundingClientRect().height);
      if (Math.abs(h - son) > 2) { son = h; window.parent.postMessage({ dsanim: true, ad: ad, yukseklik: h }, '*'); }
    }
    if ('ResizeObserver' in window) new ResizeObserver(gonder).observe(document.documentElement);
    window.addEventListener('load', gonder);
    setTimeout(gonder, 300);
  }

  window.dsanim = {
    Oynatici: Oynatici,
    baslat: function () {
      var q = new URLSearchParams(location.search);
      Array.prototype.forEach.call(document.querySelectorAll('[data-dsanim]'), function (kok) {
        var veri = JSON.parse(document.getElementById(kok.getAttribute('data-dsanim')).textContent);
        var dil = q.get('lang') || (document.documentElement.lang || 'tr').slice(0, 2);
        temaUygula(document.documentElement);
        new Oynatici(kok, veri, { dil: dil, kare: +(q.get('kare') || 1), oto: q.get('oto') === '1', kod: q.get('kod'),
                                  kodYok: q.get('kod') === '0', statik: q.get('statik') === '1', yer: q.get('yer') });
        if (window.parent === window || q.get('odak') === '1') kok.focus({ preventScroll: true });
        yukseklikBildir(veri.ad);
      });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', window.dsanim.baslat);
  else window.dsanim.baslat();
})();
