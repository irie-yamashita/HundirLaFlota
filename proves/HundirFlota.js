import { Tauler } from "./Tauler.js";
import { Vaixell } from "./Vaixell.js";

//Declaració variables globals
let vaixellUsu = "";
let direccioUsu = 0; //per defecte poso que la direcció sigui horitzontal (right)
let casellaUsu;

let torn = true;

let taulerIA;
let taulerJugador;

let IA = {
    "direccions": ['U', 'D', 'L', 'R'],
    "memoria": [],
    "casellaInicial": []
}


const vaixellsJSON = `[
{ "name": "Portaaviones", "size": 5 },
   { "name": "Acorazado", "size": 4 },
   { "name": "Crucero", "size": 3 },
   { "name": "Submarino", "size": 3 },
   { "name": "Destructor", "size": 2 }
]`;

let vaixellsJoc = cargarJson(vaixellsJSON);



//FUNCIONS

/*PART 1: GENERACIÓ TAULELLS*/
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
function actualitzarTauler(tauler) {
    for (let f = 0; f < tauler.tamany[0]; f++) {
        for (let c = 0; c < tauler.tamany[1]; c++) {
            let id = tauler.jugador + `-${f}-${c}`;
            actualitzaCasella(id, tauler);
        }
    }

}

/*Funció que consulta l'objecte tauler i actualitza la casella amb l'id passat per paràmetre.*/
function actualitzaCasella(id, tauler) {

    let casella = document.getElementById(id);
    let coord = extreureCoordenades(id);

    let aigua = tauler.caselles[coord.f][coord.c].aigua;
    let jugada = tauler.caselles[coord.f][coord.c].jugada;
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

    //si la casella ha estat jugada per la IA, faig canvi visual
    if (jugada) {
        let mascara = document.createElement("div");
        mascara.setAttribute("class", "mascara");

        casella.appendChild(mascara);
    }
}



/*Funció que fa un reset del tauler (a nivell visual).*/
function resetTauler(tauler) {

    tauler.reiniciar();

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
        let boto = crearElement("button", vaixell.name, vaixell.name+"_btn", ["vaixellsBtn"], divVaixell);
        let icona = crearElement("div", "", vaixell.name+"_icona", [vaixell.name[0], "vaixell_icona"], divVaixell);

        //listener per detectar quin vaixell col·locar
        boto.addEventListener("click", function (event) {
            //trobo el vaixell assignat al botó mirant si l'id és igual
            vaixellUsu = vaixellsJoc.find((element) => element.name == event.target.id.replace("_btn", ""));

            //drag & drop
            crearRendVaixell(event);
        });

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

    //TAULER 01: automàtic
    taulerIA = new Tauler("j1", [10, 10]);

    //genero un vaixell de cada tipus
    for (let dades of vaixellsJoc) {
        let id = dades.name[0]; //l'id és la primera lletra
        let vaixell = new Vaixell(id, dades.name, dades.size);
        taulerIA.afegirVaixell(vaixell);
    }

    //crido mètode per posicionar els vaixells
    taulerIA.colocarVaixellsAleatoris();

    //mostro el tauler
    crearTauler(taulerIA, "tauler1", false);
    actualitzarTauler(taulerIA);

    //TAULER 02: jugador
    //creo el taulell i botons
    taulerJugador = new Tauler("j2", [10, 10]);
    generarBotons();

    //mostro el tauler
    crearTauler(taulerJugador, "tauler2", true);
    actualitzarTauler(taulerJugador);


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
            alert("El vaixell no es pot col·locar aquí.");
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
                let jugar_btn = document.getElementById("jugar_btn");
                jugar_btn.style.display = "inline";
                jugar_btn.addEventListener("click", iniciarJoc);
            }

        }

    } else {
        alert("Selecciona un vaixell!");
    }
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
    botoJugar.style.display = "none";
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

    if(id != "")
        element.id = id;

    if(contingut != "")
        element.textContent = contingut;

    if(classes.length != 0) {
        classes.forEach((classe) => element.classList.add(classe));
    }

    pare.appendChild(element);
    return element;
}