import { c as stationVisualSrc, i as isLoopingVisual } from "./media-ChlF6fRc.mjs";
import { t as cn } from "./cn-BnEf6O0M.mjs";
import { C as stationSkin } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as CoverArt } from "./router-BjRk-_wL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station-visual-CwReJURx.js
var import_jsx_runtime = require_jsx_runtime();
function StationVisual({ channel, className, size = "card" }) {
	const skin = stationSkin(channel);
	const src = stationVisualSrc(channel);
	const poster = channel.cover && !isLoopingVisual(channel.cover) && src !== channel.cover ? channel.cover : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
				src,
				poster,
				alt: "",
				className: "size-full",
				motion: "loop"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("station-motion pointer-events-none absolute inset-0", size === "thumb" && "station-motion-thumb", size === "card" && "station-motion-card", size === "hero" && "station-motion-hero", skin === "glaum" && "station-glaum") }),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-glaum-sequins pointer-events-none absolute inset-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-glaum-shrimp pointer-events-none absolute inset-0" })] }) : null,
			skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-wahe pointer-events-none absolute inset-0" }) : null,
			skin === "rose" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "station-rose pointer-events-none absolute inset-0" }) : null
		]
	});
}
//#endregion
export { StationVisual as t };
