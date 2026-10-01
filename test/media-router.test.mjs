import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackMediaRoute, inferStyleModel } from '../src/ai/media-router.mjs';

test('hero final routes to quality worker',()=>{
  const r=fallbackMediaRoute({slot:'site.hero',prompt:'premium optical campaign with a woman wearing eyewear',mediaMode:'photography'});
  assert.equal(r.worker,'image_quality');
});

test('story background without person routes to fast worker',()=>{
  const r=fallbackMediaRoute({slot:'stories.01',prompt:'elegant clinic interior with negative space',mediaMode:'photography'});
  assert.equal(r.worker,'image_fast');
});

test('illustration routes to imageclassic ilustmix',()=>{
  const r=fallbackMediaRoute({slot:'site.hero',prompt:'editorial illustration of a modern gym',mediaMode:'illustration'});
  assert.equal(r.worker,'image_style');
  assert.equal(r.styleModel,'ilustmix');
});

test('existing image edit routes to Qwen edit',()=>{
  const r=fallbackMediaRoute({operation:'edit',hasReference:true,instruction:'troque somente os óculos por uma armação vermelha'});
  assert.equal(r.worker,'image_edit');
});

test('object localization routes to SAM3 only with reference',()=>{
  const r=fallbackMediaRoute({operation:'segment',hasReference:true,instruction:'localize os óculos na imagem'});
  assert.equal(r.worker,'image_segment');
  const noRef=fallbackMediaRoute({operation:'segment',hasReference:false,instruction:'localize os óculos'});
  assert.notEqual(noRef.worker,'image_segment');
});

test('explicit style checkpoint is preserved',()=>{
  assert.equal(inferStyleModel({styleModel:'juggernaut'}),'juggernaut');
  assert.equal(inferStyleModel({prompt:'anime semi-realistic portrait'}),'ilustmix');
  assert.equal(inferStyleModel({prompt:'fantasy sci-fi concept art'}),'dreamshaper');
});
