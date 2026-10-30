const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const source = readFileSync(require("node:path").join(__dirname, "../script.js"), "utf8");
const helper = source.slice(source.indexOf("function observeMotion("), source.indexOf("function initCinematicMotion("));

function setup() {
  let report;
  const calls = [];
  const element = {};
  const context = {
    IntersectionObserver: class {
      constructor(callback) { report = callback; }
      observe(target) { assert.equal(target, element); }
    }
  };
  vm.createContext(context);
  vm.runInContext(helper, context);
  context.observeMotion([{
    element,
    entrance: {
      restart(includeDelay) { calls.push(["restart", includeDelay]); },
      pause(time) { calls.push(["reset", time]); }
    },
    loop: {
      play() { calls.push(["play"]); },
      pause() { calls.push(["pause"]); }
    }
  }]);
  return { calls, visibility: (visible) => report([{ target: element, isIntersecting: visible }]) };
}

test("entrances replay on every return, without reloading the page", () => {
  const { calls, visibility } = setup();
  visibility(false);
  assert.equal(calls.length, 0);
  for (let visit = 0; visit < 3; visit++) {
    visibility(true);
    visibility(false);
  }
  assert.deepEqual(calls, Array.from({ length: 3 }, () => [
    ["restart", true], ["play"], ["reset", 0], ["pause"]
  ]).flat());
});

test("duplicate observer notifications do not restart an active animation", () => {
  const { calls, visibility } = setup();
  visibility(true);
  visibility(true);
  visibility(true);
  assert.deepEqual(calls, [["restart", true], ["play"]]);
});
