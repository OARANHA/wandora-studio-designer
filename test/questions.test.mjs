import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { QUESTION_GROUPS, QUESTION_TOTAL, FREE_VARIATION_IDS, questionContract } from '../src/questions/catalog.mjs';

test('canonical Jev question contract has exactly 89 questions in six groups', () => {
  assert.equal(QUESTION_TOTAL, 89);
  assert.deepEqual(questionContract(), {
    groups: { entender: 10, site: 28, marca: 8, posts: 22, email: 14, anuncios: 7 },
    types: { choice: 59, score: 4, noul: 26 },
    total: 89,
    free: 52,
  });
});

test('all questions have valid typed Jev payloads', () => {
  for (const [group, questions] of Object.entries(QUESTION_GROUPS)) {
    for (const [id, q] of Object.entries(questions)) {
      assert.ok(['choice', 'score', 'noul'].includes(q.type), `${group}.${id}: invalid type`);
      assert.ok(q.instructions?.length > 8, `${group}.${id}: missing instructions`);
      if (q.type === 'choice') assert.ok(Object.keys(q.criteria || {}).length >= 2, `${group}.${id}: missing criteria`);
      if (q.type === 'score') assert.ok(Array.isArray(q.criteria) && q.criteria.length >= 2, `${group}.${id}: missing levels`);
      if (q.type === 'noul') assert.equal(q.criteria, undefined, `${group}.${id}: canonical noul has no criteria`);
    }
  }
  assert.equal(FREE_VARIATION_IDS.length, 52);
});

test('carousel questions preserve canonical interleaved order', () => {
  assert.deepEqual(Object.keys(QUESTION_GROUPS.posts), [
    'car_estilo',
    'p1_fmt','p1_hook','p1_ang','p1_bg','p1_item','p1_leg','p1_cta',
    'p2_fmt','p2_hook','p2_ang','p2_bg','p2_item','p2_leg','p2_cta',
    'p3_fmt','p3_hook','p3_ang','p3_bg','p3_item','p3_leg','p3_cta',
  ]);
});

test('canonical Jev catalog payload is byte-stable', () => {
  const digest = createHash('sha256').update(JSON.stringify(QUESTION_GROUPS)).digest('hex');
  assert.equal(digest, 'cd3c7ba6607d020924550b5ca5b72e066336fbd1c2789496dc91adcc43cd2c0b');
});
