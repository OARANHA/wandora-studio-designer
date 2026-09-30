import test from 'node:test';
import assert from 'node:assert/strict';
import { PERGUNTAS_AJUSTE, IDS_AJUSTE, interpretarAjustes, modoDoComando, lerCores } from '../src/commands/adjustments.mjs';

const a=(choice,probabilities)=>({type:'choice',choice,confidence:1,probabilities});
const none=(id='nao_pedido')=>a(id,{[id]:1});
const base=()=>({
  aj_modo:a('ajuste',{ajuste:1,biblioteca:0,ambos:0,nenhum:0}),
  aj_pecas:a('nao_diz',{nao_diz:1,site:0,posts:0,email:0,anuncios:0,todas:0}),
  aj_fundo:none(), aj_fundo_onde:a('pagina',{pagina:1}), aj_cor1:a('nenhuma',{nenhuma:1}), aj_cor2:a('nenhuma',{nenhuma:1}),
  aj_direcao:a('nao_diz',{nao_diz:1}), aj_caixa:none(), aj_tamanho:none(), aj_peso:none(), aj_espaco:none(),
  aj_cor_texto:a('nenhuma',{nenhuma:1}), aj_sombra:none(), aj_italico:none(), aj_alinhamento:none(), aj_onde:a('tudo',{tudo:1}),
});

test('adjustment contract has 16 questions and canonical color option counts',()=>{
  assert.equal(IDS_AJUSTE.length,16);
  assert.equal(Object.keys(PERGUNTAS_AJUSTE.aj_cor1.criteria).length,44);
  assert.equal(Object.keys(PERGUNTAS_AJUSTE.aj_cor2.criteria).length,44);
  assert.equal(Object.keys(PERGUNTAS_AJUSTE.aj_cor_texto.criteria).length,46);
});
test('reference: background green becomes solid #1f9d55 on site',()=>{
  const x=base();x.aj_pecas=a('site',{nao_diz:0,site:.61,posts:0,email:0,anuncios:0,todas:.39});
  x.aj_fundo=a('solida',{nao_pedido:.01,solida:.99,degrade:0,escurecer:0,clarear:0});
  x.aj_cor1=a('verde',{nenhuma:0,verde:1});
  const out=interpretarAjustes(x,'agora quero mudar o background para verde','site',null);
  assert.equal(out.length,1);assert.equal(out[0].id,'fundo|site|pagina');
  assert.deepEqual(out[0].valor,{tipo:'solida',cores:['#1f9d55'],direcao:'vertical'});
  assert.match(out[0].rotulo,/Fundo verde/);
});
test('reference: caps lock applies to all four pieces',()=>{
  const x=base();x.aj_pecas=a('todas',{nao_diz:.25,todas:.75});
  x.aj_caixa=a('maiusculas',{nao_pedido:0,maiusculas:1,minusculas:0,capitalizada:0,normal:0});
  x.aj_onde=a('tudo',{tudo:1});
  const out=interpretarAjustes(x,'agora faça todas as fontes mudarem para caps lock','fontes',null);
  assert.equal(out.length,1);assert.equal(out[0].id,'caixa|site+posts+email+anuncios|tudo');
  assert.equal(out[0].valor,'maiusculas');assert.match(out[0].rotulo,/Caixa alta em todas as peças/);
});
test('reference: green to white gradient defaults vertical',()=>{
  const x=base();x.aj_pecas=a('site',{nao_diz:0,site:1});
  x.aj_fundo=a('degrade',{nao_pedido:0,solida:0,degrade:1,escurecer:0,clarear:0});
  x.aj_cor1=a('verde',{nenhuma:0,verde:1});x.aj_cor2=a('branco',{nenhuma:0,branco:1});
  const out=interpretarAjustes(x,'agora insira degradê verde e branco no background','site',null);
  assert.equal(out.length,1);assert.equal(out[0].id,'fundo|site|pagina');
  assert.deepEqual(out[0].valor,{tipo:'degrade',cores:['#1f9d55','#ffffff'],direcao:'vertical'});
  assert.match(out[0].rotulo,/degradê verde → branco/);
});
test('explicit hex wins for background color',()=>{
  const x=base();x.aj_fundo=a('solida',{nao_pedido:0,solida:1});x.aj_cor1=a('verde_escuro',{nenhuma:.34,verde_escuro:.66});
  const out=interpretarAjustes(x,'muda o fundo para #1a7f3c','site',null);
  assert.equal(out[0].valor.cores[0],'#1a7f3c');
});
test('written foreground/background colors are assigned by role',()=>{
  const colors=lerCores('fundo preto com letras brancas');
  assert.deepEqual(colors.map(c=>[c.hex,c.papel]),[['#111111','fundo'],['#ffffff','texto']]);
});
test('mode returns ajuste or ambos according to Jev mode probabilities',()=>{
  const ajuste=[{id:'x'}];
  assert.equal(modoDoComando({tipo:'comando_de_edicao',answers:{aj_modo:a('ajuste',{ajuste:.9,ambos:0,biblioteca:.1,nenhum:0})},ajustes:ajuste,temBiblioteca:true}),'ajuste');
  assert.equal(modoDoComando({tipo:'comando_de_edicao',answers:{aj_modo:a('ambos',{ajuste:0,ambos:.7,biblioteca:.2,nenhum:.1})},ajustes:ajuste,temBiblioteca:true}),'ambos');
});
