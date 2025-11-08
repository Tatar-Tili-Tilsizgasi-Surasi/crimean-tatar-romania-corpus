

export const alphabet = "A a, Á á, B b, C c, Ç ç, D d, E e, F f, G g, Ğ ğ, H h, I i, Í í, Î î, J j, K k, L l, M m, N n, Ñ ñ, O o, Ó ó, P p, R r, S s, Ş ş, T t, U u, Ú ú, V v, W w, Y y, Z z";

export const grammarRules = `
- OFFICIAL ALPHABET (STRICT): ${alphabet}
- FORBIDDEN CHARACTERS (in this dialect): Do NOT use 'ı' (use 'î' or 'í' depending on harmony), 'ö' (use 'ó'), 'ü' (use 'ú').
- Vowel harmony is essential. Back vowels: a, î, o, u, á (sometimes). Front vowels: e, i, ó, ú.
- Plural suffixes: -lar (back), -ler (front).
- Possessive suffixes (1st sg my): -îm, -im, -um, -úm.
- Possessive suffixes (2nd sg your): -îñ, -iñ, -uñ, -úñ.
- Possessive suffixes (3rd sg its/his/her): -sî, -si, -su, -sú.
- Case suffixes:
  - Genitive (of): -nîñ, -niñ, -nuñ, -núñ.
  - Dative (to): -ga, -ge, -ka, -ke.
  - Locative (at/in): -da, -de, -ta, -te.
  - Ablative (from): -dan, -den, -tan, -ten.
  - Accusative (direct object): -nî, -ni.
- Verb 'to be' (copula) suffixes:
  - I am: -man, -men.
  - You are: -sîñ, -siñ.
  - He/she/it is: -dîr, -dir, -tîr, -tir.
- The dialect often uses Romanian loanwords for modern concepts.
`;