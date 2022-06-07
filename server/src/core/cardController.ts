import { Card } from "../types/card";

const Pool = require('pg').Pool;

export class CardController {


    constructor() {
        this.db = new Pool({
            user: '',
            host: 'localhost',
            database: '',
            password: '',
            port: 5432
        });
    }


    public create(card: Card): void {
        //query
    }


}
