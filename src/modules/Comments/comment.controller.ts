import { Router } from "express";
import commentService from "./comment.service";
import { Validation } from "../../common/middleware/validation";
import * as UV from "./comment.validation";
import { authentication } from "../../common/middleware/authentication";
import multerCloud from "../../common/middleware/multer.cloud";
import { store_Enum } from "../../common/enum/multer.enum";
const commentRouter = Router({mergeParams: true});

commentRouter.post(
  "/comment",
  authentication,
  multerCloud({ store_Type: store_Enum.memory }).array("images"),
  Validation(UV.createcommentSchema),
  commentService.createComment,
);


export default commentRouter;
