// ===================================================================
//  Système d'identification 100 % local (côté navigateur)
// ===================================================================
//  Le site est statique (GitHub Pages) — il n'y a donc pas de serveur
//  central qui stocke les comptes. Tout reste dans le navigateur de
//  l'utilisateur (localStorage). Les mots de passe sont hachés en
//  SHA-256 avec un sel (jamais stockés en clair). Plusieurs comptes
//  peuvent coexister sur le même appareil.
//
//  Note : pas de "confirmation par email" possible sur un site
//  statique ; l'inscription valide donc le compte immédiatement.
// ===================================================================

const USERS_KEY = 'mp1.users.v1';
const CURR_KEY  = 'mp1.user.current';
const SALT      = 'specialite-maths-premiere.v1';

// ---- Crypto ----
async function hashPassword(password) {
  const data = new TextEncoder().encode(password + '|' + SALT);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

// ---- Storage helpers ----
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
}
function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
export function currentUser() { return localStorage.getItem(CURR_KEY) || null; }
function setCurrent(u) {
  if (u) localStorage.setItem(CURR_KEY, u);
  else   localStorage.removeItem(CURR_KEY);
}

// ---- Validation ----
function validateUsername(u) {
  if (!u || typeof u !== 'string') return 'L\'identifiant est requis';
  if (u.length < 3) return 'L\'identifiant fait au moins 3 caractères';
  if (u.length > 20) return 'L\'identifiant fait au plus 20 caractères';
  if (!/^[a-zA-Z0-9_\-.]+$/.test(u)) return 'Lettres, chiffres, "_", "-" et "." uniquement';
  return null;
}
function validateEmail(e) {
  if (!e) return 'L\'email est requis';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Email invalide';
  return null;
}
function validatePassword(p) {
  if (!p) return 'Le mot de passe est requis';
  if (p.length < 8) return 'Mot de passe : au moins 8 caractères';
  if (p.length > 100) return 'Mot de passe trop long';
  return null;
}

// ---- Public API ----
export async function signup({ username, email, password, confirm }) {
  let err;
  if ((err = validateUsername(username))) throw new Error(err);
  if ((err = validateEmail(email)))       throw new Error(err);
  if ((err = validatePassword(password))) throw new Error(err);
  if (password !== confirm)               throw new Error('Les mots de passe ne correspondent pas');

  const users = getUsers();
  if (users[username.toLowerCase()]) throw new Error('Cet identifiant est déjà pris');

  users[username.toLowerCase()] = {
    username,
    email,
    pw: await hashPassword(password),
    createdAt: Date.now(),
  };
  saveUsers(users);
  setCurrent(username);
  return username;
}

export async function login({ username, password }) {
  let err;
  if ((err = validateUsername(username))) throw new Error('Identifiant invalide');
  if (!password) throw new Error('Le mot de passe est requis');
  const users = getUsers();
  const u = users[username.toLowerCase()];
  if (!u) throw new Error('Identifiant introuvable sur cet appareil');
  const ph = await hashPassword(password);
  if (u.pw !== ph) throw new Error('Mot de passe incorrect');
  setCurrent(u.username);
  return u.username;
}

export function logout() { setCurrent(null); }

// ===================================================================
//  UI
// ===================================================================
let _onChange = null;
export function onAuthChange(fn) { _onChange = fn; }

export function mountAuth() {
  // 1) Bouton dans l'app bar (avant le bouton thème)
  const btn = document.createElement('button');
  btn.id = 'authBtn';
  btn.className = 'icon-btn';
  btn.setAttribute('aria-label', 'Se connecter');
  const themeBtn = document.getElementById('themeBtn');
  themeBtn.parentElement.insertBefore(btn, themeBtn);

  // 2) Bandeau de bienvenue persistant — collé en haut de l'écran
  //    (au-dessus de l'app-bar). Apparaît uniquement quand un compte
  //    est connecté ; visible sur toutes les pages (mobile + PC).
  const wb = document.createElement('div');
  wb.id = 'welcomeBar';
  wb.className = 'welcome-bar';
  wb.hidden = true;
  wb.innerHTML = `
    <span class="wb-icon" aria-hidden="true">👋</span>
    <span class="wb-text">
      <strong>Bienvenue <span class="wb-user"></span> !</strong>
      <em>Bon courage 😎</em>
    </span>
    <button class="wb-logout" type="button" aria-label="Se déconnecter">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 12H4m0 0 4-4m-4 4 4 4M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      <span class="wb-logout-label">Déconnexion</span>
    </button>
  `;
  document.body.insertBefore(wb, document.body.firstChild);
  wb.querySelector('.wb-logout').addEventListener('click', () => {
    const u = currentUser();
    logout();
    refreshUserUI();
    _onChange && _onChange(null);
    toastSafe(`À bientôt ${u} ! 👋`);
    // Re-propose le modal pour pouvoir se reconnecter / changer de compte
    try { sessionStorage.removeItem('mp1.auth.modal.closed'); } catch {}
    openAuth();
  });

  // 3) Modal — créé une seule fois, reste caché par défaut
  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.className = 'auth-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="auth-backdrop" data-close></div>
    <div class="auth-card" role="dialog" aria-modal="true" aria-label="Connexion">
      <button class="auth-close" data-close aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
      <div class="auth-head">
        <div class="auth-mark" aria-hidden="true">Σ</div>
        <h2 class="auth-title">Bienvenue</h2>
        <p class="auth-sub">Crée un compte ou connecte-toi pour personnaliser ton expérience.</p>
      </div>

      <div class="auth-trust" role="note" aria-label="Confidentialité">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 4.5 3.5 8.5 8 10 4.5-1.5 8-5.5 8-10V5l-8-3z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
        <div>
          <strong>100 % privé · 100 % local</strong>
          <span>Aucune donnée n'est envoyée ni sauvegardée sur un serveur. Tes identifiants restent <em>uniquement</em> dans ce navigateur, et ton mot de passe est haché en SHA-256 — illisible, même pour le créateur du site.</span>
        </div>
      </div>

      <div class="auth-tabs" role="tablist">
        <button data-tab="login"  class="auth-tab active" role="tab" aria-selected="true">Se connecter</button>
        <button data-tab="signup" class="auth-tab"        role="tab" aria-selected="false">Créer un compte</button>
      </div>

      <form id="loginForm" class="auth-form" autocomplete="on" novalidate>
        <label class="auth-field">
          <span>Identifiant</span>
          <input type="text" name="username" required autocomplete="username" minlength="3" maxlength="20" autocapitalize="none" spellcheck="false" inputmode="text"/>
        </label>
        <label class="auth-field">
          <span>Mot de passe</span>
          <input type="password" name="password" required autocomplete="current-password" minlength="8"/>
        </label>
        <div class="auth-err" id="loginErr"></div>
        <button type="submit" class="auth-submit">Se connecter</button>
        <p class="auth-switch">Pas encore de compte ? <a href="#" data-go="signup">Crée-le en 10 secondes</a></p>
      </form>

      <form id="signupForm" class="auth-form" autocomplete="on" hidden novalidate>
        <label class="auth-field">
          <span>Identifiant</span>
          <input type="text" name="username" required autocomplete="username" minlength="3" maxlength="20" autocapitalize="none" spellcheck="false" inputmode="text" placeholder="3 à 20 caractères"/>
        </label>
        <label class="auth-field">
          <span>Email</span>
          <input type="email" name="email" required autocomplete="email" inputmode="email" placeholder="prenom@exemple.fr"/>
        </label>
        <label class="auth-field">
          <span>Mot de passe</span>
          <input type="password" name="password" required autocomplete="new-password" minlength="8" placeholder="8 caractères minimum"/>
        </label>
        <label class="auth-field">
          <span>Confirmer le mot de passe</span>
          <input type="password" name="confirm" required autocomplete="new-password" minlength="8"/>
        </label>
        <div class="auth-err" id="signupErr"></div>
        <button type="submit" class="auth-submit">Créer mon compte</button>
        <p class="auth-switch">Tu as déjà un compte ? <a href="#" data-go="login">Connecte-toi</a></p>
      </form>

      <button type="button" class="auth-skip" data-close>Continuer sans compte</button>
    </div>
  `;
  document.body.appendChild(modal);

  // 4) Wire UI
  btn.addEventListener('click', () => {
    if (currentUser()) {
      // Déconnexion immédiate
      const u = currentUser();
      logout();
      refreshUserUI();
      _onChange && _onChange(null);
      toastSafe(`À bientôt ${u} ! 👋`);
      try { sessionStorage.removeItem('mp1.auth.modal.closed'); } catch {}
      openAuth();
    } else {
      openAuth();
    }
  });
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeAuth));
  modal.querySelectorAll('.auth-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  modal.querySelectorAll('[data-go]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    switchTab(a.dataset.go);
  }));
  modal.querySelector('#loginForm').addEventListener('submit', onLogin);
  modal.querySelector('#signupForm').addEventListener('submit', onSignup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeAuth(); });

  refreshUserUI();

  // 5) Auto-popup : si personne n'est connecté on ouvre le modal au
  //    chargement, sauf si l'utilisateur l'a déjà fermé pendant cette
  //    session (sessionStorage) — pour ne pas le harceler à chaque
  //    changement de page.
  if (!currentUser() && !sessionStorage.getItem('mp1.auth.modal.closed')) {
    // S'il existe déjà des comptes sur cet appareil, on ouvre direct
    // l'onglet "Se connecter" ; sinon on commence sur "Créer un compte".
    const hasAccounts = Object.keys(getUsers()).length > 0;
    setTimeout(() => {
      openAuth();
      if (!hasAccounts) switchTab('signup');
    }, 250);
  }
}

function switchTab(tab) {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.querySelectorAll('.auth-tab').forEach(t => {
    const on = t.dataset.tab === tab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  modal.querySelector('#loginForm').hidden  = tab !== 'login';
  modal.querySelector('#signupForm').hidden = tab !== 'signup';
  const errId = tab === 'login' ? 'loginErr' : 'signupErr';
  const errEl = modal.querySelector('#' + errId);
  if (errEl) errEl.textContent = '';
  // Auto-focus first input of the visible form
  const first = modal.querySelector(tab === 'login' ? '#loginForm input' : '#signupForm input');
  if (first) setTimeout(() => first.focus(), 50);
}

function openAuth() {
  const m = document.getElementById('authModal');
  if (!m) return;
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('open'));
  document.body.classList.add('auth-open');
  setTimeout(() => {
    const target = m.querySelector('#loginForm:not([hidden]) input, #signupForm:not([hidden]) input');
    target && target.focus();
  }, 200);
}
function closeAuth() {
  const m = document.getElementById('authModal');
  if (!m) return;
  m.classList.remove('open');
  document.body.classList.remove('auth-open');
  setTimeout(() => { m.hidden = true; }, 240);
  // Empêche le re-pop systématique pendant cette session de navigation.
  try { sessionStorage.setItem('mp1.auth.modal.closed', '1'); } catch {}
}

async function onLogin(e) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const err  = document.getElementById('loginErr');
  err.textContent = '';
  try {
    const username = await login({
      username: (data.get('username') || '').toString().trim(),
      password: (data.get('password') || '').toString(),
    });
    closeAuth();
    refreshUserUI();
    _onChange && _onChange(username);
    toastSafe(`Bienvenue ${username} ! Bon courage 😎`);
    e.currentTarget.reset();
  } catch (ex) {
    err.textContent = ex.message || 'Erreur';
  }
}

async function onSignup(e) {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const err  = document.getElementById('signupErr');
  err.textContent = '';
  try {
    const username = await signup({
      username: (data.get('username') || '').toString().trim(),
      email:    (data.get('email')    || '').toString().trim(),
      password: (data.get('password') || '').toString(),
      confirm:  (data.get('confirm')  || '').toString(),
    });
    closeAuth();
    refreshUserUI();
    _onChange && _onChange(username);
    toastSafe(`Bienvenue ${username} ! Bon courage 😎`);
    e.currentTarget.reset();
  } catch (ex) {
    err.textContent = ex.message || 'Erreur';
  }
}

function refreshUserUI() {
  const u = currentUser();
  const btn = document.getElementById('authBtn');
  const wb  = document.getElementById('welcomeBar');

  if (btn) {
    if (u) {
      btn.innerHTML = `
        <span class="auth-chip">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>
          <span class="auth-name">${escapeHtml(u)}</span>
        </span>`;
      btn.classList.add('logged');
      btn.setAttribute('aria-label', 'Se déconnecter');
      btn.title = `Connecté comme ${u} — clique pour déconnecter`;
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none"/></svg>`;
      btn.classList.remove('logged');
      btn.setAttribute('aria-label', 'Se connecter');
      btn.title = 'Se connecter';
    }
  }

  if (wb) {
    if (u) {
      wb.querySelector('.wb-user').textContent = u;
      wb.hidden = false;
      document.body.classList.add('has-welcome-bar');
    } else {
      wb.hidden = true;
      document.body.classList.remove('has-welcome-bar');
    }
  }
}

// ---- small util ----
function escapeHtml(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }
function toastSafe(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.hidden = false;
  t.classList.add('show');
  clearTimeout(toastSafe._t);
  toastSafe._t = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.hidden = true, 300); }, 2400);
}
