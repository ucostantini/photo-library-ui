import { ICardRepository } from "../ICardRepository";
import { Card, CardForm, CardRequest, CardResult, Order, Pagination, Sort } from "../../../types/card";
import Database, { Statement } from "better-sqlite3";
import { Logger } from "pino";

export class SqliteCardRepository implements ICardRepository {
    private db: Database.Database;

    // TODO replace FTS populate with triggers

    constructor(private log: Logger) {
        if (process.env.LOG_LEVEL === 'debug') {
            this.db = new Database(process.env.DB_PATH, {verbose: console.log});
        } else {
            this.db = new Database(process.env.DB_PATH);
        }
    }

    create(entity: CardForm): CardResult {
        const card: CardRequest = entity.card;
        // insert data related to card
        Object.assign(card, this.db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?) RETURNING ROWID')
            .get(card.title, card.website, card.username));
        // populate full text search table
        this.db.prepare('INSERT INTO cards_fts VALUES(?,?,?,?,?)')
            .run(card.cardId, card.title, card.website, card.username, card.tags.join(' '));

        // link card with its files
        let statement: Statement = this.db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
        entity.card.files.forEach(file => statement.run(entity.card.cardId, file));

        return {cards: [], count: 1};
    }

    delete(entity: CardForm): void {
        const id: number = entity.card.cardId;
        // delete from main table
        this.db.prepare('DELETE FROM cards WHERE cardId = ?').run(id)
    }

    read(entity: CardForm): CardResult {
        const matchFTS: string = this.prepareFTSMatchStatement(entity.card);
        const pagination: Pagination = entity.pagination;

        const cards: Card[] = this.db.prepare('SELECT DISTINCT cards_view.* FROM cards_view INNER JOIN cards_fts ON cards_fts.cardId = cards_view.cardId INNER JOIN files_fts ON files_fts.cardId = cards_view.cardId WHERE cards_fts MATCH ? AND files_fts MATCH ?' +
            ` ORDER BY cards_view.${Sort[pagination._sort]} ${Order[pagination._order]} LIMIT ? OFFSET ?`)
            .all(matchFTS, matchFTS, pagination._limit, pagination._page);

        const count: number = this.db.prepare('SELECT DISTINCT COUNT(cardId) AS count FROM cards_fts NATURAL JOIN files_fts WHERE cards_fts MATCH ? AND files_fts MATCH ?')
            .get(matchFTS, matchFTS);

        return {cards: cards, count: count};
    }

    readAll(entity: CardForm): CardResult {
        const pagination = entity.pagination;

        const cards: Card[] = this.db.prepare(`SELECT * FROM cards_view ORDER BY ${Sort[pagination._sort]} ${Order[pagination._order]} LIMIT ? OFFSET ?`)
            .all(pagination._limit, pagination._page);

        const count: number = this.db.prepare('SELECT COUNT(cardId) AS count FROM cards').get().count;

        return {cards: cards, count: count};
    }

    update(entity: CardForm): void {
        const card = entity.card;

        // update main table
        this.db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(card.title, card.website, card.username, card.cardId);
        // update full text search table
        this.db.prepare('UPDATE cards_fts SET title = ?, website = ?, username = ?, tags = ? WHERE cardId = ?')
            .run(card.title, card.website, card.username, card.cardId, card.tags.join(','));
    }

    /**
     * This function transforms the Card object into a string that can be used by SQLite Full Text Search
     *
     * @param card The JS object we will iterate on
     * @return A string satisfying the specifications of the Full-Text-Search "MATCH" keyword provided by SQLite
     * @example (title: "1975 Ford Thunderbird 2D") AND (tags: "car antique v8 70s")
     * @private
     */
    private prepareFTSMatchStatement(card: CardRequest): string {
        let matchFTS = '';
        for (const [key, value] of Object.entries(card)) {
            if (typeof value === 'string' && value !== '') {
                matchFTS += ' AND (' + key + ' : ' + value + ')';
            } else if (Array.isArray(value) && value.length !== 0) {
                matchFTS += ' AND (' + key + ' : ' + value.join(' ') + ')';
            }
        }
        matchFTS = matchFTS.slice(5);

        console.log(matchFTS, "FTS match query");

        return matchFTS;
    }
}
