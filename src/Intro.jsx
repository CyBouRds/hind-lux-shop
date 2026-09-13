import React,{useEffect,useRef,useState} from 'react';
import {ArrowRight,Volume2,VolumeX} from 'lucide-react';
import {t} from './i18n';
import LanguageSwitch from './LanguageSwitch';
export function shouldShowIntro(){try{return !sessionStorage.getItem('hind-intro-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{return false;}}
export default function Intro({onFinish}){
  const video=useRef(null),timer=useRef(null),done=useRef(false);
  const [exiting,setExiting]=useState(false),[muted,setMuted]=useState(true),[progress,setProgress]=useState(0);
  function finish(){if(done.current)return;done.current=true;try{sessionStorage.setItem('hind-intro-seen','1');}catch{}setExiting(true);timer.current=setTimeout(onFinish,1100);}
  useEffect(()=>{const failSafe=setTimeout(finish,10000);const key=e=>{if(e.key==='Escape')finish();};window.addEventListener('keydown',key);video.current?.play().catch(()=>{});return()=>{clearTimeout(failSafe);clearTimeout(timer.current);window.removeEventListener('keydown',key);};},[]);
  return <section className={'intro '+(exiting?'intro-exit':'')} role="dialog" aria-modal="true" aria-label={t('Bienvenue chez Hind Lux Shop')}><video ref={video} src="/media/hind-intro-1080p.mp4" autoPlay muted={muted} playsInline preload="auto" onEnded={finish} onError={finish} onTimeUpdate={e=>setProgress(e.currentTarget.currentTime/(e.currentTarget.duration||4.06))}/><div className="intro-top"><span>HIND LUX SHOP</span><LanguageSwitch/></div><div className="intro-bottom"><button className="intro-audio" onClick={()=>setMuted(!muted)} aria-label={t(muted?'Activer le son':'Couper le son')}>{muted?<VolumeX size={19}/>:<Volume2 size={19}/>}</button><button className="intro-skip" onClick={finish}>{t('Passer l’introduction')} <ArrowRight size={18}/></button></div><div className="intro-progress" style={{transform:`scaleX(${progress})`}}/><div className="intro-seam" aria-hidden="true"/></section>;
}
