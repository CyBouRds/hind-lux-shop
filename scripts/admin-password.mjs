import { createInterface } from 'node:readline/promises';
import { setPassword } from '../server/auth.mjs';
const cli=createInterface({input:process.stdin,output:process.stdout});
const password=process.env.ADMIN_PASSWORD||await cli.question('Nouveau mot de passe (12 caractères minimum, saisie visible) : ');
try{setPassword(password);console.log('Mot de passe modifié. Toutes les sessions ont été fermées.');}finally{cli.close();}
