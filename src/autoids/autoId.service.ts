import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IAutoId } from "../shared/interfaces/auto-id.interface";

@Injectable()
export class AutoIdService {
    constructor(
        @InjectModel("AutoId")
        private readonly autoIdModel: Model<IAutoId>
    ) {}

    private async incrementField(keyId: string, field: "seq" | "ver", count = 1): Promise<number> {
        const result = await this.autoIdModel
            .findOneAndUpdate(
                { id: keyId },
                { $inc: { [field]: count } },
                { new: true, upsert: true }
            )
            .exec();

        if (!result) {
            throw new Error(`Failed to generate ${field} for ${keyId}`);
        }

        return count === 1 ? result[field] : result[field] - count + 1;
    }

    async getNextSequence(keyId: string): Promise<number> {
        return this.incrementField(keyId, "seq", 1);
    }

    async getNextVer(keyId: string): Promise<number> {
        return this.incrementField(keyId, "ver", 1);
    }

    async getNextSequenceBatch(keyId: string, count: number): Promise<number> {
        return this.incrementField(keyId, "seq", count);
    }

    async getNextVerBatch(keyId: string, count: number): Promise<number> {
        return this.incrementField(keyId, "ver", count);
    }
}
