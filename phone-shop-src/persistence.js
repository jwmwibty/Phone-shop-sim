        const SAVE_KEY='phone-shop-tycoon-first-person-v1';
        let resetRequested=false;
        function applyStoreExpansion(){
            if(state.shopExpanded)return;
            state.shopExpanded=true;
            worldGroup.remove(expansionNeighbor); navRevision++;
            shopFloor.scale.set(17.5,.16,12.5);shopFloor.position.x=2;
            backWall.scale.x=17.8;backWall.position.x=2;
            backTrim.scale.x=17.9;backTrim.position.x=2;
            buildFloorTiles(15);
            tileInstMesh.material=shell.tileMaterial;
            expandStoreVisuals();
        }
        function saveGame(){
            if(resetRequested)return;
            try{
                const waitingPhones=customers.filter(c=>c.carriedItem&&c.state!=='LEAVING').map(c=>c.carriedItem.brand.id);
                const data={
                    version:1,money:state.money,totalSold:state.totalSold,totalRevenue:state.totalRevenue,
                    expanded:state.shopExpanded,brands:PHONE_BRANDS.filter(b=>b.unlocked).map(b=>b.id),
                    upgrades:Object.fromEntries(LEVEL_UPGRADES.map(u=>[u.id,u.level])),
                    shelves:shelves.map(s=>({type:s.type.id,x:s.pos.x,z:s.pos.z,rotation:s.rotation,items:s.items.map(i=>i.brand.id)})),
                    bay:dynamicCrates.map(c=>c.brand.id).concat(waitingPhones),
                    carry:player.carryStack.map(c=>c.brand.id),
                    parcels:furnitureParcels.map(p=>p.type.id).concat(furnitureCarry&&!furnitureCarry.shelf?[furnitureCarry.type.id]:[]),
                    cash:cashPileBundles.reduce((n,b)=>n+b.value,0),
                    orders:state.pendingOrders.map(o=>({id:o.brand.id,count:o.count})),
                    player:{x:player.pos.x,z:player.pos.z,yaw:cameraYaw,pitch:cameraPitch},
                    timeOfDay,exposure:renderer.toneMappingExposure
                };
                localStorage.setItem(SAVE_KEY,JSON.stringify(data));
            }catch(e){ /* Some embedded previews intentionally disallow storage. */ }
        }
        function restoreGame(){
            let data;try{data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');}catch(_){return false;}
            if(!data||data.version!==1||!Array.isArray(data.shelves))return false;
            try{
                state.money=Math.max(0,Number(data.money)||0);
                state.totalSold=Math.max(0,Number(data.totalSold)||0);
                state.totalRevenue=Math.max(0,Number(data.totalRevenue)||0);
                PHONE_BRANDS.forEach(b=>b.unlocked=b.id==='kokia'||(data.brands||[]).includes(b.id));
                LEVEL_UPGRADES.forEach(u=>{const n=Number((data.upgrades||{})[u.id]);if(Number.isFinite(n))u.level=Math.max(u.maxLevel===1?0:1,Math.min(u.maxLevel,Math.floor(n)));});
                const level=id=>LEVEL_UPGRADES.find(u=>u.id===id).level;
                state.maxCarry=4+(level('player_carry')-1)*2;
                state.playerSpeed=BASE_PLAYER_SPEED*(1+(level('player_speed')-1)*.1);
                state.stockerMaxCarry=3+(level('stocker_carry')-1)*2;
                state.stockerSpeed=BASE_STOCKER_SPEED*(1+(level('stocker_speed')-1)*.15);
                state.checkoutSpeedMult=1+(level('cashier_speed')-1)*.25;
                if(data.expanded){STORE_UPGRADES[0].purchased=true;applyStoreExpansion();}
                shelves.forEach(s=>worldGroup.remove(s.group));shelves.length=0;
                for(const saved of data.shelves.slice(0,80)){
                    const type=FURNITURE.find(f=>f.id===saved.type);
                    if(!type||!Number.isFinite(saved.x)||!Number.isFinite(saved.z))continue;
                    const shelf=makeShelf(type,new THREE.Vector3(saved.x,.08,saved.z),Number(saved.rotation)||0);
                    for(const brandId of (saved.items||[]).slice(0,shelf.capacity)){
                        const brand=PHONE_BRANDS.find(b=>b.id===brandId);if(!brand)continue;
                        const mesh=createPhoneItemMesh(brand);mesh.position.copy(getSlotWorld(shelf,shelf.items.length));mesh.rotation.y=shelf.rotation;scene.add(mesh);shelf.items.push({mesh,brand});
                    }
                }
                // A malformed or old save should never strand the player without a display.
                if(!shelves.length){makeShelf(FURNITURE[1],new THREE.Vector3(1.2,.08,-1.8));makeShelf(FURNITURE[1],new THREE.Vector3(1.2,.08,1.8));}
                for(const brandId of (data.bay||[]).slice(0,300)){const brand=PHONE_BRANDS.find(b=>b.id===brandId);if(brand)spawnSupplyCrateAtBay(brand,1,false);}
                for(const brandId of (data.carry||[]).slice(0,state.maxCarry)){
                    const brand=PHONE_BRANDS.find(b=>b.id===brandId);if(!brand)continue;
                    const mesh=createPhoneItemMesh(brand);mesh.visible=false;scene.add(mesh);player.carryStack.push({mesh,brand});
                }
                for(const typeId of (data.parcels||[]).slice(0,40)){const type=FURNITURE.find(f=>f.id===typeId);if(type)spawnFurnitureParcel(type,false);}
                if(Number(data.cash)>0)addCashToPile(Number(data.cash));
                for(const o of (data.orders||[]).slice(0,30)){const brand=PHONE_BRANDS.find(b=>b.id===o.id);if(brand&&o.count>0)state.pendingOrders.push({brand,count:Math.min(200,Math.floor(o.count))});}
                if(level('hire_stocker'))spawnStockerStaff();
                if(level('hire_cashier')){spawnCashierStaff();const pad=floorPads.find(p=>p.id==='cashier');if(pad){pad.active=false;pad.group.visible=false;}}
                if(data.player&&Number.isFinite(data.player.x)&&Number.isFinite(data.player.z)&&!worldBlocked(data.player.x,data.player.z)){
                    player.pos.x=THREE.MathUtils.clamp(data.player.x,-9,state.shopExpanded?10.2:7);player.pos.z=THREE.MathUtils.clamp(data.player.z,-5.8,8.2);
                    if(Number.isFinite(data.player.yaw))cameraYaw=data.player.yaw;
                    if(Number.isFinite(data.player.pitch))cameraPitch=THREE.MathUtils.clamp(data.player.pitch,-1.23,1.16);
                }
                if(Number.isFinite(data.timeOfDay))timeOfDay=data.timeOfDay%DAY_LENGTH;
                if(Number.isFinite(data.exposure))renderer.toneMappingExposure=THREE.MathUtils.clamp(data.exposure,.55,1.05);
                if(state.pendingOrders.length)dispatchTruckIfNeeded();
                return true;
            }catch(e){console.warn('Could not restore save:',e);return false;}
        }
        window.addEventListener('pagehide',saveGame);
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveGame();});
