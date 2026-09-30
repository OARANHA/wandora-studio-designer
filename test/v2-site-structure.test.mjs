import test from 'node:test';
import assert from 'node:assert/strict';
import { applySiteStructure, normalizeSiteStructure } from '../src/v2/site-structure.mjs';

test('V2 site structure adds and edits a hero',()=>{
  let s=normalizeSiteStructure({});
  s=applySiteStructure(s,{operation:'add',section:'hero',heroVariant:'mascot_right'});
  assert.equal(s.hero.enabled,true);
  assert.equal(s.hero.variant,'mascot_right');
  s=applySiteStructure(s,{operation:'edit',section:'hero',heroVariant:'editorial'});
  assert.equal(s.hero.variant,'editorial');
});

test('V2 site structure adds removes and reorders sections',()=>{
  let s=normalizeSiteStructure({});
  s=applySiteStructure(s,{operation:'add',section:'benefits'});
  s=applySiteStructure(s,{operation:'add',section:'faq'});
  s=applySiteStructure(s,{operation:'add',section:'cta'});
  assert.deepEqual(s.sections,['benefits','faq','cta']);
  s=applySiteStructure(s,{operation:'reorder',section:'cta'});
  assert.deepEqual(s.sections,['cta','benefits','faq']);
  s=applySiteStructure(s,{operation:'remove',section:'faq'});
  assert.deepEqual(s.sections,['cta','benefits']);
});

test('V2 site structure ignores invalid persisted sections',()=>{
  const s=normalizeSiteStructure({hero:{enabled:false,variant:'bad'},sections:['faq','script','faq','proof']});
  assert.equal(s.hero.enabled,false);
  assert.equal(s.hero.variant,'split');
  assert.deepEqual(s.sections,['faq','proof']);
});
