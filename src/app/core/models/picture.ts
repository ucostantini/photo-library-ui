interface Author {
  id: number;
}

export interface Tag {
  tagId: number;
  name: string;
}

export interface Source {
  sourceId?: number;
  userName?: string;
  website?: string;
  author?: Author;
}

export interface Picture {
  pictureId: number;
  path: string;
  source: Source;
  tags?: Tag[];
  timeStamp?: Date;
}

export interface Paginate {
  page: number,
  pageSize: number,
  pictureCount: number
}
