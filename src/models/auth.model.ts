import { Request } from "express";
import { ERole, UserDTO } from "./user.model";


export interface AuthentificatedRequest extends Request {
    user ?: UserDTO
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

