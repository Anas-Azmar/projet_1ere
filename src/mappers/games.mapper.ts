import { EGameStatus, Game, GameDBO, GameDTO, GameShortDTO, NewGame, NewGameDTO } from "../models/game.model";




export class GamesMapper{
    public static toDTO(dto : Game): GameDTO {
        return {
            id: dto.id,
            status: dto.status,
            name: dto.name,
            fieldId: dto.fieldId,
            refereeId: dto.refereeId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
            homeScore: dto.homeScore,
            awayScore: dto.awayScore,
            scheduledDate: dto.scheduledDate ? dto.scheduledDate.toISOString() : undefined,
            createdAt: dto.createdAt.toISOString(),
            updatedAt: dto.updatedAt.toISOString(),
        }
    }

    public static toDBO(dbo: Game): GameDBO {
        return {
            id: dbo.id,
            status: dbo.status,
            name: dbo.name,
            field_id: dbo.fieldId,
            referee_id: dbo.refereeId,
            home_team_id: dbo.homeTeamId,
            away_team_id: dbo.awayTeamId,
            home_score: dbo.homeScore,
            away_score: dbo.awayScore,
            scheduled_date: dbo.scheduledDate ? dbo.scheduledDate.toISOString() : undefined,
            created_at: dbo.createdAt.toISOString(),
            updated_at: dbo.updatedAt.toISOString(),
            deleted_at: dbo.deletedAt ? dbo.deletedAt.toISOString() : undefined
        }
    }

    public static toShortDTO(dto: Game): GameShortDTO {
        return {
            id: dto.id,
            status: dto.status,
            name: dto.name,
            fieldId: dto.fieldId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
            scheduledDate: dto.scheduledDate ? dto.scheduledDate.toISOString() : undefined,
        }
    }

    public static fromNewDTO(dto: NewGameDTO): NewGame {
        return {
            name: dto.name,
            fieldId: dto.fieldId,
            refereeId: dto.refereeId,
            homeTeamId: dto.homeTeamId,
            awayTeamId: dto.awayTeamId,
            scheduledDate: dto.scheduledDate,
        }
    }

    public static fromDBO(dbo: GameDBO): Game {
        return {
            id: dbo.id,
            status: dbo.status,
            name: dbo.name,
            fieldId: dbo.field_id,
            refereeId: dbo.referee_id,
            homeTeamId: dbo.home_team_id,
            awayTeamId: dbo.away_team_id,
            homeScore: dbo.home_score,
            awayScore: dbo.away_score,
            scheduledDate: dbo.scheduled_date ? new Date(dbo.scheduled_date) : undefined,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at),
            deletedAt: dbo.deleted_at ? new Date(dbo.deleted_at) : undefined,
        }
    }

    public static fromDTO(domain: GameDTO): Game {
        return {
            id: domain.id,
            status: domain.status,
            name: domain.name,
            fieldId: domain.fieldId,
            refereeId: domain.refereeId,
            homeTeamId: domain.homeTeamId,
            awayTeamId: domain.awayTeamId,
            homeScore: domain.homeScore,
            awayScore: domain.awayScore,
            scheduledDate: domain.scheduledDate ? new Date(domain.scheduledDate) : undefined,
            createdAt: domain.createdAt ? new Date(domain.createdAt) : new Date(),
            updatedAt: domain.updatedAt ? new Date(domain.updatedAt) : new Date(),
        }
    }
}