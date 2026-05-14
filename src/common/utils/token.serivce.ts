import jwt, { JwtPayload, PrivateKey, PublicKey, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";

class TokenService {
    constructor() {}
    generateToken = ({ 
        payload,
        secritKey, 
        options = {} 
    } :{
        payload:object,
        secritKey: Secret | PrivateKey,
        options?: SignOptions,
    }):string =>{
      return jwt.sign(payload, secritKey, options);
    };
    
    verifyToken = ({ 
        token, 
        secritKey, 
        options = {} 
    }:{
            token: string,
            secritKey: Secret | PublicKey,
            options?: VerifyOptions,
        }): JwtPayload => {
      return jwt.verify(token, secritKey, options)as JwtPayload;
    };
}


export default new TokenService();