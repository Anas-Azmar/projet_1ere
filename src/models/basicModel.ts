


export interface BasicModel {
    id: number;
    createdAt: Date; 
    updatedAt: Date;
    deletedAt?: Date;
}

export interface BasicModelDBO {
    id: number;
    created_at: string; 
    updated_at: string;
    deleted_at?: string;
}

export interface BasicModelDTO {
    id: number;
    createdAt?: string; 
    updatedAt?: string;
}

