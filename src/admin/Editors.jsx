import { t } from '../i18n';
import React, { useState } from 'react';
import { Upload, Save, Lock, Image as ImageIcon } from 'lucide-react';
import { Button, Drawer, Field, ErrorMessage } from '../ui';
import { api, upload } from '../api';
function ImageField({
  value,
  onChange,
  label = 'Photo',
  onBusy
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function change(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBusy(true);
    onBusy?.(true);
    setError('');
    try {
      onChange(await upload(file));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      onBusy?.(false);
    }
  }
  return <div className="image-field"><span className="field-title">{t(label)}</span><div className="upload-row">{t(value ? <img src={value} alt={t("Aperçu")} /> : <div className="upload-placeholder"><ImageIcon strokeWidth={1} /></div>)}<label className="upload-target"><Upload size={23} /><span>{t(busy ? 'Importation…' : 'Importer une photo')}</span><small>{t("JPG, PNG, WebP \xB7 5 Mo max.")}</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={change} disabled={busy} /></label></div><input aria-label={t(`URL ${label}`)} placeholder={t("Ou coller une URL HTTPS")} value={value} onChange={e => onChange(e.target.value)} /><ErrorMessage message={error} /></div>;
}
function ColorPhotos({colors,images,onChange,onBusy}) {
  const available=[...new Set(colors.split(/[,،]/).map(c=>c.trim()).filter(Boolean))];
  return <section className="color-photos"><h3>{t('Photos par couleur')}</h3><p className="small muted">{t('Associez une photo à chaque couleur disponible. Sans photo dédiée, la photo principale sera affichée.')}</p>{available.map(color=><ImageField key={color} label={t(color)} value={images[color]||''} onChange={url=>onChange({...images,[color]:url})} onBusy={onBusy}/>)}</section>;
}
export function ProductEditor({
  product,
  categories,
  onSave,
  onClose,
  busy,
  error
}) {
  const [v, setV] = useState({
      name: '',
      description: '',
      category: categories[0],
      price: 0,
      stock: 0,
      sizes: ['Unique'],
      colors: ['Noir'],
      image: '',
      colorImages: {},
      nameAr: '',
      descriptionAr: '',
      active: true,
      featured: false,
      ...product
    }),
    [sizes, setSizes] = useState((product.sizes || ['Unique']).join(', ')),
    [colors, setColors] = useState((product.colors || ['Noir']).join(', ')),
    [uploading, setUploading] = useState(false);
  const set = (key, value) => setV(v => ({
    ...v,
    [key]: value
  }));
  return <Drawer title={t(product.id ? 'Modifier le produit' : 'Ajouter un produit')} onClose={onClose}><form className="drawer-body editor" onSubmit={e => {
      e.preventDefault();
      onSave({
        ...v,
        sizes: sizes.split(/[,،]/).map(x => x.trim()).filter(Boolean),
        colors: colors.split(/[,،]/).map(x => x.trim()).filter(Boolean)
      });
    }}><ImageField value={v.image} onChange={x => set('image', x)} onBusy={setUploading} /><Field label={t("Nom *")} required maxLength={120} value={v.name} onChange={e => set('name', e.target.value)} /><Field label={t("Description")}><textarea rows={4} value={v.description} onChange={e => set('description', e.target.value)} /></Field><div className="form-row"><Field label={t("Prix (DH) *")} type="number" min="0" step="0.01" required value={v.price} onChange={e => set('price', e.target.value)} /><Field label={t("Stock *")} type="number" min="0" step="1" required value={v.stock} onChange={e => set('stock', e.target.value)} /></div><Field label={t("Catégorie")}><select value={v.category} onChange={e => set('category', e.target.value)}>{t(categories.map(c => <option key={c} value={c}>{t(c)}</option>))}</select></Field><Field label={t("Tailles (séparées par des virgules)")} required value={sizes} onChange={e => setSizes(e.target.value)} /><Field label={t("Couleurs (séparées par des virgules)")} required value={colors} onChange={e => setColors(e.target.value)} /><ColorPhotos colors={colors} images={v.colorImages || {}} onChange={images=>set('colorImages',images)} onBusy={setUploading} /><Field label={t("Nom en arabe")} dir="rtl" value={v.nameAr || ''} onChange={e=>set('nameAr',e.target.value)} /><Field label={t("Description en arabe")}><textarea dir="rtl" rows={3} value={v.descriptionAr || ''} onChange={e=>set('descriptionAr',e.target.value)} /></Field><p className="small muted">{t("Stock global partag\xE9 entre les variantes.")}</p><label className="toggle"><input type="checkbox" checked={v.active} onChange={e => set('active', e.target.checked)} /><span>{t("Visible dans la boutique")}</span></label><label className="toggle"><input type="checkbox" checked={v.featured} onChange={e => set('featured', e.target.checked)} /><span>{t("Mettre en avant sur l\u2019accueil")}</span></label><ErrorMessage message={error} /><div className="form-actions sticky-actions"><Button type="submit" disabled={busy || uploading}><Save size={16} />{t(busy ? 'Enregistrement…' : 'Enregistrer')}</Button><Button type="button" secondary onClick={onClose}>{t("Annuler")}</Button></div></form></Drawer>;
}
export function DiscountEditor({
  item,
  kind,
  categories,
  onSave,
  onClose,
  busy,
  error
}) {
  const coupon = kind === 'coupons';
  const [v, setV] = useState({
    name: '',
    type: 'percent',
    value: 10,
    start: '',
    end: '',
    active: true,
    category: '',
    code: '',
    minimum: 0,
    limit: 0,
    ...item
  });
  const set = (k, x) => setV(v => ({
    ...v,
    [k]: x
  }));
  return <Drawer title={t((item.id ? 'Modifier ' : 'Créer ') + (coupon ? 'un coupon' : 'une offre'))} onClose={onClose}><form className="drawer-body editor" onSubmit={e => {
      e.preventDefault();
      onSave(v);
    }}><Field label={t("Nom *")} required value={v.name} onChange={e => set('name', e.target.value)} />{t(coupon ? <Field label={t("Code *")} required pattern="[A-Za-z0-9_-]{3,40}" value={v.code} onChange={e => set('code', e.target.value.toUpperCase())} /> : <Field label={t("Catégorie concernée")}><select value={v.category} onChange={e => set('category', e.target.value)}><option value="">{t("Toute la collection")}</option>{t(categories.map(c => <option key={c} value={c}>{t(c)}</option>))}</select></Field>)}<div className="form-row"><Field label={t("Type de réduction")}><select value={v.type} onChange={e => set('type', e.target.value)}><option value="percent">{t("Pourcentage (%)")}</option><option value="fixed">{t("Montant (DH)")}</option></select></Field><Field label={t("Valeur *")} type="number" min="0.01" max={v.type === 'percent' ? 100 : 1000000} step="0.01" required value={v.value} onChange={e => set('value', e.target.value)} /></div><div className="form-row"><Field label={t("Date de début")} type="date" value={v.start} onChange={e => set('start', e.target.value)} /><Field label={t("Date de fin")} type="date" min={v.start} value={v.end} onChange={e => set('end', e.target.value)} /></div><p className="muted small">{t("Dates inclusives, calendrier UTC. Laissez vide pour ne pas limiter la p\xE9riode.")}</p>{t(coupon && <div className="form-row"><Field label={t("Panier minimum (DH)")} type="number" min="0" step="0.01" value={v.minimum} onChange={e => set('minimum', e.target.value)} /><Field label={t("Limite d’utilisations (0 = illimité)")} type="number" min="0" step="1" value={v.limit} onChange={e => set('limit', e.target.value)} /></div>)}<label className="toggle"><input type="checkbox" checked={v.active} onChange={e => set('active', e.target.checked)} /><span>{t("Activer ")}{t(coupon ? 'le coupon' : 'l’offre')}</span></label><ErrorMessage message={error} /><div className="form-actions"><Button disabled={busy}>{t(busy ? 'Enregistrement…' : 'Enregistrer')}</Button><Button type="button" secondary onClick={onClose}>{t("Annuler")}</Button></div></form></Drawer>;
}
function ArabicContent({value,set}){
  const fields=[['heroTitleAr','Titre d’accueil en arabe'],['heroTextAr','Texte d’accueil en arabe'],['aboutAr','À propos en arabe'],['announcementAr','Annonce en arabe'],['deliveryTextAr','Livraison en arabe'],['returnTextAr','Retours en arabe']];
  return <section className="arabic-content editor"><h3>{t('Contenu en arabe')}</h3><p className="small muted">{t('Renseignez les versions arabes de vos textes personnalisés.')}</p>{fields.map(([key,label])=><Field key={key} label={t(label)}><textarea dir="rtl" rows={2} value={value[key]||''} onChange={e=>set(key,e.target.value)}/></Field>)}<h3>{t('Catégories en arabe')}</h3>{value.categories.map(c=><Field key={c} label={c} dir="rtl" value={value.categoryTranslations?.[c]||''} onChange={e=>set('categoryTranslations',{...value.categoryTranslations,[c]:e.target.value})}/>)}</section>;
}
export function SettingsEditor({
  data,
  reload,
  onLogout,
  notify
}) {
  const [v, setV] = useState({
      ...data.settings
    }),
    [categories, setCategories] = useState(data.settings.categories.join(', ')),
    [tab, setTab] = useState('boutique'),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState(''),
    [password, setPassword] = useState({
      current: '',
      password: ''
    });
  const set = (k, x) => setV(v => ({
    ...v,
    [k]: x
  }));
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/settings', {
        method: 'PUT',
        body: {
          ...v,
          categories: categories.split(',').map(x => x.trim()).filter(Boolean)
        }
      });
      await reload();
      notify('Paramètres enregistrés.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function changePassword(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/admin/password', {
        method: 'POST',
        body: password
      });
      onLogout();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <div className="settings"><div className="tabs settings-tabs">{t([['boutique', 'Boutique & livraison'], ['content', 'Textes & identité'], ['security', 'Sécurité']].map(([id, label]) => <button className={tab === id ? 'active' : ''} key={id} onClick={() => {
        setTab(id);
        setError('');
      }}>{t(label)}</button>))}</div><ErrorMessage message={error} />{t(tab === 'security' ? <form className="settings-form editor" onSubmit={changePassword}><Lock size={24} /><h2>{t("Un acc\xE8s qui reste le v\xF4tre.")}</h2><Field label={t("Mot de passe actuel")} required type="password" autoComplete="current-password" value={password.current} onChange={e => setPassword({
        ...password,
        current: e.target.value
      })} /><Field label={t("Nouveau mot de passe (12 caractères minimum)")} required type="password" minLength={12} autoComplete="new-password" value={password.password} onChange={e => setPassword({
        ...password,
        password: e.target.value
      })} /><p className="muted small">{t("La modification ferme toutes les sessions. Reconnectez-vous avec votre nouveau mot de passe.")}</p><Button disabled={busy}>{t("Modifier le mot de passe")}</Button></form> : <form className="settings-form editor" onSubmit={save}>{t(tab === 'boutique' ? <><h2>{t("Les essentiels de votre boutique")}</h2><Field label={t("Nom de la boutique")} required value={v.name} onChange={e => set('name', e.target.value)} /><Field label={t("Numéro WhatsApp (format international)")} placeholder={t("Ex. +212 6 XX XX XX XX")} type="tel" value={v.whatsapp} onChange={e => set('whatsapp', e.target.value)} /><p className="muted small">{t("Ce num\xE9ro re\xE7oit les commandes. Laissez vide pour suspendre les commandes WhatsApp.")}</p><div className="form-row"><Field label={t("Frais de livraison (DH)")} type="number" min="0" step="0.01" required value={v.deliveryFee} onChange={e => set('deliveryFee', e.target.value)} /><Field label={t("Livraison offerte dès (DH, 0 = désactivé)")} type="number" min="0" step="0.01" required value={v.freeShippingThreshold} onChange={e => set('freeShippingThreshold', e.target.value)} /></div><Field label={t("Catégories (séparées par des virgules)")} required value={categories} onChange={e => setCategories(e.target.value)} /><Field label={t("Lien Instagram")} type="url" value={v.instagram} onChange={e => set('instagram', e.target.value)} /><Field label={t("Informations de livraison")}><textarea rows={3} value={v.deliveryText} onChange={e => set('deliveryText', e.target.value)} /></Field><Field label={t("Conditions d’échange et de retour")}><textarea rows={3} value={v.returnText} onChange={e => set('returnText', e.target.value)} /></Field></> : <><h2>{t("L\u2019identit\xE9 de votre boutique")}</h2><ImageField label={t("Logo (facultatif)")} value={v.logo} onChange={x => set('logo', x)} onBusy={setUploading} /><ImageField label={t("Image d’accueil")} value={v.heroImage} onChange={x => set('heroImage', x)} onBusy={setUploading} /><Field label={t("Titre d’accueil")}><textarea required rows={2} maxLength={160} value={v.heroTitle} onChange={e => set('heroTitle', e.target.value)} /></Field><Field label={t("Texte d’accueil")}><textarea rows={2} value={v.heroText} onChange={e => set('heroText', e.target.value)} /></Field><Field label={t("Bandeau d’annonce (facultatif)")} value={v.announcement} onChange={e => set('announcement', e.target.value)} /><Field label={t("À propos de la boutique")}><textarea rows={4} value={v.about} onChange={e => set('about', e.target.value)} /></Field></>)}{tab==='content'&&<ArabicContent value={v} set={set}/>}<Button disabled={busy || uploading}><Save size={17} />{t(busy ? 'Enregistrement…' : 'Enregistrer les paramètres')}</Button></form>)}</div>;
}
