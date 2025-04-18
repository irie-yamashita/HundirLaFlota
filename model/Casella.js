export class Casella {
    #aigua;
    #tocat;
    #jugada;
    #nomVaixell;

    constructor() {
        this.#aigua = true;
        this.#tocat = false;
        this.#jugada = false;
        this.#nomVaixell = "";
    }

    //getters i setters
    get aigua() { return this.#aigua}
    get tocat() { return this.#tocat}
    get nomVaixell() { return this.#nomVaixell}
    
    set aigua(aigua) {this.#aigua = aigua}
    set tocat(tocat) {this.#tocat = tocat}
    set nomVaixell(nomVaixell) {this.#nomVaixell = nomVaixell}
}