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
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
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
      next: express.NextFunction
    ) => {
      throw new AppError(
        `too many requests from this IP please try again later`,
        429
      );
    },
    legacyHeaders: false,
  });
  checkConenction()
  redisService.connect()
  app.use(express.json());
  app.use(cors(), helmet(), limiter);
  app.use("/auth",authRouter)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name:"query",
      description:"the root query",
      fields: {
        hello: {
          type: GraphQLString,
          resolve: () => {
            return "Hello, world!";
          }
        },
        hi:{
          type: GraphQLString,
          resolve:()=>{return "hello from social media app"}
        }
      }
    })
  })
  app.use("/graphql",createHandler({schema}))
  
  app.get(
    "/",
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(200).json({
        message: "welcome on Social Media App .... 👌  👌",
      });
    }
  );

 app.post("/send-notification", async (req, res) => {
  try {
    const result = await NotificationService.sendNotification({
      token: req.body.token,
      data: { title: "hi", body: "hi" }
    });
    console.log("Notification sent:", result);
    res.status(200).json({ success: true, messageId: result });
  } catch (error:unknown) {
    console.error("FCM Error:", error);
    throw new AppError(error);
  }
});
  app.use("{/*demo}", (req, res, next) => {
    throw new AppError(
      `page not found ${req.url} with method ${req.method}`,
      404
    );
  });

  app.use(globalErrorHandler);
  app.listen(port, () => {
    console.log(`server is running on port ${port}🫡  🫡`);
  });
};
export default bootstrap;
function createHandler(arg0: { schema: GraphQLSchema; }): import("express-serve-static-core").RequestHandler<{}, any, any, import("qs").ParsedQs, Record<string, any>> {
  throw new Error("Function not implemented.");
}

