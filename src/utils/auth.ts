import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "ma_cle_secrete_super_securisee_dev_2026";
const JWT_EXPIRATION = "24h";

export interface TokenPayload {
  username: string;
}

/**
 * Génère un véritable token JWT signé contenant le username
 */
export const generateToken = (username: string): string => {
  return jwt.sign({ username }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
};

/**
 * Valide et décode le token JWT, retourne le username ou undefined si invalide/expiré
 */
export const validateToken = (token: string): string | undefined => {
  try {
    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(cleanToken, JWT_SECRET) as TokenPayload;
    return decoded.username;
  } catch (error) {
    return undefined;
  }
};