import { BasicModelDBO, BasicModelDTO } from "./basicModel";


export enum EGameStatus {
    CREATED = "created",
    SCHEDULED = "scheduled",
    STARTED = "started",
    FINISHED = "finished",
    CANCELLED = "cancelled"
}

export interface GameShortDTO extends BasicModelDTO {
    status: EGameStatus,
    name: string,
    fieldId : number | null,
    homeTeamId: number,
    awayTeamId: number,
    scheduledDate: string | null
}

export interface GameDTO extends BasicModelDTO {
    status: EGameStatus,
    name : string,
    fieldId: number | null,
    refereeId: number | null,
    homeTeamId: number,
    awayTeamId: number,
    homeScore: number | null,
    awayScore: number | null,
    scheduledDate: string | null,
}

export interface NewGameDTO {
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    scheduledDate?: string,
}

export interface GameDBO extends BasicModelDBO {
    status: EGameStatus,
    name: string,
    field_id: number | null,
    referee_id: number | null,
    home_team_id: number,
    away_team_id: number,
    home_score: number | null, 
    away_score: number | null,
    scheduled_date: string | null,
}