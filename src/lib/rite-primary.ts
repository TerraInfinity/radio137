export type RitePrimary = "begin" | "pause" | "resume" | "opening";

/** Begin starts the playlist from song one. After that the same control is pause/resume — never a silent restart. */
export function ritePrimary(state: {
  here: boolean;
  playing: boolean;
  started: boolean;
  loading?: boolean;
}): RitePrimary {
  if (state.here && (state.playing || state.loading)) return "pause";
  if (state.here && state.started) return "resume";
  return "begin";
}
