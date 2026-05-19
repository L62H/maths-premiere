# Spécialité Mathématiques — Première Générale

Site interactif pour consulter l'intégralité du programme officiel de **Spécialité Mathématiques en Première Générale** : cours, diaporamas, exercices et annales.

**Démo en ligne :** https://l62h.github.io/maths-premiere/

## Fonctionnalités

- 10 chapitres + section annales (23 documents au total)
- Visionneuse PDF intégrée (PDF.js) avec vignettes, zoom, navigation clavier
- Recherche instantanée (raccourci `/`)
- Favoris et historique des récents
- Mode clair / sombre
- Responsive : ordinateur, tablette, téléphone
- Téléchargement des PDF et des PowerPoint originaux

## Raccourcis clavier (visionneuse)

| Touche | Action |
|---|---|
| ← / → | Page précédente / suivante |
| Home / End | Première / dernière page |
| + / - | Zoom |
| 0 | Ajuster à la page |
| F | Plein écran |
| Échap | Fermer la visionneuse |
| / | Focus sur la recherche |

## Structure

```
.
├── index.html        Coquille HTML
├── app.css           Design (gris / blanc / or, clair/sombre, responsive)
├── app.js            Routage, viewer PDF.js, recherche, favoris
├── manifest.json     Index des chapitres et documents
└── assets/
    ├── pdf/          PDF (originaux + convertis depuis PowerPoint)
    ├── original/     Fichiers .pptx originaux (téléchargeables)
    └── downloads/    Fichiers GeoGebra (.ggb)
```

## Hébergement

Site 100 % statique servi par GitHub Pages. Aucun build, aucun serveur requis.

## Licence

Les contenus pédagogiques (cours, exercices, diaporamas) restent la propriété de leurs auteurs respectifs.  Le code du site est libre d'usage.
