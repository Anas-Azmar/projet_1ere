import { Router, Request, Response } from "express";
import { LoggerService } from "../services/logger.service";
import { isUserLoginDTO } from "../utils/guards";
import { AuthService } from "../services/auth.service";




export const authController = Router();



authController.post("/login", (req : Request, res: Response) => {
    LoggerService.info("[POST/auth/login]")

    const loginData = req.body;

    if(!isUserLoginDTO(loginData)){
        return res.status(400).send({message : "Invalid login data (username, password required)"})
    }

    const authResult = AuthService.login(loginData.username, loginData.password);

    if(!authResult){
        return res.status(401).send({message : "Invalid Credentials"});
    }

    return res.status(200).send(authResult)
})