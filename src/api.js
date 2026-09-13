export async function api(path, options={}) {
  const res=await fetch('/api'+path,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers},body:options.body===undefined?undefined:JSON.stringify(options.body)});
  const data=await res.json();if(!res.ok)throw new Error(data.error||'Connexion impossible.');return data;
}
export const formatPrice=n=>new Intl.NumberFormat('fr-MA',{maximumFractionDigits:2}).format(n)+' DH';
export async function upload(file) {
  if(file.size>5*1024*1024)throw new Error('Image limitée à 5 Mo.');
  const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
  return (await api('/admin/upload',{method:'POST',body:{data}})).url;
}
