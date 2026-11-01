const {chromium}=require('/home/user/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const context=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true});const page=await context.newPage();page.on('pageerror',e=>console.error('PAGE',e.stack));await page.addInitScript(()=>{window.requestAnimationFrame=()=>1;});await page.goto('http://127.0.0.1:4173/',{waitUntil:'load'});await page.waitForTimeout(200);
 const data=await page.evaluate(()=>{
  sfx.enabled=false; updateGame(.016);updateDayNight(0);updateFirstPersonHUD(.016);renderer.render(scene,camera);renderer.getContext().finish();
  function measure(){let times=[];for(let i=0;i<3;i++){const t=performance.now();renderer.render(scene,camera);renderer.getContext().finish();times.push(performance.now()-t);}return {times,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures};}
  const initial=measure();
  state.money=100000;purchaseLevelUpgrade('hire_stocker');purchaseLevelUpgrade('hire_cashier');orderSupplierDelivery('kokia',3);
  let t0=performance.now();for(let i=0;i<600;i++)updateGame(.05);const simulation=performance.now()-t0;updateFirstPersonHUD(.016);const busy=measure();
  let nodes=0,meshes=0,points=0;scene.traverse(o=>{nodes++;if(o.isMesh)meshes++;if(o.isPointLight)points++;});
  return {initial,busy,simulationMsFor600Steps:simulation,people:customers.length,nodes,meshes,points,pixelRatio:renderer.getPixelRatio(),drawingBuffer:[renderer.domElement.width,renderer.domElement.height],webgl:renderer.capabilities.isWebGL2};
 });
 console.log(JSON.stringify(data,null,2));await page.screenshot({path:'/home/user/phone-shop-src/profile-before.png'});await browser.close();
})();
