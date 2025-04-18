import { Tauler } from "./model/Tauler.js";
import { Vaixell } from "./model/Vaixell.js";

//Declaració variables globals
let vaixellUsu = "";
let direccioUsu = 'R'; //per defecte poso que la direcció sigui horitzontal (right)
let tauler2;


const vaixellsJSON = `[
{ "name": "Portaaviones", "size": 5 },
   { "name": "Acorazado", "size": 4 },
   { "name": "Crucero", "size": 3 },
   { "name": "Submarino", "size": 3 },
   { "name": "Destructor", "size": 2 }
]`;

let vaixellsJoc = cargarJson(vaixellsJSON);



//FUNCIONS

/*Funció que genera els vaixells inicials del joc. Agafa les dades d'un JSON que rep com a paràmetre.*/
function cargarJson(json) {
    let dadesVaixells = JSON.parse(json);

    return dadesVaixells
}


/*Funció que crea divs per cada casella d'un tauler (matriu).*/
function crearTauler(tauler, id, interactuable = false) {
    let divTauler = document.getElementById(id);
    divTauler.style.gridTemplateColumns = `repeat(${tauler.tamany[0]}, 50px)`;

    for (let f = 0; f < tauler.tamany[0]; f++) { //recorro per files

        for (let c = 0; c < tauler.tamany[1]; c++) {  //recorro per columnes
            //creo una casella i per defecte li poso la classe aigua
            let columna = document.createElement("div");
            columna.setAttribute("id", tauler.jugador + `-${f}-${c}`);
            columna.classList.add("casella", "aigua");

            //columna.innerHTML = `[${f}, ${c}]`


            if (interactuable) {
                //listener per col·locar els vaixells del jugador
                columna.addEventListener("click", onClickCasella);

            }

            divTauler.appendChild(columna);
        }

    }
}

/*Funció que actualitza les caselles del tauler (canvia les classes).*/
function actualitzarTauler(tauler) { //TODO: esborrar?
    for (let f = 0; f < tauler.tamany[0]; f++) {
        for (let c = 0; c < tauler.tamany[1]; c++) {
            let id =tauler.jugador + `-${f}-${c}`;
            actualitzaCasella(id, tauler);
        }
    }

}

/*Funció que consulta l'objecte tauler i actualitza la casella amb l'id passat per paràmetre.*/
function actualitzaCasella(id, tauler) {

    let casella = document.getElementById(id);
    let coord = extreureCoordenades(id);

    let aigua =  tauler.caselles[coord.x][coord.y].aigua;
    if(aigua) {        
        casella.setAttribute("class", "casella aigua");
        casella.textContent=""; //TODO: esborrar, ho faré amb imatge i CSS
    } else {

        //trec la classe aigua, li afegeixo la classe vaixell general i la concreta
        casella.classList.remove("aigua");
        casella.classList.add("vaixell");

        let nom = tauler.caselles[coord.x][coord.y].nomVaixell;
        casella.innerHTML = nom;
        casella.classList.add(nom[0]);


        let tocat =  tauler.caselles[coord.x][coord.y].tocat;

        if(tocat) {
            console.log("vaixell TOCAT");
            casella.classList.add("tocat");
        
        }
        
    }
}



/*Funció que fa un reset del tauler (a nivell visual).*/
function resetTauler(tauler) {
    for (let f = 0; f < tauler.tamany[0]; f++) {
        for (let c = 0; c < tauler.tamany[1]; c++) {
            let casella = document.getElementById(tauler.jugador + `x${f}y${c}`);

            casella.className = "casella aigua";
            casella.textContent ="";
        }
    }
}


/*Funció que genera els botons inicials (amb listeners) del tauler*/
function generarBotons() {
    let contenidorV = document.getElementById("botonsVaixells");

    /* Botons dels vaixells */
    vaixellsJoc.forEach(vaixell => {
        let boto = document.createElement("button");
        boto.id = vaixell.name + "_btn";
        boto.classList.add("vaixellsBtn");
        boto.textContent = vaixell.name;

        //listener per detectar quin vaixell col·locar
        boto.addEventListener("click", function (event) {

            //trobo el vaixell assignat al botó mirant si l'id és igual
            vaixellUsu = vaixellsJoc.find((element) => element.name == event.target.id.replace("_btn", ""));

            console.log("Vaixell triat", vaixellUsu);

            //drag & drop
            crearRendVaixell(event);

        });

        contenidorV.appendChild(boto);
    });

    /* Botons de direccions */
    let botoHor = document.getElementById("H_btn");
    let botoVer = document.getElementById("V_btn");

    botoHor.addEventListener("click", onClickDireccio);
    botoVer.addEventListener("click", onClickDireccio);


    /* Botó per reiniciar */
    let botoReset = document.getElementById("reset_btn");
    botoReset.addEventListener("click", onReiniciarColocacio);

}

//EVENT HANDLERS

/*Funció que agafa l'id del botó i guarda la direcció corresponent.
 - És cridada quan fas 'click' als botons H i D.
*/
function onClickDireccio(event) {
    let rendVaixell = document.getElementById("rendVaixell");
    //d'esquerra a dreta i de dalt a baix

    if(rendVaixell) {
        if (event.target.id[0] == "V") {
            rendVaixell.style.flexDirection = "column";
            direccioUsu = 'D';
        } else {
            rendVaixell.style.flexDirection = "row";
            direccioUsu = 'R';
        }
    }

    event.stopPropagation();

}

/*Funció que reinicia la col·locació dels vaixells
 - És cridada quan fas 'click' al botó de RESET
*/
function onReiniciarColocacio() {
    //Reinicio tauler (objecte)
    tauler2.reiniciar();
    actualitzarTauler(tauler2);

    //Activo tots els botons
    let contenidorV = document.getElementById("botonsVaixells");
    let botons = contenidorV.getElementsByTagName("button");
    for( let boto of botons) {
        boto.disabled = false;
    }
    resetTauler(tauler2);
}



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
    rendVaixell = document.createElement("div");
    rendVaixell.id = "rendVaixell";
    rendVaixell.classList.add("rendVaixell");

    //canvio display-flex segons la direccio del vaixell 
    direccioUsu == "R" ?  rendVaixell.style.flexDirection = "row" : rendVaixell.style.flexDirection = "column"; //(condicional ternari)

    //creo la plantilla del vaixell
    for (let i = 0; i < vaixellUsu.size; i++) {
        let casella = document.createElement("div");
        casella.classList.add("casella");
        rendVaixell.appendChild(casella);
    }

    contenidor.appendChild(rendVaixell);

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


/*Funció que controla la col·locasció de vaixells en les caselles del taulell. 
    - És cridada quan fas 'click' a una casella del jugador durant la col·locació de vaixells inicials
*/
function onClickCasella(event) {
    if (vaixellUsu != "") {
        //extrec les coordenades -> x0y4 (id de la casella)
        let idCasella = event.target.id;
        let coord = extreureCoordenades(idCasella);

        let x = parseInt(coord.x);
        let y = parseInt(coord.y);


        //Col·loco els vaixells i actualitzo la part visual
        let vaixell = new Vaixell (vaixellUsu.name[0], vaixellUsu.name, vaixellUsu.size);
        let colocat = tauler2.colocarVaixell(vaixell, x, y, direccioUsu);

        //comprovo si el vaixell s'ha col·locat correctament
        if (!colocat) {
            //missatge d'error
            alert("El vaixell no es pot col·locar aquí.");
        } else {
            //desactivo el botó i poso en blanc el vaixell seleccionat
            document.getElementById(vaixellUsu.name + "_btn").disabled = true;
            vaixellUsu = "";

            //afegeixo el vaixell a la llista del taulell del jugador
            tauler2.afegirVaixell(vaixell);//!!
            actualitzarTauler(tauler2);

            //drag&drop
            eliminarRendVaixell();

            //si col·loco tots els vaixells -> dono opció de començar a jugar
            if(tauler2.vaixells.length == vaixellsJoc.length) {
                let jugar_btn = document.getElementById("jugar_btn");
                jugar_btn.style.display = "inline";
                //jugar_btn.addEventListener("click", iniciarJoc);

            }

        }

    } else {
        alert("Selecciona un vaixell");
    }
}

/*Funció que amaga tots els botons de col·locació de vaixells i inicia el joc
    - És cridada quan fas 'click' al botó de JUGAR
*/
function iniciarJoc() {
    //amago el botó de jugar, reset i vaixells
    let botoJugar = document.getElementById("jugar_btn");
    botoJugar.style.display = "none";

    let botoReset = document.getElementById("reset_btn");
    botoReset.style.display = "none";

    let containerBotons = document.getElementById("botons_container"); 
    let botonsVaixells = containerBotons.getElementsByTagName("button");

    for(let boto of botonsVaixells) {
        boto.style.display = "none";
    }
    

    //elimino els events
    eliminarEvents();

}

/* Funció que elimina els events de les caselles*/
function eliminarEvents() {
    let caselles = document.querySelectorAll('#j2 .casella');

    caselles.forEach(function (casella) {
        casella.removeEventListener("click", onClickCasella);
    })

}





//MAIN
function init() {
    let jugar_btn = document.getElementById("jugar_btn");
    jugar_btn.style.display = "none";

    //TAULER 01: automàtic
    const tauler1 = new Tauler("j1", [10, 10]);

    //genero un vaixell de cada tipus
    for (let dades of vaixellsJoc) {

        let id = dades.name[0]; //l'id és la primera lletra
        let vaixell = new Vaixell(id, dades.name, dades.size);
        tauler1.afegirVaixell(vaixell);
    }

    //crido mètode per posicionar els vaixells
    tauler1.posicionarVaixells();

    //mostro el tauler
    crearTauler(tauler1, "tauler1");
    actualitzarTauler(tauler1);


    //TAULER 02: jugador
    //creo el taulell i botons
    tauler2 = new Tauler("j2", [10, 10]);
    generarBotons();

    //mostro el tauler
    crearTauler(tauler2, "tauler2", true);
    actualitzarTauler(tauler2);

} init();





//UTILS
function extreureCoordenades(id) {
    let elements = id.split("-"); //j2-4-9   (nom-x-y)

    return {"x": elements[1], "y": elements[2]};
}

function crearBoto(id, pare, text = "") {
    let contenidor = document.getElementById(pare);
    let boto = document.createElement("button");
    boto.id = id;
    boto.textContent = text;

    contenidor.appendChild(boto);
}