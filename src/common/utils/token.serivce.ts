import jwt, { JwtPayload, PrivateKey, PublicKey, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";

class TokenService {
    constructor() {}
    
    generateToken = ({ 
        payload,
        secretKey, 
        options = {} 
    }: {
        payload: object,
        secretKey: Secret | PrivateKey,
        options?: SignOptions,
    }): string => {
      return jwt.sign(payload, secretKey, options);
    };
    
    verifyToken = ({ 
        token, 
        secretKey, 
        options = {} 
    }: {
        token: string,
        secretKey: Secret | PublicKey,
        options?: VerifyOptions,
    }): JwtPayload => {
      return jwt.verify(token, secretKey, options) as JwtPayload;
    };
}

export default new TokenService();