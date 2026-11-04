// Critic run 33: every critic/c33_*.json with a c32_ twin, compared with shots and timings stripped.
const fs=require('fs');const strip=o=>JSON.stringify(o,(k,v)=>/shot|[mM]s$|time|fps|wallS|totalS|p95|p99|worst|maxGap|frames|elapsed|bootMs|^ms$/i.test(k)?undefined:v);
const same=[],diff=[];
for (const f of fs.readdirSync('critic').filter(f=>/^c33_.*\.json$/.test(f))){const t='critic/'+f.replace(/^c33_/,'c32_'); if(!fs.existsSync(t)) continue; (strip(JSON.parse(fs.readFileSync('critic/'+f)))===strip(JSON.parse(fs.readFileSync(t)))?same:diff).push(f);}
console.log('identical',same.length,same.join(' '));console.log('differ',diff.length,diff.join(' '));
