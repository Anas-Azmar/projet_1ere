import { NewUser, NewUserDTO, UpdateUser, User, UserDBO, UserDTO, UserShortDTO } from "../models/user.model";

export class UsersMapper {
    public static toDTO(domain: User): UserDTO {
        return {
            id: domain.id,
            firstName: domain.firstName,
            lastName: domain.lastName,
            email: domain.email,
            username: domain.username,
            role: domain.role,
            status: domain.status,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    public static toDBO(domain: User): UserDBO {
        return {
            id: domain.id,
            first_name: domain.firstName,
            last_name: domain.lastName,
            email: domain.email,
            username: domain.username,
            password: domain.password,
            role: domain.role,
            status: domain.status,
            created_at: domain.createdAt.toISOString(),
            updated_at: domain.updatedAt.toISOString(),
            deleted_at: domain.deletedAt ? domain.deletedAt.toISOString() : undefined,
        }
    }


    public static fromDBO(dbo: UserDBO): User {
        return {
            id: dbo.id,
            firstName: dbo.first_name,
            lastName: dbo.last_name,
            email: dbo.email,
            username: dbo.username,
            password: dbo.password,
            role: dbo.role,
            status: dbo.status,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at),
            deletedAt: dbo.deleted_at ? new Date(dbo.deleted_at) : undefined,
        }
    }

    public static fromDTO(domain: UserDTO): User {
        return {
            id: domain.id,
            email: domain.email,
            firstName: domain.firstName,
            lastName: domain.lastName,
            username: domain.username,
            password: domain.password ?? "",
            role: domain.role,
            status: domain.status,
            createdAt: domain.createdAt ? new Date(domain.createdAt) : new Date(),
            updatedAt: domain.updatedAt ? new Date(domain.updatedAt) : new Date(),
        }
    }

    public static fromNewDTO(dto: NewUserDTO): NewUser {
        return {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            password: dto.password,
        }
    } 

    public static toShortDTO(domain: User): UserShortDTO {
        return {
            id: domain.id,
            firstName: domain.firstName,
            lastName: domain.lastName,
        }
    }


    public static fromUpdateDTO(dto: UserDTO): UpdateUser {
        return {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            password: dto.password,
            role: dto.role,
            status: dto.status,
        }
    }
}