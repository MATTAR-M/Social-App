import express, { NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { PORT } from "./config/config.service";
import {
  AppError,
  globalErrorHandler,
} from "./common/utils/globalErrorHandling";
import { log } from "node:console";
import authRouter from "./modules/auth/user.controller";
import { checkConenction } from "./DB/connectionDB";
import redisService from "./common/service/redis.service";
import NotificationService from "./common/service/notification.service";
import { unknown } from "zod";
import { createHandler } from "graphql-http/lib/use/express";
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { S3Service } from "./common/service/s3.service";
import { successResponse } from "./common/utils/response.succ";
import { pipeline } from "node:stream/promises";
import { url } from "node:inspector";
import postRouter from "./modules/Post/post.controller";
import commentRouter from "./modules/Comments/comment.controller";
const app: express.Application = express();
const port: number = Number(PORT);

const bootstrap = () => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "too many requests from this ip, please try again later",
    handler: (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      throw new AppError(
        `too many requests from this IP please try again later`,
        429,
      );
    },
    legacyHeaders: false,
  });
  checkConenction();
  redisService.connect();
  app.use(express.json());
  app.use(cors(), helmet(), limiter);
  app.use("/auth", authRouter);
  app.use(`/posts`, postRouter);
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "query",
      description: "the root query",
      fields: {
        hello: {
          type: GraphQLString,
          resolve: () => {
            return "Hello, world!";
          },
        },
        hi: {
          type: GraphQLString,
          resolve: () => {
            return "hello from social media app";
          },
        },
      },
    }),
  });
  app.use("/graphql", createHandler({ schema }));

  app.get(
    "/",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.status(200).json({
        message: "welcome on Social Media App .... 👌  👌",
      });
    },
  );
  app.get(
    "/upload",
    async (req: express.Request, res: express.Response, next: NextFunction) => {
      const { folderName } = req.query as { folderName: string };
      const result = await new S3Service().getFiles(folderName);
      let resultMapped = result.Contents?.map((file) => {
        return file.Key;
      });
      successResponse({ res, data: resultMapped });
    },
  );
  app.get(
    "/upload/delete",
    async (req: express.Request, res: express.Response, next: NextFunction) => {
      const { folderName } = req.body as { folderName: string };
      const result = await new S3Service().deleteFolders(folderName);
      successResponse({ res, data: result });
    },
  );
  app.get(
    "/upload/pre-signed/*path",
    async (req: express.Request, res: express.Response, next: NextFunction) => {
      const { path } = req.params as { path: string[] };
      const { download } = req.query as { download?: string };
      const Key = path.join("/") as string;
      const url = await new S3Service().getPresignedUrl({
        Key,
        download: download ? download : undefined,
      });
      successResponse({ res, data: url });
    },
  );

  app.get(
    "/upload/*path",
    async (req: express.Request, res: express.Response, next: NextFunction) => {
      const { path } = req.params as { path: string[] };
      const key = path.join("/");
      const download = req.query;
      const result = await new S3Service().getFile(key);
      const stream = result.Body as NodeJS.ReadableStream;
      res.setHeader("Content-Type", result.ContentType!);
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      if (download && download.download === "true") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${path.pop()}"`,
        );
      }
      await pipeline(stream, res);
      // successResponse({res, message: "file fetched successfully", data: result})
    },
  );

  app.post("/send-notification", async (req, res) => {
    try {
      const result = await NotificationService.sendNotification({
        token: req.body.token,
        data: { title: "hi", body: "hi" },
      });
      console.log("Notification sent:", result);
      res.status(200).json({ success: true, messageId: result });
    } catch (error: unknown) {
      console.error("FCM Error:", error);
      throw new AppError(error);
    }
  });
  app.use("{/*demo}", (req, res, next) => {
    throw new AppError(
      `page not found ${req.url} with method ${req.method}`,
      404,
    );
  });

  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`server is running on port ${port}🫡  🫡`);
  });
};
export default bootstrap;
