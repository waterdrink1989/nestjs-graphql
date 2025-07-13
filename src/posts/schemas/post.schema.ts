import { Schema, SchemaDefinition } from "mongoose";
import { baseFields, COLLECTION_NAMES } from "../../shared";
import { IPost } from "./post.interface";

// 1. Schema fields definition
const postFields: SchemaDefinition = {
    ...baseFields,
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
};

export const PostSchema = new Schema<IPost>(postFields, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    collection: COLLECTION_NAMES.POST_NAME,
});

// 5. Post-save middleware to ensure id is required after assignment
PostSchema.post("save", function (doc: IPost) {
    if (!doc.id) {
        throw new Error("ID must be assigned during save");
    }
});
