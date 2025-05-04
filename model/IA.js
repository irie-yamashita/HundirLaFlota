export class IA {
    #direccions;
    #memoria;
    #casellaInicial;
    #casellesJugades;
    limit;

    constructor(limit) {
        this.limit = limit;
        this.#direccions = ['U', 'D', 'L', 'R'];
        this.#memoria = [];
        this.#casellaInicial = [];
        this.#casellesJugades = [];
    }


    /*Funció que genera coordenades aleatòries o intel·ligents segons si s'ha tocat un vaixell o no*/
    pensarCoordenades() {
        let f; let c;

        //ataco fins que seleccioni una casella aigua o guanyi
        let correcte = false;
        do {
            //si l'anterior ha estat aigua, genero coordenades de manera aleatòria
            if(this.#memoria.length == 0) {
                f = generarNumRandom(this.limit);
                c = generarNumRandom(this.limit);

            } else { //si ha estat tocat, ataco a una coordenada propera

                let coordenadesVeines = this.generarCoordenadaVeina();
                f = coordenadesVeines[0];
                c = coordenadesVeines[1];

                //console.log(coordenadesVeines, IA.direccions, IA.memoria);
                
            }

            //comprovo si és una casella que ja he atacat
            if(!this.#casellesJugades.includes(f+"-"+c)) {
                correcte = true;
                this.afegirJugada(f, c);
                return {"f": f, "c": c}
            } else if(this.#casellesJugades.includes(f+"-"+c) && this.#memoria.length > 0){
                this.canviDireccioIA();
                this.afegirJugada(f, c);
                return {"f": this.#memoria[0], "c": this.#memoria[1]}
            }
            
        } while (!correcte) //atrapo fins que generi unes coordenades que no hagi atacat anteriorment
    }


    afegirJugada(f, c) {
        this.#casellesJugades.push(f+"-"+c);
    }

    /*Funció que activa la memòria de la màquina quan toca un vaixell*/
    generarMemoriaIA(x, y) {
        this.#direccions = ['U', 'D', 'L', 'R'];
        this.#casellaInicial[0] = x;
        this.#casellaInicial[1] = y;
    }

    /*Funció que actualitza la memòria de la màquina*/
    actualitzarMemoriaIA(x, y) {
        this.#memoria[0] = x;
        this.#memoria[1] = y;
    }

    /*Funció que canvia la direcció de la màquina i torna a buscar des del punt inicial on ha trobat el primer tocat*/
    canviDireccioIA() {
        this.#direccions.shift();
        this.#memoria[0] = this.#casellaInicial[0];
        this.#memoria[1] = this.#casellaInicial[1];
    }

    /*Funció que esborra la memòria de la màquina un cop ha enfonsat el vaixell*/
    esborrarMemoriaIA() {
        this.#memoria = [];
        this.#casellaInicial = [];
        this.#direccions = ['U', 'D', 'L', 'R'];
    }

    /*Funció retorna la casella més propera segons una direcció donada*/
    generarCoordenadaVeina() {
        let correcte;
        let fN;
        let cN;

        do {
            fN = this.#memoria[0];
            cN = this.#memoria[1];
            correcte = true;

            let direccio = this.#direccions[0];
            switch (direccio) {
                case 'U':
                    fN--;
                    break;
                case 'D':
                    fN++;
                    break;
                case 'L':
                    cN--;
                    break;
                case 'R':
                    cN++;
                    break;
            } 
        
            //si toco algun borde, vol dir que he d'anar cap a l'altra direcció
            if(fN < 0 || fN > this.limit-1 || cN < 0 || cN > this.limit-1) {
                canviDireccioIA();
                correcte = false;
            }

    } while(!correcte) //atrapo fins obtenir una casella que existeixi

    return [fN, cN];
}


    //getters i setters
    get direccions() { return this.#direccions}
    get memoria() { return this.#memoria}
    get casellaInicial() { return this.#casellaInicial}
    get casellesJugades() { return this.#casellesJugades}
    
    set direccions(direccio) {this.#direccions = direccions}
    set memoria(memoria) {this.#memoria = memoria}
    set casellaInicial(casellaInicial) {this.#casellaInicial = casellaInicial}
    set casellesJugades(casellesJugades) {this.#casellesJugades = casellesJugades}

}


/*Funció que genera números aleatoris.*/
function generarNumRandom(max) {
    const numRand = Math.floor(Math.random() * max);

    return numRand
}