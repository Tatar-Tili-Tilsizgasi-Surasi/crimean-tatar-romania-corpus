import { a } from './a';
import { b } from './b';
import { c } from './c';
import { d } from './d';
import { e } from './e';
import { f } from './f';
import { g } from './g';
import { h } from './h';
import { i } from './i';
import { j } from './j';
import { k } from './k';
import { l } from './l';
import { m } from './m';
import { n } from './n';
import { o } from './o';
import { p } from './p';
import { r } from './r';
import { s } from './s';
import { t } from './t';
import { u } from './u';
import { v } from './v';
import { w } from './w';
import { y } from './y';
import { z } from './z';

const allEntries = [
  ...a,
  ...b,
  ...c,
  ...d,
  ...e,
  ...f,
  ...g,
  ...h,
  ...i,
  ...j,
  ...k,
  ...l,
  ...m,
  ...n,
  ...o,
  ...p,
  ...r,
  ...s,
  ...t,
  ...u,
  ...v,
  ...w,
  ...y,
  ...z,
];

// Using 'tr' locale for sorting might be better for Turkic languages,
// as it handles characters like 'ı' and 'i' correctly.
export const dictionaryEntries: string[] = allEntries.sort((strA, strB) => strA.localeCompare(strB, 'tr'));
