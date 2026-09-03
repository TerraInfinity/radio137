import { b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-sjvYBAy7.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Manual"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "About"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-4 text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Radio is a nocturnal temple-broadcast. The green lamp in the header starts a station when you open it. First visit lands on Default. After that, this browser resumes the last desk you touched. Listening does not require an account." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"The",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/desk",
							className: "text-cyan",
							children: "station desk"
						}),
						" ",
						"maps folders to stations. This preview keeps the public dial, the collapsed player, and a compact upcoming list. The full host explorer stays on the origin radio."
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Credits appear only when a real original URL is added to a cut." })
				]
			})
		]
	});
}
//#endregion
export { AboutPage as component };
