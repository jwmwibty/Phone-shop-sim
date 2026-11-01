const {chromium}=require('/home/user/node_modules/playwright');
const args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
(async()=>{
 const browser=await chromium.launch({headless:true,args});
 const context=await browser.newContext({viewport:{width:900,height:600}}); const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
 const staff=await page.evaluate(()=>{
   sfx.enabled=false;state.money=100000;purchaseLevelUpgrade('hire_stocker');purchaseLevelUpgrade('hire_cashier');orderSupplierDelivery('kokia',3);
   player.pos.set(5.5,.08,4.2);
   for(let i=0;i<1200;i++)updateGame(.05);
   return {sold:state.totalSold,cash:cashPileBundles.reduce((n,b)=>n+b.value,0),bay:dynamicCrates.length,shelf:shelves.map(s=>s.items.length),stocker:{mode:stockerStaff.mode,x:stockerStaff.pos.x,z:stockerStaff.pos.z,carrying:stockerStaff.carryStack.length},cashier:!!cashierStaff,customerStates:customers.map(c=>c.state)};
 });
 console.log('STAFF',staff);
 // Start a clean game for placement checks.
 await context.clearCookies(); await page.evaluate(()=>localStorage.clear());await page.reload({waitUntil:'load'});
 const place=await page.evaluate(()=>{
   sfx.enabled=false;state.money=20000;
   customers.forEach(c=>scene.remove(c.mesh));customers.length=0;customerSpawnTimer=10000;
   orderFurniture(FURNITURE[0]);player.pos.set(-4.5,.08,4.2);grabFurniture();
   let found=null;
   for(const yaw of [0,Math.PI/2,-Math.PI/2,Math.PI]){
     for(let x=-5.5;x<=6.0&&!found;x+=.5)for(let z=-5.5;z<=5&&!found;z+=.5){
       if(worldBlocked(x,z))continue;
       player.pos.set(x,.08,z);player.angle=yaw+Math.PI;cameraYaw=yaw;updateFurniture(.01);
       if(placementValid)found={x,z,yaw,px:furniturePreview.position.x,pz:furniturePreview.position.z};
     }
     if(found)break;
   }
   if(found)placeFurniture();
   const result={found,shelves:shelves.length,capacity:shelves.reduce((n,s)=>n+s.capacity,0),parcel:furnitureParcels.length,carrying:!!furnitureCarry};
   const sh=shelves[1];player.pos.set(sh.pos.x,.08,sh.pos.z+1.8);cameraYaw=0;cameraPitch=-.5;camera.position.set(player.pos.x,player.pos.y+1.58,player.pos.z);camera.rotation.set(cameraPitch,cameraYaw,0,'YXZ');scene.updateMatrixWorld(true);camera.updateMatrixWorld();
   const target=targetedShelf();result.targeted=target?.type.id||null;
   beginFurnitureHold();for(let i=0;i<45;i++)updateFurniture(.05);
   result.movingDisplay=!!furnitureCarry;result.displayHidden=!sh.unlocked;
   cancelFurniturePlacement();result.cancelRestored=sh.unlocked&&sh.group.visible;return result;
 });
 console.log('PLACEMENT',place);
 // Save and reload, then reset through the actual help UI.
 await page.evaluate(()=>{state.money=12345;saveGame()});await page.reload({waitUntil:'load'});
 console.log('SAVE_RELOAD',await page.evaluate(()=>({money:state.money,shelves:shelves.length})));
 await page.locator('#btn-help').click();await page.locator('#btn-reset').click();await page.locator('#btn-reset').click();await page.waitForLoadState('load');
 console.log('RESET',await page.evaluate(()=>({money:state.money,shelves:shelves.length,bay:dynamicCrates.length,sold:state.totalSold})));
 // Render a single initial frame for visual inspection.
 await page.evaluate(()=>{sfx.enabled=false;updateGame(.016);updateFirstPersonHUD(.016);renderer.render(scene,camera)});
 await page.screenshot({path:'/home/user/phone-shop-src/screen-desktop-final.png'});
 console.log('ERRORS',errors);
 await context.close();
 // Mobile input + UI layout, including two separate virtual touch zones.
 const mobile=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:1,hasTouch:true,isMobile:true});const mp=await mobile.newPage();const me=[];mp.on('pageerror',e=>me.push(e.stack));await mp.addInitScript(()=>{window.requestAnimationFrame=()=>1;});await mp.goto('http://127.0.0.1:4173/',{waitUntil:'load'});
 const touch=await mp.evaluate(()=>{
   sfx.enabled=false;updateGame(.016);
   const surface=document.querySelector('#input-surface'),start={x:player.pos.x,z:player.pos.z,yaw:cameraYaw};
   function p(type,id,x,y){surface.dispatchEvent(new PointerEvent(type,{bubbles:true,pointerId:id,pointerType:'touch',clientX:x,clientY:y,button:0}));}
   p('pointerdown',10,80,300);p('pointermove',10,80,255);for(let i=0;i<10;i++)updateGame(.05);p('pointerup',10,80,255);
   p('pointerdown',11,600,210);p('pointermove',11,650,190);p('pointerup',11,650,190);
   updateGame(.016);updateFirstPersonHUD(.016);renderer.render(scene,camera);
   return {start,end:{x:player.pos.x,z:player.pos.z,yaw:cameraYaw},touchDevice:isTouchDevice,joyVisible:getComputedStyle(document.querySelector('#joystick-base')).display};
 });
 console.log('TOUCH',touch,'ERRORS',me);
 await mp.screenshot({path:'/home/user/phone-shop-src/screen-mobile.png'});
 await mp.locator('#btn-menu-store').click();console.log('MOBILE_MODAL',await mp.locator('#drawer-store').isVisible(),await mp.locator('#panel-brands .catalog-card').count());await mp.screenshot({path:'/home/user/phone-shop-src/screen-mobile-menu.png'});
 await mobile.close();
 await browser.close();
})();
