import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticate } from '../src/auth/auth.mjs';

test('dev login rejects wrong password', () => {
  const r=authenticate('admin@wandora.local','errada','127.0.0.10');
  assert.equal(r.ok,false);
});

test('dev login accepts configured local credentials', () => {
  const r=authenticate('admin@wandora.local','wandora-dev-only','127.0.0.11');
  assert.equal(r.ok,true);
  assert.ok(r.token.includes('.'));
});
