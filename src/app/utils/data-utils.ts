import { Pagination } from "../core/models/card";

export class DataUtils {

  static pagination(page: Pagination): { offset: number; limit: number } {
    const offset = page.pageIndex * page.pageSize;
    return {offset: offset, limit: page.pageSize};
  }

  static params(object: object, prefix?: string): URLSearchParams {
    let params = new URLSearchParams();
    for (const key in object) {
      switch (typeof object[key]) {
        case "number":
          params.append(prefix ? prefix + key : key, object[key] as string);
          break;
        case "string":
          if (object[key] !== '') params.append(prefix ? prefix + key : key, object[key]);
          break;
        case "object":
          DataUtils.params(object[key], key + ".").forEach((v: string, k: string) => params.append(k, v));
          break;
        // considered as array
        default:
          if (object[key] && object[key] !== []) object[key].forEach((v: string, i: number) => params.append(key + `[${i}]`, v))
      }
    }
    return params;
  }
}
