import { Tauler } from "./model/Tauler.js";
import { Vaixell } from "./model/Vaixell.js";

//Declaració variables globals
let vaixellUsu = "";
let direccioUsu = 'R'; //per defecte poso que la direcció sigui horitzontal (right)
let casellaUsu;

let torn = true;
let fiPartida = false;

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


/*Funció que genera els botons inicials (amb listeners) del tauler*/
function generarBotons() {
    let contenidorV = document.getElementById("botonsVaixells");

    /* Botons dels vaixells */
    vaixellsJoc.forEach(vaixell => {
        let divVaixell = document.createElement("div");
        let boto = document.createElement("button");
        let icona = document.createElement("div");

        boto.id = vaixell.name + "_btn";
        boto.classList.add("vaixellsBtn");
        boto.textContent = vaixell.name;

        icona.classList.add(vaixell.name[0]);
        icona.classList.add("vaixell_icona");
        icona.id = vaixell.name+"_icona";

        divVaixell.classList.add("vaixell_container");

        //listener per detectar quin vaixell col·locar
        boto.addEventListener("click", function (event) {

            //trobo el vaixell assignat al botó mirant si l'id és igual
            vaixellUsu = vaixellsJoc.find((element) => element.name == event.target.id.replace("_btn", ""));

            //drag & drop
            crearRendVaixell(event);

        });

        divVaixell.appendChild(icona);
        divVaixell.appendChild(boto);
        contenidorV.appendChild(divVaixell);
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

//MAIN
function init() {
    let jugar_btn = document.getElementById("jugar_btn");
    jugar_btn.style.display = "none";

    //TAULER 01: automàtic
    taulerRival = new Tauler("j1", [10, 10]);

    //genero un vaixell de cada tipus
    for (let dades of vaixellsJoc) {

        let id = dades.name[0]; //l'id és la primera lletra
        let vaixell = new Vaixell(id, dades.name, dades.size);
        taulerRival.afegirVaixell(vaixell);
    }

    //crido mètode per posicionar els vaixells
    taulerRival.posicionarVaixells();

    //mostro el tauler
    crearTauler(taulerRival, "tauler1", false);


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

/*Funció que agafa l'id del botó i guarda la direcció corresponent.
 - És cridada quan fas 'click' als botons H i D.
*/
function onClickDireccio(event) {
    let rendVaixell = document.getElementById("rendVaixell");
    //d'esquerra a dreta i de dalt a baix

    if (rendVaixell) {
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
    rendVaixell = document.createElement("div");
    rendVaixell.id = "rendVaixell";
    rendVaixell.classList.add("rendVaixell");

    //canvio display-flex segons la direccio del vaixell 
    direccioUsu == "R" ? rendVaixell.style.flexDirection = "row" : rendVaixell.style.flexDirection = "column"; //(condicional ternari)

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



/*Funció que controla la col·locació de vaixells en les caselles del taulell. 
    - És cridada quan fas 'click' a una casella del jugador durant la col·locació de vaixells inicials
*/
function colocacioVaixellHandler(event) {
    if (vaixellUsu != "") {
        //extrec les coordenades -> x0y4 (id de la casella)
        let idCasella = event.target.id;
        let coord = extreureCoordenades(idCasella);

        let x = parseInt(coord.x);
        let y = parseInt(coord.y);


        //Creo el vaixell i el provo de col·locar
        let vaixell = new Vaixell(vaixellUsu.name[0], vaixellUsu.name, vaixellUsu.size);
        let colocat = taulerJugador.colocarVaixell(vaixell, x, y, direccioUsu);

        //comprovo si el vaixell s'ha col·locat correctament
        if (!colocat) {
            //missatge d'error
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
        alert("Selecciona un vaixell");
    }
}

/*Funció que amaga tots els botons de col·locació de vaixells i inicia el joc (atac)
    - És cridada quan fas 'click' al botó de JUGAR
*/
function iniciarJoc() {
    //amago el botó de jugar, reset i direccions
    let botonsDesactivar = document.querySelectorAll("#botonsDireccions button");
    botonsDesactivar.forEach((boto) => boto.style.display = "none");

    //elimino events
    let botonsVaixells = document.querySelectorAll("#botonsVaixells button");
    let casellesJugador = document.querySelectorAll("#j2 .casella");

    botonsVaixells.forEach((boto) => boto.removeEventListener("click", crearRendVaixell));
    casellesJugador.forEach((casella) => casella.removeEventListener("click", colocacioVaixellHandler));

    //activo els de joc
    activarEventJoc();

}



/*PART 3: ATAC*/

/* Funció activa els events del joc referents a l'atac*/
function activarEventJoc() {
    let casellesRivals = document.querySelectorAll("#j1 .casella");

    for (let casella of casellesRivals) {
        casella.addEventListener('click', seleccionaCasella);
    }


    let botoAtacar = document.getElementById("atacar_btn");
    botoAtacar.addEventListener("click", atacarHandler);

}

/* Funció que guarda quina és l'id de la casella seleccionada i la destaca.
    - És cridada quan fas 'click' a una casella del tauler de la IA
*/
function seleccionaCasella(event) {
    let casellaAnterior = document.getElementById(casellaUsu);
    if (casellaAnterior) {
        casellaAnterior.classList.remove("seleccionat");
    }

    //guardo l'id de la casella seleccionada
    casellaUsu = event.target.id;

    //li canvio l'estil per marcar que està selecionada
    let casellaSeleccionada = document.getElementById(casellaUsu);
    casellaSeleccionada.classList.add("seleccionat");
}

/* Funció que controla els atacs de l'USUARI.
    - És cridada quan fas 'click' al botó d'ATACAR
*/
function atacarHandler() {

    if (torn) {

        //comprovo que usuari hagi seleccionat una casella
        if (casellaUsu) {
            //elimino event
            let casella = document.getElementById(casellaUsu);
            casella.removeEventListener("click", seleccionaCasella);

            //extrec les coordenades a partir del id del div
            let coord = extreureCoordenades(casellaUsu);

            //ataco
            let tocat = taulerRival.atacar(coord.x, coord.y);

            //mostro casella (visual)
            actualitzaCasella(casellaUsu, taulerRival);
            casellaUsu = "";

            //si usuari no ha tocat, canvi de torn, li toca a la màquina
            if (!tocat) {
                torn = false;
                atacarIA();
            } else {
                if(tocat.enfonsat == true){
                    alert("Tocat i enfonsat!");
                }
            }


            if(taulerRival.derrota()) {
                finalitzarPartida("Usuari");
            }

        } else {
            alert("Selecciona una casella per atacar!");
        }


    } else {
        alert("NO és el teu torn, espera.");
    }

}


/*IA*/

/* Funció que genera l'atac de la IA cap al tauler del jugador*/
function atacarIA() {
    //genero coordenades
    let coordenadesIA = generarCoordenadesIA();
    let x = coordenadesIA.x;
    let y = coordenadesIA.y;

    //ataco
    let vaixellTocat = taulerJugador.atacar(x, y);
    taulerJugador.caselles[x][y].jugada = true;

    //si he tocat (direcció correcta)
    if(vaixellTocat) {
        //console.log("en principi he tocat", vaixellTocat);

        //si és el primer cop que toco, reinicio les direccions i em guardo la casella
        if(IA.memoria.length <= 0) {
            generarMemoriaIA(x, y);
        }

        actualitzarMemoriaIA(x,y);

        //si he enfonsat el vaixell, borro la memòria i reinicio les direccions
        if(taulerJugador.vaixellEnfonsat(vaixellTocat)) {
            esborrarMemoriaIA();
        }

        //actualitzo la part visual
        actualitzarEnfonsat(vaixellTocat);
        actualitzaCasella(generarIdCasella(taulerJugador, x, y), taulerJugador);

        if(!taulerJugador.derrota()) {
            setTimeout(atacarIA, 2000); //setTimeout per simular que la IA pensa
        } else {
            finalitzarPartida("Màquina");
        }


    } else {
        //si he tocat aigua, però encara no he enfonsat, canvio de direcció
        if(IA.memoria.length > 0) {
            canviDireccioIA();
        }
        torn = true;
    }

    //canvio estat de la casella i actualitzo la part visual
    let idCasella = generarIdCasella(taulerJugador, x, y);
    actualitzaCasella(idCasella, taulerJugador);
}

/*Funció que genera coordenades aleatòries o intel·ligents segons si s'ha tocat un vaixell o no*/
function generarCoordenadesIA() {
    let x; let y;
    //ataco fins que seleccioni una casella aigua o guanyi
    let correcte = false;
    do {
        //si l'anterior ha estat aigua, genero coordenades de manera aleatòria
        if(IA.memoria.length == 0) {
            x = generarNumRandom(taulerJugador.tamany[0]);
            y = generarNumRandom(taulerJugador.tamany[1]);

        } else { //si ha estat tocat, ataco a una coordenada propera

            let coordenadesVeines = generarCoordenadaVeina();
            x = coordenadesVeines[0];
            y = coordenadesVeines[1];

            //console.log(coordenadesVeines, IA.direccions, IA.memoria);
            
        }

        //comprovo si és una casella que ja he atacat
        if(!taulerJugador.caselles[x][y].jugada) {
            correcte = true;
        } else if(taulerJugador.caselles[x][y].jugada && IA.memoria.length > 0){
            canviDireccioIA();
        }
        
    } while (!correcte) //atrapo fins que generi unes coordenades que no hagi atacat anteriorment

    return {"x": x, "y": y}

}

/*Funció que activa la memòria de la màquina quan toca un vaixell*/
function generarMemoriaIA(x, y) {
    IA.direccions = ['U', 'D', 'L', 'R'];
    IA.casellaInicial[0] = x;
    IA.casellaInicial[1] = y;
}

/*Funció que actualitza la memòria de la màquina*/
function actualitzarMemoriaIA(x, y) {
    IA.memoria[0] = x;
    IA.memoria[1] = y;
}

/*Funció que canvia la direcció de la màquina i torna a buscar des del punt inicial on ha trobat el primer tocat*/
function canviDireccioIA() {
    IA.direccions.shift();
    IA.memoria[0] = IA.casellaInicial[0];
    IA.memoria[1] = IA.casellaInicial[1];
}

/*Funció que esborra la memòria de la màquina un cop ha enfonsat el vaixell*/
function esborrarMemoriaIA() {
    IA.memoria = [];
    IA.casellaInicial = [];
    IA.direccions = ['U', 'D', 'L', 'R'];
}

/*Funció retorna la casella més propera segons una direcció donada*/
function generarCoordenadaVeina() {
    let correcte;
    let nX;
    let nY;

    do {
        nX = IA.memoria[0];
        nY = IA.memoria[1];
        correcte = true;

        let direccio = IA.direccions[0];
        switch (direccio) {
            case 'U':
                nX--;
                break;
            case 'D':
                nX++;
                break;
            case 'L':
                nY--;
                break;
            case 'R':
                nY++;
                break;
        } 
    
        //si toco algun borde, vol dir que he d'anar cap a l'altra direcció
        if(nX < 0 || nX > taulerJugador.tamany[0]-1 || nY < 0 || nY > taulerJugador.tamany[0]-1) {
            canviDireccioIA();
            correcte = false;
        }

    } while(!correcte) //atrapo fins obtenir una casella que existeixi

    return [nX, nY];
}




/*Funció que és cridada quan algú guanya la partida. Crida a una altra funció per eliminar els events.*/
function finalitzarPartida(guanyador="") {
    fiPartida = true;
    alert("S'ha acabat la partida. Ha guanyat: "+ guanyador);

    let resultat = document.createElement("p");
    resultat.textContent = "Ha guanyat: "+ guanyador;
    document.body.insertBefore(resultat, document.body.firstChild);

    eliminarEventsFinals();
}

/*Funció que elimina els listeners dels events de la partida en la fase d'atac*/
function eliminarEventsFinals() {
    let botoAtacar = document.getElementById("atacar_btn");
    botoAtacar.removeEventListener("click", atacarHandler);

    let caselles = document.querySelectorAll("#tauler1 .casella");
    for(let casella of caselles) {
        casella.removeEventListener("click", seleccionaCasella);
    }
}

/*Funció que marca visaulment que un vaixell del tauler del jugardor ha estat enfonsat*/
function actualitzarEnfonsat(vaixell) {
    if(vaixell.enfonsat == true) {
        let idIcona = vaixell.nom+"_icona";

        let iconaVaixell = document.getElementById(idIcona);

        iconaVaixell.textContent = "💥";
    }
}







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

