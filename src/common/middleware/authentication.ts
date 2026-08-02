import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/globalErrorHandling.js";
// 1. Added SECRET_KEY_ADMIN to the imports
import { PREFIX_USER, PREFIX_ADMIN, SECRET_KEY_USER, SECRET_KEY_ADMIN } from "../../config/config.service.js";
import UserRepo from "../../DB/repos/user.repo.js";
import redisService from "../service/redis.service.js";
import TokenService from "../utils/token.serivce.js"; // Cleaned up duplicate imports

const userModel = new UserRepo();

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization }: any = req.headers;

  if (!authorization) {
    throw new AppError("token does not exist");
  }

  const [prefix, token]: string[] = authorization.split(" ");

  if (!token) {
    throw new AppError("token does not exist");
  }

  let ACCESS_SECRET_KEY = "";
  
  // 2. Fixed the Admin prefix assigning the User key
  if (prefix === PREFIX_USER) {
    ACCESS_SECRET_KEY = SECRET_KEY_USER!;
  } else if (prefix === PREFIX_ADMIN) {
    ACCESS_SECRET_KEY = SECRET_KEY_ADMIN!; 
  } else {
    throw new AppError("invalid token prefix");
  }

  // 3. Passed the key you dynamically determined above
  const decoded = TokenService.verifyToken({
    token: token,
    secretKey: ACCESS_SECRET_KEY 
  });

  // 4. Moved this check BEFORE you query the database so it doesn't crash if decoded.id is missing
  if (!decoded || !decoded?.id) {
    throw new AppError("inValid token payload");
  }

  const user = await userModel.findOne({ filter: { _id: decoded.id } });
  
  if (!user) {
    throw new AppError("user not found", 404);
  }
  
  if (!user.confirmed) {
    throw new AppError("please confirm your email", 400);
  }

  // if (user?.changeCredentials?.getTime() > decoded.iat * 1000) {
  //   throw new AppError("token is expired");
  // }

  const isRevoked = await redisService.getValue({
    key: `revokeToken::${user._id}::${decoded.jti}`,
  });
  
  if (isRevoked) {
    throw new AppError("token is revoked");
  }

  req.user = user;
  req.decoded = decoded;
  next();
};