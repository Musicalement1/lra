async function makeDialogue(list) {
    const box = document.getElementById("dialogueBox");
    box.style.display = "block";

    let i = 0;

    function parseText(text) {
        // §mot§ -> bleu
        text = text.replace(/§(.*?)§/g, '<span class="blue">$1</span>');

        // %variable% -> valeur JS
        text = text.replace(/%(.*?)%/g, (_, v) => {
            return (window[v] !== undefined) ? window[v].toString() : "";
        });

        return text;
    }

    async function typeText(text) {
        return new Promise(resolve => {
            let index = 0;
            let speed = 30;
            let finished = false;

            function write() {
                if (index < text.length && !finished) {
                    box.innerHTML = text.slice(0, index);
                    index++;
                    setTimeout(write, speed);
                } else {
                    box.innerHTML = text;
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
            let parsed = parseText(item);
            await typeText(parsed);
            await waitSpace();
        }

        else if (Array.isArray(item)) {

            //Input
            if (item[0] === "input") {
                box.innerHTML = parseText(item[1]) + "<br>";
                
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
                    box.innerHTML = parseText(question) + "<br>";
                
                    choices.forEach((c, idx) => {
                        let div = document.createElement("div");
                        div.className = "choice" + (idx === selected ? " selected" : "");
                
                        let marker = document.createElement("span");
                        marker.textContent = (idx === selected ? "> " : "  ");
                
                        let text = document.createElement("span");
                        text.innerHTML = parseText(c);
                
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




/*
window.helloVariable = "Meh";

(async () => {
    let result = await makeDialogue([
        "Salut",
        "Tu vas §bien?§",
        "%helloVariable%",
        ["Hey","Oui","Non","%helloVariable%"]
    ]);

    console.log(result);//0, 1 ou 2
    if (result == 1) {
        let result2 = await makeDialogue([
            "Yo pourquoi donc???",
            ["input","Oui c'est vrai ça pourquoi donc?"]
        ])
    }
})();
*/