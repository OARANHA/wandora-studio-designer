import test from 'node:test';
import assert from 'node:assert/strict';
import { createDecisionScheduler } from '../public/live.mjs';

const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));

test('live scheduler coalesces rapid partial transcripts', async()=>{
  let text='agência digital', calls=[];
  const s=createDecisionScheduler({
    getText:()=>text,
    debounceMs:40,
    maxWaitMs:150,
    afterBusyMs:5,
    run:async(value,seq)=>calls.push({value,seq}),
  });
  s.schedule();
  await wait(15); text='agência digital em porto'; s.schedule();
  await wait(15); text='agência digital em porto alegre'; s.schedule();
  await wait(70);
  assert.equal(calls.length,1);
  assert.equal(calls[0].value,'agência digital em porto alegre');
  s.dispose();
});

test('continuous speech is forced through max-wait window', async()=>{
  let text='marca inicial', calls=[];
  const s=createDecisionScheduler({
    getText:()=>text,
    debounceMs:80,
    maxWaitMs:100,
    afterBusyMs:5,
    run:async(value)=>calls.push(value),
  });
  s.schedule();
  for(let i=0;i<4;i++){
    await wait(25);
    text+=` palavra${i}`;
    s.schedule();
  }
  await wait(40);
  assert.ok(calls.length>=1);
  assert.match(calls[0],/^marca inicial/);
  s.dispose();
});

test('speech arriving while one update is in flight becomes one pending update', async()=>{
  let text='primeiro briefing', calls=[];
  const s=createDecisionScheduler({
    getText:()=>text,
    debounceMs:25,
    maxWaitMs:80,
    afterBusyMs:5,
    run:async(value)=>{
      calls.push(value);
      if(calls.length===1) await wait(55);
    },
  });
  s.schedule({immediate:true});
  await wait(10); text='primeiro briefing com complemento'; s.schedule();
  await wait(10); text='primeiro briefing com complemento final'; s.schedule();
  await wait(110);
  assert.deepEqual(calls,['primeiro briefing','primeiro briefing com complemento final']);
  s.dispose();
});

test('unchanged transcript is not sent twice', async()=>{
  let text='mesmo briefing', calls=0;
  const s=createDecisionScheduler({
    getText:()=>text,
    debounceMs:20,
    maxWaitMs:60,
    afterBusyMs:5,
    run:async()=>{calls++;},
  });
  s.schedule({immediate:true});
  await wait(30);
  s.schedule({immediate:true});
  await wait(30);
  assert.equal(calls,1);
  s.dispose();
});
