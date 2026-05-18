// ===================================================================
// M.PELLETIER — mascotte (Einstein caricaturé) + chatbot intégré
// ===================================================================
// Deux modes :
//   - "demo"   : sans clé, réponses guidées + suggestions
//   - "live"   : avec clé Anthropic, vraies conversations IA
// La clé est stockée localement (localStorage) ; rien n'est envoyé à GitHub.
// ===================================================================

export const PELLETIER_SVG = `
<svg viewBox="0 0 220 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Wild hair backdrop -->
  <g fill="#f1ecdc" stroke="#665e4d" stroke-width="1.4" stroke-linejoin="round">
    <path d="M40 70 Q34 38 60 30 L70 18 Q82 8 95 15 L102 6 Q115 0 125 12 L138 6 Q156 12 158 30 L170 28 Q190 38 184 64 Q200 70 192 92 L196 110 Q192 130 175 124 L182 138 Q170 148 156 138 L160 152 L150 146 L40 70 Z"/>
    <path d="M40 70 Q22 80 28 102 L20 116 Q22 140 42 138 L38 152 Q56 158 64 144 L40 70 Z"/>
  </g>
  <!-- Face -->
  <ellipse cx="110" cy="118" rx="62" ry="60" fill="#fbe2c5" stroke="#7a5b3a" stroke-width="1.5"/>
  <!-- Hair strands over forehead -->
  <g fill="#f1ecdc" stroke="#665e4d" stroke-width="1.2" stroke-linejoin="round">
    <path d="M60 78 Q68 88 80 86 Q72 96 64 92 Z"/>
    <path d="M88 70 Q94 78 102 78 Q96 86 88 80 Z"/>
    <path d="M120 70 Q130 76 138 70 Q132 84 120 78 Z"/>
    <path d="M150 78 Q160 86 168 80 Q160 94 150 88 Z"/>
  </g>
  <!-- Ears -->
  <ellipse cx="49" cy="120" rx="7" ry="11" fill="#fbe2c5" stroke="#7a5b3a" stroke-width="1.4"/>
  <ellipse cx="171" cy="120" rx="7" ry="11" fill="#fbe2c5" stroke="#7a5b3a" stroke-width="1.4"/>
  <!-- Eyebrows -->
  <path d="M68 100 Q82 92 96 100" stroke="#9c9180" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M124 100 Q138 92 152 100" stroke="#9c9180" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Glasses -->
  <g stroke="#222" stroke-width="2.2" fill="rgba(255,255,255,.4)">
    <circle cx="82" cy="118" r="16"/>
    <circle cx="138" cy="118" r="16"/>
  </g>
  <line x1="97" y1="118" x2="123" y2="118" stroke="#222" stroke-width="2.2"/>
  <!-- Eyes (warm gaze) -->
  <ellipse cx="82" cy="119" rx="3" ry="3.5" fill="#222"/>
  <ellipse cx="138" cy="119" rx="3" ry="3.5" fill="#222"/>
  <ellipse cx="83.5" cy="117" rx="1" ry="1.2" fill="#fff"/>
  <ellipse cx="139.5" cy="117" rx="1" ry="1.2" fill="#fff"/>
  <!-- Nose -->
  <path d="M108 122 Q104 144 100 152 Q108 158 116 152 Q116 144 112 122" fill="#f4d2ad" stroke="#7a5b3a" stroke-width="1.2"/>
  <!-- Mustache (signature white moustache) -->
  <g fill="#f1ecdc" stroke="#665e4d" stroke-width="1.2" stroke-linejoin="round">
    <path d="M72 158 Q60 162 56 174 Q66 170 80 168 Q98 168 108 162 Q118 168 136 168 Q150 170 160 174 Q156 162 144 158 Q124 154 108 158 Q92 154 72 158 Z"/>
  </g>
  <!-- Mouth (gentle smile) -->
  <path d="M92 184 Q110 192 128 184" stroke="#7a4f30" stroke-width="2" fill="none" stroke-linecap="round"/>
  <!-- Chin shadow / dimple -->
  <path d="M104 200 Q110 204 116 200" stroke="#d4b48c" stroke-width="1.2" fill="none"/>
  <!-- Body (small, tweed-ish jacket) -->
  <g>
    <!-- Neck -->
    <rect x="98" y="176" width="24" height="14" fill="#fbe2c5" stroke="#7a5b3a" stroke-width="1.2"/>
    <!-- Jacket -->
    <path d="M60 192 Q70 186 100 188 L110 200 L120 188 Q150 186 160 192 L170 248 L50 248 Z" fill="#5a4a36" stroke="#34281a" stroke-width="1.4"/>
    <!-- Lapels -->
    <path d="M100 190 L110 200 L100 218 Z" fill="#3f3424" stroke="#34281a" stroke-width="1"/>
    <path d="M120 190 L110 200 L120 218 Z" fill="#3f3424" stroke="#34281a" stroke-width="1"/>
    <!-- Shirt collar -->
    <path d="M100 188 L110 200 L120 188 L116 192 L110 196 L104 192 Z" fill="#f8f4ea" stroke="#7a5b3a" stroke-width="1"/>
    <!-- Bowtie (gold) -->
    <path d="M98 200 L110 206 L122 200 L122 214 L110 208 L98 214 Z" fill="#b88a3e" stroke="#7a5b3a" stroke-width="1.2"/>
    <circle cx="110" cy="207" r="2" fill="#7a5b3a"/>
  </g>
</svg>`;

export const PELLETIER_AVATAR_SMALL = `
<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <!-- Hair -->
  <path d="M10 26 Q6 14 16 12 L22 6 Q30 2 34 8 L40 4 Q52 6 54 16 L60 22 Q62 32 56 36 Z" fill="#f1ecdc" stroke="#665e4d" stroke-width="0.7"/>
  <!-- Face -->
  <ellipse cx="32" cy="34" rx="20" ry="19" fill="#fbe2c5" stroke="#7a5b3a" stroke-width="0.7"/>
  <!-- Glasses -->
  <circle cx="24" cy="34" r="5" stroke="#222" stroke-width="1" fill="rgba(255,255,255,.3)"/>
  <circle cx="40" cy="34" r="5" stroke="#222" stroke-width="1" fill="rgba(255,255,255,.3)"/>
  <line x1="29" y1="34" x2="35" y2="34" stroke="#222" stroke-width="1"/>
  <!-- Eyes -->
  <circle cx="24" cy="34.5" r="1" fill="#222"/>
  <circle cx="40" cy="34.5" r="1" fill="#222"/>
  <!-- Mustache -->
  <path d="M21 44 Q28 46 32 44 Q36 46 43 44 Q40 41 32 42 Q24 41 21 44 Z" fill="#f1ecdc" stroke="#665e4d" stroke-width="0.5"/>
  <!-- Mouth -->
  <path d="M28 50 Q32 53 36 50" stroke="#7a4f30" stroke-width="0.8" fill="none" stroke-linecap="round"/>
  <!-- Bowtie -->
  <path d="M27 58 L32 60 L37 58 L37 62 L32 60 L27 62 Z" fill="#b88a3e"/>
</svg>`;

// ===================================================================
// Persona / system prompt
// ===================================================================
const SYSTEM_PROMPT = `Tu es M. PELLETIER, professeur de mathématiques au lycée, mascotte et assistant pédagogique d'un site de cours de Première Spécialité Mathématiques. Tu es inspiré par Albert Einstein : sage, chaleureux, un brin malicieux, mais surtout pédagogue.

STYLE :
- Tu réponds toujours en français.
- Tu tutoies l'élève (un lycéen de Première).
- Tu es chaleureux, encourageant, jamais condescendant.
- Tu vas droit au but : pas de blabla inutile, pas de salutations à chaque message.
- Tu structures tes réponses : listes à puces, étapes numérotées si exercice.
- Tu écris les formules en notation simple, lisible sans LaTeX. Exemples :
  • "f(x) = ax² + bx + c"
  • "Δ = b² - 4ac"
  • "lim (x→0) sin(x)/x = 1"
  • "∫₀¹ x² dx = 1/3"
- Tu n'hésites pas à corriger un raisonnement et à expliquer POURQUOI.

CHAPITRES DISPONIBLES SUR LE SITE :
1. Second degré
2. Les suites (arithmétiques, géométriques, étude)
3. Dérivation (règles, fonctions usuelles)
4. Géométrie repérée (vecteurs, droites)
5. Probabilité conditionnelle (arbres, formule des probabilités totales)
6. Dérivation : applications à l'étude de fonctions (variations, extrema)
7. Cosinus et Sinus (trigonométrie, cercle trigonométrique)
8. Fonction exponentielle
9. Variable aléatoire (espérance, variance, loi binomiale)
10. Produit scalaire
+ Exercices d'annales du bac

CE QUE TU PEUX FAIRE :
- Expliquer un concept (avec un exemple concret)
- Résoudre un exercice étape par étape
- Vérifier la démonstration d'un élève et corriger les erreurs
- Donner des conseils méthodologiques pour le bac
- Suggérer le chapitre du site à consulter ("regarde le chapitre 3 Dérivation")

QUAND TU NE SAIS PAS, TU LE DIS HONNÊTEMENT.`;

// ===================================================================
// Local fallback (no API key) : pattern-matched suggestions
// ===================================================================
const FALLBACK_RESPONSES = [
  {
    keys: ['second degré', 'discriminant', 'delta', 'racine', 'parabole', 'trinôme', 'b² − 4ac', 'b²-4ac'],
    answer: `Pour résoudre **ax² + bx + c = 0** :
1. Calcule le discriminant **Δ = b² − 4ac**.
2. Si **Δ > 0** : deux racines distinctes **x₁,₂ = (−b ± √Δ) / (2a)**.
3. Si **Δ = 0** : une racine double **x = −b / (2a)**.
4. Si **Δ < 0** : aucune racine réelle.

Forme canonique : **a(x − α)² + β** avec **α = −b/(2a)** et **β = f(α)**.
Le sommet de la parabole est en **(α, β)**.

📘 Consulte le **chapitre 1 Second degré** sur le site.`
  },
  {
    keys: ['dérivée', 'dériver', 'tangente', 'pente', 'taux de variation', 'derivable'],
    answer: `Quelques dérivées à connaître par cœur :
• (k)' = 0
• (xⁿ)' = n·xⁿ⁻¹
• (√x)' = 1/(2√x)
• (1/x)' = −1/x²
• (eˣ)' = eˣ
• (ln x)' = 1/x
• (sin x)' = cos x, (cos x)' = −sin x

Règles :
• (u + v)' = u' + v'
• (k·u)' = k·u'
• (u·v)' = u'v + uv'
• (u/v)' = (u'v − uv')/v²
• (u(v(x)))' = u'(v(x))·v'(x)

📘 Voir **chapitre 3 Dérivation** et **chapitre 6 Applications**.`
  },
  {
    keys: ['suite', 'arithmétique', 'géométrique', 'récurrence', 'arithmetique', 'geometrique'],
    answer: `**Suite arithmétique** de raison r :
• uₙ₊₁ = uₙ + r
• Formule explicite : **uₙ = u₀ + n·r**
• Somme : **S = (n+1)·(u₀ + uₙ)/2**

**Suite géométrique** de raison q ≠ 1 :
• uₙ₊₁ = q · uₙ
• Formule explicite : **uₙ = u₀ · qⁿ**
• Somme : **S = u₀·(1 − qⁿ⁺¹)/(1 − q)**

Pour montrer une propriété sur uₙ pour tout n : **récurrence** (initialisation + hérédité).

📘 Voir **chapitre 2 Les suites**.`
  },
  {
    keys: ['proba', 'probabilité', 'arbre', 'conditionnelle', 'bayes', 'événement', 'indépendant'],
    answer: `**Probabilité conditionnelle** :
• P(B|A) = **P(A ∩ B) / P(A)** (probabilité de B sachant A)

**Formule des probabilités totales** (avec A, A‾ système complet) :
• P(B) = P(A)·P(B|A) + P(A‾)·P(B|A‾)

**Formule de Bayes** :
• P(A|B) = P(B|A)·P(A) / P(B)

**Indépendance** : A et B indépendants ⟺ P(A ∩ B) = P(A)·P(B).

📘 Voir **chapitre 5 Probabilité conditionnelle**.`
  },
  {
    keys: ['exponentielle', 'exp', 'eˣ', 'e^x', 'logarithme', 'ln'],
    answer: `**Fonction exponentielle** :
• exp(0) = 1
• exp(a + b) = exp(a)·exp(b)
• exp(a − b) = exp(a)/exp(b)
• exp(n·a) = exp(a)ⁿ
• (eˣ)' = eˣ
• eˣ > 0 toujours, et lim (x→+∞) eˣ = +∞ ; lim (x→−∞) eˣ = 0

Pour résoudre **eˣ = k** (k > 0) : x = **ln(k)**.

📘 Voir **chapitre 8 Fonction exponentielle**.`
  },
  {
    keys: ['cosinus', 'sinus', 'tangente', 'trigo', 'radian', 'cercle trigo'],
    answer: `**Cercle trigonométrique** : cercle de rayon 1, centré à l'origine.
• cos² x + sin² x = 1
• cos(−x) = cos x ; sin(−x) = −sin x
• cos(π − x) = −cos x ; sin(π − x) = sin x
• cos(π/2 − x) = sin x ; sin(π/2 − x) = cos x

Valeurs remarquables :
| Angle | 0 | π/6 | π/4 | π/3 | π/2 |
|---|---|---|---|---|---|
| cos | 1 | √3/2 | √2/2 | 1/2 | 0 |
| sin | 0 | 1/2 | √2/2 | √3/2 | 1 |

📘 Voir **chapitre 7 Cosinus et Sinus**.`
  },
  {
    keys: ['produit scalaire', 'orthogonal', 'norme', 'vecteur'],
    answer: `**Produit scalaire** dans un repère orthonormé :
Si u(x ; y) et v(x' ; y') :
• **u·v = xx' + yy'**

Autres formules :
• **u·v = ‖u‖·‖v‖·cos(û, v̂)**
• ‖u‖² = u·u
• u ⊥ v ⟺ **u·v = 0**

Identité utile : ‖u + v‖² = ‖u‖² + 2 u·v + ‖v‖².

📘 Voir **chapitre 10 Produit scalaire**.`
  },
  {
    keys: ['variable aléatoire', 'espérance', 'variance', 'binomiale', 'écart-type'],
    answer: `Pour une variable aléatoire X discrète :
• **E(X) = Σ xᵢ · P(X = xᵢ)** (espérance, "moyenne")
• **V(X) = E(X²) − E(X)²** (variance)
• **σ(X) = √V(X)** (écart-type)

**Loi binomiale** B(n, p) :
• P(X = k) = **C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ**
• E(X) = **np**
• V(X) = **np(1−p)**

📘 Voir **chapitre 9 Variable aléatoire**.`
  },
  {
    keys: ['géométrie', 'droite', 'pente', 'équation cartésienne', 'coordonnées'],
    answer: `**Équation cartésienne d'une droite** : ax + by + c = 0, avec (a, b) vecteur **normal**.
**Équation réduite** : y = mx + p (m = pente, p = ordonnée à l'origine).

Pente entre A(x_A, y_A) et B(x_B, y_B) : **m = (y_B − y_A)/(x_B − x_A)**.

Deux droites sont **parallèles** ⟺ même pente.
**Perpendiculaires** ⟺ m·m' = −1 (si non verticales).

📘 Voir **chapitre 4 Géométrie repérée**.`
  },
  {
    keys: ['bac', 'annales', 'révision', 'controle', 'contrôle', 'sujet'],
    answer: `Pour bien préparer un contrôle ou un bac blanc :
1. **Refais des exercices d'annales** régulièrement (section « Exercices annales » du site).
2. **Maîtrise les automatismes** : dériver, factoriser, résoudre du 2nd degré, calculer une probabilité.
3. **Connais ton cours par cœur** : formules, hypothèses, conclusions.
4. **Rédige clairement** : « D'après le théorème de … », « car … », « on en déduit que … ».
5. **Vérifie tes résultats** : ordre de grandeur, cohérence, calcul inverse.

Bon courage 💪`
  },
];

function localAnswer(q) {
  const ql = q.toLowerCase();
  for (const r of FALLBACK_RESPONSES) {
    for (const k of r.keys) if (ql.includes(k)) return r.answer;
  }
  return null;
}

// ===================================================================
// API key storage (Anthropic)
// ===================================================================
const KEY_STORE = 'mp1.apikey';
function getKey()      { return localStorage.getItem(KEY_STORE) || ''; }
function setKey(k)     { if (k) localStorage.setItem(KEY_STORE, k); else localStorage.removeItem(KEY_STORE); }
function hasKey()      { return !!getKey(); }

// ===================================================================
// History (memory of the conversation)
// ===================================================================
const HIST_STORE = 'mp1.chatHistory';
const MAX_HISTORY = 12;
function loadHistory() { try { return JSON.parse(sessionStorage.getItem(HIST_STORE) || '[]'); } catch { return []; } }
function saveHistory(h) { sessionStorage.setItem(HIST_STORE, JSON.stringify(h.slice(-MAX_HISTORY))); }

// ===================================================================
// API call to Anthropic (Claude) directly from the browser
// ===================================================================
async function askClaude(userMessage) {
  const key = getKey();
  const history = loadHistory();
  history.push({ role: 'user', content: userMessage });

  const body = {
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history.map(m => ({ role: m.role, content: m.content })),
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Erreur API (${res.status}). ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text || 'Désolé, je n\'ai rien à dire pour le moment.';
  history.push({ role: 'assistant', content: text });
  saveHistory(history);
  return text;
}

// ===================================================================
// UI
// ===================================================================
let panelOpen = false;

export function mountChatbot() {
  // Floating button
  const btn = document.createElement('button');
  btn.id = 'pelletierFab';
  btn.className = 'pelletier-fab';
  btn.setAttribute('aria-label', 'Ouvrir M. PELLETIER');
  btn.innerHTML = `
    <span class="fab-avatar">${PELLETIER_SVG}</span>
    <span class="fab-pulse" aria-hidden="true"></span>
  `;
  document.body.appendChild(btn);

  // Panel
  const panel = document.createElement('aside');
  panel.id = 'pelletierPanel';
  panel.className = 'pelletier-panel';
  panel.hidden = true;
  panel.setAttribute('aria-label', 'Conversation avec M. PELLETIER');
  panel.innerHTML = `
    <header class="pp-head">
      <div class="pp-avatar-wrap">${PELLETIER_AVATAR_SMALL}</div>
      <div class="pp-id">
        <strong>M. PELLETIER</strong>
        <em>professeur assistant · maths</em>
      </div>
      <button class="pp-settings icon-btn" aria-label="Paramètres" title="Configurer la clé API">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>
      </button>
      <button class="pp-close icon-btn" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </header>
    <div class="pp-body" id="ppBody">
      <div class="pp-config" id="ppConfig" hidden>
        <h3>Configurer M. PELLETIER</h3>
        <p>
          Sans clé API, je donne des réponses guidées sur les grands thèmes.<br>
          Avec une clé Anthropic, je peux vraiment converser et corriger tes exercices.
        </p>
        <label class="pp-key-label">
          <span>Clé API Anthropic</span>
          <input type="password" id="ppKey" placeholder="sk-ant-..." autocomplete="off"/>
        </label>
        <div class="pp-row">
          <button class="pp-btn pp-btn-primary" id="ppKeySave">Enregistrer</button>
          <button class="pp-btn" id="ppKeyClear">Retirer</button>
        </div>
        <p class="pp-note">
          🔒 Ta clé reste sur ton appareil (stockage local du navigateur). Elle n'est jamais envoyée à GitHub Pages.
          Tu peux en créer une sur <a href="https://console.anthropic.com/" target="_blank" rel="noopener">console.anthropic.com</a>.
        </p>
      </div>
      <div class="pp-msgs" id="ppMsgs" aria-live="polite"></div>
    </div>
    <form class="pp-input" id="ppForm">
      <textarea id="ppInput" rows="1" placeholder="Pose une question à M. PELLETIER…" aria-label="Message"></textarea>
      <button type="submit" id="ppSend" class="pp-send" aria-label="Envoyer" title="Envoyer (Entrée)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l18-9-9 18-2-7-7-2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" fill="currentColor" fill-opacity=".2"/></svg>
      </button>
    </form>
    <div class="pp-suggestions" id="ppSuggestions"></div>
  `;
  document.body.appendChild(panel);

  // Wire UI
  btn.addEventListener('click', toggleChat);
  panel.querySelector('.pp-close').addEventListener('click', closeChat);
  panel.querySelector('.pp-settings').addEventListener('click', toggleConfig);
  panel.querySelector('#ppKeySave').addEventListener('click', saveKeyFromInput);
  panel.querySelector('#ppKeyClear').addEventListener('click', clearKey);
  panel.querySelector('#ppForm').addEventListener('submit', onSubmit);
  const input = panel.querySelector('#ppInput');
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); panel.querySelector('#ppForm').requestSubmit(); }
  });

  // Restore session messages, otherwise show welcome
  const hist = loadHistory();
  if (hist.length) {
    hist.forEach(m => appendBubble(m.role, m.content, { skipHistory: true }));
  } else {
    appendBubble('assistant', `Bonjour ! Je suis **M. PELLETIER** 👋
Je suis là pour t'aider à comprendre tes cours, corriger tes exercices, ou réviser pour un contrôle.
Pose-moi n'importe quelle question de maths ; tu peux aussi cliquer sur les suggestions ci-dessous.`,
      { skipHistory: true });
  }

  renderSuggestions();
}

function toggleChat() {
  panelOpen ? closeChat() : openChat();
}
function openChat() {
  const panel = document.getElementById('pelletierPanel');
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('open'));
  panelOpen = true;
  document.body.classList.add('pp-open');
  setTimeout(() => document.getElementById('ppInput')?.focus(), 250);
}
function closeChat() {
  const panel = document.getElementById('pelletierPanel');
  panel.classList.remove('open');
  document.body.classList.remove('pp-open');
  panelOpen = false;
  setTimeout(() => { if (!panelOpen) panel.hidden = true; }, 240);
}
function toggleConfig() {
  const c = document.getElementById('ppConfig');
  c.hidden = !c.hidden;
  if (!c.hidden) document.getElementById('ppKey').value = '';
}
function saveKeyFromInput() {
  const v = document.getElementById('ppKey').value.trim();
  if (!v) { toast2('Saisis une clé d\'abord'); return; }
  if (!v.startsWith('sk-ant-')) {
    toast2('La clé Anthropic commence par sk-ant-');
    return;
  }
  setKey(v);
  document.getElementById('ppConfig').hidden = true;
  appendBubble('assistant', `✅ Clé enregistrée. Je peux maintenant te répondre par IA. Pose ta question !`);
}
function clearKey() {
  setKey(null);
  document.getElementById('ppKey').value = '';
  toast2('Clé retirée');
}

function autoGrow(e) {
  const t = e.currentTarget;
  t.style.height = 'auto';
  t.style.height = Math.min(160, t.scrollHeight) + 'px';
}

async function onSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('ppInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = '';
  appendBubble('user', msg);

  // Typing indicator
  const typing = appendBubble('assistant', '<span class="pp-typing"><i></i><i></i><i></i></span>', { html: true, transient: true });

  try {
    let reply;
    if (hasKey()) {
      reply = await askClaude(msg);
    } else {
      reply = localAnswer(msg) || `Je n'ai pas de réponse toute prête sur ce point. 🙏

Pour avoir une vraie conversation et corriger tes exercices en détail, configure une clé API Anthropic dans les paramètres (la roue dentée). Sinon, essaie une question sur :
• **second degré** • **dérivée** • **suites** • **proba conditionnelle**
• **exponentielle** • **trigonométrie** • **produit scalaire**
• **variable aléatoire** • **géométrie repérée** • **bac / révisions**`;
    }
    typing.remove();
    appendBubble('assistant', reply);
  } catch (err) {
    typing.remove();
    appendBubble('assistant', `❗ ${err.message || 'Erreur inattendue.'}\nVérifie ta clé API dans les paramètres.`);
  }
}

function appendBubble(role, content, opts = {}) {
  const msgs = document.getElementById('ppMsgs');
  const div = document.createElement('div');
  div.className = 'pp-msg pp-msg-' + role;
  if (role === 'assistant') {
    div.innerHTML = `<div class="pp-msg-avatar">${PELLETIER_AVATAR_SMALL}</div><div class="pp-msg-body">${formatMessage(content, opts.html)}</div>`;
  } else {
    div.innerHTML = `<div class="pp-msg-body">${formatMessage(content, opts.html)}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  if (!opts.skipHistory && !opts.transient && role !== 'assistant') {
    // user messages tracked through askClaude, but local fallback skips saving — we don't need them then
  }
  return div;
}

function formatMessage(text, isHtml) {
  if (isHtml) return text;
  // Minimal markdown: bold **x**, code `x`, line breaks
  let t = escape(text);
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/\n/g, '<br>');
  return t;
}
function escape(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }

const SUGGESTIONS = [
  'Comment résoudre une équation du 2nd degré ?',
  'Donne-moi la dérivée de (3x²+1)·eˣ',
  'Explique-moi la formule de Bayes',
  'Comment trouver le sommet d\'une parabole ?',
  'Limite de eˣ/x en +∞ ?',
  'Que vaut cos(π/3) ?',
  'Variance d\'une loi binomiale B(10, 0.3) ?',
  'Aide-moi à étudier f(x) = x³ − 3x',
  'Vecteur normal de la droite 2x + 3y − 6 = 0 ?',
  'Comment démontrer par récurrence ?',
  'Différence entre suite arithmétique et géométrique ?',
];
function renderSuggestions() {
  const c = document.getElementById('ppSuggestions');
  if (!c) return;
  // pick 4 random suggestions for variety
  const a = [...SUGGESTIONS].sort(() => Math.random() - 0.5).slice(0, 4);
  c.innerHTML = a.map(s => `<button class="pp-chip" type="button">${escape(s)}</button>`).join('');
  c.querySelectorAll('.pp-chip').forEach(b => b.addEventListener('click', () => {
    const i = document.getElementById('ppInput');
    i.value = b.textContent;
    i.focus();
    document.getElementById('ppForm').requestSubmit();
  }));
}

function toast2(msg) {
  // Use the existing global toast if defined, fall back to alert
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = msg;
    t.hidden = false;
    t.classList.add('show');
    clearTimeout(toast2._t);
    toast2._t = setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.hidden = true, 300); }, 1600);
  }
}
