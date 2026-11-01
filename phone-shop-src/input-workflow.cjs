const {chromium}=require('/home/user/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:900,height:600}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.evaluate(()=>{sfx.enabled=false;customers.forEach(c=>scene.remove(c.mesh));customers.length=0;customerSpawnTimer=9999;});
 const before=await page.evaluate(()=>({x:player.pos.x,z:player.pos.z}));
 await page.keyboard.down('w');await page.evaluate(()=>{for(let i=0;i<8;i++)updateGame(.05)});await page.keyboard.up('w');
 const after=await page.evaluate(()=>({x:player.pos.x,z:player.pos.z}));
 await page.locator('#btn-menu-store').click();await page.locator('#panel-brands .buy-three').click();const bought=await page.evaluate(()=>({money:state.money,queued:state.pendingOrders.reduce((n,o)=>n+o.count,0)}));
 await page.locator('#tab-btn-furniture').click();await page.locator('#panel-store-upgrades .catalog-card').first().locator('button').click();await page.locator('#btn-close-store').click();
 await page.evaluate(()=>{player.pos.set(-4.5,.08,4.2);updateGame(.016);});
 await page.keyboard.press('e');const grab=await page.evaluate(()=>!!furnitureCarry);
 const valid=await page.evaluate(()=>{player.pos.set(-5.5,.08,-3);cameraYaw=0;updateGame(.016);return placementValid});
 await page.keyboard.press('r');const rotated=await page.evaluate(()=>placementRotation);await page.evaluate(()=>updateGame(.016));
 const validAfterRotate=await page.evaluate(()=>placementValid);
 if(validAfterRotate)await page.keyboard.press('Space');
 const placed=await page.evaluate(()=>({count:shelves.length,stillCarrying:!!furnitureCarry}));
 console.log({before,after,bought,grab,valid,rotated,validAfterRotate,placed,errors});await browser.close();
})();
