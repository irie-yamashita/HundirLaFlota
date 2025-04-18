export class Vaixell {
    #id;
    #nom;
    #mida;
    #coordenades;
    #enfonsat

    constructor (id, nom, mida){
        this.#id = id;
        this.#nom = nom;
        this.#mida = mida;
        this.#coordenades = [];
        this.#enfonsat = false;
    }

    //getters i setters
    get id() {return this.#id}
    get mida() { return this.#mida}
    get nom() { return this.#nom}
    get coordenades() { return this.#coordenades}
    get enfonsat() {return this.#enfonsat}
    
    set id(id) {this.#id = id}
    set id(nom) {this.#nom = nom}
    set mida(mida) {this.#mida = mida}
    set coordenades(coordenades) {this.#coordenades = coordenades}
    set enfonsat(enfonsat) {this.#enfonsat = enfonsat}

    afegirCoordenada(coordenada) {
        this.#coordenades.push(coordenada);
    }


}
