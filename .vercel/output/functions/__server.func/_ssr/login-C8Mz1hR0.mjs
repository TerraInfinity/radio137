import { o as __toESM } from "../_runtime.mjs";
import { C as require_jsx_runtime, W as require_react, f as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as safeNext } from "./sso.server-NSJ3vLzw.mjs";
import { D as useRadioUser } from "./router-BjRk-_wL.mjs";
import { t as SignInChoices } from "./sign-in-choices-_CiJYAa3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C8Mz1hR0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useRadioUser();
	const search = useRouterState({ select: (s) => s.location.searchStr });
	const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
	const next = safeNext(params.get("next"));
	(0, import_react.useEffect)(() => {
		if (!isPending && user) window.location.replace(next);
	}, [
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
				children: "Google opens on terrainfinity.ca. X signs in through the Radio session. Nothing else for now."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 flex justify-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInChoices, { next })
			})
		]
	});
}
//#endregion
export { LoginPage as component };
