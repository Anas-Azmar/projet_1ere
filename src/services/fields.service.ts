
import { FieldsMapper } from "../mappers/fields.mapper";
import { Field, FieldDBO, NewField } from "../models/field.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";





export class FieldsService {


    private static readonly FILE_PATH = './data/fields.json';

    // Calculate next available ID
    private static getNewId(items : Field[]): number {

        let maxId = 0;
        if(items.length === 0){
            return 1;
        }

        for(const item of items){
            if(item.id > maxId){
                maxId = item.id;
            }
        }
        return maxId+1;
    }

    // Read and parse all fields from database
    private static readDB(): Field[] {
        try {
            const dbos = FilesService.readFile<FieldDBO>(this.FILE_PATH) || [];
            return dbos.map(field => FieldsMapper.fromDBO(field))
        } catch (error) {
            LoggerService.error("Error to read files fields.json");
            return []
        }
    }

    // Write all fields to database file
    private static write(field : Field[]) : boolean {
        try {
            const dbos = field.map(dbo => FieldsMapper.toDBO(dbo));
            FilesService.writeFile(this.FILE_PATH, dbos);
            return true;
        } catch (error) {
            LoggerService.error("Error to write in games.json");
            return false;
        }
    }


    // Get all sports fields
    public static getAll(): Field[] {

        return this.readDB();

    }


    // Find field by ID
    public static getById(id : number, includeInactive: boolean = false): Field | undefined {

        try {
            const dbos = this.readDB();

            return dbos.find(f => f.id === id)

        } catch (error) {
            LoggerService.error("this fields")
            return undefined
        }
    }

    // Create new sports field
    public static create(field : NewField): Field | undefined{

        try {
            
            const dbos = this.readDB();

        const newId = this.getNewId(dbos);

        const newField : Field = {
            id: newId,
            name: field.name,
            location: field.location,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        dbos.push(newField);

        if(!this.write(dbos)){
            LoggerService.error("error when writting this fields in DB")
            return undefined;
        }

        return newField;

        } catch (error) {
            LoggerService.error("cannot create a new Field")
            return undefined;
        }
    }

    // Update field details (name, location)
    public static update(id: number, field : Field): Field | undefined {

        try {
            
        const dbos = this.readDB();

        const fieldIndex = dbos.findIndex(f => f.id === id)

        if(fieldIndex === -1 ){
            LoggerService.error("cannot find this field")
            return undefined;
        }

        const updatedField = dbos[fieldIndex];

        updatedField.name = field.name;
        updatedField.location = field.location;

        if(!this.write(dbos)){
            return undefined;
        }

        return updatedField;
        } catch (error) {
            LoggerService.error("Error when updating field")
            return undefined;
        }
    }
}