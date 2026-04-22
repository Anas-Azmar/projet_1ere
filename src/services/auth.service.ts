import { NextFunction, Response} from "express";
import { AuthentificatedRequest, AuthentificatedUserDTO } from "../models/auth.model";
import { ERole} from "../models/user.model";
import { generateFakeToken, validateFakeToken } from "../utils/auth";
import { LoggerService } from "./logger.service";
import { UsersService } from "./users.service";
import bcrypt from "bcrypt"
import { isString } from "../utils/guards";



export class AuthService {

    //token-token
    static login(userName : string, mdp: string): AuthentificatedUserDTO | undefined {

        
        try {
           
            const user = UsersService.getByUserName(userName);

            if(!user){
                return undefined;
            }

            const isPasswordValid = bcrypt.compareSync(mdp, user.password);

            if(!isPasswordValid){
                return undefined;
            }

            const token = generateFakeToken(userName);

            if(!token){
                LoggerService.error("failed to generate toekn for user")
                return undefined;
            }

            return {
                username: userName,
                token: token,
                role : user.role,
            }
             
        } catch (error) {
            LoggerService.error("Error to generate a token or wrong password")
            return undefined;
        }
    }

    //MIDDLEWARE D'AUTHENTIFICATION
    public static authorize(req: AuthentificatedRequest, res: Response, next: NextFunction){
        
        const token = req.get("authorization")
        if(!isString(token) || token == undefined){
            return res.status(401).send({message : "token missing"});
        }

        const username = validateFakeToken(token);
        if(!username){
            return res.status(401).send({message : "Invalid token"});
        }

        const user = UsersService.getByUserName(username);
        if(!user){
            return res.status(401).send({message : "User not found or inactive"})
        }

        req.user = user;

        return next();
    }


    public static isAdmin(req: AuthentificatedRequest, res : Response, next : NextFunction){

        if(!req.user){
            return res.status(401).send({message : "User not login"});
        }

        if(req.user.role !== ERole.ADMIN){
            return res.status(403).send({message : "only admin can do that"});
        }

        return next();
    }

    public static isReferee(req: AuthentificatedRequest, res: Response, next : NextFunction){

        if(!req.user){
            return res.status(401).send({message : "User not login"});
        }

        if(req.user.role !== ERole.REFEREE){
            return res.status(403).send({message : "Only referee can do this"});
        }

        return next();
    }

public static isAdminOrReferee(req: AuthentificatedRequest, res: Response, next: NextFunction) {
    
    if(!req.user){
        return res.status(401).send({message : "User not logged in"});
    }
   
    if(req.user.role !== ERole.ADMIN && req.user.role !== ERole.REFEREE){
        return res.status(403).send({message : "Only admin or referee can do this"});
    }

    return next();
}


public static isTrainer(req: AuthentificatedRequest, res: Response, next: NextFunction){

    if(!req.user){
        return res.status(401).send({message : "User not logged in"})
    }

    if(req.user.role !== ERole.TRAINER){
        return res.status(403).send({message : "Only a traine can do this"});
    }

    return next();
}

public static isRefereeOrTrainerOrAdmin(req: AuthentificatedRequest, res: Response, next : NextFunction) {

    if(!req.user){
        return res.status(401).send({message : "User not logged in"})
    }

    const role = req.user.role

    if(role != ERole.REFEREE && role != ERole.ADMIN && role != ERole.TRAINER){
        return res.status(403).send({message : "only a trainer or an admin or a referee can do this"})
    }

    return next();
}

}
