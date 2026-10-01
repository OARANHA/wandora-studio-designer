import test from 'node:test';
import assert from 'node:assert/strict';
import { extractBriefingFacts } from '../src/creative/briefing-facts.mjs';
import { buildCreativePlanFromSignals } from '../src/creative/creative-plan.mjs';

test('briefing explícito preserva vermelho e azul como restrição de marca',()=>{
  const facts=extractBriefingFacts('Estou fazendo um projeto de uma academia. As cores primárias dele são vermelho e azul.');
  assert.deepEqual(facts.colors.map(x=>x.id),['vermelho','azul']);
  assert.deepEqual(facts.palette.slice(0,2),['#d62828','#2563eb']);
  assert.equal(facts.explicitColors,true);
});

test('creative plan carrega as cores explícitas para prompts de mídia',()=>{
  const plan=buildCreativePlanFromSignals({
    briefing:'Academia de performance. As cores primárias são vermelho e azul.',
    materials:['site','stories'],
  });
  assert.deepEqual(plan.brand.explicitColors.map(x=>x.id),['vermelho','azul']);
  assert.match(plan.assets.find(a=>a.slot==='site.hero').prompt,/Mandatory brand colors: Vermelho #d62828, Azul #2563eb/);
});

test('cor negada isoladamente não vira paleta explícita',()=>{
  const facts=extractBriefingFacts('Quero uma clínica clean. Não quero vermelho.');
  assert.equal(facts.explicitColors,false);
  assert.deepEqual(facts.colors,[]);
});
