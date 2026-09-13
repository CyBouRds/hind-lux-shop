# Hind Lux Shop

Boutique de vêtements et accessoires, identité noir / blanc / or, commande WhatsApp et administration privée. React + Vite, serveur Node.js 24 et base SQLite persistante. Les quatre produits initiaux, prix, stocks et photographies générées sont des données de démonstration à remplacer par le catalogue réel.

## Démarrage

Prérequis : Node.js 24 et pnpm. Depuis le dossier du projet :

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Boutique : http://127.0.0.1:3001 — Administration : http://127.0.0.1:3001/admin

Pour développer : `pnpm dev` (interface port 5173, API port 3001). Pour tester : `pnpm test`.

Le premier démarrage crée un mot de passe aléatoire dans `data/admin-access.txt`. Ce fichier local et toute la base sont exclus de Git. Ouvrez ce fichier pour vous connecter, puis changez le mot de passe dans **Paramètres → Sécurité**. Le serveur n’a aucun mot de passe codé en dur. Pour réinitialiser l’accès depuis la machine : `pnpm admin:password`.

Dans l’environnement Codex de cette machine, Node est déjà disponible. Si `pnpm` n’est pas dans PATH, son exécutable est `C:/Users/Gs In theBuilding/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback/pnpm.cmd`. Les commandes `node node_modules/vite/bin/vite.js build` et `node server/index.mjs` fonctionnent aussi directement.

## Prise en main

1. Dans Paramètres, définir le numéro WhatsApp international, les frais et le seuil de livraison offerte. Le numéro est volontairement vide au départ, conformément au choix de le gérer en admin.
2. Dans Produits, ajouter/importer une photo, saisir nom, description, prix, stock, catégorie, tailles et couleurs. Activer « Mettre en avant » pour apparaître dans les quatre pièces de l’accueil.
3. Dans Offres, programmer une remise automatique sur une catégorie ou toute la collection. La meilleure offre applicable gagne.
4. Dans Coupons, créer un code, un montant ou pourcentage, des dates, un panier minimum et une limite globale. Le coupon se cumule avec l’offre.
5. Les demandes du site apparaissent dans Commandes avec le statut « À confirmer ». Vérifier l’échange WhatsApp avant de confirmer, puis passer à Expédiée et Terminée. Annuler une demande abandonnée pour libérer le stock.

Le site prépare un lien `wa.me` ; il n’envoie pas automatiquement de message et ne peut pas savoir si la cliente l’a envoyé. Le paiement et la confirmation restent gérés avec la boutique. Le stock est global par produit, partagé entre tailles/couleurs. Les demandes non confirmées réservent le stock sans expiration automatique ; l’admin doit annuler les demandes abandonnées.

## Mise en ligne

Le projet est prêt à être installé sur un hébergement Node avec disque persistant. Il n’est pas publié automatiquement et ne doit pas être déployé comme un simple site statique : l’API et SQLite sont nécessaires.

Copier `.env.example` vers `.env` pour la configuration locale. Les scripts `start`, `dev`, `test` et `admin:password` chargent automatiquement ce fichier. Variables actives : `PORT` (3001), `HOST` (127.0.0.1), `DATA_DIR` (data), `NODE_ENV`, `PUBLIC_ORIGIN` et `ADMIN_PASSWORD` (uniquement au premier démarrage). `DATABASE_URL` et les clés API sont préparées comme emplacements privés, mais la version actuelle utilise SQLite ; un adaptateur serveur sera nécessaire avant de basculer vers PostgreSQL/Supabase. Utiliser HTTPS derrière un proxy inverse ; les cookies sont Secure en production.

Sauvegarder la base avec `node scripts/backup.mjs` et copier également `data/uploads/` vers une sauvegarde privée. Les fichiers contiennent des informations de commande. Pour restaurer, arrêter le serveur, remplacer `shop.sqlite` avec la copie de sauvegarde et restaurer les uploads correspondants. Garder les sauvegardes hors du répertoire public.

Architecture volontairement adaptée à une boutique unique et un processus Node. Une plateforme multi-boutiques, un stock par variante, des comptes clients, une facturation et l’intégration WhatsApp Business API seraient des extensions distinctes.

## Documents livrés

- [PRD](docs/PRD.md) : objectifs, périmètre et critères d’acceptation.
- [SFG](docs/SFG.md) : spécifications fonctionnelles générales.
- [SFD](docs/SFD.md) : règles détaillées, données et API.
- [Design](docs/DESIGN.md) : direction visuelle et références.
- [Validation](docs/VALIDATION.md) : contrôles réalisés et limites.
- [Assets](docs/ASSETS.md) : provenance des photographies et prompts.
