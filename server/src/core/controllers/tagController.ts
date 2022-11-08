import { TagResult } from "../../types/card";
import { ITagRepository } from "../repositories/ITagRepository";

/**
 * Controller of CRUD operations related to tags
 */
export class TagController {

    constructor(private tagRepository: ITagRepository) {
    }

    public get(): Promise<TagResult> {
        return new Promise<TagResult>((resolve, reject) => {
            try {
                resolve(this.tagRepository.readAll(null));
            } catch (error) {
                reject(error);
            }
        });
    }
}
