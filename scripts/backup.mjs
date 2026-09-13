import { DatabaseSync } from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
const root=path.resolve(process.env.DATA_DIR||'data');const folder=path.join(root,'backups');mkdirSync(folder,{recursive:true});
const file=path.join(folder,'shop-'+new Date().toISOString().replace(/[:.]/g,'-')+'.sqlite');
const db=new DatabaseSync(path.join(root,'shop.sqlite'));db.exec("VACUUM INTO '"+file.replaceAll("'","''")+"'");db.close();console.log('Sauvegarde SQLite créée : '+file);console.log('Copiez également le dossier uploads dans votre sauvegarde privée.');
