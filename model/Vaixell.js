export class Vaixell {
    #id;
    #nom;
    #mida;
    #coordenades;

    constructor (id, nom, mida){
        this.#id = id;
        this.#nom = nom;
        this.#mida = mida;
        this.#coordenades = [];
    }

    //getters i setters
    get id() {return this.#id}
    get mida() { return this.#mida}
    get nom() { return this.#nom}
    get coordenades() { return this.#coordenades}
    
    set id(id) {this.#id = id}
    set id(nom) {this.#nom = nom}
    set mida(mida) {this.#mida = mida}
    set coordenades(coordenades) {this.#coordenades = coordenades}

}
