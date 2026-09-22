import { o as __toESM } from "../_runtime.mjs";
import { a as getSeedCatalog } from "./catalog-DmckmNNR.mjs";
import { h as sceneFromTags, u as mergeSceneTags } from "./phenomena-DIQMhlVR.mjs";
import { C as require_jsx_runtime, W as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-B7ACZ19x.mjs";
import { l as Sparkles, s as Trash2 } from "../_libs/lucide-react.mjs";
import { J as patchStationTrack, R as hideStationTrack, z as hideStationTracks } from "./router-BjRk-_wL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ghost-cleaner-DB9pD8oZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fold(value) {
	return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[_]+/g, " ").replace(/[^a-z0-9]+/g, " ").trim();
}
function compact(value) {
	return fold(value).replace(/\s+/g, "");
}
function audioKey(url) {
	let raw = (url || "").trim();
	try {
		raw = decodeURIComponent(new URL(raw).pathname);
	} catch {
		raw = raw.split("?")[0] ?? raw;
		try {
			raw = decodeURIComponent(raw);
		} catch {}
	}
	return raw.toLowerCase().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
}
function fileStem(url) {
	const path = audioKey(url);
	const slash = path.lastIndexOf("/");
	return (slash >= 0 ? path.slice(slash + 1) : path).replace(/\.[a-z0-9]{2,5}$/i, "").replace(/-\d{4,}$/, "");
}
function dice(a, b) {
	if (!a || !b) return 0;
	if (a === b) return 1;
	if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;
	const left = [];
	const right = [];
	for (let i = 0; i < a.length - 1; i += 1) left.push(a.slice(i, i + 2));
	for (let i = 0; i < b.length - 1; i += 1) right.push(b.slice(i, i + 2));
	const bag = /* @__PURE__ */ new Map();
	for (const gram of left) bag.set(gram, (bag.get(gram) ?? 0) + 1);
	let inter = 0;
	for (const gram of right) {
		const n = bag.get(gram) ?? 0;
		if (n) {
			inter += 1;
			bag.set(gram, n - 1);
		}
	}
	return 2 * inter / (left.length + right.length);
}
function titlesClose(a, b) {
	return dice(fold(a.title), fold(b.title)) >= .62;
}
function voiceLane(title) {
	const t = fold(title);
	if (!t.startsWith("voice")) return null;
	const rest = t.slice(5).trim();
	if (rest.startsWith("check") || rest.startsWith("m8")) return "check";
	if (rest.startsWith("cocy") || rest.startsWith("coc y")) return "cocy";
	if (rest.startsWith("coc")) return "coc";
	if (rest.startsWith("co")) return "co";
	if (rest.startsWith("no")) return "no";
	if (rest.startsWith("on")) return "on";
	if (rest === "c" || rest.startsWith("c ")) return "c";
	return rest.split(" ")[0] || "voice";
}
function prettyLane(title) {
	const t = fold(title);
	if (!/\bpretty\b/.test(t)) return null;
	if (t.includes("sweetie")) return "sweetie";
	if (t.includes("wolf")) return "wolf";
	if (t.includes("avatar") || t.includes("river")) return "avatar";
	return "pretty";
}
function rememberLane(title) {
	const t = fold(title);
	if (!t.includes("remember")) return null;
	if (/\b2\b/.test(t)) return "remember2";
	return "remember";
}
function promLane(title) {
	const t = fold(title);
	if (!t.includes("shrimp") && !t.includes("prom") && !t.includes("bootie")) return null;
	if (t.includes("bootie") || t.includes("copter") || t.includes("shake")) return "bootie";
	if (t.includes("swoon")) return "swoon";
	return "prom";
}
function lanesAgree(a, b) {
	const checks = [
		voiceLane,
		prettyLane,
		rememberLane,
		promLane
	];
	for (const lane of checks) {
		const left = lane(a.title);
		const right = lane(b.title);
		if (left || right) return left === right;
	}
	return true;
}
function clocksClose(a, b) {
	const left = Math.max(0, a.durationSec || 0);
	const right = Math.max(0, b.durationSec || 0);
	if (!left || !right) return false;
	return Math.abs(left - right) <= 10;
}
function similarTitle(a, b) {
	if (!lanesAgree(a, b)) return false;
	const left = fold(a.title);
	const right = fold(b.title);
	if (!left || !right) return false;
	if (left === right || compact(a.title) === compact(b.title)) return true;
	const score = dice(left, right);
	if (score >= .86) return true;
	if (score >= .74 && clocksClose(a, b)) return true;
	return false;
}
function keeperScore(track) {
	const file = fold(fileStem(track.audioUrl));
	const overlap = dice(fold(track.title), file);
	const duration = Math.max(0, track.durationSec || 0);
	const stubClock = duration === 240 || duration === 60 || duration === 180;
	const art = track.coverUrl?.includes("/experiences/") ? 6 : 0;
	return overlap * 120 + Math.min(80, duration / 12) + (stubClock ? -35 : 0) + (sceneFromTags(track.tags) ? 8 : 0) + art;
}
function pickKeeper(group) {
	return [...group].sort((a, b) => keeperScore(b) - keeperScore(a) || a.id.localeCompare(b.id))[0];
}
function pushPlan(plans, group, why) {
	if (group.length < 2) return;
	const keep = pickKeeper(group);
	const drop = group.filter((track) => track.id !== keep.id);
	if (drop.length === 0) return;
	plans.push({
		keep,
		drop,
		why,
		inheritScene: drop.some((track) => titlesClose(keep, track) && sceneFromTags(track.tags) && !sceneFromTags(keep.tags))
	});
}
function taken(plans) {
	const ids = /* @__PURE__ */ new Set();
	for (const plan of plans) {
		ids.add(plan.keep.id);
		for (const track of plan.drop) ids.add(track.id);
	}
	return ids;
}
function cluster(tracks, alike) {
	const parent = tracks.map((_, i) => i);
	const find = (i) => {
		let cur = i;
		while (parent[cur] !== cur) {
			parent[cur] = parent[parent[cur]];
			cur = parent[cur];
		}
		return cur;
	};
	for (let i = 0; i < tracks.length; i += 1) for (let j = i + 1; j < tracks.length; j += 1) if (alike(tracks[i], tracks[j])) {
		const a = find(i);
		const b = find(j);
		if (a !== b) parent[b] = a;
	}
	const groups = /* @__PURE__ */ new Map();
	tracks.forEach((track, i) => {
		const root = find(i);
		const list = groups.get(root) ?? [];
		list.push(track);
		groups.set(root, list);
	});
	return [...groups.values()].filter((group) => group.length > 1);
}
/** Same audio, or a near-copy of a title that was added as an animation stub. */
function ghostPlans(tracks) {
	const live = tracks.filter((track) => track.enabled !== false && track.audioUrl);
	const plans = [];
	const byUrl = /* @__PURE__ */ new Map();
	for (const track of live) {
		const key = audioKey(track.audioUrl);
		if (!key) continue;
		const list = byUrl.get(key) ?? [];
		list.push(track);
		byUrl.set(key, list);
	}
	for (const group of byUrl.values()) pushPlan(plans, group, "same audio file");
	const rest = live.filter((track) => !taken(plans).has(track.id));
	const byStem = /* @__PURE__ */ new Map();
	for (const track of rest) {
		const stem = fileStem(track.audioUrl);
		if (stem.length < 8) continue;
		const list = byStem.get(stem) ?? [];
		list.push(track);
		byStem.set(stem, list);
	}
	for (const group of byStem.values()) pushPlan(plans, group, "same file name");
	const leftover = live.filter((track) => !taken(plans).has(track.id));
	for (const group of cluster(leftover, similarTitle)) pushPlan(plans, group, "same song, extra row");
	return plans.sort((a, b) => a.keep.title.localeCompare(b.keep.title));
}
function ghostDropCount(plans) {
	return plans.reduce((sum, plan) => sum + plan.drop.length, 0);
}
function ghostDropIds(tracks) {
	const ids = /* @__PURE__ */ new Set();
	for (const plan of ghostPlans(tracks)) for (const track of plan.drop) ids.add(track.id);
	return ids;
}
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function GhostCleaner({ channel, compact = false }) {
	const plans = ghostPlans(channel.tracks);
	const drop = ghostDropCount(plans);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (drop === 0) return null;
	async function inherit(plan) {
		if (!plan.inheritScene) return;
		const donor = plan.drop.find((item) => sceneFromTags(item.tags));
		const scene = donor ? sceneFromTags(donor.tags) : null;
		if (!scene || sceneFromTags(plan.keep.tags)) return;
		const result = await patchStationTrack({ data: {
			channelSlug: channel.slug,
			trackId: plan.keep.id,
			tags: mergeSceneTags(plan.keep.tags, scene),
			coverUrl: plan.keep.coverUrl || donor?.coverUrl || void 0
		} });
		applySnapshot(result.tracks, result.stations);
	}
	async function clean() {
		const label = plans.map((plan) => `Keep “${plan.keep.title}”, remove ${plan.drop.map((item) => item.title).join(", ")}`).join("\n");
		if (!window.confirm(`These extra rows look like copies — often animation stubs that did not replace the original file.\n\n${label}\n\nRemove the ghost copies from this playlist? The file stays on R2.`)) return;
		setBusy(true);
		try {
			for (const plan of plans) await inherit(plan);
			const tracks = plans.flatMap((plan) => plan.drop.map((item) => ({
				trackId: item.id,
				audioUrl: item.audioUrl
			})));
			const result = await hideStationTracks({ data: {
				channelSlug: channel.slug,
				tracks
			} });
			applySnapshot(result.tracks, result.stations);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not clean ghosts");
		} finally {
			setBusy(false);
		}
	}
	async function dropOne(track) {
		if (!window.confirm(`Remove “${track.title}” from this playlist? The file stays on R2.`)) return;
		setBusy(true);
		try {
			const result = await hideStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				audioUrl: track.audioUrl
			} });
			applySnapshot(result.tracks, result.stations);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not remove");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: compact ? "ghost-clean ghost-clean-compact" : "ghost-clean",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "ghost-clean-copy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					drop,
					" extra ",
					drop === 1 ? "row looks" : "rows look",
					" like ",
					drop === 1 ? "a copy" : "copies",
					" of a song already here.",
					compact ? " Keep the original, drop the stub." : " Animation work added a second row instead of replacing the first. Keep one, remove the rest."
				] })]
			}),
			!compact ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostList, {
				plans,
				busy,
				onDrop: dropOne
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: busy,
				onClick: () => void clean(),
				className: "ghost-clean-go",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), busy ? "Cleaning…" : compact ? "Clean ghosts" : "Remove all ghost copies"]
			})
		]
	});
}
function GhostList({ plans, busy, onDrop }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "ghost-clean-list",
		children: plans.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "ghost-clean-plan",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-fg",
				children: ["Keep ", plan.keep.title]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted",
				children: [" · ", plan.why]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: plan.drop.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "ghost-clean-drop",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate",
					children: item.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					className: "ghost-clean-one",
					onClick: () => onDrop(item),
					children: "Remove this"
				})]
			}, item.id)) })]
		}, plan.keep.id))
	});
}
//#endregion
export { ghostDropIds as n, GhostCleaner as t };
