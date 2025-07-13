"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    posts: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Post" }],
});
//# sourceMappingURL=user.schema.js.map