import { SchemaDefinition, SchemaTypes } from "mongoose";

export const baseFields: SchemaDefinition = {
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    options: {
        type: SchemaTypes.Mixed,
    },
    ver: {
        type: Number,
        default: 0,
    },
};
