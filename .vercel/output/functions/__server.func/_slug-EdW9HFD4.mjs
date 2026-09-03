import { o as __toESM } from "./_runtime.mjs";
import { d as isAdultTrack, f as isChannelNsfw, i as formatRemaining, n as cn, o as getChannel, r as formatClock, s as getPlayableTracks, t as channelIsLive } from "./_ssr/cn-UVNI8J0o.mjs";
import { B as require_react, b as require_jsx_runtime, v as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { c as ChevronUp, l as ChevronDown, n as Star, o as Play } from "./_libs/lucide-react.mjs";
import { c as liveCursor, l as upcomingTracks, r as Route$8, s as usePlayerStore, u as heldClaim } from "./_ssr/router-ICW3tdWz.mjs";
import { n as AdminTrackTools, t as AdminAddTrack } from "./_ssr/admin-track-tools-U74VzkKP.mjs";
import { t as CoverArt } from "./_ssr/cover-art-D1Z7wPOh.mjs";
import { t as ModePill } from "./_ssr/mode-pill-CWxrT3wM.mjs";
import { t as StationVisual } from "./_ssr/station-visual-MtY7nXC_.mjs";
import { n as loadFavorites, r as toggleFavorite } from "./_ssr/favorites-C6NI1-_a.mjs";
import { n as voteRank, t as loadRanks } from "./_ssr/ranks-C9jEqfnZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-EdW9HFD4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClaimBooth({ channel }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const identity = usePlayerStore((s) => s.identity);
	const claims = usePlayerStore((s) => s.claims);
	const setIdentityName = usePlayerStore((s) => s.setIdentityName);
	const claimChannel = usePlayerStore((s) => s.claimChannel);
	const releaseClaim = usePlayerStore((s) => s.releaseClaim);
	const claim = claims[channel.slug];
	const held = Boolean(claim?.claimantId && (claim.expiresAt ?? 0) > now);
	const own = held && claim?.claimantId === identity?.id;
	const remaining = own && claim?.expiresAt ? claim.expiresAt - now : 0;
	const elapsed = own && claim?.claimedAt ? now - claim.claimedAt : 0;
	(0, import_react.useEffect)(() => {
		const expand = () => setOpen(true);
		const onHash = () => {
			if (window.location.hash === "#dj-booth") expand();
		};
		onHash();
		window.addEventListener("hashchange", onHash);
		window.addEventListener("radio:open-booth", expand);
		return () => {
			window.removeEventListener("hashchange", onHash);
			window.removeEventListener("radio:open-booth", expand);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!own) return;
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, [own]);
	if (!channel.claimable) return null;
	const toggle = () => {
		setOpen((v) => {
			const next = !v;
			if (!next && window.location.hash === "#dj-booth") {
				const url = `${window.location.pathname}${window.location.search}`;
				window.history.replaceState(null, "", url);
			}
			return next;
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "dj-booth",
		className: "mt-6 overflow-hidden rounded-xl bg-bg-elevated shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: toggle,
			"aria-expanded": open,
			className: "flex h-11 w-full items-center justify-between gap-3 px-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-[10px] uppercase tracking-[0.16em]", own ? "lamp-pink" : "text-subtle"),
					children: "DJ booth"
				}), own ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "lamp-pink truncate font-mono text-[10px] uppercase tracking-[0.12em] tabular-nums",
					children: [
						"Driving ",
						formatRemaining(elapsed),
						" · ",
						formatRemaining(remaining),
						" left"
					]
				}) : held ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "truncate font-mono text-[10px] uppercase tracking-[0.12em] text-buzz",
					children: ["Held by ", claim?.claimantName]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-muted",
					children: "Available"
				})]
			}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4 shrink-0 text-subtle" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-subtle" })]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-line px-3 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Claim this desk to DJ. One driver at a time. Others cannot skip until you release."
				}),
				!identity ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex flex-wrap gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						setIdentityName(name);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input max-w-xs",
						value: name,
						onChange: (event) => setName(event.target.value),
						placeholder: "Handle",
						"aria-label": "DJ name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
						children: "Set name"
					})]
				}) : own ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] uppercase tracking-[0.14em] text-buzz",
						children: "You are driving"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => releaseClaim(channel.slug),
						className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: "Release early"
					})]
				}) : held ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-buzz",
					children: "Booth is held. Wait for release."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [
						15,
						30,
						60
					].map((minutes) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => claimChannel(channel.slug, minutes),
						className: "inline-flex h-11 items-center rounded-md bg-buzz px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fg",
						children: [
							"Claim ",
							minutes,
							"m"
						]
					}, minutes))
				}),
				own ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DjPlayAlong, {}) : null
			]
		}) : null]
	});
}
function DjPlayAlong() {
	const [advanced, setAdvanced] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 rounded-lg bg-bg p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-buzz",
				children: "Play along"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "Microphone, a local file, or a DJ controller — optional. This stays on your machine."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold",
					children: ["Local file", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						accept: "audio/*",
						className: "sr-only",
						onChange: (event) => {
							const file = event.target.files?.[0];
							if (!file) return;
							const url = URL.createObjectURL(file);
							const extra = new Audio(url);
							extra.loop = true;
							extra.play();
						}
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: async () => {
						try {
							const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
							const extra = new Audio();
							extra.srcObject = stream;
							extra.play();
						} catch {}
					},
					className: "inline-flex h-11 items-center px-3 font-mono text-[11px] uppercase tracking-[0.12em] text-gold",
					children: "Microphone"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setAdvanced((v) => !v),
				className: "mt-2 inline-flex h-11 items-center font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: advanced ? "Hide advanced" : "Advanced · MIDI / gamepad"
			}),
			advanced ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Plug in a MIDI controller or gamepad. Browser MIDI needs a secure context. Map whatever you already play."
			}) : null
		]
	});
}
function NowPlayingCard({ channel, track, statusLabel, driving = false, held = false }) {
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
		className: cn("rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]", (driving || held) && "booth-live"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-mono text-[10px] uppercase tracking-[0.18em]", driving || held ? "text-buzz" : "text-ember"),
				children: driving ? "Driving" : held ? "DJ held" : "Now playing"
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
			!skipAllowed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.12em] text-buzz",
				children: "Skip locked"
			}) : null,
			upcoming.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-3 pb-3 text-sm text-muted",
				children: "Empty queue."
			}) : expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "divide-y divide-line border-t border-line",
				children: visible.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1 px-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							disabled: !skipAllowed,
							onClick: () => void cueTrack(slug, item.id),
							className: "flex min-h-11 min-w-0 flex-1 items-baseline justify-between gap-3 px-1 py-2 text-left disabled:opacity-60",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate font-display text-lg",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "shrink-0 font-mono text-[11px] tabular-nums text-subtle",
								children: formatClock(item.durationSec)
							})]
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
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "border-t border-line px-3 py-1",
				children: visible.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
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
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
						slug,
						track: item,
						compact: true
					})]
				}, item.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminAddTrack, {
				slug,
				cover: cover ?? ""
			})
		]
	});
}
function ChannelView({ slug }) {
	const catalog = usePlayerStore((s) => s.catalog);
	const ready = usePlayerStore((s) => s.ready);
	const channel = catalog.channels.find((item) => item.slug === slug) ?? getChannel(slug) ?? null;
	if (!channel) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-16",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] uppercase tracking-[0.2em] text-ember",
				children: "Missing frequency"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-4xl font-semibold",
				children: "No such channel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-muted",
				children: ready ? "That slug is not on the grid." : "Tuning the catalog."
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelBody, { channel });
}
function ChannelBody({ channel }) {
	const status = usePlayerStore((s) => s.status);
	const track = usePlayerStore((s) => s.track);
	const channelSlug = usePlayerStore((s) => s.channelSlug);
	const ready = usePlayerStore((s) => s.ready);
	const autoplay = usePlayerStore((s) => s.autoplay);
	const gateOpen = usePlayerStore((s) => s.gateOpen);
	const claims = usePlayerStore((s) => s.claims);
	const identity = usePlayerStore((s) => s.identity);
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const [fav, setFav] = (0, import_react.useState)(() => loadFavorites().includes(channel.slug));
	const [score, setScore] = (0, import_react.useState)(() => loadRanks().channels[channel.slug] ?? 0);
	(0, import_react.useEffect)(() => {
		if (!channel.enabled) return;
		if (!autoplay) return;
		if (gateOpen) return;
		tuneIn(channel.slug);
	}, [
		autoplay,
		channel.enabled,
		channel.slug,
		gateOpen,
		tuneIn
	]);
	const nsfw = isChannelNsfw(channel);
	const tunedHere = channelSlug === channel.slug;
	const playable = getPlayableTracks(channel);
	const live = ready && channelIsLive(channel) ? liveCursor(playable, Date.now(), channel.slug) : null;
	const currentRaw = tunedHere && track ? track : live?.track ?? playable[0] ?? null;
	const current = currentRaw && isAdultTrack(currentRaw) && !nsfw ? null : currentRaw;
	const upcoming = upcomingTracks(channel, current?.id ?? null, 16);
	const driving = heldClaim(claims, identity);
	const deskHeld = driving?.slug === channel.slug;
	const drivingHere = Boolean(deskHeld && driving?.own);
	if (!channel.enabled) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
				channel,
				dimmed: true,
				size: "hero",
				className: "aspect-[4/3] w-full rounded-xl"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-muted",
				children: nsfw ? "18+ · Off air" : "Off air"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold tracking-tight",
				children: channel.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 rounded-xl bg-bg-elevated p-4 font-mono text-[12px] uppercase tracking-[0.14em] text-gold shadow-[var(--shadow-border)]",
				children: nsfw ? "This frequency is locked. Playlist names stay hidden until you enable the desk." : "This desk is dark."
			})
		]
	});
	const statusLabel = playable.length === 0 ? "No playable signal" : status === "missing" && tunedHere ? "Missing audio" : status === "loading" && tunedHere ? "Tuning" : current ? current.title : "Ready";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("mx-auto max-w-3xl px-4 py-8", channel.skin === "glaum" && "glaum-page"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("overflow-hidden rounded-xl", channel.skin === "glaum" ? "glaum-panel" : "filigree-frame shadow-[var(--shadow-filigree)]", channel.skin === "glaum" && "skin-glaum", channel.skin === "waheguru" && "skin-waheguru filigree-frame shadow-[var(--shadow-filigree)]", drivingHere || deskHeld ? "skin-buzz" : null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
					channel,
					size: "hero",
					className: "aspect-[4/3] w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					channel.skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "glaum-kicker font-mono text-[11px] uppercase",
						children: "What If · Theme frequency"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: cn("font-display text-4xl font-semibold tracking-tight", channel.skin === "glaum" && "glaum-title mt-2 text-5xl sm:text-6xl"),
						children: channel.skin === "glaum" ? "Glåüm" : channel.name
					}),
					channel.skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "glaum-sponsor mt-2 font-mono text-[10px] uppercase",
						children: "Sponsored by Shrimp™"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-muted",
						children: channel.energy
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModePill, {
					kind: channel.kind,
					mode: channel.mode,
					enabled: true,
					nsfw: isChannelNsfw(channel)
				})]
			}),
			channel.skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 max-w-prose font-glaum text-xl italic leading-relaxed text-prom/80",
				children: "Many hands make light work. Carpets, strange music, soft lighting. Listening is enough."
			}) : null,
			channel.skin === "waheguru" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-waheguru",
				children: "Slow gold. The name is the song."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-prose text-muted",
				children: channel.description
			}),
			channel.tags.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
				children: [channel.category ? `${channel.category} · ` : "", channel.tags.join(" · ")]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => void tuneIn(channel.slug, { forcePlay: true }),
						className: cn("inline-flex h-12 min-w-44 items-center justify-center gap-2 px-5 text-[12px] uppercase", channel.skin === "glaum" ? "btn-glaum" : "rounded-md bg-fg font-mono tracking-[0.16em] text-bg"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }), tunedHere && status === "playing" ? "Retune" : "Tune in"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setFav(toggleFavorite(channel.slug).includes(channel.slug)),
						className: cn("inline-flex h-12 items-center gap-2 px-3 font-mono text-[11px] uppercase tracking-[0.14em]", channel.skin === "glaum" ? "btn-glaum-ghost text-glaum-gold" : "text-gold"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: cn("size-4", fav && "fill-gold") }), fav ? "Favorited" : "Favorite"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setScore(voteRank("channels", channel.slug, 1).channels[channel.slug] ?? 0),
						className: "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted",
						children: ["Upvote · ", score]
					}),
					channel.claimable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							window.dispatchEvent(new Event("radio:open-booth"));
							document.getElementById("dj-booth")?.scrollIntoView({
								behavior: "smooth",
								block: "nearest"
							});
							const next = `${window.location.pathname}${window.location.search}#dj-booth`;
							window.history.replaceState(null, "", next);
						},
						className: cn("inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em]", drivingHere ? "text-buzz" : "btn-buzz px-4"),
						children: drivingHere ? "Your booth" : deskHeld ? "Booth held" : "Claim booth"
					}) : null
				]
			}),
			channel.skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://camp.glaum.ca/",
					target: "_blank",
					rel: "noreferrer",
					className: "font-mono text-[10px] uppercase tracking-[0.18em] text-glaum-gold",
					children: "camp.glaum.ca"
				})
			}) : null,
			channel.skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glaum-rule mt-8" }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlayingCard, {
					channel,
					track: current,
					statusLabel,
					driving: drivingHere,
					held: deskHeld
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingList, {
				slug: channel.slug,
				upcoming,
				live: channelIsLive(channel),
				cover: channel.cover
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBooth, { channel })
		]
	});
}
function ChannelPage() {
	const { slug } = Route$8.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelView, { slug });
}
//#endregion
export { ChannelPage as component };
