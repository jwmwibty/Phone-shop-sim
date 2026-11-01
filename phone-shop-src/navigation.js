        // Furniture and walls change infrequently, so reuse their occupancy grid.
        let cachedNavRevision = -1, staticNavBlocked = null;
        function getStaticNavGrid() {
            if (staticNavBlocked && cachedNavRevision === navRevision) return staticNavBlocked;
            const grid = new Uint8Array(NAV_W * NAV_H);
            for (let z=0; z<NAV_H; z++) for (let x=0; x<NAV_W; x++) {
                grid[z*NAV_W+x] = worldBlocked(NAV_X0+x*NAV_STEP, NAV_Z0+z*NAV_STEP, ACTOR_RADIUS+.04) ? 1 : 0;
            }
            staticNavBlocked=grid;cachedNavRevision=navRevision;return grid;
        }
        function navPath(from, to, agent, avoidPeople) {
            const snap=p=>({x:Math.max(0,Math.min(NAV_W-1,Math.round((p.x-NAV_X0)/NAV_STEP))),z:Math.max(0,Math.min(NAV_H-1,Math.round((p.z-NAV_Z0)/NAV_STEP)))});
            const start=snap(from),goal=snap(to),total=NAV_W*NAV_H,staticBlocked=getStaticNavGrid();
            const localBlocked=new Int8Array(total);localBlocked.fill(-1);
            const people=avoidPeople?[player,...customers,...(stockerStaff?[stockerStaff]:[]),...(cashierStaff?[cashierStaff]:[])].filter(p=>p!==agent).map(p=>p.pos):[];
            function blockedAt(x,z){
                if(x<0||x>=NAV_W||z<0||z>=NAV_H)return true;
                const id=gridIndex(x,z);if(localBlocked[id]>=0)return localBlocked[id]===1;
                let blocked=staticBlocked[id]===1;
                if(!blocked&&people.length){
                    const px=NAV_X0+x*NAV_STEP,pz=NAV_Z0+z*NAV_STEP;
                    const toDist=(px-to.x)**2+(pz-to.z)**2,fromDist=(px-from.x)**2+(pz-from.z)**2;
                    if(toDist>.65*.65&&fromDist>.75*.75)blocked=people.some(p=>(p.x-px)**2+(p.z-pz)**2<.9*.9);
                }
                localBlocked[id]=blocked?1:0;return blocked;
            }
            let best=null,bd=Infinity;
            for(let z=Math.max(0,goal.z-3);z<=Math.min(NAV_H-1,goal.z+3);z++)for(let x=Math.max(0,goal.x-3);x<=Math.min(NAV_W-1,goal.x+3);x++){
                if(blockedAt(x,z))continue;
                const dx=NAV_X0+x*NAV_STEP-to.x,dz=NAV_Z0+z*NAV_STEP-to.z,d=dx*dx+dz*dz;
                if(d<bd){best={x,z};bd=d;}
            }
            if(!best||bd>1.6*1.6)return [];
            const si=gridIndex(start.x,start.z),gi=gridIndex(best.x,best.z),dist=new Float32Array(total),parent=new Int32Array(total),closed=new Uint8Array(total);
            dist.fill(Infinity);parent.fill(-1);dist[si]=0;
            const heap=[];
            function push(id,score,g){
                const node={id,score,g};let i=heap.length;heap.push(node);
                while(i>0){const p=(i-1)>>1;if(heap[p].score<=score)break;heap[i]=heap[p];i=p;}heap[i]=node;
            }
            function pop(){
                const root=heap[0],end=heap.pop();if(heap.length){let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].score<heap[c].score)c++;if(heap[c].score>=end.score)break;heap[i]=heap[c];i=c;}heap[i]=end;}return root;
            }
            const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
            push(si,Math.hypot(start.x-best.x,start.z-best.z),0);
            while(heap.length){
                const node=pop(),cur=node.id;if(closed[cur]||node.g>dist[cur])continue;if(cur===gi)break;closed[cur]=1;
                const x=cur%NAV_W,z=Math.floor(cur/NAV_W);
                for(const [dx,dz] of dirs){
                    const nx=x+dx,nz=z+dz;if(blockedAt(nx,nz))continue;
                    if(dx&&dz&&(blockedAt(x+dx,z)||blockedAt(x,z+dz)))continue;
                    const ni=gridIndex(nx,nz),cost=dist[cur]+(dx&&dz?1.4142:1);
                    if(cost<dist[ni]){dist[ni]=cost;parent[ni]=cur;const g=dist[ni];push(ni,g+Math.hypot(nx-best.x,nz-best.z),g);}
                }
            }
            if(gi!==si&&parent[gi]<0)return [];
            const path=[];let n=gi;
            while(n!==si&&n>=0){path.push(gridPoint(n%NAV_W,Math.floor(n/NAV_W)));n=parent[n];}
            path.reverse();if(bd<.36&&!worldBlocked(to.x,to.z))path.push(to.clone());return path;
        }
        let queueCacheTimer=0, queueCacheRevision=-1, queueCacheAgents=[], queueCachePositions=[];
        function getQueuePositions(queue,dt){
            queueCacheTimer-=dt;
            const changed=queueCacheRevision!==navRevision||queue.length!==queueCacheAgents.length||queue.some((c,i)=>c!==queueCacheAgents[i]);
            if(changed||queueCacheTimer<=0){
                queueCacheRevision=navRevision;queueCacheAgents=queue.slice();
                queueCachePositions=queue.map((_,i)=>queuePosition(i,queue));queueCacheTimer=.32;
            }
            return queueCachePositions;
        }
