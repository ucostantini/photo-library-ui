import { TagResult } from "../../types/card";
import { ITagRepository } from "../repositories/ITagRepository";

/**
 * Controller of CRUD operations related to tags
 */
export class TagController {

    constructor(private tagRepository: ITagRepository) {
    }

    public async get(): Promise<TagResult> {
        return this.tagRepository.readAll(null);
    }
}
