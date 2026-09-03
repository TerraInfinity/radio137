import { o as __toESM } from "../_runtime.mjs";
import { n as cn, u as hashString } from "./cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as resolveMediaUrl, t as CoverArt } from "./cover-art-D1Z7wPOh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station-visual-MtY7nXC_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StationVisual({ channel, className, dimmed = false, size = "card" }) {
	const videoRef = (0, import_react.useRef)(null);
	const seed = (0, import_react.useMemo)(() => hashString(channel.slug), [channel.slug]);
	const pattern = seed % 4;
	const animation = resolveMediaUrl(channel.animationUrl);
	const [reduce, setReduce] = (0, import_react.useState)(false);
	const skin = channel.skin && channel.skin !== "none" ? channel.skin : null;
	(0, import_react.useEffect)(() => {
		setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
	}, []);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || !animation || reduce) return;
		const io = new IntersectionObserver((entries) => {
			for (const entry of entries) if (entry.isIntersecting) video.play().catch(() => {});
			else video.pause();
		}, { threshold: .2 });
		io.observe(video);
		return () => io.disconnect();
	}, [animation, reduce]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden bg-bg-subtle shadow-[var(--shadow-border)]", dimmed && "opacity-55 grayscale", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
				src: channel.cover,
				alt: "",
				className: "absolute inset-0 size-full rounded-none shadow-none"
			}),
			animation && !reduce ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: cn("absolute inset-0 size-full object-cover", size === "thumb" ? "opacity-80" : size === "card" ? "opacity-90" : "opacity-100"),
				src: animation,
				poster: resolveMediaUrl(channel.cover) || void 0,
				muted: true,
				loop: true,
				playsInline: true,
				preload: size === "hero" ? "auto" : "metadata",
				"aria-hidden": true
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("station-motion pointer-events-none absolute inset-0", `station-motion-${pattern}`, size === "hero" ? "station-motion-hero" : size === "thumb" ? "station-motion-thumb" : "station-motion-card"),
				style: {
					["--station-turn"]: `${28 + seed % 40}s`,
					["--station-drift"]: `${10 + seed % 14}s`,
					["--station-shift"]: `${(seed % 360).toString()}deg`
				},
				"aria-hidden": true
			}),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "station-glaum pointer-events-none absolute inset-0",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "station-glaum-sequins pointer-events-none absolute inset-0",
					"aria-hidden": true
				}),
				size !== "thumb" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "station-glaum-shrimp pointer-events-none absolute inset-0",
					"aria-hidden": true
				}) : null
			] }) : null,
			skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "station-wahe pointer-events-none absolute inset-0",
				"aria-hidden": true
			}) : null,
			size === "hero" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" }) : null
		]
	});
}
//#endregion
export { StationVisual as t };
