/**
 * Dibuja las tres cifras de actividad del perfil, con los datos reales de GitHub:
 *   assets/actividad-contribuciones.svg   contribuciones en el último año
 *   assets/actividad-dias.svg             días con actividad en el último año
 *   assets/actividad-racha.svg            la racha más larga, en días seguidos
 *
 * Uso local:   GITHUB_TOKEN=$(gh auth token) node scripts/actividad.mjs
 * En GitHub:   lo ejecuta cada día .github/workflows/actividad.yml
 */
import { writeFileSync } from 'node:fs';
import { C, figure } from './puntos.mjs';

const LOGIN = process.env.GITHUB_REPOSITORY_OWNER || 'AdrianC1530';
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!TOKEN) throw new Error('Falta la variable GITHUB_TOKEN');

const res = await fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json', 'user-agent': 'perfil-actividad' },
  body: JSON.stringify({
    query: `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
      totalContributions weeks { contributionDays { contributionCount } } } } } }`,
    variables: { login: LOGIN },
  }),
});
const json = await res.json();
if (!res.ok || json.errors) throw new Error('GitHub no devolvió el calendario: ' + JSON.stringify(json.errors ?? res.status));

const calendar = json.data.user.contributionsCollection.contributionCalendar;
const days = calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.contributionCount));

const total = calendar.totalContributions;
const active = days.filter((count) => count > 0).length;
let longest = 0;
let run = 0;
for (const count of days) {
  run = count > 0 ? run + 1 : 0;
  longest = Math.max(longest, run);
}

const figures = {
  'actividad-contribuciones.svg': [total, 'contribuciones en el último año'],
  'actividad-dias.svg': [active, 'días con actividad en el último año'],
  'actividad-racha.svg': [longest, 'días seguidos: la racha más larga'],
};
for (const [name, [value, label]] of Object.entries(figures)) {
  // Hasta 4 cifras caben a doble tamaño; con más, a tamaño normal.
  const text = String(value);
  const svg = figure({ text, scale: text.length <= 4 ? 2 : 1, bg: C.bg, title: `${value} ${label}` });
  writeFileSync(new URL(`../assets/${name}`, import.meta.url), svg);
  console.log(name.padEnd(32), value, label);
}
