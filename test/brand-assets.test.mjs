import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { loginHeroWebp, wandoraLogoWebp } from '../src/brand-assets.mjs';

const sha=(b)=>createHash('sha256').update(b).digest('hex');

test('canonical login hero bytes are intact',()=>{
  assert.equal(loginHeroWebp.length,36214);
  assert.equal(loginHeroWebp.subarray(0,4).toString(),'RIFF');
  assert.equal(loginHeroWebp.subarray(8,12).toString(),'WEBP');
  assert.equal(sha(loginHeroWebp),'b36c8728a868c9b5a0a16e115c6cbfd1b3873b3cb51fdd10fd4eed95a0bf47a5');
});

test('canonical Wandora logo bytes are intact',()=>{
  assert.equal(wandoraLogoWebp.length,19194);
  assert.equal(wandoraLogoWebp.subarray(0,4).toString(),'RIFF');
  assert.equal(wandoraLogoWebp.subarray(8,12).toString(),'WEBP');
  assert.equal(sha(wandoraLogoWebp),'3a1cf2752a3a676f64a2877a014e33d31ea9b051d219f422675095ac518cd106');
});
