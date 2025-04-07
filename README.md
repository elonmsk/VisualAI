# VisualAI

Application web permettant de générer des graphes de connaissances biomédicales en utilisant INDRA GO.

## Fonctionnalités

- Saisie de requêtes sur des thématiques biomédicales
- Extraction de données via PubMed + INDRA GO
- Création de graphes de connaissances interactifs avec NetworkX + Pyvis
- Affichage des graphes dans l'interface utilisateur

## Architecture

```
[ Frontend : Next.js ]
    |
    |  POST /api/generate_graph
    v
[ Backend : FastAPI (Python) ]
    - Appel PubMed → PMIDs
    - Appel INDRA GO → Statements
    - Construction graphe (NetworkX)
    - Layout (spring_layout / autres)
    - Visualisation (Pyvis → HTML)
    - Sauvegarde dans /graphs/
    - Renvoie l'URL du graphe HTML
```

## Installation

```bash
# Cloner le repo
git clone https://github.com/elonmsk/VisualAI.git
cd VisualAI/mvp2

# Installer les dépendances
npm install

# Lancer l'application en mode développement
npm run dev
```

## Technologies utilisées

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI (Python)
- **APIs**: PubMed, INDRA GO
- **Visualisation**: NetworkX, Pyvis
- **Authentification**: Supabase