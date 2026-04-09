import { TeamsMapper } from "../mappers/teams.mapper";
import { NewTeamDTO, TeamDBO, TeamDTO, TeamFullDTO, TeamShortDTO } from "../models/team.model";
import { ERole, UserShortDTO } from "../models/user.model";
import { IdUtils } from "../utils/id";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";







export class TeamsService {


    private static readonly FILE_PATH = './data/teams.json';

    //GET ALL AND RETURN SHORTDTO
    public static getAll(): TeamShortDTO[] | undefined {

        let teamsDBO : TeamDBO[] = [];

        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            let teams : TeamShortDTO[] = [];
            for(const t of teamsDBO) {
                teams.push(TeamsMapper.toShortDTO(t));
            }

            return teams;
        } catch (error) {
            LoggerService.error("Error getting all teams");
            return undefined;
        }
    }


    //
    public static getMyTeams(userId : number): TeamFullDTO[] | undefined {

        let teamsDBO : TeamDBO[] = [];
        
        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            const userTeams = teamsDBO.filter(teams => teams.trainer_id === userId || teams.players.includes(userId));

            if(!userTeams){
                LoggerService.error("cannot find a teams with this id");
                return [];
            }

            const fullTeams : TeamFullDTO[] = [];

            for(const team of userTeams){

                if(!team.trainer_id){
                    LoggerService.error("cannot find a trainer for this team");
                    continue;
                }

                const trainer = UsersService.getById(team.trainer_id, ERole.PLAYER) as UserShortDTO;

                const listPlayer : UserShortDTO[] = [];

                for(const playerId of team.players){
                    const player = UsersService.getById(playerId, ERole.PLAYER) as UserShortDTO;

                    if(player){
                        listPlayer.push(player);
                    }
                }
                
                const teamDTO = TeamsMapper.FullTeams(team, trainer, listPlayer)
                fullTeams.push(teamDTO);
                
            }

            return fullTeams;

           
        } catch (error) {
            LoggerService.error("Error getting user's teams");
            return undefined;
        }

    }
    //GET BY ID
    public static getById(id: number): TeamDTO | undefined {

        let teamsDBO : TeamDBO[] = [];

        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            const targetTeam = teamsDBO.find(team => team.id === id);

            if(!targetTeam){
                LoggerService.error("cannot find a team with this id");
                return undefined;
            }

            return TeamsMapper.toDTO(targetTeam);
        } catch (error) {
            LoggerService.error("Error reading teams file in getById")
            return undefined;
        }
    }


    //GET BY NAME (use for the POST method)
    public static getByName(name: string): boolean{

        let teamsDBO : TeamDBO[] = [];

       teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

        const isPresent = teamsDBO.find(n => n.name === name)

        return  isPresent !== undefined;

    }


    //POST TEAMS
    public static create(newTeam: NewTeamDTO, trainerId : number): TeamDTO | undefined {

        let teamsDBO: TeamDBO[] = [];

        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            if(TeamsService.getByName(newTeam.name)){
                LoggerService.error("a team with this name already exist")
                return undefined;
            }

            const newTeamId = IdUtils.generateNextId(teamsDBO);

            const newDate = new Date().toISOString();

            const team = TeamsMapper.fromNewDTO(newTeam, newTeamId, trainerId, newDate);

            teamsDBO.push(team);

            FilesService.writeFile(this.FILE_PATH, teamsDBO);

            return TeamsMapper.toDTO(team);
        } catch (error) {
            LoggerService.error("cannot create a new Team")
            return undefined;
        }
    }


    //PUT TEAMS
    public static update(id: number, teamUp: TeamDTO): TeamDTO | undefined | "TEAM_NAME_ALREADY_TAKEN" {

        let teamsDBO : TeamDBO[] = [];
        
        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            const indexTeam = teamsDBO.findIndex(team => team.id === id);
            
            if(indexTeam === -1){
                LoggerService.error("cannot find team id");
                return undefined;
            }

            const nameAlreadyTaken = teamsDBO.some(team => team.name === teamUp.name && team.id !== id);

            if(nameAlreadyTaken){
                LoggerService.error("the name is already taken by another team")
                return "TEAM_NAME_ALREADY_TAKEN";
            }

            const updatedTeam = teamsDBO[indexTeam];

            updatedTeam.name = teamUp.name;
            updatedTeam.description = teamUp.description;
            updatedTeam.sport_type = teamUp.sportType;
            updatedTeam.players = teamUp.players;
            updatedTeam.trainer_id = teamUp.trainerId;
            updatedTeam.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, teamsDBO);

            return TeamsMapper.toDTO(updatedTeam);

        } catch (error) {
            LoggerService.error("error while updating team")
            return undefined;
        }
    }


    //PATCH JOIN TEAM

    public static joinTeam(teamId: number, userId: number): TeamDTO | "NOT_FOUND" | "ALREADY_IN_TEAM" | undefined {

        let teamsDBO : TeamDBO[] = [];
        
        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            const indexTeam = teamsDBO.findIndex(team => team.id === teamId);

            if(indexTeam === -1){
                LoggerService.error("team not found")
                return "NOT_FOUND";
            }

            const targetTeam = teamsDBO[indexTeam];

            if(targetTeam.players.includes(userId)){
                LoggerService.error("this user is already in team")
                return "ALREADY_IN_TEAM";
            }

            targetTeam.players.push(userId);
            targetTeam.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, teamsDBO);

            return TeamsMapper.toDTO(targetTeam);


        } catch (error) {
            LoggerService.error("Error while joining team");
            return undefined;
        }
    }


    //PATCH LEAVE TEAM
    public static leaveTeam(idUser: number, teamId : number): TeamDTO | "TEAM_NOT_FOUND" | "USER_NOT_FOUND" | undefined{

        let teamsDBO : TeamDBO[] = [];

        try {
            teamsDBO = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];

            const teamIndex = teamsDBO.findIndex(team => team.id === teamId);

            if(teamIndex === -1){
                LoggerService.error("team not found");
                return "TEAM_NOT_FOUND";
            }

            const targetTeam = teamsDBO[teamIndex];

            if(!targetTeam.players.includes(idUser)){
                LoggerService.error("user does not exist")
                return "USER_NOT_FOUND";
            }
            //return only players does not have the id we want to remove
            targetTeam.players = targetTeam.players.filter(id => id !== idUser);
            targetTeam.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, teamsDBO);

            return TeamsMapper.toDTO(targetTeam);
        } catch (error) {
            LoggerService.error("Error while leaving team");
            return undefined;
        }
    }

}