//#region node_modules/.nitro/vite/services/ssr/assets/favorites-C6NI1-_a.js
var KEY = "radio.favs.v1";
var FAV_EVENT = "radio:favs";
function loadFavorites() {
	if (typeof window === "undefined") return [];
	try {
		const parsed = JSON.parse(window.localStorage.getItem(KEY) || "[]");
		return Array.isArray(parsed) ? parsed.map(String) : [];
	} catch {
		return [];
	}
}
function toggleFavorite(slug) {
	const current = loadFavorites();
	const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
	try {
		window.localStorage.setItem(KEY, JSON.stringify(next));
		window.dispatchEvent(new Event(FAV_EVENT));
	} catch {}
	return next;
}
//#endregion
export { loadFavorites as n, toggleFavorite as r, FAV_EVENT as t };
