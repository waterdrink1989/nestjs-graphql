import { Schema, Document } from "mongoose";
import { COLLECTION_NAMES } from "../../shared";

export interface AutoId extends Document {
    id: string;
    seq: number;
    ver: number;
}

export const AutoIdSchema = new Schema<AutoId>(
    {
        id: { type: String, required: true, unique: true },
        seq: { type: Number, default: 0 },
        ver: { type: Number, default: 0 },
    },
    { collection: COLLECTION_NAMES.AUTO_ID_NAME, versionKey: false }
);
