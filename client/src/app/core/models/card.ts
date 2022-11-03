/**
 * Represents card's attached files
 */
export interface CardFile {
  fileId: number;
  fileName?: string;
}

/**
 * Information of a card
 */
export interface Card {
  cardId?: number;
  title: string;
  files: CardFile[];
  tags: string[];
  website: string;
  username: string;
  created?: Date;
  modified?: Date;
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
  pageLength?: number;
}

/**
 * Used to transmit data between {@link NavMenuComponent} and {@link CardListComponent} in a single batch
 */
export interface CardResult {
  cards: Card[],
  pagination: Pagination
}

export interface Message {
  message: string;
}

/**
 * Sorting options of the app
 */
export interface Sorting {
  sort: 'created' | 'title' | 'rank';
  order: 'asc' | 'desc';
}

export type Status = 'Create' | 'Edit' | 'Search';
