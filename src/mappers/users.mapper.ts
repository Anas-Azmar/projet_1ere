import { ERole, EUserStatus, NewUserDTO, UserDBO, UserDTO, UserShortDTO } from "../models/user.model";




export class UsersMapper {
    public static toDTO(dto : UserDBO): UserDTO {
        return {
            id: dto.id,
            firstName: dto.first_name,
            lastName: dto.last_name,
            email: dto.email,
            username: dto.username,
            role: dto.role,
            status: dto.status,
            createdAt: dto.created_at,
            updatedAt: dto.updated_at,
        }
    }

    public static toDBO(dbo: UserDTO, hashedPassword: string): UserDBO{
        return {
            id: dbo.id,
            first_name: dbo.firstName,
            last_name: dbo.lastName,
            email: dbo.email,
            username: dbo.username,
            password: hashedPassword,
            role: dbo.role,
            status: dbo.status,
            created_at: dbo.createdAt as string,
            updated_at: dbo.updatedAt as string,
        }
    }

    public static fromNewDTO(newD: NewUserDTO, newId: number, newDate: string, hashedPassword: string): UserDBO {
        return {
            id: newId,
            first_name: newD.firstName,
            last_name: newD.lastName,
            email: newD.email,
            username: newD.username,
            password: hashedPassword,
            role: ERole.PLAYER,
            status: EUserStatus.ACTIVE,
            created_at: newDate,
            updated_at: newDate,
        }
    } 


    public static toShortDTO(short: UserDBO): UserShortDTO {
        return {
            id: short.id,
            firstName: short.first_name,
            lastName: short.last_name,
        }
    }
}