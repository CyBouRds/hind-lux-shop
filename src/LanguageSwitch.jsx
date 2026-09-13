import React,{useSyncExternalStore} from 'react';
import {getLocale,setLocale,subscribe} from './i18n';
export default function LanguageSwitch(){const locale=useSyncExternalStore(subscribe,getLocale);return <div className="language-switch" dir="ltr" role="group" aria-label="Langue / اللغة"><button lang="fr" onClick={()=>setLocale('fr')} aria-pressed={locale==='fr'}>FR</button><span>/</span><button lang="ar" onClick={()=>setLocale('ar')} aria-pressed={locale==='ar'}>العربية</button></div>;}
