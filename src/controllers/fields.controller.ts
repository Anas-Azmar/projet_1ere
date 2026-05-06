import { Router, Response, Request } from "express";
import { LoggerService } from "../services/logger.service";
import { FieldsService } from "../services/fields.service";
import { FieldsMapper } from "../mappers/fields.mapper";
import { isFieldDTO, isNewFieldDTO, isNumber } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";





export const fieldsController = Router();

// GET /fields - Retrieve all sports fields
fieldsController.get("/", (req: Request, res: Response) => {
    LoggerService.info("[GET /fields] Fetch all fields")

    const result = FieldsService.getAll();

    const resultDTO =  result.map(field => FieldsMapper.toDTO(field));

    return res.status(200).send(resultDTO);
})


// GET /fields/:id - Get a specific field by ID
fieldsController.get("/:id", (req: Request, res: Response) => {
    LoggerService.info("[GET /fields/:id] Fetch field by ID")

    const paramsId = Number(req.params.id)

    if(!isNumber(paramsId) || Number.isNaN(paramsId)){
        return res.status(400).send({message : "must be a valid number"})
    }

    const result = FieldsService.getById(paramsId)

    if(!result){
        return res.status(404).send({message : "fields not found"})
    }

    return res.status(200).send(FieldsMapper.toDTO(result))
})


// POST /fields - Create new field (admin only)
fieldsController.post("/", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
     LoggerService.info("[POST /fields] Create new field")

     const body = req.body;

     if(!isNewFieldDTO(body)){
        return res.status(400).send({message : "missing fields"})
     }

     const newField = FieldsMapper.fromNewDTO(body)

     const result = FieldsService.create(newField);

     if(!result){
        return res.status(404).send({message : "invalid Fields"})
     }

     return res.status(201).send(FieldsMapper.toDTO(result))
})


// PUT /fields/:id - Update field details (admin only)
fieldsController.put("/:id", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PUT /fields/:id] Update field");

    const paramsId = Number(req.params.id);
    const body = req.body;

    if(!isNumber(paramsId) || Number.isNaN(paramsId)){
        return res.status(400).send({message : "must be a valid id"})
    }

    if(paramsId != body.id){
        return res.status(400).send({message : "id parameter must be the same in the body"})
    }

    if(!isFieldDTO(body)){
        return res.status(400).send({message : "invalid Field"})
    }

    const updatedField = FieldsMapper.fromDTO(body);

    const result = FieldsService.update(paramsId, updatedField)

    if(!result){
        return res.status(404).send({message : "Field not found"})
    }

    return res.status(200).send(FieldsMapper.toDTO(result))
})