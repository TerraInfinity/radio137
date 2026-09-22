import { o as __toESM } from "./_runtime.mjs";
import { C as require_jsx_runtime, W as require_react, y as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { l as getExperience, y as usePlayerStore } from "./_ssr/player-store-CdB40IHB.mjs";
import { i as Route$10 } from "./_ssr/router-BjRk-_wL.mjs";
import { t as RoseOpera } from "./_ssr/rose-opera-CKiFrD1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CNwsAoC0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ExperiencePage() {
	const { slug } = Route$10.useParams();
	const catalog = usePlayerStore((s) => s.catalog);
	const experience = getExperience(slug, catalog.channels.length ? catalog : void 0);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const ready = usePlayerStore((s) => s.ready);
	const catalogReady = usePlayerStore((s) => s.catalogReady);
	const here = usePlayerStore((s) => Boolean(experience) && s.channelSlug === experience?.stationSlug);
	const stationSlug = experience?.stationSlug;
	(0, import_react.useEffect)(() => {
		if (!ready || !catalogReady || !stationSlug || here) return;
		tuneIn(stationSlug, {
			fromStart: true,
			play: false
		});
	}, [
		ready,
		catalogReady,
		stationSlug,
		here,
		tuneIn
	]);
	if (!experience) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
				children: "Missing rite"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: "No such experience"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/experiences",
				className: "mt-6 inline-flex h-12 items-center font-mono text-[12px] uppercase tracking-[0.16em] text-gold",
				children: "All experiences"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pb-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseOpera, {
			experience,
			layout: "full"
		})
	});
}
//#endregion
export { ExperiencePage as component };
