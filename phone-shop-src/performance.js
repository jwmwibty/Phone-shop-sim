        // Repeated static parts share one draw call per geometry/material, while
        // each parent remains independently movable and raycastable.
        let optimizedBatchCount = 0;
        function batchDirectMeshes(group, protectedObjects = null) {
            if (!group || !group.children) return;
            const buckets = new Map();
            for (const mesh of group.children) {
                if (!mesh.isMesh || mesh.isInstancedMesh || !mesh.visible || mesh.children.length ||
                    (protectedObjects && protectedObjects.has(mesh)) || Array.isArray(mesh.material) || !mesh.geometry || !mesh.material) continue;
                let materialBuckets = buckets.get(mesh.geometry);
                if (!materialBuckets) { materialBuckets = new Map(); buckets.set(mesh.geometry, materialBuckets); }
                const key = `${mesh.material.uuid}:${mesh.castShadow ? 1 : 0}:${mesh.receiveShadow ? 1 : 0}:${mesh.renderOrder}`;
                if (!materialBuckets.has(key)) materialBuckets.set(key, []);
                materialBuckets.get(key).push(mesh);
            }
            for (const [geometry, materialBuckets] of buckets) {
                for (const meshes of materialBuckets.values()) {
                    if (meshes.length < 2) continue;
                    const first = meshes[0], batch = new THREE.InstancedMesh(geometry, first.material, meshes.length);
                    batch.name = 'static-parts';
                    batch.castShadow = first.castShadow;
                    batch.receiveShadow = first.receiveShadow;
                    batch.renderOrder = first.renderOrder;
                    // r128 cannot calculate a correct instanced bounding sphere automatically.
                    batch.frustumCulled = false;
                    for (let i=0;i<meshes.length;i++) {
                        meshes[i].updateMatrix();
                        batch.setMatrixAt(i, meshes[i].matrix);
                    }
                    batch.instanceMatrix.setUsage(THREE.StaticDrawUsage);
                    batch.instanceMatrix.needsUpdate = true;
                    for (const mesh of meshes) group.remove(mesh);
                    group.add(batch);
                    optimizedBatchCount += meshes.length - 1;
                }
            }
        }
        function optimizeStaticWorld() {
            // These objects are resized/recoloured by gameplay or store expansion.
            const keep = new Set([shopFloor, backWall, backTrim, leftWall, leftTrim, tileInstMesh,
                cashPad, shell.ceiling, shell.ceilingTrim, palletBase, bayBorder, standRing, deskBody, frontPanel]);
            const groups = [];
            worldGroup.traverse(o => { if (o.isGroup) groups.push(o); });
            for (const group of groups) batchDirectMeshes(group, keep);
            renderer.shadowMap.needsUpdate = true;
        }
        function setRenderScale(value) {
            const next = Math.max(performanceQuality.minRatio, Math.min(performanceQuality.maxRatio, value));
            if (Math.abs(next - performanceQuality.ratio) < .01) return;
            performanceQuality.ratio = next;
            renderer.setPixelRatio(next);
            const current = document.getElementById('render-scale-current');
            if (current) current.textContent = `${Math.round(next * 100)}%`;
        }
        function refreshDisplayScale() {
            const deviceRatio = window.devicePixelRatio || 1;
            const requestedMax = Number.isFinite(performanceQuality.requestedMaxRatio) ? performanceQuality.requestedMaxRatio : (mobileGraphics ? 1.15 : 1.35);
            performanceQuality.maxRatio = Math.min(deviceRatio, requestedMax);
            performanceQuality.minRatio = Math.min(performanceQuality.maxRatio, mobileGraphics ? .65 : .75);
            setRenderScale(Math.min(performanceQuality.ratio, performanceQuality.maxRatio));
        }
        // Use actual frame times, not a device-name guess. Hysteresis prevents
        // resolution flicker and lets a faster device regain detail gradually.
        function observeFrameTime(milliseconds) {
            if (!Number.isFinite(milliseconds) || milliseconds <= 0 || milliseconds > 750 || document.hidden) {
                performanceQuality.elapsed = 0; performanceQuality.frames = 0; return;
            }
            performanceQuality.elapsed += milliseconds;
            performanceQuality.frames++;
            if (performanceQuality.elapsed < 3000 || performanceQuality.frames < 3) return;
            const mean = performanceQuality.elapsed / performanceQuality.frames;
            performanceQuality.elapsed = 0; performanceQuality.frames = 0;
            if (mean > 24) {
                performanceQuality.goodWindows = 0;
                setRenderScale(performanceQuality.ratio - (mean > 35 ? .15 : .10));
            } else if (mean < 17.5) {
                if (++performanceQuality.goodWindows >= 3) {
                    performanceQuality.goodWindows = 0;
                    setRenderScale(performanceQuality.ratio + .05);
                }
            } else performanceQuality.goodWindows = 0;
        }
