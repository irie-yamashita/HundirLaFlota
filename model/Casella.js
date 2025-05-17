export class Casella {
    #aigua;
    #tocat;
    #nomVaixell;
    #jugada;

    constructor() {
        this.#aigua = true;
        this.#tocat = false;
        this.#nomVaixell = "";
        this.#jugada = false;
    }

    //getters i setters
    get aigua() { return this.#aigua}
    get tocat() { return this.#tocat}
    get nomVaixell() { return this.#nomVaixell}
    get jugada() { return this.#jugada}
    
    set aigua(aigua) {this.#aigua = aigua}
    set tocat(tocat) {this.#tocat = tocat}
    set nomVaixell(nomVaixell) {this.#nomVaixell = nomVaixell}
    set jugada(jugada) {this.#jugada = jugada}

    resetCasella() {
        this.#aigua = true;
        this.#tocat = false;
        this.#nomVaixell = "";
        this.#jugada = false;
    }

    serialitzar(f, c) {
        const obj = {
            "f": f,
            "c": c,
            "aigua" : this.#aigua,
            "tocat" : this.#tocat,
            "nomVaixell" : this.#nomVaixell,
            "jugada": this.#jugada
        }

        return JSON.stringify(obj);
    }

    carregarDades (dadesJSON) {
        let dades = JSON.parse(dadesJSON);
        this.#aigua = dades.aigua;
        this.#nomVaixell = dades.nomVaixell;
        this.#tocat = dades.tocat;
        this.#jugada = dades.jugada;

    }
}