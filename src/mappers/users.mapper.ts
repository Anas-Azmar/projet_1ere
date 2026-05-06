import { NewUser, NewUserDTO, UpdateUser, User, UserDBO, UserDTO, UserShortDTO } from "../models/user.model";

export class UsersMapper {
    // Convert domain User to complete DTO for API responses
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

    // Convert domain User to DBO for database storage
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


    // Convert DBO from database to domain User
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

    // Convert DTO request data to domain User
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

    // Convert new user registration data to domain model
    public static fromNewDTO(dto: NewUserDTO): NewUser {
        return {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            username: dto.username,
            password: dto.password,
        }
    } 

    // Convert domain User to short DTO (only id, firstName, lastName)
    public static toShortDTO(domain: User): UserShortDTO {
        return {
            id: domain.id,
            firstName: domain.firstName,
            lastName: domain.lastName,
        }
    }


    // Convert DTO update data to domain UpdateUser
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