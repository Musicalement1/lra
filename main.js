const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const titleScreen = document.getElementById("titleScreen");
const startBtn = document.getElementById("startBtn");
const saveInput = document.getElementById("saveInput");

startBtn.addEventListener("click", () => {
    let state = saveInput.value || "0";

    titleScreen.remove();

    loadState(state);
});

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);

async function makeDialogue(list, vars = {}) {
    const box = document.getElementById("dialogueBox");
    box.style.display = "block";

    let i = 0;
    function isColorName(str) {
        const s = new Option().style;
        s.color = str;
        return s.color !== "";
    }

    function tokensToHTML(tokens) {
        let html = "";
        let buffer = "";
        let currentStyle = "";
        let currentClass = "";
    
        function flush() {
            if (!buffer) return;
            html += `<span class="${currentClass}" style="${currentStyle}">${buffer}</span>`;
            buffer = "";
        }
    
        tokens.forEach(t => {
            let style = JSON.stringify(t.style);
            let cls = t.className;
    
            if (style !== currentStyle || cls !== currentClass) {
                flush();
                currentStyle = style;
                currentClass = cls;
            }
    
            buffer += t.char;
        });
    
        flush();
        return html;
    }

    function tokenize(text, vars = {}) {

        //vars
        text = text.replace(/%(.*?)%/g, (_, v) => {
            return (vars[v] !== undefined) ? vars[v].toString() : "";
        });
    
        let tokens = [];
        let i = 0;
    
        while (i < text.length) {
    
            if (text[i] === "§") {
                let end = text.indexOf("§", i + 1);
                if (end === -1) break;
    
                let content = text.slice(i + 1, end);
                let parts = content.split(":");
    
                let modifier = parts.length > 1 ? parts[0] : null;
                let value = parts.length > 1 ? parts.slice(1).join(":") : parts[0];
    
                let style = {};
                let className = "";
    
                if (!modifier) {
                    style.color = "#4da6ff";
                }
                else if (modifier.startsWith("#") || isColorName(modifier)) {
                    style.color = modifier;
                }
                else if (modifier === "b") style.fontWeight = "bold";
                else if (modifier === "i") style.fontStyle = "italic";
                else if (modifier === "u") style.textDecoration = "underline";
                else if (modifier === "s") style.textDecoration = "line-through";
                else if (!isNaN(modifier)) style.fontSize = modifier + "px";
                else if (modifier === "obfuscate") className = "obfuscate";
    
                for (let c of value) {
                    tokens.push({ char: c, style, className });
                }
    
                i = end + 1;
            }
            else {
                tokens.push({ char: text[i], style: {}, className: "" });
                i++;
            }
        }
    
        return tokens;
    }

    async function typeText(tokens) {
        return new Promise(resolve => {
    
            box.innerHTML = "";
            let speed = 30;
            let finished = false;
    
            let index = 0;
    
            function write() {
                if (index < tokens.length && !finished) {
    
                    let t = tokens[index];
    
                    let span = document.createElement("span");
                    span.textContent = t.char;
    
                    //appliquer styles
                    Object.assign(span.style, t.style);
                    if (t.className) span.classList.add(t.className);
    
                    box.appendChild(span);
    
                    index++;
                    setTimeout(write, speed);
                }
                else {
                    // finir instant
                    for (; index < tokens.length; index++) {
                        let t = tokens[index];
    
                        let span = document.createElement("span");
                        span.textContent = t.char;
                        Object.assign(span.style, t.style);
                        if (t.className) span.classList.add(t.className);
    
                        box.appendChild(span);
                    }
    
                    resolve();
                }
            }
    
            function skip(e) {
                if (e.code === "Space" || e.code === "Enter") {
                    finished = true;
                }
            }
    
            document.addEventListener("keydown", skip, { once: true });
    
            write();
        });
    }

    async function waitSpace() {
        return new Promise(resolve => {
            function handler(e) {
                if (e.code === "Space" || e.code === "Enter") {
                    document.removeEventListener("keydown", handler);
                    resolve();
                }
            }
            document.addEventListener("keydown", handler);
        });
    }

    while (i < list.length) {
        let item = list[i];

        //texte simple
        if (typeof item === "string") {
            let tokens = tokenize(item, vars);
            await typeText(tokens);
            await waitSpace();
        }

        else if (Array.isArray(item)) {

            //Input
            if (item[0] === "input") {
                box.innerHTML = tokensToHTML(tokenize(item[1], vars)) + "<br>";
                
                let input = document.createElement("input");
                box.appendChild(input);
                input.focus();

                return new Promise(resolve => {
                    function handler(e) {
                        if (e.code === "Space" || e.code === "Enter") {
                            document.removeEventListener("keydown", handler);
                            let val = input.value;
                            box.style.display = "none";
                            resolve(val);
                        }
                    }
                    document.addEventListener("keydown", handler);
                });
            }

            //Choix multiple
            else {
                let question = item[0];
                let choices = item.slice(1);

                let selected = 0;

                function renderChoices() {
                    box.innerHTML = tokensToHTML(tokenize(question, vars)) + "<br>";
                
                    choices.forEach((c, idx) => {
                        let div = document.createElement("div");
                        div.className = "choice" + (idx === selected ? " selected" : "");
                
                        let marker = document.createElement("span");
                        marker.textContent = (idx === selected ? "> " : "  ");
                
                        let text = document.createElement("span");
                        text.innerHTML = tokensToHTML(tokenize(c, vars));
                
                        div.appendChild(marker);
                        div.appendChild(text);
                
                        box.appendChild(div);
                    });
                }

                renderChoices();

                return new Promise(resolve => {
                    function handler(e) {
                        if (e.code === "ArrowUp") {
                            selected = (selected - 1 + choices.length) % choices.length;
                            renderChoices();
                        }
                        else if (e.code === "ArrowDown") {
                            selected = (selected + 1) % choices.length;
                            renderChoices();
                        }
                        else if (e.code === "Space" || e.code === "Enter") {
                            document.removeEventListener("keydown", handler);
                            box.style.display = "none";
                            resolve(selected);
                        }
                    }

                    document.addEventListener("keydown", handler);
                });
            }
        }

        i++;
    }

    box.style.display = "none";
}
function startObfuscation() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    setInterval(() => {
        document.querySelectorAll(".obfuscate").forEach(el => {
            let length = el.textContent.length;
            let newText = "";

            for (let i = 0; i < length; i++) {
                newText += chars[Math.floor(Math.random() * chars.length)];
            }

            el.textContent = newText;
        });
    }, 50);
}
startObfuscation();



/*
let helloVariable = "§red:Meh§";

(async () => {
    let result = await makeDialogue([
        "Salut",
        "§#123456:ee§",
        "§i:ee§",
        "§50:ee§",
        "§obfuscate:ee§",
        "Tu vas §bien?§",
        "%helloVariable%",
        ["Hey","Oui","Non","%helloVariable%","§obfuscate:bruh§"]
    ], {
        helloVariable: helloVariable
    });

    console.log(result);//0, 1 ou 2
    if (result == 1) {
        let result2 = await makeDialogue([
            "Yo pourquoi donc???",
            ["input","Oui c'est vrai ça §red:pourquoi§ donc?"]
        ])
    }
})();
*/

async function testScene() {
    let helloVariable = "§red:Meh§";
    let result = await makeDialogue([
        "Salut",
        "§#123456:ee§",
        "§i:ee§",
        "§50:ee§",
        "§obfuscate:ee§",
        "Tu vas §bien?§",
        "%helloVariable%",
        ["Hey","Oui","Non","%helloVariable%","§obfuscate:bruh§"]
    ], {
        helloVariable: helloVariable
    });

    if (result === 0) {
        await loadState("0");
    } else {
        await makeDialogue(["Ok bye"]);
    }
}
async function introScene() {

}

const states = {
    "-1": testScene,
    "0": introScene
};

async function loadState(state) {
    if (states[state]) {
        await states[state]();
    } else {
        await makeDialogue(["State inconnu"]);
    }
}