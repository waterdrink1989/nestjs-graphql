import { Schema, SchemaDefinition } from "mongoose";
import { baseFields, COLLECTION_NAMES } from "../../shared";
import { IUser } from "./user.interface";

// 1. Schema fields definition
const userFields: SchemaDefinition = {
    ...baseFields,
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
};

export const UserSchema = new Schema<IUser>(userFields, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
    collection: COLLECTION_NAMES.USER_NAME,
});

// 5. Post-save middleware to ensure id is required after assignment
UserSchema.post("save", function (doc) {
    if (!doc.id) {
        throw new Error("ID must be assigned during save");
    }
});
