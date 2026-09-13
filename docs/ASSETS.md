# Assets et provenance

Les trois concepts UI et cinq photographies ont été générés avec le built-in ImageGen. Les fichiers de logo déjà présents à la racine sont conservés intégralement. La signature typographique du site suit le concept accueil ; un logo personnalisé peut être importé depuis les paramètres.

Les photographies sont des visuels de démonstration et ne représentent pas un inventaire réel confirmé. Importer les photos réelles avant l’ouverture commerciale.

## Fichiers livrés

- `docs/concepts/home.png` : référence accueil.
- `docs/concepts/collection.png` : référence collection.
- `docs/concepts/admin.png` : référence administration.
- `public/images/hero.webp` : éditorial d’accueil.
- `public/images/bag.webp`, `earrings.webp`, `blazer.webp`, `dress.webp` : exemples catalogue.

Les assets ont été encodés en WebP (qualité 84, largeur 1600 pour le hero et 700 pour le catalogue) sans compositing ni filtre. Leur poids total est environ 397 Ko décimaux. Les originaux ImageGen restent dans le dossier de génération Codex ; le site n’en dépend pas.

## Prompts de production

Hero : « Photorealistic luxury fashion editorial photo for Hind Lux Shop website, landscape 3:2. Sophisticated adult Moroccan woman with dark swept-back hair wearing flowing black silk long-sleeve wrap dress and sculptural gold earrings, standing beside pale limestone column in sunlit elegant Moroccan riad. Waist-up portrait, woman centered slightly left, architectural depth right. Natural warm directional sunlight, soft shadows, tactile black satin and limestone. Quiet refined expression looking right. High-end magazine photography. No text, no watermarks, no UI. Entire frame photograph. Match an editorial black-white-gold boutique. »

Sac : « Use case product-mockup. One luxury ecommerce product photograph portrait 3:4, black structured pebbled leather top-handle handbag with small rectangular brushed gold clasp on pale limestone pedestal, cream stone studio background, soft directional daylight, editorial very high detail, centered full bag with ample margin, no text no logos no UI. Hind Lux Shop black white gold collection, refined realistic catalog photography. »

Boucles : « One luxury ecommerce product photograph portrait 3:4, pair of sculptural flowing curved gold earrings, softly hammered organic golden metal, standing on pale cream limestone, warm neutral studio background, soft natural sunlight, refined fashion editorial realistic macro photograph, full pair centered with ample negative space, no text no logos no UI. Hind Lux Shop luxury accessories. »

Blazer : « One luxury ecommerce product photograph portrait 3:4. Adult Moroccan woman wearing beautifully tailored cream ivory blazer, chest to upper thigh composition, calm elegant pose, neutral cream limestone studio backdrop, soft natural daylight, premium magazine realistic fashion photography. Blazer is main subject, single breasted, 2 buttons, beautiful tailoring, arms relaxed. No text no logos no UI. Hind Lux Shop clothing collection. »

Robe : « One luxury ecommerce fashion photograph portrait 3:4. Adult Moroccan woman wearing elegant black satin cowl neck spaghetti strap midi dress, head to below knees fashion composition, dark hair loosely swept up, calm elegant pose, pale warm limestone studio background, soft natural daylight. Satin fabric exquisite draping. Premium editorial realistic photo, dress main subject, no text no logos no UI. Hind Lux Shop luxury collection. »

Les concepts UI ont été briefés avec les écrans complets accueil/collection/admin, les textes français et les mêmes tokens noir #141414, blanc #ffffff et or #ad8751. Les différences intentionnelles sont consignées dans DESIGN et VALIDATION.
