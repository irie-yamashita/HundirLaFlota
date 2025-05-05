export class Casella {
    #aigua;
    #tocat;
    #nomVaixell;

    constructor() {
        this.#aigua = true;
        this.#tocat = false;
        this.#nomVaixell = "";
    }

    //getters i setters
    get aigua() { return this.#aigua}
    get tocat() { return this.#tocat}
    get nomVaixell() { return this.#nomVaixell}
    
    set aigua(aigua) {this.#aigua = aigua}
    set tocat(tocat) {this.#tocat = tocat}
    set nomVaixell(nomVaixell) {this.#nomVaixell = nomVaixell}

    resetCasella() {
        this.#aigua = true;
        this.#tocat = false;
        this.#nomVaixell = "";
    }

    serialitzar(f, c) {
        const obj = {
            "f": f,
            "c": c,
            "aigua" : this.#aigua,
            "tocat" : this.#tocat,
            "nomVaixell" : this.#nomVaixell
        }

        return JSON.stringify(obj);
    }
}