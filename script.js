const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function fallbackReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function initCinematicMotion() {
  if (!window.gsap || !window.ScrollTrigger || reduceMotion) {
    fallbackReveal();
    return;
  }

  document.body.classList.add("gsap-ready");
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });

  gsap.set(".reveal", { autoAlpha: 0, y: 34 });
  gsap.set(".bearing-showcase", { scale: 0.88, y: 24 });
  gsap.set(".technical-card", { autoAlpha: 0, y: 18 });

  const heroTimeline = gsap.timeline();
  heroTimeline
    .to(".hero-copy", { autoAlpha: 1, y: 0, duration: 0.9 })
    .to(".hero-visual", { autoAlpha: 1, y: 0, duration: 0.9 }, "<0.06")
    .to(".bearing-showcase", { y: 0, scale: 1, duration: 1.1 }, "<0.12")
    .to(".technical-card", { y: 0, autoAlpha: 1, duration: 0.7 }, "<0.25");

  ScrollTrigger.batch(".reveal:not(.hero-copy):not(.hero-visual)", {
    start: "top 82%",
    batchMax: 4,
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        stagger: { each: 0.06, from: "start" },
        overwrite: true
      });
    }
  });

  gsap.utils.toArray(".cinema-product").forEach((card, index) => {
    const image = card.querySelector("img");
    gsap.to(image, {
      y: index % 2 === 0 ? -34 : -18,
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.1
      }
    });
  });

  gsap.to(".application-panel", {
    y: -18,
    stagger: 0.12,
    ease: "none",
    scrollTrigger: {
      trigger: ".applications",
      start: "top bottom",
      end: "bottom top",
      scrub: 1
    }
  });

  const visibleGuides = document.querySelector(
    window.matchMedia("(max-width: 640px)").matches
      ? ".diagram-lines-mobile"
      : ".diagram-lines-desktop"
  );
  const guidePaths = gsap.utils.toArray(visibleGuides.querySelectorAll("path"));
  const guideDots = gsap.utils.toArray(visibleGuides.querySelectorAll("circle"));

  guidePaths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });
  gsap.set(guideDots, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });

  gsap.timeline({
    scrollTrigger: { trigger: ".cutaway", start: "top 72%", once: true }
  })
    .to(guidePaths, { strokeDashoffset: 0, duration: 0.65, stagger: 0.1, ease: "power2.out" })
    .to(guideDots, { autoAlpha: 1, scale: 1, duration: 0.2, stagger: 0.1 }, "<0.2");

  gsap.utils.toArray(".float-shape").forEach((shape, index) => {
    const drift = gsap.to(shape, {
      y: index % 2 === 0 ? -18 : 14,
      rotation: "+=6",
      duration: 4 + index * 0.45,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      paused: true
    });

    ScrollTrigger.create({
      trigger: shape.closest("section"),
      start: "top bottom",
      end: "bottom top",
      onEnter: () => drift.play(),
      onLeave: () => drift.pause(),
      onEnterBack: () => drift.play(),
      onLeaveBack: () => drift.pause()
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

initCinematicMotion();

const branches = {
  poa: {
    stateCode: "43",
    state: "Rio Grande do Sul",
    name: "Matriz Porto Alegre",
    address: "Rua Santos Dumont, 1000, bairro São Geraldo\nPorto Alegre - RS, CEP 90230-240",
    phone: "(51) 3337-8477",
    phoneHref: "tel:+555133378477",
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
    email: "goiania@sueca.com.br",
    mapsQuery: "Avenida Castelo Branco 4770 Goiânia GO"
  }
};

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
      selectBranch("poa");
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

  window.open(`https://wa.me/5551981221367?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
