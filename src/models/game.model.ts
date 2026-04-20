import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basicModel";


export enum EGameStatus {
    CREATED = "created",
    SCHEDULED = "scheduled",
    STARTED = "started",
    FINISHED = "finished",
    CANCELLED = "cancelled"
}

export interface GameShortDTO {
    id: number,
    status: EGameStatus,
    name: string,
    fieldId ?: number,
    homeTeamId: number,
    awayTeamId: number,
    scheduledDate?: string,
}

export interface GameDTO extends BasicModelDTO {
    status: EGameStatus,
    name : string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId: number,
    awayTeamId: number,
    homeScore?: number,
    awayScore?: number,
    scheduledDate?: string,
}

export interface NewGameDTO {
    name?: string,
    fieldId?: number,
    refereeId?: number,
    homeTeamId?: number,
    awayTeamId?: number,
    scheduledDate?: string,
}

export interface NewGame {
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
    field_id?: number,
    referee_id?: number,
    home_team_id: number,
    away_team_id: number,
    home_score?: number, 
    away_score?: number,
    scheduled_date?: string,
}

export interface Game extends BasicModel {
    status: EGameStatus;
    name: string;
    fieldId?: number;
    refereeId?: number;
    homeTeamId: number;
    awayTeamId: number;
    homeScore?: number; 
    awayScore?: number;
    scheduledDate?: Date;
}