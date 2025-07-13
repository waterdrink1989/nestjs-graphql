// types/base.interface.ts
import { Document } from "mongoose";

export interface IBaseFields<TId = number> extends Document<TId> {
    id: TId;
    createdAt: Date;
    updatedAt: Date;
    options?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    ver: number;
}
