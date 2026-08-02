import express, { NextFunction } from "express";
// import { ISignup } from "./comment.validation";
import * as z from "zod";
import { AppError } from "../../common/utils/globalErrorHandling";
// import { signUpSchema } from "./comment.validation";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model, Types } from "mongoose";
import BaseRepo from "../../DB/repos/user.repo";
import UserRepo from "../../DB/repos/user.repo";
import { createCommentDto } from "./comment.dto";
import NotificationService from "../../common/service/notification.service";
import { successResponse } from "../../common/utils/response.succ";
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token.serivce";
import { S3Service } from "../../common/service/s3.service";
import { store_Enum } from "../../common/enum/multer.enum";
import { randomUUID } from "node:crypto";
import CommentRepo from "../../DB/repos/comment.repo";
import PostRepo from "../../DB/repos/post.repo";
import { AvailabilityPost } from "../../common/utils/post.utilz";
import { AllowCommentsEnum } from "../../common/enum/user.enum";
import {  OnModelEnum } from "../../common/enum/post.enum";
import { IComment } from "../../DB/models/comment.model";
import { IPost } from "../../DB/models/post.model";
class commentService {
  private readonly _userRepo = new UserRepo();
  private readonly _postRepo = new PostRepo();
  private readonly _commentRepo = new CommentRepo();
  private readonly _redisService = RedisService;
  private readonly _tokenService = TokenService;
  private readonly _notificationService = NotificationService;
  private readonly _s3Services = new S3Service();
  constructor() {}

  createComment = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { content, tags, onModel }: createCommentDto = req.body;
    const { postId, commentId } = req.params;
    let doc: HydratedDocument<IPost|IComment> | null = null;
    if (onModel === OnModelEnum.Post && !commentId) {
   
      doc = await this._postRepo.findOne({
        filter: {
          _id: postId,
          ...AvailabilityPost(req),
        },
      });
  
      if (!doc) {
        throw new AppError(
          `post not found or you are not allowed to comment`,
          404,
        );
      }
    }else if(onModel === OnModelEnum.Comment && commentId){
      let comments= await this._commentRepo.findOne({
        filter: {
          _id: commentId,
          refId: postId!,
        },
        options: {
          populate: [
            {
              path: "postId",
              match: {
              $or :[  
                {...AvailabilityPost(req)},
              ],
            allowComments: AllowCommentsEnum.everyone,},
            }
          ]
        }
      
      })
      if(!comments?.refId){
        throw new AppError(
          `comment not found or you are not allowed to comment`,
          404,
        );
      }
      doc = comments 
    }
    if(!doc){
      throw new AppError(
        `invalid onModel or postId/commentId combination`,
        404,
      );
    }
    // 1. Fetch the single post (renamed 'posts' to 'post' for clarity)

    let mentions: Types.ObjectId[] = [];
    let fcmTokens: string[] = [];

    if (tags?.length) {
      const mentionTags = await this._userRepo.find({
        filter: {
          _id: { $in: tags },
        },
      });
      if (tags?.length != mentionTags.length) {
        throw new AppError("invalid tag id");
      }
      for (const tag of mentionTags) {
        mentions.push(tag._id);
        (await this._redisService.getFCMs(tag._id)).map((token) =>
          fcmTokens.push(token),
        );
      }
    }

    let urls: string[] = [];
    let folderId = new Types.ObjectId();

    if (req.files) {
      urls = await this._s3Services.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req?.user?._id}/posts/${doc.folderId.toString()}/comments/${folderId.toString()}`,
        store_Type: store_Enum.memory,
      });
    }

    // 3. Create the comment using the verified post ID
    const comment = await this._commentRepo.create({
      attachments: urls,
      content: content!,
      createdBy: req.user._id,
      tags: mentions, 
      folderId: folderId,
      refId: doc?._id!,
      OnModel:onModel // Now safely referencing post._id
    });

    if (!comment) {
      await this._s3Services.deleteFiles(urls);
      throw new AppError(`failed to create comment`);
    }

    if (fcmTokens?.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `you are mentioned on new comment by ${req.user._id}`,
          body: content || `new comment`,
        },
      });
    }

    successResponse({ res, message: "comment created successfully" });
  };
  // createReply = async (
  //   req: express.Request,
  //   res: express.Response,
  //   next: express.NextFunction,
  // ) => {};

}
export default new commentService();
