const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function ranked(answer){
  return Object.entries(answer?.probabilities||{}).map(([id,p])=>[id,Number(p)||0]).sort((a,b)=>b[1]-a[1]);
}
function candidates(answer){
  const all=ranked(answer); if(all.length<2)return {all,eligible:[],alternatives:[],bestAlternative:0};
  const top=all[0][1];
  const eligible=all.filter(([,p],i)=>i===0||(p>=0.05&&p>=top*0.08)).slice(0,5);
  const alternatives=eligible.filter(([id])=>id!==answer.choice);
  return {all,eligible,alternatives,bestAlternative:alternatives[0]?.[1]||0};
}
function weightedPick(options,rng){
  const weighted=options.map(([id,p])=>[id,p,Math.pow(Math.max(p,1e-9),1/1.25)]);
  const total=weighted.reduce((n,x)=>n+x[2],0); let x=rng()*total;
  for(const item of weighted){x-=item[2];if(x<=0)return item;}
  return weighted.at(-1);
}
function freeEntries(decisions,lockedIds){
  const out=[];
  for(const [group,answers] of Object.entries(decisions||{})){
    if(group==='entender')continue;
    for(const [id,answer] of Object.entries(answers||{})){
      if(lockedIds.has(id)||answer?.type!=='choice'||!answer.probabilities)continue;
      const c=candidates(answer); if(!c.alternatives.length)continue;
      out.push({group,id,answer,...c,strength:c.bestAlternative});
    }
  }
  return out;
}
export function sampleGoodVariants(decisions,{lockedIds=[],rng=Math.random,minChanges=4}={}){
  const next=structuredClone(decisions||{}), locks=new Set(lockedIds), pool=freeEntries(next,locks), chosen=new Map();
  for(const item of pool){
    const chance=clamp(0.2+item.bestAlternative*1.5,0.2,0.8);
    if(rng()<chance){
      const picked=weightedPick(item.alternatives,rng);
      if(picked)chosen.set(item.id,{item,picked});
    }
  }
  if(chosen.size<Math.min(minChanges,pool.length)){
    const strongest=pool.slice().sort((a,b)=>b.strength-a.strength);
    for(const item of strongest){
      if(chosen.has(item.id))continue;
      const picked=weightedPick(item.alternatives,rng);
      if(picked)chosen.set(item.id,{item,picked});
      if(chosen.size>=Math.min(minChanges,pool.length))break;
    }
  }
  const changes=[];
  for(const {item,picked} of chosen.values()){
    const [to,prob]=picked, from=item.answer.choice;
    next[item.group][item.id]={...next[item.group][item.id],choice:to};
    const rank=item.all.findIndex(([id])=>id===to)+1;
    changes.push({group:item.group,id:item.id,from,to,prob,rank,top:item.all[0]?.[0]||from});
  }
  changes.sort((a,b)=>b.prob-a.prob);
  return {decisions:next,changes};
}
export function restoreJevChoices(decisions){
  const next=structuredClone(decisions||{}); let count=0;
  for(const answers of Object.values(next)){
    for(const answer of Object.values(answers||{})){
      if(answer?.type!=='choice'||!answer.probabilities)continue;
      const top=ranked(answer)[0]?.[0]; if(top&&answer.choice!==top){answer.choice=top;count+=1;}
    }
  }
  return {decisions:next,count};
}
export function secondChoice(answer){
  const all=ranked(answer); const current=answer?.choice;
  const second=all.find(([id])=>id!==current);
  return second?{id:second[0],prob:second[1],rank:all.findIndex(([id])=>id===second[0])+1}:null;
}
