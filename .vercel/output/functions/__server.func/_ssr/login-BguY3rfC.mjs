import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, d as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as safeNext } from "./sso.server-pRd7455L.mjs";
import { a as useRadioUser, i as ssoLoginHref } from "./router-CEym-ghm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BguY3rfC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useRadioUser();
	const search = useRouterState({ select: (s) => s.location.searchStr });
	const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
	const next = safeNext(params.get("next"));
	const href = ssoLoginHref(next);
	(0, import_react.useEffect)(() => {
		if (isPending) return;
		if (user) {
			window.location.replace(next);
			return;
		}
		window.location.assign(href);
	}, [
		href,
		isPending,
		next,
		user
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-4 py-16 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.22em] text-gold",
				children: "Frequency"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold tracking-tight",
				children: "Sign in"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "Google opens on terrainfinity.ca. This radio only consumes the one-time code the hub sends back."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				className: "mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
				children: "Sign in with Google"
			})
		]
	});
}
//#endregion
export { LoginPage as component };
