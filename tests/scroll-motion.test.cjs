const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const source = readFileSync(require("node:path").join(__dirname, "../script.js"), "utf8");
const helper = source.slice(source.indexOf("function observeMotion("), source.indexOf("function initCinematicMotion("));

function setup() {
  let report;
  const calls = [];
  const target = {};
  const element = { contains: (node) => node === target };
  const handlers = new Map();
  const document = {
    hidden: false,
    addEventListener: (name, handler) => handlers.set(name, handler),
    removeEventListener: (name) => handlers.delete(name)
  };
  const context = {
    document,
    motionCleanups: [],
    IntersectionObserver: class {
      constructor(callback) { report = callback; }
      observe(target) { assert.equal(target, element); }
      disconnect() { calls.push(["disconnect"]); }
    }
  };
  vm.createContext(context);
  vm.runInContext(helper, context);
  context.observeMotion([{
    element,
    entrance: {
      restart(includeDelay) { calls.push(["restart", includeDelay]); },
      pause(time) { calls.push(["reset", time]); },
      play() { calls.push(["resume"]); },
      progress(time) { calls.push(["finish", time]); }
    },
    loop: {
      play() { calls.push(["play"]); },
      pause() { calls.push(["pause"]); }
    }
  }]);
  return {
    calls,
    visibility: (visible) => report([{ target: element, isIntersecting: visible }]),
    hideTab(hidden) { document.hidden = hidden; handlers.get("visibilitychange")(); },
    focus: () => handlers.get("focusin")({ target }),
    cleanup: () => context.motionCleanups.forEach((cleanup) => cleanup()),
    handlers
  };
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

test("a hidden tab pauses motion and resumes without replaying the entrance", () => {
  const page = setup();
  page.visibility(true);
  page.calls.length = 0;
  page.hideTab(true);
  page.hideTab(false);
  assert.deepEqual(page.calls, [["reset", undefined], ["pause"], ["resume"], ["play"]]);
});

test("offscreen effects stay paused when returning to the tab", () => {
  const page = setup();
  page.visibility(true);
  page.visibility(false);
  page.hideTab(true);
  page.calls.length = 0;
  page.hideTab(false);
  assert.deepEqual(page.calls, []);
});

test("keyboard focus immediately exposes the focused content", () => {
  const page = setup();
  page.focus();
  assert.deepEqual(page.calls, [["finish", 1]]);
});

test("reinitialization disconnects old observers and listeners", () => {
  const page = setup();
  page.cleanup();
  assert.deepEqual(page.calls, [["disconnect"]]);
  assert.equal(page.handlers.size, 0);
});

const startMotionSource = source.slice(source.indexOf("function startMotion()"), source.indexOf("\nstartMotion();"));
function setupMotionLifecycle(fail = false) {
  const calls = [];
  const context = {
    reduceMotion: false,
    motionCleanups: [],
    motionContext: undefined,
    document: { body: { classList: { remove: () => {} } } },
    fallbackReveal: () => calls.push("reveal"),
    initCinematicMotion: () => {
      context.motionCleanups.push(() => calls.push("disconnect"));
      calls.push("animate");
      if (fail) throw new Error("animation initialization failed");
    },
    console: { warn: () => {} },
    gsap: {
      context: () => ({
        add: (fn) => fn(),
        revert: () => calls.push("restore styles")
      })
    }
  };
  context.window = { gsap: context.gsap };
  vm.createContext(context);
  vm.runInContext(startMotionSource, context);
  return { calls, context };
}

test("enabling reduced motion restores content and removes active motion", () => {
  const { calls, context } = setupMotionLifecycle();
  context.startMotion();
  context.reduceMotion = true;
  context.startMotion();
  assert.deepEqual(calls, ["animate", "disconnect", "restore styles", "reveal"]);
  assert.equal(context.motionCleanups.length, 0);
});

test("initialization failure restores content and removes partial observers", () => {
  const { calls, context } = setupMotionLifecycle(true);
  context.startMotion();
  assert.deepEqual(calls, ["animate", "disconnect", "restore styles", "reveal"]);
  assert.equal(context.motionCleanups.length, 0);
});
