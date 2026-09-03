import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  consumeHandoffHref,
  consumeReturnTo,
  hubStartUrl,
  isRelativeNext,
  normalizeHubOrigin,
  publicOriginFromHost,
  safeNext,
  ssoCookieDomain,
} from "./sso.ts";

describe("sso helpers", () => {
  it("normalizes the hub to www", () => {
    assert.equal(normalizeHubOrigin(""), "https://www.terrainfinity.ca");
    assert.equal(normalizeHubOrigin("https://terrainfinity.ca"), "https://www.terrainfinity.ca");
    assert.equal(normalizeHubOrigin("https://www.terrainfinity.ca/"), "https://www.terrainfinity.ca");
  });

  it("rejects unsafe next paths", () => {
    assert.equal(isRelativeNext("/desk"), true);
    assert.equal(isRelativeNext("//evil"), false);
    assert.equal(isRelativeNext("https://evil.example"), false);
    assert.equal(safeNext("//evil"), "/");
    assert.equal(safeNext("/player/abc"), "/player/abc");
  });

  it("derives radio origins from the request host", () => {
    assert.equal(publicOriginFromHost("radio.terrainfinity.ca", "https"), "https://radio.terrainfinity.ca");
    assert.equal(publicOriginFromHost("radio.cyber-athens.ca", "http"), "https://radio.cyber-athens.ca");
    assert.equal(publicOriginFromHost("localhost:8080", "http"), "http://localhost:8080");
  });

  it("applies the shared cookie only on terrainfinity hosts", () => {
    assert.equal(ssoCookieDomain("radio.terrainfinity.ca", ".terrainfinity.ca"), ".terrainfinity.ca");
    assert.equal(ssoCookieDomain("radio.cyber-athens.ca", ".terrainfinity.ca"), undefined);
    assert.equal(ssoCookieDomain("localhost:8080", ".terrainfinity.ca"), undefined);
    assert.equal(ssoCookieDomain("app.grok.me", ".terrainfinity.ca"), undefined);
  });

  it("builds hub start returnTo as this origin's consume", () => {
    const returnTo = consumeReturnTo("https://radio.cyber-athens.ca", "/desk");
    assert.equal(returnTo, "https://radio.cyber-athens.ca/api/sso/consume?next=%2Fdesk");
    const start = hubStartUrl("https://www.terrainfinity.ca", returnTo);
    assert.ok(start.startsWith("https://www.terrainfinity.ca/api/sso/start?returnTo="));
    assert.ok(start.includes(encodeURIComponent("/api/sso/consume")));
    assert.equal(consumeHandoffHref("abc", "/desk"), "/api/sso/consume?code=abc&next=%2Fdesk");
  });
});
