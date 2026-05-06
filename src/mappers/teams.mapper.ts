import { NewTeam, NewTeamDTO, Team, TeamDBO, TeamDTO, TeamFullDTO, TeamShortDTO } from "../models/team.model";
import { User, UserShortDTO } from "../models/user.model";
import { UsersMapper } from "./users.mapper";

export class TeamsMapper {
    // Convert domain Team to complete DTO
    public static toDTO(domain: Team): TeamDTO {
        return {
            id: domain.id,
            name: domain.name,
            description: domain.description,
            sportType: domain.sportType,
            players: domain.players,
            trainerId: domain.trainerId,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    // Convert domain Team to DBO for database storage
    public static toDBO(domain: Team): TeamDBO {
        return {
            id: domain.id,
            name: domain.name,
            description: domain.description,
            sport_type: domain.sportType,
            players: domain.players,
            trainer_id: domain.trainerId,
            created_at: domain.createdAt.toISOString(),
            updated_at: domain.updatedAt.toISOString(),
            deleted_at: domain.deletedAt ? domain.deletedAt.toISOString() : undefined,
        }
    }

    // Convert DBO from database to domain Team
    public static fromDBO(dbo: TeamDBO): Team {
        return {
            id: dbo.id,
            name: dbo.name,
            description: dbo.description,
            sportType: dbo.sport_type,
            players: dbo.players,
            trainerId: dbo.trainer_id,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at),
            deletedAt: dbo.deleted_at ? new Date(dbo.deleted_at) : undefined,
        }
    }

    // Convert new team request data to domain model
    public static fromNewDTO(dto: NewTeamDTO): NewTeam {
        return {
            name: dto.name,
            description: dto.description,
            sportType: dto.sportType,
        }
    }

    // Convert domain Team to short DTO (only id, name, sportType)
    public static toShortDTO(domain: Team): TeamShortDTO {
        return {
            id: domain.id,
            name: domain.name,
            sportType: domain.sportType,
        }
    }

    // Convert domain Team to full DTO (includes trainer and players details)
    public static toFullDTO(domain: Team, trainer: UserShortDTO, players: UserShortDTO[]): TeamFullDTO {
        return {
            id: domain.id,
            name: domain.name,
            description: domain.description,
            sportType: domain.sportType,
            trainer: trainer,
            players: players,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    // Convert DTO request data to domain Team
    public static fromDTO(domain: TeamDTO): Team {
        return {
            id: domain.id,
            name : domain.name,
            description: domain.description,
            sportType: domain.sportType,
            players: domain.players,
            trainerId: domain.trainerId,
            createdAt: domain.createdAt ? new Date(domain.createdAt) : new Date(),
            updatedAt: domain.updatedAt ? new Date(domain.updatedAt) : new Date(),
        }
    }

}