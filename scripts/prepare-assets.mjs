// Encode generated source photographs as compact WebP. No visual compositing.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'sharp');
const source=process.argv[2];
if(!source)throw new Error('Pass the generated image directory.');
mkdirSync('public/images',{recursive:true});
const assets={hero:'exec-36b1ed55-ff3e-4cb1-bcbb-1a49398612f2.png',bag:'exec-37420ba2-5417-4ea7-80a6-628c0a7b8cd1.png',earrings:'exec-e120c026-86f4-46fb-936e-2a6514ba308b.png',blazer:'exec-7f254edb-fbd9-4732-b1a9-eeabaeeeac1e.png',dress:'exec-9a6a0192-9704-4177-bcf5-11c01636a5fa.png'};
for(const [name,file] of Object.entries(assets)){await sharp(path.join(source,file)).resize({width:name==='hero'?1600:700,withoutEnlargement:true}).webp({quality:84}).toFile(`public/images/${name}.webp`);}
console.log('Five optimized photographs saved to public/images.');
