import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { petalFacing, spawnAirPetal, stepAirPetal } from "./rose-air.ts";

describe("rose air petals", () => {
  it("tumbles and drifts instead of falling in a straight line", () => {
    const petal = spawnAirPetal(() => 0.4);
    petal.x = 0.5;
    petal.y = 0.2;
    petal.vx = 0;
    petal.vy = 0.02;
    petal.pitch = 0.3;
    const xs: number[] = [];
    const pitches: number[] = [];
    for (let i = 0; i < 90; i++) {
      const alive = stepAirPetal(petal, 1 / 30, {
        t: i / 30,
        cx: 0.5,
        cy: 0.42,
        energy: 0.6,
        kick: i % 18 === 0 ? 0.8 : 0.05,
        fly: 1,
        gustX: 0.02,
        gustY: -0.01,
      });
      assert.equal(alive, true);
      xs.push(petal.x);
      pitches.push(petal.pitch);
    }
    const wander = Math.max(...xs) - Math.min(...xs);
    const tumble = Math.max(...pitches) - Math.min(...pitches);
    assert.ok(wander > 0.02, `expected lateral dance, got ${wander}`);
    assert.ok(tumble > 0.4, `expected pitch tumble, got ${tumble}`);
    assert.ok(petalFacing(petal) >= 0 && petalFacing(petal) <= 1);
  });

  it("keeps modest size and always leaves the frame", () => {
    const petal = spawnAirPetal(() => 0.91);
    assert.ok(petal.size <= 44, `petal too large: ${petal.size}`);
    petal.x = 0.5;
    petal.y = 0.15;
    petal.vx = 0;
    petal.vy = 0.02;
    petal.max = 8;
    let alive = true;
    let frames = 0;
    while (alive && frames < 900) {
      alive = stepAirPetal(petal, 1 / 60, {
        t: frames / 60,
        cx: 0.5,
        cy: 0.42,
        energy: 1,
        kick: frames % 8 === 0 ? 1 : 0.4,
        fly: 1.5,
        gustX: 0.08,
        gustY: -0.08,
      });
      frames += 1;
      assert.ok(Math.abs(petal.pitchVel) <= 3.11, `pitch exploded: ${petal.pitchVel}`);
      assert.ok(petal.vy >= 0.01, `hovered: vy ${petal.vy}`);
    }
    assert.equal(alive, false);
    assert.ok(petal.y > 0.9 || petal.life > petal.max);
  });
});
