const POSTER_DATA = "__POSTER__";


        /**********************************************************************
         * 1. WEB AUDIO SYNTHESIZER
         **********************************************************************/
        class SoundFX {
            constructor() {
                this.enabled = true;
                this.ctx = null;
            }
            init() {
                if (!this.ctx) {
                    const AudioCtx = window.AudioContext || window.webkitAudioContext;
                    if (AudioCtx) this.ctx = new AudioCtx();
                }
                if (this.ctx && this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }
            playTone(freq = 440, duration = 0.08, type = 'sine', gainVal = 0.1, slideFreq = null) {
                if (!this.enabled) return;
                try {
                    this.init();
                    if (!this.ctx) return;
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    if (slideFreq) {
                        osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
                    }
                    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch (e) {}
            }
            pickup(stackIndex = 0) {
                this.playTone(320 + stackIndex * 60, 0.07, 'triangle', 0.12, 460 + stackIndex * 60);
            }
            stockShelf() {
                this.playTone(500, 0.08, 'sine', 0.12, 720);
            }
            cashRegister() {
                this.playTone(880, 0.06, 'triangle', 0.12);
                setTimeout(() => this.playTone(1174, 0.12, 'triangle', 0.12), 60);
            }
            collectMoney(combo = 0) {
                const pitch = Math.min(1480, 600 + combo * 45);
                this.playTone(pitch, 0.06, 'sine', 0.1, pitch * 1.15);
            }
            unlock() {
                [440, 554, 659, 880].forEach((f, idx) => {
                    setTimeout(() => this.playTone(f, 0.12, 'triangle', 0.12), idx * 65);
                });
            }
            truckHorn() {
                this.playTone(220, 0.1, 'sawtooth', 0.06);
                setTimeout(() => this.playTone(280, 0.15, 'sawtooth', 0.07), 100);
            }
        }
        const sfx = new SoundFX();

        /**********************************************************************
         * 2. FICTIONAL PHONE BRANDS & UPGRADES DATA
         **********************************************************************/
        const PHONE_BRANDS = [
            {
                id: 'kokia',
                name: 'Kokia',
                model: '3310 Brick',
                inspiration: 'Nokia',
                color: 0x1e3a8a,
                accent: 0x93c5fd,
                hex: '#2563eb',
                unlockCost: 0,
                unlocked: true,
                boxPrice: 1200,
                boxCount: 3,
                sellPrice: 950,
                tier: 'Tier 1'
            },
            {
                id: 'siaomi',
                name: 'Siaomi',
                model: 'Note Pro',
                inspiration: 'Xiaomi',
                color: 0xea580c,
                accent: 0xfed7aa,
                hex: '#ea580c',
                unlockCost: 2000,
                unlocked: false,
                boxPrice: 2100,
                boxCount: 3,
                sellPrice: 1650,
                tier: 'Tier 2'
            },
            {
                id: 'hansung',
                name: 'Hansung',
                model: 'S-Ultra',
                inspiration: 'Samsung',
                color: 0x0284c7,
                accent: 0xe0f2fe,
                hex: '#0284c7',
                unlockCost: 4500,
                unlocked: false,
                boxPrice: 3600,
                boxCount: 3,
                sellPrice: 2800,
                tier: 'Tier 3'
            },
            {
                id: 'everything',
                name: 'Everything',
                model: 'Phone (1)',
                inspiration: 'Nothing',
                color: 0x18181b,
                accent: 0xffffff,
                hex: '#52525b',
                unlockCost: 9000,
                unlocked: false,
                boxPrice: 6000,
                boxCount: 3,
                sellPrice: 4600,
                tier: 'Tier 4'
            },
            {
                id: 'ipear',
                name: 'I Pear',
                model: '18 Pro Max',
                inspiration: 'Apple',
                color: 0xd97706,
                accent: 0xfef3c7,
                hex: '#d97706',
                unlockCost: 18000,
                unlocked: false,
                boxPrice: 10500,
                boxCount: 3,
                sellPrice: 8200,
                tier: 'Tier 5'
            }
        ];

        // Store Expansion & Display Shelf Upgrades
        const STORE_UPGRADES = [
            {
                id: 'expand_shop',
                name: 'Store Expansion',
                desc: 'Expand floor space & double customer arrival rate',
                cost: 15000,
                purchased: false,
                tag: 'Expansion'
            }
        ];

        // Multi-Level Player & Staff Upgrades
        const LEVEL_UPGRADES = [
            {
                id: 'player_carry',
                category: 'player',
                name: 'Player Carry Limit',
                desc: 'Increase max phones you can hold at once (+2 per level)',
                level: 1,
                maxLevel: 6,
                baseCost: 1800,
                costMult: 1.65,
                getStatText: (lvl) => `Cap: ${4 + (lvl - 1) * 2} phones`
            },
            {
                id: 'player_speed',
                category: 'player',
                name: 'Player Move Speed',
                desc: 'Walk faster around the store (+10% speed per level)',
                level: 1,
                maxLevel: 5,
                baseCost: 1500,
                costMult: 1.65,
                getStatText: (lvl) => `Speed: ${Math.round((1 + (lvl - 1) * 0.1) * 100)}%`
            },
            {
                id: 'hire_stocker',
                category: 'staff',
                name: 'Hire Restocker',
                desc: 'Automatically carries phones from the Loading Bay to shelves',
                level: 0,
                maxLevel: 1,
                baseCost: 7500,
                costMult: 1,
                getStatText: (lvl) => lvl > 0 ? 'Active on Floor' : 'Not Hired'
            },
            {
                id: 'stocker_carry',
                category: 'staff',
                requires: 'hire_stocker',
                name: 'Restocker Carry Limit',
                desc: 'Increase max phones your Restocker carries per trip (+2/lvl)',
                level: 1,
                maxLevel: 5,
                baseCost: 2600,
                costMult: 1.6,
                getStatText: (lvl) => `Cap: ${3 + (lvl - 1) * 2} phones`
            },
            {
                id: 'stocker_speed',
                category: 'staff',
                requires: 'hire_stocker',
                name: 'Restocker Speed',
                desc: 'Increase Restocker walking and stocking speed (+15%/lvl)',
                level: 1,
                maxLevel: 5,
                baseCost: 2400,
                costMult: 1.6,
                getStatText: (lvl) => `Speed: ${Math.round((1 + (lvl - 1) * 0.15) * 100)}%`
            },
            {
                id: 'hire_cashier',
                category: 'staff',
                name: 'Hire Cashier',
                desc: 'Automatically rings up customers at the Checkout Counter',
                level: 0,
                maxLevel: 1,
                baseCost: 5500,
                costMult: 1,
                getStatText: (lvl) => lvl > 0 ? 'Active at Desk' : 'Not Hired'
            },
            {
                id: 'cashier_speed',
                category: 'staff',
                requires: 'hire_cashier',
                name: 'Cashier Checkout Speed',
                desc: 'Ring up waiting customers much faster (+25% speed/lvl)',
                level: 1,
                maxLevel: 5,
                baseCost: 2200,
                costMult: 1.6,
                getStatText: (lvl) => `Rate: ${Math.round((1 + (lvl - 1) * 0.25) * 100)}%`
            }
        ];

        function getUpgradeCost(u) {
            return Math.round((u.baseCost * Math.pow(u.costMult, Math.max(0, u.level - (u.maxLevel === 1 ? 0 : 1)))) / 50) * 50;
        }

        /**********************************************************************
         * 3. GAME STATE
         **********************************************************************/
        const BASE_PLAYER_SPEED = 3.45;
        const BASE_STOCKER_SPEED = 2.65;

        const state = {
            money: 5000,
            totalSold: 0,
            totalRevenue: 0,
            maxCarry: 4,
            playerSpeed: BASE_PLAYER_SPEED,
            stockerMaxCarry: 3,
            stockerSpeed: BASE_STOCKER_SPEED,
            checkoutSpeedMult: 1.0,
            shopExpanded: false,
            stageIndex: 0,
            stages: [
                { name: 'Stage 1: Beginner', minRev: 0 },
                { name: 'Stage 2: Growing', minRev: 3000 },
                { name: 'Stage 3: Established', minRev: 12000 },
                { name: 'Stage 4: Advanced', minRev: 30000 },
                { name: 'Stage 5: Empire', minRev: 65000 }
            ],
            pendingOrders: [],
            activeDrawer: null,
            shopTab: 'phones',
            upgradeTab: 'player',
            zoomIndex: 0,
            zoomLevels: [13.2, 16.0, 10.5]
        };

        /**********************************************************************
         * 4. HIGH-PERFORMANCE THREE.JS SCENE & SHARED MATERIALS
         **********************************************************************/
        const canvas = document.getElementById('game-canvas');
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',stencil:false});
        } catch(error) {
            document.getElementById('error-screen').classList.remove('hidden');
            throw error;
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, navigator.maxTouchPoints > 0 ? 1.25 : 1.5));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.92;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xcbded8);

        let cameraYaw = -0.19, cameraPitch = -0.075, bobPhase = 0;
        const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .055, 110);
        camera.rotation.order = 'YXZ';

        const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.58);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xfffbeb, 0.62);
        dirLight.position.set(14, 24, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 2;
        dirLight.shadow.camera.far = 55;
        const d = 16;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.bias = -0.001;
        scene.add(dirLight);

        // A complete day lasts two real-time minutes. Lighting changes gradually
        // without changing game speed, spawning, or navigation.
        const DAY_LENGTH = 120;
        let timeOfDay = 0;
        const daySky = new THREE.Color(0xc3dcd7), nightSky = new THREE.Color(0x1d2948);
        const dayAmbient = new THREE.Color(0xfff2df), nightAmbient = new THREE.Color(0x839ac8);
        const daySun = new THREE.Color(0xffedcf), nightMoon = new THREE.Color(0x9cb6e8);
        const shopLights = [];
        function updateDayNight(dt) {
            timeOfDay = (timeOfDay + dt) % DAY_LENGTH;
            const sunHeight = Math.cos(timeOfDay / DAY_LENGTH * Math.PI * 2);
            // Smooth twilight around the horizon, rather than a sudden switch.
            const daylight = THREE.MathUtils.smoothstep(sunHeight, -0.28, 0.28);
            scene.background.copy(nightSky).lerp(daySky, daylight);
            ambientLight.color.copy(nightAmbient).lerp(dayAmbient, daylight);
            ambientLight.intensity = 0.42 + daylight * 0.14;
            dirLight.color.copy(nightMoon).lerp(daySun, daylight);
            dirLight.intensity = 0.20 + daylight * 0.43;
            shopLights.forEach(light => { light.intensity = 0.30 + (1 - daylight) * 0.28; });
        }

        const sharedGeos = {
            box: new THREE.BoxGeometry(1, 1, 1),
            cyl: new THREE.CylinderGeometry(1, 1, 1, 10),
            sphere: new THREE.SphereGeometry(1, 12, 10),
            plane: new THREE.PlaneGeometry(1, 1)
        };

        const matCache = new Map();
        function getMat(colorHex) {
            if (!matCache.has(colorHex)) {
                matCache.set(colorHex, new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.79, metalness: 0.025 }));
            }
            return matCache.get(colorHex);
        }

        // Rounded profile in plan: low-segment corners preserve a crisp, stylized silhouette.
        function roundedSlab(w, h, d, radius, color) {
            const r = Math.min(radius, w / 2, d / 2), shape = new THREE.Shape();
            shape.moveTo(-w / 2 + r, -d / 2); shape.lineTo(w / 2 - r, -d / 2); shape.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
            shape.lineTo(w / 2, d / 2 - r); shape.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
            shape.lineTo(-w / 2 + r, d / 2); shape.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
            shape.lineTo(-w / 2, -d / 2 + r); shape.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
            const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 2 });
            geo.rotateX(-Math.PI / 2); geo.translate(0, -h / 2, 0);
            return new THREE.Mesh(geo, getMat(color));
        }
        const shadowBlobMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.25, depthWrite: false });

        function createFloorSignMesh(title, subtitle, bgHex = '#0f172a', borderHex = '#3b82f6', width = 2.8, height = 1.1) {
            const c = document.createElement('canvas');
            c.width = 256;
            c.height = 96;
            const ctx = c.getContext('2d');

            ctx.fillStyle = bgHex;
            ctx.fillRect(0, 0, 256, 96);
            ctx.strokeStyle = borderHex;
            ctx.lineWidth = 8;
            ctx.strokeRect(4, 4, 248, 88);

            ctx.fillStyle = '#ffffff';
            ctx.font = '800 24px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(title, 128, subtitle ? 44 : 56);

            if (subtitle) {
                ctx.fillStyle = '#38bdf8';
                ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
                ctx.fillText(subtitle, 128, 74);
            }

            const tex = new THREE.CanvasTexture(c);
            tex.minFilter = THREE.LinearFilter;
            const mat = new THREE.MeshBasicMaterial({ map: tex });
            const mesh = new THREE.Mesh(sharedGeos.plane, mat);
            mesh.rotation.x = -Math.PI / 2;
            mesh.scale.set(width, height, 1);
            return { mesh, canvas: c, ctx, tex };
        }

        // Stock drops use a small deterministic gravity simulation. No external physics download is required.
        let rapierWorld = null, rapierReady = false;
        const dynamicCrates = [];

        /**********************************************************************
         * 6. LOW-POLY PROCEDURAL MESH BUILDERS
         **********************************************************************/
        function createPhoneItemMesh(brand) {
            const group = new THREE.Group();
            const box = roundedSlab(.35,.105,.51,.025,0xf2f0eb); group.add(box);
            const band = roundedSlab(.345,.018,.50,.02,brand.color); band.position.y=.048; group.add(band);
            const phone = roundedSlab(.205,.021,.365,.023,0x1c2431); phone.position.y=.064; group.add(phone);
            const screen = roundedSlab(.175,.008,.324,.017,brand.accent); screen.position.y=.079;group.add(screen);
            const sheen = roundedSlab(.045,.004,.25,.005,0xffffff);sheen.position.set(-.047,.084,.015);group.add(sheen);
            const cameraDot=new THREE.Mesh(sharedGeos.cyl,getMat(0x101a24));cameraDot.scale.set(.012,.006,.012);cameraDot.position.set(0,.085,-.135);group.add(cameraDot);
            group.userData.brand=brand;return group;
        }

        const cashNoteMat = getMat(0x22c55e);
        const cashStrapMat = getMat(0xfef08a);
        function createCashBundleMesh() {
            const group = new THREE.Group();
            const note = new THREE.Mesh(sharedGeos.box, cashNoteMat);
            note.scale.set(0.50, 0.13, 0.28);
            group.add(note);

            const strap = new THREE.Mesh(sharedGeos.box, cashStrapMat);
            strap.scale.set(0.12, 0.14, 0.30);
            group.add(strap);
            return group;
        }

        // Smooth, hand-shaped surfaces shared across characters. A lathed profile
        // gives each body part a continuous silhouette instead of stacked primitives.
        function characterSurface(profile) {
            return new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(p[0], p[1])), 24);
        }
        const characterGeos = {
            torso: characterSurface([[0,0],[.23,.01],[.31,.09],[.33,.25],[.37,.52],[.34,.69],[.25,.77],[.12,.79],[0,.79]]),
            arm: characterSurface([[0,-.59],[.09,-.58],[.125,-.51],[.13,-.35],[.155,-.17],[.17,-.04],[.14,.07],[0,.10]]),
            leg: characterSurface([[0,-.57],[.12,-.56],[.15,-.49],[.15,-.30],[.17,-.08],[.15,.07],[0,.10]]),
            head: new THREE.SphereGeometry(1, 24, 18),
            hair: new THREE.SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * .51)
        };
                function createStickman(colorHex, options = {}) {
            const root=new THREE.Group(), bodyRig=new THREE.Group();root.add(bodyRig);
            bodyRig.scale.setScalar(.82);
            const shadow=new THREE.Mesh(sharedGeos.plane,shadowBlobMat);
            shadow.rotation.x=-Math.PI/2;shadow.scale.set(.64,.64,1);shadow.position.y=.02;root.add(shadow);
            const skinTones=[0xe4b899,0xc98e6b,0xf1c5a5,0x98684e,0xb77d5c];
            const hairTones=[0x352c29,0x4d392d,0x29272b,0x6b5140,0x3e3231];
            const pantsTones=[0x353f50,0x3e4653,0x45454a,0x3a4749];
            const skin=skinTones[Math.floor(Math.random()*skinTones.length)];
            const hair=hairTones[Math.floor(Math.random()*hairTones.length)];
            const pants=pantsTones[Math.floor(Math.random()*pantsTones.length)],shoes=0x29303a,shirt=options.vestColor||colorHex;
            function part(parent,geo,color,x,y,z,sx,sy,sz){
                const mesh=new THREE.Mesh(geo,getMat(color));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);
                mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
            }
            // More natural proportions and a little clothing detail, while retaining
            // the inexpensive articulated bodies and walk animation of the original.
            part(bodyRig,characterGeos.torso,shirt,0,.76,0,.87,1,.72);
            part(bodyRig,characterGeos.head,skin,0,1.53,0,.095,.14,.095);
            part(bodyRig,characterGeos.head,skin,0,1.79,0,.218,.267,.203);
            part(bodyRig,characterGeos.head,skin,-.213,1.78,0,.035,.055,.039);
            part(bodyRig,characterGeos.head,skin,.213,1.78,0,.035,.055,.039);
            for(const x of [-.073,.073]){
                part(bodyRig,characterGeos.head,0x2b3037,x,1.81,.192,.014,.020,.008);
                part(bodyRig,characterGeos.head,0xf4f3ee,x-.004,1.819,.200,.004,.005,.003);
            }
            part(bodyRig,characterGeos.head,skin,0,1.765,.201,.026,.036,.026);
            part(bodyRig,characterGeos.head,0x9b645a,0,1.675,.187,.036,.008,.006);
            if(options.hatColor){
                part(bodyRig,characterGeos.hair,options.hatColor,0,1.96,0,.24,.155,.22);
                const brim=roundedSlab(.38,.035,.22,.07,options.hatColor);brim.position.set(0,1.97,.14);bodyRig.add(brim);
            }else{
                part(bodyRig,characterGeos.hair,hair,0,1.94,-.012,.225,.165,.21);
            }
            function limb(x,y,isArm){
                const pivot=new THREE.Group();pivot.position.set(x,y,0);bodyRig.add(pivot);
                if(isArm){
                    part(pivot,characterGeos.arm,shirt,0,0,0,.85,1,.8);
                    part(pivot,characterGeos.head,skin,0,-.56,.01,.088,.11,.088);
                }else{
                    part(pivot,characterGeos.leg,pants,0,0,0,.9,1,.85);
                    part(pivot,characterGeos.head,shoes,0,-.56,.07,.135,.08,.18);
                }
                return pivot;
            }
            const leftArm=limb(-.29,1.42,true),rightArm=limb(.29,1.42,true);
            const leftLeg=limb(-.145,.71,false),rightLeg=limb(.145,.71,false);
            const carryAnchor=new THREE.Group();carryAnchor.position.set(0,.87,.42);root.add(carryAnchor);
            let statusBadge=null;
            if(options.hasStatusBadge){
                statusBadge=new THREE.Mesh(sharedGeos.box,getMat(0x8c7be6));statusBadge.scale.set(.17,.17,.17);
                statusBadge.position.set(0,1.92,0);statusBadge.rotation.y=Math.PI/4;statusBadge.visible=false;root.add(statusBadge);
            }
            root.userData={bodyRig,leftLeg,rightLeg,leftArm,rightArm,carryAnchor,statusBadge,walkCycle:Math.random()*10};
            return root;
        }


        function animateStickman(stickman, isMoving, isCarrying, dt) {
            const u = stickman.userData;
            if (isMoving) {
                u.walkCycle += dt * 13;
                const swing = Math.sin(u.walkCycle) * 0.55;
                u.leftLeg.rotation.x = swing;
                u.rightLeg.rotation.x = -swing;
                u.bodyRig.position.y = Math.abs(Math.cos(u.walkCycle)) * 0.045;
                u.bodyRig.rotation.z = Math.sin(u.walkCycle) * 0.035;
                if (isCarrying) {
                    u.leftArm.rotation.x = -1.15;
                    u.rightArm.rotation.x = -1.15;
                } else {
                    u.leftArm.rotation.x = -swing * 0.65;
                    u.rightArm.rotation.x = swing * 0.65;
                }
            } else {
                u.leftLeg.rotation.x *= 0.8;
                u.rightLeg.rotation.x *= 0.8;
                u.bodyRig.position.y *= 0.8;
                u.bodyRig.rotation.z *= 0.8;
                if (isCarrying) {
                    u.leftArm.rotation.x = -1.15;
                    u.rightArm.rotation.x = -1.15;
                } else {
                    u.leftArm.rotation.x *= 0.8;
                    u.rightArm.rotation.x *= 0.8;
                }
            }
        }

        /**********************************************************************
         * 7. SHOP ENVIRONMENT
         **********************************************************************/
        const worldGroup = new THREE.Group();
        scene.add(worldGroup);

        const street = new THREE.Mesh(sharedGeos.box, getMat(0x9bc78e));
        street.scale.set(44, 0.3, 44);
        street.position.set(0, -0.2, 0);
        street.receiveShadow = true;
        worldGroup.add(street);

        const road = new THREE.Mesh(sharedGeos.box, getMat(0x657179));
        road.scale.set(44, 0.32, 5.6);
        road.position.set(0, -0.18, 10.6);
        worldGroup.add(road);

        const dashInst = new THREE.InstancedMesh(sharedGeos.box, getMat(0xf4e6c9), 9);
        const dummyMat = new THREE.Matrix4();
        for (let i = 0; i < 9; i++) {
            dummyMat.makeScale(1.8, 0.04, 0.2);
            dummyMat.setPosition(-16 + i * 4, 0.01, 10.6);
            dashInst.setMatrixAt(i, dummyMat);
        }
        worldGroup.add(dashInst);

        const shopFloor = new THREE.Mesh(sharedGeos.box, getMat(0xfff2df));
        shopFloor.scale.set(14, 0.16, 12);
        shopFloor.position.set(0.5, 0.0, -0.5);
        shopFloor.receiveShadow = true;
        worldGroup.add(shopFloor);

        let tileInstMesh = null;
        function buildFloorTiles(widthSpan = 12) {
            if (tileInstMesh) worldGroup.remove(tileInstMesh);
            // Subtle, correctly sized checker tiles instead of isolated squares.
            const coords = [];
            const columns = widthSpan === 12 ? 14 : 17;
            for (let x = 0; x < columns; x++) {
                for (let z = 0; z < 12; z++) {
                    if ((x + z) % 2 === 0) coords.push([-6 + x, -6 + z]);
                }
            }
            tileInstMesh = new THREE.InstancedMesh(sharedGeos.box, getMat(0xf4e4d7), coords.length);
            tileInstMesh.receiveShadow = true;
            const m = new THREE.Matrix4();
            coords.forEach(([x, z], idx) => {
                m.makeScale(0.98, 0.015, 0.98);
                m.setPosition(x, 0.09, z); tileInstMesh.setMatrixAt(idx, m);
            });
            tileInstMesh.instanceMatrix.needsUpdate = true;
            worldGroup.add(tileInstMesh);
        }
        buildFloorTiles(12);

        const backWall = new THREE.Mesh(sharedGeos.box, getMat(0xfff4e9));
        backWall.scale.set(14.4, 3.4, 0.45);
        backWall.position.set(0.5, 1.7, -6.5);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        worldGroup.add(backWall);

        const backTrim = new THREE.Mesh(sharedGeos.box, getMat(0x7459b7));
        backTrim.scale.set(14.5, 0.3, 0.52);
        backTrim.position.set(0.5, 3.45, -6.5);
        worldGroup.add(backTrim);

        const leftWall = new THREE.Mesh(sharedGeos.box, getMat(0xfbe9db));
        leftWall.scale.set(0.45, 3.4, 8.5);
        leftWall.position.set(-6.5, 1.7, -2.5);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        worldGroup.add(leftWall);

        const leftTrim = new THREE.Mesh(sharedGeos.box, getMat(0x7459b7));
        leftTrim.scale.set(0.52, 0.3, 8.6);
        leftTrim.position.set(-6.5, 3.45, -2.5);
        worldGroup.add(leftTrim);

        const matCarpet = new THREE.Mesh(sharedGeos.box, getMat(0x8d73c8));
        matCarpet.scale.set(3.2, 0.04, 1.3);
        matCarpet.position.set(1.5, 0.09, 5.4);
        worldGroup.add(matCarpet);

        // Streetscape and interior accents are decorative: they never block game navigation.
        function decorBox(parent, x, y, z, w, h, d, color) {
            const mesh = new THREE.Mesh(sharedGeos.box, getMat(color));
            mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
            mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
        }
        // Sidewalk and curb separate the road from the storefronts.
        decorBox(worldGroup, 0, -0.015, 7.4, 44, 0.12, 2.3, 0xe4d8c5);
        decorBox(worldGroup, 0, 0.04, 8.48, 44, 0.16, 0.18, 0xfff1db);
        for (let x = -20; x <= 20; x += 2) decorBox(worldGroup, x, 0.052, 7.4, 0.035, 0.012, 2, 0xc4b7a5);
        decorBox(worldGroup, 0, -0.02, 14.15, 44, 0.12, 1.5, 0xd9d2c0);

        function addTree(x, z, size) {
            const tree = new THREE.Group(); tree.position.set(x, 0, z); tree.scale.setScalar(size * 1.35);
            decorBox(tree, 0, 0.66, 0, 0.3, 1.32, 0.3, 0x936747);
            [[0, 1.75, 0, 0.83], [-0.46, 1.5, 0, 0.58], [0.45, 1.55, 0.08, 0.62], [0, 2.2, 0, 0.62]].forEach(([a,b,c,r], i) => {
                const crown = new THREE.Mesh(sharedGeos.sphere, getMat(i % 2 ? 0x70b96c : 0x53a763));
                crown.position.set(a,b,c); crown.scale.setScalar(r); crown.castShadow = true; tree.add(crown);
            });
            worldGroup.add(tree);
        }
        [[-17,7.25,0.85],[-11,7.25,0.75],[14.5,7.25,0.8],[20,7.25,0.85],[-19,15,0.9],[-12,15,0.8],[0,15,0.8],[10,15,0.9],[19,15,0.8]].forEach(t => addTree(...t));

        // Small neighboring businesses; the first occupies the expansion plot.
        function makeNeighbor(x, width, wall, accent, label) {
            const g = new THREE.Group(); g.position.set(x, 0, -0.5);
            // Match the main shop's open-roof cutaway rather than hiding it
            // behind a solid, oversized neighboring block.
            decorBox(g, 0, 0, 0, width, .16, 10.5, 0xf3e7d6);
            decorBox(g, 0, 1.6, -5.1, width, 3.2, .3, wall);
            decorBox(g, 0, 3.27, -5.1, width + .08, .22, .36, accent);
            decorBox(g, -width/2 + .12, .6, -.1, .24, 1.2, 9.8, wall);
            // A small display and a back-wall sign give each cutaway a purpose.
            decorBox(g, 0, .58, -2.85, width * .72, 1, 1.05, accent);
            decorBox(g, 0, 1.12, -2.85, width * .76, .12, 1.15, 0xfff1dc);
            for (let i = 0; i < 3; i++) {
                decorBox(g, (i-1)*width*.19, 1.28, -2.85, .35, .24, .35,
                    label === 'FLOWERS' ? 0x7ca889 : label === 'BAKERY' ? 0xd8aa73 : 0xb77c64);
            }
            const sign = createFloorSignMesh(label, 'LOCAL SHOP', '#56485a', '#eac9a4', Math.min(width - .35, 3.5), .7);
            sign.mesh.rotation.x = 0; sign.mesh.position.set(0, 2.25, -4.91); g.add(sign.mesh);
            worldGroup.add(g); return g;
        }
        const expansionNeighbor = makeNeighbor(9.45, 3.5, 0xf2bd9f, 0xdc7e77, 'BAKERY');
        makeNeighbor(15.2, 5.7, 0xc3dcd1, 0x4d968d, 'FLOWERS');
        makeNeighbor(-15, 6, 0xeed39e, 0xd69b58, 'CAFE');

        // Warm interior lamps make the shop welcoming after sunset.
        [-4.5, 5.0].forEach(x => {
            decorBox(worldGroup, x, 3.05, -6.12, .45, .12, .3, 0x7a658a);
            const bulb = new THREE.Mesh(sharedGeos.sphere,
                new THREE.MeshBasicMaterial({ color: 0xffe8b5 }));
            bulb.position.set(x, 2.93, -5.98); bulb.scale.set(.13, .13, .13); worldGroup.add(bulb);
            const light = new THREE.PointLight(0xffd799, 0, 9, 2);
            light.position.set(x, 2.8, -4.9); scene.add(light); shopLights.push(light);
        });
        updateDayNight(0);

        // A wall gallery gives the shop a warmer, more colorful identity without
        // placing furniture in the customer's or player's paths.
        decorBox(worldGroup, 0.5, 0.22, -6.22, 13.5, 0.2, 0.1, 0xe1bcaa);
        decorBox(worldGroup, 0.5, 2.25, -6.22, 4.6, 1.15, 0.09, 0xe2d5f4);
        const featureSign = createFloorSignMesh('PHONE SHOP', 'FIND YOUR NEXT FAVORITE', '#624b9b', '#f4c791', 4.1, 0.8);
        featureSign.mesh.rotation.x = 0; featureSign.mesh.position.set(0.5, 2.3, -6.13); worldGroup.add(featureSign.mesh);
        [-4.5, 5.4].forEach(x => {
            decorBox(worldGroup, x, 2.0, -6.18, 1.65, 1.35, 0.1, 0xf6c9b1);
            decorBox(worldGroup, x, 2.0, -6.09, 1.4, 1.1, 0.08, 0xfef5df);
            decorBox(worldGroup, x, 2.0, -6.02, 0.38, 0.76, 0.07, 0x7e6ab5);
            decorBox(worldGroup, x, 2.04, -5.97, 0.28, 0.54, 0.02, 0xa6d8da);
        });

        // Low-poly traffic runs independently in opposite lanes and wraps offscreen.
        const traffic = [];
        function makeCar(x, z, color, speed) {
            const car = new THREE.Group(); car.position.set(x, 0.12, z);
            decorBox(car, 0, 0.36, 0, 2.25, 0.48, 1.02, color);
            decorBox(car, -0.1, 0.73, 0, 1.15, 0.45, 0.88, color);
            decorBox(car, -0.1, 0.78, 0, 1.02, 0.28, 0.91, 0x9ad7e2);
            [-0.7, 0.7].forEach(a => [-0.51, 0.51].forEach(b => {
                const wheel = new THREE.Mesh(sharedGeos.cyl, getMat(0x29313d));
                wheel.rotation.x = Math.PI / 2; wheel.position.set(a, 0.22, b); wheel.scale.set(0.23, 0.12, 0.23); car.add(wheel);
            }));
            decorBox(car, 1.13, 0.4, 0, 0.04, 0.15, 0.72, 0xffedb1);
            worldGroup.add(car); traffic.push({car, speed});
        }
        makeCar(-14, 9.35, 0xf0a266, 3.2); makeCar(6, 9.35, 0x79bac5, 3.2);
        makeCar(14, 11.85, 0xdf798c, -2.6); makeCar(-5, 11.85, 0xe5c15d, -2.6);
        function updateTraffic(dt) {
            traffic.forEach(({car, speed}) => {
                car.position.x += speed * dt;
                if (car.position.x > 23) car.position.x = -23;
                if (car.position.x < -23) car.position.x = 23;
                car.rotation.y = speed < 0 ? Math.PI : 0;
            });
        }

        const LOADING_BAY_POS = new THREE.Vector3(-6.8, 0.08, 4.2);
        const palletGroup = new THREE.Group();
        palletGroup.position.copy(LOADING_BAY_POS);

        const palletBase = new THREE.Mesh(sharedGeos.box, getMat(0xd97706));
        palletBase.scale.set(3.8, 0.2, 3.8);
        palletBase.receiveShadow = true;
        palletGroup.add(palletBase);

        const bayBorder = new THREE.Mesh(sharedGeos.box, getMat(0xfacc15));
        bayBorder.scale.set(4.1, 0.05, 4.1);
        bayBorder.position.y = -0.05;
        palletGroup.add(bayBorder);

        const bayDecal = createFloorSignMesh('LOADING BAY', 'PICK UP STOCK', '#0f172a', '#facc15', 3.2, 1.15);
        bayDecal.mesh.position.set(0, 0.12, 2.55);
        palletGroup.add(bayDecal.mesh);
        worldGroup.add(palletGroup);

        /**********************************************************************
         * 8. CHECKOUT COUNTER & PHYSICAL CASH PILE
         **********************************************************************/
        const COUNTER_POS = new THREE.Vector3(-3.6, 0.08, -2.8);
        const CASHIER_SPOT = new THREE.Vector3(-3.6, 0.08, -4.2);
        const CASH_PILE_POS = new THREE.Vector3(-1.4, 0.08, -2.8);

        const counterGroup = new THREE.Group();
        counterGroup.position.copy(COUNTER_POS);

        const deskBody = new THREE.Mesh(sharedGeos.box, getMat(0x334155));
        deskBody.scale.set(2.8, 1.1, 1.35);
        deskBody.position.y = 0.55;
        deskBody.castShadow = true;
        counterGroup.add(deskBody);
        const frontPanel = roundedSlab(2.57, 0.73, 0.035, 0.03, 0xc4a27a); frontPanel.position.set(0, 0.55, 0.687); counterGroup.add(frontPanel);
        for (let x = -1.15; x < 1.2; x += 0.22) {
            const strip = new THREE.Mesh(sharedGeos.box, getMat(0x9d7f5c));
            strip.scale.set(0.025, 0.67, 0.025);
            strip.position.set(x, 0.55, 0.71);
            counterGroup.add(strip);
        }

        const deskTop = roundedSlab(2.95, 0.14, 1.5, 0.12, 0xf1f2ea);
        deskTop.position.y = 1.15;
        counterGroup.add(deskTop);

        const registerMesh = new THREE.Mesh(sharedGeos.box, getMat(0x0f172a));
        registerMesh.scale.set(0.6, 0.42, 0.5);
        registerMesh.position.set(-0.5, 1.4, 0);
        counterGroup.add(registerMesh);
        const regScreen = new THREE.Mesh(sharedGeos.box, getMat(0x67c9d7)); regScreen.scale.set(0.47, 0.23, 0.018); regScreen.position.set(-0.5, 1.45, 0.258); counterGroup.add(regScreen);

        const standRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const standRing = new THREE.Mesh(sharedGeos.cyl, standRingMat);
        standRing.scale.set(0.9, 0.03, 0.9);
        standRing.position.set(0, 0.03, -1.4);
        counterGroup.add(standRing);

        const counterDecal = createFloorSignMesh('CHECKOUT', 'STAND TO SERVE', '#0f172a', '#38bdf8', 2.5, 0.9);
        counterDecal.mesh.position.set(0, 0.03, 1.25);
        counterGroup.add(counterDecal.mesh);

        worldGroup.add(counterGroup);

        const cashPad = new THREE.Mesh(sharedGeos.box, getMat(0x16a34a));
        cashPad.scale.set(1.8, 0.05, 1.6);
        cashPad.position.copy(CASH_PILE_POS);
        worldGroup.add(cashPad);

        const cashDecal = createFloorSignMesh('CASH PILE', '₹0', '#064e3b', '#22c55e', 1.8, 0.75);
        cashDecal.mesh.position.set(CASH_PILE_POS.x, 0.10, CASH_PILE_POS.z + 1.25);
        worldGroup.add(cashDecal.mesh);

        let lastCashDisplayValue = 0;
        function updateCashDecalText(amount) {
            const rounded = Math.round(amount);
            if (rounded === lastCashDisplayValue) return;
            lastCashDisplayValue = rounded;
            const { ctx, tex } = cashDecal;
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(8, 48, 240, 40);
            ctx.fillStyle = '#4ade80';
            ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`₹${rounded.toLocaleString('en-IN')}`, 128, 76);
            tex.needsUpdate = true;
        }

        const cashPileBundles = [];
        function addCashToPile(amount) {
            const bundleCount = Math.max(1, Math.min(5, Math.round(amount / 500)));
            const valuePerBundle = amount / bundleCount;

            for (let i = 0; i < bundleCount; i++) {
                const idx = cashPileBundles.length;
                const col = idx % 2;
                const row = Math.floor(idx / 2) % 3;
                const layer = Math.floor(idx / 6);

                const bundleMesh = createCashBundleMesh();
                const targetPos = new THREE.Vector3(
                    CASH_PILE_POS.x + (col - 0.5) * 0.62,
                    0.16 + layer * 0.15,
                    CASH_PILE_POS.z + (row - 1) * 0.40
                );

                bundleMesh.position.copy(COUNTER_POS).add(new THREE.Vector3(0, 1.4, 0));
                scene.add(bundleMesh);

                spawnParabolicArc(bundleMesh, targetPos, 0.26 + i * 0.04);
                cashPileBundles.push({ mesh: bundleMesh, value: valuePerBundle });
            }
            const sum = cashPileBundles.reduce((s, b) => s + b.value, 0);
            updateCashDecalText(sum);
        }

        /**********************************************************************
         * 9. DISPLAY SHELVES & FURNITURE CATALOG
         **********************************************************************/
        const shelves = [];
        const FURNITURE = [
            { id: 'compact', name: 'Compact Display', cost: 1200, width: 1.5, depth: 1.15, levels: 1, cols: 2, rows: 1, color: 0xb8895b, accent: 0x70482e },
            { id: 'standard', name: 'Classic Display Table', cost: 2500, width: 2.5, depth: 2.05, levels: 1, cols: 3, rows: 2, color: 0xe3ded8, accent: 0x7a70a7 },
            { id: 'luxury', name: 'Luxury Showcase', cost: 5500, width: 2.45, depth: 1.2, levels: 2, cols: 3, rows: 1, color: 0x24283b, accent: 0xd4a850 },
            { id: 'rack', name: 'Mega Storage Rack', cost: 10500, width: 3.2, depth: 2.05, levels: 2, cols: 4, rows: 2, color: 0x64748b, accent: 0x14b8a6 }
        ];

        function furnitureModel(type) {
            const g = new THREE.Group(), slots = [];
            const w = type.width, d = type.depth, dark = 0x263344, white = 0xf4f4ed, wood = 0xbe986a;
            function box(wi, h, di, x, y, z, color, rounded = 0) {
                const m = rounded ? roundedSlab(wi, h, di, rounded, color) : new THREE.Mesh(sharedGeos.box, getMat(color));
                if (!rounded) m.scale.set(wi, h, di); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
            }
            function cylinder(radius, height, x, y, z, color) {
                const m = new THREE.Mesh(sharedGeos.cyl, getMat(color)); m.scale.set(radius, height, radius); m.position.set(x, y, z); g.add(m);
            }
            box(w - 0.10, 0.12, d - 0.10, 0, 0.07, 0, dark, 0.06);
            if (type.id === 'compact') {
                box(w - 0.15, 0.72, d - 0.15, 0, 0.48, 0, wood, 0.07);
                box(w - 0.28, 0.54, 0.025, 0, 0.49, d / 2 - 0.07, 0xd2ad80, 0.025);
                box(w * 0.50, 0.025, 0.018, 0, 0.60, d / 2 - 0.05, 0x805f43, 0.01);
                box(0.27, 0.025, 0.03, 0, 0.69, d / 2 - 0.04, 0x765339, 0.01);
            } else if (type.id === 'standard') {
                box(w - 0.24, 0.69, d - 0.22, 0, 0.47, 0, 0xa98767, 0.06);
                box(w - 0.34, 0.48, 0.025, 0, 0.47, d / 2 - 0.10, 0xc2a184, 0.02);
                for (let x = -w / 2 + 0.28; x < w / 2 - 0.2; x += 0.24) box(0.028, 0.45, 0.028, x, 0.47, d / 2 - 0.08, 0x8d7058);
                box(w - 0.16, 0.045, d - 0.16, 0, 0.83, 0, 0x577ba5, 0.04);
            } else {
                box(w - 0.18, 0.32, d - 0.18, 0, 0.25, 0, type.color, 0.05);
                for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) for (const z of [-d / 2 + 0.08, d / 2 - 0.08])
                    box(0.12, 1.94, 0.12, x, 1.07, z, type.id === 'luxury' ? 0xc6a35b : 0x35495b, 0.025);
                if (type.id === 'luxury') {
                    const glassMat = new THREE.MeshLambertMaterial({ color: 0xc1ecf1, transparent: true, opacity: 0.18, depthWrite: false });
                    for (const x of [-w / 2 + 0.08, w / 2 - 0.08]) {
                        const pane = new THREE.Mesh(sharedGeos.box, glassMat); pane.scale.set(0.025, 1.22, d - 0.18); pane.position.set(x, 1.34, 0); g.add(pane);
                    }
                    box(w - 0.16, 0.06, d - 0.12, 0, 1.98, 0, 0xd2ad62, 0.025);
                } else {
                    box(w - 0.15, 0.26, 0.08, 0, 2.08, -d / 2 + 0.09, 0x334e5a, 0.025);
                    box(w - 0.32, 0.045, 0.015, 0, 2.09, -d / 2 + 0.14, 0x45d3bb, 0.01);
                    for (const x of [-w / 2 + 0.18, w / 2 - 0.18]) box(0.08, 0.7, 0.10, x, 0.60, 0, 0x485d69, 0.02);
                }
            }
            for (let level = 0; level < type.levels; level++) {
                const surface = 0.96 + level * 0.78;
                box(w, 0.12, d, 0, surface - 0.06, 0, type.id === 'standard' ? white : type.color, 0.075);
                box(w - 0.12, 0.025, 0.025, 0, surface - 0.065, d / 2 - 0.015, type.accent, 0.012);
                if (type.levels > 1) box(w - 0.28, 0.025, 0.035, 0, surface - 0.15, -d / 2 + 0.12, type.id === 'luxury' ? 0xffdfa0 : 0x91e6d2, 0.015);
                for (let row = 0; row < type.rows; row++) for (let col = 0; col < type.cols; col++) {
                    const x = (col - (type.cols - 1) / 2) * (w - 0.16) / type.cols;
                    const z = (row - (type.rows - 1) / 2) * (d - 0.12) / type.rows;
                    box(0.48, 0.02, 0.66, x, surface + 0.01, z, 0xb8b3ae, 0.04);
                    box(0.30,0.018,0.08,x,surface+0.028,z+0.27,0xf5f1e9,0.008);
                    box(0.18,0.005,0.012,x,surface+0.039,z+0.275,0x676775,0.004);
                    cylinder(0.035, 0.009, x + 0.18, surface + 0.024, z + 0.27, 0x697f89);
                    slots.push(new THREE.Vector3(x, surface + 0.02 + 0.075, z));
                }
            }
            return { group: g, slots };
        }

        function makeShelf(type, pos, rotation = 0) {
            const model = furnitureModel(type); model.group.position.copy(pos); model.group.rotation.y = rotation;
            worldGroup.add(model.group);
            const shelf = { id: Math.random(), type, pos: pos.clone(), unlocked: true, group: model.group, slots: model.slots, capacity: model.slots.length, items: [], rotation };
            shelves.push(shelf);
            return shelf;
        }
        makeShelf(FURNITURE[1], new THREE.Vector3(1.2, 0.08, -1.8));
        makeShelf(FURNITURE[1], new THREE.Vector3(1.2, 0.08, 1.8));

        // A proper walk-in shop shell, lighting, signage and merchandising. All
        // textures are embedded or generated locally, so the game can run offline.
        function createBoardTexture(draw, width = 1024, height = 256) {
            const c = document.createElement('canvas'); c.width = width; c.height = height;
            const ctx = c.getContext('2d'); draw(ctx, width, height);
            const tex = new THREE.CanvasTexture(c); tex.encoding = THREE.sRGBEncoding;
            tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
            return tex;
        }
        function panelPlane(texture, w, h) {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false }));
            return m;
        }
        function makeStudioBoard() {
            return createBoardTexture((c,w,h) => {
                c.fillStyle = '#27263d'; c.fillRect(0,0,w,h);
                c.fillStyle = '#b9abff'; c.fillRect(0,0,13,h);
                c.textAlign = 'left';
                c.fillStyle = '#b4a8fa'; c.font = '700 35px Manrope, sans-serif'; c.fillText('THE', 66, 74);
                c.fillStyle = '#faf9ff'; c.font = '800 90px Manrope, sans-serif'; c.fillText('PHONE STUDIO', 66, 163);
                c.fillStyle = '#c4c0d9'; c.font = '700 24px Manrope, sans-serif'; c.fillText('GOOD TECH.  GOOD DAYS.', 70, 213);
                c.strokeStyle = '#8e7fea'; c.lineWidth = 6; c.beginPath(); if(c.roundRect)c.roundRect(w-171,58,76,140,18);else c.rect(w-171,58,76,140); c.stroke();
                c.fillStyle = '#c6bbff'; c.beginPath(); c.arc(w-133, 177, 4, 0, Math.PI*2); c.fill();
            });
        }
        function makeWayfindingBoard(title, sub, accent='#b8a7ff') {
            return createBoardTexture((c,w,h) => {
                c.fillStyle = '#282a39'; c.fillRect(0,0,w,h);
                c.fillStyle = accent; c.fillRect(0,0,12,h);
                c.textAlign = 'left'; c.fillStyle = '#fff'; c.font = '800 82px Manrope, sans-serif'; c.fillText(title, 54, 119);
                c.fillStyle = '#d3d2df'; c.font = '700 34px Manrope, sans-serif'; c.fillText(sub, 58, 190);
            });
        }
        function makeSmallPoster(title, subtitle, accent) {
            return createBoardTexture((c,w,h) => {
                c.fillStyle = '#f3f0e9'; c.fillRect(0,0,w,h);
                c.fillStyle = accent; c.fillRect(0,0,w,15);
                c.textAlign='center'; c.fillStyle = '#353242'; c.font='800 92px Manrope,sans-serif'; c.fillText(title,w/2,121);
                c.fillStyle='#7b7886';c.font='700 31px Manrope,sans-serif';c.fillText(subtitle,w/2,183);
            });
        }
        function makeStoreShell() {
            // Warmer, quieter finishes than the old cutaway floor.
            shopFloor.material = new THREE.MeshStandardMaterial({color:0xd5cbbf, roughness:.9});
            const tileTexture = createBoardTexture((c,w,h) => {
                c.fillStyle='#e9e0d4';c.fillRect(0,0,w,h);
                let seed=19;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
                for(let i=0;i<1050;i++){
                    const x=rand()*w,y=rand()*h,r=.3+rand()*1.2;
                    c.fillStyle=i%3===0?'rgba(124,110,96,.11)':'rgba(255,255,255,.15)';
                    c.fillRect(x,y,r,r);
                }
                c.strokeStyle='rgba(163,149,132,.08)';c.lineWidth=1;
                for(let i=0;i<14;i++){const y=rand()*h;c.beginPath();c.moveTo(0,y);c.lineTo(w,y+rand()*4-2);c.stroke();}
            },256,256);
            const tileMaterial = new THREE.MeshStandardMaterial({map:tileTexture,roughness:.87});
            tileInstMesh.material = tileMaterial;
            backWall.material = new THREE.MeshStandardMaterial({color:0xe0d7cc, roughness:.94});
            leftWall.material = new THREE.MeshStandardMaterial({color:0xded4c8, roughness:.95});
            backTrim.material = new THREE.MeshStandardMaterial({color:0x3a374a, roughness:.7});
            leftTrim.material = backTrim.material;
            matCarpet.material = new THREE.MeshStandardMaterial({color:0x4b4861, roughness:1});
            palletBase.material = new THREE.MeshStandardMaterial({color:0xa2784e, roughness:.88});
            bayBorder.material = new THREE.MeshStandardMaterial({color:0xc6a264, roughness:.9});
            cashPad.material = new THREE.MeshStandardMaterial({color:0x699c87, roughness:.85});
            deskBody.material = new THREE.MeshStandardMaterial({color:0x363342, roughness:.75});
            frontPanel.material = new THREE.MeshStandardMaterial({color:0xa47f61, roughness:.88});

            const ceiling = decorBox(worldGroup, .5, 3.58, -.5, 14.15, .14, 12, 0xece7e0);
            ceiling.castShadow = false;
            const ceilingTrim = decorBox(worldGroup, .5, 3.48, -.5, 14.08, .08, 11.9, 0xd9d1cb);
            ceilingTrim.castShadow = false; ceilingTrim.receiveShadow = false;
            // Warm recessed ceiling panels and slim track rails.
            const fixtures = new THREE.Group(); worldGroup.add(fixtures);
            for (const x of [-4.25, .1, 4.45]) {
                const rail=decorBox(fixtures,x,3.42,-.4,.08,.06,10.0,0x494655);rail.castShadow=false;
                for (const z of [-4.1,-.5,3.1]) {
                    const body=decorBox(fixtures,x,3.38,z,1.3,.10,.4,0xe0d9d0);body.castShadow=false;
                    const glow = new THREE.Mesh(new THREE.BoxGeometry(1.14,.025,.26), new THREE.MeshBasicMaterial({color:0xfff6dd}));
                    glow.position.set(x,3.31,z); fixtures.add(glow);
                }
            }
            [[-3.8,-3.4],[2.8,-3.4],[-3.8,2.3],[2.8,2.3]].forEach(([x,z]) => {
                const light = new THREE.PointLight(0xffe8c9, .50, 11, 2); light.position.set(x, 3.1, z); scene.add(light); shopLights.push(light);
            });
            // A full-height right wall replaces the old isometric cutaway.
            const rightWall = new THREE.Group(); rightWall.position.set(7.18,0,0); worldGroup.add(rightWall);
            decorBox(rightWall,0,1.72,-.5,.20,3.44,12,0xe6ded5);
            decorBox(rightWall,-.11,3.40,-.5,.15,.18,12,0x3a374a);
            decorBox(rightWall,-.12,.16,-.5,.10,.22,12,0xc6bdb3);
            // Low, decorative rails and boxed accessories along the side wall.
            for (const z of [-4.5,-2.3,-.1,2.1]) {
                decorBox(rightWall,-.18,1.0,z,.30,.07,1.65,0xa98a70);
                for (let i=0;i<3;i++) {
                    const zi=z+(i-1)*.48;
                    decorBox(rightWall,-.19,1.28,zi,.10,.50,.32,[0xddd8e7,0xd3dcd5,0xe7cfbe][i]);
                    decorBox(rightWall,-.26,1.28,zi,.025,.31,.19,[0x8782b3,0x8aa89d,0xba9388][i]);
                }
            }
            const sideLabel = panelPlane(makeSmallPoster('ACCESSORIES', 'THE LITTLE THINGS MATTER', '#a599db'), 2.3, .58);
            sideLabel.position.set(-.12,2.55,-1.2); sideLabel.rotation.y = -Math.PI/2; rightWall.add(sideLabel);

            // Glazed storefront with a generous, collision-aware open entrance.
            const frameMat = new THREE.MeshStandardMaterial({color:0x3e3d47,metalness:.25,roughness:.55});
            const glassMat = new THREE.MeshStandardMaterial({color:0xb4d7d6,transparent:true,opacity:.15,roughness:.2,metalness:.05,depthWrite:false,side:THREE.DoubleSide});
            const front = new THREE.Group(); front.position.z=5.55; worldGroup.add(front);
            function frame(x,y,w,h,d=.10) {const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),frameMat);m.position.set(x,y,0);front.add(m);return m;}
            const leftStart=-6.4, leftEnd=-.58, rightStart=3.55, rightEnd=7.18;
            function windowSegment(group, width) {
                const pane = new THREE.Mesh(new THREE.PlaneGeometry(width,2.9),glassMat); pane.position.set(width/2,1.83,0);group.add(pane);
                function bar(x,y,w,h){const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,.13),frameMat);b.position.set(x,y,0);group.add(b);return b;}
                bar(width/2,.39,width,.09);bar(width/2,3.30,width,.11);bar(0,1.85,.09,2.95);bar(width,1.85,.09,2.95);
                const divisions = Math.max(1,Math.round(width/1.8));
                for(let i=1;i<divisions;i++)bar(width*i/divisions,1.85,.075,2.95);
            }
            const leftWindow=new THREE.Group();leftWindow.position.x=leftStart;front.add(leftWindow);windowSegment(leftWindow,leftEnd-leftStart);
            const rightWindow=new THREE.Group();rightWindow.position.x=rightStart;front.add(rightWindow);windowSegment(rightWindow,rightEnd-rightStart);
            frame((leftStart+rightEnd)/2,3.46,rightEnd-leftStart,.18,.22);
            // Doorway threshold, header and a small "open" plaque.
            decorBox(worldGroup,1.48,.12,5.56,4.0,.025,.25,0x9c928a).castShadow=false;
            const doorSign=panelPlane(makeWayfindingBoard('WELCOME', 'COME ON IN', '#87d0ad'),1.24,.32);
            doorSign.position.set(1.47,3.0,5.45); doorSign.rotation.y=Math.PI;worldGroup.add(doorSign);

            // Back wall: branded sign, framed product art and subtle vertical slats.
            featureSign.mesh.visible = false;
            decorBox(worldGroup,.5,2.28,-6.04,5.9,1.49,.11,0x302d42);
            const board=panelPlane(makeStudioBoard(),5.55,1.22); board.position.set(.5,2.28,-5.97);worldGroup.add(board);
            for(let x=-2.6;x<=3.6;x+=.24) decorBox(worldGroup,x,.78,-6.05,.055,1.20,.05,0xc8b8a9);
            // Premium phone ad, embedded as an image texture.
            decorBox(worldGroup,4.96,1.93,-6.02,1.48,2.24,.12,0x282635);
            const adTexture = new THREE.TextureLoader().load(POSTER_DATA); adTexture.encoding = THREE.sRGBEncoding;
            const ad=panelPlane(adTexture,1.35,2.08); ad.position.set(4.96,1.93,-5.94);worldGroup.add(ad);
            const checkBoard=panelPlane(makeWayfindingBoard('CHECKOUT', 'THANK YOU FOR SHOPPING', '#a99af3'),1.85,.45);
            checkBoard.position.set(-4.56,2.51,-5.96);worldGroup.add(checkBoard);
            decorBox(worldGroup,-4.56,2.51,-6.03,1.98,.57,.08,0x302d42);

            // The old floor pads still work, but these upright signs make them
            // understandable from eye level rather than only from above.
            const bayBoard=panelPlane(makeWayfindingBoard('LOADING BAY', 'STOCK PICKUP', '#f1c675'),1.75,.48);
            bayBoard.rotation.y=Math.PI/2;bayBoard.position.set(-6.20,2.35,4.2);worldGroup.add(bayBoard);
            decorBox(worldGroup,-6.27,2.35,4.2,.1,.58,1.86,0x302d42);
            const cashBoard=panelPlane(makeWayfindingBoard('CASH', 'COLLECT HERE', '#8adeaa'),.92,.28);
            cashBoard.position.set(-1.4,1.10,-2.8);cashBoard.rotation.y=-Math.PI/2;worldGroup.add(cashBoard); cashBoard.visible=false;
            const hireBoard=panelPlane(makeWayfindingBoard('HIRE CASHIER', '₹5,500  •  STAND TO HIRE', '#87d0ad'),1.5,.36);
            hireBoard.rotation.y=Math.PI/2;hireBoard.position.set(-6.14,1.7,-4.35);worldGroup.add(hireBoard);
            // A small plant softens the checkout corner.
            const plant = new THREE.Group(); plant.position.set(-5.8,0.08,-5.65); worldGroup.add(plant);
            const pot=new THREE.Mesh(new THREE.CylinderGeometry(.24,.19,.38,16),new THREE.MeshStandardMaterial({color:0xb28670,roughness:.85}));pot.position.y=.20;pot.castShadow=true;plant.add(pot);
            for(let i=0;i<7;i++){
                const leaf=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),new THREE.MeshStandardMaterial({color:i%2?0x54896c:0x3f765b,roughness:.9}));
                const a=i*Math.PI*2/7;leaf.position.set(Math.cos(a)*.17,.62+(.08*(i%3)),Math.sin(a)*.17);leaf.scale.set(.68,2.4,.8);leaf.rotation.z=-Math.cos(a)*.5;leaf.rotation.x=Math.sin(a)*.5;leaf.castShadow=true;plant.add(leaf);
            }
            return {ceiling,ceilingTrim,rightWall,rightWindow,front,fixtures,tileMaterial};
        }
        const shell = makeStoreShell();
        function expandStoreVisuals() {
            shell.ceiling.scale.x = 17.55; shell.ceiling.position.x=2;
            shell.ceilingTrim.scale.x = 17.48; shell.ceilingTrim.position.x=2;
            shell.rightWall.position.x=10.7;
            shell.rightWindow.scale.x=(10.7-3.55)/(7.18-3.55);
            // The extra bay receives an additional ceiling strip.
            const extra=decorBox(shell.fixtures,8.5,3.39,-.4,1.2,.1,8.8,0xe0d9d0);extra.castShadow=false;
        }


        function getSlotWorld(shelf, index) {
            return shelf.slots[index].clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), shelf.rotation).add(shelf.pos);
        }

        /**********************************************************************
         * 10. WALK-ON 3D FLOOR UPGRADE PADS
         **********************************************************************/
        const floorPads = [];
        function createWalkPad(id, pos, title, costStr, borderHex, onTrigger) {
            const group = new THREE.Group();
            group.position.copy(pos);

            const decal = createFloorSignMesh(title, costStr, '#0f172a', borderHex, 2.4, 1.35);
            decal.mesh.position.y = 0.03;
            group.add(decal.mesh);

            worldGroup.add(group);
            floorPads.push({
                id,
                pos,
                active: true,
                group,
                dwellTimer: 0,
                onTrigger
            });
        }

        createWalkPad('cashier', new THREE.Vector3(-5.2, 0.08, -4.4), 'HIRE CASHIER', '₹5,500', '#10b981', () => {
            purchaseLevelUpgrade('hire_cashier');
        });

        /**********************************************************************
         * 11. DELIVERY VAN & UNRESTRICTED MULTI-ITEM ORDER QUEUE
         **********************************************************************/
        const truckGroup = new THREE.Group();
        truckGroup.position.set(-24, 0.1, 10.6);

        const cabMesh = new THREE.Mesh(sharedGeos.box, getMat(0x2563eb));
        cabMesh.scale.set(1.8, 1.9, 2.1);
        cabMesh.position.set(1.7, 1.15, 0);
        cabMesh.castShadow = true;
        truckGroup.add(cabMesh);

        const cargoBox = new THREE.Mesh(sharedGeos.box, getMat(0xf8fafc));
        cargoBox.scale.set(3.4, 2.35, 2.25);
        cargoBox.position.set(-0.8, 1.38, 0);
        cargoBox.castShadow = true;
        truckGroup.add(cargoBox);

        scene.add(truckGroup);
        let activeTruckAnim = null;

        function spawnSupplyCrateAtBay(brand, count = 3, isStarterSingle = false) {
            const itemsToSpawn = isStarterSingle ? 1 : count;

            for (let i = 0; i < itemsToSpawn; i++) {
                const phoneMesh = createPhoneItemMesh(brand);
                const index = dynamicCrates.length, column = index % 4, row = Math.floor(index / 4) % 3, layer = Math.floor(index / 12);
                const settledY = .245 + layer * .11;
                const spawnX = LOADING_BAY_POS.x + (column - 1.5) * .42;
                const spawnZ = LOADING_BAY_POS.z + (row - 1) * .60;
                const spawnY = settledY + 1.6 + (i % 6) * .16;
                phoneMesh.position.set(spawnX, spawnY, spawnZ);
                scene.add(phoneMesh);

                let rapierBody = null;

                        dynamicCrates.push({
                    mesh: phoneMesh,
                    body: rapierBody,
                    brand,
                    vy: 0,
                    targetY: settledY
                });
            }
            updateHUD();
        }

        function dispatchTruckIfNeeded() {
            if (activeTruckAnim || state.pendingOrders.length === 0) return;
            sfx.truckHorn();
            truckGroup.position.set(-24, 0.1, 10.6);
            activeTruckAnim = { phase: 'arrive', timer: 0 };
        }

        function orderSupplierDelivery(brandId, quantity = 3) {
            const brand = PHONE_BRANDS.find(b => b.id === brandId);
            if (!brand) return;

            if (!brand.unlocked) {
                if (state.money < brand.unlockCost) {
                    showToast(`Need ₹${brand.unlockCost.toLocaleString('en-IN')} to unlock ${brand.name}`);
                    return;
                }
                state.money -= brand.unlockCost;
                brand.unlocked = true;
                sfx.unlock();
                showToast(`Unlocked ${brand.name} (${brand.model})`);
                renderAllMenus();
                updateHUD();
                return;
            }

            const unitCost = Math.round(brand.boxPrice / brand.boxCount);
            const totalOrderCost = quantity === brand.boxCount ? brand.boxPrice : unitCost * quantity;

            if (state.money < totalOrderCost) {
                showToast(`Need ₹${totalOrderCost.toLocaleString('en-IN')} to order ${quantity}x ${brand.name}`);
                return;
            }

            state.money -= totalOrderCost;

            const existing = state.pendingOrders.find(o => o.brand.id === brand.id);
            if (existing) {
                existing.count += quantity;
            } else {
                state.pendingOrders.push({ brand, count: quantity });
            }

            if (activeTruckAnim && activeTruckAnim.phase === 'unload') {
                while (state.pendingOrders.length > 0) {
                    const order = state.pendingOrders.shift();
                    spawnSupplyCrateAtBay(order.brand, order.count, false);
                }
                sfx.pickup(2);
                showToast(`Added ${quantity}x ${brand.name} to current drop`);
            } else {
                sfx.pickup(1);
                dispatchTruckIfNeeded();
                const totalQueued = state.pendingOrders.reduce((sum, o) => sum + o.count, 0);
                showToast(`Ordered ${quantity}x ${brand.name} (${totalQueued} phones in van)`);
            }

            updateHUD();
            renderAllMenus();
        }

        /**********************************************************************
         * 12. PLAYER, PARABOLIC ARCS & FURNITURE PLACEMENT
         **********************************************************************/
        const player = {
            mesh: createStickman(0x2563eb, { hatColor: 0xfacc15 }),
            pos: new THREE.Vector3(-2.0, 0.08, 3.35),
            vel: new THREE.Vector3(),
            angle: 0,
            carryStack: [],
            pickupCooldown: 0,
            stockCooldown: 0
        };
        player.mesh.position.copy(player.pos);
        scene.add(player.mesh);
        player.mesh.visible = false;

        const activeArcs = [];
        function spawnParabolicArc(mesh, targetVec3, duration = 0.25, onComplete = null) {
            activeArcs.push({
                mesh,
                start: mesh.position.clone(),
                end: targetVec3.clone(),
                elapsed: 0,
                duration,
                onComplete
            });
        }

        // Furniture orders are independent of phone deliveries and remain in the bay until collected.
        const furnitureParcels = [];
        const furnitureUI = {
            info: document.getElementById('furniture-info'),
            grab: document.getElementById('furniture-grab'),
            rotate: document.getElementById('furniture-rotate'),
            place: document.getElementById('furniture-place'),
            hold: document.getElementById('hold-progress')
        };
        let furnitureCarry = null, furniturePreview = null, placementRotation = 0, placementValid = false, holdFurniture = null;
        let navRevision = 0;

        function spawnFurnitureParcel(type, falling = true) {
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
        }

        function startFurniture(type, shelf = null) {
            furnitureCarry = { type, shelf };
            placementRotation = shelf ? shelf.rotation : 0;
            const model = furnitureModel(type);
            furniturePreview = model.group;
            furniturePreview.traverse(o => {
                if (o.isMesh) {
                    o.material = new THREE.MeshBasicMaterial({ color: 0x22ee88, transparent: true, opacity: 0.4, depthWrite: false });
                }
            });
            const outline = new THREE.LineSegments(
                new THREE.EdgesGeometry(new THREE.BoxGeometry(type.width, 0.025, type.depth)),
                new THREE.LineBasicMaterial({ color: 0x7dffad })
            );
            outline.position.y = 0.04;
            furniturePreview.add(outline);
            worldGroup.add(furniturePreview);
            if (shelf) {
                shelf.unlocked = false;
                shelf.group.visible = false;
                shelf.items.forEach(item => {
                    item.mesh.visible = false;
                    for (let i = activeArcs.length - 1; i >= 0; i--) {
                        if (activeArcs[i].mesh === item.mesh) activeArcs.splice(i, 1);
                    }
                });
            }
            navRevision++;
            updateHUD();
            showToast('Move to position · Rotate with R · Place with Space');
        }

        function grabFurniture() {
            if (furnitureCarry || !furnitureParcels.length || player.pos.distanceTo(LOADING_BAY_POS) > 3) return;
            const p = furnitureParcels.shift();
            worldGroup.remove(p.group);
            startFurniture(p.type);
        }

        function updateFurniture(dt) {
            for (const p of furnitureParcels) {
                if(p.group.position.y > .541 || p.vy > 0){
                    p.vy -= 18 * dt;p.group.position.y += p.vy * dt;
                    if(p.group.position.y <= .54){p.group.position.y=.54;p.vy=p.vy < -1.2 ? -p.vy*.12 : 0;}
                }
            }
            const near = player.pos.distanceTo(LOADING_BAY_POS) < 3 && furnitureParcels.length > 0 && !furnitureCarry;
            showEl(furnitureUI.grab, near);
            showEl(furnitureUI.rotate, !!furnitureCarry);
            showEl(furnitureUI.place, !!furnitureCarry);
            showEl(document.getElementById('furniture-cancel'), !!furnitureCarry);

            if (furnitureCarry) {
                const t = furnitureCarry.type;
                const quarter = Math.round(placementRotation / (Math.PI / 2)) % 2 !== 0;
                const w = quarter ? t.depth : t.width, d = quarter ? t.width : t.depth;
                const dist = 1.05 + Math.max(w, d) * 0.5;
                const x = player.pos.x + Math.sin(player.angle) * dist;
                const z = player.pos.z + Math.cos(player.angle) * dist;
                furniturePreview.position.set(x, 0.08, z);
                furniturePreview.rotation.y = placementRotation;

                const maxX = state.shopExpanded ? 10.2 : 7;
                placementValid = x - w / 2 >= -6.5 && x + w / 2 <= maxX && z - d / 2 >= -5.8 && z + d / 2 <= 5.35;
                const overlap = (ax, az, aw, ad, bx, bz, bw, bd) => Math.abs(ax - bx) < (aw + bw) / 2 + 0.14 && Math.abs(az - bz) < (ad + bd) / 2 + 0.14;

                if (
                    overlap(x, z, w, d, COUNTER_POS.x, COUNTER_POS.z, 3.5, 1.7) ||
                    overlap(x, z, w, d, LOADING_BAY_POS.x, LOADING_BAY_POS.z, 3.8, 3.8) ||
                    overlap(x, z, w, d, 1.5, 5.4, 2, 1.4)
                ) {
                    placementValid = false;
                }
                for (const s of shelves) {
                    if (s.unlocked) {
                        const q = Math.round(s.rotation / (Math.PI / 2)) % 2 !== 0;
                        const sw = q ? s.type.depth : s.type.width, sd = q ? s.type.width : s.type.depth;
                        if (overlap(x, z, w, d, s.pos.x, s.pos.z, sw, sd)) placementValid = false;
                    }
                }
                const actors = [player, ...customers];
                if (stockerStaff) actors.push(stockerStaff);
                if (cashierStaff) actors.push(cashierStaff);
                for (const actor of actors) {
                    if (circleHitsRect(actor.pos.x, actor.pos.z, ACTOR_RADIUS + 0.12, { x, z, w, d })) placementValid = false;
                }
                furniturePreview.traverse(o => {
                    if (o.isMesh) o.material.color.setHex(placementValid ? 0x22ee88 : 0xf43f5e);
                });
                showEl(furnitureUI.info, true);
                furnitureUI.info.textContent = `${t.name} · ${t.width.toFixed(1)} × ${t.depth.toFixed(1)} m · ${t.cols * t.rows * t.levels} slots · ${placementValid ? 'Green: Ready to place' : 'Red: Blocked / outside shop'}`;
                furnitureUI.place.disabled = !placementValid;

                    } else {
                showEl(furnitureUI.info, near);
                if (near) furnitureUI.info.textContent = `${furnitureParcels.length} furniture package(s) in bay. Grab to start placing.`;
            }

            if (holdFurniture) {
                holdFurniture.elapsed += dt;
                furnitureUI.hold.textContent = `Hold to move: ${Math.min(100, Math.floor((holdFurniture.elapsed / 2) * 100))}%`;
                if (holdFurniture.elapsed >= 2) {
                    const shelf = holdFurniture.shelf;
                    cancelFurnitureHold();
                    startFurniture(shelf.type, shelf);
                }
            }
        }

        function placeFurniture() {
            if (!furnitureCarry) return;
            if (!placementValid) {
                showToast('Move the red blueprint into clear shop floor space');
                return;
            }
            const pos = furniturePreview.position.clone(), data = furnitureCarry;
            let shelf = data.shelf;
            if (shelf) {
                shelf.pos.copy(pos);
                shelf.rotation = placementRotation;
                shelf.group.position.copy(pos);
                shelf.group.rotation.y = placementRotation;
                shelf.group.visible = true;
                shelf.unlocked = true;
                shelf.items.forEach((item, i) => {
                    item.mesh.visible = true;
                    item.mesh.position.copy(getSlotWorld(shelf, i));
                    item.mesh.rotation.set(0, shelf.rotation, 0);
                });
            } else {
                shelf = makeShelf(data.type, pos, placementRotation);
            }
            worldGroup.remove(furniturePreview);
            furniturePreview.traverse(o => { if (o.isMesh) o.material.dispose(); });
            furniturePreview = null;
            furnitureCarry = null;
            navRevision++;
            updateHUD();
            showToast(`${data.type.name} placed! Look at it and hold F to move it again.`);
        }

        furnitureUI.grab.onclick = grabFurniture;
        furnitureUI.rotate.onclick = () => { if (furnitureCarry) placementRotation += Math.PI / 2; };
        furnitureUI.place.onclick = placeFurniture;
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
        document.getElementById('furniture-cancel').onclick=cancelFurniturePlacement;

        function cancelFurnitureHold() {
            holdFurniture = null;
            showEl(furnitureUI.hold, false);
        }

                // First-person controls. Pointer lock is optional: if a browser or an
        // embedded preview does not allow it, holding and dragging still looks around.
        const input = { joyVec: new THREE.Vector2(0, 0), keys: Object.create(null) };
        const inputSurface = document.getElementById('input-surface');
        const joystickBase = document.getElementById('joystick-base');
        const joystickKnob = document.getElementById('joystick-knob');
        const moveDisplayButton = document.getElementById('move-display');
        let movePointer = null, lookPointer = null, dragPointer = null;
        let joystickOrigin = {x: 0, y: 0}, lastLook = {x: 0, y: 0};
        let pointerLockDenied = false;
        const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            joystickBase.style.display = 'block';
            joystickBase.style.left = '64px';
            joystickBase.style.top = 'auto';
            joystickBase.style.bottom = '90px';
        }
        function lookBy(dx, dy) {
            cameraYaw -= dx * 0.0027;
            cameraPitch = THREE.MathUtils.clamp(cameraPitch - dy * 0.0024, -1.23, 1.16);
        }
        function updateJoystick(x, y) {
            const dx = x - joystickOrigin.x, dy = y - joystickOrigin.y;
            const r = 42, mag = Math.hypot(dx, dy), scale = mag > r ? r / mag : 1;
            input.joyVec.set(dx * scale / r, dy * scale / r);
            joystickKnob.style.left = `calc(50% + ${dx * scale}px)`;
            joystickKnob.style.top = `calc(50% + ${dy * scale}px)`;
        }
        function releaseCursor() {
            if (document.pointerLockElement && document.exitPointerLock) {
                try { document.exitPointerLock(); } catch (_) {}
            }
        }
        inputSurface.addEventListener('pointerdown', event => {
            if (state.activeDrawer) return;
            sfx.init();
            if (event.pointerType === 'touch' || (isTouchDevice && event.pointerType !== 'mouse')) {
                if (event.clientX < window.innerWidth * .48 && movePointer === null) {
                    movePointer = event.pointerId;
                    joystickOrigin = {x:event.clientX, y:event.clientY};
                    joystickBase.style.left = `${event.clientX}px`;
                    joystickBase.style.top = `${event.clientY}px`;
                    joystickBase.style.bottom = 'auto';
                    joystickBase.style.transform = 'translate(-50%, -50%)';
                    joystickBase.style.display = 'block';
                    updateJoystick(event.clientX, event.clientY);
                } else if (lookPointer === null) {
                    lookPointer = event.pointerId;
                    lastLook = {x:event.clientX, y:event.clientY};
                }
                try { inputSurface.setPointerCapture(event.pointerId); } catch (_) {}
            } else {
                if (event.button !== 0) return;
                dragPointer = event.pointerId;
                lastLook = {x:event.clientX, y:event.clientY};
                try { inputSurface.setPointerCapture(event.pointerId); } catch (_) {}
                // A preview iframe may disallow pointer lock; dragging remains fully functional.
                if (!pointerLockDenied && !document.pointerLockElement && inputSurface.requestPointerLock) {
                    try {
                        const result = inputSurface.requestPointerLock();
                        if (result && typeof result.catch === 'function') result.catch(() => { pointerLockDenied = true; });
                    } catch (_) { pointerLockDenied = true; }
                }
            }
            event.preventDefault();
        });
        inputSurface.addEventListener('pointermove', event => {
            if (event.pointerId === movePointer) updateJoystick(event.clientX, event.clientY);
            if (event.pointerId === lookPointer || (event.pointerId === dragPointer && !document.pointerLockElement)) {
                lookBy(event.clientX - lastLook.x, event.clientY - lastLook.y);
                lastLook = {x:event.clientX, y:event.clientY};
            }
        });
        document.addEventListener('mousemove', event => {
            if (document.pointerLockElement === inputSurface && !state.activeDrawer) lookBy(event.movementX || 0, event.movementY || 0);
        });
        document.addEventListener('pointerlockerror', () => { pointerLockDenied = true; });
        function releasePointer(event) {
            if (event.pointerId === movePointer) {
                movePointer = null; input.joyVec.set(0, 0);
                joystickKnob.style.left = '50%'; joystickKnob.style.top = '50%';
                if (!isTouchDevice) joystickBase.style.display = 'none';
                else {
                    joystickBase.style.left = '64px'; joystickBase.style.top = 'auto';
                    joystickBase.style.bottom = '90px'; joystickBase.style.transform = 'translate(-50%, 50%)';
                }
            }
            if (event.pointerId === lookPointer) lookPointer = null;
            if (event.pointerId === dragPointer) dragPointer = null;
        }
        inputSurface.addEventListener('pointerup', releasePointer);
        inputSurface.addEventListener('pointercancel', releasePointer);

        const furnitureRay = new THREE.Raycaster();
        function targetedShelf() {
            if (furnitureCarry || state.activeDrawer) return null;
            camera.updateMatrixWorld();
            furnitureRay.setFromCamera(new THREE.Vector2(0, 0), camera);
            const active = shelves.filter(s => s.unlocked);
            const hits = furnitureRay.intersectObjects(active.map(s => s.group), true);
            for (const hit of hits) {
                if (hit.distance > 4.1) break;
                let node = hit.object;
                while (node) {
                    const shelf = active.find(s => s.group === node);
                    if (shelf && player.pos.distanceTo(shelf.pos) < 4.1) return shelf;
                    node = node.parent;
                }
            }
            return null;
        }
        function beginFurnitureHold() {
            const shelf = targetedShelf();
            if (!shelf || furnitureCarry || state.activeDrawer) return;
            holdFurniture = { shelf, elapsed: 0 };
            showEl(furnitureUI.hold, true);
        }
        moveDisplayButton.addEventListener('pointerdown', event => {
            event.preventDefault();
            try { moveDisplayButton.setPointerCapture(event.pointerId); } catch (_) {}
            beginFurnitureHold();
        });
        moveDisplayButton.addEventListener('pointerup', cancelFurnitureHold);
        moveDisplayButton.addEventListener('pointercancel', cancelFurnitureHold);
        moveDisplayButton.addEventListener('lostpointercapture', cancelFurnitureHold);
        window.addEventListener('keydown', event => {
            if (event.code === 'Escape') {
                if (state.activeDrawer) { toggleTopDrawer(null); event.preventDefault(); }
                else if (furnitureCarry && !document.pointerLockElement) cancelFurniturePlacement();
                return;
            }
            if (!event.repeat && event.code === 'KeyB') { toggleTopDrawer('store'); event.preventDefault(); return; }
            if (!event.repeat && event.code === 'KeyU') { toggleTopDrawer('staff'); event.preventDefault(); return; }
            if (!event.repeat && event.code === 'KeyH') { toggleTopDrawer('help'); event.preventDefault(); return; }
            if (state.activeDrawer) return;
            if (!event.repeat && event.code === 'KeyE') {
                if (furnitureCarry) placeFurniture(); else grabFurniture();
            }
            if (!event.repeat && event.code === 'KeyR' && furnitureCarry) placementRotation += Math.PI / 2;
            if (!event.repeat && event.code === 'Space' && furnitureCarry) placeFurniture();
            if (!event.repeat && event.code === 'KeyF') beginFurnitureHold();
            input.keys[event.code] = true;
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code)) event.preventDefault();
        });
        window.addEventListener('keyup', event => {
            input.keys[event.code] = false;
            if (event.code === 'KeyF') cancelFurnitureHold();
        });
        window.addEventListener('blur', () => {
            Object.keys(input.keys).forEach(key => { input.keys[key] = false; });
            input.joyVec.set(0, 0); movePointer = lookPointer = dragPointer = null;
            cancelFurnitureHold();
        });


        const customers = [];
        let customerSpawnTimer = 2.0;
        let checkoutProgress = 0;
        let stockerStaff = null;
        let cashierStaff = null;

        function spawnCustomer() {
            if (customers.length >= 7) return;
            const colors = [0xb57659, 0x716a94, 0x9b6f7b, 0x5b8a80, 0x758493, 0x976563];
            const mesh = createStickman(colors[Math.floor(Math.random() * colors.length)], { hasStatusBadge: true });
            const startX = Math.random() < 0.5 ? -10.5 : 10.5;
            const start = new THREE.Vector3(startX, 0.08, 7.8);
            if (customers.some(c => c.pos.distanceTo(start) < 1.3)) return;
            const entry = new THREE.Vector3(1.48 + (Math.random() - 0.5) * 1.0, 0.08, 4.6);
            const outside = new THREE.Vector3(1.48, 0.08, 6.75);
            mesh.position.copy(start);
            scene.add(mesh);
            customers.push({
                mesh, pos: start.clone(), targetPos: outside, insideTarget: entry,
                state: 'APPROACHING', targetShelf: null, carriedItem: null, waitTimer: 0
            });
        }

        function spawnStockerStaff() {
            if (stockerStaff) return;
            const mesh = createStickman(0x16a34a, { vestColor: 0x14532d, hatColor: 0xfacc15 });
            const pos = new THREE.Vector3(-2.5, 0.08, 2.5);
            mesh.position.copy(pos);
            scene.add(mesh);
            stockerStaff = { mesh, pos, carryStack: [], cooldown: 0, mode: 'COLLECT' };
        }

        function spawnCashierStaff() {
            if (cashierStaff) return;
            const mesh = createStickman(0xf59e0b, { vestColor: 0x78350f });
            const pos = CASHIER_SPOT.clone();
            mesh.position.copy(pos);
            mesh.rotation.y = Math.PI;
            scene.add(mesh);
            cashierStaff = { mesh, pos };
        }

        /**********************************************************************
         * 14. TACTILE TYCOON UI MANAGEMENT & UPGRADE CARDS
         **********************************************************************/
        

        function purchaseStoreUpgrade(upgradeId) {
            const upg = STORE_UPGRADES.find(u => u.id === upgradeId);
            if (!upg || upg.purchased) return;
            if (state.money < upg.cost) {
                showToast(`Need ₹${upg.cost.toLocaleString('en-IN')} for ${upg.name}`);
                return;
            }

            state.money -= upg.cost;
            upg.purchased = true;
            sfx.unlock();

            if (upgradeId === 'expand_shop') {
                applyStoreExpansion();

                        showToast('Store expanded and customer arrival rate doubled');
            }

            renderAllMenus();
            updateHUD();
        }

        function purchaseLevelUpgrade(upgradeId) {
            const upg = LEVEL_UPGRADES.find(u => u.id === upgradeId);
            if (!upg || upg.level >= upg.maxLevel) return;

            if (upg.requires) {
                const req = LEVEL_UPGRADES.find(r => r.id === upg.requires);
                if (!req || req.level === 0) {
                    showToast(`Hire ${req ? req.name.replace('Hire ', '') : 'staff'} first`);
                    return;
                }
            }

            const cost = getUpgradeCost(upg);
            if (state.money < cost) {
                showToast(`Need ₹${cost.toLocaleString('en-IN')} for ${upg.name}`);
                return;
            }

            state.money -= cost;
            upg.level += 1;
            sfx.unlock();

            if (upgradeId === 'player_carry') {
                state.maxCarry = 4 + (upg.level - 1) * 2;
                showToast(`Player Carry Limit upgraded to ${state.maxCarry} phones`);
            } else if (upgradeId === 'player_speed') {
                state.playerSpeed = BASE_PLAYER_SPEED * (1 + (upg.level - 1) * 0.10);
                showToast(`Player Speed upgraded to Lv.${upg.level}`);
            } else if (upgradeId === 'hire_stocker') {
                spawnStockerStaff();
                showToast('Restocker hired for automatic shelf stocking');
            } else if (upgradeId === 'stocker_carry') {
                state.stockerMaxCarry = 3 + (upg.level - 1) * 2;
                showToast(`Restocker Carry Limit upgraded to ${state.stockerMaxCarry} phones`);
            } else if (upgradeId === 'stocker_speed') {
                state.stockerSpeed = BASE_STOCKER_SPEED * (1 + (upg.level - 1) * 0.15);
                showToast(`Restocker Speed upgraded to Lv.${upg.level}`);
            } else if (upgradeId === 'hire_cashier') {
                spawnCashierStaff();
                const pad = floorPads.find(p => p.id === 'cashier');
                if (pad) {
                    pad.active = false;
                    pad.group.visible = false;
                }
                showToast('Cashier hired for automatic checkout');
            } else if (upgradeId === 'cashier_speed') {
                state.checkoutSpeedMult = 1 + (upg.level - 1) * 0.25;
                showToast(`Cashier Checkout Speed upgraded to Lv.${upg.level}`);
            }

            renderAllMenus();
            updateHUD();
        }

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
        let targetShelfTimer=0;
        function updateFirstPersonHUD(dt) {
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
            targetShelfTimer-=dt;
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
        let resetArmed=false, resetTimeout;
        document.getElementById('btn-reset').onclick=()=>{
            const btn=document.getElementById('btn-reset');
            if(!resetArmed){resetArmed=true;btn.textContent='Tap again to confirm';clearTimeout(resetTimeout);resetTimeout=setTimeout(()=>{resetArmed=false;btn.textContent='Reset progress';},4000);return;}
            resetRequested=true;
            try{localStorage.removeItem(SAVE_KEY);}catch(_){}
            window.location.reload();
        };

        // A compact first-person carry model replaces the old visible player avatar.
        const carryView = new THREE.Group();
        camera.add(carryView); scene.add(camera);
        let carryViewSignature='';
        function refreshCarryView(){
            const signature=player.carryStack.map(i=>i.brand.id).join('|');
            if(signature===carryViewSignature)return;
            carryViewSignature=signature;
            while(carryView.children.length)carryView.remove(carryView.children[0]);
            if(!player.carryStack.length)return;
            const armMat=new THREE.MeshStandardMaterial({color:0x575a78,roughness:.9});
            const skinMat=new THREE.MeshStandardMaterial({color:0xc99375,roughness:.8});
            const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.22,.53,.21),armMat);
            sleeve.position.set(.55,-.76,-.94);sleeve.rotation.z=-.52;carryView.add(sleeve);
            const hand=new THREE.Mesh(new THREE.SphereGeometry(.10,12,10),skinMat);
            hand.position.set(.40,-.55,-1.02);hand.scale.set(1,.55,1.1);carryView.add(hand);
            const pile=new THREE.Group();pile.position.set(.48,-.55,-1.09);pile.rotation.set(.12,-.25,-.12);carryView.add(pile);
            const last=player.carryStack.slice(-4);
            last.forEach((item,i)=>{
                const phone=createPhoneItemMesh(item.brand);phone.scale.setScalar(.78);phone.position.y=i*.085;pile.add(phone);
            });
        }


        /**********************************************************************
         * 15. NAVIGATION, PATHFINDING & MAIN GAME LOOP
         **********************************************************************/
        let lastTime = performance.now();
        const scratchVecA = new THREE.Vector3();
        const scratchVecB = new THREE.Vector3();
        const CHECKOUT_QUEUE_FRONT = new THREE.Vector3(COUNTER_POS.x, 0.08, COUNTER_POS.z + 1.45);

        const ACTOR_RADIUS = 0.42, NAV_STEP = 0.5, NAV_X0 = -16, NAV_Z0 = -6, NAV_W = 65, NAV_H = 31;

        function shelfRect(s) {
            const q = Math.abs(Math.round(s.rotation / (Math.PI / 2))) % 2 === 1;
            return { x: s.pos.x, z: s.pos.z, w: q ? s.type.depth : s.type.width, d: q ? s.type.width : s.type.depth };
        }
        function circleHitsRect(x, z, r, b) {
            const dx = Math.max(Math.abs(x - b.x) - b.w / 2, 0), dz = Math.max(Math.abs(z - b.z) - b.d / 2, 0);
            return dx * dx + dz * dz < r * r;
        }
        function worldBlocked(x, z, r = ACTOR_RADIUS) {
            const walls = [
                { x: backWall.position.x, z: -6.5, w: backWall.scale.x, d: 0.45 },
                { x: -6.5, z: -2.5, w: 0.45, d: 8.5 },
                { x: state.shopExpanded ? 10.7 : 7.18, z: -.5, w: .2, d: 12 },
                { x: (-6.4-.58)/2, z: 5.55, w: 6.4-.58, d: .18 },
                { x: (3.55+(state.shopExpanded?10.7:7.18))/2, z: 5.55, w: (state.shopExpanded?10.7:7.18)-3.55, d: .18 }
            ];
            for (const b of walls) if (circleHitsRect(x, z, r, b)) return true;
            if (circleHitsRect(x, z, r, { x: COUNTER_POS.x, z: COUNTER_POS.z, w: 2.95, d: 1.5 })) return true;
            for (const shelf of shelves) if (shelf.unlocked && circleHitsRect(x, z, r, shelfRect(shelf))) return true;
            return false;
        }
        function distanceToShelf(p, s) {
            const b = shelfRect(s);
            return Math.hypot(Math.max(0, Math.abs(p.x - b.x) - b.w / 2), Math.max(0, Math.abs(p.z - b.z) - b.d / 2));
        }
        function shelfApproaches(s) {
            const b = shelfRect(s), pts = [], gap = 0.70;
            for (const side of [-1, 1]) {
                for (let x = -b.w / 2 + 0.48; x <= b.w / 2 - 0.45; x += 1.02) pts.push(new THREE.Vector3(b.x + x, 0.08, b.z + side * (b.d / 2 + gap)));
                for (let z = -b.d / 2 + 0.48; z <= b.d / 2 - 0.45; z += 1.02) pts.push(new THREE.Vector3(b.x + side * (b.w / 2 + gap), 0.08, b.z + z));
            }
            return pts.filter(p => p.x >= -9 && p.x <= (state.shopExpanded ? 10.2 : 7) && p.z >= -5.8 && p.z <= 5.4 && !worldBlocked(p.x, p.z));
        }
        function nearestShelfApproach(s, p) {
            const points = shelfApproaches(s);
            points.sort((a, b) => a.distanceToSquared(p) - b.distanceToSquared(p));
            return points[0] || null;
        }
        function releaseBrowse(c) { c.browsePos = null; c.targetShelf = null; c.waitTimer = 0; }
        function reserveBrowseSpot(c) {
            const reserved = customers.filter(o => o !== c && o.state === 'BROWSING' && o.browsePos).map(o => o.browsePos);
            const candidates = [];
            for (const sh of shelves) if (sh.unlocked) for (const p of shelfApproaches(sh)) {
                if (reserved.some(o => o.distanceTo(p) < 1.05)) continue;
                candidates.push({ s: sh, p, score: c.pos.distanceToSquared(p) + (sh.items.length ? 0 : 250) });
            }
            candidates.sort((a, b) => a.score - b.score);
            if (candidates.length) { c.targetShelf = candidates[0].s; c.browsePos = candidates[0].p; c.nav = null; }
        }
        function queuePosition(index, queue) {
            if (index < 0) return null;
            const used = [];
            for (let i = 0; i <= index; i++) {
                const preferred = new THREE.Vector3(COUNTER_POS.x, 0.08, COUNTER_POS.z + 1.45 + i * 1.12);
                const choices = [];
                for (let ring = 0; ring <= 8; ring++) {
                    for (let dx = -ring; dx <= ring; dx++) for (let dz = -ring; dz <= ring; dz++) {
                        if (Math.max(Math.abs(dx), Math.abs(dz)) !== ring) continue;
                        const p = new THREE.Vector3(preferred.x + dx * 0.55, 0.08, preferred.z + dz * 0.55);
                        if (p.x < -6 || p.x > 7 || p.z < -5.8 || p.z > 7.5 || worldBlocked(p.x, p.z)) continue;
                        if (used.some(u => u.distanceTo(p) < 1.05)) continue;
                        if (customers.some(o => o.state === 'BROWSING' && o.browsePos && o.browsePos.distanceTo(p) < 1)) continue;
                        choices.push(p);
                    }
                    if (choices.length) break;
                }
                choices.sort((a, b) => a.distanceToSquared(preferred) - b.distanceToSquared(preferred));
                if (!choices.length) return null;
                used.push(choices[0]);
            }
            return used[index];
        }
        function gridIndex(x, z) { return z * NAV_W + x; }
        function gridPoint(x, z) { return new THREE.Vector3(NAV_X0 + x * NAV_STEP, 0.08, NAV_Z0 + z * NAV_STEP); }
        function navPath(from, to, agent, avoidPeople) {
            const snap = p => ({ x: Math.max(0, Math.min(NAV_W - 1, Math.round((p.x - NAV_X0) / NAV_STEP))), z: Math.max(0, Math.min(NAV_H - 1, Math.round((p.z - NAV_Z0) / NAV_STEP))) });
            const start = snap(from), goal = snap(to), total = NAV_W * NAV_H;
            const blocked = new Int8Array(total); blocked.fill(-1);
            const others = [player, ...customers]; if (stockerStaff) others.push(stockerStaff); if (cashierStaff) others.push(cashierStaff);
            const other = avoidPeople ? others.filter(c => c !== agent).map(c => c.pos) : [];
            function blockedAt(x, z) {
                if (x < 0 || x >= NAV_W || z < 0 || z >= NAV_H) return true;
                const i = gridIndex(x, z); if (blocked[i] >= 0) return blocked[i] === 1;
                const p = gridPoint(x, z);
                const b = worldBlocked(p.x, p.z, ACTOR_RADIUS + 0.04) || other.some(o => o.distanceToSquared(p) < 0.9 * 0.9 && p.distanceToSquared(to) > 0.65 * 0.65 && p.distanceToSquared(from) > 0.75 * 0.75);
                blocked[i] = b ? 1 : 0; return b;
            }
            let best = null, bd = Infinity;
            for (let z = Math.max(0, goal.z - 3); z <= Math.min(NAV_H - 1, goal.z + 3); z++) for (let x = Math.max(0, goal.x - 3); x <= Math.min(NAV_W - 1, goal.x + 3); x++) {
                if (blockedAt(x, z)) continue;
                const p = gridPoint(x, z), d = p.distanceToSquared(to);
                if (d < bd) { best = { x, z }; bd = d; }
            }
            if (!best || bd > 1.6 * 1.6) return [];
            const si = gridIndex(start.x, start.z), gi = gridIndex(best.x, best.z), dist = new Float32Array(total), parent = new Int32Array(total), closed = new Uint8Array(total);
            dist.fill(Infinity); parent.fill(-1); dist[si] = 0;
            const open = [si], dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            while (open.length) {
                let pick = 0, score = Infinity;
                for (let i = 0; i < open.length; i++) {
                    const id = open[i], x = id % NAV_W, z = Math.floor(id / NAV_W), h = Math.hypot(x - best.x, z - best.z), f = dist[id] + h;
                    if (f < score) { score = f; pick = i; }
                }
                const cur = open.splice(pick, 1)[0]; if (closed[cur]) continue; if (cur === gi) break; closed[cur] = 1;
                const x = cur % NAV_W, z = Math.floor(cur / NAV_W);
                for (const [dx, dz] of dirs) {
                    const nx = x + dx, nz = z + dz; if (blockedAt(nx, nz)) continue;
                    if (dx && dz && (blockedAt(x + dx, z) || blockedAt(x, z + dz))) continue;
                    const ni = gridIndex(nx, nz), cost = dist[cur] + (dx && dz ? 1.4142 : 1);
                    if (cost < dist[ni]) { dist[ni] = cost; parent[ni] = cur; open.push(ni); }
                }
            }
            if (gi !== si && parent[gi] < 0) return [];
            const path = []; let n = gi;
            while (n !== si && n >= 0) { path.push(gridPoint(n % NAV_W, Math.floor(n / NAV_W))); n = parent[n]; }
            path.reverse();
            if (bd < 0.36 && !worldBlocked(to.x, to.z)) path.push(to.clone());
            return path;
        }
        function crowdBlocked(agent, x, z) {
            const people = [player, ...customers]; if (stockerStaff) people.push(stockerStaff); if (cashierStaff) people.push(cashierStaff);
            for (const p of people) if (p !== agent) {
                const old = Math.hypot(agent.pos.x - p.pos.x, agent.pos.z - p.pos.z), next = Math.hypot(x - p.pos.x, z - p.pos.z);
                if (next < 0.86 && next < old - 0.00001) return true;
            }
            return false;
        }
        function moveAgent(agent, target, speed, dt) {
            if (!target) return false;
            const changed = !agent.nav || agent.nav.rev !== navRevision || agent.nav.target.distanceToSquared(target) > 0.18 * 0.18;
            if (changed) agent.nav = { target: target.clone(), rev: navRevision, path: [], timer: 0, stuck: 0 };
            const n = agent.nav; n.timer -= dt;
            if (n.timer <= 0) {
                n.path = navPath(agent.pos, target, agent, n.stuck > 0.7);
                n.timer = n.path.length ? 1.8 : 0.7;
            }
            while (n.path.length && agent.pos.distanceTo(n.path[0]) < 0.12) n.path.shift();
            if (!n.path.length) { n.stuck += dt; return false; }
            const next = n.path[0], dx = next.x - agent.pos.x, dz = next.z - agent.pos.z, len = Math.hypot(dx, dz);
            const step = Math.min(speed * dt, len), ux = dx / len, uz = dz / len;
            let moved = false;
            for (const ang of [0, 0.45, -0.45, 0.85, -0.85, 1.3, -1.3]) {
                const cs = Math.cos(ang), sn = Math.sin(ang), vx = ux * cs - uz * sn, vz = ux * sn + uz * cs;
                const x = agent.pos.x + vx * step, z = agent.pos.z + vz * step;
                if (!worldBlocked(x, z) && !crowdBlocked(agent, x, z)) {
                    agent.pos.x = x; agent.pos.z = z; agent.mesh.rotation.y = Math.atan2(vx, vz); moved = true; break;
                }
            }
            n.stuck = moved ? Math.max(0, n.stuck - dt * 2) : n.stuck + dt;
            if (n.stuck > 1.1) { n.timer = 0; n.stuck = 0.75; }
            return moved;
        }

        function updateGame(dt) {
            if (rapierReady && rapierWorld && dynamicCrates.length > 0) {
                rapierWorld.step();
            }

            // 1. Sync Supply Crates
            for (let i = 0; i < dynamicCrates.length; i++) {
                const c = dynamicCrates[i];
                if (c.body && rapierReady) {
                    const t = c.body.translation();
                    const r = c.body.rotation();
                    const clampedX = Math.max(LOADING_BAY_POS.x - 1.5, Math.min(LOADING_BAY_POS.x + 1.5, t.x));
                    const clampedZ = Math.max(LOADING_BAY_POS.z - 1.5, Math.min(LOADING_BAY_POS.z + 1.5, t.z));
                    c.mesh.position.set(clampedX, Math.max(0.24, t.y), clampedZ);
                    c.mesh.quaternion.set(r.x, r.y, r.z, r.w);
                } else if (c.mesh.position.y > c.targetY + .001 || c.vy > 0) {
                    c.vy -= 18 * dt;
                    c.mesh.position.y += c.vy * dt;
                    if(c.mesh.position.y <= c.targetY){c.mesh.position.y=c.targetY;c.vy=c.vy < -1.2 ? -c.vy*.20 : 0;}
                }
            }

            // 2. Delivery Van Animation
            if (activeTruckAnim) {
                activeTruckAnim.timer += dt;
                if (activeTruckAnim.phase === 'arrive') {
                    truckGroup.position.x = THREE.MathUtils.lerp(truckGroup.position.x, -6.5, dt * 4.8);
                    if (Math.abs(truckGroup.position.x - (-6.5)) < 0.25) {
                        activeTruckAnim.phase = 'unload';
                        activeTruckAnim.timer = 0;

                        let totalUnloaded = 0;
                        while (state.pendingOrders.length > 0) {
                            const order = state.pendingOrders.shift();
                            spawnSupplyCrateAtBay(order.brand, order.count, false);
                            totalUnloaded += order.count;
                        }
                        sfx.pickup(2);
                        if (totalUnloaded > 0) {
                            showToast(`Delivery van unloaded ${totalUnloaded} phones at Loading Bay`);
                        }
                        renderAllMenus();
                        updateHUD();
                    }
                } else if (activeTruckAnim.phase === 'unload') {
                    if (activeTruckAnim.timer > 0.75) activeTruckAnim.phase = 'depart';
                } else if (activeTruckAnim.phase === 'depart') {
                    truckGroup.position.x += dt * 18;
                    if (truckGroup.position.x > 24) {
                        activeTruckAnim = null;
                        updateHUD();
                        renderAllMenus();
                        if (state.pendingOrders.length > 0) {
                            dispatchTruckIfNeeded();
                        }
                    }
                }
            }

            // 3. First-person movement: W/S forward, A/D strafe, mouse or touch look.
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
            updateFurniture(dt);

        // 4. Pick Up Phones from Loading Bay
            player.pickupCooldown = Math.max(0, player.pickupCooldown - dt);
            if (
                !furnitureCarry && player.pos.distanceTo(LOADING_BAY_POS) < 2.9 &&
                dynamicCrates.length > 0 &&
                player.carryStack.length < state.maxCarry &&
                player.pickupCooldown <= 0
            ) {
                player.pickupCooldown = 0.14;
                const crate = dynamicCrates.pop();
                if (crate.body && rapierReady && rapierWorld) {
                    rapierWorld.removeRigidBody(crate.body);
                }
                crate.mesh.rotation.set(0, player.angle, 0);
                crate.mesh.visible = false;
                player.carryStack.push({ mesh: crate.mesh, brand: crate.brand });
                sfx.pickup(player.carryStack.length);
                updateHUD();
            }

            // 5. Stock Shelves
            player.stockCooldown = Math.max(0, player.stockCooldown - dt);
            if (!furnitureCarry && player.carryStack.length > 0 && player.stockCooldown <= 0) {
                for (let i = 0; i < shelves.length; i++) {
                    const shelf = shelves[i];
                    if (!shelf.unlocked || shelf.items.length >= shelf.capacity) continue;
                    if (player.pos.distanceTo(shelf.pos) < 2.55) {
                        player.stockCooldown = 0.16;
                        const carried = player.carryStack.pop();
                        carried.mesh.visible = true;
                        carried.mesh.position.set(player.pos.x,player.pos.y+1.05,player.pos.z);
                        const slotWorld = getSlotWorld(shelf, shelf.items.length);
                        shelf.items.push(carried);
                        sfx.stockShelf();
                        spawnParabolicArc(carried.mesh, slotWorld, 0.2, () => {
                            carried.mesh.rotation.set(0, shelf.rotation, 0);
                        });
                        updateHUD();
                        break;
                    }
                }
            }

            // 6. Collect Cash Pile
            if (cashPileBundles.length > 0 && player.pos.distanceTo(CASH_PILE_POS) < 2.2) {
                let collectedTotal = 0;
                const count = cashPileBundles.length;
                const targetPlayerChest = player.pos.clone().add(new THREE.Vector3(0, 1.2, 0));
                while (cashPileBundles.length > 0) {
                    const b = cashPileBundles.pop();
                    collectedTotal += b.value;
                    spawnParabolicArc(b.mesh, targetPlayerChest, 0.2, () => {
                        scene.remove(b.mesh);
                    });
                }
                state.money += collectedTotal;
                updateCashDecalText(0);
                sfx.collectMoney(count);
                const pill = document.getElementById('money-pill');
                pill.classList.add('scale-105');
                setTimeout(() => pill.classList.remove('scale-105'), 140);
                renderAllMenus();
                updateHUD();
            }

            // 7. Floor Pads
            for (let i = 0; i < floorPads.length; i++) {
                const pad = floorPads[i];
                if (!pad.active) continue;
                if (player.pos.distanceTo(pad.pos) < 1.55) {
                    pad.dwellTimer += dt;
                    if (pad.dwellTimer > 1.5) {
                        pad.dwellTimer = -3;
                        pad.onTrigger();
                    }
                } else {
                    pad.dwellTimer = 0;
                }
            }

            // 8. Restocker Staff AI
            if (stockerStaff) {
                stockerStaff.cooldown = Math.max(0, stockerStaff.cooldown - dt);
                let stockerMoving = false;
                let target = null;
                const maxCarry = Math.max(1, state.stockerMaxCarry || 3);
                const actionInterval = Math.max(0.08, 0.22 / (state.stockerSpeed / BASE_STOCKER_SPEED));
                const needyShelf = shelves
                    .filter(s => s.unlocked && s.items.length < s.capacity)
                    .sort((a, b) => b.items.length - a.items.length || stockerStaff.pos.distanceTo(a.pos) - stockerStaff.pos.distanceTo(b.pos))[0];

                if (stockerStaff.mode === 'COLLECT') {
                    if (stockerStaff.carryStack.length >= maxCarry || (stockerStaff.carryStack.length > 0 && dynamicCrates.length === 0)) {
                        stockerStaff.mode = 'DELIVER';
                    } else if (dynamicCrates.length > 0) {
                        target = LOADING_BAY_POS;
                        if (stockerStaff.pos.distanceTo(LOADING_BAY_POS) < 2.2 && stockerStaff.cooldown <= 0) {
                            stockerStaff.cooldown = actionInterval;
                            const crate = dynamicCrates.pop();
                            if (crate.body && rapierReady && rapierWorld) {
                                rapierWorld.removeRigidBody(crate.body);
                            }
                            stockerStaff.carryStack.push({ mesh: crate.mesh, brand: crate.brand });
                            if (stockerStaff.carryStack.length >= maxCarry || dynamicCrates.length === 0) {
                                stockerStaff.mode = 'DELIVER';
                            }
                            updateHUD();
                        }
                    } else {
                        stockerStaff.mode = stockerStaff.carryStack.length > 0 ? 'DELIVER' : 'IDLE';
                    }
                }

                if (stockerStaff.mode === 'IDLE' && (dynamicCrates.length > 0 || stockerStaff.carryStack.length > 0)) {
                    stockerStaff.mode = stockerStaff.carryStack.length > 0 ? 'DELIVER' : 'COLLECT';
                }

                if (stockerStaff.mode === 'DELIVER') {
                    if (stockerStaff.carryStack.length === 0) {
                        stockerStaff.mode = dynamicCrates.length > 0 ? 'COLLECT' : 'IDLE';
                    } else if (needyShelf) {
                        target = nearestShelfApproach(needyShelf, stockerStaff.pos);
                        if (distanceToShelf(stockerStaff.pos, needyShelf) < 1.05 && stockerStaff.cooldown <= 0) {
                            stockerStaff.cooldown = actionInterval;
                            const item = stockerStaff.carryStack.pop();
                            const slotWorld = getSlotWorld(needyShelf, needyShelf.items.length);
                            needyShelf.items.push(item);
                            spawnParabolicArc(item.mesh, slotWorld, 0.18, () => { item.mesh.rotation.set(0, needyShelf.rotation, 0); });
                            if (stockerStaff.carryStack.length === 0) {
                                stockerStaff.mode = dynamicCrates.length > 0 ? 'COLLECT' : 'IDLE';
                            }
                            updateHUD();
                        }
                    } else {
                        stockerStaff.mode = 'WAIT';
                    }
                } else if (stockerStaff.mode === 'WAIT' && needyShelf) {
                    stockerStaff.mode = 'DELIVER';
                    target = nearestShelfApproach(needyShelf, stockerStaff.pos);
                }

                if (!target && stockerStaff.mode === 'IDLE') {
                    scratchVecB.set(-2.5, 0.08, 2.5);
                    target = scratchVecB;
                }
                if (target && stockerStaff.pos.distanceTo(target) > 0.24) {
                    stockerMoving = moveAgent(stockerStaff, target, state.stockerSpeed, dt);
                    stockerStaff.mesh.position.copy(stockerStaff.pos);
                }
                animateStickman(stockerStaff.mesh, stockerMoving, stockerStaff.carryStack.length > 0, dt);

                stockerStaff.mesh.userData.carryAnchor.getWorldPosition(scratchVecA);
                for (let idx = 0; idx < stockerStaff.carryStack.length; idx++) {
                    stockerStaff.carryStack[idx].mesh.position.set(scratchVecA.x, scratchVecA.y + idx * 0.14, scratchVecA.z);
                }
            }

            // 9. Customer Spawning & AI
            customerSpawnTimer -= dt;
            if (customerSpawnTimer <= 0) {
                customerSpawnTimer = state.shopExpanded ? 2.3 : 3.6;
                spawnCustomer();
            }

            const queuedCustomers = [];
            for (let i = 0; i < customers.length; i++) {
                if (customers[i].state === 'QUEUING') queuedCustomers.push(customers[i]);
            }

            for (let i = customers.length - 1; i >= 0; i--) {
                const c = customers[i];
                let moving = false;

                if (c.state === 'APPROACHING') {
                    if (c.pos.distanceTo(c.targetPos) > .32) moving = moveAgent(c,c.targetPos,2.45,dt);
                    else {c.state='ENTERING';c.targetPos=c.insideTarget;c.nav=null;}
                } else if (c.state === 'ENTERING') {
                    if (c.pos.distanceTo(c.targetPos) > 0.32) moving = moveAgent(c, c.targetPos, 2.45, dt);
                    else { c.state = 'BROWSING'; c.nav = null; }
                } else if (c.state === 'BROWSING') {
                    if (
                        !c.targetShelf || !c.targetShelf.unlocked || !c.browsePos ||
                        worldBlocked(c.browsePos.x, c.browsePos.z, ACTOR_RADIUS) ||
                        (c.targetShelf.items.length === 0 && shelves.some(s => s.unlocked && s.items.length > 0))
                    ) {
                        releaseBrowse(c);
                        reserveBrowseSpot(c);
                    }
                    if (!c.browsePos) reserveBrowseSpot(c);
                    if (c.browsePos) {
                        if (c.pos.distanceTo(c.browsePos) > 0.30) moving = moveAgent(c, c.browsePos, 2.3, dt);
                        else {
                            c.mesh.rotation.y = Math.atan2(c.targetShelf.pos.x - c.pos.x, c.targetShelf.pos.z - c.pos.z);
                            if (c.targetShelf.items.length > 0) {
                                c.waitTimer += dt;
                                if (c.waitTimer > 0.4) {
                                    c.carriedItem = c.targetShelf.items.pop();
                                    for(let ai=activeArcs.length-1;ai>=0;ai--)if(activeArcs[ai].mesh===c.carriedItem.mesh)activeArcs.splice(ai,1);
                                    c.state = 'QUEUING';
                                    c.waitTimer = 0;
                                    releaseBrowse(c);
                                    c.nav = null;
                                    if (c.mesh.userData.statusBadge) c.mesh.userData.statusBadge.visible = true;
                                    updateHUD();
                                }
                            }
                        }
                    }
                } else if (c.state === 'QUEUING') {
                    const qIndex = queuedCustomers.indexOf(c);
                    const queueTarget = queuePosition(qIndex, queuedCustomers);
                    if (queueTarget && c.pos.distanceTo(queueTarget) > 0.24) moving = moveAgent(c, queueTarget, 2.4, dt);
                    else if (queueTarget) c.mesh.rotation.y = Math.PI;
                } else if (c.state === 'LEAVING') {
                    if (c.pos.distanceTo(c.targetPos) > 0.4) moving = moveAgent(c, c.targetPos, 2.8, dt);
                    else {
                        scene.remove(c.mesh);
                        if (c.carriedItem) scene.remove(c.carriedItem.mesh);
                        customers.splice(i, 1);
                        continue;
                    }
                }

                c.mesh.position.copy(c.pos);
                animateStickman(c.mesh, moving, Boolean(c.carriedItem), dt);

                if (c.carriedItem) {
                    c.mesh.userData.carryAnchor.getWorldPosition(scratchVecA);
                    c.carriedItem.mesh.position.copy(scratchVecA);
                    c.carriedItem.mesh.rotation.y = c.mesh.rotation.y;
                }
            }

            // 10. Checkout Counter Processing
            const frontCustomer = queuedCustomers[0];
            const playerAtCounter = player.pos.distanceTo(CASHIER_SPOT) < 1.75;
            standRing.material.color.setHex(playerAtCounter || cashierStaff ? 0x22c55e : 0x38bdf8);

            if (
                frontCustomer &&
                frontCustomer.pos.distanceTo(CHECKOUT_QUEUE_FRONT) < 0.65 &&
                (playerAtCounter || cashierStaff)
            ) {
                const speedMultiplier = cashierStaff ? state.checkoutSpeedMult : 1.0;
                checkoutProgress += dt * 2.4 * speedMultiplier;
                if (checkoutProgress >= 1.0) {
                    checkoutProgress = 0;
                    const soldBrand = frontCustomer.carriedItem ? frontCustomer.carriedItem.brand : PHONE_BRANDS[0];
                    const saleAmount = soldBrand.sellPrice;

                    state.totalSold += 1;
                    state.totalRevenue += saleAmount;

                    sfx.cashRegister();
                    addCashToPile(saleAmount);

                    if (frontCustomer.mesh.userData.statusBadge) {
                        frontCustomer.mesh.userData.statusBadge.visible = false;
                    }
                    frontCustomer.state = 'LEAVING';
                    frontCustomer.targetPos = new THREE.Vector3(Math.random() < 0.5 ? -15 : 15, 0.08, 8.0);
                    updateHUD();
                }
            } else {
                checkoutProgress = 0;
            }

            // 11. Step Parabolic Arcs
            for (let i = activeArcs.length - 1; i >= 0; i--) {
                const a = activeArcs[i];
                a.elapsed += dt;
                const t = Math.min(1, a.elapsed / a.duration);
                a.mesh.position.lerpVectors(a.start, a.end, t);
                a.mesh.position.y += Math.sin(t * Math.PI) * .65;
                if (t >= 1) {
                    if (a.onComplete) a.onComplete();
                    activeArcs.splice(i, 1);
                }
            }
        }

        function animate(now) {
            requestAnimationFrame(animate);
            const dt = Math.min(0.05, (now - lastTime) / 1000);
            lastTime = now;
            updateGame(dt);
            updateTraffic(dt);
            updateDayNight(dt);
            updateFirstPersonHUD(dt);
            renderer.render(scene, camera);
        }

        function onWindowResize() {
            camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth,window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);

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
                    timeOfDay
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
                if(state.pendingOrders.length)dispatchTruckIfNeeded();
                return true;
            }catch(e){console.warn('Could not restore save:',e);return false;}
        }
        window.addEventListener('pagehide',saveGame);
        document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveGame();});


        

        function bootstrap(){
            const restored=restoreGame();
            if(!restored)spawnSupplyCrateAtBay(PHONE_BRANDS[0],1,true);
            spawnCustomer();renderAllMenus();updateHUD();
            requestAnimationFrame(animate);
            setInterval(saveGame,5000);
        }
        bootstrap();
