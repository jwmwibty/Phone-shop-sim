const {chromium}=require('/home/user/node_modules/playwright');
const assert=require('assert');
const base='http://127.0.0.1:4173/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];
 // A real render loop, including the pause while a touch device is portrait.
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const page=await mobile.newPage();page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(base,{waitUntil:'load'});await page.waitForTimeout(400);
 assert(await page.locator('#orientation-screen').isVisible(),'portrait prompt is missing');
 const before=await page.evaluate(()=>({time:timeOfDay,blocked:orientationBlocked,antialias:renderer.getContext().getContextAttributes().antialias}));
 await page.waitForTimeout(350);const after=await page.evaluate(()=>timeOfDay);
 assert(before.blocked && before.time===after,'simulation did not pause in portrait');assert.strictEqual(before.antialias,false);
 await page.screenshot({path:'/home/user/phone-shop-src/orientation-portrait.png'});
 // Explicitly force both platform APIs to fail as they do in some preview iframes.
 await page.evaluate(()=>{
  Object.defineProperty(document.documentElement,'requestFullscreen',{configurable:true,value:()=>Promise.reject(new Error('denied'))});
  if(screen.orientation)Object.defineProperty(screen.orientation,'lock',{configurable:true,value:()=>Promise.reject(new Error('unsupported'))});
 });
 await page.locator('#btn-landscape').click();
 assert((await page.locator('#orientation-note').innerText()).includes('rotate your device'));
 assert(await page.locator('#orientation-screen').isVisible());
 await page.locator('#btn-portrait-override').click();assert(!(await page.locator('#orientation-screen').isVisible()));
 await page.waitForTimeout(350);const resumed=await page.evaluate(()=>timeOfDay);assert(resumed>after,'portrait override did not resume');
 await page.setViewportSize({width:844,height:390});await page.waitForTimeout(350);
 assert(!(await page.locator('#orientation-screen').isVisible()));
 const landscape=await page.evaluate(()=>({blocked:orientationBlocked,override:landscapeOverride,aspect:camera.aspect,pixelRatio:renderer.getPixelRatio(),width:innerWidth,height:innerHeight}));
 assert(!landscape.blocked && Math.abs(landscape.aspect-844/390)<.01);
 await page.screenshot({path:'/home/user/phone-shop-src/orientation-landscape.png'});
 await page.setViewportSize({width:390,height:844});
 await page.locator('#orientation-screen').waitFor({state:'visible',timeout:5000});
 assert(await page.locator('#orientation-screen').isVisible(),'prompt should return when rotated back');
 console.log('ORIENTATION',{before,after,resumed,landscape,manualFallback:true});
 await mobile.close();
 // Frame governor, graphics settings, shadow caching and retained targeting.
 const ctx=await browser.newContext({viewport:{width:844,height:390},deviceScaleFactor:2,hasTouch:true,isMobile:true});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.stack));
 await p.addInitScript(()=>{window.requestAnimationFrame=()=>1});await p.goto(base,{waitUntil:'load'});
 const perf=await p.evaluate(()=>{
  const initial=performanceQuality.ratio;
  for(let i=0;i<200;i++)observeFrameTime(40);
  const slow=performanceQuality.ratio;
  for(let i=0;i<800;i++)observeFrameTime(16);
  const recovered=performanceQuality.ratio;
  const shadowFlags=[], realRender=renderer.render.bind(renderer);
  renderer.render=(s,c)=>{shadowFlags.push(renderer.shadowMap.needsUpdate);return realRender(s,c);};
  const t=performance.now()+100;animate(t);animate(t+16);navRevision++;animate(t+32);renderer.render=realRender;
  return {initial,slow,recovered,shadowFlags,autoUpdate:renderer.shadowMap.autoUpdate,points:shopLights.length,batches:optimizedBatchCount,meshes:scene.children.length};
 });
 console.log('PERF_RAW',perf);
 assert(perf.slow<perf.initial&&perf.recovered>perf.slow,'adaptive resolution did not downshift/recover');
 assert.deepStrictEqual(perf.shadowFlags,[true,false,true],'shadow map did not cache and refresh');assert.strictEqual(perf.autoUpdate,false);
 assert.strictEqual(perf.points,2);assert(perf.batches>50);
 await p.locator('#btn-help').click();
 await p.locator('#graphics-quality').selectOption('high');
 let high=await p.evaluate(()=>({mode:graphicsMode,requested:performanceQuality.requestedMaxRatio,maximum:performanceQuality.maxRatio}));
 assert.strictEqual(high.mode,'high');assert.strictEqual(high.requested,1.35);assert(high.maximum<=1.35);
 const renderScale=p.locator('#render-scale-control');await renderScale.scrollIntoViewIfNeeded();await renderScale.fill('140');
 const graphics=await p.evaluate(()=>({mode:graphicsMode,requested:performanceQuality.requestedMaxRatio,ratio:renderer.getPixelRatio(),stored:JSON.parse(localStorage.getItem(SAVE_KEY))}));
 assert.strictEqual(graphics.mode,'custom');assert.strictEqual(graphics.requested,1.4);assert.strictEqual(graphics.stored.graphicsMode,'custom');assert.strictEqual(graphics.stored.graphicsMaxRatio,1.4);
 const slider=p.locator('#brightness-control');await slider.scrollIntoViewIfNeeded();
 assert.strictEqual(await slider.inputValue(),'72');await slider.fill('61');
 const brightness=await p.evaluate(()=>({exposure:renderer.toneMappingExposure,saved:JSON.parse(localStorage.getItem(SAVE_KEY)).exposure,text:document.getElementById('brightness-value').textContent}));
 assert.strictEqual(brightness.exposure,.61);assert.strictEqual(brightness.saved,.61);assert.strictEqual(brightness.text,'61%');
 await p.reload({waitUntil:'load'});const saved=await p.evaluate(()=>({exposure:renderer.toneMappingExposure,slider:document.getElementById('brightness-control').value,graphicsMode,requested:performanceQuality.requestedMaxRatio,renderScale:renderer.getPixelRatio(),quality:document.getElementById('graphics-quality').value}));
 assert.strictEqual(saved.exposure,.61);assert.strictEqual(saved.slider,'61');assert.strictEqual(saved.graphicsMode,'custom');assert.strictEqual(saved.quality,'custom');assert(Math.abs(saved.requested-1.4)<.001);assert(Math.abs(saved.renderScale-1.4)<.001);
 console.log('PERFORMANCE',perf,'BRIGHTNESS',brightness,'RELOAD',saved);
 await ctx.close();
 // Sandboxed browser preview: if fullscreen is disallowed, manual rotation / fallback still works.
 const outer=await browser.newPage({viewport:{width:400,height:850},hasTouch:true,isMobile:true});outer.on('pageerror',e=>errors.push(e.stack));
 await outer.goto(base);await outer.setContent(`<iframe sandbox="allow-scripts" src="${base}" width="390" height="844" style="border:0"></iframe>`);
 const frame=outer.frameLocator('iframe');await frame.locator('#orientation-screen').waitFor({state:'visible'});
 await frame.locator('#btn-landscape').click();await frame.locator('#btn-portrait-override').click();
 assert(!(await frame.locator('#orientation-screen').isVisible()),'sandbox fallback blocked');
 console.log('SANDBOX',{manualFallback:true,errors:errors.length});
 await outer.close();await browser.close();
 if(errors.length){console.error(errors);process.exit(1)}
})().catch(e=>{console.error(e);process.exit(1)});
