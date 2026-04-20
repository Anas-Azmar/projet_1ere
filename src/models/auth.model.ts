import { Request } from "express";
import { ERole, User, UserDTO } from "./user.model";


export interface AuthentificatedRequest extends Request {
    user ?: User
}

export interface UserLoginDTO {
    username : string,
    password : string,
}

export interface AuthentificatedUserDTO {
    username : string,
    token : string,
    role : ERole;
}

