// LUCID — static rebuild. Logic spec: docs/scoring-spec.md; copy: docs/copy-editorial.md.

// Thresholds calibrated by Monte Carlo over simulated selection behavior
// (docs/scoring-spec.md, "Calibration"): every pattern lands ~6-15% of runs.
const RULES = {
  tester: { minItems: 41, maxMs: 90000 },
  universal: { minLoad: 24 },
  uninsured: { minLoad: 8, minMs: 150000 },
  crisis: { minLoad: 7, minProt: 3, minShare: 0.25 },
  wired: { pts: 3, vigLift: 1.15, depLift: 1.0 },
  ghost: { depPts: 3, disPts: 3, disLift: 1.3, depLift: 0.9 },
  healthy: { share: 0.6, maxLoad: 4 },
  normality: { maxTotal: 3 },
  mod: { lift: 1.35, pts: 3 }, resModShare: 0.35,
  snarkMax: 3, growingAt: 12, speedrunMs: 7000, idleMs: 90000, teachMs: 45000,
  // "Second opinion" is definitionally singular; the noDoctors line lands
  // harder when the institute turns out to have exactly one (1) algorithm.
  rerollMax: 1
};

const LOAD_DIMS = ["vigilance", "depletion", "dissociation", "cognitive_load", "existential_load", "affect_blunting"];
const DIM_PATTERN = { vigilance: "VIGILANCE", depletion: "DEPLETION", dissociation: "DISSOCIATION", cognitive_load: "COGNITIVE", existential_load: "EXISTENTIAL", affect_blunting: "DEPLETION" };
const TIE_ORDER = ["depletion", "vigilance", "cognitive_load", "existential_load", "dissociation", "affect_blunting"];

const ACTIVE = CONTENT.labels.filter(l => !l.cut);
const BY_ID = Object.fromEntries(ACTIVE.map(l => [l.id, l]));
// Display codes: renumber consecutively per section prefix so cut items don't leave
// gaps (A05 → A07) in the form. Internal l.id stays the source of truth for scoring.
const DISPLAY_ID = {};
{
  const seq = {};
  ACTIVE.forEach(l => {
    const prefix = l.id.replace(/[0-9]+$/, "");
    seq[prefix] = (seq[prefix] || 0) + 1;
    DISPLAY_ID[l.id] = prefix + String(seq[prefix]).padStart(2, "0");
  });
}
const DIM_MAX = {};
LOAD_DIMS.forEach(d => { DIM_MAX[d] = ACTIVE.filter(l => l.dims.includes(d)).length; });
const DIM_SUM = LOAD_DIMS.reduce((a, d) => a + DIM_MAX[d], 0);
const EXPECTED = {};
LOAD_DIMS.forEach(d => { EXPECTED[d] = DIM_MAX[d] / DIM_SUM; });
// affect_blunting is scored (3 items) but not displayed as a bar — it folds
// into DEPLETION for patterns and still bills on the receipt.
const DISPLAY_DIMS = ["vigilance", "depletion", "dissociation", "cognitive_load", "existential_load"];
const TOTAL_LOAD_ITEMS = ACTIVE.filter(l => l.val === "load").length;
const TOTAL_ITEMS = ACTIVE.length;

const S = {
  lang: localStorage.getItem("lucid_lang") || ((navigator.language || "en").toLowerCase().startsWith("zh") ? "zh" : "en"),
  screen: "landing",
  mod: 0,
  sel: new Set(),
  reroll: 0,
  result: null,
  showInterstitial: false,
  errorShown: false,
  log: null
};
if (!["en", "zh"].includes(S.lang)) S.lang = "en";

function freshLog() {
  return { start: Date.now(), end: 0, enter: Date.now(), dwell: [0, 0, 0, 0, 0], deselects: 0, backnav: 0, langSwitches: 0 };
}

function djb2(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

function ui(key) { return (CONTENT.ui[S.lang] && CONTENT.ui[S.lang][key]) ?? CONTENT.ui.en[key]; }
function tr(obj) { if (!obj) return ""; return obj[S.lang] ?? obj.en ?? ""; }
function fmt(str, params) { return str.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? ""); }
function localStamp(d) {
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

// ---------- snark ----------
const snark = { fired: new Set(), count: 0, inModule: false, idleTimer: null, teachTimer: null };

function fireSnark(key) {
  if (S.screen !== "module") return;
  if (snark.count >= RULES.snarkMax || snark.inModule || snark.fired.has(key)) return;
  snark.fired.add(key); snark.count++; snark.inModule = true;
  const el = document.getElementById("snark");
  el.textContent = tr(CONTENT.snark[key]);
  el.classList.add("show");
  clearTimeout(snark.hideTimer);
  snark.hideTimer = setTimeout(() => el.classList.remove("show"), 6000);
}

function armTimers() {
  clearTimeout(snark.idleTimer); clearTimeout(snark.teachTimer);
  if (S.screen !== "module") return;
  snark.idleTimer = setTimeout(() => fireSnark("idle"), RULES.idleMs);
  if (S.mod === 0) snark.teachTimer = setTimeout(() => { if (S.sel.size === 1) fireSnark("teach"); }, RULES.teachMs);
}

// ---------- scoring ----------
function computeDims(ids) {
  const dims = { vigilance: 0, depletion: 0, dissociation: 0, cognitive_load: 0, existential_load: 0, affect_blunting: 0, resilience: 0 };
  ids.forEach(id => { const l = BY_ID[id]; if (l) l.dims.forEach(d => { dims[d]++; }); });
  return dims;
}

function computeResult() {
  const ids = [...S.sel].sort();
  const items = ids.map(id => BY_ID[id]).filter(Boolean);
  const loadItems = items.filter(l => l.val === "load");
  const protItems = items.filter(l => l.val === "prot");
  const total = items.length;
  const protShare = total ? protItems.length / total : 0;
  const dims = computeDims(ids);
  const loadPts = LOAD_DIMS.reduce((a, d) => a + dims[d], 0);
  const share = d => (loadPts ? dims[d] / loadPts : 0);
  const lift = d => share(d) / EXPECTED[d];
  const elapsed = S.log.end - S.log.start;

  let pattern = null;
  if (total >= RULES.tester.minItems && elapsed < RULES.tester.maxMs) pattern = "UI_TESTER";
  else if (loadItems.length >= RULES.universal.minLoad) pattern = "PROFILE_UNIVERSAL";
  else if (loadItems.length >= RULES.crisis.minLoad && protItems.length >= RULES.crisis.minProt && protShare >= RULES.crisis.minShare) pattern = "FUNCTIONAL_CRISIS";
  else if (dims.vigilance >= RULES.wired.pts && dims.depletion >= RULES.wired.pts && lift("vigilance") >= RULES.wired.vigLift && lift("depletion") >= RULES.wired.depLift) pattern = "WIRED_AND_TIRED";
  else if (dims.depletion >= RULES.ghost.depPts && dims.dissociation >= RULES.ghost.disPts && lift("dissociation") >= RULES.ghost.disLift && lift("depletion") >= RULES.ghost.depLift) pattern = "BURNOUT_GHOST";
  else if (protShare >= RULES.healthy.share && loadItems.length <= RULES.healthy.maxLoad) pattern = "HEALTHY";
  else if (total <= RULES.normality.maxTotal) pattern = "NORMALITY";
  else {
    const eligible = LOAD_DIMS.filter(d => dims[d] >= 2);
    const pool = eligible.length ? eligible : LOAD_DIMS.filter(d => dims[d] > 0);
    let top = null, best = -1;
    TIE_ORDER.forEach(d => { if (pool.includes(d) && lift(d) > best) { best = lift(d); top = d; } });
    pattern = DIM_PATTERN[top || "depletion"];
  }

  const uninsured = protItems.length === 0 && loadItems.length >= RULES.uninsured.minLoad && elapsed >= RULES.uninsured.minMs;

  const rng = mulberry32(djb2(ids.join(",") + "|" + S.reroll));
  // Second opinions draw without replacement: walk the deterministic pick
  // sequence so each reroll lands on a different index than the one before.
  const pickSeq = (arr, salt) => {
    let idx = Math.floor(mulberry32(djb2(ids.join(",") + "|" + salt + "|0"))() * arr.length);
    for (let r = 1; r <= S.reroll && arr.length > 1; r++) {
      idx = (idx + 1 + Math.floor(mulberry32(djb2(ids.join(",") + "|" + salt + "|" + r))() * (arr.length - 1))) % arr.length;
    }
    return arr[idx];
  };
  const stem = pickSeq(CONTENT.diag[pattern], "stem");
  const noteRaw = pickSeq(CONTENT.notes[pattern] || CONTENT.notes.NORMALITY, "note");

  const mods = [];
  if (!["UI_TESTER", "PROFILE_UNIVERSAL", "HEALTHY", "NORMALITY"].includes(pattern)) {
    LOAD_DIMS.filter(d => CONTENT.mods[d] && lift(d) >= RULES.mod.lift && dims[d] >= RULES.mod.pts)
      .sort((a, b) => lift(b) - lift(a))
      .forEach(d => mods.push(d));
    if (protShare >= RULES.resModShare) mods.push("resilience");
  }
  const modTexts = mods.slice(0, 2).map(m => tr(CONTENT.mods[m]));
  const stemTxt = tr(stem);
  const title = modTexts.length === 0 ? stemTxt :
    (S.lang === "zh" ? stemTxt + "（" + modTexts.join("、") + "）" : stemTxt + ", " + modTexts.join(", "));

  const note = fmt(tr(noteRaw), { s: Math.max(1, Math.round(elapsed / 1000)), k: TOTAL_ITEMS });

  const buckets = CONTENT.buckets;
  const covered = buckets.filter(b => protItems.some(l => l.bucket === b));
  const uncovered = buckets.filter(b => !covered.includes(b) && loadItems.filter(l => l.bucket === b).length >= 2);
  const tier = CONTENT.coverage.tiers.find(t => protShare >= t.min);

  const end = new Date(S.log.end);
  const dwell = S.log.dwell.slice();
  const sortedDwell = dwell.slice().sort((a, b) => a - b);
  const median = sortedDwell[2];
  const maxDwell = Math.max(...dwell);
  const maxMod = dwell.indexOf(maxDwell);
  const notes = [];
  if (end.getHours() < 5) notes.push(fmt(tr(CONTENT.processNotes.night), { time: end.toTimeString().slice(0, 5) }));
  if (S.log.deselects >= 2) notes.push(fmt(tr(CONTENT.processNotes.revisions), { n: S.log.deselects }));
  if (median >= 20000 ? maxDwell >= 2.2 * median : maxDwell >= 45000) notes.push(fmt(tr(CONTENT.processNotes.dwell), { module: ui("buckets")[maxMod] }));
  if (S.log.langSwitches >= 1) notes.push(tr(CONTENT.processNotes.langswitch));
  if (S.log.backnav >= 2) notes.push(fmt(tr(CONTENT.processNotes.backtrack), { n: S.log.backnav }));
  if (elapsed < 75000) notes.push(fmt(tr(CONTENT.processNotes.sprint), { s: Math.max(1, Math.round(elapsed / 1000)) }));
  else if (elapsed > 720000) notes.push(fmt(tr(CONTENT.processNotes.marathon), { m: Math.round(elapsed / 60000) }));

  const ref = (uninsured || (loadItems.length >= 12 && protItems.length <= 2)) ? CONTENT.receipt.refAlt : CONTENT.receipt.ref;

  // Top two load dims drive the (unhelpful) recommendations; a seeded closer
  // ends the report. Stored untranslated so a language switch re-renders them.
  const recRng = mulberry32(djb2(ids.join(",") + "|recs|" + S.reroll));
  const recDims = LOAD_DIMS.filter(d => dims[d] > 0).sort((a, b) => dims[b] - dims[a]).slice(0, 2);
  const recs = recDims.length ? recDims.map(d => CONTENT.recs.dims[d]) : [CONTENT.recs.clear];
  recs.push(pick(recRng, CONTENT.recs.closers));

  return {
    pattern, title, note, dims, protShare, uninsured, ref,
    covered, uncovered, tier,
    loadCount: loadItems.length, protCount: protItems.length,
    protItems, rarity: CONTENT.rarity[pattern],
    processNotes: notes.slice(0, 3), recs, elapsed, endDate: end, rng
  };
}

// ---------- rendering ----------
const app = () => document.getElementById("app");

function header() {
  return `<div class="text-center" style="text-align:center;">
    <h1 aria-label="${esc(ui("title"))}">${esc(ui("title"))}</h1>
    <div class="tagline">${esc(ui("tagline"))}</div>
  </div>`;
}

// H1 glitch: on hover, a few characters briefly mis-encode (typo/OCR register)
// and restore — the document mis-encoding itself, not a CRT effect. Runs once
// per hover; aria-label on the h1 keeps the accessible name stable throughout.
// zh substitutions are shape/sound-alike typo pairs — copy, so veto-able.
const GLITCH_SUBS = {
  en: { I: "1", l: "1", i: "í", t: "+", u: "ü", n: "ñ", e: "3", a: "@", o: "0", O: "0", s: "5", r: "г", c: "¢", N: "И", Q: "Ǫ", y: "ý", b: "6", C: "Ç", R: "Я" },
  zh: { "神": "深", "經": "輕", "清": "晴", "醒": "星", "度": "渡", "疑": "凝", "研": "妍", "究": "就", "所": "鎖" }
};
let glitchBusy = false;
document.addEventListener("mouseover", e => {
  const h = e.target.closest && e.target.closest("h1");
  if (!h || glitchBusy || (e.relatedTarget && h.contains(e.relatedTarget))) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const orig = ui("title");
  const subs = GLITCH_SUBS[S.lang] || GLITCH_SUBS.en;
  const idxs = [...orig].map((ch, i) => (subs[ch] ? i : -1)).filter(i => i >= 0);
  if (!idxs.length) return;
  glitchBusy = true;
  const chars = [...orig];
  const picks = [];
  const n = Math.min(3, idxs.length);
  while (picks.length < n) {
    const c = idxs[Math.floor(Math.random() * idxs.length)];
    if (!picks.includes(c)) picks.push(c);
  }
  picks.forEach((p, k) => {
    setTimeout(() => { chars[p] = subs[orig[p]]; h.textContent = chars.join(""); }, 40 + k * 70);
    setTimeout(() => { chars[p] = orig[p]; h.textContent = chars.join(""); }, 280 + k * 90);
  });
  setTimeout(() => { h.textContent = orig; glitchBusy = false; }, 650);
});

// Institute seal: counter-rotating text rings around the blot. Decorative on
// every surface (aria-hidden) — ring text repeats name + tagline, which exist
// as real text; rings stay EN in both languages (CJK glyphs tip over on arcs).
const BLOT_D = "M40,0h10v10h-10zM30,10h10v10h-10zM40,10h10v10h-10zM20,20h10v10h-10zM40,20h10v10h-10zM0,20h10v10h-10zM10,30h10v10h-10zM20,30h10v10h-10zM30,30h10v10h-10zM40,30h10v10h-10zM20,40h10v10h-10zM30,40h10v10h-10zM40,40h10v10h-10zM10,50h10v10h-10zM30,50h10v10h-10zM40,50h10v10h-10zM30,60h10v10h-10zM40,60h10v10h-10zM10,70h10v10h-10zM40,70h10v10h-10zM40,80h10v10h-10zM50,0h10v10h-10zM60,10h10v10h-10zM50,10h10v10h-10zM70,20h10v10h-10zM50,20h10v10h-10zM90,20h10v10h-10zM80,30h10v10h-10zM70,30h10v10h-10zM60,30h10v10h-10zM50,30h10v10h-10zM70,40h10v10h-10zM60,40h10v10h-10zM50,40h10v10h-10zM80,50h10v10h-10zM60,50h10v10h-10zM50,50h10v10h-10zM60,60h10v10h-10zM50,60h10v10h-10zM80,70h10v10h-10zM50,70h10v10h-10zM50,80h10v10h-10z";

function sealSvg(size) {
  return `<svg class="seal" width="${size}" height="${size}" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <defs><path id="seal-oc" d="M100,18 a82,82 0 1,1 -0.01,0 z"/><path id="seal-ic" d="M100,44 a56,56 0 1,1 -0.01,0 z"/></defs>
    <circle cx="100" cy="100" r="96" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="100" cy="100" r="68" fill="none" stroke="currentColor" stroke-width="1"/>
    <g class="seal-spin"><text font-size="13" letter-spacing="4.7" font-weight="700" fill="currentColor"><textPath href="#seal-oc">INSTITUTE OF QUESTIONABLE NEUROCLARITY · </textPath></text></g>
    <g class="seal-spin-rev"><text font-size="10.5" letter-spacing="1" fill="currentColor"><textPath href="#seal-ic">NO CLINICAL VALIDITY · HIGH EMOTIONAL VALIDITY · </textPath></text></g>
    <path fill="currentColor" transform="translate(74,76.5) scale(0.52)" d="${BLOT_D}"/>
  </svg>`;
}

// Footer border: a strip of tiny mirrored proto-blots — an endless supply of
// potential diagnoses. Freshly generated each render; decorative only.
function blotStripSvg() {
  const blots = [];
  for (let b = 0; b < 60; b++) {
    let d = "";
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 4; c++) {
        if (Math.random() < 0.62 - c * 0.13 - Math.abs(r - 3) * 0.055) {
          d += `M${3 - c},${r}h1v1h-1z`;
          if (c > 0) d += `M${3 + c},${r}h1v1h-1z`;
        }
      }
    }
    if (d) blots.push(`<path fill="currentColor" transform="translate(${b * 9},0.5)" d="${d}"/>`);
  }
  return `<svg class="blotstrip" viewBox="0 0 540 8" preserveAspectRatio="xMinYMid meet" aria-hidden="true" focusable="false">${blots.join("")}</svg>`;
}

// Form-margin footer: proto-blot security border, the disclaimer as fine
// print, and a printer's imprint row.
function footerBox() {
  return `<footer class="fine-print">
    ${blotStripSvg()}
    <p class="fp-body"><span class="fp-head">${esc(ui("footerHead"))}:</span> ${esc(ui("footerBody"))}</p>
    <div class="fp-imprint">
      <span>${esc(ui("imprint"))}</span>
      <span>${esc(ui("credits")).replace("@jelliwolf", '<a href="https://x.com/jelliwolf" target="_blank" rel="noopener">@jelliwolf</a>')}</span>
    </div>
  </footer>`;
}

function renderLanding() {
  app().innerHTML = `<div class="landing">
    <div class="landing-seal" aria-hidden="true">${sealSvg(112)}</div>
    ${header()}
    <p class="landing-body">${esc(ui("landingBody"))}</p>
    <button class="btn btn-primary" style="width:100%;" data-act="begin">${esc(ui("landingBtn"))}</button>
    ${footerBox()}
  </div>`;
}

function rowHtml(l) {
  const on = S.sel.has(l.id);
  return `<button class="row-item" data-id="${l.id}" aria-pressed="${on}">
    <span class="row-id" aria-hidden="true">${DISPLAY_ID[l.id]}</span>
    <span class="row-text">${esc(tr(l))}</span>
    <span class="row-box" aria-hidden="true"></span>
  </button>`;
}

function checklistHtml(items, labelId) {
  return `<div class="checklist" role="group" aria-labelledby="${labelId}" aria-describedby="module-hint">
    <div class="checklist-head" aria-hidden="true"><span>${esc(ui("colItem"))}</span><span>${esc(ui("colApplies"))}</span></div>
    ${items.map(rowHtml).join("")}
  </div>`;
}

function renderModule() {
  const bucket = CONTENT.buckets[S.mod];
  const items = ACTIVE.filter(l => l.bucket === bucket);
  const inter = S.showInterstitial && S.mod > 0 ? tr(CONTENT.interstitials[S.mod - 1]) : "";
  app().innerHTML = `
    <div class="progress-wrap">
      <span>${esc(ui("formLabel"))} — ${esc(fmt(ui("moduleLabel"), { i: S.mod + 1 }))}</span>
      <span id="filecount" aria-live="polite">${esc(fmt(ui("fileCount"), { n: S.sel.size }))}</span>
    </div>
    <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${S.mod}" aria-label="${esc(ui("formLabel"))} — ${esc(fmt(ui("moduleLabel"), { i: S.mod + 1 }))}"><div class="progress-fill" style="width:${(S.mod / 5) * 100}%"></div></div>
    <div class="interstitial${inter ? " show" : ""}" role="status">${esc(inter)}</div>
    <h2 class="bucket-header" id="focus-anchor" tabindex="-1">${esc(ui("buckets")[S.mod])}</h2>
    <p class="module-hint" id="module-hint">${esc(ui("instruction"))}</p>
    <h3 class="sub-header" id="grp-load">${esc(ui("subLoad"))}</h3>
    ${checklistHtml(items.filter(l => l.val === "load"), "grp-load")}
    <h3 class="sub-header" id="grp-prot">${esc(ui("subProt"))}</h3>
    ${checklistHtml(items.filter(l => l.val === "prot"), "grp-prot")}
    <div class="nav-row">
      ${S.mod > 0 ? `<button class="btn btn-ghost" data-act="back">${esc(ui("back"))}</button>` : ""}
      <button class="btn btn-primary" data-act="next">${esc(S.mod === 4 ? ui("run") : ui("next"))}</button>
    </div>
    <div id="error-slot" role="alert">${S.errorShown ? `<div class="error-msg">${esc(ui("error"))}</div>` : ""}</div>`;
  armTimers();
}

function renderProcessing() {
  // The seal's blot assembles cell by cell with the percent — and falls apart
  // at "Recalibrating (do not be alarmed)…" — so the finished blot is the mark
  // stamped on the report. Fill order is seeded from the selections (the blot
  // condenses out of the answers). Decorative; status lines are the substance.
  const cells = [...BLOT_D.matchAll(/M(\d+),(\d+)/g)].map(m => [+m[1], +m[2]]);
  const rng = mulberry32(djb2([...S.sel].sort().join(",") + "|blot"));
  for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  app().innerHTML = `<div class="processing">
    <svg class="proc-blot" viewBox="-2 -7 104 104" aria-hidden="true" focusable="false">${cells.map(c => `<rect x="${c[0]}" y="${c[1]}" width="10" height="10"/>`).join("")}</svg>
    <div class="processing-line" id="proc-line" role="status" aria-live="polite"></div>
    <div class="progress-track"><div class="progress-fill" id="proc-fill" style="width:2%"></div></div>
    <div class="proc-pct" id="proc-pct" aria-hidden="true">2%</div>
  </div>`;
  const rects = [...app().querySelectorAll(".proc-blot rect")];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shown = 0, drip = null;
  const setShown = n => { for (let k = 0; k < rects.length; k++) rects[k].style.opacity = k < n ? "1" : "0"; shown = n; };
  // Drip toward the step's cell count one cell at a time; reduced motion
  // jumps straight there (discrete per-step states, nothing lost).
  const fillTo = target => {
    clearInterval(drip);
    if (reduce) { setShown(target); return; }
    drip = setInterval(() => {
      if (shown === target) { clearInterval(drip); return; }
      setShown(shown + (target > shown ? 1 : -1));
    }, 45);
  };
  setShown(0);
  let steps = CONTENT.processing;
  // Rare anomaly: the Institute finds a file for a visit that hasn't happened.
  S.priorFile = Math.random() < 0.025;
  if (S.priorFile) {
    const d = new Date(Date.now() + 864e5);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const egg = { en: fmt(CONTENT.priorFile.step.en, { date: iso }), zh: fmt(CONTENT.priorFile.step.zh, { date: iso }), pct: 54, ms: 1700 };
    steps = [...steps.slice(0, 3), egg, ...steps.slice(3)];
  }
  let i = 0;
  const tick = () => {
    if (i < steps.length) {
      const step = steps[i];
      document.getElementById("proc-line").textContent = tr(step);
      document.getElementById("proc-fill").style.width = step.pct + "%";
      document.getElementById("proc-pct").textContent = step.pct + "%";
      fillTo(Math.round((step.pct / 100) * rects.length));
      i++;
      setTimeout(tick, step.ms);
    } else {
      clearInterval(drip);
      S.result = computeResult();
      try { localStorage.setItem("lucid_last", JSON.stringify({ pattern: S.result.pattern, ts: Date.now() })); } catch (e) { }
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: "/result/" + S.result.pattern.toLowerCase(), title: "LUCID result", event: true });
      }
      S.screen = "result";
      render();
    }
  };
  tick();
}

// MMPI-style profile plot: T-scores on a vertical axis, points connected,
// dotted cutoff at T=65. pct 0–100 maps to T 35–95 (so cutoff = 50% load).
// Compact geometry on narrow screens keeps rendered type >= ~10px.
const COMPACT_MQ = window.matchMedia("(max-width: 600px)");

function profileChart(r) {
  const compact = COMPACT_MQ.matches;
  const W = compact ? 360 : 640, H = compact ? 305 : 260;
  const padL = compact ? 34 : 46, padR = compact ? 10 : 18, padT = compact ? 16 : 30, padB = compact ? 84 : 42;
  const fAxis = compact ? 13 : 11, fVal = compact ? 15 : 12, fLab = compact ? 13 : 11, fLeg = 10.5;
  const over = r.pattern === "PROFILE_UNIVERSAL";
  const yOf = t => padT + ((95 - t) / (95 - 30)) * (H - padT - padB);
  const step = (W - padL - padR) / DISPLAY_DIMS.length;
  const pts = DISPLAY_DIMS.map((d, i) => {
    const pct = over ? 106 : Math.min(100, Math.round((r.dims[d] / Math.max(1, DIM_MAX[d])) * 100));
    const t = Math.round(35 + pct * 0.6);
    return { d, x: padL + (i + 0.5) * step, t, y: yOf(Math.min(t, 97)), hi: t >= 65 };
  });
  const grid = [30, 40, 50, 60, 70, 80, 90].map(t =>
    `<line x1="${padL}" y1="${yOf(t)}" x2="${W - padR}" y2="${yOf(t)}" stroke="#ddddd5" stroke-width="1"/>
     <text x="${padL - 7}" y="${yOf(t) + 3.5}" text-anchor="end" font-size="${fAxis}" fill="#9a9a92">${t}</text>`).join("");
  const cutY = yOf(65);
  const line = `<polyline points="${pts.map(p => p.x + "," + p.y).join(" ")}" fill="none" stroke="#333" stroke-width="1.6"/>`;
  const dots = pts.map(p => {
    const labTxt = `${p.hi ? "✓ " : ""}${esc(ui("dims")[p.d])}`;
    const lab = compact
      ? `<text x="${p.x + 4}" y="${H - padB + 14}" text-anchor="end" transform="rotate(-35 ${p.x + 4} ${H - padB + 14})" font-size="${fLab}" letter-spacing="0.5" fill="${p.hi ? "#a32d2d" : "#63635c"}">${labTxt}</text>`
      : `<text x="${p.x}" y="${H - padB + 18}" text-anchor="middle" font-size="${fLab}" letter-spacing="0.5" fill="${p.hi ? "#a32d2d" : "#63635c"}">${labTxt}</text>`;
    return `
    <circle cx="${p.x}" cy="${p.y}" r="4" fill="${p.hi ? "#a32d2d" : "#333"}"/>
    <text x="${p.x}" y="${p.y - 9}" text-anchor="middle" font-size="${fVal}" font-weight="bold" fill="${p.hi ? "#a32d2d" : "#333"}" stroke="#f4f4f0" stroke-width="3.5" paint-order="stroke">${over ? p.t + "+" : p.t}</text>${lab}`;
  }).join("");
  // In-SVG legend fits on desktop only; on compact it drops to an HTML caption below.
  const legW = [...ui("cutoffLabel")].reduce((a, c) => a + (c.charCodeAt(0) > 0x2e80 ? fLeg : fLeg * 0.62) + 0.8, 0);
  const legend = compact ? "" :
    `<line x1="${W - padR - legW - 42}" y1="${padT - 14}" x2="${W - padR - legW - 18}" y2="${padT - 14}" stroke="#a32d2d" stroke-width="1.2" stroke-dasharray="5 4"/>
     <text x="${W - padR}" y="${padT - 10}" text-anchor="end" font-size="${fLeg}" letter-spacing="0.8" fill="#a32d2d">${esc(ui("cutoffLabel"))}</text>`;
  const caption = compact ? `<div class="profile-cutnote" aria-hidden="true">- - - ${esc(ui("cutoffLabel"))}</div>` : "";
  const aria = ui("profileHead") + ": " + pts.map(p => `${ui("dims")[p.d]} ${p.t}${p.hi ? " (!)" : ""}`).join(", ");
  return `<div class="doc-profile" role="img" aria-label="${esc(aria)}">
    <div class="process-head">${esc(ui("profileHead"))}</div>
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="font-family:'Space Mono',monospace;">
      ${grid}
      <line x1="${padL}" y1="${cutY}" x2="${W - padR}" y2="${cutY}" stroke="#a32d2d" stroke-width="1.2" stroke-dasharray="5 4"/>
      ${legend}
      <line x1="${padL}" y1="${padT - 6}" x2="${padL}" y2="${H - padB}" stroke="#b9b9b0" stroke-width="1"/>
      <line x1="${padL}" y1="${H - padB}" x2="${W - padR}" y2="${H - padB}" stroke="#b9b9b0" stroke-width="1"/>
      ${line}${dots}
    </svg>${caption}
  </div>`;
}

function renderResult() {
  const r = S.result;
  const cov = CONTENT.coverage;
  const bucketNames = ui("buckets");
  const nameOf = b => bucketNames[CONTENT.buckets.indexOf(b)];
  const uncoveredNames = r.uncovered.map(b => nameOf(b) + (b === "Existential" ? tr(cov.preexisting) : "")).join(S.lang === "zh" ? "、" : ", ");
  const rarityTxt = fmt(ui("rarityLine"), { p: r.rarity.p }) + (tr(r.rarity) ? " " + tr(r.rarity) : "");
  const soLabel = S.reroll >= RULES.rerollMax ? ui("noDoctors") : ui("secondOpinion");

  // Subject no. hashes selections only (no reroll salt): the amended report
  // from a second opinion is visibly the same file.
  const subjNo = djb2([...S.sel].sort().join(",")).toString(16).toUpperCase().padStart(5, "0").slice(0, 5);

  app().innerHTML = `${header()}
    <div class="doc">
      ${r.pattern === "PROFILE_UNIVERSAL" ? `<div class="doc-stamp">${esc(ui("referred"))}</div>` : ""}
      <div class="doc-inst">${esc(ui("instName"))}</div>
      <div class="doc-dept">${esc(ui("deptName"))}</div>
      <div class="doc-filerow"><span>${esc(ui("formLabel"))}</span><span>${esc(ui("subjLabel"))} ${subjNo}</span></div>
      <div class="doc-label">${esc(ui("diagLabel"))}${S.reroll > 0 ? `<span class="doc-tag">${esc(ui("amendedTag"))}</span>` : ""}</div>
      <h2 class="doc-title" id="focus-anchor" tabindex="-1">${esc(r.title)}</h2>
      <div class="doc-rarity">${esc(rarityTxt)}</div>
      <p class="doc-note">“${esc(r.note)}”${r.uninsured ? `<span class="sincere">${esc(tr(CONTENT.uninsured.doc))}</span>` : ""}</p>
      ${profileChart(r)}
      <div class="prot-block">
        <div class="process-head">${esc(ui("protHead"))}</div>
        ${r.protItems.length
          ? `<ul class="prot-list">${r.protItems.map(l => `<li><span class="prot-check" aria-hidden="true">✓</span>${esc(l.coupon ? tr(l.coupon) : tr(l))}</li>`).join("")}</ul>`
          : `<div class="prot-none">${esc(ui("protNone"))}</div>`}
        ${r.uncovered.length ? `<div class="coverage-uncovered">${esc(fmt(tr(cov.uncovered), { list: uncoveredNames }))}</div>` : ""}
        <div class="coverage-integrity">${esc(tr(r.tier))}</div>
      </div>
      ${r.processNotes.length ? `<div class="process-block">
        <div class="process-head">${esc(ui("processHead"))}</div>
        <ul>${r.processNotes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
      </div>` : ""}
      <div class="process-block">
        <div class="process-head">${esc(ui("recsHead"))}</div>
        <ul>${r.recs.map(n => `<li>${esc(tr(n))}</li>`).join("")}</ul>
      </div>
      <div class="doc-sealrow" aria-hidden="true">${sealSvg(88)}</div>
      <div class="doc-footer"><span>${esc(r.ref)}</span><span>${localStamp(r.endDate)}</span></div>
    </div>
    <div class="result-actions">
      <button class="btn btn-primary" data-act="print">${esc(ui("printReceipt"))}</button>
      <button class="btn btn-ghost" data-act="share">${esc(ui("shareBtn"))}</button>
      <button class="btn btn-ghost" data-act="second" ${S.reroll >= RULES.rerollMax ? "disabled" : ""}>${esc(soLabel)}</button>
      <button class="btn btn-ghost" data-act="retake">${esc(ui("retake"))}</button>
    </div>
    <div class="receipt-preview" id="receipt-preview"></div>
    ${footerBox()}`;
  prepareShareFile();
}

let lastFocusKey = null;
function render() {
  document.documentElement.lang = S.lang === "zh" ? "zh-Hant" : "en";
  document.querySelectorAll(".lang-btn").forEach(b => {
    const on = b.dataset.lang === S.lang;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on);
  });
  const skip = document.getElementById("skip-link");
  if (skip) skip.textContent = ui("skip");
  if (S.screen === "landing") renderLanding();
  else if (S.screen === "module") renderModule();
  else if (S.screen === "processing") renderProcessing();
  else renderResult();
  document.title = S.screen === "module"
    ? `${ui("formLabel")} — ${fmt(ui("moduleLabel"), { i: S.mod + 1 })} · ${ui("title")}`
    : ui("title");
  const key = S.screen + ":" + S.mod + ":" + S.reroll;
  if (lastFocusKey !== null && key !== lastFocusKey) {
    const anchor = document.getElementById("focus-anchor");
    if (anchor) anchor.focus({ preventScroll: true });
  }
  lastFocusKey = key;
}

// ---------- receipt ----------
function buildReceiptLines(r) {
  const R = CONTENT.receipt;
  const rng = mulberry32(djb2([...S.sel].sort().join(",") + "|price|" + S.reroll));
  const money = v => v.toFixed(2);
  const lines = [];
  lines.push({ t: "center", s: "bold", txt: tr({ en: "INSTITUTE OF QUESTIONABLE", zh: "神經清醒度存疑研究所" }) });
  if (S.lang !== "zh") lines.push({ t: "center", s: "bold", txt: "NEUROCLARITY" });
  lines.push({ t: "center", s: "muted", txt: ui("deptName").toUpperCase() });
  lines.push({ t: "center", s: "muted", txt: tr(R.cashier) });
  lines.push({ t: "center", s: "muted", txt: localStamp(r.endDate) + " · " + tr(R.customerCopy) });
  lines.push({ t: "sep" });
  let subtotal = 0;
  LOAD_DIMS.filter(d => r.dims[d] > 0).forEach(d => {
    const amt = r.dims[d] * 8 + rng() * 0.99;
    subtotal += amt;
    lines.push({ t: "row", l: r.dims[d] + "× " + tr(R.charges[d]), r: money(amt) });
  });
  lines.push({ t: "sep" });
  lines.push({ t: "row", s: "bold", l: tr(R.subtotal), r: money(subtotal) });
  let credit = null;
  if (r.protCount > 0) {
    lines.push({ t: "text", s: "muted", txt: tr(R.coupons) });
    let couponSum = 0;
    r.protItems.forEach((l, i) => {
      const amt = 4 + rng() * 3.5;
      couponSum += amt;
      if (i < 5) lines.push({ t: "row", l: "  " + tr(l.coupon), r: "−" + money(amt) });
    });
    if (r.protCount > 5) lines.push({ t: "text", txt: "  " + fmt(tr(R.more), { n: r.protCount - 5 }) });
    if (couponSum > subtotal) {
      credit = couponSum - subtotal;
    } else {
      lines.push({ t: "text", s: "bold", txt: fmt(tr(R.saved), { p: Math.round((couponSum / Math.max(subtotal, 1)) * 100) }) });
    }
  } else {
    lines.push({ t: "fine", txt: tr(CONTENT.uninsured.receipt) });
  }
  lines.push({ t: "sep" });
  const okTotal = ["HEALTHY", "NORMALITY"].includes(r.pattern);
  lines.push({ t: "row", s: "big", l: tr(R.total), r: credit !== null ? money(credit) + " CR" : tr(okTotal ? R.totalOk : R.totalTooMuch) });
  if (credit !== null) lines.push({ t: "text", s: "bold", txt: tr(R.credit) });
  lines.push({ t: "text", txt: tr(R.payDeclined) });
  lines.push({ t: "text", txt: tr(R.payApproved) });
  if (r.tier === CONTENT.coverage.tiers[3]) lines.push({ t: "text", txt: tr(R.paySpite) });
  lines.push({ t: "sep" });
  lines.push({ t: "text", s: "muted", txt: tr(R.dxLabel) });
  lines.push({ t: "wrap", s: "bold", txt: r.title.toUpperCase() });
  lines.push({ t: "text", txt: fmt(tr(R.rarity), { p: r.rarity.p }) });
  if (S.reroll > 0) lines.push({ t: "fine", txt: tr(R.amended) });
  if (r.processNotes.length) {
    lines.push({ t: "sep" });
    lines.push({ t: "text", s: "muted", txt: tr(R.notesLabel) });
    r.processNotes.slice(0, 2).forEach(n => lines.push({ t: "wrap", txt: n.toUpperCase() }));
  }
  lines.push({ t: "sep" });
  R.fineprint[S.lang === "zh" ? "zh" : "en"].forEach(f => lines.push({ t: "center", s: "muted", txt: f }));
  if (S.priorFile) lines.push({ t: "center", s: "muted", txt: tr(CONTENT.priorFile.visit) });
  lines.push({ t: "barcode", payload: r.ref.includes("200") ? "STILL HERE" : "GO TO BED" });
  lines.push({ t: "center", s: "muted", txt: r.ref });
  return lines;
}

// Code 39 — genuinely scannable (Google Lens / iOS Live Text), for the three
// people who will ever try. 9 elements per char, 0=narrow 1=wide, bar/space alternating.
const CODE39 = {
  "0": "000110100", "1": "100100001", "2": "001100001", "3": "101100000", "4": "000110001",
  "5": "100110000", "6": "001110000", "7": "000100101", "8": "100100100", "9": "001100100",
  "A": "100001001", "B": "001001001", "C": "101001000", "D": "000011001", "E": "100011000",
  "F": "001011000", "G": "000001101", "H": "100001100", "I": "001001100", "J": "000011100",
  "K": "100000011", "L": "001000011", "M": "101000010", "N": "000010011", "O": "100010010",
  "P": "001010010", "Q": "000000111", "R": "100000110", "S": "001000110", "T": "000010110",
  "U": "110000001", "V": "011000001", "W": "111000000", "X": "010010001", "Y": "110010000",
  "Z": "011010000", "-": "010000101", ".": "110000100", " ": "011000100", "*": "010010100"
};

function drawCode39(ctx, payload, cx, y, h) {
  const narrow = 1.4, wide = 3.2;
  const chars = ("*" + payload.toUpperCase() + "*").split("").filter(c => CODE39[c]);
  const charW = c => CODE39[c].split("").reduce((a, b) => a + (b === "1" ? wide : narrow), 0) + narrow;
  const totalW = chars.reduce((a, c) => a + charW(c), 0) - narrow;
  let x = cx - totalW / 2;
  ctx.fillStyle = "#2b2a26";
  chars.forEach(c => {
    CODE39[c].split("").forEach((el, i) => {
      const w = el === "1" ? wide : narrow;
      if (i % 2 === 0) ctx.fillRect(x, y, w, h);
      x += w;
    });
    x += narrow;
  });
}

function receiptToText(lines) {
  const COLS = 42;
  const w = s => [...s].reduce((a, c) => a + (c.charCodeAt(0) > 255 ? 2 : 1), 0);
  const out = [];
  lines.forEach(ln => {
    if (ln.t === "sep") { out.push("-".repeat(COLS)); return; }
    if (ln.t === "barcode") { out.push(`[BARCODE: ${ln.payload}]`); return; }
    if (ln.t === "row") {
      const gap = COLS - w(ln.l) - w(ln.r);
      out.push(ln.l + (gap > 0 ? " ".repeat(gap) : "  ") + ln.r);
      return;
    }
    if (ln.t === "center") {
      const pad = Math.max(0, Math.floor((COLS - w(ln.txt)) / 2));
      out.push(" ".repeat(pad) + ln.txt);
      return;
    }
    out.push(ln.txt);
  });
  return out.join("\n");
}

function paintReceipt(lines) {
  const scale = 2, W = 380, pad = 22, lh = 19;
  const FONT = (px, bold) => `${bold ? "700 " : ""}${px}px "Space Mono","PingFang TC","Noto Sans TC",monospace`;
  const mCanvas = document.createElement("canvas");
  const mc = mCanvas.getContext("2d");

  const wrapText = (txt, px, bold) => {
    mc.font = FONT(px, bold);
    const maxW = W - pad * 2;
    const out = [];
    let cur = "";
    const units = S.lang === "zh" ? txt.split("") : txt.split(" ");
    const joiner = S.lang === "zh" ? "" : " ";
    units.forEach(u => {
      const test = cur ? cur + joiner + u : u;
      if (mc.measureText(test).width > maxW && cur) { out.push(cur); cur = u; }
      else cur = test;
    });
    if (cur) out.push(cur);
    return out;
  };

  const ops = [];
  let y = pad + 6;
  lines.forEach(ln => {
    if (ln.t === "sep") { ops.push({ t: "sep", y: y + 4 }); y += 14; return; }
    if (ln.t === "barcode") { ops.push({ t: "barcode", y: y + 6, payload: ln.payload }); y += 44; return; }
    const bold = ln.s === "bold" || ln.s === "big";
    const px = ln.s === "big" ? 15 : ln.s === "muted" || ln.t === "fine" ? 10.5 : 12;
    const rows = (ln.t === "wrap" || ln.t === "fine") ? wrapText(ln.txt, px, bold) : [null];
    if (ln.t === "row") {
      mc.font = FONT(px, bold);
      const rW = mc.measureText(ln.r).width;
      let l = ln.l;
      while (mc.measureText(l).width > W - pad * 2 - rW - 12 && l.length > 3) l = l.slice(0, -2) + "…";
      ops.push({ t: "row", y: y + lh, l, r: ln.r, px, bold });
      y += ln.s === "big" ? lh + 6 : lh;
    } else if (rows[0] === null) {
      ops.push({ t: "text", y: y + lh, txt: ln.txt, px, bold, center: ln.t === "center", muted: ln.s === "muted" || ln.t === "fine" });
      y += lh;
    } else {
      rows.forEach(rw => {
        ops.push({ t: "text", y: y + lh, txt: rw, px, bold, center: ln.t === "fine" || ln.t === "center", muted: ln.t === "fine" });
        y += ln.t === "fine" ? lh - 3 : lh;
      });
    }
  });
  const H = y + pad + 14;

  const canvas = document.createElement("canvas");
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  ctx.fillStyle = "#f7f6f1";
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(W, H - 8);
  for (let x = W; x > 0; x -= 14) { ctx.lineTo(x - 7, H); ctx.lineTo(x - 14, H - 8); }
  ctx.closePath(); ctx.fill();

  ops.forEach(op => {
    if (op.t === "sep") {
      ctx.strokeStyle = "#b8b6aa"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(pad, op.y); ctx.lineTo(W - pad, op.y); ctx.stroke(); ctx.setLineDash([]);
    } else if (op.t === "barcode") {
      drawCode39(ctx, op.payload || "GO TO BED", W / 2, op.y, 30);
    } else if (op.t === "row") {
      ctx.font = FONT(op.px, op.bold); ctx.fillStyle = "#2b2a26";
      ctx.textAlign = "left"; ctx.fillText(op.l, pad, op.y);
      ctx.textAlign = "right"; ctx.fillText(op.r, W - pad, op.y);
      ctx.textAlign = "left";
    } else {
      ctx.font = FONT(op.px, op.bold);
      ctx.fillStyle = op.muted ? "#6b6a63" : "#2b2a26";
      if (op.center) { ctx.textAlign = "center"; ctx.fillText(op.txt, W / 2, op.y); ctx.textAlign = "left"; }
      else ctx.fillText(op.txt, pad, op.y);
    }
  });
  return canvas;
}

async function printReceipt() {
  try { await document.fonts.load('12px "Space Mono"'); await document.fonts.ready; } catch (e) { }
  const lines = buildReceiptLines(S.result);
  const canvas = paintReceipt(lines);
  const url = canvas.toDataURL("image/png");
  S.receiptText = receiptToText(lines);
  const slot = document.getElementById("receipt-preview");
  slot.innerHTML = `<img src="${url}" alt="${esc(ui("receiptAlt"))}">
    <details class="receipt-text">
      <summary>${esc(ui("textVersion"))}</summary>
      <pre>${esc(S.receiptText)}</pre>
      <button class="btn btn-ghost" data-act="copytext">${esc(ui("copyText"))}</button>
    </details>`;
  const a = document.createElement("a");
  a.href = url;
  a.download = "LUCID-receipt-" + S.result.pattern.toLowerCase() + "-" + localStamp(S.result.endDate).slice(0, 10) + ".png";
  a.click();
}

// Sharing: navigator.share must run inside the click's user activation, so
// the receipt PNG is pre-baked when the result renders and the handler stays
// synchronous. The share sheet is the OS one — the user picks the destination.
// No share support (most desktops) → copy text + link to the clipboard.
function prepareShareFile() {
  S.shareFile = null;
  document.fonts.ready.then(() => {
    try {
      paintReceipt(buildReceiptLines(S.result)).toBlob(b => {
        S.shareFile = b ? new File([b], "subclinical-receipt.png", { type: "image/png" }) : null;
      }, "image/png");
    } catch (e) { }
  });
}

function shareReceipt(btn) {
  const text = fmt(ui("shareText"), { title: S.result.title });
  const url = location.origin + location.pathname;
  const f = S.shareFile;
  if (f && navigator.canShare && navigator.canShare({ files: [f] })) {
    navigator.share({ files: [f], text: text + " " + url }).catch(() => { }); // dismissing the sheet is fine
  } else if (navigator.share) {
    navigator.share({ text, url }).catch(() => { });
  } else {
    navigator.clipboard.writeText(text + " " + url).then(() => {
      const label = btn.textContent;
      btn.textContent = ui("copied");
      setTimeout(() => { btn.textContent = label; }, 2000);
    });
  }
  if (window.goatcounter && window.goatcounter.count) {
    window.goatcounter.count({ path: "/share/" + S.result.pattern.toLowerCase(), title: "LUCID share", event: true });
  }
}

// ---------- events ----------
document.addEventListener("click", e => {
  const pill = e.target.closest(".row-item");
  if (pill) {
    const id = pill.dataset.id;
    const bucket = CONTENT.buckets[S.mod];
    if (S.sel.has(id)) {
      S.sel.delete(id);
      pill.setAttribute("aria-pressed", "false");
      S.log.deselects++;
      if (S.log.deselects === 1) fireSnark("deselect1");
      else if (S.log.deselects === 3) fireSnark("deselect3");
    } else {
      S.sel.add(id);
      pill.setAttribute("aria-pressed", "true");
      if (S.sel.size === RULES.growingAt) fireSnark("growing");
      const loadIds = ACTIVE.filter(l => l.bucket === bucket && l.val === "load").map(l => l.id);
      if (loadIds.every(i => S.sel.has(i))) fireSnark("sweep");
    }
    S.errorShown = false;
    const err = document.getElementById("error-slot"); if (err) err.innerHTML = "";
    const fc = document.getElementById("filecount");
    if (fc) fc.textContent = fmt(ui("fileCount"), { n: S.sel.size });
    armTimers();
    return;
  }

  const act = e.target.closest("[data-act]");
  if (!act) return;
  const a = act.dataset.act;

  if (a === "begin") {
    S.log = freshLog(); S.sel = new Set(); S.reroll = 0; S.mod = 0;
    snark.fired.clear(); snark.count = 0;
    S.screen = "module"; S.showInterstitial = false;
    render(); window.scrollTo(0, 0);
  } else if (a === "next") {
    const dwellMs = Date.now() - S.log.enter;
    S.log.dwell[S.mod] += dwellMs;
    const bucket = CONTENT.buckets[S.mod];
    const inModule = ACTIVE.filter(l => l.bucket === bucket).some(l => S.sel.has(l.id));
    if (S.mod === 0 && S.sel.size === 1) fireSnark("teach");
    else if (dwellMs < RULES.speedrunMs && inModule) fireSnark("speedrun");
    if (S.mod < 4) {
      S.mod++; S.log.enter = Date.now(); S.showInterstitial = true; snark.inModule = false;
      render(); window.scrollTo(0, 0);
    } else {
      if (S.sel.size === 0) { S.errorShown = true; render(); return; }
      S.log.end = Date.now();
      S.screen = "processing"; snark.inModule = false;
      document.getElementById("snark").classList.remove("show");
      render(); window.scrollTo(0, 0);
    }
  } else if (a === "back") {
    S.log.dwell[S.mod] += Date.now() - S.log.enter;
    S.log.backnav++;
    S.mod--; S.log.enter = Date.now(); S.showInterstitial = false; snark.inModule = false;
    render(); window.scrollTo(0, 0);
  } else if (a === "second") {
    if (S.reroll < RULES.rerollMax) {
      S.reroll++;
      S.result = computeResult();
      render(); window.scrollTo(0, 0);
    }
  } else if (a === "share") {
    shareReceipt(act);
  } else if (a === "print") {
    printReceipt();
  } else if (a === "copytext") {
    navigator.clipboard.writeText(S.receiptText || "").then(() => {
      act.textContent = ui("copied");
      setTimeout(() => { act.textContent = ui("copyText"); }, 2000);
    });
  } else if (a === "retake") {
    S.screen = "landing"; S.result = null; S.sel = new Set(); S.errorShown = false;
    render(); window.scrollTo(0, 0);
  } else if (a === "lang") {
    const next = act.dataset.lang;
    if (next !== S.lang) {
      S.lang = next;
      try { localStorage.setItem("lucid_lang", next); } catch (err) { }
      if (S.log && (S.screen === "module" || S.screen === "processing")) S.log.langSwitches++;
      if (S.screen === "result" && S.result) S.result = computeResult();
      if (S.screen !== "processing") render();
    }
  }
});

// Re-render the result when crossing the compact breakpoint so the chart
// switches geometry (rotated labels, HTML cutoff caption).
COMPACT_MQ.addEventListener("change", () => { if (S.screen === "result") render(); });

// ---------- after-hours (placement testbed: room light only) ----------
// 01:00–04:59 local the room goes dark; documents keep their own light.
// ?lights=off / ?lights=on forces the window for testing. The pull-cord only
// exists inside the window and toggles the room; the choice persists. This is
// an event, not a theme — prefers-color-scheme is deliberately not consulted.
const AFTER_HOURS = (() => {
  const p = new URLSearchParams(location.search).get("lights");
  if (p === "off") return true;
  if (p === "on") return false;
  const h = new Date().getHours();
  return h >= 1 && h < 5;
})();
function applyLights() {
  const opted = localStorage.getItem("lucid_lights") === "on";
  document.documentElement.classList.toggle("after-hours", AFTER_HOURS && !opted);
  const cord = document.getElementById("pull-cord");
  if (cord) { cord.hidden = !AFTER_HOURS; cord.setAttribute("aria-pressed", String(opted)); }
}
document.getElementById("pull-cord").addEventListener("click", () => {
  const opted = localStorage.getItem("lucid_lights") === "on";
  try { localStorage.setItem("lucid_lights", opted ? "off" : "on"); } catch (e) { }
  applyLights();
});
applyLights();

render();
