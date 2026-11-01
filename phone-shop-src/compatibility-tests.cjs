const {chromium}=require('/home/user/node_modules/playwright');const assert=require('assert');
(async()=>{const b=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:844,height:390},hasTouch:true,isMobile:true});const errors=[];p.on('pageerror',e=>errors.push(e.stack));await p.addInitScript(()=>window.requestAnimationFrame=()=>1);
await p.route('http://127.0.0.1:4173/old-version',r=>r.fulfill({path:'/home/user/phone-shop-src/index-before-performance.html',contentType:'text/html'}));await p.goto('http://127.0.0.1:4173/old-version');
const saved=await p.evaluate(()=>{
 sfx.enabled=false;state.money=60000;state.totalSold=7;state.totalRevenue=6650;
 purchaseStoreUpgrade(STORE_UPGRADES[0].id);purchaseLevelUpgrade('hire_stocker');purchaseLevelUpgrade('hire_cashier');
 player.pos.set(LOADING_BAY_POS.x,.08,LOADING_BAY_POS.z);for(let i=0;i<8;i++)updateGame(.05);
 player.pos.set(shelves[0].pos.x,.08,shelves[0].pos.z+1.3);for(let i=0;i<8;i++)updateGame(.05);
 timeOfDay=43;saveGame();return {money:state.money,sold:state.totalSold,revenue:state.totalRevenue,expanded:state.shopExpanded,stock:shelves.map(s=>s.items.length),stocker:!!stockerStaff,cashier:!!cashierStaff,time:timeOfDay};
});
await p.goto('http://127.0.0.1:4173/');const restored=await p.evaluate(()=>({money:state.money,sold:state.totalSold,revenue:state.totalRevenue,expanded:state.shopExpanded,stock:shelves.map(s=>s.items.length),stocker:!!stockerStaff,cashier:!!cashierStaff,time:timeOfDay,defaultExposure:renderer.toneMappingExposure,rightWall:shell.rightWall.position.x}));
assert.deepStrictEqual({...restored,defaultExposure:undefined,rightWall:undefined},{...saved,defaultExposure:undefined,rightWall:undefined});assert.strictEqual(restored.defaultExposure,.72);assert.strictEqual(restored.rightWall,10.7);
// Orientation changes must release an in-progress thumbstick, rather than leaving a stuck finger.
const pointer=await p.evaluate(()=>{const s=document.getElementById('input-surface');function ev(type,id,x,y){s.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:x,clientY:y}));}ev('pointerdown',77,80,250);ev('pointermove',77,80,205);return {before:input.joyVec.length(),id:movePointer};});assert(pointer.before>.5&&pointer.id===77);
await p.setViewportSize({width:390,height:844});const released=await p.evaluate(()=>({blocked:orientationBlocked,movePointer,joy:input.joyVec.length()}));assert(released.blocked&&released.movePointer===null&&released.joy===0);
await p.setViewportSize({width:844,height:390});const fresh=await p.evaluate(()=>{const s=document.getElementById('input-surface');s.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:78,pointerType:'touch',clientX:80,clientY:250}));s.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerId:78,pointerType:'touch',clientX:80,clientY:215}));return {id:movePointer,joy:input.joyVec.length()}});assert(fresh.id===78&&fresh.joy>.5);
console.log('OLD_SAVE',saved,'RESTORED',restored,'POINTER_RESET',{pointer,released,fresh});assert.deepStrictEqual(errors,[]);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
