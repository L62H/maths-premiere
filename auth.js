// ===================================================================
//  Système d'identification local (côté navigateur)
// ===================================================================
//  Le site est statique (GitHub Pages) — il n'y a donc pas de serveur
//  central. Les comptes créés ici sont stockés UNIQUEMENT dans le
//  navigateur de l'utilisateur (localStorage), les mots de passe sont
//  hachés en SHA-256 avec un sel. Plusieurs utilisateurs peuvent avoir
//  des comptes sur le même appareil.
//
//  L'envoi d'email de confirmation n'est pas possible sur un site
//  statique : l'inscription valide directement le compte. La couche
//  "email" sert uniquement à associer une adresse à l'identifiant.
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
    username,                                // form d'affichage
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

  // 2) Modal — créé une seule fois, restera caché par défaut
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
        <p class="auth-sub">Connecte-toi pour personnaliser ton expérience.</p>
      </div>
      <div class="auth-tabs" role="tablist">
        <button data-tab="login"  class="auth-tab active" role="tab" aria-selected="true">Se connecter</button>
        <button data-tab="signup" class="auth-tab"        role="tab" aria-selected="false">Créer un compte</button>
      </div>
      <form id="loginForm" class="auth-form" autocomplete="on">
        <label class="auth-field">
          <span>Identifiant</span>
          <input type="text" name="username" required autocomplete="username" minlength="3" maxlength="20" autocapitalize="none" spellcheck="false"/>
        </label>
        <label class="auth-field">
          <span>Mot de passe</span>
          <input type="password" name="password" required autocomplete="current-password" minlength="8"/>
        </label>
        <div class="auth-err" id="loginErr"></div>
        <button type="submit" class="auth-submit">Se connecter</button>
      </form>
      <form id="signupForm" class="auth-form" autocomplete="on" hidden>
        <label class="auth-field">
          <span>Identifiant</span>
          <input type="text" name="username" required autocomplete="username" minlength="3" maxlength="20" autocapitalize="none" spellcheck="false" placeholder="3 à 20 caractères"/>
        </label>
        <label class="auth-field">
          <span>Email</span>
          <input type="email" name="email" required autocomplete="email" placeholder="prenom@exemple.fr"/>
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
      </form>
      <p class="auth-note">
        🔒 <strong>Compte 100 % local</strong> — tes identifiants restent dans ton navigateur,
        ils ne sont jamais envoyés sur un serveur. Mot de passe haché en SHA-256.
      </p>
    </div>
  `;
  document.body.appendChild(modal);

  // 3) Wire UI
  btn.addEventListener('click', () => {
    if (currentUser()) {
      // Déconnexion immédiate
      const u = currentUser();
      logout();
      refreshUserUI();
      _onChange && _onChange(null);
      toastSafe(`À bientôt ${u} ! 👋`);
    } else {
      openAuth();
    }
  });
  modal.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeAuth));
  modal.querySelectorAll('.auth-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  modal.querySelector('#loginForm').addEventListener('submit', onLogin);
  modal.querySelector('#signupForm').addEventListener('submit', onSignup);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeAuth(); });

  refreshUserUI();
}

function switchTab(tab) {
  const modal = document.getElementById('authModal');
  modal.querySelectorAll('.auth-tab').forEach(t => {
    const on = t.dataset.tab === tab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', String(on));
  });
  modal.querySelector('#loginForm').hidden  = tab !== 'login';
  modal.querySelector('#signupForm').hidden = tab !== 'signup';
  modal.querySelector(`#${tab}Err`).textContent = '';
  // Auto-focus first input of the visible form
  const first = modal.querySelector(tab === 'login' ? '#loginForm input' : '#signupForm input');
  if (first) setTimeout(() => first.focus(), 50);
}

function openAuth() {
  const m = document.getElementById('authModal');
  m.hidden = false;
  requestAnimationFrame(() => m.classList.add('open'));
  document.body.classList.add('auth-open');
  setTimeout(() => m.querySelector('#loginForm input')?.focus(), 200);
}
function closeAuth() {
  const m = document.getElementById('authModal');
  m.classList.remove('open');
  document.body.classList.remove('auth-open');
  setTimeout(() => { m.hidden = true; }, 240);
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
  if (!btn) return;
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
