import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleGoodVariants, restoreJevChoices, secondChoice } from '../public/variation.mjs';

const choice=(id,probs)=>({type:'choice',choice:id,confidence:.9,probabilities:probs});
test('Outra versão changes at least four free choices without touching entendimento',()=>{
  const base={
    entender:{seg:choice('tecnologia',{tecnologia:.9,outro:.1})},
    site:{
      hero:choice('split',{split:.6,central:.3,minimal:.1}),
      titulo:choice('futuro',{futuro:.55,simples:.3,detalhes:.15}),
      cta:choice('especialista',{especialista:.7,orcamento:.2,material:.1}),
      img:choice('flat',{flat:.65,linha:.2,vidro:.15}),
      btn:choice('suave',{suave:.58,reto:.27,pilula:.15}),
    },
  };
  const seq=[0.99,0.2,0.99,0.4,0.99,0.6,0.99,0.8,0.99,0.1,0.5,0.5,0.5,0.5];
  let i=0; const rng=()=>seq[i++%seq.length];
  const r=sampleGoodVariants(base,{rng,minChanges:4});
  assert.equal(r.decisions.entender.seg.choice,'tecnologia');
  assert.ok(r.changes.length>=4);
  assert.ok(r.changes.every(c=>c.group==='site'));
  assert.ok(r.changes.every(c=>c.to!==c.from));
});
test('versão do Jev restores highest-probability choices',()=>{
  const varied={site:{hero:choice('central',{split:.6,central:.3,minimal:.1}),cta:choice('orcamento',{especialista:.7,orcamento:.2,material:.1})}};
  const r=restoreJevChoices(varied);
  assert.equal(r.count,2);
  assert.equal(r.decisions.site.hero.choice,'split');
  assert.equal(r.decisions.site.cta.choice,'especialista');
});
test('secondChoice returns strongest alternative to current choice',()=>{
  const s=secondChoice(choice('a',{a:.6,b:.3,c:.1}));
  assert.deepEqual(s,{id:'b',prob:.3,rank:2});
});
