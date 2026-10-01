import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE=dirname(fileURLToPath(import.meta.url));

async function loadBrandAsset(folder){
  const dir=join(HERE,'brand-data',folder);
  const files=(await readdir(dir)).filter(name=>/^\d+\.b64$/.test(name)).sort();
  if(!files.length) throw new Error(`Brand asset ${folder} unavailable`);
  const chunks=[];
  for(const file of files) chunks.push(await readFile(join(dir,file),'utf8'));
  const encoded=chunks.join('').replace(/\s+/g,'');
  const body=Buffer.from(encoded,'base64');
  if(body.length<1024 || body.subarray(0,4).toString()!=='RIFF' || body.subarray(8,12).toString()!=='WEBP'){
    throw new Error(`Brand asset ${folder} is invalid`);
  }
  return body;
}

export const loginHeroWebp=await loadBrandAsset('login2');
export const wandoraLogoWebp=await loadBrandAsset('logo3');
