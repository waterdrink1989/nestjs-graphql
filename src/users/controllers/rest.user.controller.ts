// src/controllers/case-data.controller.ts
import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
} from "@nestjs/common";
import { Response } from "express";
import { UserDaoService } from "../services/user.dao.service";
import { CreateUserDto } from "../dto/createUser.dto";
import { UpdateUserDto } from "../dto/updateUser.dto";

@Controller("/rest/users")
export class RestUserController {
    constructor(private readonly userDaoService: UserDaoService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreateUserDto) {
        return this.userDaoService.createUser(dto);
    }

    @Post("bulk")
    @HttpCode(HttpStatus.CREATED)
    async createOrInsertMany(@Body() body: CreateUserDto | CreateUserDto[]) {
        if (Array.isArray(body)) {
            return this.userDaoService.insertManyUser(body);
        }
        return this.userDaoService.createUser(body);
    }

    @Put(":id")
    async updateOne(@Param("id") id: string, @Body() dto: UpdateUserDto) {
        return this.userDaoService.updateOneUser(Number(id), dto);
    }

    @Put()
    async updateMany(@Query("filter") filterJson: string, @Body() dto: UpdateUserDto) {
        const filter =
            typeof filterJson === "string" && filterJson.length ? JSON.parse(filterJson) : {};
        return this.userDaoService.updateManyUser(filter, dto);
    }

    @Delete(":id")
    async deleteOne(@Param("id") id: string) {
        return this.userDaoService.deleteOneUser(Number(id));
    }

    @Delete()
    async deleteMany(@Query("filter") filterJson: string) {
        const filter =
            typeof filterJson === "string" && filterJson.length ? JSON.parse(filterJson) : {};
        return this.userDaoService.deleteManyUser(filter);
    }

    @Get(":id")
    async retrieveOne(@Param("id") id: string) {
        return this.userDaoService.retrieveOneUser(Number(id));
    }

    @Get()
    @Header("Access-Control-Expose-Headers", "Content-Range")
    async retrieveMany(
        @Query("filter") filterJson?: string,
        @Query("sort") sortJson?: string,
        @Query("range") rangeJson?: string,
        @Res({ passthrough: true }) res?: Response
    ) {
        const filter = filterJson ? JSON.parse(filterJson) : {};
        const sort = sortJson ? JSON.parse(sortJson) : undefined;
        const range = rangeJson ? JSON.parse(rangeJson) : undefined;

        const result = await this.userDaoService.retrieveManyUser(filter, sort, range);

        const contentRange = `${result.model} ${result.start}_${result.end}/${result.count}`;
        res?.header("Content-Range", contentRange);

        return result;
    }
}
