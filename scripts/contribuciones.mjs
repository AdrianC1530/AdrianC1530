/**
 * Dibuja las contribuciones del último año como una matriz de puntos: assets/contribuciones.svg
 * Cada punto es un día. Cuanta más actividad, más brilla.
 * Es una imagen fija: un navegador puede pausar las animaciones de una imagen que aún no está en pantalla,
 * y los puntos no deben depender de eso para verse.
 *
 * Uso local:   GITHUB_TOKEN=$(gh auth token) node scripts/contribuciones.mjs
 * En GitHub:   lo ejecuta cada día .github/workflows/contribuciones.yml
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const LOGIN = process.env.GITHUB_REPOSITORY_OWNER || 'AdrianC1530';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!TOKEN) throw new Error('Falta la variable GITHUB_TOKEN');

const C = { bg: '#0B0C0E', ink2: '#A5ABB6', line: '#262A31', accent: '#96B2FF' };
/** Brillo de cada nivel de actividad. Un día sin actividad queda como punto apagado. */
const LEVEL = { FIRST_QUARTILE: 0.32, SECOND_QUARTILE: 0.55, THIRD_QUARTILE: 0.78, FOURTH_QUARTILE: 1 };

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', 'user-agent': 'perfil-contribuciones' },
  body: JSON.stringify({
    query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
      totalContributions weeks { contributionDays { weekday contributionLevel } } } } } }`,
    variables: { login: LOGIN },
  }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error('GitHub no devolvió el calendario: ' + JSON.stringify(json.errors ?? res.status));
const { totalContributions: total, weeks } = json.data.user.contributionsCollection.contributionCalendar;

const pitch = 20;
const col0 = 3;
const row0 = 2;
const w = 1200;
const h = 260;
const r = pitch * 0.4;

const columns = weeks
  .map((week, x) => {
    const dots = week.contributionDays
      .filter((day) => LEVEL[day.contributionLevel])
      .map((day) => `<circle cx="${(col0 + x + 0.5) * pitch}" cy="${(row0 + day.weekday + 0.5) * pitch}" r="${r}" fill-opacity="${LEVEL[day.contributionLevel]}"/>`)
      .join('');
    return dots;
  })
  .filter(Boolean)
  .join('\n');

const label = `${total.toLocaleString('es-EC')} contribuciones en el último año`;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">
<title>${label}</title>
<defs>
<pattern id="off" width="${pitch}" height="${pitch}" patternUnits="userSpaceOnUse"><circle cx="${pitch / 2}" cy="${pitch / 2}" r="${(pitch * 0.09).toFixed(1)}" fill="#fff" fill-opacity=".13"/></pattern>
<clipPath id="clip"><rect width="${w}" height="${h}" rx="20"/></clipPath>
</defs>
<style>
text{font:500 24px -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif}
</style>
<g clip-path="url(#clip)">
<rect width="${w}" height="${h}" fill="${C.bg}"/>
<rect width="${w}" height="${h}" fill="url(#off)"/>
<g fill="${C.accent}">
${columns}
</g>
<text x="${col0 * pitch}" y="${h - 32}" fill="${C.ink2}">${label}</text>
</g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="19.5" fill="none" stroke="${C.line}"/>
</svg>
`;

mkdirSync(new URL('../assets/', import.meta.url), { recursive: true });
writeFileSync(new URL('../assets/contribuciones.svg', import.meta.url), svg);
console.log(`contribuciones.svg: ${label}, ${weeks.length} semanas`);
