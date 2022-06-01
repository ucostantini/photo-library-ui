interface Author {
  id: number;
}

export interface Tag {
  tagId: number;
  name: string;
}

export interface Source {
  sourceId?: number;
  userName: string;
  website: string;
  author?: Author;
}

export interface Card {
  cardId?: number;
  title: string;
  files: number[];
  source: Source;
  tags: Tag[];
  timeStamp?: Date;
}

export interface Paginate {
  pageIndex: number;
  pageSize: number;
  length: number;
}

export interface Sorting {
  sort: 'cardId' | 'title';
  order: 'asc' | 'desc';
}
