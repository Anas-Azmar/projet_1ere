import { Router, Response, Request } from "express";
import { GamesService } from "../services/games.service";
import { isEGameStatus, isNewGameDTO, isNumber } from "../utils/guards";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";
import { GamesMapper } from "../mappers/games.mapper";
import { LoggerService } from "../services/logger.service";
import { EGameStatus, NewGameDTO } from "../models/game.model";





export const gamesController = Router();



gamesController.get("/", (req: Request, res: Response) => {

    const result = GamesService.getAll();

    const responseDTO = result.map(game => GamesMapper.toShortDTO(game))

    return res.status(200).send(responseDTO);
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

    return res.status(200).send(GamesMapper.toDTO(result));
})


//POST
gamesController.post("/", AuthService.authorize, AuthService.isReferee, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[POST]")

    const body : NewGameDTO = req.body
    const userId = req.user!.id;

    if(!isNewGameDTO(body)){
        return res.status(400).send({message : "missing fields"})
    }

    const newGame = GamesMapper.fromNewDTO(body);

    const result = GamesService.create(newGame, userId)

    if(!result){
        return res.status(400).send({message : "invalid game"})
    }

    return res.status(201).send(GamesMapper.toDTO(result))

})



//PUT
gamesController.put("/:id",AuthService.authorize , AuthService.isReferee, (req: AuthentificatedRequest, res: Response) => {

    const id = Number(req.params.id)
    const body = req.body

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    if(id !== body.id){
        return res.status(400).send({message : "parameter id must matching with id in the body"})
    }

    const updatedGame = GamesMapper.fromDTO(body)

    const result = GamesService.update(id, updatedGame);

    if(result === "BAD_REQUEST"){
        return res.status(400).send({message : "Cannot change locked fields on a started game or cannot update with the status"})
    }

    if(!result){
        return res.status(404).send({message : "Game not found"})
    }

    return res.status(200).send(GamesMapper.toDTO(result));
})


//DELETE
gamesController.delete("/:id", AuthService.authorize , AuthService.isAdmin, (req: AuthentificatedRequest, res:  Response) => {

    const id = Number(req.params.id);

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    const result = GamesService.delete(id);

    if(!result){
        return res.status(500).send({message : "Failed to delete game"})
    }

    return res.status(204).send();
})


//PATCH SET SCORE
gamesController.patch("/:id/score/:home/:away",AuthService.authorize ,AuthService.isReferee, (req: AuthentificatedRequest, res: Response) => {

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

    return res.status(200).send(GamesMapper.toDTO(result))
})

gamesController.patch("/:id/status/:status", AuthService.authorize, AuthService.isRefereeOrTrainerOrAdmin, (req: AuthentificatedRequest, res: Response) => {

    const id = Number(req.params.id);
    const status = req.params.status;
    console.log("Received request to update game status. ID:", id, "Status:", status);

    if(!isNumber(id) || Number.isNaN(id)){
        return res.status(400).send({message : "invalid id"})
    }

    if(!isEGameStatus(status)){
        return res.status(400).send({message : "not a valid status"})
    }


    const result = GamesService.updateGameStatus(id, status)

    if(result === "BAD_REQUEST"){
        return res.status(400).send({message : "Invalid status transition or Missing prerequisites to start game"})
    }

    if(!result){
        return res.status(404).send({message : "game not found"})
    }

    return res.status(200).send(GamesMapper.toDTO(result))
})