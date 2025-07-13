import { IsMongoId, IsString } from "class-validator";

export class CreatePostDto {
    @IsString()
    title!: string;

    @IsString()
    content!: string;

    @IsMongoId()
    userId!: string;
}
