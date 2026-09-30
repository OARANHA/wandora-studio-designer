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
function palette(decisions={}){
  const key=choice(decisions?.marca?.paleta);
  const maps={
    rock:['#141414','#e23b2e','#f4efd9','#86867f','#f4c430'], luxo:['#0f0f10','#c7a45b','#f5f0e5','#5d5d61','#2a2117'],
    corporativo:['#16385c','#f7fafc','#6aa6d8','#1c2530','#d9e5ef'], neon:['#25272b','#c9ff27','#f7f7f0','#3c65ff','#ff4d8e'],
    mono:['#111111','#f7f7f4','#777777','#d8d8d2','#2f2f2f'], tropical:['#236f53','#f28d35','#e65771','#f3cf45','#f5f1de'],
    lavanda:['#a89cc8','#dbe2ea','#f5f1f7','#5c5870','#cad6c9'], terra:['#8f432d','#c68b59','#e8d6b7','#5f6b48','#2e2924'],
  };
  return maps[key] || maps.mono;
}
function brandName(project,copy){ return clean(get(copy,'brand.name'), project?.clientName || project?.name || 'Nova Marca'); }
function slogan(copy){ return clean(get(copy,'brand.slogan'),'Uma marca feita para ser lembrada.'); }
function headline(copy){ return clean(get(copy,'site.headline'),'Uma experiência feita para o seu próximo passo.'); }
function subheadline(copy){ return clean(get(copy,'site.subheadline'),'Estratégia, identidade e comunicação reunidas em uma experiência consistente.'); }

export function buildSiteHtml({project,decisions={},copy={}}={}){
  const p=palette(decisions), name=brandName(project,copy), title=headline(copy), sub=subheadline(copy);
  const about=clean(copy.about,'Uma marca com direção clara, presença consistente e foco no que realmente importa para o cliente.');
  const posts=['presentation','sales','relationship'].map(k=>clean(get(copy,`posts.${k}.title`),'Conteúdo que aproxima'));
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(name)}</title>
<style>:root{--p1:${p[0]};--p2:${p[1]};--p3:${p[2]};--p4:${p[3]};--p5:${p[4]}}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Inter,Arial,sans-serif;background:var(--p3);color:var(--p1)}a{color:inherit}.wrap{width:min(1120px,calc(100% - 40px));margin:auto}.nav{display:flex;justify-content:space-between;align-items:center;padding:22px 0;font-weight:800}.nav span{opacity:.65;font-size:13px}.hero{min-height:72vh;display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center}.hero h1{font-size:clamp(44px,8vw,96px);line-height:.92;letter-spacing:-.055em;margin:14px 0}.hero p{font-size:clamp(17px,2vw,22px);line-height:1.55;max-width:680px}.cta{display:inline-block;margin-top:18px;background:var(--p2);color:var(--p3);padding:15px 22px;border-radius:999px;text-decoration:none;font-weight:900}.art{aspect-ratio:1;border-radius:34px;background:radial-gradient(circle at 30% 30%,var(--p5),transparent 35%),linear-gradient(135deg,var(--p2),var(--p4));box-shadow:0 30px 80px #0002;transform:rotate(2deg)}section{padding:76px 0;border-top:1px solid color-mix(in srgb,var(--p1) 18%,transparent)}h2{font-size:clamp(30px,5vw,54px);margin:0 0 24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{padding:28px;border:1px solid color-mix(in srgb,var(--p1) 16%,transparent);border-radius:22px;background:color-mix(in srgb,var(--p3) 88%,white)}.card b{display:block;font-size:22px;margin-bottom:10px}.band{background:var(--p1);color:var(--p3)}.band .wrap{padding-top:76px;padding-bottom:76px}.footer{padding:36px 0;font-size:13px;opacity:.7}@media(max-width:760px){.hero{grid-template-columns:1fr;min-height:auto;padding:60px 0}.art{max-width:440px}.grid{grid-template-columns:1fr}}</style></head>
<body><header class="wrap nav"><strong>${esc(name)}</strong><span>SOBRE · SERVIÇOS · CONTATO</span></header>
<main><section class="wrap hero"><div><small>${esc(slogan(copy))}</small><h1>${esc(title)}</h1><p>${esc(sub)}</p><a class="cta" href="#contato">Falar com a equipe</a></div><div class="art" aria-hidden="true"></div></section>
<section><div class="wrap"><h2>Uma marca inteira, não peças soltas.</h2><div class="grid"><article class="card"><b>Identidade</b><span>Logo, paleta e tipografia trabalhando como sistema.</span></article><article class="card"><b>Experiência</b><span>Mensagem e navegação coerentes do primeiro contato à conversão.</span></article><article class="card"><b>Conteúdo</b><span>Redes, e-mail e mídia seguindo a mesma direção.</span></article></div></div></section>
<section class="band"><div class="wrap"><h2>${esc(about)}</h2></div></section>
<section><div class="wrap"><h2>Conteúdo que mantém a marca viva.</h2><div class="grid">${posts.map((t,i)=>`<article class="card"><b>0${i+1}</b><span>${esc(t)}</span></article>`).join('')}</div></div></section>
<section id="contato"><div class="wrap"><h2>${esc(slogan(copy))}</h2><p>${esc(sub)}</p><a class="cta" href="mailto:contato@exemplo.com.br">Entrar em contato</a></div></section></main>
<footer class="wrap footer">${esc(name)} · criado no Wandora Studio Designer</footer></body></html>`;
}
export function buildSignatureHtml({project,copy={}}={}){
  const name=brandName(project,copy), person=clean(get(copy,'email.signature'),'Equipe de atendimento');
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#1f2024"><tr><td style="padding-right:14px;border-right:3px solid #1f2024"><strong style="font-size:20px">${esc(name)}</strong></td><td style="padding-left:14px"><div style="font-weight:700">${esc(person)}</div><div style="font-size:12px;color:#666;margin-top:4px">Relacionamento e atendimento</div></td></tr></table>`;
}
export function buildEmailHtml({project,decisions={},copy={}}={}){
  const p=palette(decisions), name=brandName(project,copy), subject=clean(get(copy,'email.subject'),'Uma novidade para você'), pre=clean(get(copy,'email.preheader'),'Uma mensagem criada especialmente para você.'), body=clean(get(copy,'email.preview'),subheadline(copy));
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head><body style="margin:0;background:#f1f1ee"><div style="display:none;max-height:0;overflow:hidden">${esc(pre)}</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f1ee"><tr><td align="center" style="padding:32px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-collapse:collapse"><tr><td style="padding:24px 28px;background:${p[0]};color:${p[2]};font-family:Arial,sans-serif;font-weight:800">${esc(name)}</td></tr><tr><td style="padding:46px 34px;font-family:Arial,sans-serif;color:#1f2024"><div style="font-size:13px;color:#666;margin-bottom:10px">${esc(pre)}</div><h1 style="font-size:38px;line-height:1.05;margin:0 0 18px">${esc(subject)}</h1><p style="font-size:17px;line-height:1.6;margin:0 0 26px">${esc(body)}</p><a href="#" style="display:inline-block;background:${p[1]};color:${p[2]};padding:13px 20px;text-decoration:none;font-weight:800;border-radius:6px">Saiba mais</a></td></tr><tr><td style="padding:28px 34px;border-top:1px solid #eee">${buildSignatureHtml({project,copy})}</td></tr></table></td></tr></table></body></html>`;
}
export function buildAdsHtml({project,decisions={},copy={}}={}){
  const p=palette(decisions), name=brandName(project,copy), head=clean(get(copy,'ads.headline'),headline(copy));
  const sizes=[[300,250],[728,90],[160,600],[300,600],[320,50],[970,250]];
  const cards=sizes.map(([w,h],i)=>`<section><h2>${w}×${h}</h2><div class="ad" style="width:${w}px;height:${h}px"><small>${esc(name)}</small><strong>${esc(head)}</strong><span>Saiba mais</span></div></section>`).join('');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kit de anúncios · ${esc(name)}</title><style>:root{--p1:${p[0]};--p2:${p[1]};--p3:${p[2]}}*{box-sizing:border-box}body{margin:0;padding:28px;font-family:Arial,sans-serif;background:#efefec;color:#222}section{overflow:auto;margin:0 0 32px;padding-bottom:10px}h2{font:700 13px ui-monospace,monospace}.ad{position:relative;overflow:hidden;padding:8%;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,var(--p1),var(--p2));color:var(--p3);border:1px solid #0002}.ad:after{content:'';position:absolute;width:45%;aspect-ratio:1;border-radius:50%;background:var(--p3);opacity:.12;right:-10%;top:-20%}.ad small{font-weight:800;letter-spacing:.08em}.ad strong{font-size:clamp(14px,4cqw,42px);line-height:.95;margin:8px 0;max-width:82%}.ad span{font-size:12px;font-weight:800}</style></head><body><h1>Kit de banners · ${esc(name)}</h1>${cards}</body></html>`;
}
export function buildProjectJson({project,decisions={},copy={},locks={},history=[]}={}){
  return JSON.stringify({schema:1,exportedAt:new Date().toISOString(),project:project||null,decisions,copy,locks,history},null,2);
}
