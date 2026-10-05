(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Preloader
  const preloader = $("#preloader");
  const hidePreloader = () => preloader && preloader.classList.add("done");
  window.addEventListener("load", () => setTimeout(hidePreloader, 400));
  setTimeout(hidePreloader, 1500);

  // Profile image fallback (shows "SA" if the photo is missing)
  const img = $("#profileImg");
  if (img) {
    img.addEventListener("error", () => img.classList.add("hidden"));
    if (img.complete && img.naturalWidth === 0) img.classList.add("hidden");
  }

  // Theme
  const themeBtn = $("#themeToggle");
  const applyTheme = (t) => {
    root.setAttribute("data-theme", t);
    if (themeBtn) themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("theme", t); } catch (e) { /* storage unavailable */ }
  };
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { /* ignore */ }
  root.setAttribute("data-theme", saved || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  if (themeBtn) {
    themeBtn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    themeBtn.addEventListener("click", () => applyTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  }

  // Mobile menu
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  const setMenu = (open) => {
    if (!menuBtn || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  if (menuBtn) menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$("#navLinks a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Header blur, back-to-top
  const header = $("#siteHeader"), toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 20);
    if (toTop) toTop.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal, counters, active nav
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target) || reduceMotion) return;
    const decimals = parseInt(el.dataset.decimals || "0", 10), suffix = el.dataset.suffix || "";
    const start = performance.now(), dur = 1200;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = (target * p).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add("visible");
        $$("[data-count]", en.target).forEach(animateCount);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    $$(".reveal").forEach((el) => io.observe(el));

    const links = $$("#navLinks a");
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => spy.observe(s));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("visible"));
  }

  // Project filter
  const filters = $$(".filter"), projects = $$(".project");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    const f = btn.dataset.filter;
    projects.forEach((p) => {
      const show = f === "all" || p.dataset.category.split(" ").includes(f);
      if (show) { p.hidden = false; requestAnimationFrame(() => p.classList.remove("out")); }
      else { p.classList.add("out"); setTimeout(() => { if (p.classList.contains("out")) p.hidden = true; }, reduceMotion ? 0 : 300); }
    });
  }));

  // Contact form (frontend only, opens the user's email app)
  const form = $("#contactForm");
  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#name").value.trim(), email = $("#email").value.trim(), msg = $("#message").value.trim();
    const set = (id, t) => { const el = $(id); if (el) el.textContent = t; };
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    set("#nameErr", name ? "" : "Please enter your name.");
    set("#emailErr", okEmail ? "" : "Please enter a valid email address.");
    set("#msgErr", msg ? "" : "Please write a message.");
    if (!name || !okEmail || !msg) { set("#formStatus", ""); return; }
    const body = encodeURIComponent(`${msg}\n\nFrom: ${name} (${email})`);
    window.location.href = `mailto:amulyasamalla0804@gmail.com?subject=${encodeURIComponent("Portfolio message from " + name)}&body=${body}`;
    set("#formStatus", "Thanks! Your email app should open with the message ready to send.");
    form.reset();
  });
})();
