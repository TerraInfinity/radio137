import { o as __toESM } from "../_runtime.mjs";
import { a as getSeedCatalog, l as kindHint, n as getCatalog, u as kindLabel } from "./catalog-BcaLbP39.mjs";
import { t as applyCatalogEdits } from "./catalog-edits-BhjK6UvC.mjs";
import { B as require_react, V as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as r2KeyFromAudioUrl, n as fileLocationLabel } from "./file-path-PXlvogCB.mjs";
import { B as formatClock, C as placeStationTrack, D as setFeaturedRail, E as saveStation, H as usePlayerStore, R as CoverArt, S as pingServices, T as restoreStationTrack, V as slugify, _ as listStationR2, b as moveR2Object, c as useRadioUser, d as deleteR2Object, f as deleteStationFile, g as hideStationTrack, s as ssoLoginHref, u as addStationTrack, w as reorderStationTracks, x as patchStationTrack, z as cn } from "./router-Cp-QOkSx.mjs";
import { t as StationSettingsForm } from "./station-settings-C6eJKO8j.mjs";
import { n as DeskDirectory } from "./desk-directory-9mJDMg10.mjs";
import { t as ModePill } from "./mode-pill-hY2mQsDB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-CSlb4TUK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function applySnapshot$1(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function fail(error) {
	window.alert(error instanceof Error ? error.message : "Desk save failed");
}
function DeskStations({ channels, r2Configured }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(null);
	const selected = channels.find((channel) => channel.slug === open) ?? null;
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return channels.filter((channel) => !needle || `${channel.name} ${channel.slug} ${channel.kind}`.toLowerCase().includes(needle));
	}, [channels, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewStationForm, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedRail, { channels }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Stations"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: query,
						onChange: (event) => setQuery(event.target.value),
						placeholder: "Name or slug"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 max-h-[36rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-2 shadow-[var(--shadow-filigree)]",
					children: visible.map((channel) => {
						const cuts = channel.tracks.filter((track) => track.enabled !== false).length;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setOpen(channel.slug),
							className: cn("flex w-full items-center gap-3 rounded-lg p-2 text-left", open === channel.slug ? "bg-bg shadow-[var(--shadow-filigree)]" : "hover:bg-bg"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: channel.cover,
								alt: "",
								className: "size-11 shrink-0 rounded-md"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-display text-base font-semibold",
									children: channel.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [
										kindLabel(channel.kind),
										" · ",
										cuts,
										channel.featured ? " · featured" : "",
										channel.enabled ? "" : " · off air"
									]
								})]
							})]
						}) }, channel.slug);
					})
				})] }), selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationWorkspace, {
					channel: selected,
					channels,
					r2Configured
				}, selected.slug) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "self-start rounded-xl bg-bg-elevated p-6 text-sm text-muted shadow-[var(--shadow-border)]",
					children: "Pick a station to edit its playlist. Add cuts from another desk, upload files, or drop in a URL."
				})]
			})
		]
	});
}
function FeaturedRail({ channels }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [pick, setPick] = (0, import_react.useState)("");
	const featured = (0, import_react.useMemo)(() => [...channels].filter((channel) => channel.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)), [channels]);
	const rest = channels.filter((channel) => !channel.featured);
	const slugs = featured.map((channel) => channel.slug);
	async function commit(next) {
		setBusy(true);
		try {
			const result = await setFeaturedRail({ data: { slugs: next } });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Homepage featured"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "This is the homepage rail. Move, remove, or add a station here — you do not need to open the station first."
			}),
			featured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-subtle",
				children: "Nothing on the rail yet."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: featured.map((channel, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 rounded-lg bg-bg p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
							src: channel.cover,
							alt: "",
							className: "size-12 shrink-0 rounded-md"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 font-mono text-[11px] tabular-nums text-subtle",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-display text-lg font-semibold",
								children: channel.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
								children: kindLabel(channel.kind)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || index === 0,
							onClick: () => {
								const next = [...slugs];
								[next[index - 1], next[index]] = [next[index], next[index - 1]];
								commit(next);
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy || index === featured.length - 1,
							onClick: () => {
								const next = [...slugs];
								[next[index + 1], next[index]] = [next[index], next[index + 1]];
								commit(next);
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Down"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: busy,
							onClick: () => void commit(slugs.filter((slug) => slug !== channel.slug)),
							className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Remove"
						})
					]
				}, channel.slug))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (!pick) return;
					commit([...slugs, pick]).then(() => setPick(""));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
					className: "input min-w-56 flex-1",
					value: pick,
					onChange: (event) => setPick(event.target.value),
					disabled: busy,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: "Add a station to the rail"
					}), rest.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: channel.slug,
						children: channel.name
					}, channel.slug))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy || !pick,
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-50",
					children: "Add to rail"
				})]
			})
		]
	});
}
function NewStationForm() {
	const [name, setName] = (0, import_react.useState)("");
	const [slug, setSlug] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("fixed");
	const [featured, setFeatured] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		onSubmit: (event) => {
			event.preventDefault();
			const nextSlug = slugify(slug || name);
			if (!name.trim() || !nextSlug) return;
			setBusy(true);
			saveStation({ data: {
				slug: nextSlug,
				added: true,
				name: name.trim(),
				kind,
				featured,
				enabled: true,
				energy: kind === "fixed" ? "start to finish" : kind === "ondemand" ? "vault" : "clock",
				category: "Custom"
			} }).then((result) => {
				applySnapshot$1(result.tracks, result.stations);
				setName("");
				setSlug("");
				setFeatured(false);
			}).catch(fail).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "New station"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Fixed plays start to finish. Live joins a shared clock. Vault waits on demand."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: name,
					onChange: (event) => setName(event.target.value),
					placeholder: "Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input",
					value: slug,
					onChange: (event) => setSlug(event.target.value),
					placeholder: "slug (optional)"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-wrap gap-2",
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
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: kindHint(kind)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-3 inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: featured,
					onChange: (event) => setFeatured(event.target.checked)
				}), "Put on featured rail"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					disabled: busy,
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: busy ? "Creating…" : "Create station"
				})
			})
		]
	});
}
function StationWorkspace({ channel, channels, r2Configured }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [addMode, setAddMode] = (0, import_react.useState)("library");
	const others = channels.filter((item) => item.slug !== channel.slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: "Editing"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-3xl font-semibold tracking-tight",
						children: channel.name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
					kind: channel.kind,
					mode: channel.mode,
					enabled: channel.enabled,
					nsfw: channel.nsfw
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationSettingsForm, {
					channel,
					compact: true
				}, `${channel.slug}:${channel.shuffle}:${channel.kind}`)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						const slugs = channels.filter((item) => item.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99)).map((item) => item.slug);
						const next = channel.featured ? slugs.filter((slug) => slug !== channel.slug) : [...slugs, channel.slug];
						setBusy(true);
						setFeaturedRail({ data: { slugs: next } }).then((result) => applySnapshot$1(result.tracks, result.stations)).catch(fail).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
					children: channel.featured ? "Remove from featured" : "Add to featured"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						const nextHidden = channel.enabled;
						if (nextHidden && !window.confirm(`Take “${channel.name}” off air?`)) return;
						setBusy(true);
						saveStation({ data: {
							slug: channel.slug,
							hidden: nextHidden,
							enabled: !nextHidden
						} }).then((result) => applySnapshot$1(result.tracks, result.stations)).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember",
					children: channel.enabled ? "Take off air" : "Restore to air"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
						children: "Add songs"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-1",
						children: [
							["library", "From another station"],
							["upload", "Upload files"],
							["url", "From URL"]
						].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setAddMode(id),
							className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", addMode === id ? "bg-fg text-bg" : "text-gold"),
							children: label
						}, id))
					}),
					addMode === "library" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LibraryPicker, {
						channel,
						others
					}) : null,
					addMode === "upload" ? r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDrop, {
						slug: channel.slug,
						cover: channel.cover
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: "R2 keys are dark — use the Services tab."
					}) : null,
					addMode === "url" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UrlAddForm, { channel }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Playlist, {
				channel,
				others,
				r2Configured
			})
		]
	});
}
function UrlAddForm({ channel }) {
	const [title, setTitle] = (0, import_react.useState)("");
	const [audioUrl, setAudioUrl] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-3 flex flex-wrap gap-2",
		onSubmit: (event) => {
			event.preventDefault();
			if (!title.trim() || !audioUrl.trim()) return;
			setBusy(true);
			addStationTrack({ data: {
				channelSlug: channel.slug,
				title: title.trim(),
				audioUrl: audioUrl.trim(),
				coverUrl: channel.cover
			} }).then((result) => {
				applySnapshot$1(result.tracks, result.stations);
				setTitle("");
				setAudioUrl("");
			}).catch(fail).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input max-w-xs",
				value: title,
				onChange: (event) => setTitle(event.target.value),
				placeholder: "Title"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input min-w-64 flex-1",
				value: audioUrl,
				onChange: (event) => setAudioUrl(event.target.value),
				placeholder: "https://…"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy,
				className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: "Add URL"
			})
		]
	});
}
function LibraryPicker({ channel, others }) {
	const [needle, setNeedle] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const hits = (0, import_react.useMemo)(() => {
		const q = needle.trim().toLowerCase();
		if (q.length < 2) return [];
		const rows = [];
		for (const station of others) for (const track of station.tracks) {
			if (track.enabled === false) continue;
			if (!`${track.title} ${track.artist} ${station.name}`.toLowerCase().includes(q)) continue;
			rows.push({
				station,
				track
			});
			if (rows.length >= 40) return rows;
		}
		return rows;
	}, [needle, others]);
	async function place(station, track, mode) {
		const key = `${mode}:${track.id}`;
		setBusy(key);
		try {
			const result = await placeStationTrack({ data: {
				fromSlug: station.slug,
				trackId: track.id,
				toSlug: channel.slug,
				mode
			} });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(null);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "input",
			value: needle,
			onChange: (event) => setNeedle(event.target.value),
			placeholder: "Search titles across other stations"
		}), needle.trim().length < 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-subtle",
			children: "Type two letters to find a cut on another desk, then copy or move it here."
		}) : hits.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-subtle",
			children: "No matching cuts."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 max-h-64 space-y-1 overflow-y-auto rounded-lg bg-bg p-2",
			children: hits.map(({ station, track }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-wrap items-center gap-2 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								station.name,
								" · ",
								track.artist
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: Boolean(busy),
						onClick: () => void place(station, track, "copy"),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: busy === `copy:${track.id}` ? "…" : "Copy here"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: Boolean(busy),
						onClick: () => void place(station, track, "move"),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: busy === `move:${track.id}` ? "…" : "Move here"
					})
				]
			}, `${station.slug}:${track.id}`))
		})]
	});
}
function Playlist({ channel, others, r2Configured }) {
	const [filter, setFilter] = (0, import_react.useState)("");
	const [showHidden, setShowHidden] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const live = channel.tracks.filter((track) => track.enabled !== false);
	const hidden = channel.tracks.filter((track) => track.enabled === false);
	const visible = (0, import_react.useMemo)(() => {
		const source = showHidden ? channel.tracks : live;
		const q = filter.trim().toLowerCase();
		if (!q) return source;
		return source.filter((track) => `${track.title} ${track.artist}`.toLowerCase().includes(q));
	}, [
		channel.tracks,
		filter,
		live,
		showHidden
	]);
	async function move(indexInChannel, dir) {
		const ids = channel.tracks.map((item) => item.id);
		const next = indexInChannel + dir;
		if (next < 0 || next >= ids.length) return;
		[ids[indexInChannel], ids[next]] = [ids[next], ids[indexInChannel]];
		setBusy(true);
		try {
			const result = await reorderStationTracks({ data: {
				channelSlug: channel.slug,
				trackIds: ids
			} });
			applySnapshot$1(result.tracks, result.stations);
		} catch (error) {
			fail(error);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
					children: "Playlist"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						live.length,
						" on air",
						hidden.length ? ` · ${hidden.length} removed` : ""
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-11 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: showHidden,
						onChange: (event) => setShowHidden(event.target.checked)
					}), "Show removed"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input mt-3",
				value: filter,
				onChange: (event) => setFilter(event.target.value),
				placeholder: "Filter this playlist"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 max-h-[28rem] divide-y divide-line overflow-y-auto rounded-lg bg-bg",
				children: [visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "p-4 text-sm text-subtle",
					children: "No cuts match."
				}) : null, visible.map((track) => {
					const index = channel.tracks.findIndex((item) => item.id === track.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTrackRow, {
						channel,
						track,
						index,
						others,
						r2Configured,
						editing: editing === track.id,
						onToggleEdit: () => setEditing((current) => current === track.id ? null : track.id),
						onMove: (dir) => void move(index, dir),
						busy
					}, track.id);
				})]
			})
		]
	});
}
function DeskTrackRow({ channel, track, index, others, r2Configured, editing, onToggleEdit, onMove, busy }) {
	const [title, setTitle] = (0, import_react.useState)(track.title);
	const [artist, setArtist] = (0, import_react.useState)(track.artist);
	const [tags, setTags] = (0, import_react.useState)((track.tags ?? []).join(", "));
	const [dest, setDest] = (0, import_react.useState)("");
	const [localBusy, setLocalBusy] = (0, import_react.useState)(false);
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	const hidden = track.enabled === false;
	const locked = busy || localBusy;
	async function saveMeta() {
		setLocalBusy(true);
		try {
			const result = await patchStationTrack({ data: {
				channelSlug: channel.slug,
				trackId: track.id,
				title: title.trim() || track.title,
				artist: artist.trim() || track.artist,
				tags: (tags || "").trim()
			} });
			applySnapshot$1(result.tracks, result.stations);
			onToggleEdit();
		} catch (error) {
			fail(error);
		} finally {
			setLocalBusy(false);
		}
	}
	async function place(mode) {
		if (!dest) return;
		if (mode === "move" && !window.confirm(`Move “${track.title}” to that station? It leaves this playlist.`)) return;
		setLocalBusy(true);
		try {
			const result = await placeStationTrack({ data: {
				fromSlug: channel.slug,
				trackId: track.id,
				toSlug: dest,
				mode
			} });
			applySnapshot$1(result.tracks, result.stations);
			setDest("");
		} catch (error) {
			fail(error);
		} finally {
			setLocalBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("p-3", hidden && "opacity-50"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-8 font-mono text-[11px] tabular-nums text-subtle",
						children: String(index + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate",
							children: track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								track.artist,
								" · ",
								location
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] tabular-nums text-subtle",
						children: formatClock(track.durationSec)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => onMove(-1),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Up"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => onMove(1),
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Down"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: onToggleEdit,
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: editing ? "Close" : "Edit"
					}),
					hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => {
							setLocalBusy(true);
							restoreStationTrack({ data: {
								channelSlug: channel.slug,
								trackId: track.id
							} }).then((result) => applySnapshot$1(result.tracks, result.stations)).finally(() => setLocalBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Restore"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => {
							if (!window.confirm(`Remove “${track.title}” from this station? File stays on R2.`)) return;
							setLocalBusy(true);
							hideStationTrack({ data: {
								channelSlug: channel.slug,
								trackId: track.id,
								audioUrl: track.audioUrl
							} }).then((result) => applySnapshot$1(result.tracks, result.stations)).finally(() => setLocalBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
						children: "Remove"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked || !r2Configured || !key,
						onClick: () => {
							if (!key || !window.confirm(`Delete on R2?\n${key}`)) return;
							setLocalBusy(true);
							deleteStationFile({ data: {
								channelSlug: channel.slug,
								trackId: track.id,
								audioUrl: track.audioUrl,
								r2Key: key,
								alsoDeleteR2: true
							} }).then((result) => applySnapshot$1(result.tracks, result.stations)).finally(() => setLocalBusy(false));
						},
						className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
						children: "Delete file"
					})
				]
			}),
			editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2 rounded-lg bg-bg-elevated p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: title,
						onChange: (event) => setTitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: artist,
						onChange: (event) => setArtist(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: tags,
						onChange: (event) => setTags(event.target.value),
						placeholder: "Tags, comma separated"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: locked,
						onClick: () => void saveMeta(),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Save names"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "input min-w-52 flex-1",
								value: dest,
								onChange: (event) => setDest(event.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "Move or copy to another station"
								}), others.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: item.slug,
									children: item.name
								}, item.slug))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: locked || !dest,
								onClick: () => void place("copy"),
								className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Copy there"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: locked || !dest,
								onClick: () => void place("move"),
								className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: "Move there"
							})
						]
					})
				]
			}) : null
		]
	});
}
function UploadDrop({ slug, cover }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	async function send(file) {
		setBusy(true);
		setHint(`Uploading ${file.name}…`);
		try {
			const body = new FormData();
			body.set("slug", slug);
			body.set("coverUrl", cover);
			body.set("file", file);
			const res = await fetch("/api/desk/upload", {
				method: "POST",
				body
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json.error || "Upload failed");
			if (json.tracks) applySnapshot$1(json.tracks, json.stations ?? []);
			setHint(`Added ${file.name}`);
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	}
	async function sendMany(files) {
		for (const file of files) await send(file);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "mt-3 block cursor-pointer rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		onDragOver: (event) => event.preventDefault(),
		onDrop: (event) => {
			event.preventDefault();
			const files = [...event.dataTransfer.files];
			if (files.length) sendMany(files);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Upload to this station"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: hint || "Drop mp3 / wav / flac / m4a here. Multiple files are fine."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				multiple: true,
				accept: "audio/mpeg,audio/wav,audio/flac,audio/mp4,audio/ogg,audio/aac,.mp3,.wav,.flac,.m4a,.ogg,.aac",
				disabled: busy,
				className: "mt-2 block w-full text-sm text-muted file:mr-3 file:h-11 file:rounded-md file:border-0 file:bg-fg file:px-3 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.14em] file:text-bg",
				onChange: (event) => {
					const files = [...event.target.files ?? []];
					event.target.value = "";
					if (files.length) sendMany(files);
				}
			})
		]
	});
}
function applySnapshot(tracks, stations) {
	usePlayerStore.getState().replaceCatalog(applyCatalogEdits(getSeedCatalog(), tracks, stations));
}
function DeskPage() {
	const { user, isAdmin, isPending, r2Configured, lamps } = useRadioUser();
	const catalog = usePlayerStore((s) => s.catalog);
	const channels = catalog.channels.length ? catalog.channels : getCatalog().channels;
	const [tab, setTab] = (0, import_react.useState)("stations");
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 font-mono text-[11px] uppercase tracking-[0.16em] text-muted",
				children: "Checking the door."
			})
		]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskLocked, {});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Clockwork desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-muted",
				children: [
					"Signed in as ",
					user.email,
					". This door is for C — career@terrainfinity.ca and c@cyber-athens.ca."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "mt-8 inline-flex h-11 items-center font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
				children: "Back to stations"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "C · God desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: "Featured rail, playlists, and a directory so copied folders list as one song. Files stay on R2."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-1",
				children: [
					["stations", "Stations"],
					["directory", "Directory"],
					["r2", "R2"],
					["services", "Services"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", tab === id ? "bg-fg text-bg" : "text-gold"),
					children: label
				}, id))
			}),
			tab === "stations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskStations, {
				channels,
				r2Configured
			}) : null,
			tab === "directory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskDirectory, { catalog: catalog.channels.length ? catalog : getCatalog() }) : null,
			tab === "r2" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(R2Board, {
				channels,
				r2Configured
			}) : null,
			tab === "services" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ServicesBoard, {
				r2Configured,
				lamps
			}) : null
		]
	});
}
function DeskLocked() {
	const href = ssoLoginHref("/desk");
	(0, import_react.useEffect)(() => {
		window.location.assign(href);
	}, [href]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-gold",
				children: "Station desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Unlock"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: "C accounts sign in through the Terrainfinity hub. Google lives there."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href,
				className: "mt-8 inline-flex h-12 items-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
				children: "Sign in with Google"
			})
		]
	});
}
function R2Board({ channels, r2Configured }) {
	const [prefix, setPrefix] = (0, import_react.useState)("radio/");
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [error, setError] = (0, import_react.useState)("");
	const [objects, setObjects] = (0, import_react.useState)([]);
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [assign, setAssign] = (0, import_react.useState)(channels[0]?.slug ?? "");
	function refresh(nextPrefix = prefix) {
		setStatus("loading");
		listStationR2({ data: { prefix: nextPrefix } }).then((result) => {
			setObjects(result.objects);
			setStatus(result.ok ? "ready" : "error");
			setError(result.ok ? "" : result.error || "Could not list.");
		}).catch((err) => {
			setStatus("error");
			setError(err instanceof Error ? err.message : "Could not list.");
		});
	}
	(0, import_react.useEffect)(() => {
		if (r2Configured) refresh();
	}, [r2Configured]);
	if (!r2Configured) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8 rounded-xl bg-bg-elevated p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
			children: "R2"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-muted",
			children: "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY in Vercel. The Services tab will turn those lamps green."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					refresh(prefix);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input min-w-64 flex-1",
					value: prefix,
					onChange: (event) => setPrefix(event.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
					children: "List"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 flex flex-wrap gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					if (!from.trim() || !to.trim()) return;
					moveR2Object({ data: {
						from: from.trim(),
						to: to.trim()
					} }).then(() => {
						setFrom("");
						setTo("");
						refresh();
					}).catch((err) => window.alert(err instanceof Error ? err.message : "Move failed"));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input min-w-48 flex-1",
						value: from,
						onChange: (event) => setFrom(event.target.value),
						placeholder: "Move from key"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input min-w-48 flex-1",
						value: to,
						onChange: (event) => setTo(event.target.value),
						placeholder: "to key"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Move"
					})
				]
			}),
			status === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted",
				children: "Listing…"
			}) : null,
			status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-ember",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 max-h-[28rem] space-y-1 overflow-y-auto rounded-xl bg-bg-elevated p-3",
				children: objects.map((object) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate font-mono text-[11px] text-subtle",
							children: object.key
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "input w-40",
							value: assign,
							onChange: (event) => setAssign(event.target.value),
							children: channels.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: channel.slug,
								children: channel.name
							}, channel.slug))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const objectTitle = object.key.split("/").pop()?.replace(/\.[^.]+$/, "") || object.key;
								addStationTrack({ data: {
									channelSlug: assign,
									title: objectTitle,
									audioUrl: object.url,
									r2Key: object.key
								} }).then((result) => applySnapshot(result.tracks, result.stations)).catch((err) => window.alert(err instanceof Error ? err.message : "Import failed"));
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Import"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setFrom(object.key);
								setTo(object.key);
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Move"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								if (!window.confirm(`Delete ${object.key}?`)) return;
								deleteR2Object({ data: { key: object.key } }).then(() => refresh()).catch((err) => window.alert(err instanceof Error ? err.message : "Delete failed"));
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Delete"
						})
					]
				}, object.key))
			})
		]
	});
}
function ServicesBoard({ r2Configured, lamps }) {
	const [ping, setPing] = (0, import_react.useState)(null);
	const [pinging, setPinging] = (0, import_react.useState)(false);
	const groups = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const lamp of lamps) {
			const list = map.get(lamp.group) ?? [];
			list.push(lamp);
			map.set(lamp.group, list);
		}
		return [...map.entries()];
	}, [lamps]);
	const ready = lamps.filter((lamp) => lamp.required).every((lamp) => lamp.set);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Production keys"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 max-w-prose text-muted",
				children: ["Put secrets in Vercel on the production project. This desk never shows the values — only whether each key is present. ", ready ? "Required lamps are green." : "Some required lamps are still dark."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
				children: ["R2 ", r2Configured ? "live" : "missing"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-4 max-w-prose space-y-2 text-sm text-muted",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "AUTH_SECRET must match the Terrainfinity hub so radio can mint and read the shared session." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "SSO_HUB must be https://www.terrainfinity.ca. Do not set AUTH_URL to the hub — Radio already mounts /api/auth/* for the Grok session." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "AUTH_COOKIE_DOMAIN=.terrainfinity.ca only on radio.terrainfinity.ca. radio.cyber-athens.ca uses the consume handoff instead of a shared cookie." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "DATABASE_URL is the shared Postgres with the hub — playlist and station edits live here." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "R2_ACCOUNT_ID + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY open the media bucket. R2_BUCKET defaults to media-empire-radio." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: pinging,
				onClick: () => {
					setPinging(true);
					pingServices().then(setPing).catch((error) => window.alert(error instanceof Error ? error.message : "Ping failed")).finally(() => setPinging(false));
				},
				className: "mt-4 inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
				children: pinging ? "Pinging…" : "Test hub + R2"
			}),
			ping ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"Hub ",
					ping.hub.origin,
					" — ",
					ping.hub.ok ? "reachable" : "dark",
					" (",
					ping.hub.note,
					")."
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					"R2 — ",
					ping.r2.ok ? ping.r2.note : ping.r2.note,
					"."
				] })]
			}) : null,
			groups.map(([group, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: group
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: items.map((lamp) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("env-dot mt-1.5", lamp.set ? "env-dot-on" : "env-dot-off") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[12px] uppercase tracking-[0.12em]",
								children: lamp.key
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									lamp.label,
									lamp.required ? " · required" : " · optional",
									" — ",
									lamp.set ? "active" : "missing",
									". ",
									lamp.hint
								]
							})]
						})]
					}, lamp.key))
				})]
			}, group))
		]
	});
}
//#endregion
export { DeskPage as component };
