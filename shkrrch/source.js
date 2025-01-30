var shkrThumb = "https://cdn2.scratch.mit.edu/get_image/project/1125886727_144x108.png";
var getElemsWithBackgroundImage = () => [...document.querySelectorAll('*')].filter(el => window.getComputedStyle(el).backgroundImage !== 'none');
fetch('https://raw.githubusercontent.com/klashdevelopment/gloe/refs/heads/main/gloe.js')
    .then(gloeScript => gloeScript.text())
    .then(gloeScript => eval(gloeScript))
    .then(_ => {
        window.gloe.loadGoogleFont([{name: "Inter", weights: [400,700]}, {name: "Comic Neue", weights: [400]}]);
        window.gloe.create({title: "shkrrch! by Klash", id: "shkrrch-tool", content: `
<b>[ silly stuff ]</b>
<button id="silly-cs">comic sansify</button>
<button id="silly-shkr">shkr page</button>
<button id="silly-rotate">hover rotate (fun)</button>
<button id="silly-altcaps">text replacer</button>
        `, onCreated:(win)=>{
            window.gloe.clickFor('#silly-cs', ()=>{
                let style = document.createElement('style');
                style.innerHTML = "* { font-family: 'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', sans-serif !important; }";
                document.head.appendChild(style);
            });
            window.gloe.clickFor('#silly-shkr', ()=>{
                document.querySelectorAll('img, svg').forEach(x => x.src=shkrThumb);
                getElemsWithBackgroundImage().forEach(x => x.src=shkrThumb);
            });
            window.gloe.clickFor('#silly-rotate', ()=>{
                document.querySelectorAll('*:not(body, html, div, .scroll-content)').forEach(x=>{x.addEventListener('mousemove', ()=>{x.style.rotate=((x.style.rotate==null||x.style.rotate=='')?'1deg':`${parseInt(x.style.rotate.replace('deg',''))+1}deg`)})});
            });
            window.gloe.clickFor('#silly-altcaps', ()=>{
                var pr = prompt("text input");
                document.querySelectorAll('span, a, textarea, input, b, i, h1, h2, h3, h4, h5, h6').forEach(text => {if(text.querySelector('img')!=null)return;text.textContent=pr;});
            });
        }});
    });
