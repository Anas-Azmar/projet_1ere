import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldsMapper {
    // Convert domain Field to DTO for API responses
    public static toDTO(domain: Field): FieldDTO {
        return {
            id: domain.id,
            name: domain.name,
            location: domain.location,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    // Convert new field request data to domain model
    public static fromNewDTO(dto: NewFieldDTO): NewField {
        return {
            name: dto.name,
            location: dto.location,
        }
    }

    // Convert domain Field to DBO for database storage
    public static toDBO(domain: Field): FieldDBO {
        return {
            id: domain.id,
            name: domain.name,
            location: domain.location,
            created_at: domain.createdAt.toISOString(),
            updated_at: domain.updatedAt.toISOString(),
            deleted_at: domain.deletedAt ? domain.deletedAt.toISOString() : undefined,
        }
    }

    // Convert DBO from database to domain Field
    public static fromDBO(dbo: FieldDBO): Field {
        return {
            id: dbo.id,
            name: dbo.name,
            location: dbo.location,
            createdAt: new Date(dbo.created_at),
            updatedAt: new Date(dbo.updated_at),
            deletedAt: dbo.deleted_at ? new Date(dbo.deleted_at) : undefined,
        }
    }


    // Convert DTO request data to domain Field
    public static fromDTO(dto: FieldDTO): Field {
    return {
        id: dto.id,
        name: dto.name,
        location: dto.location,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
        updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : new Date(),
    };
}
}