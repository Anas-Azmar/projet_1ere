import { BasicModel, BasicModelDBO, BasicModelDTO } from "./basicModel";


export interface NewFieldDTO {
    name : string,
    location: string,
}

export interface FieldDTO extends BasicModelDTO {
    name: string,
    location: string,
}

export interface FieldDBO extends BasicModelDBO {
    name: string,
    location: string,
}

export interface Field extends BasicModel {
    name: string,
    location: string,
}

export interface NewField {
    name : string,
    location: string,
}