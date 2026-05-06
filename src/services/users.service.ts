
import { UsersMapper } from "../mappers/users.mapper";
import { ERole, EUserStatus, NewUser, NewUserDTO, User, UserDBO, UserDTO, UserShort, UserShortDTO } from "../models/user.model";
import { FilesService } from "./files.service";
import { LoggerService } from "./logger.service";
import bcrypt from 'bcrypt'



export class UsersService {


    private static readonly FILE_PATH = "./data/users.json";

    // Calculate next available ID
    //FIND NEXT ID
        private static getNewID(items: User[]): number {
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
    
    // Read and parse all users from database
    
        private static readDB(): User[] {
            try {
                const dbos = FilesService.readFile<UserDBO>(this.FILE_PATH) || [];
                return dbos.map(dbo => UsersMapper.fromDBO(dbo));
            } catch (error) {
                LoggerService.error("Error to read files users.json");
                return [];
            }
        }
    
    // Write all users to database file
        private static write(teams: User[]): boolean {
            try {
                const dbos = teams.map(dbo=> UsersMapper.toDBO(dbo))
                FilesService.writeFile(this.FILE_PATH, dbos)
                return true;
            } catch (error) {
                LoggerService.error("Error to write in users.json");
                return false;
            }
    
        }



    // Get all users (optionally include inactive ones)
    //GET ALL
    public static getAll(includeInactive : boolean = false): User[] {

        try {
            const users = this.readDB();

            if(includeInactive){
                return users
            } else {
                return users.filter(user => user.status === EUserStatus.ACTIVE)
            }

        } catch (error) {
            LoggerService.error("cannot get all user");
            return [];
        }
    }

    // Find user by ID (active only by default)
    //GET BY ID
    public static getById(id: number): User | undefined {


        try {
           const users = this.readDB();

            const userId = users.find(user => user.id === id && user.status === EUserStatus.ACTIVE);

            if(!userId) {
                return undefined;
            }

            return userId;

        } catch (error) {
            LoggerService.error("Error reading teams file in getById")
            return undefined;
        }
    }


    // Find user by username (optionally include inactive)
    //GET BY USERNAME
    public static getByUserName(name: string, includeInactive : boolean = false): User | undefined {

        try {
            const users = this.readDB();

            const targetUser = users.find(user=> {
                if(includeInactive){
                    return user.username === name
                } else {
                    return user.username === name && user.status === EUserStatus.ACTIVE
                }
            })

            if(!targetUser){
                return undefined;
            }

            return targetUser
        } catch (error) {
            LoggerService.error("cannot find user by his name")
            return undefined;
        }
    }

    // Find user by email (optionally include inactive)
    //GET EMAIL

    public static getByEmail(email : string, includeInactive : boolean = false) : User | undefined {

         try {
            const users = this.readDB();

            const userMail = users.find(user => {
                if(includeInactive){
                    return user.email === email
                } else {
                    return user.email === email && user.status === EUserStatus.ACTIVE;
                }
            });


            return userMail;

         } catch (error) {
            LoggerService.error("cannot find user with this email")
            return undefined;
         }
    }

    // Create new user account with bcrypt password hashing
    //POST USER
    public static create(newUser : NewUser): User | undefined | "ALREADY_EXISTS"{

        try {
            const users = this.readDB();
            
            const existingUserName = this.getByUserName(newUser.username, true);
            const existingEmail = this.getByEmail(newUser.email, true);

            if(existingUserName || existingEmail){
                LoggerService.error("this name or email is already used")
                return "ALREADY_EXISTS";
            }

            const newId = this.getNewID(users)

            const hashedPassword = bcrypt.hashSync(newUser.password, 10);

            const newU : User = {
                id: newId,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                username: newUser.username,
                password: hashedPassword,
                role: ERole.PLAYER,
                status: EUserStatus.ACTIVE,
                createdAt: new Date(),
                updatedAt: new Date(),
            }

            users.push(newU);

            if(!this.write(users)){
                return undefined;
            }

            return newU;

        } catch (error) {
            LoggerService.error("cannot create a new User")
            return undefined;
        }
    }

    //PUT USER
    public static update(id: number, updatedUser: User): User | undefined | "BAD_REQUEST" | "NOT_FOUND" {

        try {
            const users = this.readDB();

            const indexUser = users.findIndex(u => u.id === id && u.status === EUserStatus.ACTIVE);

            if(indexUser === -1){
                LoggerService.error("cannot find this user")
                return "NOT_FOUND";
            }

            const isTaken = users.some(u => u.id !== id && (u.email === updatedUser.email || u.username === updatedUser.username));
            if (isTaken) {
                return "BAD_REQUEST";
            }

            const oldUser = users[indexUser];
           
            users[indexUser] = {
                id: oldUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                username: updatedUser.username,
                password: oldUser.password,
                role: oldUser.role,
                status: oldUser.status,
                createdAt: oldUser.createdAt,
                updatedAt: new Date(),
            }

            if(!this.write(users)) {
                return undefined;
            }

            return users[indexUser];

        } catch (error) {
        LoggerService.error("Error while updating user");
        return undefined;
        }
    }

    //DELETE USER
    public static delete(id: number): boolean {

        try {
            const users = this.readDB();

            const indexUser = users.findIndex(user => user.id === id && user.deletedAt === undefined);

            if(indexUser === -1){
                LoggerService.error("cannot find this user id");
                return true;
            }

            users[indexUser].status = EUserStatus.INACTIVE;
            users[indexUser].updatedAt = new Date();
            users[indexUser].deletedAt = new Date()

            return this.write(users);

        } catch (error) {
            LoggerService.error("Error deleting user");
            return false;
        }
    }

    //PATCH ROLE USER
   public static updateRole(id: number, newRole: ERole): User | undefined {
        try {
            const users = this.readDB();

            const index = users.findIndex(u => u.id === id && u.status === EUserStatus.ACTIVE);

            if (index === -1) return undefined;


            users[index].role = newRole;
            users[index].updatedAt = new Date();

           
            if (!this.write(users)) return undefined;

            return users[index];
        } catch (error) {
            LoggerService.error("Erreur lors de la mise à jour du rôle");
            return undefined;
        }
    }


    //PATCH REACTIVE USER
    public static reactivate(id: number): User | "NOT_FOUND" | undefined {
        try {
            const users = this.readDB();
            // Attention : ici on cherche spécifiquement un utilisateur INACTIF
            const index = users.findIndex(u => u.id === id && u.status === EUserStatus.INACTIVE);

            if (index === -1) return "NOT_FOUND";

            // On remet le statut à ACTIVE et on "nettoie" la date de suppression
            users[index].status = EUserStatus.ACTIVE;
            users[index].deletedAt = undefined; 
            users[index].updatedAt = new Date();

            if (!this.write(users)) return undefined;

            return users[index];
        } catch (error) {
            LoggerService.error("Erreur lors de la réactivation de l'utilisateur");
            return undefined;
        }
    }
}