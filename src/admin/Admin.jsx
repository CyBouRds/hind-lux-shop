import { t } from '../i18n';
import LanguageSwitch from '../LanguageSwitch';
import React, { useState, useEffect } from 'react';
import { House, Tag, ShoppingCart, Percent, Ticket, Settings, LogOut, ArrowUpRight, Plus, Search, Pencil, Trash2, Check, Package, Download } from 'lucide-react';
import { api, formatPrice as money } from '../api';
import { Brand, Button, Field, Empty, ErrorMessage, Drawer } from '../ui';
import { ProductEditor, DiscountEditor, SettingsEditor } from './Editors';
const nav = [['overview', 'Vue d’ensemble', House], ['products', 'Produits', Tag], ['orders', 'Commandes', ShoppingCart], ['offers', 'Offres', Percent], ['coupons', 'Coupons', Ticket], ['settings', 'Paramètres', Settings]];
const labels = {
  pending: 'À confirmer',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  completed: 'Terminée',
  cancelled: 'Annulée'
};
const nextStatus = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: []
};
export default function Admin({
  onUpdate
}) {
  const [authenticated, setAuthenticated] = useState(null),
    [password, setPassword] = useState(''),
    [data, setData] = useState(null),
    [page, setPage] = useState('overview'),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState(null),
    [search, setSearch] = useState(''),
    [category, setCategory] = useState(''),
    [toast, setToast] = useState(''),
    [remove, setRemove] = useState(null),
    [order, setOrder] = useState(null);
  const reload = async () => {
    const d = await api('/admin/data');
    setData(d);
    onUpdate();
    return d;
  };
  useEffect(() => {
    api('/auth/session').then(async s => {
      setAuthenticated(s.authenticated);
      if (s.authenticated) await reload();
    }).catch(e => setError(e.message));
  }, []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(''), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/login', {
        method: 'POST',
        body: {
          password
        }
      });
      setPassword('');
      setAuthenticated(true);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api('/auth/logout', {
        method: 'POST',
        body: {}
      });
      setAuthenticated(false);
      setData(null);
    } catch (e) {
      setError(e.message);
    }
  }
  async function save(kind, value) {
    setBusy(true);
    setError('');
    try {
      await api('/admin/' + kind + (value.id ? '/' + value.id : ''), {
        method: value.id ? 'PUT' : 'POST',
        body: value
      });
      await reload();
      setEdit(null);
      setToast('Modifications enregistrées.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function deleteItem() {
    setBusy(true);
    try {
      await api('/admin/' + page + '/' + remove.id, {
        method: 'DELETE'
      });
      await reload();
      setRemove(null);
      setToast('Élément supprimé.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function status(o, status) {
    setBusy(true);
    setError('');
    try {
      await api('/admin/orders/' + o.id, {
        method: 'PUT',
        body: {
          status
        }
      });
      const d = await reload();
      setOrder(d.orders.find(x => x.id === o.id));
      setToast('Statut mis à jour.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (authenticated === null) return <div className="loading">{t("HIND")}<small>{t(error || 'Ouverture de votre espace…')}</small></div>;
  if (!authenticated) return <div className="login"><div className="login-language"><LanguageSwitch /></div><aside><Brand /><div><h1>{t("Votre boutique.")}<br />{t("Votre signature.")}</h1><p>{t("Un espace pour donner vie \xE0 vos collections.")}</p></div><small>{t("HIND LUX SHOP \xB7 ESPACE PRIV\xC9")}</small></aside><main><form onSubmit={login}><span className="small-label">{t("BIENVENUE CHEZ VOUS")}</span><h2>{t("Heureuse de vous retrouver.")}</h2><p className="muted">{t("Connectez-vous pour g\xE9rer votre boutique.")}</p><Field label={t("Mot de passe")} type="password" required autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /><ErrorMessage message={error} /><Button disabled={busy}>{t(busy ? 'Connexion…' : 'Ouvrir mon espace')} <ArrowUpRight size={18} /></Button><a href="/">{t("Retour \xE0 la boutique")}</a></form></main></div>;
  if (!data) return <div className="loading">{t("HIND")}<small>{t(error || 'Chargement de la boutique…')}</small>{t(error && <Button onClick={() => reload().catch(e => setError(e.message))}>{t("R\xE9essayer")}</Button>)}</div>;
  const switchPage = p => {
    setPage(p);
    setSearch('');
    setCategory('');
    setError('');
  };
  const products = data.products.filter(p => (p.name + ' ' + p.category).toLowerCase().includes(search.toLowerCase()) && (!category || p.category === category));
  const orders = data.orders.filter(o => (o.reference + ' ' + o.customer.name + ' ' + o.customer.phone).toLowerCase().includes(search.toLowerCase()) && (!category || o.status === category));
  return <div className="admin-shell"><aside className="sidebar"><Brand settings={data.settings} /><nav>{t(nav.map(([id, label, Icon]) => <button key={id} aria-label={t(label)} className={page === id ? 'active' : ''} onClick={() => switchPage(id)}><Icon size={20} strokeWidth={1.5} /><span>{t(label)}</span></button>))}</nav><div className="sidebar-bottom"><a href="/" target="_blank" rel="noreferrer">{t("Voir la boutique ")}<ArrowUpRight size={16} /></a><button onClick={logout}><LogOut size={17} />{t(" D\xE9connexion")}</button><p>{t("L\u2019\xE9l\xE9gance au quotidien.")}</p></div></aside><div className="admin-content"><header className="admin-top"><LanguageSwitch /><a href="/" className="admin-store-link">{t("Voir la boutique ")}<ArrowUpRight size={13} /></a><div><span className="avatar">{t("H")}</span>{t(data.settings.name)}<button className="icon-button admin-mobile-logout" aria-label={t("Déconnexion mobile")} onClick={logout}><LogOut size={17} /></button></div></header><main className="admin-main"><div className="admin-heading"><div><h1>{t(nav.find(x => x[0] === page)[1])}</h1><p>{t({
                overview: 'Tout ce qui compte pour votre boutique, au même endroit.',
                products: 'Gérez les pièces de votre collection.',
                orders: 'Accompagnez chaque commande, du premier message à la livraison.',
                offers: 'Créez vos temps forts et vos remises automatiques.',
                coupons: 'Une attention particulière pour vos clientes.',
                settings: 'Faites de cet espace une boutique à votre image.'
              }[page])}</p></div>{t(['products', 'offers', 'coupons'].includes(page) && <Button onClick={() => {
            setError('');
            setEdit({});
          }}><Plus size={17} />{t(page === 'products' ? 'Ajouter un produit' : page === 'offers' ? 'Créer une offre' : 'Créer un coupon')}</Button>)}</div><ErrorMessage message={!edit ? error : ''} />
      {t(page === 'overview' && <Overview data={data} navigate={switchPage} />)}
      {t(page === 'products' && <><div className="admin-tools"><label className="search-box"><Search size={18} /><input placeholder={t("Rechercher un produit…")} aria-label={t("Rechercher un produit")} value={search} onChange={e => setSearch(e.target.value)} /></label><select value={category} onChange={e => setCategory(e.target.value)} aria-label={t("Catégorie")}><option value="">{t("Toutes les cat\xE9gories")}</option>{t(data.settings.categories.map(c => <option key={c} value={c}>{t(c)}</option>))}</select></div><div className="table-wrap"><table><thead><tr><th>{t("Produit")}</th><th>{t("Cat\xE9gorie")}</th><th>{t("Prix")}</th><th>{t("Stock")}</th><th>{t("Statut")}</th><th>{t("Actions")}</th></tr></thead><tbody>{t(products.map(p => <tr key={p.id}><td><div className="table-product"><img src={p.image} alt={t("")} /><div><strong>{t(p.name)}</strong><small>{t(p.sizes.join(' · '))}</small><small>{p.colors.map(c=>t(c)).join(' · ')}</small></div></div></td><td>{t(p.category)}</td><td>{t(money(p.price))}</td><td><span className={p.stock < 5 ? 'low-stock' : ''}>{t(p.stock)}</span></td><td><span className={'status ' + (p.active ? 'completed' : 'cancelled')}>{t(p.active ? 'Actif' : 'Masqué')}</span></td><td><div className="row-actions"><button className="icon-button" aria-label={t(`Modifier ${p.name}`)} onClick={() => {
                        setError('');
                        setEdit(p);
                      }}><Pencil size={16} /></button><button className="icon-button" aria-label={t(`Supprimer ${p.name}`)} onClick={() => setRemove(p)}><Trash2 size={16} /></button></div></td></tr>))}</tbody></table>{t(!products.length && <Empty title={t("Aucun produit")}><p>{t("Ajoutez une pi\xE8ce ou modifiez votre recherche.")}</p></Empty>)}</div><p className="muted small">{t(products.length)}{t(" produit(s) \xB7 Le stock est partag\xE9 entre les tailles et les couleurs de chaque produit.")}</p></>)}
      {t(page === 'orders' && <><div className="admin-tools"><label className="search-box"><Search size={18} /><input placeholder={t("Référence, cliente, téléphone…")} aria-label={t("Rechercher une commande")} value={search} onChange={e => setSearch(e.target.value)} /></label><select value={category} onChange={e => setCategory(e.target.value)} aria-label={t("Statut")}><option value="">{t("Tous les statuts")}</option>{t(Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{t(label)}</option>))}</select></div><div className="table-wrap"><table><thead><tr><th>{t("Commande")}</th><th>{t("Cliente")}</th><th>{t("Ville")}</th><th>{t("Total")}</th><th>{t("Statut")}</th><th></th></tr></thead><tbody>{t(orders.map(o => <tr key={o.id}><td><strong>{t(o.reference)}</strong><small>{t(new Date(o.createdAt).toLocaleDateString('fr-MA'))}</small></td><td>{t(o.customer.name)}</td><td>{t(o.customer.city)}</td><td>{t(money(o.total))}</td><td><span className={'status ' + o.status}>{t(labels[o.status])}</span></td><td><button className="text-link" onClick={() => setOrder(o)}>{t("D\xE9tails ")}<ArrowUpRight size={16} /></button></td></tr>))}</tbody></table>{t(!orders.length && <Empty title={t("Aucune commande pour le moment")}><p>{t("Les demandes pr\xE9par\xE9es depuis la boutique appara\xEEtront ici.")}</p></Empty>)}</div></>)}
      {t(['offers', 'coupons'].includes(page) && <><p className="notice">{t(page === 'offers' ? 'La meilleure offre active s’applique automatiquement aux produits concernés.' : 'Les coupons s’appliquent après les offres. Le nombre d’utilisations inclut les commandes à confirmer.')}</p><div className="table-wrap"><table><thead><tr><th>{t(page === 'coupons' ? 'Coupon' : 'Offre')}</th><th>{t("Remise")}</th><th>{t(page === 'coupons' ? 'Utilisations' : 'Catégorie')}</th><th>{t("P\xE9riode")}</th><th>{t("Activation")}</th><th>{t("Actions")}</th></tr></thead><tbody>{t(data[page].map(x => <tr key={x.id}><td><strong>{t(x.name)}</strong>{t(x.code && <small className="coupon-code">{t(x.code)}</small>)}</td><td>{t(x.value)}{t(x.type === 'percent' ? ' %' : ' DH')}</td><td>{t(page === 'coupons' ? `${x.used} / ${x.limit || '∞'}` : x.category || 'Toutes')}</td><td><small>{t(x.start || 'Dès maintenant')}<br />{t(x.end ? 'Au ' + x.end : 'Sans fin')}</small></td><td><span className={'status ' + (x.active ? 'completed' : 'cancelled')}>{t(x.active ? 'Activée' : 'Désactivée')}</span></td><td><div className="row-actions"><button className="icon-button" onClick={() => {
                        setError('');
                        setEdit(x);
                      }} aria-label={t(`Modifier ${x.name}`)}><Pencil size={16} /></button><button className="icon-button" onClick={() => setRemove(x)} aria-label={t(`Supprimer ${x.name}`)}><Trash2 size={16} /></button></div></td></tr>))}</tbody></table>{t(!data[page].length && <Empty title={t(page === 'coupons' ? 'Votre premier geste privilégié' : 'Votre prochain rendez-vous')}><p>{t(page === 'coupons' ? 'Créez un code avec une remise, un minimum et une date de fin.' : 'Programmez une remise sur une catégorie ou sur toute la collection.')}</p><Button secondary onClick={() => setEdit({})}><Plus size={16} />{t(" Cr\xE9er ")}{t(page === 'coupons' ? 'un coupon' : 'une offre')}</Button></Empty>)}</div></>)}
      {t(page === 'settings' && <SettingsEditor data={data} reload={reload} onLogout={() => setAuthenticated(false)} notify={setToast} />)}
    </main></div>
    {t(edit && page === 'products' && <ProductEditor product={edit} categories={data.settings.categories} onSave={v => save(page, v)} onClose={() => setEdit(null)} busy={busy} error={error} />)}
    {t(edit && ['offers', 'coupons'].includes(page) && <DiscountEditor item={edit} kind={page} categories={data.settings.categories} onSave={v => save(page, v)} onClose={() => setEdit(null)} busy={busy} error={error} />)}
    {t(remove && <Drawer title={t("Supprimer cet élément ?")} onClose={() => setRemove(null)}><div className="drawer-body"><p>{t("\xAB ")}{t(remove.name)}{t(" \xBB sera supprim\xE9. Vous pouvez aussi le d\xE9sactiver pour le conserver.")}</p><ErrorMessage message={error} /><div className="form-actions"><Button disabled={busy} onClick={deleteItem}>{t("Confirmer la suppression")}</Button><Button secondary onClick={() => setRemove(null)}>{t("Conserver")}</Button></div></div></Drawer>)}
    {t(order && <Drawer title={t(order.reference)} onClose={() => setOrder(null)}><div className="drawer-body"><span className={'status ' + order.status}>{t(labels[order.status])}</span><h3>{t(order.customer.name)}</h3><p className="prose">{t(order.customer.phone)}<br />{t(order.customer.address)}<br />{t(order.customer.city)}<br />{t(order.customer.note)}</p>{t(order.items.map((i, n) => <div className="order-line" key={n}><span>{t(i.quantity)}{t(" \xD7 ")}{t(i.name)}<small>{t(i.size)}{t(" \xB7 ")}{t(i.color)}</small></span><span>{t(money(i.price * i.quantity))}</span></div>))}<div className="totals"><div><span>{t("Remise ")}{t(order.coupon)}</span><span>{t("\u2212 ")}{t(money(order.discount))}</span></div><div><span>{t("Livraison")}</span><span>{t(money(order.delivery))}</span></div><div className="total"><span>{t("Total")}</span><span>{t(money(order.total))}</span></div></div><p className="notice">{t("L\u2019enregistrement ne prouve pas que le message WhatsApp a \xE9t\xE9 envoy\xE9. Confirmez la demande avec la cliente.")}</p><ErrorMessage message={error} /><div className="form-actions">{t(nextStatus[order.status].map(s => <Button key={s} secondary={s === 'cancelled'} disabled={busy} onClick={() => status(order, s)}>{t(s === 'cancelled' ? 'Annuler et restituer le stock' : labels[s])}</Button>))}</div></div></Drawer>)}
    {t(toast && <div className="toast" role="status"><Check size={18} />{t(toast)}</div>)}
  </div>;
}
function Overview({
  data,
  navigate
}) {
  const stats = [['Produits en ligne', data.products.filter(p => p.active).length, Package], ['Commandes à confirmer', data.orders.filter(o => o.status === 'pending').length, ShoppingCart], ['Ventes terminées', money(data.orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0)), Tag]];
  return <>{t(!data.settings.whatsapp && <div className="setup-notice"><div><strong>{t("Votre boutique attend son num\xE9ro WhatsApp.")}</strong><p>{t("Ajoutez votre contact et ajustez la livraison pour activer les commandes.")}</p></div><Button onClick={() => navigate('settings')}>{t("Configurer la boutique ")}<ArrowUpRight size={17} /></Button></div>)}<div className="stats">{t(stats.map(([label, value, Icon]) => <div key={label}><Icon size={21} strokeWidth={1.2} /><span>{t(label)}</span><strong>{t(value)}</strong></div>))}</div><div className="overview-bottom"><section><h2>{t("Votre collection, en un geste.")}</h2><p className="muted">{t("Une nouvelle pi\xE8ce, une belle photo, quelques d\xE9tails. C\u2019est pr\xEAt.")}</p><Button onClick={() => navigate('products')}>{t("G\xE9rer mes produits ")}<ArrowUpRight size={17} /></Button><div className="preview-strip">{t(data.products.slice(0, 4).map(p => <img key={p.id} src={p.image} alt={t(p.name)} />))}</div></section><section><h2>{t("\xC0 garder \xE0 l\u2019\u0153il")}</h2>{t(data.products.filter(p => p.stock < 5).map(p => <div className="order-line" key={p.id}><span>{t(p.name)}</span><strong>{t(p.stock)}{t(" en stock")}</strong></div>))}{t(!data.products.some(p => p.stock < 5) && <p className="muted">{t("Aucun produit sous le seuil de 5 pi\xE8ces.")}</p>)}<p className="small muted">{t("Les commandes non confirm\xE9es r\xE9servent le stock. Annulez les demandes abandonn\xE9es pour le lib\xE9rer.")}</p></section></div></>;
}
