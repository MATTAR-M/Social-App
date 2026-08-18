import { Request, Response, NextFunction } from "express";
import UserRepo from "../../../DB/repos/user.repo";
import { Types } from "mongoose";
import { Type } from "@aws-sdk/client-s3";
import { AppError } from "../../../common/utils/globalErrorHandling";
import ChatRepo from "../../../DB/repos/chat.repo";
import { successResponse } from "../../../common/utils/response.succ";
import { Socket, Server } from "socket.io";
import redisService from "../../../common/service/redis.service";
import { populate } from "dotenv";
import { S3Service } from "../../../common/service/s3.service";
import { uuidv4 } from "zod";
class ChatService {
  constructor() {}
  private readonly _userRepo = new UserRepo();
  private readonly _chatRepo = new ChatRepo();
  private readonly _s3Service = new S3Service();
  sayHi = async (data: any) => {
    console.log(data);
  };
  getChat = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    let { page, limit = 5 } = req.query as unknown as {
      page: number;
      limit: number;
    };
    if (page < 0 || !page) page = 1;
    page = page * 1 || 1;
    const chat = await this._chatRepo.findOne({
      filter: {
        participants: {
          $all: [req.user._id, userId],
        },
        group: { $exists: false },
      },

      projection: {
        messages: { $slice: [-(page * limit), 5] },
      },

      options: {
        populate: [
          {
            path: "participants",
          },
        ],
      },
    });
    if (!chat) {
      throw new AppError("chat does not exist", 400);
    }
    successResponse({ res, message: "Done", data: chat });
  };

  createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
    let { group, groupImage, participants } = req.body;
    const createdBy = req.user?._id as Types.ObjectId;
    const dbParticipants = participants.map(
      (participants: string) => new Types.ObjectId(participants),
    );
    const users = await this._userRepo.find({
      filter: {
        _id: {
          $in: dbParticipants,
        },
        friends: {
          $in: [createdBy],
        },
      },
    });
    if (users.length !== participants.length) {
      throw new AppError("some users not found", 404);
    }
    const roomId = group?.replaceAll(/\s/g, "_") + "-" + uuidv4();
    if (req?.file) {
      groupImage = await this._s3Service.uploadFile({
        path: `chat ${roomId}`,
        file: req.file as Express.Multer.File,
      });
    }
    dbParticipants.push(createdBy);
    const chat = await this._chatRepo.create({
      group,
      groupImage,
      participants,
      createdBy,
      roomId,
      messages: [],
    });
    if (!chat) {
      if (groupImage) {
        await this._s3Service.deleteFile(groupImage as string);
      }
      throw new AppError("chat not created", 400);
    }
    successResponse({ res, message: "Done", data: chat });
  };
  sendMessage = async (data: any, socket: Socket, io: Server) => {
    // console.log({data},"sendMessage")
    const { sendTo, content } = data;
    const createdBy = socket.data.user._id;
    const user = await this._userRepo.findOne({
      filter: {
        _id: sendTo,
      },
    });
    if (!user) {
      throw new AppError("user does not exist", 404);
    }
    const chat = await this._chatRepo.findOneAndUpdate({
      filter: {
        participants: { $all: [sendTo, createdBy] },
        group: { $exists: false },
      },
      update: {
        push: {
          messages: {
            content,
            createdBy,
          },
        },
      },
    });
    if (!chat) {
      await this._chatRepo.create({
        createdBy,
        messages: [{ content, createdBy }],
        participants: [sendTo, createdBy],
      });
    }
    io.to(await redisService.getSockets(createdBy)).emit("successMessage", {
      content,
    });
    io.to(await redisService.getSockets(sendTo)).emit("newMessage", {
      content,
      from: socket.data.user,
    });
  };
  joinRoom = async (data: any, socket: Socket, io: Server) => {
    const { roomId } = data;
    const chat = await this._chatRepo.findOne({
      filter: {
        roomId,
        participants: {
          $in: [socket.data.user._id],
        },
        group: { $exists: true },
      },
    });
    if (!chat) {
      throw new AppError("no chat exists",404);
    }
    socket.join(chat?.roomId)
  };
  getChatGroup = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    // let { page, limit = 5 } = req.query as unknown as {
    //   page: number;
    //   limit: number;
    // };
    // if (page < 0 || !page) page = 1;
    // page = page * 1 || 1;
    const chat = await this._chatRepo.findOne({
      filter: {
        _id:groupId,
        participants: {
          $in: [req.user._id],
        },
        group: { $exists: true },
      },

      projection: {undefined},

      options: {
        populate: [
          {
            path: "message.createdBy",
          },
        ],
      },
    });
    if (!chat) {
      throw new AppError("chat does not exist", 400);
    }
    successResponse({ res, message: "Done", data: chat });
  };
sendGroupMessage = async (data: any, socket: Socket, io: Server) => {
    // console.log({data},"sendMessage")
    const { groupId, content } = data;
    const createdBy = socket.data.user._id;
    
    const chat = await this._chatRepo.findOneAndUpdate({
      filter: {
        participants: { $all: [createdBy]},
        group: { $exists: false },
      },
      update: {
        push: {
          messages: {
            content,
            createdBy,
          },
        },
      },
    });
    if (!chat) {
      throw new AppError("chat Not Found",404)
    }
    io.to(await redisService.getSockets(createdBy)).emit("successMessage", {
      content,
    });
    io.to(chat?.roomId!).emit("newGroupMessage", {
      content,
      from: socket.data.user,
      groupId   
    });
  };
}
export default new ChatService();
