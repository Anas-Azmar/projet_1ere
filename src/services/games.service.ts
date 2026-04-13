import { LOADIPHLPAPI, lookup } from "node:dns";
import { GamesMapper } from "../mappers/games.mapper";
import { EGameStatus, GameDBO, GameDTO, GameShortDTO, NewGameDTO } from "../models/game.model";
import { IdUtils } from "../utils/id";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";




export class GamesService {


    private static readonly FILE_PATH = './data/games.json';


    public static getAll(): GameShortDTO[] | undefined {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const today = new Date();

            today.setHours(0,0,0,0);

            const upComingGames = gameDBO.filter(game => game.scheduled_date !== null && new Date(game.scheduled_date) >= today)


            return upComingGames.map(game=> GamesMapper.toShortDTO(game));
        } catch (error) {
            LoggerService.error("Error getting upcoming games");
            return undefined;
        }
    }

    //GET ID
    public static getById(id : number): GameDTO | undefined {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const gameId = gameDBO.find(game => game.id === id && game.deleted_at === undefined);

            if(!gameId) {
                LoggerService.error("cannot find game id");
                return undefined;
            }

            return GamesMapper.toDTO(gameId);
        } catch (error) {
            LoggerService.error("Error reading game file in getById")
            return undefined;
        }
    }

    //POST NEW GAME

    //a finir

    //PUT GAMES
    public static update(id: number, upGame: GameDTO): GameDTO | "NOT_FOUND" | "BAD_REQUEST" | undefined {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const gameIndex = gameDBO.findIndex(game => game.id === id && game.deleted_at === undefined);
            
            if(gameIndex === -1){
                LoggerService.error("cannot find this id game")
                return "NOT_FOUND";
            }

            const gameToUpdate = gameDBO[gameIndex];

            if(gameToUpdate.status === EGameStatus.FINISHED || gameToUpdate.status === EGameStatus.CANCELLED){
                LoggerService.error("Impossible to update the game with the status Finished or Canceled")
                return "BAD_REQUEST";           
            }

            if(gameToUpdate.status === EGameStatus.STARTED){
                if(
                    upGame.fieldId != gameToUpdate.field_id ||
                    upGame.refereeId != gameToUpdate.referee_id ||
                    upGame.homeTeamId != gameToUpdate.home_team_id ||
                    upGame.awayTeamId != gameToUpdate.away_team_id
                ) {
                    LoggerService.error("Cannot change locked fields on a started game")
                    return "BAD_REQUEST";
                }
            }

            gameToUpdate.status = upGame.status;
            gameToUpdate.name = upGame.name;
            gameToUpdate.field_id = upGame.fieldId;
            gameToUpdate.referee_id = upGame.refereeId;
            gameToUpdate.home_team_id = upGame.homeTeamId;
            gameToUpdate.away_team_id = upGame.awayTeamId;
            gameToUpdate.home_score = upGame.homeScore;
            gameToUpdate.away_score = upGame.awayScore;
            gameToUpdate.scheduled_date = upGame.scheduledDate;
            gameToUpdate.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, gameDBO);

            return GamesMapper.toDTO(gameToUpdate);

        } catch (error) {
            LoggerService.error("Error while updating game");
            return undefined;
        }
    }

    public static delete(id: number): boolean {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const gameIndex = gameDBO.findIndex(game => game.id === id && game.deleted_at === undefined);

            if(gameIndex === -1){
                LoggerService.info("game already delete")
                return true;
            }

            gameDBO.splice(gameIndex, 1);

            FilesService.writeFile(this.FILE_PATH, gameDBO);

            return true;

        } catch (error) {
            LoggerService.error("Error with the suppression")
            return false;
        }
    }

    //PATCH SET SCORE
    public static setScore(id: number, home: number, away: number): GameDTO | undefined {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const gameIndex = gameDBO.findIndex(game => game.id === id && game.deleted_at === undefined);

            if(gameIndex === -1){
                LoggerService.error("game id not found")
                return undefined;
            }

            const gameToUpdate = gameDBO[gameIndex]

            if(gameToUpdate.status !== EGameStatus.STARTED){
                LoggerService.error("Game is not started, cannot set score")
                return undefined;
            }

            gameToUpdate.home_score = home;
            gameToUpdate.away_score = away;
            gameToUpdate.updated_at= new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, gameDBO);

            return GamesMapper.toDTO(gameToUpdate);
        } catch (error) {
            LoggerService.error("Error setup score")
            return undefined;
        }
    }

    //Patch set status
    public static updateGameStatus(id: number, newStatus: EGameStatus): GameDTO | undefined | "NOT_FOUND" | "BAD_REQUEST" {

        let gameDBO : GameDBO[] = [];

        try {
            gameDBO = FilesService.readFile<GameDBO>(this.FILE_PATH) || [];

            const indexGame = gameDBO.findIndex(game => game.id === id && game.deleted_at === undefined);

            if(indexGame === -1){
                LoggerService.error("game id not found")
                return "NOT_FOUND";
            }

            const game = gameDBO[indexGame]

            let isAllowed = false;


            switch (game.status) {
                case EGameStatus.CREATED:
                    if(newStatus === EGameStatus.CANCELLED) {
                        isAllowed = true;
                    }
                    break;
                case EGameStatus.SCHEDULED:
                    if (newStatus === EGameStatus.CANCELLED) {
                        isAllowed = true;
                    } else if (newStatus === EGameStatus.STARTED) {
                        if (!game.field_id || !game.referee_id || !game.home_team_id || !game.away_team_id || game.home_score !== 0 || game.away_score !== 0) {
                            LoggerService.error("Missing prerequisites to start game");
                            return "BAD_REQUEST"; 
                        }
                        isAllowed = true;
                    }
                    break;
                case EGameStatus.STARTED:
                    if (newStatus === EGameStatus.FINISHED) {
                        isAllowed = true;
                        break;
                    }
            }

            if(!isAllowed){
                LoggerService.error("this transition are not allowed")
                return "BAD_REQUEST";
            }

            game.status = newStatus;
            game.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, gameDBO);

            return GamesMapper.toDTO(game)

        } catch (error) {
            return undefined;
        }
    }


}