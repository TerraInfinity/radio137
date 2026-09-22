import { o as __toESM } from "../_runtime.mjs";
import { l as visualSrc } from "./media-ChlF6fRc.mjs";
import { t as cn } from "./cn-BnEf6O0M.mjs";
import { c as songKey, d as stationPath } from "./song-url-BbYrVN1D.mjs";
import { C as stationSkin, N as resolveLivePlayhead, d as kindHint, f as kindLabel, i as getPlayableTracks, l as isAdultTrack, m as normalizeKind, r as getChannel, u as isChannelNsfw } from "./catalog-DmckmNNR.mjs";
import { C as require_jsx_runtime, W as require_react, l as require_react_dom, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { g as listenModeLabel, o as experienceForStation, p as isOnDemandOverlay, y as usePlayerStore } from "./player-store-CdB40IHB.mjs";
import { o as graphemeCount, t as GLAUM_DEFAULT_WORDS } from "./glaum-words-DJcoXeXq.mjs";
import { B as ChevronLeft, P as GripHorizontal, _ as Radio, t as X, x as Pencil, z as ChevronRight } from "../_libs/lucide-react.mjs";
import { C as listGlaumWords, D as useRadioUser, S as hideGlaumWordFn, _ as CoverArt, b as addAdminGlaumWordFn, c as UnallocateControl, d as ShareLink, f as MarqueeTitle, p as HeroArtSheet, u as ShuffleToggle, x as addGuestGlaumWordFn, y as RenameCutForm } from "./router-BjRk-_wL.mjs";
import { n as postStationChat, t as listStationChat } from "./social-api-DT7HdRgY.mjs";
import { r as FoldSection } from "./duration-probe-Cc9x2Byq.mjs";
import { n as AdminTrackTools, t as AdminStationEdit } from "./admin-track-tools-Jp5gX6Ea.mjs";
import { t as SignInChoices } from "./sign-in-choices-_CiJYAa3.mjs";
import { t as ModePill } from "./mode-pill-XIKjkTPl.mjs";
import { n as StationPlaylist, r as useExperienceUnlock, t as RoseOpera } from "./rose-opera-CKiFrD1M.mjs";
import { t as StationVisual } from "./station-visual-CwReJURx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/channel-view-CFTjwjSI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function GlaumWordBooth({ nextPath = "/channel/official-glaum-frequency" }) {
	const { user, isAdmin, isPending } = useRadioUser();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [lex, setLex] = (0, import_react.useState)(null);
	const [word, setWord] = (0, import_react.useState)("");
	const [adminWord, setAdminWord] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [hint, setHint] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		listGlaumWords().then(setLex).catch(() => {});
	}, []);
	const mine = lex?.guest.find((row) => row.authorId === user?.id);
	async function addGuest() {
		setBusy(true);
		setHint("");
		try {
			const next = await addGuestGlaumWordFn({ data: { word } });
			setLex(next);
			setWord("");
			setHint("It floats for a month.");
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Could not add");
		} finally {
			setBusy(false);
		}
	}
	async function addPermanent() {
		setBusy(true);
		setHint("");
		try {
			const next = await addAdminGlaumWordFn({ data: { word: adminWord } });
			setLex(next);
			setAdminWord("");
			setHint("Permanent.");
		} catch (error) {
			setHint(error instanceof Error ? error.message : "Could not add");
		} finally {
			setBusy(false);
		}
	}
	async function remove(id, label) {
		setBusy(true);
		try {
			const next = await hideGlaumWordFn({ data: id ? { id } : { word: label } });
			setLex(next);
		} catch (error) {
			window.alert(error instanceof Error ? error.message : "Could not remove");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "glaum-panel mt-6 overflow-hidden rounded-xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setOpen((value) => !value),
			"aria-expanded": open,
			className: "flex h-12 w-full items-center justify-between gap-3 px-3 text-left",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.16em] text-glaum",
				children: "Lantern words"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
				children: open ? "Close" : "Open"
			})]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-line p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Drop a word into the bubbles. Emoji and symbols are welcome. Under 10 characters, no profanity. Guest words fade after a month."
				}),
				isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-subtle",
					children: "Checking…"
				}) : null,
				!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: "Sign in to add a word."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignInChoices, { next: nextPath })
					})]
				}) : null,
				user && !mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 flex flex-wrap gap-2",
					onSubmit: (event) => {
						event.preventDefault();
						addGuest();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input max-w-xs",
							value: word,
							onChange: (event) => setWord(event.target.value),
							placeholder: "🦐✨",
							autoCapitalize: "off",
							autoCorrect: "off",
							spellCheck: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "self-center font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: [
								graphemeCount(word),
								" / ",
								9
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || !word.trim(),
							className: "btn-glaum inline-flex h-11 items-center px-4 font-mono text-[11px] uppercase tracking-[0.14em]",
							children: busy ? "Sending…" : "Float it"
						})
					]
				}) : null,
				mine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"Your word ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-glaum-gold",
							children: mine.word
						}),
						" floats until ",
						mine.expiresAt ? new Date(mine.expiresAt).toLocaleDateString() : "it fades",
						"."
					]
				}) : null,
				hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: hint
				}) : null,
				isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 border-t border-line pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[10px] uppercase tracking-[0.16em] text-gold",
							children: "C · permanent list"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex flex-wrap gap-2",
							onSubmit: (event) => {
								event.preventDefault();
								addPermanent();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "input max-w-xs",
								value: adminWord,
								onChange: (event) => setAdminWord(event.target.value),
								placeholder: "sat nam"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: busy || !adminWord.trim(),
								className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg",
								children: "Make permanent"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1",
							children: (lex?.permanent ?? []).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 truncate text-sm",
									children: row.word
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy,
									onClick: () => void remove(row.id),
									className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
									children: "Remove"
								})]
							}, row.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Built-in"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 flex flex-wrap gap-2",
							children: GLAUM_DEFAULT_WORDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								disabled: busy,
								onClick: () => void remove(void 0, item),
								className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: [item, " · hide"]
							}) }, item))
						}),
						(lex?.guest.length ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
							children: "Guest · month"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-1",
							children: lex?.guest.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1 truncate text-sm",
									children: [
										row.word,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-subtle",
											children: ["· ", row.authorName || "guest"]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy,
									onClick: () => void remove(row.id),
									className: "inline-flex h-11 items-center px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
									children: "Remove"
								})]
							}, row.id))
						})] }) : null
					]
				}) : null
			]
		}) : null]
	});
}
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
					children: "Tune in joins the station clock so the room starts together. After that the desk plays forward through the list — it will not jump back. Claim the booth to skip and cue; without a claim, skip is open."
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
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	const jumpToLive = usePlayerStore((s) => s.jumpToLive);
	const slug = usePlayerStore((s) => s.channelSlug);
	const { isAdmin } = useRadioUser();
	const [artOpen, setArtOpen] = (0, import_react.useState)(false);
	const [renaming, setRenaming] = (0, import_react.useState)(false);
	const lockedCut = Boolean(track && isAdultTrack(track) && !isChannelNsfw(channel));
	const overlay = isOnDemandOverlay(channel, listenMode) && slug === channel.slug;
	(0, import_react.useEffect)(() => {
		setRenaming(false);
	}, [track?.id]);
	if (!track || lockedCut) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-bg-elevated p-4 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[10px] uppercase tracking-[0.18em] text-muted",
			children: "Now playing"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 font-display text-xl text-fg",
			children: lockedCut ? "Locked song" : statusLabel
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "flex gap-3 rounded-xl bg-bg-elevated p-3 shadow-[var(--shadow-filigree)] sm:p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => isAdmin && setArtOpen(true),
				className: "size-20 shrink-0 overflow-hidden rounded-md sm:size-24",
				"aria-label": isAdmin ? "Replace this song’s art" : track.title,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverArt, {
					src: visualSrc(track, channel),
					alt: "",
					className: "size-full",
					motion: "loop"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.18em] text-ember",
						children: "Now playing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 min-w-0 wrap-normal font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl",
						children: isAdmin && renaming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenameCutForm, {
							slug: channel.slug,
							track,
							appearance: "title",
							onClose: () => setRenaming(false)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/player/$id",
							params: { id: songKey(track) },
							className: "block min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarqueeTitle, { text: track.title })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 truncate text-sm text-muted",
						children: track.artist
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex flex-wrap items-center gap-1",
						children: [
							overlay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void jumpToLive(),
								className: "inline-flex h-11 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Radio, { className: "size-3.5" }), "Jump to live"]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnallocateControl, {
								channel,
								track
							}),
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminTrackTools, {
								slug: channel.slug,
								track,
								compact: true
							}) : null,
							isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setRenaming((value) => !value),
								"aria-expanded": renaming,
								className: "inline-flex h-11 items-center gap-1.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3.5" }), "Rename"]
							}) : null
						]
					})
				]
			}),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroArtSheet, {
				channel,
				track,
				open: artOpen,
				onClose: () => setArtOpen(false)
			}) : null
		]
	});
}
var CHAT_KEY = "radio.chat.dock.v1";
var COLLAPSED_FALLBACK_W = 168;
var OPEN_W = 300;
var OPEN_H = 360;
var BAR_H = 44;
var SLIVER_W = 44;
var SLIVER_H = 56;
var PAD = 12;
function clamp01(n) {
	return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 1;
}
function loadDock() {
	if (typeof window === "undefined") return {
		open: false,
		hidden: false,
		nx: 1,
		ny: 1
	};
	try {
		const raw = window.localStorage.getItem(CHAT_KEY);
		if (!raw) return {
			open: false,
			hidden: false,
			nx: 1,
			ny: 1
		};
		const parsed = JSON.parse(raw);
		return {
			open: Boolean(parsed.open),
			hidden: Boolean(parsed.hidden),
			nx: clamp01(Number(parsed.nx)),
			ny: clamp01(Number(parsed.ny))
		};
	} catch {
		return {
			open: false,
			hidden: false,
			nx: 1,
			ny: 1
		};
	}
}
function saveDock(mem) {
	try {
		window.localStorage.setItem(CHAT_KEY, JSON.stringify(mem));
	} catch {}
}
function slot(opts) {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const header = document.querySelector("header");
	const dock = document.querySelector(".player-dock") || document.querySelector(".player-sliver");
	const topMin = (header ? header.getBoundingClientRect().bottom : 56) + PAD;
	const botMax = (dock ? dock.getBoundingClientRect().top : vh - 96) - PAD;
	if (opts.hidden) {
		const w = SLIVER_W;
		const h = SLIVER_H;
		const y0 = topMin;
		const y1 = Math.max(topMin, botMax - h);
		return {
			w,
			h,
			x0: 0,
			x1: Math.max(0, vw - w),
			y0,
			y1
		};
	}
	const w = opts.open ? Math.min(OPEN_W, Math.max(220, vw - 24)) : Math.min(Math.max(opts.measuredW || COLLAPSED_FALLBACK_W, 120), vw - 24);
	const maxH = Math.max(BAR_H, botMax - topMin);
	const h = opts.open ? Math.min(OPEN_H, Math.max(132, maxH)) : BAR_H;
	return {
		w,
		h,
		x0: PAD,
		x1: Math.max(PAD, vw - PAD - w),
		y0: topMin,
		y1: Math.max(topMin, botMax - h)
	};
}
function StationChat({ slug }) {
	const { user } = useRadioUser();
	const identity = usePlayerStore((s) => s.identity);
	const setIdentityName = usePlayerStore((s) => s.setIdentityName);
	const hasPlayer = usePlayerStore((s) => Boolean(s.track));
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [hidden, setHidden] = (0, import_react.useState)(false);
	const [lines, setLines] = (0, import_react.useState)([]);
	const [body, setBody] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const hostRef = (0, import_react.useRef)(null);
	const openRef = (0, import_react.useRef)(false);
	const hiddenRef = (0, import_react.useRef)(false);
	const nxRef = (0, import_react.useRef)(1);
	const nyRef = (0, import_react.useRef)(1);
	const dragRef = (0, import_react.useRef)(null);
	const unbindRef = (0, import_react.useRef)(null);
	const listRef = (0, import_react.useRef)(null);
	const channel = getChannel(slug);
	const skin = channel ? stationSkin(channel) : "none";
	function paint(nextOpen = openRef.current, nextHidden = hiddenRef.current, nextNx = nxRef.current, nextNy = nyRef.current) {
		const host = hostRef.current;
		if (!host) return;
		const s = slot({
			open: nextOpen,
			hidden: nextHidden,
			measuredW: nextOpen || nextHidden ? void 0 : host.offsetWidth
		});
		const left = Math.round(s.x0 + nextNx * (s.x1 - s.x0));
		const top = Math.round(s.y0 + nextNy * (s.y1 - s.y0));
		host.style.left = `${left}px`;
		host.style.top = `${top}px`;
		if (nextHidden) {
			host.style.width = `${s.w}px`;
			host.style.height = `${s.h}px`;
		} else if (nextOpen) {
			host.style.width = `${s.w}px`;
			host.style.height = `${s.h}px`;
		} else {
			host.style.width = "auto";
			host.style.height = `${BAR_H}px`;
		}
	}
	(0, import_react.useLayoutEffect)(() => {
		const mem = loadDock();
		openRef.current = mem.open;
		hiddenRef.current = mem.hidden;
		nxRef.current = mem.nx;
		nyRef.current = mem.ny;
		setOpen(mem.open);
		setHidden(mem.hidden);
		setMounted(true);
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		if (!mounted) return;
		openRef.current = open;
		hiddenRef.current = hidden;
		paint();
	}, [
		mounted,
		open,
		hidden,
		hasPlayer
	]);
	(0, import_react.useEffect)(() => {
		if (!mounted) return;
		const relayout = () => {
			if (dragRef.current) return;
			paint();
		};
		relayout();
		const host = hostRef.current;
		const dock = document.querySelector(".player-dock");
		const header = document.querySelector("header");
		const ro = new ResizeObserver(relayout);
		if (host) ro.observe(host);
		if (dock) ro.observe(dock);
		if (header) ro.observe(header);
		window.addEventListener("resize", relayout);
		return () => {
			ro.disconnect();
			window.removeEventListener("resize", relayout);
		};
	}, [
		mounted,
		hasPlayer,
		hidden
	]);
	(0, import_react.useEffect)(() => {
		if (!mounted || hidden || !open) return;
		let alive = true;
		const pull = () => {
			listStationChat({ data: { slug } }).then((rows) => {
				if (alive) setLines(rows);
			}).catch(() => {});
		};
		pull();
		const timer = window.setInterval(pull, 2e4);
		return () => {
			alive = false;
			window.clearInterval(timer);
		};
	}, [
		slug,
		mounted,
		open,
		hidden
	]);
	(0, import_react.useEffect)(() => {
		const el = listRef.current;
		if (!el || !open || hidden) return;
		el.scrollTop = el.scrollHeight;
	}, [
		lines,
		open,
		hidden
	]);
	(0, import_react.useEffect)(() => () => unbindRef.current?.(), []);
	const handle = (user?.name || user?.email || identity?.name || "").trim();
	function persist() {
		saveDock({
			open: openRef.current,
			hidden: hiddenRef.current,
			nx: nxRef.current,
			ny: nyRef.current
		});
	}
	function toggleOpen() {
		const next = !openRef.current;
		openRef.current = next;
		setOpen(next);
		persist();
	}
	function hideChat() {
		hiddenRef.current = true;
		nxRef.current = nxRef.current >= .5 ? 1 : 0;
		setHidden(true);
		persist();
	}
	function showChat() {
		hiddenRef.current = false;
		setHidden(false);
		persist();
	}
	function onBarDown(event) {
		if (event.target.closest("button, a, input, textarea, select")) return;
		event.preventDefault();
		event.stopPropagation();
		const host = hostRef.current;
		const bar = event.currentTarget;
		if (!host) return;
		const rect = host.getBoundingClientRect();
		const pointer = event.pointerId;
		dragRef.current = {
			pointer,
			dx: event.clientX - rect.left,
			dy: event.clientY - rect.top,
			nx: nxRef.current,
			ny: nyRef.current
		};
		host.classList.add("desk-chat-dragging");
		try {
			bar.setPointerCapture(pointer);
		} catch {}
		unbindRef.current?.();
		const move = (e) => {
			const d = dragRef.current;
			if (!d || e.pointerId !== d.pointer) return;
			if (e.cancelable) e.preventDefault();
			const measured = openRef.current || hiddenRef.current ? void 0 : host.offsetWidth;
			const s = slot({
				open: openRef.current,
				hidden: hiddenRef.current,
				measuredW: measured
			});
			const left = e.clientX - d.dx;
			const top = e.clientY - d.dy;
			const nxNext = s.x1 === s.x0 ? d.nx : Math.min(1, Math.max(0, (left - s.x0) / (s.x1 - s.x0)));
			const nyNext = s.y1 === s.y0 ? d.ny : Math.min(1, Math.max(0, (top - s.y0) / (s.y1 - s.y0)));
			d.nx = nxNext;
			d.ny = nyNext;
			host.style.left = `${Math.round(s.x0 + nxNext * (s.x1 - s.x0))}px`;
			host.style.top = `${Math.round(s.y0 + nyNext * (s.y1 - s.y0))}px`;
			if (openRef.current || hiddenRef.current) {
				host.style.width = `${s.w}px`;
				host.style.height = `${s.h}px`;
			}
		};
		const up = (e) => {
			const d = dragRef.current;
			if (!d || e.type !== "pointercancel" && e.pointerId !== d.pointer) return;
			nxRef.current = d.nx;
			nyRef.current = d.ny;
			dragRef.current = null;
			host.classList.remove("desk-chat-dragging");
			persist();
			paint();
			unbindRef.current?.();
			unbindRef.current = null;
			try {
				if (bar.hasPointerCapture?.(d.pointer)) bar.releasePointerCapture(d.pointer);
			} catch {}
		};
		bar.addEventListener("pointermove", move);
		bar.addEventListener("pointerup", up);
		bar.addEventListener("pointercancel", up);
		window.addEventListener("pointermove", move, { passive: false });
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
		unbindRef.current = () => {
			bar.removeEventListener("pointermove", move);
			bar.removeEventListener("pointerup", up);
			bar.removeEventListener("pointercancel", up);
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
		};
	}
	if (!mounted || typeof document === "undefined") return null;
	const onRight = nxRef.current >= .5;
	const hideBtn = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: hideChat,
		className: "grid size-11 shrink-0 place-items-center text-subtle hover:text-fg",
		"aria-label": "Hide desk chat",
		title: "Hide chat",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
	});
	const node = hidden ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		ref: hostRef,
		type: "button",
		className: cn("desk-chat desk-chat-sliver", onRight ? "desk-chat-sliver-right" : "desk-chat-sliver-left", skin === "glaum" && "desk-chat-glaum"),
		onClick: showChat,
		"aria-label": "Show desk chat",
		title: "Show chat",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "desk-chat-sliver-rail",
			"aria-hidden": true
		}), onRight ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "desk-chat-sliver-mark size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "desk-chat-sliver-mark size-4" })]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		ref: hostRef,
		className: cn("desk-chat", open ? "desk-chat-open" : "desk-chat-collapsed", skin === "glaum" && "glaum-panel desk-chat-glaum"),
		"data-open": open ? "true" : "false",
		"aria-label": "Desk chat",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "desk-chat-bar",
			onPointerDown: onBarDown,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripHorizontal, {
					className: "size-4 shrink-0 text-subtle",
					"aria-hidden": true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.16em] text-subtle",
					children: ["Desk chat", lines.length ? ` · ${lines.length}` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: toggleOpen,
					"aria-expanded": open,
					className: "inline-flex h-11 shrink-0 items-center px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gold",
					children: open ? "Close" : "Open"
				}),
				hideBtn
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "desk-chat-body",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				ref: listRef,
				className: "desk-chat-lines",
				children: [lines.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted",
					children: "The room is quiet. Leave a line for the desk."
				}) : null, lines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[10px] uppercase tracking-[0.12em] text-gold",
					children: line.author
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-fg",
					children: line.body
				})] }, line.id))]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "desk-chat-form",
				onSubmit: (event) => {
					event.preventDefault();
					const name = handle || identity?.name || "";
					if (!name.trim() || !body.trim()) return;
					setBusy(true);
					setError(null);
					postStationChat({ data: {
						slug,
						author: name.trim(),
						body: body.trim()
					} }).then((rows) => {
						setLines(rows);
						setBody("");
					}).catch((err) => setError(err instanceof Error ? err.message : "Could not send")).finally(() => setBusy(false));
				},
				children: [
					!handle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "input",
						value: identity?.name ?? "",
						onChange: (event) => setIdentityName(event.target.value),
						placeholder: "Handle"
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.12em] text-ember",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input flex-1",
							value: body,
							onChange: (event) => setBody(event.target.value),
							placeholder: "A line for the desk…",
							maxLength: 280
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || !body.trim() || !(handle || identity?.name),
							className: "inline-flex h-11 items-center rounded-md bg-fg px-4 font-mono text-[11px] uppercase tracking-[0.14em] text-bg disabled:opacity-60",
							children: "Send"
						})]
					})
				]
			})]
		}) : null]
	});
	return (0, import_react_dom.createPortal)(node, document.body);
}
function ChannelView({ channel, sharePath }) {
	const tuneIn = usePlayerStore((s) => s.tuneIn);
	const ready = usePlayerStore((s) => s.ready);
	const catalogReady = usePlayerStore((s) => s.catalogReady);
	const slug = usePlayerStore((s) => s.channelSlug);
	const track = usePlayerStore((s) => s.track);
	const lastTrackId = usePlayerStore((s) => s.lastTrackId);
	const status = usePlayerStore((s) => s.status);
	const glaumules = usePlayerStore((s) => s.glaumules);
	const listenMode = usePlayerStore((s) => s.listenModeSession ?? s.listenMode);
	const { isAdmin } = useRadioUser();
	const playable = getPlayableTracks(channel);
	const kind = normalizeKind(channel.kind || channel.mode);
	const live = kind === "live";
	const here = slug === channel.slug;
	const resume = lastTrackId ? playable.find((item) => item.id === lastTrackId) : void 0;
	const now = here && track ? track : resume ? resume : live && listenMode === "stream" ? resolveLivePlayhead(playable, Date.now(), channel.slug)?.track ?? playable[0] : playable[0];
	const skin = stationSkin(channel);
	const catalog = usePlayerStore((s) => s.catalog);
	const experience = experienceForStation(channel.slug, catalog);
	const { unlocked } = useExperienceUnlock(experience?.stationSlug ?? channel.slug);
	const statusLabel = !channel.enabled ? "Off air" : playable.length === 0 ? "Empty desk" : here ? status : kindHint(kind);
	const tags = channel.tags ?? [];
	(0, import_react.useEffect)(() => {
		if (!ready || !catalogReady || !channel.enabled || playable.length === 0) return;
		tuneIn(channel.slug);
	}, [
		ready,
		catalogReady,
		channel.slug,
		channel.enabled,
		playable.length,
		tuneIn
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl px-4 py-8 pb-52",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl shadow-[var(--shadow-filigree)]",
				children: experience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoseOpera, {
					experience,
					layout: "hero"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationVisual, {
					channel,
					size: "hero",
					className: "aspect-[4/3] w-full sm:aspect-auto sm:h-64"
				})
			}),
			experience ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("mt-6 font-mono text-[11px] uppercase tracking-[0.2em]", skin === "glaum" ? "glaum-kicker" : "text-gold"),
					children: [channel.category, tags[0] ? ` · ${tags[0]}` : ""]
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
				})
			] }),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "glaum-sponsor mt-2 font-mono text-[10px] uppercase",
				children: "Sponsored by Shrimp™"
			}) : null,
			channel.glaumules ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-glaum",
				children: [glaumules, " glåümules collected · tap the purple bubbles"]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2",
				children: [
					experience ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void tuneIn(channel.slug, { forcePlay: true }),
						className: cn("inline-flex h-12 min-w-36 items-center justify-center rounded-md bg-fg px-5 font-mono text-[12px] uppercase tracking-[0.16em] text-bg", skin === "glaum" && "btn-glaum"),
						children: "Tune in"
					}),
					experience ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/experiences/$slug",
						params: { slug: experience.slug },
						className: "inline-flex h-12 items-center px-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gold",
						children: "Enter the opera"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShuffleToggle, {
						channel,
						compact: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareLink, {
						path: sharePath || stationPath(channel),
						title: channel.name,
						compact: true
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NowPlayingCard, {
					channel,
					track: now ?? null,
					statusLabel
				})
			}),
			skin === "glaum" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlaumWordBooth, { nextPath: sharePath || stationPath(channel) }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationPlaylist, {
				channel,
				locked: Boolean(experience) && !unlocked,
				onUnlock: experience ? () => void tuneIn(channel.slug, {
					forcePlay: true,
					fromStart: true
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StationChat, { slug: channel.slug }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimBooth, { channel }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FoldSection, {
				title: "About this frequency",
				hint: "Open",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-mono text-[10px] uppercase tracking-[0.14em] text-subtle",
						children: [
							"Desk: ",
							kindLabel(kind),
							" · You: ",
							listenModeLabel(listenMode),
							isOnDemandOverlay(channel, listenMode) ? " · overlay" : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: kindHint(kind)
					}),
					tags.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle",
						children: tags.join(" · ")
					}) : null
				]
			}),
			isAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FoldSection, {
				title: "Station settings",
				hint: "Edit",
				titleClassName: "text-gold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminStationEdit, { channel })
			}) : null
		]
	});
}
//#endregion
export { ChannelView as t };
