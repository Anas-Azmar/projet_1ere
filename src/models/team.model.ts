import { BasicModelDBO, BasicModelDTO } from "./basicModel";
import { UserShortDTO } from "./user.model";


export enum ESportType {
    FOOTBALL = "football",
    BASKETBALL = "basketball",
    TENNIS = "tennis",
    VOLLEYBALL = "volleyball",
    HANDBALL = "handball"
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
    trainerId: number | null,
}

export interface TeamFullDTO extends BasicModelDTO {
    name : string,
    description: string,
    sportType: ESportType,
    players: number[],
    trainer: UserShortDTO,
}

export interface NewTeamDTO {
    name: string,
    description?: string,
    sportType: ESportType,
}

export interface TeamDBO extends BasicModelDBO {
    name: string,
    description: string,
    sport_type: ESportType,
    players: number[],
    trainer_id: number | null,
}

