
import { GamesMapper } from "../mappers/games.mapper";
import { EGameStatus, Game, GameDBO, GameDTO, GameShortDTO, NewGame, NewGameDTO } from "../models/game.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";




export class GamesService {


    private static readonly FILE_PATH = './data/games.json';

    // Calculate next available ID
    private static getNewId(items : Game[]) : number {
        let maxId = 0;
        if(items.length === 0){
            return 1;
        }

        for(const item of items){
            if(item.id > maxId){
                maxId = item.id;
            }
        }
        return maxId + 1;

    }


    // Read and parse all games from database
    private static readDB(): Game[] {
        try {
            const dbos = FilesService.readFile<GameDBO>(this.FILE_PATH) || []
        return dbos.map(game => GamesMapper.fromDBO(game))
        } catch (error) {
            LoggerService.error("Error to read files games.json");
            return []
        }
    }

    // Write all games to database file
    private static write(game : Game[]): boolean {
        try {
            const dbos = game.map(dbo => GamesMapper.toDBO(dbo))
        FilesService.writeFile(this.FILE_PATH, dbos);
        return true;
        } catch (error) {
            LoggerService.error("Error to write in games.json");
            return false;
        }
    }


    // Get all upcoming games scheduled for future dates
    public static getAll(): Game[] {

        try {
            const games = this.readDB();

            const today = new Date();

            const upComingGames = games.filter(game => game.scheduledDate !== undefined && game.scheduledDate >= today)

           return upComingGames;
        } catch (error) {
            LoggerService.error("Error getting upcoming games");
            return [];
        }
    }

    // Find specific game by ID
    //GET ID
    public static getById(id : number): Game | undefined {

        try {
           const games = this.readDB();

            const gameId = games.find(game => game.id === id && game.deletedAt === undefined);

            if(!gameId) {
                LoggerService.error("cannot find game id");
                return undefined;
            }

            return gameId
        } catch (error) {
            LoggerService.error("Error reading game file in getById")
            return undefined;
        }
    }

    // Create new game with initial status (CREATED or SCHEDULED)
    //POST NEW GAME
    public static create(game: NewGame, refereeId : number): Game | undefined{// A Faire corriger le newGame champs undefined

        try {
            const games = this.readDB();

            const today = new Date();

            if(game.scheduledDate && today > new Date(game.scheduledDate)){
                LoggerService.error("scheduled date must be in the future")
                return undefined;
            }

            const isPresent = game.fieldId != null && game.scheduledDate != null;

            let status = EGameStatus.CREATED

            if(isPresent){
                status = EGameStatus.SCHEDULED;
            }

            const newId = this.getNewId(games);

            const newGame : Game = {
                id: newId,
                status : status,
                name : game.name || "Match déjà nomme",
                homeTeamId : game.homeTeamId || 0,
                awayTeamId : game.awayTeamId || 0,
                fieldId : game.fieldId,
                refereeId: game.refereeId || refereeId,
                scheduledDate: game.scheduledDate ? new Date(game.scheduledDate) : undefined,
                homeScore: 0,
                awayScore: 0,
                createdAt : new Date(),
                updatedAt : new Date()
            }

            

            games.push(newGame);

            if(!this.write(games)){
                return undefined
            }

            return newGame
        } catch (error) {
            LoggerService.error("Cannot create a new Game");
            return undefined;
        }
    }

    // Update game details (with status transition validation)
    //PUT GAMES
    public static update(id: number, upGame: Game): Game | "BAD_REQUEST" | undefined {

        try {
            const games = this.readDB();

            const gameIndex = games.findIndex(game => game.id === id && game.deletedAt === undefined);
            
            if(gameIndex === -1){
                LoggerService.error("cannot find this id game")
                return undefined;
            }

            const gameToUpdate = games[gameIndex];

            if(gameToUpdate.status === EGameStatus.FINISHED || gameToUpdate.status === EGameStatus.CANCELLED){
                LoggerService.error("Impossible to update the game with the status Finished or Canceled")
                return "BAD_REQUEST";           
            }

            if(gameToUpdate.status === EGameStatus.STARTED){
                if(
                    upGame.fieldId != gameToUpdate.fieldId ||
                    upGame.refereeId != gameToUpdate.refereeId ||
                    upGame.homeTeamId != gameToUpdate.homeTeamId ||
                    upGame.awayTeamId != gameToUpdate.awayTeamId
                ) {
                    LoggerService.error("Cannot change locked fields on a started game")
                    return "BAD_REQUEST";
                }
            }

            let finalStatus = upGame.status;

            if(gameToUpdate.status === EGameStatus.CREATED) {
                if(upGame.fieldId && upGame.scheduledDate){
                    finalStatus = EGameStatus.SCHEDULED
                }
            }

  
            gameToUpdate.status = finalStatus;
            gameToUpdate.name = upGame.name;
            gameToUpdate.fieldId = upGame.fieldId;
            gameToUpdate.refereeId = upGame.refereeId;
            gameToUpdate.homeTeamId = upGame.homeTeamId;
            gameToUpdate.awayTeamId = upGame.awayTeamId;
            gameToUpdate.homeScore = upGame.homeScore !== undefined ? upGame.homeScore : gameToUpdate.homeScore
            gameToUpdate.awayScore = upGame.awayScore !== undefined ? upGame.awayScore : gameToUpdate.awayScore
            gameToUpdate.scheduledDate = upGame.scheduledDate;
            gameToUpdate.updatedAt = new Date();

            if(!this.write(games)){
                return undefined;
            }

            return gameToUpdate;

        } catch (error) {
            LoggerService.error("Error while updating game");
            return undefined;
        }
    }

    // Soft delete game (mark as deleted)
    public static delete(id: number): boolean {

        try {
            const games = this.readDB();

            const gameIndex = games.findIndex(game => game.id === id && game.deletedAt === undefined);

            if(gameIndex === -1){
                LoggerService.info("game already delete")
                return true;
            }

            games.splice(gameIndex, 1);

            return this.write(games)

        } catch (error) {
            LoggerService.error("Error with the suppression")
            return false;
        }
    }

    // Update game score (only if game is started)
    //PATCH SET SCORE
    public static setScore(id: number, home: number, away: number): Game | undefined {

        try {
            const games = this.readDB();

            const gameIndex = games.findIndex(game => game.id === id && game.deletedAt === undefined);

            if(gameIndex === -1){
                LoggerService.error("game id not found")
                return undefined;
            }

            const gameToUpdate = games[gameIndex]


            if(gameToUpdate.status.toLocaleLowerCase() !== EGameStatus.STARTED){
                LoggerService.error("Game is not started, cannot set score")
                return undefined;
            }

            gameToUpdate.homeScore = home;
            gameToUpdate.awayScore = away;
            gameToUpdate.updatedAt= new Date();

             if(!this.write(games)){
                return undefined;
            }

            return gameToUpdate;
            
        } catch (error) {
            LoggerService.error("Error setup score")
            return undefined;
        }
    }

    // Change game status (CREATED->SCHEDULED->STARTED->FINISHED/CANCELLED)
    //Patch set status
    public static updateGameStatus(id: number, newStatus: EGameStatus): Game | undefined | "BAD_REQUEST" {

        try {
           const games = this.readDB();

            const indexGame = games.findIndex(game => game.id === id && game.deletedAt === undefined);

            if(indexGame === -1){
                LoggerService.error("game id not found")
                return undefined;
            }

            const game = games[indexGame]

            let isAllowed = false;

            switch (game.status.toLocaleLowerCase()) {
                case EGameStatus.CREATED:
                    if(newStatus === EGameStatus.CANCELLED) {
                        isAllowed = true;
                    }
                    break;
                case EGameStatus.SCHEDULED:
                    if (newStatus === EGameStatus.CANCELLED) {
                        isAllowed = true;
                    } else if (newStatus === EGameStatus.STARTED) {
                        if (game.fieldId === undefined || game.refereeId === undefined || game.homeTeamId === undefined || game.awayTeamId === undefined || game.homeScore !== 0 || game.awayScore !== 0) {
                            LoggerService.error("Missing prerequisites to start game");
                            return "BAD_REQUEST"; 
                        }
                        isAllowed = true;
                    }
                    break;
                case EGameStatus.STARTED:
                    if (newStatus === EGameStatus.FINISHED) {
                        isAllowed = true;
                    }break;
            }

            if(!isAllowed){
                LoggerService.error("this transition are not allowed")
                return "BAD_REQUEST";
            }

            game.status = newStatus;
            game.updatedAt = new Date();

            if(!this.write(games)){
                return undefined;
            }

            return game;

        } catch (error) {
            return undefined;
        }
    }


}