import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./users/user.module";
import { PostModule } from "./posts/post.module";

import mongoose from "mongoose";
import { Config } from "./config";
import { AutoIdModule } from "./autoids/autoId.module";

@Module({
    imports: [
        MongooseModule.forRootAsync({
            useFactory: async () => {
                const uri = Config.serviceConfig.mongoURL;

                try {
                    const connection = await mongoose.connect(uri);
                    console.log(`✅ MongoDB Connected: ${uri}`);
                    return {
                        uri,
                        connectionFactory: () => connection.connection,
                    };
                } catch (err) {
                    console.error("❌ MongoDB Connection Failed:", uri, err);
                    process.exit(1);
                }
            },
        }),
        UserModule,
        PostModule,
        AutoIdModule,
    ],
})
export class AppModule {}
