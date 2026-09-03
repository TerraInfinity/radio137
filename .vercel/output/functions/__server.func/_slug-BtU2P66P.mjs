import { o as __toESM } from "./_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as isChannelNsfw, f as liveCursor, g as usePlayerStore, h as stationSkin, i as getPlayableTracks, l as kindHint, p as normalizeKind, r as getChannel, s as isAdultTrack } from "./_ssr/player-store-Dz5TRk6B.mjs";
import { n as formatClock, t as cn } from "./_ssr/cn-CyOQLR37.mjs";
import { o as ChevronUp, s as ChevronDown } from "./_libs/lucide-react.mjs";
import { o as CoverArt, r as Route$8 } from "./_ssr/router-DCyqcLgO.mjs";
import { n as AdminStationEdit, r as AdminTrackTools, t as AdminAddTrack } from "./_ssr/admin-track-tools-Dohd-T5g.mjs";
import { t as ModePill } from "./_ssr/mode-pill-WssAb88K.mjs";
import { t as StationVisual } from "./_ssr/station-visual-SGWK1k3-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-BtU2P66P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClaimBooth({ channel }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const identity = usePlayerStore((s) => s.identity);
	const setIdentityName = usePlayerStore((s) => s.setIdentityName);
	const claims = usePlayerStore((s) => s.claims);
	const claimChannel = usePlayerStore((s) => s.claimChannel);
	const releaseClaim = usePlayerStore((s) => s.releaseClaim);
	const claim = claims[channel.slug];
	const held = claim && (claim.expiresAt ?? 0) > Date.now();
	const own = held && identity && claim.claimantId === identity.id;
	if (!channel.claimable) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((v) => !v),
			className: "flex h-12 w-full items-center justify-between px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
			children: [
				"DJ booth ",
				held ? own ? "· Yours" : "· Held" : "· Available",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-gold",
					children: open ? "Close" : "Open"
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-line p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "The network is quiet. Claim only if you are driving this desk."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
						children: "Handle"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input mt-1",
						value: identity?.name ?? "",
						onChange: (event) => setIdentityName(event.target.value),
						placeholder: "Your name"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2",
					children: own ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => releaseClaim(channel.slug),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Release"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !identity,
						onClick: () => claimChannel(channel.slug, 30),
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60",
						children: "Claim booth"
					})
				})
			]
		}) : null]
	});
}
function NowPlayingCard({ channel, track, statusLabel }) {
	const lockedCut = Boolean(track && isAdultTrack(track) && !isChannelNsfw(channel));
	if (!track || lockedCut) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] uppercase tracking-[0.18em] text-muted",
			children: "Now playing"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-display text-xl text-fg",
			children: lockedCut ? "Locked cut" : statusLabel
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.18em] text-ember",
				children: "Now playing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
					src: track.coverUrl || channel.cover,
					alt: "",
					className: "size-24 shrink-0 rounded-md"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl font-semibold tracking-tight text-fg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/player/$id",
								params: { id: track.id },
								children: track.title
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-muted",
							children: track.artist
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
							children: channel.name
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
				slug: channel.slug,
				track
			})
		]
	});
}
var COMPACT = 3;
function UpcomingList({ slug, upcoming, live, cover }) {
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const cueTrack = usePlayerStore((s) => s.cueTrack);
	const skipAllowed = usePlayerStore((s) => s.skipAllowed(slug));
	const canExpand = upcoming.length > COMPACT;
	const visible = expanded ? upcoming : upcoming.slice(0, COMPACT);
	const hidden = Math.max(0, upcoming.length - COMPACT);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "min-w-0 flex-1 truncate py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: [
						live ? "Upcoming" : "Playlist",
						upcoming.length > 0 ? ` · ${upcoming.length}` : "",
						!expanded && hidden > 0 ? ` · +${hidden}` : ""
					]
				}), canExpand ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setExpanded((v) => !v),
					"aria-expanded": expanded,
					className: "inline-flex h-11 shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
					children: expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Compact ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Expand ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })] })
				}) : null]
			}),
			upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-3 text-sm text-muted",
				children: "Empty queue."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "border-t border-line px-3 py-1",
				children: visible.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !skipAllowed,
							onClick: () => void cueTrack(slug, item.id),
							className: "flex h-7 min-w-0 flex-1 items-center gap-2 text-left disabled:opacity-60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-3.5 shrink-0 font-mono text-[10px] tabular-nums text-subtle",
									children: index + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate text-sm text-muted",
									children: item.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-mono text-[10px] tabular-nums text-subtle",
									children: formatClock(item.durationSec)
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/player/$id",
							params: { id: item.id },
							className: "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
							children: "Open"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
							slug,
							track: item,
							compact: true
						})
					]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAddTrack, {
				slug,
				cover: cover ?? ""
			})
		]
	});
}
function ChannelView({ channel }) {
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const slug = usePlayerStore((s) => s.channelSlug);
	const track = usePlayerStore((s) => s.track);
	const status = usePlayerStore((s) => s.status);
	const playable = getPlayableTracks(channel);
	const kind = normalizeKind(channel.kind || channel.mode);
	const live = kind === "live";
	const here = slug === channel.slug;
	const now = here ? track : live ? liveCursor(playable, Date.now(), channel.slug)?.track ?? playable[0] : playable[0];
	const upcoming = playable.filter((item) => item.id !== now?.id);
	const skin = stationSkin(channel);
	const statusLabel = !channel.enabled ? "Off air" : playable.length === 0 ? "Empty desk" : here ? status : kindHint(kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-44",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
					channel,
					size: "hero",
					className: "aspect-[4/3] w-full sm:aspect-auto sm:h-64"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: cn("mt-6 font-mono text-[11px] uppercase tracking-[0.2em]", skin === "glaum" ? "glaum-kicker" : "text-gold"),
				children: [
					channel.category,
					" · ",
					channel.tags.join(" · ")
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: cn("font-display text-4xl font-semibold tracking-tight", skin === "glaum" && "glaum-title"),
					children: channel.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
					kind: channel.kind,
					mode: channel.mode,
					enabled: channel.enabled,
					nsfw: channel.nsfw
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 max-w-prose text-muted",
				children: channel.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: kindHint(kind)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void tuneIn(channel.slug, { forcePlay: true }),
					className: "inline-flex h-12 min-w-36 items-center justify-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg",
					children: "Tune in"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlayingCard, {
					channel,
					track: now ?? null,
					statusLabel
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingList, {
				slug: channel.slug,
				upcoming,
				live,
				cover: channel.cover
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBooth, { channel }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStationEdit, { channel })
		]
	});
}
function ChannelPage() {
	const { slug } = Route$8.useParams();
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
