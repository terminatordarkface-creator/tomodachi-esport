# 🎮 Tomodachi E-sport — Plateforme de Paris & Tournois

Application web officielle de la communauté **Tomodachi E-sport** (Burkina Faso).
Gestion des paris en TomoCoins, tournois, classements et administration.

---

## 🚀 Démarrage rapide

### 1. Cloner le projet
```bash
git clone https://github.com/TON_USERNAME/tomodachi-esport.git
cd tomodachi-esport
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer en local
```bash
npm start
```
L'app tourne sur → http://localhost:3000

---

## 🔥 Déploiement gratuit sur Vercel

### Étape 1 — Créer un compte Vercel
Va sur [vercel.com](https://vercel.com) et connecte-toi avec GitHub.

### Étape 2 — Importer ton projet
1. Clique sur **"Add New Project"**
2. Sélectionne ton repo `tomodachi-esport`
3. Laisse les paramètres par défaut (Vercel détecte React automatiquement)
4. Clique **"Deploy"**

✅ Ton app sera en ligne en moins de 2 minutes avec une URL du type:
`https://tomodachi-esport.vercel.app`

---

## 📱 Fonctionnalités

| Page | Description |
|------|-------------|
| 🏠 **Accueil** | Solde TomoCoins, stats, derniers paris |
| ⚔️ **Matchs** | Voir tous les matchs, résultats, cagnottes |
| 🎯 **Paris** | Placer ses paris sur les matchs à venir |
| 🏆 **Classement** | Ranking des joueurs par TomoCoins |
| ⚙️ **Admin** | Gérer matchs, joueurs, résultats, bonus |

---

## 🔐 Accès Admin

Le mot de passe admin par défaut est : **`tomodachi2025`**

Pour le changer, modifie cette ligne dans `src/App.js` :
```js
if (pwd === "tomodachi2025") { ... }
```

---

## 🎮 Jeux supportés
- ⚽ eFootball Mobile
- 🎯 Call of Duty Mobile (CoDM)
- ⚔️ Clash of Clans (CoC)

---

## 💰 Système de TomoCoins

- Chaque joueur commence avec **1 000 TomoCoins**
- Les paris sont placés contre d'autres joueurs
- Le vainqueur remporte la mise des perdants (proportionnellement)
- L'admin peut offrir des **bonus** à tous les joueurs

---

## 🛠️ Stack technique

- **React 18** — Interface utilisateur
- **React Router v6** — Navigation entre pages
- **CSS-in-JS** — Styles inline, zéro dépendance CSS

---

## 📂 Structure du projet

```
tomodachi-esport/
├── public/
│   └── index.html
├── src/
│   ├── App.js          ← Application principale
│   ├── firebase.js     ← Config Firebase (optionnel)
│   └── index.js        ← Point d'entrée
├── package.json
└── README.md
```

---

## 🌍 Communauté

**Tomodachi E-sport** — Burkina Faso 🇧🇫
Communauté gaming sur eFootball, CoDM et Clash of Clans.

---

*Made with ❤️ for Tomodachi E-sport*
