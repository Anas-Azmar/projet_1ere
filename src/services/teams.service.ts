import { TeamsMapper } from "../mappers/teams.mapper";
import { NewTeam, NewTeamDTO, Team, TeamDBO, TeamDTO, TeamFullDTO, TeamShortDTO } from "../models/team.model";
import { ERole, User, UserShortDTO } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";







export class TeamsService {


    private static readonly FILE_PATH = './data/teams.json';

    // Calculate next available ID
    //FIND NEXT ID
    private static getNewID(items: Team[]): number {
    let maxId = 0;
    if (items.length === 0) {
      return 1;
    }
    for (const item of items) {
      if (item.id > maxId) {
        maxId = item.id;
      }
    }
    return maxId + 1;
  }


    private static readDB(): Team[] {
        try {
            const dbos = FilesService.readFile<TeamDBO>(this.FILE_PATH) || [];
            return dbos.map(dbo => TeamsMapper.fromDBO(dbo));
        } catch (error) {
            LoggerService.error("Error to read files teams.json");
            return [];
        }
    }

    private static write(teams: Team[]): boolean {
        try {
            const dbos = teams.map(dbo=> TeamsMapper.toDBO(dbo))
            FilesService.writeFile(this.FILE_PATH, dbos)
            return true;
        } catch (error) {
            LoggerService.error("Error to write in teams.json");
            return false;
        }

    }

    // Get all teams
    //GET ALL
    public static getAll(): Team[] {
        return this.readDB();
        
    }


    // Get teams for a user (as trainer or player) with full details
    //
    public static getMyTeams(userId : number): { team: Team, trainer: User, players: User[] }[] | undefined {

        try {
            const teams = this.readDB();

            const userTeams = teams.filter(team => team.trainerId === userId || team.players.includes(userId));

            if(userTeams.length === 0){
                LoggerService.error("cannot find a teams with this id");
                return [];
            }

            //list of all
            const fullTeams = [];

            for(const team of userTeams){

                if(!team.trainerId){
                    LoggerService.error("cannot find a trainer for this team");
                    continue;
                }

                const trainer = UsersService.getById(team.trainerId);
                if(trainer === undefined){
                    LoggerService.error("cannot find a trainer for this team");
                    continue;
                }

                const listPlayer : User[] = [];

                for(const playerId of team.players){
                    const player = UsersService.getById(playerId);

                    if(player){
                        listPlayer.push(player);
                    }
                }
                
                fullTeams.push({
                    team: team,
                    trainer: trainer,
                    players : listPlayer
                })
                
            }

            return fullTeams;

           
        } catch (error) {
            LoggerService.error("Error getting user's teams");
            return undefined;
        }

    }
    // Find team by ID
    //GET BY ID
    public static getById(id: number): Team | undefined {

        try {
            const team = this.readDB();

            return team.find(team => team.id === id && team.deletedAt === undefined)

            
        } catch (error) {
            
         LoggerService.error("Error reading teams file in getById")
            return undefined;
        }
    }


    // Find team by name (case insensitive)
    //GET BY NAME (use for the POST method)
    public static getByName(name: string): Team | undefined{

        const teams = this.readDB();

       return teams.find(t => t.name.toLowerCase() === name.toLocaleLowerCase() && t.deletedAt === undefined)

    }


    // Create new team with trainer as creator
    //POST TEAMS
    public static create(newTeam: NewTeam, trainerId : number): Team | undefined | "ALREADY_EXISTS"{

        try {
           const teams = this.readDB();

            if(this.getByName(newTeam.name)){
                LoggerService.error("a team with this name already exist")
                return "ALREADY_EXISTS";
            }

            const newTeamId = this.getNewID(teams)

            const newerTeam: Team = {
                id: newTeamId,
                name: newTeam.name,
                description: newTeam.description || "",
                sportType: newTeam.sportType,
                players: [],
                trainerId: trainerId,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            teams.push(newerTeam);

            if(!this.write(teams)){
                return undefined;
            }

            return newerTeam;

        } catch (error) {
            LoggerService.error("cannot create a new Team")
            return undefined;
        }
    }


    // Update team details (check for duplicate names)
    //PUT TEAMS
    public static update(id: number, teamUp: Team): Team | undefined | "TEAM_NAME_ALREADY_TAKEN" {

        try {
            const teams = this.readDB();

            const indexTeam = teams.findIndex(team => team.id === id);
            
            if(indexTeam === -1){
                LoggerService.error("cannot find team id");
                return undefined;
            }
            //some = boolean
            const nameAlreadyTaken = teams.some(team => team.name === teamUp.name && team.id !== id);

            if(nameAlreadyTaken){
                LoggerService.error("the name is already taken by another team")
                return "TEAM_NAME_ALREADY_TAKEN";
            }

            const updatedTeam = teams[indexTeam];
            

            updatedTeam.name = teamUp.name;
            updatedTeam.description = teamUp.description;
            updatedTeam.sportType = teamUp.sportType;
            updatedTeam.players = teamUp.players;
            updatedTeam.trainerId = teamUp.trainerId;
            updatedTeam.updatedAt = new Date();

            if(!this.write(teams)){
                return undefined
            }

            return updatedTeam;

        } catch (error) {
            LoggerService.error("error while updating team")
            return undefined;
        }
    }


    //PATCH JOIN TEAM

    public static joinTeam(teamId: number, userId: number): Team | "NOT_FOUND" | "ALREADY_IN_TEAM" | undefined {
        
        try {
            const teams = this.readDB();

            const indexTeam = teams.findIndex(team => team.id === teamId);

            if(indexTeam === -1){
                LoggerService.error("team not found")
                return "NOT_FOUND";
            }

            const targetTeam = teams[indexTeam];

            if(targetTeam.players.includes(userId)){
                LoggerService.error("this user is already in team")
                return "ALREADY_IN_TEAM";
            }

            targetTeam.players.push(userId);
            targetTeam.updatedAt = new Date();

            if(!this.write(teams)){
                return undefined;
            }

            return targetTeam;
        } catch (error) {
            LoggerService.error("Error while joining team");
            return undefined;
        }
    }


    //PATCH LEAVE TEAM
    public static leaveTeam(idUser: number, teamId : number): Team | "TEAM_NOT_FOUND" | "USER_NOT_FOUND" | undefined{

        try {
            const teams = this.readDB();

            const teamIndex = teams.findIndex(team => team.id === teamId);

            if(teamIndex === -1){
                LoggerService.error("team not found");
                return "TEAM_NOT_FOUND";
            }

            const targetTeam = teams[teamIndex];

            if(!targetTeam.players.includes(idUser)){
                LoggerService.error("user does not exist")
                return "USER_NOT_FOUND";
            }
            //return only players does not have the id we want to remove
            targetTeam.players = targetTeam.players.filter(id => id !== idUser);
            targetTeam.updatedAt = new Date();

            if(!this.write(teams)){
                return undefined;
            }

            return targetTeam;
        } catch (error) {
            LoggerService.error("Error while leaving team");
            return undefined;
        }
    }

}