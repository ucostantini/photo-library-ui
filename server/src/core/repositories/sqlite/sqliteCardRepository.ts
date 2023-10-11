import { ICardRepository } from "../ICardRepository";
import { Card, CardRequest, CardForm, CardResult, Order, Sort } from "../../../types/card";
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

    async create(entity: CardRequest): Promise<CardResult> {
        const card: CardForm = entity.card;
        // insert data related to card
        Object.assign(card, this.db.prepare('INSERT INTO cards(title,website,author) VALUES(?,?,?) RETURNING ROWID')
            .get(card.title, card.website, card.author));
        card.filesContent = this.db.prepare(
            `SELECT fileContent
            FROM files
            WHERE fileId IN (${"?,".repeat(card.files.length).slice(0, -1)})`
        ).all(card.files);
        // populate full text search table
        this.fts.create(entity.card);

        // link card with its files
        let statement: Statement = this.db.prepare('UPDATE files SET cardId = ? WHERE fileId = ?');
        entity.card.files.forEach(fileId => statement.run(entity.card.id, fileId));

        return {cards: [], count: 0};
    }

    delete(entity: CardRequest): void {
        const id: number = entity.card.id;
        // delete from main table
        this.db.prepare('DELETE FROM cards WHERE id = ?').run(id);
        this.fts.delete(entity.card);
    }

    async read(entity: CardRequest): Promise<CardResult> {
        const pagination = entity.pagination;
        const matchingCardIds: number[] = await this.fts.read(entity.card);
        console.log(`Matching card Ids from FTS are : ${matchingCardIds}`)

        const cards: Card[] = this.db.prepare(
            `SELECT DISTINCT *
            FROM cards_view
            WHERE id IN (${"?,".repeat(matchingCardIds.length).slice(0, -1)})
            ORDER BY ${Sort[pagination._sort]} ${Order[pagination._order]}
            LIMIT ? OFFSET ?`
        ).all([...matchingCardIds, pagination._limit, pagination._page]);

        return {cards: cards, count: matchingCardIds.length};
    }

    async readAll(entity: CardRequest): Promise<CardResult> {
        const pagination = entity.pagination;

        const cards: Card[] = this.db.prepare(
            `SELECT *
            FROM cards_view
            ORDER BY ${Sort[pagination._sort]} ${Order[pagination._order]}
            LIMIT ? OFFSET ?`
        ).all(pagination._limit, pagination._page);

        const count: number = this.db.prepare('SELECT COUNT(id) AS count FROM cards').get().count;

        return {cards: cards, count: count};
    }

    update(entity: CardRequest): void {
        const card = entity.card;

        // update main table
        this.db.prepare('UPDATE cards SET title = ?, website = ?, author = ? WHERE id = ?')
            .run(card.title, card.website, card.author, card.id);
        // update full text search table
        this.fts.update(entity.card);
    }
}
