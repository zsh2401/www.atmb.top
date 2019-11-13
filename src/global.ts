import "./global.css"
(()=>{
    let resizer = ()=>{
            let bvideos = document.getElementsByClassName("resizable-bvideo") as HTMLCollectionOf<HTMLIFrameElement>;
            for(let i = 0;i<bvideos.length;i++){
                let crt = bvideos[i];
                let w = crt.offsetWidth;
                let h = w * 0.66;
                crt.style.height = h + "px";
            }
    }
    resizer();
    window.addEventListener("resize",resizer)
})();