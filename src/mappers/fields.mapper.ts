import { Field, FieldDBO, FieldDTO, NewField, NewFieldDTO } from "../models/field.model";

export class FieldsMapper {
    public static toDTO(domain: Field): FieldDTO {
        return {
            id: domain.id,
            name: domain.name,
            location: domain.location,
            createdAt: domain.createdAt.toISOString(),
            updatedAt: domain.updatedAt.toISOString(),
        }
    }

    public static fromNewDTO(dto: NewFieldDTO): NewField {
        return {
            name: dto.name,
            location: dto.location,
        }
    }

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