import { FieldDTO, NewFieldDTO } from "../models/field.model";
import { EGameStatus, GameDTO, NewGameDTO } from "../models/game.model";
import { ESportType, NewTeamDTO, TeamDTO } from "../models/team.model";
import { ERole, EUserStatus, NewUserDTO, UserDTO, UserLoginDTO } from "../models/user.model";

// Validate if value is a valid number
export function isNumber(obj: any): obj is number {
  return typeof obj === 'number' && !isNaN(obj) && isFinite(obj);
}

// Validate if value is a string
export function isString(obj: any): obj is string {
  return typeof obj === 'string';
}

// Validate if value is an object
function isObject(obj: any): obj is object {
  return typeof obj === 'object';
}

// Validate if value is a non-empty string (trimmed)
function isNonEmptyString(obj: any): obj is string {
  return isString(obj) && obj.trim().length !== 0;
}

// === USER VALIDATORS ===

// Validate new user registration data (email, password, firstName, lastName, username)
export function isNewUserDTO(obj: any): obj is NewUserDTO {
  return obj && typeof obj === 'object' &&  
    obj.email && isNonEmptyString(obj.email) && 
    obj.password && isNonEmptyString(obj.password) && 
    obj.firstName && isNonEmptyString(obj.firstName) && 
    obj.lastName && isNonEmptyString(obj.lastName) && 
    obj.username && isNonEmptyString(obj.username)
}

// Validate login credentials (username, password)
export function isUserLoginDTO(obj: any): obj is UserLoginDTO {
  return obj && typeof obj === 'object' &&
    obj.username && isNonEmptyString(obj.username) &&
    obj.password && isNonEmptyString(obj.password)
}

// Validate complete user object (includes role and status)
export function isUserDTO(obj: any): obj is UserDTO {
  return obj && typeof obj === 'object' &&
    obj.email && isNonEmptyString(obj.email) &&
    obj.firstName && isNonEmptyString(obj.firstName) &&
    obj.lastName && isNonEmptyString(obj.lastName) && 
    obj.username && isNonEmptyString(obj.username) && 
    obj.id !== undefined && isNumber(obj.id) &&
    obj.status && isString(obj.status) && isUserStatus(obj.status) && 
    obj.role && isString(obj.role) && isUserRole(obj.role)
}

// Validate if value is a valid user role
export function isUserRole(obj: any): obj is ERole {
  return Object.values(ERole).includes(obj);
}

// Validate if value is a valid user status (ACTIVE, INACTIVE)
export function isUserStatus(obj: any): obj is EUserStatus {
  return Object.values(EUserStatus).includes(obj);
}

// === TEAM VALIDATORS ===

// Validate if value is a valid sport type
export function isESportType(obj: any): obj is ESportType {
  return Object.values(ESportType).includes(obj);
}

// Validate new team data (name, sportType, optional description)
export function isNewTeamDTO(obj: any): obj is NewTeamDTO {
  return obj && typeof obj === 'object' &&
    obj.name && isNonEmptyString(obj.name) && 
    obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) && 
    (!obj.description || isString(obj.description))
}

// Validate complete team object
export function isTeamDTO(obj: any): obj is TeamDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) && 
    obj.name && isNonEmptyString(obj.name) && 
    obj.sportType && isString(obj.sportType) && isESportType(obj.sportType) && 
    (!obj.description || isString(obj.description)) && 
    obj.players && isObject(obj.players) && 
    obj.trainerId && isNumber(obj.trainerId);
}

// === GAME VALIDATORS ===

// Validate new game data (all fields optional)
export function isNewGameDTO(obj: any): obj is NewGameDTO {
  return obj && 
    typeof obj === 'object' && 
    (!obj.name || isString(obj.name)) && 
    (!obj.fieldId || isNumber(obj.fieldId)) && 
    (!obj.refereeId || isNumber(obj.refereeId)) && 
    (!obj.homeTeamId || isNumber(obj.homeTeamId)) && 
    (!obj.awayTeamId || isNumber(obj.awayTeamId)) && 
    (!obj.scheduledDate || isString(obj.scheduledDate))
}

// Validate complete game object (includes id and status)
export function isGameDTO(obj: any): obj is GameDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) && 
    obj.status && isString(obj.status) && isEGameStatus(obj.status) && 
    (!obj.name || isString(obj.name)) && 
    (!obj.fieldId || isNumber(obj.fieldId)) && 
    (!obj.refereeId || isNumber(obj.refereeId)) && 
    (!obj.homeTeamId || isNumber(obj.homeTeamId)) && 
    (!obj.awayTeamId || isNumber(obj.awayTeamId)) && 
    (!obj.scheduledDate || isString(obj.scheduledDate))
}

// Validate if value is a valid game status
export function isEGameStatus(obj: any): obj is EGameStatus {
  return Object.values(EGameStatus).includes(obj);
}

// === FIELD VALIDATORS ===

// Validate new field data (name, location)
export function isNewFieldDTO(obj: any): obj is NewFieldDTO {
  return obj && typeof obj === 'object' && 
    obj.name && isNonEmptyString(obj.name) &&  
    obj.location && isNonEmptyString(obj.location);
}

// Validate complete field object
export function isFieldDTO(obj: any): obj is FieldDTO {
  return obj && typeof obj === 'object' && 
    obj.id !== undefined && isNumber(obj.id) &&
    obj.name && isNonEmptyString(obj.name) &&  
    obj.location && isNonEmptyString(obj.location);
}