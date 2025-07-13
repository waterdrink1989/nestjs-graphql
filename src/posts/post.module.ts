import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PostSchema } from "./schemas/post.schema";
import { UserSchema } from "../users/schemas/user.schema";
import { RestPostController } from "./controllers/rest.post.controller";
import { PostDaoService } from "./services/post.dao.service";
import { AutoIdModule } from "../autoids/autoId.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "Post", schema: PostSchema }]),
        MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
        AutoIdModule,
    ],
    controllers: [RestPostController],
    providers: [PostDaoService],
    exports: [PostDaoService],
})
export class PostModule {}
