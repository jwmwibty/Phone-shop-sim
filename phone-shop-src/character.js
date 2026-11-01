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
                mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
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
            batchDirectMeshes(bodyRig);
            root.userData={bodyRig,leftLeg,rightLeg,leftArm,rightArm,carryAnchor,statusBadge,walkCycle:Math.random()*10};
            return root;
        }
