import { GameDBO, GameDTO, GameShortDTO } from "../models/game.model";




export class GamesMapper{
    public static toDTO(dto : GameDBO): GameDTO {
        return {
            id: dto.id,
            status: dto.status,
            name: dto.name,
            fieldId: dto.field_id,
            refereeId: dto.referee_id,
            homeTeamId: dto.home_team_id,
            awayTeamId: dto.away_team_id,
            homeScore: dto.home_score,
            awayScore: dto.away_score,
            scheduledDate: dto.scheduled_date,
            createdAt: dto.created_at,
            updatedAt: dto.updated_at,
        }
    }

    public static toDBO(dbo: GameDTO): GameDBO {
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
            scheduled_date: dbo.scheduledDate,
            created_at: dbo.createdAt as string,
            updated_at: dbo.updatedAt as string,
        }
    }

    public static toShortDTO(dto: GameDBO): GameShortDTO {
        return {
            id: dto.id,
            status: dto.status,
            name: dto.name,
            fieldId: dto.field_id,
            homeTeamId: dto.home_team_id,
            awayTeamId: dto.away_team_id,
            scheduledDate: dto.scheduled_date,
        }
    } 
}