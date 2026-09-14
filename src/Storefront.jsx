import { t, getLocale } from "./i18n";
import LanguageSwitch from "./LanguageSwitch";
import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Search,
  Menu,
  Check,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Instagram,
  ArrowUpRight,
  Sparkles,
  Clock3,
  Copy,
} from "lucide-react";
import { Brand, Button, Arrow, Drawer, Field, Empty, ErrorMessage } from "./ui";
import { api, formatPrice as money } from "./api";
function loadCart() {
  try {
    const c = JSON.parse(localStorage.getItem("hind-cart") || "[]");
    return Array.isArray(c) ? c : [];
  } catch {
    return [];
  }
}
export default function Storefront({ data, refresh, onReplayIntro }) {
  const { settings, products, offers, coupons = [] } = data;
  const [page, setPage] = useState(
      location.hash === "#collection" ? "collection" : "home",
    ),
    [category, setCategory] = useState("Tout"),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState("featured"),
    [selected, setSelected] = useState(null),
    [cart, setCart] = useState(loadCart),
    [cartOpen, setCartOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [info, setInfo] = useState(null),
    [toast, setToast] = useState("");
  useEffect(() => {
    localStorage.setItem("hind-cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const handler = () => {
      if (location.hash === "#collection") setPage("collection");
      else if (!location.hash) setPage("home");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (cat = "Tout") => {
    setCategory(cat);
    setPage("collection");
    location.hash = "collection";
    setMenu(false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const home = (e) => {
    e?.preventDefault();
    setPage("home");
    location.hash = "";
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  function add(product, size, color, quantity) {
    setCart((old) => {
      const index = old.findIndex(
        (i) => i.id === product.id && i.size === size && i.color === color,
      );
      const next = [...old];
      if (index >= 0)
        next[index] = {
          ...next[index],
          quantity: Math.min(product.stock, next[index].quantity + quantity),
        };
      else
        next.push({
          id: product.id,
          size,
          color,
          quantity,
        });
      return next;
    });
    setSelected(null);
    setToast("La pièce a été ajoutée à votre panier.");
  }
  const filtered = products
    .filter(
      (p) =>
        (category === "Tout" || p.category === category) &&
        (
          p.name +
          " " +
          p.description +
          " " +
          t(p.name) +
          " " +
          t(p.description)
        )
          .toLocaleLowerCase("fr")
          .includes(search.toLocaleLowerCase("fr")),
    )
    .sort((a, b) =>
      sort === "asc"
        ? a.salePrice - b.salePrice
        : sort === "desc"
          ? b.salePrice - a.salePrice
          : sort === "name"
            ? a.name.localeCompare(b.name)
            : Number(b.featured) - Number(a.featured),
    );
  const contact = () =>
    settings.whatsapp
      ? window.open(
          `https://wa.me/${settings.whatsapp}`,
          "_blank",
          "noopener,noreferrer",
        )
      : setInfo({
          title: "Contactez la boutique",
          text: "Le contact WhatsApp sera disponible prochainement.",
        });
  return (
    <>
      <a className="skip" href="#main">
        {t("Aller au contenu")}
      </a>
      {t(
        settings.announcement && (
          <div className="announcement">{t(settings.announcement)}</div>
        ),
      )}
      <header className="shop-header">
        <Brand settings={settings} onClick={home} />
        <nav aria-label={t("Navigation principale")}>
          <button onClick={() => navigate()}>{t("La collection")}</button>
          {t(
            settings.categories.map((c) => (
              <button key={c} onClick={() => navigate(c)}>
                {t(c)}
              </button>
            )),
          )}
        </nav>
        <div className="header-actions">
          <LanguageSwitch />
          <button
            className="icon-button cart-button"
            onClick={() => setCartOpen(true)}
            aria-label={t(
              `Ouvrir le panier, ${cart.reduce((n, i) => n + i.quantity, 0)} articles`,
            )}
          >
            <ShoppingBag strokeWidth={1.4} />
            {t(
              cart.length > 0 && (
                <span>{t(cart.reduce((n, i) => n + i.quantity, 0))}</span>
              ),
            )}
          </button>
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label={t("Menu")}
            aria-expanded={menu}
          >
            <Menu />
          </button>
        </div>
      </header>
      {t(
        menu && (
          <nav className="mobile-nav">
            <button onClick={() => navigate()}>{t("La collection")}</button>
            {t(
              settings.categories.map((c) => (
                <button key={c} onClick={() => navigate(c)}>
                  {t(c)}
                </button>
              )),
            )}
          </nav>
        ),
      )}
      <main id="main">
        {t(
          page === "home" ? (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <h1>{t(settings.heroTitle)}</h1>
                  <p>{t(settings.heroText)}</p>
                  <Button onClick={() => navigate()}>
                    {t("D\xE9couvrir la collection ")}
                    <Arrow />
                  </Button>
                </div>
                <div className="hero-media">
                  <img
                    src={settings.heroImage}
                    alt={t(
                      "Collection Hind Lux Shop, silhouette noire et détails dorés",
                    )}
                    fetchPriority="high"
                  />
                </div>
              </section>
              {t(
                (offers.length > 0 || coupons.length > 0) && (
                  <PromotionShowcase
                    offers={offers}
                    coupons={coupons}
                    products={products}
                    navigate={navigate}
                    onCopied={() => setToast("Code copié.")}
                  />
                ),
              )}
              <section className="featured section">
                <div className="section-heading">
                  <h2>{t("Les pi\xE8ces du moment")}</h2>
                  <button className="text-link" onClick={() => navigate()}>
                    {t("Toute la collection ")}
                    <Arrow />
                  </button>
                </div>
                <div className="product-grid">
                  {t(
                    products
                      .filter((p) => p.featured)
                      .slice(0, 4)
                      .map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onSelect={() => setSelected(p)}
                        />
                      )),
                  )}
                </div>
                {t(
                  !products.some((p) => p.featured) && (
                    <Empty title={t("Une nouvelle sélection se prépare")}>
                      <button className="text-link" onClick={() => navigate()}>
                        {t("Voir la collection ")}
                        <Arrow />
                      </button>
                    </Empty>
                  ),
                )}
              </section>
            </>
          ) : (
            <section className="section collection">
              <div className="collection-heading">
                <h1>{t("La collection")}</h1>
                <p>{t("Des essentiels, du caract\xE8re.")}</p>
              </div>
              <div className="collection-tools">
                <div className="tabs">
                  {t(
                    ["Tout", ...settings.categories].map((c) => (
                      <button
                        className={category === c ? "active" : ""}
                        key={c}
                        onClick={() => setCategory(c)}
                      >
                        {t(c)}
                      </button>
                    )),
                  )}
                </div>
                <label className="search-box">
                  <Search size={18} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("Rechercher un produit…")}
                    aria-label={t("Rechercher un produit")}
                  />
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label={t("Trier les produits")}
                >
                  <option value="featured">{t("Trier : S\xE9lection")}</option>
                  <option value="asc">{t("Prix croissant")}</option>
                  <option value="desc">{t("Prix d\xE9croissant")}</option>
                  <option value="name">{t("Nom A\u2013Z")}</option>
                </select>
              </div>
              <div className="product-grid">
                {t(
                  filtered.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onSelect={() => setSelected(p)}
                    />
                  )),
                )}
              </div>
              {t(
                !filtered.length && (
                  <Empty title={t("Aucune pièce ne correspond")}>
                    <p>
                      {t("Essayez un autre mot ou une autre cat\xE9gorie.")}
                    </p>
                    <Button
                      secondary
                      onClick={() => {
                        setSearch("");
                        setCategory("Tout");
                      }}
                    >
                      {t("R\xE9initialiser les filtres")}
                    </Button>
                  </Empty>
                ),
              )}
            </section>
          ),
        )}
      </main>
      <footer className="footer">
        <div className="footer-main">
          <Brand settings={settings} onClick={home} />
          <p>{t(settings.about)}</p>
          <button className="contact-link" onClick={contact}>
            <MessageCircle size={23} />
            {t(" Une question ? Parlons sur WhatsApp ")}
            <Arrow />
          </button>
        </div>
        <div className="footer-bottom">
          <span>
            {t("\xA9 ")}
            {t(new Date().getFullYear())} {t(settings.name)}
          </span>
          <div>
            <button
              onClick={() =>
                setInfo({
                  title: "Livraison",
                  text: settings.deliveryText,
                })
              }
            >
              {t("Livraison")}
            </button>
            <button
              onClick={() =>
                setInfo({
                  title: "Échanges & retours",
                  text: settings.returnText,
                })
              }
            >
              {t("\xC9changes & retours")}
            </button>
            <button
              onClick={() =>
                setInfo({
                  title: "Vos données",
                  text: "Les informations saisies dans votre commande servent à son traitement et sont transmises à WhatsApp lorsque vous ouvrez le lien. Pour consulter ou supprimer vos données, contactez la boutique. Le panier est mémorisé sur votre appareil ; aucun traceur publicitaire n’est utilisé.",
                })
              }
            >
              {t("Confidentialit\xE9")}
            </button>
            {t(
              settings.instagram && (
                <a
                  href={settings.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("Instagram")}
                >
                  <Instagram size={17} />
                </a>
              ),
            )}
            <button onClick={onReplayIntro}>
              {t("Revoir l’introduction")}
            </button>
            <a href="/admin">
              {t("Espace boutique ")}
              <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
      </footer>
      {t(
        selected && (
          <ProductDetail
            product={selected}
            onClose={() => setSelected(null)}
            onAdd={add}
          />
        ),
      )}
      {t(
        cartOpen && (
          <Cart
            cart={cart}
            setCart={setCart}
            products={products}
            settings={settings}
            onClose={() => setCartOpen(false)}
            refresh={refresh}
          />
        ),
      )}
      {t(
        info && (
          <Drawer title={t(info.title)} onClose={() => setInfo(null)}>
            <div className="drawer-body">
              <p className="prose">{t(info.text)}</p>
            </div>
          </Drawer>
        ),
      )}
      {t(
        toast && (
          <div role="status" className="toast">
            <Check size={18} />
            {t(toast)}
            <button
              onClick={() => {
                setCartOpen(true);
                setToast("");
              }}
            >
              {t("Voir le panier")}
            </button>
          </div>
        ),
      )}
    </>
  );
}
function PromotionShowcase({ offers, coupons, products, navigate, onCopied }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const items = [
    ...offers.map((x) => ({
      ...x,
      kind: "offer",
      product: products.find((p) => p.id === x.productId),
    })),
    ...coupons.map((x) => ({ ...x, kind: "coupon" })),
  ];
  return (
    <section className="promotions section" aria-labelledby="promotions-title">
      <div className="promotions-heading">
        <span className="small-label">
          <Sparkles size={14} />
          {t("PRIVILÈGES HIND")}
        </span>
        <h2 id="promotions-title">{t("Offres du moment")}</h2>
        <p>
          {t("Des attentions exclusives, disponibles pour une durée limitée.")}
        </p>
      </div>
      <div className="promotion-grid">
        {items.map((item) => (
          <PromotionCard
            key={item.kind + item.id}
            item={item}
            now={now}
            navigate={navigate}
            onCopied={onCopied}
          />
        ))}
      </div>
    </section>
  );
}
function PromotionCard({ item, now, navigate, onCopied }) {
  const locale = getLocale() === "ar" ? "ar-MA" : "fr-MA",
    start = item.start ? Date.parse(item.start + "T00:00:00Z") : null,
    end = item.end ? Date.parse(item.end + "T23:59:59Z") : null;
  const target = start && now < start ? start : end,
    remaining = target ? Math.max(0, target - now) : null,
    status = start && now < start ? "Bientôt" : "En cours";
  const divisors = [86400000, 3600000, 60000, 1000],
    labels = ["J", "H", "MIN", "SEC"];
  const units =
    remaining === null
      ? null
      : divisors.map((size, i) => ({
          label: labels[i],
          value: String(
            i
              ? Math.floor(remaining / size) % (divisors[i - 1] / size)
              : Math.floor(remaining / size),
          ).padStart(2, "0"),
        }));
  const date = (x) =>
    x
      ? new Intl.DateTimeFormat(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(x + "T12:00:00Z"))
      : t("Sans limite");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.code);
      onCopied();
    } catch {}
  };
  const style = item.product
    ? { "--promotion-image": `url("${item.product.image.replace(/["\\]/g, "")}")` }
    : undefined;
  return (
    <article
      style={style}
      className={
        "promotion-card " + item.kind + (item.product ? " product-offer" : "")
      }
    >
      <div className="promotion-top">
        <span>{t(item.kind === "coupon" ? "COUPON" : "OFFRE")}</span>
        <span className="promotion-status">{t(status)}</span>
      </div>
      <h3>{t(item.name)}</h3>
      <strong className="promotion-value">
        {item.type === "percent" ? item.value + "%" : money(item.value)}
      </strong>
      <p>
        {t(
          item.kind === "coupon"
            ? "de réduction avec le code"
            : "de réduction sur",
        )}{" "}
        {item.kind === "offer" &&
          t(item.product?.name || item.category || "Toute la collection")}
      </p>
      <div className="promotion-dates">
        <span>
          {t("Début")} <b>{date(item.start)}</b>
        </span>
        <span>
          {t("Fin")} <b>{date(item.end)}</b>
        </span>
      </div>
      {units && (
        <div className="countdown" aria-label={t("Temps restant")}>
          <Clock3 size={17} />
          {units.map((u) => (
            <span key={u.label}>
              <b>{u.value}</b>
              <small>{t(u.label)}</small>
            </span>
          ))}
        </div>
      )}
      <div className="promotion-action">
        {item.kind === "coupon" ? (
          <button className="coupon-copy" onClick={copy}>
            <span>{item.code}</span>
            <Copy size={16} />
            {t("Copier")}
          </button>
        ) : (
          <Button
            secondary
            onClick={() => navigate(item.product?.category || item.category || "Tout")}
          >
            {t("Découvrir l’offre ")}
            <Arrow />
          </Button>
        )}
      </div>
    </article>
  );
}
function ProductCard({ product: p, onSelect }) {
  return (
    <article className="product-card">
      <button
        className="product-image"
        onClick={onSelect}
        aria-label={t(`Découvrir ${p.name}`)}
      >
        <img
          src={p.image}
          alt={t(p.name)}
          loading="lazy"
          width="600"
          height="800"
        />
        {t(
          p.salePrice < p.price && (
            <span className="product-badge">{t("Offre")}</span>
          ),
        )}
        {t(
          p.stock === 0 && (
            <span className="product-badge">{t("\xC9puis\xE9")}</span>
          ),
        )}
        <span className="image-action">
          {t("D\xE9couvrir la pi\xE8ce ")}
          <Arrow />
        </span>
      </button>
      <div className="product-bottom">
        <div>
          <button className="product-name" onClick={onSelect}>
            {t(p.name)}
          </button>
          <p>
            {t(money(p.salePrice))}{" "}
            {t(p.salePrice < p.price && <del>{t(money(p.price))}</del>)}
          </p>
        </div>
        <button
          className="icon-button add-small"
          onClick={onSelect}
          aria-label={t(`Choisir ${p.name}`)}
        >
          <ShoppingBag size={18} strokeWidth={1.3} />
        </button>
      </div>
    </article>
  );
}
function ProductDetail({ product: p, onClose, onAdd }) {
  const [size, setSize] = useState(p.sizes[0]),
    [color, setColor] = useState(p.colors[0]);
  return (
    <Drawer title={t("La pièce en détail")} onClose={onClose} wide>
      <div className="detail-layout">
        <img
          className="detail-image"
          key={color}
          src={p.colorImages?.[color] || p.image}
          alt={t(p.name)}
        />
        <div className="detail-copy">
          <span className="small-label">{t(p.category)}</span>
          <h2>{t(p.name)}</h2>
          <p className="detail-price">
            {t(money(p.salePrice))}{" "}
            {t(p.salePrice < p.price && <del>{t(money(p.price))}</del>)}
          </p>
          <p className="prose">{t(p.description)}</p>
          <fieldset>
            <legend>{t("Taille")}</legend>
            <div className="choice-row">
              {t(
                p.sizes.map((s) => (
                  <button
                    key={s}
                    className={s === size ? "selected" : ""}
                    onClick={() => setSize(s)}
                    aria-pressed={s === size}
                  >
                    {t(s)}
                  </button>
                )),
              )}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t("Couleur")}</legend>
            <div className="choice-row">
              {t(
                p.colors.map((c) => (
                  <button
                    key={c}
                    className={c === color ? "selected" : ""}
                    onClick={() => setColor(c)}
                    aria-pressed={c === color}
                  >
                    {t(c)}
                  </button>
                )),
              )}
            </div>
          </fieldset>
          <Button disabled={!p.stock} onClick={() => onAdd(p, size, color, 1)}>
            {t(p.stock ? "Ajouter au panier" : "Pièce épuisée")}{" "}
            <ShoppingBag size={18} />
          </Button>
          <p className="muted small">
            {t("Votre commande se confirme avec la boutique sur WhatsApp.")}
          </p>
        </div>
      </div>
    </Drawer>
  );
}
function Cart({ cart, setCart, products, settings, onClose, refresh }) {
  const [coupon, setCoupon] = useState(""),
    [applied, setApplied] = useState(""),
    [q, setQ] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [result, setResult] = useState(null),
    [key] = useState(() => crypto.randomUUID()),
    [customer, setCustomer] = useState({
      name: "",
      phone: "",
      city: "",
      address: "",
      note: "",
    });
  useEffect(() => {
    let live = true;
    setQ(null);
    setError("");
    if (cart.length)
      api("/quote", {
        method: "POST",
        body: {
          items: cart,
          coupon: applied,
        },
      })
        .then((v) => {
          if (live) setQ(v);
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    return () => {
      live = false;
    };
  }, [cart, applied]);
  function quantity(index, delta) {
    setCart((old) =>
      old.map((i, n) =>
        n === index
          ? {
              ...i,
              quantity: Math.max(1, Math.min(99, i.quantity + delta)),
            }
          : i,
      ),
    );
  }
  async function applyCoupon() {
    setError("");
    setBusy(true);
    try {
      const next = await api("/quote", {
        method: "POST",
        body: {
          items: cart,
          coupon,
        },
      });
      setApplied(coupon);
      setQ(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function order(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api("/orders", {
        method: "POST",
        body: {
          items: cart,
          coupon: applied,
          customer,
          key,
          locale: getLocale(),
        },
      });
      setResult(r);
      setCart([]);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Drawer
      title={t(result ? "Votre commande est prête" : "Votre panier")}
      onClose={onClose}
    >
      {t(
        result ? (
          <div className="drawer-body success">
            <Check size={42} strokeWidth={1} />
            <h3>{t("Un dernier pas vers vos nouvelles pi\xE8ces.")}</h3>
            <p>
              {t("R\xE9f\xE9rence ")}
              {t(result.reference)}
            </p>
            <p>
              {t(
                "La demande est enregistr\xE9e. Envoyez le message WhatsApp pour confirmer la disponibilit\xE9 et la livraison avec la boutique.",
              )}
            </p>
            <a
              className="button"
              href={result.url}
              target="_blank"
              rel="noreferrer"
            >
              {t("Envoyer sur WhatsApp ")}
              <MessageCircle size={20} />
            </a>
            <Button secondary onClick={onClose}>
              {t("Continuer la visite")}
            </Button>
          </div>
        ) : !cart.length ? (
          <Empty title={t("Votre panier attend ses premières pièces")}>
            <p>
              {t("Prenez le temps de trouver celles qui vous ressemblent.")}
            </p>
            <Button onClick={onClose}>
              {t("Continuer la d\xE9couverte ")}
              <Arrow />
            </Button>
          </Empty>
        ) : (
          <div className="drawer-body">
            <div className="cart-items">
              {t(
                cart.map((i, index) => {
                  const p = products.find((p) => p.id === i.id);
                  return (
                    <div className="cart-item" key={i.id + i.size + i.color}>
                      {t(
                        p && (
                          <img
                            src={p.colorImages?.[i.color] || p.image}
                            alt={t(p.name)}
                          />
                        ),
                      )}
                      <div>
                        <h3>{t(p?.name || "Produit indisponible")}</h3>
                        <small>
                          {t(i.size)}
                          {t(" \xB7 ")}
                          {t(i.color)}
                        </small>
                        <p>{t(p ? money(p.salePrice) : "À retirer")}</p>
                        <div className="quantity">
                          <button
                            aria-label={t(`Diminuer ${p?.name || "quantité"}`)}
                            disabled={i.quantity === 1}
                            onClick={() => quantity(index, -1)}
                          >
                            <Minus size={13} />
                          </button>
                          <span>{t(i.quantity)}</span>
                          <button
                            aria-label={t(`Augmenter ${p?.name || "quantité"}`)}
                            onClick={() => quantity(index, 1)}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={t(`Retirer ${p?.name || "produit"}`)}
                        onClick={() =>
                          setCart((old) => old.filter((_, n) => n !== index))
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  );
                }),
              )}
            </div>
            <label className="coupon-label" htmlFor="coupon-code">
              {t("Code promo / Redeem code")}
            </label>
            <div className="coupon-line">
              <input
                id="coupon-code"
                placeholder={t("Code de réduction (facultatif)")}
                aria-label={t("Code de réduction (facultatif)")}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              />
              <Button secondary disabled={busy} onClick={applyCoupon}>
                {t("Appliquer")}
              </Button>
            </div>
            <p className="small muted">
              {t("Facultatif — vous pouvez commander sans code.")}
            </p>
            {t(
              applied && (
                <p className="small">
                  {t("Coupon ")}
                  {t(applied)}{" "}
                  <button
                    className="text-link"
                    onClick={() => {
                      setApplied("");
                      setCoupon("");
                    }}
                  >
                    {t("Retirer")}
                  </button>
                </p>
              ),
            )}
            <ErrorMessage message={error} />
            {t(
              q && (
                <div className="totals">
                  <div>
                    <span>{t("Sous-total")}</span>
                    <span>{t(money(q.subtotal))}</span>
                  </div>
                  {t(
                    q.discount > 0 && (
                      <div>
                        <span>{t("R\xE9duction")}</span>
                        <span>
                          {t("\u2212 ")}
                          {t(money(q.discount))}
                        </span>
                      </div>
                    ),
                  )}
                  <div>
                    <span>{t("Livraison")}</span>
                    <span>{t(q.delivery ? money(q.delivery) : "Offerte")}</span>
                  </div>
                  <div className="total">
                    <span>{t("Total")}</span>
                    <span>{t(money(q.total))}</span>
                  </div>
                </div>
              ),
            )}
            <form onSubmit={order} className="checkout">
              <h3>{t("Les d\xE9tails de votre commande")}</h3>
              <Field
                label={t("Nom complet")}
                autoComplete="name"
                required
                maxLength={100}
                value={customer.name}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    name: e.target.value,
                  })
                }
              />
              <div className="form-row">
                <Field
                  label={t("Téléphone")}
                  type="tel"
                  autoComplete="tel"
                  required
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      phone: e.target.value,
                    })
                  }
                />
                <Field
                  label={t("Ville")}
                  autoComplete="address-level2"
                  required
                  value={customer.city}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      city: e.target.value,
                    })
                  }
                />
              </div>
              <Field
                label={t("Adresse de livraison")}
                autoComplete="street-address"
                required
                minLength={5}
                value={customer.address}
                onChange={(e) =>
                  setCustomer({
                    ...customer,
                    address: e.target.value,
                  })
                }
              />
              <Field label={t("Une précision ? (facultatif)")}>
                <textarea
                  rows={2}
                  value={customer.note}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      note: e.target.value,
                    })
                  }
                />
              </Field>
              <p className="muted small">
                {t(
                  "En continuant, vous acceptez de transmettre ces informations \xE0 la boutique pour traiter votre commande.",
                )}
              </p>
              {t(
                !settings.whatsapp && (
                  <p className="notice">
                    {t(
                      "La commande WhatsApp sera disponible d\xE8s l\u2019activation du contact de la boutique.",
                    )}
                  </p>
                ),
              )}
              <Button disabled={busy || !q || !settings.whatsapp} type="submit">
                {t(busy ? "Préparation…" : "Préparer ma commande WhatsApp")}{" "}
                <Arrow />
              </Button>
            </form>
          </div>
        ),
      )}
    </Drawer>
  );
}
