import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFileSync, existsSync, statSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readData,mutate,dataDir } from './store.mjs';
import { initializeAdmin,authenticated,verifyPassword,createSession,destroySession,setPassword } from './auth.mjs';
import { AppError,fail,quote,effectivePrice,inPeriod,productInput,discountInput,settingsInput,customerInput,whatsappMessage } from './domain.mjs';
initializeAdmin();
const port=Number(process.env.PORT||3001), host=process.env.HOST||'127.0.0.1';
const uploads=path.join(dataDir,'uploads');mkdirSync(uploads,{recursive:true});
const attempts=new Map();
function limit(req,key,max,period){const k=key+req.socket.remoteAddress;const now=Date.now();if(attempts.size>10000)for(const [id,v] of attempts)if(v.reset<now)attempts.delete(id);let a=attempts.get(k);if(!a||a.reset<now){a={count:0,reset:now+period};attempts.set(k,a);}fail(++a.count>max,'Trop de tentatives. Réessayez plus tard.',429);}
const cookie=(v,age)=>`hind_session=${v}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV==='production'?'; Secure':''}`;
function json(res,status,data,headers={}){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(data));}
async function body(req){let raw='',length=0;for await(const chunk of req){length+=chunk.length;fail(length>8*1024*1024,'Fichier trop volumineux.',413);raw+=chunk;}try{return JSON.parse(raw||'{}');}catch{throw new AppError('Requête JSON invalide.');}}
function publicData(){const d=readData();return {settings:d.settings,products:d.products.filter(p=>p.active).map(p=>({...p,salePrice:effectivePrice(p,d.offers)})),offers:d.offers.filter(o=>inPeriod(o))};}
const statuses={pending:['confirmed','cancelled'],confirmed:['shipped','cancelled'],shipped:['completed'],completed:[],cancelled:[]};
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
  try{
    const url=new URL(req.url,'http://localhost');const p=url.pathname;const method=req.method;
    if(p==='/health'&&['GET','HEAD'].includes(method))return json(res,200,{status:'ok'});
    if(p.startsWith('/api/')){
      if(!['GET','HEAD'].includes(method)){
        const origin=req.headers.origin;
        const allowed=process.env.PUBLIC_ORIGIN||`http://${req.headers.host}`;
        fail(origin&&origin!==allowed&&!(process.env.NODE_ENV!=='production'&&['http://127.0.0.1:5173','http://localhost:5173'].includes(origin)),'Origine non autorisée.',403);
        fail(!req.headers['content-type']?.startsWith('application/json'),'Format JSON requis.',415);
      }
      if(p==='/api/shop'&&method==='GET')return json(res,200,publicData());
      if(p==='/api/auth/session'&&method==='GET')return json(res,200,{authenticated:authenticated(req)});
      if(p==='/api/auth/login'&&method==='POST'){
        limit(req,'login',10,15*60000);const v=await body(req);fail(typeof v.password!=='string'||v.password.length>200||!verifyPassword(v.password),'Mot de passe incorrect.',401);
        return json(res,200,{ok:true},{'Set-Cookie':cookie(createSession(),8*3600)});
      }
      if(p==='/api/auth/logout'&&method==='POST'){destroySession(req);return json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});}
      if(p==='/api/quote'&&method==='POST'){limit(req,'quote',180,60000);return json(res,200,quote(readData(),await body(req)));}
      if(p==='/api/orders'&&method==='POST'){
        limit(req,'order',20,60000);const input=await body(req);fail(typeof input.key!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(input.key),'Clé de commande invalide.');
        const result=mutate(d=>{
          const previous=d.orders.find(o=>o.key===input.key);if(previous)return {reference:previous.reference,url:whatsappMessage(previous,d.settings),total:previous.total};
          fail(!d.settings.whatsapp,'La boutique doit configurer son numéro WhatsApp avant de recevoir des commandes.',503);
          const customer=customerInput(input.customer);const q=quote(d,input);
          const order={...q,customer,locale:input.locale==='ar'?'ar':'fr',id:randomUUID(),key:input.key,reference:'HL-'+Date.now().toString(36).toUpperCase()+'-'+randomUUID().slice(0,4).toUpperCase(),status:'pending',createdAt:new Date().toISOString()};
          q.items.forEach(i=>{d.products.find(p=>p.id===i.id).stock-=i.quantity;});
          if(q.coupon)d.coupons.find(c=>c.code===q.coupon).used++;
          d.orders.unshift(order);return {reference:order.reference,url:whatsappMessage(order,d.settings),total:order.total};
        });return json(res,201,result);
      }
      if(p.startsWith('/api/admin/')){
        fail(!authenticated(req),'Connectez-vous à votre espace administrateur.',401);
        if(p==='/api/admin/data'&&method==='GET')return json(res,200,readData());
        if(p==='/api/admin/password'&&method==='POST'){const v=await body(req);fail(typeof v.current!=='string'||v.current.length>200||!verifyPassword(v.current),'Mot de passe actuel incorrect.');fail(typeof v.password!=='string'||v.password.length<12||v.password.length>200,'Utilisez entre 12 et 200 caractères.');setPassword(v.password);return json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});}
        if(p==='/api/admin/upload'&&method==='POST'){
          const v=await body(req);const m=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(v.data||'');fail(!m,'Images JPG, PNG ou WebP uniquement.');const buffer=Buffer.from(m[2],'base64');fail(buffer.length>5*1024*1024,'Image limitée à 5 Mo.');
          const valid=m[1]==='png'?buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):m[1]==='jpeg'?buffer[0]===255&&buffer[1]===216&&buffer[2]===255:buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP';
          fail(!valid,'Le fichier n’est pas une image valide.');const filename=randomUUID()+'.'+m[1];writeFileSync(path.join(uploads,filename),buffer);return json(res,201,{url:'/uploads/'+filename});
        }
        if(p==='/api/admin/settings'&&method==='PUT'){const v=await body(req);mutate(d=>{d.settings=settingsInput(v,d);});return json(res,200,{ok:true});}
        const route=/^\/api\/admin\/(products|offers|coupons|orders)(?:\/([\w-]+))?$/.exec(p);
        if(route){
          const [,kind,id]=route;const v=method==='DELETE'?{}:await body(req);
          const result=mutate(d=>{
            if(kind==='orders'){
              fail(method!=='PUT'||!id,'Action non autorisée.',405);const o=d.orders.find(o=>o.id===id);fail(!o,'Commande introuvable.',404);fail(!statuses[o.status]?.includes(v.status),'Transition de statut non autorisée.');
              if(v.status==='cancelled'){o.items.forEach(i=>{const product=d.products.find(p=>p.id===i.id);if(product)product.stock+=i.quantity;});if(o.coupon){const c=d.coupons.find(c=>c.code===o.coupon);if(c)c.used=Math.max(0,c.used-1);}}
              o.status=v.status;return o;
            }
            const index=id?d[kind].findIndex(x=>x.id===id):-1;fail(id&&index<0,'Élément introuvable.',404);
            if(method==='DELETE'){fail(!id,'Identifiant requis.');if(kind==='products')fail(d.orders.some(o=>['pending','confirmed','shipped'].includes(o.status)&&o.items.some(i=>i.id===id)),'Ce produit appartient à une commande ouverte. Désactivez-le.');if(kind==='coupons')fail(d.orders.some(o=>['pending','confirmed'].includes(o.status)&&o.coupon===d.coupons[index].code),'Coupon utilisé par une commande ouverte. Désactivez-le.');d[kind].splice(index,1);return {ok:true};}
            fail(!['POST','PUT'].includes(method)||method==='PUT'&&!id||method==='POST'&&id,'Action non autorisée.',405);
            const item=kind==='products'?productInput(v,d):discountInput(v,kind);
            if(kind==='offers')fail(item.category&&!d.settings.categories.includes(item.category),'Catégorie invalide.');
            if(kind==='coupons'){fail(d.coupons.some(c=>c.id!==id&&c.code===item.code),'Ce code existe déjà.');if(index>=0)fail(d.coupons[index].code!==item.code&&d.orders.some(o=>o.coupon===d.coupons[index].code),'Le code d’un coupon utilisé ne peut plus être changé.');item.used=index>=0?d.coupons[index].used:0;}
            item.id=id||randomUUID();if(index>=0)d[kind][index]=item;else d[kind].push(item);return item;
          });return json(res,200,result);
        }
      }
      throw new AppError('Route introuvable.',404);
    }
    fail(!['GET','HEAD'].includes(method),'Méthode non autorisée.',405);
    const root=p.startsWith('/uploads/')?uploads:path.resolve(existsSync('dist/index.html')?'dist':'public');
    const relative=p.startsWith('/uploads/')?p.slice(9):decodeURIComponent(p).replace(/^\//,'');
    let file=path.resolve(root,relative);fail(!file.startsWith(root+path.sep)&&file!==root,'Accès interdit.',403);
    if(!existsSync(file)||!statSync(file).isFile()){fail(p.startsWith('/uploads/')||p.startsWith('/images/'),'Fichier introuvable.',404);file=path.resolve('dist/index.html');}
    fail(!existsSync(file),'Lancez le serveur Vite sur le port 5173 ou construisez le site.',404);
    const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4'};
    if(path.extname(file)==='.mp4'){
      const bytes=readFileSync(file),size=bytes.length;const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range||'');
      if(req.headers.range&&!match){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
      const start=match?(match[1]?Number(match[1]):Math.max(0,size-Number(match[2]))):0;
      const end=match&&match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
      if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});return res.end();}
      res.writeHead(match?206:200,{'Content-Type':'video/mp4','Accept-Ranges':'bytes','Content-Length':end-start+1,'Cache-Control':'public, max-age=86400',...(match?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});return res.end(method==='HEAD'?undefined:bytes.subarray(start,end+1));
    }
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':file.endsWith('.html')?'no-cache':'public, max-age=3600','Content-Security-Policy':"default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"});res.end(method==='HEAD'?undefined:readFileSync(file));
  }catch(e){if(!e.status)console.error(e);if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'Une erreur est survenue. Réessayez.'});else res.end();}
});
server.listen(port,host,()=>console.log(`Hind Lux Shop : http://${host}:${port}`));
