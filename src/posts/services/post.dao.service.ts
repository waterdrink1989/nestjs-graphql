import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePostDto } from "../dto/createPost.dto";
import { convertDate, createErrorStatus, getDateRange, parseRange, parseSort } from "../../utils";
import HTTPStatus from "http-status";
import { ERROR_KEYS } from "../../global";
import { KeyId } from "../../shared";
import { UpdatePostDto } from "../dto/updatePost.dto";
import { AutoIdService } from "../../autoids/autoId.service";
import { IPost } from "../schemas/post.interface";

export class PostDaoService {
    constructor(
        @InjectModel("Post") private readonly postModel: Model<IPost>,
        private readonly autoIdService: AutoIdService
    ) {}

    async createPost(createPostDto: CreatePostDto): Promise<IPost> {
        const id = await this.autoIdService.getNextSequence(KeyId.POST_ID);
        const ver = await this.autoIdService.getNextVer(KeyId.POST_ID);
        if (!id) throw createErrorStatus(HTTPStatus.BAD_REQUEST, ERROR_KEYS.DAO_BAD_REQUEST);

        const postPayload = {
            ...createPostDto,
            id,
            ver,
        };
        const createdPost = new this.postModel(postPayload);
        return createdPost.save();
    }

    async findAllPost(): Promise<IPost[]> {
        return this.postModel.find().populate("user").exec();
    }

    async findOnePost(id: string): Promise<IPost | null> {
        return this.postModel.findById(id).populate("user").exec();
    }

    async insertManyPost(data: CreatePostDto[]): Promise<IPost[]> {
        if (!Array.isArray(data))
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.DAO_BAD_REQUEST);

        const count = data.length;
        const startId = await this.autoIdService.getNextSequenceBatch(KeyId.POST_ID, count);
        const startVer = await this.autoIdService.getNextVerBatch(KeyId.POST_ID, count);

        const postsWithIds = data.map((post, idx) => ({
            ...post,
            id: startId + idx,
            ver: startVer + idx,
        }));

        try {
            return await this.postModel.insertMany(postsWithIds);
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.UNPROCESSABLE_ENTITY,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    async updateOnePost(id: number, data: UpdatePostDto): Promise<IPost | null> {
        if (!id) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        const postModel = await this.postModel.findOne({ id });
        if (!postModel) {
            throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);
        }

        // Clean up forbidden fields
        const updateData = { ...data };

        // Apply updates
        Object.entries(updateData).forEach(([key, value]) => {
            postModel.set(key, value);
        });

        // Set new version
        const ver = await this.autoIdService.getNextVer(KeyId.POST_ID);
        postModel.set("ver", ver);

        // Save updated user
        try {
            return await postModel.save();
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateManyPost(filter: { ids: number[] | string }, data: UpdatePostDto): Promise<any> {
        // Validate input
        if (!filter?.ids || !Array.isArray(filter.ids) || filter.ids.length === 0) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        // Prepare update data
        const updateData: UpdatePostDto & { ver: number } = {
            ...data,
            ver: await this.autoIdService.getNextVer(KeyId.POST_ID),
        };

        try {
            // Perform bulk update
            const result = await this.postModel.updateMany(
                { id: { $in: filter.ids } },
                { $set: updateData }
            );

            return { ...result, list: filter.ids };
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    async deleteOnePost(id: number): Promise<IPost | null> {
        if (!id) throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);

        const result = await this.postModel.findOneAndDelete({ id });
        if (!result) throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async deleteManyPost(filter: { ids: number[] }): Promise<any> {
        if (!filter?.ids || !Array.isArray(filter.ids)) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        try {
            const result = await this.postModel.deleteMany({ id: { $in: filter.ids } });
            return { ...result, list: filter.ids };
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    async retrieveOnePost(id: number): Promise<IPost | null> {
        if (!id) throw createErrorStatus(HTTPStatus.BAD_REQUEST, ERROR_KEYS.DAO_BAD_REQUEST);

        const result = await this.postModel.findOne({ id }).lean();
        if (!result) throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async retrieveManyPost(
        filter: Record<string, unknown> = {},
        sort?: string | [string, string],
        range?: string | [number, number]
    ): Promise<{
        list: IPost[];
        count: number;
        start: number;
        end: number;
        limit: number;
        sort: Record<string, 1 | -1>;
        model: string;
    }> {
        const sortField = parseSort(sort); // should return something like { name: 1 }
        const { start, limit } = parseRange(range); // should return pagination info

        const filterObj: Record<string, unknown> = { ...filter };

        // Convert date ranges
        convertDate(filterObj, "from", "to", "createdAt");
        convertDate(filterObj, "ufrom", "uto", "updatedAt");

        // Handle date range strings (fallback logic)
        if (typeof filterObj.createdAt === "string") {
            filterObj.createdAt = getDateRange(filterObj.createdAt);
        }

        if (typeof filterObj.updatedAt === "string") {
            filterObj.updatedAt = getDateRange(filterObj.updatedAt);
        }

        // Handle full-text search
        if (typeof filterObj.q === "string" && filterObj.q.trim()) {
            filterObj.name = { $regex: new RegExp(filterObj.q, "i") };
            delete filterObj.q;
        } else if (typeof filterObj.name === "string" && filterObj.name.trim()) {
            filterObj.name = { $regex: new RegExp(filterObj.name, "i") };
        }

        try {
            const count = await this.postModel.countDocuments(filterObj);
            const list = await this.postModel
                .find(filterObj)
                .sort(sortField)
                .skip(start)
                .limit(limit);

            return {
                list,
                count,
                start,
                end: start + list.length,
                limit,
                sort: sortField,
                model: this.postModel.modelName,
            };
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }
}
