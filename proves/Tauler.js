import { Casella } from "./Casella.js";

export class Tauler {
    jugador;
    #tamany;
    #vaixells;
    #caselles;

    constructor(jugador, tamany) {
        this.jugador = jugador;
        this.#tamany = tamany;
        this.#caselles = [];

        for (let f = 0; f < this.#tamany[0]; f++) { //recorro per files

            let fila = [];

            for (let c = 0; c < this.#tamany[1]; c++) {  //recorro per columnes
                fila[c] = new Casella();
            }

            this.#caselles[f] = fila;
        }

        this.#vaixells = [];

    }

    atacar(f, c) {
        if(this.#caselles[f][c].aigua == true) {
            return false //no he tocat
        }

        else {
            this.#caselles[f][c].tocat = true;
            let idVaixell = this.#caselles[f][c].nomVaixell;
            
            //comprovo si està ja enfonsat
            let vaixellTriat = this.#vaixells.find((vaixell) => vaixell.id == idVaixell);
            vaixellTriat.enfonsat = this.vaixellEnfonsat(vaixellTriat);

            return vaixellTriat;
        }

    }
   
    afegirVaixell(vaixell) {
        this.#vaixells.push(vaixell);
    }

    /*Mètode que coloca els vaixells de manera aleatòria amb un màxim d'intents.*/
    colocarVaixellsAleatoris() {
        let nVaixells;
        let maxIntents = 5;
        let intents;

        do {
            intents = 0;
            nVaixells = 0;

            //per cada vaixell
            for(let vaixell of this.#vaixells){
                let intents = 0;
                let colocat = false;
    
                //per cada casella que necessita ell vaixell
                do {    
                    //genero coordenades i direcció aleatòriament
                    let f = generarNumRandom(this.#tamany[0]);
                    let c = generarNumRandom(this.#tamany[1]);
                    let direccio = generarNumRandom(2);
        
                    console.log(intents,vaixell.id, vaixell.mida, direccio, f, c);
        
                    //provo de col·locar el vaixell
                    if(this.colocarVaixell(vaixell, f, c, direccio)) {
                        nVaixells++;
                        colocat = true;
                    } else { //no hi ha espai
                        intents++;
                    }

                } while(!colocat && intents < maxIntents); //repeteixo el procés fins que em quedi sense intents

            }

            if(nVaixells != this.#vaixells.length) {
                console.log("No s'ha pogut col·locar tots els vaixells. Tornem a generar-los");
                this.reiniciar();
            }
    
        } while (nVaixells != this.#vaixells.length)
        
    }


    /*
        Mètode que coloca un vaixell en les coordenades i direccio indicades
        @return true/false segons si s'ha pogut col·locar o no el vaixell
    */
    colocarVaixell(vaixell, f, c, direccio){

        //comprovo que hi hagi espai pel vaixell
        let coordenadesVaixell = this.#hiHaEspai(f, c, direccio, vaixell.mida);
        if(coordenadesVaixell) { 

            //modifico l'estat de les caselles
            for (let coordenada of coordenadesVaixell) {
                let cN = coordenada[0]; let fN = coordenada[1];

                this.#caselles[cN][fN].aigua = false;
                this.#caselles[cN][fN].nomVaixell = vaixell.id;      

                vaixell.afegirCoordenada([cN, fN]);
            }
            return true //vaixell colocat

        } else {
            return false
        }

    }

    reiniciar() {

        //reinicio les caselles
        for (let f = 0; f < this.#tamany[0]; f++) {

            for(let c = 0; c < this.#caselles.length; c++ ) {
                this.#caselles[f][c].resetCasella();
            }

        }

        //reinicio vaixells
        this.vaixells.forEach((vaixell) => vaixell.resetVaixell());
    }

    derrota() {
        for(let vaixell of this.#vaixells) {
            if(vaixell.enfonsat == false) {
                return false;
            }
        }

        return true;
    }

    //mètodes privats (helpers)

    vaixellEnfonsat (vaixell) {

        //comprovo que el vaixell no estigui enfonsat
        for(let coordenada of vaixell.coordenades) {
            if(this.#caselles[coordenada[0]][coordenada[1]].tocat == false) {
                return false;
            }
        }

        vaixell.enfonsat = true;
        return true;
    }

    /*Mètode que valida si es pot col·locar un vaixell. Si es pot, retorna les coordenades. Si no es pot, retorna null.*/
    #hiHaEspai(f, c, dir, quantitat) {
        let novesCoordenades = [];
        let fN = f; let cN = c;

        //comprovo per cada casella que ocuparia el vaixell (tamany)
        for(let i = 0; i < quantitat; i++) {

            //genero noves coordenades
            dir == 0 ? cN = c + i : fN = f + i; //(si és dir 0 -> horitzontal (c+i), si és dir 1 -> vertical (f+i)

            //comprovo que no estigui fora del tauler
            if(fN > this.#tamany[0]-1 || fN < 0 || cN < 0 || cN > this.#tamany[1]-1) { //-1 perquè comencem per [0]
                console.log('Fora del tauler!');
                return null;
            } else if (this.#caselles[fN][cN].aigua == false) { //comprovo que no sigui una casella ja ocupada
                console.log('Casella ocupada!',fN, cN);
                return null;
            }if(!this.#hihaSeparacio(fN, cN, dir, i, quantitat)) {
                console.log("Té un vaixell al voltant", fN, cN);
                return null;
            }
            else {
                novesCoordenades.push([fN, cN]);
            }
            

        }

        return novesCoordenades; 

    }

    #hihaSeparacio(f, c, direccio, i, quantitat) {
        let veines = [];

        //direccio 0 -> horitzontal
        if(direccio == 0) {
            veines.push([f-1, c], [f+1, c]);

            //si és la primera casella
            if(i == 0) {
                veines.push([f, c-1]);

                veines.push([f-1, c-1]);
                veines.push([f+1, c-1]);
            } else if(i == quantitat-1) {//si és l'última casella
                veines.push([f, c+1]);

                veines.push([f-1, c+1]);
                veines.push([f+1, c+1]);
            }

        } else {
            veines.push([f, c-1], [f, c+1]);

            //si és la primera casella
            if(i == 0) {
                veines.push([f-1, c]);

                veines.push([f-1, c-1]);
                veines.push([f-1, c+1]);
            } else if (i == quantitat-1) {
                veines.push([f+1, c]);

                veines.push([f+1, c-1]);
                veines.push([f+1, c+1]);
            }
    
        }

        //trec les coordenades que es troben fora del tauler
        veines = veines.filter( (coord) => {
            return coord[0] >= 0 && coord[0] < this.#tamany[0] && coord[1] >= 0 && coord[1] < this.#tamany[1];
        });

        for (let veina of veines) {
            if(this.#caselles[veina[0]][veina[1]].aigua == false) {
                return false;
            }
        }
        return true;

    }


    obtenirVaixell(nom) {
        return this.#vaixells.found((vaixell) => vaixell.nom == nom);
    }

    //getters i setters
    get tamany() { return this.#tamany}
    get vaixells() { return this.#vaixells}
    get caselles() { return this.#caselles}
    
    set tamany(tamany) {this.#tamany = tamany}
    set vaixells(vaixells) {this.#vaixells = vaixells}
    set caselles(caselles) {this.#caselles = caselles}

}


/*Funció que genera números aleatoris.*/
function generarNumRandom(max) {
    const numRand = Math.floor(Math.random() * max);

    return numRand
}

//TODO: fer estàtic


