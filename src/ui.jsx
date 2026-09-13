import { t } from './i18n';
import React, { useEffect, useRef } from 'react';
import { X, ArrowRight, ShoppingBag } from 'lucide-react';
export function Brand({
  settings,
  onClick
}) {
  const logo = settings?.logo || '/images/brand-logo.png';
  return <a className="brand" href="#" onClick={onClick} aria-label={t(settings?.name || 'Hind Lux Shop')}>{t(logo ? <img src={logo} alt={t(settings?.name || 'Hind Lux Shop')} /> : <><span>{t("HIND")}</span><small>{t("LUX SHOP")}</small></>)}</a>;
}
export function Button({
  children,
  secondary = false,
  ...props
}) {
  return <button className={'button ' + (secondary ? 'secondary' : '')} {...props}>{t(children)}</button>;
}
export function Arrow() {
  return <ArrowRight size={20} strokeWidth={1.3} />;
}
export function Drawer({
  title,
  onClose,
  children,
  wide = false
}) {
  const ref = useRef();
  useEffect(() => {
    const old = document.activeElement;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current.focus();
    const handler = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [...ref.current.querySelectorAll('button,a,input,select,textarea,[tabindex="0"]')].filter(n => !n.disabled);
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener('keydown', handler);
      old?.focus();
    };
  }, []);
  return <div className="overlay" onMouseDown={e => {
    if (e.target === e.currentTarget) onClose();
  }}><section className={'drawer ' + (wide ? 'wide' : '')} role="dialog" aria-modal="true" aria-label={t(title)} ref={ref} tabIndex={-1}><div className="drawer-head"><h2>{t(title)}</h2><button className="icon-button" onClick={onClose} aria-label={t("Fermer")}><X /></button></div>{t(children)}</section></div>;
}
export function Field({
  label,
  children,
  ...props
}) {
  return <label className="field"><span>{t(label)}</span>{t(children || <input {...props} />)}</label>;
}
export function Empty({
  title,
  children
}) {
  return <div className="empty"><ShoppingBag size={32} strokeWidth={1} /><h3>{t(title)}</h3>{t(children)}</div>;
}
export function ErrorMessage({
  message
}) {
  return message ? <p className="error" role="alert">{t(message)}</p> : null;
}
