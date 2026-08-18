import { Router } from "express";
import chatService from "./chat.service";
import { authentication } from "../../../common/middleware/authentication";
import multer from "multer";
import multerCloud from "../../../common/middleware/multer.cloud";
import { store_Enum } from "../../../common/enum/multer.enum";
import { Validation } from "../../../common/middleware/validation";

const chatRouter = Router({ mergeParams: true });

chatRouter.get("/", authentication, chatService.getChat);
chatRouter.get("/group/:groupid", authentication, chatService.getChatGroup);
chatRouter.post("/", authentication, multerCloud({store_Type:store_Enum.disk}).single("attachments")
// Validation,
, chatService.createGroupChat);
export default chatRouter;
