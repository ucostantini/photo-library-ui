interface Author {
    id: number;
}

export interface Tag {
    tagId: number;
    name: string;
}

export interface Source {
    sourceId?: number;
    username: string;
    website: string;
    author?: Author;
}

interface CardFile {
    fileId: number;
    fileName?: string;
}

export interface Card {
    cardId?: number;
    title?: string;
    files?: CardFile[];
    tags?: string;
    website?: string;
    username?: string;
    created?: Date;
    modified?: Date;
}

export interface Pagination {
    _page: string;
    _limit: string;
    _sort: 'cardId' | 'title';
    _order: 'asc' | 'desc';
}

export interface Sorting {
    sort: 'cardId' | 'title';
    order: 'asc' | 'desc';
}

export interface Image {
    fileId: number;
    file: string;
}
