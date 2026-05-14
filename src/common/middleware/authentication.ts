import { Request,Response,NextFunction } from "express";
import { AppError } from "../utils/globalErrorHandling.js";
import { PREFIX_USER,PREFIX_ADMIN, SECRET_KEY_USER } from "../../config/config.service.js";
import tokenSerivce from "../utils/token.serivce";
import UserRepo from "../../DB/repos/user.repo.js";
import redisService from "../service/redis.service.js";
import { Interface } from "node:readline";
import { IUser } from "../../DB/models/user.model";
import { HydratedDocument } from "mongoose";
import { JwtPayload } from "jsonwebtoken";
const userModel = new UserRepo();


export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
 
  const { authorization }:any = req.headers;

  if (!authorization) {
    throw new AppError("token does not exist");
  }
  const [prefix, token]:string[] = authorization.split(" ");

  if(!token){
    throw new AppError("token does not exist");
  }
  let ACCESS_SECRET_KEY = "";
  if(prefix==PREFIX_USER){
    ACCESS_SECRET_KEY == SECRET_KEY_USER!;
  }else if(prefix==PREFIX_ADMIN){
    ACCESS_SECRET_KEY == SECRET_KEY_USER!;
  }else{
    throw new AppError("invalid token prefix");
  }
  const decoded = tokenSerivce.verifyToken({ token, secritKey: ACCESS_SECRET_KEY! });
  const user = await userModel.findOne({ filter: { _id: decoded.id } });
  if (!user) {
    throw new AppError("user not found", 404);
  }
  if (!user.confirmed) {
    throw new AppError("please confirm your email", 400);
  }
  if (!decoded || !decoded?.id) {
    throw new AppError("inValid token payload");
  }
//   if (user?.changeCredentials?.getTime() > decoded.iat * 1000) {
//     throw new AppError("token is expired");
//   }
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
