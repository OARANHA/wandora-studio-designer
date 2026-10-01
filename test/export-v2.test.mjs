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


test('story-only media planning does not blank the site hero',()=>{
  const html=buildSiteHtml({
    project:{name:'Academia'},
    decisions:{},
    copy:{},
    v2:{
      siteStructure:{hero:{enabled:false,variant:'split'},sections:[]},
      studioContext:{
        business:{segmentLabel:'Academia'},
        briefingFacts:{palette:['#d62828','#2563eb','#f7f7f4','#111111','#7d4c98']},
        site:{
          heroDecision:'cinema',
          heroComposition:'hero-full-background',
          headline:'O seu próximo nível começa aqui.',
          subheadline:'Academia com foco em experiência.',
          cta:'Agendar aula experimental',
          sections:['features','pricing','gallery','faq','location','cta'],
          content:{itemsTitle:'Treinos e planos',items:[['Musculação','Força e constância.']],desc:'Treino com energia.'},
        },
        copyFallback:{brand:{name:'Academia',slogan:'Energia que move você.'},site:{headline:'O seu próximo nível começa aqui.',subheadline:'Academia com foco em experiência.',cta:'Agendar aula experimental'}},
      },
      creativePlan:{deliverables:['stories'],site:{hero:{assetSlot:null}},assets:[]},
    },
  });
  assert.match(html,/hero--full_background/);
  assert.match(html,/O seu próximo nível começa aqui/);
  assert.match(html,/Treinos e planos/);
  assert.match(html,/Galeria/);
  assert.match(html,/Agendar aula experimental/);
});
