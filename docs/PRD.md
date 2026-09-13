# PRD — Hind Lux Shop

> Mise à jour : le produit final est bilingue français/arabe (RTL), utilise le logo officiel, comporte une intro vidéo Full HD, des photos par couleur et un coupon facultatif.

Version 1.0 · 12 septembre 2026

## Vision

Présenter une boutique de vêtements et accessoires à l’identité luxueuse (or, noir, blanc) et transformer une sélection de produits en conversation WhatsApp. Permettre à la gérante de maintenir seule son catalogue, ses promotions et ses informations commerciales.

## Publics et besoins

La cliente consulte essentiellement sur mobile, explore les pièces, choisit taille et couleur, connaît le montant estimé avec livraison et transmet sa demande à la boutique. La gérante utilise téléphone ou ordinateur pour ajouter des photos, corriger les prix, gérer le stock et suivre les demandes.

## Périmètre livré

| Domaine | Capacité | Critère d’acceptation |
| --- | --- | --- |
| Vitrine | Accueil éditorial, sélection, catalogue responsive | Affichage utilisable sur mobile et desktop |
| Découverte | Recherche, catégorie, tri, détail produit | Le résultat correspond aux filtres et affiche les variantes disponibles |
| Panier | Quantités, suppression, conservation locale | Le panier survit au rechargement et le serveur valide son contenu |
| Promotions | Offres automatiques et coupons | Dates, minimum, limites et arrondis contrôlés côté serveur |
| Commande | Coordonnées, livraison, référence, lien WhatsApp | Une demande crée une seule réservation et un message cohérent |
| Administration | Connexion privée et sessions | API de gestion inaccessible sans authentification |
| Catalogue admin | Création, édition, suppression, masquage, photos | Les modifications persistent en base et apparaissent après actualisation |
| Commandes admin | Liste, recherche, détail, statut | Annulation restitue stock et utilisation du coupon une seule fois |
| Paramètres | WhatsApp, livraison, catégories, identité et contenu | Gérante autonome, WhatsApp vide interdit les commandes |

## Direction artistique et qualité

Palette sobre, photographie éditoriale, titres serif généreux, interface admin lisible. Animations d’entrée, zoom photo et transitions de panneaux respectent les préférences de mouvement réduit. Images locales WebP, chargement différé du catalogue et du code admin. Les budgets de poids et vérifications sont consignés dans le rapport de validation ; aucun score de performance terrain n’est supposé.

## Hypothèses retenues

Langue française, devise DH, livraison au Maroc avec tarif uniforme et seuil gratuit. Un administrateur propriétaire. Stock partagé entre les variantes d’un produit. Catalogue initial de quatre exemples, sans prétendre représenter les produits réels. WhatsApp et frais modifiables en admin comme demandé. Le mot de passe initial est généré localement, le contact WhatsApp reste à renseigner.

## Parcours cible

Accueil → collection → pièce et variantes → panier → coupon éventuel → coordonnées → demande enregistrée → ouverture WhatsApp → confirmation manuelle par la boutique.

## Hors périmètre de cette version

Encaissement bancaire, synchronisation transporteur, messages automatiques WhatsApp Business, authentification client, multi-administrateurs et permissions fines, stock individuel de chaque variante, ERP/factures fiscales, marketplace. L’hébergement et le domaine restent à choisir pour une publication publique.

## Indicateurs

L’admin affiche les produits actifs, les demandes à confirmer et la valeur des commandes terminées. Cette dernière inclut la livraison et n’est pas un rapprochement comptable. Aucun chiffre simulé de trafic ou conversion. Un suivi analytique pourra être ajouté si nécessaire.
