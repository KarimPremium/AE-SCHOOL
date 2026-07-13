# AE Academy Pro — Parcours intermédiaire After Effects

Une plateforme LMS interactive construite avec **Next.js App Router**, **React**, **TypeScript**, **Tailwind CSS** et **Lucide React**.

Cette version est la suite du parcours débutant. Elle représente **37 heures d’apprentissage**, réparties en **40 leçons**, **10 modules** et **10 projets de production**.

## Niveau atteint

À la fin du parcours, l’élève vise un niveau **intermédiaire solide / junior motion designer**. Il peut :

- construire des animations avancées avec le Graph Editor ;
- créer des systèmes de Shape Layers et de typographie animée ;
- écrire et organiser des expressions réutilisables ;
- réaliser des scènes 2.5D avec caméras et lumières ;
- effectuer du tracking, de la stabilisation et du remplacement d’écran ;
- utiliser Keylight, Roto Brush et les techniques d’intégration ;
- rigger et animer un personnage 2D ;
- créer des effets procéduraux et des systèmes de particules ;
- produire des MOGRT et des brand toolkits ;
- optimiser, exporter et présenter une pièce de portfolio.

## Programme

1. Animation avancée — boucle produit premium
2. Formes & typographie — générique typographique
3. Expressions & procédural — pack social automatisé
4. 2.5D, caméras & lumières — affiche cinématique
5. Tracking & stabilisation — remplacement d’écran
6. Compositing & détourage — composite invisible
7. Character animation — boucle personnage
8. Particules & effets procéduraux — portail énergétique
9. Workflow professionnel — brand toolkit réutilisable
10. Livraison & portfolio — film final de 20 à 30 secondes

## Expérience pédagogique

Chaque leçon contient :

- des objectifs opérationnels ;
- une explication condensée et une analogie visuelle ;
- une méthode pas à pas ;
- un laboratoire interactif ;
- les erreurs fréquentes à diagnostiquer ;
- un défi de production avec livrable et grille d’évaluation ;
- un quiz corrigé ;
- des ressources officielles Adobe ;
- un carnet de notes persistant ;
- un mentor pédagogique simulé.

La progression, les défis, les quiz et les notes sont sauvegardés avec `localStorage`.

## Installation

Prérequis : Node.js 20.9 ou version plus récente.

```bash
npm install
npm run dev
```

Ouvrir ensuite `http://localhost:3000`.

## Vérifications

```bash
npm run lint
npm run build
```

Le projet a été vérifié avec TypeScript strict et compilé avec succès en production.

## Déploiement Vercel

### Avec GitHub

1. Créer un dépôt GitHub.
2. Envoyer tous les fichiers du projet.
3. Importer le dépôt dans Vercel.
4. Laisser Vercel détecter automatiquement Next.js.
5. Cliquer sur **Deploy**.

### Sans GitHub

```bash
npm install -g vercel
vercel --prod
```

Aucune variable d’environnement ni base de données n’est nécessaire pour cette version statique.
