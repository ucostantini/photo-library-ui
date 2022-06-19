import { Pagination } from "../core/models/card";

export class DataUtils {

  static pagination(page: Pagination): { offset: number; limit: number } {
    const offset = page.pageIndex * page.pageSize;
    return {offset: offset, limit: page.pageSize};
  }
}
