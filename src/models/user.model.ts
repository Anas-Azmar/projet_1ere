import { BasicModelDBO, BasicModelDTO } from "./basicModel";


export enum ERole {
    ADMIN = "admin",
    PLAYER = "player",
    REFEREE = "referee",
    TRAINER = "trainer"
}


export enum EUserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

export interface UserShortDTO {
    id: number,
    firstName : string,
    lastName: string
}

//NOT currently used, but jept for documentation purpose
export interface UserFullDTO extends BasicModelDTO {
    firstName: string,
    lastName : string,
    email: string,
    username: string,
    role : ERole,
    status: EUserStatus,
}

export interface UserDTO extends BasicModelDTO {
    firstName: string,
    lastName : string,
    email: string,
    username: string,
    role : ERole,
    status: EUserStatus,
}

export interface UserDBO extends BasicModelDBO {
    email: string,
    first_name : string,
    last_name : string,
    username: string,
    password: string,
    role: ERole,
    status: EUserStatus,
}

export interface NewUserDTO {
    firstName : string,
    lastName : string,
    email: string,
    username: string,
    password: string
}