export class AppError extends Error { constructor(message, status=400) { super(message); this.status=status; } }
export const fail = (condition, message, status=400) => { if(condition) throw new AppError(message,status); };
export const money = n => Math.round(n * 100) / 100;
export const inPeriod = (x, now=new Date().toISOString().slice(0,10)) => x.active && (!x.start || x.start<=now) && (!x.end || x.end>=now);
export function effectivePrice(product, offers) {
  const reductions=offers.filter(o=>inPeriod(o) && (!o.category || o.category===product.category)).map(o=> o.type==='percent' ? product.price*o.value/100 : o.value);
  return money(Math.max(0,product.price-Math.max(0,...reductions)));
}
export function quote(data, input) {
  fail(!Array.isArray(input.items)||!input.items.length||input.items.length>50,'Votre panier est vide ou trop volumineux.');
  const stock=new Map();
  const items=input.items.map(item=>{
    const p=data.products.find(p=>p.id===item.id&&p.active);
    fail(!p,'Un produit n’est plus disponible.');
    fail(!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99,'Quantité invalide.');
    fail(!p.sizes.includes(item.size)||!p.colors.includes(item.color),'Veuillez choisir une taille et une couleur disponibles.');
    stock.set(p.id,(stock.get(p.id)||0)+item.quantity);
    fail(stock.get(p.id)>p.stock,`Stock insuffisant pour ${p.name}.`);
    return {id:p.id,name:p.name,nameAr:p.nameAr||'',image:p.colorImages?.[item.color]||p.image,size:item.size,color:item.color,quantity:item.quantity,price:effectivePrice(p,data.offers)};
  });
  const subtotal=money(items.reduce((s,i)=>s+i.price*i.quantity,0));
  let discount=0,coupon=null;
  if(input.coupon?.trim()) {
    coupon=data.coupons.find(c=>c.code===input.coupon.trim().toUpperCase());
    fail(!coupon||!inPeriod(coupon),'Ce coupon est invalide ou expiré.');
    fail(coupon.limit>0&&coupon.used>=coupon.limit,'Ce coupon a atteint sa limite d’utilisation.');
    fail(subtotal<coupon.minimum,`Ce coupon nécessite un panier de ${coupon.minimum} DH minimum.`);
    discount=money(Math.min(subtotal,coupon.type==='percent'?subtotal*coupon.value/100:coupon.value));
  }
  const delivery=data.settings.freeShippingThreshold>0&&subtotal-discount>=data.settings.freeShippingThreshold?0:data.settings.deliveryFee;
  return {items,subtotal,discount,delivery,total:money(subtotal-discount+delivery),coupon:coupon?.code||''};
}
const str=(v,max=200)=> typeof v==='string'?v.trim().slice(0,max):'';
const num=(v,max=1000000)=>{const n=Number(v);fail(!Number.isFinite(n)||n<0||n>max,'Valeur numérique invalide.');return money(n);};
const list=v=>{fail(!Array.isArray(v),'Liste invalide.');const a=[...new Set(v.map(x=>str(x,60)).filter(Boolean))];fail(!a.length||a.length>50,'La liste doit contenir de 1 à 50 valeurs.');return a;};
export function safeImage(v) { v=str(v,2000);fail(v&&!/^\/(images|uploads)\/[a-zA-Z0-9._-]+$/.test(v)&&!/^https:\/\//.test(v),'Utilisez une image importée ou une URL HTTPS.');return v; }
export function productInput(v,data) {
  const p={name:str(v.name,120),description:str(v.description,4000),category:str(v.category,60),price:num(v.price),stock:num(v.stock,100000),sizes:list(v.sizes),colors:list(v.colors),image:safeImage(v.image),active:!!v.active,featured:!!v.featured};
  p.nameAr=str(v.nameAr,120);p.descriptionAr=str(v.descriptionAr,4000);p.colorImages={};
  for(const color of p.colors){const image=v.colorImages?.[color];if(image)p.colorImages[color]=safeImage(image);}
  fail(!p.name||!p.image||!data.settings.categories.includes(p.category),'Nom, image et catégorie valide sont obligatoires.');fail(!Number.isInteger(p.stock),'Le stock doit être entier.');return p;
}
export function discountInput(v,kind) {
  const d={name:str(v.name,120),type:v.type==='fixed'?'fixed':'percent',value:num(v.value),start:str(v.start,10),end:str(v.end,10),active:!!v.active};
  fail(!d.name||d.value<=0||(d.type==='percent'&&d.value>100),'Nom et remise valide obligatoires.');
  for(const date of [d.start,d.end]) fail(date&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))),'Date invalide.');
  fail(d.start&&d.end&&d.end<d.start,'La fin doit suivre le début.');
  if(kind==='coupons'){d.code=str(v.code,40).toUpperCase();fail(!/^[A-Z0-9_-]{3,40}$/.test(d.code),'Code : 3 à 40 lettres, chiffres, tirets.');d.minimum=num(v.minimum);d.limit=num(v.limit,100000);fail(!Number.isInteger(d.limit),'Limite entière requise.');}
  else d.category=str(v.category,60);
  return d;
}
export function settingsInput(v,data) {
  const s={name:str(v.name,100),whatsapp:str(v.whatsapp,20).replace(/[\s+()-]/g,''),deliveryFee:num(v.deliveryFee),freeShippingThreshold:num(v.freeShippingThreshold),heroTitle:str(v.heroTitle,160),heroText:str(v.heroText,350),heroImage:safeImage(v.heroImage),logo:safeImage(v.logo),announcement:str(v.announcement,180),about:str(v.about,2000),instagram:str(v.instagram,300),categories:list(v.categories),deliveryText:str(v.deliveryText,2000),returnText:str(v.returnText,2000)};
  for(const key of ['heroTitle','heroText','about','announcement','deliveryText','returnText'])s[key+'Ar']=str(v[key+'Ar'],key==='heroTitle'?160:2000);
  s.categoryTranslations={};for(const category of s.categories){const value=v.categoryTranslations?.[category];if(value)s.categoryTranslations[category]=str(value,60);}
  fail(!s.name||!s.heroTitle||!s.heroImage,'Nom, titre et image d’accueil obligatoires.');fail(s.whatsapp&&!/^[1-9]\d{7,14}$/.test(s.whatsapp),'Numéro WhatsApp international invalide.');fail(s.instagram&&!/^https:\/\/(www\.)?instagram\.com\//.test(s.instagram),'Lien Instagram invalide.');fail(data.products.some(p=>!s.categories.includes(p.category)),'Une catégorie est encore utilisée par un produit.');return s;
}
export function customerInput(v) {
  const c={name:str(v?.name,100),phone:str(v?.phone,30),city:str(v?.city,100),address:str(v?.address,500),note:str(v?.note,1000)};
  fail(c.name.length<2||!/^\+?[\d\s()-]{8,25}$/.test(c.phone)||c.city.length<2||c.address.length<5,'Renseignez votre nom, téléphone, ville et adresse.');return c;
}
export function whatsappMessage(order,settings) {
  if(order.locale==='ar'){
    const words={'Unique':'موحّد','Noir':'أسود','Écru':'عاجي','Doré':'ذهبي','Blanc':'أبيض','Beige':'بيج','Rouge':'أحمر','Bleu':'أزرق','Vert':'أخضر'};
    const lines=[`مرحباً ${settings.name}، أود تأكيد الطلب ${order.reference}.`,'',...order.items.map(i=>`${i.quantity} × ${i.nameAr||i.name} — ${words[i.size]||i.size}، ${words[i.color]||i.color} — ${money(i.price*i.quantity)} درهم`),'',`المجموع الفرعي: ${order.subtotal} درهم`,`التخفيض${order.coupon?' ('+order.coupon+')':''}: ${order.discount} درهم`,`التوصيل: ${order.delivery} درهم`,`المجموع: ${order.total} درهم`,'',`${order.customer.name} · ${order.customer.phone}`,`${order.customer.address}، ${order.customer.city}`,order.customer.note||''];
    return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }
  const lines=[`Bonjour ${settings.name}, je souhaite confirmer la commande ${order.reference}.`,'',...order.items.map(i=>`${i.quantity} × ${i.name} — ${i.size}, ${i.color} — ${money(i.price*i.quantity)} DH`),'',`Sous-total : ${order.subtotal} DH`,`Remise${order.coupon?' ('+order.coupon+')':''} : ${order.discount} DH`,`Livraison : ${order.delivery} DH`,`Total : ${order.total} DH`,'',`${order.customer.name} · ${order.customer.phone}`,`${order.customer.address}, ${order.customer.city}`,order.customer.note||''];
  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
}
