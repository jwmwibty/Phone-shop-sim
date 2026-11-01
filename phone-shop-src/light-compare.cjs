const {chromium}=require('/home/user/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:600},deviceScaleFactor:1});page.on('pageerror',e=>console.log('ERROR',e.stack));await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});
 for(const [name,url] of [['old','file:///home/user/phone-shop-src/index-before-performance.html'],['new','http://127.0.0.1:4173/']]){
  await page.goto(url,{waitUntil:'load'});await page.waitForTimeout(150);
  const info=await page.evaluate(()=>{sfx.enabled=false;updateGame(.016);timeOfDay=0;updateDayNight(0);updateFirstPersonHUD(.1);renderer.render(scene,camera);renderer.getContext().finish();return {exposure:renderer.toneMappingExposure,ambient:ambientLight.intensity,sun:dirLight.intensity,points:shopLights.length,calls:renderer.info.render.calls}});
  console.log(name,info);await page.screenshot({path:`/home/user/phone-shop-src/lighting-${name}.png`});
  await page.evaluate(()=>{timeOfDay=DAY_LENGTH/2;updateDayNight(0);renderer.render(scene,camera);renderer.getContext().finish()});await page.screenshot({path:`/home/user/phone-shop-src/lighting-${name}-night.png`});
 }
 await browser.close();
})();
