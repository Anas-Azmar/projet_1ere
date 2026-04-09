import { unescape } from "querystring";
import { UsersMapper } from "../mappers/users.mapper";
import { ERole, EUserStatus, NewUserDTO, UserDBO, UserDTO, UserShortDTO } from "../models/user.model";
import { IdUtils } from "../utils/id";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import bcrypt from 'bcrypt'



export class UsersService {


    private static readonly FILE_PATH = "./data/users.json";



    //GET ALL
    public static getAll(requestRole : string): UserDTO[] | UserShortDTO[] | [] {

        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const activesUsers = userDBO.filter(user => user.status === EUserStatus.ACTIVE);

            if(requestRole === ERole.ADMIN) {
                return activesUsers.map(user => UsersMapper.toDTO(user));
            } else {
                return activesUsers.map(user => UsersMapper.toShortDTO(user));
            }

        } catch (error) {
            LoggerService.error("cannot get all user");
            return [];
        }
    }

    //GET BY ID
    public static getById(id: number, requestRole: string): UserDTO | UserShortDTO | undefined {

        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const userId = userDBO.find(user => user.id === id && user.status === EUserStatus.ACTIVE);

            if(!userId) {
                return undefined;
            }

            if (requestRole === ERole.ADMIN) {
            return UsersMapper.toDTO(userId);
        } else {
            return UsersMapper.toShortDTO(userId);
        }

        } catch (error) {
            LoggerService.error("Error reading teams file in getById")
            return undefined;
        }
    }


    //GET BY USERNAME
    public static getByUserName(name: string): UserDTO | undefined {

        let userDBO: UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const userName = userDBO.find(user=> user.username === name && user.status === EUserStatus.ACTIVE)

            return userName ? UsersMapper.toDTO(userName) : undefined;
        } catch (error) {
            LoggerService.error("cannot find user by his name")
            return undefined;
        }
    }

    //GET EMAIL

    public static getByEmail(email : string) : UserDTO | undefined {

         let userDBO : UserDBO[] = [];

         try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const userMail = userDBO.find(user => user.email === email && user.status === EUserStatus.ACTIVE);

            return userMail ? UsersMapper.toDTO(userMail) : undefined

         } catch (error) {
            LoggerService.error("cannot find user with this email")
            return undefined;
         }
    }

    //POST USER
    public static create(newUser : NewUserDTO): UserDTO | undefined{

        try {
            const userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];
            
            const existingUserName = this.getByUserName(newUser.username);
            const existingEmail = this.getByEmail(newUser.email);

            if(existingUserName || existingEmail){
                LoggerService.error("this name or email is already used")
                return undefined;
            }

            const newId = IdUtils.generateNextId(userDBO);

            const hashedPassword = bcrypt.hashSync(newUser.password, 10);

            const now = new Date().toISOString();

            const newU = UsersMapper.fromNewDTO(newUser,newId,now, hashedPassword);

            userDBO.push(newU);

            FilesService.writeFile(this.FILE_PATH, userDBO);

            return UsersMapper.toDTO(newU);

        } catch (error) {
            LoggerService.error("cannot create a new User")
            return undefined;
        }
    }

    //PUT USER
    public static update(id: number, userUp: UserDTO): UserDTO | undefined {
        
        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const indexUser = userDBO.findIndex(u => u.id === id && u.status === EUserStatus.ACTIVE);

            if(indexUser === -1){
                LoggerService.error("cannot find this user")
                return undefined;
            }

            const existingUser = userDBO[indexUser];

            existingUser.first_name = userUp.firstName;
            existingUser.last_name = userUp.lastName;
            existingUser.email = userUp.email;
            existingUser.username = userUp.username;
            existingUser.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, userDBO);

            return UsersMapper.toDTO(existingUser);

        } catch (error) {
        LoggerService.error("Error while updating user");
        return undefined;
        }
    }

    //DELETE USER
    public static delete(id: number): boolean | undefined{

        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const idUser = userDBO.findIndex(u => u.id === id && u.status === EUserStatus.ACTIVE);

            if(idUser === -1){
                LoggerService.error("cannot find user with this id");
                return undefined;
            }

            userDBO[idUser].status = EUserStatus.INACTIVE;
            userDBO[idUser].deleted_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, userDBO);

            return true;
        } catch (error) {
            LoggerService.error("Error delete user")
            return undefined;
        }
    }


    //PATCH CHANGE ROLE
    public static changeRoles(id: number, newRole : ERole): UserDTO | undefined {

        let userDBO : UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const indexUser = userDBO.findIndex(user => user.id === id && user.status === EUserStatus.ACTIVE);

            if(indexUser === -1){
                LoggerService.error("cannot find this user id");
                return undefined;
            }

            const currentUser = userDBO[indexUser];

            if(currentUser.role !== ERole.PLAYER){
                LoggerService.error("only players can be pormoted")
                return undefined;
            }

            currentUser.role = newRole;
            currentUser.updated_at = new Date().toISOString();

            FilesService.writeFile(this.FILE_PATH, userDBO);

            return UsersMapper.toDTO(currentUser);
        } catch (error) {
            LoggerService.error("Error patch user role");
            return undefined;
        }
    }

    //PATCH REACTIVATE USER
    public static reactivateUser(id: number): UserDTO | undefined {

        let userDBO: UserDBO[] = [];

        try {
            userDBO = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];

            const indexUser = userDBO.findIndex(user => user.id === id && user.status === EUserStatus.INACTIVE);

            if(indexUser === -1){
                LoggerService.error("can't find user");
                return undefined;
            }

            const currentUser = userDBO[indexUser];

            currentUser.status = EUserStatus.ACTIVE;
            currentUser.updated_at = new Date().toISOString();
            currentUser.deleted_at = undefined;

            FilesService.writeFile(this.FILE_PATH, userDBO);

            return UsersMapper.toDTO(currentUser);

        } catch (error) {
            LoggerService.error("Error patch user status");
            return undefined;
        }
    }

}