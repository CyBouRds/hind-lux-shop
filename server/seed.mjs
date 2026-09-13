export const initialData = {
  settings: { name: 'Hind Lux Shop', whatsapp: '', deliveryFee: 35, freeShippingThreshold: 1000, heroTitle: 'L’élégance,\ntout simplement.', heroText: 'Des pièces choisies avec soin. Une allure qui vous ressemble.', heroImage: '/images/hero.webp', logo: '', announcement: '', about: 'Une sélection de vêtements et d’accessoires pensée pour accompagner votre quotidien avec élégance.', instagram: '', categories: ['Vêtements', 'Accessoires'], deliveryText: 'Livraison au Maroc. Les délais sont confirmés avec la boutique sur WhatsApp.', returnText: 'Pour un échange ou un retour, contactez la boutique afin de connaître les conditions applicables.' },
  products: [
    { id: 'sac-alba', name: 'Sac Alba', category: 'Accessoires', price: 590, stock: 12, sizes: ['Unique'], colors: ['Noir', 'Beige'], image: '/images/bag.webp', colorImages: { Noir: '/images/bag.webp', Beige: '/images/bag-beige.webp' }, description: 'Une silhouette structurée, une finition texturée et une touche dorée. Le détail qui signe votre allure.', active: true, featured: true },
    { id: 'boucles-solene', name: 'Boucles Solène', category: 'Accessoires', price: 190, stock: 25, sizes: ['Unique'], colors: ['Doré'], image: '/images/earrings.webp', description: 'Des courbes sculpturales et un éclat doré pour illuminer vos tenues, du quotidien aux occasions spéciales.', active: true, featured: true },
    { id: 'blazer-heritage', name: 'Blazer Héritage', category: 'Vêtements', price: 690, stock: 8, sizes: ['S','M','L'], colors: ['Écru'], image: '/images/blazer.webp', description: 'Une coupe soignée et une teinte lumineuse. Un essentiel à porter avec simplicité, selon vos envies.', active: true, featured: true },
    { id: 'robe-nocturne', name: 'Robe Nocturne', category: 'Vêtements', price: 790, stock: 6, sizes: ['S','M','L'], colors: ['Noir'], image: '/images/dress.webp', description: 'Un drapé fluide et une ligne intemporelle. Une pièce qui accompagne chacun de vos mouvements.', active: true, featured: true }
  ], offers: [], coupons: [], orders: []
};
initialData.settings.logo='/images/brand-logo.png';
const arabicNames=['حقيبة ألبا','أقراط سولان','بليزر هيريتاج','فستان نوكتورن'];
initialData.products.forEach((p,i)=>{p.nameAr=arabicNames[i];p.descriptionAr='';p.colorImages ||= {[p.colors[0]]:p.image};});
