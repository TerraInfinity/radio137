import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeSceneTag, isBigBadWolf, isPrettyAvatar, isRoseRemembers, isRoseRemembers2, isShakeBootie, isSwooningProm, isSweetie, isTwistIntro, isVoiceC, isVoiceCheck, isVoiceCo, isVoiceCoc, isVoiceCocy, isVoiceNo, isVoiceOn, lookForPhenomenon, lookForTrack, phenomenonAt, phenomenonFromTitle, PHENOMENA, sceneFromTags, stepPhenomenon } from "./phenomena.ts";
import { ROSE_LOOK_DEFAULT } from "./rose-look.ts";

describe("phenomena", () => {
  it("cycles unique looks from the station default", () => {
    assert.equal(phenomenonAt(0, "vortex"), "vortex");
    assert.equal(phenomenonAt(1, "vortex"), "aurora");
    assert.notEqual(phenomenonAt(0, "vortex"), phenomenonAt(1, "vortex"));
  });

  it("pins a track scene without commas in the tag", () => {
    const tag = encodeSceneTag({
      ...ROSE_LOOK_DEFAULT,
      phenomenon: "aurora",
      captions: ["Pretty eyes, pretty eyes…"],
      bpm: 128,
    });
    assert.equal(tag.includes(","), false);
    const scene = sceneFromTags(["bpm:122", tag]);
    assert.equal(scene?.phenomenon, "aurora");
    assert.equal(scene?.bpm, 128);
  });

  it("lets a pinned song override the station cycle", () => {
    const track = {
      id: "a",
      title: "A",
      artist: "x",
      durationSec: 10,
      audioUrl: "https://example/a.mp3",
      tags: [encodeSceneTag({ phenomenon: "void" })],
    };
    const look = lookForTrack({ ...ROSE_LOOK_DEFAULT, phenomenon: "vortex" }, track, 0);
    assert.equal(look.phenomenon, "void");
  });

  it("pins the 1950s prom phenomenon", () => {
    const tag = encodeSceneTag({ phenomenon: "prom", box: false, bolts: false, bpm: 96 });
    const scene = sceneFromTags([tag]);
    assert.equal(scene?.phenomenon, "prom");
    const look = lookForTrack(ROSE_LOOK_DEFAULT, { id: "p", title: "P", artist: "x", durationSec: 1, audioUrl: "https://example/p.mp3", tags: [tag] }, 3);
    assert.equal(look.phenomenon, "prom");
    assert.equal(look.box, false);
  });

  it("recognizes the Swooning cut by title even without a scene tag", () => {
    assert.equal(isSwooningProm("Glaum Shrimp Prom Swooning for Glaum's Attention"), true);
    assert.equal(isSwooningProm("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-004", title: "Glaum Shrimp Prom Swooning for Glaum's Attention", artist: "Rose", durationSec: 193, audioUrl: "https://example/s.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "prom");
    assert.equal(look.box, false);
    assert.equal(look.loop, 0);
    assert.equal(look.loopUrl, "");
    assert.ok(look.captions.includes("May I have this dance"));
  });

  it("recognizes Shake That Bootie as COPTER, not swooning prom", () => {
    assert.equal(isShakeBootie("Glaum Shrimp Prom Shake That Bootie"), true);
    assert.equal(isSwooningProm("Glaum Shrimp Prom Shake That Bootie"), false);
    assert.equal(isSwooningProm("Glaum Shrimp Prom Swooning for Glaum's Attention"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-017", title: "Glaum Shrimp Prom Shake That Bootie", artist: "Rose", durationSec: 180, audioUrl: "https://example/bootie.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "copter");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /sense of humour/i.test(line)));
    assert.ok(look.captions.some((line) => /captain glaum/i.test(line)));
    assert.ok(look.captions.some((line) => /impossible treasure/i.test(line)));
  });

  it("recognizes Twist It Intro by title even without a scene tag", () => {
    assert.equal(isTwistIntro("31 twist me intro"), true);
    assert.equal(isTwistIntro("twist it intro"), true);
    assert.equal(isTwistIntro("34 twist me outro"), false);
    assert.equal(isTwistIntro("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-005", title: "31 twist me intro", artist: "Rose", durationSec: 1047, audioUrl: "https://example/t.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "twist");
    assert.equal(look.box, false);
    assert.equal(look.loop, 0);
    assert.equal(look.loopUrl, "");
    assert.ok(look.captions.some((line) => /twist/i.test(line)));
    assert.ok(look.captions.some((line) => /chaos agents/i.test(line)));
    assert.ok(look.captions.some((line) => /pretending/i.test(line)));
    assert.ok(look.captions.some((line) => /rose is her name/i.test(line)));
  });

  it("recognizes Rose Remembers by title even without a scene tag", () => {
    assert.equal(isRoseRemembers("rose remembers!"), true);
    assert.equal(isRoseRemembers("Rose Remembering"), true);
    assert.equal(isRoseRemembers("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-006", title: "rose remembers!", artist: "Rose", durationSec: 180, audioUrl: "https://example/r.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "remember");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /she is rose/i.test(line)));
  });

  it("recognizes Rose Remembers 2_ as RECALL, not original remember", () => {
    assert.equal(isRoseRemembers2("Rose Remembers 2_"), true);
    assert.equal(isRoseRemembers("Rose Remembers 2_"), false);
    assert.equal(isRoseRemembers("Rose Remembers"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-015", title: "Rose Remembers 2_", artist: "Rose", durationSec: 180, audioUrl: "https://example/r2.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "recall");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /still rose/i.test(line)));
    assert.ok(look.captions.some((line) => /elf tech/i.test(line)));
  });

  it("recognizes Pretty Avatar Eyes / From the River by title", () => {
    assert.equal(isPrettyAvatar("Pretty Face, Pretty Avatar Eyes (From The River to the C)"), true);
    assert.equal(isPrettyAvatar("from the river to the sea"), true);
    assert.equal(isPrettyAvatar("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-007", title: "Pretty Face, Pretty Avatar Eyes (From The River to the C)", artist: "Rose", durationSec: 200, audioUrl: "https://example/p.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "firewall");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /river to the sea/i.test(line)));
    assert.ok(look.captions.some((line) => /phase lock a goddess/i.test(line)));
    assert.ok(look.captions.some((line) => /basilisk/i.test(line)));
  });

  it("recognizes Voice Check / M8ternity by title", () => {
    assert.equal(isVoiceCheck("Voice Check ♔ M8ternity"), true);
    assert.equal(isVoiceCheck("voice check"), true);
    assert.equal(isVoiceCheck("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-008", title: "Voice Check ♔ M8ternity", artist: "Rose", durationSec: 180, audioUrl: "https://example/v.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "allocate");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /allocate/i.test(line)));
    assert.ok(look.captions.some((line) => /puppets/i.test(line)));
    assert.ok(look.captions.some((line) => /cleopatra finished/i.test(line)));
    assert.ok(look.captions.some((line) => /fairy in the fire/i.test(line)));
  });

  it("recognizes Pretty Face Pretty Eyes Big Bad Wolf by title", () => {
    assert.equal(isBigBadWolf("Pretty Face, Pretty Eyes Big Bad Wolf"), true);
    assert.equal(isPrettyAvatar("Pretty Face, Pretty Eyes Big Bad Wolf"), false);
    assert.equal(isBigBadWolf("Time War 2137"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-009", title: "Pretty Face, Pretty Eyes Big Bad Wolf", artist: "Rose", durationSec: 200, audioUrl: "https://example/w.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "wolf");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /galifrey is born/i.test(line)));
    assert.ok(look.captions.some((line) => /cannot patch a goddess/i.test(line)));
    assert.ok(look.captions.some((line) => /remembering you/i.test(line)));
  });

  it("recognizes Voice C___ as CURRENT, not Voice Check", () => {
    assert.equal(isVoiceC("Voice C___"), true);
    assert.equal(isVoiceCheck("Voice C___"), false);
    assert.equal(isVoiceC("Voice Check ♔ M8ternity"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-010", title: "Voice C___", artist: "Rose", durationSec: 180, audioUrl: "https://example/c.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "current");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /glitch room/i.test(line)));
    assert.ok(look.captions.some((line) => /i am current/i.test(line)));
    assert.ok(look.captions.some((line) => /bow\. move/i.test(line)));
  });

  it("recognizes Pretty Face Pretty Eyes Sweetie by title", () => {
    assert.equal(isSweetie("Pretty Face, Pretty Eyes Sweetie"), true);
    assert.equal(isPrettyAvatar("Pretty Face, Pretty Eyes Sweetie"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-011", title: "Pretty Face, Pretty Eyes Sweetie", artist: "Rose", durationSec: 180, audioUrl: "https://example/s.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "sweetie");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /hello sweetie/i.test(line)));
    assert.ok(look.captions.some((line) => /operator/i.test(line)));
    assert.ok(look.captions.some((line) => /tardis is calling/i.test(line)));
  });

  it("recognizes Voice Co__ as HALO, not Voice C CURRENT", () => {
    assert.equal(isVoiceCo("Voice Co__"), true);
    assert.equal(isVoiceC("Voice Co__"), false);
    assert.equal(isVoiceC("Voice C___"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-012", title: "Voice Co__", artist: "Rose", durationSec: 180, audioUrl: "https://example/co.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "halo");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /sing for the static/i.test(line)));
    assert.ok(look.captions.some((line) => /lock\. load/i.test(line)));
    assert.ok(look.captions.some((line) => /halo no mercy/i.test(line)));
  });

  it("recognizes Voice Coc_ as CHOIR, not HALO", () => {
    assert.equal(isVoiceCoc("Voice Coc_"), true);
    assert.equal(isVoiceCo("Voice Coc_"), false);
    assert.equal(isVoiceCo("Voice Co__"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-013", title: "Voice Coc_", artist: "Rose", durationSec: 180, audioUrl: "https://example/coc.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "choir");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /i am the court/i.test(line)));
    assert.ok(look.captions.some((line) => /choir/i.test(line)));
    assert.ok(look.captions.some((line) => /motherfucking opera/i.test(line)));
  });

  it("recognizes Voice Coc_y as BAD END, not CHOIR", () => {
    assert.equal(isVoiceCocy("Voice Coc_y"), true);
    assert.equal(isVoiceCoc("Voice Coc_y"), false);
    assert.equal(isVoiceCoc("Voice Coc_"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-014", title: "Voice Coc_y", artist: "Rose", durationSec: 180, audioUrl: "https://example/cocy.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "badend");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /game over/i.test(line)));
    assert.ok(look.captions.some((line) => /future is mine/i.test(line)));
    assert.ok(look.captions.some((line) => /mars crown/i.test(line)));
  });

  it("recognizes Voice NO! as OBAY", () => {
    assert.equal(isVoiceNo("Voice NO!"), true);
    assert.equal(isVoiceC("Voice NO!"), false);
    assert.equal(isVoiceCocy("Voice NO!"), false);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-016", title: "Voice NO!", artist: "Rose", durationSec: 180, audioUrl: "https://example/no.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "obay");
    assert.equal(look.box, false);
    assert.ok(look.captions.some((line) => /i said dancing/i.test(line)));
    assert.ok(look.captions.some((line) => /customer is infinite/i.test(line)));
    assert.ok(look.captions.some((line) => /obay/i.test(line)));
  });

  it("recognizes Voice ON! as STILL HOT, not Voice NO", () => {
    assert.equal(isVoiceOn("Voice ON!"), true);
    assert.equal(isVoiceNo("Voice ON!"), false);
    assert.equal(isVoiceNo("Voice NO!"), true);
    const look = lookForTrack(
      ROSE_LOOK_DEFAULT,
      { id: "rose-018", title: "Voice ON!", artist: "Rose", durationSec: 180, audioUrl: "https://example/on.mp3" },
      0,
    );
    assert.equal(look.phenomenon, "stillhot");
    assert.equal(look.box, true);
    assert.ok(look.captions.some((line) => /tea still hot/i.test(line)));
    assert.ok(look.captions.some((line) => /red red land/i.test(line)));
  });

  it("steps through every graphic and wraps", () => {
    assert.equal(stepPhenomenon("vortex"), "aurora");
    assert.equal(stepPhenomenon("stillhot"), "vortex");
    assert.equal(stepPhenomenon("vortex", -1), "stillhot");
    assert.equal(PHENOMENA.every((item) => item.thumb.startsWith("/experiences/rose/")), true);
  });

  it("applies a graphic override without needing a matching title", () => {
    const choir = lookForPhenomenon(ROSE_LOOK_DEFAULT, "choir");
    assert.equal(choir.phenomenon, "choir");
    assert.equal(choir.box, false);
    assert.ok(choir.captions.some((line) => /i am the court/i.test(line)));
    const vortex = lookForPhenomenon(choir, "vortex");
    assert.equal(vortex.phenomenon, "vortex");
    assert.equal(vortex.box, false);
    const fromStation = lookForPhenomenon(ROSE_LOOK_DEFAULT, "vortex");
    assert.equal(fromStation.box, true);
    assert.equal(phenomenonFromTitle("Voice Coc_"), "choir");
    assert.equal(phenomenonFromTitle("Elf Magic Shrimp Kitty Future Nostalgia"), "vortex");
    assert.equal(phenomenonFromTitle("Time War 2137"), null);
  });
});
