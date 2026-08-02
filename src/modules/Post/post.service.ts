import express, { NextFunction } from "express";
// import { ISignup } from "./post.validation";
import * as z from "zod";
import { AppError } from "../../common/utils/globalErrorHandling";
// import { signUpSchema } from "./post.validation";
import userModel, { IUser } from "../../DB/models/user.model";
import { HydratedDocument, Model, Types } from "mongoose";
import BaseRepo from "../../DB/repos/user.repo";
import UserRepo from "../../DB/repos/user.repo";
import { createPostDto , updatePostDto } from "./post.dto";
import NotificationService from "../../common/service/notification.service";
import { successResponse } from "../../common/utils/response.succ";
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token.serivce";
import { S3Service } from "../../common/service/s3.service";
import { store_Enum } from "../../common/enum/multer.enum";
import { randomUUID } from "node:crypto";
import PostRepo from "../../DB/repos/post.repo";
import { availabilityEnum } from "../../common/enum/post.enum";
import { AvailabilityPost } from "../../common/utils/post.utilz";
import CommentRepo from "../../DB/repos/comment.repo";
class PostService {
  private readonly _userRepo = new UserRepo();
  private readonly _postRepo = new PostRepo();
  private readonly _commentRepo = new CommentRepo();
  private readonly _redisService = RedisService;
  private readonly _tokenService = TokenService;
  private readonly _notificationService = NotificationService;
  private readonly _s3Services = new S3Service();
  constructor() {}

  createPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { allowComments, availability, content, tags }: createPostDto =
      req.body;
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
        path: `users/${req?.user?._id}/posts/${folderId.toString()}`,
        store_Type: store_Enum.memory,
      });
    }

    const posts = await this._postRepo.create({
      attachments: urls,
      content: content!,
      createdBy: req.user._id,
      tags: mentions,
      folderId: folderId,
      availability,
      allowComments,
    });

    const post = await this._postRepo.findOne({
      filter: {
        _id: posts._id,
        ...AvailabilityPost(req),
      },
      options: {
      populate: [
        {
            path: "comments",
            match: {
              commentId: { $exists: false },
            },
            populate: [{
              path:"replies",
            }]
          }
        ]
      }
    }); 
    if (!post) {
      await this._s3Services.deleteFiles(urls);
      throw new AppError(`failed to create post`);
    }
      let doc = [];
        for (const post of posts as any) {
          const comments = await this._commentRepo.find({
            filter: {
              postId: post._id,
            },
          });
          doc.push({
            ...post.toObject(),
            comments,
          });
        }
    if (fcmTokens?.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `you are mentioned on new post by ${req.user._id}`,
          body: content || `new post`,
        },
      });
    }
    successResponse({ res, message: "post created successfully" });
  };

  getPost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const post = await this._postRepo.paginate({
      page: +req?.query?.page!,
      limit: +req?.query?.limit!,
      search: {
        ...AvailabilityPost(req),
        ...(req.query.search
          ? {
              $or: [{ content: { $regex: req.query.search, $options: "i" } }],
            }
          : {}),
      },
    });

    // const post = await this._postRepo.find({
    //   filter:{
    //     $or:[{availability:availabilityEnum.private},
    //           {availability:availabilityEnum.private,createdBy:req.user._id},
    //           {availability:availabilityEnum.friends,createdBy:{$in:[...(req.user?.friends||[]),req.user._id]}},
    //           {tags:{$in:[req.user?._id]}}
    //     ]
    //   }
    // });

    successResponse({ res, data: post });
  };
  likePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { postId } = req.params;
    const { flag } = req.params;
    let updateQuery: any = {
      $addToSet: { likes: req?.user?._id },
    };
    if (flag && flag == "diLike") {
      updateQuery = {
        $pull: { likes: req.user?._id },
      };
    }
    const post = await this._postRepo.findOneAndUpdate({
      filter: {
        _id: postId,
        ...AvailabilityPost(req),
      },
      update: {
        updateQuery,
      },
    });
    if (!post) {
      throw new AppError("post not found or you are not authorized");
    }

    successResponse({ res, data: post });
  };

  updatePost = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { postId } = req.params;
    const {
      allowComments,
      availability,
      content,
      tags,
      removeFiles,
      removeTags,
    }: updatePostDto = req.body;

    const post = await this._postRepo.findOne({
      filter: {
        _id: postId,
        createdBy: req?.user?._id!,
      },
    });
    if (!post) {
      throw new AppError("post not found or not authorized");
    }
    if (removeFiles?.length) {
      const isValidFiles = removeFiles.filter((file: string) => {
        return post.attachments?.includes(file);
      });
      if (isValidFiles?.length) {
        throw new AppError(
          "some of path file you want to remove does not exist",
        );
      }
      await this._s3Services.deleteFiles(removeFiles);
      post.attachments = post.attachments?.filter((file: string) => {
        return !removeFiles.includes(file);
      }) as string[];
    }
    const updateTags = new Set(post?.tags?.map((id) => id.toString()));

    removeTags?.forEach((tagId: string) => {
      return updateTags.delete(tagId);
    });

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
        updateTags.add(tag._id.toString());
        (await this._redisService.getFCMs(tag._id)).map((token) =>
          fcmTokens.push(token),
        );
      }
      post.tags = [...updateTags].map((id: string) => new Types.ObjectId(id));
    }

    if (req.files?.length) {
      let urls = await this._s3Services.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req?.user?._id}/posts/${post.folderId.toString()}`,
        store_Type: store_Enum.memory,
      });
      post.attachments?.push(...urls);
    }

    if (fcmTokens?.length) {
      await this._notificationService.sendNotifications({
        tokens: fcmTokens,
        data: {
          title: `you are mentioned on new post by ${req.user._id}`,
          body: content || `new post`,
        },
      });
    }
    if (content) {
      post.content = content;
    }
    if (availability) {
      post.availability = availability;
    }
    if (allowComments) {
      post.allowComments = allowComments;
    }
    await post.save();
    successResponse({ res, message: "post updated successfully",data:post });
  };
}

export default new PostService();
