/* 
    En réalité, ce jeu tourne plus dans le cerveau des gens que sur l'ordinateur, vous savez.
    L'imagination crée des mondes.. je veux dire, -réellement- crée des mondes
    Notre esprit est un monde inviolable dans lequel nous sommes un Dieu, bien réel, même si ce monde n'existe que dans nos esprits
    Mais justement
    Il -existe-
    Ce serait incohérent si deux univers pourraient se superposer
    Ce monde que je propose casse cette loi afin de proposer quelque chose de nouveau
    Oui, vraiment, notre imagination est aussi sacré que la personne que vous formez en ce moment même.
    Dire que l'imagination n'est que des connections neuronales est aussi réducteur de dire qu'une personne n'est qu'un tas de molécules
    Même si ces formulations sont vraies, il y a bien plus de complexité derrière tout ça.
    Et la complexité est le cadeau le plus beau qu'aurait pu faire un univers régi par quelques lois physiques simples.
    L'Univers.
    L'Emergence.
    La vie.
    L'Humain
    L'Esprit.
    L'Univers.
    La Beauté de l'ensemble.
    Et un jour, quelqu'un comme vous regardera cette beauté avec le sentiment d'avoir accompli quelque chose de plus grand que lui et se dira
    "C'est beau"
    Et ce quelqu'un, ce sera vous.
    Un tas de molécules qui, dans la beauté du tout a pris conscience qu'il était un tas de molécules.
    L'univers a pris vie au moment ou il a pu se regarder lui-même.
    L'univers,
    C'est moi,
    C'est toi,
    C'est nous tous.

    - Musicalement1
*/

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


function updateSpeakerPosition() {
    const box = document.getElementById("dialogueBox");
    const speakerBox = document.getElementById("speakerBox");

    if (!speakerBox || speakerBox.style.display === "none") return;

    const rect = box.getBoundingClientRect();

    speakerBox.style.left = rect.left + "px";
    speakerBox.style.top = (rect.top - speakerBox.offsetHeight - 8) + "px";
}

window.addEventListener("resize", updateSpeakerPosition);

async function makeDialogue(list, speaker = null, img = null, speed = 30, vars = {}) {
    const speakerBox = document.getElementById("speakerBox");
    const currImage = document.getElementById("currImage");
    if (speaker) {
        speakerBox.style.display = "block";
        speakerBox.textContent = speaker;
        requestAnimationFrame(updateSpeakerPosition);
    } else {
        speakerBox.style.display = "none";
    }

    if (img) {
        currImage.style.display = "block";
        currImage.innerHTML = `<img src="${img}">`;
    } else {
        currImage.style.display = "none";
    }
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
            //let speed = 30;
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
            updateSpeakerPosition();
            await waitSpace();
        }

        else if (Array.isArray(item)) {

            //Input
            if (item[0] === "input") {
                box.innerHTML = tokensToHTML(tokenize(item[1], vars)) + "<br>";
                updateSpeakerPosition();
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
                    updateSpeakerPosition();
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
    speakerBox.style.display = "none";
    currImage.style.display = "none";
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
    let result = await makeDialogue([//on peut alternativement faire juste await makeDialogue si y a pas besoin du résultat
        "Salut",
        "§#123456:ee§",
        "§i:ee§",
        "§50:ee§",
        "§obfuscate:ee§",
        "Tu vas §bien?§",
        "%helloVariable%",
        ["Hey","Oui","Non","%helloVariable%","§obfuscate:bruh§"]
    ], 
    "Test Guy",
    "img/pepper.png",
    30, {
        helloVariable: helloVariable
    });

    if (result === 0) {
        await loadState("0");
    } else {
        await makeDialogue(["Ok bye"]);
    }
}

async function expositionFake() {
    await makeDialogue([
        "Je m'apelle Anastasie.",
        'Ce nom signifie §i:Renaissance§, plus précisément §i:Résurrection§',
        "J'aime bien ce nom.",
        "Si je devais changer de nom, je ne pense pas que je serai la même.",
        "Ce qui m'intrigue le plus, c'est la signification de ce nom.",
        "Plus j'y pense, plus j'en viens à cette conclusion :",
        "Les noms sont des marques du destin.",
        "§Anastasie§",
        "Nous sommes le 27 mai 2073.",
        "Est une chose est sûre :",
        "Ce nom...",
        "N'est plus un nom.",
        "C'est une §i:désignation§.",
        "§Anastasie§ fait directement référence à §i:moi§.",
        "Et pour ça, je m'excuse auprès de toutes les Anastasies.",
        "Je leur dirai simplement que c'est un beau nom.",
        "Bref..",
        "Comment en est-on arrivés là?",
        "Comment un nom propre",
        "Peut-il désigner une seule entitée?",
        '...§i:"entitée"§',
        "C'est intéressant...",
        "Eh bien, il s'avère que la société m'attribue un statut particulier.",
        "Je ne sais pas vraiment quoi en penser.",
        "§red:Level 6§, c'est cela",
        "Je me pose beaucoup de questions en ce moment, il s'avère que paradoxalement je peux y répondre tout de même :",
        "Cette société porte beaucoup trop d'importance au §i:pouvoir§ à mon goût",
        "§i:pouvoir§ de toutes sortes: ",
        "politique..",
        "économique..",
        "et parmi tous ces pouvoirs détenus par les plus grands de cette planète.",
        "il y a le pouvoir que §i:je§ détiens",
        "§30:Ha Ha Ha!!§",
        "Quelle ironie tout de même!",
        "Qu'une seule personne puisse tirer son épingle dans ce jeu de géants!",
        "C'est ridicule... et terrifiant",
        "Tout en étant une bénédiction.",
        "Nous sommes toujours le 27 mai 2073.",
        "C'est un jour particulier pour moi, le 27 mai",
        "Non, ce n'est pas le jour de mon anniversaire..",
        "Ni la date d'un fait historique majeur,",
        "C'est tout simplement...",
        "Le jour où je suis devenu,",
        "Ce que je suis.",
    ])
}

async function reflexionFake() {
    await makeDialogue([
        "Je n'ai jamais vraiment pensé sérieusement à ce qu'est l'univers.",
        "C'est un vaste sujet, à coup sûr.",
        "Il s'avère cependant que la réponse §i:semble§ simple.",
        "De mon point de vue, l'univers n'est qu'une grosse chaîne d'informations.",
        "Cette chaîne encode en tout point de notre espace des valeurs, que nous appelons température, masse ou encore énergie.",
        "C'est... le concept de champ.",
        "La question qui se pose alors est §i:comment§ cette chaine est-elle organisée",
        "Est-ce une matrice en 3D? une grosse chaine de 0 et de 1? Ou quelque chose d'autre?",
        "Cette question est sans réponse et le deumerera certainement.",
        "Cependant, moi, je crois que l'univers tel qu'il nous ait présenté",
        "§EST§",
        "la chaine d'information à proprement parler.",
        "et c'est justement cette compréhension, de l'univers qui nous permet d'agir dessus d'une manière tout à fait remarquable."
    ])
}





async function exposition() {
    await makeDialogue([
        "Je me souviens d'un monde.",
        "Si proche mais si différent.",
        "Le monde d'§i:avant§.",
        "Une page déjà oubliée du grand livre de l'Hitoire.",
        "Je m'en souviens, oui.",
        "Pas parce qu'il me manque, non.",
        "Il est simplement resté gravé dans ma mémoire comme un produit secondaire.",
        "Le monde d'ajourd'hui est radicalement différent.",
        "Avant je voyais des objets.",
        "Maintenant je vois de l'information.",
        "Bon, pour être honnête, je vois tout de même l'objet..",
        "Mais mes yeux ont cessé d'être un organe important à partir du moment ou je peux voir l'§i:information§ brute de l'objet.",
        "C'est pour ça qu'en ce moment ils sont fermés d'ailleurs..",
        'Je "vois" tout de même la tasse posée sur la table devant moi.',
        "L'§information§.",
        "L'univers n'est composé que de ça. Exclusivement",
        "L'information attribue en tout point de l'espace des valeurs telles que la masse, la température, la charge électrique...",
        "Donc, ce qu'on apelle l'univers n'est en réalité qu'une grosse information",
        `Donc cette tasse posée devant moi n'est pas §i:"une tasse"§`,
        "En tout cas pas pour moi.",
        "C'est un ensemble d'informations, de contraintes : liaisons atomiques, tensions structurelles, échange thermique avec la table..",
        "Par extention..",
        "Je sais exactement §i:où§ je dois modifier sa pression interne afin qu'elle se fissure en dépensant le moins d'énergie",
        "Je §pourrais§ le faire",
        'La nuance réside dans §"pouvoir"§',
        "Et je ne le fais pas.",
        "Ca ne servirait à rien de toute façon.",
        "On m'apelle §red:Anastasie§",
        "J'aime ce nom.",
        "Sauf que, ce n'est plus un nom.",
        "C'est une §i:dénomination§",
        "On ne me l'a jamais dit.",
        "Mais je le sais tout de même.",
        "C'est l'impression que l'on me donne.",
        "Il y a deux catégories de personnes.",
        "Je ne suis pas du type à mettre les gens dans des cases.",
        "Mais ça..",
        "C'est vrai.",
        "Il y a celles qui subissent la réalité.",
        "Et récemment, celles qui peuvent la §modifier.§",
        "On nous appelle les §i:boostés§",
        "Le terme est presque ridicule je dois l'admettre.",
        "Je me demande qui a pensé à ça et qui l'a approuvé.",
        "Mais, ma foi, le terme est resté.",
        "Avant c'était expérimental, instable, dangereux même.",
        "Miantenant, c'est.. toujours expérimental, instable et dangereux.",
        "Mais c'est.. organisé.",
        "Encadré.",
        "Institutionnalisé.",
        "C'est ça, c'est le bon terme.",
        "C'est peut être la première fois que j'utilise ce mot correctement.",
        "Il y a des programmes de §i:boosting§ à grande échelle",
        "Tout ça n'existait pas il y a 2 ans.",
        "2 ans et 35 jours précisément.",
        "Mais tout donne l'impression que le monde n'existait pas avant ce moment.",
        "En tout cas, il est tellement différent qu'il en devient inconcevable",
        "Tout comme le monde actuel était inconcevable 2 ans et 35 jours auparavant.",
        "Les programmes de §i:boosting§ sont des machines sociales autant que scientifiques, poltiques même parfois.",
        "Les laboratoires, et même certains gouvernements sélectionnent.",
        "Profil psychologique.. stabilité émotionelle.. capacité cognitive.. que sais-je!",
        `Dans le but d'avoir une liste de §i:candidats sûrs§  qui peuvent passer le programme de boosting.`,
        "Ils ont tort 57% du temps.",
        "§30:Ha Ha Ha!§",
        "C'est un rire nerveux.",
        "57% est le taux officiel, oui",
        "La moitié des sujets perdent leur stabilité mentale pendant ou après le processus.",
        "Ils deviennent incohérents",
        "Des fois même dangereux.",
        "Quand je regade ça avec un peu de recul,",
        "C'est presque amusant.",
        "Les 43% restants survivent.",
        "Parmi eux, on classe,",
        "Il fallait s'en douter",
        "L'humanité a toujours classé",
        "Même l'inclassable.",
        "§ETM§",
        "L'acronyme d'Energy Transfer Mesurement",
        "Selon la société, une unité.",
        "Selon moi, une tentative de quantifier quelque chose qui, fondamentalement, ne peut pas être réduit à un nombre.",
        `Mais je dois admettre qu'il donne une bonne idée de la "puissance" d'un boosté.`,
        "Basicalement, sa capacité à altérer la réalité",
        `"Altérer".. je voulais dire §i:"modifier"§ la nuance est importante pour moi.`,
        "Le test pour mesurer l'ETM d'un boosté est long et laborieux et en général trop peu précis selon moi",
        "Il est cependant obligatoire dans la plupart des pays pour les boostés.",
        "On trouve assez facilement des sources donnant des chiffres.",
        "Notamment la répartition de l'ETM chez les boostés",
        "J'aurais parié que le graphique serait une gaussienne.",
        "Il s'avère que c'est une sorte d'exponentielle décroissante.. comment dire..?",
        "Il va du plus petit ETM connu (0) au plus grand (6.2).",
        `dans l'intervalle [0, 1[ on trouve les §Level 0§, il s'agit de 20% des boosés, et ceux-ci semblent.. ne pas être boostés`,
        `dans l'invervalle [1, 2[ on trouve les §Level 1§, il s'agit de la majorité : 50% des boostés. Ceux-ci sont capables de petites altérations..`,
        "ajuster une trajectoire, modifier une impulsion devient possible.",
        `Les §Level 2§ sont plus rares, il s'agit de 20% des boostés, des manipulations plus précises, des applications utiles...`,
        `Les §Level 3§ représentent 8% des boostés, à partir de ce niveau, quelqu'un qui comprend bien les forces devrait pouvoir soulever une voiture.`,
        `Les §Level 4§ représentent 2% des boostés, en réalité 1.99815937% et des miettes. C'est le seuil pour faire partie de §"l'élite"§`,
        `Le §Level 5§ est un niveau atteint par 17 personnes dans le monde entier. Ce level a été considéré comme le maximum théorique.`,
        "Et moi il y a.. §i:moi§",
        "§red:Level 6§",
        "Oui, certainement, ils n'avaient pas prévu ça",
        "Il faut dire que.. moi non plus.",
        "J'étais née avec quelque chose..",
        "Un.. potentiel brut",
        "Il arrive que certaines personnes naissent déjà avec un pouvoir sur la réalité",
        "Cela concerne environ une personne sur deux milliards.",
        "Et l'ETM dépasse rarement 2.",
        `C'est, historiquement ce qu'on appellait les "magiciens"`,
        "Un mot ancien pour désigner quelque chose d'incompréhensible",
        "C'est rigolo.",
        "Il s'avère que je fais partie de ces personnes.",
        "Puis un laboratoire à eu une idée:",
        `Et si on boostait quelqu'un qui a déjà naturellement manifesté un pouvoir?`,
        "Et.. c'est tombé sur moi quand j'avais 17 ans.",
        "Indirectement.",
        `Mes trois autres 'magiciens' connus sont tout simplement devenus fous`,
        "Mais ça ils ne me l'ont pas dit avant de m'avoir boosté",
        "Si j'avais su, je ne l'aurais pas fait.",
        "§30:Hah§",
        "§30:Hah§",
        "§30:Hah§",
        "Bref.",
        "Je ne me souviens pas du programme de boosting que j'ai subi",
        "Je sais qu'ils font des trucs pour stimuler le cerveau de différentes manières.",
        "En tout cas..",
        "Le cerveau a tendance à oublier les moments traumatisants.",
        "J'en déduis que ça doit en faire partie.",
        'En tout cas il y eut un §i:avant§ et un §i:après§.',
        "Tout était devenu lisible et clair.",
        "Depuis, je ne peux plus ne §i:pas§ voir.",
        "Ce n'est pas faute d'essayer, depuis tout à l'heure je ferme les yeux..",
        "Mon cerveau est constament assailli d'informations.",
        "La société s'est adaptée, comme elle le fait toujours.",
        "Il existe maintenant des universités pour nous, des institutions, des associations.",
        "On y apprend à utiliser ces pouvoirs.",
        "Enfin.. §i:eux§ ils aprennent.",
        "Moi je les observe en train d'apprendre.",
        "Parce que pour eux, ce n'est pas inné.",
        "Il doivent calculer tandis que moi je fais ça instinctivement.",
        "Contruire mentalement les transformations avant de les appliquer à la réalité.",
        "Il y a aussi une contrainte.",
        "L'§énergie§",
        "Toute action sur la réalité à toujours eu un coût en énergie, peu importe sa nature.",
        "Les boostés n'échappent pas à la règle.",
        "Si un boosté veut soulever un objet, en plus de devoir comprendre exactement les informations qu'il doit modifier et fair les calculs pour savoir comment,",
        "Il doit fournir l'équivalent énergituque de cette action",
        "Comme si il le faisait physiquement.",
        "C'est une épreuve de calcul physique.",
        "C'est amusant.",
        `Alors ils ont inventé les "couronnes"`,
        "Elles ressemblent à une sorte de diadème",
        "Le nom est bien choisi je trouve car elles permettent à nous, boostés de réellement §i:régner§ sur la réalité techniquement",
        "Je m'explique.",
        "Les couronnes sont des réservoirs d'énergie.",
        "Des batteries externes au corps.",
        "Le cerveau peut puiser dedans.",
        "Elles permettent de dépasser les limites biologiques.",
        "D'atteindre des niveaux d'action impossible humainement parlant autrement.",
        "Oui, elles ont réellement changé l'équilibre de monde.",
        "Un §Level 4§ peut déplacer des masses absudres avec une compréhension suffisante des vecteurs vitesse.",
        "Un §Level 5§ devient.. carrément stratégique.",
        "Sans elles, les boostés ne pourraient pas faire grand chose de plus qu'un humain normal (en se déplaçant) sans subir une nécrose cérébrale",
        "Je pose ma couronne sur ma tête.",
        "Avec elle...",
        "Je peux faire presque tout ce que je veux.",
        "C'est terrifiant même pour moi.",
        "Mais c'est une sensation de liberté infinie.",
        "Ca permet également à mon cerveau de traiter les informations qui m'assaillent constamment.",
        "Sans elle mon esprit crierait au supplice après quelques minutes.",
        "Je marche dans la rue.",
        "Certains ont des couronnes",
        "Certains ne sont pas des boostés.",
        "Oui..",
        "Les deux mondes coexistent.",
        "Je trouve que c'est une richesse.",
        "Mais le rapport est trop désiquilibré pour rester ainsi.",
        "Ils dépendent de nous",
        "Ils nous craignent parfois même.",
        "Des mouvements anti-boost sont apparus presque en même temps que les premiers programmes scientifiques.",
        "Ils parlent d'injustice.",
        "Ils n'ont techniquement.. pas tort.",
        "C'est peut-être le plus terrifiant.",
        "Le monde est devenu assymétrique.",
        "Encore une fois, l'humanité à réussi à se scinder pour mieux se haïr.",
        "Mais entre ces deux mondes, il y a des ponts.",
        "Il y a même beaucoup de ponts.",
        "La plupart des gens sont prêts à coexister.",
        "J'ai toujours su qu'une société désiquilibrée marchait quand même.",
        `Après tout, dans le monde, §i:"d'avant"§ il y avait bien des désiquilibres.`,
        "Ils étaient juste de différente nature.",
        "Ca n'a pas empêché la société de fonctionner.",
        "Il est midi douze selon ma montre.",
        "Voir le nombre douze apparaître deux fois m'arrache un léger sourire.",
        "Il est peut-être temps d'aller chercher un sandwitch."
    ])
    loadState("1")
}

async function premierCombat() {
    await makeDialogue([
        "WIP"
    ])
}


const states = {
    "-1": testScene,
    "-2": expositionFake,
    "-3": reflexionFake,
    "0": exposition,
    "1": premierCombat
};

async function loadState(state) {
    if (states[state]) {
        await states[state]();
    } else {
        await makeDialogue(["State inconnu. Si vous voyez ce message, soit c'est de votre faute soit c'est de la mienne. Dans le premier cas arrêtez de vouloir faire bugger mon jeu et dans le second cas je suis désolé et je n'ai aucune idée de ce qui a pu se passer :')"]);
    }
}