import { t, subscribe, getLocale, configureTranslations } from './i18n';
import React, { useEffect, useState, useSyncExternalStore, Suspense, lazy } from 'react';
import { api } from './api';
import Storefront from './Storefront';
import Intro,{shouldShowIntro} from './Intro';
const Admin = lazy(() => import('./admin/Admin'));
export default function App() {
  useSyncExternalStore(subscribe,getLocale);
  const [intro,setIntro]=useState(()=>!location.pathname.startsWith('/admin')&&shouldShowIntro());
  const [data, setData] = useState(null),
    [error, setError] = useState('');
  const admin = location.pathname.startsWith('/admin');
  const refresh = () => api('/shop').then(d=>{configureTranslations(d);setData(d);}).catch(e => setError(e.message));
  useEffect(() => {
    refresh();
  }, []);
  if (admin) return <Suspense fallback={<div className="loading">{t("HIND ")}<small>{t("Votre espace boutique\u2026")}</small></div>}><Admin onUpdate={refresh} /></Suspense>;
  if (!data) return <div className="loading">{t("HIND")}<small>{t(error || 'Un instant, l’élégance se prépare…')}</small>{t(error && <button onClick={refresh}>{t("R\xE9essayer")}</button>)}</div>;
  return <><div className={intro?'site-stage intro-waiting':'site-stage site-revealed'} inert={intro?true:undefined}><Storefront data={data} refresh={refresh} onReplayIntro={()=>setIntro(true)} /></div>{intro&&<Intro onFinish={()=>setIntro(false)}/>}</>;
}
