import { Tauler } from "./Tauler.js";
import { Vaixell } from "./Vaixell.js";

//Declaració variables globals
let vaixellUsu = "";
let direccioUsu = 'R'; //per defecte poso que la direcció sigui horitzontal (right)
let casellaUsu;

let torn = true;

let taulerRival;
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
                columna.addEventListener("click", colocacioVaixellHandler);
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

    let aigua = tauler.caselles[coord.x][coord.y].aigua;
    let jugada = tauler.caselles[coord.x][coord.y].jugada;
    if (aigua) {
        casella.setAttribute("class", "casella aigua");
    } else {

        //trec la classe aigua, li afegeixo la classe vaixell general i la concreta
        casella.classList.remove("aigua");
        casella.classList.add("vaixell");

        let nom = tauler.caselles[coord.x][coord.y].nomVaixell;
        casella.classList.add(nom[0]);


        let tocat = tauler.caselles[coord.x][coord.y].tocat;

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
function init() {
    //Carrego dades dels vaixells
    let vaixellsJoc = cargarJson(vaixellsJSON);

    //TAULER 01: automàtic
    taulerRival = new Tauler("j1", [10, 10]);

    //genero un vaixell de cada tipus
    for (let dades of vaixellsJoc) {
        let id = dades.name[0]; //l'id és la primera lletra
        let vaixell = new Vaixell(id, dades.name, dades.size);
        taulerRival.afegirVaixell(vaixell);
    }

    //crido mètode per posicionar els vaixells
    taulerRival.posicionarVaixellsAleatoris();

    //mostro el tauler
    crearTauler(taulerRival, "tauler1", false);
    actualitzarTauler(taulerRival);


} init();



//UTILS
function extreureCoordenades(id) {
    let elements = id.split("-"); //j2-4-9   (nom-x-y)

    return { "x": elements[1], "y": elements[2] };
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
