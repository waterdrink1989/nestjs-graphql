import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AutoIdSchema } from "./schemas/autoId.schema";
import { AutoIdService } from "./autoId.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: "AutoId", schema: AutoIdSchema }])],
    providers: [AutoIdService],
    exports: [AutoIdService],
})
export class AutoIdModule {}
