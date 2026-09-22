import { r as getChannel } from "./_ssr/catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime } from "./_libs/@tanstack/react-router+[...].mjs";
import { y as usePlayerStore } from "./_ssr/player-store-CdB40IHB.mjs";
import { a as Route$12 } from "./_ssr/router-BjRk-_wL.mjs";
import { t as ChannelView } from "./_ssr/channel-view-CFTjwjSI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-D6vlVhTV.js
var import_jsx_runtime = require_jsx_runtime();
function ChannelPage() {
	const { slug } = Route$12.useParams();
	const channel = usePlayerStore((s) => s.catalog).channels.find((item) => item.slug === slug) ?? getChannel(slug);
	if (!channel) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
			children: "Missing desk"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-3 font-display text-4xl font-semibold",
			children: "No such station"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelView, { channel });
}
//#endregion
export { ChannelPage as component };
