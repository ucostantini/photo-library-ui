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

export interface Card {
  cardId?: number;
  title: string;
  files: number[];
  tags: string;
  source: Source;
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
