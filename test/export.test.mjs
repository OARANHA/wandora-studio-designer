import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSiteHtml, buildEmailHtml, buildSignatureHtml, buildAdsHtml, buildProjectJson, slugify } from '../public/export.mjs';

const ctx={
  project:{id:'00000000-0000-4000-8000-000000000001',name:'Projeto Café',clientName:'Café Aranha'},
  decisions:{marca:{paleta:{type:'choice',choice:'rock'},slogan:{type:'choice',choice:'memoria'}},site:{titulo:{type:'choice',choice:'atitude'}},anuncios:{}},
  copy:{brand:{name:'Café Aranha',slogan:'Sabor que vira memória.'},site:{headline:'Seu café, do seu jeito.',subheadline:'Feito para encontros.'},email:{subject:'Uma novidade quente',preheader:'Chegou hoje',preview:'Uma mensagem curta.'},ads:{headline:'Café novo na casa'}},
  locks:{choices:{},targets:{}},history:[]
};

test('site export is a standalone HTML document',()=>{
  const html=buildSiteHtml(ctx);
  assert.match(html,/^<!doctype html>/i);
  assert.match(html,/<html lang="pt-BR">/);
  assert.match(html,/<h1>/);
  assert.ok((html.match(/<section/g)||[]).length>=5);
  assert.doesNotMatch(html,/(?:src|href)="https?:\/\//i);
  assert.ok(Buffer.byteLength(html,'utf8')<600_000);
});

test('email export uses tables and no svg/data URI',()=>{
  const html=buildEmailHtml(ctx);
  assert.match(html,/^<!doctype html>/i);
  assert.match(html,/<table role="presentation"/);
  assert.doesNotMatch(html,/<svg/i);
  assert.doesNotMatch(html,/data:/i);
});

test('signature export is embeddable table HTML',()=>{
  const html=buildSignatureHtml(ctx);
  assert.match(html,/^<table role="presentation"/);
  assert.match(html,/Café Aranha/);
});

test('ads export contains all six IAB canvas sizes',()=>{
  const html=buildAdsHtml(ctx);
  for(const size of ['300×250','728×90','160×600','300×600','320×50','970×250']) assert.match(html,new RegExp(size));
});

test('project JSON contains decisions without secrets',()=>{
  const raw=buildProjectJson(ctx), doc=JSON.parse(raw);
  assert.equal(doc.schema,2);
  assert.equal(doc.project.name,'Projeto Café');
  assert.ok(doc.decisions.marca);
  assert.doesNotMatch(raw,/JEV_API_KEY|NVIDIA_API_KEY|CHUTES_API_KEY|SESSION_SECRET/);
});

test('slugify produces safe file names',()=>{
  assert.equal(slugify('Café São João / 2026'),'cafe-sao-joao-2026');
});
