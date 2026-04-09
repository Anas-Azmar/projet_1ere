import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { isNewUserDTO, isNumber, isString, isUserDTO, isUserRole, isUserStatus } from "../utils/guards";
import { UsersMapper } from "../mappers/users.mapper";
import { ERole, NewUserDTO, UserDTO } from "../models/user.model";



export const usersController = Router();

//GET ALL
usersController.get("/", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET ALL]");

    const role = req.user!.role;

    const users = UsersService.getAll(role);

    return res.status(200).send(users);
})

//GET BY ID
usersController.get("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("GET BY ID")

    const userId = Number(req.params.id);
    const currentUser = req.user!;

    if(!isNumber(userId) || Number.isNaN(userId)){
        return res.status(400).send({message : "must be a valid id"});
    }

    if(currentUser.role !== ERole.ADMIN && currentUser.id !== userId) {
        return res.status(403).send({message : "Forbidden : you can only view your own profile"})
    }

    const user = UsersService.getById(userId, currentUser.role);

    if(!user){
        return res.status(404).send({message : "cannot find user id"});
    }

    return res.status(200).send(user)
})

//GET USERNAME
usersController.get("/username/:name", AuthService.authorize, AuthService.isAdminOrReferee, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET BY USERNAME]")

    const userName = req.params.name;

    if(!isString(userName)){
        return res.status(400).send({message : "must be a string value"})
    }

    const user = UsersService.getByUserName(userName);

    if(!user){
        return res.status(404).send({message : "cannot find userName"});
    }

    return res.status(200).send(user)
})

//GET BY EMAIL
usersController.get("/email/:email", AuthService.authorize, AuthService.isAdminOrReferee, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET BY EMAIL]")

    const userMail = req.params.email;

    if(!isString(userMail)){
        return res.status(400).send({message : "must be a string value"})
    }

    const user = UsersService.getByEmail(userMail);

    if(!user){
        return res.status(404).send({message : "cannot find user with this email"});
    }

    return res.status(200).send(user)
})


//POST
usersController.post("/", (req : Request, res: Response) => {
    LoggerService.info("[POST]")

    const newUser : NewUserDTO = req.body;

    if(!isNewUserDTO(newUser)){
        return res.status(400).send({message : "Invalid User"})
    }

    if(!newUser.email.includes("@") || !newUser.email.includes(".")){
        return res.status(400).send({message : "The email must contain at least one '@' and one '.'"});
    }

    const user = UsersService.create(newUser);

    if(!user){
        return res.status(400).send({message : "cannot create a new user"})
    }

    return res.status(201).send(user);
})


usersController.put("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PUT USER]")

    const idUser = Number(req.params.id);
    const updateUser = req.body;
    const currentUser = req.user!;

    if(!isUserDTO(updateUser)){
        return res.status(400).send({message : "Invalid User"})
    }

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "the user id must be a valid number"});
    }

    if(currentUser.role !== ERole.ADMIN && currentUser.id !== idUser){
        return res.status(403).send("only admin can update their own account")
    }

    if(updateUser.id !== idUser){
        return res.status(400).send({message : "the body id must match with th id in parameter"})
    }

    if(!updateUser.email.includes("@") || !updateUser.email.includes(".")){
        return res.status(400).send({message : "The email must contain at least one '@' and one '.'"});
    }

    const resultUpdate = UsersService.update(idUser, updateUser);
    
    if(!resultUpdate){
        return res.status(404).send({message : "internal error"})
    }

    return res.status(200).send(resultUpdate);

})

//DELETE USER
usersController.delete("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[DELETE]")

    const idUser = Number(req.params.id);
    const currentUser = req.user!;

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "the id must be a valid number"})
    }

    if(currentUser?.role !== ERole.ADMIN && currentUser.id !== idUser){
        return res.status(403).send({message : "Forbidden: You can only delete your own profile"})
    }
    // Cast to UserDTO to read the 'role'. We keep '| undefined' to prevent a server crash if the user is not found.
    const targetUser = UsersService.getById(idUser, ERole.ADMIN) as UserDTO | undefined;
    
    if(targetUser?.role === ERole.ADMIN) {
        return res.status(403).send({ message: "Forbidden: Admin accounts cannot be deleted" });
    }

    const result = UsersService.delete(idUser);

    if(!result){
        return res.status(404).send({message : "User not found"})
    }

    return res.status(200).send(result);
})

//PATCH CHANGE ROLE
usersController.patch("/:id/role/:role", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH ROLE]")

    const idUser = Number(req.params.id);
    const roleUser = req.params.role;

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "id must be a valid number"})
    }

    if(!isUserRole(roleUser)){
        return res.status(400).send({message : "Invalid target role"})
    }

    const targetUser = UsersService.getById(idUser, ERole.ADMIN) as UserDTO | undefined;

    if(!targetUser){
        return res.status(404).send({ message: "User not found" });
    }

    if(targetUser.role !== ERole.PLAYER){
        return res.status(400).send({ message: "Only players can be promoted" });
    }

    const result = UsersService.changeRoles(idUser, roleUser)

    if(!result){
        return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send(result);

})

//PATCH REACTIVE USER
usersController.patch("/:id/reactivate", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH STATUS ACTIVE]")

    const idUser = Number(req.params.id);

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "id must be a valid number"})
    }

    const result = UsersService.reactivateUser(idUser);

    if(!result) {
         return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send();

})