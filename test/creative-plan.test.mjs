import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCreativePlanFromSignals, detectNicheFallback } from '../src/creative/creative-plan.mjs';

test('diferencia fábrica de tintas de loja de tintas',()=>{
  assert.equal(detectNicheFallback('Somos uma fábrica de tintas industriais e revestimentos para construção.'),'paint_factory');
  assert.equal(detectNicheFallback('Tenho uma loja de tintas para casa com atendimento pelo WhatsApp.'),'paint_store');
});

test('reconhece relojoaria e ótica',()=>{
  assert.equal(detectNicheFallback('Minha relojoaria vende relógios e também faz consertos.'),'watch_store');
  assert.equal(detectNicheFallback('Tenho uma ótica com armações, lentes e óculos de sol.'),'optical');
});

test('pedido explícito de desenho vira hero de ilustração',()=>{
  const plan=buildCreativePlanFromSignals({
    projectId:'11111111-1111-1111-1111-111111111111',
    briefing:'Tenho uma academia premium e quero que o hero seja um desenho de uma academia.',
    materials:['site','stories'],
  });
  assert.equal(plan.business.niche,'fitness');
  assert.equal(plan.site.hero.composition,'hero-illustration');
  assert.equal(plan.site.hero.mediaMode,'illustration');
  assert.ok(plan.assets.find(a=>a.slot==='site.hero')?.prompt.includes('editorial illustration'));
  assert.equal(plan.assets.filter(a=>a.slot.startsWith('stories.')).length,3);
});

test('stories recebem assets verticais e direção coerente',()=>{
  const plan=buildCreativePlanFromSignals({
    briefing:'Sou psicóloga e atendo mulheres. Quero algo acolhedor, leve e moderno.',
    materials:['brand','stories'],
  });
  assert.equal(plan.business.niche,'psychology');
  assert.equal(plan.brand.archetype,'organic-warm');
  assert.equal(plan.stories.items.length,3);
  for(const asset of plan.assets){
    assert.match(asset.slot,/^stories\./);
    assert.equal(asset.width,864);
    assert.equal(asset.height,1536);
    assert.equal(asset.aspect,'9:16');
  }
});

test('ótica premium usa pack de varejo com mídia apropriada',()=>{
  const plan=buildCreativePlanFromSignals({
    briefing:'Minha ótica é moderna, feminina e premium. Quero site e stories sofisticados.',
    materials:['site','stories','ads'],
  });
  assert.equal(plan.business.niche,'optical');
  assert.equal(plan.business.businessModel,'retail');
  assert.ok(['fashion-premium','editorial-luxury','clinical-premium'].includes(plan.brand.archetype));
  assert.equal(plan.assets.length,4);
  assert.equal(plan.ads.reuseSlot,'site.hero');
});
