/**
 * Lo que comparten los scripts del perfil: colores, la tipografía de puntos y el panel.
 * Es la misma matriz de puntos de adriancarrillo.dev.
 */

// ---------- Colores (los mismos tokens del sitio) ----------
export const C = {
  bg: '#0B0C0E',
  ink: '#F3F4F6',
  line: '#262A31',
  line2: '#3A3F48',
  accent: '#96B2FF',
};

// ---------- Tipografía de puntos, 5 × 7 ----------
export const GLYPHS = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  0: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  1: ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  3: ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  4: ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  6: ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  7: ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..'],
  8: ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  9: ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  ',': ['..', '..', '..', '..', '..', '.#', '#.'],
  '.': ['.', '.', '.', '.', '.', '.', '#'],
  '-': ['...', '...', '...', '###', '...', '...', '...'],
  ' ': ['.', '.', '.', '.', '.', '.', '.'],
  '%': ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##'],
};
const ACUTE = ['...#.', '..#..'];
const ACCENTED = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };

/** Devuelve los puntos encendidos de un texto: [columna, fila]. */
export function layout(lines, { accents = false, scale = 1 } = {}) {
  const lineH = 7 + (accents ? 2 : 0);
  const dots = [];
  let width = 0;
  lines.forEach((line, li) => {
    const top = li * lineH + (accents ? 2 : 0);
    let left = 0;
    for (const ch of line.toUpperCase()) {
      const glyph = GLYPHS[ACCENTED[ch] ?? ch];
      if (!glyph) throw new Error(`La tipografía de puntos no tiene el carácter «${ch}»`);
      glyph.forEach((row, y) => [...row].forEach((v, x) => v === '#' && dots.push([left + x, top + y])));
      if (ACCENTED[ch] && accents) ACUTE.forEach((row, y) => [...row].forEach((v, x) => v === '#' && dots.push([left + x, top - 2 + y])));
      left += glyph[0].length + 1;
    }
    width = Math.max(width, left - 1);
  });
  const scaled = [];
  for (const [x, y] of dots) for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) scaled.push([x * scale + dx, y * scale + dy]);
  return { cols: width * scale, rows: lines.length * lineH * scale, dots: scaled };
}

export const n = (v) => +v.toFixed(2);

/** El panel: fondo, rejilla de puntos apagados y borde. Todo lo demás se dibuja encima. */
export function panel({ w, h, pitch, bg = C.bg, title, style = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<title>${title}</title>
<defs>
<pattern id="off" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><circle cx="${pitch / 2}" cy="${pitch / 2}" r="${n(pitch * 0.09)}" fill="#fff" fill-opacity=".13"/></pattern>
<clipPath id="clip"><rect width="${w}" height="${h}" rx="20"/></clipPath>
</defs>${style ? `\n<style>${style}</style>` : ''}
<g clip-path="url(#clip)">
<rect width="${w}" height="${h}" fill="${bg}"/>
<rect width="${w}" height="${h}" fill="url(#off)"/>
${body}
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="19.5" fill="none" stroke="${C.line}"/>
</svg>
`;
}

export const circle = (col, row, pitch, r) => `<circle cx="${n((col + 0.5) * pitch)}" cy="${n((row + 0.5) * pitch)}" r="${r}"/>`;

// ---------- Una cifra escrita con puntos ----------
export function figure({ text, scale, bg, title }) {
  const w = 600;
  const h = 240;
  const pitch = 12;
  const fig = layout([text], { scale });
  const col0 = 4;
  const row0 = Math.round((h / pitch - fig.rows) / 2);
  const dots = fig.dots.map(([x, y]) => circle(col0 + x, row0 + y, pitch, n(pitch * 0.4))).join('');
  return panel({ w, h, pitch, bg, title, body: `<g fill="${C.ink}">${dots}</g>` });
}
