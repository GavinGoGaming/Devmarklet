// Already have a PXTVP? Remove it and add a new one.
if(document.querySelector('#pxtvp')){
  document.querySelector('#pxtvp').remove();
  alert("pxtvp already existed - deleting old and replacing with new instance");
}

// Save copy icon svg for later
const svg = `<style type="text/css">.st0{fill-rule:evenodd;clip-rule:evenodd;}</style><g><path fill="#ffffff" class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/></g>`

// Add UI
document.body.insertAdjacentHTML('afterbegin', `
<div style="font-family:Arial;background:#222;color:white;position:absolute;top:10px;left:10px;z-index:1000;padding:10px;border:1px solid #ffffff50;border-radius:10px;margin:0;width:250px;" id="pxtvp">
<b>px to vp</b><br/>by <a href="https://github.com/gavingogaming" target="_blank">gavin</a></br><input id="PVpx" type="number" placeholder="Pixel Amount" style="background:#222;color:white;border:1px solid #ffffff20;width:100%;border-radius:2px;"><br/><button style="background:#111;color:white;border:1px solid #ffffff20;width:100%;border-radius:5px;" id="PVwidth">Calc. Width</button><br/><button style="background:#111;color:white;border:1px solid #ffffff20;width:100%;border-radius:5px;" id="PVheight">Calc. Height</button>
<span id="PVrew">Width: 0vw</span> <span id="PVcopyw"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve" width="16">${svg}</svg></span><br/>
<span id="PVre">Height: 0vh</span> <span id="PVcopyh"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve" width="16">${svg}</svg></span>
</div>
`);

// Variables
const height = document.querySelector('#PVheight');
const width = document.querySelector('#PVwidth');

const copyw = document.querySelector('#PVcopyw');
const copyh = document.querySelector('#PVcopyh');

const res = document.querySelector('#PVre');
const resw = document.querySelector('#PVrew');

// Handlers - buttons
function handlerHeight() {
    res.innerText='Height: ' + (`${(document.querySelector('#PVpx').value/document.documentElement.clientHeight)*100}`.substr(0,6)) + "vh";
}
function handlerWidth() {
    resw.innerText='Width: ' + (`${(document.querySelector('#PVpx').value/document.documentElement.clientWidth)*100}`.substr(0,6)) + "vw";
}

// Handlers - Copy
function copywidth() {
navigator.clipboard.writeText((`${(document.querySelector('#PVpx').value/document.documentElement.clientWidth)*100}`.substr(0,6)) + "vw")
}
function copyheight() {
navigator.clipboard.writeText((`${(document.querySelector('#PVpx').value/document.documentElement.clientHeight)*100}`.substr(0,6)) + "vh");
}

// Init handlers
height.addEventListener('click',handlerHeight);
width.addEventListener('click',handlerWidth);
copyw.addEventListener('click',copywidth);
copyh.addEventListener('click',copyheight);
