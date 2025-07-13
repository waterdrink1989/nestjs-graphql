import { IBaseFields } from "../../shared";
import { IPost } from "../../posts/schemas/post.interface";

export interface IUser extends IBaseFields {
    name: string;
    email: string;
    password: string;
    posts: IPost[]; // One-to-many relationship: One user has many posts
}
