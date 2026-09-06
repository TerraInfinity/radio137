import { o as __toESM } from "../_runtime.mjs";
import { a as getSeedCatalog, b as shuffleLabel, f as normalizeKind, l as kindHint, p as normalizeShuffle, u as kindLabel, y as shuffleHint } from "./catalog-BcaLbP39.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-BhjK6UvC.mjs";
import { B as require_react, V as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as saveStation, H as usePlayerStore, z as cn } from "./router-Cp-QOkSx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/station-settings-C6eJKO8j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function StationSettingsForm({ channel, compact = false }) {
	const [name, setName] = (0, import_react.useState)(channel.name);
	const [description, setDescription] = (0, import_react.useState)(channel.description);
	const [kind, setKind] = (0, import_react.useState)(normalizeKind(channel.kind || channel.mode));
	const [shuffle, setShuffle] = (0, import_react.useState)(normalizeShuffle(channel.shuffle));
	const [category, setCategory] = (0, import_react.useState)(channel.category ?? "");
	const [energy, setEnergy] = (0, import_react.useState)(channel.energy ?? "");
	const [tags, setTags] = (0, import_react.useState)(channel.tags.join(", "));
	const [cover, setCover] = (0, import_react.useState)(channel.cover ?? "");
	const [nsfw, setNsfw] = (0, import_react.useState)(Boolean(channel.nsfw));
	const [claimable, setClaimable] = (0, import_react.useState)(Boolean(channel.claimable));
	const [featured, setFeatured] = (0, import_react.useState)(Boolean(channel.featured));
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: cn("space-y-3", compact ? "" : "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]"),
		onSubmit: (event) => {
			event.preventDefault();
			setBusy(true);
			saveStation({ data: {
				slug: channel.slug,
				name: name.trim() || channel.name,
				description,
				kind,
				shuffle,
				category: category.trim() || void 0,
				energy: energy.trim() || void 0,
				tags: tags.trim() || void 0,
				cover: cover.trim() || void 0,
				nsfw,
				claimable,
				featured
			} }).then((result) => applySnapshot(result.tracks, result.stations)).catch((error) => window.alert(error instanceof Error ? error.message : "Save failed")).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Station settings"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input",
				value: name,
				onChange: (event) => setName(event.target.value),
				placeholder: "Name"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "input",
				value: description,
				onChange: (event) => setDescription(event.target.value),
				placeholder: "Description"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						"live",
						"ondemand",
						"fixed"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", kind === value ? "bg-fg text-bg" : "text-gold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							className: "sr-only",
							checked: kind === value,
							onChange: () => setKind(value)
						}), kindLabel(value)]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: kindHint(kind)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Shuffle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: [
						"off",
						"optional",
						"on"
					].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", shuffle === value ? "bg-fg text-bg" : "text-gold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "radio",
							className: "sr-only",
							checked: shuffle === value,
							onChange: () => setShuffle(value)
						}), shuffleLabel(value)]
					}, value))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: shuffleHint(shuffle)
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Category"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: category,
						onChange: (event) => setCategory(event.target.value),
						placeholder: "Temple, vault…"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: "Energy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: energy,
						onChange: (event) => setEnergy(event.target.value),
						placeholder: "clock, start to finish…"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Tags"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input mt-1",
					value: tags,
					onChange: (event) => setTags(event.target.value),
					placeholder: "comma separated"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
					children: "Cover URL"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input mt-1",
					value: cover,
					onChange: (event) => setCover(event.target.value),
					placeholder: "https://…"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: featured,
							onChange: (event) => setFeatured(event.target.checked)
						}), "Featured"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: claimable,
							onChange: (event) => setClaimable(event.target.checked)
						}), "DJ booth"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: nsfw,
							onChange: (event) => setNsfw(event.target.checked)
						}), "18+"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy,
				className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: busy ? "Saving…" : "Save settings"
			})
		]
	});
}
//#endregion
export { StationSettingsForm as t };
