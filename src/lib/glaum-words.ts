/** Built-in lantern words. Admin can hide any of these. */
export const GLAUM_DEFAULT_WORDS = [
  "glåüm",
  "shrimp",
  "om",
  "pop",
  "lantern",
  "sequin",
  "prawn",
  "glow",
  "soft",
  "spark",
  "pearl",
  "tide",
];

export const GLAUM_GUEST_MAX = 9;
const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const BANNED = new Set(
  [
    "anal", "anus", "arse", "asshole", "ballsack", "bastard", "bitch", "blowjob", "bollock", "boner",
    "boob", "boobs", "bugger", "bum", "buttplug", "clit", "clitoris", "cock", "coon", "crap", "cum",
    "cunt", "dick", "dildo", "dyke", "fag", "faggot", "feck", "felch", "fellate", "fellatio", "feltch",
    "fuck", "fucker", "fucking", "fudgepacker", "flange", "goddamn", "homo", "hooker", "horny", "jerk",
    "jizz", "kike", "labia", "muff", "nazi", "nigga", "nigger", "niglet", "nude", "orgasm", "orgy",
    "penis", "piss", "poop", "porn", "prick", "pube", "pussy", "queer", "rape", "rapist", "rectum",
    "retard", "rimjob", "semen", "sex", "sexy", "shit", "shitty", "slut", "smegma", "spunk", "tits",
    "titties", "turd", "twat", "vagina", "wank", "whore", "wtf", "xxx", "doggystyle", "handjob",
    "jackoff", "jerkoff", "masterbat", "masturbat", "scrotum", "testicle", "tit", "titty", "wanker",
    "bloody", "bollocks", "bugger", "choad", "chode", "cooch", "coochie", "cracker", "cuck", "darkie",
    "darky", "deepthroat", "douche", "dummy", "erect", "erotic", "escort", "fanny", "fisted", "fisting",
    "gangbang", "gook", "guro", "hentai", "heroin", "hitler", "holocaust", "homicide", "hooker",
    "hump", "incest", "jap", "jigaboo", "kill", "kkk", "klan", "knob", "kunt", "lesbo", "molest",
    "murder", "naked", "nips", "nonce", "nude", "nudity", "nutsack", "pedo", "paedo",
    "pedophile", "phuck", "pissed", "playboy", "pimp", "poon", "poontang", "porn", "porno", "pr0n",
    "pube", "punani", "pussies", "queef", "raghead", "raping", "rectal", "redskin", "reefer", "renob",
    "retard", "rimjaw", "rimming", "sadist", "scat", "schlong", "screw", "scrot", "semen", "sexed",
    "sexual", "shag", "shemale", "shithead", "skank", "slanteye", "slutty", "smut", "snatch", "sodom",
    "sperm", "spooge", "spunk", "strapon", "suck", "sucks", "suicide", "swastika", "tard", "terror",
    "threesome", "thot", "throating", "tushy", "undies", "unwed", "urethra", "urinal", "urine",
    "uterus", "vag", "virgin", "vomit", "vulva", "wang", "wank", "weenie", "wog", "wop", "xxx",
    "yaoi", "yiff", "zoophile",
  ].map((item) => foldGlaum(item)).filter(Boolean),
);

export function foldGlaum(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z]/g, "");
}

function squash(value: string): string {
  return value.replace(/(.)\1{2,}/g, "$1$1");
}

export function glaumProfane(word: string): boolean {
  const fold = squash(foldGlaum(word));
  if (!fold) return false;
  if (BANNED.has(fold)) return true;
  for (const ban of BANNED) {
    if (ban.length >= 4 && fold.includes(ban)) return true;
  }
  return false;
}

export function cleanGuestWord(raw: string): { ok: true; word: string } | { ok: false; error: string } {
  const word = raw.trim();
  if (!word) return { ok: false, error: "Need a word" };
  if (word.length > GLAUM_GUEST_MAX) return { ok: false, error: "Keep it under 10 characters" };
  if (!/^[\p{L}]+$/u.test(word)) return { ok: false, error: "Letters only — no symbols, numbers, or spaces" };
  if (glaumProfane(word)) return { ok: false, error: "That word cannot float here" };
  return { ok: true, word };
}

export function cleanAdminWord(raw: string): { ok: true; word: string } | { ok: false; error: string } {
  const word = raw.trim().replace(/\s+/g, " ");
  if (!word) return { ok: false, error: "Need a word" };
  if (word.length > 16) return { ok: false, error: "Keep it short" };
  if (!/^[\p{L} ]+$/u.test(word)) return { ok: false, error: "Letters and spaces only" };
  if (glaumProfane(word)) return { ok: false, error: "That word cannot float here" };
  return { ok: true, word };
}

export function monthFromNow(from = Date.now()): Date {
  return new Date(from + MONTH_MS);
}

export function isGlaumDesk(slug: string | null | undefined): boolean {
  return /glaum|glåüm|glaom/i.test(slug || "");
}
