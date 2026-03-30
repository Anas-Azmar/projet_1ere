import { BasicModelDBO, BasicModelDTO } from "./basicModel";
import { UserShortDTO } from "./user.model";


export enum EsportType {
    FOOTBALL = "football",
    BASKETBALL = "basketball",
    TENNIS = "tennis",
    VOLLEYBALL = "volleyball",
    HANDBALL = "handball"
}

export interface TeamShortDTO extends BasicModelDTO{
    name : string,
    sportType : EsportType;
}

export interface TeamDTO extends BasicModelDTO {
    name : string,
    description: string,
    sportType: EsportType,
    player: number[],
    trainerId: number | null,
}

export interface TeamFullDTO extends BasicModelDTO {
    name : string,
    description: string,
    sportType: EsportType,
    player: number[],
    trainer: UserShortDTO,
}

export interface NewTeamDTO extends BasicModelDTO {
    name: string,
    description?: string,
    sportType: EsportType,
}

export interface TeamDBO extends BasicModelDBO {
    name: string,
    description: string,
    sport_type: EsportType,
    players: number[],
    trainerId: number | null,
}

