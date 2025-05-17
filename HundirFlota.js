import { Tauler } from "./model/Tauler.js";
import { Vaixell } from "./model/Vaixell.js";
import { IA } from "./model/IA.js";

//Declaració variables globals
let vaixellUsu = "";
let direccioUsu = 0; //per defecte poso que la direcció sigui horitzontal (right)
let casellaUsu;

let torn = true;

let taulerIA; let taulerJugador;
let AI;

const vaixellsJSON = `[
{ "name": "Portaaviones", "size": 5 },
   { "name": "Acorazado", "size": 4 },
   { "name": "Crucero", "size": 3 },
   { "name": "Submarino", "size": 3 },
   { "name": "Destructor", "size": 2 }
]`;

let vaixellsJoc = cargarJson(vaixellsJSON);

//FUNCIONS

/*PART 1: GENERACIÓ TAULERS*/
/*Funció que crea divs per cada casella d'un tauler (matriu).*/
function crearTauler(tauler, id, interactuable = false) {
    let divTauler = document.getElementById(id);
    divTauler.style.gridTemplateColumns = `repeat(${tauler.tamany[0]}, 50px)`;

    for (let f = 0; f < tauler.tamany[0]; f++) { //recorro per files

        for (let c = 0; c < tauler.tamany[1]; c++) {  //recorro per columnes
            //creo una casella i per defecte li poso la classe aigua
            let columna = document.createElement("div");
            columna.setAttribute("id", tauler.jugador + `-${f}-${c}`);
            columna.classList.add("casella");

            //columna.innerHTML = `[${f}, ${c}]`


            if (interactuable) {
                //listener per col·locar els vaixells del jugador
                columna.addEventListener("click", gestionarClickCasella);
                columna.classList.add("aigua");
            }

            divTauler.appendChild(columna);
        }

    }
}

/*Funció que actualitza les caselles del tauler (canvia les classes).*/
function actualitzarTauler(tauler, IA = false) {
    for (let f = 0; f < tauler.tamany[0]; f++) {
        for (let c = 0; c < tauler.tamany[1]; c++) {
            let id = tauler.jugador + `-${f}-${c}`;

            if (!IA) {
                actualitzaCasella(id, tauler);
            } else {
                actualitzaCasella(id, tauler, true);
            }

        }
    }

}
/*

TAULER IA: només es mostren caselles destapades
TAULER JUGADOR: es mostra TOT. Les caselles tocades amb una màscara.

*/

/*Funció que consulta l'objecte tauler i actualitza la casella amb l'id passat per paràmetre.*/
function actualitzaCasella(id, tauler, IA = false) {

    let casella = document.getElementById(id);
    let coord = extreureCoordenades(id);
    //casella.textContent = `[${coord.f},${coord.c}]`;

    //mostro les caselles només si és el tauler del jugador o si la casella ha estat jugada
    if (tauler.caselles[coord.f][coord.c].jugada || !IA) {
        let aigua = tauler.caselles[coord.f][coord.c].aigua;
        if (aigua) {
            casella.setAttribute("class", "casella aigua");
        } else {

            //trec la classe aigua, li afegeixo la classe vaixell general i la concreta
            casella.classList.remove("aigua");
            casella.classList.add("vaixell");

            let nom = tauler.caselles[coord.f][coord.c].nomVaixell;
            casella.classList.add(nom[0]);


            let tocat = tauler.caselles[coord.f][coord.c].tocat;

            if (tocat) {
                casella.classList.add("tocat");
            }

        }

        if (!IA && tauler.caselles[coord.f][coord.c].jugada) {
            let mascara = document.createElement("div");
            mascara.setAttribute("class", "mascara");

            casella.appendChild(mascara);
        }

    }

}

/*Funció que fa un reset del tauler (a nivell visual).*/
function resetTauler(tauler) {

    tauler.reiniciar();
    tauler.vaixells = [];

    for (let f = 0; f < tauler.tamany[0]; f++) {
        for (let c = 0; c < tauler.tamany[1]; c++) {
            let casella = document.getElementById(tauler.jugador + `-${f}-${c}`);

            casella.setAttribute("class", "casella aigua");
        }
    }
}


//MAIN
function generarBotons() {
    let contenidorV = document.getElementById("botonsVaixells");

    /* Botons dels vaixells */
    vaixellsJoc.forEach(vaixell => {
        let divVaixell = crearElement("div", "", "", ["vaixell_container"], contenidorV);
        crearElement("div", "", vaixell.name + "_icona", [vaixell.name[0], "vaixell_icona"], divVaixell);
        let boto = crearElement("button", vaixell.name, vaixell.name + "_btn", ["vaixellsBtn"], divVaixell);


        //listener per detectar quin vaixell col·locar
        boto.addEventListener("click", gestionarClickVaixell);

    });

    /* Botons de direccions */
    let botoHor = document.getElementById("H_btn");
    let botoVer = document.getElementById("V_btn");

    botoHor.addEventListener("click", gestionarClickDireccio);
    botoVer.addEventListener("click", gestionarClickDireccio);


    /* Botó per reiniciar */
    let botoReset = document.getElementById("reset_btn");
    botoReset.addEventListener("click", gestionarReset);

}

function init() {

    //Carrego dades dels vaixells
    let vaixellsJoc = cargarJson(vaixellsJSON);

    //TAULER 01: IA
    taulerIA = new Tauler("IA", [10, 10]);

    //genero un vaixell de cada tipus
    for (let dades of vaixellsJoc) {
        let id = dades.name[0]; //l'id és la primera lletra
        let vaixell = new Vaixell(id, dades.name, dades.size);
        taulerIA.afegirVaixell(vaixell);
    }

    taulerIA.colocarVaixellsAleatoris(); //crido mètode per posicionar els vaixells

    //mostro el tauler (part visual)
    crearTauler(taulerIA, "tauler1", false);

    //TAULER 02: jugador
    //creo el tauler i botons
    taulerJugador = new Tauler("j1", [10, 10]);
    AI = new IA(taulerIA.tamany[0]);

    //mostro el tauler
    crearTauler(taulerJugador, "tauler2", true);
    actualitzarTauler(taulerJugador);
    generarBotons();


} init();



/*PART 2: COL·LOCACIÓ*/
//EVENT HANDLERS

/*Funció que controla la col·locació de vaixells en les caselles del taulell. 
    - És cridada quan fas 'click' a una casella del jugador durant la col·locació de vaixells inicials
*/
function gestionarClickCasella() {

    if (vaixellUsu != "") {
        //extrec les coordenades -> x0y4 (id de la casella)
        let idCasella = this.id; //this és element que té el listener
        let coord = extreureCoordenades(idCasella);
        let f = parseInt(coord.f); let c = parseInt(coord.c);

        //Creo el vaixell i el provo de col·locar
        let vaixell = new Vaixell(vaixellUsu.name[0], vaixellUsu.name, vaixellUsu.size);
        let colocat = taulerJugador.colocarVaixell(vaixell, f, c, direccioUsu); //em retorna true o false

        //comprovo si el vaixell s'ha col·locat correctament
        if (!colocat) {
            alert("El vaixell no es pot col·locar aquí. Recorda que els vaixells no es poden tocar!");
        } else {
            //desactivo el botó i poso en blanc el vaixell seleccionat
            document.getElementById(vaixellUsu.name + "_btn").disabled = true;
            vaixellUsu = "";

            //afegeixo el vaixell a la llista del taulell del jugador
            taulerJugador.afegirVaixell(vaixell);//!!
            actualitzarTauler(taulerJugador);

            //drag&drop
            eliminarRendVaixell();

            //si col·loco tots els vaixells -> dono opció de començar a jugar
            if (taulerJugador.vaixells.length == vaixellsJoc.length) {
                let contenidorBotons = document.getElementById("botonsDireccions");
                let jugar_btn = crearElement("button", "JUGAR", "jugar_btn", [], contenidorBotons);
                jugar_btn.addEventListener("click", gestionarClickJugar);
            }

        }

    } else {
        alert("Selecciona un vaixell!");
    }
}

/*Funció que agafa l'id del vaixell seleccionat i el guarda a la variable vaixellUsu;
 - És cridada quan fas 'click' als botons de vaixells durant el posicionament d'aquests.
*/
function gestionarClickVaixell(event) {
    //trobo el vaixell assignat al botó mirant si l'id és igual
    vaixellUsu = vaixellsJoc.find((element) => element.name == event.target.id.replace("_btn", ""));

    //drag & drop
    crearRendVaixell(event);
}


/*Funció que agafa l'id del botó i guarda la direcció corresponent.
 - És cridada quan fas 'click' als botons H i D.
*/
function gestionarClickDireccio(event) {
    let rendVaixell = document.getElementById("rendVaixell");

    //d'esquerra a dreta i de dalt a baix
    if (rendVaixell) {
        if (event.target.id[0] == "H") {
            rendVaixell.style.flexDirection = "row";
            direccioUsu = 0;
        } else {
            rendVaixell.style.flexDirection = "column";
            direccioUsu = 1;
        }
    }

    event.stopPropagation();
}

/*Funció que reinicia la col·locació dels vaixells
 - És cridada quan fas 'click' al botó de RESET
*/
function gestionarReset() {
    //Reinicio tauler
    resetTauler(taulerJugador);

    //Activo tots els botons
    let contenidorV = document.getElementById("botonsVaixells");
    let botons = contenidorV.getElementsByTagName("button");
    for (let boto of botons) {
        boto.disabled = false;
    }

    resetTauler(taulerJugador);
    let botoJugar = document.getElementById("jugar_btn");
    if (botoJugar) {
        botoJugar.remove();
    }

}

/*DRAG & DROP*/

/*Funció que genera una previsualització del vaixell premut.
    - És cridada quan has fet 'click' a un botó de vaixell
*/
function crearRendVaixell(event) {
    let contenidor = document.getElementById("j2");

    let rendVaixell;
    if (document.getElementById("rendVaixell")) { //si existeix la plantilla del vaixell, la borro
        rendVaixell = document.getElementById("rendVaixell");
        contenidor.removeChild(rendVaixell);
    }

    //creo el div on anirà la plantilla/previsualització
    rendVaixell = crearElement("div", "", "rendVaixell", ["rendVaixell"], contenidor);

    //canvio display-flex segons la direccio del vaixell 
    direccioUsu == 0 ? rendVaixell.style.flexDirection = "row" : rendVaixell.style.flexDirection = "column"; //(condicional ternari)

    //creo la plantilla del vaixell
    for (let i = 0; i < vaixellUsu.size; i++) {
        crearElement("div", "", "", ["casella"], rendVaixell);
    }

    //col·loco la plantilla del vaixell en la posició del ratolí
    rendVaixell.style.left = event.clientX + "px";
    rendVaixell.style.top = event.clientY + "px";

    document.addEventListener('mousemove', onMoureRendVaixell); //li afegeixo listener
}

/*Funció que mou el rend del vaixell segons la posció del ratolí a la pantalla
    - És cridada quan has fet 'click' a un botó de vaixell i mous el ratolí
*/
function onMoureRendVaixell(event) {
    let rendVaixell = document.getElementById("rendVaixell");

    rendVaixell.style.top = event.clientY + 10 + "px";
    rendVaixell.style.left = event.clientX - 10 + "px";
}

/*Funció que elimina el rend/previsualització del vaixell
    - És cridada quan col·loques correctament el vaixell al taulell
*/
function eliminarRendVaixell() {
    let container = document.getElementById("j2");
    let rendVaixell = document.getElementById("rendVaixell");
    container.removeChild(rendVaixell);

    document.removeEventListener('mousemove', onMoureRendVaixell); //trec listener
}

/*Funció que amaga tots els botons de col·locació de vaixells i inicia el joc (atac)
    - És cridada quan fas 'click' al botó de JUGAR
*/
function gestionarClickJugar() {

    //elimino listeners
    document.getElementById("reset_btn").removeEventListener("click", gestionarReset);
    document.getElementById("H_btn").removeEventListener("click", gestionarClickDireccio);
    document.getElementById("V_btn").removeEventListener("click", gestionarClickDireccio);


    //amago els botons
    document.querySelectorAll("#botonsDireccions button").forEach((boto) => boto.style.display = "none");

    document.getElementById("textVaixells").textContent = "Estat dels teus vaixells: ";

    //elimino events (dels vaixells i caselles)
    document.querySelectorAll("#botonsVaixells button").forEach((boto) => {
        boto.removeEventListener("click", gestionarClickVaixell);
        boto.style.all = "unset";
    });
    document.querySelectorAll("#j2 .casella").forEach((casella) => casella.removeEventListener("click", gestionarClickCasella));

    //activo els de joc
    activarEventsAtac();

}


/*PART 3: ATAC*/
/* Funció activa els events del joc referents a l'atac*/
function activarEventsAtac() {

    //Afegeixo listeners a les caselles del tauler IA
    document.querySelectorAll("#j1 .casella").forEach((casella) => casella.addEventListener('click', gestionarClickCasellaIA));

    //Afegeixo listener al botó d'atac
    document.getElementById("atacar_btn").addEventListener("click", gestionarAtac);

}

/* Funció que guarda quina és l'id de la casella seleccionada i la destaca.
    - És cridada quan fas 'click' a una casella del tauler de la IA
*/
function gestionarClickCasellaIA(event) {

    //trec el outline de la casella anterior
    let casellaAnterior = document.getElementById(casellaUsu);
    if (casellaAnterior) {
        casellaAnterior.classList.remove("seleccionat");
    }

    //guardo l'id de la casella seleccionada
    casellaUsu = this.id;

    //li canvio l'estil per marcar que està selecionada
    let casellaSeleccionada = document.getElementById(casellaUsu);
    casellaSeleccionada.classList.add("seleccionat");
}

/* Funció que controla els atacs de l'USUARI.
    - És cridada quan fas 'click' al botó d'ATACAR
*/
function gestionarAtac() {

    if (torn) {

        //comprovo que usuari hagi seleccionat una casella
        if (casellaUsu) {
            //elimino event
            let casella = document.getElementById(casellaUsu);
            casella.removeEventListener("click", gestionarClickCasellaIA);

            //extrec les coordenades a partir del id del div
            let coord = extreureCoordenades(casellaUsu);

            //ataco
            let estatAtac = taulerIA.atacar(coord.f, coord.c);

            //mostro casella (visual)
            actualitzaCasella(casellaUsu, taulerIA, true);
            casellaUsu = "";

            //si usuari no ha tocat, canvi de torn, li toca a la màquina
            if (estatAtac == false) {
                torn = false;
                atacarIA();
            } else if (estatAtac != true) {
                alert("Tocat i enfonsat!");
            }

            if (taulerIA.derrota()) {
                finalitzarPartida("Usuari");
            }

        } else {
            alert("Selecciona una casella per atacar!");
        }


    } else {
        alert("No és el teu torn, espera.");
    }

}

/*IA*/
/* Funció que genera l'atac de la IA cap al tauler del jugador*/
function atacarIA() {
    let coord = AI.pensarCoordenades();

    //ataco
    let estatAtac = taulerJugador.atacar(coord.f, coord.c);

    //si he tocat (direcció correcta)
    if (estatAtac != false) {

        //si és el primer cop que toco, reinicio les direccions i em guardo la casella
        if (AI.memoria.length <= 0) {
            AI.generarMemoriaIA(coord.f, coord.c);
        }

        AI.actualitzarMemoriaIA(coord.f, coord.c);

        //si he enfonsat el vaixell, borro la memòria i reinicio les direccions
        if (estatAtac != true) {
            AI.esborrarMemoriaIA();
        }

        //actualitzo la part visual
        actualitzarEnfonsat(estatAtac);

        if (!taulerJugador.derrota()) {
            setTimeout(atacarIA, 1000); //setTimeout per simular que la IA pensa
        } else {
            finalitzarPartida("Màquina");
        }


    } else {
        //si he tocat aigua, però encara no he enfonsat, canvio de direcció
        if (AI.memoria.length > 0) {
            AI.canviDireccioIA();
        }
        torn = true;
    }

    console.log("ATACO");

    //canvio estat de la casella i actualitzo la part visual
    let idCasella = generarIdCasella(taulerJugador, coord.f, coord.c);
    actualitzaCasella(idCasella, taulerJugador);
}


/*Funció que marca visaulment que un vaixell del tauler del jugardor ha estat enfonsat*/
function actualitzarEnfonsat(vaixell) {
    if (vaixell.enfonsat == true) {
        let idIcona = vaixell.nom + "_icona";

        let iconaVaixell = document.getElementById(idIcona);

        iconaVaixell.textContent = "💥";
    }
}

/*Funció que és cridada quan algú guanya la partida. Crida a una altra funció per eliminar els events.*/
function finalitzarPartida(guanyador = "") {
    alert("S'ha acabat la partida. Ha guanyat: " + guanyador);

    let resultat = document.createElement("p");
    resultat.textContent = "Ha guanyat: " + guanyador;
    document.body.insertBefore(resultat, document.body.firstChild);

    eliminarEventsFinals();
}

/*Funció que elimina els listeners dels events de la partida en la fase d'atac*/
function eliminarEventsFinals() {
    let botoAtacar = document.getElementById("atacar_btn");
    botoAtacar.removeEventListener("click", atacarHandler);

    let caselles = document.querySelectorAll(".casella");
    for (let casella of caselles) {
        casella.removeEventListener("click", seleccionaCasella);
    }
}



//UTILS
function extreureCoordenades(id) {
    let elements = id.split("-"); //j2-4-9   (nom-x-y)

    return { "f": elements[1], "c": elements[2] };
}

function generarIdCasella(tauler, x, y) {
    return tauler.jugador + "-" + x + "-" + y;

}


/*Funció que genera números aleatoris.*/
function generarNumRandom(max) {
    const numRand = Math.floor(Math.random() * max);

    return numRand
}

/*Funció que genera els vaixells inicials del joc. Agafa les dades d'un JSON que rep com a paràmetre.*/
function cargarJson(json) {
    let dadesVaixells = JSON.parse(json);

    return dadesVaixells
}


function crearElement(tipus, contingut, id, classes, pare) {
    let element = document.createElement(tipus);

    if (id != "")
        element.id = id;

    if (contingut != "")
        element.textContent = contingut;

    if (classes.length != 0)
        classes.forEach((classe) => element.classList.add(classe));


    pare.appendChild(element);
    return element;
}



/***
 * CONEXIÓN A API
 */

async function guardarPartida(nomJugador, taulerJugador, taulerIA, torn) {
    //TODO: què passa si no introdueix un nom???
    const partida = {
        "jugador": nomJugador,
        "taulerJugador": taulerJugador.serialitzar(),
        "taulerIA": taulerIA.serialitzar(),
        "torn": String(torn)
    };

    try {
        const response = await fetch("http://localhost:3000/partidas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(partida)
        });

        if (!response.ok) throw new Error("Error al guardar la partida");

        const data = await response.json();
        console.log("Partida guardada con éxito:", data);
        return data.id; // ID de la partida
    } catch (err) {
        console.error("Error:", err);
    }
}

async function cargarPartida(idPartida) {
    try {
        const response = await fetch(`http://localhost:3000/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No se encontró la partida");

        const data = await response.json();
        console.log("Partida cargada:", data);
        return data;
    } catch (err) {
        console.error("Error:", err);
    }
}

async function cargarPartides() {
    try {
        const response = await fetch(`http://localhost:3000/partidas`);
        if (!response.ok) throw new Error("No s'han trobat les partides");

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error:", err);
    }
}

document.getElementById("btnGuardar").addEventListener("click", () => {
    if (taulerJugador.vaixells.length == taulerIA.vaixells.length) {
        let nomJugador = prompt("Introduce tu nombre:");

        if (nomJugador) {
            guardarPartida(nomJugador, taulerJugador, taulerIA, torn);
        }

    } else {
        alert("Has de col·locar tots els vaixells per poder guardar la partida!")
    }

});

document.getElementById("btnCargar").addEventListener("click", async () => {
    const id = prompt("Introduce el ID de la partida:");
    if (id) {
        const partida = await cargarPartida(id);

        // Llamamos a la función que recupera los tableros 
        recuperaTaulersApi(partida);

        gestionarClickJugar();
        activarEventsAtac();
    }

});

document.getElementById("btnRegistre").addEventListener("click", async () => {
    console.log(window.screen.width);
    let left = Number(window.screen.width) - 400 - 50; //200 és la width
    let finestraRegistre = window.open("RegistrePartides.html", "Partides", "width=400, height=500, top=100, left=" + left);


    let partides = await cargarPartides();
    let container = finestraRegistre.document.getElementById("info_partides");

    let taulaHtml = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Jugador</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let partida of partides) {
        taulaHtml += `
            <tr>
                <td class='partida'>${partida.id}</td>
                <td class='partida'>${partida.jugador}</td>
            </tr>`;
    }

    taulaHtml += `
            </tbody>
        </table>
    `;

    container.innerHTML = taulaHtml;

});


async function recuperarRegistres(partida) {
    try {
        const response = await fetch(`http://localhost:3000/partidas/${idPartida}`);
        if (!response.ok) throw new Error("No se encontró la partida");

        const data = await response.json();
        console.log("Partida cargada:", data);
        return data;
    } catch (err) {
        console.error("Error:", err);
    }

}

async function recuperaTaulersApi(partida) {
    torn = partida.torn;

    // creo nou tauler Jugador i carrego les dades
    taulerJugador = new Tauler();
    taulerJugador.carregarDades(partida.taulerJugador); //TODO: programar carregar tauler

    // creo nou tauler IA i carrego les dades
    taulerIA = new Tauler();
    taulerIA.carregarDades(partida.taulerIA);


    // creo, carrego i afegeixo els vaixells del jugador
    let dadesVaixellsJugador = JSON.parse(JSON.parse(partida.taulerJugador).vaixells);
    let dadesVaixellsIA = JSON.parse(JSON.parse(partida.taulerIA).vaixells);

    recuperarVaixells(dadesVaixellsJugador, taulerJugador);
    recuperarVaixells(dadesVaixellsIA, taulerIA);

    // actualitzo taulers
    actualitzarTauler(taulerIA, true);
    actualitzarTauler(taulerJugador);

}

function recuperarVaixells(dadesJSON, tauler) {

    dadesJSON.forEach((dadesVaixell) => {
        let vaixell = new Vaixell();
        vaixell.carregarDades(dadesVaixell);

        tauler.afegirVaixell(vaixell);
    });
}