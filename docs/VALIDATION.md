# Validation — Hind Lux Shop

## État validé

- Build Vite de production réussi.
- Suite automatisée : 9 tests réussis (calculs serveur, stock, variantes, offres, coupons, sécurité, idempotence et message WhatsApp).
- Boutique contrôlée dans le navigateur intégré en français et en arabe RTL, sur 320 × 568, 390 × 844, tablette 768 × 1024 et bureau 1440 × 900, sans débordement horizontal.
- Compatibilité mobile renforcée : safe areas iOS, hauteur dynamique, contrôles tactiles, très petits écrans et manifeste installable.
- Logo officiel vérifié dans l’en-tête, le pied de page et l’espace d’administration.
- Intro vérifiée avec la vidéo servie en MP4 Full HD 1920 × 1080, lecture muette automatique, son optionnel, bouton passer et transition vers la boutique.
- Variante Sac Alba contrôlée : Noir charge `/images/bag.webp`; Beige charge `/images/bag-beige.webp` (1200 × 1500). La couleur et sa photo restent dans le panier.
- Panier contrôlé sans code : le champ « Code promo / Redeem code » est explicitement facultatif et ne bloque pas la préparation de commande.
- Administration contrôlée en arabe : tableau produits, couleurs disponibles, commandes, offres, coupons et paramètres.
- Aucun avertissement ou erreur applicative pertinent dans la console durant le smoke test.

## Limites connues

- Le numéro WhatsApp est volontairement vide et doit être saisi dans l’administration avant exploitation.
- Les quatre produits et images sont des exemples à remplacer par le catalogue réel.
- La vidéo source 864 × 496 a été réencodée en 1920 × 1080 avec Lanczos et netteté légère : le fichier est Full HD, mais un upscale ne recrée pas des détails natifs absents de la source.
- SQLite est actif. `.env.example` prépare les secrets et paramètres ; une migration/adaptateur est nécessaire avant de connecter PostgreSQL ou Supabase.
- La boutique prépare un message WhatsApp mais ne l’envoie jamais automatiquement.

## Écarts visuels assumés

1. Le logo typographique des premières maquettes a été remplacé par le logo officiel fourni par la marque.
2. L’intro vidéo et sa transition dorée ont été ajoutées après validation de la direction initiale.
3. Le sélecteur de langue et le RTL ont été ajoutés pour répondre au périmètre bilingue.
4. Les photos par couleur enrichissent la fiche produit sans modifier la structure éditoriale luxe.
5. Sur mobile, la navigation devient un menu compact et le catalogue passe à deux colonnes.
