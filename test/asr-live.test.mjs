import test from 'node:test';
import assert from 'node:assert/strict';
import { downsampleMono, encodeWav16Mono, mergeTranscriptText } from '../public/live.mjs';

test('downsampleMono reduces 48 kHz PCM to 16 kHz',()=>{
  const input=new Float32Array(48000);
  for(let i=0;i<input.length;i++)input[i]=Math.sin(i/20);
  const out=downsampleMono(input,48000,16000);
  assert.ok(out.length>=15990&&out.length<=16010);
});

test('encodeWav16Mono writes a valid mono PCM WAV header',async()=>{
  const wav=encodeWav16Mono(new Float32Array(1600),16000);
  const b=Buffer.from(await wav.arrayBuffer());
  assert.equal(b.subarray(0,4).toString(),'RIFF');
  assert.equal(b.subarray(8,12).toString(),'WAVE');
  assert.equal(b.readUInt16LE(22),1);
  assert.equal(b.readUInt32LE(24),16000);
  assert.equal(b.readUInt16LE(34),16);
  assert.equal(b.subarray(36,40).toString(),'data');
  assert.equal(b.length,44+1600*2);
});

test('mergeTranscriptText removes overlap between ASR chunks',()=>{
  assert.equal(
    mergeTranscriptText('tenho uma empresa de tecnologia para pequenas empresas','para pequenas empresas e quero algo moderno'),
    'tenho uma empresa de tecnologia para pequenas empresas e quero algo moderno'
  );
  assert.equal(
    mergeTranscriptText('A Wandora cria soluções de IA.','soluções de IA para vendas'),
    'A Wandora cria soluções de IA. para vendas'
  );
});

test('mergeTranscriptText preserves non-overlapping speech',()=>{
  assert.equal(mergeTranscriptText('primeira frase','segunda frase'),'primeira frase segunda frase');
});
