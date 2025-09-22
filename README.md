# MediCare - Gestion de Cabinet Médical

## 📋 Description

Application web monopage (SPA) pour la gestion complète d'un cabinet médical. Remplace la gestion Excel par une interface moderne, sécurisée et ergonomique.

## 🔗 Liens du Projet

- **🎨 Maquettes Figma** : [Voir les designs](https://www.figma.com/design/35WKQqg4HVER8A5OPRjvlV/Untitled?node-id=0-1&t=miOWwnudnushCHUd-1)
- **📋 Gestion de projet Jira** : [Tableau de bord](https://safaaettalhi1.atlassian.net/jira/software/projects/CG/boards/2/backlog?epics=visible&issueParent=10008%2C10007&selectedIssue=CG-3&atlOrigin=eyJpIjoiMWIyZjNkYjFjMjFmNDQ0NjhlN2IxNTRjYjkxNjIxNmUiLCJwIjoiaiJ9)

## 🚀 Fonctionnalités

### 🔐 Authentification
- Configuration initiale avec mot de passe
- Connexion sécurisée (hash SHA-256)
- Protection contre les attaques (verrouillage après 3 tentatives)

### 👥 Gestion des Patients
- Ajouter, modifier, supprimer des patients
- Informations complètes (contact, médical, antécédents)
- Recherche par nom, téléphone, email
- Historique des rendez-vous

### 📅 Gestion des Rendez-vous
- Planification (date, heure, praticien, salle)
- Types : consultation, suivi, urgence, contrôle
- Statuts : programmé, terminé, annulé, no-show
- Vues : liste et agenda
- Filtrage par praticien et statut

### 💰 Gestion Financière
- Enregistrement des recettes et dépenses
- Tableau de bord avec KPIs
- Suivi des objectifs mensuels
- Analyses par catégorie

### 📊 Tableau de Bord
- Chiffre d'affaires mensuel
- Total dépenses et marge nette
- Nombre de patients et consultations
- Actions rapides

## 🏗️ Architecture

### Structure
```
myapp/
├── index.html          # Point d'entrée
├── app.js             # Module principal
├── style.css          # Styles
└── js/
    ├── router.js      # Routage SPA
    ├── security.js    # Authentification
    ├── storage.js     # LocalStorage
    ├── navigation.js  # Interface
    ├── login.js       # Connexion
    ├── init.js        # Configuration
    ├── dashboard.js   # Tableau de bord
    ├── patients.js    # Patients
    ├── appointments.js # Rendez-vous
    └── finances.js    # Finances
```

### Technologies
- **HTML5/CSS3/JavaScript ES6+**
- **LocalStorage** pour la persistance
- **Web Crypto API** pour le hachage
- **Remix Icons** pour les icônes
- **Google Fonts** (Inter)

## 🔧 Installation

1. **Télécharger** le projet
2. **Ouvrir** `index.html` dans un navigateur
3. **Créer** le mot de passe d'accès
4. **Utiliser** l'application

### Serveur local (optionnel)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

## 📱 Interface

- **Design responsive** (mobile/desktop)
- **Navigation sidebar** avec menu
- **Modales** pour les formulaires
- **Cartes** pour l'affichage des données
- **Tableaux** avec actions

## 🔒 Sécurité

- **Mots de passe hashés** (SHA-256)
- **Verrouillage temporaire** (5 min après 3 échecs)
- **Données locales** (pas de serveur externe)
- **Session sécurisée**

## 📊 Données

### Stockage LocalStorage
```javascript
{
  "auth": { "passwordHash": "...", "failedAttempts": 0 },
  "patients": [...],
  "appointments": [...],
  "cash": { "revenues": [...], "expenses": [...] }
}
```

## 🎨 Design

### Couleurs
- **Primaire** : #2563eb (Bleu)
- **Succès** : #10b981 (Vert)
- **Erreur** : #ef4444 (Rouge)
- **Attention** : #f59e0b (Orange)

### Typographie
- **Police** : Inter (Google Fonts)
- **Responsive** : Adaptation mobile/desktop

## 📋 Utilisation

### Première fois
1. Ouvrir `index.html`
2. Créer un mot de passe
3. Accéder au tableau de bord

### Workflow
1. **Patients** → Ajouter des dossiers
2. **Rendez-vous** → Planifier consultations
3. **Finances** → Enregistrer recettes/dépenses
4. **Dashboard** → Suivre les KPIs

## 🐛 Dépannage

- **Mot de passe oublié** : Réinitialiser via outils développeur
- **Données perdues** : Vérifier LocalStorage
- **Performance** : Nettoyer les données anciennes
- **Affichage** : Vider le cache navigateur

## 📄 Licence

Usage interne - Tous droits réservés

---

**MediCare** - Solution moderne de gestion de cabinet médical