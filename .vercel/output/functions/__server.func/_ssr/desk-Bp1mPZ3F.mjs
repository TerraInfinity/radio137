import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getSeedCatalog, g as usePlayerStore, l as kindHint, n as getCatalog, p as normalizeKind, t as applyCatalogEdits, u as kindLabel } from "./player-store-Dz5TRk6B.mjs";
import { n as formatClock, r as slugify, t as cn } from "./cn-CyOQLR37.mjs";
import { r as r2KeyFromAudioUrl, t as fileLocationLabel } from "./file-path-B3HtxHuV.mjs";
import { _ as reorderStationTracks, a as useRadioUser, c as deleteR2Object, f as hideStationTrack, g as pingServices, h as patchStationTrack, i as ssoLoginHref, l as deleteStationFile, m as moveR2Object, o as CoverArt, p as listStationR2, s as addStationTrack, v as restoreStationTrack, y as saveStation } from "./router-DCyqcLgO.mjs";
import { t as ModePill } from "./mode-pill-WssAb88K.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-Bp1mPZ3F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
		className: "mx-auto max-w-5xl px-4 py-8 pb-44",
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
				children: "Only those two C Google accounts open this room. Change type, featured, playlists, R2 files, and watch which production keys are live."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 flex flex-wrap gap-1",
				children: [
					["stations", "Stations"],
					["r2", "R2"],
					["services", "Services"]
				].map(([id, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTab(id),
					className: cn("inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", tab === id ? "bg-fg text-bg" : "text-gold"),
					children: label
				}, id))
			}),
			tab === "stations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationBoard, {
				channels,
				r2Configured
			}) : null,
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
function StationBoard({ channels, r2Configured }) {
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(null);
	const visible = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return channels.filter((channel) => !needle || `${channel.name} ${channel.slug} ${channel.kind}`.toLowerCase().includes(needle));
	}, [channels, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NewStationForm, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeaturedRail, { channels }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-8 block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: "Search desks"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input mt-1",
					value: query,
					onChange: (event) => setQuery(event.target.value),
					placeholder: "Name or slug"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-3",
				children: visible.map((channel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-filigree)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpen((current) => current === channel.slug ? null : channel.slug),
						className: "flex w-full items-center gap-3 p-3 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
								src: channel.cover,
								alt: "",
								className: "size-14 shrink-0 rounded-md"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate font-display text-xl font-semibold",
									children: channel.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
									children: [
										kindLabel(channel.kind),
										" · ",
										channel.featured ? "featured · " : "",
										channel.tracks.filter((track) => track.enabled !== false).length,
										" cuts",
										channel.enabled ? "" : " · off air"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
								kind: channel.kind,
								mode: channel.mode,
								enabled: channel.enabled,
								nsfw: channel.nsfw
							})
						]
					}), open === channel.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskEditor, {
						channel,
						r2Configured
					}) : null]
				}, channel.slug))
			})
		]
	});
}
function FeaturedRail({ channels }) {
	const featured = (0, import_react.useMemo)(() => [...channels].filter((channel) => channel.featured).sort((a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99) || a.name.localeCompare(b.name)), [channels]);
	function move(index, dir) {
		const next = index + dir;
		if (next < 0 || next >= featured.length) return;
		const a = featured[index];
		const b = featured[next];
		saveStation({ data: {
			slug: a.slug,
			featured: true,
			featuredRank: next
		} }).then(() => saveStation({ data: {
			slug: b.slug,
			featured: true,
			featuredRank: index
		} })).then((result) => applySnapshot(result.tracks, result.stations));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8 rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-filigree)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "Featured rail"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Homepage order. Rank 1 sits first. Toggle Featured inside any station to add it."
			}),
			featured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-subtle",
				children: "No featured rooms yet."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: featured.map((channel, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 font-mono text-[11px] tabular-nums text-subtle",
							children: index + 1
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate font-display text-lg",
							children: channel.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: index === 0,
							onClick: () => move(index, -1),
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Up"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: index === featured.length - 1,
							onClick: () => move(index, 1),
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold disabled:opacity-40",
							children: "Down"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								saveStation({ data: {
									slug: channel.slug,
									featured: false
								} }).then((result) => applySnapshot(result.tracks, result.stations));
							},
							className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
							children: "Unfeature"
						})
					]
				}, channel.slug))
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
				applySnapshot(result.tracks, result.stations);
				setName("");
				setSlug("");
			}).catch((error) => window.alert(error instanceof Error ? error.message : "Could not create")).finally(() => setBusy(false));
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
				children: "New station"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "For a linear start-to-finish room, pick Fixed, then drop files into its R2 folder."
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
				}), "Featured"]
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
function DeskEditor({ channel, r2Configured }) {
	const [kind, setKind] = (0, import_react.useState)(normalizeKind(channel.kind || channel.mode));
	const [featured, setFeatured] = (0, import_react.useState)(Boolean(channel.featured));
	const [rank, setRank] = (0, import_react.useState)(String(channel.featuredRank ?? 99));
	const [name, setName] = (0, import_react.useState)(channel.name);
	const [description, setDescription] = (0, import_react.useState)(channel.description);
	const [title, setTitle] = (0, import_react.useState)("");
	const [audioUrl, setAudioUrl] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "border-t border-line p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-2",
				onSubmit: (event) => {
					event.preventDefault();
					setBusy(true);
					const featuredRank = Number.parseInt(rank, 10);
					saveStation({ data: {
						slug: channel.slug,
						name,
						description,
						kind,
						featured,
						featuredRank: Number.isFinite(featuredRank) ? featuredRank : 99
					} }).then((result) => applySnapshot(result.tracks, result.stations)).catch((error) => window.alert(error instanceof Error ? error.message : "Save failed")).finally(() => setBusy(false));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: name,
						onChange: (event) => setName(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "input",
						value: description,
						onChange: (event) => setDescription(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
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
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: kindHint(kind)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: featured,
								onChange: (event) => setFeatured(event.target.checked)
							}), "Featured rail"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex h-11 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
							children: ["Rank", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "input w-20",
								inputMode: "numeric",
								value: rank,
								onChange: (event) => setRank(event.target.value)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy,
							className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
							children: "Save station"
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
								} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
							},
							className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ember",
							children: channel.enabled ? "Take off air" : "Restore to air"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Add a cut"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-2 flex flex-wrap gap-2",
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
						applySnapshot(result.tracks, result.stations);
						setTitle("");
						setAudioUrl("");
					}).catch((error) => window.alert(error instanceof Error ? error.message : "Add failed")).finally(() => setBusy(false));
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
						placeholder: "Audio URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						disabled: busy,
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Add URL"
					})
				]
			}),
			r2Configured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadDrop, {
				slug: channel.slug,
				cover: channel.cover
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
				children: "Tracks"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 divide-y divide-line",
				children: channel.tracks.map((track, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTrackRow, {
					channel,
					track,
					index,
					r2Configured
				}, track.id))
			})
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
			if (json.tracks) applySnapshot(json.tracks, json.stations ?? []);
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
				children: "Upload to R2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: hint || "Drop mp3 / wav / flac / m4a files onto this station folder. Multiple at once is fine."
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
function DeskTrackRow({ channel, track, index, r2Configured }) {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)(track.title);
	const [artist, setArtist] = (0, import_react.useState)(track.artist);
	const location = fileLocationLabel(track.audioUrl);
	const key = r2KeyFromAudioUrl(track.audioUrl);
	const hidden = track.enabled === false;
	function move(dir) {
		const ids = channel.tracks.map((item) => item.id);
		const next = index + dir;
		if (next < 0 || next >= ids.length) return;
		const swap = ids[index];
		ids[index] = ids[next];
		ids[next] = swap;
		setBusy(true);
		reorderStationTracks({ data: {
			channelSlug: channel.slug,
			trackIds: ids
		} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("py-3", hidden && "opacity-50"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: title,
						onChange: (event) => setTitle(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: artist,
						onChange: (event) => setArtist(event.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 break-all font-mono text-[11px] text-subtle",
						children: location
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] tabular-nums text-subtle",
				children: formatClock(track.durationSec)
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => move(-1),
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Up"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => move(1),
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Down"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						setBusy(true);
						patchStationTrack({ data: {
							channelSlug: channel.slug,
							trackId: track.id,
							title: title.trim() || track.title,
							artist: artist.trim() || track.artist
						} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Save"
				}),
				hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						setBusy(true);
						restoreStationTrack({ data: {
							channelSlug: channel.slug,
							trackId: track.id
						} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Restore"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy,
					onClick: () => {
						if (!window.confirm(`Remove “${track.title}”? File stays on R2.`)) return;
						setBusy(true);
						hideStationTrack({ data: {
							channelSlug: channel.slug,
							trackId: track.id,
							audioUrl: track.audioUrl
						} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: "Remove"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: busy || !r2Configured || !key,
					onClick: () => {
						if (!key || !window.confirm(`Delete on R2?\n${key}`)) return;
						setBusy(true);
						deleteStationFile({ data: {
							channelSlug: channel.slug,
							trackId: track.id,
							audioUrl: track.audioUrl,
							r2Key: key,
							alsoDeleteR2: true
						} }).then((result) => applySnapshot(result.tracks, result.stations)).finally(() => setBusy(false));
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
					children: "Delete on R2"
				})
			]
		})]
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "AUTH_URL should be https://terrainfinity.ca. SSO_HUB is optional and defaults there." }),
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
