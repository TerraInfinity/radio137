import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./cn-BnEf6O0M.mjs";
import { C as require_jsx_runtime, W as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-nKCa1E1y.mjs";
import { E as ssoLoginHref } from "./router-BjRk-_wL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sign-in-choices-_CiJYAa3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SignInChoices({ next = "/", stacked = true }) {
	const [busy, setBusy] = (0, import_react.useState)(null);
	const path = next.startsWith("/") && !next.startsWith("//") ? next : "/";
	async function withX() {
		setBusy("x");
		try {
			await signIn("grok-x", {
				callbackURL: path,
				errorCallbackURL: "/login"
			});
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "X sign-in failed");
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex gap-2", stacked ? "flex-col" : "flex-wrap"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
			href: ssoLoginHref(path),
			onClick: () => setBusy("google"),
			className: "inline-flex h-12 min-w-44 items-center justify-center rounded-md bg-fg px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
			children: busy === "google" ? "Opening Google…" : "Continue with Google"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			disabled: Boolean(busy),
			onClick: () => void withX(),
			className: "inline-flex h-12 min-w-44 items-center justify-center rounded-md px-6 font-mono text-[12px] uppercase tracking-[0.16em] text-gold shadow-[var(--shadow-border)]",
			children: busy === "x" ? "Opening X…" : "Continue with X"
		})]
	});
}
//#endregion
export { SignInChoices as t };
