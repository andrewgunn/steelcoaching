(() => {
  "use strict";

  // Set formEndpoint to a URL that accepts a JSON POST (e.g. a GoHighLevel inbound
  // webhook or Formspree) to capture leads directly. Left empty, the lead form
  // hands off to WhatsApp / email instead.
  const CONFIG = {
    formEndpoint: "",
    whatsapp: "447463865772",
    email: "enquiries@steelcoaching.co.uk",
  };

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} },
  };
  const fmt = (s, forceH = false) => {
    s = Math.round(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const mm = String(m).padStart(h || forceH ? 2 : 1, "0"), ss = String(sec).padStart(2, "0");
    return h || forceH ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  };
  const toast = (msg) => {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-on");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("is-on"), 2400);
  };

  $("#year").textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $(".nav"), burger = $(".nav__burger"), menu = $("#mobile-menu"), dock = $("#dock");
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-solid", y > 40 || !menu.hidden);
    const bookTop = $("#book").getBoundingClientRect().top;
    dock.classList.toggle("is-on", y > innerHeight * 0.8 && bookTop > innerHeight * 0.5);
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const closeMenu = () => { menu.hidden = true; burger.setAttribute("aria-expanded", "false"); onScroll(); };
  burger.addEventListener("click", () => {
    const open = menu.hidden; menu.hidden = !open;
    burger.setAttribute("aria-expanded", String(open)); onScroll();
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- hero race clock ---------- */
  const clockNotes = [
    [0, "Laces tied. Start line ahead."],
    [20, "Half a sled push for most first-timers."],
    [60, "About the time of a fast farmers carry."],
    [150, "Roughly one compromised 1 km run."],
    [270, "A solid SkiErg, done."],
    [420, "That's 100 wall balls for a lot of racers."],
    [600, "You're properly invested now. Book that call?"],
  ];
  const start = Date.now(), clockEl = $("#clock"), noteEl = $("#clock-note");
  setInterval(() => {
    const s = (Date.now() - start) / 1000;
    clockEl.textContent = fmt(s);
    noteEl.textContent = clockNotes.filter(([t]) => s >= t).pop()[1];
  }, 1000);

  /* ---------- race explorer ---------- */
  const STATIONS = [
    { name: "SkiErg", dist: "1,000 m", img: "bike-coach", w: null,
      tip: "Drive from the hips, not the arms. Hold a pace you could repeat; a flat-out ski costs you the next run." },
    { name: "Sled push", dist: "50 m", img: "deadlift-women",
      w: { WO: "102 kg", MO: "152 kg", WP: "152 kg", MP: "202 kg" }, wl: "Sled total",
      tip: "Low hips, arms locked, short fast steps. Never stop: restarting a heavy sled costs more than slowing down." },
    { name: "Sled pull", dist: "50 m", img: "band-coach",
      w: { WO: "78 kg", MO: "103 kg", WP: "103 kg", MP: "153 kg" }, wl: "Sled total",
      tip: "Sit back and use your legs and bodyweight. Hand-over-hand rhythm, and keep the rope out of your feet." },
    { name: "Burpee broad jumps", dist: "80 m", img: "one-to-one", w: null,
      tip: "Step up instead of jumping up when tired. Find a rhythm you can hold for the full 80 metres." },
    { name: "Row", dist: "1,000 m", img: "gym-floor", w: null,
      tip: "Legs, body, arms. Treat it as active recovery: a steady split sets you up for the carry." },
    { name: "Farmers carry", dist: "200 m", img: "deadlift-green",
      w: { WO: "2 × 16 kg", MO: "2 × 24 kg", WP: "2 × 24 kg", MP: "2 × 32 kg" }, wl: "Kettlebells",
      tip: "Grip is the limiter. Shoulders packed, brisk walk or jog, and only put them down if you have to." },
    { name: "Sandbag lunges", dist: "100 m", img: "squat-rack",
      w: { WO: "10 kg", MO: "20 kg", WP: "20 kg", MP: "30 kg" }, wl: "Sandbag",
      tip: "Back knee touches the floor every rep. Keep a steady cadence. Your legs need to survive one more station." },
    { name: "Wall balls", dist: "100 reps", img: "barbell-coach",
      w: { WO: "4 kg · 2.7 m", MO: "6 kg · 3 m", WP: "6 kg · 2.7 m", MP: "9 kg · 3 m" }, wl: "Ball · target",
      tip: "Break early into sets you can repeat. Going unbroken at rep 1 means long rests at rep 60." },
  ];
  const RUN = { name: "1 km run", dist: "1,000 m", img: "run-coach", w: null,
    tip: "Compromised running: legs heavy from the station before. We train this so your pace holds from km 1 to km 8." };
  const SEGMENTS = STATIONS.flatMap((st, i) => [{ ...RUN, run: i + 1 }, { ...st, n: i + 1 }]);

  let div = store.get("sc-div") || "WO", seg = 1;
  const track = $("#track"), stationEl = $("#station");
  track.innerHTML = SEGMENTS.map((s, i) => `
    <li class="${s.run ? "run" : ""}"><button role="tab" aria-selected="false" data-i="${i}" aria-label="${s.run ? `Run ${s.run}` : `Station ${s.n}: ${s.name}`}">
      <span class="t-n">${s.run ? `R${s.run}` : s.n}</span><span class="t-l">${s.run ? "1 km" : s.name.replace("Burpee broad jumps", "Burpee BJ")}</span>
    </button></li>`).join("");

  const renderStation = () => {
    const s = SEGMENTS[seg];
    $$("button", track).forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.i === seg)));
    const specs = [`<div class="spec"><b>${s.dist}</b><span>${s.run ? "Distance" : s.name === "Wall balls" ? "Reps" : "Distance"}</span></div>`];
    if (s.w) specs.push(`<div class="spec"><b>${s.w[div]}</b><span>${s.wl}</span></div>`);
    specs.push(`<div class="spec"><b>${seg + 1}/16</b><span>Segment</span></div>`);
    stationEl.innerHTML = `
      <div class="station__img"><img src="assets/img/${s.img}-sm.jpg" alt="" loading="lazy"></div>
      <div class="station__body">
        <span class="station__num">${s.run ? `Run ${s.run} of 8` : `Station ${s.n} of 8`}</span>
        <h3>${s.name}</h3>
        <div class="specs">${specs.join("")}</div>
        <p class="tip"><strong>Coach's tip</strong>${s.tip}</p>
        <div class="station__nav">
          <button class="round" data-step="-1" aria-label="Previous segment">←</button>
          <button class="round" data-step="1" aria-label="Next segment">→</button>
        </div>
      </div>`;
  };
  track.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    seg = +b.dataset.i; renderStation();
  });
  stationEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    seg = (seg + +b.dataset.step + 16) % 16; renderStation();
  });
  track.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    seg = (seg + (e.key === "ArrowRight" ? 1 : -1) + 16) % 16; renderStation();
    $(`[data-i="${seg}"]`, track).focus();
  });

  const divTabs = $$("#race .seg button");
  const setDiv = (d) => {
    div = d; store.set("sc-div", d);
    divTabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.div === d)));
    renderStation();
  };
  divTabs.forEach((b) => b.addEventListener("click", () => { setDiv(b.dataset.div); pred.div = b.dataset.div; syncPredUI(); calc(); }));

  /* ---------- finish-time predictor ---------- */
  // Typical Men Open, "solid" athlete station times (seconds). Tuned to give
  // realistic finishes (~1:10 strong, ~1:30 average, ~1:50+ newcomer).
  const BASE = { ski: 285, push: 195, pull: 255, bbj: 270, row: 290, farm: 110, lunge: 270, wb: 330 };
  const NAMES = { ski: "SkiErg", push: "Sled push", pull: "Sled pull", bbj: "Burpee broad jumps", row: "Row", farm: "Farmers carry", lunge: "Sandbag lunges", wb: "Wall balls" };
  const STRENGTH = ["push", "pull", "farm", "lunge"];
  const DIVMULT = { WO: { s: 1.05, e: 1.12 }, MO: { s: 1, e: 1 }, WP: { s: 1.3, e: 1.12 }, MP: { s: 1.25, e: 1 } };
  const lvl = (l) => l <= 2 ? 1.35 - 0.35 * (l - 1) : 1 - 0.22 * (l - 2); // 1→1.35, 2→1.0, 3→0.78

  const model = ({ div, run, str, eng }) => {
    const dm = DIVMULT[div];
    const st = {};
    for (const k in BASE) {
      const isS = STRENGTH.includes(k);
      st[k] = BASE[k] * (isS ? dm.s * lvl(str) : dm.e * lvl(eng));
    }
    const pace = (run / 5) * (1.1 + (2 - eng) * 0.04);
    let runs = 0; for (let i = 0; i < 8; i++) runs += pace * (1 + 0.01 * i);
    const rox = 600 - 135 * ((str + eng) / 2 - 1);
    const stations = Object.values(st).reduce((a, b) => a + b, 0);
    return { st, runs, rox, stations, total: runs + stations + rox };
  };

  const qs = new URLSearchParams(location.search);
  const saved = store.get("sc-pred") || {};
  const pred = {
    div: qs.get("d") || saved.div || div,
    run: +(qs.get("r") || saved.run || 1620),
    str: +(qs.get("s") || saved.str || 2),
    eng: +(qs.get("e") || saved.eng || 2),
  };
  if (!DIVMULT[pred.div]) pred.div = "WO";
  let lastPred = null;

  const runIn = $("#run"), runOut = $("#run-out");
  const syncPredUI = () => {
    $$("[data-field]").forEach((g) => $$("button", g).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === String(pred[g.dataset.field])))));
    runIn.value = pred.run;
  };
  const calc = () => {
    const now = model(pred);
    const target = model({ ...pred, run: pred.run * 0.95, str: Math.min(3, pred.str + 0.6), eng: Math.min(3, pred.eng + 0.6) });
    const best = model({ ...pred, str: 3, eng: 3 });
    runOut.textContent = fmt(pred.run);
    runIn.style.setProperty("--p", ((pred.run - runIn.min) / (runIn.max - runIn.min)) * 100 + "%");
    $("#pred-time").textContent = fmt(now.total, true);
    $("#pred-target").textContent = fmt(target.total, true);
    $("#pred-save").textContent = "−" + fmt(now.total - target.total);
    const bar = $("#pred-bar").children;
    bar[0].style.flexGrow = now.runs; bar[1].style.flexGrow = now.stations; bar[2].style.flexGrow = now.rox;
    $("#sum-run").textContent = fmt(now.runs); $("#sum-st").textContent = fmt(now.stations); $("#sum-rox").textContent = fmt(now.rox);
    const sinks = Object.keys(BASE).map((k) => [k, now.st[k] - best.st[k]])
      .concat([["rox", now.rox - best.rox]]).sort((a, b) => b[1] - a[1]).slice(0, 3);
    $("#sinks").innerHTML = sinks.filter(([, v]) => v > 5).map(([k, v]) =>
      `<li><span>${k === "rox" ? "Roxzone transitions" : NAMES[k]}</span><span>+${fmt(v)} vs. strong</span></li>`).join("")
      || `<li><span>You're already strong everywhere. Now it's all about pacing.</span><span>🔥</span></li>`;
    lastPred = fmt(now.total, true);
    store.set("sc-pred", pred);
  };
  $$("[data-field]").forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const f = g.dataset.field; pred[f] = f === "div" ? b.dataset.v : +b.dataset.v;
    if (f === "div") setDiv(pred.div);
    syncPredUI(); calc();
  }));
  runIn.addEventListener("input", () => { pred.run = +runIn.value; calc(); });
  $("#pred-share").addEventListener("click", async () => {
    const url = `${location.origin}${location.pathname}?d=${pred.div}&r=${pred.run}&s=${pred.str}&e=${pred.eng}#predictor`;
    const text = `My predicted Hyrox finish: ${lastPred}. What's yours?`;
    if (navigator.share) { try { await navigator.share({ title: "Hyrox finish-time predictor", text, url }); return; } catch { return; } }
    try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Link copied. Challenge a mate!"); }
    catch { prompt("Copy your link:", url); }
  });

  setDiv(pred.div);
  syncPredUI(); calc();

  /* ---------- race countdown ---------- */
  const PHASES = [
    { key: "Base", from: Infinity, to: 16, focus: "Build the engine", text: "Lots of easy Zone 2 running, strength work and learning every station. Consistency beats intensity right now." },
    { key: "Build", from: 16, to: 8, focus: "Get strong, run more", text: "Heavier sled and lunge work, longer runs and your first runs-into-stations sessions." },
    { key: "Race-specific", from: 8, to: 3, focus: "Practise the race", text: "Compromised running, race-pace stations and a full or half simulation. Dial in your pacing and transitions." },
    { key: "Peak", from: 3, to: 1, focus: "Sharpen up", text: "Hardest race-pace work of the block, then start pulling volume back. Rehearse race-day fuel and kit." },
    { key: "Taper", from: 1, to: -1, focus: "Race week", text: "Less volume, keep some intensity, sleep loads. Walk through your race plan. You've done the work." },
  ];
  const cdForm = $("#cd-form"), cdCard = $("#cd-card"), cdDate = $("#cd-date"), cdName = $("#cd-name");
  cdDate.min = new Date().toISOString().slice(0, 10);
  const renderCountdown = () => {
    const r = store.get("sc-race");
    if (!r || !r.date) return;
    cdDate.value = r.date; cdName.value = r.name || "";
    const days = Math.ceil((new Date(r.date + "T09:00") - new Date()) / 864e5);
    const label = r.name ? r.name : "Your Hyrox";
    if (days < 0) {
      cdCard.innerHTML = `<span class="cd-race">${esc(label)}</span><div class="cd-big"><div><b>Done</b><span>Race complete</span></div></div>
        <div class="cd-focus"><h4>How did it go?</h4><p>Book a debrief with a coach. We'll look at your splits and plan your next PB.</p></div>
        <div class="cd-actions"><a href="#book" class="btn btn--sm">Book a debrief</a><button class="link" id="cd-clear">Set a new race</button></div>`;
    } else {
      const weeks = days / 7;
      const pi = PHASES.findIndex((p) => weeks <= p.from && weeks > p.to);
      const p = PHASES[pi < 0 ? 4 : pi];
      cdCard.innerHTML = `<span class="cd-race">${esc(label)} · ${new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        <div class="cd-big"><div><b>${days}</b><span>days</span></div><div><b>${Math.floor(weeks)}</b><span>weeks</span></div></div>
        <div class="phases">${PHASES.map((_, i) => `<span class="${i < pi ? "done" : i === pi ? "now" : ""}"></span>`).join("")}</div>
        <div class="phase-labels">${PHASES.map((x, i) => `<span class="${i === pi ? "now" : ""}">${x.key}</span>`).join("")}</div>
        <div class="cd-focus"><h4>This week: ${p.focus}</h4><p>${p.text}</p></div>
        <div class="cd-actions"><a href="#book" class="btn btn--sm">Get my ${Math.max(1, Math.floor(weeks))}-week plan</a><button class="link" id="cd-clear">Change race</button></div>`;
    }
    $("#cd-clear").addEventListener("click", () => { store.del("sc-race"); cdCard.innerHTML = `<div class="cd-empty"><img src="assets/img/mark.png" alt="" width="60" height="101"><p>Your race clock will appear here.</p></div>`; cdDate.focus(); });
    const ld = $("#lead-date"); if (ld && !ld.value) ld.value = r.date;
  };
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  cdForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!cdDate.value) return cdDate.focus();
    store.set("sc-race", { date: cdDate.value, name: cdName.value.trim() });
    renderCountdown(); toast("Race locked in. We'll remember it.");
  });
  renderCountdown();

  /* ---------- reviews carousel ---------- */
  const rev = $("#reviews");
  const page = (d) => rev.scrollBy({ left: d * rev.clientWidth * 0.9, behavior: "smooth" });
  $("#rev-prev").addEventListener("click", () => page(-1));
  $("#rev-next").addEventListener("click", () => page(1));

  /* ---------- lead form ---------- */
  const lead = $("#lead"), steps = $$(".lead__step", lead), answers = store.get("sc-lead") || {};
  let step = 1;
  const show = (n) => {
    step = n;
    steps.forEach((s) => s.classList.toggle("is-active", +s.dataset.step === n));
    $("#lead-bar").style.width = Math.min(100, n * 25) + "%";
    $("#lead-back").hidden = n === 1 || n === 5;
    $("#lead-count").textContent = n === 5 ? "" : `Step ${n} of 4`;
  };
  $$(".choices", lead).forEach((g) => {
    $$("button", g).forEach((b) => b.classList.toggle("is-picked", answers[g.dataset.name] === b.textContent));
    g.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      answers[g.dataset.name] = b.textContent; store.set("sc-lead", answers);
      $$("button", g).forEach((x) => x.classList.toggle("is-picked", x === b));
      const dl = $(".lead__date", lead), dn = $(".lead__date-next", lead);
      if (b.dataset.next === "date") { dl.hidden = dn.hidden = false; $("#lead-date").focus(); return; }
      if (g.dataset.name === "race") { dl.hidden = dn.hidden = true; }
      show(step + 1);
    });
  });
  $(".lead__date-next", lead).addEventListener("click", () => show(4));
  $("#lead-back").addEventListener("click", () => show(Math.max(1, step - 1)));
  $$("[data-goal]").forEach((a) => a.addEventListener("click", () => { answers.programme = a.dataset.goal; }));

  lead.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = lead.elements.name.value.trim(), contact = lead.elements.contact.value.trim();
    $("#lead-err").hidden = !!(name && contact);
    if (!name || !contact) return;
    const race = answers.race === "Yes, I've booked" && $("#lead-date").value
      ? `Booked for ${new Date($("#lead-date").value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
      : answers.race || "Not said";
    const data = { name, contact, goal: answers.goal || "", level: answers.level || "", race, programme: answers.programme || "", predicted: lastPred };
    const msg = [`Hi Steel Coaching! I'd like to book a free race-plan call.`,
      `Name: ${name}`, `Goal: ${data.goal}`, `Currently: ${data.level}`, `Race: ${race}`,
      data.programme && `Interested in: ${data.programme}`, `Predicted finish: ${lastPred}`, `Best contact: ${contact}`].filter(Boolean).join("\n");

    $("#done-name").textContent = name;
    $("#done-wa").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    $("#done-mail").href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Free race-plan call: " + name)}&body=${encodeURIComponent(msg)}`;

    if (CONFIG.formEndpoint) {
      try {
        const res = await fetch(CONFIG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        $(".lead__done h3").innerHTML = `You're in, ${esc(name)}!`;
        $("#done-msg").textContent = "A coach will be in touch within 24 hours to arrange your call. Want it faster? Message us now:";
      } catch { /* fall through to WhatsApp handoff */ }
    }
    show(5);
  });
  show(1);

  /* ---------- reveal on scroll ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".section__head, .why__card, .prog, .steps li, .review, .faq details, .pred > *, .countdown > *, .station, .lead").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }
})();
