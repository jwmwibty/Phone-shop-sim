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
        function resetInputPointers() {
            const ids=[movePointer,lookPointer,dragPointer].filter(id=>id!==null);
            for(const id of ids){
                try{inputSurface.releasePointerCapture(id);}catch(_){}
                releasePointer({pointerId:id});
            }
            input.joyVec.set(0,0);
        }

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
            if (orientationBlocked) return;
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
            resetInputPointers();
            cancelFurnitureHold();
        });
