/**
 * Genera los SVG fijos del perfil: la cabecera, las cifras de los proyectos y la línea de tecnologías.
 * Las cifras de actividad cambian cada día y las dibuja scripts/actividad.mjs.
 * Uso: node scripts/build.mjs
 *
 * Todo se dibuja con la misma matriz de puntos de adriancarrillo.dev.
 * No hay dependencias: solo Node 20 o superior.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { logos } from './logos.mjs';
import { C, circle, figure, layout, n, panel } from './puntos.mjs';

const OUT = new URL('../assets/', import.meta.url);
mkdirSync(OUT, { recursive: true });

// ---------- 1. Cabecera: el nombre se enciende de izquierda a derecha ----------
function header() {
  const w = 1200;
  const h = 400;
  const pitch = 20;
  const r = pitch * 0.4;
  const name = layout(['ADRIÁN', 'CARRILLO'], { accents: true });
  const col0 = 3;
  const row0 = 1;

  // Un grupo por columna, para encenderlas una tras otra.
  const columns = new Map();
  for (const [x, y] of name.dots) columns.set(x, [...(columns.get(x) ?? []), y]);
  const lit = [...columns.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([x, ys]) => `<g class="c" style="animation-delay:${x * 24}ms">${ys.map((y) => circle(col0 + x, row0 + y, pitch, r)).join('')}</g>`)
    .join('\n');

  // Destellos: de vez en cuando sube un punto de luz por una columna del fondo.
  const sparks = [
    [54, 0],
    [57, 3.5],
  ]
    .map(([col, delay]) => `<circle class="s" cx="${(col + 0.5) * pitch}" cy="${h + pitch}" r="${n(pitch * 0.2)}" style="animation-delay:${delay}s"/>`)
    .join('');

  const style = `
.c{fill:${C.ink};animation:on .7s both}
.s{fill:${C.accent};opacity:0;animation:up 7s linear infinite}
@keyframes on{0%{opacity:0;fill:${C.accent}}55%{opacity:1;fill:${C.accent}}100%{opacity:1;fill:${C.ink}}}
@keyframes up{0%{opacity:0;transform:translateY(0)}6%{opacity:.9}30%{opacity:.9}36%,100%{opacity:0;transform:translateY(-${h + pitch * 2}px)}}
@media (prefers-reduced-motion:reduce){.c,.s{animation:none}}
`;
  return panel({ w, h, pitch, title: 'Adrián Carrillo', style, body: `${lit}\n${sparks}` });
}

// ---------- 2. Las tecnologías pasan en una línea ----------
const TECH = [
  'typescript', 'javascript', 'php', 'python', 'csharp', 'kotlin', 'dart', 'cplusplus',
  'react', 'angular', 'vue', 'tailwind', 'flutter', 'electron',
  'node', 'nestjs', 'laravel', 'flask', 'postgresql', 'mysql', 'sqlite', 'firebase',
  'docker', 'linux', 'nginx', 'git', 'azure', 'espressif', 'arduino', 'cisco',
];

function techLine() {
  const w = 1200;
  const h = 120;
  const size = 44;
  const step = 120;
  const total = TECH.length * step;
  const one = TECH.map((key, i) => {
    if (!logos[key]) throw new Error(`Falta el logo «${key}»`);
    const x = i * step + (step - size) / 2;
    return `<path transform="translate(${x} ${(h - size) / 2}) scale(${n(size / 24)})" d="${logos[key]}"/><circle cx="${i * step}" cy="${h / 2}" r="2.5" fill="${C.line2}"/>`;
  }).join('\n');
  const style = `
.t{animation:pass ${TECH.length * 3}s linear infinite}
@keyframes pass{to{transform:translateX(-${total}px)}}
@media (prefers-reduced-motion:reduce){.t{animation:none}}
`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<title>Tecnologías con las que trabajo</title>
<defs>
<linearGradient id="fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".1" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
<mask id="edges"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
<clipPath id="clip"><rect width="${w}" height="${h}" rx="20"/></clipPath>
<g id="set" fill="${C.ink}">
${one}
</g>
</defs>
<style>${style}</style>
<g clip-path="url(#clip)">
<rect width="${w}" height="${h}" fill="${C.bg}"/>
<g mask="url(#edges)"><g class="t"><use href="#set"/><use href="#set" x="${total}"/></g></g>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="19.5" fill="none" stroke="${C.line}"/>
</svg>
`;
}

// ---------- Salida ----------
const files = {
  'header.svg': header(),
  // El fondo de cada cifra es el tono de su tarjeta en el sitio.
  'cifra-sri.svg': figure({ text: '0', scale: 2, bg: '#10254A', title: '0 facturas duplicadas' }),
  'cifra-taxibocarchi.svg': figure({ text: '88,3 %', scale: 1, bg: '#1C1A17', title: '88,3 % de F1 del modelo' }),
  'cifra-aurum.svg': figure({ text: '3', scale: 2, bg: '#14110B', title: '3 pasos para reservar con anticipo' }),
  'cifra-tienda.svg': figure({ text: 'OFFLINE', scale: 1, bg: '#171D3A', title: 'Funciona sin internet' }),
  'tecnologias.svg': techLine(),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), svg);
  console.log(name.padEnd(26), (Buffer.byteLength(svg) / 1024).toFixed(1) + ' KB');
}
