//#region node_modules/.nitro/vite/services/ssr/assets/ranks-C9jEqfnZ.js
var KEY = "radio.ranks.v1";
function empty() {
	return {
		channels: {},
		songs: {}
	};
}
function loadRanks() {
	if (typeof window === "undefined") return empty();
	try {
		const parsed = JSON.parse(window.localStorage.getItem(KEY) || "null");
		return parsed && typeof parsed === "object" ? {
			channels: parsed.channels ?? {},
			songs: parsed.songs ?? {}
		} : empty();
	} catch {
		return empty();
	}
}
function voteRank(kind, id, delta) {
	const book = loadRanks();
	const next = Math.max(0, (book[kind][id] ?? 0) + delta);
	book[kind][id] = next;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(book));
	} catch {}
	return book;
}
//#endregion
export { voteRank as n, loadRanks as t };
