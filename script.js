const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const menuToggle = document.querySelector(".menu-toggle");
const siteHeader = document.querySelector(".site-header");
const darkSections = document.querySelectorAll(".institutional, .solution-band, .site-footer");
const syncHeader = () => {
  const sampleY = siteHeader.offsetHeight / 2;
  const isDark = Array.from(darkSections).some((section) => {
    const bounds = section.getBoundingClientRect();
    return bounds.top <= sampleY && bounds.bottom > sampleY;
  });
  siteHeader.classList.toggle("is-dark", isDark);
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
};
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", syncHeader);
syncHeader();

function closeMenu() {
  siteHeader.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  menuToggle.querySelector("span").textContent = "☰";
}

menuToggle.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  menuToggle.querySelector("span").textContent = isOpen ? "×" : "☰";
});

document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});
document.addEventListener("click", (event) => {
  if (!siteHeader.contains(event.target)) closeMenu();
});

document.querySelectorAll(".product-card, .cert-card").forEach((item, index) => {
  item.dataset.motion = index % 2 === 0 ? "left" : "right";
});

function fallbackReveal() {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
}

// Re-arm entrances only after the block leaves the viewport completely.
function observeMotion(entries, options = { threshold: 0 }) {
  const states = new Map(entries.map((entry) => [entry.element, { ...entry, visible: false }]));
  const observer = new IntersectionObserver((changes) => {
    changes.forEach((change) => {
      const state = states.get(change.target);
      const visible = change.isIntersecting;
      if (!state || state.visible === visible) return;
      state.visible = visible;
      if (visible) {
        state.entrance?.restart(true);
        state.loop?.play();
      } else {
        state.entrance?.pause(0);
        state.loop?.pause();
      }
    });
  }, options);
  states.forEach((_, element) => observer.observe(element));
  return observer;
}

function initCinematicMotion() {
  if (!window.gsap || reduceMotion || !("IntersectionObserver" in window)) {
    fallbackReveal();
    return;
  }
  document.body.classList.add("gsap-ready");
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  const smallScreen = window.matchMedia("(max-width: 640px)").matches;
  const sideOffset = smallScreen ? 24 : 64;
  const entries = [];
  const hero = document.querySelector(".hero");
  const heroTimeline = gsap.timeline({ paused: true })
    .fromTo(".hero-copy", { autoAlpha: 0, x: -sideOffset }, { autoAlpha: 1, x: 0, duration: 0.9 })
    .fromTo(".hero-visual", { autoAlpha: 0, x: sideOffset }, { autoAlpha: 1, x: 0, duration: 0.9 }, 0.06)
    .fromTo(".hero-product-media", { autoAlpha: 0, x: 80, rotation: -12, scale: 0.95 },
      { autoAlpha: 1, x: 0, rotation: 0, scale: 1, duration: 1.4 }, 0.18);
  entries.push({ element: hero, entrance: heroTimeline });

  gsap.utils.toArray(".reveal:not(.hero-copy):not(.hero-visual)").forEach((element) => {
    const product = element.matches(".product-card");
    const direction = element.dataset.motion === "right" ? 1 : -1;
    const travel = product ? (smallScreen ? 84 : 180) : sideOffset;
    const entrance = gsap.fromTo(element,
      { autoAlpha: 0, x: direction * travel, scale: product ? 0.96 : 1 },
      { autoAlpha: 1, x: 0, scale: 1, duration: product ? 1.05 : 0.8, paused: true }
    );
    entries.push({ element, entrance });
  });

  const cutaway = document.querySelector(".cutaway");
  const guides = [...cutaway.querySelectorAll(".diagram-lines")];
  const callouts = [...cutaway.querySelectorAll(".bearing-callouts .callout")];
  const calloutEntries = [];
  callouts.forEach((callout, index) => {
    const entrance = gsap.timeline({ paused: true })
      .fromTo(callout, { autoAlpha: 0, x: index % 2 ? 42 : -42, y: 28, scale: 0.94 },
        { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.8 });
    guides.forEach((guide) => {
      const path = guide.querySelectorAll("path")[index];
      const dot = guide.querySelectorAll("circle")[index];
      const length = path.getTotalLength();
      entrance.fromTo(path,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 0.9 }, 0.15)
        .fromTo(dot, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" },
          { autoAlpha: 1, scale: 1, duration: 0.25 }, 0.8);
    });
    calloutEntries.push({ element: callout, entrance });
  });
  const cutawayEntry = entries.find((entry) => entry.element === cutaway);
  cutawayEntry.loop = gsap.to(".bearing-diagram", {
    y: -8, duration: 3.2, ease: "sine.inOut", repeat: -1, yoyo: true, paused: true
  });
  // Pause decorative motion outside the viewport.
  gsap.utils.toArray(".float-shape").forEach((shape, index) => {
    entries.push({ element: shape, loop: gsap.to(shape, {
      y: index % 2 ? 14 : -18, rotation: 6, duration: 4 + index * 0.45,
      ease: "sine.inOut", repeat: -1, yoyo: true, paused: true
    }) });
  });
  observeMotion(entries);
  observeMotion(calloutEntries, { threshold: 0, rootMargin: "0px 0px -12% 0px" });
}

try {
  initCinematicMotion();
} catch (error) {
  // Animation failure must never hide content or block menus and forms.
  window.ScrollTrigger?.getAll().forEach((trigger) => trigger.kill());
  window.gsap?.globalTimeline.clear();
  document.body.classList.remove("gsap-ready");
  document.querySelectorAll(".reveal, .hero-product-media, .bearing-diagram, .bearing-callouts .callout, .diagram-lines path, .diagram-lines circle").forEach((element) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("visibility");
    element.style.removeProperty("transform");
    element.style.removeProperty("stroke-dashoffset");
  });
  fallbackReveal();
  console.warn("Animações indisponíveis; conteúdo preservado.", error);
}

const backToTop = document.querySelector(".back-to-top");
function syncBackToTop() {
  backToTop.hidden = window.scrollY < 480;
}
window.addEventListener("scroll", syncBackToTop, { passive: true });
syncBackToTop();
backToTop.addEventListener("click", (event) => {
  event.preventDefault();
  const heading = document.querySelector(".hero h1");
  heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
  heading.addEventListener("blur", () => heading.removeAttribute("tabindex"), { once: true });
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
});

const productDetails = {
  "rolamentos": {
    "title": "Rolamentos",
    "description": "Os rolamentos SKF reúnem diferentes geometrias para diversas aplicações industriais e agrícolas, oferecendo soluções para variadas condições de operação. Para a escolha adequada, é importante considerar fatores como carga, rotação, temperatura, lubrificação e condições do ambiente.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Rolamentos rígidos de esferas",
      "Rolamentos série Y",
      "Rolamentos de esferas de contato angular",
      "Rolamentos autocompensadores de esferas",
      "Rolamentos axiais de esferas",
      "Rolamentos de rolos cilíndricos",
      "Rolamentos de rolos cônicos",
      "Rolamentos autocompensadores de rolos",
      "Rolamentos de rolos bipartidos SKF Cooper",
      "Rolamentos de rolos toroidais CARB",
      "Rolamentos axiais de rolos cilíndricos",
      "Rolamentos axiais de rolos de agulhas",
      "Rolamentos axiais de rolos cônicos",
      "Rolamentos axiais autocompensadores de rolos"
    ]
  },
  "mancais": {
    "title": "Mancais",
    "description": "Os mancais SKF são desenvolvidos para alojar e apoiar rolamentos, proporcionando estabilidade, posicionamento adequado do eixo e segurança na operação. Suas diferentes configurações facilitam a montagem, a inspeção e a manutenção, atendendo às necessidades de diversas aplicações industriais.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Mancais SNL 2, 3, 5 e 6",
      "Mancais SNLN 30",
      "Mancais SNL 30, 31 e 32",
      "Mancais SONL",
      "Mancais SAF e SAW",
      "Mancais FNL",
      "Mancais PD"
    ]
  },
  "vedacoes": {
    "title": "Vedações",
    "description": "As vedações SKF são desenvolvidas para proteger componentes mecânicos contra a entrada de contaminantes, como poeira, água e partículas abrasivas, além de ajudar a evitar vazamentos de lubrificantes. Suas diferentes configurações contribuem para reduzir o desgaste, aumentar a vida útil dos equipamentos e garantir maior confiabilidade em aplicações industriais e agrícolas.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Vedações radiais de eixo",
      "Vedações tipo cassete",
      "Buchas de desgaste"
    ]
  },
  "lubrificacao": {
    "title": "Lubrificação",
    "description": "As soluções de lubrificação SKF são desenvolvidas para garantir o fornecimento adequado de lubrificante aos componentes mecânicos, contribuindo para reduzir o atrito, prevenir desgastes e aumentar a vida útil dos equipamentos. Com opções para lubrificação manual e automática, proporcionam maior eficiência, confiabilidade e segurança nas operações industriais e agrícolas.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Ferramentas para lubrificação manual",
      "Lubrificadores automáticos",
      "Componentes para sistemas de lubrificação"
    ]
  },
  "graxas": {
    "title": "Graxas",
    "description": "As graxas SKF são desenvolvidas para oferecer lubrificação eficiente em diferentes condições de operação, contribuindo para reduzir o atrito, proteger contra o desgaste e aumentar a vida útil dos componentes. Com opções para diferentes temperaturas, cargas e ambientes, proporcionam maior confiabilidade e desempenho em aplicações industriais e agrícolas.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Graxas para ampla variedade de aplicações",
      "Graxas para baixas temperaturas",
      "Graxas para cargas elevadas",
      "Graxas para altas temperaturas",
      "Graxas compatíveis com aplicações alimentícias",
      "Graxas para aplicações especiais"
    ]
  },
  "mapro": {
    "title": "Ferramentas de Manutenção SKF (MaPro)",
    "description": "As ferramentas de manutenção SKF (MaPro) são desenvolvidas para proporcionar maior precisão, segurança e eficiência na montagem, desmontagem e manutenção de rolamentos e componentes mecânicos. Com soluções mecânicas, hidráulicas e térmicas, ajudam a prevenir danos durante a instalação, reduzir o tempo de manutenção e aumentar a confiabilidade dos equipamentos.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Ferramentas hidráulicas para montagem e desmontagem",
      "Ferramentas mecânicas para montagem e desmontagem",
      "Aquecedores para montagem e desmontagem",
      "Ferramentas de alinhamento"
    ]
  },
  "solid-oil": {
    "title": "Rolamentos Solid Oil SKF",
    "description": "Os rolamentos SKF com tecnologia Solid Oil oferecem uma solução inovadora de lubrificação, utilizando uma matriz polimérica saturada de óleo que proporciona lubrificação contínua durante a operação. Desenvolvidos especialmente para ambientes com umidade e contaminação, ajudam a reduzir vazamentos de lubrificante, dispensam a relubrificação e contribuem para aumentar a vida útil e a confiabilidade dos equipamentos.",
    "listTitle": "Principais benefícios:",
    "items": [
      "Lubrificação contínua, sem necessidade de relubrificação",
      "Maior resistência à umidade e à lavagem",
      "Redução de vazamentos de lubrificante",
      "Proteção adicional contra a entrada de contaminantes",
      "Menor necessidade de intervenções de manutenção",
      "Maior confiabilidade em condições severas de operação"
    ]
  },
  "correntes": {
    "title": "Correntes SKF",
    "description": "As correntes SKF são desenvolvidas para oferecer resistência, durabilidade e eficiência na transmissão de potência e movimentação de materiais. Com diferentes configurações para aplicações industriais e agrícolas, contribuem para reduzir desgastes, suportar condições exigentes de operação e aumentar a confiabilidade e a produtividade dos equipamentos.",
    "listTitle": "Linhas disponíveis:",
    "items": [
      "Correntes de rolos",
      "Correntes de rolos duplas e triplas",
      "Correntes de passo duplo",
      "Correntes transportadoras",
      "Correntes de alta resistência",
      "Correntes resistentes à corrosão",
      "Correntes de placas (Leaf Chains)",
      "Correntes agrícolas",
      "Correntes para aplicações especiais"
    ]
  },
  "sensorizadas": {
    "title": "Unidades Sensorizadas SKF",
    "description": "Os rolamentos sensorizados SKF combinam a precisão dos rolamentos com tecnologias de sensores integrados, permitindo acompanhar parâmetros como velocidade, sentido de rotação e, em determinadas configurações, temperatura e condições de funcionamento. Essas soluções contribuem para maior controle operacional, eficiência dos equipamentos e confiabilidade dos processos industriais.",
    "listTitle": "Principais benefícios:",
    "items": [
      "Integração de sensores ao conjunto do rolamento",
      "Monitoramento de parâmetros operacionais",
      "Medição de velocidade e sentido de rotação",
      "Possibilidade de acompanhamento da temperatura",
      "Maior precisão no controle de máquinas e equipamentos",
      "Apoio à manutenção preventiva e preditiva"
    ]
  }
};

const productDialog = document.querySelector("#product-dialog");
let lastProductTrigger;
document.querySelectorAll(".product-card").forEach((card) => {
  card.addEventListener("click", () => {
    const detail = productDetails[card.dataset.product];
    if (!detail) return;
    lastProductTrigger = card.querySelector(".product-open");
    const cardImage = card.querySelector("img");
    const dialogImage = productDialog.querySelector("#product-dialog-image");
    dialogImage.src = cardImage.src;
    dialogImage.alt = cardImage.alt;
    productDialog.querySelector("#product-dialog-title").textContent = detail.title;
    productDialog.querySelector("#product-dialog-description").textContent = detail.description;
    productDialog.querySelector("#product-dialog-list-title").textContent = detail.listTitle;
    const items = detail.items.map((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      return item;
    });
    productDialog.querySelector("#product-dialog-items").replaceChildren(...items);
    productDialog.showModal();
    productDialog.querySelector(".product-dialog-copy").scrollTop = 0;
  });
});
productDialog.querySelector(".product-dialog-close").addEventListener("click", () => productDialog.close());
productDialog.querySelector("#product-dialog-cta").addEventListener("click", () => productDialog.close());
productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});
productDialog.addEventListener("close", () => lastProductTrigger?.focus());

const branches = {
  poa: {
    coordinates: [-30.0066953, -51.2050388],
    stateCode: "43",
    state: "Rio Grande do Sul",
    name: "Matriz Porto Alegre",
    address: "Rua Santos Dumont, 1000, bairro São Geraldo\nPorto Alegre - RS, CEP 90230-240",
    phone: "(51) 3337-8477",
    phoneHref: "tel:+555133378477",
    whatsapp: "5551981221367",
    whatsappLabel: "(51) 98122-1367",
    email: "portoalegre@sueca.com.br",
    mapsQuery: "Rua Santos Dumont 1000 Porto Alegre RS"
  },
  curitiba: {
    coordinates: [-25.4581574, -49.2633884],
    stateCode: "41",
    state: "Paraná",
    name: "Filial Curitiba",
    address: "Rua Alferes Poli, 2554, bairro Parolin\nCuritiba - PR, CEP 80220-051",
    phone: "(41) 3015-8477",
    phoneHref: "tel:+554130158477",
    whatsapp: "5541992375817",
    whatsappLabel: "(41) 99237-5817",
    email: "curitiba@sueca.com.br",
    mapsQuery: "Rua Alferes Poli 2554 Curitiba PR"
  },
  sp: {
    coordinates: [-23.5666453, -46.5823999],
    stateCode: "35",
    state: "São Paulo",
    name: "Filial São Paulo",
    address: "Rua Natal, 851, bairro Mooca\nSão Paulo - SP, CEP 03186-030",
    phone: "(11) 3388-0477",
    phoneHref: "tel:+551133880477",
    whatsapp: "551133880477",
    whatsappLabel: "(11) 3388-0477",
    email: "saopaulo@sueca.com.br",
    mapsQuery: "Rua Natal 851 São Paulo SP"
  },
  cuiaba: {
    coordinates: [-15.5790364, -56.0882622],
    stateCode: "51",
    state: "Mato Grosso",
    name: "Filial Cuiabá",
    address: "Rua Oeste, 11, Rodoviária Parque, bairro Despraiado\nCuiabá - MT, CEP 78048-120",
    phone: "(65) 3634-8477",
    phoneHref: "tel:+556536348477",
    whatsapp: "5565992554803",
    whatsappLabel: "(65) 99255-4803",
    email: "cuiaba@sueca.com.br",
    mapsQuery: "Rua Oeste 11 Rodoviária Parque Cuiabá MT"
  },
  goiania: {
    coordinates: [-16.6697847, -49.3116456],
    stateCode: "52",
    state: "Goiás",
    name: "Filial Goiânia",
    address: "Av. Castelo Branco, 4770, bairro Rodoviário\nGoiânia - GO, CEP 74430-130",
    phone: "(62) 3157-8484",
    phoneHref: "tel:+556231578484",
    whatsapp: "5562995021854",
    whatsappLabel: "(62) 99502-1854",
    email: "goiania@sueca.com.br",
    mapsQuery: "Avenida Castelo Branco 4770 Goiânia GO"
  }
};

let selectedBranch = "poa";

function nearestBranch(latitude, longitude) {
  const radians = (degrees) => degrees * Math.PI / 180;
  return Object.entries(branches).reduce((closest, [key, branch]) => {
    const [branchLat, branchLon] = branch.coordinates;
    const latDiff = radians(branchLat - latitude);
    const lonDiff = radians(branchLon - longitude);
    const distance = Math.sin(latDiff / 2) ** 2 +
      Math.cos(radians(latitude)) * Math.cos(radians(branchLat)) * Math.sin(lonDiff / 2) ** 2;
    return distance < closest.distance ? { key, distance } : closest;
  }, { key: "poa", distance: Infinity }).key;
}

function initBranchLocator() {
  const map = document.querySelector("#branch-map");
  const tabs = [...document.querySelectorAll(".branch-tabs button")];
  if (!map || !tabs.length) return;

  const detail = document.querySelector("#branch-detail");
  const state = document.querySelector("#branch-state");
  const name = document.querySelector("#branch-name");
  const address = document.querySelector("#branch-address");
  const phone = document.querySelector("#branch-phone");
  const email = document.querySelector("#branch-email");
  const route = document.querySelector("#branch-route");
  const locationStatus = document.querySelector("#branch-location-status");
  const locationRetry = document.querySelector("#branch-location-retry");
  let manualSelection = false;
  let locationRequest = 0;

  function selectBranch(key, manual = false) {
    const branch = branches[key];
    if (!branch) return;
    if (manual) {
      manualSelection = true;
      locationStatus.textContent = "Filial selecionada manualmente. Você pode escolher outra unidade a qualquer momento.";
    }
    selectedBranch = key;
    const whatsappUrl = `https://wa.me/${branch.whatsapp}`;
    const footerWhatsapp = document.querySelector(".footer-whatsapp");
    footerWhatsapp.href = whatsappUrl;
    footerWhatsapp.querySelector("span").textContent = `WhatsApp ${branch.whatsappLabel}`;
    footerWhatsapp.setAttribute("aria-label", `WhatsApp ${branch.name}: ${branch.whatsappLabel}`);
    const floatingWhatsapp = document.querySelector(".whatsapp-float");
    floatingWhatsapp.href = `${whatsappUrl}?text=${encodeURIComponent("Olá, quero orientação sobre produtos SKF.")}`;
    floatingWhatsapp.setAttribute("aria-label", `Conversar com ${branch.name} pelo WhatsApp (abre em nova aba)`);
    floatingWhatsapp.title = `WhatsApp ${branch.name}`;

    tabs.forEach((tab) => {
      const active = tab.dataset.branch === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    map.querySelectorAll(".map-pin, svg path.has-branch").forEach((target) => {
      const active = target.dataset.branch === key;
      target.classList.toggle("is-active", active);
      target.setAttribute("aria-pressed", String(active));
    });

    detail.setAttribute("aria-labelledby", `branch-tab-${key}`);
    state.textContent = branch.state;
    name.textContent = branch.name;
    address.textContent = branch.address;
    phone.textContent = branch.phone;
    phone.href = branch.phoneHref;
    email.textContent = branch.email;
    email.href = `mailto:${branch.email}`;
    route.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.mapsQuery)}`;
  }

  document.querySelectorAll(".branch-tabs button, .map-pin").forEach((control) => {
    control.addEventListener("click", () => selectBranch(control.dataset.branch, true));
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener("keydown", (event) => {
      const next = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectBranch(tabs[next].dataset.branch, true);
      tabs[next].focus();
    });
  });

  fetch("assets/brasil-ufs.svg")
    .then((response) => {
      if (!response.ok) throw new Error("Mapa indisponível");
      return response.text();
    })
    .then((source) => {
      const svg = new DOMParser().parseFromString(source, "image/svg+xml").documentElement;
      if (svg.localName !== "svg") return;
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("role", "group");
      svg.setAttribute("aria-label", "Estados com filiais Sueca");

      Object.entries(branches).forEach(([key, branch]) => {
        const path = svg.querySelector(`path[id="${branch.stateCode}"]`);
        if (!path) return;
        path.classList.add("has-branch");
        path.dataset.branch = key;
        path.setAttribute("role", "button");
        path.setAttribute("tabindex", "0");
        path.setAttribute("aria-label", `Selecionar ${branch.name}, ${branch.state}`);
        path.addEventListener("click", () => selectBranch(key, true));
        path.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectBranch(key, true);
          }
        });
      });

      map.replaceChild(svg, map.querySelector(".branch-map-fallback"));
      selectBranch(selectedBranch);
    })
    .catch(() => {});

  selectBranch("poa");

  function findNearbyBranch() {
    const request = ++locationRequest;
    manualSelection = false;
    if (!navigator.geolocation) {
      locationStatus.textContent = "Localização indisponível neste navegador. Escolha sua filial abaixo.";
      return;
    }
    locationStatus.textContent = "Aguardando sua autorização para encontrar a filial mais próxima.";
    navigator.geolocation.getCurrentPosition((position) => {
      if (request !== locationRequest || manualSelection) return;
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        locationStatus.textContent = "Não foi possível identificar sua localização. Escolha sua filial abaixo.";
        return;
      }
      const key = nearestBranch(latitude, longitude);
      selectBranch(key);
      locationStatus.textContent = `Filial mais próxima: ${branches[key].name}. Você também pode escolher outra unidade.`;
    }, (error) => {
      if (request !== locationRequest || manualSelection) return;
      locationStatus.textContent = error.code === 1
        ? "Localização não autorizada. Escolha sua filial abaixo."
        : "Não foi possível identificar sua localização. Escolha sua filial abaixo.";
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  }

  locationRetry.addEventListener("click", findNearbyBranch);
  findNearbyBranch();
}

initBranchLocator();

document.querySelector(".lead-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const message = [
    "Olá, quero orientação sobre produtos SKF.",
    `Nome: ${data.get("nome")}`,
    `WhatsApp: ${data.get("telefone")}`,
    `Aplicação: ${data.get("aplicacao")}`,
    `Necessidade: ${data.get("mensagem") || "Não informada"}`
  ].join("\n");

  window.open(`https://wa.me/${branches[selectedBranch].whatsapp}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
