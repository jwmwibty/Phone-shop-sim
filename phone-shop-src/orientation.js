        // Mobile browsers only allow orientation locking after a gesture, and
        // some embedded previews / iOS browsers do not expose the API at all.
        // The rotate screen and manual override keep those cases usable.
        let landscapeOverride = false;
        let orientationBlocked = false;
        const orientationScreen=document.getElementById('orientation-screen');
        const orientationNote=document.getElementById('orientation-note');
        const fullscreenButton=document.getElementById('btn-fullscreen');
        function updateOrientationState(){
            const portrait=window.innerHeight>window.innerWidth;
            if(!portrait)landscapeOverride=false;
            const wasBlocked=orientationBlocked;
            orientationBlocked=!!(isTouchDevice && portrait && !landscapeOverride);
            showEl(orientationScreen,orientationBlocked);
            if(orientationBlocked&&!wasBlocked){
                resetInputPointers();Object.keys(input.keys).forEach(k=>input.keys[k]=false);
                cancelFurnitureHold();releaseCursor();
            }
            fullscreenButton.setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen and landscape');
            fullscreenButton.title=document.fullscreenElement?'Exit fullscreen':'Fullscreen & landscape';
        }
        async function requestLandscapeMode(){
            const root=document.documentElement;
            if(!document.fullscreenElement && root.requestFullscreen){
                try{await root.requestFullscreen({navigationUI:'hide'});}catch(_){/* iframe/iOS may forbid fullscreen */}
            }
            if(screen.orientation && typeof screen.orientation.lock==='function'){
                try{await screen.orientation.lock('landscape');}catch(_){/* manual rotation is still supported */}
            }
            updateOrientationState();
            if(orientationBlocked)orientationNote.textContent='If it does not turn automatically, rotate your device and turn off rotation lock.';
        }
        document.getElementById('btn-landscape').addEventListener('click',requestLandscapeMode);
        document.getElementById('btn-portrait-override').addEventListener('click',()=>{landscapeOverride=true;updateOrientationState();});
        fullscreenButton.addEventListener('click',async()=>{
            if(document.fullscreenElement && document.exitFullscreen){
                try{await document.exitFullscreen();}catch(_){}
                if(screen.orientation && typeof screen.orientation.unlock==='function')try{screen.orientation.unlock();}catch(_){}
                updateOrientationState();
            }else await requestLandscapeMode();
        });
        window.addEventListener('resize',updateOrientationState);
        window.addEventListener('orientationchange',updateOrientationState);
        document.addEventListener('fullscreenchange',updateOrientationState);
        updateOrientationState();
