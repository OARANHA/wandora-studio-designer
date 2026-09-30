import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTE_QUESTIONS, TARGETS, commandQuestions, commandState, routeResult, commandIsActionable } from '../src/commands/router.mjs';

test('command targets preserve canonical choice counts',()=>{
  assert.deepEqual(Object.fromEntries(Object.entries(TARGETS).map(([k,v])=>[k,v.length])),{
    logo:5,cores:1,fontes:1,slogan:1,site:7,posts:10,email:7,anuncios:7,
  });
});
test('command questions prepend manter and preserve originals',()=>{
  for(const [target,ids] of Object.entries(TARGETS)){
    const current=Object.fromEntries(ids.map(id=>[id,`hoje-${id}`]));
    const qs=commandQuestions(target,current);
    assert.equal(Object.keys(qs).length,ids.length,target);
    for(const id of ids){
      assert.equal(qs[id].type,'choice');
      assert.equal(Object.keys(qs[id].criteria)[0],'manter');
      assert.match(qs[id].criteria.manter,/hoje-/);
      assert.match(qs[id].instructions,/escolha manter/i);
    }
  }
});
test('route questions have canonical top-level choices',()=>{
  assert.deepEqual(Object.keys(ROUTE_QUESTIONS.tipo.criteria),['descrever_negocio','comando_de_edicao','desfazer','fixar','outra']);
  assert.deepEqual(Object.keys(ROUTE_QUESTIONS.alvo.criteria),['logo','cores','fontes','slogan','site','posts','email','anuncios','tudo','nenhum']);
});
test('route result uses selected probability and action threshold',()=>{
  const r=routeResult({
    tipo:{type:'choice',choice:'comando_de_edicao',probabilities:{comando_de_edicao:.72,descrever_negocio:.28}},
    alvo:{type:'choice',choice:'logo',probabilities:{logo:.91,site:.09}},
  });
  assert.deepEqual(r,{tipo:'comando_de_edicao',alvo:'logo',p_tipo:.72,p_alvo:.91});
  assert.equal(commandIsActionable(r.tipo,r.p_tipo),true);
  assert.equal(commandIsActionable('desfazer',.54),false);
});
test('command state carries business, command and current labels',()=>{
  const s=commandState('Uma empresa B2B','muda o logo',{estilo:'carimbo'});
  assert.equal(s.descricao_do_negocio,'Uma empresa B2B');
  assert.equal(s.comando_da_pessoa,'muda o logo');
  assert.equal(typeof s.escolhas_de_hoje,'object');
  assert.match(s.contexto,/Mude só o que o comando pede/);
});
