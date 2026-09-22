import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as listExperiences, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/experiences-CoXL0zAS.js
var import_jsx_runtime = require_jsx_runtime();
function ExperiencesIndex() {
	const catalog = usePlayerStore((s) => s.catalog);
	const items = listExperiences(catalog.channels.length ? catalog : void 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 py-12 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Frequency"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Experiences"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-muted",
				children: "Fixed-order rites. The playlist is the score; the screen is the stage. Shuffle stays off so the sequence holds."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-10 grid gap-5",
				children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/experiences/$slug",
					params: { slug: item.slug },
					className: "grid overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)] sm:grid-cols-[14rem_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.cover,
						alt: "",
						className: "aspect-[3/4] h-full w-full object-cover sm:aspect-auto sm:min-h-48"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex flex-col justify-center p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.18em] text-gold",
								children: item.kicker
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-2 font-display text-3xl font-semibold",
								children: item.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-2 font-glaum text-xl text-gold",
								children: item.line
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-3 max-w-prose text-sm text-muted",
								children: item.summary
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan",
								children: item.whisper
							})
						]
					})]
				}) }, item.slug))
			})
		]
	});
}
//#endregion
export { ExperiencesIndex as component };
