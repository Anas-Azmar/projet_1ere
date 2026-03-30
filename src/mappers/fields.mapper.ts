import { FieldDBO, FieldDTO, NewFieldDTO } from "../models/field.model";


export class FieldsMapper {
    public static toDTO(fields : FieldDBO): FieldDTO {
        return {
            id: fields.id,
            name: fields.name   ,
            location: fields.location,
            createdAt: fields.created_at,
            updatedAt: fields.updated_at,
        }
    }

    public static fromNewDTO(fields : NewFieldDTO, id: number, date: string): FieldDBO {
        return {
            id: id,
            name: fields.name,
            location: fields.location,
            created_at: date,
            updated_at: date,
        }
    }

    public static toDBO(fields : FieldDTO): FieldDBO {
        return {
            id: fields.id,
            name: fields.name,
            location: fields.location,
            created_at: fields.createdAt as string,
            updated_at: fields.updatedAt as string,
        }
    }
}