export class De {
    constructor() {
        this.brasser();
    }

    // classe inspirée de la classe conceptuelle (du MDD)
    private _valeur!: number;

    get valeur() {
        return this._valeur;
    }

    public brasser() {
        this._valeur = Math.floor(Math.random() * 6 + 1);
    }
}
