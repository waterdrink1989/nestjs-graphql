import { IBaseFields } from "../../shared";
import { IUser } from "../../users/schemas/user.interface";

export interface IPost extends IBaseFields {
    title: string;
    content: string;
    user: IUser; // A post belongs to a single user
}
