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
function observeMotion(entries) {
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
  }, { threshold: 0 });
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
  const guides = cutaway.querySelector(".diagram-lines");
  const paths = [...guides.querySelectorAll("path")];
  const dots = [...guides.querySelectorAll("circle")];
  const annotations = gsap.timeline({ paused: true });
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    annotations.fromTo(path,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.65 }, index * 0.1);
  });
  annotations.fromTo(dots, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" },
    { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.1 }, 0.2)
    .fromTo(".bearing-callouts .callout", { autoAlpha: 0, y: 10 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.1 }, 0.2);
  const cutawayEntry = entries.find((entry) => entry.element === cutaway);
  // One entrance timeline owns the panel, lines and labels so they restart together.
  cutawayEntry.entrance = gsap.timeline({ paused: true })
    .add(cutawayEntry.entrance.paused(false), 0)
    .add(annotations.paused(false), 0.2);
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
  rolamentos: {
    title: "Rolamentos",
    description: "A linha SKF reúne diferentes geometrias para apoiar eixos em movimento. A seleção considera carga, rotação, temperatura, lubrificação e condições do ambiente.",
    applications: "Motores, redutores, bombas, transportadores e equipamentos agrícolas, conforme o dimensionamento de cada conjunto."
  },
  mancais: {
    title: "Mancais",
    description: "Os mancais alojam e apoiam o rolamento, ajudando a manter o eixo posicionado e facilitando a instalação e a manutenção do conjunto.",
    applications: "Eixos de transportadores, ventiladores, linhas de produção e máquinas agrícolas."
  },
  vedacoes: {
    title: "Vedações",
    description: "Vedações ajudam a reter o lubrificante e a limitar a entrada de água, poeira e outras partículas. Perfil e material devem acompanhar as condições de trabalho.",
    applications: "Conjuntos rotativos expostos a contaminantes, umidade ou exigências específicas de vedação."
  },
  lubrificacao: {
    title: "Lubrificação SKF SYSTEM 24",
    description: "Lubrificadores automáticos de ponto único entregam pequenas quantidades de graxa ou óleo de modo regular, reduzindo a dependência da aplicação manual.",
    applications: "Pontos de lubrificação em motores, bombas, ventiladores, transportadores e mancais."
  },
  graxas: {
    title: "Graxas SKF",
    description: "A graxa correta depende da velocidade, carga, temperatura e exposição do equipamento. A escolha do produto e do intervalo de relubrificação caminham juntas.",
    applications: "Rolamentos industriais e agrícolas sujeitos a diferentes condições de operação."
  },
  mapro: {
    title: "Ferramentas MAPRO",
    description: "Ferramentas de manutenção SKF apoiam montagem, desmontagem, alinhamento e lubrificação com procedimentos mais controlados.",
    applications: "Oficinas de manutenção e equipes que instalam ou substituem rolamentos e componentes associados."
  },
  "solid-oil": {
    title: "Rolamentos Solid Oil",
    description: "O Solid Oil incorpora lubrificante em uma matriz polimérica dentro do rolamento. É uma alternativa para aplicações em que água e contaminantes desafiam a lubrificação convencional.",
    applications: "Ambientes úmidos ou sujeitos à contaminação, após avaliação das condições da aplicação."
  },
  correntes: {
    title: "Correntes SKF",
    description: "Correntes transmitem movimento e potência entre rodas dentadas. Dimensionamento, lubrificação e ambiente de operação orientam a seleção.",
    applications: "Sistemas de transmissão e transporte em máquinas industriais e agrícolas."
  },
  sensorizadas: {
    title: "Unidades sensorizadas",
    description: "Unidades com sensores integram apoio mecânico e coleta de sinais da operação. A configuração depende do equipamento e dos dados que precisam ser acompanhados.",
    applications: "Conjuntos que exigem informação integrada para controle ou monitoramento."
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
    productDialog.querySelector("#product-dialog-applications").textContent = detail.applications;
    productDialog.showModal();
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

  function selectBranch(key) {
    const branch = branches[key];
    if (!branch) return;
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
    control.addEventListener("click", () => selectBranch(control.dataset.branch));
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
      selectBranch(tabs[next].dataset.branch);
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
        path.addEventListener("click", () => selectBranch(key));
        path.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectBranch(key);
          }
        });
      });

      map.replaceChild(svg, map.querySelector(".branch-map-fallback"));
      selectBranch(selectedBranch);
    })
    .catch(() => {});

  selectBranch("poa");
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
