import { ICardRepository } from "../ICardRepository";
import { Card, CardForm, CardRequest, CardResult, Order, Sort } from "../../../types/card";
import Database, { Statement } from "better-sqlite3";
import { Logger } from "pino";
import { IFTSRepository } from "../IFTSRepository";

export class SqliteCardRepository implements ICardRepository {
    fts: IFTSRepository;
    private db: Database.Database;

    constructor(private log: Logger) {
        this.db = (process.env.LOG_LEVEL === 'debug'
            ? new Database(process.env.DB_PATH, {verbose: console.log})
            : new Database(process.env.DB_PATH));
    }

    setFTSRepository(repository: IFTSRepository): void {
        this.fts = repository;
    }

    async create(entity: CardForm): Promise<CardResult> {
        const card: CardRequest = entity.card;
        // insert data related to card
        Object.assign(card, this.db.prepare('INSERT INTO cards(title,website,username) VALUES(?,?,?) RETURNING ROWID')
            .get(card.title, card.website, card.username));
        card.filesContent = this.db.prepare(
            `SELECT fileContent
            FROM files
            WHERE fileId IN (${"?".repeat(card.files.length)})`
        ).all(card.files);
        // populate full text search table
        this.fts.create(entity.card);

        // link card with its files
        let statement: Statement = this.db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
        entity.card.files.forEach(fileId => statement.run(entity.card.cardId, fileId));

        return {cards: [], count: 0};
    }

    delete(entity: CardForm): void {
        const id: number = entity.card.cardId;
        // delete from main table
        this.db.prepare('DELETE FROM cards WHERE cardId = ?').run(id);
        this.fts.delete(entity.card);
    }

    async read(entity: CardForm): Promise<CardResult> {
        const pagination = entity.pagination;
        const matchingCardIds: number[] = await this.fts.read(entity.card);
        console.log(`Matching card Ids from FTS are : ${matchingCardIds}`)

        const cards: Card[] = this.db.prepare(
            `SELECT DISTINCT *
            FROM cards_view
            WHERE cardId IN (${"?".repeat(matchingCardIds.length)})
            ORDER BY ${Sort[pagination._sort]} ${Order[pagination._order]}
            LIMIT ? OFFSET ?`
        ).all([...matchingCardIds, pagination._limit, pagination._page]);

        return {cards: cards, count: matchingCardIds.length};
    }

    async readAll(entity: CardForm): Promise<CardResult> {
        const pagination = entity.pagination;

        const cards: Card[] = this.db.prepare(
            `SELECT *
            FROM cards_view
            ORDER BY ${Sort[pagination._sort]} ${Order[pagination._order]}
            LIMIT ? OFFSET ?`
        ).all(pagination._limit, pagination._page);

        const count: number = this.db.prepare('SELECT COUNT(cardId) AS count FROM cards').get().count;

        return {cards: cards, count: count};
    }

    update(entity: CardForm): void {
        const card = entity.card;

        // update main table
        this.db.prepare('UPDATE cards SET title = ?, website = ?, username = ? WHERE cardId = ?')
            .run(card.title, card.website, card.username, card.cardId);
        // update full text search table
        this.fts.update(entity.card);
    }
}
