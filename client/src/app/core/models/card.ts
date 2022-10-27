export interface CardFile {
  fileId: number;
  fileName?: string;
}

export interface Card {
  cardId?: number;
  title: string;
  files: CardFile[];
  tags: string;
  website: string;
  username: string;
  created?: Date;
  modified?: Date;
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
  length?: number;
}

export interface CardResult {
  cards: Card[],
  pagination: Pagination
}

export interface Message {
  message: string;
}

export interface Sorting {
  sort: 'created' | 'title' | 'rank';
  order: 'asc' | 'desc';
}

export type Status = 'Create' | 'Edit' | 'Search';
