// =====================================================================
// Mathématiques — Première Spécialité : SPA légère
// Routing à base de hash, viewer PDF.js custom, recherche live,
// favoris / récents en localStorage. Aucun framework.
// =====================================================================

import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs';
import { TRIVIA } from './trivia.js';
import { mountChatbot } from './chatbot.js';
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs';

// ------------------------------- State ---------------------------------
const state = {
  manifest: null,
  flatItems: [],          // all items with chapter reference
  currentRoute: null,
  currentChapter: null,
  currentItem: null,
  pdf: null,              // current PDFDocumentProxy
  page: 1,
  pageCount: 0,
  zoomMode: 'fit',        // 'fit' | number (CSS scale)
  zoomScale: 1.0,
  catFilter: null,
  search: '',
  thumbsRendered: new Set(),
  pageCanvases: new Map(),// page -> HTMLCanvas
};

const STORE = {
  RECENT: 'mp1.recent',
  FAVS:   'mp1.favs',
  THEME:  'mp1.theme',
  ZOOM:   'mp1.zoom',
};

const CATEGORIES = {
  cours:      { label: 'Cours',       icon: 'M5 4h11l3 3v13H5z|M16 4v3h3' },
  diaporama:  { label: 'Diaporama',   icon: 'M4 5h16v11H4z|M2 19h20|M10 19v3M14 19v3' },
  exercices:  { label: 'Exercices',   icon: 'M5 5h14v14H5z|M9 9h6M9 13h6M9 17h4' },
  annales:    { label: 'Annales',     icon: 'M6 3h9l4 4v14H6z|M14 3v5h5' },
  fiche:      { label: 'Fiche',       icon: 'M7 4h10v16H7z|M7 9h10M7 14h10M7 19h6' },
  seance:     { label: 'Séance',      icon: 'M5 7h14M5 12h14M5 17h14' },
  ressource:  { label: 'Ressource',   icon: 'M12 3 4 7v6c0 4.4 3.5 7.7 8 8 4.5-.3 8-3.6 8-8V7l-8-4z' },
};

// ----------------------------- Boot ------------------------------------
init();

async function init() {
  // One-shot cleanup: the per-user "hidden slide" feature has been removed
  // and those deletions are now permanent in the PDFs. Remove any stale
  // mp1.hidden:* entries so the new (smaller) PDFs aren't accidentally
  // re-filtered against old indices.
  try {
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('mp1.hidden:')) localStorage.removeItem(k);
    }
  } catch {}

  applyTheme(localStorage.getItem(STORE.THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  // Reset "Reprendre" (recent items) at the start of each visit — but keep
  // them populated within a single visit so the home page can show them after
  // opening a few documents.
  if (!sessionStorage.getItem('mp1.session')) {
    localStorage.removeItem(STORE.RECENT);
    sessionStorage.setItem('mp1.session', '1');
  }
  bindUI();
  try {
    const res = await fetch('manifest.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    state.manifest = await res.json();
  } catch (e) {
    document.getElementById('main').innerHTML =
      `<div class="empty"><h3>Impossible de charger l'index</h3><p>${escapeHtml(e.message)}</p></div>`;
    return;
  }

  // Order chapters by their `number` (0 = annales, place last)
  state.manifest.chapters.sort((a, b) => {
    const an = a.number || 99;
    const bn = b.number || 99;
    return an - bn;
  });

  // Cleanup labels: prettify titles a bit (collapse double-spaces, capitalise)
  for (const ch of state.manifest.chapters) {
    ch.title = prettifyTitle(ch.title);
    for (const it of ch.items) {
      it.title = prettifyTitle(it.label);
      it.chapterId = ch.id;
      it.chapterTitle = ch.title;
      it.chapterNumber = ch.number;
      state.flatItems.push(it);
    }
  }

  renderSidebar();
  window.addEventListener('hashchange', route);
  route();

  // Mount the M. PELLETIER chatbot
  mountChatbot();
}

function prettifyTitle(s) {
  let t = s.replace(/\s+/g, ' ').trim();
  // Replace underscores with spaces
  t = t.replace(/_/g, ' ');
  // Strip the leading "NN " (already handled in chapter num); keep otherwise
  t = t.replace(/\s{2,}/g, ' ');
  // Capitalise first letter
  if (t.length) t = t[0].toUpperCase() + t.slice(1);
  return t;
}

// ----------------------------- UI bindings -----------------------------
function bindUI() {
  document.getElementById('menuBtn').addEventListener('click', () => toggleMenu(true));
  document.getElementById('closeSidebar').addEventListener('click', () => toggleMenu(false));
  document.getElementById('sidebarBackdrop').addEventListener('click', () => toggleMenu(false));
  document.getElementById('themeBtn').addEventListener('click', toggleTheme);
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('searchBtn').addEventListener('click', () => {
    document.body.classList.add('search-open');
    setTimeout(() => document.getElementById('searchInput').focus(), 50);
  });
  document.getElementById('searchInput').addEventListener('blur', () => {
    setTimeout(() => document.body.classList.remove('search-open'), 100);
  });

  const search = document.getElementById('searchInput');
  search.addEventListener('input', e => {
    state.search = e.target.value.trim();
    if (state.search) {
      if (location.hash !== '#/search') location.hash = '/search';
      else renderRoute();
    } else if (location.hash === '#/search') {
      history.back();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === '/' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); search.focus(); }
    if (state.currentItem) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); gotoPage(nextVisiblePage(state.page, +1)); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); gotoPage(nextVisiblePage(state.page, -1)); }
      else if (e.key === 'Home') { e.preventDefault(); gotoPage(nextVisiblePage(0, +1)); }
      else if (e.key === 'End')  { e.preventDefault(); gotoPage(nextVisiblePage(state.pageCount + 1, -1)); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(0.15); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-0.15); }
      else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key.toLowerCase() === 't') { e.preventDefault(); toggleThumbs(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeViewer(); }
    }
  });

  // Viewer controls
  document.getElementById('vBack').addEventListener('click', closeViewer);
  document.getElementById('vPrev').addEventListener('click', () => gotoPage(nextVisiblePage(state.page, -1)));
  document.getElementById('vNext').addEventListener('click', () => gotoPage(nextVisiblePage(state.page, +1)));
  document.getElementById('vPage').addEventListener('change', e => gotoPage(parseInt(e.target.value, 10) || 1));
  document.getElementById('vZoomIn').addEventListener('click', () => zoomBy(0.15));
  document.getElementById('vZoomOut').addEventListener('click', () => zoomBy(-0.15));
  document.getElementById('vFav').addEventListener('click', toggleFavCurrent);
  document.getElementById('vFs').addEventListener('click', toggleFullscreen);
  document.getElementById('vExitImmersive').addEventListener('click', () => {
    document.getElementById('viewer').classList.remove('immersive');
    updateFsIcon();
    setTimeout(rerenderAllPagesSoon, 50);
  });
  document.addEventListener('fullscreenchange', updateFsIcon);
  document.addEventListener('webkitfullscreenchange', updateFsIcon);
  document.getElementById('vThumbsToggle').addEventListener('click', toggleThumbs);
}

function toggleMenu(open) {
  document.body.classList.toggle('menu-open', open ?? !document.body.classList.contains('menu-open'));
  document.getElementById('sidebarBackdrop').hidden = !document.body.classList.contains('menu-open');
}

function toggleTheme() {
  const cur = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
}
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  localStorage.setItem(STORE.THEME, t);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', t === 'dark' ? '#0c0c0e' : '#ffffff');
}

// ----------------------------- Router ----------------------------------
// #/                       -> home
// #/chapter/<id>           -> chapter page
// #/view/<chapterId>/<idx> -> open viewer for item
// #/recent                 -> recent items
// #/favorites              -> favorites
// #/search                 -> search results (uses state.search)
function route() {
  const hash = location.hash.replace(/^#/, '') || '/';
  state.currentRoute = hash;
  renderRoute();
}

function goBack() {
  const h = location.hash.replace(/^#/, '') || '/';
  if (h.startsWith('/view/')) {
    if (state.currentChapter) location.hash = '/chapter/' + encodeURIComponent(state.currentChapter.id);
    else location.hash = '/';
  } else if (h.startsWith('/chapter/') || h === '/recent' || h === '/favorites' || h === '/search') {
    location.hash = '/';
  } else {
    history.back();
  }
}

function updateBackButton() {
  const h = state.currentRoute || '/';
  const btn = document.getElementById('backBtn');
  if (!btn) return;
  btn.hidden = (h === '/' || h === '');
}

function renderRoute() {
  const hash = state.currentRoute || '/';

  // Close viewer first if route changed away from /view/
  if (!hash.startsWith('/view/')) closeViewer(true);

  // Visibility of the global Retour button
  updateBackButton();

  // sidebar active state
  document.querySelectorAll('.chap, .side-link').forEach(el => el.classList.remove('active'));

  if (hash === '/' || hash === '') {
    renderHome();
  } else if (hash.startsWith('/chapter/')) {
    const id = decodeURIComponent(hash.slice('/chapter/'.length));
    renderChapter(id);
  } else if (hash.startsWith('/view/')) {
    const parts = hash.slice('/view/'.length).split('/');
    const cid = decodeURIComponent(parts[0] || '');
    const idx = parseInt(parts[1] || '0', 10);
    renderChapter(cid, { silent: true });
    openViewer(cid, idx);
  } else if (hash === '/recent') {
    document.querySelector('.side-link[data-route="recent"]').classList.add('active');
    renderRecent();
  } else if (hash === '/favorites') {
    document.querySelector('.side-link[data-route="favorites"]').classList.add('active');
    renderFavorites();
  } else if (hash === '/search') {
    renderSearch();
  } else {
    renderHome();
  }

  // close mobile menu after navigation
  if (window.innerWidth < 980) toggleMenu(false);
}

// ----------------------------- Sidebar ---------------------------------
function renderSidebar() {
  const nav = document.getElementById('chapterNav');
  nav.innerHTML = state.manifest.chapters.map(ch => {
    const numLbl = ch.number ? String(ch.number).padStart(2, '0') : '★';
    return `<a class="chap" href="#/chapter/${encodeURIComponent(ch.id)}" data-id="${escapeAttr(ch.id)}">
      <span class="num">${numLbl}</span>
      <span class="label"><span>${escapeHtml(ch.title)}</span></span>
      <span class="count">${ch.items.length}</span>
    </a>`;
  }).join('');
}

function highlightSidebar(id) {
  document.querySelectorAll('.chap').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

// ----------------------------- Hero decoration -------------------------
// Math symbol "constellation" filling the right side of the hero.
// Mix of single glyphs, short identities and full classic formulas.
function heroDeco() {
  // Notations and formulas restricted to the Première Spécialité Maths
  // programme — no Terminale-only or higher-ed concepts (no integrals,
  // complex numbers, set theory, partial derivatives, etc.).
  const glyphs = [
    'π', 'e',                                                 // constantes au programme
    '∞',                                                       // limites
    '∑', '√',                                                  // sommes & racines
    '+', '−', '×', '÷', '±', '=', '≠', '≈', '≤', '≥', '<', '>', '!',
    '∩', '∪',                                                  // intersection/union (proba)
    '°',                                                       // degrés
    '→',                                                       // limite / tend vers
    'θ',                                                       // angle (trigo)
    'Δ',                                                       // discriminant
  ];
  // Formules — exclusivement du programme de Première Spécialité
  const formulas = [
    'a² + b² = c²',
    'Δ = b² − 4ac',
    'x = (−b ± √Δ) / (2a)',
    'sin² + cos² = 1',
    'f\'(x) = lim (h→0) (f(x+h)−f(x))/h',
    '(u·v)\' = u\'v + uv\'',
    '(u/v)\' = (u\'v − uv\')/v²',
    '(eˣ)\' = eˣ',
    '(ln x)\' = 1/x',
    'ln(ab) = ln(a) + ln(b)',
    'e^(a+b) = eᵃ·eᵇ',
    'ln(eˣ) = x',
    'cos(2x) = 1 − 2 sin²(x)',
    'tan θ = sin θ / cos θ',
    '1 + 2 + … + n = n(n+1)/2',
    'P(B|A) = P(A∩B)/P(A)',
    'P(A∪B) = P(A) + P(B) − P(A∩B)',
    'u·v = ‖u‖·‖v‖·cos θ',
    '‖u‖ = √(x² + y²)',
    '‖u + v‖² = ‖u‖² + 2 u·v + ‖v‖²',
    'E(X) = Σ xᵢ · P(X = xᵢ)',
    'V(X) = E(X²) − E(X)²',
    'σ(X) = √V(X)',
    'C(n,k) = n! / (k!(n−k)!)',
    'P(X=k) = C(n,k)·pᵏ(1−p)ⁿ⁻ᵏ',
    'E(B(n,p)) = np',
    'V(B(n,p)) = np(1−p)',
    'uₙ = u₀ + n·r',
    'uₙ = u₀ · qⁿ',
    'Σ uₙ = (n+1)(u₀ + uₙ)/2',
    'y = ax + b',
    'ax + by + c = 0',
    'lim eˣ/x = +∞',
    'lim ln x / x = 0',
    '(a + b)² = a² + 2ab + b²',
    '(a − b)² = a² − 2ab + b²',
    '(a + b)(a − b) = a² − b²',
    'ax² + bx + c',
    'a(x − α)² + β',
    'cos(π − x) = −cos x',
    'sin(π − x) = sin x',
    'cos(π/2 − x) = sin x',
  ];

  const rand = mulberry32(0xC0FFEE);
  const pieces = [];

  // 1) Big single-glyph anchors (very faint)
  const bigGlyphs = ['∑', 'π', '∞', '√', 'Δ', 'e', 'θ'];
  for (let i = 0; i < bigGlyphs.length; i++) {
    pieces.push({
      text: bigGlyphs[i],
      x: 15 + rand() * 75,
      y: 5 + rand() * 90,
      size: 80 + rand() * 80,
      rot: -18 + rand() * 36,
      tier: rand() < .4 ? 't3' : 't4',
      cls: 'serif',
    });
  }

  // 2) Mid-size short formulas (more legible)
  for (let i = 0; i < 18; i++) {
    pieces.push({
      text: formulas[Math.floor(rand() * formulas.length)],
      x: 5 + rand() * 90,
      y: 4 + rand() * 90,
      size: 14 + rand() * 18,
      rot: -12 + rand() * 24,
      tier: rand() < .35 ? 't2' : 't3',
    });
  }

  // 3) Small single glyphs sprinkled everywhere
  for (let i = 0; i < 64; i++) {
    pieces.push({
      text: glyphs[Math.floor(rand() * glyphs.length)],
      x: rand() * 100,
      y: rand() * 100,
      size: 14 + rand() * 22,
      rot: -25 + rand() * 50,
      tier: ['t1','t2','t3'][Math.floor(rand() * 3)],
    });
  }

  const html = pieces.map(p => {
    const style = `top:${p.y.toFixed(2)}%;left:${p.x.toFixed(2)}%;font-size:${p.size.toFixed(1)}px;transform:translate(-50%,-50%) rotate(${p.rot.toFixed(1)}deg);`;
    const cls = `m ${p.tier}${p.cls ? ' ' + p.cls : ''}`;
    return `<span class="${cls}" style="${style}">${escapeHtml(p.text)}</span>`;
  }).join('');
  return `<div class="hero-deco" aria-hidden="true">${html}</div>`;
}

// Tiny deterministic PRNG (Mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ----------------------------- Home ------------------------------------
function renderHome() {
  const totalItems = state.flatItems.length;
  const totalChapters = state.manifest.chapters.filter(c => c.number > 0).length;
  const totalSlides = state.flatItems.filter(i => i.category === 'diaporama').length;
  const totalAnnales = state.flatItems.filter(i => i.category === 'annales').length;
  const totalCours = state.flatItems.filter(i => ['cours','fiche'].includes(i.category)).length;
  const totalSize = state.flatItems.reduce((s, i) => s + (i.sizeKB || 0), 0);

  const recent = getRecent().slice(0, 6);
  const favs = getFavorites().slice(0, 6);

  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="main-inner">
      <section class="hero">
        ${heroDeco()}
        <div class="eyebrow">Programme · Première · Spécialité</div>
        <h1>Toutes les <span class="gold">mathématiques</span><br>en un seul endroit.</h1>
        <p>Cours, diaporamas, exercices et annales — organisés chapitre par chapitre,
        consultables hors-ligne sur n'importe quel appareil.</p>
        <div class="hero-stats">
          <div class="stat"><div class="v">${totalChapters}</div><div class="l">Chapitres</div></div>
          <div class="stat"><div class="v">${totalItems}</div><div class="l">Documents</div></div>
          <div class="stat"><div class="v">${totalSlides}</div><div class="l">Diaporamas</div></div>
          <div class="stat"><div class="v">${totalCours}</div><div class="l">Cours & fiches</div></div>
          <div class="stat"><div class="v">${totalAnnales}</div><div class="l">Annales</div></div>
          <div class="stat"><div class="v">${formatSize(totalSize)}</div><div class="l">Total</div></div>
        </div>
      </section>

      ${recent.length ? `
      <section class="section">
        <div class="section-head">
          <h2>Reprendre</h2>
          <a href="#/recent" class="right">Tout voir →</a>
        </div>
        <div class="items-grid">
          ${recent.map(itemCard).join('')}
        </div>
      </section>` : ''}

      ${favs.length ? `
      <section class="section">
        <div class="section-head">
          <h2>Favoris</h2>
          <a href="#/favorites" class="right">Tout voir →</a>
        </div>
        <div class="items-grid">
          ${favs.map(itemCard).join('')}
        </div>
      </section>` : ''}

      <section class="section">
        <div class="section-head">
          <h2>Tous les chapitres</h2>
          <span class="right">${totalChapters} chapitres + annales</span>
        </div>
        <div class="chap-grid">
          ${state.manifest.chapters.map(chapterCard).join('')}
        </div>
      </section>

      <section class="trivia-section">
        <div class="trivia-card" id="triviaCard" tabindex="0" role="button" aria-label="Afficher un autre fait mathématique">
          <div class="trivia-eyebrow">
            <span class="trivia-spark">✦</span>
            <span>Le savais-tu ?</span>
            <span class="trivia-counter" id="triviaCounter"></span>
          </div>
          <p class="trivia-text" id="triviaText">${escapeHtml(pickTrivia())}</p>
          <div class="trivia-foot">
            <span class="trivia-hint">Touche pour découvrir un autre fait</span>
            <span class="trivia-symbols" aria-hidden="true">π · e · φ · ∑ · ∫</span>
          </div>
        </div>
      </section>
    </div>
  `;
  bindCardClicks();
  // Wire trivia card
  const tc = document.getElementById('triviaCard');
  if (tc) {
    tc.addEventListener('click', refreshTrivia);
    tc.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); refreshTrivia(); }
    });
    updateTriviaCounter();
  }
}

// =========== Trivia ============
function pickTrivia() {
  // Cycle through TRIVIA in a random shuffled order, never repeating
  // until all have been seen. Persist the queue + seen list in sessionStorage
  // so reloading within the session keeps progress, but a fresh visit restarts.
  let queue;
  try { queue = JSON.parse(sessionStorage.getItem('mp1.triviaQueue') || 'null'); } catch { queue = null; }
  if (!queue || !queue.length) {
    queue = shuffleIndices(TRIVIA.length);
  }
  const i = queue.shift();
  sessionStorage.setItem('mp1.triviaQueue', JSON.stringify(queue));
  sessionStorage.setItem('mp1.triviaSeen', String((parseInt(sessionStorage.getItem('mp1.triviaSeen') || '0', 10)) + 1));
  return TRIVIA[i];
}
function refreshTrivia() {
  const txt = document.getElementById('triviaText');
  if (!txt) return;
  txt.style.opacity = '0';
  txt.style.transform = 'translateY(6px)';
  setTimeout(() => {
    txt.textContent = pickTrivia();
    txt.style.opacity = '';
    txt.style.transform = '';
    updateTriviaCounter();
  }, 180);
}
function updateTriviaCounter() {
  const c = document.getElementById('triviaCounter');
  if (!c) return;
  const seen = parseInt(sessionStorage.getItem('mp1.triviaSeen') || '0', 10);
  c.textContent = `${seen} / ${TRIVIA.length}`;
}
function shuffleIndices(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function chapterCard(ch) {
  const isAnnales = !ch.number;
  return `<a class="chap-card" href="#/chapter/${encodeURIComponent(ch.id)}">
    <div class="card-top">
      <div class="card-num">${isAnnales ? '★' : String(ch.number).padStart(2, '0')}</div>
      <div class="card-cat">${isAnnales ? 'Sujets de bac' : 'Chapitre'}</div>
    </div>
    <h3>${escapeHtml(ch.title)}</h3>
    <div class="card-meta">
      <span>${ch.items.length} document${ch.items.length > 1 ? 's' : ''}</span>
      <span class="dot"></span>
      <span>${formatSize(ch.items.reduce((s, i) => s + (i.sizeKB || 0), 0))}</span>
    </div>
  </a>`;
}

// ----------------------------- Chapter-specific decoration -------------
// Per-chapter list of glyphs + short formulas to scatter behind the chapter
// header — gives each page its own mathematical "skin".
const CHAPTER_DECO_DATA = {
  1: { // Second degré
    big:    ['Δ', 'a', 'b', 'c'],
    items:  ['Δ = b² − 4ac', 'x = (−b ± √Δ)/(2a)', 'ax² + bx + c', 'a(x − α)² + β',
             'x₁ + x₂ = −b/a', 'x₁ · x₂ = c/a', '(a + b)² = a² + 2ab + b²', '(a − b)(a + b) = a² − b²']
  },
  2: { // Suites
    big:    ['uₙ', 'r', 'q', '∑'],
    items:  ['uₙ = u₀ + n·r', 'uₙ = u₀ · qⁿ', 'uₙ₊₁ = uₙ + r', 'uₙ₊₁ = q · uₙ',
             '1 + 2 + … + n = n(n+1)/2', 'Σ = (n+1)(u₀ + uₙ)/2', 'lim qⁿ = 0 si |q| < 1']
  },
  3: { // Dérivation
    big:    ['f\'', 'lim', 'eˣ', 'ln'],
    items:  ['f\'(x) = lim (h→0) (f(x+h)−f(x))/h', '(xⁿ)\' = n·xⁿ⁻¹', '(eˣ)\' = eˣ', '(ln x)\' = 1/x',
             '(u·v)\' = u\'v + uv\'', '(u/v)\' = (u\'v − uv\')/v²', '(cos x)\' = −sin x', '(sin x)\' = cos x',
             'y = f\'(a)(x − a) + f(a)']
  },
  4: { // Géométrie repérée
    big:    ['→', '‖·‖', 'AB'],
    items:  ['‖AB‖ = √((x_B − x_A)² + (y_B − y_A)²)', 'AB(x_B − x_A ; y_B − y_A)',
             'y = mx + p', 'ax + by + c = 0', 'm = (y_B − y_A)/(x_B − x_A)',
             'm·m\' = −1', 'I = ((x_A+x_B)/2 ; (y_A+y_B)/2)', 'xy\' − x\'y = 0']
  },
  5: { // Probabilité conditionnelle
    big:    ['P', '∩', '∪'],
    items:  ['P(B|A) = P(A∩B)/P(A)', 'P(A∪B) = P(A) + P(B) − P(A∩B)',
             'P(B) = P(A)·P(B|A) + P(A‾)·P(B|A‾)', 'P(A|B) = P(B|A)·P(A)/P(B)',
             'P(A∩B) = P(A)·P(B)', '0 ≤ P(A) ≤ 1', 'P(A‾) = 1 − P(A)']
  },
  6: { // Étude de fonctions par la dérivation
    big:    ['f\'', '↗', '↘'],
    items:  ['f\'(x) > 0 ⟹ f croissante', 'f\'(x) < 0 ⟹ f décroissante',
             'f\'(x₀) = 0 ⟹ extremum local', 'TVI : f continue, f(a)·f(b) < 0',
             'lim eˣ/x = +∞', 'lim ln x / x = 0', 'tableau de variations']
  },
  7: { // Cosinus et Sinus
    big:    ['cos', 'sin', 'π', 'θ'],
    items:  ['cos²x + sin²x = 1', 'cos(−x) = cos x', 'sin(−x) = −sin x',
             'cos(π − x) = −cos x', 'sin(π − x) = sin x', 'cos(π/2 − x) = sin x',
             'tan θ = sin θ / cos θ', 'cos(π/3) = 1/2', 'sin(π/6) = 1/2',
             'cos(π/4) = √2/2', 'cos(2x) = 1 − 2 sin² x', '2π = 360°']
  },
  8: { // Fonction exponentielle
    big:    ['eˣ', 'e', 'ln'],
    items:  ['e⁰ = 1', 'e^(a+b) = eᵃ · eᵇ', 'e^(a−b) = eᵃ/eᵇ', '(eᵃ)ⁿ = e^(na)',
             'e^(−a) = 1/eᵃ', '(eˣ)\' = eˣ', '(e^u)\' = u\'·e^u',
             'lim eˣ = +∞ en +∞', 'lim eˣ = 0 en −∞', 'lim eˣ/x = +∞',
             'ln(eˣ) = x', 'eˣ > 0']
  },
  9: { // Variable aléatoire
    big:    ['E(X)', 'V(X)', 'σ', 'B(n,p)'],
    items:  ['E(X) = Σ xᵢ · P(X = xᵢ)', 'V(X) = E(X²) − E(X)²', 'σ(X) = √V(X)',
             'E(aX + b) = a·E(X) + b', 'V(aX + b) = a² · V(X)',
             'P(X = k) = C(n,k) · pᵏ(1−p)ⁿ⁻ᵏ', 'E(B(n,p)) = np', 'V(B(n,p)) = np(1−p)',
             'C(n,k) = n!/(k!(n−k)!)']
  },
  10: { // Produit scalaire
    big:    ['u·v', 'cos θ', '‖u‖', '⊥'],
    items:  ['u·v = xx\' + yy\'', 'u·v = ‖u‖·‖v‖·cos θ', '‖u‖ = √(x² + y²)',
             '‖u‖² = u·u', 'u ⊥ v ⟺ u·v = 0',
             '‖u + v‖² = ‖u‖² + 2 u·v + ‖v‖²', '(u + v)·(u − v) = ‖u‖² − ‖v‖²',
             'a² = b² + c² − 2bc · cos Â']
  },
  0: { // Annales
    big:    ['★', 'Bac', 'Spé'],
    items:  ['sujets corrigés', 'épreuves d\'annales', 'révisions bac blanc',
             'Δ · racines · variations', 'P(B|A) · B(n,p)', 'u·v · ‖u‖ · cos θ']
  },
};

function chapterDeco(ch) {
  if (!ch) return '';
  const data = CHAPTER_DECO_DATA[ch.number || 0] || { big: ['∑'], items: [] };
  const rand = mulberry32(0xBADC + (ch.number || 0) * 17);
  const pieces = [];
  // 3-4 big anchor glyphs (very subtle)
  for (let i = 0; i < data.big.length; i++) {
    pieces.push({
      text: data.big[i],
      x: 30 + rand() * 65,
      y: 5 + rand() * 90,
      size: 60 + rand() * 50,
      rot: -12 + rand() * 24,
      tier: rand() < .4 ? 't3' : 't4',
    });
  }
  // Formula scatter
  for (let i = 0; i < 18; i++) {
    const t = data.items[Math.floor(rand() * data.items.length)] || '';
    if (!t) continue;
    pieces.push({
      text: t,
      x: 5 + rand() * 90,
      y: 4 + rand() * 90,
      size: 12 + rand() * 14,
      rot: -10 + rand() * 20,
      tier: rand() < .3 ? 't2' : 't3',
    });
  }
  const html = pieces.map(p => {
    const style = `top:${p.y.toFixed(2)}%;left:${p.x.toFixed(2)}%;font-size:${p.size.toFixed(1)}px;transform:translate(-50%,-50%) rotate(${p.rot.toFixed(1)}deg);`;
    return `<span class="m ${p.tier}" style="${style}">${escapeHtml(p.text)}</span>`;
  }).join('');
  return `<div class="chapter-deco" aria-hidden="true">${html}</div>`;
}

// ----------------------------- Chapter detail --------------------------
function renderChapter(id, opts = {}) {
  const ch = state.manifest.chapters.find(c => c.id === id);
  if (!ch) { renderHome(); return; }
  state.currentChapter = ch;
  highlightSidebar(id);

  if (opts.silent) return; // viewer being opened, don't redraw main

  const counts = {};
  ch.items.forEach(i => counts[i.category] = (counts[i.category] || 0) + 1);
  const cats = Object.keys(counts);
  const active = state.catFilter && cats.includes(state.catFilter) ? state.catFilter : null;

  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="main-inner">
      <div class="chapter-head">
        ${chapterDeco(ch)}
        <div class="crumb">
          <a href="#/">Accueil</a><span class="sep">/</span><span>Chapitre ${ch.number || '★'}</span>
        </div>
        <h1>
          <span class="badge">${ch.number ? String(ch.number).padStart(2,'0') : '★'}</span>
          ${escapeHtml(ch.title)}
        </h1>
        <p>${ch.items.length} document${ch.items.length > 1 ? 's' : ''} · ${formatSize(ch.items.reduce((s,i)=>s+(i.sizeKB||0),0))}</p>
      </div>
      ${cats.length > 1 ? `
        <div class="cat-pills">
          <button class="pill ${active ? '' : 'active'}" data-cat="">Tous <span class="n">${ch.items.length}</span></button>
          ${cats.map(c => `<button class="pill ${active === c ? 'active' : ''}" data-cat="${escapeAttr(c)}">${escapeHtml(CATEGORIES[c]?.label || c)}<span class="n">${counts[c]}</span></button>`).join('')}
        </div>
      ` : ''}
      <div class="items-grid">
        ${ch.items
            .filter(i => !active || i.category === active)
            .map((it, idx) => itemCard({ ...it, _idx: ch.items.indexOf(it) }))
            .join('')}
      </div>
    </div>
  `;
  main.querySelectorAll('.pill').forEach(p => p.addEventListener('click', () => {
    state.catFilter = p.dataset.cat || null;
    renderChapter(id);
  }));
  bindCardClicks();
  // start lazy thumbnail rendering
  requestAnimationFrame(() => renderItemThumbs(main));
}

function itemCard(it, opts = {}) {
  const cat = it.category;
  const catLabel = CATEGORIES[cat]?.label || cat;
  const isGgb = it.kind === 'ggb';
  // Look up the canonical index in the manifest by URL (cards on Recents/Favorites
  // pages have *copies* of the item, so identity-based indexOf fails).
  const chId  = it.chapterId || state.currentChapter?.id || '';
  const ch    = state.manifest.chapters.find(c => c.id === chId);
  let idx     = it._idx;
  if (idx === undefined && ch) {
    const baseUrl = (u) => (u || '').split('?')[0];
    idx = ch.items.findIndex(x => baseUrl(x.url) === baseUrl(it.url));
    if (idx < 0) idx = 0;
  }
  if (idx === undefined) idx = 0;

  const href = isGgb
    ? it.url
    : `#/view/${encodeURIComponent(chId)}/${idx}`;
  const removeBtn = opts.removable
    ? `<button class="card-remove" data-url="${escapeAttr(it.url)}" aria-label="Retirer des favoris" title="Retirer des favoris">
         <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
       </button>` : '';
  const tag = isGgb ? 'a' : 'a';
  const dl  = isGgb ? `download` : '';

  const favOn = isFav(it.url);
  const starBtn = isGgb ? '' : `
    <button class="card-star ${favOn ? 'on' : ''}" data-url="${escapeAttr(it.url)}" data-fav-payload='${escapeAttr(JSON.stringify({ url: it.url, label: it.label, title: it.title, category: it.category, kind: it.kind, chapterId: chId, chapterTitle: it.chapterTitle || ch?.title, chapterNumber: it.chapterNumber || ch?.number, sizeKB: it.sizeKB, originalUrl: it.originalUrl }))}' aria-label="${favOn ? 'Retirer des favoris' : 'Ajouter aux favoris'}" title="${favOn ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m12 4 2.5 5.1 5.6.8-4.1 4 .9 5.6L12 16.9 6.9 19.5l.9-5.6-4-4 5.6-.8L12 4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="${favOn ? 'currentColor' : 'none'}"/>
      </svg>
    </button>`;

  return `<${tag} class="item-card" href="${href}" ${dl} data-cat="${escapeAttr(cat)}" data-url="${escapeAttr(it.url)}" data-pages-target>
    <div class="item-preview" data-pdf="${isGgb ? '' : escapeAttr(it.url)}">
      ${isGgb ? `<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>` : `<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>`}
      <span class="badge-cat">${escapeHtml(catLabel)}</span>
      ${starBtn}
      ${removeBtn}
    </div>
    <div class="item-body">
      <h4>${escapeHtml(it.title || it.label)}</h4>
      <div class="item-meta">
        <span class="pages-count">${isGgb ? 'GeoGebra' : '…'}</span>
        <span class="dot"></span>
        <span>${formatSize(it.sizeKB || 0)}</span>
        ${it.chapterTitle && !state.currentChapter ? `<span class="dot"></span><span>${escapeHtml(it.chapterTitle)}</span>` : ''}
      </div>
    </div>
  </${tag}>`;
}

// Lazy-render a meaningful page of each PDF as a thumbnail using IntersectionObserver.
// We skip the cover/title slide (which is often just a "ruled paper" template) by
// preferring page 2 when available — gives a more representative preview.
function renderItemThumbs(root) {
  const previews = root.querySelectorAll('.item-preview[data-pdf]');
  if (!previews.length) return;
  const io = new IntersectionObserver(async entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const url = e.target.dataset.pdf;
      if (!url) continue;
      try {
        const doc = await pdfjsLib.getDocument(url).promise;
        // Pick a representative page: page 2 if it exists, else page 1
        const pageNum = doc.numPages >= 2 ? 2 : 1;
        const page = await doc.getPage(pageNum);
        const vp = page.getViewport({ scale: 1 });
        const targetW = e.target.clientWidth || 320;
        const scale = (targetW * (window.devicePixelRatio || 1)) / vp.width;
        const vp2 = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = vp2.width;
        canvas.height = vp2.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'cover';
        canvas.style.objectPosition = 'top';
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport: vp2 }).promise;
        e.target.querySelector('.placeholder')?.remove();
        e.target.prepend(canvas);
        const card = e.target.closest('.item-card');
        const pc = card?.querySelector('.pages-count');
        if (pc) pc.textContent = doc.numPages + ' page' + (doc.numPages > 1 ? 's' : '');
        doc.cleanup();
      } catch (err) {
        // leave placeholder
      }
    }
  }, { rootMargin: '200px 0px', threshold: 0.05 });
  previews.forEach(p => io.observe(p));
}

function bindCardClicks() {
  // Wire the star buttons on item cards (anywhere they appear)
  document.querySelectorAll('.card-star').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      let payload;
      try { payload = JSON.parse(btn.dataset.favPayload || '{}'); }
      catch { payload = { url: btn.dataset.url }; }
      const added = toggleFav(payload);
      btn.classList.toggle('on', added);
      btn.querySelector('path').setAttribute('fill', added ? 'currentColor' : 'none');
      btn.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
      btn.setAttribute('title',      added ? 'Retirer des favoris' : 'Ajouter aux favoris');
      toast(added ? 'Ajouté aux favoris' : 'Retiré des favoris');
      // If we're currently on the favorites page, refresh
      if ((state.currentRoute || '/') === '/favorites') renderFavorites();
    });
  });
}

// ----------------------------- Recent / Favorites / Search -------------
function renderRecent() {
  const recent = getRecent();
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="main-inner">
      <div class="chapter-head">
        <div class="crumb"><a href="#/">Accueil</a><span class="sep">/</span><span>Récents</span></div>
        <h1><span class="badge">⟲</span> Récemment ouverts</h1>
        <p>${recent.length} document${recent.length > 1 ? 's' : ''} consulté${recent.length > 1 ? 's' : ''} récemment.</p>
      </div>
      ${recent.length === 0 ? `<div class="empty"><h3>Aucun document récent</h3><p>Ouvrez un cours ou un exercice pour commencer.</p></div>` : `<div class="items-grid">${recent.map(itemCard).join('')}</div>`}
    </div>`;
  requestAnimationFrame(() => renderItemThumbs(main));
}

function renderFavorites() {
  const favs = getFavorites();
  const main = document.getElementById('main');
  main.innerHTML = `
    <div class="main-inner">
      <div class="chapter-head">
        <div class="crumb"><a href="#/">Accueil</a><span class="sep">/</span><span>Favoris</span></div>
        <h1><span class="badge">★</span> Favoris</h1>
        <p>${favs.length} document${favs.length > 1 ? 's' : ''} marqué${favs.length > 1 ? 's' : ''} comme favori${favs.length > 1 ? 's' : ''}.</p>
      </div>
      ${favs.length === 0
        ? `<div class="empty"><h3>Aucun favori</h3><p>Marquez un document avec l'étoile dans le viewer.</p></div>`
        : `<div class="items-grid">${favs.map(it => itemCard(it, { removable: true })).join('')}</div>`}
    </div>`;
  // Wire the remove buttons
  main.querySelectorAll('.card-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const url = btn.dataset.url;
      let favs2 = getFavorites().filter(i => i.url !== url);
      localStorage.setItem(STORE.FAVS, JSON.stringify(favs2));
      toast('Retiré des favoris');
      renderFavorites();
    });
  });
  requestAnimationFrame(() => renderItemThumbs(main));
}

function renderSearch() {
  const q = state.search.toLowerCase();
  const main = document.getElementById('main');
  if (!q) { renderHome(); return; }
  const results = state.flatItems.filter(it => {
    return (
      it.title?.toLowerCase().includes(q) ||
      it.label?.toLowerCase().includes(q) ||
      it.chapterTitle?.toLowerCase().includes(q) ||
      it.category?.toLowerCase().includes(q)
    );
  });
  // Also matching chapters
  const chs = state.manifest.chapters.filter(c =>
    c.title.toLowerCase().includes(q) || String(c.number).includes(q)
  );

  main.innerHTML = `
    <div class="main-inner">
      <div class="chapter-head">
        <div class="crumb"><a href="#/">Accueil</a><span class="sep">/</span><span>Recherche</span></div>
        <h1><span class="badge">⌕</span> "${escapeHtml(state.search)}"</h1>
        <p>${results.length} document${results.length > 1 ? 's' : ''} · ${chs.length} chapitre${chs.length > 1 ? 's' : ''}</p>
      </div>
      ${chs.length ? `
        <div class="section">
          <div class="section-head"><h2>Chapitres</h2></div>
          <div class="chap-grid">${chs.map(chapterCard).join('')}</div>
        </div>` : ''}
      ${results.length ? `
        <div class="section">
          <div class="section-head"><h2>Documents</h2></div>
          <div class="items-grid">${results.map(itemCard).join('')}</div>
        </div>` : ''}
      ${(!results.length && !chs.length) ? `<div class="empty"><h3>Aucun résultat</h3><p>Essayez avec un autre terme.</p></div>` : ''}
    </div>`;
  requestAnimationFrame(() => renderItemThumbs(main));
}

// ----------------------------- Viewer ----------------------------------
async function openViewer(chapterId, idx) {
  const ch = state.manifest.chapters.find(c => c.id === chapterId);
  if (!ch) return;
  const item = ch.items[idx];
  if (!item) return;
  if (item.kind === 'ggb') {
    // download instead
    window.location.href = item.url;
    return;
  }
  state.currentItem = item;
  state.currentChapter = ch;
  state.page = 1;
  state.pageCanvases.clear();
  state.thumbsRendered.clear();
  state.zoomMode = localStorage.getItem(STORE.ZOOM) || 'fit';
  state.zoomScale = 1;

  // Save to recents
  pushRecent(item);

  // Show viewer
  const viewer = document.getElementById('viewer');
  viewer.hidden = false;
  viewer.setAttribute('aria-hidden', 'false');
  // Restore thumbnail panel preference (default: off for cleaner presentation feel)
  const thumbsPref = localStorage.getItem('mp1.thumbs') || 'off';
  viewer.classList.toggle('thumbs-off', thumbsPref === 'off');
  document.getElementById('vThumbsToggle').classList.toggle('active', thumbsPref === 'on');
  document.getElementById('vTitle').textContent = item.title || item.label;
  document.getElementById('vDownload').href = item.url;
  document.getElementById('vDownload').setAttribute('download', (item.title || item.label) + '.pdf');
  const dlOrig = document.getElementById('vDownloadOrig');
  if (item.originalUrl) {
    dlOrig.hidden = false;
    dlOrig.href = item.originalUrl;
    dlOrig.setAttribute('download', (item.title || item.label) + '.pptx');
  } else {
    dlOrig.hidden = true;
  }
  document.getElementById('vCanvasWrap').innerHTML = '';
  document.getElementById('vThumbs').innerHTML = '';
  syncFavButton();

  try {
    const loadingTask = pdfjsLib.getDocument(item.url);
    state.pdf = await loadingTask.promise;
    state.pageCount = state.pdf.numPages;
    document.getElementById('vPages').textContent = state.pageCount;
    document.getElementById('vPage').max = state.pageCount;

    // Build one slot per page; the slot fills the viewport, the canvas fits inside.
    const wrap = document.getElementById('vCanvasWrap');
    for (let p = 1; p <= state.pageCount; p++) {
      const slot = document.createElement('div');
      slot.className = 'slide-slot';
      slot.dataset.page = p;
      slot.dataset.loading = 'true';
      slot.addEventListener('click', onSlotClick);
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      canvas.dataset.page = p;
      slot.appendChild(canvas);
      // Hover side nav arrows (clickable button — works on PC and touch)
      const navL = document.createElement('button');
      navL.type = 'button';
      navL.className = 'slot-nav left';
      navL.setAttribute('aria-label', 'Diapo précédente');
      navL.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
      navL.addEventListener('click', (e) => { e.stopPropagation(); gotoPage(nextVisiblePage(state.page, -1)); });
      const navR = document.createElement('button');
      navR.type = 'button';
      navR.className = 'slot-nav right';
      navR.setAttribute('aria-label', 'Diapo suivante');
      navR.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';
      navR.addEventListener('click', (e) => { e.stopPropagation(); gotoPage(nextVisiblePage(state.page, +1)); });
      slot.appendChild(navL);
      slot.appendChild(navR);
      wrap.appendChild(slot);
      state.pageCanvases.set(p, canvas);
    }
    // Render thumbnails column
    renderThumbsAll();
    // Render visible pages
    observePages();
    state.page = 1;
    renderPage(1);
    updatePageInput();
  } catch (e) {
    document.getElementById('vCanvasWrap').innerHTML =
      `<div class="empty"><h3>Erreur de chargement</h3><p>${escapeHtml(e.message)}</p></div>`;
  }
}

function closeViewer(silent = false) {
  const viewer = document.getElementById('viewer');
  if (viewer.hidden) return;
  viewer.hidden = true;
  viewer.setAttribute('aria-hidden', 'true');
  if (state.pdf) { try { state.pdf.cleanup(); state.pdf.destroy(); } catch {} }
  state.pdf = null;
  state.currentItem = null;
  state.pageCanvases.clear();
  state.thumbsRendered.clear();
  if (!silent && location.hash.startsWith('#/view/')) {
    if (state.currentChapter) location.hash = '/chapter/' + encodeURIComponent(state.currentChapter.id);
    else location.hash = '/';
  }
}

function renderThumbsAll() {
  const container = document.getElementById('vThumbs');
  container.innerHTML = '';
  for (let p = 1; p <= state.pageCount; p++) {
    const t = document.createElement('button');
    t.className = 'thumb';
    t.dataset.page = p;
    t.innerHTML = `<canvas></canvas><span class="n">${p}</span>`;
    t.addEventListener('click', () => gotoPage(p));
    container.appendChild(t);
  }
  // Observe & render thumbs lazily
  const io = new IntersectionObserver(async (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      const p = parseInt(e.target.dataset.page, 10);
      if (state.thumbsRendered.has(p)) continue;
      state.thumbsRendered.add(p);
      try {
        const page = await state.pdf.getPage(p);
        const vp = page.getViewport({ scale: 1 });
        const targetW = 120 * (window.devicePixelRatio || 1);
        const scale = targetW / vp.width;
        const vp2 = page.getViewport({ scale });
        const canvas = e.target.querySelector('canvas');
        canvas.width = vp2.width;
        canvas.height = vp2.height;
        canvas.style.aspectRatio = `${vp2.width} / ${vp2.height}`;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp2 }).promise;
      } catch {}
    }
  }, { root: container, rootMargin: '300px 0px', threshold: 0.01 });
  container.querySelectorAll('.thumb').forEach(t => io.observe(t));
}

function observePages() {
  const scroll = document.getElementById('vScroll');
  // Render-trigger observer with horizontal margin so adjacent slides preload
  const ioRender = new IntersectionObserver(async (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const p = parseInt(e.target.dataset.page, 10);
        renderPage(p);
      }
    }
  }, { root: scroll, rootMargin: '0px 200% 0px 200%', threshold: 0.01 });
  // Active-page detection: which slot is most visible horizontally
  const ioActive = new IntersectionObserver((entries) => {
    if (state.suppressActiveUpdate && Date.now() < state.suppressActiveUpdate) return;
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best && best.intersectionRatio > 0.5) {
      const p = parseInt(best.target.dataset.page, 10);
      if (state.page !== p) {
        state.page = p;
        updatePageInput();
        updateActiveThumb();
      }
    }
  }, { root: scroll, threshold: [0, 0.5, 0.8, 1] });
  // Observe SLOTS (the canvases now live inside slots)
  document.querySelectorAll('.slide-slot').forEach(slot => {
    ioRender.observe(slot);
    ioActive.observe(slot);
  });
}

async function renderPage(p) {
  const canvas = state.pageCanvases.get(p);
  if (!canvas || canvas.dataset.rendered) return;
  canvas.dataset.rendered = 'true';
  try {
    const page = await state.pdf.getPage(p);
    const slot = canvas.parentElement;
    const slotRect = slot.getBoundingClientRect();
    const cs = getComputedStyle(slot);
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop)  + parseFloat(cs.paddingBottom);
    const availW = Math.max(100, slotRect.width  - padX);
    const availH = Math.max(100, slotRect.height - padY);
    const vp1 = page.getViewport({ scale: 1 });
    const isZoomed = state.zoomMode !== 'fit';
    let scale;
    if (!isZoomed) {
      scale = Math.min(availW / vp1.width, availH / vp1.height);
    } else {
      // Zoom scale is the multiplier *relative to fit*, so zoom 1× = fit,
      // zoom 1.5× = 50% bigger than fit, etc.
      const fitScale = Math.min(availW / vp1.width, availH / vp1.height);
      scale = fitScale * state.zoomScale;
    }
    if (!isFinite(scale) || scale <= 0) scale = 1;
    const dpr = window.devicePixelRatio || 1;
    const vp = page.getViewport({ scale: scale * dpr });
    canvas.width = vp.width;
    canvas.height = vp.height;
    if (isZoomed) {
      // Explicit pixel size + overflow allowed
      canvas.style.aspectRatio = '';
      canvas.style.width  = (vp.width  / dpr) + 'px';
      canvas.style.height = (vp.height / dpr) + 'px';
    } else {
      // CSS handles size via aspect-ratio + max-width/height inside slot
      canvas.style.aspectRatio = `${vp1.width} / ${vp1.height}`;
      canvas.style.width  = '';
      canvas.style.height = '';
    }
    slot.classList.toggle('zoomed', isZoomed);
    delete slot.dataset.loading;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  } catch (e) {
    delete canvas.dataset.rendered;
  }
}

function onSlotClick(e) {
  if (e.target.closest('.slot-nav')) return;
  const slot = e.currentTarget;
  const r = slot.getBoundingClientRect();
  const xRel = (e.clientX - r.left) / r.width;
  if (xRel > 0.5) gotoPage(nextVisiblePage(state.page, +1));
  else            gotoPage(nextVisiblePage(state.page, -1));
}

function gotoPage(p) {
  p = Math.max(1, Math.min(state.pageCount, p));
  state.page = p;
  state.suppressActiveUpdate = Date.now() + 900;
  const slot = document.querySelector(`.slide-slot[data-page="${p}"]`);
  if (slot) {
    slot.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  }
  updatePageInput();
  updateActiveThumb();
}

function updatePageInput() {
  document.getElementById('vPage').value = state.page;
}
function updateActiveThumb() {
  document.querySelectorAll('.thumb').forEach(t => t.classList.toggle('active', parseInt(t.dataset.page, 10) === state.page));
  const a = document.querySelector('.thumb.active');
  if (a) a.scrollIntoView({ block: 'nearest' });
}

function zoomBy(delta) {
  // First click out of fit-mode initialises scale at 1× (= fit) so the next
  // step is clearly +/− than what the user was looking at.
  if (state.zoomMode === 'fit') state.zoomScale = 1;
  state.zoomMode = 'scale';
  state.zoomScale = Math.max(0.5, Math.min(4, state.zoomScale + delta));
  // Snap back to fit when within 5% of 1× so users can return there easily
  if (Math.abs(state.zoomScale - 1) < 0.05) {
    state.zoomMode = 'fit';
  }
  document.getElementById('vZoomVal').textContent = Math.round(state.zoomScale * 100) + '%';
  localStorage.setItem(STORE.ZOOM, state.zoomScale);
  for (const [p, c] of state.pageCanvases) { c.dataset.rendered = ''; renderPage(p); }
}

function setZoom(mode) {
  state.zoomMode = mode;
  if (mode === 'fit') {
    state.zoomScale = 1;
    document.getElementById('vZoomVal').textContent = 'Ajusté';
    localStorage.setItem(STORE.ZOOM, 'fit');
  }
  // Drop the .zoomed class everywhere — slots fit on next render
  document.querySelectorAll('.slide-slot').forEach(s => s.classList.remove('zoomed'));
  for (const [p, c] of state.pageCanvases) { c.dataset.rendered = ''; renderPage(p); }
}

// Trivial helpers replacing the removed "hidden slide" feature (server-side
// deletions are now permanent, so the viewer treats every page as visible).
function nextVisiblePage(from, dir) {
  const p = from + dir;
  if (p < 1) return 1;
  if (p > state.pageCount) return state.pageCount;
  return p;
}

function toggleFullscreen() {
  const v = document.getElementById('viewer');
  const supportsFs = !!(v.requestFullscreen || v.webkitRequestFullscreen);
  if (supportsFs && !document.fullscreenElement && !document.webkitFullscreenElement) {
    (v.requestFullscreen || v.webkitRequestFullscreen).call(v).catch(() => {
      // Native API rejected (typical on iOS): fall back to CSS immersion mode
      v.classList.toggle('immersive');
      updateFsIcon();
    });
  } else if (document.fullscreenElement || document.webkitFullscreenElement) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else {
    // No native API at all → CSS-based immersion
    v.classList.toggle('immersive');
    updateFsIcon();
  }
}

function updateFsIcon() {
  const v = document.getElementById('viewer');
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement) || v.classList.contains('immersive');
  const on  = document.querySelector('#vFs .ic-fs-on');
  const off = document.querySelector('#vFs .ic-fs-off');
  if (isFs) { on.hidden = true;  off.hidden = false; }
  else       { on.hidden = false; off.hidden = true;  }
}

function toggleThumbs() {
  // On phones the thumbnail panel is hidden by CSS regardless — toggling it
  // would just kick off a costly re-render of every page for no visible
  // benefit (and was the cause of the occasional crash). Bail out early.
  if (window.matchMedia('(max-width: 640px)').matches) return;
  const v = document.getElementById('viewer');
  const off = v.classList.toggle('thumbs-off');
  document.getElementById('vThumbsToggle')?.classList.toggle('active', !off);
  localStorage.setItem('mp1.thumbs', off ? 'off' : 'on');
  // Re-render visible page since slot width changed
  setTimeout(() => {
    for (const c of state.pageCanvases.values()) c.dataset.rendered = '';
    renderPage(state.page);
    gotoPage(state.page);
  }, 280);
}

// ----------------------------- Storage helpers -------------------------
function getRecent() {
  try { return JSON.parse(localStorage.getItem(STORE.RECENT) || '[]'); }
  catch { return []; }
}
function pushRecent(item) {
  let list = getRecent();
  list = list.filter(i => i.url !== item.url);
  list.unshift({ ...item, openedAt: Date.now() });
  list = list.slice(0, 24);
  localStorage.setItem(STORE.RECENT, JSON.stringify(list));
}
function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORE.FAVS) || '[]'); }
  catch { return []; }
}
function isFav(url) { return getFavorites().some(i => i.url === url); }
function toggleFav(item) {
  let favs = getFavorites();
  const exists = favs.some(i => i.url === item.url);
  if (exists) favs = favs.filter(i => i.url !== item.url);
  else favs.unshift({ ...item, favAt: Date.now() });
  localStorage.setItem(STORE.FAVS, JSON.stringify(favs));
  return !exists;
}
function toggleFavCurrent() {
  if (!state.currentItem) return;
  const added = toggleFav(state.currentItem);
  syncFavButton();
  toast(added ? 'Ajouté aux favoris' : 'Retiré des favoris');
}
function syncFavButton() {
  const btn = document.getElementById('vFav');
  if (!state.currentItem) return;
  btn.classList.toggle('active', isFav(state.currentItem.url));
}

// ----------------------------- Misc ------------------------------------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function escapeAttr(s) { return escapeHtml(s); }
function formatSize(kb) {
  if (kb < 1024) return kb + ' Ko';
  return (kb / 1024).toFixed(1) + ' Mo';
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.hidden = true, 300); }, 1600);
}

// Re-render on viewer resize (debounced), and re-snap to current page.
// Important for phone rotation (portrait <-> landscape): all pages need re-rendering.
let _resizeTimer = null;
function rerenderAllPagesSoon() {
  if (!state.pdf) return;
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => {
    if (state.zoomMode === 'fit') {
      // mark every page as stale; the IntersectionObserver will re-render
      // whichever ones come into view (current page is rendered immediately).
      for (const [, c] of state.pageCanvases) c.dataset.rendered = '';
      renderPage(state.page);
    }
    gotoPage(state.page);
  }, 180);
}
new ResizeObserver(rerenderAllPagesSoon).observe(document.getElementById('vScroll'));
window.addEventListener('orientationchange', rerenderAllPagesSoon);
window.addEventListener('resize', rerenderAllPagesSoon);

// Touch swipe (mobile) — handled natively by scroll-snap, no extra JS needed
