import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basicModel";
import { UserShortDTO } from "./user.model";


export enum ESportType {
    FOOTBALL = "football",
    BASKETBALL = "basketball",
    TENNIS = "tennis",
    VOLLEYBALL = "volleyball",
    HANDBALL = "handball"
}

export interface Team extends BasicModel {
    name : string,
    description: string,
    sportType: ESportType,
    players: number[],
    trainerId?: number,
}


export interface TeamShortDTO{
    id: number,
    name : string,
    sportType : ESportType;
}

export interface TeamDTO extends BasicModelDTO {
    name : string,
    description: string,
    sportType: ESportType,
    players: number[],
    trainerId?: number,
}

export interface TeamFullDTO extends BasicModelDTO {
    name : string,
    description: string,
    sportType: ESportType,
    players: UserShortDTO[],
    trainer: UserShortDTO,
}

export interface NewTeamDTO {
    name: string,
    description?: string,
    sportType: ESportType,
}

export interface NewTeam {
    name: string,
    description?: string,
    sportType: ESportType,
}


export interface TeamDBO extends BasicModelDBO {
    name: string,
    description: string,
    sport_type: ESportType,
    players: number[],
    trainer_id?: number,
}

