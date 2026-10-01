import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStudioContext } from '../src/creative/studio-context.mjs';
import { planCreativeProject } from '../src/creative/creative-plan.mjs';

function a(choice){return {type:'choice',choice};}

const decisions={
  entender:{
    seg:a('academia'),pers:a('energetica'),pub:a('geral'),obj:a('visitar'),canal:a('presencial'),dif:a('experiencia'),oferta:a('aula'),
  },
  site:{hero:a('cinema'),titulo:a('nivel'),cta:a('aula'),sec_servicos:{type:'noul',noul:.75},sec_planos:{type:'noul',noul:.56},sec_depoimentos:{type:'noul',noul:.57},sec_sobre:{type:'noul',noul:.72},sec_galeria:{type:'noul',noul:.67},sec_faq:{type:'noul',noul:.66},sec_localizacao:{type:'noul',noul:.62},sec_lead:{type:'noul',noul:.58}},
  marca:{paleta:a('energia'),fonte:a('poster'),slogan:a('energia')},
  posts:{p1_hook:a('conheca'),p2_hook:a('oferta'),p3_hook:a('por_tras')},
  email:{em_assunto:a('primeiro')},
  anuncios:{ad_titulo:a('oferta1')},
};

test('StudioContext usa as decisões do Jev como fonte canônica',()=>{
  const ctx=buildStudioContext({
    decisions,
    briefing:'Projeto de uma academia. Cores primárias vermelho e azul. Quero fumaça vermelha e azul no fundo do Story 1.',
  });
  assert.equal(ctx.business.segmentId,'academia');
  assert.equal(ctx.business.segmentLabel,'Academia');
  assert.equal(ctx.creative.nicheId,'fitness');
  assert.equal(ctx.creative.archetypeHint,'sport-intense');
  assert.deepEqual(ctx.briefingFacts.colors.map(x=>x.id),['vermelho','azul']);
  assert.equal(ctx.copyFallback.brand.name,'Academia');
  assert.match(ctx.copyFallback.site.headline,/próximo nível/i);
  assert.equal(ctx.media.requests[0].target,'stories.01');
  assert.deepEqual(ctx.site.sections,['features','pricing','proof','about','gallery','faq','location','lead','cta']);
  assert.match(ctx.site.content.desc,/Musculação/i);
});

test('CreativePlan não reinterpreta o nicho quando já existem decisões canônicas',async()=>{
  const plan=await planCreativeProject({
    projectId:'11111111-1111-1111-1111-111111111111',
    briefing:'Projeto de uma academia. Cores primárias vermelho e azul. Quero fumaça vermelha e azul no fundo do Story 1.',
    materials:['site','stories'],
    decisions,
    useJev:true,
  });
  assert.equal(plan.planner.source,'canonical-decisions');
  assert.equal(plan.business.niche,'fitness');
  assert.equal(plan.brand.archetype,'sport-intense');
  assert.equal(plan.studioContext.business.segmentId,'academia');
  const story=plan.assets.find(x=>x.slot==='stories.01');
  assert.match(story.prompt,/Explicit user visual request/i);
  assert.match(story.prompt,/vermelho e azul/i);
});
