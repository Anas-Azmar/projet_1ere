import { Router, Response, Request } from "express";
import { GamesService } from "../services/games.service";
import { isNumber } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";





export const gamesController = Router();



gamesController.get("/", (req: Request, res: Response) => {

    const result = GamesService.getAll();

    return res.status(200).send(result);
})



gamesController.get("/:id", (req: Request, res: Response) => {

    const id = Number(req.params.id);

    if(!isNumber(id) || Number.isNaN(id)) {
        return res.status(400).send({message : "invalid id"})
    }

    const result = GamesService.getById(id);

    if(!result){
        return res.status(404).send({message : "Game not found"})
    }

    return res.status(200).send(result);
})


//POST




//PUT
gamesController.put("/:id", AuthService.isReferee, (req: AuthentificatedRequest, res: Response) => {

    const id = Number(req.params.id)
    const body = req.body

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    if(id !== body.id){
        return res.status(400).send({message : "parameter id must matching with id in the body"})
    }

    const result = GamesService.update(id, body);

    if(result === "BAD_REQUEST"){
        return res.status(400).send({message : "Cannot change locked fields on a started game or cannot update with the status"})
    }

    if(result === "NOT_FOUND"){
        return res.status(404).send({message : "Game neot found"})
    }

    if(result === undefined){
        return res.status(500).send({message : "Internal error"})
    }

    res.status(200).send(result);
})


//DELETE
gamesController.delete("/:id", AuthService.isAdmin, (req: AuthentificatedRequest, res:  Response) => {

    const id = Number(req.params.id);

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    const result = GamesService.delete(id);

    if(!result){
        return res.status(500).send({message : "Failed to delete game"})
    }

    return res.status(204).send(result);
})


//PATCH SET SCORE
gamesController.patch("/:id/:home/:away", AuthService.isReferee, (req: AuthentificatedRequest, res: Response) => {

    const id = Number(req.params.id);
    const homeScore = Number(req.params.home);
    const awayScore = Number(req.params.away);

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    if(!isNumber(homeScore) || Number.isNaN(homeScore)){
        return res.status(400).send({message : "invalid homeScore"})
    }

    if(!isNumber(awayScore) || Number.isNaN(awayScore)){
        return res.status(400).send({message : "invalid awayScore"})
    }

    const result = GamesService.setScore(id, homeScore, awayScore);

    if(!result){
        return res.status(400).send({message : "Game not found or not in started status, or invalid score values"})
    }

    return res.status(200).send(result)
})