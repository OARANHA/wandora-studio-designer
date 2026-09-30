import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';
import { getProject } from './projects.mjs';

const ROLES=new Set(['logo','logo-secondary','mascot','reference','product']);
const TYPES=new Map([
  ['image/png',{ext:'png',magic:(b)=>b.length>8&&b[0]===0x89&&b.subarray(1,4).toString()==='PNG'}],
  ['image/jpeg',{ext:'jpg',magic:(b)=>b.length>3&&b[0]===0xff&&b[1]===0xd8&&b[2]===0xff}],
  ['image/webp',{ext:'webp',magic:(b)=>b.length>12&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'}],
]);
const MAX_ASSETS=60;
const MAX_BYTES=8_000_000;
let queue=Promise.resolve();

const clean=(v,max=160)=>String(v??'').replace(/[\u0000-\u001f]+/g,' ').replace(/\s+/g,' ').trim().slice(0,max);
const assertId=(id)=>{if(!/^[0-9a-f-]{36}$/i.test(String(id||'')))throw new HttpError(400,'Identificador inválido.','bad_id');return id;};
const dir=(projectId)=>join(config.dataDir,'projects',assertId(projectId),'assets');
const indexPath=(projectId)=>join(dir(projectId),'assets.json');
async function readJson(path,fallback){try{return JSON.parse(await readFile(path,'utf8'));}catch(e){if(e?.code==='ENOENT')return structuredClone(fallback);throw e;}}
async function atomic(path,value){
  await mkdir(dirname(path),{recursive:true,mode:0o700});
  const temp=`${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temp,`${JSON.stringify(value,null,2)}\n`,{mode:0o600});
  await rename(temp,path);
}
function serial(job){const next=queue.then(job,job);queue=next.catch(()=>{});return next;}
function verify(type,buffer){
  const spec=TYPES.get(type);
  if(!spec)throw new HttpError(415,'Formato não suportado. Use PNG, JPG ou WEBP.','unsupported_asset_type');
  if(!Buffer.isBuffer(buffer)||buffer.length<16||!spec.magic(buffer))throw new HttpError(400,'O conteúdo do arquivo não corresponde ao formato informado.','bad_asset');
  if(buffer.length>MAX_BYTES)throw new HttpError(413,'Ativo grande demais. Limite de 8 MB.','asset_too_large');
  return spec;
}
export async function listAssets(owner,projectId){
  await getProject(owner,projectId);
  const doc=await readJson(indexPath(projectId),{schema:1,assets:[]});
  return (doc.assets||[]).slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
}
export async function putAsset({owner,projectId,role,originalName,contentType,buffer}){
  await getProject(owner,projectId);
  if(!ROLES.has(role))throw new HttpError(400,'Tipo de ativo inválido.','bad_asset_role');
  const spec=verify(contentType,buffer);
  return serial(async()=>{
    const doc=await readJson(indexPath(projectId),{schema:1,assets:[]});
    if((doc.assets||[]).length>=MAX_ASSETS)throw new HttpError(409,`Limite de ${MAX_ASSETS} ativos atingido.`,'asset_limit');
    const id=randomUUID(),now=new Date().toISOString(),file=`${id}.${spec.ext}`;
    await mkdir(dir(projectId),{recursive:true,mode:0o700});
    await writeFile(join(dir(projectId),file),buffer,{mode:0o600,flag:'wx'});
    const asset={id,projectId,role,name:clean(originalName||file,180),contentType,size:buffer.length,file,createdAt:now};
    doc.assets=[...(doc.assets||[]),asset];
    await atomic(indexPath(projectId),doc);
    return asset;
  });
}
export async function readAsset(owner,projectId,assetId){
  await getProject(owner,projectId);assertId(assetId);
  const doc=await readJson(indexPath(projectId),{schema:1,assets:[]});
  const asset=(doc.assets||[]).find(a=>a.id===assetId);
  if(!asset)throw new HttpError(404,'Ativo não encontrado.','asset_not_found');
  const body=await readFile(join(dir(projectId),asset.file));
  return {asset,body};
}
export async function deleteAsset(owner,projectId,assetId){
  await getProject(owner,projectId);assertId(assetId);
  return serial(async()=>{
    const doc=await readJson(indexPath(projectId),{schema:1,assets:[]});
    const i=(doc.assets||[]).findIndex(a=>a.id===assetId);
    if(i<0)throw new HttpError(404,'Ativo não encontrado.','asset_not_found');
    const [asset]=doc.assets.splice(i,1);
    await unlink(join(dir(projectId),asset.file)).catch(e=>{if(e?.code!=='ENOENT')throw e;});
    await atomic(indexPath(projectId),doc);
    return {ok:true};
  });
}
export const assetLimits=Object.freeze({count:MAX_ASSETS,bytes:MAX_BYTES,types:[...TYPES.keys()],roles:[...ROLES]});
