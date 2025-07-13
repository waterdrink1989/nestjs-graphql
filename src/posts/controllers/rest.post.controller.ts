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
import { PostDaoService } from "../services/post.dao.service";
import { CreatePostDto } from "../dto/createPost.dto";
import { UpdatePostDto } from "../dto/updatePost.dto";

@Controller("/rest/posts")
export class RestPostController {
    constructor(private readonly postDaoService: PostDaoService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() dto: CreatePostDto) {
        return this.postDaoService.createPost(dto);
    }

    @Post("bulk")
    @HttpCode(HttpStatus.CREATED)
    async createOrInsertMany(@Body() body: CreatePostDto | CreatePostDto[]) {
        if (Array.isArray(body)) {
            return this.postDaoService.insertManyPost(body);
        }
        return this.postDaoService.createPost(body);
    }

    @Put(":id")
    async updateOne(@Param("id") id: string, @Body() dto: UpdatePostDto) {
        return this.postDaoService.updateOnePost(Number(id), dto);
    }

    @Put()
    async updateMany(@Query("filter") filterJson: string, @Body() dto: UpdatePostDto) {
        const filter =
            typeof filterJson === "string" && filterJson.length ? JSON.parse(filterJson) : {};
        return this.postDaoService.updateManyPost(filter, dto);
    }

    @Delete(":id")
    async deleteOne(@Param("id") id: string) {
        return this.postDaoService.deleteOnePost(Number(id));
    }

    @Delete()
    async deleteMany(@Query("filter") filterJson: string) {
        const filter =
            typeof filterJson === "string" && filterJson.length ? JSON.parse(filterJson) : {};
        return this.postDaoService.deleteManyPost(filter);
    }

    @Get(":id")
    async retrieveOne(@Param("id") id: string) {
        return this.postDaoService.retrieveOnePost(Number(id));
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

        const result = await this.postDaoService.retrieveManyPost(filter, sort, range);

        const contentRange = `${result.model} ${result.start}_${result.end}/${result.count}`;
        res?.header("Content-Range", contentRange);

        return result;
    }
}
