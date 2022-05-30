import { Paginate } from "../core/models/card";
import * as ExifReader from 'exifreader';
import { IccTags, Tags, XmpTags } from 'exifreader';

export class DataUtils {

  static pagination(page: Paginate): { offset: number; limit: number } {
    const offset = page.pageIndex * page.pageSize;
    return {offset: offset, limit: page.pageSize};
  }

  /*
  TODO extract EXIF metadata from files
  each time image is dropped, show "upload" bar corresponding to extraction of metadata
  once metadata has been extracted for each file, mark input as being valid, OK to upload

  */
  static async metadata(images: File[]): Promise<(Tags & XmpTags & IccTags)[]> {
    return (await Promise.all(images.map(image => image.arrayBuffer()))).map(image => ExifReader.load(image));
  }
}
