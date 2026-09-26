// dsanim v2 export: runs one algorithm with one preset in Node and prints the SVG frames as JSON
// (key frames for the PNG strip and the last-frame image, plus eased in-between frames for the GIF).
// Usage: node export.js <algorithm.js> <presetId|""> <out.json>
'use strict';
const fs = require('fs');
const path = require('path');
const D = require('./scene.js');
global.DSAnim = D;
const [file, presetId, out] = process.argv.slice(2);
require(path.resolve(file));
const spec = Object.values(D.registry)[0];
const preset = spec.presets.find(p => p.id === presetId) || spec.exportPreset && spec.presets.find(p => p.id === spec.exportPreset) || spec.presets[0];
const S = new D.Scene();
spec.build(S, preset.data);
const vb = D.viewBox(S.frames);
const result = { id: spec.id, title: spec.title, preset: preset.id, vb, key: {}, gif: {}, caps: S.frames.map(f => f.cap) };
for (const lang of ['tr', 'en']) {
  result.key[lang] = S.frames.map(f => D.svg(f, vb, lang, 1000));
  const g = [];
  S.frames.forEach((f, i) => {
    if (i > 0) for (let j = 1; j <= 8; j++) g.push({ svg: D.svg(D.tween(S.frames[i - 1], f, j / 9), vb, lang, 880), ms: 55, cap: f.cap[lang] });
    g.push({ svg: D.svg(f, vb, lang, 880), ms: 900 + 16 * (f.cap[lang] || '').length, cap: f.cap[lang] });
  });
  result.gif[lang] = g;
}
fs.writeFileSync(out, JSON.stringify(result));
console.log(`${spec.id}: ${S.frames.length} steps, preset ${preset.id}`);
