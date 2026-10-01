const esc = (v='') => String(v ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const choice = (a) => a?.choice ?? '';
const clean = (v, fallback='') => String(v || fallback).trim();
const get = (obj,path,fallback='') => path.split('.').reduce((cur,k)=>cur?.[k],obj) || fallback;

export function slugify(value='studio'){
  const slug=String(value||'studio').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72);
  return slug || 'studio';
}
export function downloadText(filename,text,type='text/plain;charset=utf-8'){
  const blob=new Blob([text],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download=filename; a.hidden=true;
  document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);
}
function palette(decisions={},v2={}){
  const explicit=v2?.studioContext?.briefingFacts?.palette||v2?.briefingFacts?.palette||v2?.creativePlan?.brand?.palette;
  if(Array.isArray(explicit)&&explicit.length>=5&&explicit.every(x=>/^#[0-9a-f]{6}$/i.test(String(x||''))))return explicit.slice(0,5);
  const key=choice(decisions?.marca?.paleta);
  const maps={
    rock:['#141414','#e23b2e','#f4efd9','#86867f','#f4c430'],
    terra:['#8f432d','#c68b59','#e8d6b7','#5f6b48','#2e2924'],
    italiano:['#b5252a','#39704a','#f4efd9','#d5b55c','#222222'],
    nude:['#e9d2c3','#c99c8f','#f7efe8','#7d5a4f','#b78d55'],
    luxo:['#0f0f10','#c7a45b','#f5f0e5','#5d5d61','#2a2117'],
    vinho:['#6c1d32','#efe4cf','#b99c66','#292122','#9d6b75'],
    salvia:['#7c8f79','#e7e0cf','#b69371','#394237','#c9bca8'],
    menta:['#8fd3b4','#f7f6ee','#f19b89','#254e45','#d5e7de'],
    tropical:['#236f53','#f28d35','#e65771','#f3cf45','#f5f1de'],
    cafe:['#4a3026','#d0a267','#f4e7d2','#8b5e3c','#1f1815'],
    pastel:['#b9a4dc','#f2c6d6','#b9dfd2','#f4d7a8','#fffaf1'],
    candy:['#f05f9d','#f4d64a','#67c8e5','#a986d9','#fff8ed'],
    clinico:['#77b8df','#f8fbfc','#d7eef7','#2e5e75','#b9d9e8'],
    lavanda:['#a89cc8','#dbe2ea','#f5f1f7','#5c5870','#cad6c9'],
    corporativo:['#16385c','#f7fafc','#6aa6d8','#1c2530','#d9e5ef'],
    noite:['#111827','#c7a45b','#f5f2e8','#2d3f62','#6e5d40'],
    floresta:['#244b39','#f2ecdd','#7a8c68','#342b23','#b9a47a'],
    neon:['#25272b','#c9ff27','#f7f7f0','#3c65ff','#ff4d8e'],
    criativo:['#6f3cc3','#f2c94c','#ff6b6b','#f8f5ef','#2d2440'],
    coral:['#126f78','#ff7d6c','#f8f2df','#173f45','#f4b36b'],
    energia:['#f26b2d','#171717','#f7f1da','#ffc72c','#8d2c16'],
    amarelo:['#f4c430','#171717','#f7f1da','#696969','#fff2a6'],
    pink:['#f24f9b','#171717','#f7e8f2','#9f2a67','#f29fc7'],
    mediterraneo:['#164e9b','#f8f6ef','#f4d34f','#75b7d9','#d9b16d'],
    retro:['#cb6d38','#c79a2b','#6e4b31','#f0dcc0','#2c514c'],
    mono:['#111111','#f7f7f4','#777777','#d8d8d2','#2f2f2f'],
  };
  return maps[key] || maps.mono;
}
function contextCopy(v2,path,fallback=''){
  let cur=v2?.studioContext?.copyFallback;
  for(const k of path.split('.'))cur=cur?.[k];
  return clean(cur,fallback);
}
function brandName(project,copy,v2={},decisions={}){ const canonical=contextCopy(v2,'brand.name',''); const planned=clean(v2?.creativePlan?.business?.label).split('/')[0].trim(); const seg=clean(choice(decisions?.entender?.seg)).replaceAll('_',' '); return clean(get(copy,'brand.name'), project?.clientName || canonical || planned || seg || 'Sua marca'); }
function slogan(copy,v2={}){ return clean(get(copy,'brand.slogan'),contextCopy(v2,'brand.slogan','Uma marca feita para ser lembrada.')); }
function headline(copy,v2={}){ return clean(get(copy,'site.headline'),contextCopy(v2,'site.headline','Uma experiência feita para o seu próximo passo.')); }
function subheadline(copy,v2={}){ return clean(get(copy,'site.subheadline'),contextCopy(v2,'site.subheadline','Estratégia, identidade e comunicação reunidas em uma experiência consistente.')); }
function creativeAsset(v2={},slot=''){
  const assets=v2?.creativePlan?.assets;
  return Array.isArray(assets)?assets.find(a=>a?.slot===slot&&a?.assetId):null;
}
function creativeAssetUrl(project,v2={},slot=''){
  const a=creativeAsset(v2,slot); if(!a)return '';
  if(typeof a.contentUrl==='string'&&a.contentUrl.startsWith('/api/projects/'))return a.contentUrl;
  const projectId=project?.id||v2?.creativePlan?.projectId;
  return projectId?`/api/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(a.assetId)}/content`:'';
}

export function buildSiteHtml({project,decisions={},copy={},v2={}}={}){
  const p=palette(decisions,v2), name=brandName(project,copy,v2,decisions), title=headline(copy,v2), sub=subheadline(copy,v2);
  const businessLabel=clean(v2?.studioContext?.business?.segmentLabel,v2?.creativePlan?.business?.label||'negócio');
  const about=clean(copy.about,`Conheça uma experiência de ${businessLabel.toLowerCase()} pensada para unir clareza, confiança e um atendimento consistente.`);
  const posts=['presentation','sales','relationship'].map(k=>clean(get(copy,`posts.${k}.title`),contextCopy(v2,`posts.${k}.title`,'Conteúdo que aproxima')));
  const galleryAssets=['stories.01','stories.02','stories.03'].map(slot=>creativeAssetUrl(project,v2,slot)).filter(Boolean);
  const structure=v2?.siteStructure||{hero:{enabled:true,variant:'split'},sections:[]};
  const heroEnabled=structure.hero?.enabled!==false, heroVariant=clean(structure.hero?.variant,'split');
  const heroSlot=v2?.creativePlan?.site?.hero?.assetSlot||'site.hero';
  const heroImageUrl=creativeAssetUrl(project,v2,heroSlot);
  const chosen=(structure.sections||[]).length?structure.sections:['benefits','proof','features','cta'];
  const card=(title,body)=>`<article class="card"><b>${esc(title)}</b><span>${esc(body)}</span></article>`;
  const sectionHtml=(id)=>{
    if(id==='benefits')return `<section><div class="wrap"><small>POR QUE ESCOLHER</small><h2>Uma experiência pensada nos detalhes.</h2><div class="grid">${card('Atendimento','Um contato claro e próximo para entender o que você procura.')}${card('Qualidade','Uma apresentação cuidadosa do serviço, produto ou solução.')}${card('Experiência','Do primeiro contato ao próximo passo, tudo deve ser simples de entender.')}</div></div></section>`;
    if(id==='proof')return `<section class="proof"><div class="wrap"><small>CONFIANÇA</small><h2>Confiança se constrói em cada detalhe.</h2><div class="grid">${card('Clareza','Informação objetiva para ajudar na decisão.')}${card('Cuidado','Uma experiência coerente em cada ponto de contato.')}${card('Consistência','A mesma atenção do início ao atendimento.')}</div></div></section>`;
    if(id==='features')return `<section><div class="wrap"><small>SERVIÇOS / SOLUÇÕES</small><h2>Descubra o que pode fazer sentido para você.</h2><div class="grid">${posts.map((t,i)=>card(`0${i+1}`,t)).join('')}</div></div></section>`;
    if(id==='process')return `<section><div class="wrap"><small>COMO FUNCIONA</small><h2>Um caminho simples até o próximo passo.</h2><div class="grid">${card('01','Conte o que você precisa e tire suas principais dúvidas.')}${card('02','Conheça as opções adequadas ao seu momento.')}${card('03','Escolha com clareza como deseja continuar.')}</div></div></section>`;
    if(id==='gallery'){
      const items=galleryAssets.length
        ? galleryAssets.map(src=>`<figure><img src="${esc(src)}" alt=""></figure>`).join('')
        : '<i></i><i></i><i></i>';
      return `<section><div class="wrap"><small>GALERIA</small><h2>Conheça mais de perto.</h2><div class="gallery">${items}</div></div></section>`;
    }
    if(id==='pricing')return `<section><div class="wrap"><small>OPÇÕES</small><h2>Encontre o próximo passo que combina com você.</h2><div class="grid">${card('Conheça','Veja as opções disponíveis.')}${card('Compare','Entenda diferenças e encontre a melhor alternativa para sua necessidade.')}${card('Converse','Fale com a equipe antes de decidir.')}</div></div></section>`;
    if(id==='faq')return `<section><div class="wrap"><small>FAQ</small><h2>Perguntas frequentes.</h2><div class="faq"><details open><summary>Como posso saber qual opção é mais adequada?</summary><p>Conte sua necessidade para que o atendimento possa orientar o próximo passo.</p></details><details><summary>Posso tirar dúvidas antes de decidir?</summary><p>Sim. Use o canal de contato da empresa para conversar antes de avançar.</p></details><details><summary>Como começo?</summary><p>Entre em contato e explique o que você procura.</p></details></div></div></section>`;
    if(id==='lead')return `<section id="contato"><div class="wrap"><small>CONTATO</small><h2>Vamos conversar?</h2><p>${esc(sub)}</p><a class="cta" href="#">Falar com a equipe</a></div></section>`;
    if(id==='cta')return `<section class="band" id="contato"><div class="wrap"><small>PRÓXIMO PASSO</small><h2>${esc(slogan(copy,v2))}</h2><p>${esc(sub)}</p><a class="cta cta-light" href="#">Entrar em contato</a></div></section>`;
    if(id==='footer')return `<section class="prefooter"><div class="wrap"><strong>${esc(name)}</strong><span>SOBRE · SERVIÇOS · CONTATO</span></div></section>`;
    return '';
  };
  const heroMedia=heroImageUrl?`<div class="art art--media" aria-hidden="true"><img src="${esc(heroImageUrl)}" alt=""></div>`:`<div class="art" aria-hidden="true"><b>W</b><i></i><i></i></div>`;
  const hero=heroEnabled?`<section class="wrap hero hero--${esc(heroVariant)}"><div class="hero-copy"><small>${esc(slogan(copy,v2))}</small><h1>${esc(title)}</h1><p>${esc(sub)}</p><a class="cta" href="#contato">Falar com a equipe</a></div>${heroMedia}</section>`:'';
  const body=chosen.map(sectionHtml).join('');
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title>
<style>:root{--p1:${p[0]};--p2:${p[1]};--p3:${p[2]};--p4:${p[3]};--p5:${p[4]}}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,Arial,sans-serif;background:var(--p3);color:var(--p1)}a{color:inherit}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:22px 0;font-weight:800}.nav span{opacity:.65;font-size:13px}.hero{min-height:72vh;display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center}.hero h1{font-size:clamp(44px,8vw,96px);line-height:.92;letter-spacing:-.055em;margin:14px 0}.hero p{font-size:clamp(17px,2vw,22px);line-height:1.55;max-width:680px}.hero--centered{grid-template-columns:1fr;text-align:center}.hero--centered .hero-copy{display:flex;flex-direction:column;align-items:center}.hero--centered .art{display:none}.hero--editorial h1{font-family:Georgia,serif;font-weight:500;max-width:10ch}.cta{display:inline-block;margin-top:18px;background:var(--p2);color:var(--p1);padding:15px 22px;border-radius:999px;text-decoration:none;font-weight:900}.cta-light{background:var(--p3)}.art{aspect-ratio:1;border-radius:34px;background:radial-gradient(circle at 30% 30%,var(--p5),transparent 35%),linear-gradient(135deg,var(--p2),var(--p4));box-shadow:0 30px 80px #0002;position:relative;overflow:hidden;display:grid;place-items:center}.art--media img{width:100%;height:100%;object-fit:cover;display:block}.hero--full_background{position:relative;min-height:76vh;grid-template-columns:1fr;overflow:hidden;border-radius:34px;margin-top:26px;margin-bottom:26px;color:#fff;padding:clamp(32px,7vw,84px)}.hero--full_background .art{position:absolute;inset:0;z-index:-2;border-radius:0;aspect-ratio:auto}.hero--full_background .art:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#080908dc 0%,#0809088c 46%,#08090828 78%)}.hero--full_background .hero-copy{max-width:720px}.hero--illustration .art,.hero--product .art{border-radius:28px}.hero--video .art{border-radius:28px}.art b{font-size:clamp(84px,13vw,170px);color:var(--p1);position:relative;z-index:2}.hero--mascot_right .art{border-radius:44% 44% 35% 35%;box-shadow:inset 0 0 0 18px #0002,0 30px 80px #0003}.hero--dashboard_right .art b{font:900 18px ui-monospace,monospace}.hero--dashboard_right .art b:after{content:'  KPI 98%  ↗';white-space:pre}.art i{position:absolute;border-radius:50%;background:var(--p3);width:22%;aspect-ratio:1}.art i:nth-of-type(1){right:8%;bottom:8%}.art i:nth-of-type(2){left:10%;top:9%;background:var(--p1);opacity:.3}section{padding:76px 0;border-top:1px solid color-mix(in srgb,var(--p1) 18%,transparent)}h2{font-size:clamp(30px,5vw,54px);margin:8px 0 24px}section small{font:800 11px ui-monospace,monospace;color:var(--p2);letter-spacing:.12em}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{padding:28px;border:1px solid color-mix(in srgb,var(--p1) 16%,transparent);border-radius:22px;background:color-mix(in srgb,var(--p3) 88%,white)}.card b{display:block;font-size:22px;margin-bottom:10px}.band{background:var(--p1);color:var(--p3)}.band .wrap{padding-top:30px;padding-bottom:30px}.gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.gallery i{display:block;aspect-ratio:4/3;border-radius:22px;background:linear-gradient(135deg,var(--p1),var(--p2))}.gallery figure{margin:0;aspect-ratio:4/3;border-radius:22px;overflow:hidden;background:var(--p1)}.gallery img{width:100%;height:100%;object-fit:cover;display:block}.faq{display:grid;gap:10px}.faq details{padding:18px 20px;border:1px solid color-mix(in srgb,var(--p1) 16%,transparent);border-radius:16px}.faq summary{font-weight:800;cursor:pointer}.faq p{line-height:1.5}.prefooter .wrap{display:flex;justify-content:space-between;gap:20px}.footer{padding:36px 0;font-size:13px;opacity:.7}@media(max-width:760px){.hero{grid-template-columns:1fr;min-height:auto;padding:60px 0}.art{max-width:440px}.grid,.gallery{grid-template-columns:1fr}}</style></head>
<body><header class="wrap nav"><strong>${esc(name)}</strong><span>SOBRE · SERVIÇOS · CONTATO</span></header><main>${hero}${body}</main><footer class="wrap footer">${esc(name)} · criado no Wandora Studio Designer</footer></body></html>`;
}
export function buildSignatureHtml({project,copy={},v2={},decisions={}}={}){
  const name=brandName(project,copy,v2,decisions), person=clean(get(copy,'email.signature'),'Equipe de atendimento');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#1f2024"><tr><td style="padding-right:14px;border-right:3px solid #1f2024"><strong style="font-size:20px">${esc(name)}</strong></td><td style="padding-left:14px"><div style="font-weight:700">${esc(person)}</div><div style="font-size:12px;color:#666;margin-top:4px">Relacionamento e atendimento</div></td></tr></table>`;
}
export function buildEmailHtml({project,decisions={},copy={},v2={}}={}){
  const p=palette(decisions,v2), name=brandName(project,copy,v2,decisions), subject=clean(get(copy,'email.subject'),contextCopy(v2,'email.subject','Uma novidade para você')), pre=clean(get(copy,'email.preheader'),contextCopy(v2,'email.preview','Uma mensagem criada especialmente para você.')), body=clean(get(copy,'email.preview'),contextCopy(v2,'email.preview',subheadline(copy,v2)));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head><body style="margin:0;background:#f1f1ee"><div style="display:none;max-height:0;overflow:hidden">${esc(pre)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1ee"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-collapse:collapse"><tr><td style="padding:24px 28px;background:${p[0]};color:${p[2]};font-family:Arial,sans-serif;font-weight:800">${esc(name)}</td></tr><tr><td style="padding:46px 34px;font-family:Arial,sans-serif;color:#1f2024"><div style="font-size:13px;color:#666;margin-bottom:10px">${esc(pre)}</div><h1 style="font-size:38px;line-height:1.05;margin:0 0 18px">${esc(subject)}</h1><p style="font-size:17px;line-height:1.6;margin:0 0 26px">${esc(body)}</p><a href="#" style="display:inline-block;background:${p[1]};color:${p[2]};padding:13px 20px;text-decoration:none;font-weight:800;border-radius:6px">Saiba mais</a></td></tr><tr><td style="padding:28px 34px;border-top:1px solid #eee">${buildSignatureHtml({project,copy})}</td></tr></table></td></tr></table></body></html>`;
}
export function buildAdsHtml({project,decisions={},copy={},v2={}}={}){
  const p=palette(decisions,v2), name=brandName(project,copy,v2,decisions), head=clean(get(copy,'ads.headline'),contextCopy(v2,'ads.headline',headline(copy,v2)));
  const sizes=[[300,250],[728,90],[160,600],[300,600],[320,50],[970,250]];
  const cards=sizes.map(([w,h],i)=>`<section><h2>${w}×${h}</h2><div class="ad" style="width:${w}px;height:${h}px"><small>${esc(name)}</small><strong>${esc(head)}</strong><span>Saiba mais</span></div></section>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kit de anúncios · ${esc(name)}</title><style>:root{--p1:${p[0]};--p2:${p[1]};--p3:${p[2]}}*{box-sizing:border-box}body{margin:0;padding:28px;font-family:Arial,sans-serif;background:#efefec;color:#222}section{overflow:auto;margin:0 0 32px;padding-bottom:10px}h2{font:700 13px ui-monospace,monospace}.ad{position:relative;overflow:hidden;padding:8%;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,var(--p1),var(--p2));color:var(--p3);border:1px solid #0002}.ad:after{content:'';position:absolute;width:45%;aspect-ratio:1;border-radius:50%;background:var(--p3);opacity:.12;right:-10%;top:-20%}.ad small{font-weight:800;letter-spacing:.08em}.ad strong{font-size:clamp(14px,4cqw,42px);line-height:.95;margin:8px 0;max-width:82%}.ad span{font-size:12px;font-weight:800}</style></head><body><h1>Kit de banners · ${esc(name)}</h1>${cards}</body></html>`;
}
export function buildProjectJson({project,decisions={},copy={},locks={},history=[],v2={},modelRouting={}}={}){
  return JSON.stringify({schema:2,exportedAt:new Date().toISOString(),project:project||null,decisions,copy,locks,history,v2,modelRouting},null,2);
}

export function buildBrandManualHtml({project,decisions={},copy={},v2={}}={}){
  const p=palette(decisions,v2), name=brandName(project,copy,v2,decisions), tag=slogan(copy,v2);
  const font=clean(choice(decisions?.marca?.fonte),'Tipografia definida pelo Studio');
  const logoStyle=clean(choice(decisions?.marca?.estilo),'Sistema principal');
  const icon=clean(choice(decisions?.marca?.icone),'símbolo');
  const sections=(v2?.siteStructure?.sections||[]).map(s=>esc(String(s).replaceAll('_',' '))).join(' · ') || 'hero · conteúdo · conversão';
  const swatches=p.map((color,i)=>`<article><i style="background:${esc(color)}"></i><b>${esc(color)}</b><span>${i===0?'Primária':i===1?'Acento':i===2?'Base clara':i===3?'Apoio':'Complementar'}</span></article>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Manual de Marca · ${esc(name)}</title><style>
  :root{--p1:${p[0]};--p2:${p[1]};--p3:${p[2]};--p4:${p[3]};--p5:${p[4]}}*{box-sizing:border-box}body{margin:0;background:#101110;color:#f7f5ed;font-family:Inter,Arial,sans-serif}.page{min-height:100vh;padding:7vw;display:flex;flex-direction:column;justify-content:center;border-bottom:1px solid #ffffff18}.cover{background:radial-gradient(circle at 75% 25%,var(--p2),transparent 30%),linear-gradient(135deg,var(--p1),#080808)}small{font:800 12px ui-monospace,monospace;letter-spacing:.18em;color:var(--p2);text-transform:uppercase}h1{font-size:clamp(54px,10vw,132px);line-height:.86;letter-spacing:-.07em;margin:22px 0;max-width:9ch}h2{font-size:clamp(34px,6vw,72px);letter-spacing:-.05em;margin:12px 0 28px}p{max-width:760px;font-size:clamp(16px,2vw,24px);line-height:1.5;color:#c7c8c2}.mark{width:160px;aspect-ratio:1;border-radius:34%;background:var(--p2);color:var(--p1);display:grid;place-items:center;font-size:88px;font-weight:950;box-shadow:0 22px 60px #0008}.palette{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:30px}.palette article{background:#1a1b1a;border:1px solid #ffffff17;border-radius:18px;padding:14px}.palette i{display:block;width:100%;aspect-ratio:1;border-radius:12px;margin-bottom:12px}.palette b,.palette span{display:block}.palette b{font:800 13px ui-monospace,monospace}.palette span{font-size:12px;color:#999;margin-top:5px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:25px}.card{padding:26px;background:#191a19;border:1px solid #ffffff18;border-radius:20px}.card b{font-size:24px}.card span{display:block;margin-top:10px;color:#aaa;line-height:1.5}.do{border-left:5px solid #62db86}.dont{border-left:5px solid #ef655c}@media(max-width:720px){.palette{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}}</style></head><body>
  <section class="page cover"><small>Wandora Studio Designer · Manual de Marca</small><div class="mark">${esc((name[0]||'W').toUpperCase())}</div><h1>${esc(name)}</h1><p>${esc(tag)}</p></section>
  <section class="page"><small>01 · Identidade</small><h2>Sistema visual</h2><div class="grid"><div class="card"><b>Logo</b><span>${esc(logoStyle)} · símbolo ${esc(icon)}. Preserve proporção, contraste e área livre.</span></div><div class="card"><b>Tipografia</b><span>${esc(font)}. Use hierarquia consistente entre títulos, apoio e texto corrido.</span></div></div></section>
  <section class="page"><small>02 · Cores</small><h2>Paleta oficial</h2><div class="palette">${swatches}</div></section>
  <section class="page"><small>03 · Aplicação digital</small><h2>Uma marca que funciona como sistema.</h2><p>Estrutura recomendada: ${sections}. Site, social, e-mail e anúncios devem compartilhar linguagem, contraste, tipografia e chamada para ação.</p><div class="grid"><div class="card do"><b>Faça</b><span>Mantenha paleta, margens, hierarquia e personalidade coerentes entre os canais.</span></div><div class="card dont"><b>Evite</b><span>Distorcer o logo, improvisar novas cores ou misturar estilos visuais que quebrem a identidade.</span></div></div></section>
  <section class="page"><small>04 · Voz da marca</small><h2>${esc(tag)}</h2><p>${esc(clean(copy.about,'Comunique de forma clara, reconhecível e coerente com a personalidade definida para a marca.'))}</p></section>
  </body></html>`;
}
