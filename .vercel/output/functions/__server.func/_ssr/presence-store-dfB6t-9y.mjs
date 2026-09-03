import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/presence-store-dfB6t-9y.js
function popularityScore(channel, opts) {
	return opts.live * 48 + opts.viewers * 14 + opts.listens * 3 + opts.views * 1 + (opts.upvotes ?? 0) * 8 + (opts.favorite ? 80 : 0) + (opts.hostSlug === channel.slug ? 120 : 0) + (channel.featured ? 10 : 0);
}
function sortByPopularity(channels, presence, favorites, upvotes = {}) {
	const fav = new Set(favorites);
	const hostSlug = presence?.host?.slug ?? null;
	return [...channels].sort((a, b) => {
		const sa = popularityScore(a, {
			live: presence?.live[a.slug] ?? 0,
			viewers: presence?.viewers[a.slug] ?? 0,
			listens: presence?.listens[a.slug] ?? 0,
			views: presence?.views[a.slug] ?? 0,
			favorite: fav.has(a.slug),
			hostSlug,
			upvotes: upvotes[a.slug]
		});
		return popularityScore(b, {
			live: presence?.live[b.slug] ?? 0,
			viewers: presence?.viewers[b.slug] ?? 0,
			listens: presence?.listens[b.slug] ?? 0,
			views: presence?.views[b.slug] ?? 0,
			favorite: fav.has(b.slug),
			hostSlug,
			upvotes: upvotes[b.slug]
		}) - sa || a.name.localeCompare(b.name);
	});
}
function listenerLabel(live, listens, viewers = 0, views = 0) {
	const bits = [];
	if (live > 0) bits.push(live === 1 ? "1 listening" : `${live} listening`);
	else if (viewers > 0) bits.push(viewers === 1 ? "1 here" : `${viewers} here`);
	if (listens > 0) bits.push(listens === 1 ? "1 listen" : `${listens} listens`);
	if (views > 0 && live === 0) bits.push(views === 1 ? "1 visit" : `${views} visits`);
	return bits.join(" · ");
}
var usePresenceStore = create(() => ({ snapshot: null }));
//#endregion
export { sortByPopularity as n, usePresenceStore as r, listenerLabel as t };
