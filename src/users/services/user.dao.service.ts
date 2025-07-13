import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CreateUserDto } from "../dto/createUser.dto";
import { UpdateUserDto } from "../dto/updateUser.dto";
import { KeyId } from "../../shared";
import { convertDate, createErrorStatus, getDateRange, parseRange, parseSort } from "../../utils";
import HTTPStatus from "http-status";
import { ERROR_KEYS } from "../../global";
import { IUser } from "../schemas/user.interface";
import { AutoIdService } from "../../autoids/autoId.service";

@Injectable()
export class UserDaoService {
    constructor(
        @InjectModel("User") private readonly userModel: Model<IUser>,
        private readonly autoIdService: AutoIdService
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<IUser> {
        const id = await this.autoIdService.getNextSequence(KeyId.USER_ID);
        const ver = await this.autoIdService.getNextVer(KeyId.USER_ID);
        if (!id) throw createErrorStatus(HTTPStatus.BAD_REQUEST, ERROR_KEYS.DAO_BAD_REQUEST);

        const userPayload = {
            ...createUserDto,
            id,
            ver,
        };

        const createdUser = new this.userModel(userPayload);
        return createdUser.save();
    }

    async findAllUser(): Promise<IUser[]> {
        return this.userModel.find().populate("posts").exec();
    }

    async findOneUser(id: string): Promise<IUser | null> {
        return this.userModel.findById(id).populate("posts").exec();
    }

    async insertManyUser(data: CreateUserDto[]): Promise<IUser[]> {
        if (!Array.isArray(data))
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.DAO_BAD_REQUEST);

        const count = data.length;
        const startId = await this.autoIdService.getNextSequenceBatch(KeyId.USER_ID, count);
        const startVer = await this.autoIdService.getNextVerBatch(KeyId.USER_ID, count);

        const usersWithIds = data.map((user, idx) => ({
            ...user,
            id: startId + idx,
            ver: startVer + idx,
        }));

        try {
            return await this.userModel.insertMany(usersWithIds);
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.UNPROCESSABLE_ENTITY,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    async updateOneUser(id: number, data: UpdateUserDto): Promise<IUser | null> {
        if (!id) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        const userModel = await this.userModel.findOne({ id });
        if (!userModel) {
            throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);
        }

        // Clean up forbidden fields
        const updateData = { ...data };

        // Apply updates
        Object.entries(updateData).forEach(([key, value]) => {
            userModel.set(key, value);
        });

        // Set new version
        const ver = await this.autoIdService.getNextVer(KeyId.USER_ID);
        userModel.set("ver", ver);

        // Save updated user
        try {
            return await userModel.save();
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async updateManyUser(filter: { ids: number[] | string }, data: UpdateUserDto): Promise<any> {
        // Validate input
        if (!filter?.ids || !Array.isArray(filter.ids) || filter.ids.length === 0) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        // Prepare update data
        const updateData: UpdateUserDto & { ver: number } = {
            ...data,
            ver: await this.autoIdService.getNextVer(KeyId.USER_ID),
        };

        try {
            // Perform bulk update
            const result = await this.userModel.updateMany(
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

    async deleteOneUser(id: number): Promise<IUser | null> {
        if (!id) throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);

        const result = await this.userModel.findOneAndDelete({ id });
        if (!result) throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async deleteManyUser(filter: { ids: number[] }): Promise<any> {
        if (!filter?.ids || !Array.isArray(filter.ids)) {
            throw createErrorStatus(HTTPStatus.UNPROCESSABLE_ENTITY, ERROR_KEYS.INVALID_ID);
        }

        try {
            const result = await this.userModel.deleteMany({ id: { $in: filter.ids } });
            return { ...result, list: filter.ids };
        } catch (err) {
            throw createErrorStatus(
                HTTPStatus.INTERNAL_SERVER_ERROR,
                ERROR_KEYS.DAO_DB_OPERATION_ERROR,
                err
            );
        }
    }

    async retrieveOneUser(id: number): Promise<IUser | null> {
        if (!id) throw createErrorStatus(HTTPStatus.BAD_REQUEST, ERROR_KEYS.DAO_BAD_REQUEST);

        const result = await this.userModel.findOne({ id }).lean();
        if (!result) throw createErrorStatus(HTTPStatus.NOT_FOUND, ERROR_KEYS.DAO_NOT_FOUND);

        return result;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async retrieveManyUser(
        filter: Record<string, unknown> = {},
        sort?: string | [string, string],
        range?: string | [number, number]
    ): Promise<{
        list: IUser[];
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
            const count = await this.userModel.countDocuments(filterObj);
            const list = await this.userModel
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
                model: this.userModel.modelName,
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
