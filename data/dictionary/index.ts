import { rawDictionaryText as a } from './a';
import { rawDictionaryText as b } from './b';
import { rawDictionaryText as c } from './c';
import { rawDictionaryText as d } from './d';
import { rawDictionaryText as e } from './e';
import { rawDictionaryText as f } from './f';
import { rawDictionaryText as g } from './g';
import { rawDictionaryText as h } from './h';
import { rawDictionaryText as i } from './i';
import { rawDictionaryText as j } from './j';
import { rawDictionaryText as k } from './k';
import { rawDictionaryText as l } from './l';
import { rawDictionaryText as m } from './m';
import { rawDictionaryText as n } from './n';
import { rawDictionaryText as o } from './o';
import { rawDictionaryText as p } from './p';
import { rawDictionaryText as r } from './r';
import { rawDictionaryText as s } from './s';
import { rawDictionaryText as t } from './t';
import { rawDictionaryText as u } from './u';
import { rawDictionaryText as v } from './v';
import { rawDictionaryText as w } from './w';
import { rawDictionaryText as y } from './y';
import { rawDictionaryText as z } from './z';

const allRawText = [
  a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, r, s, t, u, v, w, y, z
].join('\n');

// Sort lines alphabetically, ignoring entries that might be just whitespace
const sortedLines = allRawText
  .split('\n')
  .filter(line => line.trim() !== '')
  .sort((lineA, lineB) => lineA.localeCompare(lineB, 'tr'));

export const dictionaryRawText: string = sortedLines.join('\n');