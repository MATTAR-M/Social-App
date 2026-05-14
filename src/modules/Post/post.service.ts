import express, { NextFunction } from "express";
// import { ISignup } from "./post.validation";
import * as z from "zod";
import { AppError } from "../../common/utils/globalErrorHandling";
// import { signUpSchema } from "./post.validation";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model } from "mongoose";
import BaseRepo from "../../DB/repos/user.repo";
import UserRepo from "../../DB/repos/user.repo";
import {createPostDto} from "./post.dto";
import NotificationService from "../../common/service/notification.service";
import { successResponse } from "../../common/utils/response.succ";
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token.serivce";
class PostService {
  private readonly _userRepo = new UserRepo();
  private readonly _redisService = RedisService;
  private readonly _tokenService = TokenService;
  private readonly _notificationService = NotificationService;

  constructor() { }

  createPost = async (req: express.Request, res: express.Response, next: NextFunction) => {
    const {}: createPostDto = req.body;
    

    successResponse({res, message: "post created successfully"})
  }
}

 export default new PostService();
