import { o as __toESM } from "../_runtime.mjs";
import { a as getCatalog, s as getPlayableTracks } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as Play, s as Pause } from "../_libs/lucide-react.mjs";
import { i as Route$13, s as usePlayerStore } from "./router-ICW3tdWz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/embed-BsP2xzt1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EmbedPage() {
	const search = Route$13.useSearch();
	const hydrate = usePlayerStore((s) => s.hydrate);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const togglePlay = usePlayerStore((s) => s.togglePlay);
	const status = usePlayerStore((s) => s.status);
	const track = usePlayerStore((s) => s.track);
	const catalog = getCatalog();
	(0, import_react.useEffect)(() => {
		hydrate();
		const key = search.track || search.t;
		if (search.station) {
			const channel = catalog.channels.find((item) => item.slug === search.station || item.slug.includes(search.station || "")) ?? catalog.channels.find((item) => item.enabled);
			if (channel) tuneIn(channel.slug, { forcePlay: true });
			return;
		}
		if (key) for (const channel of catalog.channels) {
			if (!channel.enabled) continue;
			const hit = getPlayableTracks(channel).find((item) => item.id === key || item.audioUrl.includes(key) || item.title.toLowerCase().includes(key.toLowerCase()));
			if (hit) {
				cueTrack(channel.slug, hit.id);
				return;
			}
		}
		const fallback = catalog.channels.find((item) => item.isDefault) ?? catalog.channels[0];
		if (fallback) tuneIn(fallback.slug, { forcePlay: true });
	}, [
		catalog,
		cueTrack,
		hydrate,
		search.station,
		search.t,
		search.track,
		tuneIn
	]);
	(0, import_react.useEffect)(() => {
		const post = (type) => {
			window.parent?.postMessage({
				source: "radio-embed",
				type,
				title: track?.title ?? null
			}, "*");
		};
		if (status === "playing") post("playing");
		if (status === "paused") post("paused");
	}, [status, track?.title]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full items-center gap-3 bg-bg px-3 text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => void togglePlay(),
			className: "inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-fg text-bg",
			"aria-label": status === "playing" ? "Pause" : "Play",
			children: status === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 ml-0.5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-display text-base font-semibold",
				children: track?.title ?? "Radio"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
				children: track?.artist ?? "Idle"
			})]
		})]
	});
}
//#endregion
export { EmbedPage as component };
