import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const dir=mkdtempSync(path.join(os.tmpdir(),'hind-lux-test-'));
const origin='http://127.0.0.1:3199';let child,cookie='';
async function request(route,method='GET',body,auth=true){const r=await fetch(origin+'/api'+route,{method,headers:{'Content-Type':'application/json',...(auth?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),headers:r.headers};}
before(async()=>{child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,PORT:'3199',DATA_DIR:dir,ADMIN_PASSWORD:'test-password-only-2026'},stdio:'pipe'});await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(new Error('Server startup timeout')),10000);child.stdout.on('data',b=>{if(b.toString().includes('http://')){clearTimeout(t);resolve();}});child.on('error',reject);});});
after(async()=>{if(child){child.kill();await new Promise(r=>child.once('exit',r));}if(path.dirname(dir)===os.tmpdir()&&path.basename(dir).startsWith('hind-lux-test-'))rmSync(dir,{recursive:true,force:true});});
test('auth, settings, transaction idempotency, coupon limit and stock rollback',async()=>{
  assert.equal((await request('/admin/data','GET',null,false)).status,401);
  const login=await request('/auth/login','POST',{password:'test-password-only-2026'},false);assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);
  const data=(await request('/admin/data')).data;
  assert.equal((await request('/admin/settings','PUT',{...data.settings,whatsapp:'212600000000'})).status,200);
  const coupon=await request('/admin/coupons','POST',{name:'Test',code:'TEST10',type:'percent',value:10,minimum:0,limit:1,active:true,start:'',end:''});assert.equal(coupon.status,200);
  const payload={key:'test-idempotency-12345',items:[{id:'sac-alba',quantity:1,size:'Unique',color:'Noir'}],coupon:'TEST10',customer:{name:'Cliente Test',phone:'0600000000',city:'Test',address:'Adresse de test'}};
  const first=await request('/orders','POST',payload,false);assert.equal(first.status,201);assert.equal(first.data.total,566);
  const retry=await request('/orders','POST',payload,false);assert.equal(retry.data.reference,first.data.reference);
  const current=(await request('/admin/data')).data;assert.equal(current.products[0].stock,11);assert.equal(current.orders.length,1);assert.equal(current.coupons[0].used,1);
  assert.equal((await request('/orders','POST',{...payload,key:'second-attempt-12345'},false)).status,400);
  const order=current.orders[0];assert.equal((await request('/admin/orders/'+order.id,'PUT',{status:'completed'})).status,400);
  assert.equal((await request('/admin/orders/'+order.id,'PUT',{status:'cancelled'})).status,200);
  const cancelled=(await request('/admin/data')).data;assert.equal(cancelled.products[0].stock,12);assert.equal(cancelled.coupons[0].used,0);
  assert.equal((await request('/admin/orders/'+order.id,'PUT',{status:'cancelled'})).status,400);
  await request('/auth/logout','POST',{});assert.equal((await request('/admin/data')).status,401);
});
