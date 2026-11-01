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
