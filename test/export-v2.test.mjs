import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSiteHtml, buildProjectJson } from '../public/export.mjs';

test('V2 site export follows structural hero and sections',()=>{
  const html=buildSiteHtml({
    project:{name:'Marca Teste'},
    copy:{site:{headline:'Título forte',subheadline:'Subtexto'},brand:{slogan:'Slogan'}},
    decisions:{},
    v2:{siteStructure:{hero:{enabled:false,variant:'split'},sections:['faq','cta']}},
  });
  assert.doesNotMatch(html,/class="wrap hero/);
  assert.match(html,/Perguntas frequentes/);
  assert.match(html,/PRÓXIMO PASSO/);
});

test('V2 project JSON carries routing and V2 state',()=>{
  const raw=buildProjectJson({
    project:{id:'p1',name:'Teste'},
    v2:{kitStatus:'ready',materials:['site']},
    modelRouting:{mode:'auto',selections:{}},
  });
  const data=JSON.parse(raw);
  assert.equal(data.schema,2);
  assert.equal(data.v2.kitStatus,'ready');
  assert.equal(data.modelRouting.mode,'auto');
});
