const {chromium}=require('/home/user/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1100,height:700}});page.on('pageerror',e=>console.log('ERROR',e.stack));await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.waitForTimeout(250);
 const info=await page.evaluate(()=>{
  sfx.enabled=false;player.pos.set(-4.55,.08,4.2);cameraYaw=-1.2;cameraPitch=-.12;
  for(let i=0;i<8;i++)updateGame(.05);
  for(let i=0;i<100;i++)updateGame(.05);
  updateFirstPersonHUD(.016);renderer.render(scene,camera);
  return {carry:player.carryStack.length,customers:customers.map(c=>({s:c.state,x:c.pos.x,z:c.pos.z})),objective:document.querySelector('#objective-text').textContent};
 });console.log('CARRY_SCENE',info);await page.screenshot({path:'/home/user/phone-shop-src/screen-carry.png'});
 const exp=await page.evaluate(()=>{
   state.money=90000;purchaseStoreUpgrade('expand_shop');purchaseLevelUpgrade('hire_cashier');purchaseLevelUpgrade('hire_stocker');
   orderSupplierDelivery('siaomi',3);const unlocked=PHONE_BRANDS[1].unlocked;orderSupplierDelivery('siaomi',3);
   for(let i=0;i<400;i++)updateGame(.05);
   return {expanded:state.shopExpanded,rightWall:shell.rightWall.position.x,stock:shelves.map(s=>s.items.length),cashier:!!cashierStaff,stocker:!!stockerStaff,unlocked,bay:dynamicCrates.length,orders:state.pendingOrders.length,money:state.money};
 });console.log('EXPANSION_BRANDS',exp);
 await page.close();
 const mob=await browser.newContext({viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:1});const mp=await mob.newPage();await mp.addInitScript(()=>{window.requestAnimationFrame=()=>1;});await mp.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await mp.evaluate(()=>{updateGame(.016);updateFirstPersonHUD(.016);renderer.render(scene,camera)});await mp.screenshot({path:'/home/user/phone-shop-src/screen-landscape.png'});await mp.locator('#btn-menu-store').click();await mp.screenshot({path:'/home/user/phone-shop-src/screen-landscape-menu.png'});
 await browser.close();
})();
