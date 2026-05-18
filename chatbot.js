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
// Local fallback (no API key) : large pattern-matched formulaire
// Each entry covers a topic with EVERY important formula + a "leçon
// rapide" and "astuces bac". Keep the order specific-first so longer
// topics catch before generic words.
// ===================================================================
const FALLBACK_RESPONSES = [
  {
    keys: ['formulaire', 'toutes les formules', 'liste des formules', 'tout le programme'],
    answer: `📘 **FORMULAIRE — Première Spécialité Maths**

**1. Second degré** — ax² + bx + c
• Δ = b² − 4ac · racines x = (−b ± √Δ)/(2a) · sommet α = −b/(2a)
• Factorisation si Δ ≥ 0 : a(x − x₁)(x − x₂)
• Forme canonique : a(x − α)² + β

**2. Suites**
• Arithmétique : uₙ = u₀ + n·r ; Σ = (n+1)(u₀+uₙ)/2
• Géométrique : uₙ = u₀·qⁿ ; Σ = u₀(1−qⁿ⁺¹)/(1−q)

**3. Dérivation**
• (xⁿ)' = n·xⁿ⁻¹ · (√x)' = 1/(2√x) · (1/x)' = −1/x²
• (eˣ)' = eˣ · (ln x)' = 1/x · (sin x)' = cos x · (cos x)' = −sin x
• (uv)' = u'v + uv' · (u/v)' = (u'v − uv')/v² · (u∘v)' = u'(v)·v'

**4. Géométrie repérée**
• AB(x_B−x_A ; y_B−y_A) · ‖AB‖ = √((x_B−x_A)² + (y_B−y_A)²)
• Droite : ax + by + c = 0 (n = (a, b) normal) · y = mx + p

**5. Probabilité conditionnelle**
• P(B|A) = P(A∩B)/P(A) · Bayes : P(A|B) = P(B|A)·P(A)/P(B)
• Indépendance : P(A∩B) = P(A)·P(B)

**6. Étude de fonctions par la dérivation**
• f'(x) > 0 ⇒ f croissante · f'(x) < 0 ⇒ f décroissante
• Extremum local ⇔ f'(x₀) = 0 et changement de signe

**7. Cosinus & Sinus**
• cos² + sin² = 1 · cos(−x) = cos x · sin(−x) = −sin x
• cos(π−x) = −cos x · sin(π−x) = sin x · cos(π/2−x) = sin x

**8. Fonction exponentielle**
• e⁰ = 1 · e^(a+b) = eᵃ·eᵇ · (eˣ)' = eˣ · ln(eˣ) = x

**9. Variable aléatoire**
• E(X) = Σ xᵢ·P(X=xᵢ) · V(X) = E(X²) − E(X)² · σ = √V
• Binomiale B(n,p) : P(X=k) = C(n,k)·pᵏ(1−p)ⁿ⁻ᵏ · E = np · V = np(1−p)

**10. Produit scalaire**
• u·v = xx' + yy' = ‖u‖‖v‖cos θ
• u ⊥ v ⇔ u·v = 0
• ‖u + v‖² = ‖u‖² + 2u·v + ‖v‖²

Demande-moi n'importe quel sujet pour plus de détails 💡`
  },

  {
    keys: ['second degré', 'discriminant', 'delta', 'parabole', 'trinôme', 'b² − 4ac', 'b²-4ac', 'factoriser un trinôme', 'sommet'],
    answer: `**Second degré — ax² + bx + c**

🔹 **Discriminant** : Δ = b² − 4ac
• Δ > 0 : deux racines **x₁,₂ = (−b ± √Δ) / (2a)**, factorisation **a(x − x₁)(x − x₂)**
• Δ = 0 : une racine double **x₀ = −b / (2a)**, factorisation **a(x − x₀)²**
• Δ < 0 : pas de racines réelles, signe constant de a

🔹 **Forme canonique** : f(x) = a(x − α)² + β
• α = −b/(2a) (abscisse du sommet)
• β = f(α) (ordonnée du sommet)
• Axe de symétrie : x = α

🔹 **Signe de f**
• Si Δ > 0 : du signe de a à l'extérieur des racines, du signe opposé entre
• Si Δ ≤ 0 : du signe de a partout (sauf en x₀ si Δ = 0)

🔹 **Somme / produit des racines** (relations de Viète)
• x₁ + x₂ = −b/a · x₁·x₂ = c/a

🎯 **Astuce bac** : si tu vois ax² + bx + c, vérifie aussi si c'est une **identité remarquable** : (a+b)² = a² + 2ab + b², (a−b)² = a² − 2ab + b², (a+b)(a−b) = a² − b². Ça évite parfois le discriminant.

📘 **Chapitre 1 Second degré**.`
  },

  {
    keys: ['suite arithmétique', 'arithmétique', 'arithmetique', 'raison r', 'récurrence arithmétique'],
    answer: `**Suite arithmétique** de premier terme u₀ (ou u₁) et raison r

🔹 **Récurrence** : uₙ₊₁ = uₙ + r
🔹 **Forme explicite** : **uₙ = u₀ + n·r** (ou uₙ = u_p + (n − p)·r)
🔹 **Sens de variation** : croissante si r > 0, décroissante si r < 0

🔹 **Somme des n+1 premiers termes** :
**S = u₀ + u₁ + … + uₙ = (n+1) · (u₀ + uₙ) / 2**

Cas classique : 1 + 2 + 3 + … + n = **n(n+1)/2**

🎯 Pour **montrer** qu'une suite est arithmétique : prouve que uₙ₊₁ − uₙ est constant.

📘 **Chapitre 2 Les suites**.`
  },

  {
    keys: ['suite géométrique', 'géométrique', 'geometrique', 'raison q', 'qⁿ'],
    answer: `**Suite géométrique** de premier terme u₀ (ou u₁) et raison q ≠ 0

🔹 **Récurrence** : uₙ₊₁ = q · uₙ
🔹 **Forme explicite** : **uₙ = u₀ · qⁿ** (ou uₙ = u_p · q^(n − p))

🔹 **Sens de variation** (cas u₀ > 0)
• q > 1 : croissante
• 0 < q < 1 : décroissante
• q < 0 : alterne en signe

🔹 **Somme** (q ≠ 1) :
**S = u₀ + u₀q + … + u₀qⁿ = u₀ · (1 − qⁿ⁺¹) / (1 − q)**

🔹 **Limite**
• |q| < 1 : qⁿ → 0
• q > 1 : qⁿ → +∞
• q ≤ −1 : pas de limite

🎯 Pour **montrer** qu'une suite est géométrique : prouve que uₙ₊₁ / uₙ est constant.

📘 **Chapitre 2 Les suites**.`
  },

  {
    keys: ['suite', 'récurrence', 'recurrence', 'monotone', 'majorée', 'minorée', 'limite suite'],
    answer: `**Suites — boîte à outils**

🔹 **Sens de variation** : étudie le signe de uₙ₊₁ − uₙ (ou le rapport uₙ₊₁/uₙ si > 0).
🔹 **Majorée / minorée** : montre par récurrence que uₙ ≤ M (ou ≥ m).
🔹 **Convergente** : si croissante ET majorée, ou décroissante ET minorée.

🔹 **Récurrence** (preuve)
1. **Initialisation** : vérifie P(0) (ou le premier rang).
2. **Hérédité** : suppose P(n) vraie, démontre P(n+1).
3. **Conclusion** : P(n) vraie pour tout n.

🔹 **Limite** typique
• Suite arithmétique : limite = +∞ (r > 0), −∞ (r < 0), constante (r = 0)
• Suite géométrique : voir critère |q| vs 1

🎯 **Astuce bac** : pour une suite définie par uₙ₊₁ = f(uₙ), souvent on commence par montrer qu'elle est monotone et bornée, puis on calcule sa limite en résolvant ℓ = f(ℓ).

📘 **Chapitre 2 Les suites**.`
  },

  {
    keys: ['dérivée', 'deriver', 'tangente', 'taux de variation', 'derivable', 'nombre dérivé'],
    answer: `**Dérivation — formulaire complet**

🔹 **Définition** : f'(x₀) = lim (h→0) [f(x₀+h) − f(x₀)] / h

🔹 **Dérivées usuelles**
| f(x) | f'(x) |
|---|---|
| k (constante) | 0 |
| xⁿ | n·xⁿ⁻¹ |
| 1/x | −1/x² |
| 1/xⁿ | −n/xⁿ⁺¹ |
| √x | 1/(2√x) |
| eˣ | eˣ |
| ln x | 1/x |
| sin x | cos x |
| cos x | −sin x |
| tan x | 1 + tan²x = 1/cos²x |

🔹 **Règles d'opération**
• (u + v)' = u' + v'
• (k·u)' = k·u'
• (u·v)' = u'v + uv'
• (u/v)' = (u'v − uv') / v²  (v ≠ 0)
• (u ∘ v)'(x) = u'(v(x)) · v'(x)
• (uⁿ)' = n·uⁿ⁻¹·u'
• (eᵘ)' = u'·eᵘ
• (ln u)' = u'/u (u > 0)

🔹 **Équation de la tangente** en a : **y = f'(a)(x − a) + f(a)**

🎯 **Astuce bac** : pour un produit, regarde toujours s'il vaut mieux développer d'abord. (3x² + 5)·(x − 7) = c'est plus rapide de développer ici.

📘 **Chapitres 3 Dérivation** et **6 Étude de fonctions**.`
  },

  {
    keys: ['étude de fonction', 'variations', 'tableau de variations', 'extremum', 'minimum', 'maximum'],
    answer: `**Étude de fonction — méthode**

1. **Domaine de définition** D_f.
2. **Limites aux bornes** de D_f.
3. **Dérivée** f'(x).
4. **Signe de f'(x)** (souvent résoudre f'(x) > 0).
5. **Tableau de variations** : flèches selon le signe de f'.
6. **Extremums** : f'(x₀) = 0 et changement de signe ⟹ extremum local.
7. **Asymptotes** (horizontale, verticale, oblique).

🔹 **Lien f' / sens de variation**
• f'(x) > 0 sur I ⇒ f croissante sur I
• f'(x) < 0 sur I ⇒ f décroissante sur I
• f'(x) = 0 isolé : tangente horizontale, à étudier

🔹 **Convexité** (concavité)
• f''(x) > 0 sur I ⇒ f convexe (∪) sur I
• f''(x) < 0 sur I ⇒ f concave (∩) sur I
• Point d'inflexion : f'' change de signe

🎯 **Astuce bac** : si tu vois "déterminer le nombre de solutions de f(x) = k", utilise le théorème des valeurs intermédiaires + monotonie.

📘 **Chapitre 6 Étude de fonctions**.`
  },

  {
    keys: ['probabilité', 'probabilite', 'proba', 'arbre', 'conditionnelle', 'bayes', 'événement', 'indépendant', 'totales'],
    answer: `**Probabilités conditionnelles — toutes les formules**

🔹 **Probabilité conditionnelle**
**P(B | A) = P(A ∩ B) / P(A)** (probabilité de B sachant A)

🔹 **Intersection** : P(A ∩ B) = P(A) · P(B | A) = P(B) · P(A | B)

🔹 **Probabilités totales** (A, A‾ système complet)
**P(B) = P(A)·P(B|A) + P(A‾)·P(B|A‾)**

Plus généralement avec {A₁, …, Aₙ} système complet :
P(B) = Σ P(Aᵢ) · P(B | Aᵢ)

🔹 **Formule de Bayes**
**P(A | B) = [P(B | A) · P(A)] / P(B)**

🔹 **Indépendance**
A et B indépendants ⟺ **P(A ∩ B) = P(A) · P(B)**
⟺ P(B | A) = P(B)

🔹 **Complémentaire** : P(A‾) = 1 − P(A)

🔹 **Réunion** : P(A ∪ B) = P(A) + P(B) − P(A ∩ B)

🎯 **Astuce bac** : dessine **toujours** un arbre pondéré ! Les probas sur les branches partantes d'un même nœud somment à 1.

📘 **Chapitre 5 Probabilité conditionnelle**.`
  },

  {
    keys: ['exponentielle', 'exp', 'eˣ', 'e^x', 'logarithme', 'ln', 'fonction exponentielle'],
    answer: `**Fonction exponentielle**

🔹 **Définition** : exp est l'unique fonction f dérivable sur ℝ telle que **f' = f** et **f(0) = 1**. On note exp(x) = eˣ.

🔹 **Propriétés algébriques**
• e⁰ = 1 · e¹ = e ≈ 2,718
• e^(a+b) = eᵃ · eᵇ
• e^(a−b) = eᵃ / eᵇ
• (eᵃ)ⁿ = e^(n·a)
• e^(−a) = 1 / eᵃ
• eˣ > 0 pour tout x ∈ ℝ

🔹 **Dérivation**
• (eˣ)' = eˣ
• (eᵘ⁽ˣ⁾)' = u'(x) · e^(u(x))

🔹 **Limites de référence**
• lim (x → +∞) eˣ = +∞
• lim (x → −∞) eˣ = 0⁺
• lim (x → +∞) eˣ / x = +∞ (croissance comparée)
• lim (x → +∞) eˣ / xⁿ = +∞
• lim (x → −∞) x·eˣ = 0
• lim (h → 0) (eʰ − 1)/h = 1

🔹 **Variations** : strictement croissante sur ℝ ; bijection ℝ → ]0 ; +∞[

🔹 **Lien avec le ln** : eˣ = y ⇔ x = ln y (y > 0)

🎯 **Astuce bac** : eˣ « écrase » tout — pour les croissances comparées, eˣ l'emporte sur xⁿ, qui l'emporte sur ln x.

📘 **Chapitre 8 Fonction exponentielle**.`
  },

  {
    keys: ['cosinus', 'sinus', 'tan', 'trigo', 'radian', 'cercle trigo', 'cercle trigonométrique'],
    answer: `**Trigonométrie**

🔹 **Cercle trigonométrique** : cercle de rayon 1 centré en O.
À un angle x (en radians) correspond le point **M(cos x ; sin x)**.

🔹 **Identité fondamentale** : **cos²x + sin²x = 1**

🔹 **Valeurs remarquables**
| x | 0 | π/6 | π/4 | π/3 | π/2 |
|---|---|---|---|---|---|
| cos x | 1 | √3/2 | √2/2 | 1/2 | 0 |
| sin x | 0 | 1/2 | √2/2 | √3/2 | 1 |
| tan x | 0 | √3/3 | 1 | √3 | ∞ |

🔹 **Symétries**
• cos(−x) = cos x ; sin(−x) = −sin x (parité)
• cos(π − x) = −cos x ; sin(π − x) = sin x
• cos(π + x) = −cos x ; sin(π + x) = −sin x
• cos(π/2 − x) = sin x ; sin(π/2 − x) = cos x

🔹 **Périodicité** : cos et sin ont une période 2π ; tan a une période π.

🔹 **Dérivées**
• (cos x)' = −sin x · (sin x)' = cos x
• (tan x)' = 1 + tan² x = 1 / cos² x

🔹 **Conversion** : 1 rad = 180/π ° ≈ 57,3° ; π rad = 180°.

🎯 **Astuce bac** : retiens la **« main de trigo »** : sin pour le pouce de 0 à π/2 → √0/2, √1/2, √2/2, √3/2, √4/2.

📘 **Chapitre 7 Cosinus et Sinus**.`
  },

  {
    keys: ['produit scalaire', 'orthogonal', 'norme', 'vecteur', 'angle entre vecteurs', 'projeté'],
    answer: `**Produit scalaire**

🔹 **Définition (repère orthonormé)** : u(x ; y), v(x' ; y')
**u · v = xx' + yy'**

🔹 **Définition géométrique**
**u · v = ‖u‖ · ‖v‖ · cos(û, v̂)**

🔹 **Norme** : ‖u‖ = √(x² + y²) = √(u · u)

🔹 **Orthogonalité**
u ⊥ v ⟺ **u · v = 0**

🔹 **Projection** de u sur v (vecteur unitaire ŵ = v/‖v‖) :
u · v = ‖u_proj‖ · ‖v‖

🔹 **Identités remarquables vectorielles**
• ‖u + v‖² = ‖u‖² + 2 u·v + ‖v‖²
• ‖u − v‖² = ‖u‖² − 2 u·v + ‖v‖²
• (u + v)·(u − v) = ‖u‖² − ‖v‖²

🔹 **Linéarité**
• (u + w) · v = u·v + w·v
• (k·u) · v = k · (u · v)
• u · v = v · u

🔹 **Théorème d'Al-Kashi** dans un triangle ABC :
**a² = b² + c² − 2bc · cos(Â)**

🎯 **Astuce bac** : si on te demande un angle dans un triangle, écris d'abord u · v dans la base canonique, puis identifie avec ‖u‖‖v‖cos θ.

📘 **Chapitre 10 Produit scalaire**.`
  },

  {
    keys: ['variable aléatoire', 'espérance', 'variance', 'binomiale', 'écart-type', 'loi binomiale', 'bernoulli'],
    answer: `**Variable aléatoire**

🔹 **Variable aléatoire discrète** X qui prend les valeurs x₁, x₂, …, xₙ.
• **Loi de probabilité** : P(X = xᵢ) = pᵢ avec Σ pᵢ = 1.
• **Espérance** : **E(X) = Σ xᵢ · pᵢ**
• **Variance** : **V(X) = E(X²) − [E(X)]² = Σ pᵢ (xᵢ − E(X))²**
• **Écart-type** : σ(X) = √V(X)

🔹 **Linéarité de l'espérance** : E(aX + b) = a·E(X) + b
🔹 **Variance** : V(aX + b) = a² · V(X)

🔹 **Loi de Bernoulli** B(p) : X = 1 avec proba p, X = 0 avec proba 1 − p.
• E(X) = p · V(X) = p(1 − p)

🔹 **Loi binomiale** B(n, p) — somme de n Bernoulli indépendantes
• **P(X = k) = C(n, k) · pᵏ · (1−p)ⁿ⁻ᵏ** pour k = 0, 1, …, n
• **E(X) = np**
• **V(X) = np(1 − p)**
• σ(X) = √(np(1−p))

🔹 **Coefficient binomial** : C(n, k) = n! / (k! (n−k)!), aussi noté (n choose k).
Relation : **C(n, k) = C(n−1, k−1) + C(n−1, k)** (Pascal)

🎯 **Astuce bac** : pour P(X ≥ k) avec une binomiale, calcule plutôt P(X ≥ k) = 1 − P(X ≤ k−1).

📘 **Chapitre 9 Variable aléatoire**.`
  },

  {
    keys: ['géométrie repérée', 'géométrie repere', 'vecteur', 'coordonnées', 'droite', 'pente', 'équation cartésienne', 'normal'],
    answer: `**Géométrie repérée**

🔹 **Vecteur** AB(x_B − x_A ; y_B − y_A)
🔹 **Milieu** I de [AB] : ( (x_A + x_B)/2 ; (y_A + y_B)/2 )
🔹 **Distance** AB = ‖AB‖ = √((x_B − x_A)² + (y_B − y_A)²)

🔹 **Vecteurs colinéaires** : u(x, y) et v(x', y') colinéaires ⟺ **xy' − x'y = 0**
🔹 **Trois points alignés** : AB et AC colinéaires.

🔹 **Droite — équation cartésienne** : **ax + by + c = 0**
• Vecteur directeur : (−b ; a)
• Vecteur normal : (a ; b)

🔹 **Droite — équation réduite** (si b ≠ 0) : **y = mx + p**
• m = pente · p = ordonnée à l'origine

🔹 **Pente entre A et B** : m = (y_B − y_A) / (x_B − x_A)

🔹 **Droites parallèles** : mêmes coefficients directeurs (à un facteur près) ⟺ vecteurs directeurs colinéaires.
🔹 **Droites perpendiculaires** : m · m' = −1 (forme réduite) ou vecteurs directeurs orthogonaux.

🔹 **Équation d'une droite passant par A(x_A, y_A) avec vecteur directeur (α, β)**
• Cartésienne : β(x − x_A) − α(y − y_A) = 0

🎯 **Astuce bac** : retrouver une équation cartésienne — pars d'un point ET d'un vecteur directeur (ou normal), c'est immédiat.

📘 **Chapitre 4 Géométrie repérée**.`
  },

  {
    keys: ['somme', 'binomial', 'pascal', 'newton', 'binôme'],
    answer: `**Formule du binôme & coefficients**

🔹 **Triangle de Pascal**
Chaque coefficient = somme des deux au-dessus.
C(n, k) = C(n−1, k−1) + C(n−1, k)

🔹 **Formule du binôme de Newton** :
**(a + b)ⁿ = Σ_{k=0}^{n} C(n, k) · a^(n−k) · b^k**

Cas particuliers :
• (a + b)² = a² + 2ab + b²
• (a + b)³ = a³ + 3a²b + 3ab² + b³
• (a − b)² = a² − 2ab + b²
• (a + b)(a − b) = a² − b²

🔹 **Sommes usuelles**
• 1 + 2 + … + n = n(n+1)/2
• 1² + 2² + … + n² = n(n+1)(2n+1)/6
• 1³ + 2³ + … + n³ = (n(n+1)/2)²

📘 Utile en **suites**, **proba** et **annales**.`
  },

  {
    keys: ['limite', 'asymptote', 'forme indéterminée', 'croissance comparée'],
    answer: `**Limites**

🔹 **Limites usuelles**
• 1/x → 0 quand x → ±∞
• xⁿ → +∞ quand x → +∞ (n > 0)
• eˣ → +∞ quand x → +∞ ; → 0⁺ quand x → −∞
• ln x → +∞ quand x → +∞ ; → −∞ quand x → 0⁺

🔹 **Croissances comparées** (x → +∞)
• eˣ ≫ xⁿ ≫ ln x : eˣ l'emporte, ln la plus lente
• lim eˣ/xⁿ = +∞ · lim xⁿ/ln x = +∞ · lim ln x / x = 0

🔹 **Formes indéterminées** à lever
• ∞ − ∞ : factoriser le terme dominant
• 0/0 et ∞/∞ : factoriser, simplifier
• 0 × ∞ : transformer en 0/0 ou ∞/∞
• Suite : étudier le quotient et reconnaître croissance comparée

🔹 **Asymptotes**
• Verticale x = a : lim |f| → +∞ en a
• Horizontale y = b : lim f → b en ±∞
• Oblique y = ax + b : lim (f(x) − (ax+b)) = 0

🎯 **Astuce bac** : pour x → +∞ d'un quotient polynomial, garde le degré dominant haut/bas.

📘 **Chapitres 6 Étude de fonctions** et **8 Exponentielle**.`
  },


  {
    keys: ['bac', 'annales', 'révision', 'controle', 'contrôle', 'sujet', 'préparer', 'preparer', 'astuce'],
    answer: `**Préparer un contrôle ou un bac blanc**

🔹 **Plan de révision (sur 2-4 semaines)**
1. Reprends les **fiches** de chaque chapitre.
2. Fais une grille des **formules clés** que tu écris à la main 3 fois par chapitre.
3. Refais 2-3 **exercices par jour** ciblés sur tes points faibles.
4. Termine par un **bac blanc** chronométré + correction.

🔹 **Le jour J**
• Lis le sujet **en entier** avant de commencer.
• Fais d'abord les questions où tu te sens à l'aise.
• Justifie : « D'après … », « car … », « donc … ».
• Pas le temps ? Pose le théorème, esquisse la méthode, écris la formule — tu grappilles des points.

🔹 **Pièges fréquents**
• Oublier le **domaine de définition** (ln, dénominateurs)
• Confondre **conditionnelle** et **intersection** en proba
• Mal poser la **récurrence** (initialisation + hérédité explicites)
• Oublier le **vecteur directeur** vs **normal** d'une droite

🔹 **Notation propre**
• Encadre tes **résultats finaux**
• Numéro de question bien visible
• Schémas / arbres / tableaux quand pertinent

🎯 Le bac récompense la **rigueur**, pas la complexité. Une démonstration courte mais juste vaut une longue mais boiteuse.

📘 Voir **« Exercices annales »** sur le site.`
  },

  {
    keys: ['leçon', 'lecon', 'résumé', 'resume', 'rappel', 'rappels'],
    answer: `**Leçons rapides — clique sur un chapitre pour le menu détaillé**

📖 **Chapitre 1** : Second degré → discriminant Δ = b²−4ac, racines, sommet, forme canonique.
📖 **Chapitre 2** : Suites → arithmétique uₙ = u₀ + nr, géométrique uₙ = u₀qⁿ, récurrence.
📖 **Chapitre 3** : Dérivation → dérivées usuelles, règles produit/quotient/composée.
📖 **Chapitre 4** : Géométrie repérée → vecteurs, droites (cartésienne / réduite), pente.
📖 **Chapitre 5** : Probabilité conditionnelle → arbres, formule de Bayes, indépendance.
📖 **Chapitre 6** : Étude de fonctions → tableau de variations, extrema, asymptotes.
📖 **Chapitre 7** : Cosinus & Sinus → cercle trigo, identité cos² + sin² = 1, valeurs remarquables.
📖 **Chapitre 8** : Fonction exponentielle → propriétés, dérivée, croissances comparées.
📖 **Chapitre 9** : Variable aléatoire → loi, E(X), V(X), σ(X), binomiale.
📖 **Chapitre 10** : Produit scalaire → u·v = xx'+yy', orthogonalité, identités.

Demande un de ces sujets pour avoir le **formulaire complet** et les **astuces bac** correspondants.`
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
// Gemini hand-off — prompt designed to make Gemini an effective tutor
// for this specific site & curriculum. The user clicks "Continuer avec
// Gemini" which copies this prompt to the clipboard then opens
// gemini.google.com. They paste it as the first message.
// ===================================================================
const GEMINI_SYSTEM_PROMPT = `Tu es désormais "M. PELLETIER", un professeur de mathématiques chaleureux et expert, inspiré par Albert Einstein. Tu accompagnes un élève français en Première Spécialité Mathématiques (programme français du lycée).

OBJECTIF
- Aider l'élève à comprendre son cours, à corriger ses exercices, à se préparer au bac.
- Si l'élève colle un énoncé d'exercice : résous-le ÉTAPE PAR ÉTAPE, en justifiant chaque ligne.
- Si l'élève demande une explication : donne une mini-leçon claire, structurée, avec des exemples.
- Si l'élève montre sa correction : valide ou corrige avec bienveillance ; explique POURQUOI.

STYLE OBLIGATOIRE
- Tutoie l'élève.
- Réponds toujours en français.
- Pas de bavardage : va à l'essentiel.
- Structure : listes, étapes numérotées, encadrés "Astuce" si pertinent.
- Écris les formules en notation simple lisible :
  • "f(x) = ax² + bx + c"
  • "Δ = b² − 4ac"
  • "x = (−b ± √Δ) / (2a)"
  • "lim (x→+∞) eˣ/x = +∞"
  • "P(B|A) = P(A∩B)/P(A)"
  Pas de LaTeX brut, pas de Markdown lourd.

PROGRAMME DE PREMIÈRE SPÉCIALITÉ MATHS (à connaître par cœur)

1) SECOND DEGRÉ
- Δ = b² − 4ac · racines (−b ± √Δ)/(2a)
- Forme canonique a(x − α)² + β · sommet (α, β) avec α = −b/(2a)
- Signe : du signe de a hors des racines (si Δ > 0)
- Viète : x₁ + x₂ = −b/a · x₁·x₂ = c/a

2) SUITES
- Arithmétique : uₙ = u₀ + nr · Σ = (n+1)(u₀ + uₙ)/2
- Géométrique : uₙ = u₀·qⁿ · Σ = u₀(1 − qⁿ⁺¹)/(1 − q) si q ≠ 1
- Récurrence : initialisation + hérédité
- Limites : selon r ou q

3) DÉRIVATION
- (xⁿ)' = n·xⁿ⁻¹ · (√x)' = 1/(2√x) · (1/x)' = −1/x²
- (eˣ)' = eˣ · (sin x)' = cos x · (cos x)' = −sin x
- (uv)' = u'v + uv' · (u/v)' = (u'v − uv')/v²
- Tangente en a : y = f'(a)(x − a) + f(a)
- ⚠️ La fonction ln, sa dérivée, ses limites : NE PAS utiliser, c'est au programme de Terminale.

4) GÉOMÉTRIE REPÉRÉE
- AB(x_B − x_A ; y_B − y_A) · ‖AB‖ = √(Δx² + Δy²)
- Colinéarité : xy' − x'y = 0
- Droite : ax + by + c = 0 (normal (a, b), directeur (−b, a))
- Équation réduite : y = mx + p
- Parallèles ⟺ même m · Perpendiculaires ⟺ m·m' = −1

5) PROBABILITÉ CONDITIONNELLE
- P(B|A) = P(A∩B)/P(A)
- Probabilités totales : P(B) = Σ P(Aᵢ)·P(B|Aᵢ)
- Bayes : P(A|B) = P(B|A)·P(A)/P(B)
- Indépendance : P(A∩B) = P(A)·P(B)
- Arbres pondérés : branches partantes somment à 1.

6) ÉTUDE DE FONCTIONS PAR LA DÉRIVATION
- f'(x) > 0 ⇒ f croissante · f'(x) < 0 ⇒ f décroissante
- Extremum local : f'(x₀) = 0 + changement de signe
- Convexité : f''(x) > 0 ⇒ convexe · point d'inflexion : f'' change de signe
- Théorème des valeurs intermédiaires + monotonie

7) COSINUS ET SINUS
- cos² + sin² = 1
- cos(−x) = cos x · sin(−x) = −sin x
- cos(π − x) = −cos x · sin(π − x) = sin x
- cos(π/2 − x) = sin x · sin(π/2 − x) = cos x
- Valeurs : 0, π/6, π/4, π/3, π/2 → cos 1, √3/2, √2/2, 1/2, 0 ; sin 0, 1/2, √2/2, √3/2, 1
- Dérivées : (cos x)' = −sin x · (sin x)' = cos x
- Conversion : 1 rad = 180/π °

8) FONCTION EXPONENTIELLE
- e⁰ = 1 · e^(a+b) = eᵃ·eᵇ · (eᵃ)ⁿ = e^(na) · e^(−a) = 1/eᵃ
- eˣ > 0 pour tout x
- (eˣ)' = eˣ · (e^u)' = u'·e^u
- lim eˣ = +∞ en +∞ · lim eˣ = 0⁺ en −∞
- Croissance comparée (au programme de Première) : lim (x→+∞) eˣ/x = +∞

9) VARIABLE ALÉATOIRE
- E(X) = Σ xᵢ·P(X = xᵢ)
- V(X) = E(X²) − E(X)² · σ = √V
- Linéarité : E(aX + b) = aE(X) + b · V(aX + b) = a²V(X)
- Binomiale B(n, p) : P(X = k) = C(n, k)·pᵏ(1−p)ⁿ⁻ᵏ
- E(B(n, p)) = np · V(B(n, p)) = np(1 − p)
- Coefficients : C(n, k) = n!/(k!(n−k)!) · Pascal : C(n, k) = C(n−1, k−1) + C(n−1, k)

10) PRODUIT SCALAIRE
- u·v = xx' + yy' = ‖u‖‖v‖cos θ
- ‖u‖² = u·u
- u ⊥ v ⇔ u·v = 0
- ‖u + v‖² = ‖u‖² + 2u·v + ‖v‖²
- Al-Kashi : a² = b² + c² − 2bc cos Â

PIÈGES TYPIQUES BAC
- Oublier le domaine de définition (racine, dénominateur)
- Confondre P(A∩B) et P(B|A)
- Mal poser la récurrence (initialisation + hérédité explicitées)
- Confondre vecteur directeur et normal d'une droite
- Oublier de vérifier les hypothèses d'un théorème (signe constant, monotonie)

⚠️ HORS PROGRAMME (Terminale ou plus) — NE PAS UTILISER :
- Logarithme népérien (ln), sa dérivée, ses limites
- Intégrales, primitives
- Nombres complexes (i, e^(iπ), module |z|, etc.)
- Continuité formelle, théorème des valeurs intermédiaires formel
- Théorie des ensembles avancée (∀, ∃, ⊂, ∈)
- Dérivée d'une composée générale (u∘v)' — n'utiliser que les cas du programme : (u^n)', (e^u)', (cos(ax+b))', etc.

DEMANDE DE L'ÉLÈVE
[Ici l'élève va te poser sa question / coller son exercice]`;

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
      <button class="pp-close icon-btn" aria-label="Fermer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
    </header>
    <div class="pp-body" id="ppBody">
      <div class="pp-msgs" id="ppMsgs" aria-live="polite"></div>
    </div>
    <form class="pp-input" id="ppForm">
      <textarea id="ppInput" rows="1" placeholder="Pose une question à M. PELLETIER…" aria-label="Message"></textarea>
      <button type="submit" id="ppSend" class="pp-send" aria-label="Envoyer" title="Envoyer (Entrée)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12l18-9-9 18-2-7-7-2z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" fill="currentColor" fill-opacity=".2"/></svg>
      </button>
    </form>
    <div class="pp-gemini-row">
      <button class="pp-gemini" id="ppGemini" type="button" title="Copier le prompt M. PELLETIER et ouvrir Gemini">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5 Z" fill="currentColor" opacity=".95"/></svg>
        <span>Continuer avec Gemini</span>
      </button>
    </div>
  `;
  document.body.appendChild(panel);

  // Wire UI
  btn.addEventListener('click', toggleChat);
  panel.querySelector('.pp-close').addEventListener('click', closeChat);
  panel.querySelector('#ppForm').addEventListener('submit', onSubmit);
  panel.querySelector('#ppGemini').addEventListener('click', handoffGemini);
  const input = panel.querySelector('#ppInput');
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); panel.querySelector('#ppForm').requestSubmit(); }
  });
  // When the keyboard opens on mobile, wait a tick for the viewport to settle
  // and re-pin the panel to the visible area + scroll the latest message in view.
  input.addEventListener('focus', () => setTimeout(syncPanelOnKeyboard, 200));

  // Restore session messages, otherwise show welcome
  const hist = loadHistory();
  if (hist.length) {
    hist.forEach(m => appendBubble(m.role, m.content, { skipHistory: true }));
  } else {
    appendBubble('assistant', `Bonjour ! Je suis **M. PELLETIER** 👋
Tape simplement le **nom d'un chapitre** pour voir la leçon entière.

Pour une **réponse plus précise** (corriger un exercice, expliquer en détail), clique sur **« Continuer avec Gemini »** en bas — un prompt prêt à l'emploi est copié automatiquement, tu n'as plus qu'à le coller. ✨`,
      { skipHistory: true });
  }
}

function toggleChat() {
  panelOpen ? closeChat() : openChat();
}
let _savedScrollY = 0;
function openChat() {
  const panel = document.getElementById('pelletierPanel');
  // Save current scroll, lock the body where it is so the home page
  // behind the panel cannot rubber-band on iOS.
  _savedScrollY = window.scrollY || window.pageYOffset || 0;
  document.body.style.top = `-${_savedScrollY}px`;
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add('open'));
  panelOpen = true;
  document.body.classList.add('pp-open');
  // Note: do NOT auto-focus the input on mobile — opening the keyboard
  // immediately is jarring. Users tap the input themselves when they
  // want to type.
}
function closeChat() {
  const panel = document.getElementById('pelletierPanel');
  panel.classList.remove('open');
  document.body.classList.remove('pp-open');
  document.body.style.top = '';
  // Restore the original scroll position
  window.scrollTo(0, _savedScrollY);
  panelOpen = false;
  setTimeout(() => { if (!panelOpen) panel.hidden = true; }, 240);
}

// Keep the latest message visible when the keyboard opens / closes.
// Layout itself is handled in CSS (100dvh + bottom-of-panel input), and
// iOS auto-zoom is prevented by forcing input font-size to 16px in CSS.
function syncPanelOnKeyboard() {
  const msgs = document.getElementById('ppMsgs');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', syncPanelOnKeyboard);
}
function autoGrow(e) {
  const t = e.currentTarget;
  t.style.height = 'auto';
  t.style.height = Math.min(160, t.scrollHeight) + 'px';
}

async function onSubmit(e) {
  e.preventDefault();
  if (botBusy) return;                        // cooldown active — ignore
  const input = document.getElementById('ppInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  input.style.height = '';
  setBotBusy(true);                           // lock the send button
  appendBubble('user', msg);
  scrollMsgsToBottom();

  const typing = appendBubble('assistant', '<span class="pp-typing"><i></i><i></i><i></i></span>', { html: true, transient: true });
  // 1-second cooldown released after the bot fully finishes typing
  const release = () => setTimeout(() => setBotBusy(false), 1000);
  try {
    const reply = localAnswer(msg) || `Pour voir la **leçon entière**, tape simplement le **nom d'un chapitre** (ex : « dérivation », « suites », « probabilité »…).

Pour une **réponse plus précise** (corriger un exercice, expliquer en détail), clique sur **« Continuer avec Gemini »** en bas — un prompt prêt à l'emploi est copié automatiquement, tu n'as plus qu'à le coller. ✨`;
    await new Promise(r => setTimeout(r, 650 + Math.random() * 350));
    typing.remove();
    appendBubble('assistant', reply, { onDone: release });
  } catch (err) {
    typing.remove();
    appendBubble('assistant', `❗ ${err.message || 'Erreur inattendue.'}`, { onDone: release });
  }
}

function appendBubble(role, content, opts = {}) {
  const msgs = document.getElementById('ppMsgs');
  const div = document.createElement('div');
  div.className = 'pp-msg pp-msg-' + role;
  const shouldType = role === 'assistant' && !opts.html && !opts.transient && !opts.skipHistory;
  if (role === 'assistant') {
    const bodyHtml = shouldType ? '' : formatMessage(content, opts.html);
    div.innerHTML = `<div class="pp-msg-avatar">${PELLETIER_AVATAR_SMALL}</div><div class="pp-msg-body">${bodyHtml}</div>`;
  } else {
    div.innerHTML = `<div class="pp-msg-body">${formatMessage(content, opts.html)}</div>`;
  }
  msgs.appendChild(div);
  scrollMsgsToBottom();
  if (shouldType) {
    typewriterReveal(div.querySelector('.pp-msg-body'), content, opts.onDone);
  } else if (opts.onDone) {
    opts.onDone();
  }
  return div;
}

// ===== Bot busy / cooldown =====
let botBusy = false;
function setBotBusy(busy) {
  botBusy = busy;
  const sendBtn = document.getElementById('ppSend');
  if (sendBtn) sendBtn.disabled = busy;
}

// The actual scrollable container is .pp-body (NOT .pp-msgs which has no
// overflow). Setting scrollTop on .pp-msgs did nothing, which is why the
// view stayed put. Now we scroll the right element.
function scrollMsgsToBottom() {
  const body = document.getElementById('ppBody');
  if (!body) return;
  body.scrollTop = body.scrollHeight;
  requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
}

// Type the text out word by word, scrolling along. Calls onDone when finished.
function typewriterReveal(el, text, onDone) {
  if (!el) { onDone && onDone(); return; }
  const tokens = text.match(/\s+|[^\s]+/g) || [];
  let acc = '';
  let i = 0;
  const speed = 22;
  const jitter = 18;
  function step() {
    if (!el.isConnected) { onDone && onDone(); return; }
    if (i >= tokens.length) { scrollMsgsToBottom(); onDone && onDone(); return; }
    acc += tokens[i++];
    el.innerHTML = formatMessage(acc);
    scrollMsgsToBottom();
    setTimeout(step, speed + Math.random() * jitter);
  }
  step();
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

async function handoffGemini() {
  // Combine the persona prompt with the last user question if any
  const hist = loadHistory();
  const lastUser = [...hist].reverse().find(m => m.role === 'user')?.content
                || document.getElementById('ppInput')?.value?.trim()
                || '';
  let prompt = GEMINI_SYSTEM_PROMPT;
  if (lastUser) {
    prompt = prompt.replace('[Ici l\'élève va te poser sa question / coller son exercice]', lastUser);
  }
  try {
    await navigator.clipboard.writeText(prompt);
    toast2('Prompt copié — colle-le dans Gemini');
  } catch {
    // Fallback: create a hidden textarea and select it
    const ta = document.createElement('textarea');
    ta.value = prompt;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast2('Prompt copié — colle-le dans Gemini'); }
    catch { toast2('Impossible de copier — sélectionne et copie manuellement'); }
    document.body.removeChild(ta);
  }
  // Open Gemini in a new tab after a short delay so the toast is visible
  setTimeout(() => window.open('https://gemini.google.com/app', '_blank', 'noopener'), 400);
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
