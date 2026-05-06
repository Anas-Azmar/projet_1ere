import { Router, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { AuthentificatedRequest } from "../models/auth.model";
import { LoggerService } from "../services/logger.service";
import { UsersService } from "../services/users.service";
import { isNewUserDTO, isNumber, isString, isUserDTO, isUserRole, isUserStatus } from "../utils/guards";
import { UsersMapper } from "../mappers/users.mapper";
import { ERole, NewUserDTO, UserDTO } from "../models/user.model";



export const usersController = Router();

// GET /users - List all users (full list for admin, summary for others)
usersController.get("/", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET /users] Fetch all users");

    const role = req.user!.role;

    const isAdmin = role === ERole.ADMIN;

    const users = UsersService.getAll(isAdmin);

    if(isAdmin) {
        const responseDTO = users.map(user => UsersMapper.toDTO(user))
        return res.status(200).send(responseDTO);
    } else {
        const responseDTO = users.map(user => UsersMapper.toShortDTO(user))

        return res.status(200).send(responseDTO)
    }

    
})

// GET /users/:id - Get user details (full for admin/self, summary for others)
usersController.get("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET /users/:id] Fetch user by ID")

    const userId = Number(req.params.id);
    const currentUser = req.user!;

    if(!isNumber(userId) || Number.isNaN(userId)){
        return res.status(400).send({message : "must be a valid id"});
    }

    const user = UsersService.getById(userId);

    if(!user){
        return res.status(404).send({message : "cannot find user id"});
    }

    if(currentUser.role === ERole.ADMIN || currentUser.id === userId){
        return res.status(200).send(UsersMapper.toDTO(user))
    } else {
        return res.status(200).send(UsersMapper.toShortDTO(user))
    }
    
})

// GET /users/username/:name - Find user by username (admin/referee only)
usersController.get("/username/:name", AuthService.authorize, AuthService.isAdminOrReferee, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET /users/username/:name] Search by username")

    const userName = req.params.name;

    if(!isString(userName)){
        return res.status(400).send({message : "must be a string value"})
    }

    const user = UsersService.getByUserName(userName, true);

    if(!user){
        return res.status(404).send({message : "cannot find userName"});
    }

    return res.status(200).send(UsersMapper.toDTO(user))
})

// GET /users/email/:email - Find user by email (admin/referee only)
usersController.get("/email/:email", AuthService.authorize, AuthService.isAdminOrReferee, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[GET /users/email/:email] Search by email")

    const userMail = req.params.email;

    if(!isString(userMail)){
        return res.status(400).send({message : "must be a string value"})
    }

    const user = UsersService.getByEmail(userMail);

    if(!user){
        return res.status(404).send({message : "cannot find user with this email"});
    }

    return res.status(200).send(UsersMapper.toDTO(user))
})


// POST /users - Register new user
usersController.post("/", (req : Request, res: Response) => {
    LoggerService.info("[POST /users] User registration")

    const body : NewUserDTO = req.body;

    if(!isNewUserDTO(body)){
        return res.status(400).send({message : "Invalid User"})
    }

    // TODO: Move email validation to guard for centralized validation
    if(!body.email.includes("@") || !body.email.includes(".")){//Pense a mettre un guard a la place
        return res.status(400).send({message : "The email must contain at least one '@' and one '.'"});
    }

    const newUser = UsersMapper.fromNewDTO(body);

    const createdUser = UsersService.create(newUser);

    if(createdUser === "ALREADY_EXISTS") {
        return res.status(400).send({ message: "Cannot create a new user" })
    }

    if(!createdUser){
        return res.status(400).send({message : "cannot create a new user"})
    }

    return res.status(201).send(UsersMapper.toDTO(createdUser))
})

// PUT /users/:id - Update user details (admin or self)
usersController.put("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PUT /users/:id] Update user")

    const idUser = Number(req.params.id);
    const updateUser = req.body;
    const currentUser = req.user!;

    if(!isUserDTO(updateUser)){
        return res.status(400).send({message : "Invalid User"})
    }

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "the user id must be a valid number"});
    }
    // Non-admin cannot update other users
    if(currentUser.role !== ERole.ADMIN && currentUser.id !== idUser){
        return res.status(403).send("only admin can update other account")
    }

    if(updateUser.id !== idUser){
        return res.status(400).send({message : "body id must match the id in parameter"})
    }

    if(!updateUser.email.includes("@") || !updateUser.email.includes(".")){
        return res.status(400).send({message : "The email must contain at least one '@' and one '.'"});
    }

    const userDTO = UsersMapper.fromDTO(updateUser)

    const resultUpdate = UsersService.update(idUser, userDTO);

    if(resultUpdate === "NOT_FOUND"){
        return res.status(404).send({ message: "User not found" });
    }

    if (resultUpdate === "BAD_REQUEST") {
        return res.status(400).send({ message: "Email or username conflict" });
    }
    
    if(!resultUpdate){
        return res.status(500).send({message : "internal error"})
    }

    return res.status(200).send(UsersMapper.toDTO(resultUpdate));

})

// DELETE /users/:id - Delete user account (admin or self)
usersController.delete("/:id", AuthService.authorize, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[DELETE /users/:id] Delete user")

    const idUser = Number(req.params.id);
    const currentUser = req.user!;

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "the id must be a valid number"})
    }

    if(currentUser?.role !== ERole.ADMIN && currentUser.id !== idUser){
        return res.status(403).send({message : "Forbidden: You can only delete your own profile"})
    }

    const targetUser = UsersService.getById(idUser);

    if(!targetUser){
        return res.status(404).send({ message: "User not found" }); 
    }

    if(targetUser.role === ERole.ADMIN){
        return res.status(400).send({ message: "Cannot delete an admin account" });
    }

    const result = UsersService.delete(idUser);

    if(!result){
        return res.status(404).send({message : "Internal error while deleting user"})
    }

    return res.status(200).send();
})

// PATCH /users/:id/role/:role - Change user role to admin/referee (admin only)
usersController.patch("/:id/role/:role", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH /users/:id/role] Change user role")

    const idUser = Number(req.params.id);
    const roleUser = req.params.role;

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "id must be a valid number"})
    }

    if(!isUserRole(roleUser)){
        return res.status(400).send({message : "Invalid target role"})
    }

    const targetUser = UsersService.getById(idUser);

    if(!targetUser){
        return res.status(404).send({ message: "User not found" });
    }

    if(targetUser.role !== ERole.PLAYER){
        return res.status(400).send({ message: "Only players can be promoted" });
    }

    const result = UsersService.updateRole(idUser, roleUser)

    if(!result){
        return res.status(500).send({ message: "Internal server error" });
    }

    return res.status(200).send(UsersMapper.toDTO(result));

})

// PATCH /users/:id/reactivate - Reactivate inactive user account (admin only)
usersController.patch("/:id/reactivate", AuthService.authorize, AuthService.isAdmin, (req: AuthentificatedRequest, res: Response) => {
    LoggerService.info("[PATCH /users/:id/reactivate] Reactivate user")

    const idUser = Number(req.params.id);

    if(!isNumber(idUser) || Number.isNaN(idUser)){
        return res.status(400).send({message : "id must be a valid number"})
    }

    const result = UsersService.reactivate(idUser);

    if(result === "NOT_FOUND"){
        return res.status(404).send({ message: "User not found or already active" });
    }

    if(!result) {
        return res.status(500).send({ message: "Internal server error" });
    }

    return res.status(200).send();

})