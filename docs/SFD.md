# SFD — Spécifications fonctionnelles détaillées

> Extension technique : `nameAr`, `descriptionAr`, `colorImages`, contenu arabe des paramètres, locale de commande et chargement automatique de `.env` par les scripts Node.

## Architecture et stockage

React 19 / Vite 6 ; modules storefront, panier/détail, admin, éditeurs, primitives UI. Serveur HTTP Node.js 24 avec SQLite intégré, base `data/shop.sqlite`, journal WAL. Un document JSON métier est persisté dans une ligne `shop`, les identifiants sont UUID. Une mutation se déroule dans une transaction synchrone `BEGIN IMMEDIATE`, lecture, validation, écriture, commit ou rollback. Cela garantit la cohérence des commandes dans un processus ; le stockage document convient à une petite boutique et n’est pas un schéma destiné à une charge massive.

Tables : `shop(id,data)`, `admin(id,hash)`, `sessions(token,expires)`. Les mots de passe utilisent scrypt avec sel aléatoire ; les jetons de session sont aléatoires, seuls leurs condensats SHA-256 sont stockés. Les images importées reçoivent un nom UUID dans `data/uploads` ; aucun chemin fourni par le client n’est utilisé comme destination de fichier.

## Modèle métier

| Objet | Champs essentiels |
| --- | --- |
| Produit | id, name, description, category, price, stock, sizes[], colors[], image, active, featured |
| Offre | id, name, type (percent/fixed), value, category facultative, start, end, active |
| Coupon | id, name, code unique normalisé, type, value, minimum, limit, used, start, end, active |
| Commande | id, reference, key, createdAt, status, items[], customer, subtotal, discount, delivery, total, coupon |
| Ligne commande | id produit, name, image, size, color, quantity, price unitaire figé |
| Cliente | name, phone, city, address, note facultative |
| Paramètres | identité, contact, frais/seuil, catégories, textes, images et liens |

## Calculs

1. Vérifier 1–50 lignes ; quantités entières de 1 à 99 ; produit actif et variante existante.
2. Regrouper les quantités par produit, même si les tailles/couleurs diffèrent ; refuser si le cumul dépasse le stock.
3. Prix unitaire = max(0, prix catalogue − meilleure remise active par unité). Arrondi à deux décimales.
4. Sous-total = somme des prix unitaires × quantités. Le client ne fournit aucun prix de confiance.
5. Si coupon : contrôler existence, activation, période, minimum et quota. Remise = min(sous-total, réduction calculée), arrondie à deux décimales.
6. Base livraison gratuite = sous-total − remise. Si seuil > 0 et atteint, livraison = 0 ; sinon tarif configuré.
7. Total = sous-total − remise + livraison. Montants limités et non négatifs.

Les comparaisons de périodes utilisent les dates ISO UTC, inclusives. Les montants DH sont représentés par des nombres avec arrondi explicite ; la version ne gère pas plusieurs monnaies.

## Création de demande

Le navigateur crée une clé aléatoire lors de l’ouverture du panier. POST `/api/orders` contrôle la clé (16–80 caractères), les coordonnées, le numéro boutique et le devis à l’intérieur de la transaction. Si la clé a déjà été enregistrée, renvoyer la même référence sans décrément supplémentaire. Sinon : créer la commande, décrémenter chaque quantité, incrémenter le coupon et enregistrer. Le résultat public contient référence, total et URL WhatsApp. Aucun message n’est expédié par le serveur.

Les instantanés prix et coordonnées restent attachés à la commande même après modification du catalogue. Suppression produit refusée s’il appartient à une commande ouverte ; masquage recommandé. Une suppression de coupon associé à une demande À confirmer/Confirmée est refusée. Les transitions de statut sont contrôlées serveur, et une seconde annulation est refusée.

## API

| Méthode et route | Rôle | Résultat |
| --- | --- | --- |
| GET /api/shop | Public | Paramètres, produits actifs avec salePrice, offres en cours |
| POST /api/quote | Public | Devis recalculé ou erreur métier |
| POST /api/orders | Public | Demande et lien WhatsApp |
| GET /api/auth/session | Public | État de connexion, sans secret |
| POST /api/auth/login | Public | Cookie de session si mot de passe valide |
| POST /api/auth/logout | Session | Invalidation du jeton courant |
| GET /api/admin/data | Admin | Catalogue, promotions, commandes, paramètres |
| POST /api/admin/products, offers, coupons | Admin | Création validée |
| PUT /api/admin/{collection}/{id} | Admin | Mise à jour validée |
| DELETE /api/admin/{collection}/{id} | Admin | Suppression si règles autorisées |
| PUT /api/admin/orders/{id} | Admin | Transition de statut |
| PUT /api/admin/settings | Admin | Paramètres validés |
| POST /api/admin/upload | Admin | Image base64 validée, URL du fichier |
| POST /api/admin/password | Admin | Changement de mot de passe et fermeture des sessions |

Codes : 200/201 succès ; 400 validation ; 401 accès admin ; 403 origine ; 404 absent ; 405 méthode ; 413 taille ; 415 format ; 429 limitation ; 503 contact WhatsApp manquant. Les erreurs inattendues ne renvoient pas de détail technique au client.

## Protection et exploitation

Mutation JSON et contrôle Origin ; SameSite Strict ; cookie Secure en production ; API no-store ; politique CSP pour les fichiers de production ; protection contre traversée de chemins ; limitation connexion 10/15 min, devis 180/min, commandes 20/min par adresse socket. Derrière proxy, toutes les requêtes peuvent partager son adresse : adapter une politique de proxy de confiance avant montée en charge. L’application ne fait pas confiance à X-Forwarded-For par défaut.

Upload limité à 5 Mo, vérification extension logique et signature PNG/JPEG/WebP ; SVG importé non accepté. Les photos publiques ne doivent pas contenir de données privées. Taille maximale requête 8 Mo. Le serveur lie 127.0.0.1 par défaut ; HTTPS via reverse proxy requis en publication, `PUBLIC_ORIGIN` exact. Sauvegardes SQLite et uploads à conserver hors public.

## Points de déploiement

Un seul service Node avec volume persistant. Configurer le domaine, HTTPS, origine, contact réel et contenu commercial. Les références photo sont des visuels générés, non des preuves du catalogue réel. Définir ses propres informations de livraison/retour avant ouverture. Les sessions, mots de passe et fichiers `data/` ne font jamais partie du bundle frontend.
