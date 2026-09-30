import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = await mkdtemp(join(tmpdir(), 'wsd-projects-'));
process.env.DATA_DIR = root;
const store = await import('../src/store/projects.mjs');

test('projects persist and versions increment', async () => {
  const owner='test@wandora.local';
  const p=await store.createProject({owner,name:'Cliente Alfa',clientName:'Alfa Ltda',briefing:'Brief inicial'});
  assert.equal((await store.listProjects(owner)).length,1);
  const v1=await store.createVersion(owner,p.id,{briefing:'Brief v1',decisions:{entender:{seg:{type:'choice',choice:'tecnologia'}}}});
  const v2=await store.createVersion(owner,p.id,{briefing:'Brief v2',decisions:{}});
  assert.equal(v1.number,1); assert.equal(v2.number,2);
  const versions=await store.listVersions(owner,p.id);
  assert.deepEqual(versions.map(v=>v.number),[2,1]);
  const saved=await store.getVersion(owner,p.id,v1.id);
  assert.equal(saved.briefing,'Brief v1');
  const index=JSON.parse(await readFile(join(root,'projects.json'),'utf8'));
  assert.equal(index.projects[0].versionCount,2);
});

test.after(async()=>{ await rm(root,{recursive:true,force:true}); });
