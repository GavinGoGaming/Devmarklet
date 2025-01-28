if(!window.pxtvp_init){
    window.pxtvp_init = "yahoo!";
    fetch('https://raw.githubusercontent.com/klashdevelopment/gloe/refs/heads/main/gloe.js')
        .then(gloeScript => gloeScript.text())
        .then(gloeScript => eval(gloeScript))
        .then(_ => {
            window.gloe.create({
                title: "PX to Viewport v2",
                content: `
                Pixel Value Input:
                <input id="pxtvp-calc-i" type="number" style="background:#0005;border:2px solid #fff5;border-radius:4px;color:white;font-family:KlashLegacy;"> <br/>
                <button class="gloe-button" id="pxtvp-calc-w" style="width: auto;font-family:KlashLegacy;color:white;">Calculate Width (VW)</button>
                <button class="gloe-button" id="pxtvp-calc-h" style="width: auto;font-family:KlashLegacy;color:white;">Calculate Height (VH)</button>
                Viewport Output:
                <input id="pxtvp-calc-o" readonly type="text" style="background:#0005;border:2px solid #fff5;border-radius:4px;color:white;font-family:KlashLegacy;">
                `,
                onCreated: (win) => {
                    function calculateWidth(px) {
                        return ((px / document.documentElement.clientWidth) * 100).toFixed(2) + "vw";
                    }
                    function calculateHeight(px) {
                        return ((px / document.documentElement.clientHeight) * 100).toFixed(2) + "vh";
                    }

                    const inputField = document.querySelector("#pxtvp-calc-i");
                    const outputField = document.querySelector("#pxtvp-calc-o");
                    const calcWidthButton = document.querySelector("#pxtvp-calc-w");
                    const calcHeightButton = document.querySelector("#pxtvp-calc-h");

                    calcWidthButton.addEventListener("click", () => {
                        const pixelValue = parseFloat(inputField.value);
                        if (!isNaN(pixelValue)) {
                            outputField.value = calculateWidth(pixelValue);
                        } else {
                            alert("Please enter a valid pixel value.");
                        }
                    });

                    calcHeightButton.addEventListener("click", () => {
                        const pixelValue = parseFloat(inputField.value);
                        if (!isNaN(pixelValue)) {
                            outputField.value = calculateHeight(pixelValue);
                        } else {
                            alert("Please enter a valid pixel value.");
                        }
                    });
                }
            });
        });
}
