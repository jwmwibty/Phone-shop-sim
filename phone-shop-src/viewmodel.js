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
