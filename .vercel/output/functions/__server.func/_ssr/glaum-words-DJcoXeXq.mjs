//#region node_modules/.nitro/vite/services/ssr/assets/glaum-words-DJcoXeXq.js
/** Built-in lantern words. Admin can hide any of these. */
var GLAUM_DEFAULT_WORDS = [
	"glåüm",
	"shrimp",
	"🦐",
	"om",
	"pop",
	"♡",
	"✨",
	"lantern",
	"sequin",
	"prawn",
	"glow",
	"soft",
	"spark",
	"pearl",
	"tide"
];
var MONTH_MS = 2592e6;
var BANNED = new Set([
	"anal",
	"anus",
	"arse",
	"asshole",
	"ballsack",
	"bastard",
	"bitch",
	"blowjob",
	"bollock",
	"boner",
	"boob",
	"boobs",
	"bugger",
	"bum",
	"buttplug",
	"clit",
	"clitoris",
	"cock",
	"coon",
	"crap",
	"cum",
	"cunt",
	"dick",
	"dildo",
	"dyke",
	"fag",
	"faggot",
	"feck",
	"felch",
	"fellate",
	"fellatio",
	"feltch",
	"fuck",
	"fucker",
	"fucking",
	"fudgepacker",
	"flange",
	"goddamn",
	"homo",
	"hooker",
	"horny",
	"jerk",
	"jizz",
	"kike",
	"labia",
	"muff",
	"nazi",
	"nigga",
	"nigger",
	"niglet",
	"nude",
	"orgasm",
	"orgy",
	"penis",
	"piss",
	"poop",
	"porn",
	"prick",
	"pube",
	"pussy",
	"queer",
	"rape",
	"rapist",
	"rectum",
	"retard",
	"rimjob",
	"semen",
	"sex",
	"sexy",
	"shit",
	"shitty",
	"slut",
	"smegma",
	"spunk",
	"tits",
	"titties",
	"turd",
	"twat",
	"vagina",
	"wank",
	"whore",
	"wtf",
	"xxx",
	"doggystyle",
	"handjob",
	"jackoff",
	"jerkoff",
	"masterbat",
	"masturbat",
	"scrotum",
	"testicle",
	"tit",
	"titty",
	"wanker",
	"bloody",
	"bollocks",
	"bugger",
	"choad",
	"chode",
	"cooch",
	"coochie",
	"cracker",
	"cuck",
	"darkie",
	"darky",
	"deepthroat",
	"douche",
	"dummy",
	"erect",
	"erotic",
	"escort",
	"fanny",
	"fisted",
	"fisting",
	"gangbang",
	"gook",
	"guro",
	"hentai",
	"heroin",
	"hitler",
	"holocaust",
	"homicide",
	"hooker",
	"hump",
	"incest",
	"jap",
	"jigaboo",
	"kill",
	"kkk",
	"klan",
	"knob",
	"kunt",
	"lesbo",
	"molest",
	"murder",
	"naked",
	"nips",
	"nonce",
	"nude",
	"nudity",
	"nutsack",
	"pedo",
	"paedo",
	"pedophile",
	"phuck",
	"pissed",
	"playboy",
	"pimp",
	"poon",
	"poontang",
	"porn",
	"porno",
	"pr0n",
	"pube",
	"punani",
	"pussies",
	"queef",
	"raghead",
	"raping",
	"rectal",
	"redskin",
	"reefer",
	"renob",
	"retard",
	"rimjaw",
	"rimming",
	"sadist",
	"scat",
	"schlong",
	"screw",
	"scrot",
	"semen",
	"sexed",
	"sexual",
	"shag",
	"shemale",
	"shithead",
	"skank",
	"slanteye",
	"slutty",
	"smut",
	"snatch",
	"sodom",
	"sperm",
	"spooge",
	"spunk",
	"strapon",
	"suck",
	"sucks",
	"suicide",
	"swastika",
	"tard",
	"terror",
	"threesome",
	"thot",
	"throating",
	"tushy",
	"undies",
	"unwed",
	"urethra",
	"urinal",
	"urine",
	"uterus",
	"vag",
	"virgin",
	"vomit",
	"vulva",
	"wang",
	"wank",
	"weenie",
	"wog",
	"wop",
	"xxx",
	"yaoi",
	"yiff",
	"zoophile"
].map((item) => foldGlaum(item)).filter(Boolean));
function foldGlaum(value) {
	return value.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t").replace(/\$/g, "s").replace(/@/g, "a").replace(/!/g, "i").replace(/\+/g, "t").replace(/[^a-z]/g, "");
}
/** Stable identity for emoji + symbol words (does not strip them). */
function glaumKey(value) {
	return tidyGlaum(value).normalize("NFKC").toLocaleLowerCase();
}
function graphemeCount(value) {
	if (typeof Intl !== "undefined" && "Segmenter" in Intl) return [...new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(value)].length;
	return [...value].length;
}
function tidyGlaum(raw) {
	return raw.replace(/\p{Cc}/gu, "").replace(/[\u200B\u2060\uFEFF]/g, "").replace(/\s+/g, " ").trim();
}
function squash(value) {
	return value.replace(/(.)\1{2,}/g, "$1$1");
}
function glaumProfane(word) {
	const fold = squash(foldGlaum(word));
	if (!fold) return false;
	if (BANNED.has(fold)) return true;
	for (const ban of BANNED) if (ban.length >= 4 && fold.includes(ban)) return true;
	return false;
}
function cleanGuestWord(raw) {
	const word = tidyGlaum(raw);
	if (!word) return {
		ok: false,
		error: "Need a word"
	};
	if (graphemeCount(word) > 9) return {
		ok: false,
		error: "Keep it under 10 characters"
	};
	if (/https?:|www\.|\.(com|ca|net|org)\b/i.test(word)) return {
		ok: false,
		error: "No links in the lantern"
	};
	if (glaumProfane(word)) return {
		ok: false,
		error: "That word cannot float here"
	};
	return {
		ok: true,
		word
	};
}
function cleanAdminWord(raw) {
	const word = tidyGlaum(raw);
	if (!word) return {
		ok: false,
		error: "Need a word"
	};
	if (graphemeCount(word) > 16) return {
		ok: false,
		error: "Keep it short"
	};
	if (/https?:|www\.|\.(com|ca|net|org)\b/i.test(word)) return {
		ok: false,
		error: "No links in the lantern"
	};
	if (glaumProfane(word)) return {
		ok: false,
		error: "That word cannot float here"
	};
	return {
		ok: true,
		word
	};
}
function monthFromNow(from = Date.now()) {
	return new Date(from + MONTH_MS);
}
function isGlaumDesk(slug) {
	return /glaum|glåüm|glaom/i.test(slug || "");
}
//#endregion
export { glaumKey as a, monthFromNow as c, foldGlaum as i, cleanAdminWord as n, graphemeCount as o, cleanGuestWord as r, isGlaumDesk as s, GLAUM_DEFAULT_WORDS as t };
