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

            let fila = []

            for (let c = 0; c < this.#tamany[1]; c++) {  //recorro per columnes
                fila[c] = new Casella();
            }

            this.#caselles[f] = fila;
        }

        this.#vaixells = [];

    }

    atacar(x, y) {
        if(this.#caselles[x][y].aigua == true) {
            return false //no he tocat
        }

        else {
            this.#caselles[x][y].tocat = true;
            let idVaixell = this.#caselles[x][y].nomVaixell;
            
            //comprovo si està ja enfonsat
            let vaixellTriat = this.#vaixells.find((vaixell) => vaixell.id == idVaixell);
            vaixellTriat.enfonsat = this.vaixellEnfonsat(vaixellTriat);

            return vaixellTriat;
        }

    }
   


    afegirVaixell(vaixell) {
        this.#vaixells.push(vaixell);
    }

    posicionarVaixells() {
        const direccions = ['U', 'D', 'L', 'R'];

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
                    let x = generarNumRandom(this.#tamany[0]);
                    let y = generarNumRandom(this.#tamany[1]);
                    let direccio = direccions[generarNumRandom(direccions.length)];
        
                    //console.log(intents,vaixell.id, vaixell.mida, direccio, x, y);
        
        
                    //provo de col·locar el vaixell
                    if(this.colocarVaixell(vaixell, x, y, direccio)) {
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
/*                 for (let f = 0; f < this.#tamany[0]; f++) {

                    for(let c = 0; c < this.#caselles.length; c++ ) {
                        if(this.#caselles[f][c].aigua == false){
                            this.#caselles[f][c].aigua = true;
                            this.#caselles[f][c].nomVaixell = '';
                        }
                    }

                } */
            }
    

        } while (nVaixells != this.#vaixells.length)
        
    }


    /*
        Mètode que coloca un vaixell en les coordenades i direccio indicades
        @return true/false segons si s'ha pogut col·locar o no el vaixell
    */
    colocarVaixell(vaixell, x, y, direccio){

        //comprovo que hi hagi espai pel vaixell
        if(this.#hiHaEspai(x, y, direccio, vaixell.mida)) { 

            //modifico estat de la casella
            for (let i = 0; i < vaixell.mida; i++) {
                let nX = x;
                let nY = y;


                switch (direccio) {
                    case 'U':
                        nX = x - i;
                        break;
                    case 'D':
                        nX = x + i;
                        break;
                    case 'L':
                        nY = y - i;
                        break;
                    case 'R':
                        nY = y +i;
                        break;
                } 
                this.#caselles[nX][nY].aigua = false;
                this.#caselles[nX][nY].nomVaixell = vaixell.id;      

                vaixell.afegirCoordenada([nX, nY]);
    
            }
            return true //vaixell colocat

        } else {
            return false
        }
        

    }

    reiniciar() {
        this.#vaixells = [];

        for (let f = 0; f < this.#tamany[0]; f++) {

            for(let c = 0; c < this.#caselles.length; c++ ) {
                if(this.#caselles[f][c].aigua == false){
                    this.#caselles[f][c].aigua = true;
                    this.#caselles[f][c].nomVaixell = '';
                }
            }

        }

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
        let enfonsat = true;

        //comprovo que el vaixell no estigui enfonsat
        for(let coordenada of vaixell.coordenades) {
            if(this.#caselles[coordenada[0]][coordenada[1]].tocat == false) {
                return false;
            }
        }

        vaixell.enfonsat = true;
        return true;
    }

    #hiHaEspai(x, y, dir, q) {
        let xN = x;
        let yN = y;
        let i = 0;
        let correcte = true;

        do {

            switch (dir) {
                case 'U':
                    xN = x - i;
                    break;
                case 'D':
                    xN = x + i;
                    break;
                case 'L':
                    yN = y - i;
                    break;
                case 'R':
                    yN = y +i;
                    break;
            }

            if(xN > this.#tamany[0]-1 || xN < 0 || yN < 0 || yN > this.#tamany[1]-1) { //-1 perquè comencem per [0]
                correcte = false;
                console.log('Fora del tauler!');
            } else if (this.#caselles[xN][yN].aigua == false){
                console.log('Casella ocupada!',xN, yN);
                correcte = false;
            }

            i++;

        } while(correcte && i < q)

        return correcte; 

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



