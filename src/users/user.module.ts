import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./schemas/user.schema";
import { RestUserController } from "./controllers/rest.user.controller";
import { UserDaoService } from "./services/user.dao.service";
import { AutoIdModule } from "../autoids/autoId.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: "User", schema: UserSchema }]), AutoIdModule],
    controllers: [RestUserController],
    providers: [UserDaoService],
    exports: [UserDaoService],
})
export class UserModule {}
