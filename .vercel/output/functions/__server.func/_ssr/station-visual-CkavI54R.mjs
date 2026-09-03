import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn, y as stationSkin } from "./player-store-4Ayk7g_Y.mjs";
import { s as CoverArt } from "./router-CEym-ghm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station-visual-CkavI54R.js
var import_jsx_runtime = require_jsx_runtime();
function StationVisual({ channel, className, size = "card" }) {
	const skin = stationSkin(channel);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
				src: channel.cover,
				alt: "",
				className: "size-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("station-motion pointer-events-none absolute inset-0", size === "thumb" && "station-motion-thumb", size === "card" && "station-motion-card", size === "hero" && "station-motion-hero", skin === "glaum" && "station-glaum") }),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-glaum-sequins pointer-events-none absolute inset-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-glaum-shrimp pointer-events-none absolute inset-0" })] }) : null,
			skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-wahe pointer-events-none absolute inset-0" }) : null
		]
	});
}
//#endregion
export { StationVisual as t };
