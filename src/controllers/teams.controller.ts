import { Router, Response, Request } from "express";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { TeamsService } from "../services/teams.service";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";
import { isNewTeamDTO, isNumber, isTeamDTO } from "../utils/guards";
import { TeamsMapper } from "../mappers/teams.mapper";
import { UsersMapper } from "../mappers/users.mapper";
import { NewTeamDTO } from "../models/team.model";





export const teamsController = Router();

//GET ALL TEAMS
teamsController.get("/", (req: Request, res: Response) => {
    LoggerService.info("[GET ALL TEAMS]")

    const result = TeamsService.getAll();

    const responseDTO = result.map(team => TeamsMapper.toShortDTO(team))

    return res.status(200).send(responseDTO);
})

//GET TEAMS FULL
teamsController.get("/own", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET FULL TEAMS]")

    const userId = req.user!.id;

    const result = TeamsService.getMyTeams(userId);

    if(!result || result.length === 0){
        return res.status(404).send({ message: "team not found" });
    }

    const userTeam = result[0];

    return res.status(200).send(TeamsMapper.toFullDTO(
        userTeam.team,
        UsersMapper.toShortDTO(userTeam.trainer),
        userTeam.players.map(player => UsersMapper.toShortDTO(player))
    ));
})

//GET TEAMS ID
teamsController.get("/:id", (req: Request, res: Response ) => {
    LoggerService.info("GET ID")

    const teamId = Number(req.params.id);

    if(!isNumber(teamId) || Number.isNaN(teamId)){
        return res.status(400).send({message : "must be a valid id"})
    }

    const result = TeamsService.getById(teamId);

    if(!result){
        return res.status(404).send({message : "cannot find team id"})
    }

    return res.status(200).send(TeamsMapper.toDTO(result));
})

//POST NEW TEAMS
teamsController.post("/", AuthService.authorize ,AuthService.isTrainer, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[POST TEAMS]")

    const team : NewTeamDTO = req.body;
    const trainerId = req.user!.id;

    if(!isNewTeamDTO(team)){
        return res.status(400).send({message : "Invalid team"})
    }

    const newTeam = TeamsMapper.fromNewDTO(team)

    const result = TeamsService.create(newTeam, trainerId)

    if(result === "ALREADY_EXISTS"){
        return res.status(400).send({message : "a team with this name already exist"})
    }

    if(!result){
        return res.status(400).send({message : "cannot create a new team"})
    }

    return res.status(201).send(TeamsMapper.toDTO(result));
}) 

//UPDATE NEW TEAMS
teamsController.put("/:id", AuthService.authorize ,AuthService.isTrainer, (req: AuthentificatedRequest, res: Response) => {
     LoggerService.info("[PUT TEAMS]")

     const teamId = Number(req.params.id);
     const team = req.body;


     if(!isNumber(teamId) || Number.isNaN(teamId)){
        return res.status(400).send({message : "must be a valid id"})
     }

     if(teamId !== team.id){
        return res.status(400).send({message : "the body id must match the id in parameter"})
     }

      if(!isTeamDTO(team)){
        return res.status(400).send({message : "invalid team"})
     }

       const updatedTeam = TeamsMapper.fromDTO(team)

     const result = TeamsService.update(teamId, updatedTeam);

     if(result === "TEAM_NAME_ALREADY_TAKEN"){
        return res.status(400).send({message : "the team name is already taken by another team"})
     }

     if(!result){
        return res.status(404).send({message : "cannot update team"})
     }

     return res.status(200).send(TeamsMapper.toDTO(result));

})

//PATCH JOIN A TEAM

teamsController.patch("/:id/join", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH JOIN TEAM]")

    const teamId = Number(req.params.id);
    const playerId = req.user!.id;

    if(!isNumber(teamId) || Number.isNaN(teamId)){
        return res.status(400).send({message : "must be a valid id"})
    }

    const result = TeamsService.joinTeam(teamId, playerId);


    if(result === "ALREADY_IN_TEAM"){
        return res.status(400).send({message : "the user is already in this team"})
    }

    if(result === "NOT_FOUND" || !result){
        return res.status(404).send({message : "team not found"})
    }

    return res.status(200).send(TeamsMapper.toDTO(result));

})

//PATCH LEAVE TEAM
teamsController.patch("/:id/leave", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH LEAVING THE TEAM]")

    const teamId = Number(req.params.id);
    const playerId = req.user!.id;

    if(!isNumber(teamId) || Number.isNaN(teamId)){
        return res.status(400).send({message : "must be a valid id"})
    }

    const result = TeamsService.leaveTeam(playerId, teamId);

    if(result === "TEAM_NOT_FOUND" || result === "USER_NOT_FOUND" || !result){
        return res.status(404).send({message : "the team does not exist or the player are not in this team"})
    }

    return res.status(200).send(TeamsMapper.toDTO(result));
})