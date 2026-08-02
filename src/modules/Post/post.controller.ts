import { Router } from "express";
import PostService from "./post.service";
import { Validation } from "../../common/middleware/validation";
import * as UV from "./post.validation";
import { authentication } from "../../common/middleware/authentication";
import multerCloud from "../../common/middleware/multer.cloud";
import { store_Enum } from "../../common/enum/multer.enum";
import commentRouter from "../Comments/comment.controller";
const postRouter = Router();
postRouter.use("/:postId/comments{/:commentId/replies}", commentRouter);
postRouter.post(
  "/post",
  authentication,
  multerCloud({ store_Type: store_Enum.memory }).array("images"),
  Validation(UV.createPostSchema),
  PostService.createPost,
);
postRouter.get(
  "/get-post",
  authentication,
  PostService.getPost,
);
postRouter.patch(
  "/:postId",
  authentication,
  Validation(UV.likePostSchema),
  PostService.likePost,
);
postRouter.put(
  "/update/:postId",
  authentication,
  multerCloud({ store_Type: store_Enum.memory }).array("images"),
  Validation(UV.updatePostSchema),
  PostService.updatePost,
);

export default postRouter;
