import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { db,dataDir } from './store.mjs';
export function hashPassword(p){const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex');}
export function setPassword(p){if(p.length<12)throw new Error('Le mot de passe doit contenir au moins 12 caractères.');db.prepare('INSERT OR REPLACE INTO admin VALUES(1,?)').run(hashPassword(p));db.exec('DELETE FROM sessions');}
export function initializeAdmin(){
  const configured=process.env.ADMIN_PASSWORD;
  if(!db.prepare('SELECT id FROM admin WHERE id=1').get()){
    const p=configured||randomBytes(18).toString('base64url');setPassword(p);
    if(!configured)writeFileSync(path.join(dataDir,'admin-access.txt'),`Hind Lux Shop — accès local\nAdresse : /admin\nMot de passe : ${p}\nChangez ce mot de passe dans Paramètres > Sécurité.\n`,{mode:0o600});
    console.log('Compte administrateur créé. Accès local : data/admin-access.txt (ou ADMIN_PASSWORD).');
  }else if(configured&&!verifyPassword(configured)){
    setPassword(configured);console.log('Mot de passe administrateur synchronisé avec ADMIN_PASSWORD.');
  }
}
export function verifyPassword(p){const {hash}=db.prepare('SELECT hash FROM admin WHERE id=1').get();const [salt,expected]=hash.split(':');return timingSafeEqual(Buffer.from(expected,'hex'),scryptSync(p,salt,64));}
const digest=t=>createHash('sha256').update(t).digest('hex');
export function createSession(){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?)').run(digest(token),Date.now()+8*3600000);return token;}
export function sessionToken(req){return /(?:^|; )hind_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1]||'';}
export function authenticated(req){return !!db.prepare('SELECT token FROM sessions WHERE token=? AND expires>?').get(digest(sessionToken(req)),Date.now());}
export function destroySession(req){db.prepare('DELETE FROM sessions WHERE token=?').run(digest(sessionToken(req)));}
