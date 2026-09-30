import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWriterMessages, parseWriterFields, writerComplete, WRITER_FIELDS } from '../src/ai/writer.mjs';

test('writer parses the canonical 11 fields', () => {
  const raw=[
    'TITULO: Uma marca para lembrar.',
    'SUBTITULO: Estratégia clara, presença forte e uma experiência coerente.',
    'SOBRE: Criamos com atenção aos detalhes e construímos relações duradouras.',
    'LEGENDA1: Conheça nossa história. Vem com a gente!',
    'LEGENDA2: Uma oferta feita para agora. Chama no WhatsApp!',
    'LEGENDA3: Informação útil para salvar e compartilhar. Salva este post!',
    'ASSUNTO: Tem novidade esperando por você.',
    'PREHEADER: Descubra o que preparamos sem repetir o assunto.',
    'EMAIL: Que bom ter você por aqui. Preparamos uma experiência simples e direta.',
    'ANUNCIO: Conheça a novidade hoje.',
    'SLOGAN: Simples, forte e do seu jeito.',
  ].join('\n');
  const fields=parseWriterFields(raw);
  assert.equal(Object.keys(fields).length,11);
  assert.equal(writerComplete(fields),true);
  assert.deepEqual(Object.keys(fields).sort(),[...WRITER_FIELDS].sort());
  assert.equal(fields.titulo,'Uma marca para lembrar');
  assert.equal(fields.anuncio,'Conheça a novidade hoje');
});

test('writer prompt carries Jev decisions without inventing business facts', () => {
  const decisoes={
    entender:{seg:{type:'choice',choice:'tecnologia'},pers:{type:'choice',choice:'moderna'},pub:{type:'choice',choice:'empresas'},obj:{type:'choice',choice:'leads'},preco:{type:'score',score:.5},dif:{type:'choice',choice:'confianca'},oferta:{type:'choice',choice:'diagnostico'},emoji:{type:'score',score:.2}},
    site:{cta:{type:'choice',choice:'especialista'}},
    posts:{p1_fmt:{type:'choice',choice:'apresentacao'},p1_hook:{type:'choice',choice:'conheca'},p2_fmt:{type:'choice',choice:'oferta'},p2_hook:{type:'choice',choice:'motivos'},p3_fmt:{type:'choice',choice:'dicas'},p3_hook:{type:'choice',choice:'salva'}},
    email:{em_tipo:{type:'choice',choice:'boas_vindas'},em_assunto:{type:'choice',choice:'feliz'}},
    anuncios:{ad_conceito:{type:'choice',choice:'marca'},ad_titulo:{type:'choice',choice:'marca1'}},
  };
  const messages=buildWriterMessages({texto:'Tenho uma empresa de tecnologia B2B.',decisoes});
  assert.equal(messages.length,2);
  assert.match(messages[0].content,/redator publicitário brasileiro/i);
  assert.match(messages[1].content,/não invente nome ou cidade/i);
  assert.match(messages[1].content,/TITULO: até 60/);
  assert.match(messages[1].content,/SLOGAN: até 45/);
});
