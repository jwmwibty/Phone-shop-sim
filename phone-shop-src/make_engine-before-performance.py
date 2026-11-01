from pathlib import Path
import re
P=Path('/home/user/phone-shop-src')
s=(P/'original-engine.js').read_text()
def once(old,new):
 global s
 n=s.count(old)
 if n!=1: raise RuntimeError(f'expected once, found {n}: {old[:120]!r}')
 s=s.replace(old,new,1)
def section(start,end,new):
 global s
 a=s.find(start); b=s.find(end,a)
 if a<0 or b<0: raise RuntimeError(f'missing section {start!r} / {end!r}')
 s=s[:a]+new+'\n\n        '+s[b:]

def text(name): return (P/name).read_text()
# 3D rendering and first-person camera
once('''const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            powerPreference: 'high-performance',
            stencil: false
        });''', '''let renderer;
        try {
            renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',stencil:false});
        } catch(error) {
            document.getElementById('error-screen').classList.remove('hidden');
            throw error;
        }''')
once('renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));','renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, navigator.maxTouchPoints > 0 ? 1.25 : 1.5));')
once('renderer.shadowMap.type = THREE.PCFShadowMap;', '''renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.92;''')
section('let frustumSize = state.zoomLevels[0];','const ambientLight', '''let cameraYaw = -0.19, cameraPitch = -0.075, bobPhase = 0;
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .055, 110);
        camera.rotation.order = 'YXZ';''')
once('ambientLight.intensity = 0.38 + daylight * 0.20;', 'ambientLight.intensity = 0.42 + daylight * 0.14;')
once('dirLight.intensity = 0.24 + daylight * 0.38;', 'dirLight.intensity = 0.20 + daylight * 0.43;')
once('shopLights.forEach(light => { light.intensity = (1 - daylight) * 0.65; });', 'shopLights.forEach(light => { light.intensity = 0.30 + (1 - daylight) * 0.28; });')
once('new THREE.MeshLambertMaterial({ color: colorHex })','new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.79, metalness: 0.025 })')
once('const BASE_PLAYER_SPEED = 6.08;', 'const BASE_PLAYER_SPEED = 3.45;')
once('const BASE_STOCKER_SPEED = 4.6;', 'const BASE_STOCKER_SPEED = 2.65;')
# Physics fallback for stock: simple local gravity with no network or WASM dependencies.
section('/**********************************************************************\n         * 5. RAPIER3D WASM INITIALIZATION', '/**********************************************************************\n         * 6. LOW-POLY PROCEDURAL MESH BUILDERS', '''// Stock drops use a small deterministic gravity simulation. No external physics download is required.
        let rapierWorld = null, rapierReady = false;
        const dynamicCrates = [];''')
section('function createPhoneItemMesh(brand) {','const cashNoteMat', '''function createPhoneItemMesh(brand) {
            const group = new THREE.Group();
            const box = roundedSlab(.35,.105,.51,.025,0xf2f0eb); group.add(box);
            const band = roundedSlab(.345,.018,.50,.02,brand.color); band.position.y=.048; group.add(band);
            const phone = roundedSlab(.205,.021,.365,.023,0x1c2431); phone.position.y=.064; group.add(phone);
            const screen = roundedSlab(.175,.008,.324,.017,brand.accent); screen.position.y=.079;group.add(screen);
            const sheen = roundedSlab(.045,.004,.25,.005,0xffffff);sheen.position.set(-.047,.084,.015);group.add(sheen);
            const cameraDot=new THREE.Mesh(sharedGeos.cyl,getMat(0x101a24));cameraDot.scale.set(.012,.006,.012);cameraDot.position.set(0,.085,-.135);group.add(cameraDot);
            group.userData.brand=brand;return group;
        }''')
section('function createStickman(colorHex, options = {}) {','function animateStickman(stickman, isMoving, isCarrying, dt) {',text('character.js'))
# Display models and shop identity
once("{ id: 'standard', name: 'Classic Display Table', cost: 2500, width: 2.5, depth: 2.05, levels: 1, cols: 3, rows: 2, color: 0xcbd5e1, accent: 0x2563eb }", "{ id: 'standard', name: 'Classic Display Table', cost: 2500, width: 2.5, depth: 2.05, levels: 1, cols: 3, rows: 2, color: 0xe3ded8, accent: 0x7a70a7 }")
once('box(0.62, 0.02, 0.90, x, surface + 0.01, z, 0xe9eef0, 0.04);', '''box(0.48, 0.02, 0.66, x, surface + 0.01, z, 0xb8b3ae, 0.04);
                    box(0.30,0.018,0.08,x,surface+0.028,z+0.27,0xf5f1e9,0.008);
                    box(0.18,0.005,0.012,x,surface+0.039,z+0.275,0x676775,0.004);''')
once('box(w - 0.24, 0.69, d - 0.22, 0, 0.47, 0, 0xc5a47b, 0.06);','box(w - 0.24, 0.69, d - 0.22, 0, 0.47, 0, 0xa98767, 0.06);')
once('box(w - 0.34, 0.48, 0.025, 0, 0.47, d / 2 - 0.10, 0xe0c6a2, 0.02);','box(w - 0.34, 0.48, 0.025, 0, 0.47, d / 2 - 0.10, 0xc2a184, 0.02);')
once('box(0.028, 0.45, 0.028, x, 0.47, d / 2 - 0.08, 0xb18d65);','box(0.028, 0.45, 0.028, x, 0.47, d / 2 - 0.08, 0x8d7058);')
once('x + 0.22, surface + 0.024, z + 0.35','x + 0.18, surface + 0.024, z + 0.27')
once('makeShelf(FURNITURE[1], new THREE.Vector3(1.2, 0.08, 1.8));', 'makeShelf(FURNITURE[1], new THREE.Vector3(1.2, 0.08, 1.8));\n\n'+text('environment.js'))
# No reference to the removed WASM library in the stock creation path
section('                let rapierBody = null;\n                if (rapierReady && rapierWorld) {','                dynamicCrates.push({', '''                let rapierBody = null;''')
once("""                const spawnX = LOADING_BAY_POS.x + (Math.random() - 0.5) * 1.5;
                const spawnY = 2.4 + i * 0.55;
                const spawnZ = LOADING_BAY_POS.z + (Math.random() - 0.5) * 1.5;""", """                const index = dynamicCrates.length, column = index % 4, row = Math.floor(index / 4) % 3, layer = Math.floor(index / 12);
                const settledY = .245 + layer * .11;
                const spawnX = LOADING_BAY_POS.x + (column - 1.5) * .42;
                const spawnZ = LOADING_BAY_POS.z + (row - 1) * .60;
                const spawnY = settledY + 1.6 + (i % 6) * .16;""")
once('targetY: 0.26 + (dynamicCrates.length % 15) * 0.16','targetY: settledY')
once("""                } else if (c.mesh.position.y > c.targetY) {
                    c.vy -= 18 * dt;
                    c.mesh.position.y = Math.max(c.targetY, c.mesh.position.y + c.vy * dt);
                }""", """                } else if (c.mesh.position.y > c.targetY + .001 || c.vy > 0) {
                    c.vy -= 18 * dt;
                    c.mesh.position.y += c.vy * dt;
                    if(c.mesh.position.y <= c.targetY){c.mesh.position.y=c.targetY;c.vy=c.vy < -1.2 ? -c.vy*.20 : 0;}
                }""")
once("""                p.vy -= 18 * dt;
                p.group.position.y = Math.max(0.65, p.group.position.y + p.vy * dt);""", """                if(p.group.position.y > .541 || p.vy > 0){
                    p.vy -= 18 * dt;p.group.position.y += p.vy * dt;
                    if(p.group.position.y <= .54){p.group.position.y=.54;p.vy=p.vy < -1.2 ? -p.vy*.12 : 0;}
                }""")
once('pos: new THREE.Vector3(-1.1, 0.08, 2.2),','pos: new THREE.Vector3(-2.0, 0.08, 3.35),')
once('scene.add(player.mesh);','scene.add(player.mesh);\n        player.mesh.visible = false;')
once('a.mesh.position.y += Math.sin(t * Math.PI) * 1.55;', 'a.mesh.position.y += Math.sin(t * Math.PI) * .65;')
# Furniture parcels and optional cancellation without losing a purchase
section('function orderFurniture(type) {','function startFurniture(type, shelf = null) {', '''function spawnFurnitureParcel(type, falling = true) {
            const g = new THREE.Group(), box = new THREE.Mesh(sharedGeos.box, getMat(0xb77943));
            box.scale.set(1.05, .7, .8);g.add(box);
            const band=new THREE.Mesh(sharedGeos.box,getMat(type.accent));band.scale.set(.16,.72,.82);g.add(band);
            g.position.set(LOADING_BAY_POS.x+(Math.random()-.5)*1.5,falling?4+furnitureParcels.length*.2:.54,LOADING_BAY_POS.z+(Math.random()-.5)*1.4);
            worldGroup.add(g);furnitureParcels.push({type,group:g,vy:0});
        }
        function orderFurniture(type) {
            if(state.money<type.cost){showToast(`Need ₹${type.cost.toLocaleString('en-IN')} for ${type.name}`);return;}
            state.money-=type.cost;spawnFurnitureParcel(type,true);sfx.unlock();
            showToast(`${type.name} delivered to the loading bay. Walk over and grab it.`);updateHUD();renderAllMenus();
        }''')
once("furnitureUI.grab.style.display = near ? 'block' : 'none';", 'showEl(furnitureUI.grab, near);')
once("furnitureUI.rotate.style.display = furnitureCarry ? 'block' : 'none';", 'showEl(furnitureUI.rotate, !!furnitureCarry);')
once("furnitureUI.place.style.display = furnitureCarry ? 'block' : 'none';", "showEl(furnitureUI.place, !!furnitureCarry);\n            showEl(document.getElementById('furniture-cancel'), !!furnitureCarry);")
once("furnitureUI.info.style.display = 'block';", 'showEl(furnitureUI.info, true);')
once("furnitureUI.info.style.display = near ? 'block' : 'none';", 'showEl(furnitureUI.info, near);')
section('                furnitureUI.place.className = placementValid','            } else {', '''                furnitureUI.place.disabled = !placementValid;''')
once("furnitureUI.hold.style.display = 'none';", 'showEl(furnitureUI.hold, false);')
once("showToast(`${data.type.name} placed! Hold it for 2 seconds to move it again.`);", "showToast(`${data.type.name} placed! Look at it and hold F to move it again.`);")
once('        furnitureUI.place.onclick = placeFurniture;','''        furnitureUI.place.onclick = placeFurniture;
        function cancelFurniturePlacement(){
            if(!furnitureCarry)return;
            const data=furnitureCarry;
            if(data.shelf){
                const sh=data.shelf;sh.unlocked=true;sh.group.visible=true;
                sh.items.forEach((item,i)=>{item.mesh.visible=true;item.mesh.position.copy(getSlotWorld(sh,i));item.mesh.rotation.set(0,sh.rotation,0);});
            } else spawnFurnitureParcel(data.type,false);
            worldGroup.remove(furniturePreview);
            furniturePreview.traverse(o=>{if(o.isMesh)o.material.dispose();});
            furniturePreview=null;furnitureCarry=null;navRevision++;updateHUD();
            showToast(data.shelf?'Display returned to its original position.':'Furniture returned to the loading bay.');
        }
        document.getElementById('furniture-cancel').onclick=cancelFurniturePlacement;''')
section('function tryFurnitureHold(e) {','const customers = [];', text('fps-input.js'))
# Enter through the storefront rather than walking through a pane of glass.
once("const entry = new THREE.Vector3(2.2 + (Math.random() - 0.5) * 2.0, 0.08, 4.6);", "const entry = new THREE.Vector3(1.48 + (Math.random() - 0.5) * 1.0, 0.08, 4.6);\n            const outside = new THREE.Vector3(1.48, 0.08, 6.75);")
once("mesh, pos: start.clone(), targetPos: entry,\n                state: 'ENTERING'", "mesh, pos: start.clone(), targetPos: outside, insideTarget: entry,\n                state: 'APPROACHING'")
once('const colors = [0xf97316, 0x8b5cf6, 0xec4899, 0x14b8a6, 0x64748b, 0xdc2626];', 'const colors = [0xb57659, 0x716a94, 0x9b6f7b, 0x5b8a80, 0x758493, 0x976563];')
once("                if (c.state === 'ENTERING') {", """                if (c.state === 'APPROACHING') {
                    if (c.pos.distanceTo(c.targetPos) > .32) moving = moveAgent(c,c.targetPos,2.45,dt);
                    else {c.state='ENTERING';c.targetPos=c.insideTarget;c.nav=null;}
                } else if (c.state === 'ENTERING') {""")
for old,new in [('c.targetPos, 4.3, dt','c.targetPos, 2.45, dt'),('c.browsePos, 3.9, dt','c.browsePos, 2.3, dt'),('queueTarget, 4.1, dt','queueTarget, 2.4, dt'),('c.targetPos, 4.9, dt','c.targetPos, 2.8, dt')]: once(old,new)
# Remove only the old UI renderer, keeping all purchase and progression functions.
section('function showToast(msg) {','function purchaseStoreUpgrade(upgradeId) {','')
section('                state.shopExpanded = true;\n                worldGroup.remove(expansionNeighbor);',"                showToast('Store expanded and customer arrival rate doubled');", '''                applyStoreExpansion();''')
section('function renderAllMenus() {','/**********************************************************************\n         * 15. NAVIGATION, PATHFINDING & MAIN GAME LOOP', text('ui.js')+'\n'+text('viewmodel.js'))
# Shell colliders for player and customers; expansion moves the side wall.
once('''                { x: -6.5, z: -2.5, w: 0.45, d: 8.5 }
            ];''','''                { x: -6.5, z: -2.5, w: 0.45, d: 8.5 },
                { x: state.shopExpanded ? 10.7 : 7.18, z: -.5, w: .2, d: 12 },
                { x: (-6.4-.58)/2, z: 5.55, w: 6.4-.58, d: .18 },
                { x: (3.55+(state.shopExpanded?10.7:7.18))/2, z: 5.55, w: (state.shopExpanded?10.7:7.18)-3.55, d: .18 }
            ];''')
section('// 3. Player Movement','// 4. Pick Up Phones from Loading Bay', '''// 3. First-person movement: W/S forward, A/D strafe, mouse or touch look.
            let rawX=state.activeDrawer?0:input.joyVec.x;
            let rawForward=state.activeDrawer?0:-input.joyVec.y;
            if(!state.activeDrawer){
                if(input.keys['KeyW']||input.keys['ArrowUp'])rawForward+=1;
                if(input.keys['KeyS']||input.keys['ArrowDown'])rawForward-=1;
                if(input.keys['KeyA'])rawX-=1;if(input.keys['KeyD'])rawX+=1;
                if(input.keys['ArrowLeft'])cameraYaw+=dt*1.8;
                if(input.keys['ArrowRight'])cameraYaw-=dt*1.8;
            }
            const mag=Math.hypot(rawX,rawForward);let isPlayerMoving=false;
            if(mag>.05){
                const nx=rawX/Math.max(1,mag),nf=rawForward/Math.max(1,mag);
                const vx=Math.cos(cameraYaw)*nx-Math.sin(cameraYaw)*nf;
                const vz=-Math.sin(cameraYaw)*nx-Math.cos(cameraYaw)*nf;
                player.vel.set(vx*state.playerSpeed,0,vz*state.playerSpeed);
                const oldX=player.pos.x,oldZ=player.pos.z;
                const nextX=oldX+player.vel.x*dt,nextZ=oldZ+player.vel.z*dt;
                if(!worldBlocked(nextX,oldZ,ACTOR_RADIUS)&&!crowdBlocked(player,nextX,oldZ))player.pos.x=nextX;
                if(!worldBlocked(player.pos.x,nextZ,ACTOR_RADIUS)&&!crowdBlocked(player,player.pos.x,nextZ))player.pos.z=nextZ;
                player.pos.x=THREE.MathUtils.clamp(player.pos.x,-9,state.shopExpanded?10.2:7);
                player.pos.z=THREE.MathUtils.clamp(player.pos.z,-5.8,8.2);
                isPlayerMoving=Math.hypot(player.pos.x-oldX,player.pos.z-oldZ)>.0001;
            }else player.vel.set(0,0,0);
            if(isPlayerMoving)bobPhase+=dt*9.5;
            const bob=isPlayerMoving?Math.sin(bobPhase)*.018:0;
            player.angle=cameraYaw+Math.PI;
            player.mesh.position.copy(player.pos);player.mesh.rotation.y=player.angle;
            camera.position.set(player.pos.x,player.pos.y+1.58+bob,player.pos.z);
            camera.rotation.set(cameraPitch,cameraYaw,0,'YXZ');camera.updateMatrixWorld();
            for(let i=0;i<player.carryStack.length;i++){
                const item=player.carryStack[i];item.mesh.visible=false;
                item.mesh.position.set(player.pos.x,player.pos.y+1+i*.1,player.pos.z);item.mesh.rotation.y=player.angle;
            }
            refreshCarryView();
            updateFurniture(dt);''')
once('player.carryStack.push({ mesh: crate.mesh, brand: crate.brand });','crate.mesh.visible = false;\n                player.carryStack.push({ mesh: crate.mesh, brand: crate.brand });')
once('const carried = player.carryStack.pop();\n                        const slotWorld', 'const carried = player.carryStack.pop();\n                        carried.mesh.visible = true;\n                        carried.mesh.position.set(player.pos.x,player.pos.y+1.05,player.pos.z);\n                        const slotWorld')
once("c.carriedItem = c.targetShelf.items.pop();\n                                    c.state = 'QUEUING';", "c.carriedItem = c.targetShelf.items.pop();\n                                    for(let ai=activeArcs.length-1;ai>=0;ai--)if(activeArcs[ai].mesh===c.carriedItem.mesh)activeArcs.splice(ai,1);\n                                    c.state = 'QUEUING';")
# Update the objective and targeted furniture affordances after the camera has moved.
once('if (pad.dwellTimer > 0.4) {\n                        pad.dwellTimer = 0;','if (pad.dwellTimer > 1.5) {\n                        pad.dwellTimer = -3;')
once('''            updateDayNight(dt);
            renderer.render(scene, camera);''','''            updateDayNight(dt);
            updateFirstPersonHUD(dt);
            renderer.render(scene, camera);''')
section('function onWindowResize() {','/**********************************************************************\n         * 16. BOOTSTRAP GAME', '''function onWindowResize() {
            camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth,window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);

'''+text('persistence.js'))
section('/**********************************************************************\n         * 16. BOOTSTRAP GAME','window.onload = async function () {','')
# Replace the final boot handler, keeping the original systems alive.
a=s.find('window.onload = async function () {')
if a<0:raise RuntimeError('missing boot')
s=s[:a]+'''function bootstrap(){
            const restored=restoreGame();
            if(!restored)spawnSupplyCrateAtBay(PHONE_BRANDS[0],1,true);
            spawnCustomer();renderAllMenus();updateHUD();
            requestAnimationFrame(animate);
            setInterval(saveGame,5000);
        }
        bootstrap();
'''
# The inline image literal is injected by the HTML builder.
s='const POSTER_DATA = "__POSTER__";\n'+s
(P/'game.js').write_text(s)
print('engine generated:', len(s),'characters')
