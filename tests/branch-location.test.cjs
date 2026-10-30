const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const vm = require("node:vm");

const source = readFileSync(require("node:path").join(__dirname, "../script.js"), "utf8");
const locator = source.slice(source.indexOf("const branches ="), source.indexOf('document.querySelector(".lead-form")'));

function setup() {
  const handlers = new Map();
  const element = (branch) => ({
    dataset: { branch },
    classList: { toggle() {} },
    setAttribute(name, value) { this[name] = value; },
    addEventListener(name, callback) { handlers.set(`${branch || this.id}:${name}`, callback); },
    querySelector() { return this.child; },
    querySelectorAll() { return []; },
    focus() {}
  });
  const keys = ["poa", "curitiba", "sp", "cuiaba", "goiania"];
  const tabs = keys.map(element);
  const map = element();
  const ids = ["branch-detail", "branch-state", "branch-name", "branch-address", "branch-phone", "branch-email", "branch-route", "branch-location-status", "branch-location-retry"];
  const nodes = Object.fromEntries(ids.map((id) => [id, Object.assign(element(), { id })]));
  nodes["branch-map"] = map;
  const footer = element();
  footer.child = element();
  const floating = element();
  let success, failure;
  const document = {
    querySelector(selector) {
      if (selector === ".footer-whatsapp") return footer;
      if (selector === ".whatsapp-float") return floating;
      return nodes[selector.slice(1)];
    },
    querySelectorAll(selector) { return selector.includes("branch-tabs") ? tabs : []; }
  };
  const context = {
    document,
    navigator: { geolocation: { getCurrentPosition(ok, error) { success = ok; failure = error; } } },
    fetch: () => Promise.reject(new Error("no map in test")),
    encodeURIComponent
  };
  vm.createContext(context);
  vm.runInContext(locator, context);
  return { nodes, tabs, footer, floating, handlers, success: (...args) => success(...args), failure: (...args) => failure(...args) };
}

test("location selects the nearest branch and updates both WhatsApp links", () => {
  const page = setup();
  page.success({ coords: { latitude: -23.55, longitude: -46.63 } });
  assert.equal(page.nodes["branch-name"].textContent, "Filial São Paulo");
  assert.equal(page.footer.href, "https://wa.me/551133880477");
  assert.match(page.floating.href, /^https:\/\/wa\.me\/551133880477\?/);
  assert.match(page.nodes["branch-location-status"].textContent, /mais próxima/);
});

test("location selects each branch in its respective city", () => {
  for (const [latitude, longitude, name] of [
    [-30.03, -51.21, "Matriz Porto Alegre"],
    [-25.43, -49.27, "Filial Curitiba"],
    [-15.60, -56.10, "Filial Cuiabá"],
    [-16.68, -49.30, "Filial Goiânia"]
  ]) {
    const page = setup();
    page.success({ coords: { latitude, longitude } });
    assert.equal(page.nodes["branch-name"].textContent, name);
  }
});

test("manual selection is preserved when location returns later", () => {
  const page = setup();
  page.handlers.get("curitiba:click")();
  page.success({ coords: { latitude: -23.55, longitude: -46.63 } });
  assert.equal(page.nodes["branch-name"].textContent, "Filial Curitiba");
  assert.equal(page.footer.href, "https://wa.me/5541992375817");
});

test("denied permission leaves manual branch selection available", () => {
  const page = setup();
  page.failure({ code: 1 });
  assert.match(page.nodes["branch-location-status"].textContent, /não autorizada/);
  page.handlers.get("goiania:click")();
  assert.equal(page.nodes["branch-name"].textContent, "Filial Goiânia");
  assert.equal(page.footer.href, "https://wa.me/5562995021854");
});
