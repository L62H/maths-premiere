// =====================================================================
// Mathématiques — Première Spécialité : SPA légère
// Routing à base de hash, viewer PDF.js custom, recherche live,
// favoris / récents en localStorage. Aucun framework.
// =====================================================================

import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs';
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
  applyTheme(localStorage.getItem(STORE.THEME) || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
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
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); gotoPage(state.page + 1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); gotoPage(state.page - 1); }
      else if (e.key === 'Home') { e.preventDefault(); gotoPage(1); }
      else if (e.key === 'End')  { e.preventDefault(); gotoPage(state.pageCount); }
      else if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(0.15); }
      else if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomBy(-0.15); }
      else if (e.key === '0') { e.preventDefault(); setZoom('fit'); }
      else if (e.key.toLowerCase() === 'f') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeViewer(); }
    }
  });

  // Viewer controls
  document.getElementById('vBack').addEventListener('click', closeViewer);
  document.getElementById('vPrev').addEventListener('click', () => gotoPage(state.page - 1));
  document.getElementById('vNext').addEventListener('click', () => gotoPage(state.page + 1));
  document.getElementById('vPage').addEventListener('change', e => gotoPage(parseInt(e.target.value, 10) || 1));
  document.getElementById('vZoomIn').addEventListener('click', () => zoomBy(0.15));
  document.getElementById('vZoomOut').addEventListener('click', () => zoomBy(-0.15));
  document.getElementById('vFit').addEventListener('click', () => setZoom('fit'));
  document.getElementById('vFav').addEventListener('click', toggleFavCurrent);
  document.getElementById('vFs').addEventListener('click', toggleFullscreen);
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
    </div>
  `;
  bindCardClicks();
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

function itemCard(it) {
  const cat = it.category;
  const catLabel = CATEGORIES[cat]?.label || cat;
  const isGgb = it.kind === 'ggb';
  const idx = it._idx !== undefined ? it._idx : (state.manifest.chapters.find(c => c.id === it.chapterId)?.items.indexOf(it) ?? 0);

  const href = isGgb
    ? it.url
    : `#/view/${encodeURIComponent(it.chapterId || state.currentChapter?.id || '')}/${idx}`;
  const tag = isGgb ? 'a' : 'a';
  const dl  = isGgb ? `download` : '';

  return `<${tag} class="item-card" href="${href}" ${dl} data-cat="${escapeAttr(cat)}" data-url="${escapeAttr(it.url)}" data-pages-target>
    <div class="item-preview" data-pdf="${isGgb ? '' : escapeAttr(it.url)}">
      ${isGgb ? `<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4" fill="none"/><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>` : `<svg class="placeholder" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>`}
      <span class="badge-cat">${escapeHtml(catLabel)}</span>
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

// Lazy-render the first page of each PDF as a thumbnail using IntersectionObserver
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
        const page = await doc.getPage(1);
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
        // remove placeholder svg, badge keeps
        e.target.querySelector('.placeholder')?.remove();
        e.target.prepend(canvas);
        // also update page count in card
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
  document.querySelectorAll('.item-card, .chap-card').forEach(el => {
    // already <a>, browser handles navigation
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
      ${favs.length === 0 ? `<div class="empty"><h3>Aucun favori</h3><p>Marquez un document avec l'étoile dans le viewer.</p></div>` : `<div class="items-grid">${favs.map(itemCard).join('')}</div>`}
    </div>`;
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

    // Render all pages as placeholders, then render visible ones
    const wrap = document.getElementById('vCanvasWrap');
    for (let p = 1; p <= state.pageCount; p++) {
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      canvas.dataset.page = p;
      canvas.dataset.loading = 'true';
      // initial sizing (approximate, will refine on render)
      canvas.style.width = '100%';
      canvas.style.maxWidth = '900px';
      canvas.style.aspectRatio = '1 / 1.414';
      wrap.appendChild(canvas);
      state.pageCanvases.set(p, canvas);
    }
    // Render thumbnails column
    renderThumbsAll();
    // Render visible pages
    observePages();
    // Render first page immediately
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
  // Render-trigger observer with wide margin (load nearby pages)
  const ioRender = new IntersectionObserver(async (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        const p = parseInt(e.target.dataset.page, 10);
        renderPage(p);
      }
    }
  }, { root: scroll, rootMargin: '400px 0px', threshold: 0.01 });
  // Tight observer to track which page is most visible (no margin, high threshold)
  const ioActive = new IntersectionObserver((entries) => {
    if (state.suppressActiveUpdate && Date.now() < state.suppressActiveUpdate) return;
    // pick the entry with highest ratio
    let best = null;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
    }
    if (best && best.intersectionRatio > 0.35) {
      const p = parseInt(best.target.dataset.page, 10);
      if (state.page !== p) {
        state.page = p;
        updatePageInput();
        updateActiveThumb();
      }
    }
  }, { root: scroll, threshold: [0, 0.35, 0.6, 0.9] });
  state.pageCanvases.forEach(c => { ioRender.observe(c); ioActive.observe(c); });
}

async function renderPage(p) {
  const canvas = state.pageCanvases.get(p);
  if (!canvas || canvas.dataset.rendered) return;
  canvas.dataset.rendered = 'true';
  try {
    const page = await state.pdf.getPage(p);
    const wrap = document.getElementById('vScroll');
    const wrapW = wrap.clientWidth - 48; // padding
    const vp1 = page.getViewport({ scale: 1 });
    let scale;
    if (state.zoomMode === 'fit') {
      scale = Math.min(wrapW / vp1.width, 1.6);
    } else {
      scale = state.zoomScale;
    }
    const dpr = window.devicePixelRatio || 1;
    const vp = page.getViewport({ scale: scale * dpr });
    canvas.width = vp.width;
    canvas.height = vp.height;
    canvas.style.width = (vp.width / dpr) + 'px';
    canvas.style.height = (vp.height / dpr) + 'px';
    canvas.style.aspectRatio = '';
    delete canvas.dataset.loading;
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  } catch (e) {
    delete canvas.dataset.rendered;
  }
}

function gotoPage(p) {
  p = Math.max(1, Math.min(state.pageCount, p));
  state.page = p;
  // suppress IO-driven active updates for the duration of smooth scroll
  state.suppressActiveUpdate = Date.now() + 900;
  const canvas = state.pageCanvases.get(p);
  if (canvas) {
    canvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (state.zoomMode === 'fit') {
    // first switch from fit to actual scale of current page
    const c = state.pageCanvases.get(state.page);
    if (c) {
      const cssW = parseFloat(c.style.width);
      // approximate scale
      state.zoomScale = (cssW / 900) || 1;
    } else state.zoomScale = 1;
  }
  state.zoomMode = 'scale';
  state.zoomScale = Math.max(0.4, Math.min(4, state.zoomScale + delta));
  document.getElementById('vZoomVal').textContent = Math.round(state.zoomScale * 100) + '%';
  localStorage.setItem(STORE.ZOOM, state.zoomScale);
  // re-render all rendered pages
  for (const [p, c] of state.pageCanvases) { c.dataset.rendered = ''; renderPage(p); }
}

function setZoom(mode) {
  state.zoomMode = mode;
  if (mode === 'fit') {
    document.getElementById('vZoomVal').textContent = 'Ajusté';
    localStorage.setItem(STORE.ZOOM, 'fit');
  }
  for (const [p, c] of state.pageCanvases) { c.dataset.rendered = ''; renderPage(p); }
}

function toggleFullscreen() {
  const v = document.getElementById('viewer');
  if (!document.fullscreenElement) v.requestFullscreen?.();
  else document.exitFullscreen?.();
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

// Update zoom display on fit when initial render finishes
new ResizeObserver(() => {
  if (!state.pdf || state.zoomMode !== 'fit') return;
  for (const [p, c] of state.pageCanvases) { c.dataset.rendered = ''; }
  renderPage(state.page);
}).observe(document.getElementById('vScroll'));
