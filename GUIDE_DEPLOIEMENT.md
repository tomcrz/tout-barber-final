# 🚀 Guide de déploiement TCUT — étape par étape

---

## ÉTAPE 1 — Créer la base de données (Supabase) — 5 minutes

1. Va sur https://supabase.com et clique **"Start your project"**
2. Crée un compte gratuit (avec Google ou email)
3. Clique **"New project"**
   - Nom du projet : `tcut`
   - Mot de passe : choisis-en un (note-le)
   - Région : `West EU (Ireland)`
   - Clique **"Create new project"** — attends 1-2 minutes
4. Dans le menu gauche, clique **"SQL Editor"**
5. Clique **"New query"**
6. Ouvre le fichier `supabase_schema.sql` (dans ce dossier), copie tout le contenu et colle-le dans l'éditeur
7. Clique **"Run"** — tu dois voir "Success"

8. Récupère tes clés :
   - Menu gauche → **"Project Settings"** → **"API"**
   - Copie **"Project URL"** → c'est ton `SUPABASE_URL`
   - Copie **"anon public"** (sous API Keys) → c'est ta `SUPABASE_ANON_KEY`

---

## ÉTAPE 2 — Mettre tes clés dans le projet

1. Ouvre le fichier `.env.local` dans ce dossier
2. Remplace les valeurs :

```
NEXT_PUBLIC_SUPABASE_URL=colle_ton_url_ici
NEXT_PUBLIC_SUPABASE_ANON_KEY=colle_ta_cle_ici
```

---

## ÉTAPE 3 — Mettre le code sur GitHub — 3 minutes

1. Va sur https://github.com et crée un compte si tu n'en as pas
2. Clique **"New repository"**
   - Nom : `tcut-barber`
   - Laisse tout le reste par défaut
   - Clique **"Create repository"**
3. Sur ton ordinateur, ouvre un terminal dans le dossier `tcut` et tape :

```bash
npm install
git init
git add .
git commit -m "premier commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/tcut-barber.git
git push -u origin main
```

> Remplace `TON_USERNAME` par ton nom d'utilisateur GitHub

---

## ÉTAPE 4 — Déployer sur Vercel — 3 minutes

1. Va sur https://vercel.com et clique **"Sign Up"**
2. Connecte-toi avec ton compte **GitHub**
3. Clique **"Add New Project"**
4. Sélectionne ton repo **`tcut-barber`**
5. Avant de cliquer Deploy, clique sur **"Environment Variables"** et ajoute :
   - `NEXT_PUBLIC_SUPABASE_URL` = ton URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = ta clé Supabase
6. Clique **"Deploy"** — attends 2-3 minutes

🎉 Ton site est en ligne ! Vercel te donne une URL du type `tcut-barber.vercel.app`

---

## RÉSULTAT FINAL

- Tes clients visitent le site et réservent un créneau
- Tu ajoutes tes créneaux depuis le Dashboard
- Toutes les données sont sauvegardées dans Supabase
- Le site est toujours en ligne, 24h/24

## En cas de problème

Si tu bloques sur une étape, envoie-moi un message et je t'aide !
