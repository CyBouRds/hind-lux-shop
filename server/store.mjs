import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialData } from './seed.mjs';
export const dataDir=path.resolve(process.env.DATA_DIR||'data');
mkdirSync(dataDir,{recursive:true});
export const db=new DatabaseSync(path.join(dataDir,'shop.sqlite'));
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS shop (id INTEGER PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS admin (id INTEGER PRIMARY KEY, hash TEXT NOT NULL); CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL);');
if(!db.prepare('SELECT id FROM shop WHERE id=1').get())db.prepare('INSERT INTO shop VALUES(1,?)').run(JSON.stringify(initialData));
export const readData=()=>JSON.parse(db.prepare('SELECT data FROM shop WHERE id=1').get().data);
export function mutate(fn) { db.exec('BEGIN IMMEDIATE');try{const data=readData();const result=fn(data);db.prepare('UPDATE shop SET data=? WHERE id=1').run(JSON.stringify(data));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;} }
// Add new optional fields without altering existing stock, prices or custom content.
mutate(data=>{
  if(!data.settings.logo)data.settings.logo='/images/brand-logo.png';
  for(const p of data.products){const seed=initialData.products.find(s=>s.id===p.id&&s.name===p.name);if(p.nameAr===undefined)p.nameAr=seed?.nameAr||'';if(p.descriptionAr===undefined)p.descriptionAr='';if(!p.colorImages)p.colorImages={[p.colors[0]]:p.image};if(p.id==='sac-alba'&&p.name==='Sac Alba'&&p.colors.length===1&&p.colors[0]==='Noir'){p.colors.push('Beige');p.colorImages.Beige='/images/bag-beige.webp';}}
});
