import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdatePostDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    content?: string;
}
