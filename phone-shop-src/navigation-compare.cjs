const {chromium}=require('/home/user/node_modules/playwright');const assert=require('assert');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await browser.newContext({viewport:{width:1000,height:600}});await ctx.addInitScript(()=>window.requestAnimationFrame=()=>1);
 const pages=[];for(const url of ['file:///home/user/phone-shop-src/index-before-performance.html','http://127.0.0.1:4173/']){const p=await ctx.newPage();await p.goto(url);pages.push(p)}
 let seed=123456;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 const pairs=Array.from({length:700},()=>[-5.9+rand()*12.3,-5.3+rand()*10.3,-5.9+rand()*12.3,-5.3+rand()*10.3]);
 async function run(page){return await page.evaluate(pairs=>{
  const valid=pairs.filter(p=>!worldBlocked(p[0],p[1])&&!worldBlocked(p[2],p[3]));
  const t=performance.now(), results=valid.map(p=>{const a=new THREE.Vector3(p[0],.08,p[1]),b=new THREE.Vector3(p[2],.08,p[3]);const path=navPath(a,b,player,false);return {steps:path.length,goal:path.length?[path[path.length-1].x,path[path.length-1].z]:null}});
  return {ms:performance.now()-t,valid:valid.length,results};
 },pairs)}
 const old=await run(pages[0]),modern=await run(pages[1]);assert.strictEqual(old.valid,modern.valid);let match=0,oldOnly=0,newOnly=0;
 old.results.forEach((v,i)=>{const w=modern.results[i];if(!!v.steps===!!w.steps)match++;else if(v.steps)oldOnly++;else newOnly++;});
 console.log({cases:old.valid,reachableAgreement:match,oldOnly,newOnly,oldMs:old.ms,newMs:modern.ms});assert.strictEqual(oldOnly,0,'new pathfinder lost routes');
 const expansion=await pages[1].evaluate(()=>{const p=new THREE.Vector3(5,.08,-3);getStaticNavGrid();const old=cachedNavRevision;applyStoreExpansion();getStaticNavGrid();return {old,new:cachedNavRevision,navRevision,wall:shell.rightWall.position.x}});
 console.log('EXPANDED_CACHE',expansion);assert(expansion.new>expansion.old&&expansion.new===expansion.navRevision);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
