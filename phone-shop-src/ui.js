        const moneyText = value => Math.round(value).toLocaleString('en-IN');
        function showEl(el, visible) { if (el) el.classList.toggle('hidden', !visible); }
        function showToast(msg) {
            const banner = document.getElementById('toast-banner');
            document.getElementById('toast-msg').textContent = msg;
            showEl(banner, true);
            clearTimeout(banner.hideTimeout);
            banner.hideTimeout = setTimeout(() => showEl(banner, false), 2800);
        }
        const phoneIcon = '<svg viewBox="0 0 24 24" fill="none"><rect x="7.5" y="3" width="9" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M11 17.8h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        const shelfIcon = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 6h16M5 6v13M19 6v13M5 12h14M5 18h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
        const personIcon = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.5" stroke="currentColor" stroke-width="1.8"/><path d="M5 20v-1a7 7 0 0 1 14 0v1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        function renderAllMenus() {
            const brandsContainer = document.getElementById('panel-brands');
            const storeContainer = document.getElementById('panel-store-upgrades');
            const playerContainer = document.getElementById('panel-player-upgrades');
            const staffContainer = document.getElementById('panel-staff-upgrades');
            brandsContainer.innerHTML=''; storeContainer.innerHTML=''; playerContainer.innerHTML=''; staffContainer.innerHTML='';
            document.querySelectorAll('.modal-balance-value').forEach(el => el.textContent = '₹' + moneyText(state.money));
            const queued = state.pendingOrders.reduce((n,o)=>n+o.count,0);
            document.getElementById('manifest-summary').textContent = queued ? `${queued} phone${queued===1?'':'s'} in delivery` : 'Delivery ready';
            PHONE_BRANDS.forEach(b => {
                const unit = Math.round(b.boxPrice / b.boxCount), profit = b.sellPrice - unit;
                const card = document.createElement('article'); card.className='catalog-card';
                card.innerHTML = `<div class="card-top"><div class="card-icon" style="background:${b.hex}">${phoneIcon}</div><div class="card-title"><strong>${b.name}</strong><span>${b.model}</span></div><span class="card-badge ${b.unlocked?'accent':''}">${b.unlocked?b.tier:'LOCKED'}</span></div>
                    <div class="card-details"><span>SELLS FOR <b>₹${moneyText(b.sellPrice)}</b></span><span class="positive">+ ₹${moneyText(profit)} / PHONE</span></div>
                    <div class="card-buttons">${b.unlocked ? `<button class="card-button buy-one" ${state.money<unit?'disabled':''}>+ 1 &nbsp; ₹${moneyText(unit)}</button><button class="card-button primary buy-three" ${state.money<b.boxPrice?'disabled':''}>+ 3 &nbsp; ₹${moneyText(b.boxPrice)}</button>` : `<button class="card-button primary unlock" ${state.money<b.unlockCost?'disabled':''}>Unlock brand &nbsp; ₹${moneyText(b.unlockCost)}</button>`}</div>`;
                if (b.unlocked) {
                    card.querySelector('.buy-one').onclick=()=>orderSupplierDelivery(b.id,1);
                    card.querySelector('.buy-three').onclick=()=>orderSupplierDelivery(b.id,3);
                } else card.querySelector('.unlock').onclick=()=>orderSupplierDelivery(b.id,3);
                brandsContainer.appendChild(card);
            });
            FURNITURE.forEach(type => {
                const count=type.cols*type.rows*type.levels;
                const color='#'+type.color.toString(16).padStart(6,'0');
                const card=document.createElement('article');card.className='catalog-card';
                card.innerHTML=`<div class="card-top"><div class="card-icon" style="background:${color}">${shelfIcon}</div><div class="card-title"><strong>${type.name}</strong><span>${type.width.toFixed(1)} × ${type.depth.toFixed(1)} m · delivered to bay</span></div><span class="card-badge accent">${count} SLOTS</span></div><div class="card-details"><span>DISPLAY LEVELS <b>${type.levels}</b></span><span class="positive">PLACE IN YOUR SHOP</span></div><div class="card-buttons"><button class="card-button primary" ${state.money<type.cost?'disabled':''}>Order furniture &nbsp; ₹${moneyText(type.cost)}</button></div>`;
                card.querySelector('button').onclick=()=>orderFurniture(type);storeContainer.appendChild(card);
            });
            STORE_UPGRADES.forEach(u => {
                const card=document.createElement('article');card.className='catalog-card';
                card.innerHTML=`<div class="card-top"><div class="card-icon" style="background:#54546c">${shelfIcon}</div><div class="card-title"><strong>${u.name}</strong><span>Make room for more</span></div><span class="card-badge accent">EXPANSION</span></div><div class="card-description">${u.desc}.</div><div class="card-buttons"><button class="card-button primary" ${(u.purchased||state.money<u.cost)?'disabled':''}>${u.purchased?'Expansion installed':`Expand store &nbsp; ₹${moneyText(u.cost)}`}</button></div>`;
                if(!u.purchased) card.querySelector('button').onclick=()=>purchaseStoreUpgrade(u.id);
                storeContainer.appendChild(card);
            });
            LEVEL_UPGRADES.forEach(u => {
                const maxed=u.level>=u.maxLevel, req=u.requires?LEVEL_UPGRADES.find(x=>x.id===u.requires):null;
                const locked=!!(req && req.level===0), cost=getUpgradeCost(u);
                const card=document.createElement('article');card.className='catalog-card';
                let button = maxed ? (u.maxLevel===1?'Hired':'Maximum level') : locked ? `Hire ${req.name.replace('Hire ','')} first` : `${u.maxLevel===1?'Hire':'Upgrade'} &nbsp; ₹${moneyText(cost)}`;
                card.innerHTML=`<div class="card-top"><div class="card-icon" style="background:${u.category==='player'?'#8d7cde':'#65a88e'}">${personIcon}</div><div class="card-title"><strong>${u.name}</strong><span>${u.getStatText(u.level)}</span></div><span class="card-badge accent">${u.maxLevel===1?(u.level?'HIRED':'AVAILABLE'):`LV ${u.level} / ${u.maxLevel}`}</span></div><div class="card-description">${u.desc}.</div><div class="upgrade-progress"><span style="width:${Math.round(u.level/u.maxLevel*100)}%"></span></div><div class="card-buttons"><button class="card-button primary" ${(maxed||locked||state.money<cost)?'disabled':''}>${button}</button></div>`;
                if(!maxed&&!locked) card.querySelector('button').onclick=()=>purchaseLevelUpgrade(u.id);
                (u.category==='player'?playerContainer:staffContainer).appendChild(card);
            });
        }
        let objectiveTarget = null, objectiveLabel = '', objectiveHeight = 1.9;
        function updateHUD() {
            document.getElementById('money-display').textContent = moneyText(state.money);
            document.getElementById('carry-display').textContent = `${player.carryStack.length}/${state.maxCarry}`;
            document.getElementById('stat-sold').textContent = state.totalSold;
            const queued=state.pendingOrders.reduce((s,o)=>s+o.count,0);
            document.getElementById('delivery-status-badge').textContent = queued ? `Van · ${queued} incoming  /  Bay · ${dynamicCrates.length}` : `Bay · ${dynamicCrates.length} phone${dynamicCrates.length===1?'':'s'}`;
            const available=shelves.filter(s=>s.unlocked), stock=available.reduce((n,s)=>n+s.items.length,0), capacity=available.reduce((n,s)=>n+s.capacity,0);
            document.getElementById('stat-shelves').textContent=`${stock}/${capacity}`;
            document.getElementById('shelf-progress-bar').style.width=`${capacity?Math.min(100,100*stock/capacity):0}%`;
            for(let i=state.stages.length-1;i>=0;i--)if(state.totalRevenue>=state.stages[i].minRev){state.stageIndex=i;break;}
            document.getElementById('stage-badge').textContent=state.stages[state.stageIndex].name.toUpperCase();
            let text=''; objectiveTarget=null; objectiveLabel=''; objectiveHeight=1.9;
            const waiting=customers.some(c=>c.state==='QUEUING');
            const openShelf=available.filter(s=>s.items.length<s.capacity).sort((a,b)=>player.pos.distanceToSquared(a.pos)-player.pos.distanceToSquared(b.pos))[0];
            if(cashPileBundles.length>0){
                text='Collect your earnings from the cash pile.'; objectiveTarget=CASH_PILE_POS;objectiveLabel='CASH PILE';objectiveHeight=1.0;
            } else if(waiting && !cashierStaff){
                text='A customer is ready. Stand behind the checkout to serve them.';objectiveTarget=CASHIER_SPOT;objectiveLabel='CHECKOUT';objectiveHeight=2.0;
            } else if(player.carryStack.length>0 && openShelf){
                text='Take your phones to a display table to stock it.';objectiveTarget=openShelf.pos;objectiveLabel='DISPLAY TABLE';objectiveHeight=1.45;
            } else if(dynamicCrates.length>0 && player.carryStack.length<state.maxCarry){
                text=state.totalSold===0?'Walk to the loading bay to collect your starter stock.':'Pick up your phones from the loading bay.';objectiveTarget=LOADING_BAY_POS;objectiveLabel='LOADING BAY';objectiveHeight=2.3;
            } else if(player.carryStack.length>0 && !openShelf){
                text='Your displays are full. Wait for a sale or order more furniture.';
            } else if(queued){
                text='Your delivery is on the way to the loading bay.';objectiveTarget=LOADING_BAY_POS;objectiveLabel='LOADING BAY';objectiveHeight=2.3;
            } else if(stock>0 || waiting || customers.some(c=>c.carriedItem && c.state!=='LEAVING')){
                text=cashierStaff?'Your team is serving customers. Keep your displays stocked.':'Customers are browsing. Be ready at the checkout.';objectiveTarget=COUNTER_POS;objectiveLabel='CHECKOUT';objectiveHeight=2;
            } else {
                text='Open Supplier to order more phones for your shop.';
            }
            document.getElementById('objective-text').textContent=text;
            showEl(document.getElementById('objective-direction'),!!objectiveTarget);
            document.querySelectorAll('.modal-balance-value').forEach(el => el.textContent = '₹' + moneyText(state.money));
        }
        let targetShelfTimer=0, hudUpdateAccumulator=.08;
        function updateFirstPersonHUD(dt) {
            hudUpdateAccumulator += dt;
            if (hudUpdateAccumulator < .067) return;
            const hudDt = hudUpdateAccumulator; hudUpdateAccumulator = 0;
            const marker=document.getElementById('world-marker');
            if(objectiveTarget && !state.activeDrawer){
                const dx=objectiveTarget.x-player.pos.x,dz=objectiveTarget.z-player.pos.z,dist=Math.hypot(dx,dz);
                const desired=Math.atan2(-dx,-dz), delta=desired-cameraYaw;
                document.getElementById('direction-arrow').style.transform=`rotate(${-delta*180/Math.PI}deg)`;
                document.getElementById('direction-distance').textContent=dist<1?'HERE':`${Math.round(dist)}m`;
                const p=objectiveTarget.clone();p.y=objectiveHeight;p.project(camera);
                const screenX=(p.x*.5+.5)*innerWidth,screenY=(-p.y*.5+.5)*innerHeight;
                const inView=p.z>-1&&p.z<1&&Math.abs(p.x)<.9&&p.y<.78&&p.y>-.8&&!(screenX<330&&screenY<300);
                showEl(marker,inView);
                if(inView){marker.style.left=screenX+'px';marker.style.top=screenY+'px';document.getElementById('marker-text').textContent=objectiveLabel;document.getElementById('marker-distance').textContent=`${Math.max(1,Math.round(dist))}m`;}
            } else showEl(marker,false);
            targetShelfTimer-=hudDt;
            if(targetShelfTimer<=0){
                targetShelfTimer=.16;
                const shelf=targetedShelf();
                showEl(moveDisplayButton,!!shelf&&!furnitureCarry&&!holdFurniture);
            }
            const hint=document.getElementById('interaction-hint');
            let text='';
            if(!state.activeDrawer && !furnitureCarry){
                const bayDist=player.pos.distanceTo(LOADING_BAY_POS);
                if(dynamicCrates.length&&bayDist<2.9&&player.carryStack.length<state.maxCarry) text='PICKING UP STOCK AUTOMATICALLY';
                else if(player.carryStack.length&&shelves.some(s=>s.unlocked&&s.items.length<s.capacity&&player.pos.distanceTo(s.pos)<2.55)) text='STOCKING DISPLAY AUTOMATICALLY';
                else if(customers.some(c=>c.state==='QUEUING')&&!cashierStaff&&player.pos.distanceTo(CASHIER_SPOT)<1.75) text='SERVING CUSTOMER';
                else if(!cashierStaff&&floorPads.some(p=>p.id==='cashier'&&p.active&&player.pos.distanceTo(p.pos)<1.55)) text='STAND HERE TO HIRE A CASHIER · ₹5,500';
            }
            hint.textContent=text;showEl(hint,!!text);
        }
        const drawerOverlay=document.getElementById('drawer-overlay');
        const drawerStore=document.getElementById('drawer-store');
        const drawerStaff=document.getElementById('drawer-staff');
        const drawerHelp=document.getElementById('drawer-help');
        function switchShopTab(tab){state.shopTab=tab;const phones=tab==='phones';document.getElementById('tab-btn-phones').classList.toggle('active',phones);document.getElementById('tab-btn-furniture').classList.toggle('active',!phones);showEl(document.getElementById('tab-content-phones'),phones);showEl(document.getElementById('tab-content-furniture'),!phones);}
        function switchUpgradeTab(tab){state.upgradeTab=tab;const playerTab=tab==='player';document.getElementById('tab-btn-player').classList.toggle('active',playerTab);document.getElementById('tab-btn-workers').classList.toggle('active',!playerTab);showEl(document.getElementById('tab-content-player'),playerTab);showEl(document.getElementById('tab-content-workers'),!playerTab);}
        function toggleTopDrawer(which){
            const next=(which===null||state.activeDrawer===which)?null:which;
            state.activeDrawer=next;
            Object.keys(input.keys).forEach(key=>input.keys[key]=false);input.joyVec.set(0,0);cancelFurnitureHold();
            if(next){releaseCursor();renderAllMenus();}
            showEl(drawerOverlay,!!next);showEl(drawerStore,next==='store');showEl(drawerStaff,next==='staff');showEl(drawerHelp,next==='help');
            if(next==='store')switchShopTab(state.shopTab);
            if(next==='staff')switchUpgradeTab(state.upgradeTab);
        }
        document.getElementById('tab-btn-phones').onclick=()=>switchShopTab('phones');
        document.getElementById('tab-btn-furniture').onclick=()=>switchShopTab('furniture');
        document.getElementById('tab-btn-player').onclick=()=>switchUpgradeTab('player');
        document.getElementById('tab-btn-workers').onclick=()=>switchUpgradeTab('workers');
        document.getElementById('btn-menu-store').onclick=()=>toggleTopDrawer('store');
        document.getElementById('btn-menu-staff').onclick=()=>toggleTopDrawer('staff');
        document.getElementById('btn-help').onclick=()=>toggleTopDrawer('help');
        document.getElementById('btn-close-store').onclick=()=>toggleTopDrawer(null);
        document.getElementById('btn-close-staff').onclick=()=>toggleTopDrawer(null);
        document.getElementById('btn-close-help').onclick=()=>toggleTopDrawer(null);
        drawerOverlay.addEventListener('pointerdown',e=>{if(e.target===drawerOverlay)toggleTopDrawer(null);});
        document.getElementById('btn-sound').onclick=()=>{sfx.enabled=!sfx.enabled;showEl(document.getElementById('icon-sound-on'),sfx.enabled);showEl(document.getElementById('icon-sound-off'),!sfx.enabled);};
        function syncBrightnessControl(){
            const value=Math.round(renderer.toneMappingExposure*100);
            document.getElementById('brightness-control').value=String(value);
            document.getElementById('brightness-value').textContent=`${value}%`;
        }
        document.getElementById('brightness-control').addEventListener('input',event=>{
            renderer.toneMappingExposure=THREE.MathUtils.clamp(Number(event.target.value)/100,.55,1.05);
            syncBrightnessControl();saveGame();
        });
        let resetArmed=false, resetTimeout;
        document.getElementById('btn-reset').onclick=()=>{
            const btn=document.getElementById('btn-reset');
            if(!resetArmed){resetArmed=true;btn.textContent='Tap again to confirm';clearTimeout(resetTimeout);resetTimeout=setTimeout(()=>{resetArmed=false;btn.textContent='Reset progress';},4000);return;}
            resetRequested=true;
            try{localStorage.removeItem(SAVE_KEY);}catch(_){}
            window.location.reload();
        };
