/* ==========================================================================
   DURALUMIN — interactions (shared by every page; each feature is guarded)
   ========================================================================== */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);

  /* ---------- Split words ---------- */
  function splitWords(el, baseDelay = 0, step = 0.08) {
    const nodes = [...el.childNodes];
    el.textContent = "";
    let i = 0;
    nodes.forEach((node) => {
      const wrapper = node.nodeType === 1 ? node.cloneNode(false) : null;
      const target = wrapper || el;
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return target.appendChild(document.createTextNode(" "));
        const w = document.createElement("span");
        w.className = "w";
        w.textContent = part;
        w.style.transitionDelay = `${baseDelay + i++ * step}s`;
        target.appendChild(w);
      });
      if (wrapper) el.appendChild(wrapper);
    });
  }
  $$("h1 .split").forEach((el, i) => splitWords(el, 0.15 + i * 0.22));

  /* ---------- Page start (preloader on the home page only) ---------- */
  let pageStart = 0;
  const startPage = () => { document.body.classList.add("ready"); pageStart = performance.now(); };
  const loader = $("#loader");
  if (loader) {
    document.body.classList.add("loading");
    $$(".loader__word span").forEach((s, i) => s.style.setProperty("--i", i));
    const line = $("#loaderLine");
    const t0 = performance.now();
    const DURATION = reduced ? 200 : 1500;
    (function tick(now) {
      const p = Math.min((now - t0) / DURATION, 1);
      line.style.transform = `scaleX(${easeOut(p)})`;
      if (p < 1) return requestAnimationFrame(tick);
      loader.classList.add("done");
      document.body.classList.remove("loading");
      setTimeout(startPage, 200);
      setTimeout(() => loader.remove(), 1300);
    })(t0);
  } else {
    requestAnimationFrame(() => setTimeout(startPage, 60));
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    $$("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => (el.style.transform = ""));
    });
  }

  /* ---------- Nav, progress, mobile menu ---------- */
  const nav = $("#nav");
  const progress = $("#progress");
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    nav?.classList.toggle("scrolled", y > 40);
    nav?.classList.toggle("hide", y > lastY && y > 500);
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  burger?.addEventListener("click", () => { burger.classList.toggle("open"); menu.classList.toggle("open"); });
  $$("a", menu || document.createElement("div")).forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); menu.classList.remove("open"); }));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal-up").forEach((el) => {
    const siblings = $$(":scope > .reveal-up", el.parentElement);
    const idx = siblings.indexOf(el);
    const inHero = el.closest(".hero, .page-hero");
    el.style.setProperty("--d", inHero ? `${0.6 + idx * 0.12}s` : `${Math.min(idx, 8) * 0.08}s`);
    io.observe(el);
  });

  /* ---------- Number counters ---------- */
  function animateNumber(el, to, decimals = 0, dur = 1600, suffix = "", prefix = "") {
    const from = parseFloat(el.textContent.replace(/[^\d.]/g, "")) || 0;
    const start = performance.now();
    (function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const v = from + (to - from) * (1 - Math.pow(1 - p, 4));
      el.textContent = prefix + (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const d = en.target.dataset;
      setTimeout(() => animateNumber(en.target, parseFloat(d.count), +(d.decimals || 0), 2000, d.suffix || "", d.prefix || ""), en.target.closest(".page-hero") ? 700 : 0);
      statIO.unobserve(en.target);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => statIO.observe(el));

  /* ---------- Hero: 3D door ---------- */
  const door = $("#door3d");
  if (door) {
    const stage = $("#stage");
    const hero = $(".hero");
    const FINISHES = [
      { key: "oak", name: "Natural oak", swatch: "#a8743f",
        leaf: "repeating-linear-gradient(92deg, rgba(70,40,15,0) 0 7px, rgba(70,40,15,.12) 7px 8px, rgba(70,40,15,0) 8px 15px), linear-gradient(100deg, #b98551, #9a6a3c 45%, #b07c49 70%, #8f6136)",
        frame: "linear-gradient(135deg, #4a4642, #2c2a27 50%, #3d3a36)" },
      { key: "anthracite", name: "Anthracite grey", swatch: "#3b3e42",
        leaf: "repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 4px), linear-gradient(100deg, #50555b, #33363a 50%, #464a4f)",
        frame: "linear-gradient(135deg, #2c2d2f, #1b1c1d 50%, #27282a)" },
      { key: "bronze", name: "Brushed bronze", swatch: "#9a6b3c",
        leaf: "repeating-linear-gradient(90deg, rgba(255,255,255,.07) 0 1px, transparent 1px 3px), linear-gradient(110deg, #c9965c, #8c5a2b 40%, #b98450 65%, #6e431d)",
        frame: "linear-gradient(135deg, #5a3d22, #3a2614 50%, #4c331c)" },
      { key: "sage", name: "Sage green", swatch: "#7d8b74",
        leaf: "linear-gradient(100deg, #8a987f, #6c7a63 50%, #7f8d75)",
        frame: "linear-gradient(135deg, #4a4642, #2c2a27 50%, #3d3a36)" },
      { key: "white", name: "Chalk white", swatch: "#ece8e1",
        leaf: "linear-gradient(100deg, #f5f2ec, #dcd7ce 50%, #ece8e1)",
        frame: "linear-gradient(135deg, #d6d2cb, #b8b3aa 50%, #cbc6be)" },
    ];
    const tex = $("#dTex");
    const btns = $("#finishBtns");
    let finish = -1;
    function setFinish(i) {
      if (i === finish) return;
      finish = i;
      const f = FINISHES[i];
      const layer = document.createElement("div");
      layer.style.background = f.leaf;
      tex.appendChild(layer);
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("on")));
      setTimeout(() => $$(":scope > div", tex).slice(0, -1).forEach((o) => o.remove()), 1100);
      door.style.setProperty("--leaf", f.leaf);
      door.style.setProperty("--frame", f.frame);
      $("#finishName").textContent = f.name;
      $$("button", btns).forEach((b, j) => b.classList.toggle("active", j === i));
    }
    FINISHES.forEach((f, i) => {
      const b = document.createElement("button");
      b.style.setProperty("--c", f.swatch);
      b.setAttribute("aria-label", f.name);
      b.addEventListener("click", () => setFinish(i));
      btns.appendChild(b);
    });
    setFinish(0);

    const s = { open: 0, vel: 0, mx: 0, my: 0, tmx: 0, tmy: 0, hover: false };
    if (finePointer) {
      addEventListener("mousemove", (e) => {
        s.tmx = (e.clientX / innerWidth - 0.5) * 2;
        s.tmy = (e.clientY / innerHeight - 0.5) * 2;
      });
      door.addEventListener("mouseenter", () => (s.hover = true));
      door.addEventListener("mouseleave", () => (s.hover = false));
    } else {
      $("#stageHint").lastChild.textContent = "Tap to open the door";
      door.addEventListener("click", () => (s.hover = !s.hover));
    }

    let heroVisible = true;
    new IntersectionObserver(([e]) => (heroVisible = e.isIntersecting)).observe(hero);
    (function loop(now) {
      requestAnimationFrame(loop);
      if (!heroVisible) return;
      const t = pageStart ? (now - pageStart) / 1000 : 0;
      const intro = !pageStart || t < 1 ? 0 : t < 2.8 ? 0.62 : 0.1;   // swing open, then rest slightly ajar
      const scrollP = clamp(scrollY / (hero.offsetHeight * 0.6));
      const target = s.hover ? 0.95 : Math.max(intro, scrollP * 0.95);
      s.vel += (target - s.open) * 0.04;                               // springy swing
      s.vel *= 0.85;
      s.open = clamp(s.open + s.vel, -0.04, 1.04);
      s.mx = lerp(s.mx, s.tmx, 0.05);
      s.my = lerp(s.my, s.tmy, 0.05);
      const ry = -24 + s.mx * 22 + Math.sin(now / 2400) * 3 - scrollP * 8;
      const rx = 5 - s.my * 7;
      door.style.setProperty("--open", s.open.toFixed(4));
      door.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(${Math.sin(now / 1500) * 6}px)`;
    })(0);
  }

  /* ---------- Materials lab ---------- */
  if ($("#labTabs")) {
    const MATERIALS = [
      { key: "aluminium", name: "Aluminium", u: 0.8, glow: "rgba(255,255,255,.75)",
        desc: "Strong, slim and powder-coated in any colour you like. Ideal for large glass doors and modern homes.",
        bars: { Insulation: 82, Strength: 96, "Slim frames": 98, "Low maintenance": 92 },
        chips: ["Any RAL colour", "Two-tone options", "40-year lifespan", "Fully recyclable"] },
      { key: "upvc", name: "uPVC", u: 1.2, glow: "rgba(255,255,255,.8)",
        desc: "Warm, quiet and great value. Available in smooth white, colours and realistic woodgrain finishes.",
        bars: { Insulation: 88, Strength: 70, "Slim frames": 60, "Low maintenance": 95 },
        chips: ["A++ energy rated", "Woodgrain foils", "Best value", "Wipe-clean"] },
      { key: "timber", name: "Timber", u: 0.9, glow: "rgba(240,200,150,.7)",
        desc: "FSC-certified oak and engineered softwoods, factory finished. Natural warmth with modern performance.",
        bars: { Insulation: 90, Strength: 80, "Slim frames": 66, "Low maintenance": 62 },
        chips: ["FSC certified", "Heritage approved", "Factory finished", "Natural material"] },
      { key: "composite", name: "Composite", u: 1.0, glow: "rgba(200,215,205,.7)",
        desc: "A solid insulated core with a tough outer skin. Won't warp, fade or rot — perfect for front doors.",
        bars: { Insulation: 86, Strength: 92, "Slim frames": 64, "Low maintenance": 97 },
        chips: ["Won't warp", "Solid core", "Smart locks", "PAS 24 secure"] },
      { key: "steel", name: "Steel", u: 1.4, glow: "rgba(220,220,220,.7)",
        desc: "Ultra-slim steel profiles for the classic heritage look — beautiful in period homes and modern lofts.",
        bars: { Insulation: 64, Strength: 100, "Slim frames": 100, "Low maintenance": 80 },
        chips: ["Heritage style", "Galvanised", "Internal screens", "Fire-rated options"] },
      { key: "bronze", name: "Bronze", u: 1.1, glow: "rgba(235,200,150,.7)",
        desc: "Architectural bronze that develops a rich patina over time. For truly special, one-off projects.",
        bars: { Insulation: 76, Strength: 94, "Slim frames": 90, "Low maintenance": 85 },
        chips: ["Living finish", "Bespoke", "Marine grade", "Lasts generations"] },
    ];
    const tabs = $("#labTabs");
    const swatchOuter = $(".swatch__outer");
    const swatchInner = $(".swatch__inner");
    const labVisual = $(".lab__visual");
    let current = -1, uAnim;
    MATERIALS.forEach((m, i) => {
      const b = document.createElement("button");
      b.className = "lab__tab";
      b.setAttribute("role", "tab");
      b.innerHTML = `<i class="tex-${m.key}" style="background:var(--tex)"></i>${m.name}`;
      b.addEventListener("click", () => setMaterial(i));
      tabs.appendChild(b);
    });
    const wipe = (target, cls) => {
      const layer = document.createElement("div");
      layer.className = `mat-layer ${cls}`;
      target.appendChild(layer);
      requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("on")));
      const old = $$(".mat-layer", target).slice(0, -1);
      setTimeout(() => old.forEach((o) => o.remove()), 1200);
    };
    const bars = $("#labBars");
    bars.innerHTML = Object.keys(MATERIALS[0].bars).map((k) => `
      <div class="bar"><div class="bar__top"><span>${k}</span><span class="bar__val">0</span></div>
      <div class="bar__track"><div class="bar__fill"></div></div></div>`).join("");
    function setMaterial(i) {
      if (i === current) return;
      current = i;
      const m = MATERIALS[i];
      $$(".lab__tab", tabs).forEach((t, j) => t.classList.toggle("active", j === i));
      wipe(swatchOuter, `tex-${m.key}`);
      setTimeout(() => wipe(swatchInner, `tex-${m.key}`), 150);
      labVisual.style.setProperty("--glow", m.glow);
      $("#labIndex").textContent = `${String(i + 1).padStart(2, "0")} / ${String(MATERIALS.length).padStart(2, "0")}`;
      ["#labName", "#labDesc"].forEach((sel) => { const el = $(sel); el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); });
      $("#labName").textContent = m.name;
      $("#labDesc").textContent = m.desc;
      Object.values(m.bars).forEach((v, j) => {
        const bar = bars.children[j];
        $(".bar__fill", bar).style.width = `${v}%`;
        animateNumber($(".bar__val", bar), v, 0, 900);
      });
      $("#labChips").innerHTML = m.chips.map((c, j) => `<span style="animation-delay:${j * 0.07}s">${c}</span>`).join("");
      cancelAnimationFrame(uAnim);
      const uEl = $("#uValue");
      const from = parseFloat(uEl.textContent) || 0;
      const start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / 900, 1);
        uEl.textContent = (from + (m.u - from) * easeOut(p)).toFixed(2);
        if (p < 1) uAnim = requestAnimationFrame(step);
      })(start);
    }
    setMaterial(0);
    let autoCycle;
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return;
      autoCycle = setInterval(() => setMaterial((current + 1) % MATERIALS.length), 5000);
      obs.disconnect();
    }, { threshold: 0.3 }).observe($(".lab"));
    tabs.addEventListener("click", () => clearInterval(autoCycle));
  }

  /* ---------- Window / door type cards: auto-play on touch screens ---------- */
  if (!finePointer) {
    const playIO = new IntersectionObserver((entries) => entries.forEach((en) => en.target.classList.toggle("play", en.isIntersecting)), { threshold: 0.6 });
    $$(".type").forEach((t) => playIO.observe(t));
  }

  /* ---------- Front door designer ---------- */
  const dd = $("#dd");
  if (dd) {
    const COLORS = [
      ["Chartwell green", "#2f3b33", 0], ["Anthracite grey", "#383b3f", 0], ["Jet black", "#1b1b1c", 0],
      ["Duck-egg blue", "#8fa9ad", 60], ["Sage", "#8a977f", 60], ["Oxblood", "#5b2626", 60],
      ["Natural oak", "#a8743f", 180], ["Cream", "#ece4d1", 0],
    ];
    const PRICES = { glass: { none: 0, slot: 120, top: 180, full: 420 }, handle: { bar: 90, lever: 0, knob: 0 }, finish: { steel: 0, black: 40, brass: 120 } };
    const state = { color: 0, glass: "slot", handle: "bar", finish: "steel" };
    const colorWrap = $("#ddColors");
    const priceEl = $("#ddPrice");
    const leaf = $(".dd__leaf", dd);
    const update = () => {
      const [name, hex, extra] = COLORS[state.color];
      leaf.style.setProperty("--dd-color", hex);
      leaf.style.background = state.color === 6 ? `repeating-linear-gradient(92deg, rgba(70,40,15,0) 0 7px, rgba(70,40,15,.14) 7px 8px, rgba(70,40,15,0) 8px 15px), ${hex}` : hex;
      $("#ddColorName").textContent = name;
      dd.dataset.glass = state.glass;
      dd.dataset.handle = state.handle;
      dd.dataset.finish = state.finish;
      const price = 2240 + extra + PRICES.glass[state.glass] + PRICES.handle[state.handle] + PRICES.finish[state.finish];
      const from = parseInt(priceEl.textContent.replace(/\D/g, "")) || price;
      const start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / 600, 1);
        priceEl.textContent = "£" + Math.round(from + (price - from) * easeOut(p)).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      })(start);
      dd.classList.remove("pulse"); void dd.offsetWidth; dd.classList.add("pulse");
    };
    COLORS.forEach(([name, hex], i) => {
      const b = document.createElement("button");
      b.style.setProperty("--c", hex);
      b.setAttribute("aria-label", name);
      if (i === 0) b.classList.add("active");
      b.addEventListener("click", () => {
        state.color = i;
        $$("button", colorWrap).forEach((x) => x.classList.toggle("active", x === b));
        update();
      });
      colorWrap.appendChild(b);
    });
    $$(".segmented").forEach((group) => {
      $$("button", group).forEach((b) => b.addEventListener("click", () => {
        state[group.dataset.opt] = b.dataset.v;
        $$("button", group).forEach((x) => x.classList.toggle("active", x === b));
        update();
      }));
    });
    update();
  }

  /* ---------- Compare table ---------- */
  const compare = $("#compare");
  if (compare) {
    $$("td[data-r]", compare).forEach((td, n) => {
      const r = +td.dataset.r;
      td.innerHTML = `<span class="dots">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < r ? "on" : ""}" style="transition-delay:${(n % 6) * 0.06 + i * 0.05}s"></i>`).join("")}</span>`;
    });
  }

  /* ---------- Colour palette ---------- */
  const palette = $("#palette");
  if (palette) {
    const RAL = [
      ["7016", "Anthracite", "#383e42"], ["9005", "Jet black", "#0e0e10"], ["9016", "Traffic white", "#f1f0ea", 1], ["9001", "Cream", "#e9e0d2", 1],
      ["7035", "Light grey", "#cbd0cc", 1], ["7039", "Quartz grey", "#6c6960"], ["7022", "Umbra grey", "#4b4d46"], ["6021", "Pale green", "#89ac76"],
      ["6009", "Fir green", "#27352a"], ["5011", "Steel blue", "#1a2b3c"], ["5014", "Pigeon blue", "#606e8c"], ["3005", "Wine red", "#59191f"],
      ["8019", "Grey brown", "#403a3a"], ["1015", "Light ivory", "#e6d2b5", 1], ["8014", "Sepia", "#4a3526"], ["—", "Natural oak", "#a8743f"],
    ];
    palette.innerHTML = RAL.map(([code, name, hex, light]) =>
      `<div class="chip reveal-up" style="--c:${hex};${light ? "--tc:#1c1b19" : ""}"><b>${name}</b><span>RAL ${code}</span></div>`).join("");
    $$(".chip", palette).forEach((el, i) => { el.style.setProperty("--d", `${(i % 8) * 0.05}s`); io.observe(el); });
  }

  /* ---------- Projects filter ---------- */
  const filters = $("#filters");
  if (filters) {
    const items = $$("#gallery .project");
    $$("button", filters).forEach((b) => {
      const f = b.dataset.f;
      const n = f === "all" ? items.length : items.filter((it) => it.dataset.cat === f).length;
      b.insertAdjacentHTML("beforeend", `<sup>${n}</sup>`);
      b.addEventListener("click", () => {
        $$("button", filters).forEach((x) => x.classList.toggle("active", x === b));
        items.forEach((it) => {
          const show = f === "all" || it.dataset.cat === f;
          if (show) {
            it.classList.remove("gone");
            requestAnimationFrame(() => requestAnimationFrame(() => it.classList.remove("out")));
          } else {
            it.classList.add("out");
            setTimeout(() => it.classList.contains("out") && it.classList.add("gone"), 450);
          }
        });
        setTimeout(() => window.ScrollTrigger?.refresh(), 500);
      });
    });
  }

  /* ---------- FAQ accordion (animated) ---------- */
  $$(".faq details").forEach((d) => {
    const body = $(".faq__body", d);
    $("summary", d).addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        body.animate([{ height: `${body.scrollHeight}px` }, { height: "0px" }], { duration: 450, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => (d.open = false);
      } else {
        d.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: `${body.scrollHeight}px`, opacity: 1 }], { duration: 550, easing: "cubic-bezier(.22,1,.36,1)" });
      }
    });
  });

  /* ---------- Testimonials ---------- */
  const qText = $("#quoteText");
  if (qText) {
    const QUOTES = [
      ["“Beautiful sliding doors, fitted in a day, and the team left the house cleaner than they found it.”", "Hannah R. — Harrogate"],
      ["“They replaced every window in a live office building without a single day of disruption.”", "Marcus O. — Northgate offices"],
      ["“Oak and steel that look like they've always been part of the barn. Real craftsmanship.”", "Elena & Tom — Millbrook"],
    ];
    const quote = $(".quote");
    const dots = $("#quoteDots");
    let qi = 0, qTimer;
    QUOTES.forEach((_, i) => {
      const b = document.createElement("button");
      b.setAttribute("aria-label", `Testimonial ${i + 1}`);
      b.addEventListener("click", () => showQuote(i));
      dots.appendChild(b);
    });
    function showQuote(i) {
      qi = i;
      quote.classList.add("fade");
      qText.classList.remove("show");
      setTimeout(() => {
        qText.textContent = QUOTES[i][0];
        splitWords(qText, 0, 0.035);
        $("#quoteCite").textContent = QUOTES[i][1];
        quote.classList.remove("fade");
        requestAnimationFrame(() => requestAnimationFrame(() => qText.classList.add("show")));
      }, qText.textContent ? 500 : 0);
      $$("button", dots).forEach((d, j) => { d.classList.remove("active"); void d.offsetWidth; d.classList.toggle("active", j === i); });
      clearTimeout(qTimer);
      qTimer = setTimeout(() => showQuote((qi + 1) % QUOTES.length), 7000);
    }
    showQuote(0);
  }

  /* ---------- Quote forms ---------- */
  $$(".js-quote-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $('input[id="f-name"]', form), email = $('input[type="email"]', form);
      let ok = true;
      [[name, name.value.trim()], [email, /^\S+@\S+\.\S+$/.test(email.value)]].forEach(([el, valid]) => {
        el.parentElement.classList.toggle("error", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      $(".form__ok", form).classList.add("show");
      $("button[type=submit] span", form).textContent = "Request sent";
    });
  });

  /* ---------- Process steps (home) ---------- */
  const steps = $$(".pstep");
  const navItems = $$("#processNav li");
  const numStrip = $("#numStrip");
  let activeStep = -1;
  function setStep(i) {
    if (i === activeStep) return;
    activeStep = i;
    steps.forEach((st, j) => { st.classList.toggle("is-active", j === i); st.classList.toggle("is-past", j < i); });
    navItems.forEach((li, j) => li.classList.toggle("is-active", j === i));
    numStrip.style.transform = `translateY(${-i}em)`;
  }
  if (steps.length) setStep(0);

  /* ======================= GSAP-powered scroll effects ======================= */
  if (!window.gsap || !window.ScrollTrigger) return;
  document.documentElement.classList.add("has-gsap");
  gsap.registerPlugin(ScrollTrigger);

  if ($(".process")) {
    const draw = (sel) => {
      const el = $(sel);
      const len = el.getTotalLength();
      gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
    };
    draw("#laserH"); draw("#laserV"); draw("#blueFrame"); draw("#pSeal");
    gsap.set(".laser-points", { opacity: 0 });
    gsap.set("#pCorners path", { opacity: 0, scale: 0.4, transformOrigin: "50% 50%" });
    gsap.set("#dimH", { opacity: 0, scaleX: 0, transformOrigin: "50% 50%" });
    gsap.set("#dimV", { opacity: 0, scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set("#blueMull", { scaleY: 0, transformOrigin: "50% 0%" });
    gsap.set("#blueArc", { opacity: 0 });
    gsap.set("#pWin", { scale: 0.78, y: -26, rotation: -4, transformOrigin: "50% 50%" });
    gsap.set("#barT", { y: -200, opacity: 0 });
    gsap.set("#barB", { y: 200, opacity: 0 });
    gsap.set("#barL", { x: -200, opacity: 0 });
    gsap.set("#barR", { x: 200, opacity: 0 });
    gsap.set("#barM", { scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(["#pGlass", "#pHandle"], { opacity: 0 });
    gsap.set("#pGlass", { y: -40 });
    gsap.set("#pSill", { scaleX: 0, transformOrigin: "50% 50%" });
    gsap.set("#pScrews circle", { scale: 0, transformOrigin: "50% 50%" });
    gsap.set("#pSun", { y: 200, opacity: 0 });
    gsap.set("#pBadge", { scale: 0, rotation: -120, transformOrigin: "480px 150px" });

    const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(".laser-points", { opacity: 1, duration: 0.15 }, 0)
      .to("#laserH", { strokeDashoffset: 0, duration: 0.45 }, 0.05)
      .to("#laserV", { strokeDashoffset: 0, duration: 0.45 }, 0.25)
      .to("#pCorners path", { opacity: 1, scale: 1, stagger: 0.06, duration: 0.3, ease: "back.out(3)" }, 0.4)
      .to("#dimH", { opacity: 1, scaleX: 1, duration: 0.35 }, 0.55)
      .to("#dimV", { opacity: 1, scaleY: 1, duration: 0.35 }, 0.65)
      .to("#pLaser", { opacity: 0, duration: 0.3 }, 1.05)
      .to("#blueFrame", { strokeDashoffset: 0, duration: 0.6 }, 1.1)
      .to("#blueMull", { scaleY: 1, duration: 0.4 }, 1.45)
      .to("#blueArc", { opacity: 1, duration: 0.3 }, 1.65)
      .to("#pCorners", { opacity: 0, duration: 0.3 }, 1.7)
      .to("#pBlue", { opacity: 0.12, duration: 0.3 }, 2.05)
      .to("#barT", { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 2.1)
      .to("#barB", { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 2.18)
      .to("#barL", { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 2.26)
      .to("#barR", { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }, 2.34)
      .to("#barM", { scaleY: 1, duration: 0.35, ease: "power3.out" }, 2.55)
      .to("#pGlass", { opacity: 1, y: 0, duration: 0.35 }, 2.65)
      .to("#pHandle", { opacity: 1, duration: 0.2 }, 2.85)
      .to("#pBlue", { opacity: 0, duration: 0.2 }, 3.0)
      .to("#pWin", { scale: 1, y: 0, rotation: 0, duration: 0.6, ease: "power3.inOut" }, 3.05)
      .to("#pSill", { scaleX: 1, duration: 0.35, ease: "power3.out" }, 3.5)
      .to("#pSeal", { strokeDashoffset: 0, duration: 0.45 }, 3.55)
      .to("#pScrews circle", { scale: 1, stagger: 0.04, duration: 0.2, ease: "back.out(4)" }, 3.7)
      .to("#pDims", { opacity: 0, duration: 0.25 }, 3.75)
      .to("#pSky", { opacity: 1, duration: 0.45 }, 4.05)
      .to("#pSun", { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" }, 4.05)
      .to("#pHills", { opacity: 1, duration: 0.4 }, 4.25)
      .fromTo("#pGlint", { attr: { x: 100 } }, { attr: { x: 560 }, duration: 0.5 }, 4.3)
      .to("#pBadge", { scale: 1, rotation: 0, duration: 0.45, ease: "back.out(2)" }, 4.5)
      .to({}, { duration: 0.15 });

    const STEPS = 5;
    const processST = ScrollTrigger.create({
      trigger: ".process",
      pin: true,
      start: "top top",
      end: () => `+=${innerHeight * 4.5}`,
      scrub: 0.8,
      animation: tl,
      onUpdate: (self) => {
        setStep(Math.min(STEPS - 1, Math.floor(self.progress * STEPS * 0.999)));
        gsap.set("#processBar", { scaleX: self.progress });
      },
    });
    navItems.forEach((li, i) => {
      $("button", li).addEventListener("click", () => {
        window.scrollTo({ top: processST.start + (processST.end - processST.start) * ((i + 0.9) / STEPS), behavior: "smooth" });
      });
    });
  }

  // keep pinned positions right when content above changes height (fonts, dynamic panels)
  let refreshTimer;
  const sizes = new Map();
  const ro = new ResizeObserver((entries) => {
    let changed = false;
    entries.forEach((en) => {
      const h = Math.round(en.contentRect.height);
      if (sizes.has(en.target) && sizes.get(en.target) !== h) changed = true;
      sizes.set(en.target, h);
    });
    if (!changed) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
  });
  const sections = $$("main > section, main > div");
  const pinIdx = sections.indexOf($(".process"));
  (pinIdx >= 0 ? sections.slice(0, pinIdx) : []).forEach((el) => ro.observe(el));
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  if (reduced) return;

  // About timeline line draws as you scroll
  if ($("#timeline")) {
    gsap.to("#timeline .timeline__line i", { scaleY: 1, ease: "none", scrollTrigger: { trigger: "#timeline", start: "top 70%", end: "bottom 70%", scrub: true } });
  }
  // Page-hero "view" parallax
  $$(".view").forEach((v) => {
    gsap.to($$(".view__hill--1", v), { yPercent: -10, ease: "none", scrollTrigger: { trigger: v, scrub: true } });
    gsap.to($$(".view__hill--3", v), { yPercent: -30, ease: "none", scrollTrigger: { trigger: v, scrub: true } });
    gsap.fromTo(v, { scale: 0.94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: v, start: "top bottom", end: "top 30%", scrub: true } });
  });
  $$(".project__scene").forEach((sc) => {
    gsap.fromTo(sc, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: sc.parentElement, scrub: true } });
  });
  if ($(".marquee")) gsap.to(".marquee__track span:nth-of-type(odd)", { yPercent: -12, ease: "none", scrollTrigger: { trigger: ".marquee", scrub: true } });
  gsap.from(".footer__big", { yPercent: 40, opacity: 0, ease: "power3.out", scrollTrigger: { trigger: ".footer__big", start: "top 100%", end: "bottom bottom", scrub: 1 } });
})();
