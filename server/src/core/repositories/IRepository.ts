export interface IRepository<T, K> {
    create(entity: T): K;

    readAll(entity: T): K;

    read(entity: T): K;

    update(entity: T): void;

    delete(entity: T): void;
}
