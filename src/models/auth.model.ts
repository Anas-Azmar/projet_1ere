import { ERole } from "./user.model";



export interface UserLoginDTO {
    username : string,
    password : string,
}

export interface AuthentificatedUserDTO {
    username : string,
    token : string,
    role : ERole;
}