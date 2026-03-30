import { NewTeamDTO, TeamDBO, TeamDTO, TeamShortDTO } from "../models/team.model";



export class TeamsMapper {
    //DBO => DTO
    public static toDTO(dto: TeamDBO): TeamDTO {
        return {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            sportType: dto.sport_type,
            players: dto.players,
            trainerId: dto.trainer_id,
            createdAt: dto.created_at,
            updatedAt: dto.updated_at,
        }
    }
    //DTO => DBO
    public static toDBO(dbo: TeamDTO): TeamDBO {
        return {
            id: dbo.id,
            name: dbo.name,
            description: dbo.description,
            sport_type: dbo.sportType,
            players: dbo.players,
            trainer_id: dbo.trainerId,
            created_at: dbo.createdAt as string,
            updated_at: dbo.updatedAt as string,
        }
    }

    public static fromNewDTO(newDTO : NewTeamDTO, newId : number, trainerId : number, date : string): TeamDBO {
        return {
            id: newId,
            name: newDTO.name,
            description: newDTO.description as string,
            sport_type: newDTO.sportType,
            players : [],
            trainer_id: trainerId,
            created_at: date,
            updated_at: date,
        }
    }

    public static toShortDTO(sdbo: TeamDBO): TeamShortDTO{
        return {
            id: sdbo.id,
            name: sdbo.sport_type,
            sportType: sdbo.sport_type,
        }
    }
}