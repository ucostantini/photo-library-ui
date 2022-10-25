import { IAlbum } from "ngx-lightbox";
import { Image } from "angular-responsive-carousel";

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

export interface Sorting {
  sort: 'cardId' | 'title' | 'rank';
  order: 'asc' | 'desc';
}

export interface Photo extends IAlbum, Image {
}

export type Status = "Create" | "Edit" | "Search";
