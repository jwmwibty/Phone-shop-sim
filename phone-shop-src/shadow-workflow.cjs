const {chromium}=require('/home/user/node_modules/playwright');const assert=require('assert');
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1000,height:600}});const errs=[];p.on('pageerror',e=>errs.push(e.stack));await p.addInitScript(()=>window.requestAnimationFrame=()=>1);await p.goto('http://127.0.0.1:4173/');
const result=await p.evaluate(()=>{
 const flags=[],real=renderer.render.bind(renderer);renderer.render=(s,c)=>{flags.push(renderer.shadowMap.needsUpdate);return real(s,c)};
 let now=performance.now()+100;const frame=()=>{now+=16;animate(now)};frame();frame();
 const shelf=shelves[0],sx=Math.round((shelf.pos.x-NAV_X0)/NAV_STEP),sz=Math.round((shelf.pos.z-NAV_Z0)/NAV_STEP),id=gridIndex(sx,sz);
 let occupied=getStaticNavGrid()[id];startFurniture(shelf.type,shelf);const carrying=getStaticNavGrid()[id];frame();
 cancelFurniturePlacement();const restored=getStaticNavGrid()[id];frame();
 startFurniture(shelf.type,shelf);let valid=false;
 for(const yaw of [0,Math.PI/2,-Math.PI/2,Math.PI]){for(let x=-5.5;x<=6&&!valid;x+=.5)for(let z=-5.5;z<=5&&!valid;z+=.5){if(worldBlocked(x,z))continue;player.pos.set(x,.08,z);player.angle=yaw+Math.PI;cameraYaw=yaw;updateFurniture(.01);valid=placementValid;}if(valid)break;}
 if(valid)placeFurniture();frame();
 const revBeforeExpand=navRevision;applyStoreExpansion();getStaticNavGrid();frame();
 renderer.render=real;
 return {flags,occupied,carrying,restored,valid,revBeforeExpand,revAfter:navRevision,cacheRev:cachedNavRevision,rightWall:shell.rightWall.position.x,sceneCount:shelves.length};
});
console.log(result);assert.deepStrictEqual(result.flags,[true,false,true,true,true,true]);assert.deepStrictEqual([result.occupied,result.carrying,result.restored],[1,0,1]);assert(result.valid&&result.revAfter>result.revBeforeExpand&&result.cacheRev===result.revAfter&&result.rightWall===10.7);assert.deepStrictEqual(errs,[]);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
