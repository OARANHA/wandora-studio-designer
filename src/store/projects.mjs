import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config.mjs';
import { HttpError } from '../lib/http.mjs';

const INDEX = join(config.dataDir, 'projects.json');
const PROJECTS_DIR = join(config.dataDir, 'projects');
const MAX_PROJECTS = 200;
const MAX_VERSIONS = 100;
let writeQueue = Promise.resolve();

function cleanText(value, max = 160) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}
function assertId(id) {
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ''))) throw new HttpError(400, 'Identificador inválido.', 'bad_id');
  return id;
}
function safeJsonSize(value, maxBytes, label) {
  const raw = JSON.stringify(value ?? null);
  if (Buffer.byteLength(raw, 'utf8') > maxBytes) throw new HttpError(413, `${label} grande demais.`, 'payload_too_large');
  return raw;
}
function cleanModelRouting(value = {}) {
  const mode=['auto','assistido','manual'].includes(value?.mode)?value.mode:'auto';
  const selections={};
  if(value?.selections&&typeof value.selections==='object'&&!Array.isArray(value.selections)){
    for(const [task,key] of Object.entries(value.selections)){
      if(!['intent','briefing','creative_plan','copy','brand','layout','review','image','video'].includes(task))continue;
      const v=cleanText(key,180); if(v)selections[task]=v;
    }
  }
  return {mode,selections};
}
function cleanCreativePlan(value) {
  if(!value || typeof value!=='object' || Array.isArray(value))return null;
  const raw=safeJsonSize(value,140_000,'Plano criativo');
  const plan=JSON.parse(raw);
  if(plan.schema!==1)plan.schema=1;
  if(Array.isArray(plan.assets)){
    plan.assets=plan.assets.slice(0,24).map(a=>({
      id:cleanText(a?.id,80),slot:cleanText(a?.slot,100),kind:cleanText(a?.kind,30),role:cleanText(a?.role,50),
      required:a?.required!==false,auto:a?.auto!==false,status:['planned','generating','ready','failed','attached'].includes(a?.status)?a.status:'planned',
      prompt:String(a?.prompt||'').trim().slice(0,2200),negativePrompt:String(a?.negativePrompt||'').trim().slice(0,1200),
      width:Math.min(1536,Math.max(256,Number(a?.width)||1024)),height:Math.min(1536,Math.max(256,Number(a?.height)||1024)),aspect:cleanText(a?.aspect,20),
      assetId:/^[0-9a-f-]{36}$/i.test(String(a?.assetId||''))?String(a.assetId):null,
      contentUrl:String(a?.contentUrl||'').startsWith('/api/projects/')?String(a.contentUrl).slice(0,360):null,
      error:cleanText(a?.error,300)||null,
    })).filter(a=>a.id&&a.slot);
  } else plan.assets=[];
  plan.projectId=/^[0-9a-f-]{36}$/i.test(String(plan.projectId||''))?String(plan.projectId):'';
  plan.status=['planned','generating','partial','ready'].includes(plan.status)?plan.status:'planned';
  return plan;
}
function cleanV2(value = {}) {
  const materials=Array.isArray(value?.materials)?value.materials.map(v=>cleanText(v,40)).filter(Boolean).slice(0,20):[];
  const kitStatus=['draft','planning','generating','ready'].includes(value?.kitStatus)?value.kitStatus:'draft';
  const raw=value?.siteStructure&&typeof value.siteStructure==='object'?value.siteStructure:{};
  const heroRaw=raw.hero&&typeof raw.hero==='object'?raw.hero:{};
  const variants=new Set(['split','centered','mascot_right','dashboard_right','editorial','illustration','full_background','product','video']);
  const allowedSections=new Set(['benefits','proof','features','process','gallery','pricing','faq','lead','cta','footer']);
  const siteStructure={
    hero:{enabled:heroRaw.enabled!==false,variant:variants.has(heroRaw.variant)?heroRaw.variant:'split'},
    sections:Array.isArray(raw.sections)?raw.sections.map(x=>cleanText(typeof x==='string'?x:x?.id,40)).filter(x=>allowedSections.has(x)).filter((x,i,a)=>a.indexOf(x)===i).slice(0,12):[],
  };
  const creativePlan=cleanCreativePlan(value?.creativePlan);
  return {kitStatus,materials,siteStructure,creativePlan};
}
async function readJsonFile(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (e) { if (e?.code === 'ENOENT') return structuredClone(fallback); throw e; }
}
async function atomicJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temp, path);
}
function serializeWrite(job) {
  const next = writeQueue.then(job, job);
  writeQueue = next.catch(() => {});
  return next;
}
async function loadIndex() {
  const doc = await readJsonFile(INDEX, { schema: 1, projects: [] });
  if (doc?.schema !== 1 || !Array.isArray(doc.projects)) throw new Error('projects.json corrompido ou incompatível');
  return doc;
}
function owned(project, owner) { return project && project.owner === owner; }

export async function listProjects(owner) {
  const doc = await loadIndex();
  return doc.projects.filter(p => owned(p, owner)).sort((a,b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
}

export async function createProject({ owner, name, clientName = '', briefing = '' }) {
  const projectName = cleanText(name, 120);
  if (projectName.length < 2) throw new HttpError(400, 'Dê um nome ao projeto.', 'project_name_required');
  return serializeWrite(async () => {
    const doc = await loadIndex();
    const mine = doc.projects.filter(p => owned(p, owner));
    if (mine.length >= MAX_PROJECTS) throw new HttpError(409, `Limite de ${MAX_PROJECTS} projetos atingido.`, 'project_limit');
    const now = new Date().toISOString();
    const project = {
      id: randomUUID(), owner, name: projectName, clientName: cleanText(clientName, 120),
      briefing: String(briefing ?? '').trim().slice(0, 5000), modelRouting:{mode:'auto',selections:{}}, v2:{kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null}, createdAt: now, updatedAt: now, versionCount: 0,
    };
    doc.projects.push(project);
    await atomicJson(INDEX, doc);
    await mkdir(join(PROJECTS_DIR, project.id, 'versions'), { recursive: true, mode: 0o700 });
    return project;
  });
}

export async function getProject(owner, id) {
  assertId(id);
  const doc = await loadIndex();
  const project = doc.projects.find(p => p.id === id && owned(p, owner));
  if (!project) throw new HttpError(404, 'Projeto não encontrado.', 'project_not_found');
  return project;
}

export async function updateProject(owner, id, patch = {}) {
  assertId(id);
  return serializeWrite(async () => {
    const doc = await loadIndex();
    const i = doc.projects.findIndex(p => p.id === id && owned(p, owner));
    if (i < 0) throw new HttpError(404, 'Projeto não encontrado.', 'project_not_found');
    const current = doc.projects[i];
    const next = { ...current };
    if ('name' in patch) {
      const n = cleanText(patch.name, 120); if (n.length < 2) throw new HttpError(400, 'Nome inválido.', 'project_name_required'); next.name = n;
    }
    if ('clientName' in patch) next.clientName = cleanText(patch.clientName, 120);
    if ('briefing' in patch) next.briefing = String(patch.briefing ?? '').trim().slice(0, 5000);
    if ('modelRouting' in patch) next.modelRouting = cleanModelRouting(patch.modelRouting);
    if ('v2' in patch) next.v2 = cleanV2(patch.v2);
    if (!next.modelRouting) next.modelRouting={mode:'auto',selections:{}};
    if (!next.v2) next.v2={kitStatus:'draft',materials:[],siteStructure:{hero:{enabled:true,variant:'split'},sections:[]},creativePlan:null};
    next.updatedAt = new Date().toISOString();
    doc.projects[i] = next;
    await atomicJson(INDEX, doc);
    return next;
  });
}

function versionsDir(id) { return join(PROJECTS_DIR, assertId(id), 'versions'); }
function versionIndexPath(id) { return join(PROJECTS_DIR, assertId(id), 'versions.json'); }

export async function listVersions(owner, projectId) {
  await getProject(owner, projectId);
  const doc = await readJsonFile(versionIndexPath(projectId), { schema:1, versions:[] });
  if (doc?.schema !== 1 || !Array.isArray(doc.versions)) throw new Error('versions.json corrompido ou incompatível');
  return doc.versions.slice().sort((a,b) => b.number - a.number);
}

export async function getVersion(owner, projectId, versionId) {
  await getProject(owner, projectId);
  assertId(versionId);
  const path = join(versionsDir(projectId), `${versionId}.json`);
  const version = await readJsonFile(path, null);
  if (!version) throw new HttpError(404, 'Versão não encontrada.', 'version_not_found');
  return version;
}

export async function createVersion(owner, projectId, payload = {}) {
  assertId(projectId);
  safeJsonSize(payload.decisions ?? {}, 350_000, 'Decisões');
  safeJsonSize(payload.copy ?? {}, 250_000, 'Textos');
  return serializeWrite(async () => {
    const doc = await loadIndex();
    const pi = doc.projects.findIndex(p => p.id === projectId && owned(p, owner));
    if (pi < 0) throw new HttpError(404, 'Projeto não encontrado.', 'project_not_found');
    const indexPath = versionIndexPath(projectId);
    const index = await readJsonFile(indexPath, { schema:1, versions:[] });
    if (index.versions.length >= MAX_VERSIONS) throw new HttpError(409, `Limite de ${MAX_VERSIONS} versões atingido.`, 'version_limit');
    const number = index.versions.reduce((m,v) => Math.max(m, Number(v.number)||0), 0) + 1;
    const now = new Date().toISOString();
    const version = {
      id: randomUUID(), projectId, number, createdAt: now,
      reason: cleanText(payload.reason || 'manual', 80),
      briefing: String(payload.briefing ?? doc.projects[pi].briefing ?? '').trim().slice(0, 5000),
      decisions: payload.decisions && typeof payload.decisions === 'object' ? payload.decisions : {},
      copy: payload.copy && typeof payload.copy === 'object' ? payload.copy : {},
      metadata: payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {},
    };
    await atomicJson(join(versionsDir(projectId), `${version.id}.json`), version);
    index.versions.push({ id:version.id, number, createdAt:now, reason:version.reason });
    await atomicJson(indexPath, index);
    doc.projects[pi] = { ...doc.projects[pi], briefing: version.briefing, updatedAt: now, versionCount:index.versions.length };
    await atomicJson(INDEX, doc);
    return version;
  });
}

export async function deleteProject(owner, id) {
  assertId(id);
  return serializeWrite(async () => {
    const doc = await loadIndex();
    const i = doc.projects.findIndex(p => p.id === id && owned(p, owner));
    if (i < 0) throw new HttpError(404, 'Projeto não encontrado.', 'project_not_found');
    doc.projects.splice(i,1);
    await atomicJson(INDEX, doc);
    // Arquivos de versão permanecem órfãos por segurança no MVP; uma rotina explícita de purge poderá removê-los.
    return { ok:true };
  });
}

export const projectLimits = Object.freeze({ projects:MAX_PROJECTS, versions:MAX_VERSIONS });
