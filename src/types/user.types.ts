import { UserRole } from "../lib/authUtilis";

export interface UserInfo {
    id : string;
    name : string,
    email : string,
    role : UserRole
}