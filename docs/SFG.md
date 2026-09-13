# SFG — Spécifications fonctionnelles générales

> Extension validée : langue FR/AR sur boutique et administration, variantes couleur avec image associée, intro vidéo, configuration privée via `.env` et code promo non obligatoire.

## Organisation

La boutique publique possède un accueil, une collection filtrable, un panneau détail produit, un panier et des panneaux d’informations livraison/retour/confidentialité. L’administration `/admin` possède six modules : vue d’ensemble, produits, commandes, offres, coupons, paramètres.

## Rôles

Visiteuse : lecture des données publiques, constitution d’un panier local, calcul et création d’une demande. Administratrice : accès à toutes les données commerciales, édition du catalogue, promotions, paramètres, changement du mot de passe et suivi des statuts. Aucune API publique n’expose les coordonnées des commandes.

## Catalogue

Chaque produit contient une photo importée ou distante HTTPS, un nom, une description, une catégorie, un prix DH, un stock entier, une liste de tailles et couleurs. Un produit masqué n’est pas visible et ne peut pas être commandé. Un produit épuisé reste consultable mais ne peut pas être ajouté depuis sa fiche. Les pièces mises en avant alimentent l’accueil, limité à quatre.

La recherche porte sur le nom et la description côté boutique. Les filtres sont cumulables avec le tri par sélection, prix croissant/décroissant et nom. Les variantes partagent le même prix et le stock global du produit. Une catégorie utilisée ne peut pas être retirée avant réaffectation des produits.

## Panier et commande

Le panier est conservé sur l’appareil et contient uniquement identifiants, variantes et quantités. Le serveur relit le catalogue au calcul et à la commande : les prix envoyés par le navigateur ne sont pas utilisés. La cliente renseigne nom, téléphone, ville, adresse et note facultative. Aucun paiement en ligne.

Une demande réussie réserve le stock immédiatement et augmente l’utilisation du coupon. Une référence permet de rapprocher la demande et la conversation WhatsApp. Le lien contient les articles, variantes, quantités, prix, remise, livraison, total et coordonnées. L’utilisateur clique explicitement sur « Envoyer sur WhatsApp » puis envoie son message dans WhatsApp. L’enregistrement sur le site ne garantit pas l’envoi du message.

Sans numéro configuré, le bouton de commande est désactivé et l’API refuse la création. Si un article n’est plus disponible ou si le coupon est invalide, une erreur explicite permet de corriger le panier.

## Offres et coupons

Une offre s’applique à tout le catalogue ou à une catégorie. Elle est fixe par unité ou en pourcentage. Si plusieurs offres s’appliquent, la meilleure gagne. Les dates facultatives sont inclusives en UTC. Un coupon applique une seconde réduction sur le sous-total après offres ; la remise totale ne peut pas créer un montant négatif. Il existe un panier minimum et une limite globale facultative d’utilisations, sans limite par cliente.

La livraison offerte se déclenche sur le sous-total après coupon. Le seuil zéro désactive cette règle. Le tarif de livraison zéro signifie gratuit. Une annulation restitue l’utilisation du coupon. Les coupons utilisés ne peuvent plus être renommés, afin de préserver l’historique.

## Gestion des commandes

Transitions : À confirmer → Confirmée → Expédiée → Terminée. Annulation possible depuis À confirmer ou Confirmée. Un statut final ne peut plus être modifié. L’annulation restitue le stock et le compteur coupon. La valeur des commandes terminées n’est pas une preuve de paiement. Les demandes abandonnées doivent être annulées manuellement.

## Paramètres et sécurité

Configuration WhatsApp, frais et seuil livraison, catégories, Instagram, conditions livraison/retours, logo, image et texte d’accueil, bandeau d’annonce, présentation boutique. Import JPG, PNG, WebP jusqu’à 5 Mo. Mot de passe d’au moins 12 caractères, cookie de session HttpOnly/SameSite, expiration après huit heures, déconnexion explicite. Le changement du mot de passe invalide toutes les sessions.

## Ergonomie

Grille à quatre colonnes desktop et deux mobile. Contrôles nommés, formulaires avec labels, focus clavier visible, panneaux fermables par Échap, focus piégé et restauré. Tableaux administratifs défilables horizontalement sur téléphone. États vides, chargement, succès et erreur sont prévus.
