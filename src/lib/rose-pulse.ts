/** Musical clock for the Rose opera. Pairs visuals to playback time without tapping the audio graph. */

export type RosePulse = {
  time: number;
  bpm: number;
  beatIndex: number;
  beatsInBar: number;
  beatPhase: number;
  barPhase: number;
  phrasePhase: number;
  kick: number;
  snare: number;
  downbeat: number;
  energy: number;
  flying: number;
};

const BEATS_IN_BAR = 4;
const BARS_IN_PHRASE = 8;

export function bpmFromTags(tags?: string[] | null, fallback = 120): number {
  if (!tags) return clampBpm(fallback);
  for (const tag of tags) {
    const match = String(tag).match(/(?:^|\b)bpm[:\s-]?(\d{2,3})(?:\b|$)/i);
    if (match) return clampBpm(Number(match[1]));
  }
  return clampBpm(fallback);
}

export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) return 120;
  return Math.min(200, Math.max(70, Math.round(value)));
}

function envelope(phase: number, width = 0.18): number {
  if (phase < 0 || phase > width) return 0;
  return Math.exp(-phase / (width * 0.38));
}

export function pulseAt(timeSec: number, bpm: number, playing = true): RosePulse {
  const tempo = clampBpm(bpm);
  const t = Math.max(0, Number.isFinite(timeSec) ? timeSec : 0);
  const beatLen = 60 / tempo;
  const beatFloat = t / beatLen;
  const beatIndex = Math.floor(beatFloat);
  const beatPhase = beatFloat - beatIndex;
  const barBeat = ((beatIndex % BEATS_IN_BAR) + BEATS_IN_BAR) % BEATS_IN_BAR;
  const barPhase = (barBeat + beatPhase) / BEATS_IN_BAR;
  const phraseBeats = BEATS_IN_BAR * BARS_IN_PHRASE;
  const phrasePhase = ((beatFloat % phraseBeats) + phraseBeats) % phraseBeats / phraseBeats;
  const kick = Math.max(envelope(beatPhase), barBeat % 2 === 0 ? envelope(beatPhase, 0.22) * 0.85 : 0);
  const snare = barBeat === 1 || barBeat === 3 ? envelope(beatPhase, 0.16) : 0;
  const downbeat = barBeat === 0 ? envelope(beatPhase, 0.28) : 0;
  const engine = 0.42 + 0.38 * Math.sin(phrasePhase * Math.PI * 2) ** 2;
  const hit = Math.min(1, kick * 0.7 + snare * 0.45 + downbeat * 0.9);
  const energy = playing ? Math.min(1, engine * 0.65 + hit * 0.55) : 0.12;
  const flying = playing ? 0.55 + energy * 0.7 + downbeat * 0.35 : 0.08;
  return {
    time: t,
    bpm: tempo,
    beatIndex,
    beatsInBar: BEATS_IN_BAR,
    beatPhase,
    barPhase,
    phrasePhase,
    kick,
    snare,
    downbeat,
    energy,
    flying,
  };
}

export function captionForPulse(pulse: RosePulse, lines: string[]): string {
  if (!lines.length) return "";
  const slot = Math.floor(pulse.phrasePhase * lines.length) % lines.length;
  return lines[slot] ?? lines[0];
}
