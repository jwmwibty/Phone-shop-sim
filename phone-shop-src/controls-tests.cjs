const {chromium}=require('/home/user/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 let page=await browser.newPage({viewport:{width:1000,height:700}});let errors=[];page.on('pageerror',e=>errors.push(e.stack));await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 // A sandbox like the in-app file viewer disallows pointer lock and storage.
 await page.setContent('<iframe sandbox="allow-scripts" src="http://127.0.0.1:4173/" style="border:0;width:980px;height:680px"></iframe>');
 const frame=page.frameLocator('iframe');await frame.locator('#objective-text').waitFor();
 const f=page.frames().find(x=>x.url().includes('4173'));
 await f.evaluate(()=>{sfx.enabled=false;updateGame(.016);});
 const before=await f.evaluate(()=>cameraYaw);
 await page.mouse.move(700,430);await page.mouse.down();await page.mouse.move(790,430,{steps:5});await page.mouse.up();
 const after=await f.evaluate(()=>({yaw:cameraYaw,denied:pointerLockDenied,locked:!!document.pointerLockElement}));
 console.log('SANDBOX_DRAG', {before,after});
 await frame.locator('#btn-menu-store').click();console.log('SANDBOX_MENU',await frame.locator('#drawer-store').isVisible(),'errors',errors.length);
 await page.close();
 // The saved standalone file opens directly, without any network requests.
 page=await browser.newPage({viewport:{width:900,height:600}});errors=[];page.on('pageerror',e=>errors.push(e.stack));const network=[];page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 await page.goto('file:///home/user/phone-shop/index.html',{waitUntil:'load'});
 console.log('FILE_MODE',await page.evaluate(()=>({title:document.title,objective:document.querySelector('#objective-text').textContent,camera:camera.type,bay:dynamicCrates.length})),{network,errors});
 // Mouse-lock + keyboard shortcut on a normal page.
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.mouse.click(700,450);await page.waitForTimeout(100);
 const locked=await page.evaluate(()=>document.pointerLockElement?.id||null);await page.keyboard.press('b');await page.waitForTimeout(100);console.log('LOCK_SHORTCUT',{locked,menu:await page.locator('#drawer-store').isVisible(),after:await page.evaluate(()=>document.pointerLockElement?.id||null)});
 await browser.close();
})();
